export type Edge = 'top' | 'right' | 'bottom' | 'left';

export interface Point {
  x: number;
  y: number;
}

export interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

/** Lado del rectángulo más cercano al punto (variante C de los paneles: se enciende ese tramo). Distancia al segmento, no a la recta. */
export function nearestEdge(p: Point, r: Box): Edge {
  const right = r.left + r.width;
  const bottom = r.top + r.height;
  const cx = clamp(p.x, r.left, right);
  const cy = clamp(p.y, r.top, bottom);
  const d: [Edge, number][] = [
    ['top', Math.hypot(p.x - cx, p.y - r.top)],
    ['right', Math.hypot(p.x - right, p.y - cy)],
    ['bottom', Math.hypot(p.x - cx, p.y - bottom)],
    ['left', Math.hypot(p.x - r.left, p.y - cy)],
  ];
  return d.reduce((a, b) => (b[1] < a[1] ? b : a))[0];
}
