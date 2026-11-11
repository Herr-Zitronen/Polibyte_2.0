// PR D (F14 · WOR-100, L1 · WOR-85) · Preparación del lanzamiento. Pruebas de código fuente.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

describe('Pie de página desde site.json (contenido editable sin tocar código)', () => {
  const footer = read('src/components/Footer.astro');
  it('lee enlaces y periodo de site.json; sin textos escritos a mano', () => {
    expect(footer).toMatch(/import site from '\.\.\/content\/site\.json'/);
    expect(footer).toMatch(/footerLinks\(site\.links\)/);
    expect(footer).toMatch(/site\.period/);
    expect(footer).not.toMatch(/2026–2027/);
    expect(footer).not.toMatch(/\[Correo\]|\[Instagram\]|\[GitHub\]|href="#contacto"/);
  });

  it('sin ningún enlace no pinta el bloque de enlaces', () => {
    expect(footer).toMatch(/links\.length > 0 &&/);
  });
});

describe('L1 · contenido real obligatorio solo hacia main', () => {
  it('el workflow enciende CONTENT_READY en main y en PRs hacia main', () => {
    const ci = read('.github/workflows/ci.yml');
    expect(ci).toMatch(/CONTENT_READY: \$\{\{ \(github\.ref == 'refs\/heads\/main' \|\| github\.base_ref == 'main'\) && '1' \|\| '' \}\}/);
  });
});

describe('L1 · dominio definitivo por SITE_URL', () => {
  it('astro.config usa SITE_URL y cae al Worker solo si falta o está vacío', () => {
    expect(read('astro.config.mjs')).toMatch(/process\.env\.SITE_URL\?\.trim\(\) \|\| '/);
  });
  it('el build de CI recibe SITE_URL de la variable del repositorio', () => {
    expect(read('.github/workflows/ci.yml')).toMatch(/- run: npm run build\s+env:\s+SITE_URL: \$\{\{ vars\.SITE_URL \}\}/);
  });
  it('Seo.astro construye canónica y og:image con Astro.site', () => {
    expect(read('src/components/Seo.astro')).toMatch(/Astro\.site/);
  });
});

describe('L1 · la reconstrucción diaria usa el mismo dominio', () => {
  it('rebuild.yml también pasa SITE_URL al build', () => {
    expect(read('.github/workflows/rebuild.yml')).toMatch(/- run: npm run build\s+env:\s+SITE_URL: \$\{\{ vars\.SITE_URL \}\}/);
  });
});
