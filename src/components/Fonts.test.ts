// H1.1 · Las hojas de Google Fonts no bloquean el render (presupuesto de LCP, H0.2).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const src = readFileSync(resolve(import.meta.dirname, 'Fonts.astro'), 'utf8');
const stylesheets = [...src.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map((m) => m[0]);
const outsideNoscript = src.replace(/<noscript>[\s\S]*?<\/noscript>/g, '');

describe('Fonts.astro', () => {
  it('ninguna hoja de fuentes bloquea el render', () => {
    const blocking = [...outsideNoscript.matchAll(/<link\b[^>]*rel="stylesheet"[^>]*>/g)].map((m) => m[0]);
    expect(blocking.length).toBeGreaterThan(0);
    for (const l of blocking) {
      expect(l).toMatch(/media="print"/);
      expect(l).toMatch(/onload="this\.media='all'"/);
    }
  });

  it('tiene respaldo <noscript> con las mismas hojas', () => {
    expect(src).toMatch(/<noscript>[\s\S]*fonts\.googleapis\.com[\s\S]*<\/noscript>/);
    expect(stylesheets.length).toBe(4);
  });
});
