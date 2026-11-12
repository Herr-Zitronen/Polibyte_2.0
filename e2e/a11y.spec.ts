// L1 (WOR-85) · Accesibilidad completa (DESIGN §6): axe en todas las rutas públicas × 3 anchos (proyectos de
// Playwright), con el menú móvil abierto, foco visible y orden de teclado.
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const events = readdirSync(resolve(import.meta.dirname, '../src/content/events'))
  .filter((f) => f.endsWith('.md'))
  .map((f) => `/eventos/${f.replace(/\.md$/, '')}/`);

const ROUTES = ['/', '/eventos/', ...events, '/equipo/', '/unirme/', '/no-existe-esta-pagina/'];

/** Deja que terminen las entradas (titular, barra) para que axe mida colores finales, no a media opacidad. */
async function settle(page: Page): Promise<void> {
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(2000);
}

const violations = async (page: Page, include?: string) => {
  const builder = new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']);
  if (include) builder.include(include);
  const r = await builder.analyze();
  return r.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`);
};

for (const route of ROUTES) {
  test(`axe sin violaciones: ${route}`, async ({ page }) => {
    await page.goto(route);
    await settle(page);
    expect(await violations(page)).toEqual([]);
  });
}

test('axe sin violaciones con el menú móvil abierto', async ({ page }) => {
  test.skip(page.viewportSize()!.width > 820, 'el menú en hoja solo existe en ≤ 820 px');
  await page.goto('/');
  await settle(page);
  await page.locator('.pb-menu-btn').click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.waitForTimeout(500); // escalonado de los enlaces
  expect(await violations(page, '#pb-menu')).toEqual([]);
});

test.describe('teclado', () => {
  test.skip(({ isMobile }) => !!isMobile, 'teclado físico: escritorio y portátil');

  for (const route of ['/', '/eventos/', '/equipo/', '/unirme/']) {
    test(`foco visible y en orden del documento: ${route}`, async ({ page }) => {
      await page.goto(route);
      await settle(page);
      expect(await page.locator('[tabindex]:not([tabindex="0"]):not([tabindex="-1"])').count(), 'sin tabindex positivo').toBe(0);
      const seen: string[] = [];
      for (let i = 0; i < 20; i++) {
        await page.keyboard.press('Tab');
        const info = await page.evaluate(() => {
          const el = document.activeElement as HTMLElement | null;
          if (!el || el === document.body) return null;
          const s = getComputedStyle(el);
          const r = el.getBoundingClientRect();
          // Índice en el orden del documento entre todos los elementos.
          const index = [...document.querySelectorAll('*')].indexOf(el);
          return {
            label: `${el.tagName.toLowerCase()} "${(el.textContent ?? '').trim().slice(0, 30)}"`,
            index,
            outline: s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) >= 2,
            visible: r.width > 0 && r.height > 0 && r.bottom > 0 && r.top < innerHeight,
          };
        });
        if (!info) break;
        expect(info.outline, `${route}: foco visible en ${info.label}`).toBe(true);
        expect(info.visible, `${route}: ${info.label} queda en pantalla al enfocarlo`).toBe(true);
        seen.push(`${info.index}`);
      }
      expect(seen.length).toBeGreaterThan(3);
      const order = seen.map(Number);
      expect(order, `${route}: el Tab sigue el orden del documento`).toEqual([...order].sort((a, b) => a - b));
    });
  }
});
