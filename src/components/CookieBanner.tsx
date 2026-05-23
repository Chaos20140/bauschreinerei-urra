import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'urra-cookie-consent';

type Consent = 'accepted' | 'essential';

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const persist = (value: Consent) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // localStorage blocked — silently ignore, banner closes anyway
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-label="cookie-hinweis"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 md:inset-x-6 md:bottom-6 z-[60]"
        >
          <div className="mx-auto max-w-5xl rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-white/15 shadow-2xl p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex-1 no-shadow">
              <p className="text-white text-sm md:text-[15px] font-medium tracking-tight mb-1">
                Wir respektieren Ihre Privatsphäre.
              </p>
              <p className="text-white/75 text-xs md:text-sm leading-relaxed">
                Diese Website verwendet ausschließlich technisch notwendige Daten und
                lädt Schriften von Google Fonts. Es werden keine Tracking- oder
                Marketing-Cookies gesetzt. Mehr in unserer{' '}
                <Link
                  to="/datenschutz"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 shrink-0 no-shadow">
              <button
                type="button"
                onClick={() => persist('essential')}
                className="px-5 py-3 rounded-full text-sm border border-white/25 text-white/85 hover:bg-white/10 transition-colors"
              >
                Nur notwendige
              </button>
              <button
                type="button"
                onClick={() => persist('accepted')}
                className="px-5 py-3 rounded-full text-sm bg-white text-black hover:bg-neutral-200 transition-colors font-medium"
              >
                Alle akzeptieren
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
