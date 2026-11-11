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

// perf/fluidez-real: Lenis vuelve en escritorio; su rAF solo corre mientras hay movimiento.
test("sin movimiento reducido, Lenis da el scroll con inercia (solo con cursor)", async ({ page }, info) => {
  test.skip(info.project.name === "mobile-390", "en táctil se usa el scroll nativo (F12)");
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as { lenis?: object }).lenis === "object")).toBe(true);
  await expect(page.locator("html")).toHaveCSS("scroll-behavior", "auto");
});

test("en táctil no se carga Lenis", async ({ page }, info) => {
  test.skip(info.project.name !== "mobile-390", "solo celular");
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(await page.evaluate(() => (window as unknown as { lenis?: object }).lenis)).toBeUndefined();
});

test("en reposo Lenis no pide cuadros; con la rueda sí, y vuelve a parar", async ({ page }, info) => {
  test.skip(info.project.name === "mobile-390", "en táctil no hay Lenis");
  await page.addInitScript(() => {
    const w = window as unknown as { __raf: number };
    w.__raf = 0;
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = (cb) => (w.__raf++, raf(cb));
  });
  await page.goto("/");
  await expect.poll(() => page.evaluate(() => typeof (window as unknown as { lenis?: object }).lenis === "object")).toBe(true);
  await page.waitForTimeout(4000); // entrada del titular terminada, bucle dormido
  const count = () => page.evaluate(() => (window as unknown as { __raf: number }).__raf);
  const idle0 = await count();
  await page.waitForTimeout(1000);
  expect((await count()) - idle0, "cuadros pedidos en 1 s de reposo").toBeLessThan(5);
  await page.mouse.move(600, 400);
  const before = await count();
  await page.mouse.wheel(0, 600);
  await page.waitForTimeout(600);
  // El runner de Actions rasteriza sin GPU y da ~16 cuadros/s: se exige que pida al menos tantos como el
  // tope del reposo (5). Que el scroll ocurrió lo prueba scrollY.
  expect((await count()) - before, "cuadros pedidos durante el scroll").toBeGreaterThanOrEqual(5);
  expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(100);
  await page.waitForTimeout(2500);
  const idle1 = await count();
  await page.waitForTimeout(1000);
  expect((await count()) - idle1, "cuadros pedidos al volver al reposo").toBeLessThan(5);
});

test.describe("con movimiento reducido", () => {
  test.use({ reducedMotion: "reduce" });

  test("sin Lenis, sin animación de transiciones y todo visible", async ({ page }) => {
    for (const p of PAGES) {
      await page.goto(p);
      await page.waitForLoadState("networkidle");
      expect(await page.evaluate(() => "lenis" in window), p).toBe(false);
      await expect(page.locator("html"), p).toHaveCSS("scroll-behavior", "auto");
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
    // Solo páginas estables: Inicio cambia cada día (cuenta regresiva) y /equipo/ cambiará con H7.2 (tutor).
    for (const [name, p] of [["unirme", "/unirme/"]] as const) {
      await page.goto(p);
      await page.evaluate(() => document.fonts.ready);
      await expect(page).toHaveScreenshot(`${name}-reduced.png`, { fullPage: true });
    }
  });
});
