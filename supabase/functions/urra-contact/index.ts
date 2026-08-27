// Öffentlicher Anfrage-Eingang — Edge Function `urra-contact`.
//
// Nimmt das Kontaktformular entgegen: validiert serverseitig, speichert in
// `contact_requests` und benachrichtigt den Betrieb per Mail.
//
// Warum nicht mehr direkt aus dem Browser in die Datenbank (wie bisher):
//   1. Ohne Server dazwischen gibt es keine Stelle, an der eine Mail entstehen
//      kann.
//   2. Die Prüfungen lagen im Browser und waren damit umgehbar — jetzt hier.
//   3. Der öffentliche Schlüssel braucht kein Schreibrecht mehr auf die
//      Tabelle; das Anfragen-Postfach ist damit von außen unbeschreibbar.
//   4. Der Browser lädt keine Datenbank-Bibliothek mehr (rund 55 kB gzip).
//
// Deploy: supabase functions deploy urra-contact --no-verify-jwt --project-ref <ref>

import { createClient } from "jsr:@supabase/supabase-js@2";
import { sendeMail } from "../_shared/mail.ts";
import { renderMail, renderText, type MailInhalt } from "../_shared/mailTemplate.ts";
import {
  emailUnbrauchbar,
  nameUnbrauchbar,
  pruefeVerdacht,
  wortAnzahl,
} from "../_shared/plausibilitaet.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

const IP_SALT = "urra-contact-rate-limit-v1";
const RL_WINDOW_MS = 60 * 60 * 1000; // 1 Stunde
const RL_PER_IP = 5; // Anfragen pro Absender und Stunde

