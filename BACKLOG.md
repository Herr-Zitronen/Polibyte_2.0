# Backlog · PoliByte web

Formato: cada historia tiene criterios de aceptación en Dado / Cuando / Entonces. **Cada criterio se convierte primero en una prueba que falla** (rojo), luego se implementa (verde) y se refactoriza.
Prueba sugerida por criterio: **[U]** unitaria (Vitest) · **[E]** extremo a extremo (Playwright) · **[V]** visual (captura Playwright) · **[A]** accesibilidad (axe) · **[P]** rendimiento (Lighthouse CI).

Estimación en puntos (1, 2, 3, 5, 8). Sprints de 1 semana.

---

## Épica 0 · Base del proyecto

**H0.1 · Proyecto y CI** (3)
- Dado un repositorio nuevo, cuando corro `npm run check`, entonces pasan tipos (TS estricto), lint y pruebas. [E]
- Dado un PR, cuando se abre, entonces CI ejecuta Vitest, Playwright (1440, 1000, 390 px), axe y Lighthouse, y publica un preview en Cloudflare. [E]

**H0.2 · Presupuestos de rendimiento** (2)
- Dado el build, cuando corre Lighthouse CI en Inicio, entonces LCP < 2.0s, CLS < 0.05 y rendimiento ≥ 90; si no, el build falla. [P]

---

## Épica 1 · Sistema de diseño

**H1.1 · Tokens y fuentes** (2)
- Dado el CSS global, entonces existen todos los tokens de color y la escala de `DESIGN.md §2`. [U]
- Dado cualquier página, cuando carga, entonces solo se piden JetBrains Mono 300–800, Silkscreen 400/700 e Instrument Sans 600 con `text=PoliByte`. [E]

**H1.2 · Botones** (2)
- Dado un botón primario, entonces la caja blanca nunca sobresale de su marco en 1440, 1000 y 390 px. [V]
- Dado un primario y un secundario lado a lado, entonces tienen la misma altura. [V]
- Dado un botón sobre una sección clara, entonces se renderiza invertido. [V]

**H1.3 · Etiquetas y estados** (2)
- Dado un estado "Próximo", entonces el texto queda centrado y el punto no lo desplaza. [V]
- Dado un par conectado en ≤520 px, entonces la línea de unión no se muestra. [V]

**H1.4 · Franja de píxeles** (3)
- Dada una semilla, cuando genero el trazado, entonces el resultado es siempre el mismo. [U]
- Dado el SVG generado, entonces contiene solo dos colores: el de la sección de arriba y el de abajo. [U]
- Dadas dos secciones contiguas, entonces no hay costura visible entre la franja y las secciones. [V]

**H1.5 · Fondos de vidrio** (3)
- Dada una sección con imagen, entonces tiene exactamente una capa de grano y está sobre el contenido. [E]
- Dado el paralaje, cuando hago scroll, entonces solo cambian `transform` (sin repintado del fondo). [P]

**H1.6 · Cruces, líneas vivas y paneles** (5)
- Dado un panel fuera de pantalla, cuando entra, entonces su borde se dibuja desde las esquinas. [E]
- Dado un panel fuera de pantalla, entonces sus animaciones infinitas están pausadas. [E]
- Dado un dispositivo táctil, entonces no se registra el listener de cursor. [E]

---

## Épica 2 · Estructura global

**H2.1 · Barra superior** (5)
- Dada cualquier página en escritorio, entonces 01–03 quedan centrados y "04 unirme" a la derecha, y su posición no cambia entre páginas. [V]
- Dada una sección clara bajo la barra, cuando hago scroll sobre ella, entonces la barra cambia a tema claro. [E]
- Dado el blur progresivo, entonces ningún ancestro tiene `view-transition-name`. [U/E]
- Dada la barra, entonces no empuja el contenido (sin espacio extra arriba). [V]

**H2.2 · Menú móvil** (3)
- Dado ≤820 px, entonces la barra es una sola fila con logo, "unirme" y menú. [V]
- Cuando abro el menú, entonces aparece la hoja con los cuatro enlaces y `aria-expanded="true"`. [E][A]
- Cuando elijo un enlace, entonces la hoja se cierra. [E]

