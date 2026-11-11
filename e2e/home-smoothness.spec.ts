// F5 · Fluidez y carga de Inicio: presupuesto medido con CDP (CPU ×4). Solo corre en Actions.
// Mide: LCP, tareas largas tras la carga y fotogramas durante un scroll programado.
// El informe completo se imprime y se adjunta a la prueba (ver `test-results`).
import { expect, test, type BrowserContextOptions, type CDPSession, type Page } from '@playwright/test';

const BUDGET = {
  lcpMs: 1800, // meta de WOR-91 (margen 10 % sobre los 2,0 s de Lighthouse)
  maxLongTaskMs: 50, // sin tareas > 50 ms tras la carga
  minFpsDesktop: 55, // media durante el scroll en escritorio
  minFpsMobile: 30,
};

interface Report {
  lcp: number;
  longTasksAfterLoad: { start: number; duration: number }[];
  loadAt: number;
  fps: number;
  worstFrameMs: number;
  droppedPct: number;
  frames: number;
}

interface Variant {
  css?: string;
  js?: string;
}

/** `script`: scrollTo por cuadro (hilo principal; comparable con la tabla de referencia del plan).
 *  `rueda`: gesto de rueda sintetizado por CDP, que el navegador desplaza como una rueda real (en el
 *  compositor cuando nadie mueve el scroll con JS). Es el que refleja lo que siente quien usa el ratón. */
type Mode = 'script' | 'rueda';

async function measure(page: Page, variant: Variant = {}, mode: Mode = 'script'): Promise<Report> {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.addInitScript(() => {
    const w = window as unknown as { __m: { lcp: number; long: { start: number; duration: number }[] } };
    w.__m = { lcp: 0, long: [] };
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) w.__m.lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) w.__m.long.push({ start: e.startTime, duration: e.duration });
    }).observe({ type: 'longtask', buffered: true });
  });
  await page.goto('/', { waitUntil: 'load' });
  // Deja pasar la entrada del titular.
  await page.waitForTimeout(3500);
  if (variant.css) await page.addStyleTag({ content: variant.css });
  if (variant.js) await page.evaluate(variant.js);
  await page.waitForTimeout(300);
  const loadAt = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);

  // Scroll programado de arriba abajo en ~4 s, midiendo cada fotograma con rAF.
  const scroll = mode === 'rueda' ? null : await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    const dur = 4000;
    const stamps: number[] = [];
    await new Promise<void>((done) => {
      const t0 = performance.now();
      const tick = (t: number) => {
        stamps.push(t);
        const p = Math.min((t - t0) / dur, 1);
        scrollTo({ top: total * p, behavior: 'instant' });
        if (p < 1) requestAnimationFrame(tick);
        else done();
      };
      requestAnimationFrame(tick);
    });
    const deltas = stamps.slice(1).map((t, i) => t - stamps[i]!);
    return { deltas };
  });
  const { deltas } = mode === 'rueda' ? await wheelScroll(page, cdp) : scroll!;
  const sum = deltas.reduce((a, b) => a + b, 0);
  const m = await page.evaluate(() => (window as unknown as { __m: { lcp: number; long: { start: number; duration: number }[] } }).__m);
  const longs = m.long.filter((t) => t.start > loadAt && t.start < loadAt + 3500 && t.duration > BUDGET.maxLongTaskMs);
  return {
    lcp: Math.round(m.lcp),
    longTasksAfterLoad: longs,
    loadAt: Math.round(loadAt),
    fps: Math.round((deltas.length / sum) * 1000 * 10) / 10,
    worstFrameMs: Math.round(Math.max(...deltas)),
    droppedPct: Math.round((deltas.filter((d) => d > 20).length / deltas.length) * 1000) / 10,
    frames: deltas.length,
  };
}

