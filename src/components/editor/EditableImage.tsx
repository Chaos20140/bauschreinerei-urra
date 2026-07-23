import { useRef, useState } from 'react';
import { ImageUp, Loader2 } from 'lucide-react';
import { useContent } from '../../lib/content';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

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
 * - Bearbeiten-Modus: Klick öffnet den Datei-Dialog; das gewählte Bild wird in
 *   den öffentlichen Bucket geladen und als Override gesetzt (sofort sichtbar).
 */
export function EditableImage({ id, src, alt, className, eager }: Props) {
  const { get, editMode, uploadImage } = useContent();
  const override = get(id);
  const effectiveSrc = override ?? src;
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onPick(file: File | null) {
    if (!file) return;
    setErr('');
    if (file.size > MAX_BYTES) {
      setErr('Größer als 5 MB');
      return;
    }
    if (file.type && !ALLOWED.has(file.type)) {
      setErr('Nur JPG, PNG oder WebP');
      return;
    }
    setBusy(true);
    const r = await uploadImage(id, file);
    setBusy(false);
    if (!r.ok) setErr(r.error === '401' ? 'Neu anmelden' : 'Upload fehlgeschlagen');
  }

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

  const openPicker = (e: { preventDefault: () => void; stopPropagation: () => void }) => {
    // Liegt das Bild in einem Link/Button, darf der Klick weder navigieren noch
    // das Elternelement auslösen — nur den Datei-Dialog öffnen.
    e.preventDefault();
    e.stopPropagation();
    inputRef.current?.click();
  };

  return (
    <span
      role="button"
      tabIndex={0}
      aria-label={`Bild ändern: ${alt}`}
      // data-ed-img trägt dieselbe Markierung wie editierbare Texte (index.css)
      // — so ist auch ohne Hover erkennbar, welche Bilder austauschbar sind.
      data-ed-img=""
      className="relative block group/edimg cursor-pointer focus-ring"
      onClick={openPicker}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') openPicker(e);
      }}
    >
      <img src={effectiveSrc} alt={alt} decoding="async" className={className} />
      <span className="absolute top-2 left-2 z-10 inline-flex items-center gap-1.5 rounded-full bg-sky-500 text-white text-[11px] font-medium px-2.5 py-1 shadow group-hover/edimg:opacity-0 transition-opacity">
        <ImageUp size={12} /> Bild
      </span>
      <span className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/edimg:opacity-100 transition-opacity">
        <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <ImageUp size={15} />}
          {busy ? 'Lädt …' : 'Bild ändern'}
        </span>
      </span>
      {err && (
        <span className="absolute bottom-2 left-2 right-2 text-center text-xs bg-rose-600 text-white rounded px-2 py-1">
          {err}
        </span>
      )}
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={(e) => onPick(e.target.files?.[0] ?? null)}
        className="sr-only"
      />
    </span>
  );
}
