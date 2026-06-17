import type { SVGProps } from 'react';

/**
 * Monochrome Wordmark-SVGs für die Partner-Hersteller.
 * Bewusst keine 1:1-Kopien der originalen Brand-Logos — wir nutzen
 * typografische Repräsentationen in der hauseigenen Schrift (Readex Pro).
 *
 * Vorteile dieser Variante:
 *  - Keine externen Assets, kein Mixed-Content / kein Markenstreit
 *  - Färbbar über `currentColor` → passt automatisch zu Light/Dark
 *  - Lassen sich später leicht 1:1 durch echte Pressekit-SVGs ersetzen
 *    (gleiches `<svg>`-Schema, gleiche viewBox-Logik im PartnerCard)
 *
 * Visuelle Diversität entsteht über unterschiedliche Cases, Weights
 * und Letter-Spacing pro Marke.
 */

const FONT = '"Readex Pro", system-ui, -apple-system, sans-serif';

type Common = SVGProps<SVGSVGElement>;

export function SchuecoLogo(props: Common) {
  return (
    <svg
      viewBox="0 0 260 72"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Schüco"
      {...props}
    >
      <text
        x="130"
        y="48"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="40"
        fontWeight={700}
        letterSpacing="-0.04em"
      >
        Schüco
      </text>
    </svg>
  );
}

export function KoemmerlingLogo(props: Common) {
  return (
    <svg
      viewBox="0 0 320 72"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Kömmerling"
      {...props}
    >
      <text
        x="160"
        y="46"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="24"
        fontWeight={500}
        letterSpacing="0.24em"
      >
        KÖMMERLING
      </text>
    </svg>
  );
}

export function WaremaLogo(props: Common) {
  return (
    <svg
      viewBox="0 0 260 72"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Warema"
      {...props}
    >
      <text
        x="130"
        y="48"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="36"
        fontWeight={800}
        letterSpacing="0.04em"
      >
        WAREMA
      </text>
    </svg>
  );
}

export function SomfyLogo(props: Common) {
  return (
    <svg
      viewBox="0 0 260 72"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Somfy"
      {...props}
    >
      <text
        x="130"
        y="50"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="42"
        fontWeight={700}
        letterSpacing="-0.03em"
      >
        somfy
      </text>
    </svg>
  );
}

export function RomaLogo(props: Common) {
  return (
    <svg
      viewBox="0 0 260 72"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Roma"
      {...props}
    >
      <text
        x="130"
        y="48"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="38"
        fontWeight={700}
        letterSpacing="0.18em"
      >
        ROMA
      </text>
    </svg>
  );
}

export function HoermannLogo(props: Common) {
  return (
    <svg
      viewBox="0 0 300 72"
      xmlns="http://www.w3.org/2000/svg"
      fill="currentColor"
      role="img"
      aria-label="Hörmann"
      {...props}
    >
      <text
        x="150"
        y="48"
        textAnchor="middle"
        fontFamily={FONT}
        fontSize="34"
        fontWeight={800}
        letterSpacing="0.1em"
      >
        HÖRMANN
      </text>
    </svg>
  );
}

export const PARTNER_LOGOS = {
  schueco: SchuecoLogo,
  koemmerling: KoemmerlingLogo,
  warema: WaremaLogo,
  somfy: SomfyLogo,
  roma: RomaLogo,
  hoermann: HoermannLogo,
} as const;

export type PartnerLogoKey = keyof typeof PARTNER_LOGOS;
