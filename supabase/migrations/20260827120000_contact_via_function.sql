-- Kontaktformular läuft künftig über die Edge Function `urra-contact`
-- statt direkt aus dem Browser in die Tabelle zu schreiben.
--
-- Warum der Umbau:
--   1. Ohne Server dazwischen gibt es keine Stelle, an der eine
--      Benachrichtigungs-Mail entstehen kann.
--   2. Die Feldprüfungen lagen im Browser und waren damit umgehbar.
--   3. Der öffentliche Schlüssel braucht danach KEIN Schreibrecht mehr auf
--      `contact_requests` — das Anfragen-Postfach ist von außen unbeschreibbar.

-- ── Zähler für das Rate-Limit der Function ──────────────────────────────────
-- Analog zu `urra_apply_log`. Die IP wird nur gehasht abgelegt (gesalzen, in
-- der Function) und dient ausschließlich als Fensterschlüssel.
create table if not exists public.urra_contact_log (
  id bigint generated always as identity primary key,
  ip_hash text not null,
  created_at timestamptz not null default now()
);

create index if not exists urra_contact_log_ip_time_idx
  on public.urra_contact_log (ip_hash, created_at desc);

alter table public.urra_contact_log enable row level security;
-- Keine Policy → für anon vollständig unzugänglich; nur die Service-Role
-- (Edge Function) liest und schreibt hier.
