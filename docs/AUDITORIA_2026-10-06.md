# Auditoría de arquitectura y maquetación — 6 de octubre de 2026

## Alcance y método

**Qué se revisó**
- El repositorio `frigopac-web` en `main` (commit `0e1ca52`) y los cambios locales sin commit.
- La integración de la calculadora (Project Engine, fase 1) con el resto del sitio y con el proyecto `frigopac-engine`.

**Cómo**
- Lectura completa de las 6 páginas, las 2 hojas de estilo y los 3 scripts.
- Cruce de cada imagen, fuente y script referenciado contra los archivos reales.
- Comparación byte a byte del motor de la web contra `frigopac-engine/engine-js/dist/`.
- Revisión del historial de Git y pruebas en el navegador (local y sitio publicado).

**Qué no se revisó**: métricas de Lighthouse o Core Web Vitals, celulares reales, lectores de pantalla, exactitud del contenido de nosotros y proyectos, y la física del motor (tiene sus propias pruebas en `frigopac-engine`).

## Resumen

La base es sana. El sistema de diseño (variables en `:root`) es claro, la portada y la calculadora comparten tipografía y colores, y la calculadora está bien aislada: prefijo propio en el CSS, nada de física en la interfaz y el motor idéntico a su referencia v0.5.0.

Los problemas graves no están en la calculadora sino alrededor de ella. Cuatro afectan hoy a cualquier visitante:

1. **`contacto.html` está cortado** desde que se creó. Ahí termina el botón "Cotizar" de la cabecera.
2. **En celular, la portada no tiene menú.**
3. **La grilla de proyectos se descuadra**, y en celular la tarjeta grande desaparece. Está corregido en local, sin publicar.
4. **Nueve fotos de servicios no existen.**

| Severidad | Cantidad | Qué significa |
|---|---|---|
| Crítica | 4 | Rompe la experiencia de cualquier visitante hoy |
| Alta | 4 | Cuesta clientes o posicionamiento |
| Media | 8 | Hace el sitio difícil de mantener o confunde |
| Baja | 5 | Orden y limpieza |

## Hallazgos

### Críticos

**C1 · `contacto.html` incompleto**
- *Evidencia*: el archivo termina en la línea 441 dentro de un `<p>`, sin cerrar el formulario, sin pie de página, sin scripts y sin `</html>`. Así está en todas sus versiones, desde su creación el 29 de enero de 2026.
- *Impacto*: el botón "Cotizar" de la cabecera de cinco páginas lleva aquí. Sin `main.js`, el menú de celular no abre. No hay pie de página ni botón de WhatsApp, y no se ve el aviso de tratamiento de datos que exige la Ley 1581 de 2012 para un formulario que pide datos personales. Que el formulario envíe depende de que el navegador cierre solo las etiquetas.
- *Arreglo*: reescribir el final de la página (cierre del formulario, aviso de datos, pie y scripts) con la misma estructura de las demás.

**C2 · La portada no tiene menú en celular**
- *Evidencia*: `css/styles.css:528` oculta `.hero__menu` y solo lo muestra desde 768 px (línea 539). `index.html` no tiene botón de menú ni `#mobileMenu`.
- *Impacto*: en celular, donde llega la mayoría de clientes, la portada solo muestra "Cotizar". No hay forma de ir a servicios, proyectos o nosotros desde arriba.
- *Arreglo*: el mismo botón y menú móvil de las páginas internas, adaptado a la cabecera de la portada.

**C3 · Grilla de proyectos destacados**
- *Evidencia*: `.projects__item { aspect-ratio: 4/3 }` está declarada después del bloque para escritorio y lo anula. Las tarjetas pequeñas no llenan su fila. En celular, `.projects__item--large { aspect-ratio: auto }` deja la tarjeta grande con 0 px de alto.
- *Impacto*: huecos desiguales en escritorio; el proyecto principal invisible en celular.
- *Estado*: corregido en local el 24 de septiembre (`css/styles.css`, sin commit), junto con la reanudación del video del hero (`js/main.js`). Falta aprobarlo y publicarlo.

**C4 · Nueve imágenes rotas en servicios**
- *Evidencia*: `servicios.html` líneas 296, 341, 380, 386, 425, 428, 431, 476 y 521 apuntan a `cuarto-frio-3`, `bodega-3`, `sala-proceso-1`, `sala-proceso-3`, `tunel-1`, `tunel-2`, `tunel-3`, `puertas-3` y `mantenimiento-3`, que no existen.
- *Impacto*: los carruseles muestran huecos.
- *Arreglo*: subir las fotos reales o quitar esas diapositivas.

