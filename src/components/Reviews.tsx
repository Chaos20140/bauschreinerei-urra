import { useEffect, useState } from 'react';
import { Star, ExternalLink } from 'lucide-react';
import { reviews } from '../data/content';
import { supabase, isSupabaseConfigured, type ReviewRow } from '../lib/supabase';
import { BlurIn } from './BlurIn';

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

const FALLBACK_ITEMS: ReviewItem[] = reviews.items.map((r, idx) => ({
  key: `static-${idx}`,
  name: r.name,
  role: r.role,
  rating: r.rating,
  body: r.body,
  date: r.date,
}));

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
  return (
    <div className="flex items-center gap-0.5" aria-label={`${count} von 5 Sternen`}>
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

export function Reviews() {
  const [items, setItems] = useState<ReviewItem[]>(FALLBACK_ITEMS);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    let cancelled = false;
    (async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, author_name, author_role, rating, body, review_date, source, published, sort_order'
        )
        .eq('published', true)
        .order('sort_order', { ascending: true })
        .order('review_date', { ascending: false })
        .limit(12);
      if (cancelled) return;
      if (error || !data || data.length === 0) return;
      setItems((data as ReviewRow[]).map(rowToItem));
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section className="relative text-white py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 mb-12 md:mb-20">
          <BlurIn className="md:col-span-7">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              {reviews.eyebrow}
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[6vw] leading-[0.92]">
              {reviews.title}
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
            <p className="text-white/85 text-base md:text-lg leading-relaxed mb-6">
              {reviews.subtitle}
            </p>
            <div className="flex items-center gap-4">
              <Stars count={Math.round(reviews.rating)} />
              <span className="text-white text-lg md:text-xl font-medium">
                {reviews.rating.toLocaleString('de-DE', { minimumFractionDigits: 1 })}
              </span>
              <span className="text-white/55 text-sm">
                aus {reviews.count} Bewertungen
              </span>
            </div>
          </BlurIn>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
          {items.map((r, idx) => (
            <BlurIn key={r.key} delay={idx * 0.06}>
              <li className="h-full">
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
              </li>
            </BlurIn>
          ))}
        </ul>

        <BlurIn delay={0.4} className="mt-10 md:mt-14 flex items-center justify-between flex-wrap gap-4">
          <p className="text-white/55 text-xs md:text-sm">
            Quelle: Google Bewertungen
          </p>
          <a
            href={reviews.link}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-full border border-white/25 text-white/85 hover:bg-white/10 text-sm transition-colors no-shadow"
          >
            Alle Bewertungen auf Google
            <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
          </a>
        </BlurIn>
      </div>
    </section>
  );
}
