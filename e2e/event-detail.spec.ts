// H6.1 · Plantilla de detalle de evento. Los estados usan /lab/event-detail/* (reloj fijo: 9 nov 2026),
// así las pruebas no caducan cuando pasan las fechas del contenido real.
import { expect, test } from '@playwright/test';

test('evento próximo: ruta, tipo, título, datos, cuenta regresiva, cronograma e inscripción', async ({ page }) => {
  await page.goto('/lab/event-detail/upcoming/');
  const crumb = page.getByRole('navigation', { name: 'Ruta' });
  await expect(crumb).toHaveText(/Eventos\s*\/\s*Imagine Cup/);
  await expect(crumb.getByRole('link', { name: 'Eventos' })).toHaveAttribute('href', '/eventos/');
  await expect(page.locator('.pb-dtype')).toHaveText('Competencia · Microsoft');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Imagine Cup');
  const hero = page.locator('#top');
  await expect(hero).toContainText('5 dic 2026');
  await expect(hero).toContainText('Remoto');
  await expect(page.getByRole('timer')).toBeVisible();
  const facts = page.locator('.pb-dfacts');
  await expect(facts).toContainText('De 2 a 4 personas');
  await expect(facts).toContainText('Ser estudiante de la ESPOCH.');
  await expect(page.locator('#cronograma .pb-srow')).toHaveCount(2);
  const reg = page.locator('#inscripcion').getByRole('link', { name: 'Inscribir a mi equipo' });
  await expect(reg).toHaveAttribute('href', 'https://imaginecup.microsoft.com');
  await expect(reg).toHaveAttribute('target', '_blank');
  await expect(reg).toHaveAttribute('rel', 'noopener noreferrer');
  await expect(page.locator('#sobre')).toContainText('Sobre el evento.');
});

test('evento pasado: "Realizado", sin cuenta regresiva ni inscripción', async ({ page }) => {
  await page.goto('/lab/event-detail/past/');
  await expect(page.locator('.pb-dstate')).toHaveText('Realizado');
  await expect(page.getByRole('timer')).toHaveCount(0);
  await expect(page.locator('#inscripcion')).toHaveCount(0);
});

test('evento por confirmar: "Por confirmar" en lugar de la cuenta regresiva', async ({ page }) => {
  await page.goto('/lab/event-detail/tbd/');
  await expect(page.locator('.pb-dstate')).toHaveText('Por confirmar');
  await expect(page.getByRole('timer')).toHaveCount(0);
});

test('el h1 es único y lleva view-transition-name: pb-evtitle', async ({ page }) => {
  await page.goto('/eventos/imagine-cup-2027/');
  await expect(page.locator('h1')).toHaveCount(1);
  const vt = await page.locator('h1').evaluate((el) => getComputedStyle(el).viewTransitionName);
  expect(vt).toBe('pb-evtitle');
});

test('una ruta por evento; slug inexistente → 404', async ({ page }) => {
  for (const slug of ['imagine-cup-2027', 'icpc-2025', 'codefest-2027', 'kiroween-2026', 'taller-git-2026']) {
    const res = await page.goto(`/eventos/${slug}/`);
    expect(res?.status(), slug).toBe(200);
  }
  const res = await page.goto('/eventos/no-existe/');
  expect(res?.status()).toBe(404);
});
