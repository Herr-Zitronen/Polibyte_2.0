// F5 · Animaciones de Inicio que no compiten con la carga:
// lo infinito espera a que el titular termine y se pausa fuera de pantalla.
import { expect, test, type Page } from '@playwright/test';

const sweepState = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('.pb-hero .pb-flow')!, '::after').animationPlayState);

/** rAF detenido (pestaña ocupada): no debe impedir que el titular se fije (respaldo de 3 s). */
const stallDecode = (page: Page) =>
  page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });

test.describe('Inicio: animaciones y carga', () => {
  test.skip(({ viewport }) => (viewport?.width ?? 0) < 600, 'las líneas del marco del hero son de escritorio');

  test('los barridos del hero esperan a que termine el titular', async ({ page }) => {
    await stallDecode(page);
    await page.goto('/');
    await page.waitForTimeout(400);
    expect(await sweepState(page)).toBe('paused');
    await page.waitForSelector('[data-decode][data-settled]', { timeout: 6000 });
    expect(await sweepState(page)).toBe('running');
  });

  // WOR-101: la sombra vive en una copia aparte que aparece por opacidad; el h1 nunca se repinta por ella.
  test('la sombra del titular aparece solo cuando termina el decodificado', async ({ page }) => {
    await page.goto('/');
    const h1Shadow = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-decode]')!).textShadow);
    const copy = () => page.evaluate(() => Number(getComputedStyle(document.querySelector('.pb-h1-shadow')!).opacity));
    const decoded = await page.evaluate(() => document.querySelector('[data-decode]')!.hasAttribute('data-decoded'));
    if (!decoded) expect(await copy()).toBeLessThan(1);
    await page.waitForSelector('[data-decode][data-decoded]', { timeout: 6000 });
    await expect.poll(copy).toBe(1);
    expect(await h1Shadow()).toBe('none');
  });

  test('el hero y las líneas vivas se pausan fuera de pantalla', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-decode][data-decoded]');
    await expect.poll(() => sweepState(page)).toBe('running');
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await expect.poll(() => sweepState(page)).toBe('paused');
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(() => sweepState(page)).toBe('running');
  });

  // perf/fluidez-real: fuera de pantalla el marco ni se oculta ni suelta sus animaciones de scroll
  // (ocultarlo hacía que las líneas aparecieran tarde al volver rápido).
  test('lejos de la pantalla el hero sigue visible y con sus animaciones de scroll', async ({ page }) => {
    await page.goto('/');
    const state = () =>
      page.evaluate(() => ({
        off: document.querySelector('.pb-hero')!.classList.contains('is-off'),
        visibility: getComputedStyle(document.querySelector('.pb-hero__lines')!).visibility,
        split: getComputedStyle(document.querySelector('.pb-tlg')!).animationName,
      }));
    await page.evaluate(() => scrollTo({ top: document.documentElement.scrollHeight, behavior: 'instant' }));
    await expect.poll(state).toEqual({ off: true, visibility: 'visible', split: 'pb-split-tl' });
    await page.evaluate(() => scrollTo({ top: 0, behavior: 'instant' }));
    await expect.poll(state).toEqual({ off: false, visibility: 'visible', split: 'pb-split-tl' });
  });

  test('al terminar la entrada el hero suelta sus animaciones forwards sin cambiar el dibujo', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('.pb-hero[data-drawn]', { timeout: 6000 });
    const state = await page.evaluate(() => {
      const cs = (s: string) => getComputedStyle(document.querySelector(s)!);
      return {
        line: [cs('.pb-line').animationName, cs('.pb-line').transform],
        vline: [cs('.pb-vline').animationName, cs('.pb-vline').transform],
        sub: [cs('.pb-sub').animationName, cs('.pb-sub').opacity],
      };
    });
    expect(state).toEqual({ line: ['none', 'none'], vline: ['none', 'none'], sub: ['none', '1'] });
  });

  test('las capas de paralaje no fijan will-change (la animación de scroll ya las promueve)', async ({ page }) => {
    await page.goto('/');
    const values = await page.evaluate(() => [...document.querySelectorAll('.pb-par')].map((el) => getComputedStyle(el).willChange));
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((v) => v === 'auto')).toBe(true);
  });
});
