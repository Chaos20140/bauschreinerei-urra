import { useEffect, useRef, useState } from 'react';

const FRAME_COUNT = 100;
const BASE = import.meta.env.BASE_URL;
const framePath = (i: number): string =>
  `${BASE}frames/frame-${String(i).padStart(3, '0')}.jpg`;

type LoadState = 'loading' | 'ready' | 'error';

export function useFrames(): {
  images: HTMLImageElement[];
  state: LoadState;
  progress: number;
} {
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [state, setState] = useState<LoadState>('loading');
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let cancelled = false;
    let loaded = 0;
    const buffer: HTMLImageElement[] = new Array(FRAME_COUNT);

    const promises = Array.from({ length: FRAME_COUNT }, (_, idx) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        img.onload = () => {
          buffer[idx] = img;
          loaded += 1;
          if (!cancelled) setProgress(loaded / FRAME_COUNT);
          resolve();
        };
        img.onerror = () => {
          loaded += 1;
          if (!cancelled) setProgress(loaded / FRAME_COUNT);
          resolve();
        };
        img.src = framePath(idx + 1);
      });
    });

    Promise.all(promises).then(() => {
      if (cancelled) return;
      const valid = buffer.filter(Boolean);
      setImages(valid);
      setState(valid.length === FRAME_COUNT ? 'ready' : 'error');
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return { images, state, progress };
}

type Props = {
  images: HTMLImageElement[];
  progress: number;
};

export function ScrollSequenceCanvas({ images, progress }: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetFrame = useRef(0);
  const currentFrame = useRef(0);

  useEffect(() => {
    if (images.length === 0) return;
    targetFrame.current = Math.min(
      images.length - 1,
      Math.max(0, Math.round(progress * (images.length - 1)))
    );
  }, [progress, images.length]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || images.length === 0) return;
    const ctx = canvas.getContext('2d', { alpha: false });
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const { innerWidth: w, innerHeight: h } = window;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      canvas.style.width = `${w}px`;
      canvas.style.height = `${h}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      draw(currentFrame.current);
    };

    const draw = (frameIndex: number) => {
      const img = images[Math.round(frameIndex)];
      if (!img) return;
      const cw = canvas.width / dpr;
      const ch = canvas.height / dpr;
      const iw = img.naturalWidth;
      const ih = img.naturalHeight;
      const scale = Math.max(cw / iw, ch / ih);
      const dw = iw * scale;
      const dh = ih * scale;
      const dx = (cw - dw) / 2;
      const dy = (ch - dh) / 2;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const tick = () => {
      const diff = targetFrame.current - currentFrame.current;
      if (Math.abs(diff) > 0.01) {
        currentFrame.current += diff * 0.18;
        draw(currentFrame.current);
      } else if (currentFrame.current !== targetFrame.current) {
        currentFrame.current = targetFrame.current;
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
  }, [images]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{ filter: 'contrast(1.08) saturate(1.08) brightness(0.82)' }}
      aria-hidden="true"
    />
  );
}
