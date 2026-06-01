import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus } from 'lucide-react';
import { faq } from '../data/content';
import { BlurIn } from './BlurIn';

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="relative text-white py-24 md:py-40 px-6 md:px-12">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-12 gap-8 md:gap-16 mb-12 md:mb-20">
          <BlurIn className="md:col-span-5">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              {faq.eyebrow}
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[6vw] leading-[0.92]">
              {faq.title}
            </h2>
          </BlurIn>
          <BlurIn className="md:col-span-6 md:col-start-7 self-end" delay={0.15}>
            <p className="text-white/85 text-base md:text-lg leading-relaxed">
              {faq.subtitle}
            </p>
          </BlurIn>
        </div>

        <ul className="border-t border-white/15">
          {faq.items.map((item, idx) => {
            const isOpen = openIndex === idx;
            return (
              <BlurIn key={item.q} delay={idx * 0.04}>
                <li className="border-b border-white/15">
                  <button
                    type="button"
                    onClick={() => setOpenIndex(isOpen ? null : idx)}
                    aria-expanded={isOpen}
                    className="w-full flex items-start justify-between gap-6 py-6 md:py-8 text-left group no-shadow"
                  >
                    <span className="hero-title text-white text-lg md:text-2xl lg:text-3xl font-medium tracking-tight pr-4">
                      {item.q}
                    </span>
                    <span
                      className={`shrink-0 h-10 w-10 md:h-12 md:w-12 grid place-items-center rounded-full border border-white/25 transition-all duration-300 ${
                        isOpen
                          ? 'bg-white text-black rotate-[135deg]'
                          : 'bg-transparent text-white group-hover:bg-white/10'
                      }`}
                    >
                      <Plus className="h-4 w-4 md:h-5 md:w-5" />
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        key="content"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="text-white/80 text-base md:text-lg leading-relaxed pb-6 md:pb-8 pr-16 md:pr-20 max-w-3xl">
                          {item.a}
                        </p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              </BlurIn>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
