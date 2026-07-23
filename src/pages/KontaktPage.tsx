import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { MapEmbed } from '../components/MapEmbed';
import { ContactForm } from '../components/ContactForm';
import { contact, regions } from '../data/content';
import { useDocumentMeta } from '../hooks/useDocumentMeta';

const HOURS = [
  { day: 'Montag — Freitag', value: '08:00 — 17:00' },
  { day: 'Samstag', value: 'nach Vereinbarung' },
  { day: 'Sonntag', value: 'geschlossen' },
] as const;

export function KontaktPage() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`
  )}`;

  useDocumentMeta({
    title: 'Kontakt · Angebot anfragen | Bauschreinerei Urra Olsberg',
    description:
      'Bauschreinerei Urra, Am Ochsenberg 13 in 59939 Olsberg. Telefon, E-Mail, WhatsApp oder Anfrageformular — wir melden uns werktags binnen 24 Stunden.',
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero
        eyebrow="Kontakt"
        title="Lassen Sie uns über Ihr Projekt sprechen."
        intro="Rufen Sie an, schreiben Sie eine E-Mail oder hinterlassen Sie eine Nachricht — wir melden uns werktags innerhalb von 24 Stunden zurück."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 md:gap-10">
          <BlurIn className="md:col-span-7 space-y-6">
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-10">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-6">
                So erreichen Sie uns
              </p>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
                <div>
                  <p className="text-white/55 text-[10px] md:text-xs tracking-[0.25em] uppercase mb-2">
                    Werkstatt
                  </p>
                  <p className="text-white text-lg md:text-xl leading-snug">
                    {contact.address.street}
                    <br />
                    {contact.address.zip} {contact.address.city}
                  </p>
                  <a
                    href={mapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block mt-3 text-white/70 hover:text-white text-sm underline underline-offset-2 transition-colors"
                  >
                    Anfahrt planen →
                  </a>
                </div>

                <div>
                  <p className="text-white/55 text-[10px] md:text-xs tracking-[0.25em] uppercase mb-2">
                    Telefon
                  </p>
                  <a
                    href={contact.phone.href}
                    className="text-white text-lg md:text-xl hover:text-white/75 transition-colors no-shadow"
                  >
                    {contact.phone.display}
                  </a>
                </div>

                <div className="sm:col-span-2">
                  <p className="text-white/55 text-[10px] md:text-xs tracking-[0.25em] uppercase mb-2">
                    E-Mail
                  </p>
                  <a
                    href={contact.email.href}
                    className="text-white text-lg md:text-xl hover:text-white/75 transition-colors break-all no-shadow"
                  >
                    {contact.email.display}
                  </a>
                </div>
              </div>
            </div>

            <ContactForm />
          </BlurIn>

          <BlurIn className="md:col-span-5 md:col-start-8 space-y-6" delay={0.2}>
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-5">
                Öffnungszeiten
              </p>
              <ul className="space-y-3 text-sm md:text-base">
                {HOURS.map((h) => (
                  <li
                    key={h.day}
                    className="flex justify-between gap-4 border-t border-white/10 pt-3"
                  >
                    <span className="text-white/70">{h.day}</span>
                    <span className="text-white">{h.value}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-white/55 text-xs md:text-sm">
                Aufmaß-Termine erfolgen nach Vereinbarung — auch außerhalb der
                Öffnungszeiten.
              </p>
            </div>

            <a
              href={contact.phone.href}
              className="block rounded-2xl bg-white text-black p-7 md:p-9 hover:bg-neutral-200 transition-colors no-shadow"
            >
              <p className="text-black/55 text-xs tracking-[0.3em] uppercase mb-3">
                Direkt anrufen
              </p>
              <p className="hero-title text-3xl md:text-4xl font-medium tracking-tight">
                {contact.phone.display}
              </p>
              <p className="text-black/65 text-sm mt-2">
                {contact.cta} — Wir freuen uns auf Ihr Projekt.
              </p>
            </a>

            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-4">
                Servicegebiet
              </p>
              <p className="text-white/85 text-sm md:text-base leading-relaxed mb-3">
                Wir sind in drei Regionen unterwegs:
              </p>
              <ul className="space-y-1 text-white/80 text-sm">
                {regions.areas.map((a) => (
                  <li key={a.key}>
                    <span className="text-white">{a.key}</span>{' '}
                    <span className="text-white/50">— {a.cities.slice(0, 3).join(' · ')} …</span>
                  </li>
                ))}
              </ul>
            </div>
          </BlurIn>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-12 md:py-20 border-t border-white/10">
        <div className="max-w-7xl mx-auto">
          <BlurIn className="mb-8 md:mb-10 max-w-3xl">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Standort
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5vw] leading-[0.95]">
              So finden Sie uns.
            </h2>
            <p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed">
              Unsere Werkstatt in Olsberg liegt am Ochsenberg — gut erreichbar
              aus dem gesamten Sauerland.
            </p>
          </BlurIn>
          <BlurIn delay={0.15}>
            <MapEmbed />
          </BlurIn>
        </div>
      </section>
    </main>
  );
}
