// Vista del panel del próximo evento (DESIGN §5.1). Pura: el tiempo llega como `now`.
import { TIME_ZONE, countdown, progressCells, toBinary8 } from './events';

type Startable = { date: Date; time?: string | undefined };

/** Inicio del evento: el día (medianoche en Riobamba) más la hora local "HH:MM". */
export function eventStart(e: Startable): Date {
  const [h = 0, m = 0] = (e.time ?? '').split(':').map(Number);
  return new Date(e.date.getTime() + ((h || 0) * 60 + (m || 0)) * 60_000);
}

export type Cell = 'off' | 'on' | 'now';

export interface NextEventView {
  days: string;
  hours: string;
  binary: string;
  label: string;
  aria: string;
  cells: Cell[];
  percent: number;
}

const pad = (n: number) => String(n).padStart(2, '0');

export function nextEventView(e: Startable, now: Date): NextEventView {
  const target = eventStart(e);
  const cd = countdown(target, now);
  const { filled, current } = progressCells(target, now);
  const cells = Array.from({ length: 40 }, (_, i): Cell => (i === current ? 'now' : i < filled ? 'on' : 'off'));
  const elapsed = Math.min(1, Math.max(0, (60 - (target.getTime() - now.getTime()) / 86_400_000) / 60));
  return {
    days: pad(cd.days),
    hours: pad(cd.hours),
    binary: toBinary8(cd.days),
    label: `Days in code: ${cd.days}`,
    aria: `Faltan ${cd.days} días y ${cd.hours} horas`,
    cells,
    percent: Math.round(elapsed * 100),
  };
}

/** "5 de diciembre de 2026" (calendario de Riobamba). */
export function longDate(d: Date): string {
  return new Intl.DateTimeFormat('es-EC', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' }).format(d);
}
