# Verwaltungsmodus — Bau-Referenz

> Passwortgeschützter Admin-Bereich unter `/admin` mit fünf Modulen: **Anfragen**,
> **Bewerbungen**, **Mediathek**, **Seiten & Menü** und **Seite bearbeiten**
> (Texte + Bilder direkt auf der Website).
>
> **Termine bewusst nicht enthalten** (Entscheidung des Betreibers, Juli 2026):
> Termine laufen weiter über Anfrage und Telefon. Wer das später nachrüstet,
> beachte den Hinweis am Ende des Bewerbungs-Kapitels zur Generalisierung.
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

## Seite bearbeiten — Inline-Editor (Etappe 3)

Der Betreiber ändert Texte direkt auf der Website. Muster von Cura Doma.

- **Mechanik:** `<Editable id="home.hero.desc">…</Editable>` umschließt einen
  Text. Normal zeigt er den Code-Text (content.ts) oder — falls vorhanden —
  den gespeicherten Override. Im Bearbeiten-Modus wird er `contentEditable`.
- **Bearbeiten-Modus** startet aus der Admin-Kachel „Seite bearbeiten"
  (`enterEditMode(pw)` + Navigation auf `/`). Das Passwort liegt dabei nur im
  Speicher des `ContentProvider`. Eine schwebende `EditToolbar` zeigt Zähler,
  Speichern und Verlassen.
- **Speichern** läuft über urra-admin `save-content` (passwortgeschützt): jeder
  Wert wird per Escape-First-Allowlist sanitisiert (nur fett/kursiv/Umbruch/
  sichere Links überleben) → kein Stored XSS. `reset-content` löscht einen
  Override, dann greift wieder der Code-Text.
- **Lesen:** Der öffentliche Client lädt die Overrides per leichtem REST-Abruf
  (`site_content`, öffentliche SELECT-Policy) — kein supabase-js im Startpfad.
- **Datenmodell:** `site_content` (key/value), RLS an, öffentlich lesbar, kein
  anon-Write (Schreiben nur Service-Role in der Function).
- **Reichweite Runde 1:** editierbare Texte auf allen Hauptseiten (Start,
  Leistungen, Projekte, Über uns, Karriere, Kontakt) — 136 Felder. Bilder,
  Blöcke und Rechtsseiten sind bewusst außen vor (spätere Runden).

> `dangerouslySetInnerHTML` wird ausschließlich in `Editable.tsx` genutzt und
> nur mit serverseitig sanitisierten Werten — das ist der bewusste, sichere Fall.

### Markierung im Bearbeiten-Modus (index.css)

Die editierbaren Stellen sind an eigenen CSS-Regeln erkennbar (`[data-ed-id]`,
`[data-ed-img]`), **nicht** an Tailwind-Weiß-Utilities: alle Unterseiten laufen
im Beige-Theme, dort war die frühere `outline-white/40`-Markierung unsichtbar.
Blau gestrichelt = bearbeitbar, Grün durchgezogen = geändert; beide Töne werden
unter `main[data-theme='beige']` nachgezogen, damit der Kontrast auf Schwarz UND
auf Creme sitzt. Die EditToolbar zeigt dieselbe Legende.

> Wichtig: `Editable` setzt `data-ed-id` **nur** im Bearbeiten-Modus. Im DOM
> normaler Besucher existiert keine dieser Markierungen.

## Seiten & Menü (Etappe 5)

Verwaltet, wie die Seiten im Hauptmenü erscheinen — **ohne eigenen
Backend-Endpunkt**: gespeichert wird in denselben `site_content`-Overrides wie
die Texte, also mit derselben Passwortprüfung, Sanitisierung und ID-Validierung.

- **Verwaltbar:** Beschriftung, Reihenfolge, Sichtbarkeit im Menü.
  Schlüssel je Seite (`key` = Pfad ohne Schrägstrich):
  `nav.<key>.label`, `nav.<key>.hidden` (`"1"`), `nav.<key>.order` (10, 20, 30 …).
- **Nicht verwaltbar:** die Seiten selbst. Routen stehen in `App.tsx` — eine
  ausgeblendete Seite bleibt über ihre Adresse erreichbar und indexierbar
  (live geprüft), sie steht nur nicht mehr im Menü.
