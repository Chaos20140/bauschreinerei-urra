import { Link } from 'react-router-dom';
import { contact } from '../data/content';
import { BlurIn } from './BlurIn';
import { Editable } from './editor/Editable';
import { CONTACT_IDS, useContactInfo } from '../lib/siteData';

type Props = {
  title?: string;
  body?: string;
  /** Präfix für die Editable-IDs; gesetzt → Titel und Text sind editierbar. */
  idPrefix?: string;
};

export function CtaBlock({
  title = 'Lassen Sie uns sprechen.',
  body = 'Unverbindlich, kostenlos und werktags innerhalb von 24 Stunden zurück.',
  idPrefix,
}: Props) {
  const info = useContactInfo();

  return (
    <section className="relative px-6 md:px-12 py-24 md:py-32">
      <div className="max-w-5xl mx-auto text-center">
        <BlurIn>
          <h2 className="hero-title text-white font-medium text-[12vw] md:text-[min(6vw,115.2px)] leading-[0.92] mb-6 md:mb-8">
            {idPrefix ? <Editable id={`${idPrefix}.cta.title`} rich>{title}</Editable> : title}
          </h2>
        </BlurIn>
        <BlurIn delay={0.15} className="max-w-2xl mx-auto">
          <p className="text-white/85 text-base md:text-lg leading-relaxed mb-10">
            {idPrefix ? <Editable id={`${idPrefix}.cta.body`}>{body}</Editable> : body}
          </p>
        </BlurIn>
        <BlurIn delay={0.3}>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center no-shadow">
            <Link
              to={contact.appointmentHref}
              className="px-6 md:px-8 py-4 rounded-full bg-white text-black text-sm md:text-base font-medium hover:bg-neutral-200 transition-colors"
            >
              <Editable id={CONTACT_IDS.cta}>{contact.cta}</Editable>
            </Link>
            <a
              href={info.phoneHref}
              className="px-6 md:px-8 py-4 rounded-full border border-white/30 text-white text-sm md:text-base font-medium hover:bg-white/10 transition-colors"
            >
              <Editable id={CONTACT_IDS.callCta}>{contact.callCta}</Editable>
            </a>
          </div>
        </BlurIn>
      </div>
    </section>
  );
}
