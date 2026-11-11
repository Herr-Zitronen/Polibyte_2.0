// F17 · Escudo de la ESPOCH en la barra: [escudo] │ [isotipo PoliByte + nombre] (DESIGN §3.9, §3.11).
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

describe('F17 · escudo ESPOCH', () => {
  const logo = read('src/components/Logo.astro');
  const shield = read('src/assets/brand/espoch-shield.svg');
  const css = read('src/styles/header.css');

  it('el SVG es solo el escudo y el libro: un trazo en currentColor, sin texto ni colores fijos', () => {
    expect(shield).toMatch(/fill="currentColor"/);
    expect(shield).not.toMatch(/<text|<image|#[0-9a-f]{3,6}/i);
    expect(shield.match(/<path/g)).toHaveLength(1);
    expect(Buffer.byteLength(shield)).toBeLessThan(4096);
  });

  it('orden: escudo, línea separadora, isotipo de PoliByte', () => {
    const iShield = logo.indexOf('pb-brand__shield');
    const iRule = logo.indexOf('pb-brand__rule');
    const iIso = logo.indexOf('class="pb-logo"');
    expect(iShield).toBeGreaterThan(-1);
    expect(iRule).toBeGreaterThan(iShield);
    expect(iIso).toBeGreaterThan(iRule);
  });

  it('el escudo es solo identidad: imagen con nombre accesible, fuera del enlace y sin la palabra visible', () => {
    expect(logo).toMatch(/class="pb-brand__shield"[^>]*role="img"[^>]*aria-label="ESPOCH"/);
    const link = logo.slice(logo.indexOf('<a '), logo.indexOf('</a>'));
    expect(link).not.toMatch(/pb-brand__shield/);
    expect(link).toMatch(/aria-label="PoliByte"/);
    expect(logo.replace(/aria-label="ESPOCH"/g, '')).not.toMatch(/>\s*espoch\s*</i);
    expect(logo).toMatch(/class="pb-brand__rule" aria-hidden="true"/);
  });

  it('mismo alto óptico que el isotipo (33 px) y línea de 1 px que sigue el tema por currentColor', () => {
    expect(logo).toMatch(/class="pb-brand__shield"[^>]*height="33"/);
    const rule = css.match(/\.pb-brand__rule\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/width:\s*1px/);
    expect(rule).toMatch(/background:\s*currentColor/);
    expect(rule).toMatch(/opacity:\s*0\.35/);
  });

  it('huecos iguales a ambos lados de la línea; 10 px en pantallas de ≤ 380 px', () => {
    const brand = css.match(/(?:^|\n)\.pb-brand\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(brand).toMatch(/display:\s*flex/);
    expect(brand).toMatch(/gap:\s*14px/);
    expect(css).toMatch(/@media \(max-width: 380px\)\s*\{[^@]*\.pb-brand[^{]*\{[^}]*gap:\s*10px/);
  });

  it('el bloque de marca ocupa la columna izquierda de la barra', () => {
    expect(css).toMatch(/\.pb-bar-in > \.pb-brand\s*\{[^}]*justify-self:\s*start/);
  });
});
