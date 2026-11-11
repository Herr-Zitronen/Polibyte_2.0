# CLAUDE.md · PoliByte web

Sitio del club **PoliByte · Club de la Carrera de Software** (ESPOCH). Copia este archivo a la raíz del repositorio.

## Fuentes de verdad
- `DESIGN.md`: tokens, componentes, movimiento, accesibilidad, rendimiento. **Léelo antes de cualquier tarea de UI.**
- `CONTENT_MODEL.md`: esquemas y reglas de datos.
- `BACKLOG.md`: historias con criterios de aceptación. Trabaja una historia por rama/PR.
- `design/*.dc.html`: prototipo de referencia (marcado, CSS y lógica). Ábrelo en el navegador desde la carpeta `design/`. Copia de ahí estilos y comportamiento, no la estructura del formato `.dc.html`.
- `design/screens/`: capturas de referencia a 1440, 1000 y 390 px (con movimiento reducido y fuentes de respaldo; pueden variar unos píxeles).

## Stack
- Astro + TypeScript estricto, CSS propio (sin framework de UI). Islas solo donde haya interacción (filtros, menú, conmutador de vitrina, cuenta regresiva).
- Content collections + Zod para eventos, proyectos y miembros.
- Lenis para el scroll con inercia, solo en escritorio y con su rAF solo en movimiento (ver `DESIGN.md §4`). View Transitions nativas (`@view-transition`).
- Despliegue en Cloudflare (Workers con assets estáticos), con previews por rama.
- Pruebas: Vitest (unitarias), Playwright (E2E y capturas a 1440/1000/390), @axe-core/playwright, Lighthouse CI.

## Comandos (a definir en H0.1)
- `npm run dev` · `npm run build` · `npm run test` (Vitest) · `npm run e2e` (Playwright) · `npm run check` (tipos + lint + pruebas)

## Forma de trabajo: TDD obligatorio
1. Toma una historia de `BACKLOG.md`.
2. Escribe primero las pruebas de sus criterios de aceptación y confírmalas en **rojo**.
3. Implementa lo mínimo para ponerlas en **verde**.
4. Refactoriza con las pruebas en verde.
5. Abre PR con: historia, pruebas añadidas, capturas de los tres anchos.
Nunca marques una historia como terminada sin pruebas en verde.

## Reglas de diseño que no se negocian
- Solo dos botones (primario y secundario). Nunca estirados a ancho completo en escritorio.
- Una sola capa de grano por página, fija, encima del contenido y bajo la barra (`Base.astro`). Ninguna sección pinta la suya (solo el menú móvil, que vive en la top layer).
- Contenedores de animaciones de scroll: `overflow: clip`, nunca `hidden`. Secciones con `display: flow-root`.
- Ningún ancestro de un `backdrop-filter` puede tener `view-transition-name`.
- Solo se animan `transform` y `opacity`. Nunca `filter`/`backdrop-filter`.
- `prefers-reduced-motion` va al final del CSS y deja todo visible y quieto.
- Layouts de dos columnas nunca se parten por falta de espacio: se apilan en un punto de quiebre explícito.
- Amarillo `#F2E0A0` solo en acentos listados en `DESIGN.md §2.1`.
- Tipos de evento: solo "Del club" y "Competencia"; el aliado es un dato.
- La vitrina de proyectos de un evento solo aparece con `showcase: "published"`.

## Convenciones
- Código y nombres en inglés; contenido y textos de interfaz en español.
- Componentes en `src/components/` (un archivo por componente), lógica pura en `src/lib/` con su prueba al lado (`*.test.ts`).
- Commits convencionales (`feat:`, `fix:`, `test:`, `refactor:`).
