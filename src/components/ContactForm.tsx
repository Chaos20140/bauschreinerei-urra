import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CONTACT_FN_URL, FN_KEY } from '../lib/admin-config';

type FormState = {
  name: string;
  email: string;
  phone: string;
  address: string;
  projectType: string;
  message: string;
  gdpr: boolean;
  honeypot: string;
};

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  address: '',
  projectType: '',
  message: '',
  gdpr: false,
  honeypot: '',
};

const PROJECT_TYPES = [
  'Neue Fenster',
  'Neue Haustür',
  'Schiebetür / Hebeschiebetür',
  'Garagentor',
  'Komplett-Sanierung',
  'Gewerbe / Objekt',
  'Anderes / Beratung',
] as const;

type Status = 'idle' | 'sending' | 'success' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'message' | 'gdpr', string>>;

/** Absichtlich pragmatisch: kein RFC-5322-Monster, aber es fängt alles ab,
 *  was offensichtlich keine Adresse ist. Die echte Prüfung ist ohnehin, ob
 *  die Antwortmail ankommt. */
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;

/** Mindestabstand zwischen zwei Absendeversuchen. Verhindert Doppel-Klicks
 *  und dämpft simple Skript-Fluten. Der belastbare Schutz gehört in die
 *  RLS-Policy bzw. eine Edge Function — siehe supabase/policies.sql. */
const SUBMIT_COOLDOWN_MS = 5000;
const REQUEST_TIMEOUT_MS = 15000;

