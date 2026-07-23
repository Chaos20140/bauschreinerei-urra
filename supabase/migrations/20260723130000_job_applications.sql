-- ============================================================================
-- Verwaltungsmodus Etappe 2 — Bewerbungen
-- ----------------------------------------------------------------------------
-- Legt die Tabelle für Bewerbungen, ein Rate-Limit-Log für den öffentlichen
-- Submit-Endpunkt sowie den privaten Storage-Bucket für Lebensläufe an.
-- Idempotent.
-- ============================================================================


-- ── job_applications ────────────────────────────────────────────────────────
-- Eingang wird über die öffentliche Function urra-apply geschrieben
-- (Service-Role) — deshalb KEINE anon-Policy. Der Admin liest über urra-admin.
create table if not exists public.job_applications (
  id                uuid primary key default gen_random_uuid(),
  created_at        timestamptz not null default now(),
  name              text not null,
  email             text not null,
  phone             text,
  position          text,                          -- beworbene Stelle
  message           text,                          -- Anschreiben / Motivation
  cv_path           text,                          -- Storage-Pfad im Bucket 'bewerbungen'
  cv_filename       text,                          -- Originaldateiname
  admin_status      text not null default 'neu',
  admin_note        text not null default '',
  admin_archived    boolean not null default false,
  admin_updated_at  timestamptz
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'job_applications_admin_status_chk'
  ) then
    alter table public.job_applications
      add constraint job_applications_admin_status_chk
      check (admin_status in ('neu', 'in_bearbeitung', 'erledigt'));
  end if;
end $$;

create index if not exists job_applications_admin_idx
  on public.job_applications (admin_archived, admin_status, created_at desc);

alter table public.job_applications enable row level security;
-- Bewusst KEINE Policy: anon/authenticated haben keinen Zugriff. Eingang läuft
-- über die Service-Role in urra-apply, Verwaltung über urra-admin.


-- ── urra_apply_log: Rate-Limit für den öffentlichen Bewerbungs-Endpunkt ──────
-- Alle Absende-Versuche werden gezählt (nicht nur Fehler), damit ein Angreifer
-- den Storage nicht mit Uploads fluten kann. IP nur als gesalzener Hash.
create table if not exists public.urra_apply_log (
  id          bigint generated always as identity primary key,
  created_at  timestamptz not null default now(),
  ip_hash     text
);
create index if not exists urra_apply_log_ip_time_idx
  on public.urra_apply_log (ip_hash, created_at);

alter table public.urra_apply_log enable row level security;
-- Keine Policy: nur die Function (Service-Role) schreibt/liest hier.


-- ── Storage-Bucket 'bewerbungen' (privat) ───────────────────────────────────
-- Lebensläufe sind personenbezogen und dürfen nie öffentlich abrufbar sein.
-- Der Admin lädt sie ausschließlich über kurzlebige Signed URLs (urra-admin).
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'bewerbungen', 'bewerbungen', false,
  5242880,  -- 5 MB
  array[
    'application/pdf',
    'image/png', 'image/jpeg',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ]
)
on conflict (id) do nothing;

-- Keine Storage-Policies für anon: der Bucket ist privat, Zugriff nur über die
-- Service-Role in den Functions.


-- ── Prüfabfragen ────────────────────────────────────────────────────────────
-- 1) Tabelle + Spalten:
--    select column_name from information_schema.columns where table_name='job_applications';
-- 2) Bucket privat:
--    select id, public from storage.buckets where id='bewerbungen';
-- 3) Keine anon-Policy:
--    select policyname from pg_policies where tablename='job_applications';
