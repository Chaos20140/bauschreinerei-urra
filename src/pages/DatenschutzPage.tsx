import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { datenschutz } from '../data/legal';

export function DatenschutzPage() {
  return (
    <main className="relative bg-neutral-950 min-h-screen text-white pb-16">
      <PageHero
        eyebrow="Datenschutz"
        title="Datenschutzerklärung."
        intro={datenschutz.subtitle}
      />

      <section className="relative px-6 md:px-12 py-8 md:py-16">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-14">
          {datenschutz.blocks.map((block, idx) => (
            <BlurIn key={block.heading} delay={idx * 0.04}>
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
                {'list' in block && block.list && (
                  <ul className="space-y-2 text-white/85 text-sm md:text-base leading-relaxed">
                    {block.list.map((l) => (
                      <li key={l} className="flex gap-3">
                        <span className="text-white/40 mt-1">—</span>
                        <span>{l}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </BlurIn>
          ))}

          <BlurIn>
            <p className="text-white/45 text-xs leading-relaxed pt-6 border-t border-white/10">
              Quelle der Vorlage: eigene Zusammenstellung auf Basis gängiger DSGVO-
              Mustertexte. Für eine rechtssichere Prüfung empfehlen wir die
              Abstimmung mit einer Fachanwältin/einem Fachanwalt für IT-Recht.
            </p>
          </BlurIn>
        </div>
      </section>
    </main>
  );
}
