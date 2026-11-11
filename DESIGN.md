# PoliByte · Especificación de diseño

Sitio del club **PoliByte · Club de la Carrera de Software** (ESPOCH, Riobamba).
Este documento es la fuente de verdad visual. Las páginas de `design/` son el prototipo de referencia: cuando este documento y el prototipo no coincidan, manda este documento.

---

## 1. Principios

1. **Vidrio granulado sobre el Chimborazo.** Los fondos son el nevado muy difuminado, casi irreconocible, detrás de un vidrio con grano y estrías. Nunca un color plano en las secciones azules principales.
2. **Líneas, cruces y píxeles.** La estructura se dibuja con líneas finas; donde dos líneas se cruzan hay una cruz (+). Las secciones se separan con franjas de píxeles.
3. **Una sola familia tipográfica.** JetBrains Mono para todo. Silkscreen solo para etiquetas pequeñas, números y detalles en pixel art.
4. **Movimiento que responde, no que distrae.** Nada se mueve solo salvo detalles mínimos (destellos en líneas). El resto responde al scroll o al cursor y se queda quieto cuando el usuario se queda quieto.
5. **Rendimiento antes que efecto.** Solo se animan `transform` y `opacity`. Nunca se anima un desenfoque.

---

## 2. Tokens

### 2.1 Color

| Token | Hex | Uso |
|---|---|---|
| `--pb-navy-950` | `#0D1438` | Pie de página |
| `--pb-navy-900` | `#0F1A4D` | Secciones oscuras (próximos eventos, destacados, directiva) |
| `--pb-ink` | `#13205A` | Texto y líneas sobre fondo claro |
| `--pb-blue-800` | `#1A2C78` | Fondo base del sitio |
| `--pb-blue-750` | `#1B2C78` | Borde inferior sólido de las portadas (une con la franja) |
| `--pb-blue-700` | `#22389C` | Borde superior sólido de secciones con imagen |
| `--pb-blue-500` | `#2D4FC4` | Cobalto |
| `--pb-paper` | `#ECEFF6` | Secciones claras |
| `--pb-white` | `#F2F4FA` | Texto sobre azul |
| `--pb-accent` | `#F2E0A0` | Acento amarillo pastel (escaso; ver reglas) |
| `--pb-accent-strong` | `#E8CF73` | Acento en estado activo |
| `--pb-muted-light` | `#3A4677` | Texto secundario sobre claro |
| `--pb-muted-dark` | `#AEB6D3` | Texto secundario sobre oscuro |
| `--pb-code` | `#CFE3FF` | Binario y detalles de código |
| `--pb-wordmark` | `#252D4F` | Wordmark del pie (tono sobre tono, sólido) |
| `--pb-ghost` | `#D2D7E6` | Palabra "software" sobre papel |

Líneas sobre oscuro: `rgba(242,244,250,.25)` (separadores), `.45` (marcos), `.6`–`.7` (líneas principales).

**Reglas del amarillo:** solo en el punto que pulsa, la etiqueta "Próximo", la barra del evento seleccionado, el número grande del detalle de evento, la celda actual del progreso, los cargos de la directiva y el núcleo del isotipo al pasar el mouse. Nunca en botones ni textos largos. Nunca como color de texto sobre papel.

### 2.2 Tipografía

| Familia | Pesos | Uso |
|---|---|---|
| JetBrains Mono | 300–800 (variable, sin cursiva) | Todo el texto |
| Silkscreen | 400, 700 | Etiquetas pequeñas, fechas en listas, números grandes (cuenta regresiva, cifras, 404), binario |
| Instrument Sans | 600, **solo las letras de "PoliByte"** (`&text=PoliByte`) | Wordmark del pie |

Escala principal:

| Rol | Tamaño | Peso | Tracking | Interlineado |
|---|---|---|---|---|
| Titular portada | `clamp(40px, 6.2vw, 96px)` (34px en ≤820) | 700 | −0.06em | 1 |
| Titular de página | `clamp(46px, 8vw, 128px)` | 800 | −0.075em | 0.94 |
| Título de sección | `clamp(44px, 7vw, 112px)` | 800 | −0.075em | 0.95 |
| Frase destacada | `clamp(26px, 3.4vw, 50px)` | 500 | −0.05em | 1.08 |
| Nombre en lista | `clamp(20px, 2.2vw, 30px)` | 700 | −0.05em | 1.1 |
| Cuerpo | 15–18px | 400 | 0 | 1.6–1.7 |
| Etiqueta (Silkscreen) | 12–15px | 400 | 0 | 1 |

