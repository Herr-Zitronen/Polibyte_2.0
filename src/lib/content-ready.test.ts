import { describe, expect, it } from 'vitest';
import { findPlaceholders } from './content-ready';

describe('findPlaceholders · contenido de ejemplo que no puede llegar a producción', () => {
  it('encuentra cada marcador con archivo y línea', () => {
    const found = findPlaceholders([
      { path: 'a.md', text: 'title: Hackathon\nsummary: "[Contenido de ejemplo] algo"' },
      { path: 'b.md', text: 'name: "[Nombre Apellido]"\n' },
      { path: 'c.md', text: 'title: "[Proyecto 1]"\ndemoUrl: https://example.com/demo' },
    ]);
    expect(found).toEqual([
      { path: 'a.md', line: 2, marker: '[Contenido de ejemplo]' },
      { path: 'b.md', line: 1, marker: '[Nombre' },
      { path: 'c.md', line: 1, marker: '[Proyecto' },
      { path: 'c.md', line: 2, marker: 'example.com' },
    ]);
  });

  it('el formulario de Microsoft sin ruta es un marcador; con ruta, no', () => {
    expect(findPlaceholders([{ path: 's.json', text: '"joinFormUrl": "https://forms.office.com/",' }])).toHaveLength(1);
    expect(findPlaceholders([{ path: 's.json', text: '"joinFormUrl": "https://forms.office.com/r/AbC123"' }])).toEqual([]);
  });

  it('contenido real: nada que reportar', () => {
    expect(findPlaceholders([{ path: 'ok.md', text: 'title: Imagine Cup 2027\nsummary: Competencia de Microsoft.' }])).toEqual([]);
  });
});
