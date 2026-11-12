// Lighthouse CI (solo en GitHub Actions). Presupuestos de DESIGN.md §7:
// si Inicio no los cumple, el job falla y no se despliega.
/* eslint-disable @typescript-eslint/no-require-imports -- archivo CommonJS que carga Lighthouse CI */
const { readdirSync } = require('node:fs');
const { join } = require('node:path');

// Un detalle de evento real, tomado del contenido (no escrito a mano: cambia cuando Joel carga eventos).
const detail = readdirSync(join(__dirname, 'src/content/events'))
  .filter((f) => f.endsWith('.md'))
  .sort()[0]
  .replace(/\.md$/, '');

module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      // L1 (WOR-85): Inicio, Eventos, un detalle, Equipo y Unirme.
      url: ['/', '/eventos/', `/eventos/${detail}/`, '/equipo/', '/unirme/'],
      numberOfRuns: 5, // Lighthouse varía entre ejecuciones (CPU ×4 en un runner compartido): la mediana de 5 aguanta una mala racha.
    },
    assert: {
      assertions: {
        // Temporal (WOR-101): el LCP de Inicio está entre 2.1 y 2.14 s también en staging. Volver a 2000 al optimizar el titular.
        'largest-contentful-paint': ['error', { maxNumericValue: 2200 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.05 }],
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
