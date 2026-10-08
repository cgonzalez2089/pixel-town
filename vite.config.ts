/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages serves the site from https://<user>.github.io/pixel-town/.
// Dev and preview use the same sub-path, so asset path bugs show up locally.
export default defineConfig({
  base: '/pixel-town/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600, // Phaser alone is ~1.2 MB minified
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
});
