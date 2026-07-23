import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { impressum } from '../data/legal';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

export function ImpressumPage() {
  useDocumentMeta({
    title: 'Impressum · Bauschreinerei Urra',
    description:
      'Anbieterkennzeichnung nach § 5 DDG: Bauschreinerei Heribert Urra, Am Ochsenberg 13, 59939 Olsberg.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-16">
      <PageHero
        eyebrow="Impressum"
        title="Impressum."
        intro={impressum.subtitle}
        layout="stacked"
      />

      <section className="relative px-6 md:px-12 py-8 md:py-16">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-12">
          {impressum.blocks.map((block, idx) => (
            <BlurIn key={block.heading} delay={idx * 0.05}>
              <article>
                <h2 className="hero-title text-white text-xl md:text-2xl font-medium mb-4 border-b border-white/15 pb-3">
                  {block.heading}
                </h2>
                {'lines' in block && block.lines && (
                  <ul className="space-y-1 text-white/85 text-sm md:text-base leading-relaxed">
                    {block.lines.map((l) => (
                      <li key={l}>{l}</li>
                    ))}
                  </ul>
                )}
                {'body' in block && block.body && (
                  <p className="text-white/85 text-sm md:text-base leading-relaxed">
                    {block.body}
                  </p>
                )}
              </article>
            </BlurIn>
          ))}

          <BlurIn delay={0.6}>
            <p className="text-white/45 text-xs leading-relaxed pt-6 border-t border-white/10">
              Stand: Mai 2026. Diese Angaben werden bei Änderungen aktualisiert.
            </p>
          </BlurIn>
        </div>
      </section>
    </main>
  );
}
