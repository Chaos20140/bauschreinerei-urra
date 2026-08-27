// Kodierung für den Mailversand — bewusst ohne Deno-Abhängigkeiten, damit die
// Funktionen unter Node getestet werden können.
//
// Hintergrund: Der quoted-printable-Kodierer von denomailer 1.6.0 ist
// fehlerhaft. Er zerschneidet stur alle 74 Zeichen und korrigiert dabei nur den
// Anfang des nächsten Stücks, nicht dessen Ende. Trifft ein Schnitt mitten in
// eine Folge wie "=C3=BC" (ü) oder "=3D" (=), gehen Zeichen verloren — im
// Postfach erscheinen dann Reste wie "=20". Das betrifft jede Mail über ~74
// Zeichen, also alle.
//
// Deshalb kodieren wir selbst, und zwar mit base64: Dort steht jedes Zeichen
// für sich, ein Zeilenumbruch kann nichts zerreißen.

const NICHT_ASCII = /[^\x00-\x7F]/;

/** UTF-8-Text nach base64. `btoa` allein beherrscht nur Latin-1. */
export function base64Utf8(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binaer = "";
  for (const b of bytes) binaer += String.fromCharCode(b);
  return btoa(binaer);
}

/**
 * Bricht base64 auf 76 Zeichen je Zeile um (RFC 2045).
 *
 * Anders als bei quoted-printable ist das gefahrlos: Jedes base64-Zeichen steht
 * für sich, ein Umbruch kann keine Folge zerreißen.
 */
export function umbrucheBase64(b64: string): string {
  const zeilen: string[] = [];
  for (let i = 0; i < b64.length; i += 76) zeilen.push(b64.slice(i, i + 76));
  return zeilen.join("\r\n");
}

/**
 * Macht die Betreffzeile zu reinem ASCII nach RFC 2047.
 *
 * Auch für Kopfzeilen greift der fehlerhafte Kodierer, und er lässt zusätzlich
 * Leerzeichen im kodierten Wort stehen — nach RFC 2047 unzulässig, weshalb
 * Postfächer den Betreff zerrissen darstellen. Eine bereits reine ASCII-Zeile
 * reicht die Bibliothek dagegen unverändert durch.
 *
 * Der ASCII-Vorspann („Neue Anfrage:") bleibt bewusst unkodiert: Beginnt die
 * Zeile mit "=?", kodiert die Bibliothek ein zweites Mal.
 */
export function betreffAscii(roh: string): string {
  // ZUERST alle Steuerzeichen entfernen. Der Betreff enthaelt den vom
  // Besucher eingegebenen Namen und wird unveraendert als Kopfzeile
  // geschrieben. Ein Zeilenumbruch darin wuerde die Kopfzeile beenden und
  // erlauben, eigene Kopfzeilen (etwa "Bcc:") anzuhaengen — die Mail ginge
  // dann zusaetzlich an Fremde. Das hier ist die letzte Instanz vor dem
  // Versand und gilt daher fuer jeden Aufrufer.
  const betreff = roh.replace(/[\u0000-\u001F\u007F]/g, " ").replace(/ {2,}/g, " ").trim();

  if (!NICHT_ASCII.test(betreff)) return betreff;

  // Am letzten Leerzeichen vor dem ersten Sonderzeichen trennen — ein
  // kodiertes Wort muss durch Leerraum vom Klartext getrennt stehen.
  const idx = betreff.search(NICHT_ASCII);
  const schnitt = betreff.lastIndexOf(" ", idx);

  if (schnitt > 0) {
    const kopf = betreff.slice(0, schnitt);
    const rest = betreff.slice(schnitt + 1);
    return `${kopf} =?utf-8?B?${base64Utf8(rest)}?=`;
  }

  // Kein ASCII-Vorspann vorhanden (bei unseren Betreffs nie der Fall):
  // Sonderzeichen ersetzen, statt eine Zeile zu erzeugen, die mit "=?" beginnt
  // und dadurch ein zweites Mal kodiert würde.
  return betreff.normalize("NFD").replace(/[\u0300-\u036F]/g, "").replace(/[^\x00-\x7F]/g, "?");
}
