import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { Editable } from '../components/editor/Editable';
import { EditableImage } from '../components/editor/EditableImage';
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
        idPrefix="leistungen"
        eyebrow="Leistungen"
        title="Rundum-Service vom Aufmaß bis zur fachgerechten Montage."
        intro="Wir sind Ihr alleiniger Ansprechpartner — von der ersten Beratung bis zur Einbau-Abnahme. Kein Subunternehmer, keine Schnittstellen, keine Ausreden."
      />

      <section className="relative px-6 md:px-12 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="grid md:grid-cols-12 gap-8 mb-12 md:mb-16">
            <div className="md:col-span-6">
              <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
                <Editable id="leistungen.kern.eyebrow">Kernleistungen</Editable>
              </p>
              <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
                <Editable id="leistungen.kern.title">Das machen wir.</Editable>
              </h2>
            </div>
            <p className="md:col-span-5 md:col-start-8 self-end text-white/85 text-base md:text-lg leading-relaxed">
              <Editable id="leistungen.kern.intro">Drei Kompetenz-Säulen, die ineinandergreifen — sauber dokumentiert,
              nach RAL ausgeführt, EnEV-konform.</Editable>
            </p>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {services.items.map((item, idx) => (
              <BlurIn as="li" className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9" key={item.id} delay={idx * 0.1}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-4">
                  <Editable id={`services.${item.id}.title`}>{item.title}</Editable>
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  <Editable id={`services.${item.id}.body`}>{item.body}</Editable>
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
              <Editable id="leistungen.ablauf.eyebrow">Ablauf</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="leistungen.ablauf.title">Wie wir arbeiten.</Editable>
            </h2>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed">
              <Editable id="leistungen.ablauf.intro">Vom ersten Anruf bis zur Abnahme — sechs Schritte, keine
              Überraschungen.</Editable>
            </p>
          </BlurIn>

          <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {PROCESS.map((p, idx) => (
              <BlurIn as="li" className="border-t border-white/15 pt-6" key={p.title} delay={idx * 0.06}>
                <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                  <Editable id={`leistungen.process${idx}.title`}>{p.title}</Editable>
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  <Editable id={`leistungen.process${idx}.body`}>{p.body}</Editable>
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
              <Editable id="leistungen.einsatz.eyebrow">Im Einsatz</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="leistungen.einsatz.title">So sieht das aus.</Editable>
            </h2>
          </BlurIn>
          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {TOOLS.map((t, idx) => (
              <BlurIn as="li" className="group rounded-2xl overflow-hidden border border-white/15 bg-white/[0.03] h-full flex flex-col" key={t.src} delay={idx * 0.08}>
                <div className={`relative ${t.aspect} overflow-hidden bg-neutral-900`}>
                  <EditableImage
                    id={`leistungen.tools${idx}.image`}
                    src={`${BASE}${t.src}`}
                    alt={t.alt}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="p-6 md:p-7 flex-1 flex flex-col">
                  <p className="text-white/55 text-[10px] tracking-[0.3em] uppercase mb-2">
                    <Editable id={`leistungen.tools${idx}.eyebrow`}>{t.eyebrow}</Editable>
                  </p>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                    <Editable id={`leistungen.tools${idx}.title`}>{t.title}</Editable>
                  </h3>
                  <p className="text-white/80 text-sm leading-relaxed">
                    <Editable id={`leistungen.tools${idx}.body`}>{t.body}</Editable>
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
              <Editable id="leistungen.materialien.eyebrow">Materialien</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="leistungen.materialien.title">Kunststoff. Aluminium. Holz.</Editable>
            </h2>
            <p className="mt-6 text-white/85 text-base md:text-lg leading-relaxed">
              <Editable id="leistungen.materialien.intro">Wir beraten ergebnisoffen — welches Material das richtige ist, hängt
              vom Objekt, der Nutzung und Ihrem Budget ab.</Editable>
            </p>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {MATERIALS.map((m, idx) => (
              <BlurIn as="li" className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9" key={m.name} delay={idx * 0.1}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-4">
                  <Editable id={`leistungen.materials${idx}.name`}>{m.name}</Editable>
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  <Editable id={`leistungen.materials${idx}.body`}>{m.body}</Editable>
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
              <Editable id="leistungen.produkte.eyebrow">Produkte</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="leistungen.produkte.title">Fenster, Türen, Tore.</Editable>
            </h2>
          </BlurIn>
          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {products.categories.map((cat, idx) => (
              <BlurIn as="li" className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9" key={cat.title} delay={idx * 0.08}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-6">
                  <Editable id={`produkte.cat${idx}.title`}>{cat.title}</Editable>
                </h3>
                <ul className="space-y-2 text-white/85 text-sm md:text-base">
                  {cat.items.map((it, j) => (
                    <li key={it} className="border-t border-white/10 pt-2">
                      <Editable id={`produkte.cat${idx}.item${j}`}>{it}</Editable>
                    </li>
                  ))}
                </ul>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        idPrefix="leistungen"
        title="Bereit für Ihr Projekt?"
        body="Erzählen Sie uns, was Sie vorhaben — wir kommen vorbei, messen auf und beraten ergebnisoffen."
      />
    </main>
  );
}
