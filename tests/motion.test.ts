// PR C · Animaciones que faltan e historias F7, F9, F10, F11, F13.
// Pruebas de código fuente (corren en el portátil en milisegundos). El comportamiento real lo cubren las E2E
// (hero-lines, motion, icons, seo, mobile-menu), que corren en CI.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const ROOT = resolve(import.meta.dirname, '..');
const read = (p: string) => readFileSync(resolve(ROOT, p), 'utf8');

/** Cuerpo de la primera regla cuyo selector contiene `sel` (sin bloques anidados). */
const rule = (css: string, sel: string): string => {
  for (const m of css.matchAll(/([^{}]+)\{([^{}]*)\}/g)) if (m[1]!.includes(sel)) return m[2]!;
  return '';
};

/** Texto del bloque `@media (prefers-reduced-motion: reduce)` (el último de la hoja). */
const reduced = (css: string): string => {
  const at = css.lastIndexOf('@media (prefers-reduced-motion: reduce)');
  return at < 0 ? '' : css.slice(at);
};

describe('F7 · líneas del hero y vidrio siguen al cursor', () => {
  it('el contenedor de líneas del hero lleva la clase pb-mouse', () => {
    expect(read('src/components/home/Hero.astro')).toMatch(/class="pb-hero__lines pb-mouse"/);
  });

  it('fx.ts usa lineOffset/reedOffset con el único listener de cursor', () => {
    const fx = read('src/scripts/fx.ts');
    expect(fx).toMatch(/from '\.\.\/lib\/line-parallax'/);
    expect(fx).toMatch(/\.pb-mouse/);
    expect(fx).toMatch(/\.pb-reed/);
    expect(fx.match(/addEventListener\(\s*'pointermove'/g) ?? []).toHaveLength(1);
  });

  it('solo con cursor y sin movimiento reducido', () => {
    const fx = read('src/scripts/fx.ts');
    const body = fx.slice(fx.indexOf('function initFollow'));
    expect(body).toMatch(/\(hover: hover\)/);
    expect(body).toMatch(/prefers-reduced-motion/);
  });

  it('transición de transform suave; will-change solo mientras el cursor está sobre el hero', () => {
    const hero = read('src/styles/hero.css');
    expect(rule(hero, '.pb-mouse')).toMatch(/transition:\s*transform 0\.9s/);
    expect(rule(hero, '.pb-mouse')).not.toMatch(/will-change/);
    expect(hero).toMatch(/\.pb-hero-s:hover \.pb-mouse\s*\{[^}]*will-change:\s*transform/);
    expect(reduced(hero)).toMatch(/\.pb-mouse/);
  });

  it('el vidrio acanalado tiene transición de transform y se queda quieto con movimiento reducido', () => {
    const glass = read('src/styles/glass.css');
    expect(rule(glass, '.pb-reed')).toMatch(/transition:\s*transform 1\.1s/);
    expect(reduced(glass)).toMatch(/\.pb-reed/);
  });
});

describe('Entradas de la barra y del menú móvil', () => {
  const header = read('src/styles/header.css');
  const menu = read('src/styles/mobile-menu.css');

  it('los enlaces del menú y "unirme" entran escalonados después de 0.3 s, visibles por defecto', () => {
    const nav = rule(header, '.pb-nav a');
    expect(nav).toMatch(/animation:\s*pb-in [^;]*backwards/);
    expect(nav).not.toMatch(/opacity:\s*0/);
    const delays = [...header.matchAll(/\.pb-nav a:nth-child\(\d\)\s*\{\s*animation-delay:\s*([\d.]+)s/g)].map((m) => Number(m[1]));
    expect(delays).toHaveLength(3);
    for (const d of delays) expect(d).toBeGreaterThanOrEqual(0.3);
    expect(rule(header, '.pb-bar .pb-join')).toMatch(/animation:\s*pb-in [^;]*backwards/);
  });

  it('al llegar por una transición de vista la barra no vuelve a entrar', () => {
    expect(header).toMatch(/\.pb-vt-nav \.pb-nav a,\s*\.pb-vt-nav \.pb-bar \.pb-join\s*\{\s*animation:\s*none/);
    expect(read('src/layouts/Base.astro')).toMatch(/pagereveal[\s\S]*viewTransition[\s\S]*pb-vt-nav/);
  });

  it('los enlaces del menú móvil entran escalonados, visibles por defecto', () => {
    const a = rule(menu, '.pb-sheet[open] .pb-sheet-nav a');
    expect(a).toMatch(/animation:\s*pb-sheet-up [^;]*backwards/);
    expect(menu.match(/\.pb-sheet-nav a:nth-child\(\d\)\s*\{\s*animation-delay/g) ?? []).toHaveLength(3);
  });

  it('el chip del próximo evento entra con scaleX + opacity (sin clip-path) y sus dígitos suben', () => {
    expect(header).not.toMatch(/clip-path/);
    expect(header).toMatch(/\.pb-chip\s*\{[^}]*transform:\s*scaleX\(0\)/);
    expect(header).toMatch(/\.pb-chip-n > span\s*\{[^}]*transform:\s*translateY\(100%\)/);
  });

  it('con movimiento reducido no hay entradas', () => {
    expect(reduced(header)).toMatch(/\.pb-nav a/);
    expect(reduced(header)).toMatch(/\.pb-chip/);
    expect(reduced(menu)).toMatch(/\.pb-sheet-nav a/);
  });
});

describe('Calendario y panel del próximo evento', () => {
  it('el cubo iso gira con view(), en una regla aparte del shorthand', () => {
    const css = read('src/styles/upcoming.css');
    expect(css).toMatch(/\.pb-iso\s*\{\s*animation:\s*pb-iso-spin linear both;?\s*\}/);
    expect(css).toMatch(/\.pb-iso\s*\{\s*animation-timeline:\s*view\(\);\s*animation-range:\s*cover 0% cover 100%;?\s*\}/);
    expect(reduced(css)).toMatch(/\.pb-iso/);
  });

  it('las celdas de progreso se llenan con scaleY al entrar y la actual parpadea (pausada fuera de pantalla)', () => {
    const css = read('src/styles/next-event.css');
    expect(css).toMatch(/\.pb-panel\.is-in \.pb-cell\.on\s*\{[^}]*animation:\s*pb-fill/);
    expect(css).toMatch(/\.pb-panel\.is-in \.pb-cell\.now\s*\{[^}]*pb-blink/);
    expect(css).toMatch(/@keyframes pb-fill\s*\{\s*from\s*\{\s*transform:\s*scaleY\(0\)/);
    expect(css).toMatch(/\.pb-fx\.is-off \.pb-cell\.now/);
    expect(reduced(css)).toMatch(/\.pb-cell/);
  });

  it('los 8 bits se teclean uno a uno y countdown.ts los actualiza sin borrarlos', () => {
    expect(read('src/components/home/NextEvent.astro')).toMatch(/class="pb-bit"/);
    expect(read('src/styles/next-event.css')).toMatch(/\.pb-panel\.is-in \.pb-bit\s*\{[^}]*animation:\s*pb-bit/);
    expect(read('src/scripts/countdown.ts')).toMatch(/\.pb-bit/);
    expect(reduced(read('src/styles/next-event.css'))).toMatch(/\.pb-bit/);
  });
});

describe('F10 · hover por letra del titular', () => {
  const hero = read('src/styles/hero.css');

  it('copia clara por letra (sin font-weight) que aparece por opacidad y sube 2 px, solo con cursor y ya decodificado', () => {
    expect(read('src/components/home/Hero.astro')).toMatch(/data-c=\{ch\.c\}/);
    expect(rule(hero, '.pb-ci::after')).toMatch(/content:\s*attr\(data-c\)/);
    expect(rule(hero, '.pb-ci::after')).toMatch(/opacity:\s*0/);
    expect(hero).toMatch(/@media \(hover: hover\)\s*\{[^@]*\[data-decoded\] \.pb-ch:hover \.pb-ci\s*\{[^}]*translateY\(-2px\)/);
    expect(hero).not.toMatch(/font-weight:\s*300/);
  });

  it('con movimiento reducido la letra no se mueve', () => {
    expect(reduced(hero)).toMatch(/\.pb-ch:hover \.pb-ci/);
  });
});

describe('F9 · iconos', () => {
  it('Directiva y Proyectos destacados llevan el chip de 34×34', () => {
    expect(read('src/components/team/Board.astro')).toMatch(/<SectionChip \/>/);
    expect(read('src/components/events/Showcase.astro')).toMatch(/<SectionChip \/>/);
    expect(read('src/components/home/UpcomingEvents.astro')).toMatch(/<SectionChip \/>/);
    const chip = read('src/components/SectionChip.astro');
    expect(chip).toMatch(/width="34" height="34"/);
    expect(chip).toMatch(/aria-hidden="true"/);
  });

  it('Button.astro tiene un hueco para icono y "Ver eventos" lleva la terminal', () => {
    expect(read('src/components/Button.astro')).toMatch(/<slot name="icon"/);
    expect(read('src/components/home/Hero.astro')).toMatch(/<TerminalIcon slot="icon" \/>[\s\S]*Ver eventos/);
    expect(read('src/components/TerminalIcon.astro')).toMatch(/M5 7l3 2-3 2M10 12h3/);
  });
});

describe('F11 · títulos de pestaña con pageTitle()', () => {
  for (const p of ['index.astro', '404.astro', 'equipo/index.astro', 'eventos/index.astro', 'eventos/[slug].astro', 'unirme/index.astro'])
    it(`src/pages/${p} usa pageTitle`, () => {
      const src = read(`src/pages/${p}`);
      expect(src).toMatch(/from '[./]+lib\/page-title'/);
      expect(src).toMatch(/<Base title=\{(pageTitle\(|HOME_TITLE)/);
    });
});

describe('F13 · menú móvil sin backdrop-filter', () => {
  const menu = read('src/styles/mobile-menu.css');
  it('la hoja usa fondo sólido rgba(15, 26, 77, 0.94) y no desenfoca', () => {
    expect(menu).not.toMatch(/backdrop-filter/);
    expect(menu).toMatch(/\.pb-sheet\s*\{[^}]*background:\s*rgba\(15, 26, 77, 0\.94\)/);
  });
});
