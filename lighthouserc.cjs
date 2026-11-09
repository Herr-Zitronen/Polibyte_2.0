// Lighthouse CI: se ejecuta solo en GitHub Actions sobre el build estático.
module.exports = {
  ci: {
    collect: {
      staticDistDir: './dist',
      url: ['/'],
      numberOfRuns: 1,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.95 }],
        'categories:best-practices': ['warn', { minScore: 0.9 }],
        'categories:seo': ['warn', { minScore: 0.9 }],
      },
    },
    upload: { target: 'temporary-public-storage' },
  },
};
