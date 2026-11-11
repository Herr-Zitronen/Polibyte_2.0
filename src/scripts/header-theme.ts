// Tema de la barra: claro solo cuando una sección clara está bajo el texto de la barra (y = 40px).
// IntersectionObserver: el navegador avisa al cambiar de sección; no corre JS en cada píxel de scroll.
const LINE_Y = 40;
/** Alto (px) desde el inicio de la página en el que el blur de la barra está apagado. */
const TOP_ZONE = 60;

export function initHeaderTheme(header: HTMLElement): () => void {
  const lights = [...document.querySelectorAll<HTMLElement>('[data-theme="light"]')].filter((el) => !header.contains(el));
  const under = new Set<Element>();
  let observer: IntersectionObserver | undefined;

  const apply = () => header.setAttribute('data-theme', under.size ? 'light' : 'dark');

  const observe = () => {
    observer?.disconnect();
    under.clear();
    // Ventana de 1px de alto a la altura de LINE_Y.
    const bottom = Math.max(0, window.innerHeight - LINE_Y - 1);
    observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) under.add(e.target);
          else under.delete(e.target);
        }
        apply();
      },
      { rootMargin: `-${LINE_Y}px 0px -${bottom}px 0px` },
    );
    for (const el of lights) observer.observe(el);
  };

  // Blur: apagado solo con la página arriba del todo (primeros TOP_ZONE px), donde bajo la barra no pasa
  // contenido, solo el nevado ya difuminado. En cuanto se hace scroll vuelve a encenderse. Antes se apagaba
  // mientras la barra estaba sobre la portada (#top) y el titular de Equipo o Eventos pasaba bajo la barra
  // sin desenfoque. Un centinela fijo al inicio del documento + IntersectionObserver: nada corre por scroll.
  let sentinel: HTMLElement | undefined;
  let coverObserver: IntersectionObserver | undefined;
  const observeCover = () => {
    if (coverObserver) return;
    sentinel = document.createElement('div');
    sentinel.className = 'pb-top-sentinel';
    sentinel.setAttribute('aria-hidden', 'true');
    sentinel.style.cssText = `position:absolute;top:0;left:0;width:1px;height:${TOP_ZONE}px;pointer-events:none;visibility:hidden`;
    document.body.prepend(sentinel);
    coverObserver = new IntersectionObserver(([e]) => header.setAttribute('data-blur', e?.isIntersecting ? 'off' : 'on'));
    coverObserver.observe(sentinel);
  };

  apply();
  observeCover();
  if (lights.length) observe();
  // F12: un solo listener de resize, con debounce (la barra de URL del celular lo dispara a cada rato).
  let timer = 0;
  const onResize = () => {
    clearTimeout(timer);
    timer = window.setTimeout(() => {
      if (lights.length) observe();
    }, 150);
  };
  window.addEventListener('resize', onResize, { passive: true });
  return () => {
    clearTimeout(timer);
    observer?.disconnect();
    coverObserver?.disconnect();
    sentinel?.remove();
    window.removeEventListener('resize', onResize);
  };
}