function validate(form: FormState): FieldErrors {
  const errors: FieldErrors = {};
  const name = form.name.trim();
  const email = form.email.trim();
  const message = form.message.trim();

  if (name.length < 2) errors.name = 'Bitte geben Sie Ihren Namen an.';
  else if (name.length > 120) errors.name = 'Der Name ist zu lang (max. 120 Zeichen).';

  if (!EMAIL_PATTERN.test(email) || email.length > 200)
    errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';

  if (message.length < 10)
    errors.message = 'Bitte beschreiben Sie Ihr Anliegen in mindestens 10 Zeichen.';
  else if (message.length > 5000)
    errors.message = 'Die Nachricht ist zu lang (max. 5000 Zeichen).';

  if (!form.gdpr) errors.gdpr = 'Bitte bestätigen Sie die Datenschutz-Einwilligung.';

  return errors;
}

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const mounted = useRef(true);
  const lastSubmit = useRef(0);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    // Honeypot: das Feld ist für Menschen unsichtbar. Ist es gefüllt, war es
    // ein Bot. Wir tun so, als sei alles gut — so lernt das Skript nichts.
    if (form.honeypot.trim() !== '') {
      setStatus('success');
      setForm(INITIAL);
      return;
    }

    // Das Formular läuft mit noValidate, damit die Fehlermeldungen zum Design
    // passen. Dadurch prüft der Browser nichts mehr — required, minLength und
    // type="email" wären wirkungslos, also validieren wir hier selbst.
    const errors = validate(form);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMsg('Bitte prüfen Sie die markierten Felder.');
      setStatus('error');
      return;
    }

    const now = Date.now();
    if (now - lastSubmit.current < SUBMIT_COOLDOWN_MS) {
      setErrorMsg('Ihre Anfrage wird bereits verarbeitet. Einen Moment bitte.');
      setStatus('error');
      return;
    }
    lastSubmit.current = now;

    setStatus('sending');
    setErrorMsg('');

    // Absenden über die Edge Function `urra-contact`: Sie prüft die Felder
    // serverseitig, speichert die Anfrage und schickt die Benachrichtigung.
    // Früher schrieb der Browser direkt in die Datenbank — dafür musste die
    // Datenbank-Bibliothek geladen werden (rund 55 kB gzip), die Prüfungen
    // waren umgehbar, und es gab keine Stelle für den Mailversand.
    if (!CONTACT_FN_URL || !FN_KEY) {
      setErrorMsg(
        'Das Kontaktformular ist gerade nicht verfügbar. Bitte rufen Sie uns kurz an oder schreiben Sie uns eine E-Mail.'
      );
      setStatus('error');
      return;
    }

    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      REQUEST_TIMEOUT_MS
    );

    let res: Response;
    try {
      res = await fetch(CONTACT_FN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${FN_KEY}`,
          apikey: FN_KEY,
        },
        body: JSON.stringify({
          name: form.name.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          project_type: form.projectType,
          message: form.message.trim(),
          gdpr_consent: form.gdpr,
          honeypot: form.honeypot,
          user_agent:
            typeof navigator !== 'undefined'
              ? navigator.userAgent.slice(0, 500)
              : '',
        }),
        signal: controller.signal,
      });
    } catch {
      window.clearTimeout(timeout);
      if (!mounted.current) return;
      setStatus('error');
      setErrorMsg(
        'Keine Verbindung. Bitte versuchen Sie es in einem Moment erneut oder rufen Sie uns direkt an.'
      );
      return;
    }

    window.clearTimeout(timeout);
    // Nach dem await kann die Komponente längst unmountet sein (Navigation
    // während des Sendens) — dann darf kein setState mehr laufen.
    if (!mounted.current) return;

    if (!res.ok) {
      setStatus('error');
      // Bewusst keine Backend-Fehlertexte durchreichen; nur die Fälle
      // unterscheiden, bei denen ein anderer Hinweis wirklich hilft.
      setErrorMsg(
        res.status === 429
          ? 'Es sind gerade viele Anfragen eingegangen. Bitte versuchen Sie es später erneut oder rufen Sie uns an.'
          : 'Wir konnten Ihre Anfrage gerade nicht senden. Bitte versuchen Sie es in einem Moment erneut oder rufen Sie uns direkt an.'
      );
      return;
    }

    setStatus('success');
    setForm(INITIAL);
    setFieldErrors({});
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg('');
    }
    setFieldErrors((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key as keyof FieldErrors];
      return next;
    });
  };

  return (
    <div
      id="kontaktformular"
      className="rounded-2xl border border-white/15 bg-white/[0.04] p-6 md:p-9 no-shadow scroll-mt-28"
    >
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            className="py-8 text-center"
          >
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-full bg-emerald-500/15 border border-emerald-400/40 mb-5">
              <Check className="h-7 w-7 text-emerald-300" strokeWidth={2} />
            </div>
            <h3 className="hero-title text-white text-2xl md:text-3xl font-medium mb-3">
              Vielen Dank für Ihre Anfrage.
            </h3>
            <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Wir haben Ihre Nachricht erhalten und melden uns werktags
              innerhalb von 24 Stunden zurück.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 text-white/65 hover:text-white text-sm underline underline-offset-4 transition-colors focus-ring rounded"
            >
              Weitere Anfrage senden
            </button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={handleSubmit}
            className="space-y-5"
            noValidate
          >
            <p className="text-white/55 text-xs tracking-[0.3em] uppercase mb-2">
              Anfrage senden
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Name"
                required
                id="cf-name"
                type="text"
                autoComplete="name"
                value={form.name}
                onChange={(v) => update('name', v)}
                maxLength={120}
                error={fieldErrors.name}
              />
              <Field
                label="E-Mail"
                required
                id="cf-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                maxLength={200}
                error={fieldErrors.email}
              />
              <Field
                label="Telefon (optional)"
                id="cf-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(v) => update('phone', v)}
                maxLength={50}
              />
              <Field
                label="Objekt-Adresse (optional)"
                id="cf-address"
                type="text"
                autoComplete="street-address"
                value={form.address}
                onChange={(v) => update('address', v)}
                maxLength={500}
              />
            </div>

            <div>
              <label
                htmlFor="cf-type"
                className="block text-white/65 text-xs tracking-[0.2em] uppercase mb-2"
              >
                Worum geht es?
              </label>
              <select
                id="cf-type"
                value={form.projectType}
                onChange={(e) => update('projectType', e.target.value)}
                className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 px-4 py-3 text-white text-sm md:text-base transition-colors focus-ring"
              >
                <option value="">Bitte wählen …</option>
                {PROJECT_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="cf-message"
                className="block text-white/65 text-xs tracking-[0.2em] uppercase mb-2"
              >
                Ihre Nachricht <span className="text-rose-300">*</span>
              </label>
              <textarea
                id="cf-message"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                rows={5}
                maxLength={5000}
                aria-invalid={fieldErrors.message ? true : undefined}
                aria-describedby={fieldErrors.message ? 'cf-message-error' : undefined}
                placeholder="Was möchten Sie umsetzen? Welche Eckdaten gibt es? Wann passt es Ihnen?"
                className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 px-4 py-3 text-white text-sm md:text-base placeholder:text-white/35 transition-colors resize-y focus-ring"
              />
              {fieldErrors.message && (
                <p id="cf-message-error" className="mt-2 text-rose-300 text-xs">
                  {fieldErrors.message}
                </p>
              )}
            </div>

            {/* Honeypot — bleibt visuell unsichtbar, Bots füllen aus */}
            <div
              aria-hidden="true"
              className="absolute opacity-0 pointer-events-none -z-10 h-0 w-0 overflow-hidden"
            >
              <label htmlFor="cf-website">Website (bitte freilassen)</label>
              <input
                id="cf-website"
                type="text"
                tabIndex={-1}
                autoComplete="off"
                value={form.honeypot}
                onChange={(e) => update('honeypot', e.target.value)}
              />
            </div>

            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none group">
                <input
                  type="checkbox"
                  checked={form.gdpr}
                  onChange={(e) => update('gdpr', e.target.checked)}
                  aria-invalid={fieldErrors.gdpr ? true : undefined}
                  aria-describedby={fieldErrors.gdpr ? 'cf-gdpr-error' : undefined}
                  className="mt-1 h-4 w-4 accent-white cursor-pointer focus-ring rounded"
                />
                <span className="text-white/70 text-xs md:text-sm leading-relaxed group-hover:text-white/85 transition-colors">
                  Ich habe die{' '}
                  <Link
                    to="/datenschutz"
                    className="underline underline-offset-2 hover:text-white"
                  >
                    Datenschutzerklärung
                  </Link>{' '}
                  gelesen und stimme der Verarbeitung meiner Daten zur
                  Bearbeitung meiner Anfrage zu.
                </span>
              </label>
              {fieldErrors.gdpr && (
                <p id="cf-gdpr-error" className="mt-2 text-rose-300 text-xs">
                  {fieldErrors.gdpr}
                </p>
              )}
            </div>

            {status === 'error' && errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                role="alert"
                className="flex items-start gap-2 rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-3 text-rose-100 text-sm"
              >
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" strokeWidth={2} />
                <span>{errorMsg}</span>
              </motion.div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center gap-3 pt-2">
              <button
                type="submit"
                disabled={status === 'sending'}
                className="inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-7 py-3.5 text-sm md:text-base font-medium hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors focus-ring"
              >
                {status === 'sending' ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={2} />
                    Sende …
                  </>
                ) : (
                  'Anfrage senden'
                )}
              </button>
              <p className="text-white/55 text-xs">
                Pflichtfelder: Name, E-Mail, Nachricht, Einwilligung
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}

type FieldProps = {
  label: string;
  id: string;
  type: 'text' | 'email' | 'tel';
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  error?: string;
};

function Field({
  label,
  id,
  type,
  value,
  onChange,
  required,
  autoComplete,
  maxLength,
  error,
}: FieldProps) {
  return (
    <div>
      <label
        htmlFor={id}
        className="block text-white/65 text-xs tracking-[0.2em] uppercase mb-2"
      >
        {label} {required && <span className="text-rose-300">*</span>}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 px-4 py-3 text-white text-sm md:text-base transition-colors focus-ring"
      />
      {error && (
        <p id={`${id}-error`} className="mt-2 text-rose-300 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}
