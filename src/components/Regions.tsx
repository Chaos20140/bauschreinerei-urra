import { regions } from '../data/content';
import { BlurIn } from './BlurIn';

export function Regions() {
  return (
    <section className="relative text-white py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 mb-16">
          <BlurIn className="md:col-span-7">
            <p className="text-xs md:text-sm text-white/60 tracking-widest uppercase mb-4">
              05 — {regions.title}
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw]">
              westfalen.
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
            <p className="text-white/80 text-base md:text-lg">{regions.subtitle}</p>
          </BlurIn>
        </div>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12">
          {regions.areas.map((area, idx) => (
            <BlurIn key={area.key} delay={idx * 0.1}>
              <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-6 border-b border-white/15 pb-4">
                {area.key}
              </h3>
              <ul className="flex flex-wrap gap-x-3 gap-y-2 text-white/80 text-base">
                {area.cities.map((city, cidx) => (
                  <li key={city} className="flex items-center gap-3">
                    <span>{city}</span>
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
