// Isla de "Próximos eventos": elegir fila → cambia el detalle (aria-live) y la luz sigue al cursor.

export function selectRow(root: ParentNode, id: string): void {
  for (const row of root.querySelectorAll<HTMLElement>('[data-pick]')) {
    const on = row.dataset['pick'] === id;
    row.classList.toggle('sel', on);
    row.setAttribute('aria-pressed', String(on));
  }
  for (const d of root.querySelectorAll<HTMLElement>('[data-detail]')) d.hidden = d.dataset['detail'] !== id;
}

export function initEventPicker(): void {
  const root = document.querySelector<HTMLElement>('[data-event-picker]');
  if (!root) return;
  root.addEventListener('click', (e) => {
    const row = (e.target as Element).closest<HTMLElement>('[data-pick]');
    if (row) selectRow(root, row.dataset['pick']!);
  });
  if (!matchMedia('(hover: hover)').matches) return;
  // F12: como mucho una escritura por cuadro (pointermove puede llegar varias veces por cuadro).
  let row: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  let raf = 0;
  const apply = () => {
    raf = 0;
    if (!row) return;
    const r = row.getBoundingClientRect();
    row.style.setProperty('--gx', `${x - r.left}px`);
    row.style.setProperty('--gy', `${y - r.top}px`);
  };
  root.addEventListener(
    'pointermove',
    (e) => {
      row = (e.target as Element).closest<HTMLElement>('[data-pick]');
      x = e.clientX;
      y = e.clientY;
      if (row && !raf) raf = requestAnimationFrame(apply);
    },
    { passive: true },
  );
}
