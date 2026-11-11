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
  await page.locator('section[data-theme="light"]').first().evaluate((el) => window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 10, behavior: 'instant' }));
  await expect(hdr).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('.pb-hdr .pb-join .pb-b1__box')).toHaveCSS('background-color', 'rgb(19, 32, 90)');
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
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

// F17 · Escudo ESPOCH: [escudo] │ [isotipo + nombre], alineados y sin desbordar.
test.describe('F17 · escudo ESPOCH en la barra', () => {
  test('escudo, línea e isotipo comparten centro vertical y los huecos de la línea son iguales', async ({ page }) => {
    await page.goto('/');
    const box = async (s: string) => (await page.locator(s).first().boundingBox())!;
    const shield = await box('.pb-hdr .pb-brand__shield');
    const rule = await box('.pb-hdr .pb-brand__rule');
    const iso = await box('.pb-hdr .pb-logo svg');
    const cy = (b: { y: number; height: number }) => b.y + b.height / 2;
    // El escudo baja 1 px a propósito (centrado óptico, ver header.css): su caja queda a 1 px del centro.
    expect(Math.abs(cy(shield) - cy(iso) - 1)).toBeLessThanOrEqual(1);
    expect(Math.abs(cy(rule) - cy(iso))).toBeLessThanOrEqual(1);
    expect(Math.abs(shield.height - iso.height)).toBeLessThanOrEqual(1);
    const left = rule.x - (shield.x + shield.width);
    const right = iso.x - (rule.x + rule.width);
    expect(Math.abs(left - right)).toBeLessThanOrEqual(1);
    expect(shield.x).toBeLessThan(rule.x);
  });

  test('el escudo no es un enlace y se anuncia como ESPOCH', async ({ page }) => {
    await page.goto('/');
    const shield = page.locator('.pb-hdr .pb-brand__shield');
    await expect(shield).toHaveAttribute('role', 'img');
    await expect(shield).toHaveAttribute('aria-label', 'ESPOCH');
    expect(await shield.evaluate((el) => !!el.closest('a'))).toBe(false);
    await expect(page.locator('.pb-hdr .pb-logo')).toHaveAttribute('href', '/');
  });

  test('la barra no desborda la pantalla', async ({ page }) => {
    await page.goto('/');
    const vw = page.viewportSize()!.width;
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(vw);
    for (const s of ['.pb-hdr .pb-brand', '.pb-hdr .pb-right']) {
      const b = (await page.locator(s).boundingBox())!;
      expect(b.x, s).toBeGreaterThanOrEqual(0);
      expect(b.x + b.width, s).toBeLessThanOrEqual(vw);
    }
    const brand = (await page.locator('.pb-hdr .pb-brand').boundingBox())!;
    const right = (await page.locator('.pb-hdr .pb-right').boundingBox())!;
    expect(brand.x + brand.width, 'marca y botones no se pisan').toBeLessThanOrEqual(right.x);
  });

  test('sin violaciones de axe en la barra', async ({ page }) => {
    await page.goto('/');
    const { default: AxeBuilder } = await import('@axe-core/playwright');
    const results = await new AxeBuilder({ page }).include('.pb-hdr').analyze();
    expect(results.violations).toEqual([]);
  });
});

// El blur solo se apaga arriba del todo: con scroll, el titular que pasa bajo la barra no debe quedar sin desenfoque.
test('el blur de la barra se enciende en cuanto se hace scroll, también sobre la portada', async ({ page }) => {
  for (const path of ['/', '/equipo/', '/eventos/']) {
    await page.goto(path);
    await expect(page.locator('.pb-hdr'), path).toHaveAttribute('data-blur', 'off');
    await page.evaluate(() => window.scrollTo({ top: 300, behavior: 'instant' }));
    await expect(page.locator('.pb-hdr'), path).toHaveAttribute('data-blur', 'on');
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await expect(page.locator('.pb-hdr'), path).toHaveAttribute('data-blur', 'off');
  }
});
