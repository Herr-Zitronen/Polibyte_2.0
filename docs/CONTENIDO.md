# Cómo cargar el contenido real (sin tocar código)

Guía para Joel. Todo el contenido del sitio vive en `src/content/`. Cambias archivos de texto (y fotos), haces commit y el sitio se reconstruye solo. Si un dato obligatorio falta o está mal escrito, **el build falla y te dice qué archivo revisar**: así nunca se publica algo roto.

> Mientras cargas, puedes comprobar qué queda de ejemplo con:
> `CONTENT_READY=1 npm run test` (en PowerShell: `$env:CONTENT_READY=1; npm run test`).
> La lista que sale son los archivos y líneas con marcadores como `[Nombre 1]` o `[Contenido de ejemplo]`. Hacia `main` esta comprobación es obligatoria.

---

## 1. Datos del club · `src/content/site.json`

| Campo | Qué es | Ejemplo |
|---|---|---|
| `joinFormUrl` | Enlace al Microsoft Forms de inscripción (botón de Unirme). **Con la ruta completa**, no solo `https://forms.office.com/` | `https://forms.office.com/r/AbC123` |
| `links.email` | Correo del club. Vacío = no se muestra | `polibyte@espoch.edu.ec` |
| `links.instagram` | Usuario o URL. Vacío = no se muestra | `@polibyte.espoch` |
| `links.github` | Organización o URL. Vacío = no se muestra | `polibyte-espoch` |
| `period` | Periodo de la directiva. Sale en el pie | `2026–2027` |

El pie muestra solo los enlaces que tengan dato. Hace falta al menos uno para pasar a `main`.

## 2. Directiva y tutor · `src/content/members/`

Un archivo `.md` por persona (`directiva-1.md` … `directiva-5.md`, `tutor.md`). La foto va **en la misma carpeta**.

```yaml
---
role: Presidencia          # Presidencia | Vicepresidencia | Secretaría | Tesorería | Webmaster | Tutor
name: 'Ana Pérez'          # obligatorio
photo: ./ana-perez.jpg     # opcional (sin foto se muestran las iniciales)
instagram: '@anaperez'     # opcional
linkedin: https://www.linkedin.com/in/anaperez   # opcional, URL completa
github: https://github.com/anaperez              # opcional, URL completa
period: 2026–2027          # obligatorio
---
```

- El orden en la página lo decide el cargo, no el nombre del archivo.
- Tutor: además `title` (cargo docente), `faculty` y `about` (una o dos frases). `email` es opcional.
- **Fotos:** JPG o WebP, retrato, **al menos 720 px de ancho**, la cara centrada (se recorta en cuadrado). El sitio genera solo los tamaños que necesita: sube la foto original sin comprimirla tú.
- Para quitar a alguien, borra su `.md` (y su foto). Sin ningún miembro, la sección no aparece.

## 3. Eventos · `src/content/events/`

Un `.md` por evento. **El nombre del archivo es la dirección** de su página: `imagine-cup-2027.md` → `/eventos/imagine-cup-2027/`. Usa minúsculas, números y guiones.

```yaml
---
title: Imagine Cup 2027                 # obligatorio
type: competition                       # obligatorio: club (Del club) | competition (Competencia)
organizer: Microsoft                    # obligatorio
ally: IEEE CS                           # opcional: el aliado es un dato, no una categoría
date: 2027-03-20                        # opcional: sin fecha sale "Por confirmar"
endDate: 2027-03-21                     # opcional
time: '09:00'                           # opcional
place: Facultad de Informática y Electrónica   # opcional
mode: presencial                        # opcional: presencial | remoto | híbrido
summary: Una frase que resume el evento.   # obligatorio
registrationUrl: https://...            # opcional (botón "Inscribir a mi equipo")
registrationDeadline: 2027-03-01        # opcional
schedule:                               # opcional: cronograma del detalle
  - { date: '20 mar', title: Apertura, detail: Bienvenida y reglas }
stats: { teams: 12, projects: 11, people: 44 }   # opcional, cifras de un evento pasado
showcase: hidden                        # hidden | published (ver §5)
---

Texto largo del evento (opcional). Si no hay texto, el bloque no aparece.
```

- Las fechas se escriben `AAAA-MM-DD` y se entienden en hora de Riobamba.
- **Pasado o próximo se decide solo** comparando la fecha con el día de la reconstrucción. La reconstrucción diaria (`rebuild.yml`) mueve los eventos al archivo sin que nadie haga nada.

## 4. Proyectos · `src/content/projects/<evento>/`

Una carpeta por evento, con el **mismo nombre que el archivo del evento** (sin `.md`). Dentro, un `.md` por proyecto y sus capturas.

```yaml
---
event: hackathon-espoch-2026     # obligatorio: el nombre del evento (si no existe, el build falla)
title: Ruta Segura               # obligatorio
team: Los Compiladores           # obligatorio
members: ['Ana Pérez', 'Luis Mora']   # obligatorio (puede ir vacío: [])
problem: Qué resuelve, en una o dos frases.   # obligatorio
stack: [Astro, TypeScript]       # obligatorio (puede ir vacío: [])
shotDesktop: ./ruta-segura.png   # OBLIGATORIO: captura de escritorio
shotMobile: ./ruta-segura-movil.png   # opcional: activa el conmutador Escritorio/Móvil
demoUrl: https://...             # opcional (sin demo dice "sin demo pública")
repoUrl: https://github.com/...  # opcional
featured: true                   # destacado en la vitrina
order: 1                         # orden entre destacados (1 = panel grande)
---
```

- **Capturas:** PNG o WebP. Escritorio a **1440 × 900** (o la misma proporción, 16:10); móvil a **390 × 844**. Sin barras del navegador.

## 5. Publicar la vitrina de un evento, paso a paso

1. El evento ya pasó (su fecha es anterior a hoy).
2. Crea la carpeta `src/content/projects/<nombre-del-evento>/` con los proyectos (§4).
3. Marca **al menos uno** con `featured: true`. Lo ideal son 3 o más:
   - 1 destacado: solo el panel grande.
   - 2 destacados: panel + una tarjeta horizontal.
   - 3 o más: panel + 2 tarjetas + filas "Más proyectos".
4. Ordénalos con `order` (el 1 va en el panel grande).
5. En el `.md` del evento cambia `showcase: hidden` por `showcase: published`.
6. Haz commit. La vitrina aparece en `/eventos/` (si es el evento concluido más reciente con vitrina), en el detalle del evento (`#proyectos`) y como "Ver proyectos" en el archivo.

Si el evento está `published` sin ningún destacado, el build avisa y la vitrina no se muestra. Nunca sale vacía ni a medias.

## 6. Dominio

1. En Cloudflare, añade el dominio y apunta el DNS (Joel + quien administre el dominio).
2. En GitHub → Settings → Secrets and variables → Actions → **Variables**, crea `SITE_URL` con la dirección completa (por ejemplo `https://polibyte.espoch.edu.ec`). Canónicas, Open Graph y sitemap la usan en el siguiente build.
3. La ruta del dominio en `wrangler.jsonc` la añade el PR de lanzamiento cuando el dominio esté decidido.

## 7. Publicar

- Trabaja en una rama, abre PR a `staging` y revisa el preview en PC y en el celular.
- Cuando todo esté bien, PR `staging → main`. Ahí se activa la comprobación de contenido real: si queda algo de ejemplo, CI lo lista y no despliega.
