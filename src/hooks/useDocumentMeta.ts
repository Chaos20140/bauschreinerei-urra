import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { absoluteUrl, OG_IMAGE } from '../data/site';

type Meta = {
  /** Vollständiger <title> der Seite, inkl. Marke. */
  title: string;
  /** Meta-Description, 120–160 Zeichen. */
  description: string;
  /** Auf true setzen für Seiten, die nicht in den Index sollen (404). */
  noindex?: boolean;
};

function upsertMeta(
  selector: string,
  attr: 'name' | 'property',
  key: string,
  content: string
) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/**
 * Setzt Titel, Description, canonical und Open-Graph-Tags pro Route.
 *
 * Hintergrund: Die Seite ist eine SPA — ohne diesen Hook teilen sich alle
 * neun Routen den Titel und die Description aus index.html, was Suchmaschinen
 * als Duplicate Content sehen und Screenreadern den Seitenwechsel verschweigt.
 * Deshalb wird zusätzlich eine aria-live-Region aktualisiert.
 */
export function useDocumentMeta({ title, description, noindex }: Meta): void {
  const { pathname } = useLocation();

  useEffect(() => {
    const url = absoluteUrl(pathname);

    document.title = title;

    upsertMeta('meta[name="description"]', 'name', 'description', description);
    upsertMeta(
      'meta[name="robots"]',
      'name',
      'robots',
      noindex ? 'noindex, follow' : 'index, follow'
    );

    upsertMeta('meta[property="og:title"]', 'property', 'og:title', title);
    upsertMeta(
      'meta[property="og:description"]',
      'property',
      'og:description',
      description
    );
    upsertMeta('meta[property="og:url"]', 'property', 'og:url', url);
    upsertMeta('meta[property="og:image"]', 'property', 'og:image', OG_IMAGE);
    upsertMeta('meta[name="twitter:title"]', 'name', 'twitter:title', title);
    upsertMeta(
      'meta[name="twitter:description"]',
      'name',
      'twitter:description',
      description
    );

    let canonical = document.head.querySelector<HTMLLinkElement>(
      'link[rel="canonical"]'
    );
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = url;

    // Screenreader über den Seitenwechsel informieren — ohne das bleibt eine
    // SPA-Navigation für sie unbemerkt.
    const announcer = document.getElementById('route-announcer');
    if (announcer) announcer.textContent = title;
  }, [title, description, noindex, pathname]);
}