Prohibido: cursiva en titulares; MAYÚSCULAS manuales (Silkscreen ya es de caja alta visual).

### 2.3 Espaciado y layout

- Contenedor: `max-width: 1320px`, padding lateral 32px (16px en ≤820).
- Ritmo vertical de sección: 112–120px arriba/abajo (96px en celular).
- Puntos de quiebre: **1200** (filas de eventos compactas), **1180** (se oculta el chip de la barra), **960** (columnas se apilan, la columna fija deja de serlo, se ocultan cruces que dependen de columnas), **820** (barra móvil, menú en hoja), **520** (botones pueden partir texto, se oculta la línea entre etiquetas), **480** (se oculta el subtítulo del logo), **380** (la directiva pasa a una columna).
- Regla: un layout de dos columnas **nunca** se parte en filas por falta de espacio; se apila solo en un punto de quiebre explícito (lección aprendida con el calendario).

---

## 3. Componentes

### 3.1 Botones (solo dos)

- **Primario** (`.pb-b1`): marco de 1px `rgba(242,244,250,.7)`, radio 6px, padding 4px; dentro, caja blanca `#FFFFFF` con texto `#1A2C78`, radio 3px, padding 14px 22px, 15px/500. Hover: la caja sube 2px.
- **Secundario** (`.pb-b2`): contorno de 1px, radio 6px, padding 18px 26px (misma altura total que el primario). Hover: fondo blanco, texto azul.
- Tamaño pequeño `.sm` para barra y listas.
- Icono opcional antes del texto (`slot="icon"` de `Button.astro`, decorativo con `aria-hidden`): la terminal 18×18 de "Ver eventos" en la portada.
- Títulos de sección pequeños (Próximos eventos, Directiva, Proyectos destacados) llevan delante el chip de 34×34 (`SectionChip.astro`, trazo 1.4 px del color del texto).
- Sobre fondo claro (`.pb-on-light`) se invierten: caja `#13205A` con texto blanco; contorno `rgba(19,32,90,.6)`.
- Nunca se estiran a ancho completo en escritorio. Nunca parten su texto salvo en ≤520px.

### 3.2 Etiquetas

- **Etiqueta** (`.pb-tag`): borde 1px, sin radio. Variante **píldora** (`.pill`) con radio 999px.
- **Par conectado**: etiqueta + línea de 28px + píldora (p. ej. `Competencia —— Microsoft`). En ≤520 la línea desaparece.
- **Estado** (`.pb-st`): píldora de ancho mínimo 136px, texto **siempre centrado**; el punto (si hay) va fijo a 14px del borde izquierdo y no empuja el texto. Estados: `Próximo` (fondo amarillo, texto `#0E1A4A`, con punto), `Realizado` (contorno sólido), `Por confirmar` (contorno punteado).

### 3.3 Tipos de evento

- Solo dos tipos: **Del club** (eventos propios abiertos a la facultad) y **Competencia** (de otras universidades o internacionales).
- Las **alianzas no son categoría**: el aliado es un dato del evento (`Del club · con IEEE CS`).
- Línea de tipo: `{tipo} · {organizador o "con {aliado}"}`.

### 3.4 Cruces y líneas vivas

- Cruz: 25×25px, trazos de 1px, centrada en la intersección. Solo donde hay una intersección real.
- Línea viva: un destello blanco (18% del largo) recorre la línea cada 9s. Se usa en líneas importantes: bajo el título de "Próximos eventos", borde superior de listas, línea vertical del calendario, años del archivo.

### 3.5 Paneles (`.pb-fx`)

Próximo evento, proyecto destacado, datos clave, formulario de ingreso, cuadro "Únete".
- **A. Borde que se dibuja** al entrar en pantalla, lado por lado desde las cruces.
- **B. Pulso por el perímetro** cada 10s; cada cruz se ilumina en amarillo al pasar.
- **C. Luz que sigue al cursor** (solo dispositivos con hover) y el tramo de borde más cercano se enciende.
- Tarjetas secundarias: solo C. Tarjetas de directiva: B solo mientras hay hover.

### 3.6 Filas de eventos

Cursor light (C) en cada fila. La fila seleccionada es un poco más clara, con barra izquierda amarilla de 3px, brillo superior de 1px y un barrido de luz amarilla tenue cada 7s.

