import { regions } from '../data/content';
import { BlurIn } from './BlurIn';
import { Editable } from './editor/Editable';
import { regionIds, useRegionAreas } from '../lib/siteData';

export function Regions() {
  // Gemeinsame IDs mit der Projekte- und Kontaktseite: das Servicegebiet ist
  // überall dieselbe Aussage und soll nicht auseinanderlaufen.
  const areas = useRegionAreas();

  return (
    <section className="relative text-white py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <BlurIn className="md:col-span-7">
            <p className="text-xs md:text-sm text-white/60 tracking-widest uppercase mb-4">
              <Editable id="home.regions.eyebrow">{regions.eyebrow}</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] leading-[0.95]">
              <Editable id="home.regions.title">Nordrhein-Westfalen.</Editable>
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
            <p className="text-white/80 text-base md:text-lg"><Editable id="home.regions.subtitle">{regions.subtitle}</Editable></p>
          </BlurIn>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {areas.map((area, idx) => (
            <BlurIn key={area.key} delay={idx * 0.1}>
              <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-6 border-b border-white/15 pb-4">
                <Editable id={regionIds(idx).title}>{area.title}</Editable>
              </h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-2 text-white/80 text-base">
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
            </BlurIn>
          ))}
        </div>
      </div>
    </section>
  );
}
