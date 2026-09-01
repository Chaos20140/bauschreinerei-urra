import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { partners } from '../data/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Editable } from '../components/editor/Editable';

const BASE = import.meta.env.BASE_URL;

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
  useDocumentMeta({
    title: 'Partner · Hersteller und Systeme | Bauschreinerei Urra',
    description:
      'Mit welchen Herstellern wir arbeiten: Profilsysteme, Beschläge und Antriebe von Marken, die wir seit Jahren im Sauerland verbauen.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero
        idPrefix="partner"
        eyebrow="Partner"
        title="Sorgfältig ausgewählt, langjährig bewährt."
        intro="Eine Bauschreinerei ist nur so gut wie die Hersteller hinter ihren Produkten. Wir setzen auf etablierte Partner — vom Profil über Beschläge und Antriebe bis zum Garagentor."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 md:mb-14 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="partner.hersteller.eyebrow">{partners.eyebrow}</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="partner.hersteller.title">{partners.title}</Editable>
            </h2>
            <p className="mt-5 text-white/85 text-base md:text-lg leading-relaxed">
              <Editable id="partner.hersteller.subtitle">{partners.subtitle}</Editable>
            </p>
          </BlurIn>

          <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-5">
            {partners.items.map((p, idx) => (
              <BlurIn as="li" key={p.key} delay={idx * 0.06} className="h-full">
                <a
                  href={p.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group h-full rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7 flex flex-col transition-all duration-500 hover:border-white/35 hover:bg-white/[0.07] hover:-translate-y-1 no-shadow"
                >
                  <div className="flex items-start justify-between gap-4 mb-6">
                    {/* Feste Breite reserviert den Platz, bevor das Logo
                        geladen ist — sonst springt die Karte beim Nachladen. */}
                    <div className="h-10 md:h-12 w-[180px] flex items-center">
                      <img
                        src={`${BASE}${p.logo}`}
                        alt={`Logo ${p.name}`}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-auto max-w-[180px] object-contain"
                      />
                    </div>
                    <ArrowUpRight
                      className="h-4 w-4 mt-1 text-white/45 group-hover:text-white group-hover:rotate-45 transition-all duration-300 shrink-0"
                      strokeWidth={2}
                    />
                  </div>
                  <p className="text-white/55 text-[10px] tracking-[0.3em] uppercase mb-3">
                    <Editable id={`partner.item.${p.key}.category`}>{p.category}</Editable>
                  </p>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-3">
                    <Editable id={`partner.item.${p.key}.name`}>{p.name}</Editable>
                  </h3>
                  <p className="text-white/80 text-sm md:text-[15px] leading-relaxed flex-1">
                    <Editable id={`partner.item.${p.key}.body`}>{p.body}</Editable>
                  </p>
                  <span className="mt-5 text-[10px] tracking-[0.3em] uppercase text-white/55 group-hover:text-white transition-colors">
                    <Editable id="partner.item.cta">Webseite besuchen</Editable>
                  </span>
                </a>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 md:mb-14 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="partner.standards.eyebrow">Standards</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="partner.standards.title">Nach welchen Normen wir bauen.</Editable>
            </h2>
            <p className="mt-5 text-white/85 text-base md:text-lg leading-relaxed">
              <Editable id="partner.standards.intro">
                Damit Qualität nicht Verhandlungssache bleibt, halten wir uns an
                klar definierte technische und rechtliche Standards.
              </Editable>
            </p>
          </BlurIn>
          <ul className="grid sm:grid-cols-2 gap-5 md:gap-6">
            {STANDARDS.map((s, idx) => (
              <BlurIn
                as="li"
                key={s.title}
                delay={idx * 0.08}
                className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7"
              >
                <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-3">
                  <Editable id={`partner.standard${idx}.title`}>{s.title}</Editable>
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed">
                  <Editable id={`partner.standard${idx}.body`}>{s.body}</Editable>
                </p>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <CtaBlock
        idPrefix="partner"
        title="Welcher Hersteller passt zu Ihrem Objekt?"
        body="Wir beraten ergebnisoffen — entscheidend ist nicht der Markenname, sondern was zu Ihrem Bauvorhaben und Budget passt."
      />
    </main>
  );
}
