// Filtros del calendario (H5.3). Mejora progresiva: el HTML trae todas las filas; aquí solo se ocultan.
export function initCalendarFilter(root: HTMLElement): void {
  const buttons = [...root.querySelectorAll<HTMLButtonElement>('[data-filter]')];
  const rows = [...root.querySelectorAll<HTMLElement>('[data-type]')];
  const empty = root.querySelector<HTMLElement>('[data-empty]');
  for (const btn of buttons) {
    btn.addEventListener('click', () => {
      const f = btn.dataset.filter;
      for (const b of buttons) b.setAttribute('aria-pressed', String(b === btn));
      let shown = 0;
      for (const r of rows) {
        r.hidden = f !== 'all' && r.dataset.type !== f;
        if (!r.hidden) shown++;
      }
      if (empty) empty.hidden = shown > 0;
    });
  }
}
