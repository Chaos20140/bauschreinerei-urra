import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

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

export function ContactForm() {
  const [form, setForm] = useState<FormState>(INITIAL);
  const [status, setStatus] = useState<Status>('idle');
  const [errorMsg, setErrorMsg] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (status === 'sending') return;

    if (!form.gdpr) {
      setErrorMsg('Bitte bestätigen Sie die Datenschutz-Einwilligung.');
      setStatus('error');
      return;
    }
    if (!isSupabaseConfigured || !supabase) {
      setErrorMsg(
        'Das Kontaktformular ist gerade nicht verfügbar. Bitte rufen Sie uns kurz an oder schreiben Sie uns eine E-Mail.'
      );
      setStatus('error');
      return;
    }

    setStatus('sending');
    setErrorMsg('');

    const { error } = await supabase.from('contact_requests').insert({
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim() || null,
      address: form.address.trim() || null,
      project_type: form.projectType || null,
      message: form.message.trim(),
      gdpr_consent: form.gdpr,
      honeypot: form.honeypot,
      user_agent:
        typeof navigator !== 'undefined' ? navigator.userAgent.slice(0, 500) : null,
    });

    if (error) {
      setStatus('error');
      setErrorMsg(
        'Wir konnten Ihre Anfrage gerade nicht senden. Bitte versuchen Sie es in einem Moment erneut oder rufen Sie uns direkt an.'
      );
      return;
    }

    setStatus('success');
    setForm(INITIAL);
  };

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (status === 'error') {
      setStatus('idle');
      setErrorMsg('');
    }
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
              className="mt-6 text-white/65 hover:text-white text-sm underline underline-offset-4 transition-colors"
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
                minLength={2}
                maxLength={120}
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
                className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 focus:outline-none px-4 py-3 text-white text-sm md:text-base transition-colors"
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
                required
                value={form.message}
                onChange={(e) => update('message', e.target.value)}
                rows={5}
                minLength={10}
                maxLength={5000}
                placeholder="Was möchten Sie umsetzen? Welche Eckdaten gibt es? Wann passt es Ihnen?"
                className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 focus:outline-none px-4 py-3 text-white text-sm md:text-base placeholder:text-white/35 transition-colors resize-y"
              />
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

            <label className="flex items-start gap-3 cursor-pointer select-none group">
              <input
                type="checkbox"
                required
                checked={form.gdpr}
                onChange={(e) => update('gdpr', e.target.checked)}
                className="mt-1 h-4 w-4 accent-white cursor-pointer"
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

            {status === 'error' && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
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
                className="inline-flex items-center justify-center gap-2 bg-white text-black rounded-full px-7 py-3.5 text-sm md:text-base font-medium hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
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
  minLength?: number;
  maxLength?: number;
};

function Field({
  label,
  id,
  type,
  value,
  onChange,
  required,
  autoComplete,
  minLength,
  maxLength,
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
        required={required}
        autoComplete={autoComplete}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={minLength}
        maxLength={maxLength}
        className="w-full rounded-xl bg-neutral-900/80 border border-white/15 focus:border-white/40 focus:outline-none px-4 py-3 text-white text-sm md:text-base transition-colors"
      />
    </div>
  );
}
