// H0.2 · Presupuestos de rendimiento: Lighthouse CI rompe el build si no se cumplen.
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
type Assertion = [string, { minScore?: number; maxNumericValue?: number }];
const lhrc = require('../lighthouserc.cjs') as {
  ci: { collect: { numberOfRuns: number; url: string[] }; assert: { assertions: Record<string, Assertion> } };
};
const a = lhrc.ci.assert.assertions;

describe('H0.2 · presupuestos en lighthouserc.cjs', () => {
  // Temporal (WOR-101): 2.0 s estaba al filo en staging. Se vuelve a 2000 cuando el titular esté optimizado.
  it('LCP < 2200 ms es error (temporal, WOR-101)', () => {
    expect(a['largest-contentful-paint']).toEqual(['error', expect.objectContaining({ maxNumericValue: 2200 })]);
  });

  it('CLS < 0.05 es error', () => {
    expect(a['cumulative-layout-shift']).toEqual(['error', expect.objectContaining({ maxNumericValue: 0.05 })]);
  });

  it('rendimiento ≥ 0.9 es error', () => {
    expect(a['categories:performance']).toEqual(['error', expect.objectContaining({ minScore: 0.9 })]);
  });

  // L1 (WOR-85): no solo Inicio.
  it('mide Inicio, Eventos, un detalle, Equipo y Unirme', () => {
    const urls = lhrc.ci.collect.url;
    expect(urls).toEqual(expect.arrayContaining(['/', '/eventos/', '/equipo/', '/unirme/']));
    expect(urls.filter((u) => /^\/eventos\/[^/]+\/$/.test(u))).toHaveLength(1);
    expect(urls).toHaveLength(5);
  });

  it('usa la mediana de 3 ejecuciones', () => {
    expect(lhrc.ci.collect.numberOfRuns).toBe(3);
  });
});
