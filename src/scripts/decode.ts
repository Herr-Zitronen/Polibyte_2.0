// Anima el titular cambiando solo el textContent de cada letra (sin re-render, sin CLS).
// F4: el estado final está GARANTIZADO. Si el decodificado (rAF) o la animación CSS no terminan
// (pestaña ocupada, scroll rápido, CPU lenta), un temporizador fija el texto real y marca
// data-settled y data-decoded; el CSS apaga la animación y deja las letras en su sitio.
import { FRAME_MS, decodeFrames } from '../lib/decode';

/** Tiempo máximo hasta fijar el titular (la animación normal termina en ~2,5 s). */
export const SETTLE_MS = 3000;

export function initDecode(h1: HTMLElement): void {
  const spans = [...h1.querySelectorAll<HTMLElement>('.pb-ch')];
  const text = spans.map((s) => s.textContent ?? '').join('');
  const real = [...text];
  let decoded = false;
  /** Fin normal: texto real y marca de que terminó el decodificado (la animación CSS sigue su curso). */
  const finish = () => {
    if (!decoded) {
      decoded = true;
      spans.forEach((s, i) => {
        if (s.textContent !== real[i]) s.textContent = real[i]!;
      });
    }
    h1.setAttribute('data-decoded', '');
  };
  /** Respaldo: además apaga la animación CSS (data-settled) para que ninguna letra quede escondida. */
  const settle = () => {
    finish();
    h1.setAttribute('data-settled', '');
  };
  if (!spans.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  setTimeout(settle, SETTLE_MS);
  addEventListener('pagehide', settle);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) settle();
  });
  const frames = decodeFrames(text, Date.now());
  const chars = (i: number) => [...frames[i]!];
  let idx = 0;
  let last = -Infinity;
  const step = (now: number) => {
    if (decoded) return;
    if (now - last >= FRAME_MS) {
      last = now;
      const f = chars(idx);
      spans.forEach((s, i) => {
        if (s.textContent !== f[i]) s.textContent = f[i]!;
      });
      if (++idx >= frames.length) return finish();
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
