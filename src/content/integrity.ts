// Se ejecuta durante el build (desde Base.astro): un slug mal escrito rompe el build.
import { getCollection } from 'astro:content';
import { brokenEventRefs, formatBrokenRefs } from '../lib/content-integrity';

let checked = false;

export async function assertContentIntegrity(): Promise<void> {
  if (checked) return;
  const [events, projects] = await Promise.all([getCollection('events'), getCollection('projects')]);
  const broken = brokenEventRefs(
    projects.map((p) => ({ id: p.id, event: p.data.event.id })),
    events.map((e) => e.id),
  );
  if (broken.length) throw new Error(formatBrokenRefs(broken));
  checked = true;
}
