// Conmutador Escritorio/Móvil del panel destacado (DESIGN §5.2). Sin conmutador (no hay shotMobile), no hace nada.
export function initShotToggle(root: HTMLElement): void {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-shot]')];
  const views = [...root.querySelectorAll<HTMLElement>('[data-view]')];
  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const target = btn.dataset.shot;
      for (const b of buttons) b.setAttribute('aria-pressed', String(b === btn));
      for (const v of views) {
        const on = v.dataset.view === target;
        v.hidden = !on;
        // Reinicia la entrada (solo transform/opacity; ver showcase.css).
        if (on) {
          v.classList.remove('pb-swap');
          void v.offsetWidth;
          v.classList.add('pb-swap');
        }
      }
    });
  }
}
