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
| Planeación | descargar desde card | modal, `.doc` y formato equivalentes | download success | 1-2 | Pendiente — navegador no ejecutado en sesión 1.4 |
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

- Commits confirmados: `609d6fd` (1.1), `6124a6f` (1.2) y `e0c3e85` (1.3).
- Frontend y backend limpios al iniciar la auditoría.
- Fase 0 cerrada con tags, commits, protección documental y confirmación manual del usuario.
- Sesión 1.4 completada en código: `bibDescargarPlaneacion(planeacionId)` vive en `js/features/planeaciones/planeacion-download.js`.
- No quedaron candidatos ni consumidores desconocidos.
- Fase 1 permanece en progreso hasta aprobar la descarga manual de planeación y la regresión acumulativa posterior a la Sesión 1.4.

## Evidencia automatizada de sesión 1.4

- `node --check js/features/planeaciones/planeacion-download.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó (1 suite, 2 pruebas).
- `git diff --check`: pasó.
- Smoke JSDOM de namespace, wrapper, modal, Blob y delegación: pasó.
- Comparación contra `HEAD`: HTML, MIME, nombre, URL temporal, revocación y resultado equivalentes.
- Pruebas manuales de navegador y regresión acumulativa posterior: pendientes; no se marcaron como completadas.

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
