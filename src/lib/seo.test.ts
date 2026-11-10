import { describe, expect, it } from 'vitest';
import { absoluteUrl, isPublicPath, ogImagePath, ogSlug, pngSize } from './seo';

describe('ogSlug', () => {
  it('la portada se llama "inicio"', () => expect(ogSlug('/')).toBe('inicio'));
  it('quita barras de los extremos', () => {
    expect(ogSlug('/eventos/')).toBe('eventos');
    expect(ogSlug('/eventos/codefest-2027/')).toBe('eventos/codefest-2027');
    expect(ogSlug('/unirme')).toBe('unirme');
  });
});

describe('ogImagePath', () => {
  const known = ['inicio', 'eventos', 'eventos/codefest-2027'];
  it('usa la imagen de la página si existe', () =>
    expect(ogImagePath('/eventos/codefest-2027/', known)).toBe('/og/eventos/codefest-2027.png'));
  it('cae en la de inicio si la página no tiene propia (404, lab)', () => {
    expect(ogImagePath('/no-existe/', known)).toBe('/og/inicio.png');
    expect(ogImagePath('/lab/board/', known)).toBe('/og/inicio.png');
  });
});

describe('absoluteUrl', () => {
  it('une el dominio y la ruta sin barras dobles', () =>
    expect(absoluteUrl('/og/inicio.png', 'https://club.example/')).toBe('https://club.example/og/inicio.png'));
});

describe('isPublicPath', () => {
  it('excluye /lab/ y la 404', () => {
    expect(isPublicPath('/lab/board/')).toBe(false);
    expect(isPublicPath('/404/')).toBe(false);
    expect(isPublicPath('/404')).toBe(false);
  });
  it('incluye las páginas del sitio', () => {
    for (const p of ['/', '/eventos/', '/equipo/', '/unirme/', '/eventos/icpc-2025/']) expect(isPublicPath(p)).toBe(true);
  });
});

describe('pngSize', () => {
  it('lee ancho y alto de la cabecera IHDR', () => {
    const b = new Uint8Array(24);
    b.set([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    const v = new DataView(b.buffer);
    v.setUint32(16, 1200);
    v.setUint32(20, 630);
    expect(pngSize(b)).toEqual({ width: 1200, height: 630 });
  });
  it('rechaza lo que no es PNG', () => expect(() => pngSize(new Uint8Array(24))).toThrow());
});
