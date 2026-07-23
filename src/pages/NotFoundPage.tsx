import { Link } from 'react-router-dom';
import { PageHero } from '../components/PageHero';
import { BlurIn } from '../components/BlurIn';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { useNavItems } from '../lib/nav';
import { Editable } from '../components/editor/Editable';

/**
 * Ersetzt die frühere Catch-all-Route, die stillschweigend die Startseite
 * gerendert hat. Das erzeugte unter jeder beliebigen URL eine Kopie der
 * Startseite (Soft-404 / Duplicate Content) und ließ Besucher im Unklaren.
 */
export function NotFoundPage() {
  const navigation = useNavItems();

  useDocumentMeta({
    title: 'Seite nicht gefunden · Bauschreinerei Urra',
    description:
      'Die aufgerufene Seite existiert nicht. Hier geht es zurück zur Startseite der Bauschreinerei Urra aus Olsberg.',
    noindex: true,
  });

  return (
    <main id="main" data-theme="beige" className="relative min-h-screen text-white pb-12">
      <PageHero
        idPrefix="fehler404"
        eyebrow="Fehler 404"
        title="Diese Seite gibt es nicht."
        intro="Vielleicht wurde sie verschoben oder der Link enthält einen Tippfehler. Über die folgenden Bereiche finden Sie sicher weiter."
      />

      <section className="relative px-6 md:px-12 pb-20">
        <BlurIn className="max-w-7xl mx-auto">
          <ul className="flex flex-wrap gap-3">
            <li>
              <Link
                to="/"
                className="inline-flex items-center rounded-full bg-white text-black px-6 py-3 text-sm font-medium hover:bg-neutral-200 transition-colors no-shadow"
              >
                <Editable id="fehler404.home">Zur Startseite</Editable>
              </Link>
            </li>
            {navigation.map((item) => (
              <li key={item.href}>
                <Link
                  to={item.href}
                  className="inline-flex items-center rounded-full border border-white/25 px-6 py-3 text-sm hover:bg-white/10 transition-colors no-shadow"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </BlurIn>
      </section>
    </main>
  );
}
