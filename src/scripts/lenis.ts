// H2.4 · Scroll con inercia. Lenis se descarga solo si el usuario no pidió movimiento reducido
// (respeta su preferencia y ahorra bytes) y en tiempo ocioso tras parsear el DOM (máx. 200 ms):
// no compite con el primer pintado (presupuesto LCP < 2 s) y el scroll no cambia de modo a media página. Al crearse, Lenis se anuncia en `window.lenis`.
let started = false;

async function start(): Promise<void> {
  const { default: Lenis } = await import('lenis');
  new Lenis({ autoRaf: true, anchors: true });
}

export function initLenis(): void {
  if (started || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  started = true;
  // Sin esperar a `load`: en cada navegación el scroll nativo duraba hasta ~1 s y luego cambiaba a inercia.
  const idle = () => ('requestIdleCallback' in window ? requestIdleCallback(() => void start(), { timeout: 200 }) : setTimeout(() => void start(), 1));
  if (document.readyState === 'loading') addEventListener('DOMContentLoaded', idle, { once: true });
  else idle();
}
