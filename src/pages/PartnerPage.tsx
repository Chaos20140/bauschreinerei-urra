import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { partners } from '../data/content';

const STANDARDS = [
  {
    title: 'RAL-Montage',
    body: 'Einbau nach RAL-Gütezeichen — die strengste Norm für Fenster- und Türenmontage in Deutschland.',
  },
  {
    title: 'EnEV-konform',
    body: 'Alle Anschlussfugen werden fachgerecht gedämmt, jede Konstruktion entspricht der Energieeinsparverordnung.',
  },
  {
    title: 'CE-Kennzeichnung',
    body: 'Sämtliche eingesetzten Produkte erfüllen die geltenden europäischen Normen für Bauprodukte.',
  },
  {
    title: 'RC-2 N Sicherheit',
    body: 'Auf Wunsch einbruchhemmende Profilkombinationen, Beschläge und Verglasungen nach DIN EN 1627.',
  },
] as const;

export function PartnerPage() {
  return (
    <main data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="Partner"
        title="Sorgfältig ausgewählt, langjährig bewährt."
        intro="Eine Bauschreinerei ist nur so gut wie die Hersteller hinter ihren Produkten. Wir setzen auf etablierte Partner — vom Profil über die Beschläge bis zum Antrieb."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 md:mb-14 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              {partners.eyebrow}
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              {partners.title}
            </h2>
            <p className="mt-5 text-white/85 text-base md:text-lg leading-relaxed">
              {partners.subtitle}
            </p>
          </BlurIn>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {partners.items.map((p, idx) => (
              <BlurIn key={p.key} delay={idx * 0.06}>
                <li className="group h-full rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7 flex flex-col transition-all duration-500 hover:border-white/35 hover:bg-white/[0.07] hover:-translate-y-1">
                  <div className="flex items-center gap-4 mb-5">
                    <span className="h-12 w-12 rounded-2xl border border-white/15 bg-white/[0.06] grid place-items-center text-white/90 text-base font-medium tracking-tight">
                      {p.name.slice(0, 2)}
                    </span>
                    <p className="text-white/55 text-[10px] tracking-[0.3em] uppercase">
                      {p.category}
                    </p>
                  </div>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-3">
                    {p.name}
                  </h3>
                  <p className="text-white/80 text-sm md:text-[15px] leading-relaxed">
                    {p.body}
                  </p>
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
              Standards
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              Nach welchen Normen wir bauen.
            </h2>
            <p className="mt-5 text-white/85 text-base md:text-lg leading-relaxed">
              Damit Qualität nicht Verhandlungssache bleibt, halten wir uns an
              klar definierte technische und rechtliche Standards.
            </p>
          </BlurIn>
          <ul className="grid sm:grid-cols-2 gap-5 md:gap-6">
            {STANDARDS.map((s, idx) => (
              <BlurIn key={s.title} delay={idx * 0.08}>
                <li className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7">
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-3">
                    {s.title}
                  </h3>
                  <p className="text-white/80 text-sm md:text-base leading-relaxed">
                    {s.body}
                  </p>
                </li>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        title="Welcher Hersteller passt zu Ihrem Objekt?"
        body="Wir beraten ergebnisoffen — entscheidend ist nicht der Markenname, sondern was zu Ihrem Bauvorhaben und Budget passt."
      />
    </main>
  );
}
