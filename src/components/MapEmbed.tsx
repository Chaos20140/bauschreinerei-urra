import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MapPin, ExternalLink } from 'lucide-react';
import { contact } from '../data/content';

// Two-Click-Solution nach DSGVO-Best-Practice: bis der Nutzer aktiv
// auf „Karte aktivieren" klickt, wird KEINE Verbindung zu Google
// hergestellt — keine IP-Übertragung, keine Cookies, kein Tracking.
// Erst nach explizitem Consent lädt das iframe.
const FULL_ADDRESS = `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`;
const EMBED_URL =
  'https://maps.google.com/maps?q=' +
  encodeURIComponent(FULL_ADDRESS) +
  '&t=&z=15&ie=UTF8&iwloc=&output=embed';
const DIRECTIONS_URL =
  'https://www.google.com/maps/dir/?api=1&destination=' +
  encodeURIComponent(FULL_ADDRESS);

export function MapEmbed() {
  const [activated, setActivated] = useState(false);

  return (
    <div className="relative w-full aspect-[4/3] md:aspect-[16/10] rounded-2xl overflow-hidden border border-white/15 bg-neutral-900">
      <AnimatePresence mode="wait">
        {!activated ? (
          <motion.button
            key="placeholder"
            type="button"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={() => setActivated(true)}
            aria-label="Karte aktivieren und Google Maps laden"
            className="absolute inset-0 w-full h-full no-shadow flex flex-col items-center justify-center text-center px-6 py-10 group"
            style={{
              backgroundImage:
                'linear-gradient(135deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))',
            }}
          >
            <div
              className="absolute inset-0 opacity-30"
              aria-hidden="true"
              style={{
                background:
                  'radial-gradient(circle at 50% 40%, rgba(255,255,255,0.08), transparent 60%)',
              }}
            />
            <div className="relative">
              <span className="inline-flex h-14 w-14 md:h-16 md:w-16 grid place-items-center rounded-full bg-white/10 border border-white/15 mb-5 group-hover:bg-white/15 transition-colors">
                <MapPin className="h-6 w-6 md:h-7 md:w-7 text-white" strokeWidth={1.75} />
              </span>
              <p className="text-white/55 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-2">
                So findest du uns
              </p>
              <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-3">
                Karte anzeigen
              </h3>
              <p className="text-white/70 text-sm md:text-[15px] max-w-md leading-relaxed mb-6">
                Beim Aktivieren wird eine Verbindung zu Google Maps hergestellt.
                Dabei werden Daten (u. a. Ihre IP-Adresse) an Google übertragen.
                Details in unserer{' '}
                <a
                  href="/datenschutz"
                  className="underline underline-offset-2 hover:text-white transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  Datenschutzerklärung
                </a>
                .
              </p>
              <span className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-white text-black text-sm font-medium group-hover:bg-neutral-200 transition-colors">
                Karte aktivieren
              </span>
            </div>
          </motion.button>
        ) : (
          <motion.div
            key="iframe-wrap"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0"
          >
            <iframe
              title="Standort Bauschreinerei Heribert Urra, Olsberg"
              src={EMBED_URL}
              className="absolute inset-0 w-full h-full"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allow="fullscreen"
            />
            <a
              href={DIRECTIONS_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="absolute top-3 right-3 inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-black/80 text-white text-xs hover:bg-black transition-colors no-shadow"
            >
              <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
              Route planen
            </a>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
