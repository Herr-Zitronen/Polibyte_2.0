// Reglas de eventos (CONTENT_MODEL.md). Funciones puras: el tiempo llega como `now`.
import type { EventStatus } from './status-labels';

export const TIME_ZONE = 'America/Guayaquil';

type Dated = { date?: Date | undefined };

/** Día calendario (AAAA-MM-DD) de una fecha en Riobamba. */
export function localDay(d: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
}

/** Sin fecha → tbd; día anterior a hoy (en Riobamba) → past; si no → upcoming. */
export function eventStatus(e: Dated, now: Date): EventStatus {
  if (!e.date) return 'tbd';
  return localDay(e.date) < localDay(now) ? 'past' : 'upcoming';
}

const DAY_MS = 86_400_000;

function datedOnly<T extends Dated>(events: readonly T[]): (T & { date: Date })[] {
  return events.filter((e): e is T & { date: Date } => e.date instanceof Date);
}

/** El evento próximo con fecha más cercana (ignora los "por confirmar"). */
export function nextEvent<T extends Dated>(events: readonly T[], now: Date): T | undefined {
  return datedOnly(events)
    .filter((e) => eventStatus(e, now) === 'upcoming')
    .sort((a, b) => a.date.getTime() - b.date.getTime())[0];
}

/** El evento realizado más reciente. */
export function lastConcluded<T extends Dated>(events: readonly T[], now: Date): T | undefined {
  return datedOnly(events)
    .filter((e) => eventStatus(e, now) === 'past')
    .sort((a, b) => b.date.getTime() - a.date.getTime())[0];
}

type Typed = { type: 'club' | 'competition'; organizer: string; ally?: string | undefined };

/** `Competencia · Microsoft` · `Del club · con GDG` · `Del club`. El aliado es un dato, no un tipo. */
export function typeLine(e: Typed): string {
  if (e.type === 'competition') return `Competencia · ${e.organizer}`;
  return e.ally ? `Del club · con ${e.ally}` : 'Del club';
}

export type Countdown = { days: number; hours: number; minutes: number };

/** Tiempo restante; nunca negativo. */
export function countdown(target: Date, now: Date): Countdown {
  const totalMinutes = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 60_000));
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  };
}

/** Binario de al menos 8 bits: 27 → "00011011"; 300 → "100101100". */
export function toBinary8(n: number): string {
  return Math.max(0, Math.floor(n)).toString(2).padStart(8, '0');
}

/** Barra de progreso: se llena en los `window` días previos al evento. */
export function progressCells(target: Date, now: Date, window = 60, cells = 40): { filled: number; current: number } {
  const daysLeft = (target.getTime() - now.getTime()) / DAY_MS;
  const elapsed = Math.min(1, Math.max(0, (window - daysLeft) / window));
  const filled = Math.floor(elapsed * cells + 1e-9);
  return { filled, current: Math.min(filled, cells - 1) };
}

/** Archivo: años descendentes y, dentro, fechas descendentes (año en Riobamba). */
export function groupByYear<T extends Dated>(events: readonly T[]): { year: number; events: T[] }[] {
  const byYear = new Map<number, (T & { date: Date })[]>();
  for (const e of datedOnly(events)) {
    const year = Number(localDay(e.date).slice(0, 4));
    byYear.set(year, [...(byYear.get(year) ?? []), e]);
  }
  return [...byYear.entries()]
    .sort(([a], [b]) => b - a)
    .map(([year, list]) => ({ year, events: list.sort((a, b) => b.date.getTime() - a.date.getTime()) }));
}
