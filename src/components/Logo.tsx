type Props = { className?: string };

// Markenlogo nach Vorgabe „Bauschreinerei Heribert Urra" — Haus mit
// peaked Roof, zwei tragenden Pfeilern und 2×2-Fenster-Raster im
// Inneren. Monochrom via `currentColor`, sodass Navbar (weiß) und
// Light-Kontexte (dunkel) ohne Anpassung funktionieren.
export function Logo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 64 64"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor">
        {/* Linker Pfeiler */}
        <rect x="8" y="30" width="6" height="26" rx="3" />
        {/* Rechter Pfeiler */}
        <rect x="50" y="30" width="6" height="26" rx="3" />
        {/* Peaked Roof, verbindet die Pfeiler-Köpfe */}
        <path d="M 4 32 L 32 9 L 60 32 L 56 36 L 32 18 L 8 36 Z" />
        {/* 2×2 Fenster-Raster */}
        <rect x="22" y="36" width="9" height="9" rx="1.5" />
        <rect x="33" y="36" width="9" height="9" rx="1.5" />
        <rect x="22" y="47" width="9" height="9" rx="1.5" />
        <rect x="33" y="47" width="9" height="9" rx="1.5" />
      </g>
    </svg>
  );
}
