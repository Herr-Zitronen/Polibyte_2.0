// El blur de la barra solo se apaga arriba del todo, donde bajo la barra no pasa contenido.
// Antes se apagaba mientras la barra estaba sobre la portada (#top): el titular de Equipo y de Eventos
// pasaba bajo la barra sin desenfoque y la barra no se leía.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(resolve(import.meta.dirname, '..', p), 'utf8');

describe('blur de la barra', () => {
  const ts = read('src/scripts/header-theme.ts');

  it('se apaga solo con la página arriba del todo (centinela), no por estar sobre la portada', () => {
    expect(ts).not.toMatch(/querySelector<HTMLElement>\('#top'\)/);
    expect(ts).toMatch(/TOP_ZONE/);
    expect(ts).toMatch(/data-blur/);
    expect(ts).toMatch(/pb-top-sentinel/);
  });

  it('el centinela no tiene coste por scroll: IntersectionObserver, sin listener de scroll', () => {
    expect(ts).toMatch(/new IntersectionObserver/);
    expect(ts).not.toMatch(/addEventListener\('scroll'/);
  });
});
