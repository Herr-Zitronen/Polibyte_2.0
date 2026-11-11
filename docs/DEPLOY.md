# Despliegue

## En una frase

GitHub **prueba** el código y Cloudflare lo **publica**. Son dos servicios separados que miran el mismo repositorio.

```
push a una rama ──► GitHub Actions: tipos, lint, Vitest, build, Lighthouse, Playwright + axe
                └─► Cloudflare Workers Builds: construye y publica
                       main            → producción
                       cualquier otra  → preview con su propia URL
```

## Quién hace qué

| Servicio | Qué hace | Dónde se ve |
|---|---|---|
| GitHub Actions (`.github/workflows/ci.yml`) | Corre las pruebas. No publica nada. | Pestaña *Actions* y los checks de cada PR |
| Cloudflare Workers Builds | Construye `dist/` y lo sube al Worker `polibyte-site`. | Panel de Cloudflare → Workers → `polibyte-site` → *Deployments* y *Builds*; también deja un comentario con la URL de preview en cada PR |
| Protección de ramas en GitHub | No deja fusionar en `staging` ni en `main` si las pruebas fallan. `main` exige además el job *Contenido real (hacia main)*, que bloquea mientras quede contenido de ejemplo (`docs/CONTENIDO.md`). | *Settings → Branches* |

**¿Por qué así?** Workers Builds publica en cuanto recibe un push, sin esperar las pruebas. El control está en la fusión: a `staging` y `main` solo llega código cuyo PR pasó todos los checks, así que lo que Cloudflare publica desde ahí ya está probado. Las ramas de trabajo también se publican, pero solo como preview, nunca en producción.

## Configuración de Workers Builds (se hace una vez, en el panel)

Workers & Pages → `polibyte-site` → *Settings* → *Build* → *Connect* → GitHub → `Herr-Zitronen/Polibyte_2.0`:

| Campo | Valor |
|---|---|
| Rama de producción | `main` |
| Builds for non-production branches | Activado |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Non-production branch deploy command | `npx wrangler versions upload` |
| Root directory | `/` |

La versión de Node sale de `.node-version` (la misma que usa CI). Si el dominio definitivo ya existe, se añade la variable de build `SITE_URL` (ver `docs/CONTENIDO.md`).

Las URL de preview tienen la forma `<rama>-polibyte-site.<subdominio>.workers.dev`. La de `staging` es la que se revisa antes de pasar a `main`.

## Reconstrucción semanal

El sitio decide al construirse qué eventos son próximos y cuáles ya pasaron. `.github/workflows/rebuild.yml` vuelve a construir y publicar `main` cada lunes, para que un evento que ya pasó no siga como próximo. Es lo único que publica desde GitHub y necesita dos secretos del repositorio:

- `CLOUDFLARE_ACCOUNT_ID`: el identificador de la cuenta.
- `CLOUDFLARE_API_TOKEN`: un token creado en Cloudflare con la plantilla *Edit Cloudflare Workers*.

Sin esos secretos, la corrida semanal falla y el resto sigue funcionando igual.
