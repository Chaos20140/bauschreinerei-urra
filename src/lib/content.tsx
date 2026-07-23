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
  /** Ein Bild hochladen und als Override für die ID setzen (sofort wirksam). */
  uploadImage: (id: string, file: File) => Promise<{ ok: boolean; error?: string }>;
  /**
   * Werte direkt speichern (ohne Bearbeiten-Modus) — für Verwaltungs-Ansichten
   * wie „Seiten & Menü". Das Passwort kommt dort aus dem Admin-Kontext.
   */
  saveValues: (
    values: Record<string, string>,
    pw?: string
  ) => Promise<{ ok: boolean; error?: string }>;
  /** Overrides löschen → die Code-Texte greifen wieder. */
  resetValues: (ids: string[], pw?: string) => Promise<{ ok: boolean; error?: string }>;

  // ── Bearbeiten-Leiste ────────────────────────────────────────────────────
  /** Noch nicht gespeicherter Wert eines Feldes (für Rückgängig/Neuaufbau). */
  pendingValue: (id: string) => string | undefined;
  /**
   * Zählt hoch, wenn der Inhalt von außen geändert wurde (Rückgängig,
   * Verwerfen). `Editable` baut sich daraufhin neu auf — ohne das bliebe der
   * alte Text im contentEditable stehen.
   */
  seedVersion: number;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  /** Alle ungespeicherten Änderungen verwerfen, im Bearbeiten-Modus bleiben. */
  discard: () => void;
  /** Alle auf dieser Seite bearbeiteten Stellen (für „Seite zurücksetzen"). */
  knownIds: () => string[];

  // ── Mediathek ────────────────────────────────────────────────────────────
  /** Bilder der Mediathek auflisten (Passwort aus dem Bearbeiten-Modus). */
  listImages: () => Promise<MediaImage[]>;
  /** Ein Bild in die Mediathek laden, ohne es irgendwo einzusetzen. */
  uploadToLibrary: (file: File) => Promise<{ ok: boolean; error?: string }>;
  /** Ein vorhandenes Bild der Mediathek an einer Stelle einsetzen. */
  applyLibraryImage: (id: string, name: string) => Promise<{ ok: boolean; error?: string }>;
};

