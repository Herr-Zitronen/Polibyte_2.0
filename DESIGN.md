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
- Puntos de quiebre: **1200** (filas de eventos compactas), **1180** (se oculta el chip de la barra), **960** (columnas se apilan, la columna fija deja de serlo, se ocultan cruces que dependen de columnas), **820** (barra móvil, menú en hoja), **520** (botones pueden partir texto, se oculta la línea entre etiquetas), **480** (se oculta el subtítulo del logo).
- Regla: un layout de dos columnas **nunca** se parte en filas por falta de espacio; se apila solo en un punto de quiebre explícito (lección aprendida con el calendario).

---

## 3. Componentes

### 3.1 Botones (solo dos)

- **Primario** (`.pb-b1`): marco de 1px `rgba(242,244,250,.7)`, radio 6px, padding 4px; dentro, caja blanca `#FFFFFF` con texto `#1A2C78`, radio 3px, padding 14px 22px, 15px/500. Hover: la caja sube 2px.
- **Secundario** (`.pb-b2`): contorno de 1px, radio 6px, padding 18px 26px (misma altura total que el primario). Hover: fondo blanco, texto azul.
- Tamaño pequeño `.sm` para barra y listas.
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

- Capas, de atrás hacia adelante: imagen del nevado (lejos) → niebla (cerca) → brillo (`.pb-sheen`) → vidrio acanalado (`.pb-reed`) → degradado a sólido en los bordes → **grano (siempre arriba)**.
- **Una sola capa de grano por sección**, con `z-index` sobre el contenido. Nunca dos granos superpuestos (forman rectángulos visibles).
- Imágenes en `assets/backgrounds/` (8–12 KB cada una; la niebla 36 KB con transparencia).

### 3.9 Barra superior

- Fija arriba, de lado a lado, altura 0 en el flujo (no empuja la página).
- Tres columnas: logo | 01 club · 02 eventos · 03 equipo (centrado siempre) | 04 unirme (botón primario pequeño).
- Solo en Inicio, al pasar el panel del próximo evento aparece un **chip** a la izquierda de "unirme" (barrido de máscara + dígitos que suben). Oculto en ≤1180.
- **Blur progresivo** de 2 capas (6px → 12px; se quitó la de 2px en F5 por coste de scroll) con máscaras escalonadas, 92px de alto, y un tinte. Sobre secciones claras el tinte y el texto cambian a tema claro (botón invertido).
- **Importante:** ningún ancestro del blur puede tener `view-transition-name` (lo convierte en "backdrop root" y el blur deja de verse). El nombre de transición va en la fila de contenido, no en el contenedor.
- Celular (≤820): logo + "unirme" + botón de menú; el menú abre una hoja a pantalla completa con vidrio y links grandes numerados.

### 3.10 Pie de página

- Fondo `#0D1438`. Línea `© 2026–2027 PoliByte · Club de la Carrera de Software`, ESPOCH debajo, enlaces a la derecha.
- Wordmark grande en tono sólido `#252D4F` (no transparente: la "y" y la "t" se solapan en el logo y la transparencia marcaría el cruce). Al pasar el mouse, una "linterna" ilumina las letras con un degradado blanco azulado → amarillo, en una capa sólida cuya opacidad (0.75) se aplica al grupo.

### 3.11 Isotipo

Animado por piezas (bits, llaves, núcleo), con pasos secos (`steps`):
- **Carga:** los bits caen, las llaves entran desde los lados y el núcleo parpadea.
- **Hover:** las llaves se abren, los bits saltan y el núcleo se pone amarillo.
- Sin rotar el logo completo.

---

## 4. Movimiento

| Efecto | Disparador | Técnica |
|---|---|---|
| Titular: letras suben por ranura + decodificación con glifos `01<>/{}[]#_=+*;` | Carga | máscara por palabra + cambio de `textContent` solo de las letras (sin re-render) |
| Líneas de portada se dibujan, destello recorre, nodos parpadean | Carga / tiempo | `transform: scaleX` y brillo con `transform`; pausa fuera de pantalla |
| Marco de portada se abre en 4 y el titular se aleja | Scroll | `animation-timeline: scroll(root)` |
| Paralaje nevado/niebla | Scroll | `scroll(root)` en portadas, `view()` en secciones |
| Vidrio acanalado y líneas siguen al cursor | Cursor | un solo listener + rAF, `transform` directo |
| "soft" + "ware" se unen | Scroll | `view()`, rango `cover 0% → 40%` |
| Apariciones de bloques | Scroll | `view()`, `entry 0% → cover 24%` |
| Scroll con inercia | Rueda | **Lenis** en producción (en el prototipo, implementación propia equivalente) |

