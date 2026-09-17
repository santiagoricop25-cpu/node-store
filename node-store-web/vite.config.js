import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Config de Vite para node-store-web.
// VITE_API_URL apunta al backend (node-store-api) — en producción es https://api.ricops.com
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
