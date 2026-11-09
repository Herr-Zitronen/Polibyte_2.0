// H5.4 · Archivo por año (DESIGN §5). Fixtures en /lab/archive.
import { expect, test } from '@playwright/test';

test('encabezados de año en orden descendente', async ({ page }) => {
  await page.goto('/lab/archive/');
  const a = page.locator('#archivo');
  await expect(a.getByRole('heading', { level: 2, name: 'Archivo' })).toBeVisible();
  await expect(a.getByRole('heading', { level: 3 })).toHaveText(['2026', '2025']);
});

test('"Ver proyectos" solo en eventos con vitrina publicada', async ({ page }) => {
  await page.goto('/lab/archive/');
  const btns = page.locator('#archivo').getByRole('link', { name: 'Ver proyectos' });
  await expect(btns).toHaveCount(1);
  await expect(page.locator('#archivo .pb-arow', { hasText: 'Hackathon ESPOCH' }).getByRole('link', { name: 'Ver proyectos' })).toBeVisible();
});

test('línea viva en cada año', async ({ page }) => {
  await page.goto('/lab/archive/');
  const years = page.locator('#archivo .pb-year');
  await expect(years).toHaveCount(2);
  for (const y of await years.all()) await expect(y.locator(':scope > .pb-hl')).toHaveCount(1);
});

test('la página /eventos/ incluye el archivo', async ({ page }) => {
  await page.goto('/eventos/');
  await expect(page.locator('#archivo .pb-year').first()).toBeVisible();
});
