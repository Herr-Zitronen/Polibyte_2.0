// H2.4 · Scroll suave y transiciones (DESIGN §4.1). El título viajero se prueba con fixtures en /lab/
// (Imagine Cup en Inicio depende de la fecha); las reglas globales, sobre las páginas reales.
import { expect, test, type Page } from "@playwright/test";

const PAGES = ["/", "/eventos/", "/equipo/", "/unirme/", "/eventos/imagine-cup-2027/"];
const vtn = (page: Page, sel: string, pseudo?: string) =>
  page.locator(sel).first().evaluate((el, ps) => getComputedStyle(el, ps).viewTransitionName, pseudo ?? null);
const evTitles = (page: Page) =>
  page.evaluate(
    () => [...document.querySelectorAll("body *")].filter((el) => getComputedStyle(el).viewTransitionName === "pb-evtitle").length,
  );

test("View Transitions entre documentos: barra quieta y subrayado que se desliza", async ({ page }) => {
  await page.goto("/eventos/");
  const css = (await page.content()).replace(/\s+/g, "");
  expect(css).toContain("@view-transition{navigation:auto");
  expect(await vtn(page, ".pb-bar-in")).toBe("pb-header");
  test.skip(page.viewportSize()!.width < 821, "el menú de escritorio se oculta en móvil");
  // El nombre va en el subrayado (::after) del enlace actual: es lo que se desliza al link nuevo.
  expect(await vtn(page, '.pb-nav a[aria-current="page"]', "::after")).toBe("pb-navcur");
});

test("el título del evento viaja del panel de Inicio al h1 del detalle", async ({ page }) => {
  await page.goto("/lab/transitions/");
  expect(await vtn(page, "#proximo .pb-pname")).toBe("pb-evtitle");
  expect(await evTitles(page)).toBe(1);
  await page.goto("/lab/event-detail/upcoming/");
  expect(await vtn(page, "h1")).toBe("pb-evtitle");
  expect(await evTitles(page)).toBe(1);
});

test("como mucho un pb-evtitle por página", async ({ page }) => {
  for (const p of PAGES) {
    await page.goto(p);
    expect(await evTitles(page), p).toBeLessThanOrEqual(1);
  }
});

test("sin movimiento reducido, Lenis da el scroll con inercia", async ({ page }) => {
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => "lenis" in window)).toBe(true);
});

test.describe("con movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("sin Lenis, sin animación de transiciones y todo visible", async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => "lenis" in window), p).toBe(false);
      const vtNone = await page.evaluate(() =>
        [...document.styleSheets].some((s) => {
          try {
            return [...s.cssRules].some(
              (r) =>
                r instanceof CSSMediaRule &&
                /prefers-reduced-motion:\s*reduce/.test(r.conditionText) &&
                [...r.cssRules].some(
                  (x) =>
                    x instanceof CSSStyleRule &&
                    x.selectorText.includes("::view-transition-group(*)") &&
                    x.style.getPropertyValue("animation-name") === "none",
                ),
            );
          } catch {
            return false;
          }
        }),
      );
      expect(vtNone, `${p}: ::view-transition-* sin animación`).toBe(true);
      const reveals = page.locator("[data-reveal]");
      if (p === "/" || p === "/unirme/") expect(await reveals.count(), `${p} tiene reveals`).toBeGreaterThan(0);
      for (const r of await reveals.all()) {
        expect(await r.evaluate((el) => getComputedStyle(el).opacity), p).toBe("1");
      }
    }
  });

  test("capturas con movimiento reducido", async ({ page }) => {
    for (const [name, p] of [["inicio", "/"], ["unirme", "/unirme/"]] as const) {
      await page.goto(p);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}-reduced.png`, { fullPage: true, mask: [page.locator("[data-countdown]")] });
    }
  });
});
