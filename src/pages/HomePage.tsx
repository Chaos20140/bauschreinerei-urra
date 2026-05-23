import { useEffect, useState } from 'react';
import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Products } from '../components/Products';
import { About } from '../components/About';
import { Regions } from '../components/Regions';
import { Contact } from '../components/Contact';
import {
  ScrollSequenceCanvas,
  useFrames,
} from '../components/ScrollSequence';

const BASE = import.meta.env.BASE_URL;
const MOBILE_QUERY = '(max-width: 767px)';

function StaticHeroBg() {
  return (
    <div
      className="fixed inset-0 z-0 bg-black"
      style={{
        backgroundImage: `url(${BASE}frames/frame-001.jpg)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center 30%',
        backgroundRepeat: 'no-repeat',
        filter: 'contrast(1.08) saturate(1.08) brightness(0.78)',
      }}
      aria-hidden="true"
    />
  );
}

export function HomePage() {
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

  const useStatic = isMobile || reduceMotion;

  useEffect(() => {
    if (useStatic) return;
    const compute = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      setProgress(Math.min(Math.max(window.scrollY / total, 0), 1));
    };

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, [useStatic]);

  return (
    <>
      {useStatic ? (
        <StaticHeroBg />
      ) : (
        <DesktopCanvas progress={progress} />
      )}
      <Hero />
      <Services />
      <Products />
      <About />
      <Regions />
      <Contact />
    </>
  );
}

function DesktopCanvas({ progress }: { progress: number }) {
  const { images, state } = useFrames();
  if (state !== 'ready' || images.length === 0) {
    return <div className="fixed inset-0 z-0 bg-black" aria-hidden="true" />;
  }
  return <ScrollSequenceCanvas images={images} progress={progress} />;
}
