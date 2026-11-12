// F11 (WOR-97) · Títulos de pestaña. Decisión de Joel: «Sección · PoliByte» (lo específico primero,
// para que se lea en pestañas estrechas), no el «PoliByte · Sección» del prototipo.
import { describe, expect, it } from 'vitest';
import { HOME_TITLE, pageTitle } from './page-title';

describe('pageTitle', () => {
  it('Inicio lleva el nombre completo del club', () => {
    expect(pageTitle()).toBe('PoliByte · Club de la Carrera de Software');
    expect(HOME_TITLE).toBe(pageTitle());
  });

  it('una sección va antes de la marca', () => {
    expect(pageTitle('Eventos')).toBe('Eventos · PoliByte');
    expect(pageTitle('Equipo')).toBe('Equipo · PoliByte');
    expect(pageTitle('Unirme')).toBe('Unirme · PoliByte');
    expect(pageTitle('Página no encontrada')).toBe('Página no encontrada · PoliByte');
  });

  it('el detalle de evento va de lo más específico a lo más general', () => {
    expect(pageTitle('Imagine Cup', 'Eventos')).toBe('Imagine Cup · Eventos · PoliByte');
  });

  it('ignora partes vacías y recorta espacios', () => {
    expect(pageTitle('  Equipo ', '', '   ')).toBe('Equipo · PoliByte');
    expect(pageTitle('')).toBe(pageTitle());
  });
});
