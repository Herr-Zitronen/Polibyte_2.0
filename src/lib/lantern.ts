// Coordenadas de la linterna del pie (DESIGN §3.10): cursor → px locales del wordmark.
export interface Point {
  x: number;
  y: number;
}

export function lanternPoint(p: Point, rect: { left: number; top: number }): Point {
  return { x: Math.round(p.x - rect.left), y: Math.round(p.y - rect.top) };
}
