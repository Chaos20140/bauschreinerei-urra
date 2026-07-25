import { useEffect, useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { reviews } from '../data/content';
import { FN_KEY } from '../lib/admin-config';

/** Genau die Felder, die der Abruf unten anfordert. */
type ReviewRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  rating: number;
  body: string;
  review_date: string;
};

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const REST_REVIEWS = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/reviews`
  : '';
import { BlurIn } from './BlurIn';
import { Editable } from './editor/Editable';

type ReviewItem = {
  key: string;
  name: string;
  role: string | null;
  rating: number;
  body: string;
  date: string;
};

const MONTHS_DE = [
  'Januar', 'Februar', 'März', 'April', 'Mai', 'Juni',
  'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember',
] as const;

function formatGermanMonth(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return `${MONTHS_DE[d.getMonth()]} ${d.getFullYear()}`;
}

function rowToItem(row: ReviewRow): ReviewItem {
  return {
    key: row.id,
    name: row.author_name,
    role: row.author_role,
    rating: row.rating,
    body: row.body,
    date: formatGermanMonth(row.review_date),
  };
}

function Stars({ count }: { count: number }) {
  // role="img" ist nötig, damit das aria-label überhaupt vorgelesen wird —
  // auf einem generischen <div> ignorieren Screenreader es.
  return (
    <div
      className="flex items-center gap-0.5"
      role="img"
      aria-label={`${count} von 5 Sternen`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          className="h-3.5 w-3.5 md:h-4 md:w-4"
          fill={i < count ? '#FBBF24' : 'transparent'}
          stroke={i < count ? '#FBBF24' : 'rgba(255,255,255,0.3)'}
          strokeWidth={1.5}
        />
      ))}
    </div>
  );
}

/**
 * Es werden ausschließlich die echten, in der Datenbank gepflegten
 * Google-Bewertungen angezeigt.
 *
 * Früher stand hier eine Liste erfundener Stimmen („Familie B.", „Herr S." …)
 * als Startzustand — sichtbar bei jedem Seitenaufruf, bis die echten geladen
 * waren, und dauerhaft, wenn das Laden scheiterte. Unter der Überschrift
 * „Quelle: Google Bewertungen" sind erfundene Stimmen wettbewerbswidrig.
 * Solange nichts geladen ist, bleibt der Abschnitt deshalb leer; kommt nichts,
 * verschwindet er ganz.
 */
export function Reviews() {
  // null = noch nicht geladen, [] = nichts vorhanden → Abschnitt entfällt.
  const [items, setItems] = useState<ReviewItem[] | null>(null);

  useEffect(() => {
    let cancelled = false;

    // Bewusst ein schlichter REST-Aufruf statt supabase-js: Der Client wiegt
    // rund 55 kB gzip und wurde allein für diese Liste auf der Startseite
    // nachgeladen. Die Tabelle ist öffentlich lesbar (nur freigegebene
    // Einträge), der Publishable Key genügt — derselbe Weg wie im
    // ContentProvider.
    if (!REST_REVIEWS || !FN_KEY) {
      setItems([]);
      return;
    }

    const query =
      '?select=id,author_name,author_role,rating,body,review_date' +
      '&published=eq.true&order=sort_order.asc,review_date.desc&limit=12';

    fetch(REST_REVIEWS + query, {
      headers: { apikey: FN_KEY, Authorization: `Bearer ${FN_KEY}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: ReviewRow[]) => {
        if (cancelled) return;
        setItems(Array.isArray(rows) ? rows.map(rowToItem) : []);
      })
      .catch(() => {
        // Ohne Bewertungen entfällt der Abschnitt — lieber keine als erfundene.
        if (!cancelled) setItems([]);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Nichts geladen (noch nicht da oder keine vorhanden) → kein Abschnitt.
  // Lieber gar keine Bewertungen zeigen als erfundene.
  if (!items || items.length === 0) return null;

  const durchschnitt = items.reduce((sum, r) => sum + r.rating, 0) / items.length;

  return (
    <section className="relative text-white py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 mb-12 md:mb-20">
          <BlurIn className="md:col-span-7">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="home.reviews.eyebrow">{reviews.eyebrow}</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[6vw] leading-[0.92]">
              <Editable id="home.reviews.title">{reviews.title}</Editable>
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-6">
              <Editable id="home.reviews.subtitle">{reviews.subtitle}</Editable>
            </p>
            <div className="flex items-center gap-4">
              {/* Schnitt und Anzahl aus den echten Bewertungen berechnet —
                  vorher standen hier feste Zahlen im Code (5,0 aus 8). */}
              <Stars count={Math.round(durchschnitt)} />
              <span className="text-white text-lg md:text-xl font-medium">
                {durchschnitt.toLocaleString('de-DE', {
                  minimumFractionDigits: 1,
                  maximumFractionDigits: 1,
                })}
              </span>
              <span className="text-white/55 text-sm">
                aus {items.length} {items.length === 1 ? 'Bewertung' : 'Bewertungen'}
              </span>
            </div>
          </BlurIn>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((r, idx) => (
            // as="li": ohne das schöbe BlurIn ein <div> zwischen <ul> und
            // <li> — ungültiges HTML, und Screenreader verlieren die
            // Listensemantik ("3 von 12 Bewertungen").
            <BlurIn as="li" key={r.key} delay={idx * 0.06} className="h-full">
              <a
                href={reviews.link}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7 flex flex-col group transition-all duration-500 hover:border-white/30 hover:bg-white/[0.06] hover:-translate-y-1 no-shadow"
                aria-label={`Bewertung von ${r.name} auf Google ansehen`}
              >
                <div className="flex items-center justify-between gap-3 mb-4">
                  <Stars count={r.rating} />
                  <ExternalLink
                    className="h-3.5 w-3.5 text-white/40 group-hover:text-white/85 transition-colors"
                    strokeWidth={2}
                  />
                </div>
                <p className="text-white/90 text-sm md:text-[15px] leading-relaxed mb-6 flex-1">
                  „{r.body}"
                </p>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-white text-sm font-medium">{r.name}</p>
                  <p className="text-white/55 text-xs mt-0.5">
                    {r.role ? `${r.role} · ` : ''}{r.date}
                  </p>
                </div>
              </a>
            </BlurIn>
          ))}
        </ul>

        <BlurIn delay={0.4} className="mt-10 md:mt-14 flex items-center justify-between flex-wrap gap-4">
          <p className="text-white/55 text-xs md:text-sm">
            <Editable id="home.reviews.source">Quelle: Google Bewertungen</Editable>
          </p>
          <a
            href={reviews.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/25 text-white/85 hover:bg-white/10 text-sm transition-colors no-shadow"
          >
            <Editable id="home.reviews.cta">Alle Bewertungen auf Google</Editable>
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          </a>
        </BlurIn>
      </div>
    </section>
  );
}
