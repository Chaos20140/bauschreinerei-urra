# CLAUDE.md — Bauschreinerei Urra Website

> Persönliche Anleitung für Claude. Vor jedem Prompt durchgehen, nach jedem Prompt fortschreiben.

## Auftrag in einem Satz
Eine moderne, schwarz-weiße Single-Page-Site für **Bauschreinerei Urra** (Olsberg) im Securify-Hero-Stil, mit scroll-getriebener Bildsequenz aus 50 Frames als 3D-Hintergrundanimation und Inhalten von urra-fenster.de.

## Tech-Stack
- React 18 + TypeScript (strict)
- Vite (Dev: `npm run dev`, Build: `npm run build`)
- Tailwind CSS 3 (Utility-First, keine eigenen CSS-Dateien außer `index.css`)
- Font: **Readex Pro** (300/400/500/600/700)
- Keine externen UI-Libraries, keine Animation-Frameworks (selber bauen mit `requestAnimationFrame`)

## Verzeichnislayout (Soll)
```
/
├── CLAUDE.md                  ← diese Datei
├── package.json
├── vite.config.ts             ← Security-Header für Dev-Server
├── tailwind.config.js
├── postcss.config.js
├── index.html                 ← Meta-Tags, Font-Preload
├── public/
│   └── frames/
│       └── frame-001.jpg … frame-050.jpg
└── src/
    ├── main.tsx
    ├── App.tsx                ← Komposition aller Sektionen
    ├── index.css              ← Tailwind-Layer + hero-title Klasse
    ├── data/
    │   └── content.ts         ← Single Source of Truth für alle Texte
    └── components/
        ├── Hero.tsx
        ├── Navbar.tsx
        ├── ScrollSequence.tsx ← Canvas-basierte Bildsequenz
        ├── Services.tsx
        ├── About.tsx
        └── Contact.tsx
```

## Designprinzipien
- **Farbpalette**: pures Schwarz `#000`, Weiß `#fff`, `neutral-900`, Weiß-Opacities (40/70/90). **Kein Lila, kein Indigo, keine Gradients in der Brand-Sprache.**
- **Typografie**: Alles **lowercase** in den Headlines (wie im Securify-Vorbild). Sub-Texte normal in deutscher Rechtschreibung.
- **Sprache**: Deutsch (Inhalte stammen von urra-fenster.de).
- **Layout**: Asymmetrisch, gestaffelte Headline-Wörter, schräge Divider, große negative Flächen.
- **Bewegung**: Eine einzige starke Animation — die Scroll-Sequenz. Keine Mikro-Animationen außer Hover-Transitions (`text-white` / `bg-neutral-200`).

## Scroll-Sequenz (Kern-Feature)
- 50 JPG-Frames in `public/frames/frame-001.jpg` … `frame-050.jpg`
- Implementierung in `ScrollSequence.tsx` über **Canvas + requestAnimationFrame**
- Alle Bilder einmalig vorladen (Promise.all), dann am Canvas zeichnen
- Scroll-Position → Frame-Index Mapping mit `IntersectionObserver`/`scroll`-Event auf einem `sticky`-Container mit hoher virtueller Höhe (z. B. `300vh`)
- Innerhalb dieses Containers ist die Hero-Sektion `position: sticky; top: 0`
- Reduziertes Bewegungsbedürfnis respektieren (`prefers-reduced-motion`) → erstes Frame statisch anzeigen

## Inhalte (Quelle: urra-fenster.de)
- **Firmenname**: Bauschreinerei Urra
- **Slogan**: „Qualität ist kein Zufall, sie ist das Ergebnis harter Arbeit, kluger Planung und ehrlicher Leidenschaft."
- **Gründung**: 2003, inhabergeführt, Sitz Olsberg
- **Hauptprodukte**: Fenster (Kunststoff/Aluminium/Holz), Haustüren, Innentüren, Schiebetüren, Garagentore
- **Dienstleistungen**: Demontage & Entsorgung, Beratung & Aufmaß (mit metiscale-App), Fachmontage nach EnEV-Standard
- **Servicegebiete**: Sauerland, Ostwestfalen-Lippe, Ruhrgebiet
- **Kontakt**:
  - Adresse: Am Ochsenberg 13, 59939 Olsberg
  - Telefon: +49 160 99116995
  - E-Mail: h.urra@bauschreinerei-urra.de
