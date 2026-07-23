import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { services, products } from '../data/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const BASE = import.meta.env.BASE_URL;

const TOOLS = [
  {
    src: 'leistungen/aufmass-app.webp',
    // Eigener alt-Text statt einer Wiederholung der Überschrift: sonst hören
    // Screenreader denselben Satz zweimal und erfahren nichts über das Bild.
    alt: 'Tablet mit der metiscale-Aufmaß-App vor einer Fensteröffnung, daneben ein Laser-Distanzmesser',
    eyebrow: 'Digital',
    title: 'metiscale-Aufmaß',
    body: 'Tablet plus Laser-Distanzmesser — millimetergenau in Echtzeit dokumentiert.',
    aspect: 'aspect-[4/3]',
  },
  {
    src: 'leistungen/montage.webp',
    alt: 'Monteur richtet einen Fensterrahmen in der Rohbauöffnung aus',
    eyebrow: 'Werkbank',
    title: 'Montage vor Ort',
    body: 'Festes Team, eigene Werkzeuge. RAL-konform fixiert, ausgerichtet, geprüft.',
    aspect: 'aspect-[4/3]',
  },
  {
    src: 'leistungen/abdichtung.webp',
    alt: 'Nahaufnahme einer gedämmten und abgedichteten Anschlussfuge zwischen Rahmen und Mauerwerk',
    eyebrow: 'Detail',
    title: 'Anschlussfuge dichten',
    body: 'Fachgerechte Dämmung gegen Wärmebrücken — Schicht für Schicht abgedichtet.',
    aspect: 'aspect-[4/3]',
  },
] as const;

const PROCESS = [
  {
    title: 'Beratung',
    body: 'Persönlicher Termin bei Ihnen vor Ort. Wir hören zu, klären den Bedarf und zeigen passende Lösungen.',
  },
  {
    title: 'Aufmaß',
    body: 'Millimetergenaues digitales Aufmaß mit der metiscale-App. Keine bösen Überraschungen, kein Nachmessen.',
  },
  {
    title: 'Angebot',
    body: 'Transparentes Festpreisangebot mit allen Leistungen, Materialien und Montageschritten.',
  },
  {
    title: 'Demontage',
    body: 'Fachgerechter Ausbau der alten Elemente, saubere Baustelle und Entsorgung nach AbfRL-Vorschrift.',
  },
  {
    title: 'Montage',
    body: 'RAL-zertifizierte Montage nach EnEV-Standard durch unser eigenes Team — kein Subunternehmer.',
  },
  {
    title: 'Abnahme',
    body: 'Gemeinsame Abnahme, Einweisung in Pflege und Bedienung sowie Übergabe aller Dokumente.',
  },
] as const;

const MATERIALS = [
  {
    name: 'Kunststoff',
    body: 'Pflegeleicht, formstabil und mit modernen Mehrkammerprofilen energieeffizient. Die meistgewählte Basis für Neubau und Sanierung.',
  },
  {
    name: 'Aluminium',
    body: 'Schlanke Ansichtsbreiten, hohe Statik, ideal für großflächige Verglasungen, Schiebeelemente und Gewerbeobjekte.',
  },
  {
    name: 'Holz / Holz-Alu',
    body: 'Natürliche Optik innen, wetterfeste Alu-Schale außen. Wertbeständig, ökologisch und besonders langlebig.',
  },
] as const;

export function LeistungenPage() {
  useDocumentMeta({
    title: 'Leistungen · Fenstermontage nach EnEV | Bauschreinerei Urra',
    description:
      'Beratung, digitales Aufmaß, Demontage und Entsorgung sowie RAL-zertifizierte Fachmontage nach EnEV — alles aus einer Hand aus Olsberg im Sauerland.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="Leistungen"
        title="Rundum-Service vom Aufmaß bis zur fachgerechten Montage."
        intro="Wir sind Ihr alleiniger Ansprechpartner — von der ersten Beratung bis zur Einbau-Abnahme. Kein Subunternehmer, keine Schnittstellen, keine Ausreden."
      />

      <section className="relative px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="grid md:grid-cols-12 gap-8 mb-12 md:mb-16">
            <div className="md:col-span-6">
              <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
                Kernleistungen
              </p>
              <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
                Das machen wir.
              </h2>
            </div>
            <p className="md:col-span-5 md:col-start-8 self-end text-white/85 text-base md:text-lg leading-relaxed">
              Drei Kompetenz-Säulen, die ineinandergreifen — sauber dokumentiert,
              nach RAL ausgeführt, EnEV-konform.
            </p>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {services.items.map((item, idx) => (
              <BlurIn as="li" className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9" key={item.id} delay={idx * 0.1}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-4">
                  {item.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {item.body}
                </p>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Ablauf
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Wie wir arbeiten.
            </h2>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed">
              Vom ersten Anruf bis zur Abnahme — sechs Schritte, keine
              Überraschungen.
            </p>
          </BlurIn>

          <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {PROCESS.map((p, idx) => (
              <BlurIn as="li" className="border-t border-white/15 pt-6" key={p.title} delay={idx * 0.06}>
                <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                  {p.title}
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {p.body}
                </p>
              </BlurIn>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 md:mb-14 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Im Einsatz
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              So sieht das aus.
            </h2>
          </BlurIn>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {TOOLS.map((t, idx) => (
              <BlurIn as="li" className="group rounded-2xl overflow-hidden border border-white/15 bg-white/[0.03] h-full flex flex-col" key={t.src} delay={idx * 0.08}>
                <div className={`relative ${t.aspect} overflow-hidden bg-neutral-900`}>
                  <img
                    src={`${BASE}${t.src}`}
                    alt={t.alt}
                    loading="lazy"
                    decoding="async"
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-7 flex-1 flex flex-col">
                  <p className="text-white/55 text-[10px] tracking-[0.3em] uppercase mb-2">
                    {t.eyebrow}
                  </p>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                    {t.title}
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    {t.body}
                  </p>
                </div>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Materialien
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Kunststoff. Aluminium. Holz.
            </h2>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed">
              Wir beraten ergebnisoffen — welches Material das richtige ist, hängt
              vom Objekt, der Nutzung und Ihrem Budget ab.
            </p>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {MATERIALS.map((m, idx) => (
              <BlurIn as="li" className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9" key={m.name} delay={idx * 0.1}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-4">
                  {m.name}
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  {m.body}
                </p>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Produkte
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Fenster, Türen, Tore.
            </h2>
          </BlurIn>
          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {products.categories.map((cat, idx) => (
              <BlurIn as="li" className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9" key={cat.title} delay={idx * 0.08}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-6">
                  {cat.title}
                </h3>
                <ul className="space-y-2 text-white/85 text-sm md:text-base">
                  {cat.items.map((it) => (
                    <li key={it} className="border-t border-white/10 pt-2">
                      {it}
                    </li>
                  ))}
                </ul>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        title="Bereit für Ihr Projekt?"
        body="Erzählen Sie uns, was Sie vorhaben — wir kommen vorbei, messen auf und beraten ergebnisoffen."
      />
    </main>
  );
}
