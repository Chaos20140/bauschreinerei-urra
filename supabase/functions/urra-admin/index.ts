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
import {
  buildCsv,
  CONTACT_CSV_COLUMNS,
  fmtDateDe,
  isAdminStatus,
  isUuid,
  publicContactRecord,
  sanitizeNote,
} from "./admin_util.ts";

const EDIT_PW = Deno.env.get("EDIT_PASSWORD") || "";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";

// Salt für den IP-Hash im Rate-Limit-Log. Die IP wird nur als Fensterschlüssel
// gebraucht und nie im Klartext gespeichert.
const IP_SALT = "urra-admin-rate-limit-v1";

const RL_WINDOW_MS = 15 * 60 * 1000;
const RL_PER_IP = 10;
const RL_GLOBAL = 60;

// CORS-Allowlist: die Live-Domain plus die lokalen Dev-/Preview-Origins.
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

// Client-IP: plattform-gesetzte, vom Client nicht fälschbare Header bevorzugen,
// damit ein Angreifer die per-IP-Sperre nicht über selbst gesetzte
// X-Forwarded-For-Einträge umgeht.
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
    body = await req.json();
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

async function loadContacts(sb: SB, includeArchived: boolean): Promise<Record<string, unknown>[]> {
  let q = sb.from("contact_requests").select("*").order("created_at", { ascending: false });
  if (!includeArchived) q = q.eq("admin_archived", false);
  const { data, error } = await q;
  if (error) throw new Error(error.message);
  return (data ?? []) as Record<string, unknown>[];
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

  if (action === "list-contacts") {
    try {
      const items = await loadContacts(sb, Boolean(body.includeArchived));
      return json({ items: items.map(publicContactRecord) }, 200, origin);
    } catch {
      return json({ error: "db_error" }, 500, origin);
    }
  }

  if (action === "update-contact") {
    const id = body.id;
    if (!isUuid(id)) return json({ error: "bad_id" }, 400, origin);

    const patch: Record<string, unknown> = { admin_updated_at: new Date().toISOString() };
    if ("admin_status" in body) {
      if (!isAdminStatus(body.admin_status)) return json({ error: "bad_status" }, 400, origin);
      patch.admin_status = body.admin_status;
    }
    if ("admin_note" in body) patch.admin_note = sanitizeNote(body.admin_note);
    if ("admin_archived" in body) patch.admin_archived = Boolean(body.admin_archived);

    const { data, error } = await sb.from("contact_requests")
      .update(patch).eq("id", id).select("*").maybeSingle();
    if (error) return json({ error: "db_error" }, 500, origin);
    if (!data) return json({ error: "not_found" }, 404, origin);
    return json({ ok: true, item: publicContactRecord(data as Record<string, unknown>) }, 200, origin);
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
      const items = await loadContacts(sb, Boolean(body.includeArchived));
      const headers = CONTACT_CSV_COLUMNS.map(([h]) => h);
      const rows = items.map((r) =>
        CONTACT_CSV_COLUMNS.map(([, k]) => {
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
          "Content-Disposition": 'attachment; filename="urra-anfragen.csv"',
          ...corsHeaders(origin),
        },
      });
    } catch {
      return json({ error: "db_error" }, 500, origin);
    }
  }

  return json({ error: "unknown_action" }, 400, origin);
}

Deno.serve(handle);
