import { ShieldCheck, Leaf, Ruler, Users, MapPin } from 'lucide-react';
import { features } from '../data/content';
import { BlurIn } from './BlurIn';

const ICONS: Record<string, typeof ShieldCheck> = {
  ral: ShieldCheck,
  enev: Leaf,
  aufmass: Ruler,
  'eigenes-team': Users,
  regional: MapPin,
};

export function Features() {
  return (
    <section className="relative text-white py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 mb-12 md:mb-20">
          <BlurIn className="md:col-span-6">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              {features.eyebrow}
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[6vw] leading-[0.92]">
              {features.title}.
            </h2>
          </BlurIn>
          <BlurIn
            className="md:col-span-5 md:col-start-8 self-end"
            delay={0.15}
          >
            <p className="text-white/85 text-base md:text-lg leading-relaxed">
              {features.subtitle}
            </p>
          </BlurIn>
        </div>

        <ul className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 md:gap-5">
          {features.items.map((f, idx) => {
            const Icon = ICONS[f.key] ?? ShieldCheck;
            return (
              <BlurIn as="li" className="group relative h-full rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-7 overflow-hidden transition-all duration-500 hover:bg-white/[0.08] hover:border-white/35 hover:-translate-y-1" key={f.key} delay={idx * 0.07}>
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <Icon
                  className="h-7 w-7 md:h-8 md:w-8 text-white/85 mb-6 transition-transform duration-500 group-hover:scale-110"
                  strokeWidth={1.5}
                />
                <h3 className="hero-title text-white text-lg md:text-xl font-medium mb-3 leading-tight">
                  {f.title}
                </h3>
                <p className="text-white/75 text-sm md:text-[15px] leading-relaxed">
                  {f.body}
                </p>
              </BlurIn>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
