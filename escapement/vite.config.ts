/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The game ships as a static sub-app served under /escapement on the parent site,
// so the production build uses an absolute base of '/escapement/'. That makes
// asset URLs work whether the page is hit at '/escapement' or '/escapement/'
// (a relative base breaks on the no-trailing-slash form). Local dev/preview stay
// at '/' so `npm run dev` opens the bench at the server root.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/escapement/' : '/',
  plugins: [react()],
  // Prevent Vite from walking up into the parent Next.js site's PostCSS config.
  css: { postcss: {} },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
}));