### Altos

**A1 · Imágenes demasiado pesadas**
- *Evidencia*: `mantenimiento.jpg` 5,4 MB (`index.html:155`); `logo-laplanice.png` 1,7 MB mostrado a 34 px de alto (`index.html:64`); `bg-hielo-proyectos.png` 1,7 MB (`css/styles.css:855`); `tunel.jpg` 1,6 MB.
- *Impacto*: la portada carga unos 2,5 MB antes del primer scroll y cerca de 9 MB completa. En datos móviles se siente lenta.
- *Arreglo*: fotos a JPG o WebP de menos de 300 KB, logos de menos de 50 KB. Ahorro estimado: más de 8 MB.

**A2 · Dos fuentes que se descargan y no se usan**
- *Evidencia*: Cormorant Garamond y Montserrat se piden en cinco páginas (`index.html:18` y equivalentes) y ningún CSS las usa.
- *Arreglo*: quitarlas del enlace de Google Fonts.

**A3 · SEO técnico incompleto**
- `assets/images/favicon.svg` no existe (`index.html:15`, `proyecto.html:8`) y las otras cuatro páginas no declaran favicon.
- `og:image` apunta a un archivo inexistente y con ruta relativa (`index.html:11`); `og:url` apunta a `https://frigopac.com`, que no es donde está publicado el sitio (`index.html:12`).
- No hay `rel="canonical"`, `robots.txt`, `sitemap.xml` ni datos estructurados de empresa local (`LocalBusiness`).
- Las páginas internas y la calculadora no tienen etiquetas Open Graph: al compartir un enlace por WhatsApp no sale imagen ni descripción.

**A4 · Dos caminos de contacto que no dejan registro**
- La cabecera lleva al formulario (roto, C1), que envía a un Gmail por formsubmit.co. La calculadora y el botón flotante llevan a WhatsApp.
- Ninguno asigna un número de proyecto ni guarda el consentimiento de datos, así que no hay forma de medir cuántos clientes llegan por la calculadora. El plan del motor lo contempla en la fase 4 (`frigopac-engine/docs/PLAN_WEB.md`).

### Medios

**M1 · Dos sistemas de navegación.** La portada usa `.hero__nav` y las demás páginas `.header`. `proyecto.html` fuerza la cabecera clara con 10 estilos en línea (líneas 19 a 34). El menú está copiado en seis archivos más cinco menús móviles: cambiar una opción del menú obliga a editar once bloques.

**M2 · Estilos embebidos y en línea.** Las cuatro páginas internas repiten en su propio `<style>` el mismo `.page-hero`, y cada una tiene entre 10 y 16 atributos `style=""`.

**M3 · La calculadora no está en el menú.** Solo se llega por dos botones de la portada (`index.html:48` y `index.html:108`). Desde cualquier otra página no hay camino.

**M4 · El indicador de fases promete pasos que no existen.** `proyecto.html:59-64` muestra Explorar, Afinar, Diagnóstico y Cotizar; solo existe el primero.

**M5 · La copia del motor no tiene control.** `js/frigopac-engine.js` es idéntico a `engine-js/dist/frigopac-engine.js` v0.5.0, salvo el salto de línea final (Git en Windows lo convierte a CRLF). Nada avisa si la web queda con un motor viejo, y no hay `.gitattributes` que marque el archivo como generado.

**M6 · Accesibilidad de la calculadora.** `aria-live="polite"` cubre todo el panel de resultados (`proyecto.html:162`): con cada movimiento de un slider, un lector de pantalla puede intentar leer el panel entero. Lo demás está bien resuelto: `fieldset` con `legend`, `label` en cada control y botones de opción con `aria-checked`.

**M7 · Nombres de archivo frágiles.** `logo-kfc 2.png` y `logo-freshmar.png 3` (espacio y extensión alterada). Funcionan hoy, pero se rompen con facilidad al copiar, renombrar o migrar.

**M8 · Datos de relleno publicados.** Los metros cúbicos y nombres de los cinco proyectos destacados y los puntos técnicos de las tres tarjetas de servicios de la portada son relleno. Ver `docs/PENDIENTES.md`.

### Bajos