**H2.3 · Pie de página** (2)
- Dado el wordmark, entonces se pinta en tono sólido y no se ve el cruce entre "y" y "t". [V]
- Cuando paso el mouse sobre el wordmark, entonces la linterna ilumina las letras bajo el cursor. [E]

**H2.4 · Scroll suave y transiciones** (3)
- Dado un navegador con soporte, cuando navego entre páginas, entonces la barra no parpadea y el subrayado se desliza. [E]
- Dado "Imagine Cup" en Inicio, cuando abro su detalle, entonces el título viaja al encabezado. [E]
- Dado `prefers-reduced-motion`, entonces no hay scroll con inercia ni transiciones, y todo el contenido es visible. [E][V]

---

## Épica 3 · Contenido

**H3.1 · Colecciones y esquemas** (3)
- Dado un evento sin fecha, cuando valido, entonces es válido y su estado es "Por confirmar". [U]
- Dado un proyecto sin evento existente, cuando construyo, entonces el build falla con un error claro. [U]

**H3.2 · Reglas de eventos** (3)
- `eventStatus`, `nextEvent`, `lastConcluded`, `typeLine`, `countdown`, `toBinary8`, `progressCells`, `groupByYear` cumplen la tabla de `CONTENT_MODEL.md`. [U]
- Dado `countdown` con fecha pasada, entonces devuelve ceros, nunca negativos. [U]

---

## Épica 4 · Inicio

**H4.1 · Portada** (5)
- Dado el titular, cuando carga, entonces las letras se decodifican y terminan en el texto real; el `h1` tiene `aria-label` completo. [E][A]
- Cuando hago scroll, entonces el marco se abre y el titular se aleja. [V]

**H4.2 · Panel del próximo evento** (5)
- Dado el próximo evento a 27 días y 20 horas, entonces se muestran "27 : 20", el binario `00011011` y "Days in code: 27". [U][E]
- Dado que no hay próximo evento, entonces el panel no se muestra. [E]
- Cuando el panel sale por arriba, entonces aparece el chip en la barra (solo ≥1180 px). [E]

**H4.3 · Qué hacemos y "software"** (2)
- Cuando hago scroll, entonces "soft" y "ware" se unen en el centro, quedan detrás de los píxeles azules y se leen. [V]

**H4.4 · Próximos eventos** (3)
- Dados los eventos, entonces se listan los próximos (máx. 4) con su tipo, fecha y estado. [E]
- Cuando elijo una fila, entonces el detalle de la izquierda cambia con `aria-live`. [E][A]
- Dados 961–1200 px, entonces las columnas no se encimen y la fecha va bajo el nombre. [V]

---

## Épica 5 · Eventos

**H5.1 · Último evento concluido** (3)
- Dado el evento pasado más reciente, entonces encabeza la página con sus cifras. [E]

**H5.2 · Vitrina de proyectos** (5)
- Dado un evento con `showcase: hidden`, entonces no aparece la sección ni el botón "Ver proyectos", y el botón principal dice "Ver calendario". [E]
- Dado `showcase: published` con proyectos destacados, entonces aparece el panel grande, dos tarjetas y el resto en filas. [E]
- Cuando cambio Escritorio/Móvil en el panel grande, entonces cambia la captura. [E]

**H5.3 · Calendario con filtros** (3)
- Cuando filtro por "Competencias", entonces solo se ven competencias; si no hay, se muestra el mensaje vacío. [E]

**H5.4 · Archivo** (2)
- Dados eventos de varios años, entonces se agrupan por año descendente. [U][E]

---

## Épica 6 · Detalle de evento

**H6.1 · Plantilla** (5)
- Dado un evento, entonces su página muestra ruta, tipo, título, fecha/lugar/modalidad, cuenta regresiva, datos clave, cronograma e inscripción. [E]
- Dado un evento pasado, entonces la cuenta regresiva se reemplaza por "Realizado" y no se muestra inscripción. [E]

---

## Épica 7 · Equipo

