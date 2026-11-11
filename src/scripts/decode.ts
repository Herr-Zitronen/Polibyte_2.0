// Titular decodificado (WOR-101). El giro de los carretes es CSS puro (transform + steps); este script
// solo marca el final: data-decoded cuando termina el giro (retira los carretes y enciende la sombra).
// F4: el estado final está GARANTIZADO. Si la animación CSS no termina (pestaña ocupada, scroll rápido,
// CPU lenta), un temporizador marca data-settled y el CSS deja las letras en su sitio.

/** Tiempo máximo hasta fijar el titular (la animación normal termina en ~2,5 s). */
export const SETTLE_MS = 3000;

export function initDecode(h1: HTMLElement): void {
  // Página pre-renderizada: sus animaciones esperan (transitions.css), así que los temporizadores también.
  if ((document as Document & { prerendering?: boolean }).prerendering) {
    document.addEventListener('prerenderingchange', () => initDecode(h1), { once: true });
    return;
  }
  const finish = () => h1.setAttribute('data-decoded', '');
  /** Respaldo: además apaga las animaciones CSS (data-settled) para que ninguna letra quede escondida. */
  const settle = () => {
    finish();
    h1.setAttribute('data-settled', '');
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return finish();
  const ms = Number(h1.dataset['decodeMs']) || 0;
  setTimeout(finish, ms);
  setTimeout(settle, SETTLE_MS);
  addEventListener('pagehide', settle);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) settle();
  });
}
