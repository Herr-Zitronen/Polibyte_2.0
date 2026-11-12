// H4.3 · "soft" + "ware" se unen con el scroll y quedan detrás de la franja de píxeles.
import { expect, test, type Page } from '@playwright/test';
import { pixelRuns } from '../../src/lib/pixel-strip';

const SEED = 23;

/** Lleva el scroll hasta que la palabra esté en `p` (0–1) de su rango `cover` de view(). */
async function scrollToCover(page: Page, p: number): Promise<void> {
  await page.evaluate((p) => {
    const el = document.querySelector('.pb-gword')!;
    const vh = innerHeight;
    const { top, height } = el.getBoundingClientRect();
    const absTop = top + scrollY;
    // Mientras Inicio termine en esta sección (hasta H4.4) no hay scroll suficiente para llegar
    // a cover 40%: un espaciador al final mide la animación sin depender del largo de la página.
    const spacer = document.createElement('div');
    spacer.style.height = `${vh}px`;
    document.body.append(spacer);
    // cover 0%: borde superior en el borde inferior del viewport; 100%: borde inferior arriba.
    scrollTo({ top: absTop - vh + p * (vh + height), behavior: 'instant' });
  }, p);
  // Dos frames para que la línea de tiempo de scroll se actualice.
  await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
}

async function halves(page: Page) {
  const l = (await page.locator('.pb-ghl').boundingBox())!;
  const r = (await page.locator('.pb-ghr').boundingBox())!;
  return { l, r };
}

test('a cover 40% "soft" toca "ware" y el conjunto está centrado', async ({ page }) => {
  await page.goto('/');
  await scrollToCover(page, 0.4);
  const { l, r } = await halves(page);
  expect(Math.abs(l.x + l.width - r.x)).toBeLessThanOrEqual(2);
  const vw = page.viewportSize()!.width;
  const center = (l.x + r.x + r.width) / 2;
  expect(Math.abs(center - vw / 2)).toBeLessThanOrEqual(2);
});

test('antes de cover 40% las mitades están separadas (hay animación)', async ({ page }) => {
  await page.goto('/');
  await scrollToCover(page, 0.1);
  const { l, r } = await halves(page);
  expect(r.x - (l.x + l.width)).toBeGreaterThan(10);
});

test('la franja de píxeles queda encima de la palabra', async ({ page }) => {
  await page.goto('/');
  await scrollToCover(page, 0.6);
  const strip = page.locator('#que-hacemos .pb-div');
  await expect(strip).toBeVisible();
  // Sobre una celda azul de la última fila que cae encima de la palabra, lo visible es la franja.
  const runs = pixelRuns(SEED).filter((r) => r.row === 3);
  const hit = await page.evaluate((runs) => {
    const word = document.querySelector('.pb-gword')!.getBoundingClientRect();
    const svg = document.querySelector('#que-hacemos .pb-div svg')!.getBoundingClientRect();
    const cell = svg.width / 36;
    const y = svg.bottom - svg.height / 8;
    const run = runs.find((r) => {
      const x = svg.left + (r.x + 0.5) * cell;
      return x > word.left && x < word.right;
    })!;
    const el = document.elementFromPoint(svg.left + (run.x + 0.5) * cell, y);
    return { overlaps: word.bottom > svg.top, inStrip: !!el?.closest('.pb-div') };
  }, runs);
  expect(hit.overlaps).toBe(true);
  expect(hit.inStrip).toBe(true);
  // Variante transparente: sin fondo, solo celdas del color de abajo.
  const fills = await strip.locator('rect').evaluateAll((rs) => [...new Set(rs.map((r) => r.getAttribute('fill')))]);
  expect(fills).toEqual(['#0F1A4D']);
});

test('la palabra es decorativa y usa --pb-ghost', async ({ page }) => {
  await page.goto('/');
  const gw = page.locator('.pb-gw');
  await expect(gw).toHaveAttribute('aria-hidden', 'true');
  await expect(gw).toHaveCSS('color', 'rgb(210, 215, 230)');
  await expect(gw).toHaveText('software');
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('la palabra ya aparece unida', async ({ page }) => {
    await page.goto('/');
    await scrollToCover(page, 0.1);
    const { l, r } = await halves(page);
    expect(Math.abs(l.x + l.width - r.x)).toBeLessThanOrEqual(2);
  });

  test('captura de la sección', async ({ page }) => {
    await page.goto('/');
    await page.locator('#que-hacemos').scrollIntoViewIfNeeded();
    await expect(page.locator('#que-hacemos')).toHaveScreenshot('que-hacemos.png');
  });
});
