// Vitrina · botones de cada proyecto: "Ver demo" (primario, demoUrl) y "GitHub" con icono (secundario, repoUrl).
// Como el resto de pruebas de componentes, se revisa el código fuente (Vitest no compila .astro).
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dir = import.meta.dirname;
const read = (p: string) => readFileSync(resolve(dir, p), 'utf8');
/** La vitrina y su fila de botones juntas: la prueba no depende de en cuál de los dos archivos vivan. */
const events = () =>
  ['Showcase.astro', 'ProjectActions.astro']
    .filter((f) => existsSync(resolve(dir, f)))
    .map(read)
    .join('\n');
const iconPath = '../GitHubIcon.astro';

describe('Vitrina · botones de proyecto', () => {
  it('el secundario ya no dice "Código"', () => {
    expect(events()).not.toMatch(/>\s*Código\s*</);
  });

  it('el secundario dice "GitHub", lleva el icono y solo aparece con repoUrl', () => {
    const src = events();
    const github = src.match(/repoUrl\s*&&\s*\(?\s*<Button variant="secondary"[^>]*>\s*<GitHubIcon slot="icon" \/>\s*GitHub\s*<\/Button>/g) ?? [];
    expect(github.length).toBeGreaterThan(0);
    // Ningún secundario de la vitrina queda sin icono.
    const secondaries = src.match(/<Button variant="secondary"[^>]*>[\s\S]*?<\/Button>/g) ?? [];
    for (const b of secondaries) expect(b).toMatch(/<GitHubIcon slot="icon" \/>\s*GitHub/);
  });

  it('"Ver demo" sigue siendo el primario y solo aparece con demoUrl', () => {
    const src = events();
    expect(src).toMatch(/demoUrl\s*&&\s*\(?\s*<Button variant="primary"[^>]*href=\{[^}]*demoUrl\}[^>]*>\s*Ver demo\s*<\/Button>/);
  });

  it('nunca más de dos botones por proyecto', () => {
    for (const block of events().match(/<div class="pb-actions">[\s\S]*?<\/div>/g) ?? []) {
      expect((block.match(/<Button\b/g) ?? []).length).toBeLessThanOrEqual(2);
    }
  });
});

describe('GitHubIcon.astro', () => {
  const icon = () => read(iconPath);

  it('existe', () => {
    expect(existsSync(resolve(dir, iconPath))).toBe(true);
  });

  it('es SVG en línea, decorativo y sin enlaces externos', () => {
    expect(icon()).toMatch(/<svg\b/);
    expect(icon()).toMatch(/aria-hidden="true"/);
    expect(icon()).toMatch(/focusable="false"/);
    expect(icon()).not.toMatch(/<(use|image|img)\b|https?:\/\/(?!www\.w3\.org)/);
  });

  it('toma el color del texto del botón (también en hover)', () => {
    expect(icon()).toMatch(/fill="currentColor"/);
    expect(icon()).not.toMatch(/fill="#/);
  });

  // 1.2em: 18 px en el botón normal (15 px, igual que la terminal de "Ver eventos") y 16,8 px en `sm` (14 px),
  // menor que su línea de 17,5 px: el icono nunca hace crecer la altura del botón.
  it('mide 1.2em: 18 px junto a texto de 15 px y no agranda los botones pequeños', () => {
    expect(icon()).toMatch(/width="1\.2em"/);
    expect(icon()).toMatch(/height="1\.2em"/);
  });
});
