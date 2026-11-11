// Paneles y efectos: UN IntersectionObserver y UN listener de cursor para todos (DESIGN §3.5).
import { lineOffset, reedOffset, type Pointer } from '../lib/line-parallax';
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

/** F5/F12: el hero y las líneas vivas pausan lo infinito fuera de pantalla. El hero no se oculta ni suelta
 *  sus animaciones de scroll (perf/fluidez-real). Medio viewport de margen: el cambio ocurre lejos de donde
 *  se mira y los barridos ya corren antes de asomar. */
function initOffscreen(): void {
  const toggle: IntersectionObserverCallback = (entries) => {
    for (const e of entries) e.target.classList.toggle('is-off', !e.isIntersecting);
  };
  const hero = document.querySelector<HTMLElement>('.pb-hero');
  if (hero) new IntersectionObserver(toggle, { rootMargin: '50% 0px' }).observe(hero);
  const live = document.querySelectorAll<HTMLElement>('.pb-hl, .pb-vl');
  if (live.length) {
    const liveIo = new IntersectionObserver(toggle);
    live.forEach((el) => liveIo.observe(el));
  }
}

/** F7 (WOR-93) + vidrio: el marco de líneas del hero (.pb-mouse) y el vidrio acanalado (.pb-reed) siguen al
 *  cursor. Solo con cursor y sin movimiento reducido; solo se escriben los que están en pantalla, una vez por
 *  cuadro, y solo `transform` (la transición CSS hace el resto). */
function initFollow(): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || !matchMedia('(hover: hover)').matches) return;
  const els = [...document.querySelectorAll<HTMLElement>('.pb-mouse, .pb-reed')];
  if (!els.length) return;
  const visible = new Set<HTMLElement>();
  let pointer: Pointer | null = null;
  let raf = 0;
  const apply = () => {
    raf = 0;
    const view = { w: window.innerWidth, h: window.innerHeight };
    const line = lineOffset(pointer, view);
    const reed = reedOffset(pointer, view);
    for (const el of visible)
      el.style.transform = el.classList.contains('pb-mouse') ? `translate3d(${line.x}px, ${line.y}px, 0)` : `translate3d(${reed}px, 0, 0)`;
  };
  const schedule = () => {
    if (!raf) raf = requestAnimationFrame(apply);
  };
  const io = new IntersectionObserver((entries) => {
    for (const e of entries) {
      const el = e.target as HTMLElement;
      if (e.isIntersecting) visible.add(el);
      else visible.delete(el);
    }
    schedule();
  });
  els.forEach((el) => io.observe(el));
  onPointer((x, y) => {
    pointer = { x, y };
    schedule();
  });
  // El cursor sale de la ventana: todo vuelve a reposo.
  document.documentElement.addEventListener('pointerleave', () => {
    pointer = null;
    schedule();
  });
}

/** Arranca una sola vez por página (Base.astro). */
export function initFx(): void {
  if (started) return;
  started = true;
  initOffscreen();
  initFollow();
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
