import { describe, expect, it } from 'vitest';
import { brokenEventRefs, formatBrokenRefs, showcaseWarnings } from './content-integrity';

describe('brokenEventRefs', () => {
  const projects = [
    { id: 'a', event: 'hackathon' },
    { id: 'b', event: 'evento-fantasma' },
  ];
  it('lista los proyectos cuyo evento no existe', () => {
    expect(brokenEventRefs(projects, ['hackathon'])).toEqual([{ id: 'b', event: 'evento-fantasma' }]);
    expect(brokenEventRefs(projects, ['hackathon', 'evento-fantasma'])).toEqual([]);
  });
  it('el mensaje nombra proyecto y evento', () => {
    expect(formatBrokenRefs([{ id: 'b', event: 'evento-fantasma' }])).toMatch(/"b".*"evento-fantasma"/);
  });
});

describe('showcaseWarnings (PR B)', () => {
  it('avisa de cada evento publicado sin ningún proyecto destacado', () => {
    const events = [
      { id: 'hack', showcase: 'published' as const },
      { id: 'git', showcase: 'published' as const },
      { id: 'icpc', showcase: 'hidden' as const },
    ];
    const projects = [
      { event: 'hack', featured: true },
      { event: 'git', featured: false },
    ];
    const w = showcaseWarnings(events, projects);
    expect(w).toHaveLength(1);
    expect(w[0]).toMatch(/"git".*no se mostrará/);
  });
});
