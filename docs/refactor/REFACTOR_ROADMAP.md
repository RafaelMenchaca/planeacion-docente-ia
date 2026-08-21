# Roadmap del refactor de Biblioteca

Este es el único roadmap operativo vigente del frontend. Define **qué** se ejecutará y qué evidencia permite avanzar. El [`REFACTOR_PLAYBOOK.md`](REFACTOR_PLAYBOOK.md) define **cómo** trabajar en cada sesión.

**Biblioteca es el único flujo visual principal vigente y la dirección del refactor es Biblioteca modular.** El explorador visual jerárquico antiguo es legacy: se aísla antes de considerar su eliminación y nunca se convierte nuevamente en arquitectura principal. La jerarquía técnica se conserva cuando sostenga datos, relaciones, endpoints, selectores, compatibilidad o Archivados.

## Responsabilidad documental

| Documento | Responsabilidad |
| --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | Reglas obligatorias para agentes. |
| [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) | Arquitectura actual y objetivo arquitectónico. |
| [`REFACTOR_PLAYBOOK.md`](REFACTOR_PLAYBOOK.md) | Método para ejecutar cada sesión. |
| `REFACTOR_ROADMAP.md` | Fases, orden, resultados y criterios de salida. |
| [`SESSION_HANDOFF.md`](SESSION_HANDOFF.md) | Estado de la última sesión y siguiente paso. |
| [`TEST_MATRIX.md`](TEST_MATRIX.md) | Validaciones funcionales acumulativas. |
| Backend [`DATABASE_SCHEMA.md`](../../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md) | Datos y relaciones. |
| Backend [`AI_GENERATION_CONTRACTS.md`](../../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md) | Prompts y contratos de generación IA. |

El backlog histórico del backend no es un plan operativo del frontend. Las decisiones transversales se registran en [`REFACTOR_DECISIONS.md`](REFACTOR_DECISIONS.md).

## Resumen

| Fase | Nombre | Objetivo principal | Riesgo | Estado |
| --- | --- | --- | --- | --- |
| 0 | Línea base y protección | Establecer punto seguro | Bajo | Completada |
| 1 | Extracciones aisladas | Crear primeros módulos | Bajo | Completada |
| 2 | Acciones por dominio | Separar documentos | Bajo/medio | Completada |
| 3 | Capa API frontend | Centralizar llamadas HTTP | Medio | Completada |
| 4 | Generación y polling | Separar procesos largos | Alto | Completada |
| 5 | Estado de Biblioteca | Reducir `explorerState` | Alto | Completada |
| 6 | Render y eventos | Dividir `biblioteca.page.js` | Medio/alto | Completada |
| 7 | Desacoplar dashboard | Quitar dependencias activas | Alto | Completada |
| 8 | Aislar legacy visual | Separar explorador antiguo | Medio | Completada |
| 9 | Eliminar legacy confirmado | Borrar código sin consumidores | Alto | En progreso |
| 10 | Consolidación final | Retirar wrappers y deuda | Medio | Pendiente |

Los únicos estados válidos son `Pendiente`, `En progreso`, `Completada`, `Bloqueada` y `Cancelada`. No se marca una fase como completada sin evidencia de todos sus criterios de salida.

## Fase 0 — Línea base y protección

### Objetivo

Asegurar un estado conocido, documentado y recuperable antes de modificar código.

### Estado

**Completada.** Se confirmaron repositorios limpios, commits recuperables, tags previos al refactor, documentación canónica y validación manual acumulativa del flujo vigente. El usuario confirmó generación principal, navegación, previews, descargas, apertura de archivos, tabs, recarga y ausencia de regresiones relacionadas. Las deudas backend conocidas no bloquean esta línea base.

### Dependencias

Ninguna fase anterior. Requiere acceso verificable a frontend, backend y sus remotos.

### Alcance permitido

- Alinear reglas frontend y backend.
- Declarar Biblioteca como flujo canónico y el explorador visual como legacy.
- Proteger schema, contratos IA, observabilidad y jerarquía técnica.
- Mantener la test matrix.
- Verificar commits, tags, limpieza de repositorios y validación manual.

### Fuera de alcance

- Mover, eliminar o reescribir código.
- Cambiar comportamiento, payloads, endpoints, schema, prompts, polling o jobs.
- Declarar correctas pruebas manuales no ejecutadas.

### Archivos o áreas candidatas

Documentación frontend y backend, `git status`, historial y tags; aplicación en navegador solo para ejecutar la línea base.

### Procedimiento recomendado

1. Confirmar fuentes canónicas y estado documental.
2. Verificar que ambos repositorios estén limpios antes de la línea base.
3. Ejecutar toda la matriz manual con frontend y backend de baseline.
4. Registrar consola, respuestas HTTP y artefactos generados.
5. Confirmar commits recuperables y tags remotos en ambos repositorios.

### Resultado esperado

**Estado estable previo al refactor con punto de recuperación.**

### Criterios de salida

- Frontend y backend limpios.
- Tags remotos creados y apuntando a los commits base.
- Biblioteca carga.
- Planeación, anexo, lista y examen funcionan.
- Previews, descargas y eliminación funcionan.
- No hay errores inesperados en consola ni terminal.
- La documentación final y la matriz están alineadas.
- El refuerzo de logs está documentado y sus pendientes conocidos no bloquean silenciosamente la línea base.

### Pruebas obligatorias

Toda la [`TEST_MATRIX.md`](TEST_MATRIX.md), incluida Auth, Biblioteca, generación, polling, previews, descargas, eliminación, recarga y Archivados como flujo separado.

### Riesgos

- Confundir evidencia documental con validación runtime.
- Etiquetar un commit que no corresponde al estado probado.
- Empezar una extracción con cambios locales no controlados.

### Evidencia que debe registrarse

Commit de frontend y backend, resultado de tags locales/remotos, estado limpio, fecha y resultado real de cada prueba, consola y terminal, además del handoff actualizado.

### Condición para avanzar

Todos los criterios de salida deben estar confirmados. Mientras falte la prueba manual completa o los repositorios no estén limpios, la Fase 1 no debe ejecutarse.

## Fase 1 — Extracciones aisladas de bajo riesgo

### Objetivo

Crear los primeros módulos de Biblioteca mediante extracciones literales, pequeñas y comprobables.

### Estado

**Completada.**

Sesión 1.1 completada: se extrajeron preview, cierre de preview y descarga Word de examen a `js/features/examenes/`. Sesión 1.2 completada: se extrajeron preview, cierre y coordinadores de descarga de listas de cotejo a `js/features/listas-cotejo/`, conservando `wordExport.js` como generador Word protegido. Sesión 1.3 completada: se extrajeron preview, cierre y descarga de anexos a `js/features/anexos/`, conservando su exportador Word propio. La validación manual acumulativa de esas tres sesiones fue aprobada por el usuario.

Sesión 1.4 completada: `bibDescargarPlaneacion(planeacionId)` se extrajo literalmente a `js/features/planeaciones/planeacion-download.js`, con namespace y wrapper de compatibilidad. Las validaciones estáticas, la suite, el smoke de equivalencia y la validación acumulativa requerida quedaron aprobados antes de abrir la Fase 2.

La auditoría final no encontró más candidatos aislados propios de Fase 1 ni consumidores desconocidos. Permanecieron excluidos navegación y detalle de planeación, edición, exportaciones de `detalle.page.js`, generación, polling, eliminación, API, estado, render general y legacy. Esos trabajos quedaron asignados a fases posteriores.

### Dependencias

Fase 0 completada y consumidor de cada función clasificado.

### Alcance permitido

- Preview y cierre de preview de examen.
- Descarga de examen sin tocar `wordExport.js`.
- Preview y descarga de lista de cotejo.
- Otras funciones pequeñas confirmadas como Biblioteca activa o compartida activa.
- Crear `js/features/` solo junto con el primer módulo real.

### Fuera de alcance

- Cambios de lógica, UI, firmas públicas, payloads o contratos.
- Generación, polling, estado global amplio o corrección de bugs.
- Elegir nombres definitivos de módulos antes de auditar consumidores y responsabilidades.

### Archivos o áreas candidatas

Funciones de preview y descarga hoy distribuidas entre `dashboard.page.js` y `biblioteca.page.js`, sus wrappers `window.*`, event handlers y orden de scripts en `dashboard.html`.

### Procedimiento recomendado

1. Buscar consumidores en HTML, JS, `window.*`, handlers y `data-*`.
2. Clasificar función y estado asociado.
3. Extraer literalmente una responsabilidad por sesión.
4. Mantener firma y wrapper global.
5. Insertar el script en el orden equivalente.
6. Validar antes y después con las mismas entradas.

### Resultado esperado

**Primeros módulos dentro de `js/features/` sin cambiar comportamiento.**

### Criterios de salida

- Implementación canónica extraída sin diferencias funcionales.
- Wrappers y firmas públicas preservados.
- Consumidores documentados.
- Ningún listener duplicado.
- Preview, cierre y descarga seleccionados pasan sus pruebas.

### Pruebas obligatorias

Preview de examen abrir/cerrar, descarga de examen, preview de lista y descarga de lista según el alcance; además Login, carga de Biblioteca, navegación de tabs y recarga.

### Riesgos

Orden de scripts, dependencia de `explorerState`, globals ausentes, doble binding y alteración accidental del nombre o formato de descarga.

### Evidencia que debe registrarse

Búsqueda global, consumidores, página/evento, globals consumidas/expuestas, diff literal, sintaxis, pruebas, consola y wrapper conservado.

