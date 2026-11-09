import { defineConfig, devices } from '@playwright/test';

// Se ejecuta solo en GitHub Actions (ver docs/SESSIONS.md).
const widths = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 } },
  { name: 'laptop-1000', viewport: { width: 1000, height: 800 } },
  { name: 'mobile-390', viewport: { width: 390, height: 844 } },
];

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: widths.map(({ name, viewport }) => ({
    name,
    use: { ...devices['Desktop Chrome'], viewport },
  })),
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env['CI'],
  },
});
