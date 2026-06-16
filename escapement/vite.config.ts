/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// The game is a standalone Vite app. base is relative so the built bundle can be
// dropped into the parent site under /escapement without rewriting asset URLs.
export default defineConfig({
  base: './',
  plugins: [react()],
  // Prevent Vite from walking up into the parent Next.js site's PostCSS config.
  css: { postcss: {} },
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
