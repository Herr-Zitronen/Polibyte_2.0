// H1.1 · Los tokens de DESIGN.md §2 existen en tokens.css con su valor exacto.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const css = readFileSync(resolve(import.meta.dirname, 'tokens.css'), 'utf8');
const rootBlock = /:root\s*\{([\s\S]*?)\n\}/.exec(css)?.[1] ?? '';
const vars = Object.fromEntries(
  [...rootBlock.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], (m[2] ?? '').trim()]),
);
const mobile = /@media\s*\(max-width:\s*820px\)\s*\{\s*:root\s*\{([\s\S]*?)\}/.exec(css)?.[1] ?? '';

const colors: Record<string, string> = {
  '--pb-navy-950': '#0D1438',
  '--pb-navy-900': '#0F1A4D',
  '--pb-ink': '#13205A',
  '--pb-blue-800': '#1A2C78',
  '--pb-blue-750': '#1B2C78',
  '--pb-blue-700': '#22389C',
  '--pb-blue-500': '#2D4FC4',
  '--pb-paper': '#ECEFF6',
  '--pb-white': '#F2F4FA',
  '--pb-accent': '#F2E0A0',
  '--pb-accent-strong': '#E8CF73',
  '--pb-muted-light': '#3A4677',
  '--pb-muted-dark': '#AEB6D3',
  '--pb-code': '#CFE3FF',
  '--pb-wordmark': '#252D4F',
  '--pb-ghost': '#D2D7E6',
};

describe('H1.1 · tokens de color (§2.1)', () => {
  it('define exactamente los 16 colores --pb-* con su hex', () => {
    for (const [name, hex] of Object.entries(colors)) expect(vars[name]?.toUpperCase(), name).toBe(hex);
  });
});

describe('H1.1 · escala tipográfica (§2.2)', () => {
  const scale: Record<string, string> = {
    '--pb-fs-hero': 'clamp(40px, 6.2vw, 96px)',
    '--pb-fs-page': 'clamp(46px, 8vw, 128px)',
    '--pb-fs-section': 'clamp(44px, 7vw, 112px)',
    '--pb-fs-quote': 'clamp(26px, 3.4vw, 50px)',
    '--pb-fs-list': 'clamp(20px, 2.2vw, 30px)',
  };
  it('define los tamaños de la escala', () => {
    for (const [name, v] of Object.entries(scale)) expect(vars[name], name).toBe(v);
  });
  it('el titular de portada baja a 34px en ≤820', () => {
    expect(mobile).toMatch(/--pb-fs-hero:\s*34px/);
  });
  it('define las familias tipográficas', () => {
    expect(vars['--pb-font-mono']).toMatch(/^'JetBrains Mono'/);
    expect(vars['--pb-font-pixel']).toMatch(/^'Silkscreen'/);
    expect(vars['--pb-font-wordmark']).toMatch(/^'Instrument Sans'/);
  });
});

describe('H1.1 · layout (§2.3)', () => {
  it('contenedor de 1320px con gutter 32px (16px en ≤820)', () => {
    expect(vars['--pb-container']).toBe('1320px');
    expect(vars['--pb-gutter']).toBe('32px');
    expect(mobile).toMatch(/--pb-gutter:\s*16px/);
  });
});
