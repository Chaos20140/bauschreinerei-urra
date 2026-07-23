-- ============================================================================
-- Row-Level-Security für die Bauschreinerei-Urra-Website
-- ----------------------------------------------------------------------------
-- Diese Datei ist NICHT automatisch angewendet — sie im Supabase-Dashboard
-- unter "SQL Editor" ausführen und danach die Prüfabfragen am Ende laufen
-- lassen.
--
-- Warum das nötig ist: Die Website ist eine reine Client-App. Projekt-URL und
-- Publishable Key stehen im ausgelieferten JavaScript-Bundle und sind damit
-- öffentlich (so sind sie auch gedacht). Der EINZIGE Schutz vor Auslesen und
-- Vollschreiben der Tabellen ist deshalb die RLS-Policy hier.
-- ============================================================================


-- ── contact_requests ────────────────────────────────────────────────────────
-- Anonyme Besucher dürfen ausschließlich EINFÜGEN, niemals lesen, ändern oder
-- löschen. Ohne die SELECT-Sperre könnte jeder mit dem öffentlichen Key alle
-- eingegangenen Anfragen inklusive Namen, Adressen und Telefonnummern abrufen.

alter table public.contact_requests enable row level security;

drop policy if exists "anon darf Anfragen einfuegen" on public.contact_requests;

create policy "anon darf Anfragen einfuegen"
  on public.contact_requests
  for insert
  to anon
  with check (
    -- Honeypot muss leer sein: das Feld ist im Formular unsichtbar, nur Bots
    -- füllen es aus. Der Client bricht bereits vorher ab, das hier ist die
    -- serverseitige Absicherung.
    coalesce(honeypot, '') = ''

    -- Einwilligung ist Pflicht (Art. 6 Abs. 1 lit. a DSGVO).
    and gdpr_consent = true

    -- Längenlimits spiegeln die Client-Validierung. Ohne sie kann jemand
    -- megabytegroße Strings einkippen.
    and char_length(name) between 2 and 120
    and char_length(email) between 5 and 200
    and email like '%_@_%.__%'
    and char_length(message) between 10 and 5000
    and (phone is null or char_length(phone) <= 50)
    and (address is null or char_length(address) <= 500)
    and (project_type is null or char_length(project_type) <= 80)
  );

-- Explizit KEINE select/update/delete-Policy für anon: ohne passende Policy
-- verweigert RLS diese Operationen grundsätzlich.


-- ── Rate-Limit gegen Massen-Inserts ─────────────────────────────────────────
-- RLS allein verhindert kein Fluten der Tabelle. Der Trigger deckelt die Zahl
-- der Anfragen pro Zeitfenster. Die IP wird dabei NICHT im Klartext abgelegt,
-- sondern nur als gesalzener Hash — sie ist ein personenbezogenes Datum und
-- wird hier ausschließlich als Fensterschlüssel gebraucht.

create extension if not exists pgcrypto;

create table if not exists public.contact_rate_limit (
  ip_hash text primary key,
  window_start timestamptz not null default now(),
  hits integer not null default 0
);

alter table public.contact_rate_limit enable row level security;
-- Keine Policy → für anon vollständig unzugänglich; nur der Trigger
-- (security definer) schreibt hier.

create or replace function public.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  -- Salt bewusst hier fest hinterlegt und nicht aus Nutzereingaben gebaut.
  -- Bei Bedarf ändern — dann startet die Zählung neu.
  v_salt   constant text := 'urra-contact-rate-limit-v1';
  v_window constant interval := interval '1 hour';
  v_max    constant integer := 5;
  v_ip     text;
  v_hash   text;
  v_row    public.contact_rate_limit%rowtype;
begin
  v_ip := coalesce(
    nullif(current_setting('request.headers', true)::json ->> 'cf-connecting-ip', ''),
    nullif(split_part(
      current_setting('request.headers', true)::json ->> 'x-forwarded-for', ',', 1
    ), ''),
    'unbekannt'
  );

  -- Nur echte IP-Literale akzeptieren; alles andere landet im Sammelbucket.
  begin
    perform v_ip::inet;
  exception when others then
    v_ip := 'unbekannt';
  end;

  v_hash := encode(digest(v_salt || v_ip, 'sha256'), 'hex');

  select * into v_row from public.contact_rate_limit where ip_hash = v_hash;

  if v_row.ip_hash is null then
    insert into public.contact_rate_limit (ip_hash, window_start, hits)
    values (v_hash, now(), 1);
    return new;
  end if;

  if v_row.window_start < now() - v_window then
    update public.contact_rate_limit
       set window_start = now(), hits = 1
     where ip_hash = v_hash;
    return new;
  end if;

  if v_row.hits >= v_max then
    raise exception 'Zu viele Anfragen. Bitte versuchen Sie es später erneut.'
      using errcode = 'P0001';
  end if;

  update public.contact_rate_limit
     set hits = v_row.hits + 1
   where ip_hash = v_hash;

  return new;
end;
$$;

drop trigger if exists contact_requests_rate_limit on public.contact_requests;

create trigger contact_requests_rate_limit
  before insert on public.contact_requests
  for each row execute function public.enforce_contact_rate_limit();


-- ── reviews ─────────────────────────────────────────────────────────────────
-- Bewertungen werden auf der Startseite angezeigt: anon darf lesen, aber nur
-- freigegebene Einträge — und ausschließlich lesen.

alter table public.reviews enable row level security;

drop policy if exists "anon darf freigegebene Bewertungen lesen" on public.reviews;

create policy "anon darf freigegebene Bewertungen lesen"
  on public.reviews
  for select
  to anon
  using (published = true);


-- ── Prüfabfragen ────────────────────────────────────────────────────────────
-- 1) RLS muss auf beiden Tabellen aktiv sein:
--    select relname, relrowsecurity from pg_class
--     where relname in ('contact_requests', 'reviews', 'contact_rate_limit');
--
-- 2) Es darf KEINE select-Policy für anon auf contact_requests geben:
--    select polname, polcmd, polroles::regrole[] from pg_policy
--     where polrelid = 'public.contact_requests'::regclass;
--
-- 3) Gegenprobe im Browser (mit dem öffentlichen Key) — muss leer/Fehler sein:
--    supabase.from('contact_requests').select('*')
