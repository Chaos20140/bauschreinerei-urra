import { services } from '../data/content';
import { BlurIn } from './BlurIn';
import { Editable } from './editor/Editable';

export function Services() {
  return (
    <section id="leistungen" className="relative text-white py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 items-end mb-16 md:mb-24">
          <BlurIn className="md:col-span-6">
            <p className="text-xs md:text-sm text-white/60 tracking-[0.3em] uppercase mb-4">
              <Editable id="home.services.eyebrow">{services.eyebrow}</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[min(7vw,134.4px)]">
              <Editable id="home.services.title">{services.title}</Editable>
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-5 md:col-start-8" delay={0.15}>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              <Editable id="home.services.subtitle">{services.subtitle}</Editable>
            </p>
          </BlurIn>
        </div>

        <ul className="divide-y divide-white/10 border-t border-white/10">
          {services.items.map((item, idx) => (
            <li key={item.id}>
              <BlurIn delay={idx * 0.08}>
                <div className="grid md:grid-cols-12 gap-6 md:gap-10 py-10 md:py-14">
                  <h3 className="md:col-span-5 hero-title text-white text-3xl md:text-5xl font-medium">
                    <Editable id={`services.${item.id}.title`}>{item.title}</Editable>
                  </h3>
                  <p className="md:col-span-6 md:col-start-7 text-white/80 text-base md:text-lg leading-relaxed">
                    <Editable id={`services.${item.id}.body`}>{item.body}</Editable>
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
