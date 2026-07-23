import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { brand, contact, whatsapp } from '../data/content';
import { useNavItems } from '../lib/nav';
import { Logo } from './Logo';

export function Navbar() {
  // Beschriftung, Reihenfolge und Sichtbarkeit kommen aus „Seiten & Menü".
  const navigation = useNavItems();
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const toggleRef = useRef<HTMLButtonElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  // Tastaturbedienung des Overlays: Escape schließt und gibt den Fokus an den
  // Toggle-Button zurück, Tab bleibt innerhalb des Menüs gefangen. Ohne das
  // tabbt man aus dem offenen Menü heraus in den verdeckten Seiteninhalt.
  useEffect(() => {
    if (!open) return;

    const focusables = () =>
      Array.from(
        overlayRef.current?.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled])'
        ) ?? []
      ).filter((el) => el.offsetParent !== null);

    focusables()[0]?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab') return;

      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (e.shiftKey && (active === first || !overlayRef.current?.contains(active))) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open]);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-40 px-4 md:px-10 pt-4 md:pt-6">
        <div className="flex items-center justify-between gap-3">
          <Link
            to="/"
            className="flex items-center gap-2 bg-neutral-900/90 backdrop-blur rounded-full pl-3 pr-5 py-2.5 no-shadow"
            aria-label="Zur Startseite"
          >
            <Logo className="h-6 w-6" />
            <span className="text-white text-sm font-medium tracking-tight">
              {brand.name}
            </span>
          </Link>

          <ul className="hidden md:flex items-center gap-1 bg-neutral-900/90 backdrop-blur rounded-full px-3 py-2 no-shadow">
            {navigation.map((item) => (
              <li key={item.href}>
                <NavLink
                  to={item.href}
                  className={({ isActive }) =>
                    `text-sm px-5 py-2 rounded-full block transition-colors ${
                      isActive
                        ? 'text-white bg-white/10'
                        : 'text-neutral-300 hover:text-white'
                    }`
                  }
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-2 no-shadow">
            <Link
              to={contact.appointmentHref}
              className="hidden sm:inline-block bg-white text-black text-sm font-normal rounded-full px-5 md:px-6 py-3 hover:bg-neutral-200 transition-colors"
            >
              {contact.cta}
            </Link>
            <button
              ref={toggleRef}
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={open}
              aria-controls="mobile-menu"
              className="md:hidden h-12 w-12 grid place-items-center rounded-full bg-neutral-900/90 backdrop-blur text-white focus-ring"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            ref={overlayRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Hauptmenü"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-30 md:hidden bg-black/95 backdrop-blur-xl flex flex-col pt-28 px-6 pb-10 no-shadow"
          >
            <motion.ul
              initial="hidden"
              animate="visible"
              variants={{
                visible: { transition: { staggerChildren: 0.05 } },
              }}
              className="flex flex-col gap-2"
            >
              {navigation.map((item) => (
                <motion.li
                  key={item.href}
                  variants={{
                    hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
                    visible: { opacity: 1, y: 0, filter: 'blur(0px)' },
                  }}
                  transition={{ duration: 0.4 }}
                >
                  <NavLink
                    to={item.href}
                    className={({ isActive }) =>
                      `block text-3xl font-medium tracking-tight py-3 border-b border-white/10 hero-title ${
                        isActive ? 'text-white' : 'text-white/70'
                      }`
                    }
                  >
                    {item.label}
                  </NavLink>
                </motion.li>
              ))}
            </motion.ul>

            <div className="mt-auto pt-10 space-y-3">
              <Link
                to={contact.appointmentHref}
                className="block w-full text-center bg-white text-black rounded-full py-4 text-base font-medium hover:bg-neutral-200 transition-colors"
              >
                {contact.cta}
              </Link>
              <a
                href={whatsapp.href}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center rounded-full py-4 text-base font-medium bg-[#25D366] text-white hover:bg-[#1ebe5b] transition-colors"
              >
                {whatsapp.label}
              </a>
              <div className="text-white/60 text-xs space-y-1 text-center pt-2">
                <p>{contact.phone.display}</p>
                <p>{contact.email.display}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
