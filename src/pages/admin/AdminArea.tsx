import { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AdminProvider, useAdmin } from '../../lib/admin';
import { isAdminConfigured } from '../../lib/admin-config';
import { AdminLoginForm } from './AdminLoginForm';
import { AdminDashboard } from './AdminDashboard';
import { AdminInbox } from './AdminInbox';
import { AdminJobs } from './AdminJobs';
import { AdminMedia } from './AdminMedia';

/**
 * Der komplette Verwaltungsbereich unter `/admin`. Bewusst AUSSERHALB des
 * öffentlichen Layouts (kein Navbar, kein Footer, kein Scroll-Hintergrund) und
 * per Meta auf noindex — der Bereich soll nicht in Suchmaschinen auftauchen.
 */
export function AdminArea() {
  // noindex nur solange dieser Teilbaum montiert ist; beim Verlassen der Route
  // wieder auf den öffentlichen Standard (index) zurücksetzen.
  useEffect(() => {
    const meta = document.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const prev = meta?.getAttribute('content') ?? null;
    if (meta) meta.setAttribute('content', 'noindex, nofollow');
    return () => {
      if (meta) meta.setAttribute('content', prev ?? 'index, follow');
    };
  }, []);

  return (
    <AdminProvider>
      <div className="min-h-screen bg-black text-white">
        <AdminRoutes />
      </div>
    </AdminProvider>
  );
}

function AdminRoutes() {
  const { authed } = useAdmin();

  if (!isAdminConfigured) {
    return (
      <div className="min-h-screen grid place-items-center px-6 text-center">
        <p className="text-white/70 max-w-sm">
          Die Verwaltung ist noch nicht konfiguriert. Es fehlen die
          Supabase-Zugangsdaten im Build.
        </p>
      </div>
    );
  }

  if (!authed) return <AdminLoginForm />;

  return (
    <Routes>
      <Route path="/" element={<AdminDashboard />} />
      <Route path="/anfragen" element={<AdminInbox />} />
      <Route path="/bewerbungen" element={<AdminJobs />} />
      <Route path="/mediathek" element={<AdminMedia />} />
      {/* Unbekannte Unterpfade zurück auf die Übersicht. */}
      <Route path="*" element={<Navigate to="/admin" replace />} />
    </Routes>
  );
}
