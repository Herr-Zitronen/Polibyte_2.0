# Fluidez del scroll en Inicio · informe

Rama `perf/fluidez-real` (WOR-103, WOR-98, WOR-104). Resultado: en el PC de Joel, con GPU y Chrome, el scroll se siente claramente más fluido que antes de la rama.

## 1. Punto de partida

Después de `perf/scroll-fino` (sin Lenis) seguían tres síntomas en un PC con gráfica:

- Tirones en Inicio, sobre todo en «01 club» y en las líneas de la portada.
- Al bajar mucho y volver, a veces una zona tardaba en dibujarse.
- Faltaba la inercia de Lenis.

Las mediciones anteriores se habían hecho en GitHub Actions, que rasteriza por software (sin GPU). Servían para comparar variantes entre sí, pero no describían cómo se siente un PC real. Por eso esta rama empezó leyendo el código con esa pregunta: qué obliga al navegador a rehacer trabajo mientras se hace scroll.

## 2. Diagnóstico

| Síntoma | Causa | Evidencia en el código |
|---|---|---|
| Zonas que tardan en dibujarse al volver | `content-visibility: auto` en 10 secciones | El navegador deja de dibujar la sección al salir de pantalla y la vuelve a maquetar, pintar y rasterizar al regresar: hueco en blanco y un cuadro largo en cada reentrada |
| Líneas de la portada que aparecen tarde | `.is-off` ocultaba el marco con `visibility` | Solo se mostraba cuando llegaba el aviso del `IntersectionObserver` |
| Pico de cuadro al salir de la portada | El blur de la barra se creaba y destruía de golpe | `data-blur` pasaba de `visibility: hidden` a visible justo en la zona de las líneas |
| CPU y GPU robadas durante el scroll | Reglas de especulación `moderate` | Pre-renderizaban una página completa si el cursor quedaba 200 ms sobre un enlace, también con la rueda |
| Capas que ya no hacían falta | Animaciones `forwards` de la entrada | 12 líneas, 4 verticales y el subtítulo seguían «vivos» tras terminar (unas 70 capas) |
| Capa creada y destruida bajo el cursor | `will-change` ligado a `:hover` de la portada | Cambiaba mientras el contenido pasaba bajo el puntero |

Lo que **no** era: todas las `@keyframes` animan solo `transform` y `opacity`, así que no había animaciones que repintaran.

## 3. Cambios

### 3.1 Lenis, más ligero

- Vuelve `src/scripts/lenis.ts` (solo escritorio; no se carga en táctil ni con movimiento reducido; se pausa al salir de la página).
- Mejora: el bucle de `requestAnimationFrame` ya no corre en reposo. Nuevo `src/lib/on-demand-loop.ts` con su prueba. Arranca con rueda, tecla, puntero, clic, scroll o resize y se detiene cuando `lenis.isScrolling` deja de ser `smooth`. Antes forzaba un cuadro del hilo principal en cada refresco aunque nada se moviera.
- Se quitó `scroll-behavior: smooth` de `global.css`: chocaba con Lenis, que ya suaviza los saltos a anclas.
- La excepción de Lenis vuelve al presupuesto de JS (`src/lib/js-budget.ts`).

### 3.2 Arreglos que no cambian el dibujo

| Cambio | Archivo | Efecto |
|---|---|---|
| Sin `content-visibility` ni `contain-intrinsic-size` | 10 hojas de `src/styles/` | Se maqueta todo una vez; sin huecos al volver |
| `.is-off` ya no oculta nada | `hero.css`, `fx.ts` | Solo pausa barridos y nodos infinitos |
| `data-drawn` suelta las animaciones `forwards` al terminar la entrada | `hero.css`, `decode.ts` | Misma imagen, sin capas vivas durante el scroll |
| Sin `will-change` en `:hover` | `hero.css` | El `translate3d` en línea de `fx.ts` ya mantiene la capa |
| Blur de la barra apagado con `opacity: 0` | `header.css` | La capa existe siempre; no hay pico al cruzar la portada |
| Especulación `conservative` | `Base.astro` | Se pre-renderiza al pulsar, no al pasar el cursor |

