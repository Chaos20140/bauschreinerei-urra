import { Link } from 'react-router-dom';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { Editable } from '../components/editor/Editable';
import { about, brand, hero, contact } from '../data/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const MILESTONES = [
  {
    year: '2003',
    title: 'Gründung',
    body: 'Heribert Urra gründet die Bauschreinerei in Olsberg — als familien- und inhabergeführter Handwerksbetrieb.',
  },
  {
    year: '2010',
    title: 'Spezialisierung',
    body: 'Wachsender Fokus auf Fenster, Haustüren und Garagentore. Eigene Montage-Teams für volle Qualitätskontrolle.',
  },
  {
    year: '2018',
    title: 'Digital',
    body: 'Einführung der metiscale-App für millimetergenaues digitales Aufmaß und durchgängige Projektdokumentation.',
  },
  {
    year: 'Heute',
    title: 'Nordrhein-Westfalen',
    body: 'Wir sind im Sauerland, in Ostwestfalen-Lippe und im Ruhrgebiet fest verwurzelt. Weiterhin inhabergeführt.',
  },
] as const;

const PRINCIPLES = [
  {
    key: 'Qualität',
    body: 'Wir verarbeiten ausschließlich Produkte renommierter Hersteller — langlebig, sicher und energieeffizient. Unsere Montage erfolgt nach RAL- und EnEV-Standard.',
  },
  {
    key: 'Präzision',
    body: 'Millimetergenaues Aufmaß mit der metiscale-App, saubere Baustelle, dokumentierte Abnahme. Wir arbeiten so, wie wir bei uns selbst arbeiten würden.',
  },
  {
    key: 'Verlässlich',
    body: 'Feste Ansprechpartner, Termintreue und transparente Kommunikation — vom Angebot bis zur Einweisung. Keine versteckten Kosten, keine Ausreden.',
  },
  {
    key: 'Regional',
    body: 'Wir kennen das Wetter, die Häuser und die Menschen in Nordrhein-Westfalen. Das macht uns zu einem Partner, der versteht, was vor Ort wirklich gebraucht wird.',
  },
] as const;

