import { describe, expect, it } from 'vitest';
import { footerLinks } from './footer-links';

describe('footerLinks · enlaces del pie desde site.json', () => {
  it('sin datos no hay enlaces (el pie no muestra marcadores)', () => {
    expect(footerLinks({ email: '', instagram: '', github: '' })).toEqual([]);
    expect(footerLinks({ email: '  ', instagram: ' ', github: '' })).toEqual([]);
  });

  it('el correo se convierte en mailto: y no abre otra pestaña', () => {
    expect(footerLinks({ email: 'polibyte@espoch.edu.ec', instagram: '', github: '' })).toEqual([
      { label: 'Correo', href: 'mailto:polibyte@espoch.edu.ec', external: false },
    ]);
    expect(footerLinks({ email: 'mailto:a@b.ec', instagram: '', github: '' })[0]!.href).toBe('mailto:a@b.ec');
  });

  it('Instagram y GitHub aceptan la URL completa o solo el usuario', () => {
    expect(footerLinks({ email: '', instagram: '@polibyte.espoch', github: 'polibyte-espoch' })).toEqual([
      { label: 'Instagram', href: 'https://www.instagram.com/polibyte.espoch/', external: true },
      { label: 'GitHub', href: 'https://github.com/polibyte-espoch', external: true },
    ]);
    expect(footerLinks({ email: '', instagram: 'https://instagram.com/x', github: 'https://github.com/y' }).map((l) => l.href)).toEqual([
      'https://instagram.com/x',
      'https://github.com/y',
    ]);
  });

  it('orden fijo: Correo, Instagram, GitHub; solo los que tienen dato', () => {
    expect(footerLinks({ email: 'a@b.ec', instagram: '', github: 'org' }).map((l) => l.label)).toEqual(['Correo', 'GitHub']);
  });
});
