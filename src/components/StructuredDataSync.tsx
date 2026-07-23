import { useEffect } from 'react';
import { useContactInfo } from '../lib/siteData';

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

  useEffect(() => {
    const el = document.querySelector<HTMLScriptElement>(
      'script[type="application/ld+json"]'
    );
    if (!el?.textContent) return;

    try {
      const data = JSON.parse(el.textContent) as Record<string, unknown>;
      const address = (data.address ?? {}) as Record<string, unknown>;
      const telephone = phoneHref.replace(/^tel:/, '');

      const gleich =
        data.telephone === telephone &&
        data.email === email &&
        address.streetAddress === street &&
        address.postalCode === zip &&
        address.addressLocality === locality;
      if (gleich) return;

      data.telephone = telephone;
      data.email = email;
      data.address = {
        ...address,
        streetAddress: street,
        postalCode: zip,
        addressLocality: locality,
      };
      el.textContent = JSON.stringify(data);
    } catch {
      // Kaputter Block: lieber unverändert lassen als ihn zu zerstören.
    }
  }, [phoneHref, email, street, zip, locality]);

  return null;
}
