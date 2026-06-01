import { Link } from 'react-router-dom';
import { BlurIn } from './BlurIn';
import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
};

export function PageHero({ eyebrow, title, intro, children }: Props) {
  return (
    <section className="relative pt-32 md:pt-40 pb-12 md:pb-20 px-6 md:px-12 overflow-hidden">
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 30% 0%, rgba(255,255,255,0.08), transparent 60%)',
        }}
        aria-hidden="true"
      />
      <div className="relative max-w-7xl mx-auto">
        <BlurIn delay={0.05}>
          <nav
            aria-label="breadcrumb"
            className="text-white/55 text-[10px] md:text-xs tracking-[0.35em] uppercase mb-10 md:mb-16 flex items-center gap-3"
          >
            <Link to="/" className="hover:text-white transition-colors">
              Start
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/85">{eyebrow}</span>
          </nav>
        </BlurIn>

        <div className="grid md:grid-cols-12 gap-x-8 gap-y-8 md:gap-y-12 items-end">
          <BlurIn delay={0.2} className="md:col-span-8">
            <h1
              className="hero-title text-white font-medium text-[14vw] md:text-[7.5vw] lg:text-[6vw] leading-[0.95]"
              style={{ textWrap: 'balance' }}
            >
              {title}
            </h1>
          </BlurIn>
          {intro && (
            <BlurIn delay={0.4} className="md:col-span-4 md:pb-3">
              <p
                className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed"
                style={{ textWrap: 'pretty' }}
              >
                {intro}
              </p>
            </BlurIn>
          )}
        </div>

        {children && (
          <BlurIn delay={0.55} className="mt-12 md:mt-16">
            {children}
          </BlurIn>
        )}
      </div>
    </section>
  );
}
