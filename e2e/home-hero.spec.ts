// H4.1 · Portada de Inicio.
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

const TITLE = 'Construimos software. Y a quienes lo construyen.';
const GLYPHS = '01<>/{}[]#_=+*;';
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();

type Win = Window & { __seen: string[] };

test('el titular se decodifica y termina en el texto real', async ({ page }) => {
  await page.addInitScript(() => {
    (window as unknown as Win).__seen = [];
    new MutationObserver((ms) => {
      for (const m of ms) {
        const el = m.target instanceof Element ? m.target : m.target.parentElement;
        if (el?.classList.contains('pb-ch')) (window as unknown as Win).__seen.push(el.textContent ?? '');
      }
    }).observe(document, { subtree: true, childList: true, characterData: true });
  });
  await page.goto('/');
  const h1 = page.locator('h1');
  await expect(h1).toHaveAttribute('data-decoded', '');
  expect(norm(await h1.innerText())).toBe(TITLE);
  const seen = await page.evaluate(() => (window as unknown as Win).__seen);
  expect(seen.some((s) => s.length === 1 && GLYPHS.includes(s) && !TITLE.includes(s))).toBe(true);
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
