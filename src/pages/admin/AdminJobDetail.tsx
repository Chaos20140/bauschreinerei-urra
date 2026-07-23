import { useEffect, useRef, useState } from 'react';
import {
  X,
  Mail,
  Phone,
  Archive,
  ArchiveRestore,
  Trash2,
  Loader2,
  Download,
} from 'lucide-react';
import { useAdmin, adminErrorText, type JobRow } from '../../lib/admin';
import { STATUS_META, STATUS_ORDER, formatDate } from './contactFields';

type Props = {
  row: JobRow;
  onClose: () => void;
  onChanged: (row: JobRow) => void;
  onDeleted: (id: string) => void;
};

export function AdminJobDetail({ row, onClose, onChanged, onDeleted }: Props) {
  const { updateJob, deleteJob, cvUrl } = useAdmin();
  const [note, setNote] = useState(row.admin_note ?? '');
  const [busy, setBusy] = useState(false);
  const [cvBusy, setCvBusy] = useState(false);
  const [err, setErr] = useState('');

  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    setNote(row.admin_note ?? '');
    setErr('');
  }, [row.id, row.admin_note]);

  useEffect(() => {
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      const items = Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), textarea, select, input'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (e.shiftKey && (active === first || !panelRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      returnFocusRef.current?.focus?.();
    };
  }, [onClose]);

  async function run<T>(fn: () => Promise<T>): Promise<T | undefined> {
    if (busy) return;
    setBusy(true);
    setErr('');
    try {
      return await fn();
    } catch (e) {
      setErr(adminErrorText(e));
      return undefined;
    } finally {
      setBusy(false);
    }
  }

  const setStatus = (status: string) =>
    run(() => updateJob(row.id, { admin_status: status })).then((r) => r && onChanged(r));
  const saveNote = () =>
    run(() => updateJob(row.id, { admin_note: note })).then((r) => r && onChanged(r));
  const toggleArchive = () =>
    run(() => updateJob(row.id, { admin_archived: !row.admin_archived })).then(
      (r) => r && onChanged(r)
    );
  const del = () =>
    run(async () => {
      await deleteJob(row.id);
      onDeleted(row.id);
    });

  async function downloadCv() {
    if (cvBusy) return;
    setCvBusy(true);
    setErr('');
    try {
      const url = await cvUrl(row.id);
      if (!url) {
        setErr('Der Lebenslauf konnte nicht geladen werden.');
        return;
      }
      // Signierter Link mit Download-Disposition — öffnet den Speichern-Dialog.
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (e) {
      setErr(adminErrorText(e));
    } finally {
      setCvBusy(false);
    }
  }

  const noteDirty = note !== (row.admin_note ?? '');

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      <button aria-label="Schließen" onClick={onClose} className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={`Bewerbung von ${row.name}`}
        className="relative h-dvh w-full max-w-md bg-neutral-950 border-l border-white/15 overflow-y-auto"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-6 py-4 bg-neutral-950/95 backdrop-blur border-b border-white/10">
          <div className="min-w-0">
            <p className="text-white/50 text-[10px] tracking-[0.25em] uppercase">
              {formatDate(row.created_at)}
            </p>
            <h2 className="hero-title text-white text-xl font-medium truncate">{row.name}</h2>
          </div>
          <button
            ref={closeRef}
            onClick={onClose}
            aria-label="Schließen"
            className="shrink-0 h-10 w-10 grid place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors focus-ring"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {/* Status */}
          <div>
            <p className="text-white/55 text-xs tracking-[0.2em] uppercase mb-2">Status</p>
            <div className="flex flex-wrap gap-2">
              {STATUS_ORDER.map((s) => {
                const active = (row.admin_status ?? 'neu') === s;
                return (
                  <button
                    key={s}
                    onClick={() => !active && setStatus(s)}
                    disabled={busy}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors focus-ring disabled:opacity-60 ${
                      active
                        ? STATUS_META[s].badge
                        : 'border-white/20 text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {STATUS_META[s].label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Eckdaten */}
          <dl className="space-y-3 text-sm">
            <Row label="E-Mail" value={row.email} />
            {row.phone && <Row label="Telefon" value={row.phone} />}
            {row.position && <Row label="Position" value={row.position} />}
          </dl>

          {/* Lebenslauf */}
          {row.has_cv && (
            <div>
              <p className="text-white/55 text-xs tracking-[0.2em] uppercase mb-2">Lebenslauf</p>
              <button
                onClick={downloadCv}
                disabled={cvBusy}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-60 transition-colors focus-ring"
              >
                {cvBusy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
                {row.cv_filename || 'Lebenslauf herunterladen'}
              </button>
            </div>
          )}

          {/* Anschreiben */}
          {row.message && (
            <div>
              <p className="text-white/55 text-xs tracking-[0.2em] uppercase mb-2">Anschreiben</p>
              <p className="text-white/85 text-sm leading-relaxed whitespace-pre-wrap rounded-xl border border-white/10 bg-white/[0.03] p-4">
                {row.message}
              </p>
            </div>
          )}

          {/* Schnellaktionen */}
          <div className="flex flex-wrap gap-2">
            <a
              href={`mailto:${row.email}`}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 transition-colors focus-ring"
            >
              <Mail size={15} /> Antworten
            </a>
            {row.phone && (
              <a
                href={`tel:${row.phone.replace(/[^\d+]/g, '')}`}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 transition-colors focus-ring"
              >
                <Phone size={15} /> Anrufen
              </a>
            )}
          </div>

          {/* Interne Notiz */}
          <div>
            <label
              htmlFor="job-note"
              className="block text-white/55 text-xs tracking-[0.2em] uppercase mb-2"
            >
              Interne Notiz
            </label>
            <textarea
              id="job-note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              maxLength={2000}
              placeholder="Nur für euch — z. B. Vorstellungsgespräch am … "
              className="w-full rounded-xl bg-neutral-900/80 border border-white/15 px-4 py-3 text-white text-sm placeholder:text-white/35 resize-y focus-ring"
            />
            {noteDirty && (
              <button
                onClick={saveNote}
                disabled={busy}
                className="mt-2 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-neutral-200 disabled:opacity-60 transition-colors focus-ring"
              >
                {busy ? <Loader2 size={14} className="animate-spin" /> : null} Notiz speichern
              </button>
            )}
          </div>

          {err && (
            <p role="alert" className="text-rose-300 text-sm">
              {err}
            </p>
          )}

          {/* Verwaltung */}
          <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
            <button
              onClick={toggleArchive}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/20 text-white/80 text-sm hover:bg-white/10 disabled:opacity-60 transition-colors focus-ring"
            >
              {row.admin_archived ? <ArchiveRestore size={15} /> : <Archive size={15} />}
              {row.admin_archived ? 'Aus Archiv holen' : 'Archivieren'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('Diese Bewerbung endgültig löschen? Der Lebenslauf wird mitgelöscht.'))
                  del();
              }}
              disabled={busy}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-rose-500/40 text-rose-200 text-sm hover:bg-rose-500/10 disabled:opacity-60 transition-colors focus-ring"
            >
              <Trash2 size={15} /> Löschen
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
      <dt className="text-white/55 shrink-0">{label}</dt>
      <dd className="text-white text-right break-all">{value}</dd>
    </div>
  );
}
