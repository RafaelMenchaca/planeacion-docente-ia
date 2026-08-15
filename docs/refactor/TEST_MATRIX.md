# Test Matrix

Matriz manual post-refactor. Todas las pruebas principales corresponden a Biblioteca. Archivados se valida por separado; el explorador visual jerárquico antiguo es legacy y no es un flujo principal de prueba.

| Flujo | Acción | Resultado esperado | Evidencia | Fase aplicable | Estado |
| --- | --- | --- | --- | --- | --- |
| Login | iniciar sesión | abre dashboard con Biblioteca | consola sin errores | 0-10 | Aprobada en línea base manual confirmada por el usuario |
| Biblioteca | cargar | sidebar y detalle visibles | GET conjuntos 200 | 0-10 | Aprobada en línea base manual confirmada por el usuario |
| Bloque | crear | bloque visible y seleccionado | feedback correcto | 0, 5-7 | Aprobada en línea base manual confirmada por el usuario |
| Tema | agregar a bloque | tema/planeación pendiente visible | progreso en Biblioteca | 0, 4-7 | Aprobada en línea base manual confirmada por el usuario |
| Planeación | generar | card completa | SSE/backend success | 0, 4 | Aprobada en línea base manual confirmada por el usuario |
| Planeación | abrir | detalle correcto | navegación sin error | 0, 2 | Aprobada en línea base manual confirmada por el usuario |
| Planeación | descargar desde card | modal, `.doc` y formato equivalentes | download success | 1-2 | Aprobada antes de abrir Fase 2; Fase 1 recibida como completada |
| Anexo | generar | card nueva | backend success | 0, 4 | Aprobada en línea base manual confirmada por el usuario |
| Anexo | abrir preview | modal correcto | sin error frontend | 0, 1-2 | Aprobada manualmente por el usuario |
| Anexo | descargar | archivo generado | download success | 0, 1-2 | Aprobada manualmente desde card y preview; archivo abre |
| Lista | generar | card o `skipped` correcto | backend success/skipped | 0, 4 | Aprobada en línea base manual confirmada por el usuario |
| Lista | abrir preview | modal correcto | wrapper disponible | 0, 1-2 | Aprobada manualmente por el usuario |
| Lista | descargar | archivo generado | download success | 0, 1-2 | Aprobada manualmente desde card y preview; archivo abre |
| Examen | generar | job creado | respuesta 202 | 0, 4 | Aprobada en línea base manual confirmada por el usuario |
| Examen | polling | progreso termina | job completed/failed | 0, 4 | Aprobada en línea base manual confirmada por el usuario |
| Examen | abrir/cerrar preview | modal correcto | wrapper disponible | 0, 1-2 | Aprobada manualmente; cierre y reapertura correctos |
| Examen | descargar | archivo generado | download success | 0, 1-2 | Aprobada manualmente desde card y preview; archivo abre |
| Recursos | eliminar | card desaparece | backend success | 0, 2 | Aprobada en línea base manual confirmada por el usuario |
| Bloque | eliminar | conjunto desaparece | backend success | 0, 2 | Aprobada en línea base manual confirmada por el usuario |
| Tabs | navegar | conserva bloque y tab esperado | sin doble render | 0, 5-6 | Aprobada manualmente por el usuario |
| Recarga | recargar dashboard | Biblioteca vuelve a cargar | sin activar árbol legacy | 0, 6-9 | Aprobada manualmente sin regresiones visibles |
| Legacy visual | cargar ruta vigente | no se muestra ni ejecuta el explorador | Biblioteca sigue activa | 8-9 | Aprobada en línea base manual confirmada por el usuario |
| Archivados | acceso separado y operaciones vigentes | flujo separado funciona | sin afectar Biblioteca | 0, 7-10 | Aprobada en línea base manual confirmada por el usuario |

## Evidencia automatizada de sesión 1.1

- `node --check js/features/examenes/exam-preview.js`: pasó.
- `node --check js/features/examenes/exam-download.js`: pasó.
- `node --check js/pages/dashboard.page.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- `git diff --check`: pasó.
- Validación manual posterior: aprobada por el usuario para preview, cierre/reapertura, descargas desde card/preview, apertura de archivo, tabs y recarga.

## Evidencia automatizada de sesión 1.3

- `node --check js/features/anexos/anexo-preview.js`: pasó.
- `node --check js/features/anexos/anexo-download.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- `git diff --check`: pasó.
- Smoke test JSDOM de namespaces, modal y descarga propia: pasó.
- Validación manual posterior: aprobada por el usuario para preview, cierre/reapertura, descargas desde card/preview, apertura de archivo, tabs y recarga.

## Evidencia automatizada de sesión 1.2

- `node --check js/features/listas-cotejo/lista-cotejo-preview.js`: pasó.
- `node --check js/features/listas-cotejo/lista-cotejo-download.js`: pasó.
- `node --check js/pages/dashboard.page.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- `git diff --check`: pasó.
- Smoke test JSDOM de namespaces, modal y delegación de descarga: pasó.
- Validación manual posterior: aprobada por el usuario para preview, cierre/reapertura, descargas desde card/preview, apertura de archivo, tabs y recarga.

## Evidencia de auditoría de cierre de Fase 1

- Commits confirmados: `609d6fd` (1.1), `6124a6f` (1.2), `e0c3e85` (1.3) y `fa0f3b1` (1.4).
- Frontend y backend limpios al iniciar la auditoría.
- Fase 0 cerrada con tags, commits, protección documental y confirmación manual del usuario.
- Sesión 1.4 completada: `bibDescargarPlaneacion(planeacionId)` vive en `js/features/planeaciones/planeacion-download.js`.
- No quedaron candidatos ni consumidores desconocidos.
- La validación acumulativa requerida quedó aprobada antes de abrir la Sesión 2.0; Fase 1 está completada.

## Evidencia automatizada de sesión 1.4

- `node --check js/features/planeaciones/planeacion-download.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- `git diff --check`: pasó.
- Smoke JSDOM de namespace, wrapper, modal, Blob y delegación: pasó.
- Comparación contra `HEAD`: HTML, MIME, nombre, URL temporal, revocación y resultado equivalentes.
- Validación manual y regresión acumulativa: aprobadas antes de abrir la Fase 2.

## Sesión 2.0 — Auditoría de acciones por dominio

- Revisión estática: acciones, consumidores, APIs, IDs, confirmaciones, estado y renders clasificados.
- Eliminaciones diferenciadas: planeación, anexo, lista, examen y bloque.
- Consumidores desconocidos: cero.
- Primera sesión seleccionada: 2.1 — Coordinador de descarga de examen desde Biblioteca.
- `git status --short`: solo tres Markdown de refactor modificados.
- `git diff --stat`: 3 archivos, 220 inserciones y 24 eliminaciones antes de registrar esta línea.
- `git diff --check`: pasó; Git solo informó la conversión futura LF→CRLF del working copy.
- Verificación de enlaces Markdown locales: pasó.
- Backend `git status --short`: limpio.
- No se ejecutaron pruebas de navegador porque esta sesión no modificó código funcional.

### Matriz obligatoria para Sesión 2.1

| Flujo | Acción | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Examen | descargar desde card | conserva nombre sugerido, modal editable, `.doc`, contenido y logs | Aprobada manualmente |
| Examen | cancelar nombre | no descarga y conserva retorno/promesa | Aprobada manualmente |
| Examen | error de exportación | conserva `console.error` y no altera estado/render | Sin errores relacionados observados |
| Examen | descargar desde preview | flujo aprobado de Fase 1 sin regresión | Aprobada manualmente |
| Biblioteca | tabs, recarga y otra descarga | sin listeners, globals o descargas duplicadas | Aprobada manualmente |

## Evidencia automatizada de sesión 2.1

- `node --check js/features/examenes/exam-download.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó para namespace, wrapper, búsqueda en caché, fallback a `obtenerExamenDetalle`, cancelación del modal, nombre editado, delegación al exportador, retorno de promesa, manejo de error, logs y resolución real entre scripts clásicos.
- Búsqueda global post-cambio: una implementación canónica, wrapper conocido, consumidor conocido y cero referencias desconocidas.
- Orden de scripts: confirmado sin cambios; `exam-download.js` carga antes de `dashboard.page.js` y `biblioteca.page.js`.
- Validación manual: aprobada por el usuario para descarga y cancelación desde card, nombre sugerido/editado, `.doc` válido, preview y descarga desde preview, descargas de planeación/lista/anexo, tabs, recarga, segunda descarga, cero duplicados, cero errores relacionados y legacy visual no ejecutado.

## Sesión 2.2 — Eliminación individual de examen

| Flujo | Acción | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Examen | cancelar eliminación | conserva card y no llama `DELETE` | Aprobada manualmente |
| Examen | confirmar eliminación | una llamada `DELETE`, card fuera del array y contador actualizado | Aprobada manualmente |
| Biblioteca | conservar bloque y tab | selección estable y tab `examenes` después de render/recarga | Aprobada manualmente |
| Examen | persistencia tras recarga | examen no reaparece; otros recursos permanecen | Aprobada manualmente |
| Examen | API con error | no muta estado y conserva alerta/log | Smoke aprobado; sin errores relacionados observados |
| Regresión | preview, descargas, tabs y otros dominios | sin regresiones ni ejecución de legacy | Aprobada manualmente |

### Evidencia automatizada

- Comparación literal del cuerpo contra `HEAD`: pasó, ignorando únicamente indentación del nuevo contenedor.
- `node --check js/features/examenes/exam-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó para namespace, wrapper, cancelación, sesión, API/UUID, array, contador, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, conjunto ausente y cero llamadas dobles.
- Smoke de scripts clásicos: `ExamDelete` y `bibEliminarExamen` disponibles sin excepciones inmediatas.
- Validación manual: aprobada por el usuario. Se confirmó cancelación sin eliminación, eliminación exclusiva del examen, card retirada, bloque/tab conservados, otros recursos intactos, persistencia tras recarga y fila eliminada en Supabase, sin errores relacionados.

## Sesión 2.3 — Eliminación individual de lista de cotejo

| Flujo | Acción | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Lista | cancelar eliminación | conserva card y no llama `DELETE` | Aprobado |
| Lista | confirmar eliminación | una llamada `DELETE`, lista fuera del array y contador actualizado | Aprobado |
| Biblioteca | conservar bloque y tab | selección estable y tab `listas` después de render/recarga | Aprobado |
| Lista | persistencia tras recarga | lista no reaparece; planeación y otros recursos permanecen | Aprobado |
| Lista | API con error | no muta estado y conserva alerta/log | Smoke aprobado; navegador pendiente |
| Regresión | preview/descarga de lista, examen modularizado y otros dominios | sin regresiones ni ejecución de legacy | Aprobado |

### Evidencia automatizada

- Comparación literal del cuerpo contra `HEAD`: pasó, ignorando únicamente indentación del nuevo contenedor.
- `node --check js/features/listas-cotejo/lista-cotejo-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, sesión, API/UUID, array, `total_listas_cotejo`, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, lista ausente y cero llamadas dobles.
- Smoke de scripts clásicos: `ListaCotejoDelete` y `bibEliminarLista` disponibles sin excepciones inmediatas.
- Validación manual de cancelación, eliminación real, persistencia y regresión: aprobada por el usuario. Se confirmó una única eliminación exitosa (`[listas-cotejo] delete:success`), permanencia del bloque y tab, persistencia tras recarga, conservación de planeación, anexo, exámenes y otras listas, y ausencia de errores relacionados.

## Sesión 2.4 — Eliminación individual de anexo

| Flujo | Acción | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Anexo | cancelar eliminación | conserva card y no llama `DELETE` | Aprobado |
| Anexo | confirmar eliminación | una llamada `DELETE`, anexo fuera del array y contador actualizado | Aprobado |
| Biblioteca | conservar bloque y tab | selección estable y tab `anexos` después de render/recarga | Aprobado |
| Anexo | persistencia tras recarga | anexo no reaparece; planeación y otros recursos permanecen | Aprobado |
| Anexo | API con error | no muta estado y conserva alerta/log | Smoke aprobado; navegador pendiente |
| Regresión | preview/descarga de anexo, deletes modularizados y otros dominios | sin regresiones ni ejecución de legacy | Aprobado |

### Evidencia automatizada

- Comparación literal del cuerpo contra `HEAD`: pasó, ignorando únicamente indentación del nuevo contenedor.
- `node --check js/features/anexos/anexo-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, sesión, API/UUID, array, `total_anexos`, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, anexo ausente y cero llamadas dobles.
- Validación manual de cancelación, eliminación real, persistencia y regresión: aprobada por el usuario. Se confirmó eliminación exclusiva del anexo, contador y bloque/tab conservados, persistencia tras recarga, planeación/listas/exámenes y otros anexos intactos, una sola fila eliminada en Supabase y ausencia de errores relacionados.

## Sesión 2.5 — Eliminación individual de planeación

| Flujo | Acción | Resultado esperado | Estado |
| --- | --- | --- | --- |
| Planeación | cancelar eliminación | conserva planeación, anexo y lista; no solicita sesión ni llama `DELETE` | Aprobado |
| Planeación | confirmar eliminación | una llamada al endpoint directo; planeación y relaciones locales fuera de sus arrays | Aprobado |
| Biblioteca | actualizar contadores | `total_planeaciones`, `total_anexos` y `total_listas_cotejo` equivalen a sus arrays | Aprobado |
| Biblioteca | conservar bloque y tab | selección estable y tab `planeaciones` después de render/recarga | Aprobado |
| Examen | conservar relación no eliminada | `examenes` y `total_examenes` permanecen intactos | Aprobado |
| Planeación | persistencia y contrato backend | planeación, anexos y listas no reaparecen; examen y batch permanecen | Aprobado |
| Planeación | API con error | no inicia mutación local y conserva alerta/log | Smoke aprobado; navegador pendiente |
| Regresión | descarga, deletes anteriores, previews y tabs | sin regresiones ni ejecución de legacy | Aprobado |

### Evidencia automatizada

