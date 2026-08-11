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
| 5 | Estado de Biblioteca | Reducir `explorerState` | Alto | En progreso |
| 6 | Render y eventos | Dividir `biblioteca.page.js` | Medio/alto | Pendiente |
| 7 | Desacoplar dashboard | Quitar dependencias activas | Alto | Pendiente |
| 8 | Aislar legacy visual | Separar explorador antiguo | Medio | Pendiente |
| 9 | Eliminar legacy confirmado | Borrar código sin consumidores | Alto | Pendiente |
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

**En progreso.**

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
queda **Aprobada, commit pendiente**. El contrato de exámenes permanece:
Biblioteca envía `unidad_id`, `batch_id`, `planeacion_ids`,
`tipos_pregunta` y `cantidades_pregunta`, no envía `tema_ids`, y backend
resuelve los temas desde `planeacion_ids`. Fase 5 continúa **En progreso**.

Siguiente corte propuesto, sin número definitivo y no iniciado: **A. Modal
individual de planeaciones**.

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

**Pendiente.**

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

**Pendiente.**

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

## Fase 8 — Aislar legacy visual

### Objetivo

Separar el explorador visual jerárquico antiguo de Biblioteca sin eliminar jerarquía técnica ni compatibilidad activa.

### Estado

**Pendiente.**

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

- La ruta vigente no carga ni ejecuta el explorador visual.
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

El legacy debe estar aislado y no tener consumidores confirmados; cualquier duda mantiene la Fase 9 bloqueada.

## Fase 9 — Eliminar legacy confirmado

### Objetivo

Eliminar únicamente código del explorador visual obsoleto demostrado sin consumidores.

### Estado

**Pendiente.**

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
