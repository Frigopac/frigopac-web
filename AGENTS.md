# AGENTS.md — Cómo trabajar en este repositorio

Instrucciones para cualquier agente de código (Claude Code, Claude.ai, Codex, Cursor u otro) y para las personas que colaboren en el sitio de FRIGOPAC.

## 1. El proyecto en una línea

Sitio estático de FRIGOPAC (HTML, CSS y JavaScript, sin compilación) con una calculadora de cuartos fríos que corre en el navegador. Detalle técnico en `docs/ARQUITECTURA.md`.

## 2. Reglas no negociables

1. **Una opinión no es una orden.** Si la petición es una pregunta o pide una opinión, se responde y no se toca ningún archivo.
2. **`main` es producción.** Cada push a `main` cambia la página pública. Solo se hace con aprobación explícita en el chat, para ese cambio puntual. Una aprobación no vale para el siguiente cambio.
3. **Mostrar antes de publicar.** Todo cambio se ve primero en local o en el preview de `dev`.
4. **No inventar datos de negocio**: cifras, clientes, proyectos, años de experiencia, metros cúbicos, testimonios. Si hace falta un relleno, se marca en el HTML con `<!-- RELLENO: ... -->` y se anota en `docs/PENDIENTES.md`.
5. **La física no se toca aquí.** `js/frigopac-engine.js` es un archivo generado por el proyecto `frigopac-engine`; no se edita a mano. La IA no calcula. Los precios nunca van en el navegador.
6. **Sin frameworks ni compilación** salvo decisión explícita registrada en `docs/BITACORA.md`.
7. **Cada cambio se registra** según `docs/MEMORIA.md`. Un cambio sin su entrada en la bitácora no está terminado.
8. **Nada sensible en el repositorio.** Es público: sin claves, tokens, precios ni datos personales de clientes.
9. **No arreglar de paso lo que no se pidió.** Si aparece un problema fuera del alcance, se reporta y se anota en `docs/PENDIENTES.md`; no se corrige sin permiso.

## 3. Ramas y flujo de trabajo

```
tarea/<nombre>  ──►  dev (preview)  ──►  main (público)
```

| Rama | Para qué | Quién la actualiza |
|---|---|---|
| `main` | Lo que ve el público | Solo desde `dev`, con aprobación |
| `dev` | Integración y vista previa | Al terminar cada tarea |
| `tarea/<descripcion-corta>` | Una por tarea | El agente que la hace |

Paso a paso:

1. Partir de `dev` actualizado: `git switch dev` y `git pull`.
2. Crear la rama de la tarea: `git switch -c tarea/<nombre>`.
3. Hacer el cambio y probarlo en local (sección 4).
4. Escribir la entrada en `docs/BITACORA.md` y actualizar `docs/PENDIENTES.md`.
5. Commit pequeño, en español, en imperativo.
6. Fusionar en `dev` y subir. Revisar el preview.
7. Con aprobación explícita: fusionar `dev` en `main` (fast-forward) y subir.

Mientras Cloudflare Pages no esté conectado, `dev` no tiene URL propia y el preview se hace en local. Hoy GitHub Pages publica `main` en https://frigopac.github.io/frigopac-web/.

## 4. Cómo ver el sitio en local

```bash
python -m http.server 8000
```

Desde la carpeta del repositorio, y abrir http://localhost:8000. Si el navegador muestra una versión vieja, recargar con `Ctrl + Shift + R`.

## 5. Convenciones

**HTML**
- Semántico (`header`, `main`, `section`, `article`, `footer`), un solo `h1` por página.
- Textos en español de Colombia, trato de "usted", sin frases de relleno ("somos líderes del mercado").

**CSS**
- `css/styles.css` contiene el sistema de diseño y lo global. Una página especial puede tener su hoja propia con prefijo (`css/proyecto.css` usa `pe-`).
- Colores, fuentes, tamaños, espacios, sombras y radios siempre con las variables de `:root`.
- Sin estilos en línea (`style="..."`) ni bloques `<style>` nuevos.
- Clases estilo BEM: `bloque__elemento--modificador`.
- Toda animación respeta `prefers-reduced-motion`.

**Piezas compartidas**
- La cabecera, el pie de página y el botón de WhatsApp son idénticos en las seis páginas (detalle en `docs/ARQUITECTURA.md`, sección 4). Si se cambia uno, se cambian los seis en el mismo commit, usando `index.html` como referencia.

**JavaScript**
- Vanilla, sin dependencias. Cada bloque comprueba que sus elementos existen antes de usarlos.
- `js/main.js` es global; la lógica propia de una página va en su archivo.

**Imágenes y video**
- Fotos en JPG o WebP de máximo 300 KB; logos en SVG o PNG de máximo 50 KB.
- Nombres en minúsculas, con guiones, sin espacios ni tildes.
- `loading="lazy"` en todo lo que esté debajo del primer pantallazo y `alt` que describa la imagen.

## 6. Definición de terminado

- [ ] Se ve bien a 375 px (celular) y a 1280 px (escritorio), sin scroll horizontal.
- [ ] Sin errores en la consola ni imágenes rotas.
- [ ] Las animaciones nuevas respetan `prefers-reduced-motion`.
- [ ] Entrada en `docs/BITACORA.md` y `docs/PENDIENTES.md` al día.
- [ ] Mostrado al responsable y aprobado antes de llegar a `main`.

## 7. Cómo comunicarse con el responsable del proyecto

- En español, con frases cortas y sin jerga. Si hace falta un término técnico, se explica en una línea.
- Decir siempre en qué carpeta o repositorio se está trabajando.
- Al terminar: en 3 a 5 líneas, qué quedó, qué falta y qué debe decidir.
- Si algo no se pudo hacer o salió mal, decirlo de frente.

## 8. Proyectos relacionados

| Carpeta | Qué es | Relación con este repositorio |
|---|---|---|
| `frigopac-engine` | Motor de cálculo: referencia en Python y su puerto a JavaScript | De ahí sale `js/frigopac-engine.js`. Cómo actualizarlo: `docs/ARQUITECTURA.md`, sección 7 |
| `frigopac-herramienta-estrategia` | Documentos de estrategia de la herramienta | Solo consulta |
