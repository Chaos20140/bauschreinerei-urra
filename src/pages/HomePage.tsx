import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Products } from '../components/Products';
import { Features } from '../components/Features';
import { Reviews } from '../components/Reviews';
import { Regions } from '../components/Regions';
import { Faq } from '../components/Faq';
import { Contact } from '../components/Contact';
import { useDocumentMeta } from '../hooks/useDocumentMeta';
import { faq } from '../data/content';

// FAQ-Rich-Result: Google kann die Fragen direkt in der Suchergebnisseite
// ausklappen. Bewusst ohne AggregateRating — selbst ausgezeichnete
// Bewertungen auf der eigenen Seite verstoßen gegen Googles Richtlinien.
const faqJsonLd = JSON.stringify({
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: faq.items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
});

export function HomePage() {
  useDocumentMeta({
    title: 'Bauschreinerei Urra · Fenster und Türen aus Olsberg',
    description:
      'Fenster, Türen und Garagentore aus dem Sauerland. Inhabergeführtes Handwerk seit 2003 — Beratung, digitales Aufmaß und RAL-Fachmontage nach EnEV.',
  });

  return (
    <main id="main">
      <script type="application/ld+json">{faqJsonLd}</script>
      <Hero />
      <Services />
      <Products />
      <Features />
      <Reviews />
      <Regions />
      <Faq />
      <Contact />
    </main>
  );
}
