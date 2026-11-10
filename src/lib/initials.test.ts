import { describe, expect, it } from 'vitest';
import { initials } from './initials';

describe('initials', () => {
  it('toma la primera letra del primer y del último nombre', () => {
    expect(initials('María José Pérez')).toBe('MP');
  });
  it('quita tildes y pasa a mayúsculas', () => {
    expect(initials('ángel óscar')).toBe('AO');
    expect(initials('Íñigo Úbeda')).toBe('IU');
  });
  it('con una sola palabra devuelve una letra', () => {
    expect(initials('Cher')).toBe('C');
  });
  it('ignora espacios extra y signos', () => {
    expect(initials('  Ana   [Ruiz]  ')).toBe('AR');
  });
  it('sin letras devuelve cadena vacía', () => {
    expect(initials('   ')).toBe('');
  });
});
