import { Link } from 'react-router-dom';
import { footer, brand, contact } from '../data/content';
import { useNavItems } from '../lib/nav';
import { Editable } from './editor/Editable';
import { Logo } from './Logo';

// Pflichtangaben — stehen unabhängig vom verwalteten Hauptmenü immer im Fuß.
const LEGAL = [
  { key: 'impressum', label: 'impressum', href: '/impressum' },
  { key: 'datenschutz', label: 'datenschutz', href: '/datenschutz' },
] as const;

export function Footer() {
  const navigation = useNavItems();

  return (
    <footer className="relative bg-black text-white border-t border-white/15">
      <div className="max-w-7xl mx-auto px-6 md:px-12 py-14 md:py-20">
        <div className="grid md:grid-cols-12 gap-10 md:gap-8 mb-12 md:mb-16">
          <div className="md:col-span-5 space-y-4 no-shadow">
            <Link to="/" className="flex items-center gap-3">
              <Logo className="h-7 w-7" />
              <span className="hero-title text-2xl md:text-3xl text-white">
                {brand.shortName}
              </span>
            </Link>
            <p className="text-white/65 text-sm md:text-base max-w-md leading-relaxed">
              <Editable id="footer.tagline">{footer.tagline}</Editable>
            </p>
          </div>

          <div className="md:col-span-3 md:col-start-7">
            <p className="text-white/45 text-xs tracking-[0.3em] uppercase mb-4">
              <Editable id="footer.nav.title">Navigation</Editable>
            </p>
            <ul className="space-y-2">
              {navigation.map((n) => (
                <li key={n.href}>
                  <Link
                    to={n.href}
                    className="text-white/80 hover:text-white text-sm md:text-base transition-colors"
                  >
                    {n.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-3">
            <p className="text-white/45 text-xs tracking-[0.3em] uppercase mb-4">
              <Editable id="footer.kontakt.title">Kontakt</Editable>
            </p>
            <ul className="space-y-2 text-sm md:text-base">
              <li className="text-white/80">
                {contact.address.street}
                <br />
                {contact.address.zip} {contact.address.city}
              </li>
              <li>
                <a
                  href={contact.phone.href}
                  className="text-white/80 hover:text-white transition-colors"
                >
                  {contact.phone.display}
                </a>
              </li>
              <li>
                <a
                  href={contact.email.href}
                  className="text-white/80 hover:text-white transition-colors break-all"
                >
                  {contact.email.display}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-t border-white/15 pt-6">
          <p className="text-white/45 text-xs tracking-widest uppercase">
            <Editable id="footer.copyright">{footer.copyright}</Editable>
          </p>
          <ul className="flex flex-wrap items-center gap-5 md:gap-6">
            {LEGAL.map((l) => (
              <li key={l.href}>
                <Link
                  to={l.href}
                  className="text-white/65 hover:text-white text-xs tracking-widest uppercase transition-colors"
                >
                  <Editable id={`footer.legal.${l.key}`}>{l.label}</Editable>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
