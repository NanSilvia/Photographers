import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom', // for React tests
    globals: true,        // to use globals like 'describe', 'it', etc.
    setupFiles: './vitest.setup.ts', // optional setup file
  },
});
