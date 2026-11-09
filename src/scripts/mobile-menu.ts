// Isla mínima del menú móvil, sin framework.
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

export function initMobileMenu(dialog: HTMLDialogElement, opener: HTMLButtonElement): void {
  const setExpanded = (open: boolean) => opener.setAttribute('aria-expanded', String(open));

  opener.addEventListener('click', () => {
    dialog.showModal();
    setExpanded(true);
  });

  // `close` cubre Escape, el botón "cerrar" y la navegación: siempre devuelve el foco al botón.
  dialog.addEventListener('close', () => {
    setExpanded(false);
    opener.focus();
  });

  dialog.querySelector('[data-menu-close]')?.addEventListener('click', () => dialog.close());

  // Al elegir un enlace la hoja se cierra y la navegación sigue su curso.
  for (const link of dialog.querySelectorAll('a[href]')) link.addEventListener('click', () => dialog.close());

  // Foco atrapado: Tab y Shift+Tab dan la vuelta dentro de la hoja.
  dialog.addEventListener('keydown', (e) => {
    if (e.key !== 'Tab') return;
    const items = [...dialog.querySelectorAll<HTMLElement>(FOCUSABLE)];
    const first = items[0];
    const last = items[items.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });
}
