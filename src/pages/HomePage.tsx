import { Hero } from '../components/Hero';
import { Services } from '../components/Services';
import { Products } from '../components/Products';
import { Features } from '../components/Features';
import { Reviews } from '../components/Reviews';
import { Regions } from '../components/Regions';
import { Faq } from '../components/Faq';
import { Contact } from '../components/Contact';

export function HomePage() {
  return (
    <>
      <Hero />
      <Services />
      <Products />
      <Features />
      <Reviews />
      <Regions />
      <Faq />
      <Contact />
    </>
  );
}
