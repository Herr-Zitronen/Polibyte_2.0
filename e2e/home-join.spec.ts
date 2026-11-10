// F1 · Inicio: sección «Abierto a todos» antes del pie y «Calendario completo» al calendario.
import { expect, test } from "@playwright/test";

test("#unirme está justo antes del pie y lleva a /unirme/", async ({ page }) => {
  await page.goto("/");
  const section = page.locator("main #unirme");
  await expect(section).toHaveCount(1);
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Abierto a todos. Sin requisitos.");
  await expect(section.getByRole("link", { name: "Quiero unirme" })).toHaveAttribute("href", "/unirme/");
  // Es la última sección de <main>, es decir, la que queda antes del pie.
  const lastId = await page.locator("main > section").last().getAttribute("id");
  expect(lastId).toBe("unirme");
});

test("«Calendario completo» lleva a /eventos/#calendario y esa sección existe", async ({ page, request }) => {
  await page.goto("/");
  const links = page.getByRole("link", { name: "Calendario completo" });
  expect(await links.count()).toBeGreaterThan(0);
  for (const l of await links.all()) await expect(l).toHaveAttribute("href", "/eventos/#calendario");
  const html = await (await request.get("/eventos/")).text();
  expect(html).toContain('id="calendario"');
});
