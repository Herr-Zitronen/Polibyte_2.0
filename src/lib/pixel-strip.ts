// Franja de píxeles (DESIGN §3.7): 36 × 4 celdas, dos colores, semilla fija.
import { mulberry32 } from './prng';

export const COLS = 36;
export const PROBS = [0.07, 0.3, 0.62, 0.9] as const;
const OVERLAP = 0.04; // tapa las costuras de subpíxel al escalar

/** Colores sólidos con los que terminan/empiezan las secciones (DESIGN §3.7: deben coincidir con la franja). */
export const EDGE = {
  /** Borde inferior de portadas y del cierre con imagen (`--pb-blue-750`). */
  cover: '#1B2C78',
  navy: '#0F1A4D',
  paper: '#ECEFF6',
  /** Borde superior de las secciones con imagen y de Archivo (`--pb-blue-700`). */
  image: '#22389C',
  /** Borde inferior del Archivo. */
  archive: '#1A2B78',
  /** Fondo del pie de página. */
  footer: '#0D1438',
} as const;

export type Run ={ row: number; x: number; cells: number };

/** Corridas horizontales de celdas del color inferior, ya fusionadas. */
export function pixelRuns(seed: number): Run[] {
  const rand = mulberry32(seed);
  const runs: Run[] = [];
  PROBS.forEach((p, row) => {
    let start = -1;
    for (let i = 0; i <= COLS; i++) {
      const on = i < COLS && rand() < p;
      if (on && start < 0) start = i;
      if (!on && start >= 0) {
        runs.push({ row, x: start, cells: i - start });
        start = -1;
      }
    }
  });
  return runs;
}

export type PixelStripOptions = { seed: number; top: string; bottom: string };

/** SVG de la franja. Con `top: 'transparent'` (variante "palabra detrás") no se pinta el fondo. */
export function pixelStrip({ seed, top, bottom }: PixelStripOptions): string {
  const bg = top === 'transparent' ? '' : `<rect x="0" y="0" width="${COLS}" height="4" fill="${top}"/>`;
  const cells = pixelRuns(seed)
    .map((r) => `<rect x="${r.x}" y="${r.row}" width="${r.cells + OVERLAP}" height="${1 + OVERLAP}" fill="${bottom}"/>`)
    .join('');
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${COLS} 4" preserveAspectRatio="none" aria-hidden="true">${bg}${cells}</svg>`;
}