**H7.1 · Directiva** (3)
- Entonces se muestran 3 cargos arriba y 2 abajo centrados, todos del mismo tamaño. [V]
- Dado un miembro sin foto, entonces se muestran sus iniciales en pixel art. [E]
- Entonces Instagram, LinkedIn y GitHub se ven como enlaces simples iguales. [V]

**H7.2 · Tutor** (1)

---

## Épica 8 · Unirme

**H8.1 · Formulario** (2)
- Cuando pulso "Llenar formulario de ingreso", entonces se abre la URL de `site.joinFormUrl` en otra pestaña con `rel="noopener noreferrer"`. [E]
- Entonces todos los "unirme" del sitio llevan a esta página. [E]

---

## Épica 9 · SEO y marca

**H9.1 · Metadatos** (2) — título y descripción por página, OG 1200×630, favicon (ico, svg, png 180/192/512), `sitemap.xml`. [E]
**H9.2 · 404** (1) — URL inexistente devuelve 404 con la página de diseño. [E]

---

## Épica 10 · Pulido tras el prototipo (F1–F16), validación (V1) y lanzamiento (L1)

Historias que salieron de revisar el sitio contra el prototipo y en equipos reales. Issue de Linear entre paréntesis (proyecto P-WOR-3).

**V1 · Validación contra el prototipo** (WOR-86, hecha) — Dado el sitio construido, cuando se compara cada página con `design/*.dc.html` a 1440/1000/390, entonces cada diferencia queda corregida o registrada como historia F. [V][E]

**F1 · "Abierto a todos" y enlace al calendario** (WOR-87, hecha) — La sección de cierre de Inicio y su botón llevan a `/eventos/#calendario`. [E]
**F2 · Portada de Equipo** (WOR-88, hecha) — Portada como en el prototipo. [V]
**F3 · Años del archivo dentro de su columna** (WOR-89, hecha) — Ningún año se sale de su columna en los tres anchos. [V]
**F4 · Titular sin letras perdidas** (WOR-90, hecha) — Si `requestAnimationFrame` se detiene, el titular se fija igual (respaldo de 3 s, `data-settled`). [E]
**F5 · Fluidez y carga de Inicio** (WOR-91, hecha) — LCP de diagnóstico ≤ 1.8 s; barridos infinitos esperan al titular y se pausan fuera de pantalla. [P][E]
**F6 · Capturas base de Linux** (WOR-92, hecha) — Las capturas base se generan en CI y se confirman aparte (sin disparar otra corrida). [V]
**F7 · Líneas del hero siguen al cursor** (WOR-93) — Con cursor, el marco se corre ±8/±6 px (`lineOffset`) con transición de 0.9 s; en táctil o con movimiento reducido, nada. [U][E]
**F8 · Barra sin blur** (WOR-94, revertida) — Se probó y se revirtió: la barra conserva su blur progresivo de 8 px. [E]
**F9 · Iconos faltantes** (WOR-95) — Chip de 34×34 en "Directiva" y "Proyectos destacados"; terminal en "Ver eventos". [E]
**F10 · Hover por letra del titular** (WOR-96) — Sube 2 px y aparece una copia clara por opacidad; sin `font-weight`. [U][E]
**F11 · Títulos de pestaña** (WOR-97) — «Sección · PoliByte» (`pageTitle()`), también en `og:title`. [U][E]
**F12 · Rendimiento del scroll en PC** (WOR-98) — Una sola capa de grano fija; hero que se oculta fuera de pantalla; diagnóstico manual `perf-diag.yml`. Meta: desktop-1440 ≥ 50 FPS y ≤ 18 % de cuadros perdidos; laptop-1000 ≥ 55 FPS. [P]
**F13 · Menú móvil sin blur** (WOR-99) — Fondo sólido `rgba(15,26,77,.94)` con grano; enlaces escalonados. [E]
**F14 · Backlog y diseño al día** (WOR-100) — Este documento incluye F1–F16, V1 y los criterios de L1; `DESIGN.md` describe el estado real. [revisión]
**F15 · Estados vacíos, vitrina y táctil** (WOR-102) — La vitrina nunca sale vacía ni a medias; calendario, Equipo y detalle sin contenido no muestran huecos; áreas táctiles ≥ 44 px; sin scroll horizontal a 390 px. [U][E]
**F16 · Fluidez del scroll y Lenis** (WOR-103) — Dado Inicio, cuando se hace scroll rápido de principio a fin y de vuelta, entonces no hay tirones ni zonas que tarden en dibujarse: Lenis da la inercia en escritorio con su rAF solo en movimiento, ninguna hoja usa `content-visibility`, el hero no se oculta ni suelta sus animaciones de scroll al salir de pantalla, las animaciones de entrada se sueltan al terminar (`data-drawn`), el blur de la barra se apaga por opacidad, la especulación es `conservative`, el marco tiene 7 animaciones de scroll (mismo dibujo en 0/40/90 % del recorrido) y el cubo iso gira de −62° a −12° con `--pb-cal`. El panel `?diag` permite medir cada ingrediente en un PC con gráfica. [U][E][V][P]

