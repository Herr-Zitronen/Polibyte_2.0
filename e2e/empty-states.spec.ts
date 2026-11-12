// PR B · Estados vacíos y vitrina "nunca a medias" (DESIGN §5.2). Fixtures con reloj fijo en /lab/*.
import { expect, test } from '@playwright/test';

test('vitrina con 1 destacado: solo el panel grande, sin tarjetas', async ({ page }) => {
  await page.goto('/lab/showcase-count/1/');
  const s = page.locator('#destacados');
  await expect(s.locator('.pb-feat')).toHaveCount(1);
  await expect(s.locator('.pb-pcard')).toHaveCount(0);
});

test('vitrina con 2 destacados: una tarjeta a ancho completo (sin media columna vacía)', async ({ page }) => {
  await page.goto('/lab/showcase-count/2/');
  const s = page.locator('#destacados');
  const card = s.locator('.pb-pcard');
  await expect(card).toHaveCount(1);
  const [cardW, gridW] = await Promise.all([
    card.evaluate((el) => el.getBoundingClientRect().width),
    s.locator('.pb-pgrid2').evaluate((el) => el.getBoundingClientRect().width),
  ]);
  expect(Math.abs(cardW - gridW)).toBeLessThan(2);
});

test('proyectos sin enlaces, integrantes ni stack: no quedan contenedores vacíos', async ({ page }) => {
  await page.goto('/lab/showcase-nolinks/');
  const s = page.locator('#destacados');
  await expect(s.locator('.pb-actions')).toHaveCount(0);
  await expect(s.locator('.pb-stack')).toHaveCount(0);
  await expect(s.locator('.pb-tag.pill')).toHaveCount(0);
  for (const m of await s.locator('.pb-meta').allTextContents()) expect(m).not.toMatch(/·\s*$/);
  await expect(s.locator('.pb-bbar__url').first()).toHaveText('sin demo pública');
});

test('detalle de evento con vitrina publicada: sección #proyectos y sin cuerpo vacío', async ({ page }) => {
  await page.goto('/lab/event-detail-projects/');
  await expect(page.locator('#proyectos .pb-feat')).toHaveCount(1);
  await expect(page.locator('#sobre .pb-dbody')).toHaveCount(0);
});

test('el archivo enlaza "Ver proyectos" al detalle del evento correcto', async ({ page }) => {
  await page.goto('/lab/archive/');
  const links = page.locator('#archivo').getByRole('link', { name: /Ver proyectos/ });
  for (const l of await links.all()) await expect(l).toHaveAttribute('href', /^\/eventos\/[a-z0-9-]+\/#proyectos$/);
});

test('calendario sin eventos próximos: sin pestañas, mensaje propio y botón a Unirme', async ({ page }) => {
  await page.goto('/lab/calendar-empty/');
  const cal = page.locator('#calendario');
  await expect(cal.getByRole('group', { name: 'Filtrar por tipo' })).toHaveCount(0);
  await expect(cal).toContainText('Estamos preparando los próximos eventos');
  await expect(cal.getByRole('link', { name: 'Unirme al club' })).toHaveAttribute('href', '/unirme/');
  await expect(cal.locator('.pb-cal-empty')).toBeHidden();
});

test('filtro vacío sin archivo: no menciona "el archivo más abajo"', async ({ page }) => {
  await page.goto('/lab/calendar-nocomp/');
  await expect(page.locator('#calendario .pb-cal-empty')).not.toContainText('archivo');
});

test('directiva sin miembros: la sección no se pinta', async ({ page }) => {
  await page.goto('/lab/board-empty/');
  await expect(page.locator('#directiva')).toHaveCount(0);
});
