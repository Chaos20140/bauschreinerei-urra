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

const MOBILE_QUERY = '(max-width: 767px)';

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

  useEffect(() => {
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
  }, []);

  return (
    <>
      <BackgroundCanvas
        isMobile={isMobile}
        progress={reduceMotion ? 0 : progress}
      />
      <Hero />
      <Services />
      <Products />
      <About />
      <Regions />
      <Contact />
    </>
  );
}

type BgProps = { isMobile: boolean; progress: number };

function BackgroundCanvas({ isMobile, progress }: BgProps) {
  const folder = isMobile ? 'frames-mobile' : 'frames';
  const { images, state } = useFrames(folder);

  if (state !== 'ready' || images.length === 0) {
    return <div className="fixed inset-0 z-0 bg-black" aria-hidden="true" />;
  }

  return (
    <ScrollSequenceCanvas
      images={images}
      progress={progress}
      maxDpr={isMobile ? 1.5 : 2}
      easing={isMobile ? 0.3 : 0.18}
      bgPositionY={isMobile ? 0.35 : 0.5}
    />
  );
}