### Condición para avanzar

Al menos una extracción aislada debe cumplir todos sus criterios y la matriz crítica acumulativa sin regresiones.

## Fase 2 — Acciones por dominio

### Objetivo

Separar gradualmente las acciones específicas de planeaciones, anexos, listas de cotejo y exámenes.

### Estado

**Completada.**

Sesión 2.0 completada en auditoría: se localizaron y clasificaron las acciones activas de Planeaciones, Anexos, Listas de cotejo, Exámenes y bloques de Biblioteca; se confirmaron consumidores, APIs, IDs, estado, renders, confirmaciones y efectos backend. No quedaron acciones desconocidas.

```text
Sesión 2.1 — Completada
Validación manual 2.1 — Aprobada
Sesión 2.2 — Completada
Validación manual 2.2 — Aprobada
Sesión 2.3 — Completada
Validación manual 2.3 — Aprobada
Sesión 2.4 — Completada
Validación manual 2.4 — Aprobada
Sesión 2.5 — Completada
Validación manual 2.5 — Aprobada
Sesión 2.6 — Completada
Decisión 2.6 — La eliminación de bloque puede extraerse
Sesión 2.7 — Completada
Validación manual 2.7 — Aprobada
Sesión 2.8 — Auditoría de cierre completada
Validación manual acumulativa — Aprobada
Fase cerrada — 2 — Acciones por dominio
Próxima fase — 3 — Capa API frontend
Primera sesión sugerida — 3.0 — Auditoría de capa API frontend
```

En la Sesión 2.1 se trasladó literalmente el coordinador `bibDescargarExamen(examenId)` a `js/features/examenes/exam-download.js` como `ExamDownload.downloadFromBiblioteca(examenId)`. El wrapper global, los logs, la lectura de `bibliotecaState`, el modal de nombre y la delegación a `window.downloadExamWord` permanecen sin cambios de contrato. Las validaciones estáticas, la suite, el smoke técnico y la validación manual acumulativa fueron aprobadas.

En la Sesión 2.2 se trasladó literalmente `bibEliminarExamen(examenId, conjuntoId)` a `js/features/examenes/exam-delete.js` como `ExamDelete.deleteFromBiblioteca(examenId, conjuntoId)`. Se conservaron confirmación, sesión, API, UUIDs, mutación local, contador, tab, render parcial, recarga silenciosa, logs, alerta y retorno. Las validaciones estáticas, la suite, el smoke técnico y la validación manual fueron aprobadas.

En la Sesión 2.3 se trasladó literalmente `bibEliminarLista(listaId, conjuntoId)` a `js/features/listas-cotejo/lista-cotejo-delete.js` como `ListaCotejoDelete.deleteFromBiblioteca(listaId, conjuntoId)`. Se conservaron confirmación, sesión, API, UUIDs, mutación de `listas_cotejo`, contador, tab, selección, render parcial, recarga silenciosa, logs, alerta y retorno. Las validaciones estáticas, la suite, el smoke técnico y la validación manual fueron aprobados.

En la Sesión 2.4 se trasladó literalmente `bibEliminarAnexo(anexoId, conjuntoId)` a `js/features/anexos/anexo-delete.js` como `AnexoDelete.deleteFromBiblioteca(anexoId, conjuntoId)`. Se conservaron confirmación, sesión, API, UUIDs, mutación de `anexos`, contador, tab, selección, render parcial, recarga silenciosa, logs, alerta y retorno. Las validaciones estáticas, la suite, el smoke técnico y la validación manual fueron aprobados.

En la Sesión 2.5 se trasladó literalmente `bibEliminarPlaneacion(planeacionId, conjuntoId)` a `js/features/planeaciones/planeacion-delete.js` como `PlaneacionDelete.deleteFromBiblioteca(planeacionId, conjuntoId)`. Se conservaron confirmación, sesión, endpoint directo, mutaciones de planeaciones/anexos/listas, contadores, tab, selección, render parcial, recarga silenciosa, logs, alerta y retorno. El contrato backend continúa siendo secuencial y no transaccional; los exámenes y el batch permanecen intactos. Las validaciones estáticas, la suite, el smoke técnico y la validación manual fueron aprobados.

La Sesión 2.6 auditó específicamente `bibEliminarBloque(conjuntoId)`, su único consumidor activo, la API, las mutaciones de estado, el render general, la recarga y los efectos backend. No quedaron consumidores desconocidos. La extracción literal es viable sin migrar estado, reescribir render ni modificar backend, por lo que se definió la Sesión 2.7 — Eliminación de bloque desde Biblioteca.

La auditoría confirmó que el backend elimina secuencialmente anexos, listas, exámenes y planeaciones antes de intentar eliminar `planeacion_batches`. No existe transacción ni rollback. Un fallo exclusivo del último delete devuelve HTTP 200 con `{ ok: true, deleted: { batch: false } }`; el frontend actual ignora ese campo, trata la operación como éxito y la recarga puede volver a mostrar un bloque vacío. Jobs, métricas y jerarquía no se eliminan.

En la Sesión 2.7 se trasladó literalmente `bibEliminarBloque(conjuntoId)` a `js/features/biblioteca/biblioteca-block-delete.js` como `BibliotecaBlockDelete.deleteFromBiblioteca(conjuntoId)`. Se conservaron confirmación, sesión, API, ausencia de inspección de `deleted.batch`, filtrado de conjuntos, selección, tab, cuatro mapas pending, render general, recarga silenciosa, logs, alerta y retorno. La comparación literal, la sintaxis, la suite y el smoke técnico —incluido `deleted.batch:false`— fueron aprobados. El usuario aprobó después la validación manual de cancelación, eliminación completa del batch y sus cuatro dominios, persistencia, selección, regresión acumulativa y ausencia de ejecución legacy.

La Sesión 2.8 reauditó todas las acciones y wrappers vigentes. No quedaron consumidores desconocidos ni acciones pequeñas inequívocas propias de Fase 2. Generación y polling pasan a Fase 4; estado, tabs y pending maps a Fase 5; render, modales y event delegation a Fase 6; quick create, navegación y dependencias activas de Dashboard a Fase 7; API dispersa a Fase 3; legacy y wrappers permanecen para Fases 8–10. La decisión final es cerrar Fase 2 y abrir Fase 3.

### Dependencias

Fase 1 parcial o completa, convenciones de módulos comprobadas y consumidores de cada acción confirmados.

### Alcance permitido

Preview, download, delete, acciones de cards, modales propios y helpers privados por recurso.

### Fuera de alcance

Migración completa del estado, generación compleja, polling, cambios de contratos o abstracciones compartidas prematuras.

### Archivos o áreas candidatas

Acciones de recursos dentro de `biblioteca.page.js`, funciones compartidas activas de `dashboard.page.js`, APIs/services existentes y wrappers asociados.

### Procedimiento recomendado

Extraer un dominio y una responsabilidad por sesión, conservar coordinadores en Biblioteca, mantener wrappers necesarios y ejecutar pruebas del recurso más regresión acumulativa.

### Resultado esperado

**`biblioteca.page.js` deja de contener directamente todas las acciones de cada recurso.**

### Criterios de salida

- Cada acción extraída tiene propietario de dominio claro.
- Cards, modales, previews, descargas y deletes conservan comportamiento.
- No se duplican helpers ni listeners.
- Los contratos públicos y globals necesarios se mantienen.

### Pruebas obligatorias

Todas las acciones del dominio modificado, más Login, carga de Biblioteca, tabs, recarga y pruebas críticas aprobadas de Fase 1.

### Riesgos

Duplicación entre dominios, contexto perdido de card/bloque, mensajes alterados y retiro prematuro de wrappers.

### Evidencia que debe registrarse

Mapa de acciones, consumidores, wrappers, eventos, resultado por recurso, consola, solicitudes HTTP observadas y handoff.

### Condición para avanzar

Los dominios necesarios para la siguiente fase deben estar suficientemente delimitados y sus regresiones acumulativas deben pasar.

## Fase 3 — Capa API frontend

### Objetivo

Eliminar llamadas HTTP dispersas y hacer que las páginas coordinen flujos mientras la capa API ejecuta solicitudes.

### Estado

**Completada.** La Sesión `3.0 — Auditoría de capa API frontend` quedó
completada en documentación. Se inventariaron todas las funciones de
`js/api`, `js/services` y `js/core`, los tres `fetch` directos fuera de API,
sesión, headers, parsing, errores, aliases, globals, consumidores, Archivados y
legacy. Los contratos se contrastaron con rutas, controllers y services del
backend sin modificarlo. El mapa ejecutable está en
[`../FRONTEND_MAP.md`](../FRONTEND_MAP.md).

La Sesión `3.1 — Consolidación de lecturas de Biblioteca` quedó completada y
validada manualmente. `apiBibliotecaConjuntos(accessToken)` y
`apiBibliotecaConjuntoById(batchId, accessToken)` delegan la repetición de GET,
Bearer, `cache: "no-store"` y parsing al helper privado y específico
`bibliotecaGet(path, accessToken)`. Firmas, globals, URLs, retornos y errores
permanecen iguales. El smoke técnico, `node --check` y Jest pasaron. El usuario
aprobó carga, navegación entre bloques/tabs, recarga, Detalle, metadata,
previews, descargas y deletes, sin duplicados inesperados ni errores
relacionados.

