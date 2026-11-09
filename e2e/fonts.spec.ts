// H1.1 · Solo se piden las 3 familias de DESIGN §2.2, con display=swap.
import { expect, test } from '@playwright/test';

test('Inicio pide solo JetBrains Mono, Silkscreen e Instrument Sans (subconjunto PoliByte)', async ({ page }) => {
  const cssUrls: string[] = [];
  page.on('request', (r) => {
    if (r.url().startsWith('https://fonts.googleapis.com/css')) cssUrls.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  const families = cssUrls.flatMap((u) => new URL(u).searchParams.getAll('family')).map((f) => f.split(':')[0]);
  expect(families.sort()).toEqual(['Instrument Sans', 'JetBrains Mono', 'Silkscreen']);

  const byFamily = (name: string) => cssUrls.find((u) => new URL(u).searchParams.getAll('family').some((f) => f.startsWith(name)));
  expect(new URL(byFamily('Instrument Sans')!).searchParams.get('text')).toBe('PoliByte');
  expect(byFamily('JetBrains Mono')).toContain('wght@300..800');
  expect(byFamily('Silkscreen')).toContain('wght@400;700');
  for (const u of cssUrls) expect(new URL(u).searchParams.get('display'), u).toBe('swap');
});
