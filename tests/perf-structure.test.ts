// PR A (F12 · WOR-98, WOR-101) · Reglas de estructura que sostienen el rendimiento del scroll.
// Pruebas de código fuente: corren en el portátil en milisegundos; el efecto real lo mide perf-diag.yml.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

function files(dir: string, ext: RegExp): string[] {
  return readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) return files(p, ext);
    return ext.test(n) ? [p] : [];
  });
}

describe('A2 · una sola capa de grano por página, fija', () => {
  it('Base.astro pinta exactamente una capa de grano de página, decorativa', () => {
    const base = read('src/layouts/Base.astro');
    const grains = base.match(/class="pb-grain pb-grain--page"/g) ?? [];
    expect(grains).toHaveLength(1);
    expect(base).toMatch(/class="pb-grain pb-grain--page" aria-hidden="true"/);
  });

  it('ningún componente pinta su propio grano (salvo el menú móvil, que vive en la top layer)', () => {
    const offenders = files(resolve(ROOT, 'src/components'), /\.astro$/)
      .filter((f) => !f.endsWith('MobileMenu.astro'))
      .filter((f) => /class="pb-grain\b/.test(readFileSync(f, 'utf8')))
      .map((f) => relative(ROOT, f));
    expect(offenders).toEqual([]);
  });

  it('el grano de página es fijo, no captura el puntero y queda bajo la barra (z 20)', () => {
    const glass = read('src/styles/glass.css');
    const rule = glass.match(/\.pb-grain--page\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/position:\s*fixed/);
    expect(rule).toMatch(/pointer-events:\s*none/);
    const z = Number(rule.match(/z-index:\s*(\d+)/)?.[1]);
    expect(z).toBeGreaterThan(3);
    expect(z).toBeLessThan(20);
  });

  it('el menú móvil no duplica la regla del grano', () => {
    expect(read('src/styles/mobile-menu.css')).not.toMatch(/\.pb-sheet \.pb-grain\s*\{[^}]*background-image/);
  });
});

describe('A3 · efectos y pausa fuera de pantalla', () => {
  it('initFx se arranca una vez desde Base.astro, no desde cada Panel', () => {
    expect(read('src/layouts/Base.astro')).toMatch(/initFx\(\)/);
    expect(read('src/components/Panel.astro')).not.toMatch(/initFx/);
  });

  it('fx.ts no sale antes de observar el hero cuando la página no tiene paneles', () => {
    const fx = read('src/scripts/fx.ts');
    const early = fx.indexOf('if (!panels.length) return');
    const hero = fx.indexOf('.pb-hero');
    expect(hero).toBeGreaterThan(-1);
    if (early > -1) expect(early).toBeGreaterThan(hero);
  });

  // perf/scroll-fino: soltar y retomar las animaciones de scroll al cruzar el margen recreaba de golpe todas
  // las animaciones y capas del marco. perf/fluidez-real: tampoco se oculta con visibility (al volver rápido
  // las líneas aparecían tarde, cuando llegaba el aviso del observador). Fuera de pantalla solo se pausa lo infinito.
  it('fuera de pantalla el hero no oculta ni suelta nada: solo pausa barridos y nodos', () => {
    const css = read('src/styles/hero.css');
    const off = [...css.matchAll(/([^{}]*\.pb-hero\.is-off[^{]*)\{([^}]*)\}/g)];
    expect(off.length).toBeGreaterThan(0);
    for (const [, sel, body] of off) {
      expect(body, sel).not.toMatch(/animation(-name)?:\s*none/);
      expect(body, sel).not.toMatch(/visibility|display|content-visibility/);
    }
    expect(css).toMatch(/\.pb-hero\.is-off \.pb-flow::after[^{]*\{[^}]*animation-play-state:\s*paused/);
  });

  it('al terminar la entrada (data-drawn) se sueltan las animaciones forwards de trazos, letras y subtítulo', () => {
    const css = read('src/styles/hero.css');
    const drawn = [...css.matchAll(/([^{}]*\.pb-hero\[data-drawn\][^{]*)\{([^}]*)\}/g)];
    const all = drawn.map(([, sel]) => sel).join(',');
    for (const cls of ['.pb-line', '.pb-vline', '.pb-ch', '.pb-sub']) expect(all, cls).toContain(`.pb-hero[data-drawn] ${cls}`);
    for (const [, sel, body] of drawn) expect(body, sel).toMatch(/animation:\s*none/);
    expect(css).toMatch(/\.pb-hero\[data-drawn\] \.pb-line[^{]*\{[^}]*transform:\s*none/);
    expect(css).toMatch(/\.pb-hero\[data-drawn\] \.pb-sub[^{]*\{[^}]*opacity:\s*1/);
    const decode = read('src/scripts/decode.ts');
    expect(decode).toMatch(/animationend/);
    expect(decode).toMatch(/data-drawn/);
  });

  it('ningún will-change depende de :hover (crearía y destruiría capas con el contenido pasando bajo el cursor)', () => {
    for (const f of files(resolve(ROOT, 'src/styles'), /\.css$/)) {
      const css = readFileSync(f, 'utf8');
      expect(css, relative(ROOT, f)).not.toMatch(/:hover[^{}]*\{[^}]*will-change/);
    }
  });

  it('la barra apaga su blur con opacidad: la capa existe siempre, no se crea ni destruye al cruzar la portada', () => {
    const css = read('src/styles/header.css');
    const rule = css.match(/\.pb-hdr\[data-blur='off'\] \.pb-blur > \.l2\s*\{([^}]*)\}/)?.[1] ?? '';
    expect(rule).toMatch(/opacity:\s*0/);
    expect(rule).not.toMatch(/visibility|display/);
  });

  it('la especulación es conservadora: pre-renderiza al pulsar, no al pasar el cursor', () => {
    const base = read('src/layouts/Base.astro');
    const prerender = base.match(/prerender:\s*\[\{([^}]*)\}\]/)?.[1] ?? '';
    expect(prerender).toMatch(/where:\s*INTERNAL\b/);
    expect(prerender).toMatch(/eagerness:\s*'conservative'/);
    expect(base).not.toMatch(/eagerness:\s*'(eager|immediate)'/);
  });

  it('al pasar el cursor solo se descarga el HTML de la página siguiente (prefetch): sin renderizar, no roba CPU ni GPU', () => {
    const base = read('src/layouts/Base.astro');
    const prefetch = base.match(/prefetch:\s*\[\{([^}]*)\}\]/)?.[1] ?? '';
    // Mismo filtro que el prerender: solo enlaces internos y nunca /lab/.
    expect(prefetch).toMatch(/where:\s*INTERNAL\b/);
    expect(prefetch).toMatch(/eagerness:\s*'moderate'/);
    expect(base).toMatch(/const INTERNAL = [^;]*href_matches: '\/\*'[^;]*not: \{ href_matches: '\/lab\/\*' \}/);
  });

  it('el hero se marca fuera de pantalla con medio viewport de margen, lejos de donde se mira', () => {
    expect(read('src/scripts/fx.ts')).toMatch(/observe\(hero\)/);
    expect(read('src/scripts/fx.ts')).toMatch(/rootMargin:\s*'50% 0px'/);
  });

  it('el parallax de las secciones intermedias se apaga en ≤ 820 px', () => {
    const css = read('src/styles/glass.css');
    expect(css).toMatch(/@media \(max-width: 820px\)\s*\{[^@]*\.pb-par\.view[^{]*\{[^}]*animation:\s*none/);
  });

  // perf/fluidez-real: content-visibility: auto dejaba huecos al volver y un cuadro largo en cada reentrada.
  it('ninguna hoja usa content-visibility ni contain-intrinsic-size', () => {
    for (const f of files(resolve(ROOT, 'src/styles'), /\.css$/))
      expect(readFileSync(f, 'utf8'), relative(ROOT, f)).not.toMatch(/content-visibility|contain-intrinsic-size/);
  });
});

// perf/fluidez-real: Lenis vuelve (Joel echa de menos la inercia), pero más ligero: su rAF solo corre
// mientras hay movimiento, así en reposo no fuerza un cuadro del hilo principal en cada refresco.
describe('A4 · Lenis', () => {
  const lenis = read('src/scripts/lenis.ts');
  it('se anuncia en window.lenis (el diagnóstico sin-lenis lo necesita)', () => {
    expect(lenis).toMatch(/host\.lenis\s*=\s*lenis/);
    expect(lenis).toMatch(/host = window/);
  });
  it('no se carga en pantallas táctiles ni con movimiento reducido', () => {
    expect(lenis).toMatch(/hover: none|pointer: coarse/);
    expect(lenis).toMatch(/prefers-reduced-motion: reduce/);
  });
  it('se arranca desde Base.astro y es dependencia del proyecto', () => {
    expect(read('src/layouts/Base.astro')).toMatch(/initLenis\(\)/);
    const pkg = JSON.parse(read('package.json')) as { dependencies?: Record<string, string> };
    expect(pkg.dependencies).toHaveProperty('lenis');
    expect(read('src/styles/transitions.css')).toMatch(/html\.lenis/);
  });
  it('el rAF solo corre en movimiento: bucle bajo demanda, sin autoRaf', () => {
    expect(lenis).toMatch(/autoRaf:\s*false/);
    expect(lenis).toMatch(/createOnDemandLoop/);
    expect(lenis).toMatch(/isScrolling/);
    for (const ev of ['wheel', 'keydown', 'pointerdown', 'scroll']) expect(lenis, ev).toContain(`'${ev}'`);
  });
  it('global.css no pone scroll-behavior: smooth (choca con Lenis, que ya suaviza las anclas)', () => {
    expect(read('src/styles/global.css')).not.toMatch(/scroll-behavior:\s*smooth/);
  });
});

describe('A6 · transiciones entre páginas', () => {
  const css = read('src/styles/transitions.css');
  it('fundido raíz corto: salida 0.16 s, entrada 0.24 s', () => {
    expect(css).toMatch(/::view-transition-old\(root\)\s*\{[^}]*0\.16s/);
    expect(css).toMatch(/::view-transition-new\(root\)\s*\{[^}]*0\.24s/);
  });
  it('el grano de página no se funde entre páginas', () => {
    expect(read('src/styles/glass.css')).toMatch(/\.pb-grain--page\s*\{[^}]*view-transition-name:\s*pb-grain/);
    expect(css).toMatch(/::view-transition-group\(pb-grain\)[^{]*\{[^}]*animation:\s*none/);
  });
  it('Lenis se detiene al salir de la página y se reanuda al volver', () => {
    const lenis = read('src/scripts/lenis.ts');
    expect(lenis).toMatch(/pageswap|pagehide/);
    expect(lenis).toMatch(/pagereveal|pageshow/);
  });
});

describe('A7 · limpiezas', () => {
  it('header-theme.ts registra un solo listener de resize', () => {
    expect(read('src/scripts/header-theme.ts').match(/addEventListener\('resize'/g)).toHaveLength(1);
  });
  it('event-picker.ts agrupa pointermove en un rAF', () => {
    expect(read('src/scripts/event-picker.ts')).toMatch(/requestAnimationFrame/);
  });
  it('sin restos de la variante blur-original ni del comentario de 3 capas', () => {
    expect(read('e2e/home-smoothness.spec.ts')).not.toMatch(/blur-original/);
    expect(read('src/styles/header.css')).not.toMatch(/3 capas/);
  });
});

describe('WOR-101 · LCP del titular', () => {
  it('la sombra del titular nunca empieza en opacidad 0 (sería un LCP tardío al aparecer)', () => {
    const rule = /\.pb-h1-shadow \{[^}]*\}/.exec(read('src/styles/hero.css'))![0];
    const opacity = Number(/opacity: ([\d.]+)/.exec(rule)![1]);
    expect(opacity).toBeGreaterThan(0);
    expect(opacity).toBeLessThanOrEqual(0.02);
  });
});

describe('A1 · CI barato', () => {
  const ci = read('.github/workflows/ci.yml');
  it('los pushes a ramas de trabajo solo corren el job rápido', () => {
    expect(ci).toMatch(/quick:/);
    expect(ci).toMatch(/paths-ignore/);
  });
  it('los PR siempre corren la suite (sin paths-ignore): la protección de ramas la exige', () => {
    const on = (parse(ci) as { on: { pull_request: Record<string, unknown> } }).on;
    expect(on.pull_request['paths-ignore']).toBeUndefined();
  });
  it('el diagnóstico de fluidez es manual', () => {
    expect(read('.github/workflows/perf-diag.yml')).toMatch(/workflow_dispatch/);
    expect(read('e2e/home-smoothness.spec.ts')).toMatch(/PERF_DIAG/);
  });
});


describe('peso de los fondos (DESIGN §7)', () => {
  it('ningún fondo pasa de 16 KB: la niebla es difusa y va a media resolución con la transparencia sin pérdida', () => {
    const dir = resolve(ROOT, 'src/assets/backgrounds');
    const heavy = readdirSync(dir)
      .filter((f) => f !== 'grain.webp')
      .filter((f) => statSync(join(dir, f)).size > 16 * 1024);
    expect(heavy).toEqual([]);
  });
});
