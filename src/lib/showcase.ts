// Vitrina de proyectos de un evento (DESIGN §5.2). Regla: nunca vitrina vacía o a medias.
import { eventStatus } from './events';

type ShowcaseEvent = { id: string; showcase: 'hidden' | 'published' };
type ShowcaseProject = { event: string; featured: boolean; order?: number | undefined };

export type ShowcaseLayout<P> = { hero: P; cards: P[]; rows: P[] };

/** `null` si la vitrina está oculta o el evento no tiene destacados. Si no: el primer destacado al panel,
 *  los dos siguientes destacados en tarjetas y el resto (destacados o no) en filas, todo por `order`. */
export function showcaseLayout<P extends ShowcaseProject>(
  event: ShowcaseEvent,
  projects: readonly P[],
): ShowcaseLayout<P> | null {
  if (event.showcase !== 'published') return null;
  const own = projects.filter((p) => p.event === event.id).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  const featured = own.filter((p) => p.featured);
  const [hero, ...nextFeatured] = featured;
  if (!hero) return null;
  const cards = nextFeatured.slice(0, 2);
  const rows = own.filter((p) => p !== hero && !cards.includes(p));
  return { hero, cards, rows };
}

type DatedShowcaseEvent = ShowcaseEvent & { date?: Date | undefined };

/** PR B · Qué vitrina se muestra en /eventos: la del evento CONCLUIDO más reciente que tenga una vitrina
 *  válida. Antes se miraba solo el último concluido, y un taller posterior al hackathon la hacía desaparecer. */
export function latestShowcase<E extends DatedShowcaseEvent, P extends ShowcaseProject>(
  events: readonly E[],
  projects: readonly P[],
  now: Date,
): { event: E & { date: Date }; layout: ShowcaseLayout<P> } | null {
  const past = events
    .filter((e): e is E & { date: Date } => eventStatus(e, now) === 'past' && e.date instanceof Date)
    .sort((a, b) => b.date.getTime() - a.date.getTime());
  for (const event of past) {
    const layout = showcaseLayout(event, projects);
    if (layout) return { event, layout };
  }
  return null;
}
