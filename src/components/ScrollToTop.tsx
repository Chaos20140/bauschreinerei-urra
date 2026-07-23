import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/** Wie lange nach einem Hash-Ziel gesucht wird, bevor aufgegeben wird.
 *  Der frühere Einmal-Versuch nach 120 ms griff zu kurz, sobald das Ziel in
 *  einer lazy geladenen Seite steckt. */
const HASH_TIMEOUT_MS = 2000;

export function ScrollToTop() {
  const { pathname, hash } = useLocation();

  useEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      return;
    }

    const id = decodeURIComponent(hash.replace('#', ''));
    let rafId: number | null = null;
    const deadline = performance.now() + HASH_TIMEOUT_MS;

    const attempt = () => {
      rafId = null;
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      if (performance.now() < deadline) {
        rafId = requestAnimationFrame(attempt);
      }
    };

    attempt();

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [pathname, hash]);

  return null;
}
