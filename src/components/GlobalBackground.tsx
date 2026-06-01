import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollSequenceCanvas, useFrames } from './ScrollSequence';

const MOBILE_QUERY = '(max-width: 767px)';

// Routen, die einen eigenen Hintergrund haben (Legal-Pages mit viel Text)
// behalten ihre opake Bg-Fläche — der Canvas wird verdeckt, aber bleibt
// im DOM, damit der State (Frame-Position) beim Wechsel zur Homepage stimmt.
const SUPPRESSED_ROUTES = ['/impressum', '/datenschutz'];

export function GlobalBackground() {
  const location = useLocation();
  const suppressed = SUPPRESSED_ROUTES.includes(location.pathname);

  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_QUERY);
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    let rafId: number | null = null;

    const runCompute = () => {
      rafId = null;
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(Math.max(window.scrollY / total, 0), 1));
    };

    // Throttle über rAF: max. ein setProgress pro Frame, statt einmal pro
    // Scroll-Event (auf Mobile feuert Scroll bei Fling hunderte Male/s).
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(runCompute);
    };

    runCompute();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [location.pathname]);

  const folder = isMobile ? 'frames-mobile' : 'frames';
  const frameCount = isMobile ? 70 : 140;
  const { images, state } = useFrames(folder, frameCount);
  const effective = reduceMotion ? 0 : progress;

  if (suppressed) {
    return <div className="fixed inset-0 z-0 bg-neutral-950" aria-hidden="true" />;
  }

  if (state !== 'ready' || images.length === 0) {
    return <div className="fixed inset-0 z-0 bg-black" aria-hidden="true" />;
  }

  return (
    <ScrollSequenceCanvas
      images={images}
      progress={effective}
      maxDpr={isMobile ? 1.5 : 2}
      easing={isMobile ? 0.3 : 0.18}
      bgPositionY={0.5}
    />
  );
}
