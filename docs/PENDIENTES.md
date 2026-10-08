# Pendientes

Estado vivo del sitio. Cuando algo se resuelve, se tacha (`~~así~~`) con la fecha y se registra en `docs/BITACORA.md`. Los códigos (C1, A2…) remiten a `docs/AUDITORIA_2026-10-06.md`.

Última actualización: 2026-10-07.

## Decisiones del responsable

| # | Qué hay que decidir | Por qué importa |
|---|---|---|
| ~~D1~~ | ~~¿Se publica en `main` lo que está en `dev`?~~ | Resuelto 2026-10-08: publicado en `main` |
| ~~D2~~ | ~~¿En qué pestaña del menú va la calculadora?~~ | Resuelto 2026-10-07: pestaña "Diseñe su cuarto frío", antes de Contacto |
| D9 | El formulario de Contacto manda al visitante a `tuusuario.github.io/frigopac-web/gracias.html`, una dirección de ejemplo y una página que no existe. ¿Creamos `gracias.html` y ponemos la dirección real? | Hoy, después de enviar una solicitud, la persona ve un error aunque el correo sí llegue |
| D7 | Política de tratamiento de datos de FRIGOPAC SAS (NIT, dirección, correo para consultas) | El aviso del formulario de contacto es provisional (C1) |
| D8 | Llenar los datos entre corchetes de Proyectos y Nosotros | Se publicó el 2026-10-08 con `[Ciudad]`, `[Año]`, `[Nombre]`… visibles al público |
| D3 | ¿Qué hacer con las 9 fotos que faltan en servicios: conseguirlas o quitar esas diapositivas? | Hoy se ven huecos (C4) |
| D4 | ¿Se sube `frigopac-engine` a GitHub? ¿Público o privado? | Es la fuente del motor de la web |
| D5 | ¿Qué dominio se compra y dónde? | Define `og:url`, `canonical` y el correo de marca |
| D6 | ¿El repositorio de la web pasa a privado después de Cloudflare? | Hoy cualquiera puede leer el código y la documentación |

## Datos de relleno publicados

| Dónde | Qué es relleno | Qué se necesita |
|---|---|---|
| Portada, "Proyectos destacados" | Nombres de los 5 proyectos y sus volúmenes (800, 250, 180, 120 y 90 m³) | Proyectos reales con su tipo y volumen |
| Portada, tarjetas de servicios | Los puntos técnicos de las 3 tarjetas | Especificaciones reales de FRIGOPAC |
| `proyectos.html`, encabezado | Número de departamentos con obra (`[N]`) | El número real |
| `proyectos.html`, proyecto destacado (Freshmar) | Texto del reto y la solución, temperatura, capacidad y ciudad | Datos reales del proyecto |
| `proyectos.html`, galería | Frase de cada proyecto, ciudad, temperatura y volumen de las 6 tarjetas | Datos reales de cada obra |
| `proyectos.html`, testimonio | Cita, nombre, cargo y empresa | Un testimonio real con permiso del cliente |
| `nosotros.html`, "Cómo empezamos" | Quién fundó la empresa y los años de la línea de tiempo | La historia real |
| `nosotros.html`, "El equipo" | Fotos, nombres y cargos | Datos y fotos del equipo |
| `contacto.html`, debajo del botón de enviar | Aviso de tratamiento de datos, sin enlace a la política | La política de FRIGOPAC SAS (D7) |

## Tareas

### Fase 0 · Urgente
| # | Tarea | Hallazgo |
|---|---|---|
| ~~1~~ | ~~Publicar el arreglo de la grilla y del video~~ (2026-10-08, en `main`) | C3 |
| 2 | ~~Completar `contacto.html`~~ (2026-10-07, en `dev`). Falta el enlace a la política de datos (D7) | C1 |
| ~~3~~ | ~~Menú en celular para la portada~~ (2026-10-07, en `dev`) | C2 |
| ~~4~~ | ~~Resolver las imágenes rotas de servicios~~ (2026-10-08, en `dev`: Servicios usa solo fotos existentes) | C4 |

### Fase 1 · Rápidas
| # | Tarea | Hallazgo |
|---|---|---|
| 5 | Comprimir imágenes pesadas | A1 |
| ~~6~~ | ~~Quitar Cormorant Garamond y Montserrat~~ (2026-10-07, en `dev`) | A2 |
| 7 | Favicon, imagen para compartir y Open Graph en todas las páginas | A3 |
| 8 | Renombrar `logo-kfc 2.png` y `logo-freshmar.png 3` | M7 |
| 8b | En celular, el botón flotante de WhatsApp tapa parte del botón principal de la portada | Nuevo |

### Fase 2 · Unificación
| # | Tarea | Hallazgo |
|---|---|---|
| ~~9~~ | ~~Una sola cabecera en las seis páginas~~ (2026-10-07, en `dev`) | M1 |
| 10 | ~~Mover `.page-hero` a `css/styles.css`~~ (2026-10-07). Faltan los estilos en línea del contenido de las páginas internas | M2 |
| ~~11~~ | ~~Calculadora en el menú~~ (2026-10-07, en `dev`) | M3 |
| 12 | Indicador de fases: mostrar solo lo que existe | M4 |
| 13 | Control de la copia del motor (`.gitattributes` y aviso de versión) | M5 |
| 14 | Variables de color de estado y componentes base en la calculadora | B3 |
| 15 | Región `aria-live` solo para la cifra principal | M6 |

### Fase 3 · Plataforma
| # | Tarea | Hallazgo |
|---|---|---|
| 16 | Conectar Cloudflare Pages con preview de `dev` (`docs/DESPLIEGUE_CLOUDFLARE.md`) | B5 |
| 17 | `canonical`, `robots.txt`, `sitemap.xml` y `LocalBusiness` (espera D5) | A3 |
| 18 | Cierre comercial único con número de proyecto y consentimiento | A4 |
| 19 | Reemplazar los datos de relleno | M8 |
| 20 | Limpieza de código y archivos sin uso y numeración del CSS (el año del pie ya quedó: 2026-10-07) | B1, B2, B4 |

### Calculadora · siguientes fases
Según `frigopac-engine/docs/PLAN_WEB.md`: fase 2 (afinar y comparar), fase 3 (diagnóstico), fase 4 (lead con número de proyecto, informe y consentimiento) y el servidor para el Motor 4 cuando haya precios.
