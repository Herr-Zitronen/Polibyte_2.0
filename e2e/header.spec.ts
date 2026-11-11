// H2.1 · Barra superior (DESIGN §3.9).
import { expect, test } from '@playwright/test';

const PAGES = ['/', '/eventos/', '/equipo/', '/unirme/'];

test.describe('escritorio', () => {
  test.beforeEach(({ page }) => test.skip(page.viewportSize()!.width <= 820, 'solo escritorio'));

  test('01–03 centrados, "unirme" a la derecha y en la misma posición en todas las páginas', async ({ page }) => {
    const positions: string[] = [];
    for (const path of PAGES) {
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      const nav = (await page.locator('.pb-hdr nav.pb-nav').boundingBox())!;
      const vw = page.viewportSize()!.width;
      expect(Math.abs(nav.x + nav.width / 2 - vw / 2), `${path} nav centrado`).toBeLessThanOrEqual(1);
      await expect(page.locator('.pb-nav a')).toHaveText([/01\s*club/, /02\s*eventos/, /03\s*equipo/]);

      const join = (await page.locator('.pb-hdr .pb-join').boundingBox())!;
      const inner = (await page.locator('.pb-bar-in').boundingBox())!;
      const padRight = Number.parseFloat(await page.locator('.pb-bar-in').evaluate((el) => getComputedStyle(el).paddingRight));
      expect(Math.abs(join.x + join.width - (inner.x + inner.width - padRight)), `${path} unirme a la derecha`).toBeLessThanOrEqual(1);
      positions.push(JSON.stringify([Math.round(nav.x), Math.round(join.x), Math.round(join.y)]));
    }
    expect(new Set(positions).size).toBe(1);
  });
});

test('la barra cambia a tema claro sobre una sección clara', async ({ page }) => {
  await page.goto('/');
  const hdr = page.locator('.pb-hdr');
  await expect(hdr).toHaveAttribute('data-theme', 'dark');
  await page.locator('section[data-theme="light"]').first().evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 10));
  await expect(hdr).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.pb-hdr .pb-join .pb-b1__box')).toHaveCSS('background-color', 'rgb(19, 32, 90)');
  await page.evaluate(() => window.scrollTo(0, 0));
  await expect(hdr).toHaveAttribute('data-theme', 'dark');
});

test('ningún ancestro del blur tiene view-transition-name', async ({ page }) => {
  await page.goto('/');
  const names = await page.locator('.pb-blur').evaluate((el) => {
    const out: string[] = [];
    // <html> lleva `view-transition-name: root` por defecto (hoja del navegador): no cuenta.
    for (let n = el.parentElement; n && n !== document.documentElement; n = n.parentElement)
      out.push(getComputedStyle(n).viewTransitionName);
    return out;
  });
  expect(names.length).toBeGreaterThan(0);
  for (const n of names) expect(n).toBe('none');
  await expect(page.locator('.pb-bar-in')).toHaveCSS('view-transition-name', 'pb-header');
});

test('la barra no empuja el contenido', async ({ page }) => {
  for (const path of PAGES) {
    await page.goto(path);
    const top = await page.evaluate(() => document.querySelector('main')!.firstElementChild!.getBoundingClientRect().top);
    expect(top, path).toBe(0);
  }
});

test('captura de la barra', async ({ page }) => {
  // La portada de /equipo/ lleva vidrio: se oculta para que la captura no dependa de la imagen.
  await page.goto('/equipo/');
  await page.addStyleTag({ content: '.pb-bg { display: none !important; }' });
  await page.evaluate(() => document.fonts.ready);
  // .pb-hdr mide 0 de alto (no empuja): se captura la franja superior de 92px de la página.
  const width = page.viewportSize()!.width;
  await expect(page).toHaveScreenshot('header.png', { clip: { x: 0, y: 0, width, height: 92 } });
});
