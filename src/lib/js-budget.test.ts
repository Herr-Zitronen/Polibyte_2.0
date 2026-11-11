import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pageJsBytes } from './js-budget';

function fixture() {
  const dir = mkdtempSync(join(tmpdir(), 'jsb-'));
  mkdirSync(join(dir, '_astro'));
  mkdirSync(join(dir, 'eventos'));
  writeFileSync(join(dir, '_astro', 'a.js'), 'x'.repeat(1000));
  writeFileSync(join(dir, '_astro', 'lenis.abc.js'), 'x'.repeat(9000));
  writeFileSync(
    join(dir, 'index.html'),
    '<script type="module" src="/_astro/a.js"></script><script>abcd</script><script type="application/ld+json">{"a":1}</script>',
  );
  writeFileSync(join(dir, 'eventos', 'index.html'), '<script src="/_astro/lenis.abc.js"></script>');
  return dir;
}

describe('pageJsBytes', () => {
  // perf/scroll-fino: Lenis se quitó; ningún script tiene ya excepción en el presupuesto.
  it('suma JS externo e inline por página, sin JSON y sin excepciones por nombre', () => {
    expect(pageJsBytes(fixture())).toEqual({ 'index.html': 1004, 'eventos/index.html': 9000 });
  });
});
