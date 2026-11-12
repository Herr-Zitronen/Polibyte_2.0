// H4.4 · Próximos eventos (DESIGN §3.6). El laboratorio usa un fixture de 6 próximos.
import { expect, test } from '@playwright/test';

const LAB = '/lab/upcoming/';

test('con 6 próximos → 4 filas ordenadas por fecha, con tipo, fecha y estado', async ({ page }) => {
  await page.goto(LAB);
  const rows = page.locator('#calendario .pb-row');
  await expect(rows).toHaveCount(4);
  await expect(rows.locator('.pb-rname')).toHaveText(['Fixture A', 'Fixture B', 'Fixture C con un nombre bastante largo', 'Fixture D']);
  for (const row of await rows.all()) {
    await expect(row.locator('.pb-type')).not.toBeEmpty();
    await expect(row.locator('.pb-mdate')).not.toBeEmpty();
    await expect(row.locator('.pb-st')).toBeVisible();
  }
});

for (const how of ['click', 'Enter'] as const) {
  test(`${how} en la fila 2 → el detalle muestra su título (aria-live)`, async ({ page }) => {
    await page.goto(LAB);
    const rows = page.locator('#calendario .pb-row');
    const detail = page.locator('#calendario [aria-live="polite"]');
    await expect(detail).toHaveCount(1);
    await expect(rows.nth(0)).toHaveAttribute('aria-pressed', 'true');
    if (how === 'click') await rows.nth(1).click();
    else {
      await rows.nth(1).focus();
      await page.keyboard.press('Enter');
    }
    await expect(detail.locator('.pb-dname:visible')).toHaveText('Fixture B');
    await expect(rows.nth(1)).toHaveAttribute('aria-pressed', 'true');
    await expect(rows.nth(0)).toHaveAttribute('aria-pressed', 'false');
  });
}

test('en Inicio la sección existe y enlaza al calendario', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('#calendario')).toBeVisible();
  await expect(page.locator('#calendario').getByRole('link', { name: 'Calendario completo' }).first()).toHaveAttribute('href', '/eventos/#calendario');
});

test('961–1200 px: columnas sin encimarse y la fecha bajo el nombre', async ({ page }) => {
  await page.setViewportSize({ width: 1000, height: 900 });
  await page.goto(LAB);
  const aside = (await page.locator('#calendario .pb-aside').boundingBox())!;
  const right = (await page.locator('#calendario .pb-calR').boundingBox())!;
  expect(aside.x + aside.width).toBeLessThanOrEqual(right.x + 0.5);
  for (const row of await page.locator('#calendario .pb-row').all()) {
    const name = (await row.locator('.pb-rname').boundingBox())!;
    const date = (await row.locator('.pb-mdate').boundingBox())!;
    expect(date.y).toBeGreaterThan(name.y + name.height - 0.5);
    const cells = [await row.locator('.pb-num').boundingBox(), await row.locator('.pb-name').boundingBox(), await row.locator('.pb-st').boundingBox()];
    for (let i = 1; i < cells.length; i++) expect(cells[i]!.x).toBeGreaterThanOrEqual(cells[i - 1]!.x + cells[i - 1]!.width - 0.5);
  }
});

test('captura de la sección', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(LAB);
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator('#calendario')).toHaveScreenshot('upcoming.png');
});
