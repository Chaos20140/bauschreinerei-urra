// Reine, importfreie Helfer für die Admin-Function.
// Kein Runtime-Import → importierbar von Deno (index.ts) UND Node (Tests).

export const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isUuid(s: unknown): s is string {
  return typeof s === "string" && UUID_RE.test(s);
}

export const ADMIN_STATUSES = ["neu", "in_bearbeitung", "erledigt"] as const;
export function isAdminStatus(s: unknown): boolean {
  return typeof s === "string" &&
    (ADMIN_STATUSES as readonly string[]).includes(s);
}

// Die interne Notiz wird als KLARTEXT gespeichert (nur längenbegrenzt). Sie wird
// nie über dangerouslySetInnerHTML gerendert — React escapt Textknoten selbst,
// das Textarea zeigt den Rohwert, und der CSV-Export läuft durch csvCell().
// HTML-Escaping beim Speichern würde Notizen mit < & " bei jedem Speichern
// erneut doppelt verfälschen.
export const MAX_NOTE = 2000;
export function sanitizeNote(s: unknown): string {
  return String(s ?? "").slice(0, MAX_NOTE);
}

// CSV (RFC 4180) mit Schutz vor Formel-Injection in Tabellenkalkulationen.
export function csvCell(v: unknown): string {
  const s = String(v ?? "");
  const guarded = /^[=+\-@\t\r]/.test(s) ? "'" + s : s;
  return /[",\n\r]/.test(guarded) ? '"' + guarded.replace(/"/g, '""') + '"' : guarded;
}

export function buildCsv(headers: string[], rows: string[][]): string {
  return [headers, ...rows].map((r) => r.map(csvCell).join(",")).join("\r\n");
}

// Spalten des CSV-Exports: [Überschrift, Datensatz-Feld]. Interne/sensible
// Felder (honeypot, user_agent) sind bewusst nicht dabei.
export const CONTACT_CSV_COLUMNS: Array<[string, string]> = [
  ["Eingegangen", "created_at"],
  ["Status", "admin_status"],
  ["Name", "name"],
  ["E-Mail", "email"],
  ["Telefon", "phone"],
  ["Objekt-Adresse", "address"],
  ["Projekttyp", "project_type"],
  ["Nachricht", "message"],
  ["Notiz", "admin_note"],
];

// Felder, die der Admin-Client nie erhält (interne Spam-/Technik-Daten).
// Der Rest der Zeile geht 1:1 an den Client.
const HIDDEN_FIELDS = new Set(["honeypot", "user_agent"]);
export function publicContactRecord(r: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(r ?? {})) {
    if (!HIDDEN_FIELDS.has(k)) out[k] = v;
  }
  return out;
}

// Deutsches Anzeige-Datum aus einem ISO-Zeitstempel (für den CSV-Export).
export function fmtDateDe(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getDate())}.${p(d.getMonth() + 1)}.${d.getFullYear()} ${p(d.getHours())}:${p(d.getMinutes())}`;
}
