import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollSequenceCanvas, useFrames } from './ScrollSequence';
import { SubPageBackground } from './SubPageBackground';

const MOBILE_QUERY = '(max-width: 767px)';

// Nur diese Route zeigt die Scroll-Video-Sequenz. Alle anderen
// (inkl. Impressum/Datenschutz) bekommen den ästhetischen Beige-
// Hintergrund.
const VIDEO_ROUTES = ['/'];

export function GlobalBackground() {
  const location = useLocation();

  if (!VIDEO_ROUTES.includes(location.pathname)) {
    return <SubPageBackground />;
  }
  return <VideoBackground />;
}

function VideoBackground() {
  const location = useLocation();
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
  const frameCount = isMobile ? 140 : 70;
  const { framesRef, state, count, loadedCount } = useFrames(folder, frameCount);
  const effective = reduceMotion ? 0 : progress;

  if (state !== 'ready') {
    return <div className="fixed inset-0 z-0 bg-black" aria-hidden="true" />;
  }

  return (
    <ScrollSequenceCanvas
      framesRef={framesRef}
      count={count}
      loadedCount={loadedCount}
      progress={effective}
      maxDpr={isMobile ? 1.5 : 2}
      easing={isMobile ? 0.14 : 0.11}
      bgPositionY={0.5}
      interpolate={true}
    />
  );
}
