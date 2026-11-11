// H4.1 · Portada de Inicio.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const TITLE = 'Construimos software. Y a quienes lo construyen.';
const GLYPHS = '01<>/{}[]#_=+*;';
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

type Win = Window & { __mutations: number };

// WOR-101: el decodificado gira un carrete de glifos encima de cada letra (CSS); el texto real NUNCA se reescribe.
test('el titular se decodifica con glifos y termina en el texto real, sin reescribir las letras', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as Win).__mutations = 0;
    document.addEventListener('DOMContentLoaded', () => {
      const h1 = document.querySelector('[data-decode]');
      if (!h1) return;
      new MutationObserver((ms) => {
        (window as unknown as Win).__mutations += ms.length;
      }).observe(h1, { subtree: true, childList: true, characterData: true });
    });
  });
  await page.goto('/');
  const h1 = page.locator('h1');
  // Cada letra lleva un carrete solo de glifos (sigue en el DOM aunque se oculte al terminar).
  const reels = await h1.locator('.pb-reel').evaluateAll((els) => els.map((e) => (e.textContent ?? '').replace(/\n/g, '')));
  expect(reels).toHaveLength(TITLE.replace(/ /g, '').length);
  expect(reels.every((r) => r.length > 0 && [...r].every((c) => GLYPHS.includes(c)))).toBe(true);
  await expect(h1).toHaveAttribute('data-decoded', '');
  expect(norm(await h1.innerText())).toBe(TITLE);
  expect(await page.evaluate(() => (window as unknown as Win).__mutations)).toBe(0);
});

test('accesible: aria-label completo y letras ocultas al lector', async ({ page }) => {
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveAttribute('aria-label', TITLE);
  const hidden = await h1.locator('.pb-word').evaluateAll((els) => els.every((e) => e.getAttribute('aria-hidden') === 'true'));
  expect(hidden).toBe(true);
  const r = await new AxeBuilder({ page }).include('#top').analyze();
  expect(r.violations).toEqual([]);
});

test.describe('movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });
  test('el texto real aparece de inmediato', async ({ page }) => {
    await page.goto('/');
    expect(norm(await page.locator('h1').innerText())).toBe(TITLE);
    await expect(page.locator('h1')).toHaveAttribute('data-decoded', '');
  });
});

test('al hacer scroll el marco se abre y el titular se aleja', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveAttribute('data-decoded', '');
  const read = () => page.evaluate(() => ['.pb-tlg', '.pb-hx'].map((s) => getComputedStyle(document.querySelector(s)!).transform));
  const before = await read();
  const h = await page.locator('#top').evaluate((el) => (el as HTMLElement).offsetHeight);
  await page.evaluate((y) => window.scrollTo(0, y), h / 2);
  await expect.poll(async () => (await read())[0]).not.toBe(before[0]);
  await expect.poll(async () => (await read())[1]).not.toBe(before[1]);
});
