-- Rate-Limit gegen Massen-Inserts ins Kontaktformular.
--
-- Der Inhalt stammt aus supabase/policies.sql, wo er am 2026-07-23 geschrieben,
-- aber nie in der Datenbank ausgeführt wurde: Die Prüfung am 2026-07-24 ergab
-- HTTP 404 auf public.contact_rate_limit — das Formular nahm Anfragen also
-- ohne Bremse entgegen. Als Migration abgelegt, damit der Stand nachvollziehbar
-- ist und nicht wieder von Hand eingespielt werden muss.
--
-- RLS allein verhindert kein Fluten der Tabelle. Der Trigger deckelt die Zahl
-- der Anfragen pro Zeitfenster (5 pro Stunde je Absender). Die IP wird dabei
-- NICHT im Klartext abgelegt, sondern nur als gesalzener Hash — sie ist ein
-- personenbezogenes Datum und wird hier ausschließlich als Fensterschlüssel
-- gebraucht.

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
