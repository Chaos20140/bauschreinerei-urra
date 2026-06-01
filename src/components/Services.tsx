import { services } from '../data/content';
import { BlurIn } from './BlurIn';

export function Services() {
  return (
    <section id="leistungen" className="relative text-white py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-end mb-16 md:mb-24">
          <BlurIn className="md:col-span-6">
            <p className="text-xs md:text-sm text-white/60 tracking-[0.3em] uppercase mb-4">
              {services.eyebrow}
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[7vw]">
              {services.title}
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-5 md:col-start-8" delay={0.15}>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              {services.subtitle}
            </p>
          </BlurIn>
        </div>

        <ul className="divide-y divide-white/10 border-t border-white/10">
          {services.items.map((item, idx) => (
            <li key={item.id}>
              <BlurIn delay={idx * 0.08}>
                <div className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-14">
                  <h3 className="md:col-span-5 hero-title text-white text-3xl md:text-5xl font-medium">
                    {item.title}
                  </h3>
                  <p className="md:col-span-6 md:col-start-7 text-white/80 text-base md:text-lg leading-relaxed">
                    {item.body}
                  </p>
                </div>
              </BlurIn>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
