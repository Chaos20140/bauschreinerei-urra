import { useState } from 'react';
import { ImageUp } from 'lucide-react';
import { useContent } from '../../lib/content';
import { ImagePicker } from './ImagePicker';

type Props = {
  /** Stabile ID, z. B. "leistungen.tools0.image". Bestimmt den Override-Key. */
  id: string;
  /** Bild-URL aus dem Code (Fallback, wenn kein Override gesetzt ist). */
  src: string;
  alt: string;
  className?: string;
  /** loading="eager" für ein LCP-Bild. */
  eager?: boolean;
};

/**
 * Ein Bild, das im Bearbeiten-Modus durch Anklicken ausgetauscht werden kann.
 *
 * - Normal: zeigt den Override (falls gesetzt) oder das Code-Bild.
 * - Bearbeiten-Modus: Klick öffnet die Auswahl — Bild aus der Mediathek
 *   einsetzen oder ein neues hochladen.
 */
export function EditableImage({ id, src, alt, className, eager }: Props) {
  const { get, editMode } = useContent();
  const override = get(id);
  const effectiveSrc = override ?? src;
  const [picking, setPicking] = useState(false);

  if (!editMode) {
    return (
      <img
        src={effectiveSrc}
        alt={alt}
        loading={eager ? 'eager' : 'lazy'}
        decoding="async"
        className={className}
      />
    );
  }

  const open = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    // Liegt das Bild in einem Link/Button, darf der Klick weder navigieren noch
    // das Elternelement auslösen — nur die Auswahl öffnen.
    e.preventDefault();
    e.stopPropagation();
    setPicking(true);
  };

  return (
    <>
      <span
        role="button"
        tabIndex={0}
        aria-label={`Bild ändern: ${alt}`}
        // data-ed-img trägt dieselbe Markierung wie editierbare Texte (index.css)
        // — so ist auch ohne Hover erkennbar, welche Bilder austauschbar sind.
        data-ed-img=""
        className="relative block group/edimg cursor-pointer focus-ring"
        onClick={open}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') open(e);
        }}
      >
        <img src={effectiveSrc} alt={alt} decoding="async" className={className} />
        <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-sky-500 text-white text-[11px] font-medium px-2.5 py-1 shadow group-hover/edimg:opacity-0 transition-opacity">
          <ImageUp size={12} /> Bild
        </span>
        <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/edimg:opacity-100 transition-opacity">
          <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
            <ImageUp size={15} />
            Bild ändern
          </span>
        </span>
      </span>

      {picking && <ImagePicker id={id} alt={alt} onClose={() => setPicking(false)} />}
    </>
  );
}
