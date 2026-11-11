// Se ejecuta durante el build (desde Base.astro): un slug mal escrito rompe el build.
import { getCollection } from 'astro:content';
import { brokenEventRefs, formatBrokenRefs, showcaseWarnings } from '../lib/content-integrity';

let checked = false;

export async function assertContentIntegrity(): Promise<void> {
  if (checked) return;
  const [events, projects] = await Promise.all([getCollection('events'), getCollection('projects')]);
  const broken = brokenEventRefs(
    projects.map((p) => ({ id: p.id, event: p.data.event.id })),
    events.map((e) => e.id),
  );
  if (broken.length) throw new Error(formatBrokenRefs(broken));
  const warnings = showcaseWarnings(
    events.map((e) => ({ id: e.id, showcase: e.data.showcase })),
    projects.map((p) => ({ event: p.data.event.id, featured: p.data.featured })),
  );
  for (const w of warnings) console.warn(`[contenido] ${w}`);
  checked = true;
}
