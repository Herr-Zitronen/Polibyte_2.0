// H1.1 / H4.1 · Fuentes propias: nada de hojas externas (sin conexiones a terceros antes del primer pintado).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(resolve(import.meta.dirname, 'Fonts.astro'), 'utf8');

describe('Fonts.astro', () => {
  it('no enlaza hojas ni orígenes externos', () => {
    expect(src).not.toMatch(/<link\b/);
    expect(src).not.toMatch(/https?:\/\//);
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