### 3.3 Panel de diagnóstico `?diag`

- Catálogo único de variantes en `src/lib/perf-variants.ts`, compartido por el panel y por `e2e/home-smoothness.spec.ts`.
- `src/scripts/diag.ts` se importa dinámicamente solo si la URL lleva `?diag`: nadie más descarga nada.
- Diez casillas (`sin-lenis`, `sin-barridos`, `sin-nodos`, `sin-paralaje`, `sin-backdrop-filter`, `blur-siempre`, `sin-scroll-timelines`, `sin-reveals`, `sin-cubo`, `lineas-estaticas`) y un medidor: FPS, peor cuadro y % de cuadros de más de 20 ms.
- Guía de uso en `docs/SESSIONS.md`: `npm run build && npm run preview`, nunca `npm run dev`; comprobar `chrome://gpu`.

### 3.4 Escudo de la ESPOCH en la barra (F17, WOR-104)

- Solo el escudo y el libro de `assets/brand/espoch.png`, vectorizados con potrace desde un script fuera del repositorio. Un trazo de 2.7 KB en `currentColor`: cambia con el tema de la barra.
- `Logo.astro`: escudo, línea de 1 px, isotipo y nombre. El escudo no es enlace (`role="img"`, `aria-label="ESPOCH"`).
- Mismo alto que el isotipo (33 px) y 1 px más abajo por centrado óptico.

### 3.5 Pantalla de entrada (F18)

- Elegida entre cuatro opciones: ensamblaje del isotipo con los píxeles de la franja, salida hacia arriba.
- Tapa el primer segundo de calentamiento (decodificar el nevado, fuentes, capas de la portada). No arregla el scroll.
- 1.2–1.8 s, una vez por visita, se salta con clic o tecla, ausente con movimiento reducido, sin peticiones de red, y se elimina del DOM al terminar.
- Debajo, el titular ya está pintado en su sitio: el LCP no se retrasa. Su decodificado arranca cuando la pantalla se retira.

### 3.6 Correcciones tras la primera revisión

- **Blur de la barra:** se apagaba mientras la barra estaba sobre la portada, así que el titular de Equipo o Eventos pasaba bajo la barra sin desenfoque y no se leía. Ahora solo se apaga con la página arriba del todo (primeros 60 px, un centinela con `IntersectionObserver`, sin listener de scroll) y vuelve a encenderse en cuanto hay scroll.
- **Escudo:** parecía más alto que el isotipo aunque sus cajas coincidían; pesa arriba y su libro es muy fino. Bajó 1 px.

## 4. Cómo se verificó

- TDD: pruebas en rojo primero (Vitest), luego implementación. 296 pruebas unitarias en verde; lint y build sin errores.
- Pruebas estructurales en `tests/perf-structure.test.ts`, `tests/intro.test.ts`, `tests/logo.test.ts` y `tests/header-blur.test.ts`: sin `content-visibility`, `.is-off` sin `visibility`, `data-drawn`, sin `will-change` en `:hover`, especulación conservadora, blur por opacidad.
- E2E nuevas escritas (`e2e/intro.spec.ts`, bloque F17 en `e2e/header.spec.ts`, rAF de Lenis en `e2e/transitions.spec.ts`, `data-drawn` en `e2e/home-anim-gating.spec.ts`). Se ejecutan en Actions.
- Prueba en el PC de Joel con el panel `?diag`: el scroll se siente claramente más fluido. No se guardaron cifras de FPS de esa sesión.

## 5. Pendiente

- Ejecutar la suite completa y Lighthouse CI en Actions, en especial el LCP con la pantalla de entrada.
- Dos errores de tipos en `src/pages/lab/calendar-empty.astro` que ya existían antes de esta rama.
- Si en el futuro vuelve algún tirón: abrir `?diag` y aplicar la casilla culpable (plan de arreglo definitivo de las líneas en WOR-103).
