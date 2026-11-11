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
  // Pantalla de entrada (Intro.astro): mientras tapa la portada, el titular espera pintado en su sitio.
  // Los temporizadores arrancan cuando se retira, junto con las animaciones CSS.
  if (document.documentElement.classList.contains('pb-intro-on')) {
    addEventListener('pb:intro-done', () => initDecode(h1), { once: true });
    return;
  }
  const finish = () => h1.setAttribute('data-decoded', '');
  // perf/fluidez-real: cuando termina el último trazo de la entrada (el subtítulo, pb-up), el hero se marca
  // data-drawn y el CSS suelta las animaciones forwards (líneas, letras, subtítulo): menos capas en el scroll.
  const hero = h1.closest<HTMLElement>('.pb-hero');
  const drawn = () => hero?.setAttribute('data-drawn', '');
  /** Respaldo: además apaga las animaciones CSS (data-settled) para que ninguna letra quede escondida. */
  const settle = () => {
    finish();
    h1.setAttribute('data-settled', '');
    drawn();
  };
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    drawn();
    return finish();
  }
  hero?.addEventListener('animationend', (e) => {
    if (e.animationName === 'pb-up') drawn();
  });
  const ms = Number(h1.dataset['decodeMs']) || 0;
  setTimeout(finish, ms);
  setTimeout(settle, SETTLE_MS);
  addEventListener('pagehide', settle);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) settle();
  });
}
