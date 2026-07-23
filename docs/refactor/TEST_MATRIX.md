# Test Matrix

Matriz manual post-refactor. Todas las pruebas principales corresponden a Biblioteca. Archivados se valida por separado; el explorador visual jerárquico antiguo es legacy y no es un flujo principal de prueba.

| Flujo | Acción | Resultado esperado | Evidencia | Fase aplicable | Estado |
| --- | --- | --- | --- | --- | --- |
| Login | iniciar sesión | abre dashboard con Biblioteca | consola sin errores | 0-10 | Pendiente |
| Biblioteca | cargar | sidebar y detalle visibles | GET conjuntos 200 | 0-10 | Pendiente |
| Bloque | crear | bloque visible y seleccionado | feedback correcto | 0, 5-7 | Pendiente |
| Tema | agregar a bloque | tema/planeación pendiente visible | progreso en Biblioteca | 0, 4-7 | Pendiente |
| Planeación | generar | card completa | SSE/backend success | 0, 4 | Pendiente |
| Planeación | abrir | detalle correcto | navegación sin error | 0, 2 | Pendiente |
| Anexo | generar | card nueva | backend success | 0, 4 | Pendiente |
| Anexo | abrir preview | modal correcto | sin error frontend | 0, 1-2 | Pendiente |
| Anexo | descargar | archivo generado | download success | 0, 1-2 | Pendiente |
| Lista | generar | card o `skipped` correcto | backend success/skipped | 0, 4 | Pendiente |
| Lista | abrir preview | modal correcto | wrapper disponible | 0, 1-2 | Pendiente |
| Lista | descargar | archivo generado | download success | 0, 1-2 | Pendiente |
| Examen | generar | job creado | respuesta 202 | 0, 4 | Pendiente |
| Examen | polling | progreso termina | job completed/failed | 0, 4 | Pendiente |
| Examen | abrir/cerrar preview | modal correcto | wrapper disponible | 0, 1-2 | Pendiente |
| Examen | descargar | archivo generado | download success | 0, 1-2 | Pendiente |
| Recursos | eliminar | card desaparece | backend success | 0, 2 | Pendiente |
| Bloque | eliminar | conjunto desaparece | backend success | 0, 2 | Pendiente |
| Tabs | navegar | conserva bloque y tab esperado | sin doble render | 0, 5-6 | Pendiente |
| Recarga | recargar dashboard | Biblioteca vuelve a cargar | sin activar árbol legacy | 0, 6-9 | Pendiente |
| Legacy visual | cargar ruta vigente | no se muestra ni ejecuta el explorador | Biblioteca sigue activa | 8-9 | Pendiente |
| Archivados | acceso separado y operaciones vigentes | flujo separado funciona | sin afectar Biblioteca | 0, 7-10 | Pendiente |

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
