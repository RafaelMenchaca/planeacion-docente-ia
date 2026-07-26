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
| Anexo | cancelar eliminación | conserva card y no llama `DELETE` | Smoke aprobado; navegador pendiente |
| Anexo | confirmar eliminación | una llamada `DELETE`, anexo fuera del array y contador actualizado | Smoke aprobado; navegador pendiente |
| Biblioteca | conservar bloque y tab | selección estable y tab `anexos` después de render/recarga | Smoke aprobado; navegador pendiente |
| Anexo | persistencia tras recarga | anexo no reaparece; planeación y otros recursos permanecen | Pendiente de navegador |
| Anexo | API con error | no muta estado y conserva alerta/log | Smoke aprobado; navegador pendiente |
| Regresión | preview/descarga de anexo, deletes modularizados y otros dominios | sin regresiones ni ejecución de legacy | Pendiente de navegador |

### Evidencia automatizada

- Comparación literal del cuerpo contra `HEAD`: pasó, ignorando únicamente indentación del nuevo contenedor.
- `node --check js/features/anexos/anexo-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, sesión, API/UUID, array, `total_anexos`, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, anexo ausente y cero llamadas dobles.
- Validación manual de cancelación, eliminación real, persistencia y regresión: pendiente.

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
