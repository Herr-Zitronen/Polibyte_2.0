import { describe, expect, it } from 'vitest';
import { upcomingRows } from './upcoming';

const now = new Date('2026-11-09T12:00:00-05:00');
const d = (s: string) => new Date(`${s}T00:00:00-05:00`);
const ev = (id: string, date?: Date, extra: object = {}) => ({
  id, title: `T ${id}`, type: 'club' as const, organizer: 'PoliByte', summary: `S ${id}`, date, ...extra,
});

describe('upcomingRows', () => {
  const six = [
    ev('f', d('2027-03-01')), ev('a', d('2026-11-20')), ev('past', d('2026-01-01')),
    ev('c', d('2026-12-20')), ev('b', d('2026-12-01')), ev('e', d('2027-02-01')), ev('d', d('2027-01-10')),
  ];

  it('máximo 4, solo próximos, ordenados por fecha', () => {
    expect(upcomingRows(six, now).map((r) => r.id)).toEqual(['a', 'b', 'c', 'd']);
  });

  it('numera 01..N y marca solo el primero como "Próximo"', () => {
    const rows = upcomingRows(six, now);
    expect(rows.map((r) => r.num)).toEqual(['01', '02', '03', '04']);
    expect(rows.map((r) => r.isNext)).toEqual([true, false, false, false]);
    expect(rows[0]!.status).toBe('upcoming');
  });

  it('los "por confirmar" van al final con estado tbd y sin cuenta', () => {
    const rows = upcomingRows([ev('x'), ev('a', d('2026-11-20'))], now);
    expect(rows.map((r) => r.id)).toEqual(['a', 'x']);
    expect(rows[1]).toMatchObject({ status: 'tbd', date: 'Por confirmar', big: '--', small: 'fecha por confirmar' });
  });

  it('typeLine, fecha corta y días restantes', () => {
    const [r] = upcomingRows([ev('a', d('2026-11-20'), { ally: 'GDG' })], now);
    expect(r).toMatchObject({ typeLine: 'Del club · con GDG', date: '20 nov 2026', big: '11', small: 'días para el 20 nov 2026' });
  });
});
