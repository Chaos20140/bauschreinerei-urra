import { Link } from 'react-router-dom';
import { BlurIn } from './BlurIn';
import { Editable } from './editor/Editable';
import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  title: string;
  intro?: string;
  children?: ReactNode;
  /**
   * Bei `stacked` rendern Titel und Intro untereinander statt im 2-Spalten-
   * Grid. Sinnvoll für sehr lange einzelne Wörter wie „Datenschutzerklärung",
   * die sonst die Intro-Spalte überlaufen.
   */
  layout?: 'split' | 'stacked';
  /** Kompakte Titelgröße — gut für legal Pages. */
  titleSize?: 'default' | 'compact';
  /**
   * Präfix für die Editable-IDs (z. B. "leistungen"). Ist es gesetzt, sind
   * Eyebrow, Titel und Intro im Bearbeiten-Modus editierbar. Ohne Präfix
   * bleiben sie fest (z. B. auf den Rechtsseiten).
   */
  idPrefix?: string;
};

export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  layout = 'split',
  titleSize = 'default',
  idPrefix,
}: Props) {
  const titleNode = idPrefix ? (
    <Editable id={`${idPrefix}.title`} rich>
      {title}
    </Editable>
  ) : (
    title
  );
  const introNode =
    intro != null
      ? idPrefix
        ? <Editable id={`${idPrefix}.intro`}>{intro}</Editable>
        : intro
      : null;
  const eyebrowNode = idPrefix ? (
    <Editable id={`${idPrefix}.eyebrow`}>{eyebrow}</Editable>
  ) : (
    eyebrow
  );
  const titleClass =
    titleSize === 'compact'
      ? 'hero-title text-white font-medium text-[7vw] md:text-[min(5vw,96px)] lg:text-[min(4vw,76.8px)] leading-[1] break-words'
      : 'hero-title text-white font-medium text-[14vw] md:text-[min(7.5vw,144px)] lg:text-[min(6vw,115.2px)] leading-[0.95]';
  const titleStyle =
    titleSize === 'compact'
      ? { textWrap: 'balance' as const, hyphens: 'auto' as const }
      : { textWrap: 'balance' as const };

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
            <span className="text-white/85">{eyebrowNode}</span>
          </nav>
        </BlurIn>

        {layout === 'stacked' ? (
          <>
            <BlurIn delay={0.2}>
              <h1 className={titleClass} style={titleStyle} lang="de">
                {titleNode}
              </h1>
            </BlurIn>
            {introNode && (
              <BlurIn delay={0.35} className="mt-6 md:mt-8 max-w-3xl">
                <p
                  className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed"
                  style={{ textWrap: 'pretty' }}
                >
                  {introNode}
                </p>
              </BlurIn>
            )}
          </>
        ) : (
          <div className="grid md:grid-cols-12 gap-x-8 gap-y-8 md:gap-y-12 items-end">
            <BlurIn delay={0.2} className="md:col-span-8">
              <h1 className={titleClass} style={titleStyle} lang="de">
                {titleNode}
              </h1>
            </BlurIn>
            {introNode && (
              <BlurIn delay={0.4} className="md:col-span-4 md:pb-3">
                <p
                  className="text-white/90 text-base md:text-lg lg:text-xl leading-relaxed"
                  style={{ textWrap: 'pretty' }}
                >
                  {introNode}
                </p>
              </BlurIn>
            )}
          </div>
        )}

        {children && (
          <BlurIn delay={0.55} className="mt-12 md:mt-16">
            {children}
          </BlurIn>
        )}
      </div>
    </section>
  );
}