- Comparación literal del cuerpo contra `HEAD`: pasó, ignorando únicamente indentación del nuevo contenedor.
- `node --check js/features/planeaciones/planeacion-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, sesión, API/IDs, tres arrays/contadores, exámenes intactos, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, estado local ausente y cero llamadas dobles.
- Smoke de scripts clásicos: `PlaneacionDelete`, `bibEliminarPlaneacion` e `initBiblioteca` disponibles sin excepciones inmediatas.
- Validación manual de cancelación, eliminación real, persistencia, Supabase, relaciones y regresión: aprobada por el usuario. Se confirmó planeación/anexo/lista eliminados, examen y batch intactos, otros recursos conservados, contadores/bloque/tab correctos, persistencia tras recarga y ausencia de errores relacionados.

## Sesión 2.6 — Auditoría específica de eliminación de bloque

| Área auditada | Evidencia | Resultado |
| --- | --- | --- |
| Consumidor | Botón del detalle → `data-bib-action="eliminar-bloque"` → `bibEliminarBloque` | Único consumidor activo; sin desconocidos |
| API | `apiBibliotecaDeleteBloque` → `DELETE /api/biblioteca/bloques/:batchId` | Contrato confirmado |
| Backend | anexos → listas → exámenes → planeaciones → batch | Secuencial, sin transacción ni rollback |
| Respuesta parcial | fallo final devuelve `ok:true`, `deleted.batch:false` | Frontend ignora el campo y recarga |
| Estado | conjunto, selección, tab y cuatro mapas pending | Dependencias identificadas |
| Render | render general inmediato y recarga silenciosa | Orden identificado |
| Archivados | planeaciones archivadas con el batch también se eliminan | Impacto confirmado |
| Jobs/métricas/jerarquía | no existen deletes en el servicio | Permanecen |
| Viabilidad | wrapper, namespace y extracción literal posibles | Sesión 2.7 aprobada |

No se ejecutaron pruebas funcionales en 2.6 porque la sesión solo modificó documentación. La validación estática se limita a estado, diff, enlaces y alcance Markdown.

## Sesión 2.7 — Eliminación de bloque desde Biblioteca

| Escenario | Validación | Resultado |
| --- | --- | --- |
| Namespace y wrapper | `BibliotecaBlockDelete.deleteFromBiblioteca` y `bibEliminarBloque` disponibles | Aprobado en smoke JSDOM |
| UUID, título y fallback | normalización, título local y `"este bloque"` | Aprobado en smoke JSDOM |
| Cancelación y sesión ausente | sin llamada DELETE ni mutación | Aprobado en smoke JSDOM |
| Eliminación seleccionada | filtra conjunto y selecciona el primero restante | Aprobado en smoke JSDOM |
| Eliminación no seleccionada | conserva la selección actual | Aprobado en smoke JSDOM |
| Último bloque | selección final `null` | Aprobado en smoke JSDOM |
| Estado | limpia tab y cuatro mapas del batch; conserva claves y propiedades ajenas | Aprobado en smoke JSDOM |
| Render y recarga | render general seguido de recarga `{ silent: true }` | Aprobado en smoke JSDOM |
| Respuesta parcial | `deleted.batch:false` se trata igual que `true` | Aprobado en smoke JSDOM |
| Error HTTP | sin mutación local; conserva log y alerta | Aprobado en smoke JSDOM |
| Cancelación manual | bloque y recursos permanecen; cero DELETE | Aprobada por el usuario |
| Eliminación manual | recursos, batch, selección, persistencia y Supabase | Aprobada por el usuario |
| Regresión manual | previews, descargas, deletes individuales, tabs y legacy | Aprobada por el usuario |

### Evidencia automatizada

- Comparación literal del cuerpo contra `HEAD`: pasó, ignorando únicamente la indentación del nuevo contenedor.
- `node --check js/features/biblioteca/biblioteca-block-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó con 27 comprobaciones funcionales agrupadas.
- Validación manual 2.7: aprobada por el usuario. Cancelación sin DELETE, eliminación de los cuatro dominios y `planeacion_batches`, persistencia, otros bloques, selección/estado vacío, previews, descargas y deletes individuales quedaron confirmados sin errores relacionados ni ejecución legacy.
- Logs backend confirmados: `[biblioteca] delete:start` y `[biblioteca] delete:success` con `deletedBatch: true`.

## Sesión 2.8 — Auditoría de cierre de Fase 2

| Criterio | Evidencia | Resultado |
| --- | --- | --- |
| Commits | Sesiones 2.0–2.7 presentes en `refactor-front` | Aprobado |
| Validaciones manuales | Sesiones 2.1–2.7 confirmadas por el usuario | Aprobado |
| Downloads de Fase 2 | Coordinador de examen en `ExamDownload` | Completado |
| Deletes individuales | Examen, lista, anexo y planeación modularizados | Completado |
| Delete de bloque | `BibliotecaBlockDelete` y wrapper vigente | Completado |
| Wrappers | Firmas y consumidores conocidos; retiro en Fase 10 | Aprobado |
| Consumidores desconocidos | Búsqueda global de acciones, globals y `data-bib-action` | Cero |
| Candidatos adicionales de Fase 2 | Acciones restantes clasificadas en Fases 3–10 | Ninguno |
| Regresión acumulativa | Evidencia manual 2.1–2.7 | Aprobada |

Decisión final: **A. Cerrar Fase 2 y abrir Fase 3.**

Próxima sesión: `Fase 3 — Sesión 3.0: Auditoría de capa API frontend`. No se implementó Fase 3 durante esta auditoría.

## Sesión 3.0 — Auditoría de capa API frontend

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial frontend | `refactor-front`, HEAD `7414292`, árbol limpio | Aprobado |
| Cierre de Fase 2 | Commit `7414292` y documentación de Fases 0–2 | Aprobado |
| Estado backend | `refactor-back`, HEAD `e08d6e4`, árbol limpio | Aprobado |
| Archivos API/services/core | Lectura completa y tabla en `FRONTEND_MAP.md` | Aprobado |
| Funciones HTTP y wrappers | Método, endpoint, token, respuesta, error y consumidores | Aprobado |
| Búsqueda HTTP global | `fetch`, `/api/`, auth, headers, parsing y errores | Aprobado |
| Fetch fuera de API | Tres loaders HTML; cero llamadas Express fuera de `js/api` | Aprobado |
| Contratos backend | Rutas, middleware, controllers y services contrastados | Aprobado |
| Duplicados y aliases | Duplicados reales separados de wrappers y contratos distintos | Aprobado |
| Flujos separados | Biblioteca, Detalle, Archivados y legacy clasificados | Aprobado |
| Desconocidos | Cero archivos, funciones o endpoints desconocidos | Aprobado |
| Sesión siguiente | Una sola 3.1: lecturas de Biblioteca | Aprobado |
| Alcance | Solo Markdown; sin cambios funcionales ni backend | Aprobado |

No se ejecutaron pruebas funcionales: la Sesión 3.0 solo modifica
documentación. La validación manual acumulativa de Fase 2 permanece aprobada y
no se solicita de nuevo.

## Sesión 3.1 — Consolidación de lecturas de Biblioteca

| Escenario | Evidencia | Resultado |
| --- | --- | --- |
| Listado exitoso | URL, GET implícito, Bearer, `no-store`, identidad del array | Aprobado en smoke |
| Detalle exitoso | URL con UUID, GET implícito, Bearer, `no-store`, identidad del objeto | Aprobado en smoke |
| Error JSON | `{error:"mensaje de prueba"}` en ambas funciones | Aprobado; mismo mensaje |
| Error JSON sin `error` | Payload con solo `message` | Aprobado; `HTTP 404` |
| Error HTTP no JSON | HTML simulado | Aprobado; `HTTP 500` |
| JSON inválido en 2xx | `response.json()` rechaza | Aprobado; mismo objeto `SyntaxError` |
| Globals | Dos funciones públicas con firmas vigentes | Aprobado en script clásico |
| Helper | `bibliotecaGet` ausente de `window` | Aprobado |
| Peticiones | Una llamada por invocación | Aprobado; 10 de 10 |
| Deletes | No delegan al helper; bloque literal sin cambios | Aprobado estáticamente |
| Otros API/consumidores/HTML | Sin diff | Aprobado estáticamente |
| Biblioteca manual | Carga, bloques, tabs, recarga, una carga esperada | Aprobado por el usuario; 0 duplicados inesperados |
| Detalle manual | Metadata, título/unidad/contexto y vuelta | Aprobado por el usuario |
| Regresión manual | Previews, descargas y deletes; sin generación/Archivados/legacy | Aprobado por el usuario; 0 errores relacionados |

### Evidencia automatizada

- Smoke previo: pasó con 10 requests y 18 aserciones contractuales.
- `node --check js/api/biblioteca.api.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Smoke posterior: pasó con 10 requests y 20 aserciones contractuales/de
  aislamiento.
- Búsqueda global: dos globals públicas, dos consumidores conocidos, un helper
  privado y cero consumidores desconocidos.
- Validación manual 3.1 aprobada por el usuario: carga inicial, cambio entre
  bloques, tabs, recarga, apertura desde Biblioteca, metadata, título/unidad,
  regreso, previews, descargas y deletes; cero duplicados inesperados y cero
  errores relacionados.

## Sesión 3.2 — Consolidación interna de deletes de Biblioteca

| Escenario | Evidencia | Resultado |
| --- | --- | --- |
| Bloque exitoso | URL codificada, DELETE, Bearer, sin body/cache, identidad de `{ok,deleted}` | Aprobado en smoke |
| Planeación directa exitosa | Endpoint `/:id/directo`, DELETE, Bearer, identidad de `{ok:true}` | Aprobado en smoke |
| Examen exitoso | Endpoint `/:id`, DELETE, Bearer, identidad de `{ok:true}` | Aprobado en smoke |
| Lista exitosa | Endpoint `/:id`, DELETE, Bearer, identidad de `{ok:true}` | Aprobado en smoke |
| Anexo exitoso | Endpoint `/:id`, DELETE, Bearer, identidad de `{ok:true}` | Aprobado en smoke |
| Codificación de ID | IDs con espacio y `/ ? #` | Aprobado; `encodeURIComponent` preservado |
| Peticiones | Una llamada por invocación | Aprobado en smoke |
| Error JSON | `{error:"mensaje de prueba"}` para cada global | Aprobado; mismo mensaje |
| Error JSON sin `error` | Payload con solo `message` | Aprobado; fallback `HTTP 409` |
| Error HTTP no JSON | HTML y JSON inválido simulados | Aprobado; fallback `HTTP <status>` |
| JSON inválido en 2xx | `response.json()` rechaza | Aprobado; mismo objeto `SyntaxError` |
| Respuesta parcial de bloque | `{ok:true,deleted:{batch:false}}` | Aprobado; retorno sin transformación |
| Respuesta completa de bloque | `{ok:true,deleted:{batch:true}}` | Aprobado; retorno sin transformación |
| Globals | Cinco funciones públicas con firmas vigentes | Aprobado en script clásico |
| Helper DELETE | `bibliotecaDelete` ausente de `window` | Aprobado |
| Helper GET | `bibliotecaGet` sin cambios y ausente de `window` | Aprobado estáticamente |
| Consumidores/otros API/HTML/backend | Sin diff | Aprobado estáticamente |
| Cancelaciones manuales | Examen, lista, anexo, planeación y bloque sin DELETE | Aprobado por el usuario |
| Deletes reales manuales | Cinco recursos correctos; base de datos revisada | Aprobado por el usuario |
| Persistencia manual | Registros esperados ausentes en base de datos | Aprobado por el usuario |
| Regresión manual | Cero errores relacionados con el refactor | Aprobado por el usuario |

### Evidencia automatizada

- Smoke previo: pasó con 32 peticiones simuladas para cinco globals.
- Smoke posterior: pasó con 32 peticiones simuladas para cinco globals y helper
  privado.
- `node --check js/api/biblioteca.api.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Búsqueda global: cinco globals públicas, cinco consumidores conocidos, un
  helper DELETE privado y cero consumidores desconocidos.
- `bibliotecaGet`, features, páginas, services, HTML, otros API files y backend
  permanecen sin cambios.
- Validación manual 3.2 aprobada por el usuario: cinco cancelaciones sin
  eliminación, cinco deletes reales, verificación de cada registro en base de
  datos y logs backend de éxito para examen, lista, anexo, planeación directa y
  bloque con `deletedBatch:true`; cero errores relacionados.

## Sesión 3.3 — Auditoría puntual de APIs de anexos

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial | `refactor-front`, HEAD `6a96d79`, árbol limpio | Aprobado |
| Validación 3.2 | Evidencia manual y logs proporcionados por el usuario | Aprobada |
| Backend | `refactor-back`, HEAD `e08d6e4`, árbol limpio | Aprobado |
| Funciones | Cinco APIs en anexos y un delete en Biblioteca | Clasificadas |
| Service frontend | `js/services/anexos.service.js` | No existe |
| Consumidores | Generación activa, detalle con dos consumidores, regeneración compatible, delete activo | Confirmados |
| Sin consumidor | Lecturas por batch y por planeación | Confirmado sin aliases |
| Helpers | Headers, parsing, error y request | Cuatro identificados |
| Lecturas | GET, Bearer, `no-store`, parsing y error equivalentes | Viable consolidar |
| Generación/regeneración | IA, métricas y pending | Fase 4 |
| Delete | Ya consolidado y validado en 3.2 | Conservar |
| Desconocidos | Funciones, consumidores y endpoints | Cero |
| Sesión siguiente | Una sola 3.4: tres lecturas de anexos | Aprobado |
| Alcance | Solo Markdown; sin cambios funcionales ni backend | Aprobado |

No se ejecutaron pruebas funcionales porque 3.3 solo modifica documentación.
La validación manual 3.2 permanece aprobada y no debe solicitarse de nuevo.

## Sesión 3.4 — Consolidación interna de lecturas de anexos

| Escenario | Evidencia | Resultado |
| --- | --- | --- |
| Lectura por batch | URL y UUID codificados, GET implícito, Bearer, sin `Content-Type`/body, `no-store`, `{anexos}` | Aprobado en smoke |
| Lectura por planeación | URL con bigint, GET implícito, Bearer, sin `Content-Type`/body, `no-store`, `{anexo}` | Aprobado en smoke |
| Lectura de detalle | URL y UUID codificados, GET implícito, Bearer, `{anexo}` | Aprobado en smoke |
| Peticiones | Una llamada por invocación | Aprobado en smoke |
| Error con `payload.error` | Mensaje prioritario, status y payload | Aprobado en smoke |
| Error con `payload.message` | Mensaje secundario, status y payload | Aprobado en smoke |
| Error sin mensaje | Fallback específico, status y payload | Aprobado en smoke |
| HTTP no JSON | Fallback específico, status y `payload:null` | Aprobado en smoke |
| Cuerpo vacío exitoso | Retorno `null` | Aprobado en smoke |
| JSON inválido exitoso | Retorno `null` | Aprobado en smoke |
| Globals | Tres funciones públicas con firmas vigentes | Aprobado en script clásico |
| Helper | `anexosGet` ausente de `window` | Aprobado |
| Helpers protegidos | Headers, parsing, error y request sin cambios | Aprobado por comparación con `HEAD` |
| Generación/regeneración | Cuerpos literales sin cambios | Aprobado por comparación con `HEAD` |
| Delete/consumidores/HTML/backend | Sin diff | Aprobado estáticamente |
| Preview manual | Contenido, título, metadata, cierre/reapertura y una lectura | Aprobado por el usuario |
| Descarga desde card | Modal, nombre, archivo, formato y una lectura | Aprobado por el usuario |
| Descarga desde preview | Reutiliza objeto y no repite lectura | Aprobado por el usuario |
| Regresión manual | Sin GET duplicados ni errores relacionados con `anexosGet` | Aprobado por el usuario |

### Evidencia automatizada

- Smoke previo: pasó con 21 peticiones simuladas y 113 aserciones.
- Smoke posterior: pasó con 21 peticiones simuladas y 114 aserciones.
- `node --check js/api/anexos.api.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Las lecturas por batch y planeación, sin consumidor confirmado, se validaron
  únicamente mediante smoke.
