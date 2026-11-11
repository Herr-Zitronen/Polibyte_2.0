import { describe, expect, it } from 'vitest';
import { latestShowcase, showcaseLayout } from './showcase';

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

describe('latestShowcase (PR B: la vitrina no desaparece por un evento posterior sin proyectos)', () => {
  const d = (s: string) => new Date(`${s}T10:00:00-05:00`);
  const now = d('2026-11-09');
  const e = (id: string, date: string, showcase: 'hidden' | 'published') => ({ id, date: d(date), showcase });
  const events = [
    e('icpc', '2025-10-18', 'published'),
    e('hack', '2026-05-16', 'published'),
    e('git', '2026-06-14', 'hidden'), // taller posterior al hackathon, sin vitrina
    e('codefest', '2027-02-20', 'published'), // próximo: aún no tiene vitrina
  ];
  const projects = [p('a', 1, true, 'hack'), p('b', 1, true, 'icpc'), p('c', 1, true, 'codefest')];

  it('elige el evento concluido más reciente que tenga vitrina válida', () => {
    const s = latestShowcase(events, projects, now);
    expect(s?.event.id).toBe('hack');
    expect(s?.layout.hero.id).toBe('a');
  });

  it('ignora eventos próximos aunque estén publicados', () => {
    expect(latestShowcase(events, projects, now)?.event.id).not.toBe('codefest');
  });

  it('sin ninguna vitrina válida → null', () => {
    expect(latestShowcase(events, [p('z', 1, false, 'hack')], now)).toBeNull();
    expect(latestShowcase([], projects, now)).toBeNull();
  });
});