La Sesión `3.2 — Consolidación interna de deletes de Biblioteca` quedó
completada y validada manualmente. Los cinco wrappers públicos conservan firma,
global, endpoint codificado, Bearer, ausencia de body, parsing, retorno y errores, y
delegan solo la mecánica equivalente a `bibliotecaDelete(path, accessToken)`.
El helper es privado y exclusivo de DELETE; `bibliotecaGet` quedó intacto. Los
smokes previo y posterior, `node --check` y Jest pasaron. El usuario aprobó las
cinco cancelaciones, los cinco deletes reales, la persistencia en base de datos
y los logs de éxito, sin errores relacionados.

La Sesión `3.3 — Auditoría puntual de APIs de anexos` quedó completada como
auditoría documental. Confirmó cinco globals en `anexos.api.js`, el delete
activo en `biblioteca.api.js`, cuatro helpers internos ya compartidos y la
ausencia de `js/services/anexos.service.js`. La lectura de detalle tiene dos
consumidores activos; las lecturas por batch y por planeación no tienen
consumidor confirmado. Generación tiene un flujo activo; regeneración conserva
una rama de compatibilidad sin emisor DOM.

La Sesión `3.4 — Consolidación interna de lecturas de anexos` quedó completada
en código. `apiObtenerAnexosPorBatch`, `apiObtenerAnexoPorPlaneacion` y
`apiObtenerAnexoDetalle` conservan firmas, globals, paths, encoding,
contenedores y fallbacks, y delegan solo GET implícito, Bearer sin
`Content-Type`, `cache:"no-store"` y URL base al helper léxico privado
`anexosGet`. `requestAnexosJson`, parsing, errores, metadata, generación,
regeneración, delete y consumidores quedaron intactos. Los smokes previo y
posterior, `node --check` y Jest pasaron; la validación manual 3.4 quedó
aprobada. El usuario confirmó preview, metadata, reapertura, descargas desde
card y preview, reutilización del objeto y ausencia de GET duplicados o errores
relacionados con `anexosGet`.

La Sesión `3.5 — Auditoría puntual de APIs de listas de cotejo` quedó completada
como auditoría documental. Confirmó tres APIs, tres wrappers service, cuatro
helpers API y el delete ya consolidado en Biblioteca. El detalle es activo para
preview/descarga; el listado por unidad pertenece al explorador legacy. Las dos
lecturas comparten mecánica GET, pero los wrappers conservan normalizaciones
distintas. Generación por `planeacion_ids`, pending, métricas y la rama backend
por unidad quedan en Fase 4.

La Sesión `3.6 — Consolidación interna de lecturas de listas de cotejo` quedó
completada y validada manualmente.
`apiListasCoTejoByUnidad` y `apiListaCoTejoById` conservan firmas, globals,
paths, encoding, contenedores y fallbacks, y delegan solo URL base, GET
implícito, Bearer sin `Content-Type`, ausencia de body y `cache:"no-store"` al
helper léxico privado `listasCotejoGet`. `requestListaCoTejoJson`, sus helpers
de parsing/error, generación, services, delete y consumidores quedaron
intactos. Los smokes previo/posterior, sintaxis y Jest pasaron. El usuario
aprobó preview, reapertura, descargas desde card/preview, reutilización del
objeto, Biblioteca/tabs y regresión de deletes con persistencia verificada,
`deletedBatch:true` y cero errores relacionados.

La Sesión `3.7 — Auditoría puntual de APIs de exámenes` quedó completada como
auditoría documental. Confirmó cuatro APIs, cuatro wrappers service, cuatro
helpers HTTP y el delete ya consolidado en Biblioteca. El detalle es activo
para preview/descarga y post-generación; el listado por unidad pertenece al
explorador legacy. Biblioteca usa generación/polling directos y el Dashboard
legacy usa services, con payloads y bucles distintos. Generación, jobs, worker,
retries, deduplicación, prompts, métricas y polling quedan en Fase 4.

La Sesión `3.8 — Consolidación interna de lecturas de exámenes` quedó
completada y validada manualmente. `apiExamenesListByUnidad` y `apiExamenById` conservan
firmas, globals, paths, encoding, contenedores y fallbacks, y delegan solo URL
base, GET implícito, Bearer sin `Content-Type`/`Accept`, ausencia de body y
`cache:"no-store"` al helper léxico privado `examResourceGet`.
`requestExamJson`, sus helpers de parsing/error, generación, polling, services,
delete y consumidores quedaron intactos. Los smokes previo/posterior, sintaxis
y Jest pasaron. El usuario aprobó preview, reapertura, contenido, ambas
descargas, reutilización del objeto, Biblioteca/tabs y ausencia de GET
duplicados o errores relacionados. La regresión adicional de generación
confirmó sin cambios los payloads protegidos, selección, polling,
deduplicación, reintentos, fallbacks, guardado y métricas.

La Sesión `3.9 — Auditoría de cierre de capa API frontend` verificó el
inventario global, los commits 3.0–3.8, consumidores, helpers, globals,
wrappers, orden de scripts, contratos backend y validaciones manuales. No
quedan consumidores desconocidos ni una extracción pequeña imprescindible
propia de Fase 3. Planeaciones, jerarquía, autenticación común, parsing
transversal, generación, polling, Archivados, legacy y retiro de wrappers
tienen fase futura explícita.

**Fase cerrada: 3 — Capa API frontend.** Sesiones 3.0–3.9 completadas y
validación manual acumulativa aprobada. La Fase 4 permanece pendiente, no fue
iniciada y debe comenzar en una nueva conversación.

### Dependencias

Inventario API confirmado; puede avanzar después de Fase 1 o 2 cuando una frontera HTTP concreta esté auditada.

### Alcance permitido

Reutilizar y consolidar wrappers API existentes, headers, parsing y manejo de errores, conservando exactamente rutas, métodos, auth, códigos esperados y payloads.

### Fuera de alcance

Renombrar campos, normalizar contratos, cambiar códigos esperados, cambiar autenticación, adaptar backend, corregir bugs o crear contratos nuevos.

### Archivos o áreas candidatas

`js/api/`, `js/services/` y llamadas HTTP directas confirmadas dentro de páginas.

### Procedimiento recomendado

Inventariar request y response, comparar wrapper existente, mover literalmente la solicitud, conservar el adapter público y validar red/errores antes de eliminar duplicación.

### Resultado esperado

**Las páginas coordinan flujos y la capa API ejecuta solicitudes.**

### Criterios de salida

- No quedan llamadas del alcance duplicadas en páginas.
- URL, método, headers, body, parsing y errores observables son equivalentes.
- Auth continúa obteniéndose del flujo vigente.
- Pruebas de éxito y error pasan.

### Pruebas obligatorias

Operaciones del endpoint movido, sesión expirada/no autorizada cuando exista prueba segura, errores HTTP, carga de Biblioteca y regresión acumulativa previa.

### Riesgos

Cambios sutiles de parsing, doble consumo de response, headers omitidos y divergencia entre APIs existentes.

### Evidencia que debe registrarse

Inventario request/response, equivalencia de contrato, captura de red sin secretos, consumidores, errores y pruebas.

### Condición para avanzar

Las APIs requeridas por generación y dominios deben estar suficientemente separadas; una razón técnica puede ajustar el orden si queda documentada.

## Fase 4 — Generación y polling

### Objetivo

Separar por dominio el inicio, feedback, progreso, polling, finalización, error y limpieza de procesos largos.

### Estado

**Completada.**

La Sesión 4.0 — Auditoría documental de apertura quedó aprobada. Las Sesiones
4.1 — Extracción literal de generación de anexos desde Biblioteca y 4.2 —
Extracción literal de generación seleccionada de listas de cotejo desde
Biblioteca quedaron implementadas y validadas manualmente. La Sesión 4.3 —
Extracción literal del inicio y progreso de generación de planeaciones desde
Biblioteca preservó el service y parser SSE compartidos con quick create y quedó
validada manualmente. La Sesión 4.4 — Auditoría específica y extracción literal
de generación y polling de exámenes desde Biblioteca separó únicamente el
coordinador vigente en `ExamGeneration.generateFromBiblioteca()`; conserva
separados el service, estado, render y polling legacy. Su implementación,
validaciones estáticas y validación manual están aprobadas. La Sesión 4.5 —
Auditoría formal de cierre de generación y polling confirmó las cuatro
extracciones, consumidores, contratos, orden de scripts, evidencia acumulada y
ausencia de regresiones introducidas. Sus validaciones estáticas y documentales
quedaron aprobadas. La decisión formal es **A. Cerrar Fase 4** y el commit de
cierre es `8dcba86`. Fase 5 permanece **Pendiente** y no iniciada.

Evidencia acumulada de salida: anexos individuales/secuenciales; listas con
request único, `created:1` y `skipped:0`; planeaciones SSE para Gravedad y
Movimiento con `success_count:2`, cero errores/skipped; y examen contextual de
19 preguntas solicitadas/guardadas, cero fallidas y cero retries. Failed y
timeout de examen no se forzaron por falta de un mecanismo seguro y no bloquean
el cierre. El fallo legacy de schema cache de `public.ia_metrics` es preexistente
y no fue causado por Fase 4; `[aiMetrics] job:finished` sigue confirmado.

### Dependencias

Capa API y dominios suficientemente separados, contratos backend leídos y baseline completa.

### Alcance permitido

Extracción literal de flujos de anexos, listas, planeaciones y exámenes. Orden sugerido: anexos → listas de cotejo → planeaciones → exámenes, ajustable según dependencias reales documentadas.

### Fuera de alcance

