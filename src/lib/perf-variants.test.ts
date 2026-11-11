import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { frameStats, PANEL_VARIANTS, parseDiagParam, VARIANTS, variantByName } from './perf-variants';

const read = (p: string) => readFileSync(resolve(import.meta.dirname, '../..', p), 'utf8');

describe('catálogo de variantes de diagnóstico', () => {
  it('nombres únicos, en kebab-case', () => {
    const names = VARIANTS.map((v) => v.name);
    expect(new Set(names).size).toBe(names.length);
    for (const n of names) expect(n).toMatch(/^[a-z]+(-[a-z]+)*$/);
  });

  it('cada variante (salvo la base) trae css o js, y una explicación', () => {
    for (const v of VARIANTS) {
      if (v.name !== 'base') expect(Boolean(v.css || v.js), v.name).toBe(true);
      expect(v.label.length, v.name).toBeGreaterThan(3);
    }
  });

  it('el panel ofrece las diez casillas acordadas, todas del catálogo', () => {
    expect(PANEL_VARIANTS).toEqual([
      'sin-lenis',
      'sin-barridos',
      'sin-nodos',
      'sin-paralaje',
      'sin-backdrop-filter',
      'blur-siempre',
      'sin-scroll-timelines',
      'sin-reveals',
      'sin-cubo',
      'lineas-estaticas',
    ]);
    for (const n of PANEL_VARIANTS) expect(variantByName(n), n).toBeDefined();
  });

  it('parseDiagParam se queda solo con nombres del panel', () => {
    expect(parseDiagParam('sin-lenis,nope,sin-cubo')).toEqual(['sin-lenis', 'sin-cubo']);
    expect(parseDiagParam('')).toEqual([]);
    expect(parseDiagParam(null)).toEqual([]);
  });
});

describe('frameStats', () => {
  it('fps medio, peor cuadro y % de cuadros de más de 20 ms', () => {
    expect(frameStats([10, 10, 10, 30])).toEqual({ fps: 66.7, worstMs: 30, slowPct: 25, frames: 4 });
  });
  it('sin cuadros devuelve ceros', () => {
    expect(frameStats([])).toEqual({ fps: 0, worstMs: 0, slowPct: 0, frames: 0 });
  });
});

describe('uso del catálogo', () => {
  it('home-smoothness.spec.ts usa el catálogo y ya no define variantes propias', () => {
    const spec = read('e2e/home-smoothness.spec.ts');
    expect(spec).toMatch(/from '\.\.\/src\/lib\/perf-variants'/);
    expect(spec).not.toMatch(/const VARIANTS\s*:/);
  });
  it('el panel solo se descarga con ?diag (import dinámico)', () => {
    const base = read('src/layouts/Base.astro');
    expect(base).toMatch(/has\('diag'\)/);
    expect(base).toMatch(/import\('\.\.\/scripts\/diag'\)/);
    expect(base).not.toMatch(/import \{[^}]*\} from '\.\.\/scripts\/diag'/);
  });
  it('el panel es fijo y queda fuera del flujo', () => {
    expect(read('src/scripts/diag.ts')).toMatch(/position:\s*fixed/);
  });
});
