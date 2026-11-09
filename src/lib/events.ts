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
