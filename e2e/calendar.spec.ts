// H5.3 · Calendario con filtros (DESIGN §5). Fixtures en /lab/calendar*.
import { expect, test } from '@playwright/test';

test('filtros Todos / Del club / Competencias en un grupo con aria-pressed', async ({ page }) => {
  await page.goto('/lab/calendar/');
  const group = page.locator('#calendario').getByRole('group', { name: 'Filtrar por tipo' });
  await expect(group.getByRole('button')).toHaveText(['Todos', 'Del club', 'Competencias']);
  await expect(group.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'true');
  await expect(group.getByRole('button', { name: 'Competencias' })).toHaveAttribute('aria-pressed', 'false');
});

test('clic en "Competencias": solo filas de competencia', async ({ page }) => {
  await page.goto('/lab/calendar/');
  const cal = page.locator('#calendario');
  await cal.getByRole('button', { name: 'Competencias' }).click();
  await expect(cal.getByRole('button', { name: 'Competencias' })).toHaveAttribute('aria-pressed', 'true');
  await expect(cal.getByRole('button', { name: 'Todos' })).toHaveAttribute('aria-pressed', 'false');
  const visible = cal.locator('.pb-urow:visible');
  await expect(visible).not.toHaveCount(0);
  for (const r of await visible.all()) await expect(r).toHaveAttribute('data-type', 'competition');
  await expect(cal.locator('.pb-cal-empty')).toBeHidden();
  await cal.getByRole('button', { name: 'Todos' }).click();
  await expect(cal.locator('.pb-urow:visible')).toHaveCount(await cal.locator('.pb-urow').count());
});

test('sin competencias: "Competencias" muestra el mensaje vacío', async ({ page }) => {
  await page.goto('/lab/calendar-nocomp/');
  const cal = page.locator('#calendario');
  await expect(cal.locator('.pb-cal-empty')).toBeHidden();
  await cal.getByRole('button', { name: 'Competencias' }).click();
  await expect(cal.locator('.pb-urow:visible')).toHaveCount(0);
  await expect(cal.locator('.pb-cal-empty')).toBeVisible();
  await expect(cal.locator('.pb-cal-empty')).toContainText('No hay eventos de este tipo');
});

test.describe('sin JS', () => {
  test.use({ javaScriptEnabled: false });
  test('se ven todos los eventos', async ({ page }) => {
    await page.goto('/lab/calendar/');
    const rows = page.locator('#calendario .pb-urow');
    await expect(rows).toHaveCount(4);
    for (const r of await rows.all()) await expect(r).toBeVisible();
  });
});

const columns = (page: import('@playwright/test').Page) =>
  page.locator('#calendario .pb-urow').first().evaluate((el) => getComputedStyle(el).gridTemplateColumns.split(' ').length);

test('a 1000 px la fila sigue en columnas; a 960 se apila', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto('/lab/calendar/');
  expect(await columns(page)).toBe(4);
  await page.setViewportSize({ width: 960, height: 900 });
  expect(await columns(page)).toBe(2);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(await columns(page)).toBe(2);
});

test('en /eventos/ el calendario va antes del archivo', async ({ page }) => {
  await page.goto('/eventos/');
  const ids = await page.locator('main > section[id]').evaluateAll((els) => els.map((e) => e.id));
  expect(ids.indexOf('calendario')).toBeGreaterThanOrEqual(0);
  expect(ids.indexOf('calendario')).toBeLessThan(ids.indexOf('archivo'));
});
