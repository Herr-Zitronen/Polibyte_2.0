// H1.4 · Sin costuras entre la franja y las secciones vecinas (muestreo de píxeles reales).
import { expect, test, type Page } from '@playwright/test';
import sharp from 'sharp';
import { COLS, pixelRuns } from '../../src/lib/pixel-strip';

const TOP = [0x1a, 0x2c, 0x78];
const BOTTOM = [0xec, 0xef, 0xf6];

async function rgbAt(page: Page, x: number, y: number): Promise<number[]> {
  const png = await page.screenshot({ clip: { x: Math.round(x), y: Math.round(y), width: 1, height: 1 } });
  const { data } = await sharp(png).raw().toBuffer({ resolveWithObject: true });
  return [data[0]!, data[1]!, data[2]!];
}

test('la franja empalma con ambas secciones sin costura', async ({ page }) => {
  await page.goto('/lab/pixel-strip/');
  const strip = page.locator('.pb-div');
  await strip.scrollIntoViewIfNeeded();
  const box = (await strip.boundingBox())!;
  const cell = box.width / COLS;
  const rowH = box.height / 4;
  const runs = pixelRuns(3);
  const covered = (row: number, col: number) => runs.some((r) => r.row === row && col >= r.x && col < r.x + r.cells);

  // Fila 0: una columna sin celda inferior → color de arriba, igual que la sección de arriba.
  const freeCol = [...Array(COLS).keys()].find((c) => !covered(0, c) && (c === 0 || !covered(0, c - 1)))!;
  const x0 = box.x + (freeCol + 0.5) * cell;
  expect(await rgbAt(page, x0, box.y - 2)).toEqual(TOP);
  expect(await rgbAt(page, x0, box.y + 1)).toEqual(TOP);
  expect(await rgbAt(page, x0, box.y + rowH / 2)).toEqual(TOP);

  // Fila 3: una columna con celda inferior → color de abajo, igual que la sección de abajo.
  const fullCol = [...Array(COLS).keys()].find((c) => covered(3, c))!;
  const x3 = box.x + (fullCol + 0.5) * cell;
  expect(await rgbAt(page, x3, box.y + box.height - rowH / 2)).toEqual(BOTTOM);
  expect(await rgbAt(page, x3, box.y + box.height - 1)).toEqual(BOTTOM);
  expect(await rgbAt(page, x3, box.y + box.height + 2)).toEqual(BOTTOM);
});

test('captura de la franja', async ({ page }) => {
  await page.goto('/lab/pixel-strip/');
  await expect(page.locator('.pb-div')).toHaveScreenshot('pixel-strip.png');
});