- Validación manual 3.4 aprobada por el usuario: preview, metadata/contenido,
  reapertura, ambas descargas, modal/nombre/archivo, reutilización del objeto,
  cero GET duplicados y cero errores relacionados.

## Sesión 3.5 — Auditoría puntual de APIs de listas de cotejo

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial | `refactor-front`, HEAD `18e96ba`, árbol limpio | Aprobado |
| Validación 3.4 | Evidencia manual proporcionada por el usuario | Aprobada |
| Backend | `refactor-back`, HEAD `e08d6e4`, árbol limpio | Aprobado |
| Funciones | Tres APIs, tres wrappers service y delete en Biblioteca | Clasificadas |
| Consumidores | Biblioteca, features y explorador legacy | Confirmados |
| Desconocidos | Funciones y consumidores | Cero |
| Helpers | Headers, parsing, error y request | Cuatro identificados |
| API/service | Sesión y normalizaciones distintas | Ambos niveles conservados |
| Lecturas | GET equivalente; retornos service distintos | Viable consolidar API |
| Generación | Selección por IDs, unidad legacy, pending y métricas | Fase 4 |
| Preview/descarga | Detalle activo; preview reutiliza objeto al descargar | Confirmado |
| Delete | Consolidado en Biblioteca desde 3.2 | Conservar |
| Sesión siguiente | Una sola 3.6: dos lecturas de listas | Aprobado |
| Alcance | Solo Markdown; sin cambios funcionales ni backend | Aprobado |

No se ejecutaron pruebas funcionales en 3.5 porque la sesión solo modifica
documentación. La validación manual 3.4 permanece aprobada y no debe solicitarse
de nuevo.

## Sesión 3.6 — Consolidación interna de lecturas de listas de cotejo

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial | `refactor-front`, HEAD `1006abb`; commit 3.5 `0c3c1e3`; árbol limpio | Aprobado |
| Backend | `refactor-back`, HEAD `e08d6e4`, árbol limpio | Aprobado |
| Consumidores | Service legacy por unidad; service activo hacia preview/descarga | Confirmados; cero desconocidos |
| Por unidad | URL codificada, GET implícito, Bearer, sin `Content-Type`/body, `no-store`, `{listas}` | Aprobado en smoke |
| Detalle | URL codificada, GET implícito, Bearer, sin `Content-Type`/body, `no-store`, `{lista}` | Aprobado en smoke |
| Error con `error` | Mensaje prioritario, status y payload | Aprobado en smoke |
| Error con `message` | Mensaje secundario, status y payload | Aprobado en smoke |
| Error sin mensaje | Fallback específico, status y payload | Aprobado en smoke |
| HTTP no JSON | Fallback específico, status y `payload:null` | Aprobado en smoke |
| Cuerpo vacío/JSON inválido exitoso | Retorno `null` | Aprobado en smoke |
| Globals | Dos APIs públicas; `listasCotejoGet` ausente de `window` | Aprobado |
| Ejecutores protegidos | `requestListaCoTejoJson` y tres helpers auxiliares sin cambios | Aprobado por diff |
| Aislamiento | Generación, services, delete, features, páginas, HTML y backend sin cambios | Aprobado estáticamente |
| Sintaxis | `node --check js/api/listas_cotejo.api.js` | Aprobado |
| Suite | `npm test -- --runInBand` | 1 suite y 2 pruebas aprobadas |
| Preview manual | Apertura, cierre y reapertura | Aprobado por el usuario |
| Descarga desde card | Flujo completo de descarga | Aprobado por el usuario |
| Descarga desde preview | Reutilización del objeto sin segunda lectura | Aprobado por el usuario |
| Regresión manual | Biblioteca/tabs, cinco deletes, persistencia/base de datos y `deletedBatch:true` | Aprobado por el usuario |

### Evidencia automatizada

- Smoke previo: 48 aserciones y 14 peticiones simuladas.
- Smoke posterior: 50 aserciones y 14 peticiones simuladas.
- Cada función realizó una petición por invocación.
- El listado legacy se validó solo mediante smoke, sin ejecutar su UI.
- Validación manual 3.6 aprobada por el usuario: preview/reapertura, ambas
  descargas, reutilización del objeto, Biblioteca/tabs, cinco deletes,
  persistencia/base de datos, `deletedBatch:true` y cero errores relacionados.
- Siguiente sesión única: `3.7 — Auditoría puntual de APIs de exámenes`.

## Sesión 3.7 — Auditoría puntual de APIs de exámenes

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial | `refactor-front`, HEAD `6ce5a95`, árbol limpio | Aprobado |
| Commit 3.6 | `6ce5a95 refactor(frontend): consolidate checklist read requests` | Presente |
| Validación 3.6 | Evidencia manual y logs aportados por el usuario | Aprobada |
| Backend | `refactor-back`, HEAD `e08d6e4`, árbol limpio | Aprobado |
| Funciones | Cuatro APIs, cuatro wrappers service y delete en Biblioteca | Clasificadas |
| Consumidores | Biblioteca, features, Dashboard y explorador legacy | Confirmados |
| Desconocidos | Funciones y consumidores | Cero |
| Helpers API | Headers, parsing, error y request | Cuatro identificados |
| API/service | Sesión y normalizaciones conservadas | Ambos niveles necesarios |
| Lecturas | Listado legacy y detalle activo comparten GET | Viable consolidar API |
| Generación | Payloads Biblioteca/legacy, jobs, worker, retries y métricas | Fase 4 |
| Polling | Directo en Biblioteca y mediante service en legacy | Fase 4 |
| Preview/descarga | Detalle activo con caché compartida | Confirmado |
| Delete | Consolidado en Biblioteca desde 3.2 | Conservar |
| Sesión siguiente | Una sola 3.8: listado por unidad y detalle | Aprobado |
| Alcance | Solo Markdown; sin cambios funcionales ni backend | Aprobado |

No se ejecutaron pruebas funcionales en 3.7 porque la sesión solo modifica
documentación. La validación manual 3.6 permanece aprobada y no debe solicitarse
de nuevo.

## Sesión 3.8 — Consolidación interna de lecturas de exámenes

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Estado inicial | `refactor-front`, HEAD `00665b6`, árbol limpio | Aprobado |
| Backend | `refactor-back`, HEAD `e08d6e4`, árbol limpio | Aprobado |
| Consumidores | Service legacy por unidad; service compartido hacia preview, descarga y post-generación | Confirmados; cero desconocidos |
| Por unidad | URL codificada, GET implícito, Bearer, sin `Content-Type`/`Accept`/body, `no-store`, `{examenes}` | Aprobado en smoke |
| Detalle | URL codificada, GET implícito, Bearer, sin `Content-Type`/`Accept`/body, `no-store`, `{examen}` | Aprobado en smoke |
| Error con `error` | Mensaje prioritario, status y payload | Aprobado en smoke |
| Error con `message` | Mensaje secundario, status y payload | Aprobado en smoke |
| Error sin mensaje | Fallback específico, status y payload | Aprobado en smoke |
| HTTP no JSON | Fallback específico, status y `payload:null` | Aprobado en smoke |
| Cuerpo vacío/JSON inválido exitoso | Retorno `null` | Aprobado en smoke |
| Globals | Cuatro APIs públicas; `examResourceGet` ausente de `window` | Aprobado |
| Ejecutor protegido | `requestExamJson` y tres helpers auxiliares sin cambios | Aprobado contra `HEAD` |
| Generación | `apiExamenesGenerate` idéntica a `HEAD` | Aprobado |
| Polling | `apiExamenGenerationStatus` idéntica a `HEAD` y fuera del helper | Aprobado |
| Aislamiento | Services, delete, features, páginas, HTML y backend sin cambios | Aprobado estáticamente |
| Sintaxis | `node --check js/api/examenes.api.js` | Aprobado |
| Suite | `npm test -- --runInBand` | 1 suite y 2 pruebas aprobadas |
| Preview manual | Título, instrucciones, total, preguntas, opciones, respuestas, tipos y reapertura | Aprobado por el usuario |
| Descarga desde card | Modal, nombre, archivo, formato y una lectura | Aprobado por el usuario |
| Descarga desde preview | Reutilización del objeto sin segunda lectura | Aprobado por el usuario |
| Regresión manual | Biblioteca/tabs, previews, descargas de otros dominios y cero errores del helper | Aprobado por el usuario |
| Regresión de generación | Anexo, lista y examen; payload, selección, polling, deduplicación, retries, fallback, guardado y métricas | Aprobado por el usuario |

### Evidencia automatizada

- Smoke previo: 55 aserciones y 14 peticiones simuladas.
- Smoke posterior: 57 aserciones y 14 peticiones simuladas.
- Cada función realizó una petición por invocación.
- El listado legacy se validó solo mediante smoke, sin ejecutar su UI.
- Generación y polling se compararon contra `HEAD` y quedaron idénticos.
- Validación manual 3.8: aprobada por el usuario.
- La regresión adicional de generación se registra como evidencia de no
  regresión de 3.8; no constituye trabajo de Fase 4.

## Sesión 3.9 — Auditoría de cierre de capa API frontend

| Verificación | Evidencia | Resultado |
| --- | --- | --- |
| Commits 3.0–3.8 | Historial `refactor-front`, de `ac23955` a `b59366c` | Aprobado |
| Repositorios | Frontend y backend limpios al iniciar | Aprobado |
| Inventario global | API, services, funciones HTTP, consumidores, globals, auth, headers, parsing, errores y aliases | Completo |
| Helpers de Fase 3 | Cinco bindings léxicos privados y específicos | Aprobado |
| Globals/wrappers | API, services, features, `bib*`, polling, legacy y Archivados | Conservados |
| Consumidores desconocidos | Búsqueda global e inventario acumulado | Cero |
| Biblioteca | GET y DELETE consolidados internamente | Aprobado |
| Anexos | GET consolidado; generación/regeneración/delete intactos | Aprobado |
| Listas | GET consolidado; services/generación/delete/legacy intactos | Aprobado |
| Exámenes | GET de recursos consolidado; generación/status/polling intactos | Aprobado |
| Planeaciones y jerarquía | Contratos mixtos con fases futuras explícitas | No bloquean |
| Cliente/helper universal | No creado por incompatibilidad contractual | Aprobado |
| Validaciones manuales | 3.1, 3.2, 3.4, 3.6 y 3.8 | Aprobadas |
| Código funcional en 3.9 | Sin modificaciones | Aprobado |
| Decisión | Criterios de salida completos | A. Cerrar Fase 3 |

### Validación manual acumulativa de Fase 3

| Sesión | Dominio | Validación |
| --- | --- | --- |
| 3.1 | Lecturas de Biblioteca | Aprobada |
| 3.2 | Deletes de Biblioteca | Aprobada |
| 3.4 | Lecturas de anexos | Aprobada |
| 3.6 | Lecturas de listas de cotejo | Aprobada |
| 3.8 | Lecturas de exámenes | Aprobada |

Fase 3 cerrada. Al terminar su auditoría de cierre, la Fase 4 permanecía
pendiente y debía comenzar en una nueva conversación.

## Regresión acumulativa

- Cada fase ejecuta sus pruebas propias y las pruebas críticas de todas las fases anteriores.
- Login y carga de Biblioteca son críticas en todas las fases.
- Desde Fase 1, preview y descarga del recurso extraído permanecen en la regresión.
- Desde Fase 4, toda generación y polling ya separados permanecen en la regresión.
- Desde Fase 5, tabs, selección, modales y recarga permanecen en la regresión.
- Las Fases 8 y 9 ejecutan la matriz completa, incluido Archivados como flujo separado.
- Una fase no avanza mientras exista una regresión sin resolver o sin decisión explícita documentada.

## Errores globales

Comprobar en todos los recorridos:

- errores JavaScript y promesas rechazadas;
- funciones `window.*` inexistentes;
- errores HTTP inesperados;
- peticiones o listeners duplicados;
- polling que continúa después de salir;
- activación accidental del árbol o breadcrumbs legacy.

