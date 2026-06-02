// Kreativer Hintergrund für Legal-Pages (Impressum, Datenschutz).
// Reine CSS-Komposition, keine externen Assets — dark base + sanfte
// Farb-Lichter + dezentes Grid-Pattern + organische Blob-Akzente.
export function LegalBackdrop() {
  return (
    <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
      {/* Basis */}
      <div className="absolute inset-0 bg-neutral-950" />

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

      {/* Farb-Lichter */}
      <div
        className="absolute -top-40 -left-32 h-[36rem] w-[36rem] rounded-full opacity-30 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(56,189,248,0.55), transparent 70%)',
        }}
      />
      <div
        className="absolute top-1/3 right-[-10rem] h-[28rem] w-[28rem] rounded-full opacity-25 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(168,85,247,0.5), transparent 70%)',
        }}
      />
      <div
        className="absolute bottom-[-10rem] left-1/4 h-[32rem] w-[32rem] rounded-full opacity-20 blur-3xl"
        style={{
          background:
            'radial-gradient(circle at center, rgba(34,211,238,0.5), transparent 70%)',
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
