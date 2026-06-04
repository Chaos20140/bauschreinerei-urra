import { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;

const framePath = (folder: string, i: number): string =>
  `${BASE}${folder}/frame-${String(i).padStart(3, '0')}.jpg`;

type LoadState = 'loading' | 'ready' | 'error';
type FrameBuffer = (HTMLImageElement | undefined)[];

export function useFrames(
  folder: string = 'frames',
  count: number = 140
): {
  framesRef: React.MutableRefObject<FrameBuffer>;
  state: LoadState;
  count: number;
  loadedCount: number;
} {
  const framesRef = useRef<FrameBuffer>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [loadedCount, setLoadedCount] = useState(0);

  useEffect(() => {
    framesRef.current = new Array(count);
    setLoadedCount(0);
    setState('loading');
    let cancelled = false;
    let loaded = 0;

    for (let i = 0; i < count; i++) {
      const img = new Image();
      img.decoding = 'async';
      if (i === 0) {
        (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
          'high';
      }
      const onSettle = (ok: boolean) => {
        if (cancelled) return;
        if (ok) framesRef.current[i] = img;
        loaded += 1;
        setLoadedCount(loaded);
        // Sobald Frame 1 da ist, Canvas freigeben — danach kann auch
        // mit Teil-Buffer gerendert werden (Fallback aufs nächstgelegene
        // geladene Frame).
        if (i === 0 && ok) setState('ready');
        if (loaded === count && state !== 'ready') {
          setState('ready');
        }
      };
      img.onload = () => onSettle(true);
      img.onerror = () => onSettle(false);
      img.src = framePath(folder, i + 1);
    }

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folder, count]);

  return { framesRef, state, count, loadedCount };
}

type Props = {
  framesRef: React.MutableRefObject<FrameBuffer>;
  count: number;
  loadedCount: number;
  progress: number;
  maxDpr?: number;
  easing?: number;
  bgPositionY?: number;
  /**
   * Cross-Fade zwischen aufeinanderfolgenden Frames aktivieren.
   * Bei hoher Frame-Density (z. B. 140 Frames) ist das visuell überflüssig
   * und doppelt nur die GPU-Last — empfehlenswert auf Mobile auszuschalten.
   */
  interpolate?: boolean;
};

export function ScrollSequenceCanvas({
  framesRef,
  count,
  loadedCount,
  progress,
  maxDpr = 2,
  easing = 0.18,
  bgPositionY = 0.5,
  interpolate = true,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetFrame = useRef(0);
  const currentFrame = useRef(0);
  const lastDrawn = useRef(-1);

  useEffect(() => {
    if (count <= 0) return;
    targetFrame.current = Math.min(
      count - 1,
      Math.max(0, Math.round(progress * (count - 1)))
    );
  }, [progress, count]);

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
      const diff = targetFrame.current - currentFrame.current;
      const absDiff = Math.abs(diff);
      if (absDiff > 0.005) {
        // Velocity-aware easing: bei großen Frame-Sprüngen (schnelles
        // Scrollen / harte Cuts im Quellvideo) wird das Easing degressiv
        // reduziert. So gleitet die Animation auch durch abrupte Stellen
        // sanft hinüber, statt mit einem sichtbaren Bild-Ruck zu reagieren.
        // Bei kleinen Diffs bleibt das Easing nahezu unverändert.
        const damping = 1 / (1 + absDiff * 0.12);
        currentFrame.current += diff * easing * damping;
        draw(currentFrame.current);
      } else if (currentFrame.current !== targetFrame.current) {
        currentFrame.current = targetFrame.current;
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
  }, [count, maxDpr, easing, bgPositionY, framesRef, interpolate]);

  // loadedCount Änderungen reichern die useRef-Daten an; der oben
  // laufende rAF-Loop pickt sie automatisch beim nächsten Tick auf.
  void loadedCount;

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
