# Pendientes

Estado vivo del sitio. Cuando algo se resuelve, se tacha (`~~así~~`) con la fecha y se registra en `docs/BITACORA.md`. Los códigos (C1, A2…) remiten a `docs/AUDITORIA_2026-10-06.md`.

Última actualización: 2026-10-06.

## Decisiones del responsable

| # | Qué hay que decidir | Por qué importa |
|---|---|---|
| D1 | ¿Se publica el arreglo de la grilla de proyectos y del video? | Está hecho en local desde el 24 de septiembre (C3) |
| D2 | ¿En qué pestaña del menú va la calculadora y con qué nombre? | Hoy solo se llega desde la portada (M3) |
| D3 | ¿Qué hacer con las 9 fotos que faltan en servicios: conseguirlas o quitar esas diapositivas? | Hoy se ven huecos (C4) |
| D4 | ¿Se sube `frigopac-engine` a GitHub? ¿Público o privado? | Es la fuente del motor de la web |
| D5 | ¿Qué dominio se compra y dónde? | Define `og:url`, `canonical` y el correo de marca |
| D6 | ¿El repositorio de la web pasa a privado después de Cloudflare? | Hoy cualquiera puede leer el código y la documentación |

## Datos de relleno publicados

| Dónde | Qué es relleno | Qué se necesita |
|---|---|---|
| Portada, "Proyectos destacados" | Nombres de los 5 proyectos y sus volúmenes (800, 250, 180, 120 y 90 m³) | Proyectos reales con su tipo y volumen |
| Portada, tarjetas de servicios | Los puntos técnicos de las 3 tarjetas | Especificaciones reales de FRIGOPAC |

## Tareas

### Fase 0 · Urgente
| # | Tarea | Hallazgo |
|---|---|---|
| 1 | Publicar el arreglo de la grilla y del video (espera D1) | C3 |
| 2 | Completar `contacto.html` con aviso de tratamiento de datos (Ley 1581) | C1 |
| 3 | Menú en celular para la portada | C2 |
| 4 | Resolver las imágenes rotas de servicios (espera D3) | C4 |

### Fase 1 · Rápidas
| # | Tarea | Hallazgo |
|---|---|---|
| 5 | Comprimir imágenes pesadas | A1 |
| 6 | Quitar Cormorant Garamond y Montserrat | A2 |
| 7 | Favicon, imagen para compartir y Open Graph en todas las páginas | A3 |
| 8 | Renombrar `logo-kfc 2.png` y `logo-freshmar.png 3` | M7 |

### Fase 2 · Unificación
| # | Tarea | Hallazgo |
|---|---|---|
| 9 | Una sola cabecera en las seis páginas, sin estilos en línea | M1 |
| 10 | Mover `.page-hero` y los estilos en línea a `css/styles.css` | M2 |
| 11 | Calculadora en el menú (espera D2) | M3 |
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
| 20 | Limpieza de código y archivos sin uso, numeración del CSS y año del pie | B1, B2, B4 |

### Calculadora · siguientes fases
Según `frigopac-engine/docs/PLAN_WEB.md`: fase 2 (afinar y comparar), fase 3 (diagnóstico), fase 4 (lead con número de proyecto, informe y consentimiento) y el servidor para el Motor 4 cuando haya precios.
