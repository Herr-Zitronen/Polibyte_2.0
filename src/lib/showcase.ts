// Vitrina de proyectos de un evento (DESIGN §5.2). Regla: nunca vitrina vacía o a medias.
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
