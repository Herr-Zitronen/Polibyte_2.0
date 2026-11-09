import { describe, expect, it } from 'vitest';
import { showcaseLayout } from './showcase';

const ev = (showcase: 'hidden' | 'published') => ({ id: 'hack', showcase });
const p = (id: string, order: number, featured: boolean, event = 'hack') => ({ id, event, order, featured });

describe('showcaseLayout', () => {
  const projects = [
    p('e', 5, false),
    p('b', 2, true),
    p('a', 1, true),
    p('d', 4, true),
    p('c', 3, true),
    p('x', 0, true, 'otro'),
  ];

  it('devuelve null si la vitrina está oculta', () => {
    expect(showcaseLayout(ev('hidden'), projects)).toBeNull();
  });

  it('devuelve null si no hay destacados del evento', () => {
    expect(showcaseLayout(ev('published'), [p('e', 1, false), p('x', 0, true, 'otro')])).toBeNull();
    expect(showcaseLayout(ev('published'), [])).toBeNull();
  });

  it('primer destacado al panel, dos siguientes en tarjetas, el resto en filas; ordenado por order', () => {
    const l = showcaseLayout(ev('published'), projects);
    expect(l?.hero.id).toBe('a');
    expect(l?.cards.map((c) => c.id)).toEqual(['b', 'c']);
    expect(l?.rows.map((r) => r.id)).toEqual(['d', 'e']);
  });

  it('ignora proyectos de otros eventos', () => {
    const l = showcaseLayout(ev('published'), projects);
    const all = [l?.hero, ...(l?.cards ?? []), ...(l?.rows ?? [])].map((x) => x?.id);
    expect(all).not.toContain('x');
  });

  it('con un solo destacado no inventa tarjetas', () => {
    const l = showcaseLayout(ev('published'), [p('a', 1, true), p('e', 2, false)]);
    expect(l?.hero.id).toBe('a');
    expect(l?.cards).toEqual([]);
    expect(l?.rows.map((r) => r.id)).toEqual(['e']);
  });
});
