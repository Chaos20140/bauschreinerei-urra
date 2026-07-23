/**
 * Berechnet den sha256-Hash des Inline-Boot-Scripts in index.html und trägt
 * ihn in die Content-Security-Policy ein.
 *
 * Hintergrund: GitHub Pages kann keine Response-Header setzen, deshalb steht
 * die CSP als <meta http-equiv> in index.html. Ein Inline-Script ist unter
 * strikter CSP nur erlaubt, wenn sein exakter Inhalt als Hash in script-src
 * steht — jede Änderung am Script (auch Whitespace) invalidiert den Hash.
 *
 * Aufruf: npm run csp:hash
 */
import { createHash } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'index.html');
const html = readFileSync(file, 'utf8');

const match = html.match(/<script data-csp-hashed>([\s\S]*?)<\/script>/);
if (!match) {
  console.error(
    'Kein <script data-csp-hashed> in index.html gefunden — CSP-Hash kann nicht berechnet werden.'
  );
  process.exit(1);
}

const hash = 'sha256-' + createHash('sha256').update(match[1]).digest('base64');
const hashSlot = /'sha256-[A-Za-z0-9+/=]+'/;

if (!hashSlot.test(html)) {
  console.error(
    'Kein sha256-Eintrag in der CSP gefunden — bitte script-src in index.html prüfen.'
  );
  process.exit(1);
}

const updated = html.replace(hashSlot, `'${hash}'`);

if (updated === html) {
  // Kein Fehler: das Inline-Script wurde nicht verändert, der Hash stimmt noch.
  console.log('CSP-Hash unverändert:', hash);
} else {
  writeFileSync(file, updated, 'utf8');
  console.log('CSP-Hash aktualisiert:', hash);
}
