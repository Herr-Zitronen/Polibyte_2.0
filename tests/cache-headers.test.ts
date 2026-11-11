// Caché de assets (DESIGN §7). Los archivos de /_astro/ llevan un hash en el nombre: si cambian, cambia la URL.
// Por eso se pueden guardar un año sin revalidar. El HTML y los iconos de public/ no llevan hash: siguen
// revalidando en cada visita (el valor por defecto de Cloudflare) para que un despliegue se vea al momento.
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const file = resolve(import.meta.dirname, '../public/_headers');

/** Reglas del archivo `_headers` de Cloudflare: una ruta sin sangría y, debajo, sus cabeceras con sangría. */
function parseHeaders(text: string): Record<string, Record<string, string>> {
  const rules: Record<string, Record<string, string>> = {};
  let current: Record<string, string> | undefined;
  for (const raw of text.split(/\r?\n/)) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    if (!/^\s/.test(raw)) {
      current = rules[raw.trim()] = {};
      continue;
    }
    const at = raw.indexOf(':');
    if (current && at > 0) current[raw.slice(0, at).trim().toLowerCase()] = raw.slice(at + 1).trim();
  }
  return rules;
}

describe('caché de assets con hash', () => {
  it('existe public/_headers (Cloudflare lo lee de la carpeta de assets)', () => {
    expect(existsSync(file)).toBe(true);
  });

  it('/_astro/* se guarda un año y no se revalida', () => {
    const rule = parseHeaders(readFileSync(file, 'utf8'))['/_astro/*'];
    expect(rule?.['cache-control']).toBe('public, max-age=31536000, immutable');
  });

  it('solo /_astro/* lleva caché larga: el HTML y los iconos sin hash siguen revalidando', () => {
    const rules = parseHeaders(readFileSync(file, 'utf8'));
    const long = Object.entries(rules)
      .filter(([, h]) => /max-age=(?!0\b)\d+|immutable/.test(h['cache-control'] ?? ''))
      .map(([path]) => path);
    expect(long).toEqual(['/_astro/*']);
  });
});
