// reference('events') solo valida la forma del dato; aquí se comprueba que el evento exista.
export type ProjectRef = { id: string; event: string };

export function brokenEventRefs(projects: ProjectRef[], eventIds: string[]): ProjectRef[] {
  const known = new Set(eventIds);
  return projects.filter((p) => !known.has(p.event));
}

export function formatBrokenRefs(broken: ProjectRef[]): string {
  return broken.map((p) => `El proyecto "${p.id}" referencia el evento "${p.event}", que no existe.`).join('\n');
}
