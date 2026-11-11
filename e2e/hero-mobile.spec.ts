// Portada en celular (Safari en iPhone): el texto nunca cruza las líneas del marco y la portada llega al borde
// inferior de la pantalla (sin la sección siguiente asomando bajo la barra flotante de Safari).
import { expect, test, type Page } from '@playwright/test';

const AIR = 12;

async function frame(page: Page) {
  await page.goto('/');
  await page.waitForSelector('.pb-hero[data-drawn]', { timeout: 8000 });
  return page.evaluate(() => {
    const top = (sel: string) => document.querySelector(sel)!.getBoundingClientRect();
    return {
      innerTop: top('.pb-tlg > .pb-line:nth-of-type(2)').top,
      title: top('.pb-h1').top,
      actions: top('.pb-actions').bottom,
      lowerTop: top('.pb-blg > .pb-line:nth-of-type(1)').top,
      heroBottom: top('.pb-hero-s').bottom,
      vh: innerHeight,
    };
  });
}

for (const viewport of [
  { width: 390, height: 844 },
  { width: 390, height: 664 },
]) {
  test.describe(`celular ${viewport.width}×${viewport.height}`, () => {
    test.use({ viewport });
    test.beforeEach(({}, info) => test.skip(info.project.name !== 'mobile-390', 'solo celular'));

    test('titular y botones quedan dentro del marco, sin tocar sus líneas', async ({ page }) => {
      const f = await frame(page);
      expect(f.title, 'el titular empieza bajo la línea superior').toBeGreaterThanOrEqual(f.innerTop + AIR);
      expect(f.actions, 'los botones terminan sobre la línea inferior').toBeLessThanOrEqual(f.lowerTop - AIR);
    });

    test('la portada llega al borde inferior de la pantalla', async ({ page }) => {
      const f = await frame(page);
      expect(f.heroBottom).toBeGreaterThanOrEqual(f.vh);
    });
  });
}
