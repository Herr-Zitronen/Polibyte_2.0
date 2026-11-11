// F11 (WOR-97) · Título de pestaña (también alimenta og:title y twitter:title en Seo.astro).
// Formato decidido por Joel: «Sección · PoliByte», de lo más específico a lo más general, para que en una
// pestaña estrecha se lea primero dónde estás. El prototipo usaba «PoliByte · Sección»; manda DESIGN.md.

const BRAND = 'PoliByte';

/** Inicio: sin sección, con el nombre completo del club. */
export const HOME_TITLE = `${BRAND} · Club de la Carrera de Software`;

/** `pageTitle('Imagine Cup', 'Eventos')` → «Imagine Cup · Eventos · PoliByte». */
export function pageTitle(...sections: string[]): string {
  const parts = sections.map((s) => s.trim()).filter(Boolean);
  return parts.length ? [...parts, BRAND].join(' · ') : HOME_TITLE;
}
