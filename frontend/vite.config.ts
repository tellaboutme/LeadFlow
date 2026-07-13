/// <reference types="vitest/config" />
import path from 'node:path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

// https://vite.dev/config/
import { fileURLToPath } from 'node:url';
import { storybookTest } from '@storybook/addon-vitest/vitest-plugin';
import { playwright } from '@vitest/browser-playwright';
const dirname = typeof __dirname !== 'undefined' ? __dirname : path.dirname(fileURLToPath(import.meta.url));

// More info at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon
export default defineConfig({
  envDir: '../',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },
  server: {
    // Proxy /api to the backend so the browser makes a same-origin request in
    // dev. This avoids CORS entirely regardless of whether the app is opened at
    // localhost:5173 or 127.0.0.1:5173.
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  preview: {
    // Same same-origin proxy for `vite preview` (the production build served
    // locally), used by Playwright E2E and Lighthouse CI. E2E points this at
    // a dedicated backend port (see playwright.config.ts) so it never shares
    // state with a developer's own `npm run dev` + dev-DB backend on 8000.
    proxy: {
      '/api': {
        target: `http://localhost:${process.env.E2E_BACKEND_PORT ?? '8000'}`,
        changeOrigin: true
      }
    }
  },
  test: {
    // Playwright E2E specs live in e2e/ and run via `npm run e2e`, not
    // Vitest — exclude them here so they aren't picked up by either project.
    exclude: ['e2e/**', 'node_modules/**'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      include: ['src/**/*.{ts,tsx}'],
      exclude: [
        'src/**/*.stories.tsx',
        'src/**/*.test.tsx',
        'src/api/schema.d.ts',
        'src/mocks/**',
        'src/test/**',
        'src/main.tsx',
        'src/vite-env.d.ts',
      ],
    },
    projects: [{
      extends: true,
      test: {
        name: 'jsdom',
        environment: 'jsdom',
        globals: true,
        setupFiles: './src/test/setup.ts',
        // Node's fetch (unlike a browser's) can't resolve a relative URL
        // against a document base, so it needs an absolute stub origin here.
        // MSW handlers match this via their `*` origin wildcard regardless.
        env: { VITE_API_BASE_URL: 'http://localhost' },
        // The default 5s can be too tight for async UI assertions when the
        // full suite runs under heavy parallel load (many files/CPU
        // contention); the underlying logic resolves quickly on its own.
        testTimeout: 15000,
      }
    }, {
      extends: true,
      plugins: [
      // The plugin will run tests for the stories defined in your Storybook config
      // See options at: https://storybook.js.org/docs/next/writing-tests/integrations/vitest-addon#storybooktest
      storybookTest({
        configDir: path.join(dirname, '.storybook')
      })],
      test: {
        name: 'storybook',
        browser: {
          enabled: true,
          headless: true,
          provider: playwright({}),
          instances: [{
            browser: 'chromium'
          }]
        }
      }
    }]
  }
});