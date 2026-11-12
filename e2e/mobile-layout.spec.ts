// PR B · Celular: ninguna página desborda a lo ancho a 390 px y las áreas táctiles miden ≥ 44 px.
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/eventos/', '/eventos/kiroween-2026/', '/eventos/imagine-cup-2027/', '/equipo/', '/unirme/', '/no-existe/'];

test.describe('celular (390)', () => {
  test.beforeEach(({ page }) => test.skip(page.viewportSize()!.width !== 390, 'solo 390'));

  for (const p of PAGES) {
    test(`sin scroll horizontal: ${p}`, async ({ page }) => {
      await page.goto(p);
      const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
      expect(over).toBeLessThanOrEqual(0);
    });
  }

  test('sin hover: (hover: hover) no aplica y el puntero es grueso', async ({ page }) => {
    await page.goto('/');
    expect(await page.evaluate(() => matchMedia('(hover: hover)').matches)).toBe(false);
    expect(await page.evaluate(() => matchMedia('(pointer: coarse)').matches)).toBe(true);
  });

  test('áreas táctiles de al menos 44 px', async ({ page }) => {
    for (const [p, sel] of [
      ['/', '.pb-hdr .pb-b1.sm'],
      ['/eventos/', '#calendario .pb-tab'],
      ['/eventos/', '#calendario .pb-b2.sm'],
      ['/', '.pb-foot-links a'],
    ] as const) {
      await page.goto(p);
      for (const el of await page.locator(sel).all()) {
        if (!(await el.isVisible())) continue;
        const h = (await el.boundingBox())!.height;
        expect(h, `${p} ${sel}`).toBeGreaterThanOrEqual(44);
      }
    }
  });
});
