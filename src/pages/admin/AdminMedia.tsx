import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2, Trash2 } from 'lucide-react';
import { useAdmin, adminErrorText, type MediaItem } from '../../lib/admin';

export function AdminMedia() {
  const { listImages, deleteImage } = useAdmin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busyName, setBusyName] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setErr('');
    try {
      setItems(await listImages());
    } catch (e) {
      setErr(adminErrorText(e));
    } finally {
      setLoading(false);
    }
  }, [listImages]);

  useEffect(() => {
    load();
  }, [load]);

  async function del(item: MediaItem) {
    if (busyName) return;
    if (!window.confirm(`Bild „${item.name}" löschen?`)) return;
    setBusyName(item.name);
    setErr('');
    const r = await deleteImage(item.name);
    setBusyName(null);
    if (r === 'ok') {
      setItems((prev) => prev.filter((i) => i.name !== item.name));
    } else if (r === 'in_use') {
      setErr('Dieses Bild wird noch auf der Website verwendet und ist geschützt.');
    } else {
      setErr('Löschen fehlgeschlagen.');
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
            <h1 className="hero-title text-white text-2xl md:text-3xl font-medium">Mediathek</h1>
          </div>
        </div>
        <button
          onClick={load}
          aria-label="Neu laden"
          className="h-10 w-10 grid place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors focus-ring"
        >
          <RefreshCw size={16} />
        </button>
      </div>

      <p className="text-white/55 text-sm mb-6">
        Über den Bearbeiten-Modus hochgeladene Bilder. Genutzte Bilder sind
        geschützt; ungenutzte kannst du hier entfernen.
      </p>

      {err && (
        <p role="alert" className="text-rose-300 text-sm mb-4">
          {err}
        </p>
      )}

      {loading ? (
        <div className="flex items-center gap-2 text-white/55 py-16 justify-center">
          <Loader2 size={18} className="animate-spin" /> lädt …
        </div>
      ) : items.length === 0 ? (
        <p className="text-white/50 text-sm py-16 text-center">
          Noch keine Bilder hochgeladen. Tausche im Bearbeiten-Modus ein Bild aus,
          dann erscheint es hier.
        </p>
      ) : (
        <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <li
              key={item.name}
              className="rounded-2xl border border-white/12 bg-white/[0.03] overflow-hidden"
            >
              <div className="relative aspect-[4/3] bg-neutral-900">
                <img
                  src={item.url}
                  alt=""
                  loading="lazy"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                {item.inUse && (
                  <span className="absolute top-2 left-2 text-[10px] tracking-wider uppercase px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-100 border border-emerald-300/40">
                    in Verwendung
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="text-white/60 text-xs truncate" title={item.name}>
                  {item.size != null ? `${Math.round(item.size / 1024)} KB` : item.name}
                </span>
                <button
                  onClick={() => del(item)}
                  disabled={item.inUse || busyName === item.name}
                  aria-label={`Bild ${item.name} löschen`}
                  className="shrink-0 h-8 w-8 grid place-items-center rounded-full border border-white/20 text-white/70 hover:text-rose-200 hover:border-rose-500/40 hover:bg-rose-500/10 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
                >
                  {busyName === item.name ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Trash2 size={14} />
                  )}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
