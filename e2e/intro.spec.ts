// Pantalla de entrada de Inicio (perf/fluidez-real). Con Playwright solo aparece si se pide con ?intro.
import { expect, test } from '@playwright/test';

const on = (page: import('@playwright/test').Page) => page.evaluate(() => document.documentElement.classList.contains('pb-intro-on'));

test('aparece en la primera visita, dura menos de 2 s y sale del DOM', async ({ page }) => {
  await page.goto('/?intro', { waitUntil: 'commit' });
  await expect(page.locator('.pb-intro')).toBeVisible();
  const t0 = Date.now();
  await expect(page.locator('.pb-intro')).toHaveCount(0, { timeout: 4000 });
  expect(Date.now() - t0).toBeLessThanOrEqual(2300);
  expect(await on(page)).toBe(false);
  // .pb-hdr mide 0 px de alto a propósito (fixed, height: 0): toBeVisible nunca pasaría. Lo que la entrada
  // oculta es su visibility.
  await expect(page.locator('.pb-hdr')).toHaveCSS('visibility', 'visible');
});

test('debajo, el titular está pintado en su sitio desde el principio (LCP)', async ({ page }) => {
  await page.goto('/?intro', { waitUntil: 'commit' });
  await expect(page.locator('.pb-intro')).toBeVisible();
  const ch = await page.evaluate(() => {
    const cs = getComputedStyle(document.querySelector('.pb-ch')!);
    return [cs.transform, cs.animationName];
  });
  expect(ch).toEqual(['none', 'none']);
});

test('al retirarse arranca el decodificado y el titular termina fijo', async ({ page }) => {
  await page.goto('/?intro');
  await expect(page.locator('.pb-intro')).toHaveCount(0, { timeout: 4000 });
  await page.waitForSelector('[data-decode][data-decoded]', { timeout: 8000 });
  await page.waitForSelector('.pb-hero[data-drawn]', { timeout: 8000 });
});

test('se salta con una tecla', async ({ page }) => {
  await page.goto('/?intro', { waitUntil: 'commit' });
  await expect(page.locator('.pb-intro')).toBeVisible();
  await page.keyboard.press('Space');
  await expect(page.locator('.pb-intro')).toHaveCount(0, { timeout: 900 });
});

test('una vez por visita: al volver a Inicio ya no aparece', async ({ page }) => {
  await page.goto('/?intro');
  await expect(page.locator('.pb-intro')).toHaveCount(0, { timeout: 4000 });
  await page.goto('/eventos/');
  await page.goto('/?intro', { waitUntil: 'commit' });
  expect(await on(page)).toBe(false);
});

test('si la visita empieza en otra página, Inicio no la muestra después', async ({ page }) => {
  await page.goto('/eventos/');
  await page.goto('/?intro', { waitUntil: 'commit' });
  expect(await on(page)).toBe(false);
});

test('sin ?intro las demás pruebas no la ven', async ({ page }) => {
  await page.goto('/', { waitUntil: 'commit' });
  expect(await on(page)).toBe(false);
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('no aparece', async ({ page }) => {
    await page.goto('/?intro', { waitUntil: 'commit' });
    expect(await on(page)).toBe(false);
    await expect(page.locator('.pb-intro')).toBeHidden();
  });
});
