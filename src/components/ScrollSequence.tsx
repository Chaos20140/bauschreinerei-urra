import { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;

// Bewusst JPEG und nicht WebP: gemessen unter 4-facher CPU-Drosselung
// dekodiert WebP 2,2-mal langsamer, und diese Dekodierzeit blockiert den
// Main-Thread — die Sequenz ist CPU- und nicht bandbreitenlimitiert.
// Auslieferungsgröße erzeugt `npm run images` aus media-src/.
const framePath = (folder: string, fileIndex: number): string =>
  `${BASE}${folder}/frame-${String(fileIndex).padStart(3, '0')}.jpg`;

type LoadState = 'loading' | 'ready' | 'error';
type FrameBuffer = (HTMLImageElement | undefined)[];

/**
 * Lädt die Frames der Scroll-Sequenz.
 *
 * Vorher wurden alle Frames in einer Schleife gleichzeitig angefordert — auf
 * dem Desktop rund 10 MB in einem Schwung, konkurrierend mit Bundle und CSS.
 * Jetzt läuft eine Warteschlange mit begrenzter Parallelität: Frame 1 kommt
 * zuerst (LCP), der Rest fließt der Reihe nach nach. Beim Unmount werden
 * laufende Downloads abgebrochen und der Puffer geleert, damit die dekodierten
 * Bitmaps nicht im Speicher hängen bleiben.
 *
 * @param folder    Unterordner in public/ (z. B. 'frames')
 * @param count     Anzahl zu ladender Frames
 * @param step      Nutzt nur jedes n-te Bild aus dem Ordner. Mobile hat 140
 *                  Dateien; mit step=2 entsteht dieselbe Bewegung aus 70
 *                  Bildern — halber Traffic, halber Speicher.
 */
export function useFrames(
  folder: string = 'frames',
  count: number = 70,
  step: number = 1,
  concurrency: number = 6
): {
  framesRef: React.MutableRefObject<FrameBuffer>;
  state: LoadState;
  count: number;
} {
  const framesRef = useRef<FrameBuffer>([]);
  const [state, setState] = useState<LoadState>('loading');

  useEffect(() => {
    framesRef.current = new Array(count);
    setState('loading');

    let cancelled = false;
    let nextIndex = 0;
    let settled = 0;
    let succeeded = 0;
    const inFlight = new Set<HTMLImageElement>();

    const startNext = () => {
      if (cancelled || nextIndex >= count) return;
      const i = nextIndex++;
      const img = new Image();
      inFlight.add(img);
      img.decoding = 'async';
      if (i === 0) {
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
          'high';
      }

      const settle = (ok: boolean) => {
        inFlight.delete(img);
        if (cancelled) return;
        if (ok) {
          framesRef.current[i] = img;
          succeeded += 1;
        }
        settled += 1;

        // Sobald Frame 1 da ist, kann gezeichnet werden — der rAF-Loop
        // greift nachrückende Frames automatisch auf.
        if (i === 0 && ok) setState('ready');
        if (settled === count) {
          setState((prev) =>
            prev === 'ready' ? prev : succeeded > 0 ? 'ready' : 'error'
          );
        }
        startNext();
      };

      img.onload = () => settle(true);
      img.onerror = () => settle(false);
      img.src = framePath(folder, i * step + 1);
    };

    for (let k = 0; k < Math.min(concurrency, count); k++) startNext();

    return () => {
      cancelled = true;
      // Laufende Requests abbrechen: ohne das lädt beim Wechsel zwischen
      // Mobile- und Desktop-Sequenz beides parallel weiter.
      inFlight.forEach((img) => {
        img.onload = null;
        img.onerror = null;
        img.src = '';
      });
      inFlight.clear();
      framesRef.current = [];
    };
  }, [folder, count, step, concurrency]);

  return { framesRef, state, count };
}

type Props = {
  framesRef: React.MutableRefObject<FrameBuffer>;
  count: number;
  /**
   * Scroll-Fortschritt 0…1 als Ref — bewusst kein State: der Wert ändert sich
   * bei jedem Scroll-Tick, und ein setState pro Frame würde den kompletten
   * React-Baum 60-mal pro Sekunde neu rendern. Der rAF-Loop liest den Ref
   * direkt.
   */
  progressRef: React.MutableRefObject<number>;
  maxDpr?: number;
  easing?: number;
  bgPositionY?: number;
  /**
   * Cross-Fade zwischen aufeinanderfolgenden Frames aktivieren.
   * Bei hoher Frame-Density ist das visuell überflüssig und doppelt nur die
   * GPU-Last — empfehlenswert auf Mobile auszuschalten.
   */
  interpolate?: boolean;
};

export function ScrollSequenceCanvas({
  framesRef,
  count,
  progressRef,
  maxDpr = 2,
  easing = 0.18,
  bgPositionY = 0.5,
  interpolate = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const currentFrame = useRef(0);
  const lastDrawn = useRef(-1);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || count <= 0) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

    const findNearest = (target: number): HTMLImageElement | undefined => {
      const buf = framesRef.current;
      if (buf[target]) return buf[target];
      for (let d = 1; d < buf.length; d++) {
        if (buf[target - d]) return buf[target - d];
        if (buf[target + d]) return buf[target + d];
      }
      return undefined;
    };

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      lastDrawn.current = -1;
      draw(currentFrame.current);
    };

    const drawSingle = (
      img: HTMLImageElement,
      cw: number,
      ch: number,
      alpha = 1
    ) => {
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      if (!iw || !ih) return;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) * bgPositionY;
      if (alpha < 1) ctx.globalAlpha = alpha;
      ctx.drawImage(img, dx, dy, dw, dh);
      if (alpha < 1) ctx.globalAlpha = 1;
    };

    // Cross-Fade-Interpolation: bei Subpixel-Frame-Position (z. B. 23.4)
    // wird Frame 23 als Basis gezeichnet und Frame 24 darüber mit Alpha
    // 0.4 — so blendet die Sequenz weich zwischen den Frames hin und her,
    // statt hart von einem Bild zum nächsten zu springen.
    const draw = (frameIndex: number) => {
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;

      const lo = Math.max(0, Math.floor(frameIndex));
      const hi = Math.min(count - 1, lo + 1);
      const frac = frameIndex - lo;

      const imgLo = findNearest(lo);
      if (!imgLo) return;

      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);

      drawSingle(imgLo, cw, ch, 1);

      if (interpolate && frac > 0.02 && hi !== lo) {
        // Nur direkt geladene Frames für die Hi-Schicht verwenden —
        // andernfalls könnte das Fallback-Frame mit lo identisch sein
        // und das Blending fügt nichts hinzu.
        const imgHi = framesRef.current[hi];
        if (imgHi && imgHi !== imgLo) {
          drawSingle(imgHi, cw, ch, Math.min(1, frac));
        }
      }

      lastDrawn.current = Math.round(frameIndex);
    };

    const tick = () => {
      const target = Math.min(
        count - 1,
        Math.max(0, progressRef.current * (count - 1))
      );
      const diff = target - currentFrame.current;
      const absDiff = Math.abs(diff);

      if (absDiff > 0.005) {
        // Velocity-aware easing: bei großen Frame-Sprüngen (schnelles
        // Scrollen / harte Cuts im Quellvideo) wird das Easing degressiv
        // reduziert. So gleitet die Animation auch durch abrupte Stellen
        // sanft hinüber, statt mit einem sichtbaren Bild-Ruck zu reagieren.
        const damping = 1 / (1 + absDiff * 0.12);
        currentFrame.current += diff * easing * damping;
        draw(currentFrame.current);
      } else if (currentFrame.current !== target) {
        currentFrame.current = target;
        draw(currentFrame.current);
      } else if (
        // Re-draw, sobald der ursprünglich gewünschte Ziel-Frame
        // nachgeladen wurde (lastDrawn hatte vorher das Fallback-Frame).
        lastDrawn.current !== Math.round(currentFrame.current) &&
        framesRef.current[Math.round(currentFrame.current)]
      ) {
        draw(currentFrame.current);
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      window.removeEventListener('resize', resize);
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    };
  }, [count, maxDpr, easing, bgPositionY, framesRef, progressRef, interpolate]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{
        filter: 'contrast(1.08) saturate(1.08) brightness(0.82)',
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
