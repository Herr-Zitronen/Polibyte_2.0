// H1.5 · Fondos de vidrio (DESIGN §3.8). F12: el grano es UNA capa fija por página, no una por sección.
import { expect, test } from '@playwright/test';

const LAYERS = ['pb-par far', 'pb-par near', 'pb-sheen', 'pb-reed', 'pb-fade'];

test('una sola capa de grano por página: fija, decorativa, sobre el contenido y bajo la barra', async ({ page }) => {
  await page.goto('/lab/glass/');
  const sections = page.locator('section[data-bg]');
  expect(await sections.count()).toBeGreaterThanOrEqual(2);
  for (const s of await sections.all()) await expect(s.locator('.pb-grain')).toHaveCount(0);
  const grain = page.locator('body > .pb-grain--page');
  await expect(grain).toHaveCount(1);
  await expect(page.locator('.pb-grain:not(dialog .pb-grain)')).toHaveCount(1);
  await expect(grain).toHaveAttribute('aria-hidden', 'true');
  await expect(grain).toHaveCSS('pointer-events', 'none');
  await expect(grain).toHaveCSS('position', 'fixed');
  const zGrain = Number(await grain.evaluate((el) => getComputedStyle(el).zIndex));
  const zContent = Number(await sections.first().locator('.pb-content').evaluate((el) => getComputedStyle(el).zIndex));
  expect(zGrain).toBeGreaterThan(zContent);
  expect(zGrain).toBeLessThan(20); // la barra (.pb-hdr) va en z 20
});

test('orden de capas: imagen → niebla → sheen → reed → fade', async ({ page }) => {
  await page.goto('/lab/glass/');
  for (const s of await page.locator('section[data-bg]').all()) {
    const classes = await s.locator('.pb-bg > *').evaluateAll((els) => els.map((e) => e.className));
    const order = LAYERS.map((l) => classes.findIndex((c) => l.split(' ').every((part) => c.split(/\s+/).includes(part))));
    expect(order.every((i) => i >= 0)).toBe(true);
    expect([...order].sort((a, b) => a - b)).toEqual(order);
  }
});

test('todas las páginas tienen exactamente una capa de grano de página', async ({ page }) => {
  for (const p of ['/', '/eventos/', '/equipo/', '/unirme/']) {
    await page.goto(p);
    await expect(page.locator('.pb-grain--page'), p).toHaveCount(1);
    await expect(page.locator('main .pb-grain, footer .pb-grain, .pb-div .pb-grain'), p).toHaveCount(0);
  }
});