Cambiar prompts, modelos, parámetros, payloads, IDs, jobs, retries, duplicados, métricas, estados backend o polling. La cancelación al navegar solo puede cambiar si el comportamiento vigente o una tarea explícita lo autoriza.

### Archivos o áreas candidatas

Orquestación de generación en Biblioteca/Dashboard, APIs y services de cada recurso, feedback visual, timers y estado de progreso.

### Procedimiento recomendado

Leer los contratos IA backend, diagramar transiciones actuales, extraer un recurso por sesión, preservar eventos/intervalos/estados/errores y medir la regresión completa del recurso.

### Resultado esperado

**Los procesos de generación ya no están mezclados con el render general de Biblioteca.**

### Criterios de salida

- Cada flujo conserva inicio, progreso, terminales y errores.
- No hay polling duplicado ni cambios de frecuencia.
- Exámenes conservan jobs, `planeacion_ids`, contexto de `unidad_id` y progreso por pregunta.
- No se alteran métricas ni mensajes contractuales.

### Pruebas obligatorias

Generación exitosa y fallo permitido de cada recurso; estados `skipped` de listas; SSE de planeaciones; creación/polling/resultado de examen; navegación y recarga según comportamiento vigente; regresión acumulativa.

### Riesgos

Fugas de timers, polling simultáneo, estados terminales perdidos, doble generación, cambios de IDs y exposición de errores internos.

### Evidencia que debe registrarse

Diagrama de estados observado, timers, payloads comparados sin datos sensibles, eventos/respuestas, consumidores, pruebas y consola/terminal.

### Condición para avanzar

Los procesos extraídos deben ser funcionalmente equivalentes y el estado que consumen debe estar clasificado antes de Fase 5.

## Fase 5 — Estado de Biblioteca

### Objetivo

Crear un estado identificable de Biblioteca y reducir su dependencia de `window.explorerState`.

### Estado

**Completada.**

La Sesión 5.0 — Auditoría documental de apertura superó la puerta de entrada
desde `e1991de`: Fase 4 y su Sesión 4.5 constan completadas, la validación
documental está aprobada y ambos repositorios estaban limpios en sus ramas
esperadas. La auditoría abrió documentalmente la fase sin modificar código.

El inventario confirmó un `bibliotecaState` léxico y vigente, una fachada
`window.biblioteca` consumida por quick create y un `window.explorerState`
mixto: mantiene Quick Create y previews activos además de estado de
compatibilidad y del explorador visual legacy. Los pending, selección, tabs y
modales son efímeros; los recursos terminados se reconstruyen mediante refetch,
pero el progreso, selección, tab, búsqueda, modal y observación de jobs no se
rehidratan. Archivados conserva un `archivedState` separado y un registro
jerárquico propio en `localStorage`; no se incorpora al estado de Biblioteca.

**Decisión de apertura: A. Abrir Fase 5.** La Sesión 5.0, sus validaciones
estáticas y su validación documental quedaron aprobadas explícitamente por el
usuario y commiteadas en `525a21a`. El primer corte funcional fue formalizado
como **Sesión 5.1 — Extracción literal del estado de selección de bloque de
Biblioteca**. La sesión encapsuló el acceso sobre la única fuente física
`bibliotecaState.selectedConjuntoId` con la superficie léxica
`BibliotecaSelection`; todas las lecturas y escrituras directas conocidas
delegan sin normalizar ni reinterpretar valores. No se agregó global, archivo o
script, y se preservaron el fallback crudo de delete, Quick Create, load,
refetch y reconciliación. No incluye tabs, pending, modales, render, Quick
Create ni `explorerState`. La implementación, las validaciones estáticas y la
validación manual quedaron aprobadas explícitamente por el usuario; la sesión
está commiteada en `1b4c620`. Fase 5 continúa **En progreso**.

La **Sesión 5.2 — Extracción literal del ownership de `activeTab` en
Biblioteca** encapsuló acceso y transiciones mediante `BibliotecaTabs`, sobre la
única fuente física `bibliotecaState.activeTab`. No agregó archivo, global o
script; no normaliza claves, valida valores ni aplica fallback. Selección,
generación, delete, render, eventos, Quick Create y pending conservan sus
contratos. La implementación, las validaciones estáticas y la validación manual
están aprobadas; la sesión quedó commiteada en `f5bbfdd`. Fase 5 continúa **En
progreso**.

La **Sesión 5.3 — Extracción literal del estado del modal de generación de
anexos de Biblioteca** encapsuló el único objeto físico
`bibliotecaState.anexoModal` mediante la superficie léxica
`BibliotecaAnexoModalState`. Preservó shape, reemplazo de apertura, cierre
parcial, selección, depuración desde render, `submitting`, error, validaciones y
delegación a `AnexoGeneration`; no modificó generación, pending, render visual,
eventos, selección, tabs, otros modales, Quick Create ni backend. La
implementación, las validaciones estáticas y la validación manual están
**Aprobadas**; la sesión quedó commiteada en `f05e730`. Fase 5 continúa **En
progreso**.

La **Sesión 5.4 — Extracción literal del estado del modal de generación de
listas de cotejo** encapsuló el único objeto físico
`bibliotecaState.listaModal` mediante `BibliotecaListaModalState`. Preservó el
shape, reemplazo de apertura, cierre parcial, selección, depuración desde
render, `submitting`, error, validación y snapshot hacia
`ListaCotejoGeneration`; no modificó generación, payload,
`pendingListaByBatchId`, cleanup, refetch, render, eventos, selección, tabs,
otros modales, Quick Create ni backend. Implementación y validaciones estáticas
**Aprobadas**; la validación manual también quedó **Aprobada** y la sesión fue
commiteada en `948d627`. Fase 5 continúa **En progreso**.

La **Sesión 5.5 — Extracción literal del estado del modal de generación de
exámenes** encapsuló el único objeto físico `bibliotecaState.examModal`
mediante `BibliotecaExamModalState`. Preservó shape, reemplazo de apertura,
cierre parcial, bloque, unidad, planeaciones, selección, tipos, cantidades,
`submitting`, error, validaciones y payload hacia `ExamGeneration`; no modificó
creación de job, `pendingExamenByBatchId`, polling, refetch, render, eventos,
selección, tabs, otros modales, Quick Create ni backend. Implementación y
validaciones estáticas **Aprobadas**; validación manual **Aprobada**. La sesión
quedó **Aprobada y commiteada en `3842f20`**. El contrato de exámenes permanece:
Biblioteca envía `unidad_id`, `batch_id`, `planeacion_ids`,
`tipos_pregunta` y `cantidades_pregunta`, no envía `tema_ids`, y backend
resuelve los temas desde `planeacion_ids`. Fase 5 continúa **En progreso**.

La **Sesión 5.6 — Estado del modal de Planeaciones + auditoría de cierre de
estados modales** encapsuló el único objeto físico
`bibliotecaState.agregarModal` mediante `BibliotecaPlaneacionModalState`.
Preservó el shape real —sin `submitting`—, reemplazo de apertura, cierre
parcial, temas, actividades por momento, error, validación y snapshot hacia
`PlaneacionGeneration`; no modificó `batch_id`, SSE,
`pendingPlaneacionesByBatchId`, `duplicate_tema`, conteos, refetch, render,
eventos ni Quick Create. Implementación y validaciones estáticas **Aprobadas**;
validación manual **Aprobada**; sesión commiteada en `d45a493`. Fase 5 continúa
**En progreso**.

La auditoría acumulativa confirmó ownership específico y una fuente física por
modal para Planeaciones, Anexos, Listas y Exámenes. No existen fuentes
duplicadas, store/modal universal, persistencia nueva o absorción de Quick
Create/`explorerState`; generación, pending y render/eventos conservan sus
fronteras. El subdominio de modales quedó aprobado.

La **Sesión 5.7 — Ownership consolidado de pending states de Biblioteca**
aprobó los cuatro sub-gates y encapsuló las fuentes físicas originales mediante
`BibliotecaPlaneacionesPending`, `BibliotecaAnexosPending`,
`BibliotecaListaPending` y `BibliotecaExamPending`. Cada superficie mantiene su
shape y sus operaciones específicas; no existe store universal. Se preservaron
escritores y lectores de Biblioteca/Quick Create, SSE, requests secuenciales,
delay de listas de 1500 ms, polling de examen de 3000 ms y 60 consultas,
errores, cleanup asimétrico, delete de bloque y pérdida tras reload. La
implementación, validaciones estáticas y validación manual están **Aprobadas**;
la sesión quedó commiteada en `9b3c23d`.

La **Sesión 5.8 — Auditoría formal de cierre de Fase 5** reconcilió 5.7 y auditó
acumulativamente las sesiones 5.0–5.7, sus superficies, fuentes físicas,
consumidores, historial, contratos y regresiones. Confirmó ownership
identificable para selección, tabs, cuatro modales y cuatro pending; ausencia de
copias divergentes, stores universales y persistencia nueva; y preservación de
Quick Create, `window.explorerState`, `window.biblioteca`, generación, SSE,
polling, delete, render/eventos, Archivados, legacy y backend. `conjuntos`,
`loading`, `error` y `searchQuery` quedan delimitados para carga/render en Fases
6–7; `pendingBatchId` y `pendingConjunto`, para Quick Create en Fase 7;
`expandedIds`, como deuda sin consumidor confirmado. No existe bloqueo
funcional real.

**Decisión formal: A. Fase 5 puede cerrarse.** La Sesión 5.8 y la auditoría de
cierre están **Completadas y Aprobadas**. Fase 6 permanece **Pendiente** y no
iniciada.

