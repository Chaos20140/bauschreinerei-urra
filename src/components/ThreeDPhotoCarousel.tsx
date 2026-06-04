import { memo, useEffect, useRef, useState } from 'react';
import {
  AnimatePresence,
  animate,
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export type CarouselSlide = {
  src: string;
  alt: string;
  caption?: string;
  meta?: string;
};

type Props = {
  slides: CarouselSlide[];
  /** Höhe des Karussell-Bühnenbereichs in px. */
  height?: number;
  /**
   * Optionaler Click-Handler. Wenn gesetzt, ersetzt er das Overlay-
   * Verhalten — z. B. für Navigation zur Detail-Seite.
   */
  onSlideClick?: (slide: CarouselSlide) => void;
};

const transition = {
  duration: 0.15,
  ease: [0.32, 0.72, 0, 1] as const,
};

const overlayTransition = {
  duration: 0.5,
  ease: [0.32, 0.72, 0, 1] as const,
};

// Spring-Konfiguration für das Snap-Verhalten nach jedem Drag.
// Etwas weicher als der vorherige Decay, ohne zu lange nachzuschwingen.
const snapSpring = {
  type: 'spring' as const,
  stiffness: 110,
  damping: 24,
  mass: 0.55,
};

function useMobile() {
  const [mobile, setMobile] = useState(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia('(max-width: 640px)').matches;
  });
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 640px)');
    const handler = (e: MediaQueryListEvent) => setMobile(e.matches);
    setMobile(mq.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);
  return mobile;
}

type CylinderProps = {
  slides: CarouselSlide[];
  isActive: boolean;
  rotation: MotionValue<number>;
  faceAngle: number;
  onPick: (slide: CarouselSlide) => void;
  onSnap: (velocityX: number) => void;
};

