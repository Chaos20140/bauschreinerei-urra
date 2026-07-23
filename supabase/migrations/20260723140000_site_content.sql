-- ============================================================================
-- Verwaltungsmodus Etappe 3 — Inline-Editor („Seite bearbeiten")
-- ----------------------------------------------------------------------------
-- Speichert redaktionelle Text-Overrides. Der Code (content.ts) bleibt der
-- Fallback; ein Override überschreibt den jeweiligen Text pro `key`.
-- ============================================================================


-- ── site_content ────────────────────────────────────────────────────────────
-- key: stabile Editable-ID (z. B. 'home.hero.desc'). value: der sanitisierte
-- HTML-/Text-Override. Geschrieben wird ausschließlich über urra-admin
-- (Service-Role, sanitisiert); gelesen wird öffentlich (die Inhalte stehen
-- ohnehin sichtbar auf der Website).
create table if not exists public.site_content (
  key         text primary key,
  value       text not null,
  updated_at  timestamptz not null default now()
);

alter table public.site_content enable row level security;

-- Öffentliches LESEN erlauben (Inhalte sind nicht geheim). KEIN Insert/Update
-- für anon — Schreiben läuft nur über die Service-Role in der Function.
drop policy if exists "site_content öffentlich lesbar" on public.site_content;
create policy "site_content öffentlich lesbar"
  on public.site_content
  for select
  to anon, authenticated
  using (true);


-- ── Prüfabfragen ────────────────────────────────────────────────────────────
-- 1) Tabelle + Policy:
--    select policyname, cmd, roles from pg_policies where tablename='site_content';
-- 2) Lesbar mit anon-Key (im Browser): supabase.from('site_content').select('*')
