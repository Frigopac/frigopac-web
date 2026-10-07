# Bitácora

Registro de cambios y decisiones del sitio. Lo más reciente arriba. Formato y reglas en `docs/MEMORIA.md`.

---

## 2026-10-06 · Documentar el proyecto, crear la rama `dev` y auditar el código

- **Tipo:** infraestructura
- **Qué:** se agregan `CLAUDE.md`, `AGENTS.md` y la carpeta `docs/` (arquitectura, reglas de memoria, bitácora, pendientes, guía de Cloudflare y auditoría). Se crea la rama `dev` para la vista previa.
- **Por qué:** dejar por escrito cómo está hecho el sitio y cómo se trabaja, antes de pasar a Cloudflare y seguir con la calculadora.
- **Archivos:** `CLAUDE.md`, `AGENTS.md`, `docs/*`
- **Estado:** dev
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
- **Estado:** dev (2026-10-07). Pendiente de aprobación para `main`.

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