Si se conserva una prueba del explorador antiguo por una dependencia todavía no migrada, marcarla explícitamente como **compatibilidad / no regresión temporal**; nunca como experiencia principal soportada.

## Sesión 4.0 — Auditoría documental de apertura

Esta auditoría no modificó comportamiento ni aprobó pruebas manuales de Fase 4.
Define la regresión que debe ejecutar cada extracción funcional posterior. Su
contenido fue **aprobado explícitamente por el usuario** al abrir la primera
sesión funcional.

### Regresión común obligatoria

| Área | Verificación futura | Contrato protegido |
| --- | --- | --- |
| Entrada | Una acción del usuario inicia una sola coordinación | Sin listeners, requests o jobs duplicados |
| Auth/HTTP | Sesión, Bearer, headers, método, URL, body y parsing idénticos | Incluye metadata y prioridad de mensajes de error |
| Pending | Se crea, actualiza y limpia en los mismos momentos | Error, parcial y reload conservan comportamiento |
| Feedback | Modal, card, pill, mensaje y consola siguen equivalentes | No exponer error interno ni payload sensible |
| Persistencia | Éxito persiste y aparece tras refetch/reload | IDs y relaciones se conservan |
| Navegación | Mantener la ausencia actual de cancelación/reanudación salvo tarea explícita | No introducir cleanup funcional accidental |
| Consumidores | Biblioteca, quick create, wrappers, globals, delete de bloque y compatibilidad siguen accesibles | Orden clásico de scripts sin cambios |
| Regresión Fase 3 | Previews, reapertura, contenido, tipos, descargas y lecturas/deletes consolidados | Fase 3 permanece cerrada |
| Aislamiento | JavaScript ajeno al recurso, HTML, CSS, `wordExport.js`, backend y package files sin cambios salvo autorización expresa futura | Un recurso por sesión |

### Planeaciones

| Escenario | Evidencia esperada |
| --- | --- |
| Agregar tema a bloque | Payload por unidad y `batch_id` idénticos; un request stream |
| Creación rápida: bloque existente | Jerarquía técnica, `pendingBatchId`, progreso y reconciliación conservados |
| Creación rápida: bloque nuevo | `titulo_conjunto`, `force_new_batch/mode`, card temporal y batch real conservados |
| SSE exitoso | `item_started`, `item_completed`, `done`, cards y refetch |
| SSE parcial | `item_error`/`item_skipped`, mensajes, contadores y pending equivalente |
| Fallback | Solo se activa bajo la condición vigente de cada service; mismo endpoint JSON |
| Error/reload | Sin timeout/cancelación nuevos; estado local y persistencia se comportan como antes |
| Consumidor no confirmado | No activar ni retirar `planeacion.page.js` sin auditoría separada |

### Anexos

| Escenario | Evidencia esperada |
| --- | --- |
| Uno seleccionado | POST `{planeacion_id}`, card temporal, persistencia y refetch |
| Varios seleccionados | Requests secuenciales y feedback por item, sin paralelización accidental |
| `already_exists` | Unicidad y retorno backend preservados |
| Éxito parcial | Misma actualización optimista, limpieza y tratamiento de cards error |
| Fallo total/timeout backend | Errores por card permanecen; mismo mensaje/metadata |
| Compatibilidad | `bibGenerarAnexo` y `bibRegenerarAnexo` conservan firmas y ramas sin emisor |
| Logs/métricas | Eventos start/success/error y versión `v1_anexos_desde_planeacion` sin cambios |

### Listas de cotejo

| Escenario | Evidencia esperada |
| --- | --- |
| Selección explícita | Payload `{planeacion_ids}` y bloqueo de listas ya existentes |
| Éxito | `created`, espera local de 1.5 s, limpieza y refetch |
| Skipped | `already_exists`, `missing_closing_activity` e `invalid_ai_response` preservados |
| Actividades | `actividades_momentos` y fallback `actividad_cierre` equivalentes |
| Salida | Cinco criterios, valores 2/0 y total 10 |
| Error/reload | Mismas cards/mensaje; sin polling, SSE, cancelación ni timeout frontend nuevos |
| Compatibilidad legacy | Payload con `unidad_id`, toast y service permanecen aislados |
| Logs/métricas | Start/success backend, success frontend y versión `v2_lista_cotejo_actividades_momentos` |

### Exámenes

| Escenario | Evidencia esperada |
| --- | --- |
| Payload | `unidad_id`, `batch_id`, `planeacion_ids`, `tipos_pregunta`, `cantidades_pregunta`; total derivado |
| Creación | HTTP 202, un `job_id`, items por reactivo y worker agendado |
| Polling vigente | GET cada 3 s, máximo 60, token capturado, `current_step` y una card |
| Terminal exitoso | `completed`, cleanup pending, refetch y examen persistido |
| Terminal fallido | `failed` y mensaje genérico protegido |
| Timeout | Borde actual del poll 60 documentado; no corregir dentro de extracción literal |
| Reload/navegación | Polling local no se reanuda/cancela; job backend continúa |
| Worker | Selección unidad/temas, deduplicación, retries, sustitución, fallback y cantidad final |
| Compatibilidad legacy | Polling 1.5 s/4 s sin límite y terminales adicionales permanecen separados |
| Logs/métricas | Todos los eventos backend confirmados y `v8_unit_exam_counts_by_type_completion` |

### Revisión documental de apertura

| Verificación | Estado |
| --- | --- |
| Identidad `Sesión 4.0 — Auditoría documental de apertura` | Aprobada por el usuario |
| Inventario de flujos, consumidores y contratos | Aprobado por el usuario |
| Polling, SSE, pending, feedback y riesgos | Aprobado por el usuario |
| Secuencia sugerida por roadmap y Sesión 4.1 como primer corte | Aprobada por el usuario |
| Prueba funcional de Fase 4 | No ejecutada; no aplica a esta sesión documental |

## Sesión 4.1 — extracción literal de generación de anexos desde Biblioteca

La Sesión 4.1 mueve literalmente la operación a
`AnexoGeneration.generateFromBiblioteca()` y conserva
`submitBibliotecaAnexoCreateModal()` como validador y wrapper de UI.

### Evidencia estática y smoke

| Verificación | Estado |
| --- | --- |
| Sintaxis de módulo y página | Aprobada |
| Comparación del bloque con `HEAD`, salvo parámetros explícitos | Idéntica |
| Namespace y consumidor global | Aprobado |
| Un request por seleccionado y máximo uno simultáneo | Aprobado |
| Éxito y actualización optimista | Aprobado |
| Éxito parcial y limpieza asimétrica vigente | Aprobado |
| Fallo total y error pending por card | Aprobado |
| Refetch solo cuando existe al menos un éxito | Aprobado |
| Total del smoke aislado | 19 aserciones aprobadas |

### Validación manual aprobada

| Escenario | Estado |
| --- | --- |
| Cancelar antes de generar no crea pending ni request | Aprobada |
| Generar un anexo: card pending, preview, persistencia, base de datos y logs | Aprobada |
| Generar varios anexos conserva el orden secuencial | Aprobada |
| Error controlado/éxito parcial conserva feedback y limpieza vigentes, solo si puede probarse con seguridad | No ejecutada; no existe mecanismo controlado seguro, no bloquea |
| Eliminar bloque después de generar conserva el cleanup; no probar durante una generación activa | Aprobada |
| Regresión mínima de otros tabs, sin generación adicional ni errores relacionados | Aprobada |

La validación manual de anexos quedó aprobada explícitamente por el usuario. La
Fase 4 permanece en progreso.

## Sesión 4.2 — extracción literal de generación seleccionada de listas de cotejo desde Biblioteca

La Sesión 4.2 mueve literalmente la operación a
`ListaCotejoGeneration.generateFromBiblioteca()` y conserva
`submitBibliotecaListaModal()` como validador y wrapper de UI.

### Evidencia estática y smoke

| Verificación | Estado |
| --- | --- |
| Sintaxis de feature y página | Aprobada |
| Comparación del bloque con `HEAD`, salvo parámetros explícitos | Idéntica |
| Namespace y delegación única | Aprobado |
| Request único y payload `{planeacion_ids}` ordenado | Aprobado |
| Pending por planeación seleccionada | Aprobado |
| Conteos `created` y `skipped` | Aprobado |
| Espera local exacta de 1500 ms | Aprobada |
| Cleanup y refetch de éxito | Aprobado |
| Error conserva items y feedback repetido | Aprobado |
| Delete de bloque conserva cleanup indirecto | Aprobado |
| Total del smoke aislado | 33 comprobaciones aprobadas |

### Validación manual aprobada

| Escenario | Estado |
| --- | --- |
| Cancelar/cerrar modal: cero POST, cero pending y reapertura funcional | Aprobada |
| Generar una lista: tab, card, un POST, payload, preview, persistencia, base y logs | Aprobada |
| Generar varias listas: un POST, IDs, pending por card, `created`/`skipped` y persistencia | Aprobada |
| Reabrir modal: listas existentes bloqueadas, submit reutilizable y cero request al cancelar | Aprobada |
| `skipped` real, solo si ocurre naturalmente y de forma segura | No ejecutada; no existe mecanismo controlado seguro, no bloquea |
| Error controlado, solo si existe un mecanismo real seguro | No ejecutada; no existe mecanismo controlado seguro, no bloquea |
| Eliminar bloque después de terminar; verificar cleanup y persistencia | Aprobada |
| Regresión mínima de Planeaciones, Anexos, Exámenes y regreso a Listas | Aprobada |

La validación manual de listas quedó aprobada explícitamente por el usuario. La
Fase 4 permanece en progreso.

## Sesión 4.3 — extracción literal del inicio y progreso de generación de planeaciones desde Biblioteca

La Sesión 4.3 mueve literalmente el coordinador exclusivo a
`PlaneacionGeneration.generateFromBiblioteca()` y
conserva `submitBibliotecaAgregarModal()` como propietario del modal, captura
DOM, validación y snapshot.

### Evidencia estática y smoke

| Verificación | Estado |
| --- | --- |
| Sintaxis de feature y página | Aprobada |
| Comparación literal del bloque con `HEAD`, salvo indentación | 62 líneas idénticas |
| Namespace y delegación única | Aprobado |
| Quick create byte-idéntico a `HEAD` | Aprobado |
| Generación individual byte-idéntica a `HEAD` | Aprobada |
| API/service/parser SSE compartidos byte-idénticos a `HEAD` | Aprobados |
| Payload `{temas,materia,nivel,batch_id}` y endpoint | Aprobados |
| Eventos y pending por índice | Aprobados |
| Parciales, cleanup, reconciliación y refetch | Aprobados |
| Delete de bloque conserva cleanup indirecto | Aprobado |
| Suite automatizada existente | 1 suite, 2 pruebas aprobadas |
| Smoke aislado | 31 comprobaciones aprobadas |

### Validación manual aprobada

| Escenario | Estado |
| --- | --- |
| Cancelar/cerrar modal antes del submit: cero POST y cero pending | Aprobada |
| Generar un tema: un request SSE, progreso, card final y persistencia | Aprobada |
| Generar varios temas: orden, eventos por índice, conteos y persistencia | Aprobada: `success_count:2`, `error_count:0`, `skipped_count:0`; Gravedad y Movimiento |
| Reutilizar el modal: sin submitting atascado, tratamiento previo de temas existentes y cero request al cancelar | Aprobada |
| Resultado parcial/skipped, solo si ocurre de forma natural y segura | No ocurrió: cero errores y cero skipped; no se forzó |
| Quick create vigente: progreso, creación, feedback, reload, persistencia y consola sin regresión | Aprobada |
| Eliminar bloque después de terminar conserva cleanup y persistencia | Aprobada |
| Regresión de Planeaciones, Anexos, Listas, Exámenes, previews, descargas y consola | Aprobada; examen acumulativo de 17 preguntas, cero fallidas y cero retries |

La validación manual de la Sesión 4.3 quedó aprobada explícitamente por el
usuario. El error legacy de schema cache de `public.ia_metrics` sigue siendo un
hallazgo previo no causado por el refactor; `[aiMetrics] job:finished` permaneció
operativo. La Fase 4 permanece en progreso.

## Sesión 4.4 — auditoría específica y extracción literal de generación y polling de exámenes desde Biblioteca

La Sesión 4.4 mueve literalmente el bloque exclusivo a
`ExamGeneration.generateFromBiblioteca()` y conserva
`submitBibliotecaExamModal()` como propietario de DOM, selección, validación,
tipos/cantidades, sesión, submitting y payload.

### Evidencia estática y smoke

| Verificación | Estado |
| --- | --- |
| Sintaxis de feature y página | Aprobada |
| Comparación literal con `HEAD`, salvo parámetros explícitos | 62 líneas idénticas; solo `accessToken` y `conjuntoId` explícitos |
| Namespace y delegación única | Aprobado |
| Creación de job única y `job_id` requerido | Aprobada |
| Payload `{unidad_id,batch_id,tipos_pregunta,cantidades_pregunta,planeacion_ids}` | Aprobado |
| Espera inicial/intervalo de 3000 ms y máximo 60 | Aprobados |
| `queued`/`processing`/desconocido, `current_step`, `completed` y `failed` | Aprobados |
| Timeout y borde vigente del poll 60 | Preservados, no corregidos |
| Pending `{message,error}`, cleanup, render y refetch | Aprobados |
| Legacy, API/service y delete indirecto | Intactos/compatibles |
| Suite automatizada existente | Aprobada |
| Smoke aislado | 22 comprobaciones, 6 escenarios aprobados |

### Fase 4 — Sesión 4.4

**Validación manual: Aprobada.** Se usaron las planeaciones 668/669 y los temas
Gravedad/Movimiento.

