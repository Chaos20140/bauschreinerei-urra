import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { regions } from '../data/content';

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

export function ProjektePage() {
  return (
    <main className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="Projekte"
        title="Referenzen aus dem Sauerland und ganz Westfalen."
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