**F17 · Escudo ESPOCH en la barra** — Dada cualquier página, cuando se mira la barra, entonces la marca es escudo de la ESPOCH │ isotipo de PoliByte + nombre: mismo alto (33 px), centros alineados (±1 px), huecos iguales a ambos lados de la línea (±1 px), el escudo no es enlace (`role="img"`, «ESPOCH») ni muestra la palabra, cambia de color con el tema de la barra y la barra no desborda a 390 px. [U][E][V][A]

**F18 · Pantalla de entrada de Inicio** (WOR-103) — Dada la primera página de una visita, cuando es Inicio, entonces el isotipo se ensambla en píxeles y una franja barre hacia arriba en 1.2–1.8 s; se salta con un clic o una tecla, no aparece con movimiento reducido ni se repite al navegar, no hace peticiones, sale del DOM al terminar y el presupuesto de LCP de Lighthouse sigue en verde. [U][E][P]

**L1 · Lanzamiento** (WOR-85) — Criterios:
- **Accesibilidad completa:** dado cualquier ruta pública (Inicio, Eventos, cada detalle, Equipo, Unirme, 404) a 1440/1000/390, cuando corre axe (WCAG 2.2 AA), entonces no hay violaciones; tampoco con el menú móvil abierto. Con teclado, el foco siempre se ve (2 px) y el Tab sigue el orden del documento, sin `tabindex` positivo. [A][E] (`e2e/a11y.spec.ts`)
- **Presupuestos:** Lighthouse CI sobre Inicio, Eventos, un detalle, Equipo y Unirme cumple LCP < 2.2 s (temporal, WOR-101), CLS < 0.05, rendimiento ≥ 0.9 y accesibilidad ≥ 0.95. JS por página < 20 KB. [P]
- **Contenido real:** hacia `main`, `tests/content-ready.test.ts` (`CONTENT_READY=1`) falla si quedan `[Contenido de ejemplo]`, `[Nombre`, `[Proyecto`, `[Equipo`, `[Integrante`, `example.com` o el formulario sin ruta, o si el pie no tiene ningún enlace. [U]
- **Dominio:** `SITE_URL` (variable del repositorio) alimenta canónicas, Open Graph y el sitemap; la ruta del dominio está en `wrangler.jsonc`. [E] (`seo.spec.ts`)
- **Contenido editable sin código:** pie, periodo, formulario y redes salen de `src/content/site.json`; la guía está en `docs/CONTENIDO.md`.

---

## Plan de sprints sugerido (1 semana cada uno)

| Sprint | Objetivo | Historias |
|---|---|---|
| 1 | Base + sistema de diseño | H0.1, H0.2, H1.1, H1.2, H1.3 |
| 2 | Estructura global + contenido | H1.4, H1.5, H2.1, H2.2, H3.1, H3.2 |
| 3 | Inicio | H1.6, H4.1–H4.4, H2.3 |
| 4 | Eventos + detalle | H5.1–H5.4, H6.1 |
| 5 | Equipo, Unirme, SEO | H7.1, H7.2, H8.1, H9.1, H9.2 |
| 6 | Pulido y lanzamiento | H2.4, V1, F1–F16, L1 |

Definición de terminado: pruebas en verde en CI, captura visual aprobada en los tres anchos, axe sin violaciones, presupuesto de Lighthouse cumplido, PR revisado.
