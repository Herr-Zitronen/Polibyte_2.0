// H2.4 · Scroll con inercia. Lenis se descarga solo si el usuario no pidió movimiento reducido
// (respeta su preferencia y ahorra bytes) y solo después de `load`, en tiempo ocioso: así no compite
// con el primer pintado (presupuesto LCP < 2 s).
// F12: no se carga en pantallas táctiles (el scroll nativo del celular es mejor y se ahorra un rAF
// permanente) y se anuncia en `window.lenis` para que el diagnóstico de fluidez pueda apagarlo.
// Se detiene al salir de la página (pageswap/pagehide) y se reanuda al volver (pagereveal/pageshow).
import type Lenis from 'lenis';

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

let started = false;

async function start(): Promise<void> {
  const { default: LenisCtor } = await import('lenis');
  // rAF propio en vez de autoRaf: se puede pausar sin lenis.stop(), que pone overflow: clip en <html>
  // (quitaría la barra de scroll justo antes de capturar la página saliente y la haría saltar).
  const lenis = new LenisCtor({ autoRaf: false, anchors: true });
  window.lenis = lenis;
  let id = 0;
  const loop = (t: number) => {
    // El diagnóstico de fluidez (variante sin-lenis) lo destruye y borra window.lenis: el bucle se apaga.
    if (window.lenis !== lenis) return;
    lenis.raf(t);
    id = requestAnimationFrame(loop);
  };
  const stop = () => {
    cancelAnimationFrame(id);
    id = 0;
  };
  const resume = () => {
    if (!id) id = requestAnimationFrame(loop);
  };
  resume();
  addEventListener('pageswap', stop);
  addEventListener('pagehide', stop);
  addEventListener('pagereveal', resume);
  addEventListener('pageshow', resume);
}

export function initLenis(): void {
  if (started) return;
  if (matchMedia('(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)').matches) return;
  started = true;
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => void start()) : setTimeout(() => void start(), 1));
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
