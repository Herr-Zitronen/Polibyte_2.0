// H1.3 · Etiquetas y estados (DESIGN §3.2).
import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.goto('/lab/tags/');
  await page.evaluate(() => document.fonts.ready);
});

const textCenterX = (el: Element) => {
  const range = document.createRange();
  const textNode = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent?.trim());
  if (!textNode) throw new Error('sin texto');
  range.selectNodeContents(textNode);
  const r = range.getBoundingClientRect();
  return r.left + r.width / 2;
};

test('el texto del estado queda centrado, con o sin punto', async ({ page }) => {
  const statuses = page.locator('.pb-st');
  expect(await statuses.count()).toBeGreaterThanOrEqual(3);
  expect(await page.locator('.pb-st .pb-dot').count()).toBeGreaterThan(0);
  for (const st of await statuses.all()) {
    const box = (await st.boundingBox())!;
    const cx = await st.evaluate(textCenterX);
    expect(Math.abs(cx - (box.x + box.width / 2))).toBeLessThanOrEqual(1);
  }
});

test('ancho mínimo 136px', async ({ page }) => {
  for (const st of await page.locator('.pb-st').all()) expect((await st.boundingBox())!.width).toBeGreaterThanOrEqual(136);
});

test('la línea del par conectado se oculta en ≤520 y mide 28px en ancho mayor', async ({ page }) => {
  const line = page.locator('.pb-pair__line').first();
  if (page.viewportSize()!.width <= 520) {
    await expect(line).toBeHidden();
  } else {
    await expect(line).toBeVisible();
    expect((await line.boundingBox())!.width).toBeCloseTo(28, 0);
  }
});

test('colores y bordes de cada estado', async ({ page }) => {
  const upcoming = page.locator('.pb-st--upcoming').first();
  await expect(upcoming).toHaveCSS('background-color', 'rgb(242, 224, 160)');
  await expect(upcoming).toHaveCSS('color', 'rgb(14, 26, 74)');
  await expect(upcoming).toContainText('Próximo');
  await expect(page.locator('.pb-st--tbd').first()).toHaveCSS('border-top-style', 'dashed');
  await expect(page.locator('.pb-st--tbd').first()).toContainText('Por confirmar');
  await expect(page.locator('.pb-st--past').first()).toHaveCSS('border-top-style', 'solid');
  await expect(page.locator('.pb-st--past').first()).toContainText('Realizado');
});

test('captura del laboratorio de etiquetas', async ({ page }) => {
  await expect(page).toHaveScreenshot('tags.png', { fullPage: true });
});
