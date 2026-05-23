import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { contact, regions } from '../data/content';

const HOURS = [
  { day: 'montag — freitag', value: '08:00 — 17:00' },
  { day: 'samstag', value: 'nach vereinbarung' },
  { day: 'sonntag', value: 'geschlossen' },
] as const;

export function KontaktPage() {
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${contact.address.street}, ${contact.address.zip} ${contact.address.city}`
  )}`;

  return (
    <main className="relative bg-neutral-950 min-h-screen text-white pb-12">
      <PageHero
        eyebrow="kontakt"
        title="lassen sie uns über ihr projekt sprechen."
        intro="rufen sie an, schreiben sie eine e-mail oder hinterlassen sie eine nachricht — wir melden uns werktags innerhalb von 24 stunden zurück."
      />

      <section className="relative px-6 md:px-12 py-12 md:py-20">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 md:gap-10">
          <BlurIn className="md:col-span-7 space-y-6">
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-10">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-6">
                so erreichen sie uns
              </p>

              <div className="grid sm:grid-cols-2 gap-x-6 gap-y-8">
                <div>
                  <p className="text-white/55 text-[10px] md:text-xs tracking-[0.25em] uppercase mb-2">
                    werkstatt
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
                    anfahrt planen →
                  </a>
                </div>

                <div>
                  <p className="text-white/55 text-[10px] md:text-xs tracking-[0.25em] uppercase mb-2">
                    telefon
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
                    e-mail
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

            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-10">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-6">
                anfrage in stichpunkten
              </p>
              <ul className="space-y-3 text-white/85 text-sm md:text-base">
                {[
                  'objekt & adresse',
                  'gewünschte elemente (fenster, haustüren, …)',
                  'material-präferenz, falls vorhanden',
                  'wunsch-zeitfenster für aufmaß & montage',
                  'beste rückruf-zeit',
                ].map((item) => (
                  <li
                    key={item}
                    className="border-t border-white/10 pt-3 flex items-start gap-3"
                  >
                    <span className="text-white/40 mt-1">—</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-white/65 text-xs md:text-sm leading-relaxed">
                je präziser ihre angaben, desto schneller können wir ein
                belastbares angebot vorbereiten.
              </p>
            </div>
          </BlurIn>

          <BlurIn className="md:col-span-5 md:col-start-8 space-y-6" delay={0.2}>
            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-5">
                öffnungszeiten
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
                aufmaß-termine erfolgen nach vereinbarung — auch außerhalb der
                öffnungszeiten.
              </p>
            </div>

            <a
              href={contact.phone.href}
              className="block rounded-2xl bg-white text-black p-7 md:p-9 hover:bg-neutral-200 transition-colors no-shadow"
            >
              <p className="text-black/55 text-xs tracking-[0.3em] uppercase mb-3">
                direkt anrufen
              </p>
              <p className="hero-title text-3xl md:text-4xl font-medium tracking-tight">
                {contact.phone.display}
              </p>
              <p className="text-black/65 text-sm mt-2">
                {contact.cta} — wir freuen uns auf ihr projekt.
              </p>
            </a>

            <div className="rounded-2xl border border-white/15 bg-white/[0.03] p-7 md:p-9">
              <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-4">
                servicegebiet
              </p>
              <p className="text-white/85 text-sm md:text-base leading-relaxed mb-3">
                wir sind in drei regionen unterwegs:
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
    </main>
  );
}