### 3.7 Franja de píxeles (divisor de secciones)

- Un **único SVG** por franja (`viewBox 0 0 36 4`, `preserveAspectRatio="none"`, `aspect-ratio: 36/4`), con **exactamente dos colores**: el de la sección de arriba y el de abajo.
- 36 columnas × 4 filas; probabilidad de celda del color inferior por fila: `[0.07, 0.30, 0.62, 0.90]`; las corridas horizontales se fusionan en un solo rectángulo y se solapan 0.04 unidades para evitar costuras.
- Generador pseudoaleatorio con semilla fija (mulberry32) para que el patrón sea estable.
- Las secciones vecinas deben terminar en un **color sólido** exactamente igual al de la franja (las portadas con imagen tienen un degradado a sólido en su borde).
- Variante "palabra detrás": en *Qué hacemos*, la franja vive dentro de la sección con su color superior **transparente**, y la palabra "software" queda detrás de los píxeles azules.

### 3.8 Fondos

- Capas, de atrás hacia adelante: imagen del nevado (lejos) → niebla (cerca) → brillo (`.pb-sheen`) → vidrio acanalado (`.pb-reed`) → degradado a sólido en los bordes. Encima de todo, el grano de página.
- **Una sola capa de grano por página** (`.pb-grain--page` en `Base.astro`): `position: fixed`, opacidad 0.55, `z-index` 10 (sobre el contenido, bajo la barra). Queda quieta respecto a la ventana, como grano de película, y no se rasteriza al hacer scroll (F12: antes había ~15 capas, una por sección y franja, y eran de lo más caro del scroll). Nunca dos granos superpuestos (forman rectángulos visibles); la única excepción es el menú móvil, que vive en la top layer.
- Paralaje: cada capa sobresale solo lo que exige su recorrido (portada: lejos 170 px arriba, cerca 110 px abajo; secciones: ±90/±70 px). En ≤820 px solo se mueve el paralaje de las portadas.
- Imágenes en `assets/backgrounds/` (8–12 KB cada una; la niebla 36 KB con transparencia).

### 3.9 Barra superior

- Fija arriba, de lado a lado, altura 0 en el flujo (no empuja la página).
- Tres columnas: marca | 01 club · 02 eventos · 03 equipo (centrado siempre) | 04 unirme (botón primario pequeño).
- **Marca** (F17): escudo de la ESPOCH │ isotipo de PoliByte + nombre. El escudo (`src/assets/brand/espoch-shield.svg`, solo escudo y libro, sin la palabra) mide lo mismo que el isotipo (33 px de alto), usa `currentColor` y es solo identidad: no es enlace (`role="img"`, `aria-label="ESPOCH"`). Los separa una línea de 1 px × 28 px en `currentColor` al 35 % (blanca sobre azul, tinta sobre papel) con 14 px a cada lado (10 px en ≤ 380). El enlace a Inicio sigue en el bloque de PoliByte.
- Entrada: los tres enlaces y "unirme" bajan 8 px y aparecen escalonados (0.30 / 0.38 / 0.46 / 0.54 s), después de que arranque el titular. Al llegar por una transición de vista no se repite (la barra ya estaba en pantalla).
- Solo en Inicio, al pasar el panel del próximo evento aparece un **chip** a la izquierda de "unirme" (barrido desde la derecha con `scaleX` + opacidad, y dígitos que suben por su ranura). El prototipo usaba una máscara animada (`clip-path`); se cambió porque no va al compositor. Oculto en ≤1180.
- **Blur progresivo**: una capa de 8px con máscara progresiva, 92px de alto, y un tinte. Se apaga solo con la página arriba del todo (primeros 60 px, un centinela con `IntersectionObserver`), donde bajo la barra solo hay el nevado difuminado; en cuanto se hace scroll vuelve a encenderse, porque los titulares de las portadas pasan bajo la barra y sin desenfoque no se lee. Se apaga con `opacity: 0`, nunca con `visibility`/`display`: la capa existe siempre y no se crea ni destruye al cruzar el final de la portada. F8 probó quitar el blur y se revirtió: se queda así. Sobre secciones claras el tinte y el texto cambian a tema claro (botón invertido).
- **Importante:** ningún ancestro del blur puede tener `view-transition-name` (lo convierte en "backdrop root" y el blur deja de verse). El nombre de transición va en la fila de contenido, no en el contenedor.
- Celular (≤820): logo + "unirme" + botón de menú; el menú abre una hoja a pantalla completa con fondo sólido `rgba(15,26,77,.94)` + grano (sin `backdrop-filter`, F13: la hoja tapa toda la pantalla y el desenfoque casi no se veía) y links grandes numerados (01 club · 02 eventos · 03 equipo) que suben escalonados (0.05 / 0.10 / 0.15 s). "Unirme" no se repite en la lista: va en el botón "Quiero unirme" de la hoja.

