// Pantalla de entrada de Inicio (perf/fluidez-real, punto 7): tapa el primer segundo de calentamiento
// (decodificar el nevado, fuentes, capas de la portada) sin perjudicar el LCP ni dejar capas vivas.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

describe('pantalla de entrada', () => {
  const intro = read('src/components/Intro.astro');
  const base = read('src/layouts/Base.astro');
  const css = intro.slice(intro.indexOf('<style'), intro.indexOf('</style>'));

  it('solo Inicio la pide', () => {
    expect(read('src/pages/index.astro')).toMatch(/<Base[^>]*\bintro\b/);
    expect(base).toMatch(/intro && <Intro \/>/);
    expect(base).toMatch(/data-intro=\{intro \? '' : undefined\}/);
  });

  it('sin coste de red: CSS y script en línea, sin imágenes', () => {
    expect(intro).toMatch(/<style is:inline/);
    expect(base).toMatch(/<script is:inline define:vars=\{\{ INTRO \}\}/);
    expect(intro).not.toMatch(/<img|url\(|background-image/);
  });

  it('una vez por visita, nunca con movimiento reducido ni en una página pre-renderizada', () => {
    expect(base).toMatch(/sessionStorage/);
    expect(base).toMatch(/prefers-reduced-motion: reduce/);
    expect(base).toMatch(/document\.prerendering/);
  });

  it('las E2E no la ven salvo que la pidan con ?intro', () => {
    expect(base).toMatch(/navigator\.webdriver && !new URLSearchParams\(location\.search\)\.has\('intro'\)/);
  });

  it('se salta con clic o con una tecla', () => {
    expect(base).toMatch(/addEventListener\('pointerdown', end/);
    expect(base).toMatch(/addEventListener\('keydown', end/);
  });

  it('espera a fuentes y carga, con mínimo y tope', () => {
    expect(base).toMatch(/document\.fonts/);
    expect(base).toMatch(/'load'/);
    expect(base).toMatch(/INTRO\.minMs/);
    expect(base).toMatch(/INTRO\.capMs/);
  });

  it('al retirarse sale del DOM y avisa (pb:intro-done)', () => {
    expect(base).toMatch(/\.remove\(\)/);
    expect(base).toMatch(/classList\.remove\('pb-intro-on'\)/);
    expect(base).toMatch(/pb:intro-done/);
  });

  it('oculta por defecto: sin la clase de <html> no se pinta nada', () => {
    expect(css).toMatch(/\.pb-intro\s*\{[^}]*display:\s*none/);
    expect(css).toMatch(/html\.pb-intro-on \.pb-intro\s*\{[^}]*display:\s*grid/);
  });

  it('queda bajo el grano de página (z 10): no pinta un grano propio', () => {
    const z = Number(css.match(/html\.pb-intro-on \.pb-intro\s*\{[^}]*z-index:\s*(\d+)/)?.[1]);
    expect(z).toBeLessThan(10);
    expect(z).toBeGreaterThan(3);
    expect(intro).not.toMatch(/pb-grain/);
  });

  it('solo anima transform y opacity, con pasos secos', () => {
    const frames = [...css.matchAll(/@keyframes [\w-]+\s*\{((?:[^{}]*\{[^{}]*\})*)\s*\}/g)].map((m) => m[1]!);
    expect(frames.length).toBeGreaterThan(3);
    for (const body of frames)
      for (const decl of body.matchAll(/([\w-]+)\s*:/g)) expect(['transform', 'opacity']).toContain(decl[1]);
    expect(css).toMatch(/steps\(/);
  });

  it('LCP intacto: bajo la entrada el titular está pintado en su sitio; su decodificado arranca al retirarse', () => {
    expect(css).toMatch(/html\.pb-intro-on \.pb-ch[^{]*\{[^}]*transform:\s*none[^}]*animation:\s*none/);
    const decode = read('src/scripts/decode.ts');
    expect(decode).toMatch(/pb-intro-on/);
    expect(decode).toMatch(/pb:intro-done/);
  });

  it('la salida es hacia arriba, con borde de píxeles de la franja', () => {
    expect(css).toMatch(/@keyframes pb-intro-out\s*\{[^}]*\{[^}]*translateY\(calc\(-100% - /);
    expect(intro).toMatch(/pixelRuns/);
  });

  it('es decorativa y termina con el bloque de movimiento reducido', () => {
    expect(intro).toMatch(/class="pb-intro" aria-hidden="true"/);
    const tail = css.slice(css.lastIndexOf('@media'));
    expect(tail).toMatch(/prefers-reduced-motion: reduce/);
    expect(tail).toMatch(/\.pb-intro\s*\{[^}]*display:\s*none\s*!important/);
  });
});
