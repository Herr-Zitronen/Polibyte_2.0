// F5 · Fluidez y carga de Inicio: presupuesto medido con CDP (CPU ×4). Solo corre en Actions.
// Mide: LCP, tareas largas tras la carga y fotogramas durante un scroll programado.
// El informe completo se imprime y se adjunta a la prueba (ver `test-results`).
import { expect, test, type Page } from '@playwright/test';

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

async function measure(page: Page, variant: Variant = {}): Promise<Report> {
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
  // Deja pasar la entrada del titular y la carga ociosa de Lenis.
  await page.waitForTimeout(3500);
  if (variant.css) await page.addStyleTag({ content: variant.css });
  if (variant.js) await page.evaluate(variant.js);
  await page.waitForTimeout(300);
  const loadAt = await page.evaluate(() => performance.timing.loadEventEnd - performance.timing.navigationStart);

  // Scroll programado de arriba abajo en ~4 s, midiendo cada fotograma con rAF.
  const scroll = await page.evaluate(async () => {
    const total = document.documentElement.scrollHeight - innerHeight;
    const dur = 4000;
    const stamps: number[] = [];
    await new Promise<void>((done) => {
      const t0 = performance.now();
      const tick = (t: number) => {
        stamps.push(t);
        const p = Math.min((t - t0) / dur, 1);
        scrollTo(0, total * p);
        if (p < 1) requestAnimationFrame(tick);
        else done();
      };
      requestAnimationFrame(tick);
    });
    const deltas = stamps.slice(1).map((t, i) => t - stamps[i]!);
    return { deltas };
  });
  const { deltas } = scroll;
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
const VARIANTS: Record<string, Variant> = {
  base: {},
  'sin-animaciones-infinitas': {
    js: `document.getAnimations().filter(a=>a.effect&&a.effect.getComputedTiming().iterations===Infinity).forEach(a=>a.cancel())`,
  },
  'sin-scroll-timelines': {
    js: `document.getAnimations().filter(a=>a.timeline&&a.timeline!==document.timeline).forEach(a=>a.cancel())`,
  },
  'sin-lenis': { js: `try{window.lenis&&window.lenis.destroy()}catch(e){}` },
  'sin-backdrop-filter': { css: `*{backdrop-filter:none!important;-webkit-backdrop-filter:none!important}` },
  'sin-grano': { css: `.pb-grain{display:none!important}` },
  'sin-fondos-paralaje': { css: `.pb-par{display:none!important}` },
  'sin-sombras': { css: `*{text-shadow:none!important;box-shadow:none!important}` },
  'sin-content-visibility': { css: `*{content-visibility:visible!important}` },
  'sin-will-change': { css: `*{will-change:auto!important}` },
};

test.describe('diagnóstico de costes', () => {
  for (const [name, variant] of Object.entries(VARIANTS)) {
    test(`variante: ${name}`, async ({ page }, info) => {
      test.skip(info.project.name === 'mobile-390', 'solo escritorio y portátil');
      const r = await measure(page, variant);
      console.log(`[F5-DIAG] ${info.project.name} ${name} fps=${r.fps} dropped=${r.droppedPct}% worst=${r.worstFrameMs}ms long=${r.longTasksAfterLoad.length}`);
    });
  }
});