| Prueba | Estado y evidencia requerida |
| --- | --- |
| 1 — Cancelación | Aprobada: cero POST y reapertura funcional. |
| 2 — Generación básica | Aprobada: jobId, polling, `current_step`, `completed`, persistencia y reload. |
| 3 — Contratos de tipos y cantidades | Aprobada: siete tipos; 19 solicitadas y 19 guardadas. |
| 4 — Contexto correcto | Aprobada: unidad, batch, planeaciones y temas correctos. |
| 5 — Polling | Aprobada: polling y terminal `completed` correctos. |
| 6 — Reutilización del modal | Aprobada. |
| 7 — Preview y descarga | Aprobada desde card y preview. |
| 8 — Delete | Aprobada. |
| 9 — Regresión de recursos | Aprobada. |
| 10 — Failed o timeout | No ejecutada; no ocurrió naturalmente y no se forzó. No bloquea. |
| 11 — Duplicados y reintentos | Aprobada por observación: cero preguntas fallidas y cero retries. |

Evidencia: unidad `56377d0c-e5b5-4ded-8ab0-9fbb992228c4`, batch
`3df729c9-a803-4f6e-884d-9685ec971398`, planeaciones 668/669; cantidades 5, 5,
1, 3, 3, 1 y 1 para opción múltiple, verdadero/falso, emparejamiento,
respuesta corta, cálculo numérico, pregunta abierta y ordenación. Se observaron
los logs de recepción, input/batch/job, worker, contexto, pregunta aceptada,
`exam:saved`, `generate:success` y `[aiMetrics] job:finished`.

## Sesión 4.5 — auditoría formal de cierre de generación y polling

### Auditoría acumulativa

| Verificación | Estado |
| --- | --- |
| Features `AnexoGeneration`, `ListaCotejoGeneration`, `PlaneacionGeneration`, `ExamGeneration` | Aprobados; cuatro globals sin colisión |
| Consumidor esperado por feature | Aprobado; uno por feature en Biblioteca |
| Consumo accidental desde quick create/legacy | Ausente |
| Orden API/service → feature → Biblioteca | Aprobado |
| Definiciones duplicadas, referencias rotas o dependencia circular evidente | Ausentes |
| Comparación contra baseline `ecb1785` | Cuatro extracciones literales, cuatro delegaciones y cuatro scripts |
| Quick create, generación individual y legacy | Byte-idénticos al baseline |
| API/services, delete de bloque y `wordExport.js` | Byte-idénticos al baseline |
| CSS y package files | Sin cambios desde baseline |
| Sintaxis | Cuatro features y Biblioteca aprobados |
| Jest | 1 suite, 2 pruebas aprobadas |
| Smoke acumulativo final | 38 comprobaciones; 4 globals y 4 consumidores |
| Backend | `refactor-back`, `e08d6e4`, limpio y solo lectura |
| Regresión introducida por Fase 4 | Ninguna detectada |

### Evidencia manual acumulada

| Sesión | Evidencia aprobada |
| --- | --- |
| 4.1 | Cancelación, anexos individuales/secuenciales, pending, preview, reload, modal, delete y tabs; `[anexos] generate:start/success`, `[anexos] delete:success` y `[aiMetrics] job:finished`. |
| 4.2 | Cancelación, request único, `planeacion_ids`, pending, preview, reload, modal, `created:1`, `skipped:0`, delete y tabs; logs start, `lista_generada_por_id`, success, métricas y delete Biblioteca. |
| 4.3 | Uno/varios temas, SSE único `stream=1`, payload, pending/progreso, reload, modal, quick create, delete y recursos; `success_count:2`, cero errores/skipped. |
| 4.4 | Job/polling/current_step/completed, 19/19 preguntas, siete tipos, contexto correcto, cero fallidas/retries, reload, modal, preview, descargas, delete y recursos. |

Failed/timeout de 4.4 no se forzaron y no bloquean. El fallo legacy de
`public.ia_metrics` es preexistente; `[aiMetrics] job:finished` quedó confirmado.

### Fase 4 — Sesión 4.5

**Validación manual documental: Aprobada explícitamente por el usuario.**

Evidencia aprobada: inventario 4.0–4.5 revisado; evidencia acumulada revisada;
contratos preservados revisados; riesgos preservados revisados; ausencia de
regresiones confirmada; decisión **A. Cerrar Fase 4** aprobada; y Fase 5
mantenida como pendiente y no iniciada. No quedaron pruebas funcionales nuevas
pendientes para 4.5.

## Fase 5 — Sesión 5.0: auditoría documental de apertura

Esta sesión no modifica comportamiento y no requiere generar ni eliminar
recursos. Las pruebas siguientes son regresiones **futuras** para cortes
funcionales de Fase 5; ninguna se ejecutó ni se aprobó en 5.0.

### Selección y tabs

| Prueba futura | Resultado a proteger | Estado |
| --- | --- | --- |
| Seleccionar un bloque y cambiar entre todos sus tabs | `selectedConjuntoId` y `activeTab` no se cruzan con otro bloque | Pendiente |
| Abrir un recurso, navegar y volver | selección/tab conservan el comportamiento vigente | Pendiente |
| Recargar con un bloque/tab seleccionado | se reconstruyen datos y se aplica el fallback vigente, sin prometer persistencia inexistente | Pendiente |

### Pending y procesos largos

| Prueba futura | Resultado a proteger | Estado |
| --- | --- | --- |
| Generación individual y múltiple por cada dominio | pending aparece solo en batch/card correspondiente | Pendiente |
| Éxito, error y resultado parcial permitido | cleanup y feedback conservan las reglas actuales | Pendiente |
| Delete posterior a la terminal | mapas del bloque se limpian y otros bloques quedan intactos | Pendiente |
| Reload y navegación durante/después del proceso | no hay pending cruzado; se documenta que no existe reanudación | Pendiente |

### Modales

| Prueba futura | Resultado a proteger | Estado |
| --- | --- | --- |
| Abrir, cambiar selección, cancelar y reabrir cada modal | no hereda datos de otro bloque; open reemplaza el estado | Pendiente |
| Generar y volver a abrir | submit/error/selección quedan reutilizables según el contrato vigente | Pendiente |
| Sesión ausente de forma segura, si existe mecanismo controlado | verificar riesgo de `submitting` atascado sin provocar cambios destructivos | Pendiente |

### Quick Create

| Prueba futura | Resultado a proteger | Estado |
| --- | --- | --- |
| Generar con Quick Create y observar progreso | parser SSE, `explorerState.progress` y fachada `window.biblioteca` permanecen equivalentes | Pendiente |
| Navegar y recargar tras terminar | persistencia backend visible y Biblioteca sin estado cruzado | Pendiente |
| Reutilizar bloque existente y crear bloque nuevo | `pendingBatchId`, selección y conjunto temporal no se mezclan | Pendiente |

### Delete de bloque

| Prueba futura | Resultado a proteger | Estado |
| --- | --- | --- |
| Eliminar un bloque sin proceso activo | selección fallback, tab y cuatro mapas se limpian | Pendiente |
| Navegar entre bloques y recargar después | otros bloques, tabs y recursos permanecen intactos | Pendiente |
| Delete durante proceso | Fuera del primer corte; no ejecutar hasta tener un mecanismo seguro, pues no cancela backend | Pendiente / diferida |

### Compatibilidad, Archivados y legacy

| Prueba futura | Resultado a proteger | Estado |
| --- | --- | --- |
| Cargar Dashboard/Biblioteca | scripts clásicos y globals existentes cargan sin errores | Pendiente |
| Previews de examen/lista y descarga | consumidores vigentes de `window.explorerState` permanecen | Pendiente |
| Abrir Archivados separado | `archivedState` y registro local funcionan sin compartir estado de Biblioteca | Pendiente |
| Comprobar ruta vigente | no se reactiva el explorador visual ni se retiran wrappers | Pendiente |

### Revisión documental de 5.0

**Validación manual documental: Aprobada explícitamente por el usuario.**

Evidencia aprobada: objetivo canónico revisado; inventario de estado y matriz
de propiedades revisados; pending maps, selección, tabs y modales revisados;
Quick Create, compatibilidad, Archivados y legacy revisados; riesgos y límites
entre Fases 5–10 revisados; pruebas futuras revisadas; decisión **A. Abrir Fase
5** aprobada; y Fase 5 abierta y En progreso. La auditoría y sus validaciones
estáticas quedaron completadas en `525a21a`.

Las pruebas funcionales de cortes posteriores de Fase 5 permanecen pendientes.
La Sesión 5.1 quedó aprobada y commiteada en `1b4c620`; la implementación, las
validaciones estáticas y la validación manual de la Sesión 5.2 están aprobadas,
con commit `f5bbfdd`. La Sesión 5.3 tiene implementación y validaciones
estáticas y validación manual aprobadas; quedó commiteada en `f05e730`. La
Sesión 5.4 tiene implementación, validaciones estáticas y validación manual
aprobadas; quedó commiteada en `948d627`. La Sesión 5.5 tiene implementación y
validaciones estáticas y validación manual aprobadas; quedó commiteada en
`3842f20`. La Sesión 5.6 tiene implementación, validaciones estáticas y
validación manual aprobadas; quedó commiteada en `d45a493`. La Sesión 5.7 tiene
implementación, validaciones estáticas y validación manual aprobadas; quedó
commiteada en `9b3c23d`. La Sesión 5.8 completó y aprobó la auditoría formal de
cierre; Fase 5 está completada y Fase 6 permanece pendiente y no iniciada.

## Fase 5 — Sesión 5.1: selección de bloque de Biblioteca

La extracción encapsula únicamente el acceso a
`bibliotecaState.selectedConjuntoId`; la única fuente física, normalización,
fallbacks y consumidores permanecen. El smoke técnico y las validaciones
estáticas no sustituyen esta matriz.

**Validación manual: Aprobada explícitamente por el usuario.**

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| 1. Selección básica | bloque inicial; alternancia; sidebar y detalle coincidentes; sin errores | Aprobada |
| 2. Tabs por bloque | tabs/recursos correctos al cambiar de bloque y volver; sin cruce | Aprobada |
| 3. Reload | fallback previo; sin restauración nueva ni errores | Aprobada |
| 4. Refetch | selección válida conservada sin salto inesperado | Aprobada |
| 5. Creación de recurso | recurso en batch correcto y mismo bloque seleccionado | Aprobada |
| 6. Quick Create | navegación vigente; `window.biblioteca` funcional; bloque correcto; persistencia backend tras reload | Aprobada |
| 7. Delete de otro bloque | selección original conservada antes y después de reload | Aprobada |
| 8. Delete del bloque seleccionado | fallback previo exacto; sidebar/detalle coherentes; sin referencia eliminada | Aprobada |
| 9. Último bloque, solo con datos desechables y si es seguro | no existe confirmación explícita de ejecución | No ejecutada o no confirmada explícitamente; no bloquea |
| 10. Modales | modal cerrado/reabierto después de cambiar selección usa el bloque nuevo | Aprobada |
| 11. Regresión acumulativa | Planeaciones, Anexos, Listas, Exámenes, previews, descargas, tabs, delete y Quick Create sin errores nuevos | Aprobada |

Evidencia de delete aportada: `[examenes] delete:success`,
`[listas-cotejo] delete:success`, `[anexos] delete:success`,
`[planeaciones] delete:start/success`, `[biblioteca] delete:start/success` y
`deletedBatch:true`. No se registraron IDs ni datos sensibles.

No se modificó `activeTab`, pending, modales, render, eventos, Quick Create,
`window.explorerState`, backend ni persistencia. La Fase 5 continúa En progreso.

## Fase 5 — Sesión 5.2: ownership de `activeTab` en Biblioteca

La extracción encapsula exclusivamente el mapa existente
`bibliotecaState.activeTab` mediante `BibliotecaTabs`. Shape, claves, valores,
fallbacks, selección, render, eventos y consumidores permanecen. Las
validaciones estáticas y el smoke no sustituyen estas pruebas.

**Validación manual: Aprobada explícitamente por el usuario.**

**Commit funcional: `f5bbfdd`.**

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| 1. Tab inicial | bloque seleccionado, tab inicial y contenido coinciden; consola limpia | Aprobada |
| 2. Cambio de tab | Planeaciones, Anexos, Listas y Exámenes muestran contenido/clase activa correctos | Aprobada |
| 3. Tabs por bloque | A y B conservan exactamente el comportamiento previo, sin recursos cruzados | Aprobada |
| 4. Reload | fallback previo y ausencia de persistencia nueva | Aprobada |
| 5. Refetch | tab resultante no cambia inesperadamente | Aprobada |
| 6. Generación de planeación | Planeaciones se activa en el momento previo; pending/resultado correctos | Aprobada |
| 7. Generación de anexo | Anexos se activa; pending/resultado y bloque correctos | Aprobada |
| 8. Generación de lista | Listas se activa; pending/resultado sin cruce | Aprobada |
| 9. Generación de examen | Exámenes activo durante card/polling y al terminar | Aprobada |
| 10. Delete individual | tab conservado, refetch y contenido correctos | Aprobada |
| 11. Delete de otro bloque | selección/tab/contenido del bloque actual permanecen | Aprobada |
| 12. Delete del seleccionado | selección y tab fallback, sidebar y contenido coherentes; reload correcto | Aprobada |
| 13. Último bloque, solo si es seguro | estado/mapa vacíos y nuevo bloque con tab inicial; si no, registrar no ejecutada por seguridad | No ejecutada o no confirmada explícitamente; no bloquea |
| 14. Quick Create | batch real, tab vigente, fachada `window.biblioteca` y reload correctos | Aprobada |
| 15. Regresión acumulativa | selección, recursos, previews, descargas, delete y Quick Create sin errores nuevos | Aprobada |

La aprobación confirmó al menos una generación inmediata/request largo y el
polling de examen con Exámenes activo, además de reload/refetch, deletes, Quick
Create, regresión acumulativa y ausencia de errores nuevos.

Prueba de último bloque: no ejecutada o no confirmada explícitamente; no
bloquea.

La Fase 5 continúa En progreso. La Sesión 5.3 quedó implementada y se registra a
continuación.

## Fase 5 — Sesión 5.3: estado del modal de generación de anexos

La extracción encapsula exclusivamente `bibliotecaState.anexoModal` mediante
`BibliotecaAnexoModalState`. La única fuente física, shape, valores, orden,
render, eventos, generación y pending permanecen. `node --check`, Jest (1 suite,
2 pruebas), el smoke aislado de 27 comprobaciones y la reversión mecánica byte a
byte contra `HEAD` quedaron aprobados.

