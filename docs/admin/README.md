# Verwaltungsmodus — Bau-Referenz

> Passwortgeschützter Admin-Bereich unter `/admin`. Etappe 1: Login, Dashboard,
> Anfragen-Verwaltung. Weitere Module (Bewerbungen, Termine, Mediathek,
> Seiten & Menü, Seite bearbeiten) folgen in späteren Runden.
>
> Muster übernommen aus den Projekten **Cura Doma** (gleicher Stack) und
> **devries**. Bei jeder Änderung am Admin diese Datei fortschreiben.

## Architektur in drei Sätzen

Eine **Supabase Edge Function** (`urra-admin`) ist die einzige Vertrauensgrenze:
Sie prüft ein geteiltes Passwort und liest/schreibt mit der Service-Role. Das
Frontend hält das Passwort **nur im Speicher** (React-Context, kein
`sessionStorage` → Reload = Logout) und schickt es bei jedem Aufruf mit. Der
öffentliche Publishable Key behält **keine** Leserechte auf die Anfragen.

## Sicherheitsmodell (der wiederverwendbare Kern)

Gilt für alle `/admin`-Aufrufe — beim Kopieren 1:1 mitnehmen:

- **PII nie ohne bestandene Passwortprüfung.** Jeder Aufruf durchläuft
  `adminGate`: `EDIT_PASSWORD` gesetzt? → sonst 503 · Rate-Limit (fail-**closed**,
  d. h. bei DB-Fehler 429) → sonst 429 · Konstantzeit-Vergleich `ctEq` → sonst
  ein Fehlversuch protokolliert + 600 ms Verzögerung + 401.
- **`id` per UUID-Regex geprüft, bevor** eine DB-Abfrage gebaut wird.
- **Rate-Limit** über die Tabelle `urra_admin_log` (nur Fehlversuche, pro IP + global,
  15-Minuten-Fenster). Die IP wird **gehasht** gespeichert (SHA-256 + Salt), nie im Klartext.
- **CSV-Export mit Formel-Injection-Schutz** (`csvCell` setzt `'` vor `= + - @`),
  RFC-4180-Quoting, UTF-8-BOM für Excel.
- **Interne Notiz als Klartext gespeichert** (nur längenbegrenzt), nie als
  `dangerouslySetInnerHTML` gerendert — React escapt Textknoten selbst.
- **CORS-Allowlist** auf die Urra-Domain(s).

## Datenmodell (nicht-brechend)

`contact_requests` wird um Betreiber-Felder ergänzt (Formular unberührt):

| Feld | Werte | Default |
|---|---|---|
| `admin_status` | `neu` · `in_bearbeitung` · `erledigt` | `neu` |
| `admin_note` | Text ≤ 2000, Klartext | `''` |
| `admin_archived` | boolean | `false` |
| `admin_updated_at` | Zeitstempel | — |

`urra_admin_log` (`ip_hash`, `ok`, `created_at`) für das Rate-Limit. Beide
Tabellen: RLS an, **keine** anon-Policy — Zugriff nur über die Function.

## Endpunkt-Vertrag

Function-URL: `<SUPABASE_URL>/functions/v1/urra-admin`. Alle POST, JSON-Body mit
`{ action, password, ... }`, alle durch `adminGate`:

- `check` → `{ ok: true }`
- `list-contacts` `{ includeArchived? }` → `{ items: [...] }` (Datum absteigend, ohne Roh-IP/Honeypot)
- `update-contact` `{ id, admin_status?, admin_note?, admin_archived? }` → `{ ok, item }`
- `delete-contact` `{ id }` → `{ ok }`
- `export-contacts` `{ includeArchived? }` → `text/csv`

## Dateien

**Server** (`supabase/functions/urra-admin/`)
- `admin_util.ts` — reine, importfreie Helfer (`isUuid`, `isAdminStatus`, `sanitizeNote`,
  `csvCell`/`buildCsv`, `CONTACT_CSV_COLUMNS`), mit `node --test` prüfbar.
