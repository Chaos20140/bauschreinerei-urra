// Öffentlicher Bewerbungs-Eingang — Edge Function `urra-apply`.
//
// Nimmt eine Bewerbung vom Karriere-Formular entgegen: validiert die Felder,
// lädt einen optionalen Lebenslauf mit der Service-Role in den PRIVATEN Bucket
// `bewerbungen` und speichert den Datensatz in `job_applications`. Kein
// Passwort (öffentlich), aber rate-limited und mit Honeypot.
//
// Bewusst KEIN direkter Client-Insert: der private Bucket darf nur serverseitig
// beschrieben werden, damit Lebensläufe nie öffentlich abrufbar sind.
//
// Deploy: supabase functions deploy urra-apply --no-verify-jwt --project-ref <ref>

import { createClient } from "jsr:@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const IP_SALT = "urra-apply-rate-limit-v1";
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 Stunde
const RL_PER_IP = 5; // max. Bewerbungen pro IP und Stunde

const CV_BUCKET = "bewerbungen";
const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV_TYPES = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
]);

const ALLOWED_ORIGINS = new Set([
  "https://chaos20140.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://chaos20140.github.io";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, apikey, x-client-info",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

function clientIp(req: Request): string {
  const real = req.headers.get("cf-connecting-ip") ?? req.headers.get("x-real-ip");
  if (real && real.trim()) return real.trim();
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    if (parts.length) return parts[parts.length - 1];
  }
  return "unknown";
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(IP_SALT + ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Entfernt das Unicode-Ersatzzeichen U+FFFD (entsteht, wenn ein Client Text
// fehlerhaft kodiert sendet, z. B. Latin-1 statt UTF-8) sowie Steuerzeichen
// (Zeilenumbruch \n und Tabulator \t bleiben fuers Anschreiben erlaubt).
// So landet nie ein Ersatzzeichen im Admin, egal was ein Client schickt.
function clean(s: string): string {
  return s
    .replace(/\uFFFD/g, '')
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '')
    .trim();
}

function sanitizeFilename(name: string): string {
  const cleaned = String(name ?? "")
    .replace(/[^\w.\-]+/g, "_")
    .replace(/_+/g, "_")
    .replace(/^[._]+/, "")
    .slice(0, 120);
  return cleaned || "lebenslauf";
}

function decodeBase64(b64: string): Uint8Array {
  const payload = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(payload.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Leichte Magic-Byte-Prüfung für die häufigen Typen. Word-Dokumente (OLE/ZIP)
// werden über den gemeldeten MIME-Typ akzeptiert — der Bucket ist privat und
// wird nur als Download (Content-Disposition: attachment) ausgeliefert, nie
// inline gerendert, daher ist das Polyglot-Risiko gering.
function looksAllowed(bytes: Uint8Array, mimetype: string): boolean {
  const isPdf = bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  const isPng = bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  const isJpg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const isZip = bytes[0] === 0x50 && bytes[1] === 0x4b; // docx
  const isOle = bytes[0] === 0xd0 && bytes[1] === 0xcf; // doc
  if (isPdf || isPng || isJpg || isZip || isOle) return true;
  // Fallback: MIME in der Allowlist (Word ohne eindeutige Magic-Bytes)
  return ALLOWED_CV_TYPES.has(mimetype);
}

type SB = ReturnType<typeof createClient>;

async function rateLimited(sb: SB, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RL_WINDOW_MS).toISOString();
  try {
    const { count, error } = await sb.from("urra_apply_log")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", since);
    if (error) return true; // fail-closed
    return (count ?? 0) >= RL_PER_IP;
  } catch {
    return true;
  }
}

async function uploadCv(
  sb: SB,
  id: string,
  base64: string,
  filename: string,
  mimetype: string,
): Promise<{ path: string } | { error: string }> {
  if (mimetype && !ALLOWED_CV_TYPES.has(mimetype)) return { error: "Dateityp nicht erlaubt." };
  if (base64.length > Math.ceil(MAX_CV_BYTES * 1.4)) return { error: "Datei zu groß (max. 5 MB)." };
  const bytes = decodeBase64(base64);
  if (bytes.length === 0) return { error: "Leere Datei." };
  if (bytes.length > MAX_CV_BYTES) return { error: "Datei zu groß (max. 5 MB)." };
  if (!looksAllowed(bytes, mimetype)) return { error: "Dateityp nicht erlaubt." };

  const path = `${id}/${sanitizeFilename(filename)}`;
  const { error } = await sb.storage.from(CV_BUCKET)
    .upload(path, bytes, { contentType: mimetype || "application/octet-stream", upsert: true });
  if (error) return { error: error.message };
  return { path };
}

async function handle(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "not_configured" }, 503, origin);

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ error: "bad_json" }, 400, origin);
  }

  // Honeypot: unsichtbares Feld. Ist es gefüllt, war es ein Bot — wir tun so,
  // als sei alles gut, speichern aber nichts.
  if (typeof body.honeypot === "string" && body.honeypot.trim() !== "") {
    return json({ ok: true }, 201, origin);
  }

  const sb = createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const ipHash = await hashIp(clientIp(req));

  if (await rateLimited(sb, ipHash)) {
    return json({ error: "rate_limited" }, 429, origin);
  }
  // Versuch vorab protokollieren, damit auch fehlerhafte Payloads mitzählen.
  try {
    await sb.from("urra_apply_log").insert({ ip_hash: ipHash });
  } catch { /* egal */ }

  const name = clean(String(body.name ?? ""));
  const email = clean(String(body.email ?? ""));
  const phone = clean(String(body.phone ?? ""));
  const position = clean(String(body.position ?? ""));
  const message = clean(String(body.message ?? ""));

  const fields: Record<string, string> = {};
  if (name.length < 2 || name.length > 120) fields.name = "Bitte geben Sie Ihren Namen an.";
  if (!EMAIL_RE.test(email) || email.length > 200) fields.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  if (phone.length > 50) fields.phone = "Telefonnummer ist zu lang.";
  if (position.length > 120) fields.position = "Position ist zu lang.";
  if (message.length > 5000) fields.message = "Nachricht ist zu lang.";
  if (Object.keys(fields).length > 0) {
    return json({ error: "validation", fields }, 422, origin);
  }

  const id = crypto.randomUUID();

  // CV-Upload (fail-soft): scheitert der Upload, geht die Bewerbung trotzdem
  // durch — nur ohne Datei-Anhang.
  let cvPath: string | null = null;
  let cvFilename: string | null = null;
  const cvBase64 = typeof body.cv_base64 === "string" ? body.cv_base64 : "";
  if (cvBase64) {
    const up = await uploadCv(
      sb, id, cvBase64,
      String(body.cv_filename ?? "lebenslauf"),
      String(body.cv_mimetype ?? ""),
    );
    if ("path" in up) {
      cvPath = up.path;
      cvFilename = String(body.cv_filename ?? "").trim() || "lebenslauf";
    } else {
      // Ungültige Datei ist ein harter Fehler (Typ/Größe) — dem Nutzer melden.
      return json({ error: "cv", message: up.error }, 422, origin);
    }
  }

  const { error } = await sb.from("job_applications").insert({
    id, name, email,
    phone: phone || null,
    position: position || null,
    message: message || null,
    cv_path: cvPath,
    cv_filename: cvFilename,
  });

  if (error) {
    // Bewerbung konnte nicht gespeichert werden → hochgeladene Datei aufräumen.
    if (cvPath) {
      try { await sb.storage.from(CV_BUCKET).remove([cvPath]); } catch { /* egal */ }
    }
    return json({ error: "db_error" }, 500, origin);
  }

  return json({ ok: true, id }, 201, origin);
}

Deno.serve(handle);
