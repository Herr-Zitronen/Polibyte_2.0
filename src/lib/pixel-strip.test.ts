// H1.4 · Franja de píxeles (DESIGN §3.7).
import { describe, expect, it } from 'vitest';
import { mulberry32 } from './prng';
import { PROBS, pixelRuns, pixelStrip } from './pixel-strip';

const take = (r: () => number, n: number) => Array.from({ length: n }, r);

describe('mulberry32', () => {
  it('misma semilla → misma secuencia', () => expect(take(mulberry32(42), 20)).toEqual(take(mulberry32(42), 20)));
  it('semillas distintas → secuencias distintas', () => expect(take(mulberry32(42), 20)).not.toEqual(take(mulberry32(43), 20)));
  it('valores en [0, 1)', () => {
    for (const v of take(mulberry32(7), 1000)) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });
});

describe('pixelStrip', () => {
  const opts = { seed: 3, top: '#1A2C78', bottom: '#ECEFF6' };

  it('es determinista', () => {
    expect(pixelStrip(opts)).toBe(pixelStrip(opts));
    expect(pixelStrip(opts)).toMatchSnapshot();
  });

  it('viewBox 0 0 36 4 y preserveAspectRatio none', () => {
    const svg = pixelStrip(opts);
    expect(svg).toContain('viewBox="0 0 36 4"');
    expect(svg).toContain('preserveAspectRatio="none"');
  });

  it('solo usa los dos colores', () => {
    const fills = new Set([...pixelStrip(opts).matchAll(/fill="([^"]+)"/g)].map((m) => m[1]));
    expect(fills).toEqual(new Set([opts.top, opts.bottom]));
  });

  it('con top transparente solo pinta las celdas inferiores', () => {
    const svg = pixelStrip({ ...opts, top: 'transparent' });
    const fills = new Set([...svg.matchAll(/fill="([^"]+)"/g)].map((m) => m[1]));
    expect(fills).toEqual(new Set([opts.bottom]));
  });
});

describe('pixelRuns', () => {
  it('fusiona corridas: nunca dos rects contiguos en la misma fila', () => {
    for (let seed = 0; seed < 200; seed++) {
      const runs = pixelRuns(seed);
      for (let row = 0; row < 4; row++) {
        const inRow = runs.filter((r) => r.row === row).sort((a, b) => a.x - b.x);
        for (let i = 1; i < inRow.length; i++) {
          const prev = inRow[i - 1]!;
          expect(inRow[i]!.x).toBeGreaterThan(prev.x + prev.cells);
        }
      }
    }
  });

  it('solapa 0.04 para evitar costuras', () => {
    const svg = pixelStrip({ seed: 3, top: 'a', bottom: 'b' });
    const run = pixelRuns(3)[0]!;
    expect(svg).toContain(`width="${run.cells + 0.04}" height="1.04"`);
  });

  it('la proporción por fila se acerca a [0.07, 0.30, 0.62, 0.90] (500 semillas)', () => {
    const on = [0, 0, 0, 0];
    for (let seed = 0; seed < 500; seed++) for (const r of pixelRuns(seed)) on[r.row]! += r.cells;
    on.forEach((count, row) => expect(Math.abs(count / (500 * 36) - PROBS[row]!)).toBeLessThanOrEqual(0.05));
  });
});
