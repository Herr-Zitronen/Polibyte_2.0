// F9 (WOR-95) · Iconos del prototipo: chip de 34×34 junto a los títulos de sección y terminal en "Ver eventos".
import { expect, test } from '@playwright/test';

const CASES = [
  { path: '/', section: 'Próximos eventos' },
  { path: '/equipo/', section: 'Directiva' },
  { path: '/lab/showcase', section: 'Proyectos destacados' },
];

for (const { path, section } of CASES) {
  test(`"${section}" lleva el chip de 34×34, decorativo y alineado con el título`, async ({ page }) => {
    await page.goto(path);
    const h2 = page.getByRole('heading', { level: 2, name: section, exact: true });
    const row = h2.locator('xpath=..');
    const chip = row.locator('svg.pb-schip');
    await expect(chip).toBeVisible();
    await expect(chip).toHaveAttribute('aria-hidden', 'true');
    const c = (await chip.boundingBox())!;
    const t = (await h2.boundingBox())!;
    expect(c.width).toBe(34);
    // Misma fila, centrados en vertical (±2 px), y el chip a la izquierda del título.
    expect(Math.abs(c.y + c.height / 2 - (t.y + t.height / 2))).toBeLessThanOrEqual(2);
    expect(c.x + c.width).toBeLessThanOrEqual(t.x);
  });
}

test('"Ver eventos" de la portada lleva el icono de terminal, decorativo', async ({ page }) => {
  await page.goto('/');
  const btn = page.locator('.pb-hero').getByRole('link', { name: 'Ver eventos' });
  const icon = btn.locator('svg');
  await expect(icon).toHaveCount(1);
  await expect(icon).toHaveAttribute('aria-hidden', 'true');
  await expect(icon).toHaveAttribute('width', '18');
  // El nombre accesible sigue siendo solo el texto.
  await expect(btn).toHaveAccessibleName('Ver eventos');
});
