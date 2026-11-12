// Fuente de píxeles 5×5 para las iniciales de la directiva (H7.1). Solo A–Z.
export const GLYPH_W = 5;
export const GLYPH_H = 5;

const G: Record<string, string> = {
  A: "01110 10001 11111 10001 10001",
  B: "11110 10001 11110 10001 11110",
  C: "01111 10000 10000 10000 01111",
  D: "11110 10001 10001 10001 11110",
  E: "11111 10000 11110 10000 11111",
  F: "11111 10000 11110 10000 10000",
  G: "01111 10000 10011 10001 01111",
  H: "10001 10001 11111 10001 10001",
  I: "11111 00100 00100 00100 11111",
  J: "00111 00001 00001 10001 01110",
  K: "10001 10010 11100 10010 10001",
  L: "10000 10000 10000 10000 11111",
  M: "10001 11011 10101 10001 10001",
  N: "10001 11001 10101 10011 10001",
  O: "01110 10001 10001 10001 01110",
  P: "11110 10001 11110 10000 10000",
  Q: "01110 10001 10101 10010 01101",
  R: "11110 10001 11110 10010 10001",
  S: "01111 10000 01110 00001 11110",
  T: "11111 00100 00100 00100 00100",
  U: "10001 10001 10001 10001 01110",
  V: "10001 10001 10001 01010 00100",
  W: "10001 10001 10101 11011 10001",
  X: "10001 01010 00100 01010 10001",
  Y: "10001 01010 00100 00100 00100",
  Z: "11111 00010 00100 01000 11111",
};
const BLANK = Array<string>(GLYPH_H).fill("0".repeat(GLYPH_W));

export function glyph(ch: string): string[] {
  return G[ch]?.split(" ") ?? BLANK;
}

export type PixelText = {
  width: number;
  height: number;
  cells: { x: number; y: number }[];
};

/** Celdas encendidas del texto, con una columna de separación entre letras. */
export function pixelText(text: string): PixelText {
  const chars = [...text];
  const cells: PixelText["cells"] = [];
  chars.forEach((ch, i) => {
    const ox = i * (GLYPH_W + 1);
    glyph(ch).forEach((row, y) =>
      [...row].forEach((bit, x) => bit === "1" && cells.push({ x: ox + x, y })),
    );
  });
  return {
    width: Math.max(0, chars.length * (GLYPH_W + 1) - 1),
    height: GLYPH_H,
    cells,
  };
}
