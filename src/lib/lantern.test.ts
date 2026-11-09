import { describe, expect, it } from 'vitest';
import { lanternPoint } from './lantern';

describe('lanternPoint', () => {
  it('convierte el cursor a coordenadas locales del wordmark, redondeadas', () => {
    expect(lanternPoint({ x: 310.6, y: 240.2 }, { left: 100, top: 200 })).toEqual({ x: 211, y: 40 });
  });

  it('admite puntos fuera del rectángulo (la máscara se desvanece sola)', () => {
    expect(lanternPoint({ x: 50, y: 10 }, { left: 100, top: 200 })).toEqual({ x: -50, y: -190 });
  });
});
