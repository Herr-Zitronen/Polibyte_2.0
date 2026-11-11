// perf/scroll-fino · Las líneas verticales centrales del hero viven dentro del grupo con el que viajan
// (una animación de scroll y una capa menos por línea). El dibujo no puede cambiar: en la misma corrida se
// captura la estructura nueva, se reconstruye en el DOM la anterior (línea aparte con la clase del grupo)
// y se compara, en 3 posiciones del recorrido (0, 40 y 90 %) y en los 3 anchos (proyectos de Playwright).
import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';

const POSITIONS = [0, 0.4, 0.9] as const;

// Lo que cambia con el tiempo (barridos, nodos, trazos de entrada) se congela igual en las dos capturas.
const FREEZE = `
  .pb-hero .pb-flow::after, .pb-hero .pb-node { display: none !important; }
  .pb-hero .pb-line, .pb-hero .pb-vline { animation: none !important; transform: none !important; }
  .pb-sub { animation: none !important; opacity: 1 !important; transform: none !important; }
  *, *::before, *::after { transition: none !important; caret-color: transparent !important; }
`;

/** Recorrido de las líneas: 0 → 0.9375 × altura del hero (hero.css). */
const scrollToLines = (page: Page, p: number) =>
  page.evaluate(async (f) => {
    const h = parseFloat(getComputedStyle(document.querySelector('.pb-hero')!).minHeight);
    scrollTo({ top: Math.round(f * 0.9375 * h), behavior: 'instant' });
    await new Promise((d) => requestAnimationFrame(() => requestAnimationFrame(d)));
  }, p);

const cvlRects = (page: Page) =>
  page.evaluate(() =>
    [...document.querySelectorAll('.pb-hero .pb-cvl, .pb-hero .pb-cvl-old')].map((el) => {
      const r = el.getBoundingClientRect();
      return { x: r.x, y: r.y, w: r.width, h: r.height };
    }),
  );

type Rect = { x: number; y: number; w: number; h: number };

/** Píxeles que difieren en más de 24 niveles en algún canal, FUERA de las líneas (cajas + 2 px).
 *  Dentro de las líneas solo cambia el antialiasing de un trazo de 1.5 px (grupo vs. capa propia: ~1 columna
 *  por línea); su geometría se compara aparte, con ±0.1 px. Fuera de ellas, el dibujo debe ser el mismo. */
async function diffPixelsOutside(a: Buffer, b: Buffer, lines: Rect[], cssWidth: number): Promise<number> {
  const [ia, ib] = await Promise.all([sharp(a).raw().toBuffer({ resolveWithObject: true }), sharp(b).raw().toBuffer()]);
  const { data: ra, info } = ia;
  expect(ra.length).toBe(ib.length);
  const scale = info.width / cssWidth;
  const pad = 2 * scale;
  const boxes = lines.map((r) => ({ x0: r.x * scale - pad, x1: (r.x + r.w) * scale + pad, y0: r.y * scale - pad, y1: (r.y + r.h) * scale + pad }));
  let n = 0;
  for (let i = 0, px = 0; i < ra.length; i += info.channels, px++) {
    const x = px % info.width;
    const y = Math.floor(px / info.width);
    if (boxes.some((b) => x >= b.x0 && x <= b.x1 && y >= b.y0 && y <= b.y1)) continue;
    if (Math.abs(ra[i]! - ib[i]!) > 24 || Math.abs(ra[i + 1]! - ib[i + 1]!) > 24 || Math.abs(ra[i + 2]! - ib[i + 2]!) > 24) n++;
  }
  return n;
}

test('agrupar las líneas centrales no cambia el dibujo del hero (0, 40 y 90 % del recorrido)', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.waitForSelector('[data-decode][data-decoded]', { timeout: 6000 });
  await page.addStyleTag({ content: FREEZE });
  await page.waitForTimeout(1200); // entradas de la barra y del titular

  const now: { shot: Buffer; rects: Awaited<ReturnType<typeof cvlRects>> }[] = [];
  for (const p of POSITIONS) {
    await scrollToLines(page, p);
    await page.waitForTimeout(300);
    now.push({ shot: await page.screenshot(), rects: await cvlRects(page) });
    await expect(page, `captura base del hero al ${p * 100} %`).toHaveScreenshot(`hero-lines-${p * 100}.png`, { maxDiffPixelRatio: 0.002 });
  }
  expect(now[0]!.rects).toHaveLength(2);

  // Estructura anterior: cada línea, elemento aparte con la clase (y la animación) de su grupo.
  await page.evaluate(() => {
    const lines = document.querySelector('.pb-hero__lines')!;
    document.querySelectorAll<HTMLElement>('.pb-hero .pb-cvl').forEach((c) => {
      const top = !!c.closest('.pb-tlg');
      c.className = `${top ? 'pb-tlg' : 'pb-blg'} pb-cvl-old`;
      c.setAttribute('style', top ? 'left: 50%; top: 80px; width: 1.5px; height: 80px' : 'left: 50%; bottom: 82px; width: 1.5px; height: 80px');
      lines.appendChild(c);
    });
  });

  for (const [i, p] of POSITIONS.entries()) {
    await scrollToLines(page, p);
    await page.waitForTimeout(300);
    const before = { shot: await page.screenshot(), rects: await cvlRects(page) };
    const after = now[i]!;
    for (const [j, r] of before.rects.entries()) {
      const q = after.rects[j]!;
      for (const k of ['x', 'y', 'w', 'h'] as const) expect(Math.abs(q[k] - r[k]), `línea ${j}, ${k} al ${p * 100} %`).toBeLessThanOrEqual(0.1);
    }
    const lines = [...before.rects, ...after.rects];
    expect(await diffPixelsOutside(after.shot, before.shot, lines, page.viewportSize()!.width), `píxeles distintos fuera de las líneas al ${p * 100} %`).toBeLessThanOrEqual(40);
  }
});
