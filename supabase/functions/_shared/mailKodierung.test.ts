// Tests der Mail-Kodierung.
//
// Der eigentliche Beweis ist der Rundlauf: Was kodiert wird, muss nach dem
// Dekodieren ZEICHENGENAU wieder herauskommen. Genau daran ist der Kodierer
// der Bibliothek gescheitert — aus „—" wurde „â", und im Postfach standen
// Reste wie „=20".

import test from 'node:test';
import assert from 'node:assert/strict';
import { base64Utf8, betreffAscii, umbrucheBase64 } from './mailKodierung.ts';

const CR = String.fromCharCode(13);
const LF = String.fromCharCode(10);
/** Alle Steuerzeichen inklusive CR, LF und Loeschzeichen. */
const STEUERZEICHEN = /[\u0000-\u001F\u007F]/;
const NICHT_ASCII_T = /[^\x00-\x7F]/;

/** Dekodiert so, wie es ein Postfach tut. */
function dekodiere(b64MitUmbruechen: string): string {
  const roh = b64MitUmbruechen.replace(/\r\n/g, '');
  const binaer = Buffer.from(roh, 'base64');
  return new TextDecoder().decode(binaer);
}

test('Rundlauf: Text kommt zeichengenau wieder heraus', () => {
  const proben = [
    'Hallo Welt',
    'Grüße aus Olsberg — Fenster & Türen',
    'Ein sehr langer Text, '.repeat(200),
    '<p style="color:#fff">Anführungszeichen „so" und Gedankenstrich —</p>',
    'Emoji 🚪🪟 und Sonderzeichen: ÄÖÜäöüß€@=',
    '',
  ];
  for (const p of proben) {
    assert.equal(dekodiere(umbrucheBase64(base64Utf8(p))), p, `Rundlauf kaputt: ${p.slice(0, 40)}`);
  }
});

test('keine Zeile ist laenger als 76 Zeichen', () => {
  const lang = umbrucheBase64(base64Utf8('x'.repeat(5000)));
  for (const zeile of lang.split('\r\n')) {
    assert.ok(zeile.length <= 76, `Zeile zu lang: ${zeile.length}`);
  }
});

test('kodierter Text enthaelt nur base64-Zeichen', () => {
  // Genau das schuetzt vor dem Fehler der Bibliothek: Es gibt keine
  // "=XX"-Folgen mehr, die ein Zeilenumbruch zerreissen koennte.
  const kodiert = umbrucheBase64(base64Utf8('Grüße — Fenster & Türen')).replace(/\r\n/g, '');
  assert.match(kodiert, /^[A-Za-z0-9+/]*={0,2}$/);
});

test('reine ASCII-Betreffs bleiben unveraendert', () => {
  assert.equal(betreffAscii('Neue Anfrage: Jonas Weber'), 'Neue Anfrage: Jonas Weber');
  assert.equal(betreffAscii('Testnachricht von urra-fenster.de'), 'Testnachricht von urra-fenster.de');
});

test('Betreff mit Umlaut wird gueltig kodiert', () => {
  const b = betreffAscii('Neue Anfrage: Jörg Müller');

  // Reines ASCII — sonst greift der fehlerhafte Kodierer der Bibliothek.
  assert.ok(!/[^\x00-\x7F]/.test(b), 'Betreff ist nicht reines ASCII');
  // Darf NICHT mit "=?" beginnen, sonst kodiert die Bibliothek doppelt.
  assert.ok(!b.startsWith('=?'), 'Betreff beginnt mit =? und wuerde doppelt kodiert');
  // Der Klartext-Vorspann bleibt lesbar.
  assert.ok(b.startsWith('Neue Anfrage:'), b);

  // Und das kodierte Wort ergibt wieder den Originalnamen.
  const treffer = b.match(/=\?utf-8\?B\?([^?]+)\?=/);
  assert.ok(treffer, 'kein kodiertes Wort gefunden');
  assert.equal(Buffer.from(treffer[1], 'base64').toString('utf8'), 'Jörg Müller');
});

test('kodiertes Wort enthaelt nie ein Leerzeichen', () => {
  // Genau dieser Fehler der Bibliothek zerriss die Betreffzeile: Nach RFC 2047
  // darf ein kodiertes Wort keinen Leerraum enthalten.
  for (const name of ['Jörg Müller', 'Anne-Sophie Bär Löwenstein', 'Đorđević Šimić']) {
    const b = betreffAscii(`Neue Anfrage: ${name}`);
    const treffer = b.match(/=\?utf-8\?B\?([^?]+)\?=/);
    assert.ok(treffer, `kein kodiertes Wort: ${b}`);
    assert.ok(!treffer[1].includes(' '), `Leerzeichen im kodierten Wort: ${b}`);
  }
});

test('Betreff ohne ASCII-Vorspann erzeugt keine ungueltige Zeile', () => {
  const b = betreffAscii('Ärger');
  assert.ok(!/[^\x00-\x7F]/.test(b), 'nicht reines ASCII');
  assert.ok(!b.startsWith('=?'), 'wuerde doppelt kodiert');
});

test('Betreff laesst keine Kopfzeilen-Einschleusung zu', () => {
  // Der Name kommt vom Besucher und landet im Betreff. Enthaelt er einen
  // Zeilenumbruch, waere die Kopfzeile dort zu Ende und alles Folgende wuerde
  // als eigene Kopfzeile gelesen — etwa ein "Bcc:" an eine fremde Adresse.
  const boese = [
    'Hans' + CR + LF + 'Bcc: fremd@example.com',
    'Hans' + LF + 'X-Beliebig: 1',
    'Hans' + CR + 'Subject: gefaelscht',
    'Hans' + String.fromCharCode(0) + 'Nullbyte',
    'Hans' + String.fromCharCode(127) + 'Loeschzeichen',
  ];
  for (const name of boese) {
    const b = betreffAscii(`Neue Anfrage: ${name}`);
    assert.ok(!STEUERZEICHEN.test(b), `Steuerzeichen im Betreff: ${JSON.stringify(b)}`);
  }
});

test('Betreff bleibt auch mit Umlaut UND Umbruch unbedenklich', () => {
  const b = betreffAscii('Neue Anfrage: Jörg' + CR + LF + 'Bcc: fremd@example.com');
  assert.ok(!STEUERZEICHEN.test(b), `Steuerzeichen im Betreff: ${JSON.stringify(b)}`);
  assert.ok(!NICHT_ASCII_T.test(b), 'nicht reines ASCII');
});
