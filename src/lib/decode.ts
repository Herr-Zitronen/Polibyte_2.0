// Decodificación del titular (DESIGN §4): cada letra muestra glifos hasta su turno y luego queda fija.
// WOR-101: el texto real nunca se reescribe. Cada letra lleva encima un "carrete" de glifos que el CSS
// hace girar con transform + steps() (compositor, sin JS por cuadro) hasta dejar la letra real a la vista.
import { mulberry32 } from './prng';

export const GLYPHS = '01<>/{}[]#_=+*;';
/** Milisegundos entre cuadros (un glifo por cuadro). */
export const FRAME_MS = 45;
// Mitad de la duración original (250 ms + 38 ms/letra): el titular aparece en ~0,9 s.
const START_MS = 125;
const PER_CHAR_MS = 19;

/** Milisegundos hasta que queda fija la letra en la posición `index` (o la última de `index` letras). */
export function decodeDuration(index: number): number {
  return START_MS + index * PER_CHAR_MS;
}

export interface Reel {
  /** Carácter real. */
  c: string;
  /** Glifos que pasan antes de la letra, en orden (vacío para los espacios). */
  reel: string[];
  /** Duración del giro: un cuadro por glifo. */
  durationMs: number;
}

/** Carretes del titular. Con la misma semilla el resultado es idéntico (HTML estable entre builds). */
export function decodeReels(text: string, seed: number): Reel[] {
  const rnd = mulberry32(seed);
  return [...text].map((c, i) => {
    if (c === ' ') return { c, reel: [], durationMs: 0 };
    const steps = Math.max(1, Math.ceil(decodeDuration(i) / FRAME_MS));
    const reel = Array.from({ length: steps }, () => GLYPHS[Math.floor(rnd() * GLYPHS.length)]!);
    return { c, reel, durationMs: steps * FRAME_MS };
  });
}
