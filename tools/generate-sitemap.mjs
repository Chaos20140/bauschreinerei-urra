/**
 * Erzeugt public/sitemap.xml aus den Routen der App.
 *
 * Die Projekt-Slugs werden direkt aus src/data/content.ts gelesen, damit die
 * Sitemap nicht veraltet, sobald ein Projekt hinzukommt. Aufruf über
 * `npm run sitemap` — im Build-Workflow läuft das automatisch vor `vite build`.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const ORIGIN = 'https://chaos20140.github.io';
const BASE = '/bauschreinerei-urra/';

/** Statische Routen mit Priorität und Änderungsfrequenz. */
const ROUTES = [
  { path: '', priority: '1.0', changefreq: 'monthly' },
  { path: 'leistungen', priority: '0.9', changefreq: 'monthly' },
  { path: 'projekte', priority: '0.9', changefreq: 'monthly' },
  { path: 'partner', priority: '0.6', changefreq: 'yearly' },
  { path: 'ueber-uns', priority: '0.7', changefreq: 'yearly' },
  { path: 'kontakt', priority: '0.9', changefreq: 'yearly' },
  { path: 'impressum', priority: '0.2', changefreq: 'yearly' },
  { path: 'datenschutz', priority: '0.2', changefreq: 'yearly' },
];

const content = readFileSync(join(root, 'src', 'data', 'content.ts'), 'utf8');
const slugs = [...content.matchAll(/^\s*slug:\s*'([^']+)'/gm)].map((m) => m[1]);

if (slugs.length === 0) {
  console.error('Keine Projekt-Slugs in content.ts gefunden — bitte prüfen.');
  process.exit(1);
}

const today = new Date().toISOString().slice(0, 10);

const urls = [
  ...ROUTES,
  ...slugs.map((slug) => ({
    path: `projekte/${slug}`,
    priority: '0.7',
    changefreq: 'yearly',
  })),
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    // Abschließender Schrägstrich: GitHub Pages liefert die vorgerenderten
    // Routen als Verzeichnisse aus; ohne Schrägstrich antwortet jede URL
    // zuerst mit einem 301. Die Sitemap soll direkt auf die 200er zeigen.
    (u) => `  <url>
    <loc>${ORIGIN}${BASE}${u.path ? `${u.path}/` : ''}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

writeFileSync(join(root, 'public', 'sitemap.xml'), xml, 'utf8');
console.log(`sitemap.xml geschrieben — ${urls.length} URLs (davon ${slugs.length} Projekte)`);
