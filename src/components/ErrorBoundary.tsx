import { Component, type ErrorInfo, type ReactNode } from 'react';
import { brand, contact } from '../data/content';

type Props = { children: ReactNode };
type State = { hasError: boolean };

/**
 * Fängt Render-Fehler ab, damit ein einzelner kaputter Teilbaum nicht die
 * gesamte Seite leert. Der Fallback nennt bewusst Telefon und E-Mail — wenn
 * die Seite streikt, soll der Besucher den Betrieb trotzdem erreichen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Bewusst nur auf der Konsole: es gibt kein Error-Tracking-Backend, und
    // Fehlerdetails gehören nicht in die Oberfläche.
    console.error('Unerwarteter Render-Fehler:', error, info.componentStack);
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <div className="min-h-screen bg-black text-white grid place-items-center px-6">
        <div className="max-w-lg text-center">
          <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-4">
            {brand.shortName}
          </p>
          <h1 className="hero-title text-3xl md:text-5xl font-medium mb-5">
            Da ist leider etwas schiefgelaufen.
          </h1>
          <p className="text-white/80 leading-relaxed mb-8">
            Bitte laden Sie die Seite neu. Falls das Problem bestehen bleibt,
            erreichen Sie uns jederzeit direkt — wir helfen gern persönlich
            weiter.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a
              href={contact.phone.href}
              className="inline-flex items-center justify-center bg-white text-black rounded-full px-7 py-3.5 text-sm font-medium hover:bg-neutral-200 transition-colors"
            >
              {contact.phone.display}
            </a>
            <a
              href={contact.email.href}
              className="inline-flex items-center justify-center rounded-full border border-white/25 px-7 py-3.5 text-sm hover:bg-white/10 transition-colors"
            >
              {contact.email.display}
            </a>
          </div>
        </div>
      </div>
    );
  }
}
