-- ============================================================================
-- Verwaltungsmodus Etappe 4 — Bilder im Editor + Mediathek
-- ----------------------------------------------------------------------------
-- Öffentlicher Storage-Bucket für die im Editor austauschbaren Bilder. Die
-- Text-Overrides liegen bereits in site_content; ein Bild-Override ist dort ein
-- key → öffentliche Bild-URL. Idempotent.
-- ============================================================================

-- Bucket 'site-images' (öffentlich lesbar — die Bilder stehen ohnehin sichtbar
-- auf der Website). Hochgeladen wird nur über die Service-Role in urra-admin;
-- Größe und Typ sind hier zusätzlich hart begrenzt.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'site-images', 'site-images', true,
  5242880,  -- 5 MB
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do nothing;

-- Öffentliches LESEN der Bilder erlauben (public-Bucket → über die public-URL
-- abrufbar). Kein anon-Insert/Update/Delete: Schreiben nur via Service-Role.
drop policy if exists "site-images öffentlich lesbar" on storage.objects;
create policy "site-images öffentlich lesbar"
  on storage.objects
  for select
  to anon, authenticated
  using (bucket_id = 'site-images');


-- ── Prüfabfragen ────────────────────────────────────────────────────────────
-- 1) Bucket öffentlich:
--    select id, public from storage.buckets where id='site-images';
-- 2) Lese-Policy vorhanden, keine Schreib-Policy für anon:
--    select policyname, cmd, roles from pg_policies
--     where tablename='objects' and schemaname='storage';