### Dependencias

Consumidores de estado clasificados y flujos de dominio suficientemente delimitados.

### Alcance permitido

Clasificar cada propiedad como Biblioteca activa, Preview activa, Generación activa, Compartida activa, Archivados, Compatibilidad, Explorador visual legacy o Desconocida; mover solo propiedades confirmadas y mantener aliases/wrappers temporales.

### Fuera de alcance

Mover propiedades desconocidas, eliminar `explorerState` como bloque, imponer `window.BibliotecaState` o mezclar correcciones de sincronización.

### Archivos o áreas candidatas

`explorerState`, estado privado de `biblioteca.page.js`, `window.biblioteca`, previews, progreso, modales y confirmación de eliminación.

### Procedimiento recomendado

Construir mapa propiedad-consumidor, separar una categoría por sesión, mantener alias bidireccional solo si es imprescindible y comprobar identidad/transiciones antes de retirar accesos antiguos.

### Resultado esperado

**Biblioteca tiene estado identificable y `explorerState` conserva solo compatibilidad pendiente.**

### Criterios de salida

- Todas las propiedades movidas tienen consumidores conocidos.
- Biblioteca no depende de copias divergentes.
- Wrappers/aliases documentan retiro.
- Archivados y jerarquía técnica no se ven afectados.

### Pruebas obligatorias

Tabs, selección de bloque, previews, modales, feedback/progreso, recarga, deletes, generación y regresión acumulativa.

### Riesgos

Estado duplicado, referencias mutables distintas, pérdida de selección, condiciones de carrera y clasificación incorrecta de compatibilidad.

### Evidencia que debe registrarse

Matriz propiedad-consumidor-clasificación, globals, aliases, transiciones, pruebas y cualquier dependencia desconocida.

### Condición para avanzar

El estado necesario para render y eventos debe tener propietario claro; las propiedades desconocidas permanecen sin mover y documentadas.

## Fase 6 — Render y eventos

### Objetivo

Dividir gradualmente render y eventos para que `biblioteca.page.js` actúe como coordinador.

### Estado

**Completada.** La auditoría formal 6.4 aprobó el cierre. Fase 7 permanece
pendiente y no iniciada.

La **Sesión 6.0 — Auditoría técnica/documental de apertura** quedó completada
sin implementación funcional. El gate post-merge confirmó `refactor-front` en
`1254561`, igual a `main`/`origin/main`, frontend limpio y backend de solo
lectura limpio en `refactor-back`/`e08d6e4`. La auditoría levantó el árbol real
de render, 20 acciones emitidas y 23 ramas delegadas, las superficies DOM, los
listeners permanentes/recreados, las mutaciones durante render, los cruces con
Quick Create/Dashboard y los límites con Fase 7. El detalle está en
[`../FRONTEND_MAP.md`](../FRONTEND_MAP.md).

La reconciliación de 6.4 confirmó que 6.3 fue validada manualmente y commiteada
en `4306903`: delegación documental, handler de 23 ramas y search wiring residen
en `js/features/biblioteca/biblioteca-events.js`; la página conserva estado,
loader, coordinación y compatibilidad. Las sesiones funcionales 6.1–6.3 y la
auditoría acumulativa 6.4 están aprobadas.

Métricas de apertura: `biblioteca.page.js` tiene 2770 líneas, 80 declaraciones
de función, 22 declaraciones `render*`, 30 `addEventListener`, una asignación
`oninput`, 20 valores `data-bib-action` emitidos y aproximadamente 221
ocurrencias de primitivas DOM auditadas. Son indicadores, no criterio único de
extracción.

### Dependencias

Dominios y estado parcialmente separados.

### Alcance permitido

Render de bloques, tabs, cards, estados vacíos, feedback, event delegation, modales, acciones optimistas y recarga parcial.

### Fuera de alcance

Rediseño visual, cambio de UX, reactivación del árbol legacy, mezcla de estados o generalización para dos interfaces.

### Archivos o áreas candidatas

Renderers y handlers de `biblioteca.page.js`, selectores de `dashboard.html`, componentes compartidos activos y módulos de dominio ya extraídos.

### Procedimiento recomendado

Separar render puro de coordinación, extraer un área visible por sesión, preservar markup/selectores/atributos, registrar listeners una vez y verificar tras recargas parciales.

El orden respaldado por la auditoría es: estabilizar primero el render no modal
completo, después extraer el DOM/render de modales conservando literalmente sus
cleanup y listeners, y finalmente delimitar el ownership de eventos. Extraer la
delegación antes del árbol que produce sus `data-*` aumentaría el riesgo de
desalinear acciones, IDs y renders posteriores.

### Sesiones propuestas

#### 6.1 — Render no modal completo de Biblioteca

- **Alcance:** helpers visuales, pending feedback, cards de Planeaciones,
  Anexos, Listas y Exámenes, shell, sidebar, search visible, detalle, tabs,
  loading/error visual y renders parciales.
- **Archivos candidatos:** `js/pages/biblioteca.page.js`, un owner real bajo
  `js/features/biblioteca/` y `pages/dashboard.html` solo para insertar el
  script en el orden comprobado.
- **Riesgo:** Alto por la firma global `renderBibliotecaContent`, Quick Create,
  features y refetch que invocan esos renders.
- **Límites:** no mover estado, loader, eventos, modales, generación, Quick
  Create, previews, downloads, deletes ni API.
- **Pruebas:** carga/empty/error, búsqueda y clear, selección, scroll lateral,
  cuatro tabs/cards/pending, full/partial render, retry smoke, Quick Create
  smoke y atributos/markup equivalentes.

#### 6.2 — DOM y render de modales de Biblioteca

- **Alcance:** inyección, apertura visual y render/wiring literal de los cuatro
  modales de generación y confirmación de delete.
- **Archivos candidatos:** `biblioteca.page.js` y un owner de modal bajo
  `js/features/biblioteca/`.
- **Riesgo:** Muy alto: Anexos/Listas depuran selección durante render;
  Planeaciones consume bindings léxicos de Dashboard; todos recrean listeners.
- **Límites:** no purificar, corregir listeners, cambiar ModalState ni absorber
  generación/delete.
- **Pruebas:** abrir/cerrar/cancelar/backdrop, checkboxes, tipos/cantidades,
  temas/actividades, re-render/reopen y las cinco confirmaciones.

#### 6.3 — Ownership de eventos de Biblioteca

- **Alcance:** delegación `data-bib-action`, búsqueda y bindings de modal ya
  estabilizados; conservar las tres ramas sin emisor como compatibilidad.
- **Archivos candidatos:** `biblioteca.page.js` y un owner de eventos bajo
  `js/features/biblioteca/`.
- **Riesgo:** Alto por 23 ramas, DOM dinámico, features protegidos y listeners
  Dashboard ya activos sobre `#explorer-content`/`document`.
- **Límites:** no cambiar comportamiento ni corregir deuda histórica en la
  misma extracción.
- **Pruebas:** un click produce una acción, eventos sobreviven full/partial
  render, modales re-renderizados funcionan y no aparecen requests/listeners
  duplicados.

#### 6.4 — Auditoría formal de cierre

- **Alcance:** documentación y evidencia acumulativa; sin cambio funcional.
- **Riesgo:** Alto acumulativo.
- **Pruebas:** suite, matriz manual de Fase 6, consola/red, orden de scripts,
  globals y búsqueda de consumidores.

Las Sesiones 6.1, 6.2 y 6.3 están aprobadas y commiteadas en `cef834e`,
`ef3364f` y `4306903`. `biblioteca-events.js` es el owner del wiring
estructural. La Sesión 6.4 completó y aprobó la auditoría formal; no se creó una
6.5. En ese cierre histórico Fase 7 quedó pendiente/no iniciada y posteriormente
cerró en la auditoría 7.4.

#### Resultado técnico de 6.1

- 20 funciones no modales se movieron literalmente; shell, sidebar/search,
  detalle, tabs, cuatro dominios, pending, empty/loading/error y patches quedan
  bajo un único owner.
- `window.renderBibliotecaContent`, su firma/timing y los globals de patches
  siguen compatibles con Dashboard, Quick Create, features y loader.
- `dashboard.html` añade el owner después de `biblioteca.page.js` y antes de
  `main.js`; no cambia ninguna otra posición de scripts.
- Se preservan 20 acciones emitidas, 23 ramas, 30 listeners y un `oninput`.
- No se tocaron modales/eventos, loader/reconciliación, Quick Create, estado,
  pending ownership, features, API, backend, CSS ni `wordExport.js`.

#### Resultado técnico de 6.2

- Los cinco sub-gates pasaron y se movieron literalmente cuatro renders,
  `showBibConfirm`, `injectBibliotecaModals` y `BIB_EXAM_TIPOS`.
- 29 listeners locales se movieron con su DOM; el único listener general y
  `onBibliotecaClick` permanecen en la página para 6.3.
- Open/close, cuatro submit coordinators y generación quedan intactos en la
  página. Anexos/Listas conservan cleanup; Planeaciones conserva mutación de
  actividades y bindings de Dashboard; confirmación conserva su deuda `{once}`.
- Orden: `biblioteca.page.js → biblioteca-render.js →
  biblioteca-modal-render.js → main.js`.
- Comparación literal, smoke JSDOM, checks de sintaxis y Jest pasaron. La manual
  posterior aprobó 6.2 y el corte quedó commiteado en `ef3364f`.

#### Resultado técnico de 6.3

