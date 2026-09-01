import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { PageHero } from '../components/PageHero';
import { CtaBlock } from '../components/CtaBlock';
import { BlurIn } from '../components/BlurIn';
import { ProjectImage } from '../components/ProjectImage';
import { projectList } from '../data/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { Editable } from '../components/editor/Editable';
import { regionIds, useRegionAreas } from '../lib/siteData';

const CATEGORIES = [
  {
    title: 'Privatbau',
    body: 'Einfamilien- und Mehrfamilienhäuser, Neubauten und individuelle Anbauten. Moderne Fenster, Eingangstüren und Schiebetüren — komplett geplant, geliefert und montiert.',
    tags: ['Neubau', 'Einfamilienhaus', 'Eingangsbereich'],
  },
  {
    title: 'Sanierung & Modernisierung',
    body: 'Austausch alter Fenster und Türen mit Blick auf Energieeffizienz, Schallschutz und Einbruchhemmung. Fachgerechte Demontage, saubere Baustelle, RAL-konforme Montage.',
    tags: ['Altbau', 'Energetisch', 'RC-2'],
  },
  {
    title: 'Gewerbe & Sondermaße',
    body: 'Objekttüren, große Festverglasungen und Schiebeelemente für Gewerbeobjekte. Abgestimmt auf Nutzungsanforderungen, Brandschutz und Barrierefreiheit.',
    tags: ['Objekt', 'Großformat', 'Sondermaß'],
  },
] as const;

const HIGHLIGHTS = [
  { value: '20+', label: 'Jahre Erfahrung' },
  { value: '3', label: 'Regionen flächendeckend' },
  { value: '100%', label: 'eigenes Montage-Team' },
  { value: 'RAL', label: 'zertifizierte Montage' },
] as const;

