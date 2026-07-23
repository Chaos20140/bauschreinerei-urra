import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { datenschutz } from '../data/legal';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Editable } from '../components/editor/Editable';

export function DatenschutzPage() {
  useDocumentMeta({
    title: 'Datenschutzerklärung · Bauschreinerei Urra',
    description:
      'Wie wir mit Ihren Daten umgehen: Hosting, Kontaktformular, Google Maps mit Zwei-Klick-Lösung, lokal gehostete Schriften und Ihre Rechte nach DSGVO.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-16">
      <PageHero
        idPrefix="datenschutz"
        eyebrow="Datenschutz"
        title="Datenschutzerklärung."
        intro={datenschutz.subtitle}
        layout="stacked"
        titleSize="compact"
      />

      <section className="relative px-6 md:px-12 py-8 md:py-16">
        <div className="max-w-3xl mx-auto space-y-10 md:space-y-14">
          {datenschutz.blocks.map((block, idx) => (
            <BlurIn key={block.heading} delay={idx * 0.04}>
              <article>
                <h2 className="hero-title text-white text-xl md:text-2xl font-medium mb-4 border-b border-white/15 pb-3">
                  <Editable id={`datenschutz.b${idx}.heading`}>{block.heading}</Editable>
                </h2>
                {'lines' in block && block.lines && (
                  <ul className="space-y-1 text-white/85 text-sm md:text-base leading-relaxed">
                    {block.lines.map((l, lidx) => (
                      <li key={l}>
                        <Editable id={`datenschutz.b${idx}.line${lidx}`}>{l}</Editable>
                      </li>
                    ))}
                  </ul>
                )}
                {'body' in block && block.body && (
                  <p className="text-white/85 text-sm md:text-base leading-relaxed">
                    <Editable id={`datenschutz.b${idx}.body`} rich>
                      {block.body}
                    </Editable>
                  </p>
                )}
                {'list' in block && block.list && (
                  <ul className="space-y-2 text-white/85 text-sm md:text-base leading-relaxed">
                    {block.list.map((l, lidx) => (
                      <li key={l} className="flex gap-3">
                        <span className="text-white/40 mt-1">—</span>
                        <Editable id={`datenschutz.b${idx}.item${lidx}`}>{l}</Editable>
                      </li>
                    ))}
                  </ul>
                )}
              </article>
            </BlurIn>
          ))}

          <BlurIn>
            <p className="text-white/45 text-xs leading-relaxed pt-6 border-t border-white/10">
              <Editable id="datenschutz.hinweis">
                Quelle der Vorlage: eigene Zusammenstellung auf Basis gängiger DSGVO-
                Mustertexte. Für eine rechtssichere Prüfung empfehlen wir die
                Abstimmung mit einer Fachanwältin/einem Fachanwalt für IT-Recht.
              </Editable>
            </p>
          </BlurIn>
        </div>
      </section>
    </main>
  );
}
