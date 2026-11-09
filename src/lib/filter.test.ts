import { describe, expect, it } from 'vitest';
import { calendarRows, filterEvents } from './filter';

const now = new Date('2026-11-09T12:00:00-05:00');
const at = (s: string) => new Date(`${s}T00:00:00-05:00`);
const base = { organizer: 'PoliByte' };
const events = [
  { ...base, id: 'old', title: 'Pasado', type: 'club' as const, date: at('2026-01-10') },
  { ...base, id: 'b', title: 'Imagine Cup', type: 'competition' as const, organizer: 'Microsoft', date: at('2026-12-07'), place: 'Remoto' },
  { ...base, id: 'tbd', title: 'Con GDG', type: 'club' as const, ally: 'GDG' },
  { ...base, id: 'a', title: 'Taller', type: 'club' as const, date: at('2026-11-20') },
];

describe('filterEvents', () => {
  it("'competition' deja solo competencias", () => {
    expect(filterEvents(events, 'competition').map((e) => e.id)).toEqual(['b']);
  });
  it("'club' deja solo eventos del club (el aliado es un dato)", () => {
    expect(filterEvents(events, 'club').map((e) => e.id)).toEqual(['old', 'tbd', 'a']);
  });
  it("'all' no filtra", () => {
    expect(filterEvents(events, 'all')).toHaveLength(4);
  });
  it('sin competencias → lista vacía', () => {
    expect(filterEvents(events.filter((e) => e.type === 'club'), 'competition')).toEqual([]);
  });
});

describe('calendarRows', () => {
  const rows = calendarRows(events, now);
  it('solo próximos: con fecha ascendente y luego "por confirmar"', () => {
    expect(rows.map((r) => r.id)).toEqual(['a', 'b', 'tbd']);
  });
  it('día, mes con año, tipo, lugar y estado', () => {
    expect(rows[1]).toMatchObject({ day: '07', month: 'dic 2026', type: 'competition', typeLine: 'Competencia · Microsoft', place: 'Remoto', status: 'upcoming' });
    expect(rows[2]).toMatchObject({ day: '--', month: 'Por confirmar', typeLine: 'Del club · con GDG', place: 'Por confirmar', status: 'tbd' });
  });
});