export function ProjektePage() {
  const areas = useRegionAreas();

  useDocumentMeta({
    title: 'Projekte · Referenzen aus dem Sauerland | Bauschreinerei Urra',
    description:
      'Ausgeführte Fenster- und Türprojekte aus Privatbau, Gewerbe und Industrie — vom Bogenfenster im Sondermaß bis zur kompletten Glasfassade.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero
        idPrefix="projekte"
        eyebrow="Projekte"
        title="Referenzen aus dem Sauerland und ganz Nordrhein-Westfalen."
        intro="Jedes Objekt hat seine eigene Geschichte — von der kleinen Sanierung bis zum Gewerbeobjekt. Seit 2003 begleiten wir Bauherren in drei Regionen mit Fachhandwerk auf hohem Niveau."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-16 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="projekte.objektarten.eyebrow">Objektarten</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="projekte.objektarten.title">Was wir umsetzen.</Editable>
            </h2>
          </BlurIn>

          <ul className="grid md:grid-cols-3 gap-5 md:gap-7">
            {CATEGORIES.map((c, idx) => (
              <BlurIn
                as="li"
                key={c.title}
                delay={idx * 0.1}
                className="h-full rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9 flex flex-col"
              >
                <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-5">
                  <Editable id={`projekte.category${idx}.title`}>{c.title}</Editable>
                </h3>
                <p className="text-white/80 text-sm md:text-base leading-relaxed mb-6 flex-1">
                  <Editable id={`projekte.category${idx}.body`}>{c.body}</Editable>
                </p>
                <ul className="flex flex-wrap gap-2 pt-4 border-t border-white/10">
                  {c.tags.map((t, tidx) => (
                    <li
                      key={t}
                      className="text-white/65 text-xs tracking-wider px-3 py-1 rounded-full border border-white/15"
                    >
                      <Editable id={`projekte.category${idx}.tag${tidx}`}>{t}</Editable>
                    </li>
                  ))}
                </ul>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 md:mb-20 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="projekte.referenzen.eyebrow">Referenzen</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="projekte.referenzen.title">Aus unserer Werkstatt.</Editable>
            </h2>
            <p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed">
              <Editable id="projekte.referenzen.intro">
                Eine Auswahl realisierter Objekte — klicken Sie auf ein Projekt
                für die ausführliche Vorstellung mit Eckdaten und Bildern.
              </Editable>
            </p>
          </BlurIn>

          <div className="space-y-16 md:space-y-24 lg:space-y-32">
            {projectList.map((p, idx) => {
              const reversed = idx % 2 === 1;
              return (
                <BlurIn key={p.slug} delay={0.05}>
                  <Link
                    to={`/projekte/${p.slug}`}
                    className="group block no-shadow"
                  >
                    <article className="grid md:grid-cols-12 gap-6 md:gap-10 lg:gap-14 items-center">
                      <div
                        className={`md:col-span-7 ${
                          reversed ? 'md:order-2' : ''
                        }`}
                      >
                        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-900">
                          <ProjectImage
                            src={p.hero}
                            editId={`projekte.item.${p.slug}.image`}
                            alt={`${p.title} — ${p.category} in ${p.location}, ausgeführt ${p.year}`}
                            // Gemessen: bei 1037 px Viewport ist das Bild
                            // 517 px breit — 50vw trifft das, 58vw ließ den
                            // Browser unnötig die 1600er-Variante ziehen.
                            sizes="(min-width: 768px) 50vw, 100vw"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-[1200ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                          />
                          <div className="absolute inset-0 rounded-2xl pointer-events-none ring-1 ring-inset ring-white/10 group-hover:ring-white/30 transition-all duration-500" />
                        </div>
                      </div>

                      <div
                        className={`md:col-span-5 ${
                          reversed ? 'md:order-1' : ''
                        }`}
                      >
                        <p className="text-white/55 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4">
                          {p.category} · {p.location} · {p.year}
                        </p>
                        <h3 className="hero-title text-white font-medium text-[9vw] md:text-[min(3.4vw,65.3px)] lg:text-[min(2.8vw,53.8px)] leading-[1] mb-5">
                          <Editable id={`projekte.item.${p.slug}.title`}>{p.title}</Editable>
                        </h3>
                        <p className="text-white/80 text-base md:text-lg leading-relaxed mb-7">
                          <Editable id={`projekte.item.${p.slug}.summary`}>{p.summary}</Editable>
                        </p>
                        <span className="inline-flex items-center gap-3 text-sm md:text-base text-white/75 group-hover:text-white transition-colors">
                          <span className="border-b border-white/30 group-hover:border-white pb-0.5 transition-colors">
                            <Editable id={`projekte.item.${p.slug}.cta`}>Projekt ansehen</Editable>
                          </span>
                          <ArrowUpRight
                            className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1 group-hover:-translate-y-0.5"
                            strokeWidth={2}
                          />
                        </span>
                      </div>
                    </article>
                  </Link>
                </BlurIn>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-12 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="projekte.eckdaten.eyebrow">Eckdaten</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="projekte.eckdaten.title">Das spricht für uns.</Editable>
            </h2>
          </BlurIn>
          <ul className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {HIGHLIGHTS.map((h, idx) => (
              <BlurIn as="li" className="border-t border-white/15 pt-6" key={h.label} delay={idx * 0.07}>
                <div className="border-t border-white/15 pt-6">
                  <p className="hero-title text-white text-4xl md:text-5xl lg:text-6xl font-medium mb-2">
                    <Editable id={`projekte.highlight${idx}.value`}>{h.value}</Editable>
                  </p>
                  <p className="text-white/70 text-xs md:text-sm tracking-[0.2em] uppercase">
                    <Editable id={`projekte.highlight${idx}.label`}>{h.label}</Editable>
                  </p>
                </div>
              </BlurIn>
            ))}
          </ul>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-16 md:py-24 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-10 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              <Editable id="projekte.servicegebiet.eyebrow">Servicegebiet</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[min(5.5vw,105.6px)] leading-[0.95]">
              <Editable id="projekte.servicegebiet.title">Wo wir bauen.</Editable>
            </h2>
          </BlurIn>
          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {areas.map((area, idx) => (
              <BlurIn key={area.key} delay={idx * 0.08}>
                <div>
                  <h3 className="hero-title text-white text-xl md:text-2xl font-medium mb-5 border-b border-white/15 pb-3">
                    {/* Gleiche IDs wie auf der Startseite — ein Servicegebiet. */}
                    <Editable id={regionIds(idx).title}>{area.title}</Editable>
                  </h3>
                  <ul className="flex flex-wrap gap-x-3 gap-y-2 text-white/75 text-sm md:text-base">
                    {area.cities.map((city, cidx) => (
                      <li key={city} className="flex items-center gap-3">
                        <span>
                          <Editable id={regionIds(idx).city(cidx)}>{city}</Editable>
                        </span>
                        {cidx < area.cities.length - 1 && (
                          <span className="text-white/30">·</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </BlurIn>
            ))}
          </div>
        </div>
      </section>

      <CtaBlock
        idPrefix="projekte"
        title="Ihr nächstes Projekt."
        body="Schicken Sie uns die Eckdaten — Adresse, gewünschte Elemente, Zeithorizont. Wir melden uns binnen 24 Stunden."
      />
    </main>
  );
}
