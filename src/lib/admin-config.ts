// Adresse der Admin-Edge-Function und der öffentliche Key für den Aufruf.
//
// Die Function läuft mit `--no-verify-jwt`; der mitgesendete Publishable Key
// dient nur dem Supabase-Gateway-Routing, nicht der Autorisierung — die
// übernimmt das Passwort-Gate in der Function selbst.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const ADMIN_FN_URL = SUPABASE_URL
  ? `${SUPABASE_URL.replace(/\/$/, "")}/functions/v1/urra-admin`
  : "";

export const ADMIN_FN_KEY = PUBLISHABLE_KEY ?? "";

export const isAdminConfigured = Boolean(ADMIN_FN_URL && ADMIN_FN_KEY);