- **Nur Abweichungen werden gespeichert.** Entspricht ein Wert wieder dem Code,
  wird der Override gelöscht (`reset-content`) statt geschrieben — so greifen
  spätere Code-Änderungen wieder durch und die Tabelle bleibt sauber.
  „Auf Standard zurücksetzen" + Speichern leert alle `nav.*`-Schlüssel.
- **Leser:** `useNavItems()` in `src/lib/nav.ts`; genutzt von Navbar (Desktop +
  Mobil), Footer und der 404-Seite. `plainLabel()` macht aus dem sanitisierten
  Rich-Text wieder reinen Text (`&amp;` → `&`) — ohne DOM, damit es auch beim
  Vorrendern funktioniert. Labels werden als React-Textknoten gerendert, nie
  als HTML.
- **Schutz:** Speichern ist blockiert, wenn kein einziger Menüpunkt sichtbar
  bliebe. Impressum und Datenschutz stehen fest im Fuß und sind nicht
  ausblendbar (Pflichtangaben).

## Editor Runde 2 — Reichweite

Zusätzlich editierbar: Projekt-Detailseiten (Projektname und Kurzbeschreibung
teilen sich die IDs mit der Projektliste — einmal geändert, steht überall
dasselbe; Abschnittsbeschriftungen wie „Eckdaten"/„Galerie" gelten für alle
Projektseiten gemeinsam), Partner-Seite, 404-Seite, Footer sowie **Impressum
und Datenschutz** zeilenweise.

> Rechtsseiten: der Betreiber kann sie ändern und trägt dafür die
> Verantwortung.

## Kontaktdaten und Servicegebiet (Etappe 6)

Telefon, E-Mail und Adresse sind editierbar — mit einer Regel, die den Grund
für die frühere Sperre auflöst: **die Links werden aus dem bearbeiteten Wert
abgeleitet, nie separat gepflegt.**

- `src/lib/siteData.ts` — `useContactInfo()` liefert Anzeigewert **und**
  `tel:`/`mailto:`/Karten-Link. Die Nummer wird auf `^\+?\d{5,20}$` geprüft, die
  E-Mail auf ein striktes Muster; fällt die Prüfung durch, greift der Wert aus
  dem Code (lieber der alte funktionierende Link als ein toter).
- **Eine ID pro Angabe, überall dieselbe** (`contact.phone`, `contact.email`,
  `contact.street`, `contact.city`, `contact.cta`, `contact.callcta`). Vorher
  hatte die Startseite eigene Schlüssel (`home.contact.phone.value`) — Start-
  und Kontaktseite wären auseinandergelaufen.
- `StructuredDataSync` schreibt Telefon, E-Mail und Adresse in den
  schema.org-Block im Seitenkopf, damit Google nicht die alte Nummer meldet.
  Der Block ist `application/ld+json`, also kein ausführbares Script — die CSP
  ist davon nicht betroffen.
- `MapEmbed` baut Karte und Route aus derselben Adresse.
- Servicegebiet: `useRegionAreas()` mit gemeinsamen IDs
  (`regions.area<i>.title`, `regions.area<i>.city<j>`) für Start-, Projekte- und
  Kontaktseite.

