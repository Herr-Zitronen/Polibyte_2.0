// H1.5 · Reglas de CLAUDE.md sobre el CSS: solo se anima transform/opacity y los
// contenedores de animaciones de scroll no usan overflow: hidden.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const SRC = resolve(import.meta.dirname, '../src');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(css|astro)$/.test(n) ? [p] : [];
  });
}

function cssOf(file: string): string {
  const text = readFileSync(file, 'utf8');
  if (file.endsWith('.css')) return text;
  return [...text.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map((m) => m[1]).join('\n');
}

const all = files(SRC).map((f) => ({ f, css: cssOf(f) }));

/** Bloques `@keyframes nombre { ... }` con llaves balanceadas. */
function keyframes(css: string): { name: string; body: string }[] {
  const out: { name: string; body: string }[] = [];
  for (const m of css.matchAll(/@keyframes\s+([\w-]+)\s*\{/g)) {
    const start = m.index! + m[0].length;
    let depth = 1;
    let i = start;
    for (; i < css.length && depth > 0; i++) {
      if (css[i] === '{') depth++;
      else if (css[i] === '}') depth--;
    }
    out.push({ name: m[1]!, body: css.slice(start, i) });
  }
  return out;
}

describe('reglas de CSS', () => {
  it('hay CSS que revisar', () => expect(all.length).toBeGreaterThan(0));

  it('ningún @keyframes anima filter ni backdrop-filter', () => {
    for (const { f, css } of all)
      for (const k of keyframes(css)) expect(k.body, `${f} @keyframes ${k.name}`).not.toMatch(/(^|[\s;{])(backdrop-)?filter\s*:/);
  });

  it('las reglas con animation-timeline no usan overflow: hidden', () => {
    for (const { f, css } of all)
      for (const m of css.matchAll(/([^{}]+)\{([^{}]*animation-timeline[^{}]*)\}/g))
        expect(m[2], `${f} ${m[1]!.trim()}`).not.toMatch(/overflow(-[xy])?\s*:\s*hidden/);
  });

  it('las secciones con fondo de vidrio usan overflow: clip', () => {
    const glass = all.find(({ f }) => f.endsWith('glass.css'));
    expect(glass, 'src/styles/glass.css').toBeDefined();
    expect(glass!.css).toMatch(/\.pb-glass\s*\{[^}]*overflow:\s*clip/);
    expect(glass!.css).not.toMatch(/overflow(-[xy])?\s*:\s*hidden/);
  });
});
