import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowDown,
  ArrowUp,
  Eye,
  EyeOff,
  Loader2,
  RotateCcw,
  Save,
  Check,
} from 'lucide-react';
import { useAdmin } from '../../lib/admin';
import { useContent } from '../../lib/content';
import {
  isDefaultOrder,
  navIds,
  orderValues,
  useNavItems,
  type NavItem,
} from '../../lib/nav';

const MAX_LABEL = 40;

/** Die Seiten stehen im Code — hier wird nur ihre Darstellung im Menü verwaltet. */
export function AdminPages() {
  const { pw } = useAdmin();
  const { saveValues, resetValues } = useContent();
  const stored = useNavItems(true);

  const [items, setItems] = useState<NavItem[]>(stored);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');

  // Erst wenn die Overrides geladen sind, steht die echte Reihenfolge fest.
  // Danach übernimmt die lokale Bearbeitung — sonst würde sie überschrieben.
  const [touched, setTouched] = useState(false);
  useEffect(() => {
    if (!touched) setItems(stored);
  }, [stored, touched]);

  const changed = useMemo(
    () => JSON.stringify(items) !== JSON.stringify(stored),
    [items, stored]
  );
  const visibleCount = items.filter((i) => !i.hidden).length;

  function edit(key: string, patch: Partial<NavItem>) {
    setTouched(true);
    setMsg('');
    setItems((prev) => prev.map((i) => (i.key === key ? { ...i, ...patch } : i)));
  }

  function move(index: number, dir: -1 | 1) {
    const target = index + dir;
    if (target < 0 || target >= items.length) return;
    setTouched(true);
    setMsg('');
    setItems((prev) => {
      const next = [...prev];
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  }

  async function onSave() {
    if (busy || !changed) return;
    if (visibleCount === 0) {
      setErr('Mindestens ein Menüpunkt muss sichtbar bleiben.');
      return;
    }
    setBusy(true);
    setErr('');
    setMsg('');

    // Nur speichern, was vom Code abweicht — sonst den Override löschen. So
    // bleibt gespeichert, was wirklich geändert wurde, und spätere
    // Code-Änderungen greifen wieder durch.
    const defaultOrder = isDefaultOrder(items);
    const values: Record<string, string> = defaultOrder ? {} : orderValues(items);
    const resets: string[] = defaultOrder
      ? items.map((it) => navIds(it.key).order)
      : [];
    for (const it of items) {
      const ids = navIds(it.key);
      const label = it.label.trim().slice(0, MAX_LABEL);
      if (label && label !== it.defaultLabel) values[ids.label] = label;
      else resets.push(ids.label);
      if (it.hidden) values[ids.hidden] = '1';
      else resets.push(ids.hidden);
    }

    const password = pw();
    const a = await saveValues(values, password);
    const b = a.ok ? await resetValues(resets, password) : a;
    setBusy(false);

    if (a.ok && b.ok) {
      setTouched(false);
      setMsg('Gespeichert — das Menü ist sofort aktualisiert.');
      window.setTimeout(() => setMsg(''), 4000);
    } else {
      const code = a.ok ? b.error : a.error;
      setErr(
        code === '401'
          ? 'Sitzung abgelaufen — bitte neu anmelden.'
          : 'Speichern fehlgeschlagen.'
      );
    }
  }

  function onReset() {
    if (!window.confirm('Alle Menü-Anpassungen auf den Ursprungszustand zurücksetzen?')) {
      return;
    }
    setTouched(true);
    setMsg('');
    setItems((prev) =>
      [...prev]
        .map((i) => ({ ...i, label: i.defaultLabel, hidden: false }))
        // Nach defaultOrder sortieren, nicht nach der aktuellen Position —
        // sonst bliebe eine umsortierte Reihenfolge beim Zurücksetzen stehen.
        .sort((a, b) => a.defaultOrder - b.defaultOrder)
    );
  }

  return (
    <section className="max-w-3xl mx-auto px-6 py-10">
      <div className="flex items-center gap-4 mb-8 min-w-0">
        <Link
          to="/admin"
          aria-label="Zurück zur Übersicht"
          className="shrink-0 h-10 w-10 grid place-items-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors focus-ring"
        >
          <ArrowLeft size={18} />
        </Link>
        <div className="min-w-0">
          <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-1">Verwaltung</p>
          <h1 className="hero-title text-white text-2xl md:text-3xl font-medium">
            Seiten &amp; Menü
          </h1>
        </div>
      </div>

      <p className="text-white/55 text-sm mb-6 leading-relaxed">
        Beschriftung, Reihenfolge und Sichtbarkeit der Menüpunkte. Ausgeblendete
        Seiten bleiben über ihre Adresse erreichbar und in der Suchmaschine — sie
        stehen nur nicht mehr im Menü. Die Inhalte änderst du im{' '}
        <span className="text-white/80">Bearbeiten-Modus</span> direkt auf der Seite.
      </p>

      {err && (
        <p role="alert" className="text-rose-300 text-sm mb-4">
          {err}
        </p>
      )}

      <ul className="space-y-2.5 mb-6">
        {items.map((item, idx) => (
          <li
            key={item.key}
            className={`rounded-2xl border p-3 sm:p-4 flex items-center gap-2 sm:gap-3 transition-colors ${
              item.hidden
                ? 'border-white/10 bg-white/[0.015] opacity-60'
                : 'border-white/12 bg-white/[0.03]'
            }`}
          >
            <div className="flex flex-col shrink-0">
              <button
                onClick={() => move(idx, -1)}
                disabled={idx === 0}
                aria-label={`${item.label} nach oben`}
                className="h-6 w-7 grid place-items-center rounded text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-ring"
              >
                <ArrowUp size={14} />
              </button>
              <button
                onClick={() => move(idx, 1)}
                disabled={idx === items.length - 1}
                aria-label={`${item.label} nach unten`}
                className="h-6 w-7 grid place-items-center rounded text-white/60 hover:text-white hover:bg-white/10 disabled:opacity-25 disabled:cursor-not-allowed transition-colors focus-ring"
              >
                <ArrowDown size={14} />
              </button>
            </div>

            <div className="min-w-0 flex-1">
              <label className="sr-only" htmlFor={`nav-${item.key}`}>
                Beschriftung für {item.defaultLabel}
              </label>
              <input
                id={`nav-${item.key}`}
                value={item.label}
                maxLength={MAX_LABEL}
                onChange={(e) => edit(item.key, { label: e.target.value })}
                className="w-full bg-neutral-900 border border-white/15 rounded-lg px-3 py-2 text-white text-sm focus:border-white/40 focus:outline-none focus-ring"
              />
              <p className="text-white/35 text-[11px] mt-1 truncate">
                {item.href}
                {item.label.trim() !== item.defaultLabel && (
                  <span className="text-white/50"> · Standard: {item.defaultLabel}</span>
                )}
              </p>
            </div>

            <button
              onClick={() => edit(item.key, { hidden: !item.hidden })}
              aria-pressed={!item.hidden}
              aria-label={item.hidden ? `${item.defaultLabel} einblenden` : `${item.defaultLabel} ausblenden`}
              title={item.hidden ? 'Im Menü anzeigen' : 'Aus dem Menü ausblenden'}
              className="shrink-0 h-9 w-9 grid place-items-center rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-ring"
            >
              {item.hidden ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-3 border-t border-white/10 pt-5">
        <button
          onClick={onSave}
          disabled={busy || !changed}
          className="inline-flex items-center gap-2 bg-white text-black rounded-full px-5 py-2.5 text-sm font-medium hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors focus-ring"
        >
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          Speichern
        </button>
        <button
          onClick={onReset}
          disabled={busy}
          className="inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2.5 text-sm text-white/75 hover:text-white hover:bg-white/10 disabled:opacity-40 transition-colors focus-ring"
        >
          <RotateCcw size={15} />
          Auf Standard zurücksetzen
        </button>
        {msg && (
          <span className="inline-flex items-center gap-1.5 text-emerald-300 text-sm">
            <Check size={15} /> {msg}
          </span>
        )}
        {changed && !msg && (
          <span className="text-white/50 text-sm">Nicht gespeicherte Änderungen</span>
        )}
      </div>

      <p className="text-white/35 text-xs mt-8 leading-relaxed">
        Impressum und Datenschutz stehen fest im Fußbereich — sie sind
        gesetzlich vorgeschrieben und lassen sich deshalb nicht ausblenden.
      </p>
    </section>
  );
}