**Validación manual: Aprobada explícitamente por el usuario.**

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| 1. Apertura básica | bloque con planeaciones; modal muestra las correctas; consola limpia | Aprobada |
| 2. Selección | checkboxes cambian; cerrar/reabrir reconstruye exactamente como antes | Aprobada |
| 3. Cancelación | cerrar/cancelar produce cero POST y cero pending; reapertura funcional | Aprobada |
| 4. Cambio de bloque | abrir en A, cerrar, abrir en B; solo planeaciones de B y sin selección de A | Aprobada |
| 5. Planeación ya cubierta | inclusión/exclusión, checkbox, mensaje y selección conservan la regla previa | Aprobada |
| 6. Sin planeaciones elegibles | estado visual, botón y mensaje vigentes; solo si ocurre natural y seguro | No ejecutada o no confirmada explícitamente; no bloquea |
| 7. Generación individual | cierre, tab Anexos, pending correcto, resultado y persistencia tras reload | Aprobada |
| 8. Generación múltiple | secuencia vigente, pending por card, resultados sin cruce, cleanup y reload | Aprobada |
| 9. Reutilización | reabrir tras generar sin submitting bloqueado; selección reconstruida; cerrar sin request | Aprobada |
| 10. Error o parcial | feedback y cleanup vigentes solo si ocurre de forma natural; no forzar fallos | No ejecutada; no ocurrió de forma natural y segura; no bloquea |
| 11. Delete y reapertura | eliminar anexo, reabrir y confirmar disponibilidad/selección previas | Aprobada |
| 12. Reload y navegación | cerrar, reload, reabrir y alternar bloques; reconstrucción desde datos actuales | Aprobada |
| 13. Otros modales | Planeaciones, Listas y Exámenes conservan sus estados | Aprobada |
| 14. Regresión acumulativa | selección, tabs, cuatro dominios, previews, descargas, delete y Quick Create sin errores | Aprobada |

Evidencia: `[anexos] generate:success` para `planeacionId` 359, 360 y 361;
`[anexos] delete:success`; generación secuencial y pending por card confirmados;
sin errores nuevos.

No se debe solicitar ni registrar tokens, sesiones, prompts o datos personales.
La Fase 5 continúa En progreso.

## Fase 5 — Sesión 5.4: estado del modal de generación de listas de cotejo

La extracción encapsula exclusivamente `bibliotecaState.listaModal` mediante
`BibliotecaListaModalState`. Fuente física, shape, valores, orden, render,
eventos, `ListaCotejoGeneration`, payload y `pendingListaByBatchId` permanecen.
Las validaciones estáticas y el smoke no sustituyen esta matriz.

**Validación manual: Aprobada explícitamente por el usuario.**

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| 1. Apertura básica | bloque con planeaciones; modal muestra las correctas; consola limpia | Aprobada |
| 2. Selección y reapertura | marcar/desmarcar, cerrar y reabrir conserva exactamente el comportamiento previo | Aprobada |
| 3. Cancelación | cero requests y cero pending nuevo; reapertura funcional | Aprobada |
| 4. Cambio de bloque | abrir en A y luego B; solo planeaciones de B y sin selección cruzada | Aprobada |
| 5. Planeación con lista existente | inclusión/exclusión, checkbox, mensaje y disponibilidad conservan la regla previa | Aprobada |
| 6. Sin planeaciones elegibles | estado visual previo; solo si ocurre natural y seguro | No ejecutada o no confirmada explícitamente; no bloquea |
| 7. Generación individual | cierre, tab Listas, pending, resultado y persistencia tras reload | Aprobada |
| 8. Generación múltiple | request/comportamiento previo, resultados sin cruce, cleanup y reload | Aprobada |
| 9. Reutilización | reabrir sin submitting bloqueado; reconstrucción; cerrar sin request adicional | Aprobada |
| 10. Error o parcial | feedback/cleanup previos solo si ocurre naturalmente; no forzar | No ejecutada; no ocurrió naturalmente; no bloquea |
| 11. Delete y reapertura | eliminar lista, esperar refetch y confirmar disponibilidad previa de la planeación | Aprobada |
| 12. Reload y navegación | cerrar, reload, reabrir y alternar bloques; reconstrucción desde datos actuales | Aprobada |
| 13. Modal de anexos | `BibliotecaAnexoModalState`, apertura, selección, cierre y reapertura intactos | Aprobada |
| 14. Otros modales | Planeaciones y Exámenes intactos | Aprobada |
| 15. Regresión acumulativa | selección, tabs, cuatro dominios, previews, descargas, delete y Quick Create sin errores | Aprobada |

Evidencia real: `[listas-cotejo] generate:start` con `planeacionesCount:1`,
`[lista-cotejo] lista_generada_por_id` y
`[listas-cotejo] generate:success` con `created:1`, `skipped:0`. La regresión
acumulativa confirmó generación de anexos, examen con polling, reintentos y
fallback, generación de planeaciones, delete de planeación y delete de bloque,
sin errores nuevos.

El fallo externo de `public.ia_metrics` ausente del schema cache no es una
regresión de 5.4 y permanece fuera de alcance. Render que muta selección,
sesión nula con posible `submitting=true`, cierre parcial, estado efímero, IDs
String/Number, delete sin cancelación, pending de error visible, cleanup de
1500 ms y ownership separado de pending permanecen como riesgos preservados.

**Commit funcional de 5.4: `948d627`.**

## Fase 5 — Sesión 5.5: estado del modal de generación de exámenes

La extracción encapsula exclusivamente `bibliotecaState.examModal` mediante
`BibliotecaExamModalState`. Fuente física, shape, bloque, unidad, planeaciones,
selección, tipos, cantidades, orden, render, eventos, payload,
`ExamGeneration`, job, `pendingExamenByBatchId` y polling permanecen. Las
validaciones estáticas y el smoke no sustituyen esta matriz.

**Validación manual: Aprobada explícitamente por el usuario.**

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| 1. Apertura básica | bloque y unidad correctos; planeaciones correctas; consola sin errores nuevos | Aprobada |
| 2. Selección y reapertura | marcar/desmarcar planeaciones, cambiar tipos/cantidades, cerrar y reabrir conserva la reconstrucción previa | Aprobada |
| 3. Cancelación | cero request de generación, cero job y cero pending nuevo; reapertura funcional | Aprobada |
| 4. Cambio de bloque | abrir en A y luego B; unidad/planeaciones de B y cero estado cruzado | Aprobada |
| 5. Tipos de pregunta | checkboxes, inputs, estado disabled y valores internos vigentes para los tipos reales de UI | Aprobada |
| 6. Cantidades | cantidades, total/resultados y validaciones vigentes; no forzar valores inseguros | Aprobada |
| 7. Generación mínima | una planeación/configuración pequeña; cierre, tab Exámenes, pending, job, polling, guardado y reload | Aprobada |
| 8. Varias planeaciones | al menos dos del mismo bloque; contexto usa sus temas y no otra unidad; persistencia | Aprobada |
| 9. Distribución por tipos | al menos dos tipos; cantidades solicitadas, total solicitado/generado y tipos del resultado | Aprobada |
| 10. Reintentos y fallback | solo si ocurre naturalmente: rechazo no cancela job, reintento y total completo sin error prematuro | No ejecutada en esta corrida; comportamiento ya validado previamente; no bloquea |
| 11. Reutilización | reabrir tras generar sin submitting bloqueado; reconstrucción; cerrar sin job adicional | Aprobada |
| 12. Delete y reapertura | eliminar examen, esperar refetch, reabrir y confirmar estado; regenerar solo si es seguro | Aprobada |
| 13. Reload y navegación | cerrar, recargar, reabrir y cambiar de bloque; reconstrucción vigente | Aprobada |
| 14. Modales anteriores | Anexos y Listas abren, cierran y conservan sus superficies aprobadas | Aprobada |
| 15. Modal de planeaciones | agregar/generar planeaciones no fue afectado | Aprobada |
| 16. Regresión acumulativa | selección, tabs, cuatro dominios, previews, descargas, delete y Quick Create sin errores nuevos | Aprobada |

Casos opcionales —backend caído, job `failed`, timeout, sin planeaciones, sin
tipos, error parcial y credenciales inválidas— no ocurrieron de forma natural y
segura, no se forzaron y no bloquean.

Evidencia resumida: `totalPlaneaciones:2`, planeaciones 690 y 691; cuatro tipos
con cantidades `5/5/1/1`; `totalRequested:12`; contexto correcto para “Python
orientado a objetos” y “javascript para desarrollo web”; `totalPreguntas:12`,
cero fallidas, cero retries, `exam:saved` y `generate:success`.

Contrato confirmado: Biblioteca envía `unidad_id`, `batch_id`,
`planeacion_ids`, `tipos_pregunta` y `cantidades_pregunta`; no envía
`tema_ids`. Backend continúa resolviendo los temas desde `planeacion_ids`.

Riesgos preservados: sesión nula con posible `submitting=true`, cierre parcial,
estado/job no reanudable tras reload o navegación, IDs String/Number, límite
visual de 30 no impuesto por el listener, cantidades de tipos desactivados
conservadas, delete sin cancelación, pending persistente en error/timeout y
frontera del poll 60. No son correcciones de 5.5.

**Commit funcional de 5.5: `3842f20`.**

## Fase 5 — Sesión 5.6: modal de Planeaciones y auditoría acumulativa de modales

La extracción encapsula exclusivamente `bibliotecaState.agregarModal` mediante
`BibliotecaPlaneacionModalState`. Fuente física, shape sin `submitting`, bloque,
unidad, contexto, temas, actividades, error, snapshot, `PlaneacionGeneration`,
SSE, `pendingPlaneacionesByBatchId`, tab, refetch y Quick Create permanecen.
Las validaciones estáticas y el smoke no sustituyen esta matriz.

**Validación manual: Aprobada explícitamente por el usuario.** Commit funcional:
`d45a493`.

### Modal de Planeaciones

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| 1. Apertura | bloque, unidad, materia y nivel correctos; temas inicialmente vacíos | Aprobada |
| 2. Bloque sin unidad | alert previo; modal no abre; cero request/pending | Aprobada |
| 3. Alta de tema | título y duración válidos agregan un tema con actividades vacías | Aprobada |
| 4. Validación de duración | valor menor a 10 conserva mensaje previo; no genera | Aprobada |
| 5. Actividades por momento | conocimientos previos, desarrollo y cierre conservan selección al agregar otro tema y al generar | Aprobada |
| 6. Eliminación de tema | solo el tema elegido desaparece; restantes intactos | Aprobada |
| 7. Cancelación | cerrar/cancelar/backdrop produce cero request y cero pending nuevo | Aprobada |
| 8. Cierre y reapertura | close conserva objeto internamente; reopen reconstruye temas vacíos como antes | Aprobada |
| 9. Cambio de bloque | abrir A y luego B usa contexto de B, sin temas/actividades cruzados | Aprobada |
| 10. Generación individual | cierre, tab Planeaciones, pending, SSE, resultado y refetch correctos | Aprobada |
| 11. Generación múltiple | orden, actividades, pending por item, conteos y resultados correctos | Aprobada |
| 12. Reutilización | después de generar puede reabrirse, agregar y cancelar sin request adicional | Aprobada |
| 13. Reload/navegación | estado modal se pierde y datos persistidos se reconstruyen desde backend | Aprobada |
| 14. Batch existente | `batch_id` conserva el bloque; no crea otro bloque ni usa `force_new_batch` | Aprobada |
| 15. `duplicate_tema` | solo si ocurre naturalmente: item skipped, mensaje/conteos y resto del proceso vigentes | No ejecutada/no confirmada; no bloquea |

### Regresión modal acumulativa

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| Planeaciones | abrir, agregar un tema, cerrar y reabrir | Aprobada |
| Anexos | abrir, cambiar selección, cancelar y reabrir | Aprobada |
| Listas | abrir, cambiar selección, cancelar y reabrir | Aprobada |
| Exámenes | abrir, cambiar planeaciones/tipos/cantidades, cancelar y reabrir | Aprobada |
| Ownership acumulativo | cada modal conserva su bloque y no cruza estado con otro | Aprobada |

### Regresión general

| Prueba | Evidencia esperada | Estado |
| --- | --- | --- |
| Selección y tabs | cambiar bloques/tabs sin estado cruzado | Aprobada |
| Quick Create | creación/generación, pending, navegación y reload intactos | Aprobada |
| Delete | delete individual y de bloque conservan selección, tab y refetch | Aprobada |
| Previews y descargas | cuatro dominios abren/descargan como antes | Aprobada |
| Consola y red | sin errores nuevos, requests duplicados ni listeners dobles | Aprobada |

No deben forzarse backend caído, credenciales inválidas, errores de IA,
timeouts ni duplicados artificiales. Si `duplicate_tema` no ocurre naturalmente,
se registra como no ejecutado y no bloqueante.

Riesgos preservados: no existe `submitting`; sesión nula conserva resultado
nulo; render/eventos mutan actividades; título vacío solo enfoca; máximo 300 no
se impone en handler; close conserva datos hasta reopen; estado/SSE se pierden
al navegar; request no cancelable; delete no cancela; skipped puede limpiarse
con error_count cero; `ia_metrics` queda fuera de alcance.

## Fase 5 — Sesión 5.7: ownership consolidado de pending states

La extracción conserva cuatro fuentes y shapes independientes mediante
`BibliotecaPlaneacionesPending`, `BibliotecaAnexosPending`,
`BibliotecaListaPending` y `BibliotecaExamPending`. Las validaciones estáticas y
el smoke no sustituyen esta matriz.

**Validación manual: Aprobada explícitamente por el usuario.**