- `onBibliotecaClick` y `onBibliotecaSearch` se movieron literalmente al owner
  de eventos; `bind()` conserva el registro documental y `bindSearch()` la
  asignación de propiedad en sus mismos puntos de ejecución.
- Se preservan 20 acciones emitidas, 23 ramas, el matching por `closest`, siete
  lecturas dataset, early return, orden y ausencia de prevent/stop.
- Dashboard/Quick Create, los 29 listeners modales, renders, estado, pending,
  loader, coordinadores y features permanecen intactos.
- Orden: `biblioteca.page.js → biblioteca-render.js →
  biblioteca-modal-render.js → biblioteca-events.js → main.js`.
- Comparación literal, smoke JSDOM, sintaxis y Jest pasan. La manual 6.3 aprobó
  Biblioteca, search, modales, acciones, generación, Quick Create y ausencia de
  dispatch/requests duplicados; commit `4306903`.

#### Resultado de cierre de 6.4

- Owners canónicos: render no modal, render modal y eventos, sin segunda fuente
  ni implementación divergente.
- `biblioteca.page.js` queda en 1317 líneas, 51 funciones nombradas, un wrapper
  `render*` de preview compatible, cero listeners y 52 operaciones DOM según el
  patrón de medición de apertura.
- Las superficies State/Pending, coordinadores de generación, API, contrato de
  Exámenes, deletes, previews/downloads y DOM observable permanecen intactos.
- Quick Create, `explorerState`, loader/navegación/reconciliación y Dashboard
  shell quedan reservados para Fase 7.
- Decisión: **A. Cerrar Fase 6.** Manual adicional no requerida.

### Resultado esperado

**`biblioteca.page.js` actúa como coordinador y no como contenedor de toda la implementación.**

### Criterios de salida

- Render y eventos tienen fronteras claras.
- No existe doble render ni listener duplicado.
- Selectores y `data-*` conservan contrato.
- Acciones responden después de recarga parcial y cambio de tabs.

### Pruebas obligatorias

Carga, tabs, cards, vacíos, modales, acciones, recarga parcial/completa, consola y regresión acumulativa.

### Riesgos

Listeners duplicados, render doble, selectores inconsistentes, eventos perdidos y UI optimista sin reconciliación.

### Evidencia que debe registrarse

Árbol de eventos, selectores, punto de registro, conteo de listeners/requests observado, capturas funcionales y pruebas.

### Condición para avanzar

Las funciones propias de Biblioteca deben estar identificables para auditar el acoplamiento restante con Dashboard.

## Fase 7 — Desacoplar Biblioteca de dashboard

### Objetivo

Quitar dependencias activas de `dashboard.page.js` que pertenecen a Biblioteca sin eliminar Dashboard todavía.

### Estado

**Completada.** La auditoría formal 7.4 aprobó el cierre. La Sesión 7.0 quedó
commiteada en `7c75738`; 7.1, validada manualmente en `97b798c`; 7.2, validada
manualmente en `a6840a4`; y 7.3, validada manualmente y commiteada en
`bcd361e`. Fase 8 permanece pendiente y no iniciada.

### Dependencias

Funciones activas de Biblioteca identificadas y estado/render suficientemente separados.

### Alcance permitido

Clasificar cada dependencia de `dashboard.page.js`, `window.*`, `explorerState` y helpers compartidos como: mover a Biblioteca, mover a core compartido, conservar para Archivados, wrapper temporal, legacy o desconocida.

### Fuera de alcance

Eliminar `dashboard.page.js`, romper el orden de inicialización, quitar wrappers con consumidores o modificar Archivados.

### Archivos o áreas candidatas

Previews, descargas, creación/progreso de planeaciones, confirmaciones, helpers compartidos, globals y bootstrap del dashboard.

### Procedimiento recomendado

Crear inventario bidireccional Dashboard↔Biblioteca, resolver una dependencia por sesión, preservar wrapper en el propietario anterior y validar inicialización/orden.

### Sesiones propuestas después de la auditoría 7.0

#### 7.1 — Extraer el coordinador completo de Quick Create

**Estado: completada, validada manualmente y commiteada en `97b798c`.** Se creó
`js/features/dashboard/quick-create.js` como owner único de panel, comboboxes,
validación, jerarquía técnica, staging, progreso SSE y coordinación con la
fachada de Biblioteca. `dashboard.page.js` conserva solo wrappers para sus
consumidores activos y helpers realmente compartidos. El script nuevo carga
después de Dashboard y antes de Biblioteca; no se movieron State/Pending,
loader/reconcile, API/service ni `PlaneacionGeneration`.

Evidencia automática: comparación literal normalizada de seis bloques, 44
listeners totales preservados (27 Dashboard + 17 Quick Create), smoke JSDOM de
3 casos sin red real, sintaxis y suite Jest. La manual confirmó Quick Create,
reconciliación, Biblioteca posterior, generación normal con batch explícito y
sin errores/duplicación nuevos.

- Mover como unidad el estado propio, comboboxes, DOM, validación, resolución de
  jerarquía técnica, staging, progreso y coordinación SSE actualmente vigentes
  en `dashboard.page.js`.
- Conservar sin cambios `generarPlaneacionesUnidadConProgreso`, endpoint,
  payload, parser, fallback HTTP, `force_new_batch`, `batch_id`, `unidad_id`,
  mensajes, orden, tiempos y fachada `window.biblioteca`.
- Mantener wrappers léxicos o globales donde `biblioteca-events.js`, el shell o
  previews todavía consuman firmas de Dashboard.
- No absorber el modal normal de Planeaciones ni `PlaneacionGeneration`: ambos
  comparten transporte, pero sus pending, parser de eventos y contrato de batch
  siguen siendo distintos.

Pruebas: carga Dashboard/Biblioteca, abrir/cancelar/validar Quick Create, bloque
nuevo y existente, progreso y resultado total/parcial/error, selección/tab,
reload posterior, consola y una sola petición de generación.

#### 7.2 — Separar loader y reconciliación de Biblioteca

**Estado: completada, validada manualmente y commiteada en `a6840a4`.** El owner
`js/features/biblioteca/biblioteca-loader.js` contiene literalmente loader,
refetch, reconciliación temporal→real, merge optimista y finish. La fuente de
State/Pending permanece en `biblioteca.page.js`; cinco wrappers conservan los
15 caminos y la fachada. Quick Create, generadores, deletes, API y render no se
modificaron funcionalmente.

Evidencia automática: seis funciones con comparación literal PASS; smoke JSDOM
de loader/reconcile con 4 casos; smoke Quick Create; sintaxis, suite Jest de 3
suites/9 tests y diff check. La manual confirmó Quick Create con batch nuevo,
flujo normal reutilizando el batch explícito y delete con
`[biblioteca] delete:success`; no hubo doble GET/render/card reportado.

- Dar owner identificable a `loadAndRenderBiblioteca()` y a la reconciliación
  `tempId -> batch_id` sin crear un gestor genérico ni otra fuente de estado.
- Conservar `BibliotecaSelection`, `BibliotecaTabs`, los cuatro Pending y la
  mutación física en `bibliotecaState`.
- Mantener iguales carga normal/silenciosa, fallback de selección, tab objetivo,
  error/loading, renders, refetches de generación/delete y fachada `refresh`.

Pruebas: carga inicial/retry, bloque temporal a real, generación normal y Quick
Create, success parcial, cambios de selección/tab durante refetch, deletes,
reload y ausencia de cards/batches duplicados.

#### 7.3 — Reducir Dashboard a bootstrap/navegación y bindings activos

**Estado: completada, validada manualmente y commiteada en `bcd361e`.** Se creó
`js/features/dashboard/dashboard-bootstrap.js` como owner de inyección del
layout, coordinación de `initDashboardPage` y registro único de los bindings
estructurales del Dashboard. Las tres funciones se movieron literalmente, con
el guard privado y 25 sitios de listener; `window.initDashboardPage` conserva
firma y `window.BIBLIOTECA_MODE` conserva timing. Dos listeners locales a
renders legacy permanecen en `dashboard.page.js`.

La navegación se retuvo de forma deliberada: árbol, breadcrumbs,
`selectRoot/Plantel/Grado/Materia/Unidad`, detalle, previews, jerarquía técnica,
deletes y Archivados todavía comparten estado y branches. Los helpers de
actividades, nivel/grado, select visual y progreso/status tienen consumidores
de dos o más dominios y permanecen como bridge compartido, sin duplicación.

Evidencia automática: comparación literal PASS de las tres funciones; smoke
Dashboard sin red de 3 casos; smokes protegidos de Quick Create y loader; suite
acumulativa de 4 suites/12 tests, sintaxis y diff check. La manual confirmó
Dashboard y chrome, Biblioteca, Quick Create con batch nuevo, delete y examen
completo de 5/5 preguntas sin retries ni errores visibles nuevos.

- Delimitar `initDashboardPage`, inyección de layout/chrome, binding único del
  shell y navegación vigente; mover únicamente helpers compartidos que sigan
  bloqueando Biblioteca tras 7.1–7.2.
- Mantener el bridge `renderExplorerContent -> window.renderBibliotecaContent`
  mientras tenga consumidor y no aislar ni eliminar todavía el explorador
  visual legacy.
- Clasificar los bindings de actividades y preview como owner Biblioteca,
  compartido activo o wrapper; el retiro final de globals queda en Fase 10.

Pruebas: arranque directo/refresh/back-forward, navbar/sidebar/footer, Quick
Create, Biblioteca, Detalle, previews/downloads, Escape, bubbling sin doble
dispatch y revisión de orden de scripts.

