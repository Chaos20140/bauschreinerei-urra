import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  FileText,
  CalendarDays,
  Images,
  Files,
  Pencil,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAdmin } from '../../lib/admin';
import { brand } from '../../data/content';

type CountKey = 'anfragen' | 'bewerbungen';
type Tile = {
  key: string;
  to?: string;
  label: string;
  Icon: LucideIcon;
  hint: string;
  active: boolean;
  countKey?: CountKey;
};

// Etappe 2: „Anfragen" und „Bewerbungen" sind aktiv (je mit Live-Zähler). Die
// übrigen Kacheln zeigen den Ausbaupfad, sind aber noch nicht verlinkt.
const TILES: Tile[] = [
  { key: 'anfragen', to: '/admin/anfragen', label: 'Anfragen', Icon: Inbox, hint: '', active: true, countKey: 'anfragen' },
  { key: 'bewerbungen', to: '/admin/bewerbungen', label: 'Bewerbungen', Icon: FileText, hint: '', active: true, countKey: 'bewerbungen' },
  { key: 'termine', label: 'Termine', Icon: CalendarDays, hint: 'In Vorbereitung', active: false },
  { key: 'mediathek', label: 'Mediathek', Icon: Images, hint: 'In Vorbereitung', active: false },
  { key: 'seiten', label: 'Seiten & Menü', Icon: Files, hint: 'In Vorbereitung', active: false },
  { key: 'bearbeiten', label: 'Seite bearbeiten', Icon: Pencil, hint: 'In Vorbereitung', active: false },
];

export function AdminDashboard() {
  const { logout, listContacts, listJobs } = useAdmin();
  const [counts, setCounts] = useState<Record<CountKey, number | null>>({
    anfragen: null,
    bewerbungen: null,
  });

  useEffect(() => {
    let alive = true;
    const neuCount = (items: { admin_status: string }[]) =>
      items.filter((r) => (r.admin_status ?? 'neu') === 'neu').length;

    listContacts()
      .then((items) => alive && setCounts((c) => ({ ...c, anfragen: neuCount(items) })))
      .catch(() => alive && setCounts((c) => ({ ...c, anfragen: -1 })));
    listJobs()
      .then((items) => alive && setCounts((c) => ({ ...c, bewerbungen: neuCount(items) })))
      .catch(() => alive && setCounts((c) => ({ ...c, bewerbungen: -1 })));

    return () => {
      alive = false;
    };
  }, [listContacts, listJobs]);

  return (
    <section className="max-w-5xl mx-auto px-6 py-14">
      <div className="flex items-start justify-between gap-4 mb-10">
        <div>
          <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-1">
            {brand.shortName}
          </p>
          <h1 className="hero-title text-white text-3xl md:text-4xl font-medium">
            Verwaltung
          </h1>
        </div>
        <button
          onClick={logout}
          className="inline-flex items-center gap-2 text-sm text-white/70 hover:text-white px-4 py-2 rounded-full border border-white/20 hover:bg-white/10 transition-colors focus-ring"
        >
          <LogOut size={16} strokeWidth={1.5} /> Abmelden
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {TILES.map(({ key, to, label, Icon, hint, active, countKey }) => {
          const count = countKey ? counts[countKey] : null;
          const inner = (
            <>
              <div className="flex items-center gap-3 mb-4">
                <span className="inline-flex items-center justify-center h-10 w-10 rounded-xl bg-white/10 border border-white/15 text-white">
                  <Icon size={20} strokeWidth={1.5} />
                </span>
                <span className="text-lg font-medium text-white">{label}</span>
              </div>
              <div className="text-sm text-white/55">
                {active ? (
                  count === null ? (
                    'lädt …'
                  ) : count < 0 ? (
                    '—'
                  ) : (
                    <>
                      <span className="text-white font-semibold">{count}</span> neu
                    </>
                  )
                ) : (
                  hint
                )}
              </div>
            </>
          );

          const base =
            'rounded-2xl border p-6 transition-colors block text-left';
          if (active && to) {
            return (
              <Link
                key={key}
                to={to}
                className={`${base} bg-white/[0.04] border-white/15 hover:border-white/35 focus-ring`}
              >
                {inner}
              </Link>
            );
          }
          return (
            <div
              key={key}
              aria-disabled="true"
              className={`${base} bg-white/[0.02] border-white/10 opacity-60 cursor-not-allowed`}
            >
              {inner}
            </div>
          );
        })}
      </div>
    </section>
  );
}
