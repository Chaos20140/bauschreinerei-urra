import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MotionConfig } from 'motion/react';

import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { GlobalBackground } from './components/GlobalBackground';
import { WhatsAppButton } from './components/WhatsAppButton';
import { HomePage } from './pages/HomePage';

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');

// Die Startseite bleibt im Haupt-Bundle — sie ist der Einstieg für praktisch
// allen Traffic und soll nicht auf einen zweiten Netzwerk-Roundtrip warten.
// Alle übrigen Seiten werden erst beim Aufruf nachgeladen.
const LeistungenPage = lazy(() =>
  import('./pages/LeistungenPage').then((m) => ({ default: m.LeistungenPage }))
);
const ProjektePage = lazy(() =>
  import('./pages/ProjektePage').then((m) => ({ default: m.ProjektePage }))
);
const ProjectDetailPage = lazy(() =>
  import('./pages/ProjectDetailPage').then((m) => ({
    default: m.ProjectDetailPage,
  }))
);
const PartnerPage = lazy(() =>
  import('./pages/PartnerPage').then((m) => ({ default: m.PartnerPage }))
);
const UeberUnsPage = lazy(() =>
  import('./pages/UeberUnsPage').then((m) => ({ default: m.UeberUnsPage }))
);
const KarrierePage = lazy(() =>
  import('./pages/KarrierePage').then((m) => ({ default: m.KarrierePage }))
);
const KontaktPage = lazy(() =>
  import('./pages/KontaktPage').then((m) => ({ default: m.KontaktPage }))
);
const ImpressumPage = lazy(() =>
  import('./pages/ImpressumPage').then((m) => ({ default: m.ImpressumPage }))
);
const DatenschutzPage = lazy(() =>
  import('./pages/DatenschutzPage').then((m) => ({ default: m.DatenschutzPage }))
);
const NotFoundPage = lazy(() =>
  import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage }))
);

// Der Verwaltungsbereich ist ein eigenes Bundle: normale Besucher laden keinen
// einzigen Byte davon. Erst der Aufruf von /admin zieht ihn nach.
const AdminArea = lazy(() =>
  import('./pages/admin/AdminArea').then((m) => ({ default: m.AdminArea }))
);

function RouteFallback() {
  return <div className="min-h-screen" aria-hidden="true" />;
}

/**
 * Die öffentliche Website mit Navbar, Footer, Scroll-Hintergrund usw. Bewusst
 * von /admin getrennt: der Admin soll nichts davon erben.
 */
function PublicSite() {
  return (
    <>
      <a
        href="#main"
        className="skip-link bg-white text-black rounded-full px-5 py-3 text-sm font-medium"
      >
        Zum Inhalt springen
      </a>

      <ScrollToTop />
      <GlobalBackground />
      <Navbar />

      {/* Meldet Screenreadern den Seitenwechsel — ohne das bleibt eine
          SPA-Navigation für sie unbemerkt. Gefüllt von useDocumentMeta. */}
      <p id="route-announcer" aria-live="polite" role="status" className="sr-only" />

      <div className="relative z-10 text-white">
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/leistungen" element={<LeistungenPage />} />
            <Route path="/projekte" element={<ProjektePage />} />
            <Route path="/projekte/:slug" element={<ProjectDetailPage />} />
            <Route path="/partner" element={<PartnerPage />} />
            <Route path="/ueber-uns" element={<UeberUnsPage />} />
            <Route path="/karriere" element={<KarrierePage />} />
            <Route path="/kontakt" element={<KontaktPage />} />
            <Route path="/impressum" element={<ImpressumPage />} />
            <Route path="/datenschutz" element={<DatenschutzPage />} />
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
        <Footer />
      </div>

      <WhatsAppButton />
      <CookieBanner />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      {/* reducedMotion="user" schaltet alle motion-Animationen ab, sobald das
          Betriebssystem Bewegungsreduzierung meldet. */}
      <MotionConfig reducedMotion="user">
        <Routes>
          <Route
            path="/admin/*"
            element={
              <Suspense fallback={<RouteFallback />}>
                <AdminArea />
              </Suspense>
            }
          />
          <Route path="/*" element={<PublicSite />} />
        </Routes>
      </MotionConfig>
    </BrowserRouter>
  );
}
