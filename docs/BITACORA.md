# Bitácora

Registro de cambios y decisiones del sitio. Lo más reciente arriba. Formato y reglas en `docs/MEMORIA.md`.

---

## 2026-10-08 · Rediseñar Servicios y Contacto, y poner el logo de WhatsApp

- **Tipo:** cambio
- **Qué:** Servicios pasa a tarjetas grandes y redondeadas, una por servicio, con dos fotos, cuatro puntos y un enlace para cotizar; arriba hay botones para saltar a cada servicio. Contacto tiene el botón verde de WhatsApp destacado, los otros medios en una lista y el formulario en una tarjeta flotante; se agrega un cierre con la calculadora. Donde se habla de WhatsApp (Contacto, Servicios y Nosotros) se usa el logo de WhatsApp y no un teléfono. Ya no hay carruseles en Servicios. El diseño se trabajó antes en el lienzo de Claude.
- **Por qué:** Servicios se veía anticuada frente a Proyectos y Nosotros; Contacto necesitaba el mismo estilo.
- **Archivos:** `servicios.html`, `contacto.html`, `nosotros.html`, `css/servicios.css` (nuevo, prefijo `sv-`), `css/contacto.css` (nuevo, prefijo `ct-`), `css/nosotros.css`, `docs/PENDIENTES.md`
- **Estado:** dev (2026-10-08). Pendiente de aprobación para `main`.
- **Pendiente:** el formulario de Contacto sigue redirigiendo a una dirección de ejemplo (`tuusuario.github.io/.../gracias.html`) que no existe; no se tocó (ver `docs/PENDIENTES.md`). Servicios usa solo las fotos que existen, por lo que las 9 fotos faltantes (C4) dejan de verse como huecos.

## 2026-10-07 · Quitar la sección repetida "Cómo trabajamos"

- **Tipo:** arreglo
- **Qué:** se quitan de Proyectos los 4 pasos de trabajo, que ya están en la portada. En Nosotros, la sección de valores pasa a llamarse "Nuestros valores", para que ninguna página repita el título "Cómo trabajamos".
- **Por qué:** lo pidió el responsable al revisar `dev`.
- **Archivos:** `proyectos.html`, `nosotros.html`, `css/proyectos.css`
- **Estado:** main (2026-10-08), con aprobación del responsable.

## 2026-10-07 · Rediseñar las páginas Proyectos y Nosotros

- **Tipo:** cambio
- **Qué:** Proyectos tiene encabezado con cifras, un proyecto destacado (Freshmar), la cinta de logos de la portada justo debajo, una galería con botones para filtrar por tipo, los 4 pasos de trabajo, un espacio para testimonio y un cierre con la calculadora. Nosotros tiene otro diseño, claro y redondeado: fotos superpuestas, historia en línea de tiempo, misión y visión en un bloque oscuro, valores, equipo y contacto directo. Se quitó de Nosotros lo que ya está en la portada. Los textos se reescribieron en lenguaje más sencillo. El diseño se trabajó antes en un lienzo de Claude.
- **Por qué:** las dos páginas se veían pobres y repetían la portada.
- **Archivos:** `proyectos.html`, `nosotros.html`, `css/proyectos.css` (nuevo, prefijo `py-`), `css/nosotros.css` (nuevo, prefijo `ns-`), `js/proyectos.js` (nuevo, filtros), `css/styles.css` (dos variables de color: `--color-secondary-dark` y `--color-secondary-soft`), `docs/PENDIENTES.md`
- **Estado:** main (2026-10-08), con aprobación del responsable.
- **Pendiente:** muchos datos van entre corchetes y marcados `RELLENO` (ver `docs/PENDIENTES.md`). Decidir si se publican así o después de llenarlos.

## 2026-10-07 · Unificar cabecera, pie y botón de WhatsApp en las 6 páginas

- **Tipo:** cambio
- **Qué:** la barra de cristal blanca de la portada pasa a todas las páginas, fija arriba, con la página actual marcada y una pestaña nueva, "Diseñe su cuarto frío". En celular tiene botón de menú (antes la portada no tenía menú en celular). Pie de página y botón de WhatsApp iguales en todas; el pie también enlaza la calculadora y dice © 2026. Se completa el final de `contacto.html`, que estaba cortado desde enero. El encabezado de las páginas internas (`.page-hero`) pasa de cuatro copias a una sola en `css/styles.css`. Se quitan dos fuentes que se descargaban sin usarse.
- **Por qué:** que el sitio se vea y se navegue igual en todas las páginas, y que la calculadora tenga su pestaña.
- **Archivos:** las 6 páginas, `css/styles.css`, `css/proyecto.css`, `js/main.js`, `AGENTS.md`, `docs/ARQUITECTURA.md`, `docs/PENDIENTES.md`
- **Estado:** main (2026-10-08), con aprobación del responsable.
- **Pendiente:** el aviso de datos de contacto es provisional (marcado `RELLENO`): falta la política de tratamiento de datos. En celular, el botón de WhatsApp tapa parte del botón principal de la portada (ya pasaba antes).