Curvas: `cubic-bezier(.16,1,.3,1)` (entrada suave), `cubic-bezier(.7,0,.2,1)` (trazos). Pixel art: `steps()`.

**Reglas aprendidas:**
- Contenedores con animaciones de scroll: usar `overflow: clip` (o `overflow-x: clip`), **nunca** `overflow: hidden`. `hidden` crea un contenedor de scroll y congela las animaciones `view()`.
- `overflow: clip` no aísla márgenes: toda sección debe ser `display: flow-root`.
- El bloque de `prefers-reduced-motion` debe ir **al final** del CSS de cada página; si no, los estilos de la página vuelven a ocultar lo que debía mostrarse.
- Fuera de Chrome/Edge (y Safari reciente), las animaciones de scroll no existen: el estado por defecto de cada elemento debe ser su estado final visible.

### 4.1 Transiciones entre páginas

View Transitions API nativa (`@view-transition { navigation: auto; }`), sin JS:
- **A.** La barra queda quieta (`view-transition-name: pb-header` en la fila de contenido), el subrayado del menú se desliza al link nuevo (`pb-navcur` en el link actual), el contenido se funde (salida 220ms, entrada 320ms).
- **B.** El nombre del evento viaja de la lista/panel al título de su página de detalle (`view-transition-name: pb-evtitle`, **único por página**).
- Con movimiento reducido: sin animación.

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

### 5.1 Panel del próximo evento (Inicio)

Dos columnas: izquierda (etiqueta, nombre, par de etiquetas, fecha/lugar/modalidad, texto de inscripciones, botones lado a lado); derecha centrada (días : horas en Silkscreen grande, binario de 8 bits de los días, "Days in code: N"). Debajo, barra de 40 celdas que se llena en una ventana de 60 días antes del evento (celda actual en amarillo).

### 5.2 Vitrina de proyectos

- Por evento, campo `showcase: "hidden" | "published"`. Solo con `published` aparecen la sección *Proyectos destacados* en Eventos, el botón "Ver proyectos" en el archivo y el botón principal "Ver proyectos destacados" en la portada de Eventos (si no, "Ver calendario").
- Por proyecto, `featured: boolean`. El primero destacado va en el panel grande (con conmutador Escritorio/Móvil); los dos siguientes en tarjetas; el resto en filas.
- Nunca se muestra una vitrina vacía o a medias.

---

## 6. Accesibilidad

- Contraste AA en todo el texto (el amarillo nunca como texto sobre papel).
- Foco visible: `outline: 2px solid currentColor; outline-offset: 4px`.
- Titulares animados por letra: el `h1` lleva `aria-label` con el texto completo y las letras `aria-hidden`.
- Cuenta regresiva: `role="timer"` con `aria-label` legible ("Faltan 27 días y 20 horas").
- Filtros: `role="group"` + `aria-pressed`. Detalle de evento seleccionado: `aria-live="polite"`.
- Menú móvil: `role="dialog"`, `aria-modal`, `aria-expanded` en el botón.
- Decoración (líneas, cruces, píxeles, grano, palabra "software", wordmark) con `aria-hidden`.

## 7. Rendimiento

- Presupuesto: LCP < 2.2s (temporal, WOR-101; objetivo original 2.0s), CLS < 0.05, INP < 200ms, JS de la página < 20 KB (sin contar Lenis).
- Fondos estáticos (WebP 8–36 KB), grano en mosaico (21 KB).
- Blur solo en la barra (2 capas). Nunca se anima `filter` ni `backdrop-filter`.
- `content-visibility: auto` en secciones bajo el pliegue.
- Animaciones infinitas pausadas fuera de pantalla (IntersectionObserver).
- Fuentes: `display=swap`; Instrument Sans subconjunto a "PoliByte".
