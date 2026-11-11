// Portada de Eventos: el último evento concluido y sus cifras (DESIGN §5, §5.2). Pura: el tiempo llega como `now`.
import { lastConcluded, typeLine } from './events';
import { latestShowcase } from './showcase';

type Stats = { [K in StatKey]?: number | undefined };
type RecapEvent = {
  id: string;
  title: string;
  date?: Date | undefined;
  endDate?: Date | undefined;
  type: 'club' | 'competition';
  organizer: string;
  ally?: string | undefined;
  summary: string;
  stats?: Stats | undefined;
  showcase: 'hidden' | 'published';
};
type FeaturedRef = { event: string; featured: boolean; order?: number | undefined };

export type StatKey = 'teams' | 'projects' | 'people';
export type Stat = { key: StatKey; value: number; label: string };
export type Action = { label: string; href: string };

export type RecapView =
  | { kind: 'event'; title: string; event: RecapEvent & { date: Date }; typeLine: string; stats: Stat[]; primary: Action }
  | { kind: 'empty'; title: string; text: string; primary: Action };

const STAT_LABELS: [StatKey, string][] = [
  ['teams', 'equipos participantes'],
  ['projects', 'proyectos entregados'],
  ['people', 'personas construyendo'],
];

const CALENDAR: Action = { label: 'Ver calendario', href: '#calendario' };
const FEATURED: Action = { label: 'Ver proyectos destacados', href: '#destacados' };

/** Solo las cifras presentes: `stats` parcial no inventa ceros. */
function statsOf(s: Stats | undefined): Stat[] {
  return STAT_LABELS.flatMap(([key, label]) => {
    const value = s?.[key];
    return typeof value === 'number' ? [{ key, value, label }] : [];
  });
}

export function recapView<E extends RecapEvent>(events: readonly E[], projects: readonly FeaturedRef[], now: Date): RecapView {
  const last = lastConcluded(events, now) as (E & { date: Date }) | undefined;
  if (!last) {
    return {
      kind: 'empty',
      title: 'Eventos',
      text: 'Todavía no hemos cerrado ningún evento. Mira lo que viene en el calendario.',
      primary: CALENDAR,
    };
  }
  // PR B: la vitrina puede ser de un evento anterior al último (un taller posterior no la apaga).
  const showcase = latestShowcase(events, projects, now) !== null;
  return {
    kind: 'event',
    title: last.title,
    event: last,
    typeLine: typeLine(last),
    stats: statsOf(last.stats),
    primary: showcase ? FEATURED : CALENDAR,
  };
}
