// Decodificación del titular (DESIGN §4): cada letra muestra glifos hasta su turno y luego queda fija.
import { mulberry32 } from './prng';

export const GLYPHS = '01<>/{}[]#_=+*;';
/** Milisegundos entre cuadros. */
export const FRAME_MS = 45;
const START_MS = 250;
const PER_CHAR_MS = 38;

/** Cuadros de la animación; el último es siempre el texto real. Los espacios no cambian. */
export function decodeFrames(text: string, seed: number): string[] {
  const rnd = mulberry32(seed);
  const chars = [...text];
  const end = START_MS + chars.length * PER_CHAR_MS;
  const frames: string[] = [];
  for (let t = 0; t < end; t += FRAME_MS) {
    frames.push(chars.map((c, i) => (c === ' ' || t >= START_MS + i * PER_CHAR_MS ? c : GLYPHS[Math.floor(rnd() * GLYPHS.length)])).join(''));
  }
  frames.push(text);
  return frames;
}
