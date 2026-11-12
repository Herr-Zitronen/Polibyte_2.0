import { defineConfig, devices } from '@playwright/test';

// Se ejecuta solo en GitHub Actions (ver docs/SESSIONS.md).
// PR B: mobile-390 es un celular de verdad (táctil, sin hover, puntero grueso), no un escritorio estrecho.
const widths = [
  { name: 'desktop-1440', viewport: { width: 1440, height: 900 }, touch: false },
  { name: 'laptop-1000', viewport: { width: 1000, height: 800 }, touch: false },
  { name: 'mobile-390', viewport: { width: 390, height: 844 }, touch: true },
];

export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 1 : 0,
  // Capturas base generadas en Linux (CI) y versionadas en e2e/**/*-snapshots.
  // Si falta una, CI la crea y la sube como artefacto para versionarla.
  updateSnapshots: process.env['CI'] ? 'missing' : 'none',
  expect: { toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' } },
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: widths.map(({ name, viewport, touch }) => ({
    name,
    use: { ...devices['Desktop Chrome'], viewport, ...(touch && { hasTouch: true, isMobile: true }) },
  })),
  webServer: [
    {
      command: 'npm run preview',
      url: 'http://localhost:4321',
      reuseExistingServer: !process.env['CI'],
    },
    {
      // Cloudflare en local (sin cuenta ni secretos): prueba códigos de estado reales (H9.2).
      command: 'npx wrangler dev --port 8787 --ip 127.0.0.1',
      url: 'http://localhost:8787',
      reuseExistingServer: !process.env['CI'],
      env: { WRANGLER_SEND_METRICS: 'false' },
      timeout: 120_000,
    },
  ],
});
