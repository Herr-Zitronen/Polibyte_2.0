// Páginas con imagen OG propia (H9.1). Una por página pública y una por evento.
import { getCollection } from 'astro:content';

export interface OgPage {
  slug: string;
  kicker: string;
  title: string;
}

export const ogPages = async (): Promise<OgPage[]> => {
  const events = await getCollection('events');
  return [
    { slug: 'inicio', kicker: 'Club de la Carrera de Software', title: 'Construimos software. Y a quienes lo construyen.' },
    { slug: 'eventos', kicker: 'Eventos', title: 'Calendario, archivo y proyectos del club.' },
    { slug: 'equipo', kicker: 'Equipo', title: 'Directiva y tutor del club.' },
    { slug: 'unirme', kicker: 'Ingreso al club', title: 'Únete al club.' },
    ...events.map((e) => ({ slug: `eventos/${e.id}`, kicker: 'Evento', title: e.data.title })),
  ];
};
