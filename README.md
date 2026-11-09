# Paquete de traspaso · PoliByte web

Todo lo necesario para implementar el rediseño en Claude Code con Scrum y TDD.

## Contenido

```
README.md            este archivo
CLAUDE.md            reglas para Claude Code (copiar a la raíz del repo)
DESIGN.md            especificación de diseño completa
CONTENT_MODEL.md     esquemas de eventos, proyectos, miembros y sitio
BACKLOG.md           épicas, historias con criterios de aceptación y plan de sprints
design/              prototipo de referencia (abrir *.dc.html en el navegador)
  screens/           capturas de cada página a 1440, 1000 y 390 px (WebP)
  assets/            imágenes que usa el prototipo
assets/
  backgrounds/       fondos del Chimborazo (hero, join, recap), niebla, grano y foto original
  brand/             logo, logo mono, wordmark, favicon (ico, svg, png 16–512)
```

## Cómo abrir el prototipo

Abre `design/Main.dc.html` en Chrome. `design/support.js` es un intérprete mínimo que arma la página para verla. El prototipo es solo de referencia: no tiene las animaciones de scroll, los filtros ni el scroll suave del lienzo, y necesita internet para las fuentes.

La versión interactiva completa sigue en el lienzo de Claude (siete páginas: Inicio, Eventos, Detalle de evento, Equipo, Unirme, 404, Marca).

## Cómo empezar en Claude Code

1. Crea el repositorio y copia `CLAUDE.md`, `DESIGN.md`, `CONTENT_MODEL.md`, `BACKLOG.md`, `design/` y `assets/` a la raíz.
2. Carga el backlog en tu herramienta de seguimiento (las historias están listas para copiar).
3. Primer mensaje sugerido para Claude Code:


4. Repite por historia: pruebas en rojo → implementación → refactor → PR con capturas.

## Pendientes de contenido (los completas tú)

- Fotos, nombres, Instagram, LinkedIn y GitHub de la directiva y del tutor.
- Enlace real del Microsoft Forms de ingreso.
- Fechas, lugares, modalidad y descripciones de los eventos.
- Resumen y cifras del Hackathon de Kiro; capturas, enlaces y equipos de los proyectos cuando la vitrina se publique.
- Dominio del sitio (aparece en la imagen para compartir).
- Confirmar los derechos de uso de la foto del Chimborazo.

## Notas

- La imagen para compartir (`design/Compartir.dc.html`) conviene exportarla desde el lienzo o generarla en el build (por ejemplo, con Satori), para que use las fuentes reales.
- Las capturas de `design/screens/` se tomaron con movimiento reducido y fuentes de respaldo: sirven para comparar estructura, no píxeles exactos.
