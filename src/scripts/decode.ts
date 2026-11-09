// Anima el titular cambiando solo el textContent de cada letra (sin re-render, sin CLS).
import { FRAME_MS, decodeFrames } from '../lib/decode';

export function initDecode(h1: HTMLElement): void {
  const spans = [...h1.querySelectorAll<HTMLElement>('.pb-ch')];
  const text = spans.map((s) => s.textContent ?? '').join('');
  const done = () => h1.setAttribute('data-decoded', '');
  if (!spans.length || matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
  const frames = decodeFrames(text, Date.now());
  const chars = (i: number) => [...frames[i]!];
  let idx = 0;
  let last = -Infinity;
  const step = (now: number) => {
    if (now - last >= FRAME_MS) {
      last = now;
      const f = chars(idx);
      spans.forEach((s, i) => {
        if (s.textContent !== f[i]) s.textContent = f[i]!;
      });
      if (++idx >= frames.length) return done();
    }
    requestAnimationFrame(step);
  };
  requestAnimationFrame(step);
}