**B1 · Código y archivos sin uso.** Sección 11 del CSS (testimonios), bloque 3 de `main.js` (contador de cifras, `#stats` no existe), y tres imágenes que nadie usa: `cuarto-frio-interior.jpg`, `fondo-clientes.jpg` y `puertas.jpg` (unos 630 KB).

**B2 · Numeración y comentarios desactualizados** en `css/styles.css`: salta de la sección 14 a la 17 y la 6 dice "glass card estilo RIVR", que ya no describe el hero.

**B3 · Piezas duplicadas en la calculadora.** `.pe-container` repite `.container` y `.pe-btn` repite `.btn`. Hay seis colores fijos para los estados de alerta que deberían ser variables (`--color-success`, `--color-warning`, `--color-danger`).

**B4 · Año del pie de página** en © 2024.

**B5 · La documentación se publica con el sitio.** GitHub Pages sirve todo el repositorio, incluidos `docs/`, `AGENTS.md` y `CLAUDE.md`. La guía de Cloudflare propone publicar solo los archivos del sitio.

## La calculadora dentro del sitio

| Aspecto | Estado | Comentario |
|---|---|---|
| Motor igual a la referencia | Bien | Idéntico a v0.5.0 del motor |
| Física fuera de la interfaz | Bien | `proyecto.js` solo arma la entrada y pinta |
| Control de versión del motor | Falta | Copia manual, sin verificación (M5) |
| Colores, fuentes y espacios | Bien | 135 usos de las variables del sitio |
| Colores de estado | A medias | Seis colores fijos (B3) |
| Componentes base | A medias | Contenedor y botón propios (B3) |
| Cabecera y pie | A medias | Misma cabecera que las internas, forzada con estilos en línea (M1) |
| Cómo se llega | A medias | Dos botones en la portada; no está en el menú (M3) |
| Celular | Bien | Móvil primero, barra fija con los tres resultados |
| Accesibilidad | A medias | Formulario bien etiquetado; región `aria-live` demasiado grande (M6) |
| Cierre comercial | A medias | WhatsApp con resumen; sin número de proyecto ni registro (A4) |
| Fases 2 a 4 | Falta | Anunciadas, no construidas (M4) |
| Peso | Bien | Motor de ~100 KB sin dependencias, solo en `proyecto.html` |
| SEO | Falta | Sin Open Graph, canonical ni datos estructurados (A3) |

## Plan de acción

### Fase 0 · Urgente
| # | Qué | Hallazgo |
|---|---|---|
| 1 | Publicar el arreglo de la grilla y del video (ya hecho en local) | C3 |
| 2 | Completar `contacto.html`, con aviso de tratamiento de datos | C1 |
| 3 | Menú en celular para la portada | C2 |
| 4 | Fotos de servicios: subir las reales o quitar diapositivas | C4 |

### Fase 1 · Rápidas y de alto impacto
| # | Qué | Hallazgo |
|---|---|---|
| 5 | Comprimir imágenes | A1 |
| 6 | Quitar fuentes sin uso | A2 |
| 7 | Favicon, imagen para compartir y Open Graph en todas las páginas | A3 |
| 8 | Renombrar archivos con espacios | M7 |

### Fase 2 · Unificación
| # | Qué | Hallazgo |
|---|---|---|
| 9 | Una sola cabecera (escritorio y celular) en las seis páginas, sin estilos en línea | M1 |
| 10 | Pasar `.page-hero` y los estilos en línea a `css/styles.css` | M2 |
| 11 | Decidir la entrada a la calculadora en el menú | M3 |
| 12 | Indicador de fases: mostrar solo lo que existe | M4 |
| 13 | Control del motor: `.gitattributes`, aviso si la versión no coincide | M5 |
| 14 | Variables de estado y componentes base compartidos en la calculadora | B3 |
| 15 | Región `aria-live` solo para la cifra principal | M6 |

### Fase 3 · Plataforma
| # | Qué | Hallazgo |
|---|---|---|
| 16 | Cloudflare Pages con preview de `dev`; luego repositorio privado y GitHub Pages apagado | B5 |
| 17 | `canonical`, `robots.txt`, `sitemap.xml` y `LocalBusiness` con el dominio definitivo | A3 |
| 18 | Un solo cierre comercial con número de proyecto y consentimiento (Pages Functions) | A4 |
| 19 | Reemplazar los datos de relleno | M8 |
| 20 | Limpieza: código y archivos sin uso, numeración y año | B1, B2, B4 |
