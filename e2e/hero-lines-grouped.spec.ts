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

/** Píxeles que difieren en más de 24 niveles en algún canal. */
async function diffPixels(a: Buffer, b: Buffer): Promise<number> {
  const [ra, rb] = await Promise.all([sharp(a).raw().toBuffer(), sharp(b).raw().toBuffer()]);
  expect(ra.length).toBe(rb.length);
  let n = 0;
  for (let i = 0; i < ra.length; i += 4) {
    if (Math.abs(ra[i]! - rb[i]!) > 24 || Math.abs(ra[i + 1]! - rb[i + 1]!) > 24 || Math.abs(ra[i + 2]! - rb[i + 2]!) > 24) n++;
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
    expect(await diffPixels(after.shot, before.shot), `píxeles distintos al ${p * 100} %`).toBeLessThanOrEqual(40);
  }
});
