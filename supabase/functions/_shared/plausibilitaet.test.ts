// Tests der Plausibilitätsprüfungen. Laufen unter Node:
//   node --test supabase/functions/_shared/plausibilitaet.test.ts
//
// Wichtigster Teil sind die Gegenproben: Eine echte Anfrage darf NIE abgelehnt
// werden. Ein durchgelassener Spam kostet den Betrieb Sekunden — eine
// abgewiesene echte Anfrage kostet einen Auftrag.

import test from 'node:test';
import assert from 'node:assert/strict';
import {
  emailUnbrauchbar,
  linkAnzahl,
  nameUnbrauchbar,
  pruefeVerdacht,
  wortAnzahl,
} from './plausibilitaet.ts';

test('echte Namen werden NICHT abgelehnt', () => {
  for (const n of [
    'Heribert Urra',
    'Ng',
    "D'Angelo",
    'Đorđević',
    'Müller-Lüdenscheidt',
    'Anne Marie von der Heide',
    'José Ángel Peña',
    'O’Brien',
    'Şiyar Güneş',
    'Dr. Katharina Weiß',
  ]) {
    assert.equal(nameUnbrauchbar(n), false, `faelschlich abgelehnt: ${n}`);
  }
});

test('offensichtlich unbrauchbare Namen werden abgelehnt', () => {
  for (const n of [
    '',
    'a',
    '12345',
    'aaaaaa',
    '......',
    '<script>alert(1)</script>',
    'http://spam.example',
    'www.spam.example',
    'spam@example.com',
  ]) {
    assert.equal(nameUnbrauchbar(n), true, `haette abgelehnt werden muessen: ${n}`);
  }
});

test('echte E-Mail-Adressen werden NICHT abgelehnt', () => {
  for (const e of [
    'h.urra@bauschreinerei-urra.de',
    'urra-heribert@gmx.de',
    'a.b.c@sub.domain.co.uk',
    'vorname+filter@example.org',
    'müller@münchen.de',
    'x_y@firma-name.com',
  ]) {
    assert.equal(emailUnbrauchbar(e), false, `faelschlich abgelehnt: ${e}`);
  }
});

test('kaputte E-Mail-Adressen werden abgelehnt', () => {
  for (const e of [
    'ohne-at.de',
    '@example.de',
    'name@',
    'name@ohne-endung',
    'name@example.d',
    'name@@example.de',
    '.name@example.de',
    'name.@example.de',
    'na..me@example.de',
    'name@example..de',
    'name@-example.de',
    'name@example.de-',
    'na me@example.de',
    'name@example.12',
  ]) {
    assert.equal(emailUnbrauchbar(e), true, `haette abgelehnt werden muessen: ${e}`);
  }
});

test('normale Anfragen gelten NICHT als verdaechtig', () => {
  const echt = [
    'Guten Tag,\n\nwir möchten unsere Fenster austauschen lassen. Können Sie uns ein Angebot machen?\n\nMit freundlichen Grüßen',
    'Hallo, ich bräuchte eine neue Haustür. Wann hätten Sie Zeit für ein Aufmaß?',
    'Sehr geehrte Damen und Herren, bitte um Rückruf unter 0160 1234567. Danke!',
    'Mehr Infos auf unserer Seite www.mein-bauvorhaben.de — dort sind Fotos.',
  ];
  for (const m of echt) {
    const v = pruefeVerdacht('Max Beispiel', m);
    assert.equal(v.verdaechtig, false, `faelschlich verdaechtig: ${m.slice(0, 40)} → ${v.gruende}`);
  }
});

test('typische Massennachrichten werden markiert', () => {
  const spam = pruefeVerdacht(
    'Werbung',
    'Besuchen Sie http://a.com und http://b.net sowie www.c.org für Angebote!'
  );
  assert.equal(spam.verdaechtig, true);
  assert.ok(spam.gruende.some((g) => g.includes('Links')));

  const schreien = pruefeVerdacht('Test', 'GROSSARTIGES ANGEBOT NUR HEUTE FUER SIE JETZT ZUGREIFEN SOFORT');
  assert.equal(schreien.verdaechtig, true);

  const wiederholung = pruefeVerdacht('Test', 'Hallo!!!!!!!!!!!!!!!!!!!! Bitte melden');
  assert.equal(wiederholung.verdaechtig, true);

  const nurName = pruefeVerdacht('Max Beispiel', 'max beispiel');
  assert.equal(nurName.verdaechtig, true);
});

test('Hilfsfunktionen zaehlen richtig', () => {
  assert.equal(wortAnzahl('eins zwei  drei\nvier'), 4);
  assert.equal(wortAnzahl('   '), 0);
  assert.equal(linkAnzahl('siehe http://a.de und www.b.de'), 2);
  assert.equal(linkAnzahl('kein Link hier'), 0);
});

test('Namen mit Steuerzeichen werden abgelehnt', () => {
  // Zeilenumbrüche im Namen sind der Hebel für Kopfzeilen-Einschleusung.
  const CR = String.fromCharCode(13);
  const LF = String.fromCharCode(10);
  for (const n of ['Hans' + CR + LF + 'Bcc: fremd@example.com',
                   'Hans' + LF + 'X-Beliebig: 1',
                   'Hans' + String.fromCharCode(0) + 'Null',
                   'Hans' + String.fromCharCode(127)]) {
    assert.equal(nameUnbrauchbar(n), true, `haette abgelehnt werden muessen: ${JSON.stringify(n)}`);
  }
});

test('normale Namen bleiben trotz der neuen Pruefung erlaubt', () => {
  for (const n of ['Heribert Urra', 'Anne-Marie von der Heide', "D'Angelo", 'Şiyar Güneş']) {
    assert.equal(nameUnbrauchbar(n), false, `faelschlich abgelehnt: ${n}`);
  }
});
