import { about, brand } from '../data/content';
import { BlurIn } from './BlurIn';

export function About() {
  return (
    <section id="ueber-uns" className="relative text-white py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BlurIn className="grid md:grid-cols-12 gap-8 mb-16 md:mb-24">
          <div className="md:col-span-7">
            <p className="text-xs md:text-sm text-white/60 tracking-widest uppercase mb-4">
              04 — {about.title}
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] max-w-5xl">
              „{about.lead}"
            </h2>
          </div>
        </BlurIn>

        <div className="grid md:grid-cols-12 gap-10">
          <BlurIn className="md:col-span-6 space-y-6 text-white/85 text-base md:text-lg leading-relaxed">
            {about.paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="text-white/50 text-sm tracking-widest uppercase pt-4">
              — h. urra · {brand.longName}
            </p>
          </BlurIn>

          <ul className="md:col-span-5 md:col-start-8 space-y-6">
            {about.values.map((v, idx) => (
              <li key={v.key}>
                <BlurIn delay={idx * 0.1}>
                  <div className="border-t border-white/15 pt-6">
                    <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-2">
                      {v.key}
                    </h3>
                    <p className="text-white/80 text-base">{v.body}</p>
                  </div>
                </BlurIn>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
