// H5.2 · Vitrina de proyectos (DESIGN §5.2). Fixtures en /lab/showcase*.
import { expect, test } from '@playwright/test';

test('vitrina oculta: ni sección ni "Ver proyectos"; el botón principal dice "Ver calendario"', async ({ page }) => {
  await page.goto('/lab/showcase-hidden/');
  await expect(page.locator('#destacados')).toHaveCount(0);
  await expect(page.getByRole('link', { name: /Ver proyectos/ })).toHaveCount(0);
  await expect(page.locator('#recap').getByRole('link', { name: 'Ver calendario' })).toBeVisible();
});

test('vitrina publicada: 1 panel + 2 tarjetas + N filas', async ({ page }) => {
  await page.goto('/lab/showcase/');
  const s = page.locator('#destacados');
  await expect(s.getByRole('heading', { level: 2, name: 'Proyectos destacados' })).toBeVisible();
  await expect(s.locator('.pb-feat')).toHaveCount(1);
  await expect(s.locator('.pb-pcard')).toHaveCount(2);
  await expect(s.locator('.pb-prow')).toHaveCount(2);
  await expect(page.locator('#recap').getByRole('link', { name: 'Ver proyectos destacados' })).toHaveAttribute('href', '#destacados');
});

test('clic en "Móvil" cambia la captura y marca aria-pressed', async ({ page }) => {
  await page.goto('/lab/showcase/');
  const feat = page.locator('#destacados .pb-feat');
  const desk = feat.getByRole('button', { name: 'Escritorio' });
  const mob = feat.getByRole('button', { name: 'Móvil' });
  const img = feat.locator('.pb-stage img:visible');
  await expect(desk).toHaveAttribute('aria-pressed', 'true');
  const before = await img.getAttribute('src');
  await mob.click();
  await expect(mob).toHaveAttribute('aria-pressed', 'true');
  await expect(desk).toHaveAttribute('aria-pressed', 'false');
  await expect(feat.locator('.pb-stage img:visible')).toHaveAttribute('alt', /móvil/);
  expect(await feat.locator('.pb-stage img:visible').getAttribute('src')).not.toBe(before);
});

test('sin shotMobile el conmutador no aparece', async ({ page }) => {
  await page.goto('/lab/showcase-nomobile/');
  const feat = page.locator('#destacados .pb-feat');
  await expect(feat).toHaveCount(1);
  await expect(feat.getByRole('button', { name: 'Móvil' })).toHaveCount(0);
  await expect(feat.locator('.pb-stage img')).toHaveCount(1);
});
