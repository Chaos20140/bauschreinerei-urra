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
    <section className="relative pt-32 md:pt-40 pb-16 md:pb-24 px-6 md:px-12 overflow-hidden">
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
            className="text-white/55 text-[10px] md:text-xs tracking-[0.35em] uppercase mb-8 md:mb-12 flex items-center gap-3"
          >
            <Link to="/" className="hover:text-white transition-colors">
              start
            </Link>
            <span className="text-white/30">/</span>
            <span className="text-white/85">{eyebrow}</span>
          </nav>
        </BlurIn>
        <BlurIn delay={0.2}>
          <h1 className="hero-title text-white font-medium text-[14vw] md:text-[8vw] lg:text-[6.5vw] leading-[0.92] max-w-6xl">
            {title}
          </h1>
        </BlurIn>
        {intro && (
          <BlurIn delay={0.4} className="mt-6 md:mt-10 max-w-3xl">
            <p className="text-white/90 text-base md:text-xl leading-relaxed">
              {intro}
            </p>
          </BlurIn>
        )}
        {children && (
          <BlurIn delay={0.55} className="mt-10 md:mt-14">
            {children}
          </BlurIn>
        )}
      </div>
    </section>
  );
}
