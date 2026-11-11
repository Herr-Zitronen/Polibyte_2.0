// PR A (F12 · WOR-98, WOR-101) · Reglas de estructura que sostienen el rendimiento del scroll.
// Pruebas de código fuente: corren en el portátil en milisegundos; el efecto real lo mide perf-diag.yml.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
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

  it('con el hero fuera de pantalla se sueltan sus animaciones de scroll', () => {
    const css = read('src/styles/hero.css');
    expect(css).toMatch(/\.pb-hero\.is-off[^{]*\{[^}]*animation:\s*none/);
  });

  it('el parallax de las secciones intermedias se apaga en ≤ 820 px', () => {
    const css = read('src/styles/glass.css');
    expect(css).toMatch(/@media \(max-width: 820px\)\s*\{[^@]*\.pb-par\.view[^{]*\{[^}]*animation:\s*none/);
  });

  it('las secciones bajo el pliegue usan content-visibility: auto', () => {
    for (const f of ['what-we-do', 'upcoming', 'calendar', 'team', 'tutor', 'join', 'footer'])
      expect(read(`src/styles/${f}.css`), f).toMatch(/content-visibility:\s*auto/);
  });
});

describe('A4 · Lenis', () => {
  const lenis = read('src/scripts/lenis.ts');
  it('se anuncia en window.lenis (el diagnóstico sin-lenis lo necesita)', () => {
    expect(lenis).toMatch(/window\.lenis\s*=/);
  });
  it('no se carga en pantallas táctiles', () => {
    expect(lenis).toMatch(/hover: none|pointer: coarse/);
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

describe('A1 · CI barato', () => {
  const ci = read('.github/workflows/ci.yml');
  it('los pushes a ramas de trabajo solo corren el job rápido', () => {
    expect(ci).toMatch(/quick:/);
    expect(ci).toMatch(/paths-ignore/);
  });
  it('el diagnóstico de fluidez es manual', () => {
    expect(read('.github/workflows/perf-diag.yml')).toMatch(/workflow_dispatch/);
    expect(read('e2e/home-smoothness.spec.ts')).toMatch(/PERF_DIAG/);
  });
});
