// H2.4 · Scroll con inercia. Lenis se descarga solo si el usuario no pidió movimiento reducido
// (respeta su preferencia y ahorra bytes) y solo después de `load`, en tiempo ocioso: así no compite
// con el primer pintado (presupuesto LCP < 2 s). Al crearse, Lenis se anuncia en `window.lenis`.
let started = false;

async function start(): Promise<void> {
  const { default: Lenis } = await import('lenis');
  new Lenis({ autoRaf: true, anchors: true });
}

export function initLenis(): void {
  if (started || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  started = true;
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => void start()) : setTimeout(() => void start(), 1));
  if (document.readyState === 'complete') idle();
  else addEventListener('load', idle, { once: true });
}
