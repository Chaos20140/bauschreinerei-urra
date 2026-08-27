// Responsive E-Mail-Vorlage im Urra-Design.
//
// E-Mail-HTML ist nicht Web-HTML: Outlook rendert mit Word, Gmail entfernt
// <style>-Blöcke teilweise, viele Clients kennen kein Flexbox/Grid. Deshalb
// bewusst altmodisch:
//   - Tabellen-Layout statt div/flex
//   - Alle wichtigen Angaben INLINE am Element (überleben das Strippen)
//   - max-width 600px, darunter fluid — das ist die Breite, die auf jedem
//     Handy ohne Zoom lesbar bleibt
//   - `word-break` + `overflow-wrap` an jeder Textzelle: lange E-Mail-Adressen
//     oder URLs sprengen sonst die Tabelle und laufen über den Rand hinaus
//   - Schriftgrößen >= 14px; iOS zoomt kleinere Schrift automatisch und
//     zerschießt damit das Layout

/** Schützt vor HTML-Einschleusung: Nutzereingaben landen in der Mail. */
export function esc(s: unknown): string {
  return String(s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type MailZeile = { label: string; wert: string; link?: string };

const MARKE = "#111111";
const RAND = "#e5e5e5";
const GEDECKT = "#6b7280";
const SCHRIFT =
  "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif";

/** Eine Beschriftungs-/Wert-Zeile. Bricht auf schmalen Displays um. */
function zeile(z: MailZeile): string {
  const wert = z.link
    ? `<a href="${esc(z.link)}" style="color:${MARKE};text-decoration:underline;word-break:break-word;overflow-wrap:anywhere;">${esc(z.wert)}</a>`
    : esc(z.wert);
  return `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid ${RAND};font-family:${SCHRIFT};">
        <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${GEDECKT};margin-bottom:4px;">${esc(z.label)}</div>
        <div style="font-size:16px;line-height:1.5;color:${MARKE};word-break:break-word;overflow-wrap:anywhere;">${wert}</div>
      </td>
    </tr>`;
}

export type MailInhalt = {
  titel: string;
  vorspann: string;
  zeilen: MailZeile[];
  /** Freitext (Nachricht/Anschreiben) — Umbrüche bleiben erhalten. */
  nachricht?: { label: string; text: string };
  aktion?: { label: string; href: string };
  fussnote?: string;
};

export function renderMail(i: MailInhalt): string {
  const nachricht = i.nachricht
    ? `
      <tr>
        <td style="padding:22px 0 0 0;font-family:${SCHRIFT};">
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:${GEDECKT};margin-bottom:8px;">${esc(i.nachricht.label)}</div>
          <div style="font-size:16px;line-height:1.6;color:${MARKE};background:#fafafa;border:1px solid ${RAND};border-radius:10px;padding:16px;white-space:pre-wrap;word-break:break-word;overflow-wrap:anywhere;">${esc(i.nachricht.text)}</div>
        </td>
      </tr>`
    : "";

  const aktion = i.aktion
    ? `
      <tr>
        <td style="padding:24px 0 0 0;font-family:${SCHRIFT};">
          <a href="${esc(i.aktion.href)}" style="display:inline-block;background:${MARKE};color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:13px 26px;border-radius:999px;">${esc(i.aktion.label)}</a>
        </td>
      </tr>`
    : "";

  const fussnote = i.fussnote
    ? `<div style="margin-top:10px;">${esc(i.fussnote)}</div>`
    : "";

  return `<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="x-apple-disable-message-reformatting">
<meta name="color-scheme" content="light">
<title>${esc(i.titel)}</title>
<style>
  /* Nur als Zugabe — die Darstellung steht auch ohne diesen Block. */
  @media only screen and (max-width:620px) {
    .huelle { padding:16px 12px !important; }
    .karte  { padding:22px 18px !important; border-radius:12px !important; }
    .titel  { font-size:21px !important; }
  }
  a { color:${MARKE}; }
</style>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;">
  <!-- Vorschautext: erscheint in der Nachrichtenliste, nicht im Text selbst -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(i.vorspann)}</div>

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f4f4f5;">
    <tr>
      <td class="huelle" align="center" style="padding:28px 16px;">

        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0"
               style="width:100%;max-width:600px;background:#ffffff;border:1px solid ${RAND};border-radius:16px;">
          <tr>
            <td class="karte" style="padding:30px 30px 34px 30px;">

              <div style="font-family:${SCHRIFT};font-size:12px;letter-spacing:.16em;text-transform:uppercase;color:${GEDECKT};">
                Bauschreinerei Urra
              </div>
              <div class="titel" style="font-family:${SCHRIFT};font-size:24px;line-height:1.25;font-weight:700;color:${MARKE};margin:8px 0 6px 0;word-break:break-word;">
                ${esc(i.titel)}
              </div>
              <div style="font-family:${SCHRIFT};font-size:15px;line-height:1.55;color:${GEDECKT};margin-bottom:20px;word-break:break-word;">
                ${esc(i.vorspann)}
              </div>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="width:100%;border-top:1px solid ${RAND};table-layout:fixed;">
                ${i.zeilen.map(zeile).join("")}
                ${nachricht}
                ${aktion}
              </table>

            </td>
          </tr>
        </table>

        <div style="font-family:${SCHRIFT};font-size:12px;line-height:1.6;color:#9ca3af;max-width:600px;margin:16px auto 0 auto;text-align:center;word-break:break-word;">
          Automatisch erzeugt von urra-fenster.de${fussnote}
        </div>

      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Reine Text-Fassung — für Clients ohne HTML und gegen Spam-Einstufung. */
export function renderText(i: MailInhalt): string {
  const teile = [
    i.titel,
    "".padEnd(i.titel.length, "="),
    "",
    i.vorspann,
    "",
    ...i.zeilen.map((z) => `${z.label}: ${z.wert}`),
  ];
  if (i.nachricht) teile.push("", `${i.nachricht.label}:`, i.nachricht.text);
  if (i.aktion) teile.push("", `${i.aktion.label}: ${i.aktion.href}`);
  teile.push("", "— Automatisch erzeugt von urra-fenster.de");
  return teile.join("\n");
}
