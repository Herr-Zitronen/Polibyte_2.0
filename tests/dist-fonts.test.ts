// DESIGN §7 · Ninguna fuente viaja incrustada en el HTML. Vite incrusta en base64 los archivos de menos de 4 KB:
// así llegó un subconjunto cirílico de JetBrains Mono (2,7 KB que casi no se comprimen) a todas las páginas.
// Necesita un `dist/` recién construido: corre en CI tras el build (un dist local puede ser antiguo).
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const dist = resolve(import.meta.dirname, '../dist');

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return name.endsWith('.html') ? [p] : [];
  });
}

describe.skipIf(!process.env['CI'] || !existsSync(dist))('fuentes del build', () => {
  it('ningún HTML lleva una fuente incrustada como data:', () => {
    const pages = htmlFiles(dist);
    expect(pages.length).toBeGreaterThan(0);
    const offenders = pages.filter((f) => /data:(font|application\/font)/.test(readFileSync(f, 'utf8'))).map((f) => relative(dist, f));
    expect(offenders).toEqual([]);
  });

  it('el build solo publica los subconjuntos latinos de JetBrains Mono', () => {
    const fonts = readdirSync(join(dist, '_astro')).filter((f) => /^jetbrains-mono-/.test(f));
    expect(fonts.length).toBeGreaterThan(0);
    expect(fonts.filter((f) => !/^jetbrains-mono-latin(-ext)?-wght-normal\./.test(f))).toEqual([]);
  });
});
