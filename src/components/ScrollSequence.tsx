import { useEffect, useRef, useState } from 'react';

const BASE = import.meta.env.BASE_URL;

const framePath = (folder: string, i: number): string =>
  `${BASE}${folder}/frame-${String(i).padStart(3, '0')}.jpg`;

type LoadState = 'loading' | 'ready' | 'error';

export function useFrames(
  folder: string = 'frames',
  count: number = 140
): {
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
    const buffer: HTMLImageElement[] = new Array(count);

    const promises = Array.from({ length: count }, (_, idx) => {
      return new Promise<void>((resolve) => {
        const img = new Image();
        img.decoding = 'async';
        // Erstes Frame mit hoher Priorität laden, Rest im Hintergrund
        if (idx === 0) {
          (img as HTMLImageElement & { fetchPriority?: string }).fetchPriority =
            'high';
        }
        img.onload = () => {
          buffer[idx] = img;
          loaded += 1;
          if (!cancelled) {
            setProgress(loaded / count);
            // Frame 1 sofort verfügbar machen, damit Canvas nicht
            // schwarz bleibt während der Rest lädt.
            if (idx === 0) {
              setImages([img]);
              setState('ready');
            }
          }
          resolve();
        };
        img.onerror = () => {
          loaded += 1;
          if (!cancelled) setProgress(loaded / count);
          resolve();
        };
        img.src = framePath(folder, idx + 1);
      });
    });

    Promise.all(promises).then(() => {
      if (cancelled) return;
      const valid = buffer.filter(Boolean);
      setImages(valid);
      setState(valid.length === count ? 'ready' : 'error');
    });

    return () => {
      cancelled = true;
    };
  }, [folder, count]);

  return { images, state, progress };
}

type Props = {
  images: HTMLImageElement[];
  progress: number;
  maxDpr?: number;
  easing?: number;
  bgPositionY?: number;
};

export function ScrollSequenceCanvas({
  images,
  progress,
  maxDpr = 2,
  easing = 0.18,
  bgPositionY = 0.5,
}: Props) {
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

    const dpr = Math.min(window.devicePixelRatio || 1, maxDpr);

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
      const dy = (ch - dh) * bgPositionY;
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, cw, ch);
      ctx.drawImage(img, dx, dy, dw, dh);
    };

    const tick = () => {
      const diff = targetFrame.current - currentFrame.current;
      if (Math.abs(diff) > 0.01) {
        currentFrame.current += diff * easing;
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
  }, [images, maxDpr, easing, bgPositionY]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full z-0"
      style={{
        filter: 'contrast(1.08) saturate(1.08) brightness(0.82)',
        // GPU-Layer-Promotion: erzwingt Compositor-Layer und nimmt Last
        // vom Main-Thread beim Scrubbing, besonders auf Mobile.
        willChange: 'transform',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
      aria-hidden="true"
    />
  );
}
