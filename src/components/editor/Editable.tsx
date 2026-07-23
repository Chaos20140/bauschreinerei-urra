import { createElement, useRef, type ReactNode, type CSSProperties } from 'react';
import { useContent } from '../../lib/content';

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
        seed.current = rich ? <span dangerouslySetInnerHTML={{ __html: draft }} /> : draft;
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
    },
    seed.current
  );
}
