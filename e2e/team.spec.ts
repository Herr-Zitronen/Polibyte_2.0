// H7.1 · Directiva. La página real (/equipo/) para el layout; /lab/board/ fija miembros con y sin redes.
import { expect, test } from "@playwright/test";

type Box = { x: number; y: number; width: number; height: number };
const boxes = async (
  page: import("@playwright/test").Page,
): Promise<[Box, Box, Box, Box, Box, Box]> => {
  const cards = page.locator("#directiva .pb-mem");
  await expect(cards).toHaveCount(6);
  return (await Promise.all(
    (await cards.all()).map(async (c) => (await c.boundingBox())!),
  )) as [Box, Box, Box, Box, Box, Box];
};

test("orden por cargo", async ({ page }) => {
  await page.goto("/equipo/");
  await expect(page.locator("#directiva .pb-role")).toHaveText([
    "Presidencia",
    "Vicepresidencia",
    "Secretaría",
    "Tesorería",
    "Webmaster",
    "Creative Director",
  ]);
});

test("1440: 3 arriba y 3 abajo, todas del mismo tamaño", async ({
  page,
}) => {
  test.skip(page.viewportSize()!.width !== 1440, "solo 1440");
  await page.goto("/equipo/");
  const b = await boxes(page);
  for (const x of b) {
    expect(Math.abs(x.width - b[0].width)).toBeLessThanOrEqual(1);
    expect(Math.abs(x.height - b[0].height)).toBeLessThanOrEqual(1);
  }
  expect(Math.abs(b[1].y - b[0].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(b[2].y - b[0].y)).toBeLessThanOrEqual(1);
  expect(b[3].y).toBeGreaterThan(b[0].y + b[0].height - 1);
  expect(Math.abs(b[4].y - b[3].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(b[5].y - b[3].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(b[3].x - b[0].x)).toBeLessThanOrEqual(1);
  expect(Math.abs(b[5].x - b[2].x)).toBeLessThanOrEqual(1);
});

test("390: dos por fila, tres filas", async ({ page }) => {
  test.skip(page.viewportSize()!.width !== 390, "solo 390");
  await page.goto("/equipo/");
  const b = await boxes(page);
  expect(Math.abs(b[0].y - b[1].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(b[2].y - b[3].y)).toBeLessThanOrEqual(1);
  expect(Math.abs(b[4].y - b[5].y)).toBeLessThanOrEqual(1);
  expect(b[2].y).toBeGreaterThan(b[0].y);
  expect(b[4].y).toBeGreaterThan(b[2].y);
  expect(Math.abs(b[4].x - b[0].x)).toBeLessThanOrEqual(1);
});

test("miembro sin foto: SVG de iniciales en pixel art con nombre accesible", async ({
  page,
}) => {
  await page.goto("/lab/board/");
  const ini = page.locator(".pb-mem").first().locator("svg.pb-ini");
  await expect(ini).toHaveAttribute("role", "img");
  await expect(ini).toHaveAttribute(
    "aria-label",
    "Iniciales de María José Pérez",
  );
  expect(await ini.locator("rect").count()).toBeGreaterThan(5);
});

test("redes: los 3 enlaces con el mismo estilo; si falta uno, no aparece", async ({
  page,
}) => {
  await page.goto("/lab/board/");
  const full = page.locator(".pb-mem").first().locator(".pb-social a");
  await expect(full).toHaveText(["Instagram", "LinkedIn", "GitHub"]);
  const styles = await full.evaluateAll((els) =>
    els.map((e) => {
      const s = getComputedStyle(e);
      return [
        e.className,
        s.fontSize,
        s.fontWeight,
        s.color,
        s.textDecorationLine,
        s.fontFamily,
      ].join("|");
    }),
  );
  expect(new Set(styles).size).toBe(1);
  await expect(
    page.locator(".pb-mem").nth(1).locator(".pb-social a"),
  ).toHaveText(["GitHub"]);
});

test("captura de la directiva", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/equipo/");
  await page.evaluate(() => document.fonts.ready);
  // La barra fija se superpone al recorte según el scroll: se oculta para una captura estable.
  await page.addStyleTag({ content: ".pb-hdr { display: none !important; }" });
  await expect(page.locator("#directiva")).toHaveScreenshot("directiva.png");
});
