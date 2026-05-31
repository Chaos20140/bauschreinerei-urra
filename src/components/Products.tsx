import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { products } from '../data/content';
import { BlurIn } from './BlurIn';

export function Products() {
  return (
    <section id="projekte" className="relative text-white py-24 md:py-40 px-6 md:px-12 overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 mb-12 md:mb-20">
          <BlurIn className="md:col-span-7">
            <p className="text-xs md:text-sm text-white/60 tracking-[0.3em] uppercase mb-4">
              02 — produkte
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[7vw] leading-[0.92]">
              {products.title}.
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-4 md:col-start-9 self-end" delay={0.15}>
            <p className="text-white/85 text-base md:text-lg leading-relaxed">
              {products.subtitle}
            </p>
          </BlurIn>
        </div>

        <div className="grid md:grid-cols-3 gap-5 md:gap-6">
          {products.categories.map((cat, idx) => (
            <BlurIn key={cat.title} delay={idx * 0.1}>
              <Link
                to="/leistungen"
                className="group block h-full rounded-2xl border border-white/15 bg-white/[0.04] p-7 md:p-9 overflow-hidden relative no-shadow transition-all duration-500 hover:border-white/40 hover:bg-white/[0.08] hover:-translate-y-1"
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                  style={{
                    background:
                      'radial-gradient(ellipse 100% 60% at 50% 0%, rgba(255,255,255,0.10), transparent 70%)',
                  }}
                  aria-hidden="true"
                />
                <div className="flex items-start justify-between mb-7">
                  <span className="text-white/40 text-xs tracking-[0.3em] tabular-nums">
                    {String(idx + 1).padStart(2, '0')}
                  </span>
                  <span className="h-9 w-9 grid place-items-center rounded-full border border-white/20 group-hover:bg-white group-hover:text-black text-white/70 transition-all duration-300 group-hover:rotate-45">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                </div>
                <h3 className="hero-title text-white text-3xl md:text-4xl font-medium mb-5">
                  {cat.title}
                </h3>
                <ul className="space-y-2.5">
                  {cat.items.map((item) => (
                    <li
                      key={item}
                      className="text-white/85 text-sm md:text-base border-t border-white/10 pt-2.5 flex items-center gap-3"
                    >
                      <span className="h-1 w-1 rounded-full bg-white/45" aria-hidden="true" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </Link>
            </BlurIn>
          ))}
        </div>
      </div>
    </section>
  );
}
