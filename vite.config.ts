import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const repoBase = process.env.GITHUB_PAGES === 'true' ? '/bauschreinerei-urra/' : '/';

export default defineConfig({
  base: repoBase,
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
    host: '127.0.0.1',
    // ACHTUNG: Diese Header gelten NUR für den Dev-Server. GitHub Pages kann
    // keine eigenen Response-Header setzen — in Produktion wirkt allein die
    // Content-Security-Policy als <meta> in index.html. Wer echte Header will
    // (X-Frame-Options, HSTS, Permissions-Policy), braucht einen Hoster mit
    // Header-Konfiguration, z. B. Cloudflare Pages mit einer `_headers`-Datei.
    headers: {
      'X-Content-Type-Options': 'nosniff',
      'X-Frame-Options': 'DENY',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
      'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    },
  },
  build: {
    sourcemap: false,
    target: 'es2020',
    // Explizit: jeder Build startet mit leerem dist/. Lokal hatten sich sonst
    // über 60 MB alter, gehashter Bundles angesammelt.
    emptyOutDir: true,
    rollupOptions: {
      output: {
        // React, Router und Supabase getrennt vom Seiten-Code: sie ändern sich
        // selten und bleiben so über Deploys hinweg im Browser-Cache.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          supabase: ['@supabase/supabase-js'],
        },
      },
    },
  },
});
