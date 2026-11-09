// H0.2 · Presupuestos de rendimiento: Lighthouse CI rompe el build si no se cumplen.
import { createRequire } from 'node:module';
import { describe, expect, it } from 'vitest';

const require = createRequire(import.meta.url);
type Assertion = [string, { minScore?: number; maxNumericValue?: number }];
const lhrc = require('../lighthouserc.cjs') as {
  ci: { collect: { numberOfRuns: number }; assert: { assertions: Record<string, Assertion> } };
};
const a = lhrc.ci.assert.assertions;

describe('H0.2 · presupuestos en lighthouserc.cjs', () => {
  it('LCP < 2000 ms es error', () => {
    expect(a['largest-contentful-paint']).toEqual(['error', expect.objectContaining({ maxNumericValue: 2000 })]);
  });

  it('CLS < 0.05 es error', () => {
    expect(a['cumulative-layout-shift']).toEqual(['error', expect.objectContaining({ maxNumericValue: 0.05 })]);
  });

  it('rendimiento ≥ 0.9 es error', () => {
    expect(a['categories:performance']).toEqual(['error', expect.objectContaining({ minScore: 0.9 })]);
  });

  it('usa la mediana de 3 ejecuciones', () => {
    expect(lhrc.ci.collect.numberOfRuns).toBe(3);
  });
});
