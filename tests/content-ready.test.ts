// L1 (WOR-85) · El contenido está listo para producción: no quedan marcadores del contenido de ejemplo.
// Solo corre con CONTENT_READY=1 (lo enciende el workflow para main y para PRs hacia main), para no
// bloquear staging mientras Joel carga el contenido real (docs/CONTENIDO.md).
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { findPlaceholders } from '../src/lib/content-ready';

const ROOT = resolve(import.meta.dirname, '..');

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return files(p);
    return /\.(md|json)$/.test(n) ? [p] : [];
  });
}

describe.skipIf(!process.env['CONTENT_READY'])('L1 · contenido real (CONTENT_READY=1)', () => {
  it('src/content no tiene marcadores de ejemplo', () => {
    const sources = files(resolve(ROOT, 'src/content')).map((p) => ({ path: relative(ROOT, p).split('\\').join('/'), text: readFileSync(p, 'utf8') }));
    const found = findPlaceholders(sources).map((p) => `${p.path}:${p.line} → ${p.marker}`);
    expect(found, 'Ver docs/CONTENIDO.md').toEqual([]);
  });

  it('site.json tiene al menos un enlace de contacto en el pie', () => {
    const site = JSON.parse(readFileSync(resolve(ROOT, 'src/content/site.json'), 'utf8')) as { links: Record<string, string> };
    expect(Object.values(site.links).some((v) => v.trim() !== '')).toBe(true);
  });
});
