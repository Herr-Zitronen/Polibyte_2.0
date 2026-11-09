// Único lugar donde vive el texto de cada estado de evento (DESIGN §3.2).
export type EventStatus = 'upcoming' | 'past' | 'tbd';

export const STATUS_LABELS: Record<EventStatus, string> = {
  upcoming: 'Próximo',
  past: 'Realizado',
  tbd: 'Por confirmar',
};
