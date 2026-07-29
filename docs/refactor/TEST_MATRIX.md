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
| Preview manual | Título, instrucciones, total, preguntas, opciones, respuestas, tipos y reapertura | Pendiente |
| Descarga desde card | Modal, nombre, archivo, formato y una lectura | Pendiente |
| Descarga desde preview | Reutilización del objeto sin segunda lectura | Pendiente |
| Regresión manual | Biblioteca/tabs, previews, descargas, deletes y Detalle | Pendiente |

### Evidencia automatizada

- Smoke previo: 55 aserciones y 14 peticiones simuladas.
- Smoke posterior: 57 aserciones y 14 peticiones simuladas.
- Cada función realizó una petición por invocación.
- El listado legacy se validó solo mediante smoke, sin ejecutar su UI.
- Generación y polling se compararon contra `HEAD` y quedaron idénticos.
- Validación manual 3.8: pendiente; no se declara aprobada.
- Siguiente sesión única:
  `3.9 — Auditoría de cierre de capa API frontend`.

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
