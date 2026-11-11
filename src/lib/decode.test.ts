import { describe, expect, it } from 'vitest';
import { GLYPHS, decodeReels, decodeDuration, FRAME_MS } from './decode';

const TITLE = 'Construimos software. Y a quienes lo construyen.';

describe('decodeReels (WOR-101: carrete de glifos por letra, sin reescribir el texto)', () => {
  it('conserva el texto real letra por letra', () => {
    expect(decodeReels(TITLE, 7).map((r) => r.c).join('')).toBe(TITLE);
  });

  it('los espacios no tienen carrete', () => {
    for (const r of decodeReels(TITLE, 7)) if (r.c === ' ') expect(r.reel).toEqual([]);
  });

  it('cada carrete usa solo glifos y tiene un glifo por cuadro hasta el turno de la letra', () => {
    const reels = decodeReels(TITLE, 3);
    reels.forEach((r, i) => {
      if (r.c === ' ') return;
      expect(r.reel.length).toBeGreaterThan(0);
      expect(r.reel.every((g) => g.length === 1 && GLYPHS.includes(g))).toBe(true);
      expect(r.durationMs).toBe(r.reel.length * FRAME_MS);
      // La letra i queda fija en su turno (± un cuadro), como el decodificado original.
      const turn = decodeDuration(i);
      expect(r.durationMs).toBeGreaterThanOrEqual(turn);
      expect(r.durationMs - FRAME_MS).toBeLessThan(turn);
    });
  });

  it('las letras posteriores giran más tiempo (el titular se fija de izquierda a derecha)', () => {
    const d = decodeReels(TITLE, 3).filter((r) => r.c !== ' ').map((r) => r.durationMs);
    expect([...d].sort((a, b) => a - b)).toEqual(d);
  });

  it('la última letra queda fija cuando termina el decodificado', () => {
    const last = decodeReels(TITLE, 3).at(-1)!;
    const turn = decodeDuration([...TITLE].length - 1);
    expect(last.durationMs).toBeGreaterThanOrEqual(turn);
    expect(last.durationMs).toBeLessThan(turn + FRAME_MS);
  });

  it('es determinista con la misma semilla (el HTML del build es estable)', () => {
    expect(decodeReels('abc', 1)).toEqual(decodeReels('abc', 1));
  });
});

describe('decodeDuration', () => {
  it('el titular completo se muestra en ~0,92 s (50 % de los 1,85 s originales)', () => {
    const letters = 'Construimossoftware.Yaquienesloconstruyen.'.length; // 42 letras sin espacios
    expect(decodeDuration(letters)).toBe(923);
  });
});
