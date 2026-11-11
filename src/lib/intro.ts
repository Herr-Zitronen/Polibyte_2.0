// Pantalla de entrada de Inicio (perf/fluidez-real): el isotipo se ensambla en píxeles y una franja
// barre hacia arriba. Tapa el primer segundo, cuando el navegador decodifica el nevado, carga las
// fuentes y crea las capas de la portada. Aquí vive lo que se puede probar: tiempos y dibujo.
import { mulberry32 } from './prng';

/** Tiempos (ms). Total = espera + salida: entre 1.2 y 1.8 s. */
export const INTRO = {
  /** Mínimo antes de salir: el ensamblaje termina y no parpadea. */
  minMs: 800,
  /** Tope: aunque fuentes o imagen no hayan llegado, la entrada se va. */
  capMs: 1400,
  /** Duración del barrido de salida. */
  exitMs: 400,
} as const;

/** Cuándo empieza la salida (ms desde el arranque), según cuándo quedó todo listo (`null`: nunca avisó). */
export function introExitAt(readyMs: number | null): number {
  if (readyMs === null) return INTRO.capMs;
  return Math.min(INTRO.capMs, Math.max(INTRO.minMs, readyMs));
}

/** La «P» de PoliByte en ASCII. */
export const INTRO_BITS = '01010000';

/** Isotipo en 9 × 12: X = pieza blanca, C = núcleo. */
export const INTRO_MAP = [
  'XX.....XX',
  'XX.....XX',
  '.........',
  'XXXX.XXXX',
  'XX.....XX',
  'XX.....XX',
  'XX.CCC.XX',
  'XX.CCC.XX',
  'XX.....XX',
  'XX.....XX',
  'XX.....XX',
  'XXXX.XXXX',
] as const;

export type IntroPiece = 'dot' | 'left' | 'right' | 'core' | 'empty';

export interface IntroCell {
  piece: IntroPiece;
  /** Retardo propio (s) dentro de su pieza: los píxeles llegan uno a uno. */
  delay: number;
}

/** Celdas de la rejilla, fila a fila. Los bits caen, las llaves entran por los lados, el núcleo parpadea. */
export function introCells(seed: number): IntroCell[] {
  const rand = mulberry32(seed);
  return INTRO_MAP.flatMap((row, y) =>
    [...row].map((ch, x): IntroCell => {
      if (ch === 'C') return { piece: 'core', delay: 0 };
      if (ch !== 'X') return { piece: 'empty', delay: 0 };
      return { piece: y < 2 ? 'dot' : x < 4 ? 'left' : 'right', delay: Math.round(rand() * 12) / 100 };
    }),
  );
}
