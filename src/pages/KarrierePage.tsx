import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { BewerbungForm } from '../components/BewerbungForm';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { career } from '../data/content';

export function KarrierePage() {
  useDocumentMeta({
    title: 'Karriere · Jobs in der Bauschreinerei | Urra Olsberg',
    description:
      'Arbeiten bei der Bauschreinerei Urra: offene Stellen für Schreiner, Monteure und Auszubildende im Sauerland. Jetzt online bewerben — auch initiativ.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero eyebrow={career.eyebrow} title={career.title} intro={career.intro} />

      <section className="relative px-6 md:px-12 py-12 md:py-16">
        <div className="max-w-7xl mx-auto">
          <ul className="grid md:grid-cols-3 gap-5 md:gap-6">
            {career.reasons.map((r, idx) => (
              <BlurIn
                as="li"
                key={r.title}
                delay={idx * 0.08}
                className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7"
              >
                <h2 className="hero-title text-white text-xl md:text-2xl font-medium mb-3">
                  {r.title}
                </h2>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">{r.body}</p>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto">
          <BlurIn className="mb-8">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">Bewerbung</p>
            <h2 className="hero-title text-white font-medium text-[9vw] md:text-[3.4vw] leading-[1.02]">
              Deine Unterlagen, direkt zu uns.
            </h2>
            <p className="mt-4 text-white/80 text-base md:text-lg leading-relaxed">
              Wähle eine Position oder bewirb dich initiativ. Ein Lebenslauf hilft
              uns — ist aber kein Muss.
            </p>
          </BlurIn>
          <BlurIn delay={0.1}>
            <BewerbungForm />
          </BlurIn>
        </div>
      </section>
    </main>
  );
}
