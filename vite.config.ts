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
  },
});
