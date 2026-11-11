// reference('events') solo valida la forma del dato; aquí se comprueba que el evento exista.
export type ProjectRef = { id: string; event: string };

export function brokenEventRefs(projects: ProjectRef[], eventIds: string[]): ProjectRef[] {
  const known = new Set(eventIds);
  return projects.filter((p) => !known.has(p.event));
}

export function formatBrokenRefs(broken: ProjectRef[]): string {
  return broken.map((p) => `El proyecto "${p.id}" referencia el evento "${p.event}", que no existe.`).join('\n');
}

type ShowcaseRef = { id: string; showcase: 'hidden' | 'published' };
type FeaturedRef = { event: string; featured: boolean };

/** PR B · Avisos (no rompen el build): eventos con `showcase: published` sin ningún proyecto destacado. */
export function showcaseWarnings(events: readonly ShowcaseRef[], projects: readonly FeaturedRef[]): string[] {
  return events
    .filter((e) => e.showcase === 'published' && !projects.some((p) => p.event === e.id && p.featured))
    .map(
      (e) =>
        `El evento "${e.id}" tiene showcase: published pero ningún proyecto con featured: true; su vitrina no se mostrará. ` +
        'Marca al menos un proyecto como destacado o vuelve a showcase: hidden.',
    );
}
