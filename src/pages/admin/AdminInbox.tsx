import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Download, Search, Loader2, RefreshCw } from 'lucide-react';
import { useAdmin, adminErrorText, type ContactRow } from '../../lib/admin';
import { STATUS_META, STATUS_ORDER, formatDate, searchHaystack, type StatusKey } from './contactFields';
import { AdminDetail } from './AdminDetail';

type Filter = 'alle' | StatusKey;
const FILTERS: Filter[] = ['alle', ...STATUS_ORDER];
const FILTER_LABEL: Record<Filter, string> = {
  alle: 'Alle',
  neu: 'Neu',
  in_bearbeitung: 'In Bearbeitung',
  erledigt: 'Erledigt',
};

export function AdminInbox() {
  const { listContacts, exportContacts } = useAdmin();
  const [rows, setRows] = useState<ContactRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [filter, setFilter] = useState<Filter>('alle');
  const [query, setQuery] = useState('');
  const [includeArchived, setIncludeArchived] = useState(false);
  const [openId, setOpenId] = useState<string | null>(null);
  const [exporting, setExporting] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      setRows(await listContacts(includeArchived));
    } catch (e) {
      setErr(adminErrorText(e));
    } finally {
      setLoading(false);
    }
  }, [listContacts, includeArchived]);

  useEffect(() => {
    load();
  }, [load]);

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (filter !== 'alle' && (r.admin_status ?? 'neu') !== filter) return false;
      if (q && !searchHaystack(r).includes(q)) return false;
      return true;
    });
  }, [rows, filter, query]);

  const openRow = rows.find((r) => r.id === openId) ?? null;

  const onChanged = (updated: ContactRow) =>
    setRows((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  const onDeleted = (id: string) => {
    setRows((prev) => prev.filter((r) => r.id !== id));
    setOpenId(null);
  };

  async function doExport() {
    if (exporting) return;
    setExporting(true);
    try {
      await exportContacts(includeArchived);
    } catch (e) {
      setErr(adminErrorText(e));
    } finally {
      setExporting(false);
    }
  }

  return (
    <section className="max-w-5xl mx-auto px-6 py-10">
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 min-w-0">
          <Link
            to="/admin"
            aria-label="Zurück zur Übersicht"
            className="shrink-0 h-10 w-10 grid place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors focus-ring"
          >
            <ArrowLeft size={18} />
          </Link>
          <div className="min-w-0">
            <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-1">Verwaltung</p>
            <h1 className="hero-title text-white text-2xl md:text-3xl font-medium">Anfragen</h1>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={load}
            aria-label="Neu laden"
            className="h-10 w-10 grid place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors focus-ring"
          >
            <RefreshCw size={16} />
          </button>
          <button
            onClick={doExport}
            disabled={exporting || rows.length === 0}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full border border-white/20 text-white text-sm hover:bg-white/10 disabled:opacity-50 transition-colors focus-ring"
          >
            {exporting ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />}
            CSV
          </button>
        </div>
      </div>

      {/* Filter + Suche */}
      <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
        <div className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3.5 py-1.5 rounded-full text-sm border transition-colors focus-ring ${
                filter === f
                  ? 'bg-white text-black border-white'
                  : 'border-white/20 text-white/65 hover:text-white hover:bg-white/10'
              }`}
            >
              {FILTER_LABEL[f]}
            </button>
          ))}
        </div>
        <div className="md:ml-auto relative">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Suchen …"
            aria-label="Anfragen durchsuchen"
            className="w-full md:w-64 rounded-full bg-neutral-900/80 border border-white/15 pl-9 pr-4 py-2.5 text-white text-sm placeholder:text-white/35 focus-ring"
          />
        </div>
      </div>

      <label className="inline-flex items-center gap-2 text-white/55 text-sm mb-5 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={includeArchived}
          onChange={(e) => setIncludeArchived(e.target.checked)}
          className="h-4 w-4 accent-white focus-ring rounded"
        />
        Archivierte anzeigen
      </label>

      {err && (
        <p role="alert" className="text-rose-300 text-sm mb-4">
          {err}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-white/55 py-16 justify-center">
          <Loader2 size={18} className="animate-spin" /> lädt …
        </div>
      ) : visible.length === 0 ? (
        <p className="text-white/50 text-sm py-16 text-center">
          {rows.length === 0 ? 'Noch keine Anfragen eingegangen.' : 'Keine Treffer für diese Filter.'}
        </p>
      ) : (
        <ul className="space-y-2">
          {visible.map((r) => {
            const meta = STATUS_META[r.admin_status ?? 'neu'];
            return (
              <li key={r.id}>
                <button
                  onClick={() => setOpenId(r.id)}
                  className="w-full text-left rounded-2xl border border-white/12 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/25 transition-colors p-4 md:p-5 focus-ring"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${meta.dot}`}
                        aria-hidden="true"
                      />
                      <span className="text-white font-medium truncate">{r.name}</span>
                      {r.admin_archived && (
                        <span className="text-white/40 text-[10px] tracking-wider uppercase shrink-0">
                          archiviert
                        </span>
                      )}
                    </div>
                    <span
                      className={`shrink-0 text-[11px] px-2.5 py-1 rounded-full border ${meta.badge}`}
                    >
                      {meta.label}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between gap-3 text-sm">
                    <span className="text-white/60 truncate">
                      {r.project_type ? `${r.project_type} · ` : ''}
                      {r.message}
                    </span>
                    <span className="text-white/40 text-xs shrink-0">
                      {formatDate(r.created_at)}
                    </span>
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      )}

      {openRow && (
        <AdminDetail
          row={openRow}
          onClose={() => setOpenId(null)}
          onChanged={onChanged}
          onDeleted={onDeleted}
        />
      )}
    </section>
  );
}
