import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Inbox,
  FileText,
  Images,
  Files,
  Pencil,
  LogOut,
  type LucideIcon,
} from 'lucide-react';
import { useAdmin } from '../../lib/admin';
import { useContent } from '../../lib/content';
import { brand } from '../../data/content';

type CountKey = 'anfragen' | 'bewerbungen';
/** Ohne `to` ist die Kachel keine Route, sondern startet den Bearbeiten-Modus. */
type Tile = {
  key: string;
  to?: string;
  label: string;
  Icon: LucideIcon;
  hint: string;
  countKey?: CountKey;
};

// Alle Kacheln sind aktiv. „Termine" (Online-Terminbuchung) ist bewusst nicht
// Teil der Verwaltung — Termine laufen weiter über Anfrage und Telefon.
const TILES: Tile[] = [
  { key: 'anfragen', to: '/admin/anfragen', label: 'Anfragen', Icon: Inbox, hint: '', countKey: 'anfragen' },
  { key: 'bewerbungen', to: '/admin/bewerbungen', label: 'Bewerbungen', Icon: FileText, hint: '', countKey: 'bewerbungen' },
  { key: 'mediathek', to: '/admin/mediathek', label: 'Mediathek', Icon: Images, hint: 'Bilder verwalten & ungenutzte löschen' },
  {
    key: 'seiten',
    to: '/admin/seiten',
    label: 'Seiten & Menü',
    Icon: Files,
    hint: 'Menü beschriften, sortieren, ein- und ausblenden',
  },
  {
    key: 'bearbeiten',
    label: 'Seite bearbeiten',
    Icon: Pencil,
    hint: 'Texte und Bilder direkt auf der Website ändern',
  },
];

export function AdminDashboard() {
  const { logout, listContacts, listJobs, pw } = useAdmin();
  const { enterEditMode } = useContent();
  const navigate = useNavigate();
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
        {TILES.map(({ key, to, label, Icon, hint, countKey }) => {
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
                {countKey ? (
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

          const cls =
            'rounded-2xl border p-6 transition-colors block text-left bg-white/[0.04] border-white/15 hover:border-white/35 focus-ring';

          if (to) {
            return (
              <Link key={key} to={to} className={cls}>
                {inner}
              </Link>
            );
          }
          return (
            <button
              key={key}
              onClick={() => {
                enterEditMode(pw());
                navigate('/');
              }}
              className={cls}
            >
              {inner}
            </button>
          );
        })}
      </div>
    </section>
  );
}
