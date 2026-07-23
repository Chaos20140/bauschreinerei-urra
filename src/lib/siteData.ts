import { useMemo } from 'react';
import { contact as codeContact, regions as codeRegions } from '../data/content';
import { useContent } from './content';
import { plainText } from './plainText';

/**
 * Kontaktdaten und Servicegebiet mit Betreiber-Anpassungen.
 *
 * Wichtig: Es gibt pro Angabe **einen** Schlüssel, der auf allen Seiten gilt.
 * Sonst könnte auf der Startseite eine andere Telefonnummer stehen als auf der
 * Kontaktseite — genau das war vorher der Fall (`home.contact.phone.value`).
 *
 * Ebenso wichtig: Anruf-, Mail- und Karten-Link werden aus dem bearbeiteten
 * Wert ABGELEITET. Damit kann der angezeigte Text nie von dem abweichen, was
 * beim Antippen tatsächlich gewählt oder geöffnet wird. Ist ein bearbeiteter
 * Wert unbrauchbar (leer, keine gültige Nummer/Adresse), greift der Wert aus
 * dem Code — lieber der alte funktionierende Link als ein toter.
 */
export const CONTACT_IDS = {
  street: 'contact.street',
  city: 'contact.city',
  phone: 'contact.phone',
  email: 'contact.email',
  cta: 'contact.cta',
  callCta: 'contact.callcta',
} as const;

export type ContactInfo = {
  /** „Am Ochsenberg 13" */
  street: string;
  /** „59939 Olsberg" (PLZ und Ort in einer Zeile — so wird es auch bearbeitet) */
  city: string;
  phone: string;
  phoneHref: string;
  email: string;
  emailHref: string;
  mapsHref: string;
  /** Aufgetrennt für die strukturierten Daten. */
  zip: string;
  locality: string;
};

// Nur Ziffern und ein führendes Plus, 5–20 Stellen: alles andere wäre kein
// wählbarer Anschluss und darf nicht in ein tel:-Href.
const PHONE_OK = /^\+?\d{5,20}$/;
// Absichtlich streng: keine Leerzeichen, keine spitzen Klammern, keine
// Anführungszeichen — damit aus dem Wert nie etwas anderes als ein mailto wird.
const MAIL_OK = /^[^\s@<>"'`]+@[^\s@<>"'`]+\.[a-zA-Z]{2,}$/;

function mapsUrl(street: string, city: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${street}, ${city}`
  )}`;
}

export function useContactInfo(): ContactInfo {
  const { get } = useContent();

  return useMemo(() => {
    const codeCity = `${codeContact.address.zip} ${codeContact.address.city}`;
    const pick = (id: string, fallback: string) => {
      const raw = get(id);
      const value = raw != null ? plainText(raw) : '';
      return value || fallback;
    };

    const street = pick(CONTACT_IDS.street, codeContact.address.street);
    const city = pick(CONTACT_IDS.city, codeCity);
    const phone = pick(CONTACT_IDS.phone, codeContact.phone.display);
    const email = pick(CONTACT_IDS.email, codeContact.email.display);

    const phoneDigits = phone.replace(/[^\d+]/g, '');
    const phoneHref = PHONE_OK.test(phoneDigits)
      ? `tel:${phoneDigits}`
      : codeContact.phone.href;
    const emailHref = MAIL_OK.test(email) ? `mailto:${email}` : codeContact.email.href;

    // „59939 Olsberg" → PLZ + Ort für die strukturierten Daten; passt das
    // Muster nicht, bleiben die Werte aus dem Code stehen.
    const parts = city.match(/^(\d{5})\s+(.+)$/);

    return {
      street,
      city,
      phone,
      phoneHref,
      email,
      emailHref,
      mapsHref: mapsUrl(street, city),
      zip: parts?.[1] ?? codeContact.address.zip,
      locality: parts?.[2] ?? codeContact.address.city,
    };
  }, [get]);
}

/**
 * Servicegebiet (Regionen + Städte) mit Overrides.
 *
 * Gemeinsame Schlüssel für Startseite, Projekte- und Kontaktseite — die Liste
 * ist überall dieselbe Aussage und soll nicht auseinanderlaufen.
 */
export const regionIds = (areaIdx: number) => ({
  title: `regions.area${areaIdx}.title`,
  city: (cityIdx: number) => `regions.area${areaIdx}.city${cityIdx}`,
});

export type RegionArea = { key: string; title: string; cities: string[] };

export function useRegionAreas(): RegionArea[] {
  const { get } = useContent();

  return useMemo(
    () =>
      codeRegions.areas.map((area, idx) => {
        const ids = regionIds(idx);
        const title = get(ids.title);
        return {
          key: area.key,
          title: (title != null ? plainText(title) : '') || area.key,
          cities: area.cities.map((city, cidx) => {
            const value = get(ids.city(cidx));
            return (value != null ? plainText(value) : '') || city;
          }),
        };
      }),
    [get]
  );
}
