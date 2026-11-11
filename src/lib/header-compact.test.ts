import { describe, expect, it } from 'vitest';
import { COMPACT_AT, isCompact } from './header-compact';

describe('isCompact', () => {
  it('umbral de compactación a 24 px de scroll', () => {
    expect(COMPACT_AT).toBe(24);
  });

  it('no compacta en la parte alta de la página', () => {
    expect(isCompact(0)).toBe(false);
    expect(isCompact(23)).toBe(false);
  });

  it('compacta desde el umbral en adelante', () => {
    expect(isCompact(24)).toBe(true);
    expect(isCompact(1200)).toBe(true);
  });
});
