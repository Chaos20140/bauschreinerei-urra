import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { ADMIN_FN_URL, ADMIN_FN_KEY } from './admin-config';

export type LoginResult = 'ok' | 'bad' | 'rate' | 'unconfigured' | 'error';

/** Ein Anfrage-Datensatz, wie ihn die Function liefert (ohne honeypot/user_agent). */
export type ContactRow = {
  id: string;
  created_at: string;
  name: string;
  email: string;
  phone: string | null;
  address: string | null;
  project_type: string | null;
  message: string;
  gdpr_consent: boolean;
  admin_status: 'neu' | 'in_bearbeitung' | 'erledigt';
  admin_note: string;
  admin_archived: boolean;
  admin_updated_at: string | null;
};

type Patch = Partial<{
  admin_status: string;
  admin_note: string;
  admin_archived: boolean;
}>;

function post(body: unknown): Promise<Response> {
  return fetch(ADMIN_FN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${ADMIN_FN_KEY}`,
      apikey: ADMIN_FN_KEY,
    },
    body: JSON.stringify(body),
  });
}

/**
 * Übersetzt einen Fehler (Error-Message = HTTP-Status oder Netzwerkfehler) in
 * eine präzise Meldung — „neu anmelden" NUR bei echtem 401.
 */
export function adminErrorText(e: unknown): string {
  const code = e instanceof Error ? e.message : '';
  if (code === '401') return 'Sitzung abgelaufen — bitte neu anmelden.';
  if (code === '429') return 'Zu viele Versuche — bitte einen Moment warten.';
  if (code === '503') return 'Verwaltung ist auf dem Server noch nicht eingerichtet.';
  if (code === '404') return 'Verwaltungs-Funktion auf dem Server nicht gefunden.';
  if (/^\d+$/.test(code)) return `Serverfehler (${code}) — bitte später erneut.`;
  return 'Keine Verbindung zum Server.';
}

type AdminCtx = {
  authed: boolean;
  login: (pw: string) => Promise<LoginResult>;
  logout: () => void;
  listContacts: (includeArchived?: boolean) => Promise<ContactRow[]>;
  updateContact: (id: string, patch: Patch) => Promise<ContactRow>;
  deleteContact: (id: string) => Promise<void>;
  exportContacts: (includeArchived?: boolean) => Promise<void>;
};

const Ctx = createContext<AdminCtx | null>(null);

export function useAdmin(): AdminCtx {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin muss innerhalb von <AdminProvider> stehen');
  return c;
}

export function AdminProvider({ children }: { children: ReactNode }) {
  // Passwort NUR im Speicher (kein sessionStorage): nach einem Reload ist man
  // wieder abgemeldet, und niemand kann sich per gesetztem Flag Zugriff
  // verschaffen.
  const pwRef = useRef('');
  const [authed, setAuthed] = useState(false);

  const login = useCallback(async (p: string): Promise<LoginResult> => {
    try {
      const res = await post({ action: 'check', password: p });
      if (res.status === 401) return 'bad';
      if (res.status === 429) return 'rate';
      if (res.status === 503) return 'unconfigured';
      if (res.ok) {
        pwRef.current = p;
        setAuthed(true);
        return 'ok';
      }
      return 'error';
    } catch {
      return 'error';
    }
  }, []);

  const logout = useCallback(() => {
    pwRef.current = '';
    setAuthed(false);
  }, []);

  const listContacts = useCallback(async (includeArchived = false) => {
    const res = await post({
      action: 'list-contacts',
      password: pwRef.current,
      includeArchived,
    });
    if (!res.ok) throw new Error(String(res.status));
    return ((await res.json()).items ?? []) as ContactRow[];
  }, []);

  const updateContact = useCallback(async (id: string, patch: Patch) => {
    const res = await post({
      action: 'update-contact',
      password: pwRef.current,
      id,
      ...patch,
    });
    if (!res.ok) throw new Error(String(res.status));
    return (await res.json()).item as ContactRow;
  }, []);

  const deleteContact = useCallback(async (id: string) => {
    const res = await post({ action: 'delete-contact', password: pwRef.current, id });
    if (!res.ok) throw new Error(String(res.status));
  }, []);

  const exportContacts = useCallback(async (includeArchived = false) => {
    const res = await post({
      action: 'export-contacts',
      password: pwRef.current,
      includeArchived,
    });
    if (!res.ok) throw new Error(String(res.status));
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'urra-anfragen.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, []);

  return (
    <Ctx.Provider
      value={{ authed, login, logout, listContacts, updateContact, deleteContact, exportContacts }}
    >
      {children}
    </Ctx.Provider>
  );
}
