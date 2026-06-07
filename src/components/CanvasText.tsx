import { useEffect, useRef } from 'react';

type Props = {
  text: string;
  /** Tailwind-Klassen für die Hintergrund-Fläche hinter dem Canvas. */
  backgroundClassName?: string;
  /** Farb-Stops, aus denen die Stäbe per Animations-Phase gepickt werden. */
  colors?: string[];
  /** Pixel-Abstand zwischen zwei Strichen. */
  lineGap?: number;
  /** Vollumlauf der Pulsation in Sekunden. */
  animationDuration?: number;
  /** zusätzliche Klassen für den äußeren Wrapper (Padding, rounded, …). */
  className?: string;
  /** zusätzliche Klassen für die eigentliche Text-Schicht. */
  textClassName?: string;
};

const cn = (...c: (string | undefined | false)[]) =>
  c.filter(Boolean).join(' ');

/**
 * Inline-Highlight mit Canvas-Equalizer: hinter dem Wort pulsieren
 * vertikale Striche in den übergebenen Farben — wirkt wie ein
 * animiertes Frequenz-Display. Text bleibt scharf darüber.
 *
 * - prefers-reduced-motion → einmaliges Static-Frame, kein Loop.
 * - Maus-Position wird nicht verarbeitet → komplett klick-transparent.
 * - DPR auf max. 2 begrenzt.
 */
export function CanvasText({
  text,
  backgroundClassName,
  colors = ['rgba(255,255,255,1)', 'rgba(255,255,255,0.4)'],
  lineGap = 4,
  animationDuration = 20,
  className,
  textClassName,
}: Props) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx || colors.length === 0) return;

    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf: number | null = null;
    let startTs = 0;

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reducedMq.matches;

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // initiales Frame, damit auch beim ersten Render schon etwas steht.
      draw(performance.now());
    };

    const draw = (t: number) => {
      ctx.clearRect(0, 0, width, height);
      const elapsed = (t - startTs) / 1000;
      const phase = (elapsed / animationDuration) * Math.PI * 2;
      const cols = Math.ceil(width / lineGap) + 1;
      const stripeWidth = Math.max(1, lineGap - 1);
      const colorCount = colors.length;
      for (let i = 0; i < cols; i++) {
        const x = i * lineGap;
        const seed = Math.sin(i * 0.73) * 1.7;
        const wave = Math.sin(phase + i * 0.32 + seed);
        const t01 = (wave + 1) / 2; // 0..1
        const lineHeight = height * (0.35 + 0.65 * t01);
        const y = (height - lineHeight) / 2;
        const colorIdx = Math.min(colorCount - 1, Math.floor(t01 * colorCount));
        ctx.fillStyle = colors[colorIdx];
        ctx.fillRect(x, y, stripeWidth, lineHeight);
      }
    };

    const tick = (t: number) => {
      if (startTs === 0) startTs = t;
      draw(t);
      raf = requestAnimationFrame(tick);
    };

    const onReduced = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      if (reduced && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!reduced && raf === null) {
        startTs = 0;
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    reducedMq.addEventListener('change', onReduced);

    if (!reduced) {
      raf = requestAnimationFrame(tick);
    } else {
      startTs = performance.now();
      draw(startTs);
    }

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      reducedMq.removeEventListener('change', onReduced);
    };
  }, [colors, lineGap, animationDuration]);

  return (
    <span
      ref={wrapperRef}
      className={cn(
        'relative inline-block align-baseline overflow-hidden rounded-lg px-3 md:px-4',
        className
      )}
    >
      {backgroundClassName && (
        <span
          aria-hidden="true"
          className={cn('absolute inset-0', backgroundClassName)}
        />
      )}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
      />
      <span className={cn('relative no-shadow', textClassName)}>{text}</span>
    </span>
  );
}
