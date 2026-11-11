// H1.1 / H4.1 · Fuentes propias: nada de hojas externas (sin conexiones a terceros antes del primer pintado).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const read = (p: string) => readFileSync(resolve(import.meta.dirname, p), 'utf8');
const src = read('Fonts.astro');

describe('Fonts.astro', () => {
  it('no enlaza hojas ni orígenes externos', () => {
    expect(src).not.toMatch(/rel="stylesheet"/);
    expect(src).not.toMatch(/https?:\/\//);
  });

  it('precarga solo JetBrains Mono Variable (subconjunto latín), del propio dominio (WOR-101)', () => {
    const links = src.match(/<link\b[^>]*>/g) ?? [];
    expect(links).toHaveLength(1);
    expect(links[0]).toMatch(/rel="preload"/);
    expect(links[0]).toMatch(/as="font"/);
    expect(links[0]).toMatch(/type="font\/woff2"/);
    expect(links[0]).toMatch(/crossorigin/);
    expect(src).toMatch(/jetbrains-mono-latin-wght-normal\.woff2\?url/);
  });

  it('declara un respaldo con métricas ajustadas para que el h1 no salte al cambiar de fuente', () => {
    expect(src).toMatch(/@font-face\s*\{[^}]*font-family:\s*'JetBrains Mono Fallback'/);
    expect(src).toMatch(/size-adjust:/);
    expect(src).toMatch(/ascent-override:/);
    expect(src).toMatch(/descent-override:/);
    expect(read('../styles/tokens.css')).toMatch(/--pb-font-mono:\s*'JetBrains Mono Variable',\s*'JetBrains Mono Fallback'/);
  });

  it('importa solo las tres familias, con los pesos de DESIGN §2.2', () => {
    const imports = [...src.matchAll(/^import '([^']+)';/gm)].map((m) => m[1]);
    expect(imports).toEqual([
      '@fontsource-variable/jetbrains-mono/wght.css',
      '@fontsource/silkscreen/latin-400.css',
      '@fontsource/silkscreen/latin-700.css',
      '@fontsource/instrument-sans/latin-600.css',
    ]);
  });
});
