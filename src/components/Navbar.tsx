import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { navigation, brand, contact } from '../data/content';
import { Logo } from './Logo';

export function Navbar() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

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
            <a
              href={contact.phone.href}
              className="hidden sm:inline-block bg-white text-black text-sm font-normal rounded-full px-5 md:px-6 py-3 hover:bg-neutral-200 transition-colors"
            >
              {contact.cta}
            </a>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
              aria-expanded={open}
              className="md:hidden h-12 w-12 grid place-items-center rounded-full bg-neutral-900/90 backdrop-blur text-white"
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
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

            <div className="mt-auto pt-10 space-y-4">
              <a
                href={contact.phone.href}
                className="block w-full text-center bg-white text-black rounded-full py-4 text-base font-medium hover:bg-neutral-200 transition-colors"
              >
                {contact.cta}
              </a>
              <div className="text-white/60 text-xs space-y-1 text-center">
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