- `admin_util.test.ts` — Unit-Tests dazu.
- `index.ts` — `Deno.serve` mit action-Router, `adminGate`, `ctEq`, Rate-Limit.

**Migration**
- `supabase/migrations/20260723120000_admin_contacts.sql`

**Frontend** (`src/`)
- `lib/admin.tsx` — `AdminProvider` (Passwort im Speicher) + Client (`login/list/update/remove/exportCsv`) + `adminErrorText`.
- `lib/admin-config.ts` — Function-URL + öffentlicher Key.
- `pages/admin/AdminArea.tsx` — Route-Element für `/admin/*`: `noindex`, Auth-Gate, eigener Vollbild-Rahmen außerhalb des öffentlichen Layouts.
- `pages/admin/AdminLoginForm.tsx`, `AdminDashboard.tsx`, `AdminInbox.tsx`, `AdminDetail.tsx`, `contactFields.ts`.
- `App.tsx` — `/admin/*` als eigenständige Top-Level-Route, umschlossen von `<AdminProvider>`.

## Deploy

1. Migration anwenden (Supabase-Dashboard SQL-Editor oder `supabase db push`).
2. `supabase functions deploy urra-admin --no-verify-jwt --project-ref <ref>`
3. `supabase secrets set EDIT_PASSWORD='…' --project-ref <ref>`
4. Frontend: Push auf `main` → GitHub-Pages-Workflow.

`/admin` wird **nicht** vorgerendert (kein SEO) und läuft über den SPA-Fallback
(`404.html`); `tools/prerender-routes.mjs` lässt die Route aus.

## Bewerbungen (Etappe 2)

Öffentliche Karriere-Seite (`/karriere`) mit Bewerbungsformular inkl. optionalem
Lebenslauf-Upload, plus Bewerbungs-Verwaltung im Admin.

- **Eingang:** eigene öffentliche Function **`urra-apply`** (kein Passwort, aber
  rate-limited über `urra_apply_log`, Honeypot, Feld- und Datei-Validierung).
  Der Lebenslauf wird per Service-Role in den **privaten** Bucket `bewerbungen`
  geladen — bewusst kein direkter Client-Insert, damit Lebensläufe nie
  öffentlich abrufbar sind. Kein E-Mail-Versand (konsistent mit dem
  Kontaktformular); neue Bewerbungen sieht der Betreiber über den „neu"-Zähler.
- **Verwaltung:** urra-admin um `list-jobs`, `update-job`, `delete-job` (löscht
  den Lebenslauf mit), `cv-url` (10-Minuten-Signed-Link) und `export-jobs`
  erweitert. `job_applications` mit denselben Betreiber-Feldern wie Anfragen.
- **CV-Sicherheit:** privater Bucket (öffentlicher Zugriff → 400), Magic-Byte-
  plus Größen-/Typ-Prüfung beim Upload, Download nur über kurzlebige Signed URLs.

> Hinweis: Die Admin-Ansichten für Anfragen und Bewerbungen sind noch getrennte
> Komponenten (`AdminInbox`/`AdminJobs`). Kommt „Termine" als dritter Typ dazu,
> lohnt sich eine Generalisierung (eine Liste + ein Detail-Panel, per Typ-Config).

## Änderungsprotokoll

| Datum | Was | Warum |
|---|---|---|
| 2026-07-23 | Etappe 1: Login + Dashboard + Anfragen-Verwaltung (Function, Migration, Frontend) | Betreiber-Backoffice; Anfragen waren nur per Formular-Eingang sichtbar |
| 2026-07-23 | Etappe 2: Bewerbungen — Karriere-Seite + Formular (urra-apply, privater CV-Bucket) und Admin-Ansicht mit CV-Download | „Bewerbungen einsehen" aus der ursprünglichen Anfrage; Eingang gab es bei Urra noch nicht |