export function UeberUnsPage() {
  useDocumentMeta({
    title: 'Über uns · Handwerk aus Olsberg seit 2003 | Bauschreinerei Urra',
    description:
      'Inhabergeführte Bauschreinerei aus Olsberg: Heribert Urra fertigt und montiert seit 2003 Fenster, Türen und Garagentore im Sauerland.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 0%, rgba(255,255,255,0.08), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto">
          <BlurIn delay={0.05}>
            <nav
              aria-label="breadcrumb"
              className="text-white/55 text-[10px] md:text-xs tracking-[0.35em] uppercase mb-10 md:mb-16 flex items-center gap-3"
            >
              <Link to="/" className="hover:text-white transition-colors">
                Start
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white/85">Über uns</span>
            </nav>
          </BlurIn>

          <div className="grid md:grid-cols-12 gap-x-10 gap-y-10 items-end">
            <BlurIn delay={0.15} className="md:col-span-9">
              {/* Diese Seite hatte bisher gar keine <h1> — nur zwei <h2>.
                  Der sr-only-Teil trägt die eigentliche Seitenaussage für
                  Screenreader und Suchmaschinen, sichtbar bleibt das Zitat. */}
              <h1
                className="hero-title text-white font-medium text-[5.5vw] md:text-[2.6vw] lg:text-[2.1vw] leading-[1.3] max-w-4xl"
                style={{ textWrap: 'balance' }}
              >
                <span className="sr-only">
                  Über die Bauschreinerei Urra aus Olsberg —{' '}
                </span>
                <Editable id="ueberuns.hero.quote" rich>
                  „Qualität ist kein Zufall — sie ist das Ergebnis harter Arbeit,
                  kluger Planung und ehrlicher Leidenschaft."
                </Editable>
              </h1>
            </BlurIn>

            <BlurIn delay={0.4} className="md:col-span-3 md:pb-2">
              <p className="text-white/55 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-3">
                <Editable id="ueberuns.hero.ownerlabel">Inhaber</Editable>
              </p>
              <p className="text-white text-lg md:text-xl font-medium">
                <Editable id="ueberuns.hero.ownername">Heribert Urra</Editable>
              </p>
              <p className="text-white/65 text-sm mt-1">
                <Editable id="ueberuns.hero.ownerplace" rich>
                  {brand.shortName}
                  <br />
                  Olsberg, Sauerland
                </Editable>
              </p>
            </BlurIn>
          </div>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
          <BlurIn className="md:col-span-7 space-y-6">
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-white/90 text-base md:text-xl leading-relaxed"
              >
                <Editable id={`ueberuns.intro.para${i}`}>{p}</Editable>
              </p>
            ))}
            <p className="text-white/85 text-base md:text-lg leading-relaxed pt-4">
              <Editable id="ueberuns.intro.herodesc">{hero.description}</Editable>
            </p>
          </BlurIn>

          <BlurIn
            className="md:col-span-4 md:col-start-9 rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9 self-start"
            delay={0.2}
          >
            <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-4">
              <Editable id="ueberuns.facts.label">Auf einen Blick</Editable>
            </p>
            <dl className="space-y-4 text-sm md:text-base">
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65"><Editable id="ueberuns.facts.foundedlabel">Gegründet</Editable></dt>
                <dd className="text-white"><Editable id="ueberuns.facts.foundedvalue">{brand.founded}</Editable></dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65"><Editable id="ueberuns.facts.sitzlabel">Sitz</Editable></dt>
                <dd className="text-white"><Editable id="ueberuns.facts.sitzvalue">Olsberg, Sauerland</Editable></dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65"><Editable id="ueberuns.facts.formlabel">Form</Editable></dt>
                <dd className="text-white"><Editable id="ueberuns.facts.formvalue">Inhabergeführt</Editable></dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65"><Editable id="ueberuns.facts.standardlabel">Standard</Editable></dt>
                <dd className="text-white"><Editable id="ueberuns.facts.standardvalue">RAL / EnEV</Editable></dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65"><Editable id="ueberuns.facts.kontaktlabel">Kontakt</Editable></dt>
                <dd className="text-white text-right break-all">
                  {contact.phone.display}
                </dd>
              </div>
            </dl>
          </BlurIn>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="ueberuns.history.eyebrow">Geschichte</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              <Editable id="ueberuns.history.title">Wie wir hierher kamen.</Editable>
            </h2>
          </BlurIn>

          <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {MILESTONES.map((m, idx) => (
              <BlurIn as="li" className="grid grid-cols-[auto_1fr] gap-5 md:gap-7 border-t border-white/15 pt-6" key={m.year} delay={idx * 0.08}>
                <span className="text-white/60 text-sm md:text-base tracking-[0.2em] uppercase">
                  <Editable id={`ueberuns.milestones${idx}.year`}>{m.year}</Editable>
                </span>
                <div>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                    <Editable id={`ueberuns.milestones${idx}.title`}>{m.title}</Editable>
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    <Editable id={`ueberuns.milestones${idx}.body`}>{m.body}</Editable>
                  </p>
                </div>
              </BlurIn>
            ))}
          </ol>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="ueberuns.values.eyebrow">Werte</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              <Editable id="ueberuns.values.title">Woran wir uns messen lassen.</Editable>
            </h2>
          </BlurIn>

          <ul className="grid md:grid-cols-2 gap-6 md:gap-10">
            {PRINCIPLES.map((p, idx) => (
              <BlurIn as="li" className="border-t border-white/15 pt-6" key={p.key} delay={idx * 0.07}>
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-3">
                  <Editable id={`ueberuns.principles${idx}.title`}>{p.key}</Editable>
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  <Editable id={`ueberuns.principles${idx}.body`}>{p.body}</Editable>
                </p>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        idPrefix="ueberuns"
        title="Lernen Sie uns kennen."
        body="Ein Gespräch sagt mehr als zehn Webseiten — gerne bei Ihnen vor Ort oder telefonisch."
      />
    </main>
  );
}
