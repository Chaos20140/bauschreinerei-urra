import { BrowserRouter, Routes, Route } from 'react-router-dom';

const ROUTER_BASENAME = import.meta.env.BASE_URL.replace(/\/$/, '');
import { ScrollToTop } from './components/ScrollToTop';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { CookieBanner } from './components/CookieBanner';
import { GlobalBackground } from './components/GlobalBackground';
import { HomePage } from './pages/HomePage';
import { LeistungenPage } from './pages/LeistungenPage';
import { ProjektePage } from './pages/ProjektePage';
import { UeberUnsPage } from './pages/UeberUnsPage';
import { KontaktPage } from './pages/KontaktPage';
import { ImpressumPage } from './pages/ImpressumPage';
import { DatenschutzPage } from './pages/DatenschutzPage';

export default function App() {
  return (
    <BrowserRouter basename={ROUTER_BASENAME}>
      <ScrollToTop />
      <GlobalBackground />
      <Navbar />
      <div className="relative z-10 text-white">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/leistungen" element={<LeistungenPage />} />
          <Route path="/projekte" element={<ProjektePage />} />
          <Route path="/ueber-uns" element={<UeberUnsPage />} />
          <Route path="/kontakt" element={<KontaktPage />} />
          <Route path="/impressum" element={<ImpressumPage />} />
          <Route path="/datenschutz" element={<DatenschutzPage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
        <Footer />
      </div>
      <CookieBanner />
    </BrowserRouter>
  );
}
