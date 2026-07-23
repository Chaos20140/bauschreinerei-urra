import type { ContactRow } from '../../lib/admin';

export type StatusKey = ContactRow['admin_status'];

/** Anzeige-Beschriftung und Farbklassen je Bearbeitungsstatus. */
export const STATUS_META: Record<StatusKey, { label: string; badge: string; dot: string }> = {
  neu: {
    label: 'Neu',
    badge: 'bg-white/10 text-white border-white/25',
    dot: 'bg-white',
  },
  in_bearbeitung: {
    label: 'In Bearbeitung',
    badge: 'bg-amber-400/15 text-amber-200 border-amber-300/40',
    dot: 'bg-amber-300',
  },
  erledigt: {
    label: 'Erledigt',
    badge: 'bg-emerald-400/15 text-emerald-200 border-emerald-300/40',
    dot: 'bg-emerald-300',
  },
};

export const STATUS_ORDER: StatusKey[] = ['neu', 'in_bearbeitung', 'erledigt'];

/** Deutsches Anzeige-Datum aus einem ISO-Zeitstempel. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('de-DE', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Für die Freitext-Suche relevante Felder einer Anfrage zusammenfassen. */
export function searchHaystack(r: ContactRow): string {
  return [r.name, r.email, r.phone, r.address, r.project_type, r.message]
    .filter(Boolean)
    .join(' ')
    .toLowerCase();
}
