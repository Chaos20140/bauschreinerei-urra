import { useEffect, useRef, useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Check, AlertCircle, Paperclip, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { career } from '../data/content';
import { APPLY_FN_URL, FN_KEY, isApplyConfigured } from '../lib/admin-config';

type FormState = {
  name: string;
  email: string;
  phone: string;
  position: string;
  message: string;
  gdpr: boolean;
  honeypot: string;
};

const INITIAL: FormState = {
  name: '',
  email: '',
  phone: '',
  position: '',
  message: '',
  gdpr: false,
  honeypot: '',
};

type Status = 'idle' | 'sending' | 'success' | 'error';
type FieldErrors = Partial<Record<'name' | 'email' | 'gdpr' | 'cv', string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/;
const MAX_CV_BYTES = 5 * 1024 * 1024;
const ALLOWED_CV = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);
const SUBMIT_COOLDOWN_MS = 4000;

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('read_failed'));
    reader.readAsDataURL(file);
  });
}

export function BewerbungForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [cv, setCv] = useState<File | null>(null);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const mounted = useRef(true);
  const lastSubmit = useRef(0);
  const fileInput = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

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

  const pickFile = (file: File | null) => {
    setFieldErrors((prev) => ({ ...prev, cv: undefined }));
    if (!file) {
      setCv(null);
      return;
    }
    if (file.size > MAX_CV_BYTES) {
      setFieldErrors((prev) => ({ ...prev, cv: 'Die Datei ist größer als 5 MB.' }));
      setCv(null);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    if (file.type && !ALLOWED_CV.has(file.type)) {
      setFieldErrors((prev) => ({
        ...prev,
        cv: 'Bitte PDF, JPG, PNG oder Word-Dokument.',
      }));
      setCv(null);
      if (fileInput.current) fileInput.current.value = '';
      return;
    }
    setCv(file);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    // Honeypot: unsichtbar, nur Bots füllen es aus. Erfolg vortäuschen.
    if (form.honeypot.trim() !== '') {
      setStatus('success');
      setForm(INITIAL);
      setCv(null);
      return;
    }

    const errors: FieldErrors = {};
    if (form.name.trim().length < 2) errors.name = 'Bitte geben Sie Ihren Namen an.';
    if (!EMAIL_PATTERN.test(form.email.trim()))
      errors.email = 'Bitte geben Sie eine gültige E-Mail-Adresse an.';
    if (!form.gdpr) errors.gdpr = 'Bitte bestätigen Sie die Datenschutz-Einwilligung.';
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setErrorMsg('Bitte prüfen Sie die markierten Felder.');
      setStatus('error');
      return;
    }

    const now = Date.now();
    if (now - lastSubmit.current < SUBMIT_COOLDOWN_MS) {
      setErrorMsg('Ihre Bewerbung wird bereits verarbeitet. Einen Moment bitte.');
      setStatus('error');
      return;
    }
    lastSubmit.current = now;

    if (!isApplyConfigured) {
      setErrorMsg(
        'Das Bewerbungsformular ist gerade nicht verfügbar. Bitte schreiben Sie uns eine E-Mail.'
      );
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    let cvFields: Record<string, string> = {};
    if (cv) {
      try {
        cvFields = {
          cv_base64: await fileToBase64(cv),
          cv_filename: cv.name,
          cv_mimetype: cv.type || 'application/octet-stream',
        };
      } catch {
        if (!mounted.current) return;
        setStatus('error');
        setErrorMsg('Die Datei konnte nicht gelesen werden. Bitte erneut versuchen.');
        return;
      }
    }

    let res: Response;
    try {
      res = await fetch(APPLY_FN_URL, {
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
          position: form.position,
          message: form.message.trim(),
          // Einwilligung mitschicken: Der Haken war bisher nur eine
          // Browser-Prüfung und wurde nirgends festgehalten — im Streitfall
          // wäre er damit nicht nachweisbar gewesen.
          gdpr_consent: form.gdpr,
          honeypot: form.honeypot,
          ...cvFields,
        }),
      });
    } catch {
      if (!mounted.current) return;
      setStatus('error');
      setErrorMsg('Keine Verbindung. Bitte versuchen Sie es in einem Moment erneut.');
      return;
    }

    if (!mounted.current) return;

    if (res.ok) {
      setStatus('success');
      setForm(INITIAL);
      setCv(null);
      setFieldErrors({});
      return;
    }

    // Feld- bzw. Datei-Fehler vom Server sauber anzeigen.
    let body: { error?: string; message?: string; fields?: Record<string, string> } = {};
    try {
      body = await res.json();
    } catch {
      /* kein JSON */
    }
    setStatus('error');
    if (res.status === 429) {
      setErrorMsg('Zu viele Bewerbungen in kurzer Zeit. Bitte später erneut.');
    } else if (body.error === 'cv') {
      setFieldErrors({ cv: body.message || 'Die Datei wurde abgelehnt.' });
      setErrorMsg('Bitte prüfen Sie den Datei-Anhang.');
    } else if (body.error === 'validation' && body.fields) {
      const f: FieldErrors = {};
      if (body.fields.name) f.name = body.fields.name;
      if (body.fields.email) f.email = body.fields.email;
      setFieldErrors(f);
      setErrorMsg('Bitte prüfen Sie die markierten Felder.');
    } else {
      setErrorMsg('Wir konnten Ihre Bewerbung gerade nicht senden. Bitte versuchen Sie es erneut.');
    }
  };

  return (
    <div
      id="bewerbungsformular"
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
              Danke für Ihre Bewerbung.
            </h3>
            <p className="text-white/80 text-sm md:text-base leading-relaxed max-w-md mx-auto">
              Wir haben Ihre Unterlagen erhalten und melden uns zeitnah bei Ihnen.
            </p>
            <button
              type="button"
              onClick={() => setStatus('idle')}
              className="mt-6 text-white/65 hover:text-white text-sm underline underline-offset-4 transition-colors focus-ring rounded"
            >
              Weitere Bewerbung senden
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
              Jetzt bewerben
            </p>

            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Name"
                required
                id="bf-name"
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
                id="bf-email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(v) => update('email', v)}
                maxLength={200}
                error={fieldErrors.email}
              />
              <Field
                label="Telefon (optional)"
                id="bf-phone"
                type="tel"
                autoComplete="tel"
                value={form.phone}
                onChange={(v) => update('phone', v)}
                maxLength={50}
              />
              <div>
                <label
                  htmlFor="bf-position"
                  className="block text-white/65 text-xs tracking-[0.2em] uppercase mb-2"
                >
                  Position
                </label>
                <select
                  id="bf-position"
                  value={form.position}
                  onChange={(e) => update('position', e.target.value)}
                  className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 px-4 py-3 text-white text-sm md:text-base transition-colors focus-ring"
                >
                  <option value="">Bitte wählen …</option>
                  {career.positions.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label
                htmlFor="bf-message"
                className="block text-white/65 text-xs tracking-[0.2em] uppercase mb-2"
              >
                Anschreiben (optional)
              </label>
              <textarea
                id="bf-message"
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                rows={5}
                maxLength={5000}
                placeholder="Erzählen Sie kurz von sich: Erfahrung, was Sie suchen, ab wann Sie können …"
                className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 px-4 py-3 text-white text-sm md:text-base placeholder:text-white/35 transition-colors resize-y focus-ring"
              />
            </div>

            {/* Lebenslauf-Upload */}
            <div>
              <span className="block text-white/65 text-xs tracking-[0.2em] uppercase mb-2">
                Lebenslauf (optional)
              </span>
              {cv ? (
                <div className="flex items-center justify-between gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3">
                  <span className="flex items-center gap-2 text-white/85 text-sm min-w-0">
                    <Paperclip size={15} className="shrink-0" />
                    <span className="truncate">{cv.name}</span>
                    <span className="text-white/40 shrink-0">
                      ({Math.round(cv.size / 1024)} KB)
                    </span>
                  </span>
                  <button
                    type="button"
                    onClick={() => pickFile(null)}
                    aria-label="Datei entfernen"
                    className="shrink-0 h-8 w-8 grid place-items-center rounded-full border border-white/20 text-white/70 hover:text-white hover:bg-white/10 transition-colors focus-ring"
                  >
                    <X size={15} />
                  </button>
                </div>
              ) : (
                <label className="flex items-center gap-2 cursor-pointer rounded-xl border border-dashed border-white/20 bg-white/[0.02] px-4 py-3 text-white/70 text-sm hover:border-white/40 hover:text-white transition-colors focus-within:outline focus-within:outline-2">
                  <Paperclip size={15} />
                  PDF, JPG, PNG oder Word — max. 5 MB
                  <input
                    ref={fileInput}
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx,application/pdf,image/png,image/jpeg,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                    onChange={(e) => pickFile(e.target.files?.[0] ?? null)}
                    className="sr-only"
                  />
                </label>
              )}
              {fieldErrors.cv && (
                <p className="mt-2 text-rose-300 text-xs">{fieldErrors.cv}</p>
              )}
            </div>

            {/* Honeypot */}
            <div
              aria-hidden="true"
              className="absolute opacity-0 pointer-events-none -z-10 h-0 w-0 overflow-hidden"
            >
              <label htmlFor="bf-website">Website (bitte freilassen)</label>
              <input
                id="bf-website"
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
                  gelesen und stimme der Verarbeitung meiner Bewerbungsdaten zu.
                </span>
              </label>
              {fieldErrors.gdpr && (
                <p className="mt-2 text-rose-300 text-xs">{fieldErrors.gdpr}</p>
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
                  'Bewerbung senden'
                )}
              </button>
              <p className="text-white/55 text-xs">Pflichtfelder: Name, E-Mail, Einwilligung</p>
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
        className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 px-4 py-3 text-white text-sm md:text-base transition-colors focus-ring"
      />
      {error && <p className="mt-2 text-rose-300 text-xs">{error}</p>}
    </div>
  );
}
