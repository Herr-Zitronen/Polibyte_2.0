import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test('Inicio no tiene violaciones de accesibilidad (axe)', async ({ page }, testInfo) => {
  await page.goto('/');
  const results = await new AxeBuilder({ page }).analyze();
  await page.screenshot({ path: testInfo.outputPath('inicio.png'), fullPage: true });
  expect(results.violations).toEqual([]);
});
