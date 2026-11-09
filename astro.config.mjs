// @ts-check
import { defineConfig } from 'astro/config';

// Sitio estático; Cloudflare sirve /dist como assets (ver wrangler.jsonc).
export default defineConfig({
  output: 'static',
});
