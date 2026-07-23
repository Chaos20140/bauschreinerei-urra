/**
 * Legt für jede Route eine echte index.html in dist/ ab.
 *
 * Warum: GitHub Pages kennt keine SPA-Rewrites. Bisher fing public/404.html
 * jeden Deep-Link ab und leitete per Query-Parameter auf die Startseite um —
 * für Besucher funktioniert das, Suchmaschinen bekommen dabei aber für JEDE
 * Unterseite den Status 404 und indexieren sie nicht. Mit einer echten
 * dist/kontakt/index.html antwortet GitHub Pages mit 200.
 *
 * Titel und Description werden pro Route direkt in die Kopie geschrieben, damit
 * auch Crawler ohne JavaScript-Ausführung (u. a. viele Social-Media-Bots) die
 * richtigen Angaben sehen. Der useDocumentMeta-Hook überschreibt sie im Browser
 * anschließend ohnehin mit denselben Werten.
 *
 * Die 404.html-Mechanik bleibt als Fallback für unbekannte URLs erhalten.
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const ORIGIN = 'https://chaos20140.github.io';
const BASE = '/bauschreinerei-urra/';

const ROUTES = [
  {
    path: 'leistungen',
    title: 'Leistungen · Fenstermontage nach EnEV | Bauschreinerei Urra',
    description:
      'Beratung, digitales Aufmaß, Demontage und Entsorgung sowie RAL-zertifizierte Fachmontage nach EnEV — alles aus einer Hand aus Olsberg im Sauerland.',
  },
  {
    path: 'projekte',
    title: 'Projekte · Referenzen aus dem Sauerland | Bauschreinerei Urra',
    description:
      'Ausgeführte Fenster- und Türprojekte aus Privatbau, Gewerbe und Industrie — vom Bogenfenster im Sondermaß bis zur kompletten Glasfassade.',
  },
  {
    path: 'partner',
    title: 'Partner · Hersteller und Systeme | Bauschreinerei Urra',
    description:
      'Mit welchen Herstellern wir arbeiten: Profilsysteme, Beschläge und Antriebe von Marken, die wir seit Jahren im Sauerland verbauen.',
  },
  {
    path: 'ueber-uns',
    title: 'Über uns · Handwerk aus Olsberg seit 2003 | Bauschreinerei Urra',
    description:
      'Inhabergeführte Bauschreinerei aus Olsberg: Heribert Urra fertigt und montiert seit 2003 Fenster, Türen und Garagentore im Sauerland.',
  },
  {
    path: 'kontakt',
    title: 'Kontakt · Angebot anfragen | Bauschreinerei Urra Olsberg',
    description:
      'Bauschreinerei Urra, Am Ochsenberg 13 in 59939 Olsberg. Telefon, E-Mail, WhatsApp oder Anfrageformular — wir melden uns werktags binnen 24 Stunden.',
  },
  {
    path: 'impressum',
    title: 'Impressum · Bauschreinerei Urra',
    description:
      'Anbieterkennzeichnung nach § 5 DDG: Bauschreinerei Heribert Urra, Am Ochsenberg 13, 59939 Olsberg.',
  },
  {
    path: 'datenschutz',
    title: 'Datenschutzerklärung · Bauschreinerei Urra',
    description:
      'Wie wir mit Ihren Daten umgehen: Hosting, Kontaktformular, Google Maps mit Zwei-Klick-Lösung, lokal gehostete Schriften und Ihre Rechte nach DSGVO.',
  },
];

const escapeHtml = (s) =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

const indexPath = join(dist, 'index.html');
if (!existsSync(indexPath)) {
  console.error('dist/index.html fehlt — bitte zuerst `vite build` ausführen.');
  process.exit(1);
}

const template = readFileSync(indexPath, 'utf8');

// Projekt-Detailseiten aus content.ts nachziehen
const content = readFileSync(join(root, 'src', 'data', 'content.ts'), 'utf8');
const projects = [...content.matchAll(/slug:\s*'([^']+)',\s*\n\s*title:\s*'([^']+)'/g)];
for (const [, slug, title] of projects) {
  ROUTES.push({
    path: `projekte/${slug}`,
    title: `${title} · Projekt | Bauschreinerei Urra`,
    description: `Projekt „${title}" der Bauschreinerei Urra aus Olsberg — Fenster, Türen und Sonderlösungen im Sauerland.`,
  });
}

let written = 0;

for (const route of ROUTES) {
  // Mit Schrägstrich — siehe Kommentar in tools/generate-sitemap.mjs.
  const url = `${ORIGIN}${BASE}${route.path}/`;
  const title = escapeHtml(route.title);
  const description = escapeHtml(route.description);

  const html = template
    // Der Frame-Preload gilt nur der Scroll-Sequenz der Startseite. Auf allen
    // anderen Routen lädt er rund 216 KB, die nie benutzt werden — Chrome
    // warnt darüber zu Recht in der Konsole.
    .replace(/\s*<link\s+rel="preload"[^>]*frames[^>]*>/g, '')
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${title}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
      `<meta name="description" content="${description}" />`
    )
    .replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
      `<link rel="canonical" href="${url}" />`
    )
    .replace(
      /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:title" content="${title}" />`
    )
    .replace(
      /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
      `<meta property="og:url" content="${url}" />`
    );

  const dir = join(dist, ...route.path.split('/'));
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, 'index.html'), html, 'utf8');
  written++;
}

console.log(`Vorgerendert: ${written} Routen als echte index.html (HTTP 200 statt 404)`);
