// H9.1 · Metadatos, OG, favicon y sitemap. Las rutas públicas salen del propio sitemap.
import { expect, test, type APIRequestContext } from "@playwright/test";
import { pngSize } from "../src/lib/seo";

const publicPaths = async (request: APIRequestContext): Promise<string[]> => {
  const index = await (await request.get("/sitemap-index.xml")).text();
  const maps = [...index.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]!).pathname);
  const paths: string[] = [];
  for (const m of maps) {
    const xml = await (await request.get(m)).text();
    paths.push(...[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => new URL(x[1]!).pathname));
  }
  // Sin rutas, las pruebas de abajo pasarían sin revisar nada.
  expect(paths.length, "el sitemap tiene rutas").toBeGreaterThan(0);
  return paths;
};

test("el sitemap incluye las rutas públicas y excluye /lab/ y la 404", async ({ request }) => {
  const paths = await publicPaths(request);
  for (const p of ["/", "/eventos/", "/equipo/", "/unirme/"]) expect(paths).toContain(p);
  expect(paths.some((p) => /^\/eventos\/[^/]+\/$/.test(p)), "algún detalle de evento").toBe(true);
  expect(paths.filter((p) => p.startsWith("/lab/") || p.startsWith("/_lab/"))).toEqual([]);
  expect(paths.filter((p) => /^\/404\/?$/.test(p))).toEqual([]);
});

test("cada página pública tiene título único y metadatos para compartir", async ({ page, request }) => {
  test.skip(page.viewportSize()!.width !== 1440, "no depende del ancho");
  const titles = new Set<string>();
  const paths = await publicPaths(request);
  for (const path of paths) {
    await page.goto(path);
    const title = await page.title();
    expect(title, path).not.toBe("");
    expect(titles.has(title), `título repetido: ${title}`).toBe(false);
    titles.add(title);
    const meta = (sel: string) => page.locator(sel).first().getAttribute("content");
    expect(await meta('meta[name="description"]'), path).toBeTruthy();
    expect(await meta('meta[property="og:title"]'), path).toBeTruthy();
    expect(await meta('meta[property="og:description"]'), path).toBeTruthy();
    expect(await meta('meta[property="og:image"]'), path).toMatch(/^https?:\/\/[^/]+\/og\/.+\.png$/);
    expect(await meta('meta[name="twitter:card"]'), path).toBe("summary_large_image");
    const canonical = await page.locator('link[rel="canonical"]').getAttribute("href");
    expect(canonical, path).toMatch(/^https?:\/\//);
    expect(new URL(canonical!).pathname, path).toBe(path);
  }
});

test("las imágenes OG responden PNG de 1200×630", async ({ page, request }) => {
  test.skip(page.viewportSize()!.width !== 1440, "no depende del ancho");
  const paths = await publicPaths(request);
  for (const path of paths) {
    await page.goto(path);
    const og = await page.locator('meta[property="og:image"]').getAttribute("content");
    const res = await request.get(new URL(og!).pathname);
    expect(res.status(), og!).toBe(200);
    expect(res.headers()["content-type"]).toContain("image/png");
    expect(pngSize(new Uint8Array(await res.body()))).toEqual({ width: 1200, height: 630 });
  }
});

test("favicons y manifiesto", async ({ page, request }) => {
  test.skip(page.viewportSize()!.width !== 1440, "no depende del ancho");
  for (const p of ["/favicon.ico", "/favicon.svg", "/apple-touch-icon.png", "/icon-192.png", "/icon-512.png"]) {
    expect((await request.get(p)).status(), p).toBe(200);
  }
  const sizes: Record<string, number> = { "/apple-touch-icon.png": 180, "/icon-192.png": 192, "/icon-512.png": 512 };
  for (const [p, s] of Object.entries(sizes)) {
    expect(pngSize(new Uint8Array(await (await request.get(p)).body())), p).toEqual({ width: s, height: s });
  }
  const manifest = await (await request.get("/manifest.webmanifest")).json();
  expect(manifest.name).toBeTruthy();
  expect(manifest.icons.map((i: { sizes: string }) => i.sizes)).toEqual(expect.arrayContaining(["192x192", "512x512"]));

  await page.goto("/");
  await expect(page.locator('link[rel="icon"][type="image/svg+xml"]')).toHaveAttribute("href", "/favicon.svg");
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute("href", "/apple-touch-icon.png");
  await expect(page.locator('link[rel="manifest"]')).toHaveAttribute("href", "/manifest.webmanifest");
});
