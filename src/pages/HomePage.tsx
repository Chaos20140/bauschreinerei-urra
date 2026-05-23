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

export function HomePage() {
  const [progress, setProgress] = useState(0);
  const [reduceMotion, setReduceMotion] = useState(false);
  const { images, state } = useFrames();

  useEffect(() => {
    const compute = () => {
      const total =
        document.documentElement.scrollHeight - window.innerHeight;
      if (total <= 0) {
        setProgress(0);
        return;
      }
      setProgress(
        Math.min(Math.max(window.scrollY / total, 0), 1)
      );
    };

    compute();
    window.addEventListener('scroll', compute, { passive: true });
    window.addEventListener('resize', compute, { passive: true });
    return () => {
      window.removeEventListener('scroll', compute);
      window.removeEventListener('resize', compute);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(media.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    media.addEventListener('change', handler);
    return () => media.removeEventListener('change', handler);
  }, []);

  const effectiveProgress = reduceMotion ? 0 : progress;

  return (
    <>
      {state === 'ready' && images.length > 0 ? (
        <ScrollSequenceCanvas images={images} progress={effectiveProgress} />
      ) : (
        <div className="fixed inset-0 z-0 bg-black" aria-hidden="true" />
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
