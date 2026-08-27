// SMTP-Versand für die Benachrichtigungen der Website.
//
// Bewusst über den Postfach-Anbieter des Betriebs (GMX) statt über einen
// Drittdienst: Absender und versendender Server gehören dann zusammen, was
// SPF/DKIM erfüllt und die Mails aus dem Spam-Ordner hält. Ein fremder
// Versanddienst mit derselben Absenderadresse würde ohne zusätzliche
// DNS-Einträge oft als Fälschung eingestuft.
//
// Zugangsdaten ausschließlich aus Secrets — nie im Repository.

import { SMTPClient } from "https://deno.land/x/denomailer@1.6.0/mod.ts";

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
export async function sendeMail(a: MailAuftrag): Promise<{ ok: boolean; fehler?: string }> {
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
      subject: a.betreff,
      content: a.text,
      html: a.html,
      replyTo: a.antwortAn,
    });

    return { ok: true };
  } catch (e) {
    // Nur ins Log, nie zum Aufrufer: Die Meldung kann Hostnamen und
    // Kontodetails enthalten.
    console.error("mail: Versand fehlgeschlagen:", e instanceof Error ? e.message : e);
    return { ok: false, fehler: "versand_fehlgeschlagen" };
  } finally {
    try {
      await client?.close();
    } catch { /* Verbindung war schon zu */ }
  }
}