/** Gesto de rueda de arriba abajo a velocidad constante (~4 s), con los cuadros medidos con rAF. */
async function wheelScroll(page: Page, cdp: CDPSession): Promise<{ deltas: number[] }> {
  const total = await page.evaluate(() => {
    const w = window as unknown as { __stamps: number[]; __rec: boolean };
    w.__stamps = [];
    w.__rec = true;
    const tick = (t: number) => {
      if (!w.__rec) return;
      w.__stamps.push(t);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
    return document.documentElement.scrollHeight - innerHeight;
  });
  const vp = page.viewportSize()!;
  await cdp.send('Input.synthesizeScrollGesture', {
    x: Math.round(vp.width / 2),
    y: Math.round(vp.height / 2),
    yDistance: -total,
    speed: Math.round(total / 4),
    gestureSourceType: 'mouse',
  });
  const stamps = await page.evaluate(() => {
    const w = window as unknown as { __stamps: number[]; __rec: boolean };
    w.__rec = false;
    return w.__stamps;
  });
  return { deltas: stamps.slice(1).map((t, i) => t - stamps[i]!) };
}

test('Inicio cumple el presupuesto de fluidez y carga (CPU ×4)', async ({ page }, info) => {
  const isMobile = info.project.name === 'mobile-390';
  const r = await measure(page);
  const line = `[F5] ${info.project.name} ${JSON.stringify(r)}`;
  console.log(line);
  await info.attach('smoothness-report.json', { body: JSON.stringify(r, null, 2), contentType: 'application/json' });
  expect.soft(r.lcp, `LCP ${r.lcp} ms (presupuesto ${BUDGET.lcpMs})`).toBeLessThanOrEqual(BUDGET.lcpMs);
  // El runner de Actions rasteriza por software y es muy ruidoso: fps y tareas largas se INFORMAN (anotación + informe)
  // y no bloquean. Lo bloqueante es el LCP; el LCP real lo protege Lighthouse CI.
  const target = isMobile ? BUDGET.minFpsMobile : BUDGET.minFpsDesktop;
  if (r.fps < target) info.annotations.push({ type: 'aviso-fps', description: `fps medio ${r.fps} < meta ${target}` });
  if (r.longTasksAfterLoad.length) info.annotations.push({ type: 'aviso-tareas-largas', description: JSON.stringify(r.longTasksAfterLoad) });
});

// Diagnóstico (no falla): cuánto cuesta cada ingrediente. Apaga uno a uno y compara los fps del scroll.
// Solo corre con PERF_DIAG=1 (workflow manual perf-diag.yml), nunca en la suite normal.
const DIAG = !!process.env['PERF_DIAG'];
const VARIANTS: Record<string, Variant> = {
  base: {},
  'sin-animaciones-infinitas': {
    js: `document.getAnimations().filter(a=>a.effect&&a.effect.getComputedTiming().iterations===Infinity).forEach(a=>a.cancel())`,
  },
  'sin-scroll-timelines': {
    js: `document.getAnimations().filter(a=>a.timeline&&a.timeline!==document.timeline).forEach(a=>a.cancel())`,
  },
  'sin-backdrop-filter': { css: `*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}` },
  'sin-grano': { css: `.pb-grain{display:none!important}` },
  'sin-fondos-paralaje': { css: `.pb-par{display:none!important}` },
  'sin-sombras': { css: `*{text-shadow:none!important;box-shadow:none!important}` },
  'sin-content-visibility': { css: `*{content-visibility:visible!important}` },
  'sin-will-change': { css: `*{will-change:auto!important}` },
  // Tirón de las líneas del hero (perf/scroll-fino). La base ya lleva los cambios; cada variante prueba
  // un sospechoso o devuelve una parte a como estaba antes, para medir cuánto aportó.
  // (a) el hero nunca se marca .is-off: ni se oculta ni pausa sus barridos.
  'sin-is-off': {
    js: `(()=>{const h=document.querySelector('.pb-hero');if(!h)return;h.classList.remove('is-off');new MutationObserver(()=>{if(h.classList.contains('is-off'))h.classList.remove('is-off')}).observe(h,{attributes:true,attributeFilter:['class']})})()`,
  },
  // (a') comportamiento anterior: al marcarse .is-off se sueltan las animaciones de scroll (y se recrean al volver).
  'is-off-suelta-animaciones': {
    css: `.pb-hero.is-off .pb-hx,.pb-hero.is-off .pb-tlg,.pb-hero.is-off .pb-trg,.pb-hero.is-off .pb-blg,.pb-hero.is-off .pb-brg,.pb-hero.is-off .pb-flg,.pb-hero.is-off .pb-frg{animation:none!important}`,
  },
  // (c) sin los 8 barridos (.pb-flow::after) ni los 4 nodos que parpadean.
  'sin-barridos': { css: `.pb-flow::after,.pb-node{display:none!important}` },
  // Estructura anterior: líneas centrales como elementos aparte con la animación de su grupo (2 capas más).
  'lineas-sueltas': {
    css: `.pb-cvl-old .pb-vline{animation:none!important;transform:none!important}`,
    js: `(()=>{const l=document.querySelector('.pb-hero__lines');if(!l)return;document.querySelectorAll('.pb-hero .pb-cvl').forEach(c=>{const top=!!c.closest('.pb-tlg');c.className=(top?'pb-tlg':'pb-blg')+' pb-cvl-old';c.setAttribute('style',top?'left:50%;top:80px;width:1.5px;height:80px':'left:50%;bottom:82px;width:1.5px;height:80px');l.appendChild(c)})})()`,
  },
};

test.describe('diagnóstico de costes', () => {
  test.skip(!DIAG, 'solo con PERF_DIAG=1 (perf-diag.yml)');
  for (const [name, variant] of Object.entries(VARIANTS)) {
    test(`variante: ${name}`, async ({ page }, info) => {
      test.skip(info.project.name === 'mobile-390', 'solo escritorio y portátil');
      const r = await measure(page, variant);
      console.log(`[F5-DIAG] ${info.project.name} ${name} fps=${r.fps} dropped=${r.droppedPct}% worst=${r.worstFrameMs}ms long=${r.longTasksAfterLoad.length}`);
    });
  }
});

// A/B intercalado (3 rondas) con gesto de rueda real: el runner compartido es ruidoso, así que solo se
// comparan medianas dentro de la misma corrida. Sirve para el tirón de las líneas del hero (perf/scroll-fino).
// (Lenis ya no existe: su coste se ve comparando la base con la tabla de referencia del plan.)
const AB = ['base', 'sin-is-off', 'is-off-suelta-animaciones', 'sin-barridos', 'lineas-sueltas'] as const;

test('A/B con rueda: variantes del hero (medianas)', async ({ browser }, info) => {
  test.skip(!DIAG, 'solo con PERF_DIAG=1 (perf-diag.yml)');
  test.skip(info.project.name === 'mobile-390', 'solo escritorio y portátil');
  test.setTimeout(300_000);
  const fps: Record<string, number[]> = {};
  const dropped: Record<string, number[]> = {};
  for (let i = 0; i < 3; i++) {
    for (const key of AB) {
      const variant = VARIANTS[key];
      if (!variant) continue;
      const ctx = await browser.newContext(info.project.use as BrowserContextOptions);
      const page = await ctx.newPage();
      const r = await measure(page, variant, 'rueda');
      (fps[key] ??= []).push(r.fps);
      (dropped[key] ??= []).push(r.droppedPct);
      await ctx.close();
    }
  }
  const med = (a: number[]) => [...a].sort((x, y) => x - y)[1]!;
  for (const key of Object.keys(fps))
    console.log(`[F5-AB] ${info.project.name} ${key} rueda fps=${JSON.stringify(fps[key])} mediana=${med(fps[key]!)} dropped-mediana=${med(dropped[key]!)}%`);
});
