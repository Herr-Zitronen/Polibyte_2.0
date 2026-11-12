// H3.1 · Esquemas de contenido (CONTENT_MODEL.md).
import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { eventStatus } from '../lib/events';
import { eventSchema, memberSchema, projectSchema } from './schemas';

const base = { title: 'Imagine Cup', type: 'competition', organizer: 'Microsoft', summary: 'Competencia global.' };
const fakeImage = () => z.string();
const fakeRef = () => z.string();

describe('eventSchema', () => {
  it('acepta un evento sin fecha y su estado es "tbd"', () => {
    const e = eventSchema.parse(base);
    expect(e.date).toBeUndefined();
    expect(eventStatus(e, new Date('2026-11-09T12:00:00Z'))).toBe('tbd');
  });

  it('rechaza un tipo fuera de club|competition', () => {
    expect(() => eventSchema.parse({ ...base, type: 'alliance' })).toThrow();
  });

  it('showcase es "hidden" por defecto y schedule []', () => {
    const e = eventSchema.parse(base);
    expect(e.showcase).toBe('hidden');
    expect(e.schedule).toEqual([]);
  });

  it('una fecha sin hora es ese día en Riobamba, no en UTC', () => {
    const fromString = eventSchema.parse({ ...base, date: '2026-12-05' }).date!;
    const fromYaml = eventSchema.parse({ ...base, date: new Date('2026-12-05T00:00:00Z') }).date!;
    for (const d of [fromString, fromYaml]) expect(d.toISOString()).toBe('2026-12-05T05:00:00.000Z');
    const withTime = eventSchema.parse({ ...base, date: '2026-12-05T20:00:00-05:00' }).date!;
    expect(withTime.toISOString()).toBe('2026-12-06T01:00:00.000Z');
  });

  it('convierte fechas en Date', () => {
    expect(eventSchema.parse({ ...base, date: '2026-12-05' }).date).toBeInstanceOf(Date);
  });
});

describe('memberSchema', () => {
  const m = { role: 'Presidencia', name: 'Ana' };
  it('exige period', () => {
    expect(() => memberSchema(fakeImage).parse(m)).toThrow();
    expect(memberSchema(fakeImage).parse({ ...m, period: '2026–2027' }).period).toBe('2026–2027');
  });
  it('rechaza cargos fuera de la lista', () => {
    expect(() => memberSchema(fakeImage).parse({ ...m, role: 'Jefe', period: '2026–2027' })).toThrow();
  });
});

describe('projectSchema', () => {
  it('featured es false y order 0 por defecto', () => {
    const p = projectSchema(fakeImage, fakeRef).parse({
      event: 'imagine-cup-2026',
      title: 'Agua Clara',
      team: 'Los Bits',
      members: ['Ana'],
      problem: 'Mide la calidad del agua.',
      stack: ['Astro'],
      shotDesktop: 'x.webp',
    });
    expect(p.featured).toBe(false);
    expect(p.order).toBe(0);
  });

  // Botones de la vitrina: cada uno se activa por proyecto solo con su dato (demoUrl → "Ver demo",
  // repoUrl → "GitHub"). Los proyectos ya existentes deben seguir validando sin ninguno de los dos.
  describe('enlaces opcionales (demoUrl, repoUrl)', () => {
    const minimal = {
      event: 'kiroween-2026',
      title: 'Cuotas',
      team: 'Crew',
      members: [],
      problem: 'Limita eventos.',
      stack: [],
      shotDesktop: 'x.webp',
    };
    const parse = (extra: object) => projectSchema(fakeImage, fakeRef).parse({ ...minimal, ...extra });

    it('acepta un proyecto sin demoUrl ni repoUrl', () => {
      const p = parse({});
      expect(p.demoUrl).toBeUndefined();
      expect(p.repoUrl).toBeUndefined();
    });

    it('acepta cada enlace por separado', () => {
      expect(parse({ repoUrl: 'https://github.com/polibyte-espoch/x' }).demoUrl).toBeUndefined();
      expect(parse({ demoUrl: 'https://x.example.com/' }).repoUrl).toBeUndefined();
    });

    it('rechaza enlaces que no son URL', () => {
      expect(() => parse({ demoUrl: 'x.example.com' })).toThrow();
      expect(() => parse({ repoUrl: 'polibyte-espoch/x' })).toThrow();
    });
  });
});
