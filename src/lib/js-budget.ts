// Suma los bytes de JS que carga cada página HTML de un build estático de Astro.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

function htmlFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) return htmlFiles(p);
    return name.endsWith('.html') ? [p] : [];
  });
}

/** Bytes de JS por página (scripts externos de /_astro e inline). */
export function pageJsBytes(distDir: string): Record<string, number> {
  const result: Record<string, number> = {};
  for (const file of htmlFiles(distDir)) {
    const html = readFileSync(file, 'utf8');
    let bytes = 0;
    for (const m of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script>/g)) {
      const attrs = m[1] ?? '';
      const body = m[2] ?? '';
      const src = /\bsrc="([^"]+)"/.exec(attrs)?.[1];
      if (/type="application\/(ld\+)?json"/.test(attrs)) continue;
      if (src) {
        if (/^https?:/.test(src)) continue;
        bytes += statSync(resolve(distDir, `.${src.startsWith('/') ? src : `/${src}`}`)).size;
      } else {
        bytes += Buffer.byteLength(body);
      }
    }
    result[relative(distDir, file).split(sep).join('/')] = bytes;
  }
  return result;
}
