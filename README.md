# Bauschreinerei Urra — Website

Marketing-Website der Bauschreinerei Heribert Urra (Olsberg, Sauerland).
Single-Page-App mit scroll-getriebener Bildsequenz als Hintergrund.

**Live:** https://urra-fenster.de

## Stack

React 18 · TypeScript (strict) · Vite 5 · Tailwind CSS 3 · React Router 6 ·
motion · Supabase (Bewertungen + Kontaktformular) · Deployment über GitHub Pages

## Entwicklung

```bash
npm ci
npm run dev      # http://127.0.0.1:5173
```

| Script | Zweck |
|---|---|
| `npm run dev` | Dev-Server |
| `npm run build` | Typecheck, Produktions-Build, Vorrendern der Routen |
| `npm run preview` | Gebautes `dist/` lokal ausliefern |
| `npm run lint` | TypeScript + ESLint |
| `npm run images` | Responsive Bildvarianten und OG-Bild erzeugen |
| `npm run sitemap` | `public/sitemap.xml` aus den Routen erzeugen |
| `npm run csp:hash` | CSP-Hash nach Änderung am Inline-Script neu berechnen |

## Konfiguration

`.env.local` anlegen (Vorlage: `.env.example`):

```
VITE_SUPABASE_URL=https://<projekt>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_…
```

Ohne diese Werte läuft die Seite weiterhin — der Bewertungs-Abschnitt entfällt
dann ersatzlos (bewusst: lieber keine Bewertungen als erfundene), redaktionelle
Änderungen aus dem Verwaltungsmodus greifen nicht, und das Kontaktformular zeigt
einen Hinweis mit Telefonnummer statt zu senden.

Im CI liegen dieselben Werte als GitHub-Repository-Secrets.

## Deployment

Push auf `main` löst `.github/workflows/deploy.yml` aus: Lint → Build →
Vorrendern → Artefakt-Prüfung → GitHub Pages. Der Build setzt
`GITHUB_PAGES=true`, wodurch Vite die Basis auf `/bauschreinerei-urra/` legt.

## Dinge, die man wissen sollte

**Deep-Links brauchen echte HTML-Dateien.** GitHub Pages kennt keine
SPA-Rewrites. `tools/prerender-routes.mjs` legt darum nach dem Build für jede
Route eine eigene `index.html` in `dist/` ab — sonst antwortet der Server auf
`/kontakt` mit HTTP 404 und Suchmaschinen indexieren die Unterseiten nicht.
`public/404.html` bleibt als Auffangnetz für unbekannte URLs.

**Die CSP steht als Meta-Tag in `index.html`** und enthält den sha256-Hash des
Inline-Boot-Scripts. Wird dieses Script geändert — auch nur ein Leerzeichen —
muss `npm run csp:hash` laufen, sonst blockiert der Browser es und die Seite
bleibt leer. `frame-ancestors` und HSTS lassen sich per Meta nicht setzen; die
Header in `vite.config.ts` gelten ausschließlich für den Dev-Server.

**Schriften werden lokal ausgeliefert** (`@fontsource-variable/readex-pro`).
Kein Google-Fonts-CDN — das überträgt die IP jedes Besuchers an Google und ist
in Deutschland abmahnfähig. Der Deploy-Workflow bricht ab, wenn wieder ein
Verweis auf `fonts.googleapis.com` im Build landet.

**Die Datenbank schützt allein die RLS-Policy.** Projekt-URL und Publishable
Key stehen im ausgelieferten Bundle. `supabase/policies.sql` enthält die
Policies inklusive Rate-Limit-Trigger; sie müssen im Supabase-Dashboard
ausgeführt sein, sonst kann jeder die Tabelle `contact_requests` auslesen oder
vollschreiben.

**Bildvarianten sind vorgeneriert.** Neue Projektfotos nach `public/projekte/`
legen und `npm run images` laufen lassen, sonst fehlen die `-800`/`-1200`/
`-1600`-Varianten und `ProjectImage` lädt ins Leere.

**Rohmaterial gehört nicht ins Repo.** `assets/`, `*.mp4` und `debug-*.png`
sind gitignored — sie liegen lokal, werden aber nicht versioniert.
