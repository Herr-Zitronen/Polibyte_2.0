import { describe, expect, it } from 'vitest';
import { BOARD_ORDER, boardMembers, socialLinks } from './board';

const m = (role: string, extra = {}) => ({ role, name: role, period: '2026', ...extra }) as never;

describe('boardMembers', () => {
  it('ordena por cargo y excluye al tutor', () => {
    const out = boardMembers([m('Creative Director'), m('Webmaster'), m('Tutor'), m('Tesorería'), m('Presidencia'), m('Secretaría'), m('Vicepresidencia')]);
    expect(out.map((x: { role: string }) => x.role)).toEqual([...BOARD_ORDER]);
    expect(BOARD_ORDER.at(-1)).toBe('Creative Director');
  });
});

describe('socialLinks', () => {
  it('arma los tres enlaces en orden Instagram, LinkedIn, GitHub', () => {
    const links = socialLinks({ instagram: '@ana.r', linkedin: 'https://linkedin.com/in/ana', github: 'https://github.com/ana' });
    expect(links.map((l) => l.label)).toEqual(['Instagram', 'LinkedIn', 'GitHub']);
    expect(links[0]?.href).toBe('https://www.instagram.com/ana.r/');
  });
  it('omite los que faltan', () => {
    expect(socialLinks({ github: 'https://github.com/ana' }).map((l) => l.label)).toEqual(['GitHub']);
    expect(socialLinks({})).toEqual([]);
  });
});
