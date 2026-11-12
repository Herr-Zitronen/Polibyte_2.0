import { describe, expect, it } from 'vitest';
import { GLYPH_H, GLYPH_W, glyph, pixelText } from './pixel-font';

describe('pixel-font', () => {
  it('tiene un glifo de 5×5 para cada letra A–Z', () => {
    for (const ch of 'ABCDEFGHIJKLMNOPQRSTUVWXYZ') {
      const g = glyph(ch);
      expect(g, ch).toHaveLength(GLYPH_H);
      g.forEach((row) => expect(row).toHaveLength(GLYPH_W));
      expect(g.join('')).toContain('1');
    }
  });
  it('un carácter desconocido no dibuja nada', () => {
    expect(glyph('?').join('')).not.toContain('1');
  });
  it('pixelText coloca las letras con un píxel de separación', () => {
    const t = pixelText('MP');
    expect(t.width).toBe(GLYPH_W * 2 + 1);
    expect(t.height).toBe(GLYPH_H);
    expect(t.cells.every((c) => c.x >= 0 && c.x < t.width && c.y >= 0 && c.y < t.height)).toBe(true);
    expect(t.cells.some((c) => c.x > GLYPH_W)).toBe(true);
  });
  it('es determinista', () => {
    expect(pixelText('NA')).toEqual(pixelText('NA'));
  });
});
