-- Zähler des Kontakt-Rate-Limits einmalig zurücksetzen.
--
-- Beim Verifizieren des Limits am 2026-07-24 wurden absichtlich 7 Testanfragen
-- abgesetzt (5 durchgelassen, 2 korrekt blockiert). Die Testanfragen selbst
-- sind gelöscht; ohne diesen Reset bliebe der Zähler für diese Verbindung noch
-- eine Stunde auf dem Anschlag und hätte den Betreiber beim eigenen Testen
-- ausgesperrt. Die Tabelle enthält ausschließlich Zähler (gehashte
-- Fensterschlüssel), keine Inhalte — Leeren ist unkritisch.
delete from public.contact_rate_limit;
