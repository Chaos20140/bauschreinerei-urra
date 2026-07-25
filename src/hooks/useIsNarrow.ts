import { useEffect, useState } from 'react';

/** Unterhalb dieser Breite gilt der Bildschirm als „zu schmal zum Bearbeiten". */
const NARROW_QUERY = '(max-width: 1023px)';

/**
 * Ist der Bildschirm zu schmal für den Bearbeiten-Modus?
 *
 * Hintergrund: Die Texte der Website gibt es nur EINMAL — Handy und Computer
 * zeigen dieselben Inhalte, nur anders angeordnet. Eine „mobile Fassung", die
 * man getrennt pflegen könnte, existiert also nicht; jede Änderung wirkt
 * überall. Auf einem Handy-Display verdeckt die Bearbeiten-Leiste zudem den
 * halben Bildschirm, und das Antippen einzelner Textstellen ist kaum treffsicher.
 * Deshalb bleibt das Bearbeiten dem Computer vorbehalten; alles andere in der
 * Verwaltung (Anfragen, Bewerbungen, Mediathek, Menü) funktioniert mobil.
 *
 * Der Anfangswert wird synchron gelesen, damit auf dem Handy nicht kurz die
 * Bearbeiten-Oberfläche aufblitzt.
 */
export function useIsNarrow(): boolean {
  const [narrow, setNarrow] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(NARROW_QUERY).matches;
  });

  useEffect(() => {
    const mq = window.matchMedia(NARROW_QUERY);
    setNarrow(mq.matches);
    const handler = (e: MediaQueryListEvent) => setNarrow(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return narrow;
}
