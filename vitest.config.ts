import { defineConfig } from 'vitest/config';

// Solo pruebas unitarias (rápidas). Las E2E de /e2e las corre Playwright en CI.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'tests/**/*.test.ts'],
  },
});
