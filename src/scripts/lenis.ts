// H2.4 · Scroll con inercia. Lenis se descarga solo si el usuario no pidió movimiento reducido:
// respeta su preferencia y ahorra bytes.
import type Lenis from 'lenis';

declare global {
  interface Window {
    lenis?: Lenis;
  }
}

export async function initLenis(): Promise<void> {
  if (window.lenis || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const { default: LenisCtor } = await import('lenis');
  window.lenis = new LenisCtor({ autoRaf: true, anchors: true });
}
