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
  const { get, editMode, setPending, isDirty } = useContent();
  const override = get(id);

  // Startinhalt für das editierbare Feld — einmal beim Eintritt erfassen, sonst
  // würde React beim Tippen den Cursor zurücksetzen.
  const seed = useRef<ReactNode>(null);
  const seededFor = useRef<string | null>(null);
  if (editMode) {
    if (seededFor.current !== id) {
      seed.current =
        override != null ? (
          <span dangerouslySetInnerHTML={{ __html: override }} />
        ) : (
          children
        );
      seededFor.current = id;
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

  // Geänderte Felder heben sich ab (durchgehender Rahmen), unveränderte tragen
  // einen gestrichelten „editierbar"-Rahmen.
  const marker = isDirty(id)
    ? 'outline outline-2 outline-emerald-400/80 bg-emerald-400/10'
    : 'outline outline-1 outline-dashed outline-white/40';
  const cls = `${className ?? ''} ${marker} outline-offset-2 rounded-sm cursor-text`.trim();

  const onInput = (e: React.FormEvent<HTMLElement>) => {
    const el = e.currentTarget;
    setPending(id, rich ? el.innerHTML : (el.innerText ?? ''));
  };
  // Im Edit-Modus Klicks nicht navigieren lassen (viele Texte liegen in Links).
  const onClick = (e: React.MouseEvent<HTMLElement>) => e.preventDefault();

  return createElement(
    as,
    {
      className: cls,
      style,
      contentEditable: true,
      suppressContentEditableWarning: true,
      spellCheck: false,
      'data-ed-id': id,
      title: 'Zum Bearbeiten klicken',
      onInput,
      onClick,
    },
    seed.current
  );
}
