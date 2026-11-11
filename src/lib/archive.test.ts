import { describe, expect, it } from 'vitest';
import { archiveView } from './archive';
import { groupByYear } from './events';

const now = new Date('2026-11-09T12:00:00-05:00');
const d = (s: string) => new Date(`${s}T10:00:00-05:00`);
const ev = (id: string, date: Date | undefined, showcase: 'hidden' | 'published' = 'hidden') => ({
  id,
  title: id.toUpperCase(),
  date,
  type: 'club' as const,
  organizer: 'PoliByte',
  showcase,
});

const events = [
  ev('icpc', d('2025-10-18')),
  ev('hack', d('2026-05-16'), 'published'),
  ev('git', d('2026-03-14'), 'published'),
  ev('tbd', undefined),
  ev('next', d('2027-02-20')),
];
const projects = [{ event: 'hack', featured: true }];

describe('groupByYear con eventos tbd', () => {
  it('excluye los "por confirmar" del archivo', () => {
    const ids = groupByYear(events).flatMap((g) => g.events.map((e) => e.id));
    expect(ids).not.toContain('tbd');
  });
});

describe('archiveView', () => {
  const view = archiveView(events, projects, now);

  it('años descendentes con solo eventos realizados (sin tbd ni próximos)', () => {
    expect(view.map((y) => y.year)).toEqual([2026, 2025]);
    expect(view[0]!.items.map((i) => i.id)).toEqual(['hack', 'git']);
  });

  it('"Ver proyectos" solo si showcaseLayout() publica vitrina; lleva a los proyectos de ESE evento', () => {
    const [hack, git] = view[0]!.items;
    expect(hack!.projectsHref).toBe('/eventos/hack/#proyectos');
    expect(git!.projectsHref).toBeNull(); // publicada pero sin destacados → nunca vitrina vacía
    expect(view[1]!.items[0]!.projectsHref).toBeNull();
  });

  it('fecha corta en español y línea de tipo', () => {
    expect(view[0]!.items[0]).toMatchObject({ date: '16 may', typeLine: 'Del club', title: 'HACK' });
  });
});
