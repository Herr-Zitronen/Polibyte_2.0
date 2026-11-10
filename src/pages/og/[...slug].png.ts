// Imágenes OG 1200×630 generadas en el build con Satori (SVG) + resvg (PNG). Diseño: design/Compartir.dc.html.
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import type { APIRoute, GetStaticPaths } from 'astro';
import { Resvg } from '@resvg/resvg-js';
import satori from 'satori';
import { ogPages, type OgPage } from '../../lib/og-pages';

export const getStaticPaths = (async () =>
  (await ogPages()).map((page) => ({ params: { slug: page.slug }, props: { page } }))) satisfies GetStaticPaths;

const require = createRequire(import.meta.url);
const font = (pkg: string, file: string) => readFile(require.resolve(`@fontsource/${pkg}/files/${file}`));

const LOGO =
  'M0 0H180V184H0Z M736 0H913V184H736Z M0 269H433V410L258 411V1120H433V1264H0Z M483 269H913V1264H483V1120H659V411L483 410Z M330 847V621Q330 611 340 611H573Q583 611 583 621V847Z';

type Node = { type: string; props: Record<string, unknown> };
const h = (type: string, style: Record<string, unknown>, children?: unknown, extra: Record<string, unknown> = {}): Node => ({
  type,
  props: { style, children, ...extra },
});
const rule = (pos: Record<string, number>) =>
  h('div', { position: 'absolute', left: 72, right: 72, height: 1, background: 'rgba(242,244,250,0.55)', ...pos });

const card = (page: OgPage): Node =>
  h(
    'div',
    {
      width: 1200,
      height: 630,
      display: 'flex',
      position: 'relative',
      color: '#F2F4FA',
      fontFamily: 'Instrument Sans',
      backgroundColor: '#1A2C78',
      backgroundImage:
        'radial-gradient(60% 50% at 40% 45%, rgba(214,224,248,0.18), rgba(214,224,248,0) 70%), linear-gradient(180deg, #2A44B4, #1A2C78)',
    },
    [
      rule({ top: 150 }),
      rule({ bottom: 118 }),
      h('div', { position: 'absolute', left: 72, top: 56, display: 'flex', alignItems: 'center', gap: 16 }, [
        h('svg', {}, [h('path', {}, undefined, { fill: '#F2F4FA', d: LOGO })], { viewBox: '0 0 913 1264', width: 40, height: 55 }),
        h('div', { display: 'flex', flexDirection: 'column', gap: 4 }, [
          h('span', { fontWeight: 700, fontSize: 26 }, 'PoliByte'),
          h('span', { fontSize: 16, opacity: 0.88 }, page.kicker),
        ]),
      ]),
      h(
        'div',
        { position: 'absolute', left: 72, right: 72, top: 196, fontWeight: 700, fontSize: 76, lineHeight: 1, letterSpacing: '-0.05em' },
        page.title,
      ),
      h(
        'div',
        { position: 'absolute', left: 72, right: 72, bottom: 50, display: 'flex', justifyContent: 'space-between', fontSize: 18 },
        [
          h('span', {}, 'Escuela Superior Politécnica de Chimborazo'),
          h('span', { fontFamily: 'Silkscreen', fontSize: 16, color: '#F2E0A0' }, 'PoliByte · ESPOCH'),
        ],
      ),
    ],
  );

export const GET: APIRoute = async ({ props }) => {
  const [sans600, sans700, pixel] = await Promise.all([
    font('instrument-sans', 'instrument-sans-latin-600-normal.woff'),
    font('instrument-sans', 'instrument-sans-latin-700-normal.woff'),
    font('silkscreen', 'silkscreen-latin-400-normal.woff'),
  ]);
  const svg = await satori(card((props as { page: OgPage }).page) as Parameters<typeof satori>[0], {
    width: 1200,
    height: 630,
    fonts: [
      { name: 'Instrument Sans', data: sans600, weight: 600, style: 'normal' },
      { name: 'Instrument Sans', data: sans700, weight: 700, style: 'normal' },
      { name: 'Silkscreen', data: pixel, weight: 400, style: 'normal' },
    ],
  });
  const png = new Resvg(svg, { fitTo: { mode: 'width', value: 1200 } }).render().asPng();
  return new Response(new Uint8Array(png), { headers: { 'Content-Type': 'image/png' } });
};
