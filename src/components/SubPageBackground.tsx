import { useEffect, useState } from 'react';

/**
 * Eleganter, monochromer Hintergrund für alle Unterseiten — bewusst keine
 * Bewegungssequenz, sondern eine ruhige, architektonisch wirkende Bühne mit:
 *  - schwarzer Basis
 *  - zwei weichen, langsam driftenden Lichtfeldern
 *  - sehr dezentem Architektur-Raster (radial maskiert)
 *  - dünner diagonaler Licht-Wischbewegung
 *  - leichter Edge-Vignette
 *
 * Respektiert prefers-reduced-motion → ohne Animation, statische Komposition.
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
      className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none"
      aria-hidden="true"
    >
      <div
        className={`absolute -inset-[15%] ${
          reduceMotion ? '' : 'animate-urra-mesh-a'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 55% 50% at 24% 28%, rgba(255,255,255,0.11), transparent 60%)',
          willChange: 'transform',
        }}
      />
      <div
        className={`absolute -inset-[15%] ${
          reduceMotion ? '' : 'animate-urra-mesh-b'
        }`}
        style={{
          background:
            'radial-gradient(ellipse 45% 40% at 78% 72%, rgba(255,255,255,0.08), transparent 65%)',
          willChange: 'transform',
        }}
      />

      <div
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)',
          backgroundSize: '96px 96px',
          maskImage:
            'radial-gradient(ellipse 90% 75% at 50% 45%, black 55%, transparent 100%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 75% at 50% 45%, black 55%, transparent 100%)',
        }}
      />

      {!reduceMotion && (
        <div
          className="absolute -inset-x-[20%] top-1/3 h-px animate-urra-sheen"
          style={{
            background:
              'linear-gradient(to right, transparent, rgba(255,255,255,0.22) 50%, transparent)',
          }}
        />
      )}

      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 70% 60% at 50% 50%, transparent 50%, rgba(0,0,0,0.65) 100%)',
        }}
      />
    </div>
  );
}
