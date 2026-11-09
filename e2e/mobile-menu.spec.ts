// H2.2 · Menú móvil (DESIGN §3.9, §6). Solo en el proyecto de 390 px.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  test.skip(page.viewportSize()!.width > 820, 'solo celular');
  await page.goto('/');
});

test('una sola fila: logo, "unirme" y botón de menú; nav de escritorio oculto', async ({ page }) => {
  const tops = await Promise.all(
    ['.pb-hdr .pb-logo', '.pb-hdr .pb-join', '.pb-hdr .pb-menu-btn'].map(async (s) => {
      const b = (await page.locator(s).boundingBox())!;
      return b.y + b.height / 2;
    }),
  );
  for (const t of tops) expect(Math.abs(t - tops[0]!)).toBeLessThanOrEqual(1);
  await expect(page.locator('.pb-hdr nav.pb-nav')).toBeHidden();
});

test('abrir el menú muestra la hoja con 4 enlaces, accesible', async ({ page }) => {
  const btn = page.locator('.pb-menu-btn');
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
  await btn.click();
  const dialog = page.getByRole('dialog');
  await expect(dialog).toBeVisible();
  await expect(dialog).toHaveAttribute('aria-modal', 'true');
  await expect(dialog.locator('.pb-sheet-nav a')).toHaveCount(4);
  await expect(btn).toHaveAttribute('aria-expanded', 'true');
  const results = await new AxeBuilder({ page }).include('.pb-sheet').analyze();
  expect(results.violations).toEqual([]);
});

test('Escape cierra y devuelve el foco; el foco queda atrapado mientras está abierto', async ({ page }) => {
  const btn = page.locator('.pb-menu-btn');
  await btn.click();
  for (let i = 0; i < 8; i++) {
    await page.keyboard.press('Tab');
    expect(await page.evaluate(() => !!document.activeElement?.closest('.pb-sheet'))).toBe(true);
  }
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(btn).toBeFocused();
  await expect(btn).toHaveAttribute('aria-expanded', 'false');
});

test('elegir "02 eventos" navega y la hoja queda cerrada', async ({ page }) => {
  await page.locator('.pb-menu-btn').click();
  await page.getByRole('dialog').getByRole('link', { name: /eventos/ }).click();
  await expect(page).toHaveURL(/\/eventos\/$/);
  await expect(page.getByRole('dialog')).toBeHidden();
  await expect(page.locator('.pb-menu-btn')).toHaveAttribute('aria-expanded', 'false');
});
