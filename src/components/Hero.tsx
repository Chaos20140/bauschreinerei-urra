import { hero, brand } from '../data/content';
import { BlurIn } from './BlurIn';

const SHADOW_SOFT = { textShadow: '0 1px 18px rgba(0,0,0,0.55)' } as const;
const SHADOW_HEAVY = { textShadow: '0 4px 48px rgba(0,0,0,0.45)' } as const;

export function Hero() {
  return (
    <section id="top" className="relative h-screen w-full overflow-hidden">
      <div
        className="absolute inset-x-0 top-0 h-48 pointer-events-none"
        style={{
          background:
            'linear-gradient(to bottom, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 100%)',
        }}
        aria-hidden="true"
      />
      <div
        className="absolute inset-x-0 bottom-0 h-56 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0) 100%)',
        }}
        aria-hidden="true"
      />

      <div className="absolute inset-0 px-6 md:px-12 pt-28 md:pt-36 pb-10 md:pb-14 flex flex-col">
        <BlurIn delay={0.05}>
          <p
            className="text-white text-[10px] md:text-xs tracking-[0.4em] uppercase"
            style={SHADOW_SOFT}
          >
            {brand.longName} · Olsberg · Seit 2003
          </p>
        </BlurIn>

        <div className="flex-1 flex flex-col justify-center max-w-6xl">
          <BlurIn delay={0.3}>
            <h1
              className="hero-title text-white font-medium text-[15vw] md:text-[10vw] leading-[0.88]"
              style={SHADOW_HEAVY}
            >
              Fenster.
              <br />
              Und Türen.
            </h1>
          </BlurIn>
          <BlurIn delay={0.55} className="mt-6 md:mt-8">
            <p
              className="text-white text-sm md:text-lg lg:text-xl leading-relaxed max-w-xl"
              style={SHADOW_SOFT}
            >
              {hero.description}
            </p>
          </BlurIn>
        </div>

        <div className="flex items-end justify-between gap-6">
          <BlurIn delay={0.7}>
            <ul className="flex flex-wrap gap-x-8 gap-y-4 md:gap-x-12">
              {hero.stats.map((s) => (
                <li key={s.value} className="flex flex-col" style={SHADOW_SOFT}>
                  <span className="text-white text-xl md:text-2xl lg:text-3xl font-medium tracking-tight">
                    {s.value}
                  </span>
                  <span className="text-white/75 text-[9px] md:text-[10px] mt-1 tracking-[0.25em] uppercase">
                    {s.label}
                  </span>
                </li>
              ))}
            </ul>
          </BlurIn>

          <BlurIn delay={0.85}>
            <div
              className="hidden md:flex flex-col items-center gap-2 text-white/85 text-[10px] tracking-[0.3em] uppercase"
              style={SHADOW_SOFT}
            >
              <span>Scroll</span>
              <span
                className="w-px h-12 bg-white/50 animate-pulse"
                aria-hidden="true"
              />
            </div>
          </BlurIn>
        </div>
      </div>
    </section>
  );
}
