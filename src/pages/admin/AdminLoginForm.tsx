import { useState } from 'react';
import { Lock } from 'lucide-react';
import { useAdmin } from '../../lib/admin';
import { brand } from '../../data/content';

export function AdminLoginForm() {
  const { login } = useAdmin();
  const [pw, setPw] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [shake, setShake] = useState(false);

  async function go() {
    if (busy) return; // schützt auch den Enter-Pfad vor Mehrfach-Submit
    if (!pw) {
      setMsg('Bitte Passwort eingeben.');
      return;
    }
    setBusy(true);
    setMsg('Prüfe Passwort …');
    const r = await login(pw);
    if (r === 'ok') return; // AdminArea rendert danach das Dashboard
    setBusy(false);
    setShake(true);
    window.setTimeout(() => setShake(false), 500);
    setMsg(
      r === 'bad'
        ? 'Falsches Passwort.'
        : r === 'rate'
          ? 'Zu viele Versuche — bitte später erneut.'
          : r === 'unconfigured'
            ? 'Die Verwaltung ist noch nicht eingerichtet.'
            : 'Verbindungsfehler. Bitte später erneut.'
    );
  }

  return (
    <section className="relative min-h-screen bg-black text-white flex items-center justify-center px-6 py-20 overflow-hidden">
      <div
        className={`relative w-full max-w-sm rounded-3xl border border-white/15 bg-white/[0.04] backdrop-blur-md shadow-2xl p-8 ${
          shake ? 'urra-admin-shake' : ''
        }`}
      >
        <div className="flex justify-center mb-5">
          <span className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-white/10 border border-white/15 text-white">
            <Lock size={24} strokeWidth={1.5} />
          </span>
        </div>
        <p className="text-white/55 text-xs tracking-[0.3em] uppercase text-center mb-2">
          {brand.shortName}
        </p>
        <h1 className="hero-title text-white text-2xl font-medium text-center mb-2">
          Verwaltung
        </h1>
        <p className="text-white/70 text-sm leading-relaxed text-center mb-6">
          Passwort eingeben, um die Anfragen zu verwalten.
        </p>
        <input
          type="password"
          value={pw}
          autoComplete="current-password"
          aria-label="Passwort"
          disabled={busy}
          onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && go()}
          placeholder="••••••••"
          className="w-full rounded-xl bg-neutral-900/80 border border-white/15 px-4 py-3 text-white text-sm md:text-base mb-3 transition-colors disabled:opacity-60 focus-ring"
        />
        <button
          onClick={go}
          disabled={busy}
          className="w-full bg-white text-black rounded-full py-3 text-sm font-medium hover:bg-neutral-200 disabled:opacity-60 transition-colors focus-ring"
        >
          {busy ? 'Prüfe …' : 'Anmelden'}
        </button>
        <p
          role="status"
          aria-live="polite"
          className="text-xs mt-3 min-h-[1.2em] text-center text-white/55"
        >
          {msg}
        </p>
      </div>

      <style>{`
        @keyframes urraAdminShake {
          10%, 90% { transform: translateX(-2px); }
          20%, 80% { transform: translateX(4px); }
          30%, 50%, 70% { transform: translateX(-8px); }
          40%, 60% { transform: translateX(8px); }
        }
        .urra-admin-shake { animation: urraAdminShake 500ms both; }
        @media (prefers-reduced-motion: reduce) {
          .urra-admin-shake { animation: none !important; }
        }
      `}</style>
    </section>
  );
}
