// Panel de diagnóstico de fluidez (perf/fluidez-real). Solo se descarga si la URL lleva `?diag`
// (import dinámico en Base.astro): nadie más carga nada. Guía de uso: docs/SESSIONS.md.
// Las casillas viven en la URL (`?diag=sin-lenis,sin-cubo`): al cambiar una se recarga la página, así
// cada variante parte siempre de una página limpia y el resultado se puede repetir.
import { frameStats, PANEL_VARIANTS, parseDiagParam, variantByName, type FrameStats } from '../lib/perf-variants';

const CSS = `
.pb-diag{position: fixed;right:12px;bottom:12px;z-index:9999;width:270px;padding:12px;box-sizing:border-box;
  background:#0D1438;color:#F2F4FA;border:1px solid rgba(242,244,250,.35);font:12px/1.4 'JetBrains Mono',monospace}
.pb-diag b{display:block;margin:0 0 6px;font-weight:700}
.pb-diag label{display:flex;gap:8px;align-items:center;padding:2px 0;cursor:pointer}
.pb-diag output{display:block;margin-top:8px;padding-top:8px;border-top:1px solid rgba(242,244,250,.35);white-space:pre-wrap;font-variant-numeric:tabular-nums}
.pb-diag button{margin-top:8px;padding:6px 10px;background:none;color:inherit;border:1px solid rgba(242,244,250,.7);font:inherit;cursor:pointer}
.pb-diag small{display:block;margin-top:6px;color:#AEB6D3}
`;

const fmt = (s: FrameStats) => `${s.fps.toFixed(1)} fps · peor ${s.worstMs} ms · ${s.slowPct.toFixed(1)} % > 20 ms`;

export function initDiag(): void {
  const active = parseDiagParam(new URLSearchParams(location.search).get('diag'));

  // Las variantes se aplican con la entrada del titular ya terminada (y Lenis cargado).
  const apply = () => {
    for (const name of active) {
      const v = variantByName(name);
      if (v?.css) document.head.appendChild(Object.assign(document.createElement('style'), { textContent: v.css }));
      if (v?.js) new Function(v.js)();
    }
  };
  setTimeout(apply, 3500);

  document.head.appendChild(Object.assign(document.createElement('style'), { textContent: CSS }));
  const panel = document.createElement('div');
  panel.className = 'pb-diag';
  const boxes = PANEL_VARIANTS.map((n) => {
    const title = variantByName(n)?.label ?? '';
    return `<label title="${title}"><input type="checkbox" value="${n}"${active.includes(n) ? ' checked' : ''}>${n}</label>`;
  }).join('');
  panel.innerHTML = `<b>Diagnóstico de fluidez</b>${boxes}<output></output><button type="button">Copiar resultado</button><small>Cambiar una casilla recarga la página.</small>`;
  document.body.appendChild(panel);

  panel.addEventListener('change', () => {
    const names = [...panel.querySelectorAll<HTMLInputElement>('input:checked')].map((i) => i.value);
    const url = new URL(location.href);
    url.searchParams.set('diag', names.join(','));
    location.assign(url);
  });

  // Medidor: duración de cada cuadro del hilo principal (rAF). Ventana viva de 3 s y «última pasada»:
  // desde el primer scroll hasta 800 ms después del último.
  const out = panel.querySelector('output')!;
  let recent: { t: number; d: number }[] = [];
  let pass: number[] | null = null;
  let lastScroll = 0;
  let lastPass: FrameStats | null = null;
  let prev = 0;
  let lastPaint = 0;
  addEventListener(
    'scroll',
    () => {
      lastScroll = performance.now();
      pass ??= [];
    },
    { passive: true },
  );
  const text = () =>
    [
      `variantes: ${active.join(', ') || 'ninguna'}`,
      `últimos 3 s: ${fmt(frameStats(recent.map((r) => r.d)))}`,
      `última pasada: ${lastPass ? `${fmt(lastPass)} · ${lastPass.frames} cuadros` : '—'}`,
    ].join('\n');
  const tick = (t: number) => {
    if (prev) {
      const d = t - prev;
      recent.push({ t, d });
      if (pass) pass.push(d);
    }
    prev = t;
    if (pass && t - lastScroll > 800) {
      lastPass = frameStats(pass);
      pass = null;
    }
    if (t - lastPaint > 500) {
      lastPaint = t;
      recent = recent.filter((r) => t - r.t < 3000);
      out.textContent = text();
    }
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);

  panel.querySelector('button')!.addEventListener('click', () => {
    void navigator.clipboard?.writeText(text());
  });
}
