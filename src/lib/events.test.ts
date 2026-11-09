// H3.2 · Reglas de eventos (CONTENT_MODEL.md). `now` siempre inyectado.
import { describe, expect, it } from 'vitest';
import {
  countdown,
  eventStatus,
  groupByYear,
  lastConcluded,
  nextEvent,
  progressCells,
  toBinary8,
  typeLine,
} from './events';

// 9 nov 2026, 10:00 en Riobamba (UTC−5)
const now = new Date('2026-11-09T15:00:00Z');
const day = (iso: string) => new Date(`${iso}T00:00:00-05:00`);

describe('eventStatus', () => {
  it('sin fecha → tbd', () => expect(eventStatus({}, now)).toBe('tbd'));
  it('ayer → past', () => expect(eventStatus({ date: day('2026-11-08') }, now)).toBe('past'));
  it('hoy → upcoming', () => expect(eventStatus({ date: day('2026-11-09') }, now)).toBe('upcoming'));
  it('mañana → upcoming', () => expect(eventStatus({ date: day('2026-11-10') }, now)).toBe('upcoming'));
  it('usa la zona de Riobamba: 23:30 locales siguen siendo "hoy"', () => {
    const lateNight = new Date('2026-11-10T04:30:00Z'); // 9 nov 23:30 en Riobamba, 10 nov en UTC
    expect(eventStatus({ date: day('2026-11-09') }, lateNight)).toBe('upcoming');
  });
});

const events = [
  { id: 'tbd', date: undefined },
  { id: 'old', date: day('2025-10-18') },
  { id: 'recent', date: day('2026-05-16') },
  { id: 'far', date: day('2027-03-01') },
  { id: 'near', date: day('2026-12-05') },
];

describe('nextEvent / lastConcluded', () => {
  it('nextEvent elige el próximo más cercano e ignora tbd', () => expect(nextEvent(events, now)?.id).toBe('near'));
  it('nextEvent con lista vacía → undefined', () => expect(nextEvent([], now)).toBeUndefined());
  it('nextEvent sin próximos → undefined', () => expect(nextEvent([events[0]!, events[1]!], now)).toBeUndefined());
  it('lastConcluded elige el pasado más reciente', () => expect(lastConcluded(events, now)?.id).toBe('recent'));
  it('lastConcluded sin pasados → undefined', () => expect(lastConcluded([events[0]!], now)).toBeUndefined());
});

describe('typeLine', () => {
  it('competencia con organizador', () =>
    expect(typeLine({ type: 'competition', organizer: 'Microsoft' })).toBe('Competencia · Microsoft'));
  it('del club con aliado', () =>
    expect(typeLine({ type: 'club', organizer: 'PoliByte', ally: 'GDG' })).toBe('Del club · con GDG'));
  it('del club solo', () => expect(typeLine({ type: 'club', organizer: 'PoliByte' })).toBe('Del club'));
});

describe('countdown', () => {
  it('27 días y 20 horas', () => {
    const target = new Date(now.getTime() + (27 * 24 + 20) * 3600_000);
    expect(countdown(target, now)).toEqual({ days: 27, hours: 20, minutes: 0 });
  });
  it('trunca minutos', () => {
    expect(countdown(new Date(now.getTime() + 90.9 * 60_000), now)).toEqual({ days: 0, hours: 1, minutes: 30 });
  });
  it('fecha pasada → ceros, nunca negativos', () => {
    expect(countdown(new Date(now.getTime() - 3600_000), now)).toEqual({ days: 0, hours: 0, minutes: 0 });
  });
});

describe('toBinary8', () => {
  it('27 → 00011011', () => expect(toBinary8(27)).toBe('00011011'));
  it('0 → 00000000', () => expect(toBinary8(0)).toBe('00000000'));
  it('300 usa los bits necesarios', () => expect(toBinary8(300)).toBe('100101100'));
  it('negativos y decimales se normalizan', () => {
    expect(toBinary8(-3)).toBe('00000000');
    expect(toBinary8(27.9)).toBe('00011011');
  });
});

describe('progressCells', () => {
  const target = day('2026-12-05');
  const before = (days: number) => new Date(target.getTime() - days * 86_400_000);
  it('a 60 días → 0 llenas, actual en 0', () => expect(progressCells(target, before(60), 60, 40)).toEqual({ filled: 0, current: 0 }));
  it('a más de 60 días → 0 llenas', () => expect(progressCells(target, before(90), 60, 40)).toEqual({ filled: 0, current: 0 }));
  it('a 30 días → mitad', () => expect(progressCells(target, before(30), 60, 40)).toEqual({ filled: 20, current: 20 }));
  it('a 0 días → 40 llenas, actual la última', () => expect(progressCells(target, before(0), 60, 40)).toEqual({ filled: 40, current: 39 }));
  it('valores por defecto 60/40', () => expect(progressCells(target, before(15))).toEqual({ filled: 30, current: 30 }));
});

describe('groupByYear', () => {
  it('años descendentes, eventos por fecha descendente, sin los tbd', () => {
    const groups = groupByYear(events);
    expect(groups.map((g) => g.year)).toEqual([2027, 2026, 2025]);
    expect(groups[1]!.events.map((e) => e.id)).toEqual(['near', 'recent']);
  });
  it('agrupa por el año en Riobamba (1 ene 00:30 local sigue siendo el año nuevo)', () => {
    const g = groupByYear([{ id: 'ny', date: new Date('2027-01-01T05:30:00Z') }]);
    expect(g[0]!.year).toBe(2027);
  });
});
