# Plan de pruebas por sprint

Tipos: **U** Vitest · **E** Playwright · **V** visual (geometría + capturas) · **A** axe · **P** Lighthouse.
Todas las E/V/A corren en los tres proyectos de Playwright (1440, 1000, 390) salvo que se indique.
Detalle de cada caso: en el issue de Linear correspondiente.

## Sprint 1 · Base + sistema de diseño
| Historia | Archivo | Tipo | Verifica |
|---|---|---|---|
| H0.1 | `tests/project-setup.test.ts` ✅ escrito (rojo) | U | scripts, TS estricto, ESLint, estructura, workflow CI, 3 anchos, axe, LHCI, wrangler |
| H0.1 | `e2e/a11y.spec.ts` | A | Inicio sin violaciones |
| H0.2 | `tests/lighthouse-budget.test.ts`, `lighthouserc.cjs` | U/P | LCP < 2s, CLS < 0.05, perf ≥ 90 como `error` |
| H0.2 | `tests/js-budget.test.ts` | U | JS por página < 20 KB |
| H1.1 | `src/styles/tokens.test.ts` | U | 16 tokens y escala de DESIGN §2 |
| H1.1 | `e2e/fonts.spec.ts` | E | solo 3 familias; `text=PoliByte`; `display=swap` |
| H1.2 | `e2e/visual/buttons.spec.ts` | V | caja dentro del marco, misma altura, invertido en claro |
| H1.3 | `e2e/visual/tags.spec.ts` | V | texto centrado con punto, línea oculta ≤520 |

## Sprint 2 · Estructura global + contenido
| Historia | Archivo | Tipo |
|---|---|---|
| H1.4 | `src/lib/pixel-strip.test.ts`, `e2e/visual/pixel-strip.spec.ts` | U, V |
| H1.5 | `e2e/glass.spec.ts`, `e2e/parallax-perf.spec.ts`, `tests/css-rules.test.ts` | E, P, U |
| H2.1 | `e2e/header.spec.ts` | V, E |
| H2.2 | `e2e/mobile-menu.spec.ts` (390) | V, E, A |
| H3.1 | `src/content/schemas.test.ts`, `tests/build-integrity.test.ts` | U |
| H3.2 | `src/lib/events.test.ts` | U |

## Sprint 3 · Inicio
| Historia | Archivo | Tipo |
|---|---|---|
| H1.6 | `e2e/panels.spec.ts`, `src/lib/nearest-edge.test.ts` | E, U |
| H4.1 | `e2e/home-hero.spec.ts`, `src/lib/decode.test.ts` | E, A, V, U |
| H4.2 | `e2e/next-event.spec.ts`, `src/lib/next-event-view.test.ts` | E, U |
| H4.3 | `e2e/visual/software-word.spec.ts` | V |
| H4.4 | `e2e/home-events.spec.ts` | E, A, V |
| H2.3 | `e2e/footer.spec.ts` | V, E |

## Sprint 4 · Eventos + detalle
| Historia | Archivo | Tipo |
|---|---|---|
| H5.1 | `e2e/events-recap.spec.ts` | E |
| H5.2 | `src/lib/showcase.test.ts`, `e2e/showcase.spec.ts` | U, E |
| H5.3 | `src/lib/filter.test.ts`, `e2e/calendar.spec.ts` | U, E, A |
| H5.4 | `e2e/archive.spec.ts` (+ casos en `events.test.ts`) | U, E |
| H6.1 | `e2e/event-detail.spec.ts` | E |

## Sprint 5 · Equipo, Unirme, SEO
| Historia | Archivo | Tipo |
|---|---|---|
| H7.1 | `e2e/team.spec.ts`, `src/lib/initials.test.ts` | V, E, U |
| H7.2 | `e2e/tutor.spec.ts` | E |
| H8.1 | `e2e/join.spec.ts` | E |
| H9.1 | `e2e/seo.spec.ts` | E |
| H9.2 | `e2e/not-found.spec.ts` | E, V |

## Sprint 6 · Pulido y lanzamiento
| Historia | Archivo | Tipo |
|---|---|---|
| H2.4 | `e2e/transitions.spec.ts`, `tests/css-rules.test.ts` | E, V, U |
| L1 | `e2e/a11y.spec.ts` (todas las rutas), LHCI multi-página, `tests/content-ready.test.ts` | A, P, U |

## Infraestructura de pruebas compartida
- **Reloj fijo**: `page.clock.setFixedTime()` en E2E; `now` inyectado en U.
- **Fixtures de contenido**: `tests/fixtures/content/<escenario>/` seleccionadas con `PB_CONTENT` en el build de pruebas.
- **Páginas de laboratorio**: `src/pages/_lab/*` (noindex, fuera del sitemap) para componentes aislados.
- **Capturas**: `toHaveScreenshot()` con movimiento reducido y `maxDiffPixelRatio: 0.01`; se actualizan solo con aprobación en el PR.
