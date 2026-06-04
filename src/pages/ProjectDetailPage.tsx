import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight } from 'lucide-react';
import { BlurIn } from '../components/BlurIn';
import { CtaBlock } from '../components/CtaBlock';
import { projectList } from '../data/content';

const BASE = import.meta.env.BASE_URL;

export function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const project = projectList.find((p) => p.slug === slug);

  if (!project) {
    return <Navigate to="/projekte" replace />;
  }

  return (
    <main className="relative min-h-screen text-white pb-12">
      <section className="relative pt-32 md:pt-40 pb-10 md:pb-14 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 pointer-events-none opacity-60"
          style={{
            background:
              'radial-gradient(ellipse 80% 60% at 30% 0%, rgba(255,255,255,0.08), transparent 60%)',
          }}
          aria-hidden="true"
        />
        <div className="relative max-w-7xl mx-auto">
          <BlurIn delay={0.02}>
            <Link
              to="/projekte"
              className="group inline-flex items-center gap-2 mb-6 md:mb-8 px-4 md:px-5 py-2.5 rounded-full border border-white/20 bg-white/[0.04] text-white/85 hover:text-white hover:border-white/40 hover:bg-white/[0.08] transition-all text-sm md:text-[15px] no-shadow"
            >
              <ArrowLeft
                className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1"
                strokeWidth={2}
              />
              <span>Zurück zu Projekten</span>
            </Link>
          </BlurIn>
          <BlurIn delay={0.05}>
            <nav
              aria-label="breadcrumb"
              className="text-white/55 text-[10px] md:text-xs tracking-[0.35em] uppercase mb-10 md:mb-14 flex items-center gap-3 flex-wrap"
            >
              <Link to="/" className="hover:text-white transition-colors">
                Start
              </Link>
              <span className="text-white/30">/</span>
              <Link to="/projekte" className="hover:text-white transition-colors">
                Projekte
              </Link>
              <span className="text-white/30">/</span>
              <span className="text-white/85">{project.category}</span>
            </nav>
          </BlurIn>

          <div className="grid md:grid-cols-12 gap-x-8 gap-y-8 md:gap-y-12 items-end">
            <BlurIn delay={0.15} className="md:col-span-8">
              <p className="text-white/55 text-[10px] md:text-xs tracking-[0.3em] uppercase mb-4">
                {project.category} · {project.location} · {project.year}
              </p>
              <h1
                className="hero-title text-white font-medium text-[10vw] md:text-[5.5vw] lg:text-[4.5vw] leading-[0.95]"
                style={{ textWrap: 'balance' }}
              >
                {project.title}.
              </h1>
            </BlurIn>
            <BlurIn delay={0.4} className="md:col-span-4 md:pb-3">
              <p
                className="text-white/90 text-base md:text-lg leading-relaxed"
                style={{ textWrap: 'pretty' }}
              >
                {project.summary}
              </p>
            </BlurIn>
          </div>
        </div>
      </section>

      <section className="relative px-6 md:px-12 pb-12 md:pb-20">
        <div className="max-w-7xl mx-auto">
          <BlurIn delay={0.2}>
            <div className="relative aspect-[16/9] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900">
              <img
                src={`${BASE}${project.hero}`}
                alt={project.title}
                loading="eager"
                decoding="async"
                className="absolute inset-0 w-full h-full object-cover"
              />
            </div>
          </BlurIn>
        </div>
      </section>

      <section className="relative px-6 md:px-12 py-10 md:py-16 border-t border-white/10">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-8 md:gap-12">
          <BlurIn className="md:col-span-4">
            <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
              Eckdaten
            </p>
            <h2 className="hero-title text-white font-medium text-[10vw] md:text-[3.4vw] leading-[1] mb-6">
              Was umgesetzt wurde.
            </h2>
            <dl className="space-y-3 text-sm md:text-base">
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/60">Kategorie</dt>
                <dd className="text-white">{project.category}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/60">Standort</dt>
                <dd className="text-white">{project.location}</dd>
              </div>
              <div className="flex justify-between gap-4 border-t border-white/10 pt-3">
                <dt className="text-white/60">Jahr</dt>
                <dd className="text-white">{project.year}</dd>
              </div>
            </dl>
          </BlurIn>

          <BlurIn delay={0.15} className="md:col-span-7 md:col-start-6">
            <ul className="space-y-4">
              {project.details.map((d) => (
                <li
                  key={d}
                  className="flex items-start gap-4 border-t border-white/10 pt-4"
                >
                  <span className="text-white/40 text-sm mt-1 shrink-0">—</span>
                  <p className="text-white/85 text-base md:text-lg leading-relaxed">
                    {d}
                  </p>
                </li>
              ))}
            </ul>
          </BlurIn>
        </div>
      </section>

      {project.gallery.length > 1 && (
        <section className="relative px-6 md:px-12 py-12 md:py-20 border-t border-white/10">
          <div className="max-w-7xl mx-auto">
            <BlurIn className="mb-8 md:mb-10 max-w-3xl">
              <p className="text-white/60 text-xs tracking-[0.3em] uppercase mb-3">
                Galerie
              </p>
              <h2 className="hero-title text-white font-medium text-[10vw] md:text-[5vw] leading-[0.95]">
                Mehr Eindrücke.
              </h2>
            </BlurIn>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
              {project.gallery.map((src, idx) => (
                <BlurIn key={src} delay={idx * 0.05}>
                  <a
                    href={`${BASE}${src}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative aspect-[4/3] rounded-2xl overflow-hidden border border-white/10 bg-neutral-900 group no-shadow"
                  >
                    <img
                      src={`${BASE}${src}`}
                      alt={`${project.title} — Bild ${idx + 1}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </a>
                </BlurIn>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative px-6 md:px-12 py-10 md:py-14 border-t border-white/10">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <Link
            to="/projekte"
            className="inline-flex items-center gap-2 text-white/70 hover:text-white text-sm md:text-base transition-colors no-shadow"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} />
            Alle Projekte
          </Link>
          <Link
            to="/kontakt"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full border border-white/25 text-white hover:bg-white/10 text-sm md:text-base transition-colors no-shadow"
          >
            Ähnliches Projekt anfragen
            <ArrowUpRight className="h-4 w-4" strokeWidth={2} />
          </Link>
        </div>
      </section>

      <CtaBlock
        title="Ihr Projekt als Nächstes?"
        body="Schicken Sie uns die Eckdaten — wir kommen vor Ort, messen auf und beraten ergebnisoffen."
      />
    </main>
  );
}
