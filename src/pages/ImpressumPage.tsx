import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { impressum } from '../data/legal';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Editable } from '../components/editor/Editable';

export function ImpressumPage() {
  useDocumentMeta({
    title: 'Impressum · Bauschreinerei Urra',
    description:
      'Anbieterkennzeichnung nach § 5 DDG: Bauschreinerei Heribert Urra, Am Ochsenberg 13, 59939 Olsberg.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-16">
      <PageHero
        idPrefix="impressum"
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
                  <Editable id={`impressum.b${idx}.heading`}>{block.heading}</Editable>
                </h2>
                {'lines' in block && block.lines && (
                  <ul className="space-y-1 text-white/85 text-sm md:text-base leading-relaxed">
                    {block.lines.map((l, lidx) => (
                      <li key={l}>
                        <Editable id={`impressum.b${idx}.line${lidx}`}>{l}</Editable>
                      </li>
                    ))}
                  </ul>
                )}
                {'body' in block && block.body && (
                  <p className="text-white/85 text-sm md:text-base leading-relaxed">
                    <Editable id={`impressum.b${idx}.body`} rich>
                      {block.body}
                    </Editable>
                  </p>
                )}
              </article>
            </BlurIn>
          ))}

          <BlurIn delay={0.6}>
            <p className="text-white/45 text-xs leading-relaxed pt-6 border-t border-white/10">
              <Editable id="impressum.stand">
                Stand: Mai 2026. Diese Angaben werden bei Änderungen aktualisiert.
              </Editable>
            </p>
          </BlurIn>
        </div>
      </section>
    </main>
  );
}
