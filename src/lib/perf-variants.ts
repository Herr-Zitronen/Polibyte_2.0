// Catálogo ÚNICO de variantes de diagnóstico de fluidez (perf/fluidez-real). Cada variante apaga un
// ingrediente del scroll con CSS o JS. Lo usan el diagnóstico de Actions (e2e/home-smoothness.spec.ts) y
// el panel `?diag` que se prueba en un PC con gráfica (src/scripts/diag.ts).

export interface Variant {
  name: string;
  /** Qué apaga, en una línea (se muestra en el panel). */
  label: string;
  css?: string;
  /** Código que se evalúa una vez, con la página ya cargada. */
  js?: string;
}

export const VARIANTS: readonly Variant[] = [
  { name: 'base', label: 'La página tal cual' },
  {
    name: 'sin-lenis',
    label: 'Scroll nativo, sin la inercia de Lenis',
    js: `try{window.lenis&&window.lenis.destroy();window.lenis=undefined}catch(e){}`,
  },
  { name: 'sin-barridos', label: 'Sin los 8 barridos de luz de las líneas', css: `.pb-flow::after{display:none!important}` },
  { name: 'sin-nodos', label: 'Sin los 4 nodos que parpadean', css: `.pb-node{display:none!important}` },
  { name: 'sin-paralaje', label: 'Fondos quietos (sin paralaje)', css: `.pb-par{animation:none!important}` },
  {
    name: 'sin-backdrop-filter',
    label: 'Barra sin desenfoque',
    css: `*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}`,
  },
  {
    name: 'blur-siempre',
    label: 'Desenfoque de la barra encendido también sobre la portada',
    css: `.pb-hdr[data-blur='off'] .pb-blur>.l2{opacity:1!important}`,
  },
  {
    name: 'sin-scroll-timelines',
    label: 'Sin ninguna animación ligada al scroll',
    js: `document.getAnimations().filter(a=>a.timeline&&a.timeline!==document.timeline).forEach(a=>a.cancel())`,
  },
  { name: 'sin-reveals', label: 'Sin apariciones de bloques al entrar', css: `[data-reveal]{animation:none!important}` },
  { name: 'sin-cubo', label: 'Cubo del calendario quieto', css: `.pb-iso{animation:none!important}` },
  {
    name: 'lineas-estaticas',
    label: 'El marco de la portada no se abre al hacer scroll',
    css: `.pb-hx,.pb-tlg,.pb-trg,.pb-blg,.pb-brg,.pb-flg,.pb-frg{animation:none!important}`,
  },
  // Solo para el diagnóstico de Actions.
  {
    name: 'sin-animaciones-infinitas',
    label: 'Sin animaciones infinitas',
    js: `document.getAnimations().filter(a=>a.effect&&a.effect.getComputedTiming().iterations===Infinity).forEach(a=>a.cancel())`,
  },
  { name: 'sin-grano', label: 'Sin grano', css: `.pb-grain{display:none!important}` },
  { name: 'sin-fondos-paralaje', label: 'Sin las capas de fondo', css: `.pb-par{display:none!important}` },
  { name: 'sin-sombras', label: 'Sin sombras', css: `*{text-shadow:none!important;box-shadow:none!important}` },
  { name: 'sin-will-change', label: 'Sin will-change', css: `*{will-change:auto!important}` },
  {
    name: 'sin-is-off',
    label: 'El hero nunca se marca fuera de pantalla (no pausa sus barridos)',
    js: `(()=>{const h=document.querySelector('.pb-hero');if(!h)return;h.classList.remove('is-off');new MutationObserver(()=>{if(h.classList.contains('is-off'))h.classList.remove('is-off')}).observe(h,{attributes:true,attributeFilter:['class']})})()`,
  },
  {
    name: 'is-off-suelta-animaciones',
    label: 'Comportamiento antiguo: fuera de pantalla se sueltan las animaciones de scroll del marco',
    css: `.pb-hero.is-off .pb-hx,.pb-hero.is-off .pb-tlg,.pb-hero.is-off .pb-trg,.pb-hero.is-off .pb-blg,.pb-hero.is-off .pb-brg,.pb-hero.is-off .pb-flg,.pb-hero.is-off .pb-frg{animation:none!important}`,
  },
  {
    name: 'lineas-sueltas',
    label: 'Estructura antigua: líneas centrales como elementos aparte (2 capas más)',
    css: `.pb-cvl-old .pb-vline{animation:none!important;transform:none!important}`,
    js: `(()=>{const l=document.querySelector('.pb-hero__lines');if(!l)return;document.querySelectorAll('.pb-hero .pb-cvl').forEach(c=>{const top=!!c.closest('.pb-tlg');c.className=(top?'pb-tlg':'pb-blg')+' pb-cvl-old';c.setAttribute('style',top?'left:50%;top:80px;width:1.5px;height:80px':'left:50%;bottom:82px;width:1.5px;height:80px');l.appendChild(c)})})()`,
  },
];

/** Casillas del panel `?diag`, en el orden en que se muestran. */
export const PANEL_VARIANTS = [
  'sin-lenis',
  'sin-barridos',
  'sin-nodos',
  'sin-paralaje',
  'sin-backdrop-filter',
  'blur-siempre',
  'sin-scroll-timelines',
  'sin-reveals',
  'sin-cubo',
  'lineas-estaticas',
] as const;

export function variantByName(name: string): Variant | undefined {
  return VARIANTS.find((v) => v.name === name);
}

/** `?diag=sin-lenis,sin-cubo` → nombres válidos del panel, en el orden recibido. */
export function parseDiagParam(value: string | null): string[] {
  if (!value) return [];
  const allowed: readonly string[] = PANEL_VARIANTS;
  return value.split(',').filter((n) => allowed.includes(n));
}

export interface FrameStats {
  fps: number;
  worstMs: number;
  /** % de cuadros que tardaron más de 20 ms. */
  slowPct: number;
  frames: number;
}

const round1 = (n: number) => Math.round(n * 10) / 10;

/** Resume una lista de duraciones de cuadro (ms). */
export function frameStats(deltas: readonly number[]): FrameStats {
  if (!deltas.length) return { fps: 0, worstMs: 0, slowPct: 0, frames: 0 };
  const sum = deltas.reduce((a, b) => a + b, 0);
  return {
    fps: round1((deltas.length / sum) * 1000),
    worstMs: Math.round(Math.max(...deltas)),
    slowPct: round1((deltas.filter((d) => d > 20).length / deltas.length) * 100),
    frames: deltas.length,
  };
}
