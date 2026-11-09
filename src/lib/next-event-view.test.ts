import { describe, expect, it } from 'vitest';
import { eventStart, longDate, nextEventView } from './next-event-view';

// 5 dic 2026, 09:00 en Riobamba (UTC-5) = 14:00Z.
const event = { date: new Date('2026-12-05T05:00:00Z'), time: '09:00' };
const start = new Date('2026-12-05T14:00:00Z');
const now = new Date(start.getTime() - (27 * 24 + 20) * 3_600_000);

describe('eventStart', () => {
  it('suma la hora local al día del evento', () => {
    expect(eventStart(event)).toEqual(start);
  });
  it('sin hora → inicio del día', () => {
    expect(eventStart({ date: event.date })).toEqual(event.date);
  });
});

describe('nextEventView', () => {
  it('a 27 días y 20 horas', () => {
    expect(nextEventView(event, now)).toMatchObject({
      days: '27',
      hours: '20',
      binary: '00011011',
      label: 'Days in code: 27',
      aria: 'Faltan 27 días y 20 horas',
    });
  });

  it('rellena a dos dígitos', () => {
    const v = nextEventView(event, new Date(start.getTime() - (3 * 24 + 4) * 3_600_000));
    expect([v.days, v.hours]).toEqual(['03', '04']);
    expect(v.aria).toBe('Faltan 3 días y 4 horas');
  });

  it('40 celdas con la actual marcada', () => {
    const v = nextEventView(event, now);
    expect(v.cells).toHaveLength(40);
    expect(v.cells.filter((c) => c === 'now')).toHaveLength(1);
    expect(v.cells.indexOf('now')).toBe(v.cells.lastIndexOf('on') + 1);
  });
});

describe('longDate', () => {
  it('fecha larga en español, en Riobamba', () => {
    expect(longDate(event.date)).toBe('5 de diciembre de 2026');
  });
});
