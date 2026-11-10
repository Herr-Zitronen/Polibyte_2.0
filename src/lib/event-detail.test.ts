import { describe, expect, it } from 'vitest';
import { detailTiming, eventPaths, keyFacts, showRegistration } from './event-detail';

const NOW = new Date('2026-11-09T12:00:00-05:00');
const day = (s: string) => new Date(`${s}T00:00:00-05:00`);

const base = { title: 'Imagine Cup', type: 'competition' as const, organizer: 'Microsoft' };

describe('detailTiming', () => {
  it('próximo → cuenta regresiva hacia el inicio (día + hora)', () => {
    const t = detailTiming({ ...base, date: day('2026-12-05'), time: '09:00' }, NOW);
    expect(t).toEqual({ kind: 'countdown', start: new Date('2026-12-05T09:00:00-05:00') });
  });
  it('pasado → "Realizado"', () => {
    expect(detailTiming({ ...base, date: day('2025-10-18') }, NOW)).toEqual({ kind: 'done', label: 'Realizado' });
  });
  it('sin fecha → "Por confirmar"', () => {
    expect(detailTiming(base, NOW)).toEqual({ kind: 'tbd', label: 'Por confirmar' });
  });
  it('el mismo día sigue siendo próximo', () => {
    expect(detailTiming({ ...base, date: day('2026-11-09') }, NOW).kind).toBe('countdown');
  });
});

describe('showRegistration', () => {
  const url = 'https://imaginecup.microsoft.com';
  it('solo si es próximo o por confirmar y tiene enlace', () => {
    expect(showRegistration({ ...base, date: day('2026-12-05'), registrationUrl: url }, NOW)).toBe(true);
    expect(showRegistration({ ...base, registrationUrl: url }, NOW)).toBe(true);
    expect(showRegistration({ ...base, date: day('2025-10-18'), registrationUrl: url }, NOW)).toBe(false);
    expect(showRegistration({ ...base, date: day('2026-12-05') }, NOW)).toBe(false);
  });
});

describe('keyFacts', () => {
  it('lista los datos presentes en orden y omite los ausentes', () => {
    const facts = keyFacts({
      ...base,
      date: day('2026-12-05'),
      time: '09:00',
      place: 'Remoto',
      mode: 'remoto',
      teamSize: 'De 2 a 4 personas',
      requirements: 'Ser estudiante de la ESPOCH.',
    });
    expect(facts.map((f) => f.label)).toEqual(['Fecha', 'Hora', 'Lugar', 'Modalidad', 'Equipos', 'Requisitos', 'Organiza']);
    expect(facts.find((f) => f.label === 'Fecha')?.value).toBe('5 de diciembre de 2026');
    expect(facts.find((f) => f.label === 'Modalidad')?.value).toBe('Remoto');
  });
  it('sin fecha dice "Por confirmar" y muestra el aliado del club', () => {
    const facts = keyFacts({ type: 'club', organizer: 'PoliByte', ally: 'GDG' });
    expect(facts).toEqual([
      { label: 'Fecha', value: 'Por confirmar' },
      { label: 'Organiza', value: 'PoliByte' },
      { label: 'Con el club', value: 'PoliByte · GDG' },
    ]);
  });
});

describe('eventPaths', () => {
  it('una ruta por evento, con el id como slug', () => {
    const ev = [{ id: 'a', data: { title: 'A' } }, { id: 'b', data: { title: 'B' } }];
    expect(eventPaths(ev)).toEqual([
      { params: { slug: 'a' }, props: { entry: ev[0] } },
      { params: { slug: 'b' }, props: { entry: ev[1] } },
    ]);
  });
});
