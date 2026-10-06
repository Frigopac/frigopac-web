# CLAUDE.md — FRIGOPAC web

Sitio web de **FRIGOPAC SAS**, empresa de refrigeración industrial de Bogotá (Colombia) que diseña, instala y mantiene cuartos fríos, bodegas refrigeradas, salas de proceso y túneles de congelación.

## Qué es este proyecto

- Un sitio **estático**: HTML, CSS y JavaScript, sin framework ni paso de compilación.
- Páginas institucionales (inicio, nosotros, servicios, proyectos, contacto) y una herramienta interactiva, el **Project Engine** ("Diseñe su cuarto frío"), que calcula en el navegador qué equipo necesita un cuarto frío, cuánto producto le cabe y cuánto costará la luz al mes.
- El motor de cálculo **no se desarrolla aquí**: llega empaquetado desde el proyecto hermano `frigopac-engine`.
- El objetivo del sitio es que un cliente con un proyecto real entienda qué necesita y pida cotización.

## Dónde está cada cosa

| Necesito… | Leo… |
|---|---|
| Reglas de trabajo, ramas y definición de terminado | `AGENTS.md` (se carga al final de este archivo) |
| Cómo está construido el sitio | `docs/ARQUITECTURA.md` |
| Qué se ha hecho, cuándo y por qué | `docs/BITACORA.md` |
| Cómo registrar cada cambio | `docs/MEMORIA.md` |
| Qué falta por hacer | `docs/PENDIENTES.md` |
| Cómo publicar en Cloudflare | `docs/DESPLIEGUE_CLOUDFLARE.md` |
| Último diagnóstico del código | `docs/AUDITORIA_2026-10-06.md` |

## Principios

- Lo que está en `main` es lo que ve el público. Nada llega ahí sin aprobación explícita.
- Primero se muestra, después se publica.
- Ningún dato de negocio se inventa sin marcarlo como relleno.
- Se escribe para alguien que no es programador: claro, corto y en español.

@AGENTS.md
