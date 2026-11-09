// H1.2 · Botones (DESIGN §3.1): geometría exacta en vez de solo capturas.
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/lab/buttons/');
  await page.evaluate(() => document.fonts.ready);
});

test('la caja del primario nunca sobresale de su marco (textos largos)', async ({ page }) => {
  const buttons = page.locator('.pb-b1');
  expect(await buttons.count()).toBeGreaterThan(2);
  for (const b of await buttons.all()) {
    const outer = (await b.boundingBox())!;
    const inner = (await b.locator('.pb-b1__box').boundingBox())!;
    expect(inner.x).toBeGreaterThanOrEqual(outer.x);
    expect(inner.y).toBeGreaterThanOrEqual(outer.y);
    expect(inner.x + inner.width).toBeLessThanOrEqual(outer.x + outer.width + 0.5);
    expect(inner.y + inner.height).toBeLessThanOrEqual(outer.y + outer.height + 0.5);
  }
});

test('primario y secundario lado a lado tienen la misma altura', async ({ page }) => {
  for (const pair of await page.locator('[data-pair]').all()) {
    const h1 = (await pair.locator('.pb-b1').boundingBox())!.height;
    const h2 = (await pair.locator('.pb-b2').boundingBox())!.height;
    expect(Math.abs(h1 - h2)).toBeLessThanOrEqual(0.5);
  }
});

test('sobre sección clara el primario se invierte', async ({ page }) => {
  const box = page.locator('.pb-on-light .pb-b1__box').first();
  await expect(box).toHaveCSS('background-color', 'rgb(19, 32, 90)');
});

test('nunca a ancho completo en escritorio (≥821px)', async ({ page }) => {
  const vw = page.viewportSize()!.width;
  test.skip(vw < 821, 'solo escritorio');
  const container = (await page.locator('.pb-container').first().boundingBox())!;
  for (const b of await page.locator('.pb-b1, .pb-b2').all()) {
    expect((await b.boundingBox())!.width).toBeLessThan(container.width - 64);
  }
});

test('captura del laboratorio de botones', async ({ page }) => {
  await expect(page).toHaveScreenshot('buttons.png', { fullPage: true });
});
