// H2.4 · Scroll con inercia. Lenis se descarga solo si el usuario no pidió movimiento reducido:
// respeta su preferencia y ahorra bytes. Al crearse, Lenis se anuncia en `window.lenis`.
let started = false;

export async function initLenis(): Promise<void> {
  if (started || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  started = true;
  const { default: Lenis } = await import('lenis');
  new Lenis({ autoRaf: true, anchors: true });
}
