import { motion } from 'motion/react';

// Kreativer Hintergrund für Legal-Pages (Impressum, Datenschutz).
// Reine CSS-Komposition + ein motion-animiertes Pulse-Licht oben.
// Keine externen Assets.
export function LegalBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Basis */}
      <div className="absolute inset-0 bg-neutral-950" />

      {/* Pulsierendes blaues Licht — oben, mittig, atmet ein- und aus */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-72 h-[44rem] w-[44rem] rounded-full blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(56,189,248,0.65) 0%, rgba(59,130,246,0.35) 35%, transparent 70%)',
        }}
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.45, 0.75, 0.45],
        }}
        transition={{
          duration: 5,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Kleineres, schneller pulsierendes Innen-Licht für Tiefe */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 -top-56 h-[22rem] w-[22rem] rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(125,211,252,0.7) 0%, transparent 70%)',
        }}
        animate={{
          scale: [0.9, 1.08, 0.9],
          opacity: [0.4, 0.7, 0.4],
        }}
        transition={{
          duration: 3.5,
          ease: 'easeInOut',
          repeat: Infinity,
        }}
      />

      {/* Sanftes Blueprint-Grid */}
      <div
        className="absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.6) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
          maskImage:
            'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 80%)',
          WebkitMaskImage:
            'radial-gradient(ellipse 90% 70% at 50% 30%, black 40%, transparent 80%)',
        }}
      />

      {/* Sekundäre Farb-Lichter im unteren Bereich für Tiefe */}
      <div
        className="absolute top-1/3 right-[-10rem] h-[28rem] w-[28rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(168,85,247,0.45), transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-10rem] left-1/4 h-[32rem] w-[32rem] rounded-full opacity-15 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(34,211,238,0.45), transparent 70%)',
        }}
      />

      {/* Subtiles Vignette / Tiefendurchgang */}
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 100% 80% at 50% 0%, transparent 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.7) 100%)',
        }}
      />

      {/* Feiner Korn-Effekt für Tiefe */}
      <div
        className="absolute inset-0 opacity-[0.05] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)' opacity='0.6'/></svg>\")",
        }}
      />
    </div>
  );
}
