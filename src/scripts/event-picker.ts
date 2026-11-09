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
  root.addEventListener('pointermove', (e) => {
    const row = (e.target as Element).closest<HTMLElement>('[data-pick]');
    if (!row) return;
    const r = row.getBoundingClientRect();
    row.style.setProperty('--gx', `${e.clientX - r.left}px`);
    row.style.setProperty('--gy', `${e.clientY - r.top}px`);
  });
}
