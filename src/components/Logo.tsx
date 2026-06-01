type Props = { className?: string };

// Markenlogo „Bauschreinerei Heribert Urra" — 1:1 nach Vorlage:
// graue Haus-Silhouette (zwei rundliche Pfeiler + peaked Roof),
// im Inneren ein 2×2-Raster aus blauen Fenster-Quadraten.
// Brand-Farben hartcodiert (kein currentColor), damit das Logo
// auch über dem dunklen Video-Hintergrund seinen markeneigenen
// Look behält.
export function Logo({ className }: Props) {
  return (
    <svg
      viewBox="0 0 80 70"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <g>
        {/* Linker Pfeiler */}
        <rect x="6" y="28" width="9" height="36" rx="4.5" fill="#A5A5A5" />
        {/* Rechter Pfeiler */}
        <rect x="65" y="28" width="9" height="36" rx="4.5" fill="#A5A5A5" />
        {/* Peaked Roof, verbindet die Pfeiler-Köpfe */}
        <path
          d="M 2 30 L 40 6 L 78 30 L 70 36 L 40 17 L 10 36 Z"
          fill="#A5A5A5"
          strokeLinejoin="round"
        />
        {/* 2×2-Fenster-Raster in Brand-Blau */}
        <rect x="28" y="36" width="11" height="11" rx="1.5" fill="#1B9AD8" />
        <rect x="41" y="36" width="11" height="11" rx="1.5" fill="#1B9AD8" />
        <rect x="28" y="49" width="11" height="11" rx="1.5" fill="#1B9AD8" />
        <rect x="41" y="49" width="11" height="11" rx="1.5" fill="#1B9AD8" />
      </g>
    </svg>
  );
}
