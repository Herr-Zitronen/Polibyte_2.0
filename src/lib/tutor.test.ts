import { describe, expect, it } from 'vitest';
import { findTutor, mailtoHref } from './tutor';

const m = (role: string, extra = {}) => ({ role, name: role, ...extra });

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
