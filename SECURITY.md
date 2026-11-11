# Política de seguridad

## Cómo informar de una vulnerabilidad

Si encuentras un problema de seguridad, no abras un issue público. Usa el informe privado de GitHub: pestaña **Security** del repositorio, botón **Report a vulnerability**. Solo lo ve quien mantiene el proyecto.

Incluye qué encontraste, cómo reproducirlo y qué impacto crees que tiene. Respondo en un plazo de siete días.

## Alcance

El sitio es estático: Astro genera HTML, CSS y un poco de JavaScript en el build, y Cloudflare Workers sirve esos archivos. No hay base de datos, cuentas de usuario ni servidor propio que procese datos.

- **Dentro del alcance:** el código de este repositorio, los workflows de GitHub Actions y la configuración de despliegue (`wrangler.jsonc`).
- **Fuera del alcance:** el formulario de inscripción, que es un Microsoft Forms externo; los servicios de terceros (GitHub, Cloudflare) y los avisos de dependencias que solo afectan a herramientas de desarrollo y no llegan al sitio publicado.

## Versiones con soporte

Solo la rama `main`, que es la que está publicada.
