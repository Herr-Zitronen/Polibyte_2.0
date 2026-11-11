# Trabajo por sesiones

Cada historia se trabaja en **un chat nuevo** de Claude Code. Así el contexto solo carga lo necesario (más barato y más preciso).

## Dónde está todo
- **Linear**: proyecto [PoliByte 2.0](https://linear.app/galletasdechocolate/project/polibyte-20-293979e3cdd1) (equipo WOR). Un issue por historia (WOR-57 … WOR-85), agrupados en milestones *Sprint 1…6*.
  Cada issue trae: criterios, pruebas a escribir, archivos, explicación "¿Por qué así?", dependencias y el prompt de sesión (*Agent notes*).
- **Guía didáctica**: documento en el mismo proyecto de Linear.
- **Plan de pruebas por sprint**: `docs/TEST_PLAN.md`.
- **Repo**: https://github.com/Herr-Zitronen/Polibyte_2.0

## Ramas y despliegue
| Rama | Dónde vive | Despliegue |
|---|---|---|
| `main` | GitHub | **Producción** (Cloudflare) |
| `staging` | GitHub | **Revisión** (URL de staging en Cloudflare) |
| `feat/hX.Y-…` | GitHub, **solo para correr pruebas** | **Nunca se despliega** |

Regla: **solo `main` y `staging` se despliegan en Cloudflare.** Las ramas `feat/*` se suben únicamente para que GitHub Actions corra las pruebas.

### CI y minutos de Actions (desde el PR A de F12)
- **Push a `feat/**`, `perf/**`, `fix/**`, `docs/**`, `chore/**`**: solo el job rápido (tipos + lint + Vitest, ~1-2 min).
- **PR hacia `staging`/`main`** y **push a `staging`/`main`**: suite completa (build, Lighthouse, Playwright + axe) y, en `staging`/`main`, despliegue.
- Cambios solo de `*.md`, `docs/`, `design/` o capturas base (`e2e/**/*-snapshots/`) no disparan corridas.
- **Un solo push por PR**: acumula los commits en local y empuja una vez. Cada push a una rama con PR abierto repite la suite completa.
- Diagnóstico de fluidez (`e2e/home-smoothness.spec.ts` con `PERF_DIAG=1`): manual, desde Actions → *Diagnóstico de fluidez* → *Run workflow*.
- Capturas base: si se borran las PNG, la corrida del PR las genera (`updateSnapshots: 'missing'`); se descargan del artefacto `playwright-report`, se revisan y se versionan (ese commit no dispara CI).

Dónde corre cada prueba (para no congelar la laptop):
| Prueba | Local | GitHub Actions |
|---|---|---|
| Vitest (unitarias, < 2 s) | ✅ `npm run test` | ✅ |
| `astro check`, ESLint, build | — | ✅ |
| Playwright (E2E, visual, axe) | — | ✅ |
| Lighthouse CI | — | ✅ |

Flujo por historia:
1. `git switch staging && git pull` → `git switch -c feat/hX.Y-nombre`.
2. **Rojo**: escribir las pruebas. Las unitarias se ven fallar localmente. Las E2E se escriben primero pero no se empujan solo para verlas fallar (cuesta una corrida completa).
3. **Verde + refactor**: `npm run test` local; luego un único push + PR → Actions en verde.
4. PR `feat/hX.Y-nombre → staging`; solo se puede unir con CI en verde. Al unir → despliegue a staging.
5. Revisar en la URL de staging (capturas 1440/1000/390 en los artefactos de Actions).
6. PR `staging → main` (puede agrupar varias historias). Al unir → producción.
7. Borrar la rama (GitHub lo hace solo al unir el PR si se activa *Automatically delete head branches*).

## Prompt para abrir una sesión
```
Lee CLAUDE.md, docs/SESSIONS.md y el issue WOR-XX de Linear (proyecto PoliByte 2.0).
Crea la rama indicada en el issue desde staging. Escribe primero las pruebas y muéstrame que fallan
(Vitest local; E2E/Lighthouse solo en GitHub Actions, nunca en mi laptop). Implementa hasta verde,
refactoriza y abre el PR hacia staging. Pregúntame antes de cada push.
Si la prueba depende de la fecha, usa fixtures con reloj fijo en /lab/ (no el contenido real).
Espera a que la corrida en rojo termine en Actions antes del siguiente push (un push nuevo la cancela).
Al terminar, actualiza el issue con lo aprendido y muévelo a Done.
```

## Pruebas con fixtures en `/lab/`
Una prueba **no debe caducar** porque pase el tiempo ni depender del contenido real (que cambia).
- **Datos**: `src/lib/<tema>-fixtures.ts`, con una fecha fija exportada (por ejemplo `DETAIL_NOW = 2026-11-09`). La lógica pura recibe "ahora" como parámetro, nunca llama a `new Date()` por dentro.
- **Página**: `src/pages/lab/<tema>.astro`, con `noindex` y sin cabecera. Una página por estado (próximo, pasado, por confirmar, sin foto…).
- **Pruebas**: las unitarias (Vitest) usan los mismos fixtures; las E2E abren `/lab/…` y no la página real.
- **Cuándo no hace falta**: si lo probado no depende de fechas ni de contenido variable, basta la página real (ej. el layout de la directiva).
- **Cuidado con Astro**: el `<script>` de un componente se emite dentro del contenedor donde aparece primero. Usa `:nth-of-type`, no `:nth-child`, en cuadrículas de componentes con script.

## Rojo y verde en Actions
- **Rojo** = las pruebas fallan porque aún no existe el código. Es la prueba de que sirven.
- **Verde** = pasan tras implementar.
- Actions tarda ~5 min y **un push nuevo cancela la corrida anterior de la rama**: espera a que termine la corrida en rojo antes del siguiente push.
- Las capturas base nuevas salen como artefacto (`playwright-report`): descárgalas, revísalas y versiónalas en `e2e/*-snapshots`.

## Panel de fluidez en tu PC (`?diag`)
La medición de Actions rasteriza por software (sin gráfica): sirve para comparar variantes entre sí, no para saber cómo se siente en tu PC. Para eso está el panel.

1. **Compila y sirve**: `npm run build && npm run preview`. Nunca `npm run dev`: Vite y la barra de herramientas de Astro añaden trabajo propio y falsean la medida.
2. **Comprueba la gráfica** en `chrome://gpu`: «Rasterization» y «Compositing» deben decir *Hardware accelerated*. Si no, activa «Usar aceleración por hardware cuando esté disponible» en la configuración de Chrome y reinícialo. Cierra DevTools mientras mides.
3. **Abre** `http://localhost:4321/?diag`. Aparece un panel fijo abajo a la derecha. Espera 4 s (las variantes se aplican cuando termina la entrada del titular).
4. **Pasada base** (sin casillas): con la rueda, baja rápido de arriba abajo y vuelve. Al parar, «última pasada» muestra FPS, peor cuadro y % de cuadros de más de 20 ms. Pulsa «Copiar resultado».
5. **Una casilla cada vez** (la página se recarga sola) y repite la misma pasada. Orden sugerido: `sin-lenis`, `sin-barridos`, `sin-nodos`, `lineas-estaticas`, `sin-backdrop-filter`, `blur-siempre`, `sin-paralaje`, `sin-scroll-timelines`, `sin-reveals`, `sin-cubo`.
6. **Qué anotar**: por cada pasada, el texto copiado y si *se sintió* más fluida que la base (sí / no / igual). La sensación manda: el medidor cuenta cuadros del hilo principal, y un scroll puede sentirse bien aunque el número no cambie.

Si quieres más detalle: graba en DevTools → Performance una pasada por la zona de la portada y mira la pista «Frames» (cuadros rojos o amarillos) y qué hay debajo en «Main» y «GPU».

## Orden recomendado (respeta dependencias)
| Sprint | Issues |
|---|---|
| 1 | WOR-57 H0.1 → WOR-58 H0.2 · WOR-59 H1.1 → WOR-60 H1.2 · WOR-61 H1.3 |
| 2 | WOR-66 H3.1 → WOR-67 H3.2 · WOR-62 H1.4 · WOR-63 H1.5 · WOR-64 H2.1 → WOR-65 H2.2 |
| 3 | WOR-68 H1.6 · WOR-69 H4.1 · WOR-70 H4.2 · WOR-71 H4.3 · WOR-72 H4.4 · WOR-73 H2.3 |
| 4 | WOR-74 H5.1 → WOR-75 H5.2 → WOR-77 H5.4 · WOR-76 H5.3 · WOR-78 H6.1 |
| 5 | WOR-79 H7.1 → WOR-80 H7.2 · WOR-81 H8.1 · WOR-82 H9.1 · WOR-83 H9.2 |
| 6 | WOR-84 H2.4 → WOR-85 L1 |

## Estado actual
- H0.1 (WOR-57) terminada: proyecto Astro + CI. Staging: https://staging-polibyte-site.der-zitronen-saft.workers.dev
- Worker de Cloudflare: `polibyte-site` (producción: https://polibyte-site.der-zitronen-saft.workers.dev, solo desde `main`).
- Las historias se trabajan en orden (ver tabla); el estado de cada una vive en su issue de Linear.

## Pendiente del usuario
- En GitHub: rama por defecto `main`; proteger `main` (solo PR desde `staging`, CI en verde).
- Contenido real (ver issue WOR-85).
