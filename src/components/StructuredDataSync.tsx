import { useEffect, useMemo } from 'react';
import { useContent } from '../lib/content';
import { plainText } from '../lib/plainText';
import { useContactInfo } from '../lib/siteData';

/**
 * Liest die bearbeitete Mo–Fr-Zeit („08:00 — 17:00") und macht daraus die
 * maschinenlesbaren Felder. Nur dieses eine Muster wird übersetzt: Angaben wie
 * „nach Vereinbarung" haben in `openingHoursSpecification` keine Entsprechung
 * und würden dort falsche Zusagen erzeugen. Passt der Text nicht, bleiben die
 * Werte aus dem Code stehen.
 */
function parseZeiten(text: string): { opens: string; closes: string } | null {
  const m = text.match(/(\d{1,2})[:.](\d{2})\s*[—–\-bis]+\s*(\d{1,2})[:.](\d{2})/i);
  if (!m) return null;
  const pad = (s: string) => s.padStart(2, '0');
  const opens = `${pad(m[1])}:${m[2]}`;
  const closes = `${pad(m[3])}:${m[4]}`;
  if (Number(m[1]) > 23 || Number(m[3]) > 23) return null;
  return { opens, closes };
}

/**
 * Hält den strukturierten Datenblock (schema.org) im Seitenkopf mit den
 * bearbeiteten Kontaktdaten in Deckung.
 *
 * Ohne das würde Google weiter die Nummer aus dem Code melden, während auf der
 * Seite längst eine andere steht — genau die Art stiller Abweichung, wegen der
 * die Kontaktdaten zuerst gar nicht editierbar waren.
 *
 * Rendert nichts. Der Block hat `type="application/ld+json"` und ist damit
 * kein ausführbares Script — das Ändern seines Inhalts berührt die
 * Content-Security-Policy nicht.
 */
export function StructuredDataSync() {
  const { phoneHref, email, street, zip, locality } = useContactInfo();
  const { get } = useContent();
  const zeitenRoh = get('kontakt.hours.value0');
  // useMemo, damit das Objekt zwischen Renders stabil bleibt — sonst liefe der
  // Effekt bei jedem Render erneut.
  const zeiten = useMemo(
    () => (zeitenRoh ? parseZeiten(plainText(zeitenRoh)) : null),
    [zeitenRoh]
  );

  useEffect(() => {
    const el = document.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"]'
    );
    if (!el?.textContent) return;

    try {
      const data = JSON.parse(el.textContent) as Record<string, unknown>;
      const address = (data.address ?? {}) as Record<string, unknown>;
      const telephone = phoneHref.replace(/^tel:/, '');
      const hours = (data.openingHoursSpecification ?? []) as Record<string, unknown>[];
      const mofr = hours[0] ?? null;

      const zeitenGleich =
        !zeiten || (mofr && mofr.opens === zeiten.opens && mofr.closes === zeiten.closes);
      const gleich =
        data.telephone === telephone &&
        data.email === email &&
        address.streetAddress === street &&
        address.postalCode === zip &&
        address.addressLocality === locality &&
        zeitenGleich;
      if (gleich) return;

      data.telephone = telephone;
      data.email = email;
      data.address = {
        ...address,
        streetAddress: street,
        postalCode: zip,
        addressLocality: locality,
      };
      // Nur den Mo–Fr-Eintrag anfassen, und nur wenn die Zeit lesbar war.
      if (zeiten && mofr) {
        data.openingHoursSpecification = [
          { ...mofr, opens: zeiten.opens, closes: zeiten.closes },
          ...hours.slice(1),
        ];
      }
      el.textContent = JSON.stringify(data);
    } catch {
      // Kaputter Block: lieber unverändert lassen als ihn zu zerstören.
    }
  }, [phoneHref, email, street, zip, locality, zeiten]);

  return null;
}
