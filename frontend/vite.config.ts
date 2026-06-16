import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5173,
    strictPort: false,
    // Listen on all interfaces + allow tunnel hostnames (ngrok / cloudflared /
    // VS Code dev tunnels) so the dev server can be exposed over the internet.
    host: true,
    allowedHosts: true,
    // Proxy API calls to the backend so the whole app (UI + API) is reachable
    // through a SINGLE origin / tunnel — no CORS, no cross-site cookies.
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
  },
});
