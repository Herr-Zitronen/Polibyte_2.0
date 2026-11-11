// H5.1 · Último evento concluido: vista pura (reloj fijo + fixture con 3 pasados).
import { describe, expect, it } from 'vitest';
import { recapView } from './recap';

const d = (s: string) => new Date(`${s}T00:00:00-05:00`);
const now = d('2026-11-09');

const base = { type: 'club' as const, organizer: 'PoliByte', summary: 'x', showcase: 'hidden' as const };
const events = [
  { ...base, id: 'old', title: 'Viejo', date: d('2025-10-18') },
  { ...base, id: 'recent', title: 'Hackathon ESPOCH', date: d('2026-05-16'), stats: { teams: 12, projects: 11, people: 44 }, showcase: 'published' as const },
  { ...base, id: 'mid', title: 'Taller de Git', date: d('2026-03-14') },
  { ...base, id: 'future', title: 'Futuro', date: d('2026-12-05') },
];
const featured = [{ event: 'recent', featured: true }];

describe('recapView', () => {
  it('encabeza con el pasado más reciente', () => {
    const v = recapView(events, featured, now);
    expect(v.kind).toBe('event');
    expect(v.title).toBe('Hackathon ESPOCH');
  });

  it('cifras completas en orden equipos/proyectos/personas', () => {
    const v = recapView(events, featured, now);
    expect(v.kind === 'event' && v.stats).toEqual([
      { key: 'teams', value: 12, label: 'equipos participantes' },
      { key: 'projects', value: 11, label: 'proyectos entregados' },
      { key: 'people', value: 44, label: 'personas construyendo' },
    ]);
  });

  it('stats parcial: solo las cifras presentes, sin inventar ceros', () => {
    const partial = events.map((e) => (e.id === 'recent' ? { ...e, stats: { teams: 0, people: 30 } } : e));
    const v = recapView(partial, featured, now);
    expect(v.kind === 'event' && v.stats.map((s) => [s.key, s.value])).toEqual([
      ['teams', 0],
      ['people', 30],
    ]);
  });

  it('sin stats → sin cifras', () => {
    const v = recapView(events.filter((e) => e.id !== 'recent'), featured, now);
    expect(v.kind === 'event' && v.stats).toEqual([]);
  });

  it('vitrina publicada con destacados → "Ver proyectos destacados"', () => {
    expect(recapView(events, featured, now).primary).toEqual({ label: 'Ver proyectos destacados', href: '#destacados' });
  });

  it('un evento posterior sin vitrina no apaga "Ver proyectos destacados" (PR B)', () => {
    const later = [...events, { ...base, id: 'taller', title: 'Taller', date: d('2026-08-01') }];
    const v = recapView(later, featured, now);
    expect(v.title).toBe('Taller');
    expect(v.primary).toEqual({ label: 'Ver proyectos destacados', href: '#destacados' });
  });

  it('publicada pero sin destacados → "Ver calendario"', () => {
    expect(recapView(events, [{ event: 'recent', featured: false }], now).primary).toEqual({ label: 'Ver calendario', href: '#calendario' });
  });

  it('destacados pero vitrina oculta → "Ver calendario"', () => {
    const hidden = events.map((e) => (e.id === 'recent' ? { ...e, showcase: 'hidden' as const } : e));
    expect(recapView(hidden, featured, now).primary.href).toBe('#calendario');
  });

  it('sin eventos pasados → estado alternativo', () => {
    const v = recapView([events[3]!], [], now);
    expect(v).toEqual({
      kind: 'empty',
      title: 'Eventos',
      text: 'Todavía no hemos cerrado ningún evento. Mira lo que viene en el calendario.',
      primary: { label: 'Ver calendario', href: '#calendario' },
    });
  });
});
