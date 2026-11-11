// PR C · Animaciones del prototipo que faltaban. Solo transform/opacity; visibles por defecto; quietas con
// movimiento reducido.
import { expect, test, type Locator } from '@playwright/test';

/** Nombres de las animaciones CSS que corren sobre un elemento. */
const animationNames = (loc: Locator) =>
  loc.evaluate((el) => el.getAnimations().map((a) => (a as CSSAnimation).animationName));

test.describe('barra', () => {
  test.beforeEach(({ page }) => test.skip(page.viewportSize()!.width <= 820, 'barra de escritorio'));

  test('los 3 enlaces y "unirme" entran escalonados a partir de 0.3 s y terminan visibles', async ({ page }) => {
    await page.goto('/');
    const delays = await page
      .locator('.pb-nav a')
      .evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).animationDelay)));
    expect(delays).toHaveLength(3);
    expect(delays[0]).toBeGreaterThanOrEqual(0.3);
    expect(delays[1]).toBeGreaterThan(delays[0]!);
    expect(delays[2]).toBeGreaterThan(delays[1]!);
    await expect(page.locator('.pb-bar .pb-join')).toHaveCSS('animation-name', 'pb-in');
    await expect(page.locator('.pb-nav a').first()).toHaveCSS('opacity', '1', { timeout: 3000 });
  });

  test('el chip del próximo evento aparece con scaleX + opacity, sin clip-path', async ({ page }) => {
    test.skip(page.viewportSize()!.width < 1180, 'el chip solo existe desde 1180 px');
    await page.goto('/');
    const chip = page.locator('.pb-chip');
    await expect(chip).toHaveCSS('clip-path', 'none');
    expect(await chip.evaluate((el) => getComputedStyle(el).transitionProperty)).not.toMatch(/clip-path/);
    await page.locator('#proximo').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY + 50));
    await expect(chip).toHaveCSS('opacity', '1', { timeout: 3000 });
    await expect(chip).toHaveCSS('transform', 'none');
    await expect(chip.locator('.pb-chip-n > span')).toHaveCSS('transform', 'none', { timeout: 3000 });
  });
});

test('menú móvil: los enlaces entran escalonados al abrir', async ({ page }) => {
  test.skip(page.viewportSize()!.width > 820, 'solo celular');
  await page.goto('/');
  await page.locator('.pb-menu-btn').click();
  const links = page.locator('.pb-sheet-nav a');
  const delays = await links.evaluateAll((els) => els.map((el) => parseFloat(getComputedStyle(el).animationDelay)));
  expect(delays).toEqual([0.05, 0.1, 0.15]);
  await expect(links.last()).toHaveCSS('opacity', '1', { timeout: 3000 });
});

test.describe('panel del próximo evento', () => {
  test('al entrar en pantalla las celdas se llenan y la actual parpadea; los 8 bits se teclean', async ({ page }) => {
    await page.goto('/');
    const panel = page.locator('#proximo');
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toHaveClass(/is-in/);
    expect(await animationNames(panel.locator('.pb-cell.on').first())).toContain('pb-fill');
    expect(await animationNames(panel.locator('.pb-cell.now'))).toEqual(expect.arrayContaining(['pb-fill', 'pb-blink']));
    await expect(panel.locator('.pb-bit')).toHaveCount(8);
    expect(await animationNames(panel.locator('.pb-bit').first())).toContain('pb-bit');
  });

  test('el binario sigue con 8 bits tras refrescar la cuenta (no se borran los spans)', async ({ page }) => {
    await page.clock.install();
    await page.goto('/');
    await page.clock.runFor(61_000);
    await expect(page.locator('#proximo [data-cd="binary"] .pb-bit')).toHaveCount(8);
  });
});

test('calendario de Inicio: el cubo iso gira con el scroll (view())', async ({ page }) => {
  await page.goto('/');
  const iso = page.locator('.pb-iso');
  test.skip((await iso.count()) === 0, 'sin próximos eventos no hay calendario');
  const timeline = await iso.evaluate((el) => getComputedStyle(el).animationTimeline);
  expect(timeline).toBe('view()');
  await expect(iso).toHaveCSS('animation-name', 'pb-iso-spin');
});

test.describe('con movimiento reducido', () => {
  test.use({ reducedMotion: 'reduce' });

  test('nada entra ni gira: barra, celdas, bits y cubo quietos y visibles', async ({ page }) => {
    await page.goto('/');
    if (page.viewportSize()!.width > 820) await expect(page.locator('.pb-nav a').first()).toHaveCSS('animation-name', 'none');
    const panel = page.locator('#proximo');
    await panel.scrollIntoViewIfNeeded();
    await expect(panel.locator('.pb-cell.now')).toHaveCSS('animation-name', 'none');
    await expect(panel.locator('.pb-bit').first()).toHaveCSS('animation-name', 'none');
    await expect(panel.locator('.pb-bit').first()).toHaveCSS('opacity', '1');
    const iso = page.locator('.pb-iso');
    if (await iso.count()) await expect(iso).toHaveCSS('animation-name', 'none');
  });
});
