-- Zweiter Schritt des Umbaus: erst ausführen, wenn das Frontend live über
-- die Edge Function `urra-contact` sendet. Vorher würde das alte Formular
-- (direkter Schreibzugriff aus dem Browser) sofort aufhören zu funktionieren.

-- ── Schreibrecht des öffentlichen Schlüssels entziehen ──────────────────────
-- Bis hierher durfte jeder mit dem Publishable Key direkt Zeilen anlegen.
-- Ab jetzt schreibt ausschließlich die Function mit der Service-Role, die von
-- RLS ohnehin nicht eingeschränkt wird.
drop policy if exists "anon darf Anfragen einfuegen" on public.contact_requests;

-- ── Alten Rate-Limit-Trigger entfernen ──────────────────────────────────────
-- Der Trigger las die IP aus den Request-Headern. Bei einem Aufruf über die
-- Edge Function stünde dort nicht mehr die IP des Besuchers, sondern die der
-- Function — alle Anfragen liefen auf denselben Zähler und hätten sich
-- gegenseitig blockiert. Das Limit sitzt jetzt in der Function (5 pro Stunde
-- und Absender), wo die echte Client-IP verfügbar ist.
drop trigger if exists contact_requests_rate_limit on public.contact_requests;
drop function if exists public.enforce_contact_rate_limit();

-- Die Zählertabelle des alten Triggers wird nicht mehr beschrieben; sie bleibt
-- vorerst bestehen, damit ein Rückbau ohne Datenverlust möglich wäre.