> Offen bleibt: die **Öffnungszeiten** im schema.org-Block. Der Anzeigetext ist
> editierbar, `openingHoursSpecification` in `index.html` nicht — freien Text
> („nach Vereinbarung") verlässlich in Zeitangaben zurückzuübersetzen ist
> unzuverlässig. Bei einer dauerhaften Änderung der Öffnungszeiten also auch
> `index.html` anfassen.

## Bearbeiten-Leiste und Mediathek (Etappe 6)

- **Reiter am linken Bildschirmrand** statt Leiste unten (Muster: Cura Doma).
  Aufklappbar, mit Zähler, Rückgängig/Wiederherstellen (auch Strg+Z /
  Strg+Umschalt+Z), Speichern, Verwerfen, „Seite zurücksetzen", „SEO & Titel",
  Hilfe und Verlassen.
- **Verlauf** liegt im `ContentProvider` (Refs + `historyTick`), pro Feld
  zusammengefasst — ein Klick macht die ganze Feldänderung rückgängig, nicht
  Buchstabe für Buchstabe.
- **`seedVersion`**: Zähler, der `Editable` neu aufbauen lässt. Nötig bei
  Rückgängig/Verwerfen/Speichern. `Editable` setzt `key={id#seedVersion}` und
  erzwingt damit einen Neuaufbau — ohne den bliebe der von Hand getippte Text
  stehen, weil React die Eingabe im `contentEditable` nicht kennt und bei
  gleichem Sollwert nichts anfasst. Beim Speichern zusätzlich nötig, damit
  mehrfach verwendete Angaben (Telefonnummer) sofort überall gleich stehen.
- **„SEO & Titel"** überschreibt Titel und Beschreibung pro Route
  (`seo.<pfad>.title` / `.desc`, gelesen in `useDocumentMeta`).
- **Mediathek**: Bilder lassen sich dort direkt hochladen (Kachel „Mediathek",
  Knopf „Bild hochladen") und im Bearbeiten-Modus über den `ImagePicker`
  (Klick auf ein Bild) einsetzen.
  - `upload-image` mit `standalone: true` lädt **nur** in den Bucket und
    schreibt **keinen** `site_content`-Eintrag — sonst entstünde ein Override,
    der auf nichts zeigt.
  - `use-image` setzt ein vorhandenes Bild an einer Stelle ein. Die URL wird
    **serverseitig** aus dem Bucket gebaut und der Dateiname gegen
    `IMAGE_NAME_RE` geprüft; eine fremde Adresse kann so nicht in die Seite
    gelangen (live geprüft: `../`-Name → 400, unbekannter Name → 404).

## Änderungsprotokoll

| Datum | Was | Warum |
|---|---|---|
| 2026-07-23 | Etappe 1: Login + Dashboard + Anfragen-Verwaltung (Function, Migration, Frontend) | Betreiber-Backoffice; Anfragen waren nur per Formular-Eingang sichtbar |
| 2026-07-23 | Etappe 2: Bewerbungen — Karriere-Seite + Formular (urra-apply, privater CV-Bucket) und Admin-Ansicht mit CV-Download | „Bewerbungen einsehen" aus der ursprünglichen Anfrage; Eingang gab es bei Urra noch nicht |
| 2026-07-23 | Etappe 3: Inline-Editor „Seite bearbeiten" — site_content + save-content, ContentProvider/Editable/EditToolbar, 136 editierbare Texte auf allen Hauptseiten | Zweites Kernanliegen der ursprünglichen Anfrage („Seite vollständig bearbeiten") |
| 2026-07-24 | Etappe 6: Kontaktdaten/Öffnungszeiten/Städte/Menü-Beschriftungen editierbar (Links + schema.org werden abgeleitet, gemeinsame IDs), Bearbeiten-Leiste als Seitenreiter mit Rückgängig/Verwerfen/Zurücksetzen/SEO/Hilfe, Mediathek mit Upload und Bildauswahl (`use-image`, `standalone`-Upload) | Vom Betreiber gemeldet: mehrere sichtbare Stellen ließen sich nicht bearbeiten; Wunsch nach Bedienung wie bei Cura Doma und Bild-Vorrat in der Mediathek |
| 2026-07-24 | Etappe 5: „Seiten & Menü" (Beschriftung/Reihenfolge/Sichtbarkeit über site_content, kein neuer Endpunkt), Editor Runde 2 (Projekt-Detail, Partner, 404, Footer, Impressum, Datenschutz), Termine-Kachel entfernt, alle Kacheln aktiv | Restliche Module aus dem ursprünglichen Auftrag; Termine auf Wunsch gestrichen |
| 2026-07-24 | Markierung im Bearbeiten-Modus theme-sicher (eigene CSS-Regeln statt outline-white/40) + Legende in der EditToolbar | Auf den hellen Beige-Unterseiten war nicht erkennbar, welcher Text bearbeitbar ist (Meldung des Betreibers) |
| 2026-07-23 | Etappe 4: Bilder im Editor + Mediathek — öffentlicher Bucket site-images, urra-admin upload/list/delete-image, EditableImage, AdminMedia. Bild-Override als URL in site_content. Leistungen-Tools- und Projekt-Bilder austauschbar. CSP img-src um *.supabase.co erweitert (sonst blockte sie die hochgeladenen Bilder). Content-Type aus Magic-Bytes, nicht vom Client. | Erweiterung von „Seite bearbeiten" um Bilder (in Runde 1 bewusst ausgelassen) |
