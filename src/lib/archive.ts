// Archivo por año (DESIGN §5). Pura: el tiempo llega como `now`. Reutiliza groupByYear (H3.2) y showcaseLayout (H5.2).
import { eventStatus, groupByYear, TIME_ZONE, typeLine } from './events';
import { showcaseLayout } from './showcase';

type ArchiveEvent = {
  id: string;
  title: string;
  date?: Date | undefined;
  type: 'club' | 'competition';
  organizer: string;
  ally?: string | undefined;
  showcase: 'hidden' | 'published';
};
type FeaturedRef = { event: string; featured: boolean; order?: number | undefined };

export type ArchiveItem = { id: string; title: string; date: string; typeLine: string; projectsHref: string | null };
export type ArchiveYear = { year: number; items: ArchiveItem[] };

const shortDate = (d: Date) =>
  new Intl.DateTimeFormat('es-EC', { timeZone: TIME_ZONE, day: 'numeric', month: 'short' }).format(d).replace('.', '');

/** Solo eventos realizados, por año descendente. "Ver proyectos" con la misma regla que la vitrina y
 *  hacia los proyectos de ESE evento, en su página de detalle (PR B; antes iba a la vitrina global). */
export function archiveView(events: readonly ArchiveEvent[], projects: readonly FeaturedRef[], now: Date): ArchiveYear[] {
  const past = events.filter((e) => eventStatus(e, now) === 'past');
  return groupByYear(past).map(({ year, events: list }) => ({
    year,
    items: list.map((e) => ({
      id: e.id,
      title: e.title,
      date: shortDate(e.date),
      typeLine: typeLine(e),
      projectsHref: showcaseLayout(e, projects) ? `/eventos/${e.id}/#proyectos` : null,
    })),
  }));
}
