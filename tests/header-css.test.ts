// F8 · La barra superior no usa backdrop-filter (es lo más caro del scroll en Chrome/Windows).
// Su legibilidad sobre secciones claras depende de degradados sólidos y grano estático.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(import.meta.dirname, '../src/styles/header.css'), 'utf8');

describe('header.css (F8)', () => {
  it('no declara backdrop-filter ni filter', () => {
    expect(css).not.toMatch(/backdrop-filter\s*:/);
    expect(css).not.toMatch(/(^|[\s;{])filter\s*:/);
  });

  it('conserva la capa de tinte y el grano estático', () => {
    expect(css).toMatch(/\.pb-tint-dark/);
    expect(css).toMatch(/\.pb-tint-light/);
    expect(css).toMatch(/\.pb-tint-grain/);
  });

  it('la compactación cambia solo opacity del tinte', () => {
    expect(css).toMatch(/\.pb-hdr\[data-compact\][^{]*\.pb-tint\s*\{[^}]*opacity/);
    expect(css).not.toMatch(/\.pb-hdr\[data-compact\][^{]*\{[^}]*height/);
  });
});
