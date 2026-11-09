// H4.3 · "soft" + "ware" se unen con el scroll y quedan detrás de la franja de píxeles.
import { expect, test, type Page } from '@playwright/test';

/** Lleva el scroll hasta que la palabra esté en `p` (0–1) de su rango `cover` de view(). */
async function scrollToCover(page: Page, p: number): Promise<void> {
  await page.evaluate((p) => {
    const el = document.querySelector('.pb-gword')!;
    const vh = innerHeight;
    const { top, height } = el.getBoundingClientRect();
    const absTop = top + scrollY;
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
  // En una columna con píxel azul en la última fila, el elemento visible es la franja, no la palabra.
  const topEl = await page.evaluate(() => {
    const word = document.querySelector('.pb-gword')!.getBoundingClientRect();
    const svg = document.querySelector('#que-hacemos .pb-div svg')!.getBoundingClientRect();
    const y = svg.bottom - 1;
    const x = word.left + word.width / 2;
    const el = document.elementFromPoint(x, y);
    return { overlaps: word.bottom > svg.top, inStrip: !!el?.closest('.pb-div') };
  });
  expect(topEl.overlaps).toBe(true);
  expect(topEl.inStrip).toBe(true);
  // La franja es la variante transparente: color superior transparente.
  await expect(strip.locator('rect').first()).toHaveAttribute('fill', 'transparent');
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