| Dominio | Prueba | Evidencia esperada | Estado |
| --- | --- | --- | --- |
| Planeaciones | Un tema | pending por tema, SSE, success, cleanup y resultado persistido | Aprobada |
| Planeaciones | Varios temas | items independientes, progreso/conteos y cero pending cruzado | Aprobada |
| Planeaciones | `duplicate_tema` | solo si ocurre naturalmente: skipped y conteos previos | No ejecutada/no confirmada en esta corrida; no bloquea |
| Planeaciones | Delete | delete individual intacto; delete de bloque limpia pending sin cancelar SSE | Aprobada |
| Anexos | Uno | card pending correcta, success, cleanup y refetch | Aprobada |
| Anexos | Varios | requests secuenciales y pending independiente por card | No confirmado específicamente en 5.7; validado previamente; no bloquea |
| Anexos | Cleanup/delete | éxito/partial natural conserva cleanup previo; delete intacto | Aprobada para flujo normal y delete de bloque; partial no forzado |
| Listas | Generación | items, request único, resultado y error visual sin cambios | Aprobada para flujo normal; error no forzado |
| Listas | Delay/cleanup | pending visible aproximadamente 1500 ms antes de cleanup/refetch | Aprobada |
| Listas | Delete | delete individual y de bloque intactos | Aprobada por regresión acumulativa/delete de bloque |
| Exámenes | Generación | job, polling cada 3000 ms, `current_step` y terminal completed | Aprobada |
| Exámenes | Cleanup/delete | completed elimina pending; delete intacto y sin cancelación nueva | Aprobada; retry natural observado sin cancelación |
| Cruces | Bloques y tabs | cambiar durante/tras generación; tab correcto y sin pending cruzado | Aprobada |
| Cruces | Quick Create | staging, SSE, reconciliación, batch temporal/real y reload intactos | Aprobada |
| Cruces | Delete de bloque | limpia Planeaciones, Exámenes, Listas y Anexos en el orden vigente | Aprobada |
| Cruces | Reload/consola | pending efímero se pierde; recursos persistidos reaparecen; sin errores nuevos | Aprobada |

No deben forzarse backend caído, credenciales inválidas, errores IA, failed,
timeout o resultados parciales artificiales. Los casos que no ocurran
naturalmente se registran como no ejecutados y no bloquean por sí solos.

Riesgos preservados: shapes variables de Planeaciones; cleanup asimétrico de
Anexos; espera de 1500 ms y error persistente de Listas; jobId ausente, poll 60
y failed/timeout persistentes de Exámenes; pending efímero, delete sin
cancelación y posibles escrituras tardías en los cuatro dominios.

Evidencia natural: `[planeaciones] generate:success`, `[anexos] generate:success`,
`[listas-cotejo] generate:success`, `[examenes] generate:success` y
`[biblioteca] delete:success`. Commit: `9b3c23d`.

## Fase 5 — Sesión 5.8: auditoría formal de cierre

La auditoría acumulativa verificó las sesiones 5.0–5.7, ownership y fuentes
físicas, consumidores directos/indirectos, contratos de generación, SSE,
polling, delete, Quick Create, render/eventos, legacy, documentación e historial.
No se detectaron segunda fuente, store universal, persistencia nueva, regresión
introducida ni bloqueo funcional real.

| Revisión | Resultado |
| --- | --- |
| Inventario de sesiones, commits y validaciones 5.0–5.7 | Aprobado |
| Selección, tabs, cuatro modales y cuatro pending | Ownership y fuente única confirmados |
| Generación, SSE, polling, payload de exámenes y delete | Contratos preservados |
| Quick Create, `window.explorerState` y `window.biblioteca` | Separación/compatibilidad preservadas |
| Render/eventos, Archivados, jerarquía y legacy | Sin reorganización ni eliminación |
| Backend y archivos protegidos | Limpios/intactos |
| Riesgos conocidos | No bloqueantes, futuros o externos; sin corrección |
| Pruebas manuales adicionales para 5.8 | No requeridas |

**Decisión: A. Fase 5 puede cerrarse.** Fase 5 y la Sesión 5.8 quedan
completadas; la auditoría de cierre queda aprobada. Fase 6 permanece pendiente y
no iniciada.

## Fase 6 — Sesión 6.0: auditoría técnica/documental de apertura

Sesión estática sin implementación funcional. La validación manual adicional no
es requerida. La suite existente se ejecuta como control de integridad, no como
prueba de render de Biblioteca.

### Cobertura automatizada real

| Recurso | Cobertura | Limitación |
| --- | --- | --- |
| `tests/planeacion.test.js` | 2 pruebas JSDOM de `validateForm` en `js/planeacion.js` | No carga dashboard/Biblioteca, cards, modales, eventos, features ni script order |
| Jest | runner disponible, environment `node`, JSDOM creado por el test | No existe harness de `pages/dashboard.html` |
| Smokes históricos | scripts ad hoc documentados en sesiones previas | No forman una suite persistente del repositorio |
| `node --check`/búsquedas/diff | confiables para sintaxis, referencias y alcance | No prueban comportamiento DOM ni listeners duplicados |
| `git diff --check` | confiable para whitespace/conflictos | No prueba runtime |

No hay tests DOM automatizados de Biblioteca, smoke persistente del dashboard,
Playwright/Cypress ni cobertura automatizada de full/partial render. Por ello,
las sesiones funcionales 6.1–6.3 requerirán prueba manual aunque Jest pase.

### Evidencia estática de 6.0

| Revisión | Resultado |
| --- | --- |
| Gate frontend/backend | ramas esperadas y ambos trees limpios al abrir |
| Historia post-merge | `refactor-front`/`main` en `1254561`; fases 0–5 incluidas |
| Inventario render/DOM/eventos | completado en `FRONTEND_MAP.md` |
| Script order y bindings léxicos | documentados; sin reordenamiento |
| JavaScript/HTML/CSS/backend | no modificados |
| Validación manual | no requerida para auditoría estática |
| `npm test -- --runInBand` | aprobado: 1 suite, 2 pruebas |
| `git diff --check` | aprobado |

### Matriz preparada para 6.1 — render no modal

| Área | Prueba manual futura | Evidencia esperada |
| --- | --- | --- |
| Carga | abrir dashboard y recargar | loading → shell; sin árbol legacy ni error consola |
| Error/retry | solo si ocurre naturalmente | mismo mensaje/CTA; un retry/una request |
| Empty | usuario/búsqueda sin resultados | textos y CTA iguales |
| Sidebar | seleccionar varios bloques | active, detalle y scroll preservados |
| Search | escribir, borrar y mantener foco | filtro, badge, empty y selección sin cambio inesperado |
| Tabs | recorrer cuatro tabs y volver | tab por bloque, conteos y DOM equivalentes |
| Planeaciones | cards reales y pending natural | Ver/Descargar/Delete y progreso iguales |
| Anexos | reales/pending/error natural | acciones y orden iguales |
| Listas | reales/pending/error natural | acciones y feedback iguales |
| Exámenes | reales/polling/error natural | acciones, metadata y feedback iguales |
| Partial render | cambiar bloque/tab y delete natural | sidebar/list/detail no pierden eventos |
| Quick Create smoke | abrir/cancelar y, si se autoriza, crear | fachada y pending/render intactos |
| Contrato DOM | comparar IDs, clases y `data-*` | sin diferencias intencionales |
| Red/consola | observar requests y errores | sin request duplicado ni error nuevo |

### Matriz preparada para 6.2 — modales

| Modal | Pruebas futuras obligatorias |
| --- | --- |
| Planeaciones | abrir/cerrar/backdrop/cancelar; agregar/quitar tema; Enter; actividades; error; reopen; submit único |
| Anexos | disponibles/bloqueadas; check/uncheck; cleanup; cancel/reopen; submit único |
| Listas | disponibles/generadas; check/uncheck; cleanup; cancel/reopen; submit único |
| Exámenes | tipos, cantidades, planeaciones, contador, errores, cancel/reopen y submit único |
| Confirm delete | cinco recursos: cancelar, backdrop y confirmar; una resolución/una request |
| Re-render | cada control responde después de recrear `.biblioteca-modal-card` |
| Scroll lock | body se bloquea/libera igual; convivencia con previews/Quick Create |

No se deben forzar fallos IA/backend ni cambiar datos solo para producir estados
de error. Los estados naturales no observados se registran como no ejecutados.

### Matriz preparada para 6.3 — eventos

| Evento | Prueba futura | Resultado esperado |
| --- | --- | --- |
| Delegación | cada uno de los 20 valores emitidos | una rama y una acción |
| Compatibilidad | búsqueda de 3 ramas sin emisor | permanecen definidas, sin inventar UI |
| Full/partial render | repetir clicks después de cada tipo de render | listeners sobreviven/no se duplican |
| Search | input tras varios full renders | una actualización por evento |
| Modales | múltiples re-renders/reopens | controles actuales funcionan una vez |
| Document/window | Escape, private chrome, pageshow y click Dashboard | sin interferencia nueva con Biblioteca |
| Features | preview/download/delete/generation smoke | wrappers y coordinadores preservados |
| Red | observar acciones destructivas/generación autorizadas | una request por acción; polling/SSE intactos |

### Cierre futuro de Fase 6

La auditoría 6.4 deberá ejecutar regresión acumulativa: Login, carga, sidebar,
search, selección, tabs, cuatro dominios, pending, cuatro modales, previews,
downloads, deletes, block delete, Quick Create, recarga, consola/red, globals y
orden de scripts. Archivados se prueba separado. No se abre Fase 7 mientras
render/eventos no tengan ownership claro o existan eventos perdidos/duplicados.

## Fase 6 — Sesión 6.1: render no modal consolidado

6.0 fue reconciliada como completada y commiteada en `e27cb0a`. 6.1 fue
validada manualmente y commiteada en `cef834e`.

### Evidencia automatizada y estática

| Revisión | Resultado |
| --- | --- |
| Comparación literal contra `HEAD` | PASS: bloque movido idéntico antes de añadir la superficie léxica de ownership |
| Sintaxis | PASS: `node --check js/pages/biblioteca.page.js` y `node --check js/features/biblioteca/biblioteca-render.js` |
| Smoke técnico aislado sin red | PASS: loading/error/empty/sidebar-search/selection/tabs/cards/pending/Quick Create visual/partial renders/actions |
| Acciones | PASS: 20 valores emitidos, 23 ramas; ninguna renombrada o retirada |
| Listeners | 30 `addEventListener` + un `oninput`; no se reorganizaron |
| Jest | PASS: 1 suite, 2 tests; no cubre Biblioteca |
| Backend | `refactor-back`/`e08d6e4`, limpio y solo lectura |

### Checklist manual aprobado de 6.1

| Área | Comprobación compacta |
| --- | --- |
| Carga | Biblioteca normal; loading; sin bloques y con bloques; error solo si ocurre naturalmente |
| Sidebar/search | buscar y limpiar; seleccionar/cambiar bloques; selección y scroll visibles |
| Tabs | Planeaciones, Anexos, Listas y Exámenes; active/tab por bloque correcto |
| Cards | datos/botones; empty y pending correctos en los cuatro dominios |
| Acciones | preview, download, delete cancelando confirmación y apertura de cada modal de generación |
| Quick Create | flujo mínimo o integración vigente; render posterior sin error |
| Consola/red | sin error nuevo, listener visible duplicado ni request duplicada |

Evidencia recibida: carga, bloques/planeaciones, navegación, Anexos, Listas,
Exámenes y delete de bloque correctos; sin errores nuevos visibles o de consola.
No se recibieron ni solicitaron UUIDs, tokens o datos personales.

## Fase 6 — Sesión 6.2: DOM/render de modales

### Evidencia automatizada y estática

| Revisión | Resultado |
| --- | --- |
| Cinco sub-gates | PASS: Planeaciones, Anexos, Listas, Exámenes y Confirmación |
| Comparación literal | PASS por función; también `BIB_EXAM_TIPOS` e inyección |
| Sintaxis | PASS: page, render no modal y owner modal |
| Listeners | 1 general en page + 29 locales en owner; targets/once/closures preservados |
| Smoke JSDOM sin red | PASS en cuatro modales, confirmación e inyección |
| Jest | PASS: 1 suite/2 tests; sigue sin cubrir Biblioteca persistente |
| Backend | `refactor-back`/`e08d6e4`, limpio y solo lectura |

### Checklist manual aprobado de 6.2

| Área | Comprobación |
| --- | --- |
| Planeaciones | abrir; agregar/eliminar temas; actividades por momento; cerrar/reabrir; generar |
| Anexos | abrir; seleccionar; cerrar/reabrir; generar uno y varios si hay datos |
| Listas | abrir; seleccionar; cerrar/reabrir; generar |
| Exámenes | abrir; planeaciones; siete tipos/cantidades; cerrar/reabrir; generar pequeño |
| Confirmación | delete→cancelar; delete→confirmar; backdrop si aplica |
| Regresión | render 6.1, tabs, search, Quick Create, preview, download y consola |

Resultado recibido: carga, recursos, cuatro modales y generaciones, delete
individual/de bloque y consola correctos; sin regresiones visibles ni errores
nuevos reportados. Commit `ef3364f`.

## Fase 6 — Sesión 6.3: ownership de eventos

### Evidencia automatizada y estática

| Revisión | Resultado |
| --- | --- |
| Comparación literal | PASS: dos handlers, orden de 23 ramas y líneas efectivas de binding |
| Acciones | PASS: 20 valores emitidos y 23 ramas, incluidas tres sin emisor |
| Sintaxis | PASS: page, render no modal, modal render y event owner |
| Conteo efectivo | 1 listener documental, 1 `oninput`, 29 listeners modales; sin cambio |
| Coexistencia Dashboard | PASS: listener de `#explorer-content` antes de `document`, bubbling sin prevent/stop |
| Smoke JSDOM sin red | PASS: selección/tabs/search, cuatro opens, bridge, retry, preview/download, generación, deletes, legacy y desconocida |
| Dispatch duplicado | PASS técnico: una llamada por click; delete se disparó una vez por cada escenario cancel/confirm simulado |
| Jest | PASS: 1 suite/2 tests; no sustituye prueba manual de red/consola |
| Backend | `refactor-back`/`e08d6e4`, limpio y solo lectura |

### Checklist manual aprobado de 6.3

