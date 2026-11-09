// H4.2 · Panel del próximo evento (DESIGN §5.1).
import { expect, test, type Page } from '@playwright/test';

/** Congela el reloj 27 días y 20 horas antes del inicio del evento que muestra el panel. */
async function freezeAt27d20h(page: Page) {
  await page.goto('/');
  const iso = await page.locator('[data-countdown]').getAttribute('data-countdown');
  const start = new Date(iso!).getTime();
  await page.clock.setFixedTime(new Date(start - (27 * 24 + 20) * 3_600_000));
  await page.reload();
}

test('a 27 días y 20 horas muestra 27 : 20, el binario y Days in code', async ({ page }) => {
  await freezeAt27d20h(page);
  const panel = page.locator('#proximo');
  await expect(panel.locator('[data-cd="days"]')).toHaveText('27');
  await expect(panel.locator('[data-cd="hours"]')).toHaveText('20');
  await expect(panel.locator('[data-cd="binary"]')).toHaveText('00011011');
  await expect(panel.getByText('Days in code: 27')).toBeVisible();
  await expect(panel.getByRole('timer')).toHaveAttribute('aria-label', 'Faltan 27 días y 20 horas');
});

test('40 celdas y la actual en amarillo', async ({ page }) => {
  await freezeAt27d20h(page);
  const cells = page.locator('#proximo .pb-cell');
  await expect(cells).toHaveCount(40);
  const now = page.locator('#proximo .pb-cell.now');
  await expect(now).toHaveCount(1);
  await expect(now).toHaveCSS('background-color', 'rgb(242, 224, 160)');
});

test('sin próximo evento el panel no está en el DOM', async ({ page }) => {
  await page.goto('/lab/next-event-none/');
  await expect(page.locator('#proximo')).toHaveCount(0);
  await expect(page.locator('[data-countdown]')).toHaveCount(0);
});

test('el chip aparece en la barra al pasar el panel (solo ≥1180 px)', async ({ page }) => {
  await page.goto('/');
  const chip = page.locator('.pb-hdr .pb-chip');
  await expect(chip).toBeHidden();
  await page.locator('#proximo').evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().bottom + window.scrollY + 50));
  const wide = page.viewportSize()!.width >= 1180;
  if (wide) {
    const state = await page.evaluate(() => ({
      y: window.scrollY,
      max: document.documentElement.scrollHeight - innerHeight,
      panel: document.querySelector('#proximo')!.getBoundingClientRect().toJSON(),
      hdr: document.querySelector('.pb-hdr')!.className,
      log: (window as unknown as { __chip?: unknown }).__chip,
      chip: getComputedStyle(document.querySelector('.pb-chip')!).visibility,
    }));
    await expect(chip, JSON.stringify(state)).toBeVisible();
  }
  else {
    await page.waitForTimeout(500);
    await expect(chip).toBeHidden();
  }
});
