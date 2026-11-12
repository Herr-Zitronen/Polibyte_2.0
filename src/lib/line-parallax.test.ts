// F7 (WOR-93) · Desplazamiento de las líneas del hero y del vidrio acanalado según el cursor.
import { describe, expect, it } from 'vitest';
import { lineOffset, reedOffset } from './line-parallax';

const VIEW = { w: 1440, h: 900 };

describe('lineOffset', () => {
  it('en el centro de la ventana no se mueve', () => {
    expect(lineOffset({ x: 720, y: 450 }, VIEW)).toEqual({ x: 0, y: 0 });
  });

  it('en las esquinas llega a ±8 px en X y ±6 px en Y, en sentido contrario al cursor', () => {
    expect(lineOffset({ x: 0, y: 0 }, VIEW)).toEqual({ x: 8, y: 6 });
    expect(lineOffset({ x: 1440, y: 900 }, VIEW)).toEqual({ x: -8, y: -6 });
    expect(lineOffset({ x: 1440, y: 0 }, VIEW)).toEqual({ x: -8, y: 6 });
  });

  it('redondea a 2 decimales', () => {
    expect(lineOffset({ x: 100, y: 333 }, VIEW)).toEqual({ x: 6.89, y: 1.56 });
  });

  it('sin cursor queda en reposo', () => {
    expect(lineOffset(null, VIEW)).toEqual({ x: 0, y: 0 });
  });

  it('con una ventana sin tamaño no devuelve NaN', () => {
    expect(lineOffset({ x: 10, y: 10 }, { w: 0, h: 0 })).toEqual({ x: 0, y: 0 });
  });
});

describe('reedOffset', () => {
  it('el vidrio se corre hasta ±3.5 px (7 px de recorrido), solo en X', () => {
    expect(reedOffset({ x: 0, y: 0 }, VIEW)).toBe(3.5);
    expect(reedOffset({ x: 1440, y: 0 }, VIEW)).toBe(-3.5);
    expect(reedOffset({ x: 720, y: 0 }, VIEW)).toBe(0);
  });

  it('sin cursor queda en reposo', () => {
    expect(reedOffset(null, VIEW)).toBe(0);
  });
});
