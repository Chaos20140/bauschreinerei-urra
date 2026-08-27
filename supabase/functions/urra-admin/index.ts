// Verwaltungsmodus Urra — Edge Function `urra-admin`.
//
// Einzige Vertrauensgrenze des Admin-Bereichs: prüft ein geteiltes Passwort und
// liest/schreibt mit der Service-Role auf `contact_requests`. Das Frontend hält
// das Passwort nur im Speicher und schickt es bei jedem Aufruf im Body mit.
//
// Auth-Kette (adminGate): EDIT_PASSWORD gesetzt? → sonst 503 · Rate-Limit
// (fail-closed) → sonst 429 · ctEq → sonst Fehlversuch protokollieren + 600 ms
// Verzögerung + 401.
//
// Deploy: supabase functions deploy urra-admin --no-verify-jwt --project-ref <ref>

import { createClient } from "jsr:@supabase/supabase-js@2";
import { mailKonfiguriert, sendeMail } from "../_shared/mail.ts";
import { renderMail, renderText } from "../_shared/mailTemplate.ts";
import {
  buildCsv,
  CONTACT_CSV_COLUMNS,
  fmtDateDe,
  isAdminStatus,
  isUuid,
  JOB_CSV_COLUMNS,
  publicContactRecord,
  publicJobRecord,
  sanitizeNote,
} from "./admin_util.ts";

const CV_BUCKET = "bewerbungen";
const CV_SIGNED_URL_TTL_S = 600; // 10 Minuten

// Mediathek / editierbare Bilder.
const IMAGES_BUCKET = "site-images";
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function decodeImageBase64(b64: string): Uint8Array {
  const payload = b64.includes(",") ? b64.slice(b64.indexOf(",") + 1) : b64;
  const bin = atob(payload.trim());
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}

// Bildtyp aus den ersten Bytes ableiten (nicht dem Client vertrauen). Der Bucket
// ist zwar öffentlich, aber der Content-Type wird aus den gesnifften Bytes
// gesetzt, damit keine als Bild getarnte HTML-Datei ausgeliefert wird.
function sniffImage(bytes: Uint8Array): "jpg" | "png" | "webp" | null {
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "jpg";
  if (bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) return "png";
  if (
    bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 &&
    bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50
  ) return "webp";
  return null;
}

function safeImageId(id: string): string {
  return (id || "").replace(/[^a-z0-9.\-]/gi, "_").slice(0, 80) || "bild";
}

/** Erlaubter Dateiname im Bucket — schließt Pfadwechsel (`/`, `..`) aus. */
const IMAGE_NAME_RE = /^[\w.\-]{1,120}$/;

// Inline-Editor: erlaubte Editable-IDs, Deckel, Sanitizer.
const CONTENT_ID_RE = /^[a-z0-9][a-z0-9.\-]{0,80}$/;
const MAX_CONTENT_IDS = 400;
const MAX_CONTENT_LEN = 8000;

function safeHref(h: string): boolean {
  const s = (h || "").trim();
  // Nur same-origin-relative Pfade (kein zweiter Slash → blockt //fremdhost),
  // http(s), mailto, tel, #anker.
  return /^https?:\/\//i.test(s) || /^mailto:/i.test(s) || /^tel:/i.test(s) ||
    /^\/(?!\/)[\w./-]*$/.test(s) || /^#[\w-]+$/.test(s);
}

