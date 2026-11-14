# Modelo de contenido

Todo el texto del sitio es editable sin tocar el diseño. Se propone usar *content collections* de Astro con esquemas Zod. Los nombres de campo están en inglés (código); el contenido, en español.

## `events` (un archivo por evento: `src/content/events/{slug}.md`)

```ts
const event = z.object({
  title: z.string(),                         // "Imagine Cup"
  type: z.enum(['club', 'competition']),     // "Del club" | "Competencia"
  organizer: z.string(),                     // "Microsoft" | "PoliByte"
  ally: z.string().optional(),               // "IEEE CS" → se muestra "con IEEE CS"
  date: z.coerce.date().optional(),          // sin fecha → "Por confirmar"
  endDate: z.coerce.date().optional(),
  time: z.string().optional(),
  place: z.string().optional(),
  mode: z.enum(['presencial', 'remoto', 'híbrido']).optional(),
  teamSize: z.string().optional(),           // "De 2 a 4 personas"
  requirements: z.string().optional(),
  summary: z.string(),                       // una línea para listas y panel
  pitch: z.string().optional(),              // frase destacada del detalle
  registrationUrl: z.string().url().optional(),
  registrationDeadline: z.coerce.date().optional(),
  schedule: z.array(z.object({ date: z.string(), title: z.string(), detail: z.string() })).default([]),
  stats: z.object({ teams: z.number(), projects: z.number(), people: z.number() }).partial().optional(),
  showcase: z.enum(['hidden', 'published']).default('hidden'),
});
// El cuerpo Markdown del archivo es "Sobre el evento".
```

Reglas derivadas (funciones puras, con pruebas unitarias):

| Función | Regla |
|---|---|
| `eventStatus(e, now)` | sin `date` → `tbd`; `date < hoy` → `past`; si no → `upcoming` |
| `nextEvent(events, now)` | el `upcoming` con fecha más cercana |
| `lastConcluded(events, now)` | el `past` con fecha más reciente |
| `typeLine(e)` | `Competencia · Microsoft` · `Del club · con GDG` · `Del club` |
| `countdown(target, now)` | `{ days, hours, minutes }`, nunca negativo |
| `toBinary8(n)` | `27 → "00011011"`; si n > 255 usa los bits necesarios |
| `progressCells(target, now, window=60, cells=40)` | celdas llenas y la actual |
| `groupByYear(events)` | archivo agrupado por año, descendente |

## `projects` (`src/content/projects/{event}/{slug}.md`)

```ts
const project = z.object({
  event: reference('events'),
  title: z.string(),
  team: z.string(),
  members: z.array(z.string()),
  problem: z.string(),                 // "qué resuelve", 1–2 frases
  stack: z.array(z.string()),
  demoUrl: z.string().url().optional(),
  repoUrl: z.string().url().optional(),
  shotDesktop: image(),                // captura archivada, no iframe
  shotMobile: image().optional(),
  featured: z.boolean().default(false),
  order: z.number().default(0),
});
```

Vitrina visible solo si `event.showcase === 'published'` **y** hay al menos un proyecto `featured`.

## `members` (`src/content/members/{slug}.md`)

```ts
const member = z.object({
  role: z.enum(['Presidencia', 'Vicepresidencia', 'Secretaría', 'Tesorería', 'Webmaster', 'Creative Director', 'Tutor']),
  name: z.string(),
  photo: image().optional(),           // sin foto → iniciales en pixel art
  instagram: z.string().optional(),    // "@usuario"
  linkedin: z.string().url().optional(),
  github: z.string().url().optional(),
  // solo tutor:
  title: z.string().optional(),        // cargo docente
  faculty: z.string().optional(),
  about: z.string().optional(),
  email: z.string().email().optional(),
  period: z.string(),                  // "2026–2027"
});
```

## `site` (`src/content/site.json`)

```json
{
  "name": "PoliByte",
  "descriptor": "Club de la Carrera de Software",
  "institution": "Escuela Superior Politécnica de Chimborazo",
  "joinFormUrl": "https://forms.office.com/...",
  "links": { "email": "", "instagram": "", "github": "" },
  "period": "2026–2027"
}
```
