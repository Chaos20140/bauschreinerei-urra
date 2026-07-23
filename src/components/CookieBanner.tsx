import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';

const STORAGE_KEY = 'urra-datenschutz-hinweis';

/**
 * Datenschutz-Hinweis — bewusst KEIN Consent-Banner.
 *
 * Vorher standen hier zwei Buttons („Nur notwendige" / „Alle akzeptieren"),
 * die dieselbe Funktion aufriefen: Die Entscheidung wurde nur gespeichert und
 * von keiner einzigen anderen Codestelle je ausgelesen. Eine Auswahl, die
 * folgenlos bleibt, ist eine Scheineinwilligung und nach EDSA-Leitlinien und
 * § 25 TDDDG selbst ein Verstoß.
 *
 * Da die Seite inzwischen keine einwilligungspflichtige Technologie mehr
 * automatisch lädt — Schriften liegen lokal, Google Maps hat eine eigene
 * Zwei-Klick-Lösung, Supabase ist für Darstellung und Anfragebearbeitung
 * erforderlich (Art. 6 Abs. 1 lit. b/f DSGVO) — braucht es keine Einwilligung.
 * Bleibt ein ehrlicher Hinweis mit einem Bestätigungs-Button.
 */
export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const confirmRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    try {
      if (!window.localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) confirmRef.current?.focus();
  }, [visible]);

  const dismiss = () => {
    try {
      window.localStorage.setItem(STORAGE_KEY, 'gesehen');
    } catch {
      // localStorage blockiert — Hinweis schließt trotzdem.
    }
    setVisible(false);
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-labelledby="datenschutz-hinweis-titel"
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-x-3 bottom-3 md:inset-x-6 md:bottom-6 z-[60]"
          onKeyDown={(e) => {
            if (e.key === 'Escape') dismiss();
          }}
        >
          <div className="mx-auto max-w-5xl rounded-2xl bg-neutral-950/95 backdrop-blur-md border border-white/15 shadow-2xl p-5 md:p-7 flex flex-col md:flex-row md:items-center gap-5 md:gap-8">
            <div className="flex-1 no-shadow">
              <p
                id="datenschutz-hinweis-titel"
                className="text-white text-sm md:text-[15px] font-medium tracking-tight mb-1"
              >
                Hinweis zum Datenschutz
              </p>
              <p className="text-white/75 text-xs md:text-sm leading-relaxed">
                Diese Website setzt keine Tracking- oder Marketing-Cookies.
                Schriften werden lokal ausgeliefert, die Standort-Karte lädt
                erst auf Ihren Klick. Für Bewertungen und Anfragen nutzen wir
                unsere Datenbank bei Supabase. Alle Details in unserer{' '}
                <Link
                  to="/datenschutz"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                >
                  Datenschutzerklärung
                </Link>
                .
              </p>
            </div>
            <div className="shrink-0 no-shadow">
              <button
                ref={confirmRef}
                type="button"
                onClick={dismiss}
                className="w-full sm:w-auto px-6 py-3 rounded-full text-sm bg-white text-black hover:bg-neutral-200 transition-colors font-medium focus-ring"
              >
                Verstanden
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
