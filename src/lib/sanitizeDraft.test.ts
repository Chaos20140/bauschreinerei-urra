// Unit-Tests der clientseitigen Entwurfs-Filterung. Laufen unter Node:
//   node --test src/lib/sanitizeDraft.test.ts
// (Node ≥ 22 strippt die TS-Typen.)

import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeDraft } from './sanitizeDraft.ts';

test('erlaubte Auszeichnungen bleiben erhalten', () => {
  assert.equal(sanitizeDraft('Ganz <b>fett</b>'), 'Ganz <b>fett</b>');
  assert.equal(sanitizeDraft('<strong>x</strong>'), '<strong>x</strong>');
  assert.equal(sanitizeDraft('<em>y</em> und <i>z</i>'), '<em>y</em> und <i>z</i>');
  assert.equal(sanitizeDraft('Zeile<br>Zeile'), 'Zeile<br>Zeile');
  assert.equal(sanitizeDraft('Zeile<br />Zeile'), 'Zeile<br>Zeile');
});

test('Skripte werden entschärft', () => {
  const out = sanitizeDraft('<script>alert(1)</script>');
  assert.ok(!out.includes('<script'), out);
  assert.ok(!/<\/script>/i.test(out), out);
});

test('Ereignis-Attribute überleben nicht', () => {
  for (const roh of [
    '<img src=x onerror="alert(1)">',
    '<div onmouseover=alert(1)>x</div>',
    '<b onclick="alert(1)">fett</b>',
  ]) {
    const out = sanitizeDraft(roh);
    assert.ok(!/onerror|onmouseover|onclick/i.test(out), `${roh} → ${out}`);
  }
});

test('gefährliche Link-Ziele fallen weg, sichere bleiben', () => {
  // javascript:, data:, vbscript: und protokollrelative Adressen sind raus.
  for (const boese of [
    '<a href="javascript:alert(1)">klick</a>',
    '<a href="data:text/html,<script>alert(1)</script>">klick</a>',
    '<a href="vbscript:msgbox">klick</a>',
    '<a href="//fremdhost.example/pfad">klick</a>',
  ]) {
    const out = sanitizeDraft(boese);
    assert.ok(!out.includes('<a '), `${boese} → ${out}`);
    assert.ok(out.includes('klick'), `Text soll bleiben: ${out}`);
  }

  for (const gut of [
    '<a href="https://example.com">x</a>',
    '<a href="mailto:a@b.de">x</a>',
    '<a href="tel:+4916099116995">x</a>',
    '<a href="/kontakt">x</a>',
    '<a href="#anker">x</a>',
  ]) {
    assert.ok(sanitizeDraft(gut).includes('<a href='), `sollte bleiben: ${gut}`);
  }
});

test('sichere Links bekommen rel/target', () => {
  const out = sanitizeDraft('<a href="https://example.com">x</a>');
  assert.ok(out.includes('rel="noopener noreferrer"'), out);
  assert.ok(out.includes('target="_blank"'), out);
});

test('unbekannte Tags verlieren die Auszeichnung, der Text bleibt', () => {
  assert.equal(sanitizeDraft('<div>Hallo</div>'), 'Hallo');
  assert.equal(sanitizeDraft('<span style="x">Text</span>'), 'Text');
  assert.equal(sanitizeDraft('<h1>Titel</h1>'), 'Titel');
});

test('kaufmännisches Und wird korrekt maskiert, aber nicht doppelt', () => {
  assert.equal(sanitizeDraft('Fenster & Türen'), 'Fenster &amp; Türen');
  // Bereits maskiert: bleibt so, wird nicht zu &amp;amp;
  assert.equal(sanitizeDraft('Fenster &amp; Türen'), 'Fenster &amp; Türen');
});

test('Umlaute und normaler Text bleiben unverändert', () => {
  assert.equal(sanitizeDraft('Größe, Öffnung, Türen'), 'Größe, Öffnung, Türen');
  assert.equal(sanitizeDraft(''), '');
});

test('mehrfaches Anwenden ändert nichts mehr (idempotent)', () => {
  for (const roh of ['<b>x</b>', 'A & B', '<a href="/kontakt">x</a>', '<script>y</script>']) {
    const einmal = sanitizeDraft(roh);
    assert.equal(sanitizeDraft(einmal), einmal, `nicht idempotent: ${roh}`);
  }
});
