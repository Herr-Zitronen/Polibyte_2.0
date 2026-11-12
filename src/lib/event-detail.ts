// Detalle de evento (H6.1). Puras: el tiempo llega como `now`.
import { eventStatus } from './events';
import { modeLabel } from './mode-label';
import { eventStart, longDate } from './next-event-view';

type DetailEvent = {
  type: 'club' | 'competition';
  organizer: string;
  ally?: string | undefined;
  date?: Date | undefined;
  time?: string | undefined;
  place?: string | undefined;
  mode?: 'presencial' | 'remoto' | 'híbrido' | undefined;
  teamSize?: string | undefined;
  requirements?: string | undefined;
  registrationUrl?: string | undefined;
};

export type DetailTiming =
  | { kind: 'countdown'; start: Date }
  | { kind: 'done'; label: 'Realizado' }
  | { kind: 'tbd'; label: 'Por confirmar' };

/** Próximo → cuenta regresiva; pasado → "Realizado"; sin fecha → "Por confirmar". */
export function detailTiming(e: DetailEvent, now: Date): DetailTiming {
  if (!e.date) return { kind: 'tbd', label: 'Por confirmar' };
  if (eventStatus(e, now) === 'past') return { kind: 'done', label: 'Realizado' };
  return { kind: 'countdown', start: eventStart({ date: e.date, time: e.time }) };
}

/** La inscripción solo tiene sentido si el evento no ha pasado y hay a dónde enviar. */
export function showRegistration(e: DetailEvent, now: Date): boolean {
  return Boolean(e.registrationUrl) && eventStatus(e, now) !== 'past';
}

export type Fact = { label: string; value: string };

/** Datos clave en el orden del prototipo; se omiten los que faltan. */
export function keyFacts(e: DetailEvent): Fact[] {
  const facts: [string, string | undefined][] = [
    ['Fecha', e.date ? longDate(e.date) : 'Por confirmar'],
    ['Hora', e.time],
    ['Lugar', e.place],
    ['Modalidad', e.mode && modeLabel(e.mode)],
    ['Equipos', e.teamSize],
    ['Requisitos', e.requirements],
    ['Organiza', e.organizer],
    ['Con el club', e.type === 'club' && e.ally ? `PoliByte · ${e.ally}` : undefined],
  ];
  return facts.filter((f): f is [string, string] => Boolean(f[1])).map(([label, value]) => ({ label, value }));
}

/** getStaticPaths: una página por evento; el id del archivo es el slug. */
export function eventPaths<T extends { id: string }>(entries: readonly T[]) {
  return entries.map((entry) => ({ params: { slug: entry.id }, props: { entry } }));
}
