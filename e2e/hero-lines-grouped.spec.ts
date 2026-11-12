// perf/scroll-fino · Las líneas verticales cortas del centro del hero viven dentro del grupo con el que viajan
// (.pb-tlg / .pb-blg): una animación de scroll y una capa menos por línea.
// Reemplaza a la prueba que comparaba contra una reconstrucción de la estructura anterior, que ya no existe y
// cuyo resultado dependía de cómo se rearmaba en el DOM. Aquí se comprueba la estructura actual y su geometría;
// el dibujo lo protegen las capturas base al 0, 40 y 90 % del recorrido.
import { expect, test, type Page } from '@playwright/test';

const POSITIONS = [0, 0.4, 0.9] as const;

// Lo que cambia con el tiempo (barridos, nodos, trazos de entrada) se congela para que la captura sea estable.
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

test('las líneas centrales viven en su grupo y no tienen animación de scroll propia', async ({ page }) => {
  await page.goto('/');
  const cvl = page.locator('.pb-hero .pb-cvl');
  await expect(cvl).toHaveCount(2);
  await expect(page.locator('.pb-hero .pb-tlg > .pb-cvl')).toHaveCount(1);
  await expect(page.locator('.pb-hero .pb-blg > .pb-cvl')).toHaveCount(1);
  for (const name of await cvl.evaluateAll((els) => els.map((el) => getComputedStyle(el).animationName))) {
    expect(name).toBe('none');
  }
});

test('las líneas centrales siguen a su grupo en todo el recorrido', async ({ page }) => {
  test.setTimeout(60_000);
  await page.goto('/');
  await page.waitForSelector('[data-decode][data-decoded]', { timeout: 6000 });
  // data-drawn cambia el estado del hero (suelta las entradas); sin esperarlo la captura dependía del momento.
  await page.waitForSelector('.pb-hero[data-drawn]', { timeout: 8000 });
  await page.addStyleTag({ content: FREEZE });
  await page.waitForTimeout(1200); // entradas de la barra y del titular

  for (const p of POSITIONS) {
    await scrollToLines(page, p);
    await page.waitForTimeout(300);
    // Cada línea va en left: 10/9 del ancho de su grupo (hero.css): viaja con el grupo, sea cual sea su transform.
    const geo = await page.evaluate(() =>
      [...document.querySelectorAll<HTMLElement>('.pb-hero .pb-cvl')].map((el) => {
        const r = el.getBoundingClientRect();
        const g = el.parentElement!.getBoundingClientRect();
        return { x: r.x, expected: g.x + (g.width * 10) / 9 };
      }),
    );
    for (const [j, l] of geo.entries()) {
      expect(Math.abs(l.x - l.expected), `línea ${j} sigue a su grupo al ${p * 100} %`).toBeLessThanOrEqual(1);
    }
    await expect(page, `captura base del hero al ${p * 100} %`).toHaveScreenshot(`hero-lines-${p * 100}.png`, {
      maxDiffPixelRatio: 0.002,
      // La cuenta atrás y la barra de progreso del próximo evento cambian con la hora: sin máscara, la captura
      // caduca cada día (días, horas, bits y celdas llenas).
      mask: [page.locator('.pb-pc-mid'), page.locator('.pb-prog')],
    });
  }
});
