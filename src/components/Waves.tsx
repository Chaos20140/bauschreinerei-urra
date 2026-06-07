import { useEffect, useRef } from 'react';

type Props = {
  lineColor?: string;
  backgroundColor?: string;
  waveSpeedX?: number;
  waveSpeedY?: number;
  waveAmpX?: number;
  waveAmpY?: number;
  friction?: number;
  tension?: number;
  maxCursorMove?: number;
  xGap?: number;
  yGap?: number;
  className?: string;
};

type WavePoint = {
  x: number;
  y: number;
  wave: { x: number; y: number };
  cursor: { x: number; y: number; vx: number; vy: number };
};

/**
 * Interaktiver Wellen-Hintergrund auf Canvas-Basis.
 * Vertikale Linien, die wellenförmig fließen und auf Cursor-Nähe mit
 * gefederter Verformung reagieren — komplett selbst gerendert über
 * requestAnimationFrame, ohne externe Animations-Library.
 *
 * Maus-Position wird global per pointermove gehört (kein pointer-events
 * am Canvas nötig), damit der Hintergrund komplett klick-transparent
 * für die darüberliegenden Inhalte bleibt.
 *
 * Respektiert prefers-reduced-motion → einmaliges Zeichnen, kein Loop.
 */
export function Waves({
  lineColor = '#ffffff',
  backgroundColor = 'transparent',
  waveSpeedX = 0.02,
  waveSpeedY = 0.01,
  waveAmpX = 40,
  waveAmpY = 20,
  friction = 0.9,
  tension = 0.01,
  maxCursorMove = 120,
  xGap = 12,
  yGap = 36,
  className,
}: Props) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const wrapper = wrapperRef.current;
    const canvas = canvasRef.current;
    if (!wrapper || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = 0;
    let height = 0;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let lines: WavePoint[][] = [];
    let raf: number | null = null;
    let frame = 0;

    const target = { x: 0, y: 0 };
    const mouse = { x: 0, y: 0 };
    let hasMouse = false;

    const reducedMq = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reduced = reducedMq.matches;

    const build = () => {
      lines = [];
      const cols = Math.ceil(width / xGap) + 1;
      const rows = Math.ceil(height / yGap) + 1;
      for (let i = 0; i <= cols; i++) {
        const line: WavePoint[] = [];
        for (let j = 0; j <= rows; j++) {
          line.push({
            x: i * xGap,
            y: j * yGap,
            wave: { x: 0, y: 0 },
            cursor: { x: 0, y: 0, vx: 0, vy: 0 },
          });
        }
        lines.push(line);
      }
    };

    const resize = () => {
      const rect = wrapper.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      build();
      // Nach Resize einmal zeichnen, damit auch im reduced-Mode der
      // Hintergrund nicht leer wirkt.
      step();
      paint();
    };

    const RADIUS = 175;
    const RADIUS2 = RADIUS * RADIUS;

    const step = () => {
      frame += 1;
      const t = frame;
      // weicher Maus-Follow — kleine Glättung pro Frame
      mouse.x += (target.x - mouse.x) * 0.1;
      mouse.y += (target.y - mouse.y) * 0.1;
      for (const line of lines) {
        for (const p of line) {
          p.wave.x = Math.cos(t * waveSpeedX + (p.x + p.y) * 0.005) * waveAmpX;
          p.wave.y = Math.sin(t * waveSpeedY + (p.x + p.y) * 0.01) * waveAmpY;

          if (hasMouse) {
            const dx = p.x - mouse.x;
            const dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < RADIUS2) {
              const d = Math.sqrt(d2);
              const f = (RADIUS - d) / RADIUS;
              const ang = Math.atan2(dy, dx);
              p.cursor.vx += Math.cos(ang) * f * 2;
              p.cursor.vy += Math.sin(ang) * f * 2;
            }
          }

          // Spring zurück in Ursprungs-Lage
          p.cursor.vx += -p.cursor.x * tension;
          p.cursor.vy += -p.cursor.y * tension;
          p.cursor.vx *= friction;
          p.cursor.vy *= friction;
          p.cursor.x += p.cursor.vx;
          p.cursor.y += p.cursor.vy;

          if (p.cursor.x > maxCursorMove) p.cursor.x = maxCursorMove;
          else if (p.cursor.x < -maxCursorMove) p.cursor.x = -maxCursorMove;
          if (p.cursor.y > maxCursorMove) p.cursor.y = maxCursorMove;
          else if (p.cursor.y < -maxCursorMove) p.cursor.y = -maxCursorMove;
        }
      }
    };

    const paint = () => {
      if (backgroundColor === 'transparent') {
        ctx.clearRect(0, 0, width, height);
      } else {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, width, height);
      }
      ctx.strokeStyle = lineColor;
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (const line of lines) {
        if (line.length === 0) continue;
        const first = line[0];
        let prevX = first.x + first.wave.x + first.cursor.x;
        let prevY = first.y + first.wave.y + first.cursor.y;
        ctx.moveTo(prevX, prevY);
        for (let i = 1; i < line.length; i++) {
          const p = line[i];
          const cx = p.x + p.wave.x + p.cursor.x;
          const cy = p.y + p.wave.y + p.cursor.y;
          const mx = (prevX + cx) / 2;
          const my = (prevY + cy) / 2;
          ctx.quadraticCurveTo(prevX, prevY, mx, my);
          prevX = cx;
          prevY = cy;
        }
        ctx.lineTo(prevX, prevY);
      }
      ctx.stroke();
    };

    const tick = () => {
      step();
      paint();
      raf = requestAnimationFrame(tick);
    };

    const onPointer = (e: PointerEvent) => {
      const rect = wrapper.getBoundingClientRect();
      target.x = e.clientX - rect.left;
      target.y = e.clientY - rect.top;
      if (!hasMouse) {
        mouse.x = target.x;
        mouse.y = target.y;
        hasMouse = true;
      }
    };

    const onReducedChange = (e: MediaQueryListEvent) => {
      reduced = e.matches;
      if (reduced && raf !== null) {
        cancelAnimationFrame(raf);
        raf = null;
      } else if (!reduced && raf === null) {
        raf = requestAnimationFrame(tick);
      }
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });
    reducedMq.addEventListener('change', onReducedChange);

    if (!reduced) {
      raf = requestAnimationFrame(tick);
    }

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointer);
      reducedMq.removeEventListener('change', onReducedChange);
    };
  }, [
    lineColor,
    backgroundColor,
    waveSpeedX,
    waveSpeedY,
    waveAmpX,
    waveAmpY,
    friction,
    tension,
    maxCursorMove,
    xGap,
    yGap,
  ]);

  return (
    <div
      ref={wrapperRef}
      className={className ?? 'absolute inset-0 w-full h-full'}
    >
      <canvas
        ref={canvasRef}
        className="block w-full h-full"
        aria-hidden="true"
      />
    </div>
  );
}