- **USPs**: RAL-Montage, EnEV-Konformität, Rundum-Service, regionale Expertise

Alle Texte zentral in `src/data/content.ts` halten — niemals in Komponenten hartkodieren.

## Hero-Layout (Securify-Schema, an Urra angepasst)
- Statt „protect/your/data" → **„fenster / und / türen"**
- Statt „we can guarding your data…" → Slogan oder kurze Urra-Beschreibung
- Stat-Blöcke: „seit 2003" / „3 regionen" / „100% handwerk" (aus Inhalt ableitbar)
- Navbar-Links: „leistungen", „über uns", „projekte", „kontakt"
- CTA-Button: „termin anfragen"

## Sicherheit (Pflicht)
- **Keine** `dangerouslySetInnerHTML`, keine `eval`, keine inline `onclick`-Strings
- **Keine** externen Scripts außer Google Fonts via `<link>`
- E-Mail/Telefon als `mailto:` / `tel:` — kein Form-Submit an Drittserver ohne Backend
- `rel="noopener noreferrer"` bei jedem externen Link
- Security-Header in `vite.config.ts` (X-Frame-Options, X-Content-Type-Options, Referrer-Policy, Permissions-Policy)
- Meta-CSP-Tag im Build (kein `unsafe-inline` ohne Not)
- Keine User-Eingaben werden auf dieser statischen Seite verarbeitet → XSS-Vektor sehr klein, aber Eingaben (falls Formular) müssen via Backend laufen
- Bilder lokal liegen, kein Hotlinking → kein Mixed Content
- Dependencies minimal halten, regelmäßig `npm audit`

## Code-Hygiene (vor jedem Commit prüfen)
1. Sind alle Texte in `src/data/content.ts`? Keine Magic-Strings in JSX?
2. Gibt es ungenutzte Imports / Variablen / Komponenten? Entfernen.
3. TypeScript strict: keine `any`, keine `@ts-ignore`.
4. Werden Listen mit stabilen Keys gerendert (nicht `index`)?
5. `useEffect`-Cleanups vorhanden, wenn Event-Listener oder rAF im Spiel sind?
6. Tailwind-Klassen logisch geordnet (Layout → Spacing → Typo → Farbe → State)?
7. Keine doppelten Komponenten / Hilfsfunktionen?
8. `npm run lint` (tsc) durchlaufen lassen, bevor als fertig deklariert wird.

## Was NICHT tun
- Keine Backend-Anbindung erfinden (kein Newsletter-API, keine fake Endpoints)
- Keine Statistiken erfinden, die nicht auf urra-fenster.de stehen
- Keine Lorem Ipsum / Platzhalter — wenn Inhalt fehlt, lieber knapp halten
- Keine zusätzlichen Animationen außer der Scroll-Sequenz
- Keine fremde Farbe in die Brand-Sprache einführen

## Definition of Done (für jede Iteration)
- [ ] Site lädt ohne Console-Errors
- [ ] Scroll-Sequenz läuft flüssig auf 60fps
- [ ] Hero-Layout matched Securify-Vorbild strukturell
- [ ] Texte stammen 1:1 aus content.ts
- [ ] `npm run build` erfolgreich
- [ ] Keine `console.log` im Code
- [ ] CLAUDE.md ist auf dem aktuellen Stand

## Bekannte offene Punkte / npm audit
- `npm audit` meldet 2 moderate Findings in `esbuild` (transitive Dep von Vite 5). Betrifft ausschließlich den Dev-Server (Cross-Origin-Request auf den lokalen HMR-Port). Produktions-Build ist nicht betroffen.
- Auto-fix würde Vite auf 8.x heben (Breaking Change). **Nicht automatisch upgraden** — beim nächsten geplanten Maintenance-Window prüfen.
- Mitigation: Dev-Server bindet ausschließlich an `127.0.0.1` (siehe `vite.config.ts`), also nicht extern erreichbar.

