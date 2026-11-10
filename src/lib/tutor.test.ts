import { describe, expect, it } from 'vitest';
import { findTutor, mailtoHref } from './tutor';

type M = { role: string; name: string; title?: string };
const m = (role: string, extra: Partial<M> = {}): M => ({ role, name: role, ...extra });

describe('findTutor', () => {
  it('devuelve el miembro con rol Tutor', () => {
    expect(findTutor([m('Presidencia'), m('Tutor', { title: 'PhD' })])?.title).toBe('PhD');
  });
  it('sin tutor devuelve undefined (la sección no aparece)', () => {
    expect(findTutor([m('Presidencia'), m('Webmaster')])).toBeUndefined();
  });
});

describe('mailtoHref', () => {
  it('arma el enlace mailto: sin espacios', () => {
    expect(mailtoHref(' tutor@espoch.edu.ec ')).toBe('mailto:tutor@espoch.edu.ec');
  });
});
