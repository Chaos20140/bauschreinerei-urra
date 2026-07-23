import { Link } from 'react-router-dom';
import { contact } from '../data/content';
import { BlurIn } from './BlurIn';
import { Editable } from './editor/Editable';
import { CONTACT_IDS, useContactInfo } from '../lib/siteData';

export function Contact() {
  // Bewusst dieselben IDs wie auf der Kontaktseite: die Nummer steht einmal im
  // System, nicht zweimal mit der Chance, auseinanderzulaufen.
  const info = useContactInfo();

  return (
    <section id="kontakt" className="relative text-white py-32 md:py-40">
      <div className="max-w-7xl mx-auto px-6 md:px-10">
        <BlurIn className="grid md:grid-cols-12 gap-8 mb-16 md:mb-24">
          <div className="md:col-span-8">
            <p className="text-xs md:text-sm text-white/60 tracking-widest uppercase mb-4">
              <Editable id="home.contact.eyebrow">{contact.eyebrow}</Editable>
            </p>
            <h2 className="hero-title text-white font-medium text-[12vw] md:text-[8vw]">
              <Editable id="home.contact.lead">{contact.lead}</Editable>
            </h2>
          </div>
        </BlurIn>

        <div className="grid md:grid-cols-12 gap-10">
          <BlurIn className="md:col-span-6 space-y-8">
            <div>
              <p className="text-white/60 text-xs tracking-widest uppercase mb-2">
                <Editable id="home.contact.address.label">werkstatt</Editable>
              </p>
              <p className="text-white text-xl md:text-2xl">
                <Editable id={CONTACT_IDS.street}>{info.street}</Editable>
                <br />
                <Editable id={CONTACT_IDS.city}>{info.city}</Editable>
              </p>
            </div>

            <div>
              <p className="text-white/60 text-xs tracking-widest uppercase mb-2">
                <Editable id="home.contact.phone.label">telefon</Editable>
              </p>
              <a
                href={info.phoneHref}
                className="text-white text-xl md:text-2xl hover:text-white/70 transition-colors"
              >
                <Editable id={CONTACT_IDS.phone}>{info.phone}</Editable>
              </a>
            </div>

            <div>
              <p className="text-white/60 text-xs tracking-widest uppercase mb-2">
                <Editable id="home.contact.email.label">e-mail</Editable>
              </p>
              <a
                href={info.emailHref}
                className="text-white text-xl md:text-2xl hover:text-white/70 transition-colors break-all"
              >
                <Editable id={CONTACT_IDS.email}>{info.email}</Editable>
              </a>
            </div>
          </BlurIn>

          <BlurIn className="md:col-span-5 md:col-start-8 flex flex-col justify-between gap-10" delay={0.15}>
            <p className="text-white/80 text-base md:text-lg leading-relaxed">
              <Editable id="home.contact.desc">
                Schreiben Sie uns oder rufen Sie direkt an. Wir melden uns
                werktags innerhalb von 24 Stunden zurück und vereinbaren einen
                unverbindlichen Aufmaß-Termin bei Ihnen vor Ort.
              </Editable>
            </p>
            <Link
              to={contact.appointmentHref}
              className="inline-flex items-center justify-between gap-6 bg-white text-black rounded-full pl-8 pr-2 py-2 hover:bg-neutral-200 transition-colors w-full md:w-auto"
            >
              <span className="text-base md:text-lg">
                <Editable id={CONTACT_IDS.cta}>{contact.cta}</Editable>
              </span>
              <span className="bg-black text-white rounded-full px-5 py-3 text-sm">
                →
              </span>
            </Link>
          </BlurIn>
        </div>
      </div>
    </section>
  );
}
