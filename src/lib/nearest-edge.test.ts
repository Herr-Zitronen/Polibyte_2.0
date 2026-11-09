import { describe, expect, it } from 'vitest';
import { nearestEdge } from './nearest-edge';

const rect = { left: 0, top: 0, width: 200, height: 100 };

describe('nearestEdge', () => {
  it.each([
    [{ x: 100, y: 5 }, 'top'],
    [{ x: 195, y: 50 }, 'right'],
    [{ x: 100, y: 97 }, 'bottom'],
    [{ x: 3, y: 50 }, 'left'],
    [{ x: 250, y: 50 }, 'right'],
    [{ x: 100, y: -40 }, 'top'],
  ] as const)('punto %o → %s', (p, edge) => {
    expect(nearestEdge(p, rect)).toBe(edge);
  });

  it('respeta el desplazamiento del rectángulo', () => {
    expect(nearestEdge({ x: 305, y: 250 }, { left: 300, top: 200, width: 200, height: 100 })).toBe('left');
  });
});
