// H2.3 · Pie de página (DESIGN §3.10).
import { expect, test } from '@playwright/test';

test('wordmark sólido: color #252D4F, opacidad 1 y cruce "yt" sin mancha', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const base = page.locator('.pb-foot .pb-lamp .pb-lamp__base text');
  await expect(base).toHaveAttribute('fill', '#252D4F');
  await expect(page.locator('.pb-foot .pb-lamp')).toHaveCSS('opacity', '1');
  await expect(page.locator('.pb-foot .pb-lamp .pb-lamp__base')).toHaveCSS('opacity', '1');
  // Captura del elemento completo: Playwright espera a que su caja deje de moverse y hace el scroll.
  // Antes se recortaba con una caja medida a mano; si la página seguía asentándose, el recorte cambiaba de tamaño.
  await expect(page.locator('.pb-foot .pb-lamp')).toHaveScreenshot('footer-lamp.png');
});

test('textos del pie y fondo #0D1438', async ({ page }) => {
  await page.goto('/');
  const foot = page.locator('footer.pb-foot');
  await expect(foot).toContainText('© 2026–2027 PoliByte · Club de la Carrera de Software');
  await expect(foot).toContainText('ESPOCH');
  await expect(foot).toHaveCSS('background-color', 'rgb(13, 20, 56)');
});

// PR D: los enlaces salen de site.json; vacíos no se muestran y nunca hay marcadores como "[Correo]".
test('enlaces del pie: sin marcadores ni anclas de relleno', async ({ page }) => {
  await page.goto('/');
  const links = page.locator('.pb-foot-links a');
  for (const a of await links.all()) {
    await expect(a).not.toHaveText(/\[|\]/);
    expect(await a.getAttribute('href')).not.toBe('#contacto');
    if ((await a.getAttribute('target')) === '_blank') await expect(a).toHaveAttribute('rel', /noopener/);
  }
});

test.describe('linterna', () => {
  test.beforeEach(({ page }) => test.skip(page.viewportSize()!.width <= 820, 'solo con cursor (escritorio)'));

  test('hover ilumina el grupo a 0.75 con --x/--y junto al cursor; sin hover, 0', async ({ page }) => {
    await page.goto('/');
    const lamp = page.locator('.pb-foot .pb-lamp');
    const lit = lamp.locator('.lit');
    await lamp.scrollIntoViewIfNeeded();
    await expect(lit).toHaveCSS('opacity', '0');
    const box = (await lamp.boundingBox())!;
    const px = box.x + box.width * 0.3;
    const py = box.y + box.height * 0.5;
    await page.mouse.move(px, py);
    await expect(lit).toHaveCSS('opacity', '0.75');
    const vars = () =>
      lamp.evaluate((el) => {
        const cs = getComputedStyle(el);
        return { x: parseFloat(cs.getPropertyValue('--x')), y: parseFloat(cs.getPropertyValue('--y')) };
      });
    await expect.poll(async () => Math.abs((await vars()).x - (px - box.x))).toBeLessThanOrEqual(2);
    expect(Math.abs((await vars()).y - (py - box.y))).toBeLessThanOrEqual(2);
    await page.mouse.move(5, 5);
    await expect(lit).toHaveCSS('opacity', '0');
  });
});

test.describe('táctil', () => {
  test.use({ hasTouch: true });
  test('sin (hover: hover) la linterna no se registra', async ({ page }) => {
    await page.addInitScript(() => {
      const real = window.matchMedia.bind(window);
      window.matchMedia = (q: string) =>
        q.includes('hover: hover') ? ({ ...real(q), matches: false } as MediaQueryList) : real(q);
    });
    await page.goto('/');
    await expect(page.locator('.pb-foot .pb-lamp')).not.toHaveAttribute('data-lantern', /.*/);
  });
});
