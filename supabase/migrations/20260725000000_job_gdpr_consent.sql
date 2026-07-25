-- Einwilligung bei Bewerbungen nachweisbar speichern.
--
-- Das Bewerbungsformular verlangt seit jeher die Bestätigung der
-- Datenschutzerklärung, prüfte sie aber nur im Browser: Der abgesendete
-- Datensatz enthielt kein entsprechendes Feld, in `job_applications` gab es
-- keine Spalte dafür. Damit war die Einwilligung im Streitfall nicht
-- nachweisbar (Art. 7 Abs. 1 DSGVO). Beim Kontaktformular war das von Anfang an
-- richtig (`contact_requests.gdpr_consent`).
--
-- `consent_at` hält zusätzlich den Zeitpunkt fest — der Nachweis ist damit auch
-- dann noch aussagekräftig, wenn sich der Text der Erklärung später ändert.

alter table public.job_applications
  add column if not exists gdpr_consent boolean not null default false,
  add column if not exists consent_at   timestamptz;

comment on column public.job_applications.gdpr_consent is
  'Bestätigung der Datenschutzerklärung beim Absenden (Nachweis nach Art. 7 DSGVO).';
comment on column public.job_applications.consent_at is
  'Zeitpunkt der Bestätigung; NULL bei Altdatensätzen vor Einführung der Spalte.';