| Área | Comprobación |
| --- | --- |
| Biblioteca | carga; seleccionar/cambiar bloques; tabs; search y clear |
| Acciones | abrir cuatro modales; preview; download; delete cancelar y confirmar |
| Generación | una generación representativa; una sola request/dispatch |
| Quick Create | smoke mínimo, render posterior y sin doble evento |
| Consola/red | sin error nuevo, acción duplicada ni request duplicada |

Resultado recibido: Biblioteca, selección/cambio de bloques, tabs, search/clear,
cuatro modales, preview/download, delete cancel/confirm, generación y Quick
Create correctos; sin doble dispatch, requests duplicados ni errores nuevos.
Logs naturales aprobados: delete de Biblioteca/Planeaciones/Exámenes y generate
de Planeaciones/Anexos/Listas/Exámenes. El examen completó 11/11 preguntas, 17
retries anti-duplicados y cero fallos finales. Commit `4306903`.

## Fase 6 — Sesión 6.4: auditoría formal de cierre

| Revisión acumulativa | Resultado |
| --- | --- |
| Gate e historia | PASS: frontend `refactor-front`/`4306903`; 6.0–6.3 presentes; backend `refactor-back`/`e08d6e4`, ambos limpios al abrir |
| Owners | PASS: una implementación canónica para render no modal, modales y eventos |
| Comparación literal | PASS normalizado contra `1254561`: render no modal, cuatro modales, confirmación, inyección y eventos |
| State/Pending | PASS: diez superficies protegidas y una sola fuente física |
| DOM/eventos | PASS: 20 acciones, 23 ramas, 1 listener documental, 1 `oninput`, 29 listeners modales; markup/selectores/data sin cambio |
| Features/API | PASS: generation, delete, preview/download, `js/api`, `js/services` y `wordExport.js` sin cambios de Fase 6 |
| Exámenes | PASS: payload conserva `unidad_id`, `batch_id`, `planeacion_ids`, `tipos_pregunta`, `cantidades_pregunta`; no envía `tema_ids` |
| Compatibilidad | PASS: `window.biblioteca`, `window.renderBibliotecaContent`, Dashboard/Quick Create y ramas sin emisor conservados |
| Scripts/protegidos | PASS: scripts clásicos en orden; Dashboard, Archivados, CSS, packages y backend intactos |
| Evidencia manual | PASS acumulativo 6.1–6.3; no requiere repetición en 6.4 |

No hay contradicciones bloqueantes. Deuda no bloqueante: init sin guard,
listeners confirm acumulables, re-binding tras `innerHTML` y mutaciones
históricas de render. Quick Create/loaders/Dashboard pertenecen a Fase 7.
`public.ia_metrics` es externo y preexistente.

**Decisión: A. Fase 6 puede cerrarse.** Fase 6 y Sesión 6.4 completadas;
auditoría aprobada. Fase 7 pendiente/no iniciada. Prueba manual adicional no
requerida.

## Fase 7 — Sesión 7.0: auditoría técnica/documental de apertura

| Revisión de apertura | Resultado esperado / evidencia 7.0 |
| --- | --- |
| Gate frontend | PASS: `refactor-front`, `295d7ed`, limpio y alineado con origin al abrir |
| Gate backend | PASS: `refactor-back`, `e08d6e4`, limpio y solo lectura |
| Fases | PASS: 0–6 completadas; 7 abierta; 8–10 pendientes |
| Código protegido | PASS: JS/HTML/CSS/API/services/backend intactos en 7.0 |
| Quick Create | Mapeado trigger→jerarquía→staging→SSE→pending→batch real→refetch→render |
| Batch | Confirmado `force_new_batch` para nuevo y `batch_id` para existente |
| Estado | Shapes/writers/readers de `explorerState`, pending y Selection/Tabs documentados |
| Loaders | Init, componentes, auth, jerarquía, previews, Detalle y Biblioteca clasificados |
| Globals | `window.explorerState`, `window.biblioteca`, wrapper render y feature globals inventariados |
| Eventos | Dashboard content antes de document Biblioteca; acciones distintas, sin doble dispatch actual |
| Reload/delete | Estado efímero, SSE no resumible, requests no cancelables y race de delete documentados |
| Roadmap | 7.1 Quick Create; 7.2 loader/reconcile; 7.3 bootstrap/bindings; 7.4 cierre |
| Jest | PASS: 1 suite, 2 tests, `npm test -- --runInBand` |
| Diff | PASS: `git diff --check`; únicamente cinco documentos autorizados |

La Sesión 7.0 no requiere prueba manual porque no cambia comportamiento. Las
siguientes matrices quedan preparadas, no ejecutadas.

### Matriz preparada para 7.1 — Quick Create completo

| Caso | Verificación manual futura |
| --- | --- |
| Carga | Dashboard muestra Biblioteca, navbar/footer y CTA sin error de consola |
| Abrir/cerrar | Hero y CTA vacío abren; X, Cancelar, backdrop y Escape cierran una vez |
| Validación | Sin temas/nivel/materia muestra el mismo mensaje y conserva panel/datos |
| Bloque nuevo | Crea/resuelve jerarquía técnica, una request SSE, card temporal y batch real sin duplicado |
| Bloque existente | Envía batch explícito, no `force_new_batch`, muestra pending en el bloque seleccionado |
| Actividades | Tres momentos conservan selecciones y payload |
| Progreso | pending/generating/ready/skipped/error y conteos se actualizan sin doble render visible |
| Partial success | Recursos exitosos aparecen; fallos/skipped conservan mensaje y pending esperado |
| Error red/SSE/auth | UI/cleanup equivalentes; sin request repetida ni excepción nueva no controlada |
| Selección/tab | Cambio durante generación conserva navegación; finish selecciona Planeaciones del batch generado |
| Reload posterior | Biblioteca reconstruye lo persistido; no promete reanudar SSE |
| Red/contrato | Mismo endpoint, headers, `unidad_id`, `batch_id`, `force_new_batch`, parser y fallback |

## Fase 7 — Sesión 7.1: Quick Create consolidado

### Evidencia automática ejecutada

| Revisión | Resultado |
| --- | --- |
| Gate | PASS: frontend `refactor-front`/`7c75738` y backend `refactor-back`/`e08d6e4`, limpios al abrir |
| Owner | PASS: implementación en `quick-create.js`; Dashboard conserva wrappers/helpers compartidos |
| Comparación literal | PASS normalizado: tres bloques UI, generación, jerarquía técnica y bindings |
| Sintaxis | PASS: Dashboard y owner nuevo mediante `node --check` |
| Listeners | PASS: 44 call sites preservados; 27 en Dashboard y 17 en el owner |
| Contratos | PASS estático: endpoint/service, payload, `force_new_batch`, `batch_id`, SSE y fachada preservados |
| Smoke sin red | PASS: 3 casos JSDOM; open/close/validación, temp→real sin duplicado, parcial/error/cleanup |
| Jest acumulativo | PASS: 2 suites, 5 tests con `npm test -- --runInBand` |
| Loader/reconcile | PASS de alcance: cero llamadas directas nuevas; se conserva la fachada de Biblioteca |
| Backend | PASS: limpio y sin cambios; no se ejecutaron migraciones ni llamadas reales |

### Checklist manual aprobado de 7.1

| Área | Comprobación solicitada |
| --- | --- |
| Carga/UI | Biblioteca, navbar/footer y CTA; abrir, cerrar, backdrop/Escape, reabrir y validar tema único/múltiple |
| Bloque nuevo | Generar 1–2 temas; una request SSE; card temporal→batch real, sin duplicado; selección y tab Planeaciones |
| Parcial/error | Si se puede reproducir naturalmente, conservar resultados/mensajes/pending y cleanup histórico |
| Biblioteca | Cambiar bloque/tabs/search; reload muestra lo persistido y no promete reanudar SSE |
| Recursos | Planeaciones, Anexos, Listas y Exámenes siguen accesibles desde sus tabs |
| Regresión normal | “Agregar Tema” en bloque existente reutiliza batch explícito y no envía `force_new_batch:true` |
| Consola/red | Sin errores nuevos, doble handler, doble card ni request duplicada |

Logs naturales útiles, sin tokens, UUIDs completos ni datos personales: para
Quick Create nuevo, `batchIdRecibido:null`, `forceNewBatch:true` y creación de
batch; para el modal normal, batch explícito, `forceNewBatch:false` y
reutilización. El usuario confirmó el checklist sin errores ni duplicación
nuevos; el flujo normal conservó batch explícito y `forceNewBatch:false`.
Quick Create, Biblioteca posterior y generaciones de planeaciones, anexos y
exámenes quedaron correctos. Commit `97b798c`.

## Fase 7 — Sesión 7.2: loader y reconciliación

### Evidencia automática ejecutada

| Revisión | Resultado |
| --- | --- |
| Gate | PASS: frontend `refactor-front`/`97b798c`; backend `refactor-back`/`e08d6e4`; limpios al abrir |
| Owner | PASS: loader/reconcile en `biblioteca-loader.js`; State/Pending conservados en page |
| Comparación literal | PASS: seis funciones, incluidos loader, finish, merge y optimistic apply |
| Call sites | PASS: 14 externos + refetch interno de finish = 15; firmas/opciones intactas |
| Requests/renders | PASS: una GET máxima por load; normal 2 renders, silent 1, finish 2 totales |
| Smoke loader | PASS: 4 casos; success/empty/error, fallbacks, target/inferencia, partial/optimistic/finish |
| Smoke Quick Create | PASS: 3 casos existentes, incluida temporal→real sin duplicado |
| Jest acumulativo | PASS: 3 suites, 9 tests con `npm test -- --runInBand` |
| Protegidos | PASS estático: generadores, deletes, API, render, State/Pending y Quick Create sin cambio funcional |
| Backend | PASS: limpio, solo lectura y sin llamadas reales |

### Checklist manual aprobado de 7.2

| Caso | Resultado confirmado |
| --- | --- |
| Quick Create | batch nuevo con `batchIdRecibido:null`, `forceNewBatch:true` y creación confirmada |
| Flujo normal | batch existente, `forceNewBatch:false` y reutilización explícita |
| Delete | éxito confirmado con `[biblioteca] delete:success` |
| Reconciliación | temporal→real sin duplicado visible; Biblioteca posterior correcta |
| Consola/red | sin errores, doble GET, doble render ni doble card reportados |

La aprobación manual quedó reconciliada con el commit real `a6840a4`.

## Fase 7 — Sesión 7.3: Dashboard bootstrap y bindings

### Evidencia automática ejecutada

| Revisión | Resultado |
| --- | --- |
| Gate | PASS: frontend `refactor-front`/`a6840a4`; backend `refactor-back`/`e08d6e4`; limpios al abrir |
| Owner | PASS: layout/init/binding en `dashboard-bootstrap.js`; navegación/jerarquía/legacy retenidos |
| Comparación literal | PASS: `injectComponent`, `bindDashboardEvents` e `initDashboardPage` |
| Listeners | PASS: 27 totales preservados como 25 en owner + 2 locales legacy |
| Orden/bubbling | PASS estático: Dashboard registra primero y sigue ignorando `data-bib-action` |
| Smoke Dashboard | PASS: 3 casos sin red para init, bridge, branch legacy y error de layout |
| Protegidos | PASS: smokes Quick Create y Biblioteca loader sin cambios funcionales |
| Jest acumulativo | PASS: 4 suites, 12 tests con `npm test -- --runInBand` |
| Backend | PASS: limpio, solo lectura y sin llamadas reales |

### Checklist manual aprobado de 7.3

| Caso | Resultado confirmado |
| --- | --- |
| Arranque/componentes | Dashboard, layout, navbar y footer correctos |
| Biblioteca | carga y operación correctas, sin errores visibles nuevos |
| Quick Create | batch nuevo con `batchIdRecibido:null`, `forceNewBatch:true` y creación confirmada |
| Delete | `[biblioteca] delete:success` confirmado |
| Examen | tema correcto, 5/5 preguntas, cero retries y `generate:success` |

## Fase 7 — Sesión 7.4: auditoría formal de cierre

| Revisión | Resultado |
| --- | --- |
| Gate | PASS: frontend limpio `refactor-front`/`bcd361e`; backend limpio `refactor-back`/`e08d6e4` |
| Historial | PASS: 7.0 `7c75738`, 7.1 `97b798c`, 7.2 `a6840a4`, 7.3 `bcd361e` |
| Owners | PASS: Quick Create, loader/reconcile y bootstrap tienen owner único |
| State | PASS: `bibliotecaState`, Selection/Tabs, cuatro ModalState y cuatro Pending conservan fuente física |
| Loader | PASS: 14 caminos externos + refetch interno de finish = 15 |
| Quick batch | PASS: batch nuevo sin ID explícito + `force_new_batch:true`; batch normal explícito sin flag |
| Examen | PASS: `planeacion_ids`, unidad, batch, tipos y cantidades; `tema_ids` no reinterpretado |
| Deletes | PASS: cleanup local, pending/Selection/Tabs de bloque y refetch silencioso |
| Protegidos | PASS: cuatro generadores, render/modal/events, API/services, payloads y previews sin cambios de Fase 7 |
| Eventos | PASS: 25 bootstrap + 17 Quick + 2 locales legacy + delegación Biblioteca; sin `stopPropagation` |
| Scripts | PASS: orden clásico íntegro; sin ESM, `defer` o `async` |
| Búsquedas | PASS: owners, globals, state, Pending, wrappers y `data-bib-action` clasificados |
| Jest | PASS: 4 suites, 12 tests con `npm test -- --runInBand` |
| Manual acumulada | PASS: 7.1, 7.2 y 7.3 aprobadas; no repetir |
| Contradicciones | Ninguna |

Riesgos no bloqueantes: scripts clásicos/bindings léxicos, estado mixto
`explorerState`, requests/SSE no cancelables o resumibles y races de refetch.
Fase 8 recibe legacy visual, Archivados, navegación jerárquica y previews
residuales; Fase 10, wrappers/globals/bridges. `public.ia_metrics` es un error
externo/preexistente no bloqueante.

**Decisión: A. Fase 7 puede cerrarse.** Sesión 7.4 completada, auditoría
aprobada, manual adicional no requerida y Fase 8 pendiente/no iniciada.
