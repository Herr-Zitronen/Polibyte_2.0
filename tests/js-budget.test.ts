// H0.2 · DESIGN §7: JS por página < 20 KB (sin Lenis). Necesita `dist/`: corre en CI tras el build.
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { pageJsBytes } from '../src/lib/js-budget';

const dist = resolve(import.meta.dirname, '../dist');
const LIMIT = 20 * 1024;

describe.skipIf(!existsSync(dist))('H0.2 · presupuesto de JS por página', () => {
  it('ninguna página supera 20 KB de JS', () => {
    const pages = pageJsBytes(dist);
    expect(Object.keys(pages).length).toBeGreaterThan(0);
    for (const [page, bytes] of Object.entries(pages)) expect(bytes, page).toBeLessThan(LIMIT);
  });
});
