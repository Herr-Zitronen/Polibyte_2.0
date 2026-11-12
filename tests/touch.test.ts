// PR B · En pantallas táctiles el :hover se queda "pegado" tras tocar. Regla: todo :hover va dentro de
// @media (hover: hover) (o de un bloque de movimiento reducido que lo anula). `:not(:hover)` está permitido:
// sin cursor nunca hay hover, así que ese es el estado por defecto.
import { readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const STYLES = resolve(import.meta.dirname, '../src/styles');

/** Reglas con su selector y la pila de @media que las envuelve. */
function rules(css: string): { selector: string; media: string[] }[] {
  const out: { selector: string; media: string[] }[] = [];
  const stack: string[] = [];
  const clean = css.replace(/\/\*[\s\S]*?\*\//g, '');
  let buf = '';
  for (const ch of clean) {
    if (ch === '{') {
      const head = buf.trim();
      if (head.startsWith('@')) stack.push(head);
      else {
        out.push({ selector: head, media: [...stack] });
        stack.push('');
      }
      buf = '';
    } else if (ch === '}') {
      stack.pop();
      buf = '';
    } else if (ch === ';') buf = '';
    else buf += ch;
  }
  return out;
}

const files = readdirSync(STYLES).filter((f) => f.endsWith('.css'));

describe('hover solo con cursor', () => {
  it('todo :hover está dentro de @media (hover: hover) o de movimiento reducido', () => {
    const offenders: string[] = [];
    for (const f of files) {
      for (const r of rules(readFileSync(join(STYLES, f), 'utf8'))) {
        const hover = r.selector.replace(/:not\(:hover\)/g, '').includes(':hover');
        if (!hover) continue;
        const ok = r.media.some((m) => /hover:\s*hover|prefers-reduced-motion/.test(m));
        if (!ok) offenders.push(`${f}: ${r.selector}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe('áreas táctiles ≥ 44 px', () => {
  const css = files.map((f) => readFileSync(join(STYLES, f), 'utf8')).join('\n');
  it('con puntero grueso, botones pequeños, pestañas y enlaces sociales/del pie miden al menos 44 px', () => {
    const coarse = [...css.matchAll(/@media \(pointer: coarse\)\s*\{([\s\S]*?)\n\}/g)].map((m) => m[1]).join('\n');
    for (const sel of ['.pb-b1.sm', '.pb-b2.sm', '.pb-tab', '.pb-slink', '.pb-foot-links a'])
      expect(coarse, sel).toMatch(new RegExp(`${sel.replace(/\./g, '\\.')}[^{]*\\{[^}]*min-height:\\s*44px`));
  });
});
