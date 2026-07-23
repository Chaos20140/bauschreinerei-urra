import { useState } from 'react';
import { Save, X, Check, Loader2, Pencil } from 'lucide-react';
import { useContent } from '../../lib/content';

/**
 * Schwebende Leiste im Bearbeiten-Modus: Speichern, Verwerfen/Verlassen und ein
 * Zähler geänderter Felder. Für normale Besucher unsichtbar (editMode = false).
 */
export function EditToolbar() {
  const { editMode, dirtyCount, save, leaveEditMode } = useContent();
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  if (!editMode) return null;

  async function onSave() {
    if (busy || dirtyCount === 0) return;
    setBusy(true);
    setMsg('');
    const r = await save();
    setBusy(false);
    if (r.ok) {
      setMsg('Gespeichert.');
      window.setTimeout(() => setMsg(''), 2500);
    } else {
      setMsg(
        r.error === '401'
          ? 'Sitzung abgelaufen — bitte im Admin neu anmelden.'
          : 'Speichern fehlgeschlagen.'
      );
    }
  }

  function onLeave() {
    if (dirtyCount > 0 && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return;
    leaveEditMode();
  }

  return (
    <div
      role="region"
      aria-label="Bearbeiten-Leiste"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[70] flex items-center gap-3 rounded-full bg-neutral-950/95 backdrop-blur-md border border-white/20 shadow-2xl pl-5 pr-2 py-2"
    >
      <span className="inline-flex items-center gap-2 text-white text-sm font-medium">
        <Pencil size={15} className="text-emerald-300" />
        Bearbeiten
      </span>
      {/* Legende: erklärt die Farben der Markierung auf der Seite. */}
      <span className="hidden md:inline-flex items-center gap-3 text-[11px] text-white/55 border-l border-white/15 pl-3">
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-sky-400/40 ring-1 ring-sky-300" />
          bearbeitbar
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-[2px] bg-emerald-400/50 ring-1 ring-emerald-300" />
          geändert
        </span>
      </span>

      <span className="text-white/55 text-xs min-w-[6.5rem]">
        {msg ? (
          <span className="text-emerald-300 inline-flex items-center gap-1">
            <Check size={13} /> {msg}
          </span>
        ) : dirtyCount > 0 ? (
          `${dirtyCount} Änderung${dirtyCount === 1 ? '' : 'en'}`
        ) : (
          'Klicke einen Text an'
        )}
      </span>
      <button
        onClick={onSave}
        disabled={busy || dirtyCount === 0}
        className="inline-flex items-center gap-2 bg-white text-black rounded-full px-4 py-2 text-sm font-medium hover:bg-neutral-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors focus-ring"
      >
        {busy ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
        Speichern
      </button>
      <button
        onClick={onLeave}
        aria-label="Bearbeiten verlassen"
        className="inline-flex items-center justify-center h-9 w-9 rounded-full border border-white/20 text-white/80 hover:bg-white/10 transition-colors focus-ring"
      >
        <X size={16} />
      </button>
    </div>
  );
}
