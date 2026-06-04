import { useNavigate, Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { ThreeDPhotoCarousel } from '../components/ThreeDPhotoCarousel';
import { projectList, regions } from '../data/content';

const BASE = import.meta.env.BASE_URL;

const CATEGORIES = [
  {
    title: 'Privatbau',
    body: 'Einfamilien- und Mehrfamilienhäuser, Neubauten und individuelle Anbauten. Moderne Fenster, Eingangstüren und Schiebetüren — komplett geplant, geliefert und montiert.',
    tags: ['Neubau', 'Einfamilienhaus', 'Eingangsbereich'],
  },
  {
    title: 'Sanierung & Modernisierung',
    body: 'Austausch alter Fenster und Türen mit Blick auf Energieeffizienz, Schallschutz und Einbruchhemmung. Fachgerechte Demontage, saubere Baustelle, RAL-konforme Montage.',
    tags: ['Altbau', 'Energetisch', 'RC-2'],
  },
  {
    title: 'Gewerbe & Sondermaße',
    body: 'Objekttüren, große Festverglasungen und Schiebeelemente für Gewerbeobjekte. Abgestimmt auf Nutzungsanforderungen, Brandschutz und Barrierefreiheit.',
    tags: ['Objekt', 'Großformat', 'Sondermaß'],
  },
] as const;

const HIGHLIGHTS = [
  { value: '20+', label: 'Jahre Erfahrung' },
  { value: '3', label: 'Regionen flächendeckend' },
  { value: '100%', label: 'eigenes Montage-Team' },
  { value: 'RAL', label: 'zertifizierte Montage' },
] as const;

const CAROUSEL_SLIDES = projectList.map((p) => ({
  src: `${BASE}${p.hero}`,
  alt: p.title,
  caption: p.title,
  meta: `${p.category} · ${p.location}`,
  slug: p.slug,
}));

export function ProjektePage() {
  const navigate = useNavigate();

  return (
    <main className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="Projekte"
        title="Referenzen aus dem Sauerland und ganz Nordrhein-Westfalen."
        intro="Jedes Objekt hat seine eigene Geschichte — von der kleinen Sanierung bis zum Gewerbeobjekt. Seit 2003 begleiten wir Bauherren in drei Regionen mit Fachhandwerk auf hohem Niveau."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Objektarten
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Was wir umsetzen.
            </h2>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {CATEGORIES.map((c, idx) => (
              <BlurIn key={c.title} delay={idx * 0.1}>
                <li className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9 flex flex-col">
                  <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-5">
                    {c.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 flex-1">
                    {c.body}
                  </p>
                  <ul className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                    {c.tags.map((t) => (
                      <li
                        key={t}
                        className="text-white/65 text-xs tracking-wider px-3 py-1 rounded-full border border-white/15"
                      >
                        {t}
                      </li>
                    ))}
                  </ul>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 md:mb-14 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Referenzen
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Aus unserer Werkstatt.
            </h2>
            <p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed">
              Stöbern Sie durchs Karussell oder klicken Sie auf ein Projekt
              für die ausführliche Vorstellung mit Eckdaten und Bildern.
            </p>
          </BlurIn>

          <BlurIn delay={0.1}>
            <ThreeDPhotoCarousel
              slides={CAROUSEL_SLIDES}
              onSlideClick={(s) =>
                navigate(
                  `/projekte/${(s as (typeof CAROUSEL_SLIDES)[number]).slug}`
                )
              }
            />
          </BlurIn>

          <div className="mt-10 md:mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
            {projectList.map((p, idx) => (
              <BlurIn key={p.slug} delay={idx * 0.05}>
                <Link
                  to={`/projekte/${p.slug}`}
                  className="group block rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-white/30 hover:bg-white/[0.06] transition-all duration-500 no-shadow"
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <p className="text-white/55 text-[10px] tracking-[0.3em] uppercase">
                      {p.category} · {p.year}
                    </p>
                    <ArrowUpRight
                      className="h-4 w-4 text-white/40 group-hover:text-white group-hover:rotate-45 transition-all duration-300"
                      strokeWidth={2}
                    />
                  </div>
                  <h3 className="hero-title text-white text-base md:text-lg font-medium leading-snug">
                    {p.title}
                  </h3>
                  <p className="text-white/55 text-xs mt-1">{p.location}</p>
                </Link>
              </BlurIn>
            ))}
          </div>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Eckdaten
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Das spricht für uns.
            </h2>
          </BlurIn>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {HIGHLIGHTS.map((h, idx) => (
              <BlurIn key={h.label} delay={idx * 0.07}>
                <li className="border-t border-white/15 pt-6">
                  <p className="hero-title text-white text-4xl md:text-5xl lg:text-6xl font-medium mb-2">
                    {h.value}
                  </p>
                  <p className="text-white/70 text-xs md:text-sm tracking-[0.2em] uppercase">
                    {h.label}
                  </p>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Servicegebiet
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Wo wir bauen.
            </h2>
          </BlurIn>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {regions.areas.map((area, idx) => (
              <BlurIn key={area.key} delay={idx * 0.08}>
                <div>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-5 border-b border-white/15 pb-3">
                    {area.key}
                  </h3>
                  <ul className="flex flex-wrap gap-x-3 gap-y-2 text-white/75 text-sm md:text-base">
                    {area.cities.map((city, cidx) => (
                      <li key={city} className="flex items-center gap-3">
                        <span>{city}</span>
                        {cidx < area.cities.length - 1 && (
                          <span className="text-white/30">·</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurIn>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock
        title="Ihr nächstes Projekt."
        body="Schicken Sie uns die Eckdaten — Adresse, gewünschte Elemente, Zeithorizont. Wir melden uns binnen 24 Stunden."
      />
    </main>
  );
}