// Escape-First-Allowlist: erst ALLES neutralisieren, dann nur wenige sichere
// Inline-Tags (fett/kursiv/Umbruch/Link) zurückholen. So kann ein Redakteur
// keinen aktiven HTML/JS-Code speichern. Plain-Text überlebt als escapetes
// HTML — der Client rendert Overrides konsequent als HTML (kein Doppel-Escape).
function sanitizeRich(html: string): string {
  let s = html
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, "&amp;")
    .replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  s = s.replace(/&lt;(\/?)(strong|b|em|i)&gt;/gi, "<$1$2>");
  s = s.replace(/&lt;br\s*\/?&gt;/gi, "<br>");
  s = s.replace(/&lt;a\b[\s\S]*?&gt;/gi, (m) => {
    const hm = m.match(/href=(?:&quot;|&#39;)([\s\S]*?)(?:&quot;|&#39;)/i);
    const href = hm ? hm[1] : "";
    return safeHref(href) ? '<a href="' + href + '" target="_blank" rel="noopener noreferrer">' : "";
  });
  s = s.replace(/&lt;\/a&gt;/gi, "</a>");
  s = s.replace(/&lt;\/?[a-z][\s\S]*?&gt;/gi, ""); // alle übrigen Tags raus, Text bleibt
  return s;
}

const EDIT_PW = Deno.env.get("EDIT_PASSWORD") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Salt für den IP-Hash im Rate-Limit-Log. Die IP wird nur als Fensterschlüssel
// gebraucht und nie im Klartext gespeichert.
const IP_SALT = "urra-admin-rate-limit-v1";

const RL_WINDOW_MS = 15 * 60 * 1000;
const RL_PER_IP = 10;
// Das globale Limit ist die Notbremse gegen verteilte Versuche — es sperrt aber
// zwangsläufig auch den Betreiber aus. Deshalb bewusst hoch angesetzt: Wer es
// auslösen will, braucht über 30 verschiedene IPs (pro IP ist bei 10 Schluss).
// Vorher stand hier 60; das reichte, um den Betreiber gezielt auszusperren.
const RL_GLOBAL = 400;

// CORS-Allowlist: die Live-Domain plus die lokalen Dev-/Preview-Origins.
const ALLOWED_ORIGINS = new Set([
  // Eigene Domain (Hauptadresse) — www leitet dorthin um, wird aber der
  // Vollständigkeit halber mitgeführt.
  "https://urra-fenster.de",
  "https://www.urra-fenster.de",
  // Alte GitHub-Pages-Adresse: bleibt vorerst erlaubt, damit während der
  // DNS-Umstellung nichts abreißt. Kann später entfallen.
  "https://chaos20140.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:4173",
  "http://127.0.0.1:4173",
]);

function corsHeaders(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.has(origin) ? origin : "https://urra-fenster.de";
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    // apikey gehört dazu: der Supabase-Client-SDK-Stil sendet ihn zusätzlich
    // zu Authorization, und der Browser-Preflight lehnt sonst ab.
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

// Passwortvergleich in konstanter Zeit (gegen Timing-Angriffe).
function ctEq(a: string, b: string): boolean {
  const ea = new TextEncoder().encode(a);
  const eb = new TextEncoder().encode(b);
  const n = Math.max(ea.length, eb.length);
  let r = ea.length ^ eb.length;
  for (let i = 0; i < n; i++) r |= (ea[i] || 0) ^ (eb[i] || 0);
  return r === 0;
}

/** Grobe Plausibilitätsprüfung: sieht der Wert wie eine IPv4/IPv6-Adresse aus? */
function looksLikeIp(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || (/^[0-9a-f:]{3,45}$/i.test(s) && s.includes(":"));
}

// Client-IP für die Rate-Limit-Zählung.
//
// Reihenfolge bewusst so: Der LETZTE Eintrag in X-Forwarded-For wird von der
// Infrastruktur angehängt und ist damit die einzige Angabe, die ein Client
// nicht selbst bestimmen kann — schickt er eigene Werte mit, landen die davor.
// `cf-connecting-ip` dient nur als Rückfall; `x-real-ip` wird nicht mehr
// verwendet, da dieser Header frei setzbar ist und die Per-IP-Bremse damit
// wählbar machte. Alles, was nicht wie eine IP aussieht, landet im
// gemeinsamen „unknown"-Eimer statt eine eigene Zählung zu bekommen.
function clientIp(req: Request): string {
  const fwd = req.headers.get("x-forwarded-for");
  if (fwd) {
    const parts = fwd.split(",").map((s) => s.trim()).filter(Boolean);
    const last = parts[parts.length - 1];
    if (last && looksLikeIp(last)) return last;
  }
  const cf = req.headers.get("cf-connecting-ip")?.trim();
  if (cf && looksLikeIp(cf)) return cf;
  return "unknown";
}

async function hashIp(ip: string): Promise<string> {
  const data = new TextEncoder().encode(IP_SALT + ip);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

type SB = ReturnType<typeof createClient>;
function serviceClient(): SB {
  return createClient(SUPABASE_URL, SERVICE_ROLE, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Rate-Limit: nur Fehlversuche zählen (pro IP-Hash + global, 15-Min-Fenster).
// Fail-CLOSED: bei DB-Lesefehler lieber eine kurze Login-Sperre (429) als eine
// ausgefallene Brute-Force-Bremse. Der Admin ist Low-Traffic.
async function rateLimited(sb: SB, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RL_WINDOW_MS).toISOString();
  try {
    const [perIp, global] = await Promise.all([
      sb.from("urra_admin_log").select("*", { count: "exact", head: true })
        .eq("ip_hash", ipHash).eq("ok", false).gte("created_at", since),
      sb.from("urra_admin_log").select("*", { count: "exact", head: true })
        .eq("ok", false).gte("created_at", since),
    ]);
    if (perIp.error || global.error) return true;
    return (perIp.count ?? 0) >= RL_PER_IP || (global.count ?? 0) >= RL_GLOBAL;
  } catch {
    return true;
  }
}

async function logFail(sb: SB, ipHash: string): Promise<void> {
  try {
    await sb.from("urra_admin_log").insert({ ip_hash: ipHash, ok: false });
  } catch { /* Protokollfehler nicht nach außen tragen */ }
}

// Bei erfolgreichem Login alte Log-Einträge (>7 Tage) aufräumen.
async function pruneLog(sb: SB): Promise<void> {
  try {
    const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
    await sb.from("urra_admin_log").delete().lt("created_at", cutoff);
  } catch { /* egal */ }
}

type GateOk = { ok: true; body: Record<string, unknown>; sb: SB };
type GateFail = { ok: false; res: Response };

async function adminGate(req: Request, origin: string | null): Promise<GateOk | GateFail> {
  if (!EDIT_PW || !SUPABASE_URL || !SERVICE_ROLE) {
    return { ok: false, res: json({ error: "not_configured" }, 503, origin) };
  }
  const sb = serviceClient();
  const ipHash = await hashIp(clientIp(req));

  if (await rateLimited(sb, ipHash)) {
    return { ok: false, res: json({ error: "rate_limited" }, 429, origin) };
  }

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    // `JSON.parse("null")` und `"[]"` gelingen — der anschließende Zugriff auf
    // body.password würde dann abstürzen (500 ohne CORS-Header, kein
    // Protokolleintrag). Deshalb hier auf ein echtes Objekt bestehen.
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return { ok: false, res: json({ error: "bad_json" }, 400, origin) };
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return { ok: false, res: json({ error: "bad_json" }, 400, origin) };
  }

  if (typeof body.password !== "string" || !ctEq(body.password, EDIT_PW)) {
    await logFail(sb, ipHash);
    await new Promise((r) => setTimeout(r, 600));
    return { ok: false, res: json({ error: "unauthorized" }, 401, origin) };
  }

  // Passwort korrekt → gute Gelegenheit, alte Fehlversuche wegzuräumen.
  await pruneLog(sb);
  return { ok: true, body, sb };
}

async function loadRows(
  sb: SB,
  table: string,
  includeArchived: boolean,
): Promise<Record<string, unknown>[]> {
  let q = sb.from(table).select("*").order("created_at", { ascending: false });
  if (!includeArchived) q = q.eq("admin_archived", false);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Record<string, unknown>[];
}

// Gemeinsame Update-Logik für Anfragen und Bewerbungen (gleiche Betreiber-Felder).
async function updateRow(
  sb: SB,
  table: string,
  body: Record<string, unknown>,
  origin: string | null,
  toPublic: (r: Record<string, unknown>) => Record<string, unknown>,
): Promise<Response> {
  const id = body.id;
  if (!isUuid(id)) return json({ error: "bad_id" }, 400, origin);
  const patch: Record<string, unknown> = { admin_updated_at: new Date().toISOString() };
  if ("admin_status" in body) {
    if (!isAdminStatus(body.admin_status)) return json({ error: "bad_status" }, 400, origin);
    patch.admin_status = body.admin_status;
  }
  if ("admin_note" in body) patch.admin_note = sanitizeNote(body.admin_note);
  if ("admin_archived" in body) patch.admin_archived = Boolean(body.admin_archived);
  const { data, error } = await sb.from(table).update(patch).eq("id", id).select("*").maybeSingle();
  if (error) return json({ error: "db_error" }, 500, origin);
  if (!data) return json({ error: "not_found" }, 404, origin);
  return json({ ok: true, item: toPublic(data as Record<string, unknown>) }, 200, origin);
}

async function handle(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }
  if (req.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405, origin);
  }

  const gate = await adminGate(req, origin);
  if (!gate.ok) return gate.res;
  const { body, sb } = gate;
  const action = body.action;

  // Login-Prüfung: das Gate ist schon bestanden.
  if (action === "check") {
    return json({ ok: true }, 200, origin);
  }

  // Prüft den Mailversand: baut dieselbe Vorlage wie im Ernstfall und
  // verschickt sie an die konfigurierte Betriebsadresse. Bewusst KEIN
  // freier Empfänger — sonst ließe sich die Funktion als Versandhelfer
  // für fremde Adressen missbrauchen.
  if (action === "mail-test") {
    if (!mailKonfiguriert) {
      return json(
        { ok: false, grund: "nicht_konfiguriert" },
        200,
        origin,
      );
    }
    const inhalt = {
      titel: "Testnachricht",
      vorspann:
        "Diese Nachricht bestätigt, dass der Mailversand der Website funktioniert.",
      zeilen: [
        { label: "Anlass", wert: "Test aus der Verwaltung" },
        {
          label: "Zeitpunkt",
          wert: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }),
        },
      ],
      nachricht: {
        label: "Hinweis",
        text:
          "Ab jetzt erhalten Sie bei jeder Anfrage und jeder Bewerbung automatisch eine Nachricht an diese Adresse.",
      },
      aktion: {
        label: "Zur Verwaltung",
        href: "https://urra-fenster.de/admin",
      },
    };
    const r = await sendeMail({
      betreff: "Testnachricht von urra-fenster.de",
      html: renderMail(inhalt),
      text: renderText(inhalt),
    });
    return json({ ok: r.ok, grund: r.fehler ?? null, detail: r.detail ?? null }, 200, origin);
  }

  // ── Inline-Editor: Text-Overrides speichern / zurücksetzen ─────────────────
  if (action === "save-content") {
    const overrides = (body.overrides ?? {}) as Record<string, unknown>;
    const ids = Object.keys(overrides);
    if (ids.length === 0) return json({ error: "empty" }, 400, origin);
    if (ids.length > MAX_CONTENT_IDS) return json({ error: "too_many" }, 400, origin);
    for (const id of ids) {
      if (!CONTENT_ID_RE.test(id)) return json({ error: "bad_id", id }, 400, origin);
      const v = overrides[id];
      if (typeof v !== "string") return json({ error: "bad_value", id }, 400, origin);
      if (v.length > MAX_CONTENT_LEN) return json({ error: "too_long", id }, 400, origin);
    }
    const now = new Date().toISOString();
    // JEDEN Wert sanitisieren (nicht nur die als rich gemeldeten): sonst könnte
    // ein authentifizierter Client rohes HTML unter einer im Frontend als HTML
    // gerenderten ID ablegen → Stored XSS.
    const rows = ids.map((id) => ({
      key: id,
      value: sanitizeRich(overrides[id] as string),
      updated_at: now,
    }));
    const { error } = await sb.from("site_content").upsert(rows);
    if (error) return json({ error: "db_error" }, 500, origin);
    return json({ ok: true, count: ids.length }, 200, origin);
  }

  if (action === "reset-content") {
    // Einen oder mehrere Overrides löschen → der Code-Text (content.ts) greift wieder.
    const keys = Array.isArray(body.keys) ? body.keys.filter((k) => typeof k === "string") : [];
    if (keys.length === 0) return json({ error: "empty" }, 400, origin);
    if (keys.length > MAX_CONTENT_IDS) return json({ error: "too_many" }, 400, origin);
    const { error } = await sb.from("site_content").delete().in("key", keys as string[]);
    if (error) return json({ error: "db_error" }, 500, origin);
    return json({ ok: true }, 200, origin);
  }

  // ── Bilder im Editor / Mediathek ───────────────────────────────────────────
  if (action === "upload-image") {
    const id = body.id;
    // standalone = Upload aus der Mediathek: es gibt keine Stelle auf der
    // Website, an die das Bild gehört. `id` ist dann nur ein Dateinamen-
    // Vorschlag und wird NICHT als Inhalts-Schlüssel gespeichert — sonst
    // entstünde ein Override, der auf nichts zeigt.
    const standalone = body.standalone === true;
    if (typeof id !== "string" || id.length === 0 || id.length > 80) {
      return json({ error: "bad_id" }, 400, origin);
    }
    if (!standalone && !CONTENT_ID_RE.test(id)) return json({ error: "bad_id" }, 400, origin);
    const data = body.dataBase64;
    if (typeof data !== "string" || data.length > Math.ceil(MAX_IMAGE_BYTES * 1.4)) {
      return json({ error: "image_too_big" }, 400, origin);
    }
    const bytes = decodeImageBase64(data);
    if (bytes.length === 0 || bytes.length > MAX_IMAGE_BYTES) return json({ error: "image_too_big" }, 400, origin);
    const ext = sniffImage(bytes);
    if (!ext) return json({ error: "not_image" }, 400, origin);

    const path = `${safeImageId(id)}-${Date.now()}.${ext}`;
    const contentType = ext === "jpg" ? "image/jpeg" : `image/${ext}`;
    const { error: upErr } = await sb.storage.from(IMAGES_BUCKET)
      .upload(path, bytes, { contentType, upsert: true });
    if (upErr) return json({ error: "upload_failed" }, 500, origin);

    const url = sb.storage.from(IMAGES_BUCKET).getPublicUrl(path).data.publicUrl;
    if (standalone) return json({ ok: true, url, name: path }, 200, origin);

    // URL als Override in site_content ablegen — kontrollierte URL aus unserem
    // eigenen Bucket, daher ohne sanitizeRich (die würde & in der URL zerstören).
    const { error: dbErr } = await sb.from("site_content")
      .upsert({ key: id, value: url, updated_at: new Date().toISOString() });
    if (dbErr) return json({ error: "db_error" }, 500, origin);
    return json({ ok: true, url, name: path }, 200, origin);
  }

  // Ein bereits hochgeladenes Bild an einer Stelle der Website einsetzen.
  // Die URL wird SERVERSEITIG aus dem Bucket gebaut, nie vom Client übernommen —
  // so kann über diesen Weg keine fremde Adresse in die Seite gelangen.
  if (action === "use-image") {
    const id = body.id;
    const name = body.name;
    if (typeof id !== "string" || !CONTENT_ID_RE.test(id)) return json({ error: "bad_id" }, 400, origin);
    if (typeof name !== "string" || !IMAGE_NAME_RE.test(name)) {
      return json({ error: "bad_name" }, 400, origin);
    }
    const { data: list, error: listErr } = await sb.storage.from(IMAGES_BUCKET).list("", { limit: 1000 });
    if (listErr) return json({ error: "list_failed" }, 500, origin);
    if (!(list ?? []).some((f) => f.name === name)) return json({ error: "not_found" }, 404, origin);

    const url = sb.storage.from(IMAGES_BUCKET).getPublicUrl(name).data.publicUrl;
    const { error: dbErr } = await sb.from("site_content")
      .upsert({ key: id, value: url, updated_at: new Date().toISOString() });
    if (dbErr) return json({ error: "db_error" }, 500, origin);
    return json({ ok: true, url }, 200, origin);
  }

  if (action === "list-images") {
    const { data: files, error } = await sb.storage.from(IMAGES_BUCKET)
      .list("", { limit: 1000, sortBy: { column: "created_at", order: "desc" } });
    if (error) return json({ error: "storage_error" }, 500, origin);
    const { data: rows } = await sb.from("site_content").select("value");
    const used = new Set((rows ?? []).map((r) => String(r.value)));
    const base = sb.storage.from(IMAGES_BUCKET).getPublicUrl("").data.publicUrl.replace(/\/$/, "");
    const items = (files ?? [])
      .filter((f) => f && typeof f.name === "string" && !f.name.startsWith("."))
      .map((f) => {
        const url = `${base}/${f.name}`;
        return {
          name: f.name,
          url,
          inUse: used.has(url),
          size: (f.metadata as { size?: number } | null)?.size ?? null,
        };
      });
    return json({ items }, 200, origin);
  }

  if (action === "delete-image") {
    const name = body.name;
    if (typeof name !== "string" || !IMAGE_NAME_RE.test(name)) return json({ error: "bad_name" }, 400, origin);
    const base = sb.storage.from(IMAGES_BUCKET).getPublicUrl("").data.publicUrl.replace(/\/$/, "");
    const url = `${base}/${name}`;
    if (!body.force) {
      const { data: rows } = await sb.from("site_content").select("key").eq("value", url).limit(1);
      if (rows && rows.length > 0) return json({ error: "in_use" }, 409, origin);
    }
    const { error } = await sb.storage.from(IMAGES_BUCKET).remove([name]);
    if (error) return json({ error: "storage_error" }, 500, origin);
    return json({ ok: true }, 200, origin);
  }

  function csvResponse(
    items: Record<string, unknown>[],
    columns: Array<[string, string]>,
    filename: string,
  ): Response {
    const headers = columns.map(([h]) => h);
    const rows = items.map((r) =>
      columns.map(([, k]) => {
        if (k === "created_at") return r[k] ? fmtDateDe(String(r[k])) : "";
        if (k === "admin_status") return String(r[k] ?? "neu");
        return r[k] == null ? "" : String(r[k]);
      })
    );
    const csv = "﻿" + buildCsv(headers, rows); // UTF-8-BOM für Excel
    return new Response(csv, {
      status: 200,
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
        ...corsHeaders(origin),
      },
    });
  }

  // ── Anfragen ───────────────────────────────────────────────────────────────
  if (action === "list-contacts") {
    try {
      const items = await loadRows(sb, "contact_requests", Boolean(body.includeArchived));
      return json({ items: items.map(publicContactRecord) }, 200, origin);
    } catch {
      return json({ error: "db_error" }, 500, origin);
    }
  }

  if (action === "update-contact") {
    return updateRow(sb, "contact_requests", body, origin, publicContactRecord);
  }

  if (action === "delete-contact") {
    const id = body.id;
    if (!isUuid(id)) return json({ error: "bad_id" }, 400, origin);
    const { error } = await sb.from("contact_requests").delete().eq("id", id);
    if (error) return json({ error: "db_error" }, 500, origin);
    return json({ ok: true }, 200, origin); // idempotent
  }

  if (action === "export-contacts") {
    try {
      const items = await loadRows(sb, "contact_requests", Boolean(body.includeArchived));
      return csvResponse(items, CONTACT_CSV_COLUMNS, "urra-anfragen.csv");
    } catch {
      return json({ error: "db_error" }, 500, origin);
    }
  }

  // ── Bewerbungen ────────────────────────────────────────────────────────────
  if (action === "list-jobs") {
    try {
      const items = await loadRows(sb, "job_applications", Boolean(body.includeArchived));
      return json({ items: items.map(publicJobRecord) }, 200, origin);
    } catch {
      return json({ error: "db_error" }, 500, origin);
    }
  }

  if (action === "update-job") {
    return updateRow(sb, "job_applications", body, origin, publicJobRecord);
  }

  if (action === "delete-job") {
    const id = body.id;
    if (!isUuid(id)) return json({ error: "bad_id" }, 400, origin);
    // Erst den Lebenslauf aus dem Storage holen und mitlöschen.
    const { data: rec } = await sb.from("job_applications")
      .select("cv_path").eq("id", id).maybeSingle();
    const cvPath = rec && typeof rec.cv_path === "string" ? rec.cv_path : null;
    if (cvPath) {
      try { await sb.storage.from(CV_BUCKET).remove([cvPath]); } catch { /* egal */ }
    }
    const { error } = await sb.from("job_applications").delete().eq("id", id);
    if (error) return json({ error: "db_error" }, 500, origin);
    return json({ ok: true }, 200, origin);
  }

  if (action === "cv-url") {
    const id = body.id;
    if (!isUuid(id)) return json({ error: "bad_id" }, 400, origin);
    const { data: rec } = await sb.from("job_applications")
      .select("cv_path, cv_filename").eq("id", id).maybeSingle();
    const cvPath = rec && typeof rec.cv_path === "string" ? rec.cv_path : null;
    if (!cvPath) return json({ error: "no_cv" }, 404, origin);
    const filename = rec && typeof rec.cv_filename === "string" ? rec.cv_filename : true;
    const { data, error } = await sb.storage.from(CV_BUCKET)
      .createSignedUrl(cvPath, CV_SIGNED_URL_TTL_S, { download: filename });
    if (error || !data?.signedUrl) return json({ error: "sign_failed" }, 500, origin);
    return json({ url: data.signedUrl }, 200, origin);
  }

  if (action === "export-jobs") {
    try {
      const items = await loadRows(sb, "job_applications", Boolean(body.includeArchived));
      return csvResponse(items, JOB_CSV_COLUMNS, "urra-bewerbungen.csv");
    } catch {
      return json({ error: "db_error" }, 500, origin);
    }
  }

  return json({ error: "unknown_action" }, 400, origin);
}

Deno.serve(handle);
