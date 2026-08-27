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

// WICHTIG: Der Hash wird ueber die Fassung mit LF-Zeilenenden gebildet —
// genau so, wie die Datei im Repository liegt und im Build ausgeliefert wird.
// Auf Windows checkt Git die Datei mit CRLF aus; wuerde der Hash darueber
// berechnet, passte er lokal, aber NICHT auf dem Linux-Runner der CI. Genau
// das ist am 27.08.2026 passiert: Die Live-Seite blockierte ihr eigenes
// Boot-Script, weil der eingetragene Hash aus einer CRLF-Fassung stammte.
const scriptLf = match[1].split('\r\n').join('\n');
const hash = 'sha256-' + createHash('sha256').update(scriptLf, 'utf8').digest('base64');
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
