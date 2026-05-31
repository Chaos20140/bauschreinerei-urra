import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { services, products } from '../data/content';

const PROCESS = [
  {
    step: '01',
    title: 'beratung',
    body: 'Persönlicher Termin bei Ihnen vor Ort. Wir hören zu, klären den Bedarf und zeigen passende Lösungen.',
  },
  {
    step: '02',
    title: 'aufmaß',
    body: 'Millimetergenaues digitales Aufmaß mit der metiscale-App. Keine bösen Überraschungen, kein Nachmessen.',
  },
  {
    step: '03',
    title: 'angebot',
    body: 'Transparentes Festpreisangebot mit allen Leistungen, Materialien und Montageschritten.',
  },
  {
    step: '04',
    title: 'demontage',
    body: 'Fachgerechter Ausbau der alten Elemente, saubere Baustelle und Entsorgung nach AbfRL-Vorschrift.',
  },
  {
    step: '05',
    title: 'montage',
    body: 'RAL-zertifizierte Montage nach EnEV-Standard durch unser eigenes Team — kein Subunternehmer.',
  },
  {
    step: '06',
    title: 'abnahme',
    body: 'Gemeinsame Abnahme, Einweisung in Pflege und Bedienung sowie Übergabe aller Dokumente.',
  },
] as const;

const MATERIALS = [
  {
    name: 'kunststoff',
    body: 'Pflegeleicht, formstabil und mit modernen Mehrkammerprofilen energieeffizient. Die meistgewählte Basis für Neubau und Sanierung.',
  },
  {
    name: 'aluminium',
    body: 'Schlanke Ansichtsbreiten, hohe Statik, ideal für großflächige Verglasungen, Schiebeelemente und Gewerbeobjekte.',
  },
  {
    name: 'holz / holz-alu',
    body: 'Natürliche Optik innen, wetterfeste Alu-Schale außen. Wertbeständig, ökologisch und besonders langlebig.',
  },
] as const;

export function LeistungenPage() {
  return (
    <main className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="leistungen"
        title="rundum-service vom aufmaß bis zur fachgerechten montage."
        intro="Wir sind Ihr alleiniger Ansprechpartner — von der ersten Beratung bis zur Einbau-Abnahme. Kein Subunternehmer, keine Schnittstellen, keine Ausreden."
      />

      <section className="relative px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="grid md:grid-cols-12 gap-8 mb-12 md:mb-16">
            <div className="md:col-span-6">
              <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
                kernleistungen
              </p>
              <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
                das machen wir.
              </h2>
            </div>
            <p className="md:col-span-5 md:col-start-8 self-end text-white/85 text-base md:text-lg leading-relaxed">
              Drei Kompetenz-Säulen, die ineinandergreifen — sauber dokumentiert,
              nach RAL ausgeführt, EnEV-konform.
            </p>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {services.items.map((item, idx) => (
              <BlurIn key={item.id} delay={idx * 0.1}>
                <li className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
                  <p className="text-white/40 text-xs tracking-widest mb-6">
                    {item.number}
                  </p>
                  <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-4">
                    {item.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {item.body}
                  </p>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              ablauf
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              wie wir arbeiten.
            </h2>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed">
              Vom ersten Anruf bis zur Abnahme — sechs Schritte, keine
              Überraschungen.
            </p>
          </BlurIn>

          <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {PROCESS.map((p, idx) => (
              <BlurIn key={p.step} delay={idx * 0.06}>
                <li className="grid grid-cols-[auto_1fr] gap-5 md:gap-7 border-t border-white/15 pt-6">
                  <span className="text-white/50 text-sm md:text-base tracking-widest">
                    {p.step}
                  </span>
                  <div>
                    <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                      {p.title}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                      {p.body}
                    </p>
                  </div>
                </li>
              </BlurIn>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              materialien
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              kunststoff. aluminium. holz.
            </h2>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed">
              Wir beraten ergebnisoffen — welches Material das richtige ist, hängt
              vom Objekt, der Nutzung und Ihrem Budget ab.
            </p>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {MATERIALS.map((m, idx) => (
              <BlurIn key={m.name} delay={idx * 0.1}>
                <li className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
                  <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-4">
                    {m.name}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {m.body}
                  </p>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              produkte
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              fenster, türen, tore.
            </h2>
          </BlurIn>
          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {products.categories.map((cat, idx) => (
              <BlurIn key={cat.title} delay={idx * 0.08}>
                <li className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
                  <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-6 flex items-baseline justify-between">
                    {cat.title}
                    <span className="text-white/35 text-xs tracking-widest">
                      {String(cat.items.length).padStart(2, '0')}
                    </span>
                  </h3>
                  <ul className="space-y-2 text-white/85 text-sm md:text-base">
                    {cat.items.map((it) => (
                      <li key={it} className="border-t border-white/10 pt-2">
                        {it}
                      </li>
                    ))}
                  </ul>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        title="bereit für ihr projekt?"
        body="Erzählen Sie uns, was Sie vorhaben — wir kommen vorbei, messen auf und beraten ergebnisoffen."
      />
    </main>
  );
}
