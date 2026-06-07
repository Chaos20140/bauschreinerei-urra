import { useEffect, useState } from 'react';

/**
 * Ästhetischer Beige-Hintergrund für alle Unterseiten.
 *
 * Aufbau in Layern:
 *   1. Vertikaler Cream → Sand-Verlauf als Basis
 *   2. Zwei sanft driftende, warme Licht-Felder (cream highlights)
 *   3. Dezentes architektonisches Raster (radial maskiert)
 *   4. Sehr feiner SVG-Filmkorn-Layer (mix-blend-multiply)
 *   5. Warme Edge-Vignette für Tiefe
 *
 * Respektiert prefers-reduced-motion → statische Komposition ohne Drift.
 */
export function SubPageBackground() {
  const [reduceMotion, setReduceMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden pointer-events-none"
      aria-hidden="true"
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, #f3ebd6 0%, #ece2cb 48%, #e0d5b9 100%)',
        }}
      />

      <div
        className={`absolute -inset-[15%] ${
          reduceMotion ? '' : 'animate-urra-beige-a'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 22% 28%, rgba(255, 247, 226, 0.7), transparent 60%)',
          willChange: 'transform',
        }}
      />
      <div
        className={`absolute -inset-[15%] ${
          reduceMotion ? '' : 'animate-urra-beige-b'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 50% 45% at 78% 72%, rgba(255, 240, 210, 0.55), transparent 65%)',
          willChange: 'transform',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, #3a2d10 1px, transparent 1px), linear-gradient(to bottom, #3a2d10 1px, transparent 1px)',
          backgroundSize: '128px 128px',
          maskImage:
            'radial-gradient(ellipse 88% 72% at 50% 45%, black 55%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 88% 72% at 50% 45%, black 55%, transparent 100%)',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.07] mix-blend-multiply"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='180' height='180'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.7'/></svg>\")",
        }}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 70% at 50% 50%, transparent 55%, rgba(78, 56, 28, 0.22) 100%)',
        }}
      />
    </div>
  );
}
