// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// PLACEHOLDER: dominio definitivo pendiente (WOR-85). Mientras tanto, la URL de producción del Worker.
const SITE = process.env.SITE_URL ?? 'https://polibyte-site.der-zitronen-saft.workers.dev';

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
