import { Link } from 'react-router-dom';
import { contact } from '../data/content';
import { BlurIn } from './BlurIn';

type Props = {
  title?: string;
  body?: string;
};

export function CtaBlock({
  title = 'lassen sie uns sprechen.',
  body = 'unverbindlich, kostenlos und werktags innerhalb von 24 stunden zurück.',
}: Props) {
  return (
    <section className="relative px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        <BlurIn>
          <h2 className="hero-title text-white font-medium text-[12vw] md:text-[6vw] leading-[0.92] mb-6 md:mb-8">
            {title}
          </h2>
        </BlurIn>
        <BlurIn delay={0.15} className="max-w-2xl mx-auto">
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-10">
            {body}
          </p>
        </BlurIn>
        <BlurIn delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center no-shadow">
            <a
              href={contact.phone.href}
              className="px-6 md:px-8 py-4 rounded-full bg-white text-black text-sm md:text-base font-medium hover:bg-neutral-200 transition-colors"
            >
              {contact.cta}
            </a>
            <Link
              to="/kontakt"
              className="px-6 md:px-8 py-4 rounded-full border border-white/30 text-white text-sm md:text-base font-medium hover:bg-white/10 transition-colors"
            >
              zum kontaktformular
            </Link>
          </div>
        </BlurIn>
      </div>
    </section>
  );
}