const ALLOWED_ORIGINS = new Set([
  "https://urra-fenster.de",
  "https://www.urra-fenster.de",
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

/** Grobe Plausibilitätsprüfung: sieht der Wert wie eine IPv4/IPv6-Adresse aus? */
function looksLikeIp(s: string): boolean {
  return /^\d{1,3}(\.\d{1,3}){3}$/.test(s) || (/^[0-9a-f:]{3,45}$/i.test(s) && s.includes(":"));
}

// Der LETZTE Eintrag in X-Forwarded-For wird von der Infrastruktur angehängt
// und ist als einziger nicht vom Client bestimmbar.
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

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

// Entfernt das Unicode-Ersatzzeichen (entsteht bei falsch kodierten Eingaben)
// sowie Steuerzeichen; Zeilenumbruch und Tabulator bleiben für die Nachricht.
function clean(s: string): string {
  return s
    .replace(/\uFFFD/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .trim();
}

type SB = ReturnType<typeof createClient>;

async function rateLimited(sb: SB, ipHash: string): Promise<boolean> {
  const since = new Date(Date.now() - RL_WINDOW_MS).toISOString();
  try {
    const { count, error } = await sb.from("urra_contact_log")
      .select("*", { count: "exact", head: true })
      .eq("ip_hash", ipHash).gte("created_at", since);
    if (error) return true; // fail-closed
    return (count ?? 0) >= RL_PER_IP;
  } catch {
    return true;
  }
}

async function handle(req: Request): Promise<Response> {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: corsHeaders(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
  if (!SUPABASE_URL || !SERVICE_ROLE) return json({ error: "not_configured" }, 503, origin);

  let body: Record<string, unknown>;
  try {
    const parsed = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return json({ error: "bad_json" }, 400, origin);
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return json({ error: "bad_json" }, 400, origin);
  }

  // Honeypot: unsichtbares Feld. Gefüllt = Bot. Wir melden Erfolg, speichern
  // aber nichts — sonst weiß der Bot, dass er erkannt wurde.
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
  try {
    await sb.from("urra_contact_log").insert({ ip_hash: ipHash });
  } catch { /* Zähler-Fehler darf die Anfrage nicht verhindern */ }

  const name = clean(String(body.name ?? ""));
  const email = clean(String(body.email ?? ""));
  const phone = clean(String(body.phone ?? ""));
  const address = clean(String(body.address ?? ""));
  const projectType = clean(String(body.project_type ?? ""));
  const message = clean(String(body.message ?? ""));

  const fields: Record<string, string> = {};
  // Länge UND Plausibilität: Markup, Adressen oder Tastatur-Müll im
  // Namensfeld sind sicher keine echte Anfrage.
  if (name.length > 120 || nameUnbrauchbar(name)) fields.name = "Bitte geben Sie Ihren Namen an.";
  // Strengere Struktur-Prüfung als das grobe Muster: doppelte Punkte,
  // fehlende Endung und Ähnliches sind nie zustellbar.
  if (!EMAIL_RE.test(email) || emailUnbrauchbar(email)) fields.email = "Bitte geben Sie eine gültige E-Mail-Adresse an.";
  if (phone.length > 50) fields.phone = "Telefonnummer ist zu lang.";
  if (address.length > 200) fields.address = "Adresse ist zu lang.";
  if (projectType.length > 120) fields.project_type = "Projekttyp ist zu lang.";
  if (message.length < 5 || message.length > 5000) fields.message = "Bitte beschreiben Sie Ihr Anliegen kurz.";
  // Obergrenze an Wörtern zusätzlich zur Zeichenzahl: bremst Fließtext-
  // Spam, liegt aber weit über jeder echten Anfrage.
  if (wortAnzahl(message) > 800) fields.message = "Die Nachricht ist zu lang.";
  // Ohne Einwilligung darf nichts gespeichert werden.
  const consent = body.gdpr_consent === true;
  if (!consent) fields.gdpr_consent = "Bitte bestätigen Sie die Datenschutzerklärung.";

  if (Object.keys(fields).length > 0) {
    return json({ error: "validation", fields }, 422, origin);
  }

  const ua = clean(String(body.user_agent ?? "")).slice(0, 500);

  const { error } = await sb.from("contact_requests").insert({
    name, email,
    phone: phone || null,
    address: address || null,
    project_type: projectType || null,
    message,
    gdpr_consent: consent,
    user_agent: ua || null,
  });

  if (error) {
    console.error("contact: insert fehlgeschlagen:", error.message);
    return json({ error: "db_error" }, 500, origin);
  }

  // Benachrichtigung NACH dem Speichern und ohne throw: Die Anfrage ist
  // sicher abgelegt und darf nicht daran scheitern, dass der Mailserver klemmt.
  // Verdacht nur ERMITTELN, nicht ablehnen: Die Anfrage ist bereits
  // gespeichert. Der Hinweis erscheint in der Mail, damit der Betrieb
  // selbst entscheiden kann.
  const verdacht = pruefeVerdacht(name, message);

  const inhalt: MailInhalt = {
    titel: "Neue Anfrage",
    vorspann: `${name} hat über die Website eine Anfrage geschickt.`,
    zeilen: [
      { label: "Name", wert: name },
      { label: "E-Mail", wert: email, link: `mailto:${email}` },
      ...(phone ? [{ label: "Telefon", wert: phone, link: `tel:${phone.replace(/[^\d+]/g, "")}` }] : []),
      ...(address ? [{ label: "Objekt-Adresse", wert: address }] : []),
      ...(projectType ? [{ label: "Projekttyp", wert: projectType }] : []),
      { label: "Eingegangen", wert: new Date().toLocaleString("de-DE", { timeZone: "Europe/Berlin" }) },
    ],
    nachricht: { label: "Nachricht", text: message },
    aktion: { label: "In der Verwaltung öffnen", href: "https://urra-fenster.de/admin/anfragen" },
    fussnote: verdacht.verdaechtig
      ? `Eine Antwort geht direkt an die anfragende Person. — Hinweis: Diese Anfrage wirkt automatisiert (${verdacht.gruende.join(", ")}), wurde aber gespeichert.`
      : "Eine Antwort geht direkt an die anfragende Person.",
  };

  try {
    const r = await sendeMail({
      betreff: `Neue Anfrage: ${name}`,
      html: renderMail(inhalt),
      text: renderText(inhalt),
      antwortAn: email,
    });
    if (!r.ok && r.fehler !== "nicht_konfiguriert") {
      console.error("contact: Benachrichtigung fehlgeschlagen:", r.fehler);
    }
  } catch (e) {
    console.error("contact: Benachrichtigung unerwartet fehlgeschlagen:", e instanceof Error ? e.message : e);
  }

  return json({ ok: true }, 201, origin);
}

Deno.serve(handle);
