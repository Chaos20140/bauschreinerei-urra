// SMTP-Versand für die Benachrichtigungen der Website.
//
// Bewusst über den Postfach-Anbieter des Betriebs (GMX) statt über einen
// Drittdienst: Absender und versendender Server gehören dann zusammen, was
// SPF/DKIM erfüllt und die Mails aus dem Spam-Ordner hält. Ein fremder
// Versanddienst mit derselben Absenderadresse würde ohne zusätzliche
// DNS-Einträge oft als Fälschung eingestuft.
//
// Zugangsdaten ausschließlich aus Secrets — nie im Repository.
//
// WICHTIG — warum hier von Hand kodiert wird:
// Der quoted-printable-Kodierer von denomailer 1.6.0 ist fehlerhaft. Er
// zerschneidet die Zeilen stur alle 74 Zeichen und korrigiert dabei nur den
// Anfang des nächsten Stücks, nicht dessen Ende. Trifft ein Schnitt mitten in
// eine Folge wie "=C3=BC" (ü) oder "=3D" (=), gehen Zeichen verloren und im
// Postfach erscheinen Reste wie "=20". Nachweisbar bei jeder Mail über ~74
// Zeichen, also bei allen.
//
// Ausweg: Wir übergeben den Inhalt fertig kodiert als `mimeContent`. Diesen
// Weg reicht die Bibliothek unverändert durch (client.ts: writeCmd), der
// kaputte Kodierer wird nie aufgerufen. Als Verfahren dient base64 — es kennt
// keine Sonderzeichen-Folgen, die ein Zeilenumbruch zerreißen könnte.

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";
import { base64Utf8, betreffAscii, umbrucheBase64 } from "./mailKodierung.ts";

const HOST = Deno.env.get("SMTP_HOST") || "";
const PORT = Number(Deno.env.get("SMTP_PORT") || "465");
const USER = Deno.env.get("SMTP_USER") || "";
const PASS = Deno.env.get("SMTP_PASSWORD") || "";
// Absender: muss beim Anbieter zum Konto gehören, sonst weist er ab.
const FROM = Deno.env.get("SMTP_FROM") || USER;
// Empfänger der Benachrichtigungen (Betreiber).
const TO = Deno.env.get("MAIL_TO") || USER;

export const mailKonfiguriert = Boolean(HOST && USER && PASS);

export type MailAuftrag = {
  betreff: string;
  html: string;
  text: string;
  /** Abweichender Empfänger (Standard: Betreiber). */
  an?: string;
  /** Antwortadresse — bei Anfragen die des Absenders. */
  antwortAn?: string;
};

/**
 * Verschickt eine Mail. Wirft NIE — der Aufrufer soll deswegen nie eine
 * Anfrage verlieren: Der Datensatz ist zu diesem Zeitpunkt bereits gespeichert,
 * eine fehlgeschlagene Benachrichtigung darf den Vorgang nicht scheitern lassen.
 */
export async function sendeMail(a: MailAuftrag): Promise<{ ok: boolean; fehler?: string; detail?: string }> {
  if (!mailKonfiguriert) return { ok: false, fehler: "nicht_konfiguriert" };

  let client: SMTPClient | null = null;
  try {
    client = new SMTPClient({
      connection: {
        hostname: HOST,
        port: PORT,
        // Port 465 spricht von Beginn an TLS, 587 startet unverschlüsselt und
        // handelt per STARTTLS hoch. Beides verschlüsselt, nur verschiedene
        // Verfahren — die Bibliothek erwartet die Unterscheidung explizit.
        tls: PORT === 465,
        auth: { username: USER, password: PASS },
      },
    });

    await client.send({
      from: FROM,
      to: a.an || TO,
      subject: betreffAscii(a.betreff),
      replyTo: a.antwortAn,
      // Kein `content`/`html` übergeben — beides liefe durch den fehlerhaften
      // Kodierer. Die Reihenfolge zählt: Bei multipart/alternative zeigt das
      // Postfach den LETZTEN Teil an, den es darstellen kann.
      mimeContent: [
        {
          mimeType: 'text/plain; charset="utf-8"',
          content: umbrucheBase64(base64Utf8(a.text)),
          transferEncoding: "base64",
        },
        {
          mimeType: 'text/html; charset="utf-8"',
          content: umbrucheBase64(base64Utf8(a.html)),
          transferEncoding: "base64",
        },
      ],
    });

    return { ok: true };
  } catch (e) {
    // Nur ins Log, nie zum Aufrufer: Die Meldung kann Hostnamen und
    // Kontodetails enthalten.
    console.error("mail: Versand fehlgeschlagen:", e instanceof Error ? e.message : e);
    return { ok: false, fehler: "versand_fehlgeschlagen", detail: String(e instanceof Error ? e.message : e).slice(0, 300) };
  } finally {
    try {
      await client?.close();
    } catch { /* Verbindung war schon zu */ }
  }
}
