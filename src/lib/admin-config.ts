// Adressen der Supabase-Edge-Functions und der öffentliche Key für den Aufruf.
//
// Die Functions laufen mit `--no-verify-jwt`; der mitgesendete Publishable Key
// dient nur dem Supabase-Gateway-Routing, nicht der Autorisierung — die
// übernimmt bei urra-admin das Passwort-Gate, bei urra-apply und
// urra-contact das Rate-Limit.

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

const FN_BASE = SUPABASE_URL ? `${SUPABASE_URL.replace(/\/$/, '')}/functions/v1` : '';

/** Passwortgeschützte Verwaltung (Anfragen, Bewerbungen …). */
export const ADMIN_FN_URL = FN_BASE ? `${FN_BASE}/urra-admin` : '';

/** Öffentlicher Anfrage-Eingang (Kontaktformular). */
export const CONTACT_FN_URL = FN_BASE ? `${FN_BASE}/urra-contact` : "";

/** Öffentlicher Bewerbungs-Eingang (Karriere-Formular). */
export const APPLY_FN_URL = FN_BASE ? `${FN_BASE}/urra-apply` : '';

export const FN_KEY = PUBLISHABLE_KEY ?? '';

export const isAdminConfigured = Boolean(ADMIN_FN_URL && FN_KEY);
export const isApplyConfigured = Boolean(APPLY_FN_URL && FN_KEY);
export const isContactConfigured = Boolean(CONTACT_FN_URL && FN_KEY);
