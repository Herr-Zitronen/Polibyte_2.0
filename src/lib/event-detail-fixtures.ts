// Fixtures de laboratorio para H6.1 (reloj fijo: 9 nov 2026). Las usa /lab/event-detail/[kind].
import type { EventData } from '../content/schemas';

const at = (s: string) => new Date(`${s}T00:00:00-05:00`);
export const DETAIL_NOW = at('2026-11-09');

const base: Pick<EventData, 'schedule' | 'showcase'> = { schedule: [], showcase: 'hidden' };

export const detailEvents: Record<'upcoming' | 'past' | 'tbd', EventData> = {
  upcoming: {
    ...base,
    title: 'Imagine Cup',
    type: 'competition',
    organizer: 'Microsoft',
    date: at('2026-12-05'),
    time: '09:00',
    place: 'Remoto',
    mode: 'remoto',
    teamSize: 'De 2 a 4 personas',
    requirements: 'Ser estudiante de la ESPOCH.',
    summary: 'Competencia global de Microsoft para estudiantes.',
    registrationUrl: 'https://imaginecup.microsoft.com',
    registrationDeadline: at('2026-11-28'),
    schedule: [
      { date: '28 nov', title: 'Cierre de inscripciones', detail: 'Equipos de 2 a 4 personas.' },
      { date: '5 dic', title: 'Entrega', detail: 'Video y repositorio.' },
    ],
  },
  past: {
    ...base,
    title: 'ICPC Regional',
    type: 'competition',
    organizer: 'ICPC',
    date: at('2025-10-18'),
    place: 'Quito',
    summary: 'Programación competitiva en equipos de tres.',
    registrationUrl: 'https://icpc.global',
  },
  tbd: { ...base, title: 'CodeFest', type: 'club', organizer: 'PoliByte', summary: 'Fecha por confirmar.' },
};
