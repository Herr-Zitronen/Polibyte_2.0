// H3.1 · Un proyecto que apunta a un evento inexistente rompe el build con un error claro.
// Ejecuta `astro build` (pesado): solo en CI.
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const fixture = resolve(import.meta.dirname, 'fixtures/broken-project');

describe.skipIf(!process.env['CI'])('H3.1 · integridad de referencias', () => {
  it('falla el build y nombra el evento que no existe', () => {
    const r = spawnSync('npx', ['astro', 'build', '--root', fixture], { encoding: 'utf8', shell: true, timeout: 120_000 });
    expect(r.status).not.toBe(0);
    expect(`${r.stdout}\n${r.stderr}`).toContain('evento-fantasma');
  }, 150_000);
});