## 2026-10-06 · Documentar el proyecto, crear la rama `dev` y auditar el código

- **Tipo:** infraestructura
- **Qué:** se agregan `CLAUDE.md`, `AGENTS.md` y la carpeta `docs/` (arquitectura, reglas de memoria, bitácora, pendientes, guía de Cloudflare y auditoría). Se crea la rama `dev` para la vista previa.
- **Por qué:** dejar por escrito cómo está hecho el sitio y cómo se trabaja, antes de pasar a Cloudflare y seguir con la calculadora.
- **Archivos:** `CLAUDE.md`, `AGENTS.md`, `docs/*`
- **Estado:** main (2026-10-08)
- **Pendiente:** la auditoría encontró 4 problemas críticos (ver `docs/PENDIENTES.md`). Conectar Cloudflare según `docs/DESPLIEGUE_CLOUDFLARE.md`.

## 2026-09-25 · Publicar la calculadora "Diseñe su cuarto frío" (Project Engine, fase 1)

- **Tipo:** cambio
- **Qué:** página nueva `proyecto.html` con la calculadora: capacidad del equipo, cuánto cabe y costo de luz al mes. El botón del hero ("Diseñe y cotice su cuarto frío") y un botón nuevo en la sección de servicios llevan a ella. Se recupera el final de `css/styles.css`, que estaba cortado (botón de WhatsApp y animaciones de páginas internas). Se borran copias viejas sin uso (`styles.css` de la raíz y `css/*.html`).
- **Por qué:** fase 1 del plan de la web del motor (`frigopac-engine/docs/PLAN_WEB.md`).
- **Archivos:** `proyecto.html`, `css/proyecto.css`, `js/proyecto.js`, `js/frigopac-engine.js` (motor v0.5.0), `index.html`, `css/styles.css`
- **Estado:** main (`0e1ca52`). Llegó como parche desde Claude.ai, se aplicó en la rama `project-engine-fase1` y se fusionó a `main` con aprobación.
- **Pendiente:** decidir en qué pestaña del menú va la calculadora; SEO de la página.

## 2026-09-25 · Recibir el proyecto del motor

- **Tipo:** motor
- **Qué:** se descomprime `frigopac-engine` (motor en Python y su puerto a JavaScript, v0.5.0, con su historial de Git) en la carpeta hermana de este repositorio.
- **Por qué:** es la fuente de `js/frigopac-engine.js`.
- **Archivos:** ninguno de este repositorio.
- **Estado:** solo local. El repositorio `frigopac-engine` no existe todavía en GitHub.
- **Pendiente:** decidir si se sube a GitHub y si es público o privado.

## 2026-09-24 · Arreglar la grilla de proyectos y reanudar el video del hero

- **Tipo:** arreglo
- **Qué:** las tarjetas pequeñas de "Proyectos destacados" no llenaban su fila y, en celular, la tarjeta grande quedaba con 0 px de alto. Se corrige el CSS y se ajusta el tamaño de los títulos. Además, el video del hero se reanuda solo si el navegador lo pausa.
- **Por qué:** la sección se veía desordenada y el proyecto principal no aparecía en celular.
- **Archivos:** `css/styles.css`, `js/main.js`
- **Estado:** main (2026-10-08), con aprobación del responsable.

## 2026-09-24 · Decisión: mostrar antes de publicar

- **Tipo:** decisión
- **Qué:** todo cambio se construye y se muestra funcionando; el responsable lo aprueba; solo entonces se sube a `main`.
- **Por qué:** `main` es lo que ve el público.
- **Estado:** vigente. Desde 2026-10-06 la vista previa se hace en la rama `dev`.

## 2026-09-24 · Rediseñar la portada

- **Tipo:** cambio
- **Qué:** hero de pantalla completa con video, cabecera de cristal y un solo botón. Debajo, seis secciones nuevas: cinta de clientes, proceso en cuatro pasos, servicios, sectores, proyectos destacados en mosaico y llamado final. Tipografía Poppins y animaciones al hacer scroll.
- **Por qué:** que la portada se vea premium y lleve a cotizar.
- **Archivos:** `index.html`, `css/styles.css`, `js/main.js`, `assets/images/hero-bg.jpg`, `assets/videos/hero-bg.mp4`
- **Estado:** main (`646a3eb`).
- **Pendiente:** los metros cúbicos y nombres de los proyectos destacados y los puntos técnicos de las tarjetas de servicios son relleno.
