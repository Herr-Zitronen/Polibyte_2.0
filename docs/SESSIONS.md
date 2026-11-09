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

Dónde corre cada prueba (para no congelar la laptop):
| Prueba | Local | GitHub Actions |
|---|---|---|
| Vitest (unitarias, < 2 s) | ✅ `npm run test` | ✅ |
| `astro check`, ESLint, build | — | ✅ |
| Playwright (E2E, visual, axe) | — | ✅ |
| Lighthouse CI | — | ✅ |

Flujo por historia:
1. `git switch staging && git pull` → `git switch -c feat/hX.Y-nombre`.
2. **Rojo**: escribir las pruebas. Las unitarias se ven fallar localmente; las E2E se ven fallar haciendo push de la rama → Actions en rojo.
3. **Verde + refactor**: push → Actions en verde.
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
Al terminar, actualiza el issue con lo aprendido y muévelo a Done.
```

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
