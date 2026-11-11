// F19 · WOR-105 · El repositorio público: licencia, plantilla de PR, política de seguridad,
// Dependabot y un README para quien llega por primera vez. Pruebas de archivos, sin red.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
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

describe('Créditos de la foto del Chimborazo', () => {
  // Foto n.º 02 de la galería de DescubrEcuador, de Go593, con licencia CC BY-SA 4.0.
  // Los fondos difuminados son obras derivadas: llevan la misma licencia y el crédito.
  const credits = () => read('CREDITS.md');

  it('nombra autor, licencia, fuente y cambios', () => {
    expect(credits()).toMatch(/Go593/);
    expect(credits()).toMatch(/CC BY-SA 4\.0/);
    expect(credits()).toContain('https://creativecommons.org/licenses/by-sa/4.0/');
    expect(credits()).toContain('https://www.descubrecuador.com/item/volcan-chimborazo/');
    expect(credits()).toMatch(/difumin/i);
  });

  it('lista cada fondo derivado que vive en el repositorio', () => {
    for (const dir of ['src/assets/backgrounds', 'assets/backgrounds', 'design/assets']) {
      for (const f of readdirSync(resolve(ROOT, dir)).filter((n) => n.startsWith('chimborazo-'))) {
        expect(credits()).toContain(`${dir}/${f}`);
      }
    }
  });

  it('el pie del sitio da el crédito (CC BY-SA lo pide donde se usa la imagen)', () => {
    const footer = read('src/components/Footer.astro');
    expect(footer).toMatch(/Go593/);
    expect(footer).toContain('https://creativecommons.org/licenses/by-sa/4.0/');
    expect(footer).toContain('https://www.descubrecuador.com/item/volcan-chimborazo/');
  });

  it('la foto original no se publica en el repositorio', () => {
    expect(existsSync(resolve(ROOT, 'assets/backgrounds/chimborazo-original.png'))).toBe(false);
  });

  it('el README aclara que la licencia MIT no cubre la foto (LICENSE queda intacto para que GitHub lo reconozca)', () => {
    expect(read('README.md')).toMatch(/MIT.*CREDITS\.md/);
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

