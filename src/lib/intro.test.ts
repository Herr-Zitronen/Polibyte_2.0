import { describe, expect, it } from 'vitest';
import { INTRO, INTRO_BITS, INTRO_MAP, introCells, introExitAt } from './intro';

describe('pantalla de entrada · tiempos', () => {
  it('dura entre 1.2 y 1.8 s en total, nunca más de 2 s', () => {
    expect(INTRO.minMs + INTRO.exitMs).toBe(1200);
    expect(INTRO.capMs + INTRO.exitMs).toBe(1800);
    expect(INTRO.capMs + INTRO.exitMs).toBeLessThanOrEqual(2000);
  });

  it('sale cuando todo está listo, con un mínimo y un tope', () => {
    expect(introExitAt(200)).toBe(INTRO.minMs); // listo muy pronto: espera al mínimo, no parpadea
    expect(introExitAt(1000)).toBe(1000);
    expect(introExitAt(5000)).toBe(INTRO.capMs); // red lenta: el tope la corta
    expect(introExitAt(null)).toBe(INTRO.capMs); // nunca llegó el aviso
  });
});

describe('pantalla de entrada · isotipo en píxeles', () => {
  it('rejilla de 9 × 12 con las piezas del isotipo: bits, llaves y núcleo', () => {
    expect(INTRO_MAP).toHaveLength(12);
    for (const row of INTRO_MAP) expect(row).toHaveLength(9);
    const cells = introCells(51);
    expect(cells).toHaveLength(108);
    const count = (p: string) => cells.filter((c) => c.piece === p).length;
    expect(count('dot')).toBe(8);
    expect(count('core')).toBe(6);
    expect(count('left')).toBe(count('right'));
    expect(count('left')).toBeGreaterThan(10);
  });

  it('mismo dibujo en cada build (semilla fija) y retardos cortos', () => {
    expect(introCells(51)).toEqual(introCells(51));
    for (const c of introCells(51)) {
      expect(c.delay).toBeGreaterThanOrEqual(0);
      expect(c.delay).toBeLessThanOrEqual(0.12);
    }
  });

  it('los 8 bits son la «P» de PoliByte en ASCII', () => {
    expect(INTRO_BITS).toBe('P'.charCodeAt(0).toString(2).padStart(8, '0'));
  });
});
