// Lighthouse CI (solo en GitHub Actions). Presupuestos de DESIGN.md §7:
// si Inicio no los cumple, el job falla y no se despliega.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/', '/lab/x-nodecode/', '/lab/x-noglass/', '/lab/x-nomotion/', '/lab/x-nodecode-noglass-nomotion/'],
      numberOfRuns: 3, // Lighthouse varía entre ejecuciones: se usa la mediana.
    },
    assert: {
      assertions: {
        'largest-contentful-paint': ['error', { maxNumericValue: 2000 }],
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
