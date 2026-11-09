// H1.5 · Fondos de vidrio (DESIGN §3.8).
import { expect, test } from '@playwright/test';

const LAYERS = ['pb-par far', 'pb-par near', 'pb-sheen', 'pb-reed', 'pb-fade', 'pb-grain'];

test('cada sección con imagen tiene una sola capa de grano, encima del contenido', async ({ page }) => {
  await page.goto('/lab/glass/');
  const sections = page.locator('section[data-bg]');
  expect(await sections.count()).toBeGreaterThanOrEqual(2);
  for (const s of await sections.all()) {
    await expect(s.locator('.pb-grain')).toHaveCount(1);
    const grain = s.locator('.pb-grain');
    await expect(grain).toHaveAttribute('aria-hidden', 'true');
    await expect(grain).toHaveCSS('pointer-events', 'none');
    const zGrain = Number(await grain.evaluate((el) => getComputedStyle(el).zIndex));
    const zContent = Number(await s.locator('.pb-content').evaluate((el) => getComputedStyle(el).zIndex));
    expect(zGrain).toBeGreaterThan(zContent);
  }
});

test('orden de capas: imagen → niebla → sheen → reed → fade → grano', async ({ page }) => {
  await page.goto('/lab/glass/');
  for (const s of await page.locator('section[data-bg]').all()) {
    const classes = await s.locator('.pb-bg > *').evaluateAll((els) => els.map((e) => e.className));
    const order = LAYERS.map((l) => classes.findIndex((c) => l.split(' ').every((part) => c.split(/\s+/).includes(part))));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  }
});
