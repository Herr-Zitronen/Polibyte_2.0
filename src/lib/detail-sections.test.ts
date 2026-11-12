// PR B · Secciones del detalle de evento y franjas entre ellas (dos colores: el de arriba y el de abajo).
import { describe, expect, it } from 'vitest';
import { detailSections } from './detail-sections';
import { EDGE } from './pixel-strip';

const keys = (o: Parameters<typeof detailSections>[0]) => detailSections(o).map((s) => s.key);

describe('detailSections', () => {
  it('orden: portada → sobre → cronograma → proyectos → inscripción', () => {
    expect(keys({ schedule: true, showcase: true, registration: true })).toEqual(['hero', 'about', 'schedule', 'showcase', 'registration']);
    expect(keys({ schedule: false, showcase: false, registration: false })).toEqual(['hero', 'about']);
  });

  it('cada franja une el color inferior de una sección con el superior de la siguiente (y la última con el pie)', () => {
    const s = detailSections({ schedule: true, showcase: true, registration: true });
    expect(s.map((x) => x.strip && [x.strip.top, x.strip.bottom])).toEqual([
      [EDGE.cover, EDGE.navy], // portada → sobre
      [EDGE.navy, EDGE.paper], // sobre → cronograma
      [EDGE.paper, EDGE.navy], // cronograma → proyectos
      [EDGE.navy, EDGE.image], // proyectos → inscripción
      [EDGE.cover, EDGE.footer], // inscripción → pie
    ]);
  });

  it('sin franja entre dos secciones del mismo color (sobre → proyectos, ambas azul noche)', () => {
    const s = detailSections({ schedule: false, showcase: true, registration: false });
    expect(s.map((x) => x.key)).toEqual(['hero', 'about', 'showcase']);
    expect(s[1]!.strip).toBeNull();
    expect(s[2]!.strip).toEqual({ seed: expect.any(Number), top: EDGE.navy, bottom: EDGE.footer });
  });

  it('semillas fijas y distintas (patrón estable entre builds)', () => {
    const seeds = detailSections({ schedule: true, showcase: true, registration: true }).map((x) => x.strip!.seed);
    expect(new Set(seeds).size).toBe(seeds.length);
    expect(detailSections({ schedule: true, showcase: true, registration: true })).toEqual(
      detailSections({ schedule: true, showcase: true, registration: true }),
    );
  });
});