export type MediaImage = { name: string; url: string; inUse: boolean; size: number | null };

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

  // Verlauf für Rückgängig/Wiederherstellen. Zusammengefasst pro Feld: wer
  // einen Satz tippt, macht mit einem Klick den ganzen Satz rückgängig, nicht
  // Buchstabe für Buchstabe.
  const historyRef = useRef<{ pending: Record<string, string>; lastId: string | null }[]>([
    { pending: {}, lastId: null },
  ]);
  const posRef = useRef(0);
  const [seedVersion, setSeedVersion] = useState(0);
  const [historyTick, setHistoryTick] = useState(0);
  // Jede ID, die im Bearbeiten-Modus gerendert wurde — Grundlage für
  // „Seite zurücksetzen".
  const seenIdsRef = useRef<Set<string>>(new Set());

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

  const get = useCallback(
    (id: string) => {
      if (editMode) seenIdsRef.current.add(id);
      return overrides[id];
    },
    [overrides, editMode]
  );
  const isDirty = useCallback((id: string) => id in pending, [pending]);
  const pendingValue = useCallback((id: string) => pending[id], [pending]);
  const knownIds = useCallback(() => [...seenIdsRef.current], []);

  /** Neuen Stand in den Verlauf schreiben (verwirft eine offene „Wiederherstellen"-Kette). */
  const pushHistory = useCallback((next: Record<string, string>, id: string | null) => {
    const h = historyRef.current;
    const pos = posRef.current;
    const current = h[pos];
    // Gleiches Feld direkt hintereinander → denselben Eintrag ersetzen.
    if (current && current.lastId === id && id !== null) {
      h[pos] = { pending: next, lastId: id };
      setHistoryTick((t) => t + 1);
      return;
    }
    const trimmed = h.slice(0, pos + 1);
    trimmed.push({ pending: next, lastId: id });
    // Deckel: der Verlauf soll nicht unbegrenzt wachsen.
    while (trimmed.length > 60) trimmed.shift();
    historyRef.current = trimmed;
    posRef.current = trimmed.length - 1;
    setHistoryTick((t) => t + 1);
  }, []);

  const setPending = useCallback(
    (id: string, value: string) => {
      setPendingState((p) => {
        // Entspricht der Wert wieder dem gespeicherten Stand, ist das Feld nicht mehr „dirty".
        let next: Record<string, string>;
        if ((overrides[id] ?? '') === value && id in p) {
          next = { ...p };
          delete next[id];
        } else if (p[id] === value) {
          return p;
        } else {
          next = { ...p, [id]: value };
        }
        pushHistory(next, id);
        return next;
      });
    },
    [overrides, pushHistory]
  );

  const undo = useCallback(() => {
    if (posRef.current <= 0) return;
    posRef.current -= 1;
    setPendingState(historyRef.current[posRef.current].pending);
    setSeedVersion((v) => v + 1);
    setHistoryTick((t) => t + 1);
  }, []);

  const redo = useCallback(() => {
    if (posRef.current >= historyRef.current.length - 1) return;
    posRef.current += 1;
    setPendingState(historyRef.current[posRef.current].pending);
    setSeedVersion((v) => v + 1);
    setHistoryTick((t) => t + 1);
  }, []);

  const discard = useCallback(() => {
    historyRef.current = [{ pending: {}, lastId: null }];
    posRef.current = 0;
    setPendingState({});
    setSeedVersion((v) => v + 1);
    setHistoryTick((t) => t + 1);
  }, []);

  const enterEditMode = useCallback((pw: string) => {
    pwRef.current = pw;
    historyRef.current = [{ pending: {}, lastId: null }];
    posRef.current = 0;
    seenIdsRef.current = new Set();
    setHistoryTick((t) => t + 1);
    setEditMode(true);
  }, []);

  const leaveEditMode = useCallback(() => {
    // editMode → false lässt jedes Editable neu (nicht-editierbar) rendern und
    // verwirft damit ungespeicherte DOM-Änderungen. Kein Reload nötig.
    setPendingState({});
    setEditMode(false);
    pwRef.current = '';
    historyRef.current = [{ pending: {}, lastId: null }];
    posRef.current = 0;
    seenIdsRef.current = new Set();
    setHistoryTick((t) => t + 1);
  }, []);

  const saveValues = useCallback(
    async (
      values: Record<string, string>,
      pw?: string
    ): Promise<{ ok: boolean; error?: string }> => {
      const ids = Object.keys(values);
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
            password: pw ?? pwRef.current,
            overrides: values,
          }),
        });
        if (!res.ok) return { ok: false, error: String(res.status) };
        setOverrides((o) => ({ ...o, ...values }));
        return { ok: true };
      } catch {
        return { ok: false, error: 'network' };
      }
    },
    []
  );

  const resetValues = useCallback(
    async (ids: string[], pw?: string): Promise<{ ok: boolean; error?: string }> => {
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
            action: 'reset-content',
            password: pw ?? pwRef.current,
            keys: ids,
          }),
        });
        if (!res.ok) return { ok: false, error: String(res.status) };
        setOverrides((o) => {
          const next = { ...o };
          for (const id of ids) delete next[id];
          return next;
        });
        return { ok: true };
      } catch {
        return { ok: false, error: 'network' };
      }
    },
    []
  );

  const save = useCallback(async (): Promise<{ ok: boolean; error?: string }> => {
    if (Object.keys(pending).length === 0) return { ok: true };
    const r = await saveValues(pending);
    // Erst nach erfolgreichem Speichern gilt nichts mehr als „ungespeichert".
    if (r.ok) {
      setPendingState({});
      historyRef.current = [{ pending: {}, lastId: null }];
      posRef.current = 0;
      setHistoryTick((t) => t + 1);
      // Alle Felder neu aufbauen: Steht dieselbe Angabe mehrfach auf der Seite
      // (z. B. die Telefonnummer im Kontaktblock und auf der Anruf-Karte),
      // zeigte sonst nur die bearbeitete Stelle den neuen Wert.
      setSeedVersion((v) => v + 1);
    }
    return r;
  }, [pending, saveValues]);

  const uploadImage = useCallback(
    async (id: string, file: File): Promise<{ ok: boolean; error?: string }> => {
      try {
        const dataBase64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = () => reject(new Error('read_failed'));
          reader.readAsDataURL(file);
        });
        const res = await fetch(ADMIN_FN_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${FN_KEY}`,
            apikey: FN_KEY,
          },
          body: JSON.stringify({
            action: 'upload-image',
            password: pwRef.current,
            id,
            dataBase64,
          }),
        });
        if (!res.ok) return { ok: false, error: String(res.status) };
        const { url } = await res.json();
        if (typeof url === 'string') setOverrides((o) => ({ ...o, [id]: url }));
        return { ok: true };
      } catch {
        return { ok: false, error: 'network' };
      }
    },
    []
  );

  /** Gemeinsamer Aufruf der Verwaltungs-Function mit dem Passwort im Speicher. */
  const callAdmin = useCallback(async (body: Record<string, unknown>) => {
    return fetch(ADMIN_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${FN_KEY}`,
        apikey: FN_KEY,
      },
      body: JSON.stringify({ ...body, password: pwRef.current }),
    });
  }, []);

  const listImages = useCallback(async (): Promise<MediaImage[]> => {
    try {
      const res = await callAdmin({ action: 'list-images' });
      if (!res.ok) return [];
      return ((await res.json()).items ?? []) as MediaImage[];
    } catch {
      return [];
    }
  }, [callAdmin]);

  /** Dateiname → brauchbarer Namensvorschlag für den Bucket. */
  function libraryName(file: File): string {
    const base = file.name.replace(/\.[^.]+$/, '');
    return (base.replace(/[^a-zA-Z0-9.-]/g, '-').slice(0, 60) || 'bild').toLowerCase();
  }

  const readAsDataUrl = (file: File) =>
    new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(new Error('read_failed'));
      reader.readAsDataURL(file);
    });

  const uploadToLibrary = useCallback(
    async (file: File): Promise<{ ok: boolean; error?: string }> => {
      try {
        const dataBase64 = await readAsDataUrl(file);
        const res = await callAdmin({
          action: 'upload-image',
          id: libraryName(file),
          dataBase64,
          // Kein Inhalts-Schlüssel: das Bild landet nur in der Mediathek.
          standalone: true,
        });
        if (!res.ok) return { ok: false, error: String(res.status) };
        return { ok: true };
      } catch {
        return { ok: false, error: 'network' };
      }
    },
    [callAdmin]
  );

  const applyLibraryImage = useCallback(
    async (id: string, name: string): Promise<{ ok: boolean; error?: string }> => {
      try {
        const res = await callAdmin({ action: 'use-image', id, name });
        if (!res.ok) return { ok: false, error: String(res.status) };
        const { url } = await res.json();
        if (typeof url === 'string') setOverrides((o) => ({ ...o, [id]: url }));
        return { ok: true };
      } catch {
        return { ok: false, error: 'network' };
      }
    },
    [callAdmin]
  );

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
      uploadImage,
      saveValues,
      resetValues,
      pendingValue,
      seedVersion,
      undo,
      redo,
      // historyTick sorgt dafür, dass sich diese Flags nach jedem Schritt
      // neu berechnen — die Positionen selbst liegen in Refs.
      canUndo: historyTick >= 0 && posRef.current > 0,
      canRedo: historyTick >= 0 && posRef.current < historyRef.current.length - 1,
      discard,
      knownIds,
      listImages,
      uploadToLibrary,
      applyLibraryImage,
    }),
    [
      get,
      editMode,
      isDirty,
      pending,
      setPending,
      enterEditMode,
      leaveEditMode,
      save,
      uploadImage,
      saveValues,
      resetValues,
      pendingValue,
      seedVersion,
      undo,
      redo,
      historyTick,
      discard,
      knownIds,
      listImages,
      uploadToLibrary,
      applyLibraryImage,
    ]
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
