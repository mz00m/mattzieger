/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The game is a standalone Vite app served by the parent site under /escapement.
// base is the absolute mount path so asset URLs resolve correctly no matter how
// the page is reached — /escapement, /escapement/, or /escapement/index.html.
// (A relative './' base 404s the assets when the rewrite serves /escapement with
// no trailing slash, which renders as a white screen.)
export default defineConfig({
  base: '/escapement/',
  plugins: [react()],
  // Prevent Vite from walking up into the parent Next.js site's PostCSS config.
  css: { postcss: {} },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
