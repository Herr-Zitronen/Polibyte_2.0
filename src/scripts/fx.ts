// Paneles y efectos: UN IntersectionObserver y UN listener de cursor para todos (DESIGN §3.5).
import { nearestEdge } from '../lib/nearest-edge';

let started = false;

// Un solo `pointermove` en todo el documento; los efectos se suscriben y trabajan en un rAF.
type PointerSub = (x: number, y: number, target: EventTarget | null) => void;
const subs: PointerSub[] = [];
let listening = false;

export function onPointer(sub: PointerSub): void {
  subs.push(sub);
  if (listening) return;
  listening = true;
  document.addEventListener(
    'pointermove',
    (e) => {
      for (const s of subs) s(e.clientX, e.clientY, e.target);
    },
    { passive: true },
  );
}

/** F5/F12: el hero y las líneas vivas pausan lo infinito fuera de pantalla; el hero además suelta sus
 *  animaciones de scroll. El hero se marca con 200 px de margen para reactivarlo antes de que asome. */
function initOffscreen(): void {
  const toggle: IntersectionObserverCallback = (entries) => {
    for (const e of entries) e.target.classList.toggle('is-off', !e.isIntersecting);
  };
  const hero = document.querySelector<HTMLElement>('.pb-hero');
  if (hero) new IntersectionObserver(toggle, { rootMargin: '200px 0px' }).observe(hero);
  const live = document.querySelectorAll<HTMLElement>('.pb-hl, .pb-vl');
  if (live.length) {
    const liveIo = new IntersectionObserver(toggle);
    live.forEach((el) => liveIo.observe(el));
  }
}

/** Arranca una sola vez por página (Base.astro). */
export function initFx(): void {
  if (started) return;
  started = true;
  initOffscreen();
  const panels = [...document.querySelectorAll<HTMLElement>('[data-fx]')];
  if (!panels.length) return;
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  // A: se arma (borde a escala 0) solo si el panel empieza fuera de pantalla.
  const vh = window.innerHeight;
  for (const el of panels) {
    el.classList.add('is-off');
    if (!reduce && el.classList.contains('pb-draw') && el.getBoundingClientRect().top > vh * 0.9) el.classList.add('pb-arm');
  }
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        const el = e.target as HTMLElement;
        el.classList.toggle('is-off', !e.isIntersecting);
        if (e.isIntersecting && e.intersectionRatio > 0.15 && !el.hasAttribute('data-drawn')) {
          el.classList.add('is-in');
          el.setAttribute('data-drawn', '');
        }
      }
    },
    { threshold: [0, 0.15] },
  );
  for (const el of panels) io.observe(el);

  // C: sin cursor (táctil) no se registra nada.
  if (reduce || !matchMedia('(hover: hover)').matches) return;
  let px = 0;
  let py = 0;
  let target: HTMLElement | null = null;
  let raf = 0;
  const apply = () => {
    raf = 0;
    if (!target) return;
    const r = target.getBoundingClientRect();
    target.style.setProperty('--gx', `${Math.round(px - r.left)}px`);
    target.style.setProperty('--gy', `${Math.round(py - r.top)}px`);
    target.dataset['edge'] = nearestEdge({ x: px, y: py }, r);
  };
  onPointer((x, y, evTarget) => {
    px = x;
    py = y;
    const t = evTarget instanceof Element ? evTarget.closest<HTMLElement>('[data-fx]') : null;
    if (target && target !== t) delete target.dataset['edge'];
    target = t;
    if (!raf) raf = requestAnimationFrame(apply);
  });
}
