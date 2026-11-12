// H5.1 · Último evento concluido (DESIGN §5, design/Eventos.dc.html #recap).
// El sitio es estático: el "reloj fijo" vive en las páginas de laboratorio (fixture con fecha fija);
// la lógica con reloj fijo también se cubre en src/lib/recap.test.ts.
import { expect, test } from '@playwright/test';

test('fixture con 3 pasados: h1 = último concluido, cifras en Silkscreen y botón a destacados', async ({ page }) => {
  await page.goto('/lab/recap/');
  const recap = page.locator('#recap');
  await expect(recap.locator('h1')).toHaveAccessibleName('Hackathon ESPOCH');
  const nums = recap.locator('.pb-statn');
  await expect(nums).toHaveText(['12', '11', '44']);
  for (const n of await nums.all()) await expect(n).toHaveCSS('font-family', /Silkscreen/);
  await expect(recap.getByRole('link', { name: 'Ver proyectos destacados' })).toHaveAttribute('href', '#destacados');
});

test('stats parcial: no aparece el bloque de la cifra que falta; sin vitrina → Ver calendario', async ({ page }) => {
  await page.goto('/lab/recap-partial/');
  const recap = page.locator('#recap');
  await expect(recap.locator('.pb-stat')).toHaveCount(2);
  await expect(recap.getByText('proyectos entregados')).toHaveCount(0);
  await expect(recap.getByRole('link', { name: 'Ver calendario' })).toHaveAttribute('href', '#calendario');
  await expect(recap.getByRole('link', { name: 'Ver proyectos destacados' })).toHaveCount(0);
});

test('sin eventos pasados → estado alternativo', async ({ page }) => {
  await page.goto('/lab/recap-none/');
  const recap = page.locator('#recap');
  await expect(recap.locator('h1')).toHaveAccessibleName('Eventos');
  await expect(recap).toContainText('Todavía no hemos cerrado ningún evento.');
  await expect(recap.locator('.pb-stats')).toHaveCount(0);
  await expect(recap.getByRole('link', { name: 'Ver calendario' })).toHaveAttribute('href', '#calendario');
});

test('/eventos encabeza con el último evento concluido del contenido', async ({ page }) => {
  await page.goto('/eventos/');
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.locator('#recap h1')).toHaveAccessibleName('KIROWEEN 2026');
  await expect(page.locator('#recap .pb-statn')).toHaveText(['2', '2', '6']);
});
