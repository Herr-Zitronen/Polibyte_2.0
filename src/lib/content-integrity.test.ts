import { describe, expect, it } from 'vitest';
import { brokenEventRefs, formatBrokenRefs } from './content-integrity';

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
