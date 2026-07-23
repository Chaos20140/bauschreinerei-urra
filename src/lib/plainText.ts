/**
 * Macht aus einem gespeicherten Override wieder reinen Text.
 *
 * Overrides werden serverseitig als Rich-Text sanitisiert, dabei wird `&` zu
 * `&amp;`. Für Werte, die als Text weiterverarbeitet statt als HTML gerendert
 * werden — Menü-Beschriftungen, Telefonnummer, E-Mail, Adresse — müssen Tags
 * raus und Entities zurückgewandelt werden, sonst stünde „Fenster &amp; Türen"
 * im Menü oder eine kaputte Nummer im Anruf-Link.
 *
 * Bewusst ohne DOM gelöst, damit es auch beim Vorrendern funktioniert.
 * `&amp;` wird zuletzt ersetzt, sonst würde `&amp;lt;` zu `<` statt zu `&lt;`.
 */
export function plainText(value: string): string {
  return value
    .replace(/<[^>]*>/g, ' ')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\s+/g, ' ')
    .trim();
}
