# Bitácora

Registro de cambios y decisiones del sitio. Lo más reciente arriba. Formato y reglas en `docs/MEMORIA.md`.

---

## 2026-10-08 · Nosotros con la estructura de la referencia, Servicios con índice fijo, red animada en Inicio y cinta a color

- **Tipo:** cambio
- **Qué:** Nosotros sigue la estructura de la referencia del responsable: apertura con texto grande, la figura de paneles con etiquetas (Diseño, Montaje, Mantenimiento) y una red animada; luego el equipo; los valores como cuatro tarjetas unidas por una línea (una azul y una celeste); la historia y la misión; y un cierre celeste con la esfera. Servicios tiene una disposición nueva: apertura oscura con curvas de frío, un índice que se queda fijo a la izquierda y marca el servicio que se está leyendo (en celular, una barra de botones arriba), y cada servicio como un capítulo con foto grande. En Inicio, "Cada instalación empieza con un cálculo" queda a la izquierda y detrás, saliendo hacia la derecha, van los paneles y una red animada (`js/redes.js`, quieta con "reducir movimiento"). La cinta de clientes (Inicio y Proyectos) va a color, más grande y sin cortes.
- **Por qué:** pedido del responsable con una referencia de diseño.
- **Archivos:** `index.html`, `nosotros.html`, `servicios.html`, `proyectos.html`, `css/styles.css`, `css/nosotros.css`, `css/servicios.css`, `css/proyectos.css`, `js/redes.js` (nuevo), `js/servicios.js` (nuevo), `assets/images/figuras/esfera-marino.svg` (nuevo)
- **Estado:** dev (2026-10-08). Pendiente de aprobación para `main`.

## 2026-10-08 · Barra flotante, equipo en Nosotros, figuras de marca y cierre de la auditoría

- **Tipo:** cambio
- **Qué:** la cabecera de las seis páginas pasa a cápsulas flotantes (logo, menú al centro con la página actual marcada y botón oscuro "Cotizar" con flecha); en celular, el menú abre como una tarjeta. La sección de equipo de Nosotros se rehace: título, frase, cifras separadas por líneas y tarjetas con foto (en gris), nombre, punto celeste, cargo y una frase. Se agregan tres figuras propias en SVG (`assets/images/figuras/`): esfera de puntos (cierres de Servicios y Contacto), curvas de frío (cierre de Proyectos) y paneles que se vuelven red (Inicio, junto a "Cada instalación empieza con un cálculo"). Cierre de la auditoría: los efectos de movimiento al pasar el ratón ya no se disparan al tocar en celular, y 13 colores escritos a mano de la calculadora pasan a sus variables.
- **Por qué:** referencia de diseño enviada por el responsable (barra y sección de equipo) y pendientes de la auditoría.
- **Archivos:** las 6 páginas, `css/styles.css`, `css/nosotros.css`, `css/servicios.css`, `css/proyectos.css`, `css/contacto.css`, `css/proyecto.css`, `assets/images/figuras/*`
- **Estado:** dev (2026-10-08). Pendiente de aprobación para `main`.
- **Pendiente:** fotos reales del equipo (se ven siluetas con "Foto pendiente").

## 2026-10-08 · Auditoría de diseño (impeccable) y primera tanda de arreglos

- **Tipo:** arreglo
- **Qué:** imágenes comprimidas (de unos 9 MB a menos de 1 MB: `mantenimiento.jpg` 5,5 MB a 293 KB, `tunel.jpg`, logos y fondo de hielo, que pasa de PNG a JPG); logos renombrados sin espacios (`logo-kfc.png`, `logo-freshmar.png`). Contraste corregido en el texto celeste sobre fondo claro, en el pie de página y en el botón flotante de WhatsApp (ahora con texto verde oscuro). Foco de teclado y selección de texto con los colores de la marca. Enlaces y botones con zona de toque de 44 px. La calculadora queda con un solo `h1`. Los títulos del pie pasan de `h4` a `h2`, con el mismo estilo. Se quitan las etiquetas sobre los títulos de las páginas internas y los números 01-06 de Servicios. La aparición al hacer scroll es más suave.
- **Por qué:** auditoría con las skills de diseño instaladas el 2026-10-08.
- **Archivos:** las 6 páginas, `css/styles.css`, `css/proyecto.css`, `css/proyectos.css`, `css/servicios.css`, `assets/images/*`
- **Estado:** dev (2026-10-08). Pendiente de aprobación para `main`.
- **Pendiente:** `css/proyecto.css` usa 83 colores escritos a mano en vez de las variables; el `hover` de las tarjetas también se activa en celular. No se alcanzaron a revisar.

