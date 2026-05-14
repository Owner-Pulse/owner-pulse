import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,   // exposes dev server on local network — test from phone on same WiFi
    port: 5173,
  },
});
