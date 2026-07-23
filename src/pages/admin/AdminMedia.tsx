import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, RefreshCw, Loader2, Trash2, ImageUp, Copy, Check } from 'lucide-react';
import { useAdmin, adminErrorText, type MediaItem } from '../../lib/admin';

const MAX_BYTES = 5 * 1024 * 1024;
const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp']);

export function AdminMedia() {
  const { listImages, deleteImage, uploadToLibrary } = useAdmin();
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');
  const [busyName, setBusyName] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

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

  async function onUpload(file: File | null) {
    if (!file) return;
    if (file.size > MAX_BYTES) return setErr('Das Bild ist größer als 5 MB.');
    if (file.type && !ALLOWED.has(file.type)) return setErr('Nur JPG, PNG oder WebP.');
    setErr('');
    setUploading(true);
    const r = await uploadToLibrary(file);
    setUploading(false);
    if (r === 'ok') await load();
    else setErr(r === 'unauthorized' ? 'Sitzung abgelaufen — bitte neu anmelden.' : 'Upload fehlgeschlagen.');
  }

  async function copyUrl(item: MediaItem) {
    try {
      await navigator.clipboard.writeText(item.url);
      setCopied(item.name);
      window.setTimeout(() => setCopied(null), 2000);
    } catch {
      setErr('Kopieren hat nicht geklappt — Adresse per Rechtsklick übernehmen.');
    }
  }

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

      <p className="text-white/55 text-sm mb-5 leading-relaxed">
        Alle Bilder, die auf der Website eingesetzt werden können. Lade hier
        Bilder auf Vorrat hoch — im Bearbeiten-Modus klickst du dann einfach auf
        ein Bild der Website und wählst eines davon aus. Genutzte Bilder sind
        gegen Löschen geschützt.
      </p>

      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="inline-flex items-center gap-2 bg-white text-black rounded-full px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-40 transition-colors focus-ring"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <ImageUp size={15} />}
          Bild hochladen
        </button>
        <span className="text-white/40 text-xs">JPG, PNG oder WebP · bis 5 MB</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => {
            const file = e.target.files?.[0] ?? null;
            e.target.value = '';
            onUpload(file);
          }}
          className="sr-only"
        />
      </div>

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
          Noch keine Bilder. Lade oben eines hoch — es steht danach im
          Bearbeiten-Modus überall zur Auswahl.
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
                  onClick={() => copyUrl(item)}
                  aria-label={`Adresse von ${item.name} kopieren`}
                  title="Bild-Adresse kopieren"
                  className="shrink-0 h-8 w-8 grid place-items-center rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-ring"
                >
                  {copied === item.name ? <Check size={14} /> : <Copy size={14} />}
                </button>
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
