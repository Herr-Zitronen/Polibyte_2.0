// Fixtures de laboratorio para H5.3 (reloj fijo: 9 nov 2026). Las usan las páginas /lab/calendar*.
const at = (s: string) => new Date(`${s}T00:00:00-05:00`);
export const CALENDAR_NOW = at('2026-11-09');

const base = { organizer: 'PoliByte' };
export const calendarEvents = [
  { ...base, id: 'old', title: 'Pasado', type: 'club' as const, date: at('2026-01-10') },
  { ...base, id: 'ic', title: 'Imagine Cup', type: 'competition' as const, organizer: 'Microsoft', date: at('2026-12-07'), place: 'Remoto' },
  { ...base, id: 'gdg', title: 'Evento con GDG', type: 'club' as const, ally: 'GDG' },
  { ...base, id: 'taller', title: 'Taller de Astro', type: 'club' as const, date: at('2026-11-20'), place: 'Laboratorio 3' },
  { ...base, id: 'xt', title: 'IEEEXtreme', type: 'competition' as const, organizer: 'IEEE', date: at('2027-01-12') },
];
export const clubOnlyEvents = calendarEvents.filter((e) => e.type === 'club');