#### 7.4 — Auditoría formal de cierre

**Estado: completada; auditoría aprobada; manual adicional no requerida.** Gate
en `refactor-front`/`bcd361e` y backend solo lectura
`refactor-back`/`e08d6e4`. La búsqueda global confirma owners únicos para Quick
Create, loader/reconcile y bootstrap; fuente única para State/Pending; 15
caminos equivalentes del loader; scripts clásicos y orden intactos; y
navegación, jerarquía, legacy, Archivados, wrappers y globals clasificados.

La suite acumulativa pasa 4 suites/12 tests. Generadores, Selection/Tabs,
ModalState/Pending, render/modal/events, API/payload, examen, delete, previews,
SSE/polling y backend permanecen protegidos. No hay contradicciones ni deuda
que justifique 7.5.

**Decisión: A. Fase 7 puede cerrarse.** Fase 8 queda pendiente/no iniciada con
handoff de explorer visual, navegación jerárquica, Archivados, previews ligados
a `explorerState` y bindings compartidos. Fase 10 conserva cleanup de
`window.*`, wrappers, bridges y compatibilidad final.

La auditoría cubrió ownership, fuentes únicas, búsquedas globales, orden de
scripts, wrappers conservados y matriz acumulativa. No incluyó nuevas
extracciones ni abrió Fase 8.

### Resultado esperado

**Biblioteca deja de depender de `dashboard.page.js` para funciones que son propias de Biblioteca.**

### Criterios de salida

- No quedan dependencias propias de Biblioteca sin clasificación.
- Las movidas tienen propietario estable.
- Las compartidas y de Archivados permanecen accesibles.
- Dashboard sigue cargando sin cambiar el contrato de entrada.

### Pruebas obligatorias

Inicialización, carga Biblioteca, creación/progreso, previews/descargas, modales, recarga, Archivados separado y regresión acumulativa.

### Riesgos

Acoplamiento bidireccional oculto, globals creadas tarde, orden de scripts y helpers falsamente clasificados como legacy.

### Evidencia que debe registrarse

Inventario de dependencias, resolución elegida, búsqueda global, orden de scripts, wrappers y pruebas.

### Condición para avanzar

Biblioteca debe poder operar sin depender del código visual del explorador antiguo; las dependencias desconocidas bloquean el aislamiento.

Condición cumplida para las responsabilidades propias de Biblioteca: los
cruces restantes son helpers compartidos, preview o compatibilidad con
consumidor identificado, no dependencias desconocidas del explorer visual.

## Fase 8 — Aislar legacy visual

### Objetivo

Separar el explorador visual jerárquico antiguo de Biblioteca sin eliminar jerarquía técnica ni compatibilidad activa.

### Estado

**Completada.** Las Sesiones 8.0–8.4 delimitaron, aislaron y validaron las
superficies visuales legacy sin eliminar la jerarquía técnica ni la
compatibilidad activa. La ruta vigente monta Biblioteca y retorna antes de
hidratar el fallback; los scripts legacy siguen cargados deliberadamente por
compatibilidad, pero no montan tree, breadcrumbs ni niveles bajo la entrada
normal.

La decisión de producto posterior a 8.0 congela Archivados durante el refactor
actual: Biblioteca usa delete directo y cualquier sistema de Archivados propio
de Biblioteca será trabajo futuro posterior. La propuesta original 8.1 de
extraer el registry se descartó antes de commit y no forma parte del roadmap.

La nueva Sesión 8.1 aisló literalmente el explorer visual y su navegación en
`js/features/dashboard/legacy-explorer.js`. Dashboard bajó de 4049 a 2867 LOC;
42 funciones pasaron al owner. Los loaders/caches técnicos, Quick Create,
previews/downloads, generación, CRUD/archive callbacks y Archivados permanecen
en sus owners actuales. La validación manual posterior fue aprobada y el usuario
commiteó la sesión en `1aa1599`.

La Sesión 8.2 confirmó que preview/download ya tenía owners funcionales por
dominio. Extrajo de Dashboard los siete bridges residuales hacia esos owners,
sin crear un manager adicional: seis bridges de render/open/close y el bridge
`downloadExamWord`. Dashboard quedó en 2799 LOC y 125 funciones; `explorerState`,
cache, DOM, API, listeners, Escape, generación y Archivados permanecen intactos.

La Sesión 8.3 aisló cinco funciones/234 LOC del modal CRUD visual en
`legacy-hierarchy-crud.js`; mantuvo listeners en Bootstrap y loaders/caches en
Dashboard. Dashboard cerró en 2564 LOC/120 funciones. La regresión acumulativa
posterior aprobó manualmente tanto 8.2 como 8.3. La Sesión 8.4 reconcilió owners,
consumidores, script order, residual, manual y 7 suites/22 pruebas sin blockers.

### Sesiones de Fase 8

#### 8.1 — Explorer visual y navegación jerárquica legacy

**Aprobada manualmente y commiteada en `1aa1599`.** El owner contiene ubicación persistida,
selección root/plantel/grado/materia/unidad, tree, breadcrumbs, renders de los
cinco niveles, dispatch `data-tree-action`/`data-content-action`, renderAll y
fallback hydrate. Mantiene bindings clásicos hacia loaders técnicos y callbacks
residuales, sin store/namespace nuevo ni listeners duplicados.

Pruebas: smoke sin red de fallback, root→unidad, expand/collapse, breadcrumbs,
session restore y URL de Detalle; regresión manual de Biblioteca, Quick Create,
Detalle/back-forward y preview vigente.

#### 8.2 — Previews/downloads y compatibilidad residual de `explorerState`

**Aprobada manualmente y commiteada en `6fb39ab`.** La auditoría determinó que estado/cache,
DOM, API y descargas ya pertenecían a `ExamPreview`, `ExamDownload`,
`ListaCotejoPreview` y `ListaCotejoDownload`. Por ello no se creó un owner
duplicado: los siete wrappers compatibles se trasladaron literalmente desde
Dashboard a los owners existentes y se conservaron los mismos globals.

Pruebas: smoke sin red de preview/reapertura/cache/cierre/Escape/download,
`openBiblioteca`, caller legacy, loading/error y delegación de siete globals;
suite acumulativa 6 suites/19 pruebas. La regresión acumulativa posterior aprobó
Biblioteca, previews, generación y deletes.

#### 8.3 — CRUD jerárquico visual

**Aprobada manualmente y commiteada en `cf48637`.** Cinco funciones/234 LOC de
open/configure/submit/close del modal jerárquico viven en
`legacy-hierarchy-crud.js`. No posee estado ni listeners; consume
`explorerState.modal`, loaders técnicos, services CRUD y navegación legacy sin
duplicarlos. Delete/archive quedó fuera.

#### 8.4 — Auditoría formal de cierre

**Completada.** Reconciliados owners, consumidores, no montaje del explorer en
la ruta vigente, jerarquía técnica, Archivados congelado, previews, wrappers y
matriz acumulativa. Fase 9 permanece pendiente: ningún candidato se elimina sin
evidencia explícita de cero consumidores.

### Dependencias

Biblioteca desacoplada de las piezas visuales legacy y consumidores clasificados.

### Alcance permitido

Mover el explorador a un módulo legacy, dejar de cargarlo en rutas vigentes, conservarlo temporalmente para referencia, marcarlo no ejecutable o separarlo de helpers activos.

### Fuera de alcance

Eliminar código con consumidores o dudas; eliminar endpoints, relaciones, IDs, selectores, Archivados o helpers activos.

### Archivos o áreas candidatas

Árbol, breadcrumbs, navegación por niveles, ramas de inicialización legacy y estado exclusivamente visual confirmado.

### Procedimiento recomendado

Delimitar el bloque visual, separar helpers activos, comprobar entry points alternativos, aislar sin borrar y ejecutar la matriz completa.

### Resultado esperado

**El explorador visual antiguo ya no está mezclado con Biblioteca.**

### Criterios de salida

- La ruta vigente no monta ni hidrata el explorador visual; su script compatible puede seguir cargado.
- Biblioteca y Archivados siguen funcionando.
- Jerarquía técnica y helpers activos permanecen.
- Todo componente aislado tiene clasificación y evidencia de consumidores.

### Pruebas obligatorias

Matriz completa de Biblioteca, Auth, recarga, ausencia de árbol/breadcrumbs legacy, Archivados separado y pruebas de compatibilidad temporal explícitas.

### Riesgos

Entry points no detectados, efectos laterales de carga, helpers activos dentro del bloque visual y falsa equivalencia entre jerarquía técnica y UI legacy.

### Evidencia que debe registrarse

Scripts/entry points revisados, búsqueda global, componentes aislados, no ejecución en ruta vigente, pruebas y plan de reversión.

### Condición para avanzar

El legacy está aislado. Fase 9 no puede retirar una superficie hasta demostrar cero consumidores; la compatibilidad documentada no reabre Fase 8.

## Fase 9 — Eliminar legacy confirmado

### Objetivo

Eliminar únicamente código del explorador visual obsoleto demostrado sin consumidores.

### Estado

**En progreso.** 9.0 quedó commiteada en `73d52b4`; 9.1 retiró Batch, fue
aprobada manualmente y quedó commiteada en `9496303`. La Sesión 9.2 retiró las
seis funciones cero-consumer, tres hojas derivadas y la cadena completa de siete
acciones sin emitter; está pendiente de manual y commit. El fallback
Explorer/CRUD permanece intacto y reservado para 9.3.

