import { describe, expect, it } from 'vitest';
import { GLYPHS, decodeFrames, decodeDuration, FRAME_MS } from './decode';

describe('decodeFrames', () => {
  it('termina en el texto real', () => {
    const f = decodeFrames('PoliByte', 7);
    expect(f.at(-1)).toBe('PoliByte');
    expect(f.length).toBeGreaterThan(2);
  });

  it('los cuadros intermedios usan glifos y conservan la longitud', () => {
    const f = decodeFrames('PoliByte', 7);
    expect(f[0]).toHaveLength(8);
    expect([...f[0]!].every((c) => GLYPHS.includes(c))).toBe(true);
  });

  it('nunca cambia los espacios', () => {
    const text = 'Construimos software. Y a quienes';
    for (const fr of decodeFrames(text, 3)) {
      [...text].forEach((c, i) => {
        if (c === ' ') expect(fr[i]).toBe(' ');
      });
    }
  });

  it('es determinista con la misma semilla', () => {
    expect(decodeFrames('abc', 1)).toEqual(decodeFrames('abc', 1));
  });
});

describe('decodeDuration', () => {
  it('el titular completo se muestra en ~0,92 s (50 % de los 1,85 s originales)', () => {
    const letters = 'Construimossoftware.Yaquienesloconstruyen.'.length; // 42 letras sin espacios
    expect(decodeDuration(letters)).toBe(923);
    // Los cuadros cubren esa duración y nada más (± un cuadro).
    const frames = decodeFrames('x'.repeat(letters), 1);
    expect((frames.length - 1) * FRAME_MS).toBeGreaterThanOrEqual(923);
    expect((frames.length - 2) * FRAME_MS).toBeLessThan(923);
  });
});
