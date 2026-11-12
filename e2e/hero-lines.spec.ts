// F7 (WOR-93) · El marco de líneas del hero y el vidrio acanalado siguen al cursor (fx.ts + lineOffset).
import { expect, test, type Page } from '@playwright/test';

const lines = (page: Page) => page.locator('.pb-hero__lines.pb-mouse');
const inlineTransform = (page: Page, sel: string) =>
  page.locator(sel).first().evaluate((el) => (el as HTMLElement).style.transform);

test.describe('con cursor', () => {
  test.beforeEach(async ({ page }) => {
    test.skip(page.viewportSize()!.width <= 820, 'solo con cursor (escritorio)');
    await page.goto('/');
  });

  test('sin puntero el marco queda en reposo', async ({ page }) => {
    await expect(lines(page)).toHaveCount(1);
    expect(await inlineTransform(page, '.pb-hero__lines')).toBe('');
  });

  test('con el puntero en la esquina superior izquierda el marco se corre +8 / +6 px', async ({ page }) => {
    await page.mouse.move(400, 300);
    await page.mouse.move(0, 0);
    await expect.poll(() => inlineTransform(page, '.pb-hero__lines')).toBe('translate3d(8px, 6px, 0px)');
  });

  test('el vidrio acanalado de la portada se corre en X', async ({ page }) => {
    await page.mouse.move(400, 300);
    await page.mouse.move(0, 10);
    await expect.poll(() => inlineTransform(page, '.pb-hero-s .pb-reed')).toBe('translate3d(3.5px, 0px, 0px)');
  });

  test('solo se anima transform (transición de 0.9 s)', async ({ page }) => {
    await expect(lines(page)).toHaveCSS('transition-property', 'transform');
    await expect(lines(page)).toHaveCSS('transition-duration', '0.9s');
  });
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('el marco no se mueve', async ({ page }) => {
    test.skip(page.viewportSize()!.width <= 820, 'solo con cursor');
    await page.goto('/');
    await page.mouse.move(400, 300);
    await page.mouse.move(0, 0);
    await page.waitForTimeout(200);
    expect(await inlineTransform(page, '.pb-hero__lines')).toBe('');
    expect(await inlineTransform(page, '.pb-reed')).toBe('');
  });
});

test('en táctil no se registra el seguimiento', async ({ page }) => {
  test.skip(page.viewportSize()!.width > 820, 'solo celular');
  await page.goto('/');
  await page.touchscreen.tap(10, 400);
  await page.waitForTimeout(200);
  expect(await inlineTransform(page, '.pb-hero__lines')).toBe('');
});
