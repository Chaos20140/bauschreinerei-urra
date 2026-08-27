-- Nachtrag zu 20260827130000_contact_lock_down.sql
--
-- Dort wurde die Schreib-Policy unter dem Namen aus `supabase/policies.sql`
-- entfernt („anon darf Anfragen einfuegen"). Tatsächlich trug sie in der
-- Datenbank noch den Namen aus der Ersteinrichtung
-- („Anon can submit contact requests") und blieb deshalb bestehen — der
-- öffentliche Schlüssel konnte weiter direkt in die Tabelle schreiben
-- (nachgewiesen: Direkt-Insert lieferte HTTP 201 statt 401).
--
-- Deshalb hier namensunabhängig: JEDE INSERT-Policy auf `contact_requests`
-- wird entfernt. Geschrieben wird ab jetzt ausschließlich von der Edge
-- Function `urra-contact` mit der Service-Role, die RLS ohnehin umgeht.

do $$
declare
  p record;
begin
  for p in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'contact_requests'
      and cmd = 'INSERT'
  loop
    execute format('drop policy if exists %I on public.contact_requests', p.policyname);
    raise notice 'Policy entfernt: %', p.policyname;
  end loop;
end $$;

-- Sicherstellen, dass RLS aktiv bleibt: Ohne aktives RLS hätte das Entfernen
-- der Policies keine Wirkung.
alter table public.contact_requests enable row level security;
