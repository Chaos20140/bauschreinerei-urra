import { Waves } from './Waves';

/**
 * Hintergrund für alle Unterseiten — interaktive Wellen-Linien auf
 * schwarzem Grund. Zeigt eleganten, monochromen Look und reagiert
 * auf den Cursor (Desktop). Auf Mobile/Touch laufen nur die Wellen,
 * die Cursor-Interaktion bleibt inaktiv.
 *
 * Eine dezente Edge-Vignette fügt Tiefe hinzu und hält die Mitte
 * lesbar, ohne den Effekt zu erdrücken.
 */
export function SubPageBackground() {
  return (
    <div
      className="fixed inset-0 z-0 overflow-hidden bg-black pointer-events-none"
      aria-hidden="true"
    >
      <Waves
        lineColor="#ffffff"
        backgroundColor="transparent"
        waveSpeedX={0.02}
        waveSpeedY={0.01}
        waveAmpX={40}
        waveAmpY={20}
        friction={0.9}
        tension={0.01}
        maxCursorMove={120}
        xGap={12}
        yGap={36}
      />
      <div
        className="absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse 75% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.7) 100%)',
        }}
      />
    </div>
  );
}
