import { useMemo } from 'react';
import { navigation } from '../data/content';
import { useContent } from './content';

/**
 * Hauptmenü mit Betreiber-Anpassungen.
 *
 * Die Seiten selbst stehen im Code (Routen in App.tsx) — verwaltbar sind
 * Beschriftung, Sichtbarkeit im Menü und Reihenfolge. Gespeichert wird das in
 * denselben `site_content`-Overrides wie die Texte, also ohne eigenen
 * Backend-Endpunkt und mit derselben Passwortprüfung und Sanitisierung.
 *
 * Schlüssel je Seite (`key` = Pfad ohne Schrägstrich):
 *   nav.<key>.label   Beschriftung
 *   nav.<key>.hidden  "1" = nicht im Menü zeigen
 *   nav.<key>.order   Sortierung (kleiner = weiter vorn)
 */
export type NavItem = {
  key: string;
  href: string;
  label: string;
  /** Code-Beschriftung — für „Zurücksetzen" in der Verwaltung. */
  defaultLabel: string;
  hidden: boolean;
  order: number;
  /** Position laut Code — „Zurücksetzen" stellt genau diese wieder her. */
  defaultOrder: number;
};

/** Schlüssel eines Menüpunkts aus seinem Pfad: "/ueber-uns" → "ueber-uns". */
export function navKey(href: string): string {
  return href.replace(/^\//, '') || 'start';
}

export const navIds = (key: string) => ({
  label: `nav.${key}.label`,
  hidden: `nav.${key}.hidden`,
  order: `nav.${key}.order`,
});

/**
 * Overrides werden serverseitig als Rich-Text sanitisiert (`&` → `&amp;`).
 * Menü-Beschriftungen sind aber reiner Text — Tags entfernen und die Entities
 * zurückwandeln, sonst stünde „Fenster &amp; Türen" im Menü.
 * Ohne DOM gelöst, damit das auch beim Vorrendern funktioniert.
 */
export function plainLabel(value: string): string {
  return value
    .replace(/<[^>]*>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .trim();
}

/** Abstand zwischen zwei Standard-Positionen — lässt Platz zum Umsortieren. */
const STEP = 10;

/**
 * Das Hauptmenü in der Reihenfolge, in der es angezeigt wird.
 * `includeHidden` liefert zusätzlich die ausgeblendeten Einträge (Verwaltung).
 */
export function useNavItems(includeHidden = false): NavItem[] {
  const { get } = useContent();

  return useMemo(() => {
    const items: NavItem[] = navigation.map((n, i) => {
      const key = navKey(n.href);
      const ids = navIds(key);
      const rawLabel = get(ids.label);
      const label = rawLabel != null ? plainLabel(rawLabel) : '';
      const rawOrder = get(ids.order);
      const defaultOrder = (i + 1) * STEP;
      return {
        key,
        href: n.href,
        // Leere Beschriftung wäre ein unklickbarer Menüpunkt → Code-Text greift.
        label: label || n.label,
        defaultLabel: n.label,
        hidden: get(ids.hidden) === '1',
        order: /^\d{1,4}$/.test(rawOrder ?? '') ? Number(rawOrder) : defaultOrder,
        defaultOrder,
      };
    });

    items.sort((a, b) => a.order - b.order || a.key.localeCompare(b.key));
    return includeHidden ? items : items.filter((n) => !n.hidden);
  }, [get, includeHidden]);
}

/** Positionen neu durchnummerieren (10, 20, 30 …) — Ergebnis für save-content. */
export function orderValues(items: Pick<NavItem, 'key'>[]): Record<string, string> {
  const out: Record<string, string> = {};
  items.forEach((it, i) => {
    out[navIds(it.key).order] = String((i + 1) * STEP);
  });
  return out;
}

/**
 * Steht die Liste wieder in der Code-Reihenfolge? Dann werden die
 * Positions-Overrides gelöscht statt geschrieben — so bleibt nichts
 * Überflüssiges gespeichert, und eine spätere Änderung im Code greift wieder.
 */
export function isDefaultOrder(items: NavItem[]): boolean {
  return items.every((it, i) => i === 0 || items[i - 1].defaultOrder < it.defaultOrder);
}
