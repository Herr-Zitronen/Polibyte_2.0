// Linterna del wordmark del pie (DESIGN §3.10). Reutiliza el listener único de fx.ts.
import { lanternPoint } from '../lib/lantern';
import { onPointer } from './fx';

export function initLantern(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  for (const lamp of document.querySelectorAll<HTMLElement>('.pb-lamp:not([data-lantern])')) {
    lamp.dataset['lantern'] = '';
    let px = 0;
    let py = 0;
    let raf = 0;
    const apply = () => {
      raf = 0;
      const p = lanternPoint({ x: px, y: py }, lamp.getBoundingClientRect());
      lamp.style.setProperty('--x', `${p.x}px`);
      lamp.style.setProperty('--y', `${p.y}px`);
    };
    onPointer((x, y, t) => {
      if (!(t instanceof Node) || !lamp.contains(t)) return;
      px = x;
      py = y;
      if (!raf) raf = requestAnimationFrame(apply);
    });
  }
}