### 3.10 Pie de página

- Fondo `#0D1438`. Línea `© {periodo} PoliByte · Club de la Carrera de Software`, ESPOCH debajo y, debajo de ESPOCH, el crédito de la foto en 12 px (`Foto del Chimborazo: Go593 · CC BY-SA 4.0`, ver `CREDITS.md`); enlaces a la derecha (Correo · Instagram · GitHub).
- Periodo y enlaces salen de `src/content/site.json` (`period`, `links`): un enlace vacío no se muestra y, sin ninguno, no se pinta el bloque. Las redes abren en otra pestaña; el correo es `mailto:`.
- Wordmark grande en tono sólido `#252D4F` (no transparente: la "y" y la "t" se solapan en el logo y la transparencia marcaría el cruce). Al pasar el mouse, una "linterna" ilumina las letras con un degradado blanco azulado → amarillo, en una capa sólida cuya opacidad (0.75) se aplica al grupo.

### 3.11 Isotipo

En la barra y en la hoja del menú móvil va precedido del escudo de la ESPOCH (§3.9). El escudo no se anima.

Animado por piezas (bits, llaves, núcleo), con pasos secos (`steps`):
- **Carga:** los bits caen, las llaves entran desde los lados y el núcleo parpadea.
- **Hover:** las llaves se abren, los bits saltan y el núcleo se pone amarillo.
- Sin rotar el logo completo.

---

## 4. Movimiento

| Efecto | Disparador | Técnica |
|---|---|---|
| Titular: letras suben por ranura + decodificación con glifos `01<>/{}[]#_=+*;` | Carga | máscara por palabra + **carrete de glifos** encima de cada letra que gira con `transform` + `steps()` (CSS, sin JS por cuadro). El texto real nunca se reescribe (WOR-101); la sombra grande es una copia que aparece por opacidad al terminar |
| Líneas de portada se dibujan, destello recorre, nodos parpadean | Carga / tiempo | `transform: scaleX` y brillo con `transform`; pausa fuera de pantalla |
| Marco de portada se abre en 4 y el titular se aleja | Scroll | `animation-timeline: scroll(root)`: 7 animaciones (titular + 6 grupos). Las líneas verticales cortas del centro viven dentro del grupo con el que viajan (`.pb-cvl`), sin animación propia. Los 6 grupos no se funden en un contenedor por lado: cada uno se mueve distinto (−22vw/−160px, −26vw/0, −12vw + opacidad), así que cada hijo seguiría necesitando su animación y el contenedor sumaría una más |
| Paralaje nevado/niebla | Scroll | `scroll(root)` en portadas, `view()` en secciones |
| Titular: hover por letra | Cursor (solo con hover, tras el decodificado) | la letra sube 2 px y una copia clara `#CFE3FF` aparece por opacidad (F10). El prototipo cambiaba `font-weight` a 300: se descartó porque recalcula el ancho de la palabra y repinta. Tiempos de entrada: los rápidos actuales (LCP), no los del prototipo |
| Vidrio acanalado y líneas siguen al cursor | Cursor | un solo listener + rAF, `transform` directo, solo en elementos visibles. Líneas del hero ±8/±6 px (`lineOffset`, transición 0.9 s); vidrio ±3.5 px en X (`reedOffset`, 1.1 s). Sin `will-change`: el `translate3d` en línea ya mantiene la capa |
| Barra y menú móvil entran escalonados | Carga / abrir | `opacity` + `translateY`, `animation-fill-mode: backwards` (visibles por defecto) |
| Cubo iso del calendario gira | Scroll | línea de tiempo `--pb-cal` de `.pb-calgrid` (`view-timeline-name`), rango `cover 0% → 100%`; `rotateY` de −62° a −12°, pose media (−37°) sin soporte o con movimiento reducido |
| Celdas de progreso se llenan, la actual parpadea; los 8 bits se teclean | Entrada del panel (`.is-in`) | `scaleY` con `steps(2)` escalonado 15 ms por celda; bits con opacidad + `translateY`, 80 ms entre bits; parpadeo pausado fuera de pantalla |
| "soft" + "ware" se unen | Scroll | `view()`, rango `cover 0% → 40%` |
| Apariciones de bloques | Scroll | `view()`, `entry 0% → cover 24%` |
| Scroll con inercia | Rueda | **Lenis** en escritorio (no se carga en táctiles ni con movimiento reducido: ahí el scroll es nativo); se pausa al salir de la página. Su rAF solo corre mientras hay movimiento (`createOnDemandLoop`). Lenis también suaviza los saltos a anclas: `global.css` no pone `scroll-behavior: smooth` |

