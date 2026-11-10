// H5.4 · Archivo por año (DESIGN §5). Fixtures en /lab/archive.
import { expect, test } from '@playwright/test';

test('encabezados de año en orden descendente', async ({ page }) => {
  await page.goto('/lab/archive/');
  const a = page.locator('#archivo');
  await expect(a.getByRole('heading', { level: 2, name: 'Archivo' })).toBeVisible();
  await expect(a.getByRole('heading', { level: 3 })).toHaveText(['2026', '2025']);
});

test('"Ver proyectos" solo en eventos con vitrina publicada', async ({ page }) => {
  await page.goto('/lab/archive/');
  const btns = page.locator('#archivo').getByRole('link', { name: 'Ver proyectos' });
  await expect(btns).toHaveCount(1);
  await expect(page.locator('#archivo .pb-arow', { hasText: 'Hackathon ESPOCH' }).getByRole('link', { name: 'Ver proyectos' })).toBeVisible();
});

test('línea viva en cada año', async ({ page }) => {
  await page.goto('/lab/archive/');
  const years = page.locator('#archivo .pb-year');
  await expect(years).toHaveCount(2);
  for (const y of await years.all()) await expect(y.locator(':scope > .pb-hl')).toHaveCount(1);
});

test('la página /eventos/ incluye el archivo', async ({ page }) => {
  await page.goto('/eventos/');
  await expect(page.locator('#archivo .pb-year').first()).toBeVisible();
});

test('el año cabe en su columna sin tocar la línea vertical', async ({ page }) => {
  test.skip(page.viewportSize()!.width <= 960, 'en móvil el año va apilado sobre sus filas');
  await page.goto('/lab/archive/');
  for (const yl of await page.locator('#archivo .pb-yl').all()) {
    const { text, box } = await yl.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      // El rango incluye la cruz decorativa (posición absoluta): solo cuenta el nodo de texto.
      const node = [...el.childNodes].find((n) => n.nodeType === Node.TEXT_NODE && n.textContent!.trim())!;
      range.selectNodeContents(node);
      return { text: range.getBoundingClientRect().right, box: el.getBoundingClientRect().right };
    });
    // Debe quedar al menos 16 px entre el último dígito y la línea de la columna.
    expect(box - text).toBeGreaterThanOrEqual(16);
  }
});
