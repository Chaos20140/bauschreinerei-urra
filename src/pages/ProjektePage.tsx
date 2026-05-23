import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { regions } from '../data/content';

const CATEGORIES = [
  {
    title: 'privatbau',
    body: 'einfamilien- und mehrfamilienhäuser, neubauten und individuelle anbauten. moderne fenster, eingangstüren und schiebetüren — komplett geplant, geliefert und montiert.',
    tags: ['neubau', 'einfamilienhaus', 'eingangsbereich'],
  },
  {
    title: 'sanierung & modernisierung',
    body: 'austausch alter fenster und türen mit blick auf energieeffizienz, schallschutz und einbruchhemmung. fachgerechte demontage, saubere baustelle, ral-konforme montage.',
    tags: ['altbau', 'energetisch', 'rc-2'],
  },
  {
    title: 'gewerbe & sondermaße',
    body: 'objekttüren, große festverglasungen und schiebeelemente für gewerbeobjekte. abgestimmt auf nutzungsanforderungen, brandschutz und barrierefreiheit.',
    tags: ['objekt', 'großformat', 'sondermaß'],
  },
] as const;

const HIGHLIGHTS = [
  { value: '20+', label: 'jahre erfahrung' },
  { value: '3', label: 'regionen flächendeckend' },
  { value: '100%', label: 'eigenes montage-team' },
  { value: 'ral', label: 'zertifizierte montage' },
] as const;

export function ProjektePage() {
  return (
    <main className="relative bg-neutral-950 min-h-screen text-white pb-12">
      <PageHero
        eyebrow="projekte"
        title="referenzen aus dem sauerland und ganz westfalen."
        intro="jedes objekt hat seine eigene geschichte — von der kleinen sanierung bis zum gewerbeobjekt. seit 2003 begleiten wir bauherren in drei regionen mit fachhandwerk auf hohem niveau."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              objektarten
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              was wir umsetzen.
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
              eckdaten
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              das spricht für uns.
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
              servicegebiet
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              wo wir bauen.
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
        title="ihr nächstes projekt."
        body="schicken sie uns die eckdaten — adresse, gewünschte elemente, zeithorizont. wir melden uns binnen 24 stunden."
      />
    </main>
  );
}
