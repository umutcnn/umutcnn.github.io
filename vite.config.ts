/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// Deploy target: https://umutcnn.github.io/ (GitHub Pages user site → base "/").
// Override with VITE_BASE for a project-page or preview deployment.
const base = process.env.VITE_BASE ?? '/';

export default defineConfig({
  base,
  plugins: [react(), tailwindcss()],
  build: {
    target: 'es2022',
    cssCodeSplit: true,
    sourcemap: false,
    assetsInlineLimit: 2048,
  },
  test: {
    environment: 'jsdom',
    globals: false,
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/unit/**/*.test.{ts,tsx}', 'tests/integration/**/*.test.{ts,tsx}'],
    css: false,
    restoreMocks: true,
  },
});
