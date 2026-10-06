# Reglas de memoria

Cómo se registra cada cambio para que cualquier persona o agente que llegue después (en Claude Code, en Claude.ai o en otra herramienta) sepa qué se hizo, por qué y en qué estado quedó.

## Los tres lugares

| Dónde | Qué guarda | Quién lo lee |
|---|---|---|
| `docs/BITACORA.md` | Cada cambio y cada decisión, en orden | Todos: personas y agentes |
| `docs/PENDIENTES.md` | Lo que falta: tareas, datos por reemplazar, decisiones abiertas | Todos |
| Memoria propia del agente (por ejemplo, la memoria de Claude Code) | Preferencias y forma de trabajar del responsable que no se deducen del código | Solo ese agente |

El repositorio es la fuente principal. La memoria del agente nunca repite lo que ya dice la bitácora.

## Cuándo se escribe

| Situación | Bitácora | Pendientes |
|---|---|---|
| Se cambia cualquier archivo del sitio | Entrada nueva | Si resuelve algo, se tacha; si deja algo abierto, se agrega |
| Se toma una decisión en el chat, aunque no cambie código | Entrada de tipo `decisión` | Si quedan tareas, se agregan |
| Se encuentra un problema y no se arregla | — | Se agrega |
| Se pone un dato de relleno | Se menciona en la entrada | Se agrega, con dónde está |
| Se publica en `main` | Se actualiza el **estado** de la entrada | — |
| Se actualiza el motor de cálculo | Entrada de tipo `motor`, con versión anterior y nueva | — |

**Regla de oro**: la entrada de la bitácora va en el **mismo commit** que el cambio. Un cambio sin entrada no está terminado.

## Formato de una entrada

```markdown
## AAAA-MM-DD · Título corto en imperativo

- **Tipo:** cambio | arreglo | contenido | decisión | motor | infraestructura
- **Qué:** una a tres líneas, en lenguaje simple.
- **Por qué:** una línea.
- **Archivos:** `ruta/archivo`, `ruta/otro`
- **Estado:** local | dev | main (`commit`)
- **Pendiente:** lo que quedó abierto o lo que debe decidir el responsable (opcional).
```

## Reglas de escritura

1. **Fechas absolutas** (`2026-10-06`), nunca "ayer" o "la semana pasada".
2. **Lo más reciente arriba.**
3. **Corto.** Si hace falta explicar mucho, va a `docs/` y la entrada enlaza.
4. **No se reescribe el pasado.** Una entrada vieja solo cambia su **Estado**; si algo estaba mal, se corrige con una entrada nueva.
5. **Nada sensible.** El repositorio es público: sin claves, precios, datos personales de clientes ni cifras internas.
6. **Lenguaje simple.** Lo debe entender alguien que no programa.

## Cambios que vienen de Claude.ai u otra herramienta

Si un cambio llega como parche o archivo preparado en otro chat, quien lo aplica en el repositorio revisa que traiga su entrada de bitácora. Si no la trae, la escribe antes del commit.

## Memoria propia del agente

Se guarda ahí solo lo que no está en el repositorio y sirve en futuras sesiones:

- Cómo prefiere trabajar el responsable (por ejemplo: mostrar antes de publicar, respuestas cortas).
- Correcciones que hizo sobre la forma de trabajar, con el porqué.
- Contexto del negocio que no cabe en el código.

No se guarda ahí: el historial de cambios, la estructura del código ni los pendientes. Eso vive en `docs/`.

## Revisión periódica

Al empezar una tarea grande, leer las últimas entradas de la bitácora y `docs/PENDIENTES.md`. Si algo de la memoria propia contradice al repositorio, manda el repositorio y se corrige la memoria.
