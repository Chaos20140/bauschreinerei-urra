import { memo, useEffect, useState } from 'react';
import {
  AnimatePresence,
  motion,
  useAnimation,
  useMotionValue,
  useTransform,
} from 'motion/react';

type Controls = ReturnType<typeof useAnimation>;

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
  controls: Controls;
  onPick: (slide: CarouselSlide) => void;
};

const Cylinder = memo(function Cylinder({
  slides,
  isActive,
  controls,
  onPick,
}: CylinderProps) {
  const isMobile = useMobile();
  const cylinderWidth = isMobile ? 1100 : 1800;
  const faceCount = slides.length;
  const faceWidth = cylinderWidth / faceCount;
  const radius = cylinderWidth / (2 * Math.PI);
  const rotation = useMotionValue(0);
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
        animate={controls}
        className="relative flex h-full origin-center cursor-grab justify-center active:cursor-grabbing select-none"
        style={{
          transform,
          rotateY: rotation,
          width: cylinderWidth,
          transformStyle: 'preserve-3d',
        }}
        onDrag={(_, info) =>
          isActive && rotation.set(rotation.get() + info.offset.x * 0.05)
        }
        onDragEnd={(_, info) =>
          isActive &&
          controls.start({
            rotateY: rotation.get() + info.velocity.x * 0.05,
            transition: {
              type: 'spring',
              stiffness: 90,
              damping: 28,
              mass: 0.1,
            },
          })
        }
      >
        {slides.map((slide, i) => (
          <motion.div
            key={`slide-${i}-${slide.src}`}
            className="absolute flex h-full origin-center items-center justify-center p-2"
            style={{
              width: `${faceWidth}px`,
              transform: `rotateY(${
                i * (360 / faceCount)
              }deg) translateZ(${radius}px)`,
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
  const controls = useAnimation();

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
      >
        <Cylinder
          slides={slides}
          isActive={isCarouselActive}
          controls={controls}
          onPick={handlePick}
        />
      </div>
    </motion.div>
  );
}
