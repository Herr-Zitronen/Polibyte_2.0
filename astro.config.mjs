// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Dominio definitivo: variable SITE_URL (en CI, la variable del repositorio vars.SITE_URL; ver docs/CONTENIDO.md).
// Si falta o está vacía, la URL de producción del Worker (L1 · WOR-85).
const SITE = process.env.SITE_URL?.trim() || 'https://polibyte-site.der-zitronen-saft.workers.dev';

/** Igual que isPublicPath (src/lib/seo.ts): fuera /lab/ y la 404. */
const isPublic = (/** @type {string} */ page) => {
  const path = new URL(page).pathname;
  return !/^\/_?lab(\/|$)/.test(path) && !/^\/404\/?$/.test(path);
};

// Sitio estático; Cloudflare sirve /dist como assets (ver wrangler.jsonc).
export default defineConfig({
  site: SITE,
  output: 'static',
  trailingSlash: 'ignore',
  integrations: [sitemap({ filter: isPublic })],
  // CSS incrustado en el HTML: el sitio es pequeño (~12 KB comprimidos) y así el primer pintado
  // no espera 3 hojas que bloquean el render (Lighthouse, 4G simulado: H2.3).
  build: { inlineStylesheets: 'always' },
});
