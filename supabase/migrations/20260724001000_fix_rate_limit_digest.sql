-- Korrektur zu 20260724000000_contact_rate_limit.sql
--
-- Die Trigger-Funktion lief mit `set search_path = public` und rief `digest()`
-- aus pgcrypto auf. In Supabase liegt pgcrypto aber im Schema `extensions`,
-- nicht in `public` — dadurch schlug JEDE Anfrage über das Kontaktformular mit
-- SQL-Fehler 42883 („undefined function") fehl. Gemessen unmittelbar nach dem
-- Einspielen: POST auf contact_requests → HTTP 404, proxy-status error=42883.
--
-- Fix: `extensions` in den Suchpfad aufnehmen UND die Funktion voll
-- qualifizieren. Beides zusammen, damit es auch dann hält, wenn der Suchpfad
-- später jemand anders anfasst.

create or replace function public.enforce_contact_rate_limit()
returns trigger
language plpgsql
security definer
set search_path = public, extensions
as $$
declare
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

  v_hash := encode(extensions.digest(v_salt || v_ip, 'sha256'), 'hex');

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
