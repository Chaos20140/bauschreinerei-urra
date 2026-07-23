import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ADMIN_FN_URL, FN_KEY } from './admin-config';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const REST_URL = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, '')}/rest/v1/site_content`
  : '';

type ContentCtx = {
  /** Gespeicherter Override eines Textes (oder undefined → Code-Text greift). */
  get: (id: string) => string | undefined;
  editMode: boolean;
  isDirty: (id: string) => boolean;
  dirtyCount: number;
  /** Ungespeicherte Änderung eines Feldes vormerken. */
  setPending: (id: string, value: string) => void;
  /** Bearbeiten-Modus starten (Passwort kommt aus dem Admin, bleibt im Speicher). */
  enterEditMode: (pw: string) => void;
  leaveEditMode: () => void;
  save: () => Promise<{ ok: boolean; error?: string }>;
};

const Ctx = createContext<ContentCtx | null>(null);

export function useContent(): ContentCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useContent muss innerhalb von <ContentProvider> stehen');
  return c;
}

export function ContentProvider({ children }: { children: ReactNode }) {
  const [overrides, setOverrides] = useState<Record<string, string>>({});
  const [pending, setPendingState] = useState<Record<string, string>>({});
  const [editMode, setEditMode] = useState(false);
  const pwRef = useRef('');

  // Overrides einmal laden (leichter REST-Aufruf, kein supabase-js im Startpfad).
  // Öffentliche SELECT-Policy auf site_content → der Publishable Key genügt.
  useEffect(() => {
    if (!REST_URL || !FN_KEY) return;
    let alive = true;
    fetch(`${REST_URL}?select=key,value`, {
      headers: { apikey: FN_KEY, Authorization: `Bearer ${FN_KEY}` },
    })
      .then((r) => (r.ok ? r.json() : []))
      .then((rows: Array<{ key: string; value: string }>) => {
        if (!alive || !Array.isArray(rows)) return;
        const map: Record<string, string> = {};
        for (const row of rows) if (row && typeof row.key === 'string') map[row.key] = row.value;
        setOverrides(map);
      })
      .catch(() => {
        /* Ohne Overrides greifen einfach die Code-Texte. */
      });
    return () => {
      alive = false;
    };
  }, []);

  const get = useCallback((id: string) => overrides[id], [overrides]);
  const isDirty = useCallback((id: string) => id in pending, [pending]);

  const setPending = useCallback((id: string, value: string) => {
    setPendingState((p) => {
      // Entspricht der Wert wieder dem gespeicherten Stand, ist das Feld nicht mehr „dirty".
      if ((overrides[id] ?? '') === value && id in p) {
        const next = { ...p };
        delete next[id];
        return next;
      }
      if (p[id] === value) return p;
      return { ...p, [id]: value };
    });
  }, [overrides]);

  const enterEditMode = useCallback((pw: string) => {
    pwRef.current = pw;
    setEditMode(true);
  }, []);

  const leaveEditMode = useCallback(() => {
    // editMode → false lässt jedes Editable neu (nicht-editierbar) rendern und
    // verwirft damit ungespeicherte DOM-Änderungen. Kein Reload nötig.
    setPendingState({});
    setEditMode(false);
    pwRef.current = '';
  }, []);

  const save = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    const ids = Object.keys(pending);
    if (ids.length === 0) return { ok: true };
    try {
      const res = await fetch(ADMIN_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${FN_KEY}`,
          apikey: FN_KEY,
        },
        body: JSON.stringify({
          action: 'save-content',
          password: pwRef.current,
          overrides: pending,
        }),
      });
      if (!res.ok) return { ok: false, error: String(res.status) };
      // Lokal übernehmen: die gespeicherten Werte werden zu Overrides, pending leert.
      setOverrides((o) => ({ ...o, ...pending }));
      setPendingState({});
      return { ok: true };
    } catch {
      return { ok: false, error: 'network' };
    }
  }, [pending]);

  const value = useMemo<ContentCtx>(
    () => ({
      get,
      editMode,
      isDirty,
      dirtyCount: Object.keys(pending).length,
      setPending,
      enterEditMode,
      leaveEditMode,
      save,
    }),
    [get, editMode, isDirty, pending, setPending, enterEditMode, leaveEditMode, save]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
