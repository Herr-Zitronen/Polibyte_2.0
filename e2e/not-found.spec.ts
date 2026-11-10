// H9.2 · Página 404. El código de estado se prueba sobre `wrangler dev` (como en Cloudflare),
// no solo sobre `astro preview`: si devolviera 200, Google indexaría páginas basura ("soft 404").
import { expect, test } from "@playwright/test";

const WRANGLER = "http://localhost:8787";

test("una URL inexistente responde 404 en Cloudflare (wrangler dev)", async ({ page, request }) => {
  test.skip(page.viewportSize()!.width !== 1440, "no depende del ancho");
  const res = await request.get(`${WRANGLER}/no-existe`);
  expect(res.status()).toBe(404);
  expect(await res.text()).toContain("110010100");
});

test("la 404 de diseño: 404 en pixel art, 110010100 y «volver» al inicio", async ({ page }) => {
  const res = await page.goto("/no-existe");
  expect(res!.status()).toBe(404);
  const big = page.locator(".pb-404");
  await expect(big).toHaveText("404");
  expect(await big.evaluate((el) => getComputedStyle(el).fontFamily)).toMatch(/Silkscreen/);
  await expect(page.getByText("110010100", { exact: true })).toBeVisible();
  await expect(page.getByRole("link", { name: /volver/i }).first()).toHaveAttribute("href", "/");
});

test("captura de la 404", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/no-existe");
  await page.evaluate(() => document.fonts.ready);
  await expect(page.locator("#top")).toHaveScreenshot("not-found.png");
});
