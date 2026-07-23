import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollSequenceCanvas, useFrames } from './ScrollSequence';
import { SubPageBackground } from './SubPageBackground';

const MOBILE_QUERY = '(max-width: 767px)';

// Nur diese Route zeigt die Scroll-Video-Sequenz. Alle anderen
// (inkl. Impressum/Datenschutz) bekommen den ästhetischen Beige-
// Hintergrund.
const VIDEO_ROUTES = ['/'];

// Beide Sequenzen laufen über dieselbe Anzahl Frames. Mobile hat 140 Dateien
// im Ordner, nutzt aber nur jede zweite: gleiche Bewegung, halber Traffic und
// halber Speicherbedarf auf genau den Geräten mit dem schwächsten Netz.
const DESKTOP = { folder: 'frames', count: 70, step: 1 } as const;
const MOBILE = { folder: 'frames-mobile', count: 70, step: 2 } as const;

export function GlobalBackground() {
  const location = useLocation();

  if (!VIDEO_ROUTES.includes(location.pathname)) {
    return <SubPageBackground />;
  }
  return <VideoBackground />;
}

function VideoBackground() {
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(MOBILE_QUERY).matches;
  });
  const [reduceMotion, setReduceMotion] = useState(false);

  // Scroll-Fortschritt bewusst als Ref statt State: er ändert sich bei jedem
  // Scroll-Tick, und ein setState pro Tick hat den kompletten React-Baum
  // 60-mal pro Sekunde neu gerendert. Der rAF-Loop im Canvas liest den Wert
  // direkt — React sieht davon nichts mehr.
  const progressRef = useRef(0);

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
    if (reduceMotion) {
      progressRef.current = 0;
      return;
    }

    let rafId: number | null = null;

    const runCompute = () => {
      rafId = null;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      progressRef.current =
        total <= 0 ? 0 : Math.min(Math.max(window.scrollY / total, 0), 1);
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
  }, [reduceMotion]);

  const variant = isMobile ? MOBILE : DESKTOP;
  const { framesRef, state, count } = useFrames(
    variant.folder,
    variant.count,
    variant.step
  );

  // Fällt die Sequenz komplett aus (Netzfehler, 404 auf den Frames), bleibt
  // sonst dauerhaft eine schwarze Fläche stehen. Dann lieber den statischen
  // Beige-Hintergrund zeigen als gar nichts.
  if (state === 'error') return <SubPageBackground />;

  if (state !== 'ready') {
    return <div className="fixed inset-0 z-0 bg-black" aria-hidden="true" />;
  }

  return (
    <ScrollSequenceCanvas
      framesRef={framesRef}
      count={count}
      progressRef={progressRef}
      maxDpr={isMobile ? 1.5 : 2}
      easing={isMobile ? 0.14 : 0.11}
      bgPositionY={0.5}
      interpolate={!isMobile}
    />
  );
}
