// F19 · WOR-105 · El repositorio público: licencia, plantilla de PR, política de seguridad,
// Dependabot y un README para quien llega por primera vez. Pruebas de archivos, sin red.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parse } from 'yaml';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

// Pictogramas (emoji) fuera de los bloques de código: el tono del repositorio es sobrio.
const EMOJI = /\p{Extended_Pictographic}/u;
const prose = (md: string) => md.replace(/```[\s\S]*?```/g, '');

describe('Licencia', () => {
  it('MIT a nombre del autor', () => {
    const license = read('LICENSE');
    expect(license).toMatch(/^MIT License/);
    expect(license).toMatch(/Copyright \(c\) 2026 Joel Guerrero/);
  });
});

describe('Plantilla de PR', () => {
  const tpl = () => read('.github/pull_request_template.md');

  it('pide historia, qué y por qué, pruebas, capturas de los tres anchos y riesgos', () => {
    for (const heading of ['## Historia', '## Qué cambia y por qué', '## Pruebas', '## Capturas', '## Riesgos']) {
      expect(tpl()).toContain(heading);
    }
    expect(tpl()).toMatch(/1440.*1000.*390/s);
  });

  it('sin emoji', () => {
    expect(prose(tpl())).not.toMatch(EMOJI);
  });
});

describe('Política de seguridad', () => {
  it('explica cómo informar de forma privada', () => {
    const security = read('SECURITY.md');
    expect(security).toMatch(/Report a vulnerability/);
    expect(security).toMatch(/no abras un issue público/i);
  });
});

describe('Dependabot', () => {
  type Update = { 'package-ecosystem': string; 'target-branch'?: string };
  const updates = () => (parse(read('.github/dependabot.yml')) as { updates: Update[] }).updates;

  it('vigila npm y las acciones de GitHub', () => {
    expect(updates().map((u) => u['package-ecosystem']).sort()).toEqual(['github-actions', 'npm']);
  });

  it('abre sus PR hacia staging, como cualquier historia', () => {
    for (const u of updates()) expect(u['target-branch']).toBe('staging');
  });
});

