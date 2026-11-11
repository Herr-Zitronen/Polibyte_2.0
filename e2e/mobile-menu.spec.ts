// H2.2 · Menú móvil (DESIGN §3.9, §6). Solo en el proyecto de 390 px.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Espera a que terminen las entradas de la barra (p. ej. «unirme» entra con pb-in: 0.54 s + 0.7 s). Medir antes
// da posiciones desplazadas y colores a medio fundido (axe veía contraste 1.1:1 en «04 unirme»).
const barSettled = (page: import('@playwright/test').Page) =>
  page.locator('.pb-hdr').evaluate((el) =>
    Promise.all(
      el
        .getAnimations({ subtree: true })
        .filter((a) => a.effect?.getTiming().iterations !== Infinity)
        .map((a) => a.finished),
    ),
  );

test.beforeEach(async ({ page }) => {
  test.skip(page.viewportSize()!.width > 820, 'solo celular');
  await page.goto('/');
});

test('una sola fila: logo, "unirme" y botón de menú; nav de escritorio oculto', async ({ page }) => {
  await barSettled(page);
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
  // Tres enlaces; "unirme" no se repite en la lista: va solo en el botón "Quiero unirme" (PR B).
  await expect(dialog.locator('.pb-sheet-nav a')).toHaveCount(3);
  await expect(dialog.locator('.pb-sheet-nav a[href="/unirme/"]')).toHaveCount(0);
  await expect(dialog.getByRole('link', { name: 'Quiero unirme' })).toHaveAttribute('href', '/unirme/');
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

// F13 (WOR-99) · La hoja no desenfoca el fondo: fondo sólido rgba(15, 26, 77, 0.94) + su grano.
test('la hoja abierta no usa backdrop-filter y su fondo es casi opaco', async ({ page }) => {
  await page.locator('.pb-menu-btn').click();
  const sheet = page.locator('.pb-sheet');
  await expect(sheet).toBeVisible();
  await expect(sheet).toHaveCSS('backdrop-filter', 'none');
  await expect(sheet).toHaveCSS('background-color', 'rgba(15, 26, 77, 0.94)');
  await expect(sheet.locator('.pb-grain')).toHaveCount(1);
  await expect(sheet).toHaveScreenshot('menu-abierto-390.png');
});
