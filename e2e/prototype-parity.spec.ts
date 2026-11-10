// V1 · Verificación contra el prototipo: lee design/*.dc.html y exige que cada sección (id) exista en la
// página real. Los títulos fijos del prototipo que no aparezcan se reportan como hallazgos (anotaciones).
import { readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";

const read = (f: string) => readFileSync(new URL(`../design/${f}.dc.html`, import.meta.url), "utf8");

/** Prototipo → página real. */
const PAIRS: Record<string, string> = {
  Main: "/",
  Eventos: "/eventos/",
  EventoDetalle: "/eventos/imagine-cup-2027/",
  Equipo: "/equipo/",
  Unirme: "/unirme/",
  NoEncontrado: "/no-existe/",
};
/** Secciones condicionales (dependen de los datos): se aceptan si existen en su fixture de /lab/. */
const FIXTURE: Record<string, string> = {
  recap: "/lab/recap/",
  destacados: "/lab/showcase/",
  cronograma: "/lab/event-detail/upcoming/",
  inscripcion: "/lab/event-detail/upcoming/",
};

const sectionIds = (html: string) =>
  [...html.matchAll(/<(?:section|footer|main)\b[^>]*\sid="([^"]+)"/g)].map((m) => m[1]!);

const staticHeadings = (html: string) =>
  [...html.matchAll(/<h[123]\b[^>]*>([^<{]{4,})<\/h[123]>/g)].map((m) => m[1]!.replace(/\s+/g, " ").trim());

for (const [proto, path] of Object.entries(PAIRS)) {
  test(`${proto}: todas sus secciones existen en ${path}`, async ({ page, request }) => {
    test.skip(page.viewportSize()!.width !== 1440, "no depende del ancho");
    const html = read(proto);
    const ids = sectionIds(html);
    expect(ids.length, `${proto} tiene secciones`).toBeGreaterThan(0);
    await page.goto(path);
    const missing: string[] = [];
    for (const id of ids) {
      if ((await page.locator(`[id="${id}"]`).count()) > 0) continue;
      const fx = FIXTURE[id];
      if (fx && (await (await request.get(fx)).text()).includes(`id="${id}"`)) {
        test.info().annotations.push({ type: "condicional", description: `#${id} solo aparece con datos (fixture ${fx})` });
        continue;
      }
      missing.push(id);
    }
    expect(missing, `Secciones del prototipo ${proto} que faltan en ${path}`).toEqual([]);
  });

  test(`${proto}: títulos fijos del prototipo (informe)`, async ({ page }) => {
    test.skip(page.viewportSize()!.width !== 1440, "no depende del ancho");
    await page.goto(path);
    const body = (await page.locator("body").innerText()).replace(/\s+/g, " ").toLowerCase();
    for (const h of staticHeadings(read(proto))) {
      if (!body.includes(h.toLowerCase())) {
        test.info().annotations.push({ type: "hallazgo", description: `«${h}» (de ${proto}) no aparece en ${path}` });
      }
    }
  });
}

test("Compartir y Favicon: la imagen OG y los iconos existen", async ({ request }) => {
  for (const p of ["/og/inicio.png", "/favicon.svg", "/favicon.ico", "/apple-touch-icon.png"]) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
});
