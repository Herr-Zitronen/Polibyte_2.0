// @ts-check
import { defineConfig } from 'astro/config';

// Sitio estático; Cloudflare sirve /dist como assets (ver wrangler.jsonc).
export default defineConfig({
  output: 'static',
  // CSS incrustado en el HTML: el sitio es pequeño (~12 KB comprimidos) y así el primer pintado
  // no espera 3 hojas que bloquean el render (Lighthouse, 4G simulado: H2.3).
  build: { inlineStylesheets: 'always' },
});