const Cylinder = memo(function Cylinder({
  slides,
  isActive,
  rotation,
  faceAngle,
  onPick,
  onSnap,
}: CylinderProps) {
  const isMobile = useMobile();
  const cylinderWidth = isMobile ? 1100 : 1800;
  const faceCount = slides.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const transform = useTransform(
    rotation,
    (v) => `rotate3d(0, 1, 0, ${v}deg)`
  );

  return (
    <div
      className="flex h-full items-center justify-center"
      style={{
        perspective: '1000px',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      <motion.div
        drag={isActive ? 'x' : false}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing select-none"
        style={{
          transform,
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: 'preserve-3d',
        }}
        onDrag={(_, info) => {
          if (!isActive) return;
          rotation.set(rotation.get() + info.offset.x * 0.05);
        }}
        onDragEnd={(_, info) => {
          if (!isActive) return;
          onSnap(info.velocity.x);
        }}
      >
        {slides.map((slide, i) => (
          <motion.div
            key={`slide-${i}-${slide.src}`}
            className="absolute flex h-full origin-center items-center justify-center p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${i * faceAngle}deg) translateZ(${radius}px)`,
            }}
            onClick={() => onPick(slide)}
          >
            <motion.img
              src={slide.src}
              alt={slide.alt}
              draggable={false}
              loading="lazy"
              decoding="async"
              layoutId={`carousel-${slide.src}`}
              className="pointer-events-none w-full rounded-2xl object-cover aspect-square border border-white/15 shadow-[0_10px_40px_rgba(0,0,0,0.4)]"
              initial={{ filter: 'blur(4px)' }}
              animate={{ filter: 'blur(0px)' }}
              transition={transition}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
});

export function ThreeDPhotoCarousel({
  slides,
  height = 520,
  onSlideClick,
}: Props) {
  const [active, setActive] = useState<CarouselSlide | null>(null);
  const isCarouselActive = active === null;

  const faceAngle = 360 / slides.length;
  const rotation = useMotionValue(0);
  const animRef = useRef<ReturnType<typeof animate> | null>(null);

  // Cancel laufende Snap-Animation bei Unmount.
  useEffect(() => {
    return () => animRef.current?.stop();
  }, []);

  const snapTo = (targetRotation: number) => {
    animRef.current?.stop();
    animRef.current = animate(rotation, targetRotation, snapSpring);
  };

  const snapToNearest = (velocityX: number) => {
    // Velocity wird ins Wischen umgerechnet — schneller Wisch =
    // mehrere Faces weiter. Vorzeichen bestimmt Richtung.
    const projected = rotation.get() + velocityX * 0.045;
    const targetIndex = Math.round(projected / faceAngle);
    snapTo(targetIndex * faceAngle);
  };

  const step = (direction: 1 | -1) => {
    const current = Math.round(rotation.get() / faceAngle);
    snapTo((current + direction) * faceAngle);
  };

  const handleClose = () => setActive(null);
  const handlePick = (slide: CarouselSlide) => {
    if (onSlideClick) {
      onSlideClick(slide);
      return;
    }
    setActive(slide);
  };

  return (
    <motion.div layout className="relative">
      <AnimatePresence mode="sync">
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            layoutId={`carousel-container-${active.src}`}
            onClick={handleClose}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-black/85 backdrop-blur-md p-6 md:p-12"
            style={{ willChange: 'opacity' }}
            transition={overlayTransition}
          >
            <motion.img
              layoutId={`carousel-${active.src}`}
              src={active.src}
              alt={active.alt}
              className="max-w-[92vw] max-h-[88vh] rounded-2xl shadow-2xl object-contain"
              initial={{ scale: 0.85 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 0.15,
                duration: 0.5,
                ease: [0.25, 0.1, 0.25, 1] as const,
              }}
              style={{ willChange: 'transform' }}
            />
            {(active.caption || active.meta) && (
              <div
                className="absolute bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 text-center max-w-2xl px-6 no-shadow"
                onClick={(e) => e.stopPropagation()}
              >
                {active.meta && (
                  <p className="text-white/60 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2">
                    {active.meta}
                  </p>
                )}
                {active.caption && (
                  <p className="text-white text-base md:text-lg font-medium">
                    {active.caption}
                  </p>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className="relative w-full overflow-hidden"
        style={{ height }}
        onWheel={(e) => {
          // Maus-Wheel auf Desktop → ein Step pro Notch.
          // Wir verbrauchen das Event nicht (e.preventDefault) — die
          // Page-Scroll-Position bleibt erhalten, Wheel wirkt nur
          // zusätzlich auf das Karussell.
          if (!isCarouselActive) return;
          if (Math.abs(e.deltaY) < 8) return;
          step(e.deltaY > 0 ? 1 : -1);
        }}
      >
        <Cylinder
          slides={slides}
          isActive={isCarouselActive}
          rotation={rotation}
          faceAngle={faceAngle}
          onPick={handlePick}
          onSnap={snapToNearest}
        />

        {/* Prev / Next Buttons — Desktop klickbar, Mobile per Drag */}
        <div className="hidden md:flex absolute inset-y-0 left-3 items-center pointer-events-none z-10">
          <button
            type="button"
            aria-label="Vorheriges Projekt"
            onClick={() => step(-1)}
            className="pointer-events-auto h-11 w-11 grid place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur text-white/85 hover:text-white hover:bg-black/60 hover:border-white/40 transition no-shadow"
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
        <div className="hidden md:flex absolute inset-y-0 right-3 items-center pointer-events-none z-10">
          <button
            type="button"
            aria-label="Nächstes Projekt"
            onClick={() => step(1)}
            className="pointer-events-auto h-11 w-11 grid place-items-center rounded-full border border-white/20 bg-black/40 backdrop-blur text-white/85 hover:text-white hover:bg-black/60 hover:border-white/40 transition no-shadow"
          >
            <ChevronRight className="h-5 w-5" strokeWidth={2} />
          </button>
        </div>
      </div>
    </motion.div>
  );
}
