// H9.1 · Lógica pura de SEO: rutas de imágenes OG, URLs absolutas, rutas públicas y tamaño de PNG.

/** Nombre de la imagen OG de una ruta: "/" → "inicio", "/eventos/x/" → "eventos/x". */
export const ogSlug = (pathname: string): string => pathname.replace(/^\/+|\/+$/g, '') || 'inicio';

/** Ruta de la imagen OG; si la página no tiene propia (404, lab), usa la de inicio. */
export const ogImagePath = (pathname: string, known: readonly string[]): string => {
  const slug = ogSlug(pathname);
  return `/og/${known.includes(slug) ? slug : 'inicio'}.png`;
};

export const absoluteUrl = (path: string, site: string | URL): string => new URL(path, site).href;

/** Lo que va al sitemap: todo menos el laboratorio y la 404. */
export const isPublicPath = (pathname: string): boolean =>
  !/^\/_?lab(\/|$)/.test(pathname) && !/^\/404\/?$/.test(pathname);

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];

/** Ancho y alto leídos de la cabecera IHDR (bytes 16–23, big-endian). */
export const pngSize = (bytes: Uint8Array): { width: number; height: number } => {
  if (bytes.length < 24 || PNG_SIGNATURE.some((b, i) => bytes[i] !== b)) throw new Error('No es un PNG');
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  return { width: view.getUint32(16), height: view.getUint32(20) };
};
