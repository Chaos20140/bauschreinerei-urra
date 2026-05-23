import { products } from '../data/content';
import { BlurIn } from './BlurIn';

export function Products() {
  return (
    <section id="projekte" className="relative text-white py-32 md:py-40 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <div className="grid md:grid-cols-12 gap-8 mb-16 md:mb-24">
          <BlurIn className="md:col-span-7">
            <p className="text-xs md:text-sm text-white/60 tracking-widest uppercase mb-4">
              02 — produkte
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[7vw]">
              {products.title}
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              {products.subtitle}
            </p>
          </BlurIn>
        </div>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8">
          {products.categories.map((cat, idx) => (
            <BlurIn key={cat.title} delay={idx * 0.12}>
              <article className="border border-white/15 rounded-2xl p-8 md:p-10 bg-white/[0.04] h-full">
                <div className="flex items-baseline justify-between mb-8">
                  <h3 className="hero-title text-white text-3xl md:text-4xl font-medium">
                    {cat.title}
                  </h3>
                  <span className="text-white/40 text-xs tracking-widest">
                    {String(cat.items.length).padStart(2, '0')}
                  </span>
                </div>
                <ul className="space-y-3">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="text-white/85 text-base md:text-lg border-t border-white/10 pt-3"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </article>
            </BlurIn>
          ))}
        </div>
      </div>
    </section>
  );
}
