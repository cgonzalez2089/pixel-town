/// <reference types="vitest/config" />
import { defineConfig } from 'vite';

// GitHub Pages serves the site from https://<user>.github.io/pixel-town/,
// so production assets must be resolved relative to that sub-path.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/pixel-town/' : '/',
  build: {
    target: 'es2022',
    chunkSizeWarningLimit: 1600, // Phaser alone is ~1.2 MB minified
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts'],
  },
}));
