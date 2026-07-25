import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import {
  ArrowLeft,
  Check,
  HelpCircle,
  Loader2,
  Pencil,
  Redo2,
  RotateCcw,
  Save,
  Search,
  Undo2,
  X,
} from 'lucide-react';
import { useContent } from '../../lib/content';
import { seoIds } from '../../lib/seo';
import { plainText } from '../../lib/plainText';

type View = 'menu' | 'seo' | 'hilfe';

/**
 * Bearbeiten-Leiste als Reiter am linken Bildschirmrand.
 *
 * Aufklappbares Feld mit Zähler, Rückgängig/Wiederherstellen, Speichern,
 * Verwerfen, Seite zurücksetzen, „SEO & Titel", Hilfe und Verlassen.
 * Für normale Besucher unsichtbar (editMode = false).
 */
export function EditToolbar() {
  const {
    editMode,
    dirtyCount,
    save,
    leaveEditMode,
    discard,
    undo,
    redo,
    canUndo,
    canRedo,
  } = useContent();

  // Zu, bis der Mauszeiger auf den Reiter kommt. „Angeheftet" hält das Feld
  // offen, sobald es wirklich benutzt wird (Klick, Unterseite) — sonst klappte
  // es beim Weiterbewegen der Maus mitten in der Bedienung zu.
  //
  // Der Angeheftet-Zustand liegt zusätzlich in einem Ref: Die Maus verlässt den
  // Bereich oft im selben Wimpernschlag wie der Klick, und der Timer-Rückruf
  // liest dann noch den alten Wert aus seiner Closure. Der Ref ist sofort
  // aktuell, der State dient nur der Anzeige.
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [pinned, setPinnedState] = useState(false);
  const pinnedRef = useRef(false);
  const [view, setView] = useState<View>('menu');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const closeTimer = useRef<number | null>(null);

  const setPinned = (v: boolean) => {
    pinnedRef.current = v;
    setPinnedState(v);
  };

  const stopTimer = () => {
    if (closeTimer.current) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const zeigen = () => {
    stopTimer();
    setOpen(true);
  };

  const verbergen = () => {
    if (pinnedRef.current) return;
    stopTimer();
    // Kurze Verzögerung: der Weg vom Reiter zum Feld führt über eine winzige
    // Lücke — ohne sie klappt es dabei zu. Der Zustand wird beim Auslösen
    // erneut geprüft, falls zwischenzeitlich angeheftet wurde.
    closeTimer.current = window.setTimeout(() => {
      if (!pinnedRef.current) setOpen(false);
    }, 180);
  };

  const schliessen = () => {
    stopTimer();
    setPinned(false);
    setOpen(false);
    setView('menu');
  };

  useEffect(() => {
    return () => {
      if (closeTimer.current) window.clearTimeout(closeTimer.current);
    };
  }, []);

  // Tastatur: Strg+Z / Strg+Umschalt+Z wie in jedem Editor.
  useEffect(() => {
    if (!editMode) return;
    const onKey = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey) || e.key.toLowerCase() !== 'z') return;
      e.preventDefault();
      if (e.shiftKey) redo();
      else undo();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [editMode, undo, redo]);

  if (!editMode) return null;

  async function onSave() {
    if (busy || dirtyCount === 0) return;
    setBusy(true);
    setErr('');
    setMsg('');
    const r = await save();
    setBusy(false);
    if (r.ok) {
      setMsg('Gespeichert.');
      window.setTimeout(() => setMsg(''), 2500);
    } else {
      setErr(
        r.error === '401'
          ? 'Sitzung abgelaufen — bitte im Admin neu anmelden.'
          : 'Speichern fehlgeschlagen.'
      );
    }
  }

  function onDiscard() {
    if (dirtyCount === 0) return;
    if (!window.confirm(`${dirtyCount} ungespeicherte Änderung(en) verwerfen?`)) return;
    discard();
    setMsg('Verworfen.');
    window.setTimeout(() => setMsg(''), 2000);
  }

  function onLeave() {
    if (dirtyCount > 0 && !window.confirm('Ungespeicherte Änderungen verwerfen?')) return;
    leaveEditMode();
  }

  return (
    // Reiter und Feld liegen in einem Bereich: Der Zeiger darf zwischen beiden
    // wandern, ohne dass das Feld zwischendurch verschwindet.
    <div
      className="fixed left-0 top-1/2 -translate-y-1/2 z-[75] flex items-center"
      onMouseEnter={zeigen}
      onMouseLeave={verbergen}
      // Jede Bedienung IM FELD heftet es an: Wer auf „Speichern" klickt und die
      // Maus dabei wegbewegt, soll die Rückmeldung noch sehen. Der Reiter selbst
      // ist ausgenommen — dort schaltet der Klick bewusst um.
      onClickCapture={(e) => {
        if (!(e.target as HTMLElement).closest('[aria-controls="edit-panel"]')) {
          setPinned(true);
        }
      }}
      onFocusCapture={zeigen}
    >
      {/* Reiter am Rand — immer sichtbar, das Feld erscheint beim Überfahren. */}
      <button
        type="button"
        onClick={() => {
          // Klick schaltet „angeheftet" um: einmal klicken = bleibt offen,
          // nochmal klicken = wieder Hover-Verhalten und zu.
          if (pinnedRef.current) schliessen();
          else {
            setPinned(true);
            zeigen();
          }
        }}
        onFocus={zeigen}
        aria-expanded={open}
        aria-controls="edit-panel"
        aria-pressed={pinned}
        title={pinned ? 'Bearbeiten-Menü lösen' : 'Bearbeiten-Menü anheften'}
        className="flex flex-col items-center gap-2 rounded-r-2xl bg-neutral-900 text-white pl-2 pr-2.5 py-4 border border-l-0 border-white/20 shadow-2xl hover:bg-neutral-800 transition-colors focus-ring"
      >
        <span
          className={`h-2.5 w-2.5 rounded-full ${
            dirtyCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
          }`}
          aria-hidden="true"
        />
        <Pencil size={16} strokeWidth={1.75} />
        <span
          className="text-[11px] tracking-widest uppercase"
          style={{ writingMode: 'vertical-rl' }}
        >
          Bearbeiten
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            id="edit-panel"
            role="region"
            aria-label="Bearbeiten-Leiste"
            // Klappt aus dem Reiter heraus auf. reducedMotion="user" in App.tsx
            // schaltet die Bewegung ab, wenn das System das verlangt.
            initial={{ opacity: 0, x: -12, scale: 0.97 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.97 }}
            transition={{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }}
            style={{ transformOrigin: 'left center' }}
            // Deckender Hintergrund: als halbtransparente Fläche war der Text
            // vor hellen Bildern nicht lesbar.
            className="ml-2 w-[19rem] max-w-[calc(100vw-4.5rem)] max-h-[85vh] overflow-y-auto rounded-2xl bg-neutral-950 border border-white/20 shadow-2xl p-4 text-white"
          >
            {view === 'menu' && (
              <MenuView
                dirtyCount={dirtyCount}
                busy={busy}
                msg={msg}
                err={err}
                canUndo={canUndo}
                canRedo={canRedo}
                onUndo={undo}
                onRedo={redo}
                onSave={onSave}
                onDiscard={onDiscard}
                onLeave={onLeave}
                onClose={schliessen}
                onView={(v) => {
                  // Eine Unterseite zu öffnen ist eine bewusste Bedienung —
                  // ab hier bleibt das Feld offen, bis es geschlossen wird.
                  setPinned(true);
                  setView(v);
                }}
              />
            )}
            {/* key={pathname}: Die Eingabefelder werden pro Seite neu
                aufgebaut. Ohne das behielt der Bereich beim Seitenwechsel die
                alten Werte und hätte sie auf die neue Seite geschrieben. */}
            {view === 'seo' && <SeoView key={pathname} onBack={() => setView('menu')} />}
            {view === 'hilfe' && <HelpView onBack={() => setView('menu')} />}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

const ROW =
  'w-full inline-flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-white/85 hover:text-white hover:bg-white/10 transition-colors focus-ring text-left disabled:opacity-40 disabled:cursor-not-allowed';

function MenuView({
  dirtyCount,
  busy,
  msg,
  err,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  onSave,
  onDiscard,
  onLeave,
  onClose,
  onView,
}: {
  dirtyCount: number;
  busy: boolean;
  msg: string;
  err: string;
  canUndo: boolean;
  canRedo: boolean;
  onUndo: () => void;
  onRedo: () => void;
  onSave: () => void;
  onDiscard: () => void;
  onLeave: () => void;
  onClose: () => void;
  onView: (v: View) => void;
}) {
  return (
    <>
      <div className="flex items-center justify-between gap-2 mb-4">
        <span className="inline-flex items-center gap-2 text-sm font-medium">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              dirtyCount > 0 ? 'bg-amber-400' : 'bg-emerald-400'
            }`}
          />
          Bearbeitungsmodus
        </span>
        <button
          onClick={onClose}
          aria-label="Feld schließen"
          className="h-7 w-7 grid place-items-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-ring"
        >
          <X size={15} />
        </button>
      </div>

      <div className="flex items-center justify-between gap-2 mb-3">
        <span className="text-white/60 text-sm">
          {dirtyCount === 0
            ? 'Keine Änderungen'
            : `${dirtyCount} Änderung${dirtyCount === 1 ? '' : 'en'}`}
        </span>
        <span className="flex items-center gap-1">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            aria-label="Rückgängig"
            title="Rückgängig (Strg+Z)"
            className="h-8 w-8 grid place-items-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <Undo2 size={15} />
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            aria-label="Wiederherstellen"
            title="Wiederherstellen (Strg+Umschalt+Z)"
            className="h-8 w-8 grid place-items-center rounded-lg text-white/70 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-ring"
          >
            <Redo2 size={15} />
          </button>
        </span>
      </div>

      <button
        onClick={onSave}
        disabled={busy || dirtyCount === 0}
        className="w-full inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-4 py-3 text-sm font-medium hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring mb-1.5"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Speichern
      </button>

      {msg && (
        <p className="text-emerald-300 text-xs inline-flex items-center gap-1.5 px-1 py-1.5">
          <Check size={13} /> {msg}
        </p>
      )}
      {err && (
        <p role="alert" className="text-rose-300 text-xs px-1 py-1.5">
          {err}
        </p>
      )}

      <div className="mt-1 space-y-0.5 border-t border-white/10 pt-2">
        <button onClick={onDiscard} disabled={dirtyCount === 0} className={ROW}>
          <X size={15} className="text-white/50" />
          Verwerfen
        </button>
        <ResetRow />
        <button onClick={() => onView('seo')} className={ROW}>
          <Search size={15} className="text-white/50" />
          SEO &amp; Titel
        </button>
        <button onClick={() => onView('hilfe')} className={ROW}>
          <HelpCircle size={15} className="text-white/50" />
          Hilfe
        </button>
      </div>

      <div className="border-t border-white/10 mt-2 pt-2">
        <button
          onClick={onLeave}
          className={`${ROW} text-rose-300 hover:text-rose-200 hover:bg-rose-500/10`}
        >
          <ArrowLeft size={15} />
          Verlassen
        </button>
      </div>
    </>
  );
}

/**
 * Setzt alle auf DIESER Seite bearbeiteten Stellen auf den Ursprungstext
 * zurück — bewusst nicht die ganze Website, das wäre zu grob.
 */
function ResetRow() {
  const { knownIds, resetValues, discard } = useContent();
  const [busy, setBusy] = useState(false);

  async function onReset() {
    const ids = knownIds();
    if (ids.length === 0) return;
    if (
      !window.confirm(
        `Alle bearbeiteten Stellen dieser Seite auf den Ursprungstext zurücksetzen? (${ids.length} Stellen)`
      )
    ) {
      return;
    }
    setBusy(true);
    await resetValues(ids);
    discard();
    setBusy(false);
  }

  return (
    <button onClick={onReset} disabled={busy} className={ROW}>
      {busy ? (
        <Loader2 size={15} className="animate-spin text-white/50" />
      ) : (
        <RotateCcw size={15} className="text-white/50" />
      )}
      Seite zurücksetzen
    </button>
  );
}

/** Titel und Beschreibung dieser Seite für Google. */
function SeoView({ onBack }: { onBack: () => void }) {
  const { get, saveValues, resetValues } = useContent();
  const { pathname } = useLocation();
  const ids = seoIds(pathname);

  const storedTitle = get(ids.title);
  const storedDesc = get(ids.desc);
  const [title, setTitle] = useState(storedTitle ? plainText(storedTitle) : '');
  const [desc, setDesc] = useState(storedDesc ? plainText(storedDesc) : '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  async function onSave() {
    setBusy(true);
    setMsg('');
    const values: Record<string, string> = {};
    const resets: string[] = [];
    if (title.trim()) values[ids.title] = title.trim();
    else resets.push(ids.title);
    if (desc.trim()) values[ids.desc] = desc.trim();
    else resets.push(ids.desc);

    const a = await saveValues(values);
    const b = a.ok ? await resetValues(resets) : a;
    setBusy(false);
    setMsg(a.ok && b.ok ? 'Gespeichert.' : 'Speichern fehlgeschlagen.');
    window.setTimeout(() => setMsg(''), 2500);
  }

  return (
    <>
      <PanelHeader title="SEO & Titel" onBack={onBack} />
      <p className="text-white/50 text-xs leading-relaxed mb-4">
        Was Google für <span className="text-white/75">{pathname}</span> anzeigt.
        Leer lassen = Vorgabe aus der Website.
      </p>

      <label className="block text-white/60 text-xs mb-1" htmlFor="seo-title">
        Titel <span className="text-white/35">({title.length}/60 empfohlen)</span>
      </label>
      <input
        id="seo-title"
        value={title}
        maxLength={120}
        onChange={(e) => setTitle(e.target.value)}
        className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm mb-3 focus:border-white/40 focus:outline-none focus-ring"
      />

      <label className="block text-white/60 text-xs mb-1" htmlFor="seo-desc">
        Beschreibung <span className="text-white/35">({desc.length}/160 empfohlen)</span>
      </label>
      <textarea
        id="seo-desc"
        value={desc}
        rows={4}
        maxLength={320}
        onChange={(e) => setDesc(e.target.value)}
        className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm mb-4 resize-none focus:border-white/40 focus:outline-none focus-ring"
      />

      <button
        onClick={onSave}
        disabled={busy}
        className="w-full inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-4 py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-40 transition-colors focus-ring"
      >
        {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
        Speichern
      </button>
      {msg && <p className="text-emerald-300 text-xs mt-2 text-center">{msg}</p>}
    </>
  );
}

function HelpView({ onBack }: { onBack: () => void }) {
  return (
    <>
      <PanelHeader title="Hilfe" onBack={onBack} />
      <ul className="space-y-3 text-sm text-white/75 leading-relaxed">
        <li>
          <span className="text-white">Text ändern:</span> Blau umrandete Stellen
          anklicken und tippen. Geändertes wird grün.
        </li>
        <li>
          <span className="text-white">Bild tauschen:</span> Auf ein Bild klicken
          — dann aus der Mediathek wählen oder ein neues hochladen.
        </li>
        <li>
          <span className="text-white">Speichern:</span> Erst mit „Speichern"
          wird etwas für Besucher sichtbar. Ohne Speichern geht beim Neuladen
          nichts kaputt — es bleibt einfach beim alten Stand.
        </li>
        <li>
          <span className="text-white">Vertippt?</span> „Rückgängig" (Strg+Z)
          oder „Verwerfen" für alles auf einmal.
        </li>
        <li>
          <span className="text-white">Menü ändern:</span> Beschriftung,
          Reihenfolge und Sichtbarkeit unter „Seiten &amp; Menü" in der
          Verwaltung.
        </li>
      </ul>
    </>
  );
}

function PanelHeader({ title, onBack }: { title: string; onBack: () => void }) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <button
        onClick={onBack}
        aria-label="Zurück"
        className="h-7 w-7 grid place-items-center rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors focus-ring"
      >
        <ArrowLeft size={15} />
      </button>
      <span className="text-sm font-medium">{title}</span>
    </div>
  );
}
