// Unit-Tests der reinen Admin-Helfer. Laufen unter Node ohne Deno:
//   node --test supabase/functions/urra-admin/admin_util.test.ts
// (Node ≥ 22 strippt die TS-Typen; der Import zeigt auf ./admin_util.ts.)

import test from "node:test";
import assert from "node:assert/strict";
import {
  buildCsv,
  csvCell,
  isAdminStatus,
  isUuid,
  publicContactRecord,
  sanitizeNote,
} from "./admin_util.ts";

test("isUuid akzeptiert nur echte UUIDs", () => {
  assert.equal(isUuid("3f2504e0-4f89-41d3-9a0c-0305e82c3301"), true);
  assert.equal(isUuid("../../../etc/passwd"), false);
  assert.equal(isUuid("' OR 1=1 --"), false);
  assert.equal(isUuid(""), false);
  assert.equal(isUuid(42), false);
});

test("isAdminStatus akzeptiert nur die drei erlaubten Werte", () => {
  assert.equal(isAdminStatus("neu"), true);
  assert.equal(isAdminStatus("in_bearbeitung"), true);
  assert.equal(isAdminStatus("erledigt"), true);
  assert.equal(isAdminStatus("geloescht"), false);
  assert.equal(isAdminStatus("NEU"), false);
});

test("sanitizeNote deckelt die Länge und lässt Klartext unverändert", () => {
  assert.equal(sanitizeNote('Rückruf bis "Fr." <wichtig> & dringend'), 'Rückruf bis "Fr." <wichtig> & dringend');
  assert.equal(sanitizeNote("x".repeat(5000)).length, 2000);
  assert.equal(sanitizeNote(null), "");
  assert.equal(sanitizeNote(undefined), "");
});

test("csvCell verhindert Formel-Injection", () => {
  assert.equal(csvCell("=1+1"), "'=1+1");
  assert.equal(csvCell("+49 160 999"), "'+49 160 999");
  assert.equal(csvCell("-5"), "'-5");
  assert.equal(csvCell("@handle"), "'@handle");
  assert.equal(csvCell("harmlos"), "harmlos");
});

test("csvCell quotet Kommas, Anführungszeichen und Zeilenumbrüche (RFC 4180)", () => {
  assert.equal(csvCell("a,b"), '"a,b"');
  assert.equal(csvCell('sagt "hallo"'), '"sagt ""hallo"""');
  assert.equal(csvCell("Zeile1\nZeile2"), '"Zeile1\nZeile2"');
});

test("buildCsv fügt Kopf und Zeilen mit CRLF zusammen", () => {
  const csv = buildCsv(["A", "B"], [["1", "2"], ["x,y", "z"]]);
  assert.equal(csv, 'A,B\r\n1,2\r\n"x,y",z');
});

test("publicContactRecord entfernt honeypot und user_agent", () => {
  const rec = {
    id: "abc", name: "Max", email: "m@example.de",
    honeypot: "bot-eingabe", user_agent: "Mozilla/5.0 …",
  };
  const pub = publicContactRecord(rec);
  assert.equal(pub.name, "Max");
  assert.equal("honeypot" in pub, false);
  assert.equal("user_agent" in pub, false);
});
