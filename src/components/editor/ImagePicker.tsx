import { useEffect, useRef, useState } from 'react';
import { ImageUp, Loader2, X } from 'lucide-react';
import { useContent, type MediaImage } from '../../lib/content';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

type Props = {
  /** Stelle auf der Website, die das gewählte Bild bekommt. */
  id: string;
  alt: string;
  onClose: () => void;
};

/**
 * Auswahl-Dialog beim Klick auf ein Bild im Bearbeiten-Modus: entweder ein
 * bereits hochgeladenes Bild aus der Mediathek einsetzen oder ein neues
 * hochladen. Beides wirkt sofort.
 */
export function ImagePicker({ id, alt, onClose }: Props) {
  const { listImages, uploadImage, applyLibraryImage } = useContent();
  const [items, setItems] = useState<MediaImage[] | null>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const inputRef = useRef<HTMLInputElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const boxRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let alive = true;
    listImages().then((list) => alive && setItems(list));
    closeRef.current?.focus();
    return () => {
      alive = false;
    };
  }, [listImages]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      // Tastaturfokus im Dialog halten: Ohne das tabbt man aus dem
      // „aria-modal"-Dialog heraus in die verdeckte Seite dahinter.
      if (e.key !== 'Tab') return;
      const box = boxRef.current;
      if (!box) return;
      const ziele = [...box.querySelectorAll<HTMLElement>('button, [href], input, select, textarea')]
        .filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null);
      if (ziele.length === 0) return;
      const erster = ziele[0];
      const letzter = ziele[ziele.length - 1];
      const aktiv = document.activeElement;
      if (e.shiftKey && (aktiv === erster || !box.contains(aktiv))) {
        e.preventDefault();
        letzter.focus();
      } else if (!e.shiftKey && aktiv === letzter) {
        e.preventDefault();
        erster.focus();
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  function check(file: File): string {
    if (file.size > MAX_BYTES) return 'Das Bild ist größer als 5 MB.';
    if (file.type && !ALLOWED.has(file.type)) return 'Nur JPG, PNG oder WebP.';
    return '';
  }

  /** Hochladen und direkt an dieser Stelle einsetzen. */
  async function onUploadHere(file: File | null) {
    if (!file) return;
    const problem = check(file);
    if (problem) return setErr(problem);
    setErr('');
    setBusy(true);
    const r = await uploadImage(id, file);
    setBusy(false);
    if (r.ok) onClose();
    else setErr(r.error === '401' ? 'Bitte im Admin neu anmelden.' : 'Upload fehlgeschlagen.');
  }

  async function onPick(item: MediaImage) {
    setErr('');
    setBusy(true);
    const r = await applyLibraryImage(id, item.name);
    setBusy(false);
    if (r.ok) onClose();
    else setErr('Konnte nicht eingesetzt werden.');
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`Bild wählen für ${alt}`}
      className="fixed inset-0 z-[90] grid place-items-center p-4"
    >
      {/* Eigener Knopf statt Klick-Handler auf dem Hintergrund — so ist das
          Schließen auch mit der Tastatur erreichbar. */}
      <button
        type="button"
        aria-label="Auswahl schließen"
        onClick={onClose}
        className="absolute inset-0 w-full h-full bg-black/70 backdrop-blur-sm cursor-default"
      />
      <div
        ref={boxRef}
        className="relative w-full max-w-2xl max-h-[85vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-white/20 shadow-2xl p-5 text-white"
      >
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-medium">Bild wählen</h2>
            <p className="text-white/50 text-xs mt-0.5">
              Aus der Mediathek einsetzen oder neu hochladen.
            </p>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Schließen"
            className="shrink-0 h-9 w-9 grid place-items-center rounded-full border border-white/20 text-white/75 hover:bg-white/10 transition-colors focus-ring"
          >
            <X size={16} />
          </button>
        </div>

        {err && (
          <p role="alert" className="text-rose-300 text-sm mb-3">
            {err}
          </p>
        )}

        <div className="flex flex-wrap gap-2 mb-5">
          <button
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="inline-flex items-center gap-2 bg-white text-black rounded-full px-4 py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-40 transition-colors focus-ring"
          >
            {busy ? <Loader2 size={15} className="animate-spin" /> : <ImageUp size={15} />}
            Neues Bild hochladen
          </button>
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              const file = e.target.files?.[0] ?? null;
              e.target.value = '';
              onUploadHere(file);
            }}
            className="sr-only"
          />
        </div>

        {items === null ? (
          <div className="flex items-center justify-center gap-2 text-white/55 py-12">
            <Loader2 size={18} className="animate-spin" /> Mediathek lädt …
          </div>
        ) : items.length === 0 ? (
          <p className="text-white/50 text-sm py-10 text-center">
            Die Mediathek ist noch leer. Lade oben ein Bild hoch — es steht danach
            überall zur Auswahl.
          </p>
        ) : (
          <ul className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {items.map((item) => (
              <li key={item.name}>
                <button
                  onClick={() => onPick(item)}
                  disabled={busy}
                  className="group w-full text-left rounded-xl overflow-hidden border border-white/12 hover:border-white/45 disabled:opacity-40 transition-colors focus-ring"
                >
                  <span className="relative block aspect-[4/3] bg-neutral-900">
                    <img
                      src={item.url}
                      alt=""
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </span>
                  <span className="block px-2.5 py-2 text-[11px] text-white/60 truncate">
                    {item.name}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}

        <p className="text-white/35 text-[11px] mt-5 leading-relaxed">
          Tipp: Über die Kachel „Mediathek" in der Verwaltung kannst du Bilder
          auch ohne Bearbeiten-Modus hochladen und ungenutzte löschen.
        </p>
      </div>
    </div>
  );
}
