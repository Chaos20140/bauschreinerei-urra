import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { about, brand, hero, contact } from '../data/content';

const MILESTONES = [
  {
    year: '2003',
    title: 'gründung',
    body: 'H. Urra gründet die Bauschreinerei in Olsberg — als familien- und inhabergeführter Handwerksbetrieb.',
  },
  {
    year: '2010',
    title: 'spezialisierung',
    body: 'Wachsender Fokus auf Fenster, Haustüren und Garagentore. Eigene Montage-Teams für volle Qualitätskontrolle.',
  },
  {
    year: '2018',
    title: 'digital',
    body: 'Einführung der metiscale-App für millimetergenaues digitales Aufmaß und durchgängige Projektdokumentation.',
  },
  {
    year: 'heute',
    title: 'westfalen',
    body: 'Wir sind im Sauerland, in Ostwestfalen-Lippe und im Ruhrgebiet fest verwurzelt. Weiterhin inhabergeführt.',
  },
] as const;

const PRINCIPLES = [
  {
    key: 'qualität',
    body: 'Wir verarbeiten ausschließlich Produkte renommierter Hersteller — langlebig, sicher und energieeffizient. Unsere Montage erfolgt nach RAL- und EnEV-Standard.',
  },
  {
    key: 'präzision',
    body: 'Millimetergenaues Aufmaß mit der metiscale-App, saubere Baustelle, dokumentierte Abnahme. Wir arbeiten so, wie wir bei uns selbst arbeiten würden.',
  },
  {
    key: 'verlässlich',
    body: 'Feste Ansprechpartner, Termintreue und transparente Kommunikation — vom Angebot bis zur Einweisung. Keine versteckten Kosten, keine Ausreden.',
  },
  {
    key: 'regional',
    body: 'Wir kennen das Wetter, die Häuser und die Menschen in Westfalen. Das macht uns zu einem Partner, der versteht, was vor Ort wirklich gebraucht wird.',
  },
] as const;

export function UeberUnsPage() {
  return (
    <main className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="über uns"
        title={`„${about.lead}"`}
        intro={`— H. Urra · ${brand.longName}, Olsberg`}
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-10">
          <BlurIn className="md:col-span-7 space-y-6">
            {about.paragraphs.map((p, i) => (
              <p
                key={i}
                className="text-white/90 text-base md:text-xl leading-relaxed"
              >
                {p}
              </p>
            ))}
            <p className="text-white/85 text-base md:text-lg leading-relaxed pt-4">
              {hero.description}
            </p>
          </BlurIn>

          <BlurIn
            className="md:col-span-4 md:col-start-9 rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9 self-start"
            delay={0.2}
          >
            <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-4">
              auf einen blick
            </p>
            <dl className="space-y-4 text-sm md:text-base">
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">Gegründet</dt>
                <dd className="text-white">{brand.founded}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">Sitz</dt>
                <dd className="text-white">Olsberg, Sauerland</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">Form</dt>
                <dd className="text-white">Inhabergeführt</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">Standard</dt>
                <dd className="text-white">RAL / EnEV</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">Kontakt</dt>
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
              geschichte
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              wie wir hierher kamen.
            </h2>
          </BlurIn>

          <ol className="grid md:grid-cols-2 gap-x-12 gap-y-10">
            {MILESTONES.map((m, idx) => (
              <BlurIn key={m.year} delay={idx * 0.08}>
                <li className="grid grid-cols-[auto_1fr] gap-5 md:gap-7 border-t border-white/15 pt-6">
                  <span className="text-white/60 text-sm md:text-base tracking-[0.2em] uppercase">
                    {m.year}
                  </span>
                  <div>
                    <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-2">
                      {m.title}
                    </h3>
                    <p className="text-white/80 text-sm md:text-base leading-relaxed">
                      {m.body}
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
              werte
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              woran wir uns messen lassen.
            </h2>
          </BlurIn>

          <ul className="grid md:grid-cols-2 gap-6 md:gap-10">
            {PRINCIPLES.map((p, idx) => (
              <BlurIn key={p.key} delay={idx * 0.07}>
                <li className="border-t border-white/15 pt-6">
                  <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-3">
                    {p.key}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {p.body}
                  </p>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        title="lernen sie uns kennen."
        body="Ein Gespräch sagt mehr als zehn Webseiten — gerne bei Ihnen vor Ort oder telefonisch."
      />
    </main>
  );
}
