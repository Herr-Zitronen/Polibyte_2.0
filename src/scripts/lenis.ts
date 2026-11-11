// H2.4 · Scroll con inercia. Lenis se descarga solo si el usuario no pidió movimiento reducido
// (respeta su preferencia y ahorra bytes) y solo después de `load`, en tiempo ocioso: así no compite
// con el primer pintado (presupuesto LCP).
// F12: no se carga en pantallas táctiles (el scroll nativo del celular es mejor) y se anuncia en
// `window.lenis` para que el diagnóstico de fluidez pueda apagarlo.
// perf/fluidez-real: el rAF solo corre mientras hay movimiento (createOnDemandLoop). En reposo no hay
// ningún cuadro forzado del hilo principal.
// Se detiene al salir de la página (pageswap/pagehide) y se reanuda al volver (pagereveal/pageshow).
import type Lenis from 'lenis';
import { createOnDemandLoop } from '../lib/on-demand-loop';

// El paquete ya declara `window.lenis` (sus metadatos); aquí se guarda la instancia, con su propio tipo.
const host = window as unknown as { lenis?: Lenis };

let started = false;

/** Lo que puede iniciar un scroll: con cualquiera de estos se despierta el bucle. */
const WAKE_EVENTS = ['wheel', 'keydown', 'pointerdown', 'scroll', 'click', 'resize'] as const;

async function start(): Promise<void> {
  const { default: LenisCtor } = await import('lenis');
  // rAF propio en vez de autoRaf: se puede pausar sin lenis.stop(), que pone overflow: clip en <html>
  // (quitaría la barra de scroll justo antes de capturar la página saliente y la haría saltar).
  const lenis = new LenisCtor({ autoRaf: false, anchors: true });
  host.lenis = lenis;
  const loop = createOnDemandLoop({
    step: (t) => lenis.raf(t),
    // El diagnóstico de fluidez (variante sin-lenis) lo destruye y borra window.lenis: el bucle se apaga.
    isActive: () => host.lenis === lenis && lenis.isScrolling === 'smooth',
  });
  const wake = () => {
    if (host.lenis === lenis) loop.wake();
  };
  for (const ev of WAKE_EVENTS) addEventListener(ev, wake, { passive: true, capture: true });
  const resume = () => {
    loop.resume();
    wake();
  };
  addEventListener('pageswap', loop.pause);
  addEventListener('pagehide', loop.pause);
  addEventListener('pagereveal', resume);
  addEventListener('pageshow', resume);
  wake();
}

export function initLenis(): void {
  if (started) return;
  if (matchMedia('(prefers-reduced-motion: reduce), (hover: none), (pointer: coarse)').matches) return;
  started = true;
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => void start()) : setTimeout(() => void start(), 1));
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
