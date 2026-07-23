import { useContent } from '../lib/content';
import { EditableImage } from './editor/EditableImage';

const BASE = import.meta.env.BASE_URL;

/** Breiten, die tools/optimize-images.mjs erzeugt. */
const WIDTHS = [800, 1200, 1600] as const;

type Props = {
  /** Pfad relativ zu public/, z. B. 'projekte/privatbau-haus.webp'. */
  src: string;
  alt: string;
  /** sizes-Angabe — beschreibt, wie breit das Bild im Layout wirklich ist. */
  sizes: string;
  className?: string;
  /** true für das LCP-Bild einer Seite (lädt sofort, ohne lazy). */
  priority?: boolean;
  /**
   * Ist gesetzt, wird das Bild im Editor austauschbar. Liegt ein Override vor
   * oder ist der Bearbeiten-Modus aktiv, greift das (einfaches) Override-Bild
   * statt des srcset — sonst bleibt das performante srcset erhalten.
   */
  editId?: string;
};

/**
 * Projektbild mit responsivem srcset.
 *
 * Die Originale liegen in 2500 px Breite vor, dargestellt werden sie mit
 * höchstens ~735 px. Ohne srcset lud jedes Gerät die volle Auflösung — bei
 * sieben Bildern rund 5,5 MB. Mit den vorgerenderten Varianten sind es je
 * nach Viewport 25–160 KB pro Bild.
 */
export function ProjectImage({ src, alt, sizes, className, priority, editId }: Props) {
  const { get, editMode } = useContent();
  const stem = src.replace(/\.webp$/, '');
  const override = editId ? get(editId) : undefined;

  // Editierbar: sobald ein Override existiert oder der Bearbeiten-Modus läuft,
  // rendert EditableImage (einzelnes Bild, im Edit-Modus klickbar). Der
  // Default-`src` bleibt das 1200er-webp, damit ohne Override nichts fehlt.
  if (editId && (override || editMode)) {
    return (
      <EditableImage
        id={editId}
        src={override ?? `${BASE}${stem}-1200.webp`}
        alt={alt}
        className={className}
        eager={priority}
      />
    );
  }

  const srcSet = WIDTHS.map((w) => `${BASE}${stem}-${w}.webp ${w}w`).join(', ');
  return (
    <img
      src={`${BASE}${stem}-1200.webp`}
      srcSet={srcSet}
      sizes={sizes}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      decoding="async"
      className={className}
    />
  );
}