Curvas: `cubic-bezier(.16,1,.3,1)` (entrada suave), `cubic-bezier(.7,0,.2,1)` (trazos). Pixel art: `steps()`.

**Reglas aprendidas:**
- Contenedores con animaciones de scroll: usar `overflow: clip` (o `overflow-x: clip`), **nunca** `overflow: hidden`. `hidden` crea un contenedor de scroll y congela las animaciones `view()`.
- `overflow: clip` no aísla márgenes: toda sección debe ser `display: flow-root`.
- El bloque de `prefers-reduced-motion` debe ir **al final** del CSS de cada página; si no, los estilos de la página vuelven a ocultar lo que debía mostrarse.
- Fuera de Chrome/Edge (y Safari reciente), las animaciones de scroll no existen: el estado por defecto de cada elemento debe ser su estado final visible.
- **Lenis vuelve, con su coste a la vista** (perf/fluidez-real). Mientras Lenis mueve el scroll con JS, las animaciones `scroll()`/`view()` dependen del hilo principal y cualquier trabajo de JS se nota como tirón. Mitigación: su rAF solo corre en movimiento (en reposo no hay ningún cuadro forzado), no se carga en táctiles ni con movimiento reducido, y nada más hace trabajo por cuadro durante el scroll. Ningún otro script mueve el scroll.
- Un elemento dentro de una columna `sticky` no debe usar su propia `view()`: mientras está pegado su progreso no avanza. Usa la línea de tiempo con nombre de un ancestro que sí cruce la pantalla (`view-timeline-name`), como el cubo iso con `--pb-cal` de `.pb-calgrid`.

### 4.0 Pantalla de entrada (solo Inicio)

Tapa el primer segundo, cuando el navegador decodifica el nevado, carga las fuentes y crea las capas de la portada (quien hacía scroll en ese momento notaba el peor tirón). No arregla el scroll: solo cubre el calentamiento.

- **Dibujo**: fondo `#0F1A4D`; el isotipo se ensambla en una rejilla de 9 × 12 píxeles (los bits caen, las llaves entran por los lados, el núcleo parpadea en amarillo) y debajo se teclean los 8 bits `01010000` (la «P» en ASCII). Sale hacia arriba con el borde de la franja de píxeles (§3.7). Todo con `steps()`, solo `transform` y `opacity`.
- **Duración**: 1.2–1.8 s en total. Espera a fuentes y carga con un mínimo de 0.8 s y un tope de 1.4 s, más 0.4 s de salida (`src/lib/intro.ts`).
- **Una vez por visita** (`sessionStorage`; cualquier página la da por vista). No aparece con movimiento reducido, en páginas pre-renderizadas ni en navegadores automatizados (salvo `?intro`, para su prueba). Se salta con un clic o una tecla.
- **Sin red**: CSS y script en línea, sin imágenes. Queda bajo el grano fijo de la página (no pinta el suyo); la barra espera oculta y entra al terminar.
- **LCP**: debajo, el titular está pintado en su sitio desde el primer cuadro; su decodificado y el resto de la entrada de la portada arrancan cuando la pantalla se retira (`pb:intro-done`).
- Al retirarse se elimina del DOM: no queda ninguna capa viva.

### 4.1 Transiciones entre páginas

View Transitions API nativa (`@view-transition { navigation: auto; }`), sin JS:
- **A.** La barra queda quieta (`view-transition-name: pb-header` en la fila de contenido), el subrayado del menú se desliza al link nuevo (`pb-navcur` en el link actual), el contenido se funde (salida 160ms, entrada 240ms). El grano de página tiene su propio `view-transition-name` y no se funde.
- **B.** El nombre del evento viaja de la lista/panel al título de su página de detalle (`view-transition-name: pb-evtitle`, **único por página**).
- Con movimiento reducido: sin animación.
- Las páginas pre-renderizadas (reglas de especulación) no corren sus animaciones de entrada hasta mostrarse.

