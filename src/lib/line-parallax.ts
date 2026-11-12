// F7 (WOR-93) · Cuánto se corren las líneas del hero y el vidrio acanalado según el cursor
// (design/Main.dc.html: dx·−16 / dy·−12 para las líneas, dx·−7 para el vidrio; dx, dy ∈ [−0.5, 0.5]).

export interface Pointer {
  x: number;
  y: number;
}

export interface Viewport {
  w: number;
  h: number;
}

/** Redondea a 2 decimales y evita −0 (no ensucia el transform ni las comparaciones). */
const r2 = (n: number): number => Math.round(n * 100) / 100 || 0;

/** Posición relativa al centro, en [−0.5, 0.5]; sin tamaño o sin cursor → 0. */
const rel = (v: number, size: number): number => (size > 0 ? v / size - 0.5 : 0);

/** Marco de líneas del hero: en sentido contrario al cursor, hasta ±8 px en X y ±6 px en Y. */
export function lineOffset(p: Pointer | null, view: Viewport): Pointer {
  if (!p) return { x: 0, y: 0 };
  return { x: r2(rel(p.x, view.w) * -16), y: r2(rel(p.y, view.h) * -12) };
}

/** Vidrio acanalado: solo en X, hasta ±3.5 px. */
export function reedOffset(p: Pointer | null, view: Viewport): number {
  if (!p) return 0;
  return r2(rel(p.x, view.w) * -7);
}
