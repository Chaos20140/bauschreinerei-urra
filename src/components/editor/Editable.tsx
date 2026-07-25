import { createElement, useRef, type ReactNode, type CSSProperties } from 'react';
import { useContent } from '../../lib/content';
import { sanitizeDraft } from '../../lib/sanitizeDraft';

type Tag = keyof JSX.IntrinsicElements;

type Props = {
  /** Stabile ID des Textes, z. B. "home.hero.desc". Bestimmt den Override-Key. */
  id: string;
  children?: ReactNode;
  as?: Tag;
  /** Erlaubt einfache Inline-Formatierung (fett/kursiv/Link) statt reinem Text. */
  rich?: boolean;
  className?: string;
  style?: CSSProperties;
};

/**
 * Ein Text, der im Bearbeiten-Modus direkt auf der Website geändert werden kann.
 *
 * - Normal: zeigt den gespeicherten Override (falls vorhanden) oder den
 *   Code-Text aus content.ts (`children`).
 * - Bearbeiten-Modus: wird `contentEditable`; Änderungen werden vorgemerkt und
 *   über die EditToolbar gespeichert.
 *
 * Overrides werden serverseitig sanitisiert (Escape-First-Allowlist in
 * urra-admin) und deshalb als HTML gerendert — kein aktiver Code kann so in
 * einen Override gelangen.
 */
export function Editable({ id, children, as = 'span', rich = false, className, style }: Props) {
  const { get, editMode, setPending, isDirty, pendingValue, seedVersion } = useContent();
  const override = get(id);

  // Startinhalt für das editierbare Feld — einmal beim Eintritt erfassen, sonst
  // würde React beim Tippen den Cursor zurücksetzen. `seedVersion` zählt hoch,
  // wenn der Inhalt von außen geändert wurde (Rückgängig, Verwerfen); dann muss
  // der Text neu aufgebaut werden, sonst bliebe der alte im Feld stehen.
  const seed = useRef<ReactNode>(null);
  const seededFor = useRef<string | null>(null);
  const seedKey = `${id}#${seedVersion}`;
  if (editMode) {
    if (seededFor.current !== seedKey) {
      const draft = pendingValue(id);
      if (draft != null) {
        // Ungespeicherter Stand: bei Rich-Text als HTML, sonst als reiner Text
        // (der Entwurf kommt dort aus innerText und ist kein Markup).
        //
        // Der Entwurf hat den Server noch nie gesehen — anders als ein
        // gespeicherter Override. Deshalb hier dieselbe Allowlist clientseitig,
        // sonst käme aus einer Zwischenablage eingefügtes Fremd-Markup beim
        // Rückgängigmachen ungefiltert zurück ins DOM.
        seed.current = rich ? (
          <span dangerouslySetInnerHTML={{ __html: sanitizeDraft(draft) }} />
        ) : (
          draft
        );
      } else if (override != null) {
        seed.current = <span dangerouslySetInnerHTML={{ __html: override }} />;
      } else {
        seed.current = children;
      }
      seededFor.current = seedKey;
    }
  } else {
    seededFor.current = null;
  }

  if (!editMode) {
    if (override != null) {
      return createElement(as, {
        className,
        style,
        dangerouslySetInnerHTML: { __html: override },
      });
    }
    return createElement(as, { className, style }, children);
  }

  // Die Markierung selbst liegt in index.css an `[data-ed-id]` — bewusst nicht
  // als Tailwind-Weiß-Utility, sonst verschwindet sie auf den hellen
  // Beige-Unterseiten. `data-ed-dirty` schaltet auf „geändert" (grün).
  const cls = `${className ?? ''} cursor-text`.trim();

  const onInput = (e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget;
    setPending(id, rich ? el.innerHTML : (el.innerText ?? ''));
  };
  // Im Edit-Modus Klicks nicht navigieren lassen (viele Texte liegen in Links).
  const onClick = (e: React.MouseEvent<HTMLElement>) => e.preventDefault();

  /**
   * Einfügen immer als REINER TEXT.
   *
   * Zwei Gründe: Aus einer Webseite kopierter Inhalt schleppt sonst fremde
   * Schriften, Farben und Größen mit — und im Ernstfall aktives Markup, das
   * beim Rückgängigmachen wieder ins DOM käme. Für die Bedienung ist das
   * ohnehin das erwartete Verhalten eines schlichten Text-Editors.
   */
  const onPaste = (e: React.ClipboardEvent<HTMLElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    // insertText respektiert die Auswahl und den Rückgängig-Stapel des Browsers.
    document.execCommand('insertText', false, text);
  };

  /** Fallenlassen von Inhalt umgeht das Einfügen — deshalb hier ebenfalls sperren. */
  const onDrop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const text = e.dataTransfer.getData('text/plain');
    if (text) document.execCommand('insertText', false, text);
  };

  return createElement(
    as,
    {
      // Der Schlüssel enthält seedVersion und erzwingt bei Rückgängig/Verwerfen
      // einen Neuaufbau des Elements. Ohne das bliebe der von Hand getippte
      // Text stehen: React kennt die Eingabe im contentEditable nicht und
      // würde beim gleichen Sollwert gar nichts anfassen.
      key: seedKey,
      className: cls,
      style,
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      'data-ed-id': id,
      'data-ed-dirty': isDirty(id) ? '1' : undefined,
      title: 'Zum Bearbeiten klicken',
      onInput,
      onClick,
      onPaste,
      onDrop,
    },
    seed.current
  );
}