## Änderungsprotokoll
- **2026-05-20**
  - Projekt initialisiert. Vite 5 + React 18 + TS strict + Tailwind 3.
  - 50 JPG-Frames (1.5 MB total) nach `public/frames/` kopiert und auf `frame-NNN.jpg` umbenannt.
  - Inhalte von urra-fenster.de (Startseite, /ueber-uns, /dienstleistungen, /kontakt) extrahiert und nach `src/data/content.ts` konsolidiert.
  - Komponenten gebaut: `Logo`, `Navbar`, `ScrollSequence` (Canvas+rAF mit Easing), `Hero` (Sticky 300vh), `Services`, `Products`, `About`, `Regions`, `Contact`, `Footer`.
  - Security-Header in `vite.config.ts` (X-Frame-Options DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy) und HTML-Meta-Tags.
  - `prefers-reduced-motion` wird respektiert (statisches Frame 1).
  - Dev-Server lokal verifiziert, Hero + Services + About + Contact + Footer manuell im Browser bestätigt (1440×900).
  - `npm run build` erfolgreich, 161 KB JS / 14 KB CSS gzipped 51 KB / 4 KB.
- **2026-05-22**
  - Bildqualität: Canvas auf `imageSmoothingQuality: 'high'` gesetzt, leichter CSS-Filter `contrast(1.05) saturate(1.06)` aufs Canvas. Großflächiger Dimming-Layer (`bg-black/30`) ersetzt durch sanften Verlauf `from-black/10 via-transparent to-black/40`, damit das Bild klarer wirkt.
  - Hero-Scroll-Strecke von 300vh auf 400vh erhöht.
  - **Globaler Hintergrund-Refactor**: Canvas läuft jetzt als `position: fixed inset-0 z-0` hinter der gesamten Seite — die Bildsequenz bleibt beim Scrollen permanent sichtbar, statt nach dem Hero schwarz zu werden.
    - `App.tsx` besitzt jetzt Frame-Laden (`useFrames`), Scroll-Progress-Tracking und Reduce-Motion-Check.
    - `Hero.tsx` ist auf reines Layout entkernt (Navbar + Headlines + Stats), keine Scroll-/Canvas-Logik mehr.
    - Folge-Sektionen sind halbtransparent: Services/About `bg-black/65`, Products/Regions `bg-black/55`, Contact `bg-black/70`, Footer `bg-black/90` — jeweils mit `backdrop-blur-md` für Lesbarkeit.
  - Auflösungs-Hinweis: Quellbilder sind nur 1280×720. Auf FullHD wird Faktor 1.25 hochskaliert, auf 4K Faktor 3. Maximale Schärfe erfordert höherauflösende Quell-Frames.
  - **Scroll-Mapping geändert**: Frame-Index wird jetzt aus dem gesamten Dokument-Scroll berechnet (`window.scrollY / (scrollHeight - innerHeight)`), nicht mehr nur aus dem Hero-Bereich. Die Bildsequenz läuft kontinuierlich beim Scrollen durch die ganze Seite. Hero ist wieder eine normale `h-screen`-Sektion ohne Sticky-Wrapper.
  - **Verdunkelung komplett entfernt**: Alle `bg-black/XX`-Layer und `backdrop-blur` aus den Folge-Sektionen raus, Hero-Gradient-Overlay raus. Das Video ist jetzt 100 % sichtbar hinter allen Inhalten. Text-Opacities leicht erhöht (von /70 auf /80, /50 auf /60) für bessere Lesbarkeit auf bewegtem Hintergrund.
  - **Blur-Reveal-Animation**: `motion` v12.40 als Dependency. Neue Komponente `src/components/BlurIn.tsx` mit `whileInView` — Texte starten mit `filter: blur(18px)`, `opacity: 0`, `y: 28px` und animieren beim Scroll-in zu Klartext. Eingesetzt in Hero (mit gestaffelten Delays für die drei Headline-Wörter und Stat-Blöcke) und in allen Folge-Sektionen (Section-Header, Body-Blöcke, List-Items mit Stagger via `delay={idx * 0.1}`). Animation dauert 0.9s, Ease-Curve `[0.22, 1, 0.36, 1]`, läuft nur einmal (`once: true`).
  - **Bildsequenz durch echtes MP4 ersetzt**: Die 50 JPG-Frames + `ScrollSequence.tsx` sind weg. Stattdessen `public/background.mp4` (5.2 MB, 2560×1440, 10s) und neue Komponente `src/components/ScrollVideo.tsx`. Video ist pausiert, `currentTime` wird per rAF + Easing (Faktor 0.2) an den Scroll-Progress gekoppelt — Scrubbing wie zuvor, nur jetzt 2K-Schärfe statt hochskaliertem 720p. Datei liegt unter `public/background.mp4` und wird via Vite ohne Hashing ausgeliefert.
  - **Zurück zur Canvas-Sequenz (Performance)**: HTML5-Video-Scrubbing ruckelt im Browser, weil bei jedem `currentTime`-Set vom nächsten Keyframe dekodiert werden muss. Lösung: aus dem 2K-MP4 wurden mit `ffmpeg-static` 100 JPG-Frames bei FullHD (1920×1080, q=3) extrahiert (`ffmpeg -i background.mp4 -vf "fps=10,scale=1920:1080:flags=lanczos" -q:v 3`). `ScrollSequence.tsx` ist wieder die aktive Komponente (Canvas + rAF mit Easing 0.18), `ScrollVideo.tsx` und das MP4 sind entfernt. Frames belegen jetzt ca. 12 MB im `public/frames/`-Ordner, dafür ist das Scrubbing wieder butterweich.
  - **Zoom-In + 2K-Re-Extraktion**: Frames neu aus dem Original-MP4 (`C:\Users\Tolun\Downloads\video_mp_upscaled.mp4`) gezogen mit `crop=iw*0.84:ih*0.84` (16 % zentrierter Zoom-in, 8 % von jedem Rand) — frisst das AI-Wasserzeichen unten rechts. Ausgabe bei 2200×1238 (≈ nativer Cropped-Region, kein Upsampling) und q=3. Total ~16 MB für 100 Frames. Sichtbar schärfer auf größeren Monitoren. Quell-MP4 bleibt im Downloads-Ordner für künftige Re-Extraktionen.
  - **Hero komplett restrukturiert**: Vom verstreuten Securify-3-Wort-Stagger auf eine klare Magazin-Komposition mit drei horizontalen Bändern:
    - **TOP**: Brand-Zeile „bauschreinerei urra · olsberg · seit 2003" in kleinem Tracking-`[0.4em]`-Caps.
    - **MITTE**: Zwei-zeilige Headline `fenster.\nund türen.` links-bündig (`text-[15vw] md:text-[10vw]`, `leading-[0.88]`), direkt darunter die Beschreibung als gedeckter Lead-Text.
    - **BOTTOM**: Stats horizontal als Reihe (3 Werte mit kleinen Caps-Labels) + Scroll-Indikator rechts.
    - Subtile vertikale Gradient-Overlays oben (`rgba(0,0,0,0.45) → 0`) und unten (`rgba(0,0,0,0.55) → 0`) für Lesbarkeit der Top-/Bottom-Bänder, ohne die Bildmitte zu verdunkeln.
  - **Lesbarkeit über bewegtem Hintergrund**: `.hero-title` bekommt globalen `text-shadow: 0 2px 24px rgba(0,0,0,0.45)` (Big-Headlines), Body-Text in `main` (`p, li, a, h3, span`) bekommt `text-shadow: 0 1px 12px rgba(0,0,0,0.65)` für saubere Lesbarkeit auf dem Video — kein neuer Dim-Layer. Zusätzlich Canvas-Filter auf `contrast(1.08) saturate(1.08) brightness(0.82)` — leichte 18-%-Brightness-Reduktion des Bilds selbst (nicht als Overlay), damit weißer Text auf hellen Frame-Bereichen (Fensterglas, Himmel) zuverlässig steht.
  - **GitHub-Pages-Deployment**:
    - Repo: https://github.com/Chaos20140/bauschreinerei-urra (public)
    - Live: https://chaos20140.github.io/bauschreinerei-urra/
    - `vite.config.ts` setzt `base: '/bauschreinerei-urra/'` wenn `GITHUB_PAGES=true` (CI), sonst `/` (lokal).
    - `App.tsx`: `BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}` — automatisch korrekter Pfad für lokal vs. Pages.
    - `ScrollSequence.tsx`: Frame-Pfade nutzen `BASE_URL` als Prefix.
    - SPA-Deep-Link-Fix: `public/404.html` + Inline-Boot-Script in `index.html` (Pattern aus rafgraph/spa-github-pages) — Pages routet unbekannte Pfade auf `404.html`, das script-redirected mit dem Original-Pfad in der Query-String, das Boot-Script in `index.html` stellt die URL wieder her bevor React bootet.
    - GitHub-Action `.github/workflows/deploy.yml`: läuft auf push:main, baut mit `GITHUB_PAGES=true`, kopiert `404.html` ins `dist/`, lädt das Artefakt mit `actions/upload-pages-artifact@v3` hoch, deployt via `actions/deploy-pages@v4`.
    - `gh` CLI 2.92 wurde lokal installiert. Erste OAuth hatte nur `repo`-Scope → Push der Workflow-Datei wurde abgewiesen, daher `gh auth refresh -s workflow` nachgereicht. Token-Scopes jetzt: `gist`, `read:org`, `repo`, `workflow`.
    - Erstdeploy: Build 27s + Deploy 11s. Live-URL geprüft (Home + Deep-Link `/impressum` direkt aufgerufen).
  - **Multi-Page-Refactor + Mobile-Burger + Cookie-Banner**:
    - `react-router-dom@6.28` + `lucide-react` als Dependencies. `BrowserRouter` in `App.tsx`, 7 Routes: `/`, `/leistungen`, `/projekte`, `/ueber-uns`, `/kontakt`, `/impressum`, `/datenschutz` (Catch-all `*` → HomePage).
    - Neue Pages unter `src/pages/`: `HomePage` (übernimmt die Scroll-Video-Sequenz und alle Marketing-Sektionen), plus 6 dedizierte Sub-Pages mit eigener Komposition (Hero, Kategorien-Karten, Werte-Listen, Process-Schritte, CTA).
    - Wiederverwendbare Bausteine: `PageHero` (Eyebrow + Breadcrumb + Headline + Intro), `CtaBlock` (Anruf-CTA + Link zum Kontaktformular), `ScrollToTop` (scrollt bei jedem Routenwechsel nach oben).
    - **Navbar** jetzt global, `fixed top-0 z-40`, mit `NavLink`-Active-States und mobilem Burger-Menü via `lucide-react`-Icons + `motion`-Stagger-Animation. Body-Scroll wird beim offenen Menü gesperrt.
    - **Footer** global, mit Brand-Tagline, Page-Navigation, Kontaktdaten und Legal-Links.
    - **CookieBanner**: `motion`-Slide-in von unten, DSGVO-konformer Text, „Nur notwendige" / „Alle akzeptieren" Buttons, Persistenz in `localStorage` unter Key `urra-cookie-consent`. Verlinkt zur Datenschutzerklärung.
    - Inhalte für Impressum (TMG §5, EU-OS-Hinweis, Haftungs- und Urheberrechts-Disclaimer) und Datenschutz (DSGVO-konforme 9 Abschnitte inkl. Google-Fonts-Hinweis, Server-Logs, Cookies, Nutzerrechte) in `src/data/legal.ts`.
    - Touch-Targets ≥ 44 px, alle Sub-Pages mit konsistentem Grid (`md:col-span-X`), Tailwind-Breakpoints durchgängig nach Mobile-First.
    - Verifiziert: Desktop 1440×900 (Hero, Leistungen, Impressum, Cookie-Banner) **und** Mobile 390×844 (Hero gestackt, Burger-Menü Vollbild, Cookie-Banner gestackte Buttons).
  - **Mobile-Performance-Fix (v1, verworfen)**: Statisches CSS-Background-Image auf Mobile statt Canvas. Funktionierte, aber Nutzer wollte das Video auch auf dem Handy sehen.
  - **Mobile-Canvas v2 (aktuell)**: Eigene **mobile-Frame-Sequenz** in [public/frames-mobile/](public/frames-mobile/) — 100 Frames bei `scale=1080:608`, `q=4` (~4.6 MB statt 16 MB der Desktop-Frames). `useFrames(folder)` akzeptiert nun den Folder-Parameter. `ScrollSequenceCanvas` ist um drei Props erweitert: `maxDpr` (Mobile 1.5 statt Desktop 2), `easing` (Mobile 0.3 statt 0.18 — snappier), `bgPositionY` (Mobile 0.35 — verschiebt das 16:9-Frame nach oben damit die Tür auf Portrait-Viewports zentriert sitzt). Resultat: Canvas-Pixel-Aufwand auf Mobile ca. ein Viertel der vorherigen Last, Scrubbing läuft flüssig. ffmpeg-Befehl: `ffmpeg -i video_mp_upscaled.mp4 -vf "fps=10,crop=iw*0.84:ih*0.84,scale=1080:608:flags=lanczos" -q:v 4 frame-%03d.jpg`.
