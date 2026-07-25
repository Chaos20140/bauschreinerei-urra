/**
 * Clientseitige Notbremse für den NOCH NICHT GESPEICHERTEN Entwurf.
 *
 * Die maßgebliche Grenze bleibt der Server (`sanitizeRich` in urra-admin) —
 * dort wird jeder Wert vor dem Speichern gefiltert. Diese Funktion schließt
 * eine Lücke davor: Ein Entwurf wird beim Rückgängigmachen wieder als HTML
 * ins Feld gesetzt, hat den Server aber noch nie gesehen. Fügt jemand Inhalt
 * aus einer präparierten Seite ein, käme dabei fremdes Markup zurück ins DOM —
 * im Bearbeiten-Modus, also mit dem Passwort im Speicher.
 *
 * Gleiche Regel wie serverseitig: erst alles maskieren, dann nur die erlaubten
 * Auszeichnungen zurückholen (fett, kursiv, Umbruch, sichere Links).
 * Bewusst ohne DOM-Parser — der würde beim Parsen bereits Ressourcen laden.
 */

/** Erlaubte Ziele für Links — analog `safeHref` im Server. */
function safeHref(h: string): boolean {
  const s = (h || '').trim();
  return (
    /^https?:\/\//i.test(s) ||
    /^mailto:/i.test(s) ||
    /^tel:/i.test(s) ||
    // Nur echte relative Pfade: der zweite Slash würde //fremdhost erlauben.
    /^\/(?!\/)[\w./-]*$/.test(s) ||
    /^#[\w-]+$/.test(s)
  );
}

export function sanitizeDraft(html: string): string {
  let s = html
    .replace(/&(?!(?:amp|lt|gt|quot|apos|#\d+|#x[0-9a-fA-F]+);)/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

  s = s.replace(/&lt;(\/?)(strong|b|em|i)&gt;/gi, '<$1$2>');
  s = s.replace(/&lt;br\s*\/?&gt;/gi, '<br>');
  s = s.replace(/&lt;a\b[\s\S]*?&gt;/gi, (m) => {
    const hm = m.match(/href=(?:&quot;|&#39;)([\s\S]*?)(?:&quot;|&#39;)/i);
    const href = hm ? hm[1] : '';
    return safeHref(href)
      ? `<a href="${href}" target="_blank" rel="noopener noreferrer">`
      : '';
  });
  s = s.replace(/&lt;\/a&gt;/gi, '</a>');
  // Alles Übrige verliert die Auszeichnung, der Text bleibt lesbar.
  s = s.replace(/&lt;\/?[a-z][\s\S]*?&gt;/gi, '');

  return s;
}