### Dependencias

Legacy aislado, sin consumidores y con commit previo estable.

### Alcance permitido

Eliminar piezas visuales legacy confirmadas mediante búsqueda global, revisión manual y pruebas.

### Fuera de alcance

Eliminar `unidad_id`, `tema_id`, relaciones, endpoints técnicos, modelos de datos, selectores usados, contratos backend, Archivados o cualquier elemento desconocido.

### Archivos o áreas candidatas

Solo los componentes incluidos en el inventario de Fase 8 con evidencia explícita de cero consumidores.

### Procedimiento recomendado

1. Buscar en HTML, scripts cargados, `window.*`, `data-*`, handlers, rutas e imports.
2. Revisar Archivados y entry points alternativos.
3. Confirmar pruebas completas y commit estable previo.
4. Documentar plan de reversión.
5. Eliminar en una sesión separada y pequeña.

### Resultado esperado

**Se elimina solo el explorador visual obsoleto sin afectar Biblioteca, Archivados ni la jerarquía técnica.**

### Criterios de salida

- Búsqueda posterior sin referencias rotas.
- Biblioteca y Archivados pasan toda la matriz.
- No cambian contratos, IDs ni rutas backend.
- La reversión está identificada y el handoff actualizado.

### Pruebas obligatorias

Matriz completa, pruebas automatizadas, carga/recarga, consola, red, scripts y compatibilidad temporal restante.

### Riesgos

Consumidor oculto, carga dinámica, restauración de Archivados afectada, eliminación demasiado amplia y reversión incompleta.

### Evidencia que debe registrarse

Búsquedas antes/después, alcance exacto eliminado, commit previo, plan de reversión, pruebas completas y confirmación de jerarquía técnica intacta.

### Condición para avanzar

La aplicación debe permanecer estable sin el legacy eliminado y sin referencias residuales; de lo contrario se revierte y la fase continúa.

### Sesiones propuestas después de 9.0

#### 9.1 — Implementación Batch sin entry point

**Completada, manual aprobada y commiteada en `9496303`.** Se retiraron `js/pages/batch.page.js`,
`js/ui/batch.ui.js`, `css/batch.css` y el registro inalcanzable
`batch.html → initBatchPage` de `main.js`. `pages/batch.html` quedó sin cambios
como redirect de compatibilidad. La búsqueda posterior confirma cero referencias
productivas a los assets o al init; el smoke textual y la suite completa pasan.
La validación manual confirmó Dashboard/Biblioteca, bloques y ausencia de errores
posteriores al retiro.

#### 9.2 — Hojas cero-consumer y ramas sin emitter

**Implementada; manual pendiente.** Se retiraron las seis funciones confirmadas,
los helpers derivados `getActividadCierreSelectLabel`,
`getActividadCierreSelectWidth` y `findTemaById`, y la cadena de seis acciones
`delete-*` más `archive-batch`. Los cinco archives emitidos, `confirmDelete`,
registry, Archivados y deletes de Biblioteca permanecen. Suite final: 9
suites/27 pruebas. No avanzar a 9.3 antes de aprobación manual y commit.

#### 9.3 — Fallback visual coordinado

Solo si una nueva búsqueda demuestra el corte completo: eliminar primero los
cruces activos del fallback (`setCurrentLevel` desde loader,
`selectUnidad` desde Quick no-Biblioteca, render bridge y callbacks), retirar
después Explorer/CRUD/generación/archive visual, DOM/CSS exclusivo,
sessionStorage, `pageshow` y scripts legacy. Los smokes de una feature retirada
se eliminan o sustituyen por pruebas de la entrada Biblioteca; no se conserva
código productivo por un test artificial.

#### 9.4 — Auditoría formal de cierre

Repetir mapas de consumers y rutas, suite completa, manual acumulada y
documentación. Fase 10 permanece pendiente hasta una aprobación explícita.

## Fase 10 — Consolidación final

### Objetivo

Retirar compatibilidad ya innecesaria y cerrar una Biblioteca modular con documentación actualizada.

### Estado

**Pendiente.**

### Dependencias

Refactor funcional completado, legacy confirmado retirado o explícitamente conservado y matriz completa aprobada.

### Alcance permitido

Retirar wrappers sin consumidores, aliases temporales y helpers duplicados; reducir globals; normalizar nombres internos; ordenar carga de scripts; actualizar arquitectura, roadmap y handoff.

### Fuera de alcance

Mezclar limpieza con bugs, mejoras de producto o cambios de contratos. Cualquier cambio funcional requiere una tarea separada.

### Archivos o áreas candidatas

Wrappers documentados, aliases, helpers duplicados, orden de scripts y documentación del estado final.

### Procedimiento recomendado

Retirar una deuda por sesión con búsqueda global y pruebas, separar cualquier mejora detectada, actualizar inventarios y cerrar decisiones temporales.

### Resultado esperado

**Biblioteca modular, sin dependencias visuales legacy innecesarias y con contratos preservados.**

### Criterios de salida

- Wrappers restantes tienen consumidores y motivo documentado.
- Globals y aliases innecesarios fueron retirados con evidencia.
- Arquitectura refleja el estado real.
- Matriz completa y pruebas automatizadas pasan.
- Roadmap y handoff registran cierre verificable.

### Pruebas obligatorias

Suite automatizada completa, matriz manual completa, consola/terminal, enlaces documentales, carga de scripts y verificación de contratos protegidos.

### Riesgos

Convertir limpieza en cambio funcional, renombrar contratos públicos y retirar compatibilidad todavía activa.

### Evidencia que debe registrarse

Inventario final de globals/wrappers, pruebas, estado de repositorios, documentación final y deudas explícitamente diferidas.

### Condición para avanzar

No hay fase posterior: el roadmap se marca completado solo cuando todos los criterios finales tienen evidencia y los pendientes quedan fuera del refactor con propietario.

## Reglas de avance

- No avanzar a una fase de mayor riesgo con validaciones pendientes.
- No eliminar código legacy antes de completar aislamiento.
- No marcar una fase como completada solo porque el código fue movido.
- Cada fase debe cumplir criterios de salida y pruebas.
- Una dependencia nueva puede cambiar el orden.
- Los cambios de orden deben documentarse.
- No mezclar dos fases grandes en una sola sesión.
- Cada fase puede dividirse en múltiples sesiones pequeñas.
- Cada sesión debe terminar con handoff actualizado.
- Cada fase debe tener uno o varios commits pequeños.

## Dependencias entre fases

| Fase | Requiere |
| --- | --- |
| 1 | Fase 0 |
| 2 | Fase 1 parcial o completa |
| 3 | Inventario API confirmado |
| 4 | API y dominios suficientemente separados |
| 5 | Consumidores de estado clasificados |
| 6 | Dominios y estado parcialmente separados |
| 7 | Funciones activas de Biblioteca identificadas |
| 8 | Biblioteca desacoplada |
| 9 | Legacy aislado y sin consumidores |
| 10 | Refactor funcional completado |

Estas dependencias expresan el camino seguro esperado. Pueden ajustarse por una razón técnica concreta, siempre que el cambio de orden, el riesgo y las validaciones compensatorias queden registrados en este roadmap y en el handoff.

## Entregables por fase

| Fase | Entregables mínimos | Verificación |
| --- | --- | --- |
| 0 | baseline, tags, test matrix | commits/tags remotos, repos limpios y matriz completa |
| 1 | primeros módulos y wrappers | consumidor, diff literal y pruebas de preview/descarga |
| 2 | módulos por recurso | acciones del dominio fuera del coordinador y regresión |
| 3 | wrappers API consolidados | equivalencia de request/response y errores |
| 4 | módulos de generación/polling | transiciones y terminales equivalentes |
| 5 | mapa y estado de Biblioteca | matriz propiedad-consumidor y aliases |
| 6 | módulos de render/eventos | un solo binding y render estable |
| 7 | eliminación de dependencias activas de dashboard | inventario resuelto y Biblioteca operativa |
| 8 | módulo o aislamiento legacy | ruta vigente sin ejecución del explorador |
| 9 | eliminación segura del legacy | cero consumidores y matriz completa |
| 10 | documentación final y wrappers retirados | inventario final, pruebas y cierre documental |

## Actualización Fase 8 — Sesión 8.3

Estado reconciliado:

1. 8.0: auditoría de apertura, commit `9b8ede5`.
2. 8.1: explorer visual/navegación legacy, manual aprobada y commit `1aa1599`.
3. 8.2: siete bridges preview/download entregados a owners existentes, commit
   `6fb39ab`; manual aprobada por regresión acumulativa posterior.
4. 8.3: último corte coherente, manual aprobada y commit `cf48637`.
5. 8.4: auditoría formal de cierre completada; Fase 9 pendiente/no iniciada.

8.3 extrae cinco funciones/234 LOC del modal CRUD visual a
`js/features/dashboard/legacy-hierarchy-crud.js`. Mantiene listeners en
Bootstrap, estado y loaders técnicos en Dashboard, navegación en el owner
legacy y APIs en services. No incluye delete/archive ni Archivados.

Después del corte, `dashboard.page.js` queda en 2564 LOC/120 funciones. Lo
restante no justifica otra extracción de Fase 8: generación legacy está
protegida; actividades y jerarquía tienen consumidores compartidos;
delete/archive cruza el sistema congelado; wrappers/globals/estado pertenecen a
Fase 10. La auditoría de cierre confirmó estas fronteras y marca Fase 8
completada, sin abrir Fase 9.
