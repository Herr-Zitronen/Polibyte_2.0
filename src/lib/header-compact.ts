// F8 · La barra se compacta (solo baja la opacidad del tinte) al bajar 24 px de scroll.
// Función pura: la decisión se toma aquí y el DOM solo se escribe cuando cambia.
export const COMPACT_AT = 24;

export function isCompact(scrollY: number): boolean {
  return scrollY >= COMPACT_AT;
}