---

## 5. Páginas

| Página | Archivo de referencia | Secciones |
|---|---|---|
| Inicio | `Main.dc.html` | Portada · Próximo evento (panel) · Qué hacemos + "software" · Próximos eventos (4, sin filtros) · Únete |
| Eventos | `Eventos.dc.html` | Último evento concluido · Proyectos destacados (**solo si la vitrina está publicada**) · Calendario (filtros Todos / Del club / Competencias) · Archivo por año |
| Detalle de evento | `EventoDetalle.dc.html` | Portada con ruta, tipo, título, cuenta regresiva · Sobre el evento + datos clave · Cronograma · Inscripción |
| Equipo | `Equipo.dc.html` | Portada · Directiva (3 + 2, mismo tamaño; foto cuadrada, cargo, nombre, Instagram/LinkedIn/GitHub como enlaces simples) · Tutor responsable |
| Unirme | `Unirme.dc.html` | Portada + panel con botón a Microsoft Forms (abre en otra pestaña) · Tres pasos: formulario → grupo → primera reunión presencial |
| 404 | `NoEncontrado.dc.html` | "404" en pixel art + `110010100` + volver |
| Marca | `Compartir.dc.html`, `Favicon.dc.html` | Imagen OG 1200×630 · favicon |

**Títulos de pestaña** (F11, decisión de Joel): «Sección · PoliByte», de lo específico a lo general, para que en una pestaña estrecha se lea primero dónde estás. Inicio: «PoliByte · Club de la Carrera de Software». Detalle: «Imagine Cup · Eventos · PoliByte». 404: «Página no encontrada · PoliByte». Se generan con `pageTitle()` (`src/lib/page-title.ts`) y alimentan también `og:title`. El prototipo usa «PoliByte · Sección»: aquí manda este documento.

### 5.1 Panel del próximo evento (Inicio)

Dos columnas: izquierda (etiqueta, nombre, par de etiquetas, fecha/lugar/modalidad, texto de inscripciones, botones lado a lado); derecha centrada (días : horas en Silkscreen grande, binario de 8 bits de los días, "Days in code: N"). Debajo, barra de 40 celdas que se llena en una ventana de 60 días antes del evento (celda actual en amarillo).

### 5.2 Vitrina de proyectos

- Por evento, campo `showcase: "hidden" | "published"`. Solo con `published` aparecen la sección *Proyectos destacados* en Eventos, el botón "Ver proyectos" en el archivo y el botón principal "Ver proyectos destacados" en la portada de Eventos (si no, "Ver calendario").
- Por proyecto, `featured: boolean`. El primero destacado va en el panel grande (con conmutador Escritorio/Móvil); los dos siguientes en tarjetas; el resto en filas.
- Nunca se muestra una vitrina vacía o a medias:
  - 1 destacado: solo el panel grande. 2 destacados: panel + una tarjeta horizontal a ancho completo (se apila en ≤960). 3 o más: panel + 2 tarjetas + filas.
  - Sin `demoUrl` ni `repoUrl` no hay fila de botones; sin `demoUrl` la barra del navegador dice "sin demo pública". Sin integrantes ni stack no se pinta la píldora ni la lista.
- En Eventos se muestra la vitrina del **evento concluido más reciente que la tenga** (un taller posterior al hackathon no la apaga). Si ningún evento tiene vitrina, la sección no existe y el botón del resumen dice "Ver calendario".
- Cada evento con vitrina publicada muestra sus proyectos en su página de detalle (`#proyectos`), y "Ver proyectos" del archivo lleva ahí.
- Un evento `published` sin ningún destacado avisa en el build.

### 5.3 Estados vacíos

- Calendario sin próximos: sin pestañas de filtro, "Estamos preparando los próximos eventos" y botón secundario a Unirme. El mensaje de filtro vacío solo remite al archivo si hay archivo.
- Inicio sin próximos: "Qué hacemos" empalma directamente con el cierre. Si todos los próximos son "por confirmar", el CTA invita a unirse en vez de inscribirse.
- Equipo sin directiva: la sección no se pinta. Detalle sin cuerpo Markdown: sin bloque de texto vacío.
- "Pasado" o "próximo" se decide al construir: `rebuild.yml` reconstruye producción a diario.

