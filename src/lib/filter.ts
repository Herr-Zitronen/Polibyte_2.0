// Calendario de Eventos (H5.3). Puras: el tiempo llega como `now`.
import { eventStatus, TIME_ZONE, typeLine } from './events';

export type EventType = 'club' | 'competition';
export type EventFilter = 'all' | EventType;

/** Solo dos tipos: "Del club" y "Competencia". El aliado es un dato, no un filtro. */
export function filterEvents<T extends { type: EventType }>(events: readonly T[], filter: EventFilter): T[] {
  return filter === 'all' ? [...events] : events.filter((e) => e.type === filter);
}

type CalendarEvent = {
  id: string;
  title: string;
  type: EventType;
  organizer: string;
  ally?: string | undefined;
  place?: string | undefined;
  date?: Date | undefined;
};

export type CalendarRow = {
  id: string;
  title: string;
  type: EventType;
  typeLine: string;
  day: string;
  month: string;
  place: string;
  status: 'upcoming' | 'tbd';
};

const fmt = (d: Date, opts: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat('es-EC', { timeZone: TIME_ZONE, ...opts }).format(d).replace('.', '');

/** Próximos con fecha (ascendente) y luego los "por confirmar". */
export function calendarRows(events: readonly CalendarEvent[], now: Date): CalendarRow[] {
  const dated = events
    .filter((e) => eventStatus(e, now) === 'upcoming')
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());
  const tbd = events.filter((e) => eventStatus(e, now) === 'tbd');
  return [...dated, ...tbd].map((e) => ({
    id: e.id,
    title: e.title,
    type: e.type,
    typeLine: typeLine(e),
    day: e.date ? fmt(e.date, { day: '2-digit' }) : '--',
    month: e.date ? `${fmt(e.date, { month: 'short' })} ${fmt(e.date, { year: 'numeric' })}` : 'Por confirmar',
    place: e.place ?? 'Por confirmar',
    status: e.date ? 'upcoming' : 'tbd',
  }));
}
