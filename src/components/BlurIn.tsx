import { motion } from 'motion/react';
import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  className?: string;
  delay?: number;
  blur?: number;
  y?: number;
  duration?: number;
  amount?: number;
};

export function BlurIn({
  children,
  className,
  delay = 0,
  blur = 18,
  y = 28,
  duration = 0.9,
  amount = 0.2,
}: Props) {
  return (
    <motion.div
      className={className}
      initial={{ filter: `blur(${blur}px)`, opacity: 0, y }}
      whileInView={{ filter: 'blur(0px)', opacity: 1, y: 0 }}
      transition={{ duration, ease: [0.22, 1, 0.36, 1], delay }}
      viewport={{ once: true, amount }}
    >
      {children}
    </motion.div>
  );
}
