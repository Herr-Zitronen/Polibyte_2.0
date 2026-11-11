// H1.1 · Solo las 3 familias de DESIGN §2.2, con swap y servidas desde el propio dominio (H4.1).
import { expect, test } from '@playwright/test';

test('Inicio carga JetBrains Mono, Silkscreen e Instrument Sans sin pedir nada a terceros', async ({ page, baseURL }) => {
  const external: string[] = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'font' || r.url().includes('fonts.g')) {
      if (!r.url().startsWith(baseURL!)) external.push(r.url());
    }
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(external).toEqual([]);

  // 'JetBrains Mono Fallback' es un respaldo local (local('Courier New')…) con métricas ajustadas (WOR-101): no se descarga.
  const faces = await page.evaluate(() =>
    [...document.fonts].map((f) => ({ family: f.family.replace(/['"]/g, ''), display: f.display })).filter((f) => f.family !== 'JetBrains Mono Fallback'),
  );
  const families = [...new Set(faces.map((f) => f.family))].sort();
  expect(families).toEqual(['Instrument Sans', 'JetBrains Mono Variable', 'Silkscreen']);
  for (const f of faces) expect(f.display, f.family).toBe('swap');
});
