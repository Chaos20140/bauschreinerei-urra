import { motion, useReducedMotion } from 'motion/react';
import type { ReactNode } from 'react';

/** Erlaubte Wrapper-Elemente. `li` ist nötig, damit BlurIn innerhalb einer
 *  <ul> kein ungültiges <div> zwischen Liste und Listenpunkt einzieht. */
const TAGS = {
  div: motion.div,
  li: motion.li,
  section: motion.section,
  article: motion.article,
} as const;

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  blur?: number;
  y?: number;
  duration?: number;
  amount?: number;
  as?: keyof typeof TAGS;
};

export function BlurIn({
  children,
  className,
  delay = 0,
  blur = 18,
  y = 28,
  duration = 0.9,
  amount = 0.2,
  as = 'div',
}: Props) {
  const reduceMotion = useReducedMotion();
  const Tag = TAGS[as];

  // Bewegungsreduzierung heißt: keine Bewegung — nicht "kein Inhalt".
  // Der Reveal-Effekt startet mit opacity: 0; bliebe der Startwert bei
  // abgeschalteter Animation stehen, wären ganze Abschnitte unsichtbar.
  if (reduceMotion) {
    return <Tag className={className}>{children}</Tag>;
  }

  return (
    <Tag
      className={className}
      initial={{ filter: `blur(${blur}px)`, opacity: 0, y }}
      whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
      viewport={{ once: true, amount }}
    >
      {children}
    </Tag>
  );
}