## 2026-10-08 · Poner el configurador "Arme su cuarto frío" con bodegas e informe técnico

- **Tipo:** cambio
- **Qué:** la calculadora de la Fase 1 pasa a ser un configurador: el cliente elige producto y ciudad, arma el cuarto con controles y ve en vivo el dibujo, cuánto le cabe, la luz del mes, de dónde le entra el calor y tarjetas sobre su producto (por norma colombiana). Puede elegir cómo guarda (canastilla, cajas, estibas o rieles), si el piso va aislado y, si el proyecto es grande, calcular una bodega por toneladas o por medidas (hasta 500.000 t). Al guardar recibe un número de proyecto y puede pedir la revisión por WhatsApp; FrigoPac recibe una ficha para la hoja de Google y un informe técnico interno (`informe.html`, no indexado). El diseño se trabajó antes en Claude.ai.
- **Por qué:** que el cliente arme su proyecto y que FrigoPac reciba el lead con todo el cálculo.
- **Archivos:** `proyecto.html` (se cambia el contenido de `main`; cabecera y pie quedan iguales), `css/proyecto.css`, `js/proyecto.js`, `js/proyecto-modelo.js` (nuevo), `informe.html` (nuevo), `css/informe.css` (nuevo), `js/informe.js` (nuevo), `docs/PENDIENTES.md`
- **Estado:** dev (2026-10-08). Llegó como parche desde Claude.ai (`arme-su-cuarto-v3.patch`); pendiente de aprobación para `main`.
- **Pendiente:** conectar la hoja de Google (dirección en `data-crm` de `proyecto.html`); fotos para "Cuartos parecidos"; el informe técnico se abre con el enlace, sin clave. En esta página se oculta el botón flotante de WhatsApp porque tapa la barra de abajo en celular.

## 2026-10-08 · Actualizar el motor de cálculo a v0.6.1

- **Tipo:** motor
- **Qué:** `js/frigopac-engine.js` pasa de v0.5.0 a v0.6.1: congelación con panel de 4" (Bogotá) o 5" (ciudades más calientes); deshielo con el compresor apagado de 1 °C hacia arriba y con resistencias a 0 °C o menos (criterio del jefe de FrigoPac); cálculo de bodegas grandes; temperaturas de conservación por norma.
- **Por qué:** datos nuevos de FrigoPac y la investigación de supuestos.
- **Archivos:** `js/frigopac-engine.js`
- **Estado:** dev (2026-10-08). Llegó como parche desde Claude.ai (`arme-su-cuarto-v3.patch`); pendiente de aprobación para `main`.

## 2026-10-08 · Diferenciar Servicios de Nosotros y arreglar los enlaces internos

- **Tipo:** cambio y arreglo
- **Qué:** Servicios abre con una franja azul oscura y un índice de seis fotos, una por servicio, que llevan a cada sección. Los servicios pasan de tarjetas con sombra a franjas de borde a borde que alternan blanco y gris. Las animaciones cambian: zoom en las fotos y una línea celeste bajo el nombre, en vez de tarjetas que suben (eso queda solo en Nosotros). Además se arregla un error de `js/main.js`: los enlaces que llevan a una parte de la misma página no hacían nada, porque el código usaba una variable de la cabecera vieja que se borró el 2026-10-07.
- **Por qué:** Servicios y Nosotros se veían iguales. El responsable notó que los botones de Servicios no funcionaban.
- **Archivos:** `servicios.html`, `css/servicios.css`, `js/main.js`
- **Estado:** dev (2026-10-08). Pendiente de aprobación para `main`.
- **Pendiente:** el error de los enlaces también está en la web pública (`main`).

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
