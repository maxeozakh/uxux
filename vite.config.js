import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  // GitHub Pages serves project sites from /repo-name/
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: { port: 5173, host: true, open: true },
});
