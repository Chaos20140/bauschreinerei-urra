import { createClient } from '@supabase/supabase-js';

// Supabase-URL und Publishable-Key kommen über Vite-Env-Vars rein. Beide
// sind explizit für den Client-Einsatz vorgesehen — RLS schützt die Daten.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env
  .VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const isSupabaseConfigured = Boolean(
  SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY
);

export const supabase = isSupabaseConfigured
  ? createClient(SUPABASE_URL!, SUPABASE_PUBLISHABLE_KEY!, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;

export type ReviewRow = {
  id: string;
  author_name: string;
  author_role: string | null;
  rating: number;
  body: string;
  review_date: string;
  source: string;
  published: boolean;
  sort_order: number;
};
