/**
 * Zentrale Angaben zur ausgelieferten Website.
 *
 * `ORIGIN` muss die endgültige Domain sein — sie landet in canonical-Links,
 * Open-Graph-URLs und der sitemap.xml. Bei einem Umzug auf eine eigene Domain
 * hier ändern und zusätzlich die absoluten URLs in index.html anpassen.
 */
export const ORIGIN = 'https://urra-fenster.de';

/** Basis-Pfad der App — seit dem Umzug auf die eigene Domain immer '/'. */
export const BASE = import.meta.env.BASE_URL;

/**
 * Vollständige, absolute URL für einen Router-Pfad wie '/kontakt'.
 *
 * Mit abschließendem Schrägstrich: GitHub Pages liefert die vorgerenderten
 * Routen als Verzeichnisse aus und leitet '/kontakt' per 301 auf '/kontakt/'
 * um. Ein canonical ohne Schrägstrich zeigte damit auf eine URL, die selbst
 * weiterleitet — Suchmaschinen sollen direkt die 200er-Adresse bekommen.
 */
export function absoluteUrl(path: string): string {
  const clean = path.replace(/^\//, '').replace(/\/$/, '');
  return clean ? `${ORIGIN}${BASE}${clean}/` : `${ORIGIN}${BASE}`;
}

export const OG_IMAGE = `${ORIGIN}${BASE}og-image.jpg`;
