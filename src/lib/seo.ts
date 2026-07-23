/**
 * Suchmaschinen-Titel und -Beschreibung pro Seite, vom Betreiber änderbar.
 *
 * Der Schlüssel entsteht aus dem Pfad: „/" → `seo.start.*`,
 * „/projekte/bogenfenster-sondermass" → `seo.projekte.bogenfenster-….*`.
 * Er muss zur ID-Prüfung der Function passen (^[a-z0-9][a-z0-9.\-]{0,80}$).
 */
export function seoKey(pathname: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  const slug = (trimmed === '' ? 'start' : trimmed.replace(/\//g, '.')).toLowerCase();
  const safe = slug.replace(/[^a-z0-9.-]/g, '-').slice(0, 60);
  return /^[a-z0-9]/.test(safe) ? safe : `s${safe}`;
}

export const seoIds = (pathname: string) => ({
  title: `seo.${seoKey(pathname)}.title`,
  desc: `seo.${seoKey(pathname)}.desc`,
});
