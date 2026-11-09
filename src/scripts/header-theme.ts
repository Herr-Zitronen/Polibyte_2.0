// Tema de la barra: claro solo cuando una sección clara está bajo el texto de la barra (y = 40px).
// IntersectionObserver: el navegador avisa al cambiar de sección; no corre JS en cada píxel de scroll.
const LINE_Y = 40;

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

  apply();
  if (lights.length) observe();
  window.addEventListener('resize', observe, { passive: true });
  return () => {
    observer?.disconnect();
    window.removeEventListener('resize', observe);
  };
}
