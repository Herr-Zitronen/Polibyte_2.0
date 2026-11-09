// Filas de "Próximos eventos" en Inicio (DESIGN §3.6). Pura: el tiempo llega como `now`.
import { TIME_ZONE, eventStatus, localDay, typeLine } from './events';
import type { EventStatus } from './status-labels';

type Row = {
  id: string;
  title: string;
  type: 'club' | 'competition';
  organizer: string;
  ally?: string | undefined;
  summary: string;
  date?: Date | undefined;
};

export interface UpcomingRow {
  id: string;
  num: string;
  title: string;
  summary: string;
  typeLine: string;
  /** "20 nov 2026" o "Por confirmar". */
  date: string;
  status: Exclude<EventStatus, 'past'>;
  isNext: boolean;
  /** Días que faltan ("11") o "--". */
  big: string;
  small: string;
}

const DAY_MS = 86_400_000;

/** "20 nov 2026" (calendario de Riobamba). */
export function shortDate(d: Date): string {
  const parts = new Intl.DateTimeFormat('es-EC', { timeZone: TIME_ZONE, day: '2-digit', month: 'short', year: 'numeric' }).formatToParts(d);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '';
  return `${get('day')} ${get('month').replace('.', '')} ${get('year')}`;
}

/** Días calendario (Riobamba) entre hoy y la fecha. */
function daysUntil(d: Date, now: Date): number {
  return Math.round((Date.parse(localDay(d)) - Date.parse(localDay(now))) / DAY_MS);
}

/** Próximos con fecha (ascendente) y luego los "por confirmar"; máximo `max`. */
export function upcomingRows<T extends Row>(events: readonly T[], now: Date, max = 4): UpcomingRow[] {
  const dated = events
    .filter((e) => eventStatus(e, now) === 'upcoming')
    .sort((a, b) => a.date!.getTime() - b.date!.getTime());
  const tbd = events.filter((e) => eventStatus(e, now) === 'tbd');
  return [...dated, ...tbd].slice(0, max).map((e, i) => {
    const days = e.date ? daysUntil(e.date, now) : undefined;
    const date = e.date ? shortDate(e.date) : 'Por confirmar';
    return {
      id: e.id,
      num: String(i + 1).padStart(2, '0'),
      title: e.title,
      summary: e.summary,
      typeLine: typeLine(e),
      date,
      status: e.date ? 'upcoming' : 'tbd',
      isNext: i === 0 && !!e.date,
      big: days === undefined ? '--' : String(days),
      small: days === undefined ? 'fecha por confirmar' : `días para el ${date}`,
    };
  });
}
