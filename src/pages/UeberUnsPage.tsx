import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { about, brand, hero, contact } from '../data/content';

const MILESTONES = [
  {
    year: '2003',
    title: 'gründung',
    body: 'h. urra gründet die bauschreinerei in olsberg — als familien- und inhabergeführter handwerksbetrieb.',
  },
  {
    year: '2010',
    title: 'spezialisierung',
    body: 'wachsender fokus auf fenster, haustüren und garagentore. eigene montage-teams für volle qualitätskontrolle.',
  },
  {
    year: '2018',
    title: 'digital',
    body: 'einführung der metiscale-app für millimetergenaues digitales aufmaß und durchgängige projektdokumentation.',
  },
  {
    year: 'heute',
    title: 'westfalen',
    body: 'wir sind in sauerland, ostwestfalen-lippe und ruhrgebiet fest verwurzelt. weiterhin inhabergeführt.',
  },
] as const;

const PRINCIPLES = [
  {
    key: 'qualität',
    body: 'wir verarbeiten ausschließlich produkte renommierter hersteller — langlebig, sicher und energieeffizient. unsere montage erfolgt nach RAL und EnEV-standard.',
  },
  {
    key: 'präzision',
    body: 'millimetergenaues aufmaß mit der metiscale-app, saubere baustelle, dokumentierte abnahme. wir arbeiten so, wie wir bei uns selbst arbeiten würden.',
  },
  {
    key: 'verlässlich',
    body: 'feste ansprechpartner, terminTreue und transparente kommunikation — vom angebot bis zur einweisung. keine versteckten kosten, keine ausreden.',
  },
  {
    key: 'regional',
    body: 'wir kennen das wetter, die häuser und die menschen in westfalen. das macht uns zu einem partner, der versteht, was vor ort wirklich gebraucht wird.',
  },
] as const;

export function UeberUnsPage() {
  return (
    <main className="relative bg-neutral-950 min-h-screen text-white pb-12">
      <PageHero
        eyebrow="über uns"
        title={`„${about.lead}"`}
        intro={`— h. urra · ${brand.longName}, olsberg`}
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
                <dt className="text-white/65">gegründet</dt>
                <dd className="text-white">{brand.founded}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">sitz</dt>
                <dd className="text-white">olsberg, sauerland</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">form</dt>
                <dd className="text-white">inhabergeführt</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">standard</dt>
                <dd className="text-white">RAL / EnEV</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/65">kontakt</dt>
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
        body="ein gespräch sagt mehr als zehn webseiten — gerne bei ihnen vor ort oder telefonisch."
      />
    </main>
  );
}
