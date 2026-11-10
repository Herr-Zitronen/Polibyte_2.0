// H8.1 · Unirme: formulario. No depende de fechas: usa la página real.
import { expect, test } from "@playwright/test";
import site from "../src/content/site.json";

test("el botón del formulario abre site.joinFormUrl en otra pestaña segura", async ({
  page,
  context,
}) => {
  // Interceptar la URL externa para no salir a internet.
  await context.route(`${site.joinFormUrl}**`, (route) =>
    route.fulfill({ status: 200, contentType: "text/html", body: "<title>form</title>" }),
  );
  await page.goto("/unirme/");
  const cta = page.getByRole("link", { name: /Llenar formulario de ingreso/ }).first();
  await expect(cta).toHaveAttribute("href", site.joinFormUrl);
  await expect(cta).toHaveAttribute("target", "_blank");
  await expect(cta).toHaveAttribute("rel", "noopener noreferrer");

  const [popup] = await Promise.all([context.waitForEvent("page"), cta.click()]);
  await popup.waitForLoadState();
  expect(popup.url()).toContain(new URL(site.joinFormUrl).host);
});

test("tres pasos visibles: formulario → grupo → primera reunión presencial", async ({
  page,
}) => {
  await page.goto("/unirme/");
  const steps = page.locator("#pasos .pb-step");
  await expect(steps).toHaveCount(3);
  for (const s of await steps.all()) await expect(s).toBeVisible();
  await expect(steps.nth(0)).toContainText(/formulario/i);
  await expect(steps.nth(1)).toContainText(/grupo/i);
  await expect(steps.nth(2)).toContainText(/reuni[oó]n/i);
  await expect(steps.nth(2)).toContainText(/presencial/i);
});

test("todo enlace «unirme» del sitio lleva a /unirme/", async ({ page }) => {
  await page.goto("/eventos/");
  const detail = await page
    .locator('a[href^="/eventos/"]')
    .evaluateAll((as) =>
      as
        .map((a) => a.getAttribute("href")!)
        .find((h) => /^\/eventos\/[^/#?]+\/?$/.test(h)),
    );
  expect(detail, "hay al menos un detalle de evento").toBeTruthy();

  const pages = ["/", "/eventos/", "/equipo/", detail!, "/no-existe-unirme/"];
  for (const path of pages) {
    await page.goto(path);
    const links = await page.locator("a").evaluateAll((as) =>
      as
        .filter((a) => /unirme/i.test(a.textContent ?? ""))
        .map((a) => a.getAttribute("href")),
    );
    if (path !== "/no-existe-unirme/") expect(links.length, `${path} tiene enlaces «unirme»`).toBeGreaterThan(0);
    for (const href of links) expect(href, `${path}`).toMatch(/^\/unirme\/?$/);
  }
});
