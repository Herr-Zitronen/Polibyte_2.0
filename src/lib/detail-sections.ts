// PR B · Secciones del detalle de evento y la franja de píxeles que va DESPUÉS de cada una (DESIGN §3.7).
// Antes cada combinación (con/sin cronograma, con/sin inscripción) se escribía a mano; con la vitrina
// eran 8 casos. Aquí se arma la lista y cada franja une el color inferior de una sección con el superior
// de la siguiente (o con el pie). Dos secciones del mismo color van seguidas, sin franja.
import { EDGE } from './pixel-strip';

export type DetailKey = 'hero' | 'about' | 'schedule' | 'showcase' | 'registration';
export type Strip = { seed: number; top: string; bottom: string };
export type DetailSection = { key: DetailKey; strip: Strip | null };

const EDGES: Record<DetailKey, { top: string; bottom: string }> = {
  hero: { top: EDGE.cover, bottom: EDGE.cover },
  about: { top: EDGE.navy, bottom: EDGE.navy },
  schedule: { top: EDGE.paper, bottom: EDGE.paper },
  showcase: { top: EDGE.navy, bottom: EDGE.navy },
  registration: { top: EDGE.image, bottom: EDGE.cover },
};

const SEEDS: Record<DetailKey, number> = { hero: 171, about: 173, schedule: 179, showcase: 183, registration: 181 };

export function detailSections(has: { schedule: boolean; showcase: boolean; registration: boolean }): DetailSection[] {
  const keys: DetailKey[] = ['hero', 'about'];
  if (has.schedule) keys.push('schedule');
  if (has.showcase) keys.push('showcase');
  if (has.registration) keys.push('registration');
  return keys.map((key, i) => {
    const next = keys[i + 1];
    const top = EDGES[key].bottom;
    const bottom = next ? EDGES[next].top : EDGE.footer;
    return { key, strip: top === bottom ? null : { seed: SEEDS[key], top, bottom } };
  });
}
