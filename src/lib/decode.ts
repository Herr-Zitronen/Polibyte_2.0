// Decodificación del titular (DESIGN §4): cada letra muestra glifos hasta su turno y luego queda fija.
import { mulberry32 } from './prng';

export const GLYPHS = '01<>/{}[]#_=+*;';
/** Milisegundos entre cuadros. */
export const FRAME_MS = 45;
// Mitad de la duración original (250 ms + 38 ms/letra): el titular aparece en ~0,9 s.
const START_MS = 125;
const PER_CHAR_MS = 19;

/** Milisegundos hasta que la última de `letters` letras queda fija. */
export function decodeDuration(letters: number): number {
  return START_MS + letters * PER_CHAR_MS;
}

/** Cuadros de la animación; el último es siempre el texto real. Los espacios no cambian. */
export function decodeFrames(text: string, seed: number): string[] {
  const rnd = mulberry32(seed);
  const chars = [...text];
  const end = decodeDuration(chars.length);
  const frames: string[] = [];
  for (let t = 0; t < end; t += FRAME_MS) {
    frames.push(chars.map((c, i) => (c === ' ' || t >= START_MS + i * PER_CHAR_MS ? c : GLYPHS[Math.floor(rnd() * GLYPHS.length)])).join(''));
  }
  frames.push(text);
  return frames;
}
