// F5 · Animaciones de Inicio que no compiten con la carga:
// lo infinito espera a que el titular termine y se pausa fuera de pantalla.
import { expect, test, type Page } from '@playwright/test';

const sweepState = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.querySelector('.pb-hero .pb-flow')!, '::after').animationPlayState);

/** rAF detenido: el decodificado no avanza y solo el temporizador de respaldo (3 s) fija el titular. */
const stallDecode = (page: Page) =>
  page.addInitScript(() => {
    window.requestAnimationFrame = () => 0;
  });

test.describe('Inicio: animaciones y carga', () => {
  test.beforeEach((_args, info) => {
    test.skip(info.project.name === 'mobile-390', 'las líneas del marco del hero son de escritorio');
  });

  test('los barridos del hero esperan a que termine el titular', async ({ page }) => {
    await stallDecode(page);
    await page.goto('/');
    await page.waitForTimeout(400);
    expect(await sweepState(page)).toBe('paused');
    await page.waitForSelector('[data-decode][data-settled]', { timeout: 6000 });
    expect(await sweepState(page)).toBe('running');
  });

  test('la sombra del titular se pinta solo cuando ya no cambia el texto', async ({ page }) => {
    await stallDecode(page);
    await page.goto('/');
    await page.waitForTimeout(400);
    const shadow = () => page.evaluate(() => getComputedStyle(document.querySelector('[data-decode]')!).textShadow);
    expect(await shadow()).toBe('none');
    await page.waitForSelector('[data-decode][data-decoded]', { timeout: 6000 });
    expect(await shadow()).not.toBe('none');
  });

  test('el hero y las líneas vivas se pausan fuera de pantalla', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('[data-decode][data-decoded]');
    await expect.poll(() => sweepState(page)).toBe('running');
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight));
    await expect.poll(() => sweepState(page)).toBe('paused');
    await page.evaluate(() => scrollTo(0, 0));
    await expect.poll(() => sweepState(page)).toBe('running');
  });

  test('las capas de paralaje no fijan will-change (la animación de scroll ya las promueve)', async ({ page }) => {
    await page.goto('/');
    const values = await page.evaluate(() => [...document.querySelectorAll('.pb-par')].map((el) => getComputedStyle(el).willChange));
    expect(values.length).toBeGreaterThan(0);
    expect(values.every((v) => v === 'auto')).toBe(true);
  });
});
