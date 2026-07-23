-- ============================================================================
-- Verwaltungsmodus Etappe 1 — Anfragen-Verwaltung
-- ----------------------------------------------------------------------------
-- Erweitert contact_requests um Betreiber-Felder und legt die Rate-Limit-Tabelle
-- für die Edge Function urra-admin an. Additiv und idempotent: das bestehende
-- Kontaktformular bleibt unberührt.
-- ============================================================================


-- ── contact_requests: Betreiber-Felder ──────────────────────────────────────
alter table public.contact_requests
  add column if not exists admin_status     text        not null default 'neu',
  add column if not exists admin_note        text        not null default '',
  add column if not exists admin_archived    boolean     not null default false,
  add column if not exists admin_updated_at  timestamptz;

-- admin_status auf die erlaubten Werte einschränken (nur anlegen, wenn noch nicht da).
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'contact_requests_admin_status_chk'
  ) then
    alter table public.contact_requests
      add constraint contact_requests_admin_status_chk
      check (admin_status in ('neu', 'in_bearbeitung', 'erledigt'));
  end if;
end $$;

-- Nach admin_status + Datum sortieren/filtern ist die häufigste Admin-Abfrage.
create index if not exists contact_requests_admin_idx
  on public.contact_requests (admin_archived, admin_status, created_at desc);


-- ── Sicherheit: contact_requests bleibt für anon nicht lesbar ────────────────
-- Der Admin liest ausschließlich über die Edge Function (Service-Role, umgeht
-- RLS). Der öffentliche Publishable Key darf die Anfragen NIE lesen — sonst
-- könnte jeder die personenbezogenen Daten abrufen. RLS ist an; falls je eine
-- anon/authenticated-SELECT-Policy angelegt wurde, hier entfernen:
alter table public.contact_requests enable row level security;

do $$
declare pol record;
begin
  for pol in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_requests'
      and cmd in ('SELECT', 'ALL')
      and roles && array['anon', 'authenticated', 'public']::name[]
  loop
    execute format('drop policy if exists %I on public.contact_requests', pol.policyname);
    raise notice 'Entfernte lesende anon-Policy: %', pol.policyname;
  end loop;
end $$;


-- ── urra_admin_log: Rate-Limit für das Admin-Login ──────────────────────────
-- Nur Fehlversuche werden protokolliert. Die IP steht als gesalzener SHA-256-Hash
-- drin (Fensterschlüssel, kein Klartext) — ein personenbezogenes Datum wird so
-- nicht dauerhaft gespeichert.
create table if not exists public.urra_admin_log (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  ip_hash     text,
  ok          boolean     not null default false
);
create index if not exists urra_admin_log_ip_time_idx
  on public.urra_admin_log (ip_hash, created_at);

alter table public.urra_admin_log enable row level security;
-- Bewusst KEINE Policy: für anon/authenticated vollständig gesperrt, nur die
-- Function (Service-Role) schreibt und liest hier.


-- ── Prüfabfragen (nach dem Anwenden im SQL-Editor ausführen) ─────────────────
-- 1) Neue Spalten vorhanden:
--    select column_name from information_schema.columns
--     where table_name = 'contact_requests' and column_name like 'admin_%';
-- 2) KEINE lesende anon-Policy auf contact_requests:
--    select policyname, cmd, roles from pg_policies
--     where tablename = 'contact_requests';
-- 3) RLS aktiv auf beiden Tabellen:
--    select relname, relrowsecurity from pg_class
--     where relname in ('contact_requests', 'urra_admin_log');
