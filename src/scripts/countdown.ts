// Isla de cuenta regresiva: refresca los números del panel y del chip una vez por minuto.
import { nextEventView } from '../lib/next-event-view';

function render(root: ParentNode, start: Date): void {
  const v = nextEventView({ date: start }, new Date());
  const set = (key: string, text: string) => {
    for (const el of root.querySelectorAll<HTMLElement>(`[data-cd="${key}"]`)) if (el.textContent !== text) el.textContent = text;
  };
  set('days', v.days);
  set('hours', v.hours);
  set('binary', v.binary);
  set('label', v.label);
  set('percent', String(v.percent));
  for (const el of root.querySelectorAll<HTMLElement>('[data-cd="aria"]')) el.setAttribute('aria-label', v.aria);
  for (const el of document.querySelectorAll<HTMLElement>('[data-cd="chip-days"]')) el.textContent = `${Number(v.days)}d`;
  const cells = root.querySelectorAll<HTMLElement>('[data-cd="cells"] > span');
  cells.forEach((c, i) => {
    c.classList.toggle('on', v.cells[i] !== 'off');
    c.classList.toggle('now', v.cells[i] === 'now');
  });
}

export function initCountdown(): void {
  const root = document.querySelector<HTMLElement>('[data-countdown]');
  if (!root) return;
  const start = new Date(root.dataset['countdown']!);
  const panel = root.closest<HTMLElement>('.pb-panel') ?? root;
  render(panel, start);
  setInterval(() => render(panel, start), 60_000);

  // Chip de la barra: aparece cuando el panel ya salió por arriba.
  const header = document.querySelector<HTMLElement>('[data-header]');
  (window as unknown as { __chip?: unknown[] }).__chip = ['init', !!header];
  if (!header) return;
  new IntersectionObserver(([e]) => {
    (window as unknown as { __chip?: unknown[] }).__chip = [...((window as unknown as { __chip?: unknown[] }).__chip ?? []), e && [e.isIntersecting, e.boundingClientRect.top]];
    if (e) header.classList.toggle('show-chip', !e.isIntersecting && e.boundingClientRect.top < 0);
  }).observe(panel);
}