---

### 5.4 Celular

- `:hover` solo dentro de `@media (hover: hover)`: en táctil se quedaría pegado tras tocar.
- Áreas táctiles de al menos 44 px con puntero grueso (botones pequeños, pestañas, enlaces sociales y del pie).
- Portada de Inicio: altura `clamp(700px, 100svh − 64px, 860px)`.
- Directiva: 2 por fila (la quinta centrada) hasta 380 px; una columna solo por debajo.
- Ninguna página desborda a lo ancho a 390 px (prueba E2E por página).

## 6. Accesibilidad

- Contraste AA en todo el texto (el amarillo nunca como texto sobre papel).
- Foco visible: `outline: 2px solid currentColor; outline-offset: 4px`.
- Titulares animados por letra: el `h1` lleva `aria-label` con el texto completo y las letras `aria-hidden`.
- Cuenta regresiva: `role="timer"` con `aria-label` legible ("Faltan 27 días y 20 horas").
- Filtros: `role="group"` + `aria-pressed`. Detalle de evento seleccionado: `aria-live="polite"`.
- Menú móvil: `role="dialog"`, `aria-modal`, `aria-expanded` en el botón.
- Decoración (líneas, cruces, píxeles, grano, palabra "software", wordmark) con `aria-hidden`.
- Verificación (L1): axe (WCAG 2.2 AA) en todas las rutas públicas a 1440/1000/390 y con el menú abierto; con teclado el foco se ve siempre y el Tab sigue el orden del documento, sin `tabindex` positivo (`e2e/a11y.spec.ts`).

## 7. Rendimiento

- Presupuesto: LCP < 2.2s (temporal, WOR-101; objetivo original 2.0s), CLS < 0.05, INP < 200ms, JS de la página < 20 KB (sin contar Lenis).
- Lenis (escritorio) se carga en tiempo ocioso tras `load` y su rAF solo corre en movimiento (§4). En táctil y con movimiento reducido el scroll es nativo.
- Fondos estáticos (WebP 8–36 KB), grano en mosaico (21 KB).
- Blur solo en la barra (1 capa). El menú móvil usa fondo sólido (F13). Nunca se anima `filter` ni `backdrop-filter`.
- Grano: una sola capa fija por página (§3.8).
- Sin `content-visibility: auto` (perf/fluidez-real): el navegador dejaba de dibujar la sección al salir de pantalla y la volvía a maquetar, pintar y rasterizar al regresar (hueco en blanco y un cuadro largo en cada pasada). El sitio es corto: maquetarlo todo una vez sale más barato.
- Animaciones infinitas pausadas fuera de pantalla (IntersectionObserver). El hero, a más de medio viewport de distancia, solo pausa barridos y nodos: **no se oculta** (con `visibility` las líneas aparecían tarde al volver rápido) y **no suelta** sus animaciones de scroll (recrearlas al volver era un tirón).
- Las animaciones de entrada con `forwards` del hero (líneas, letras, subtítulo) se sueltan al terminar (`data-drawn` en `.pb-hero`, lo pone `decode.ts` en el `animationend` del subtítulo, con respaldo a los 3 s): misma imagen, sin capas vivas durante el scroll.
- Ningún `will-change` ligado a `:hover`: crea y destruye capas mientras el contenido pasa bajo el cursor.
- Reglas de especulación con `eagerness: 'conservative'`: la página siguiente se pre-renderiza al pulsar, no al dejar el cursor sobre un enlace (eso robaba CPU y GPU en mitad del scroll).
- La medición de `perf-diag.yml` corre en Actions, que rasteriza por software (sin GPU): sirve para comparar variantes entre sí, no para predecir un PC con gráfica. Para eso está el panel `?diag` (`docs/SESSIONS.md`).
- Fuentes: `display=swap`; Instrument Sans subconjunto a "PoliByte"; JetBrains Mono (latín) precargada, con un respaldo local de métricas ajustadas para que el titular no salte.
- Lighthouse CI mide Inicio, Eventos, un detalle de evento, Equipo y Unirme (mediana de 3).
- Diagnóstico de fluidez: manual (`perf-diag.yml`), nunca en la suite normal. Dos modos: `script` (scrollTo por cuadro, comparable con mediciones antiguas) y `rueda` (gesto de rueda real por CDP, el que refleja el scroll del compositor).
