// F2 · Equipo: portada del prototipo (design/Equipo.dc.html #top).
import { expect, test } from "@playwright/test";

test("portada: kicker con el período, titular y texto del prototipo", async ({ page }) => {
  await page.goto("/equipo/");
  const top = page.locator("main #top");
  await expect(top).toHaveCount(1);
  await expect(top.getByText("Directiva 2026–2027", { exact: true })).toBeVisible();
  await expect(top.getByRole("heading", { level: 1 })).toHaveText("Las personas detrás del club.");
  await expect(top).toContainText("Estudiantes de la carrera que organizan los eventos");
});

test("la portada usa fondo de vidrio y va antes de la directiva", async ({ page }) => {
  await page.goto("/equipo/");
  await expect(page.locator("main #top.pb-glass .pb-bg")).toHaveCount(1);
  const ids = await page.locator("main > section").evaluateAll((els) => els.map((e) => e.id));
  expect(ids).toEqual(["top", "directiva", "tutor"]);
});

test("captura de la portada con movimiento reducido", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/equipo/");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#top")).toHaveScreenshot("team-hero.png");
});
