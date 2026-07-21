# Test Matrix

Matriz manual post-refactor. Todas las pruebas principales corresponden a Biblioteca. Archivados se valida por separado; el explorador visual jerárquico antiguo es legacy y no es un flujo principal de prueba.

| Flujo | Acción | Resultado esperado | Evidencia | Estado |
| --- | --- | --- | --- | --- |
| Login | iniciar sesión | abre dashboard con Biblioteca | consola sin errores | Pendiente |
| Biblioteca | cargar | sidebar y detalle visibles | GET conjuntos 200 | Pendiente |
| Bloque | crear | bloque visible y seleccionado | feedback correcto | Pendiente |
| Tema | agregar a bloque | tema/planeación pendiente visible | progreso en Biblioteca | Pendiente |
| Planeación | generar | card completa | SSE/backend success | Pendiente |
| Planeación | abrir | detalle correcto | navegación sin error | Pendiente |
| Anexo | generar | card nueva | backend success | Pendiente |
| Anexo | abrir preview | modal correcto | sin error frontend | Pendiente |
| Anexo | descargar | archivo generado | download success | Pendiente |
| Lista | generar | card o `skipped` correcto | backend success/skipped | Pendiente |
| Lista | abrir preview | modal correcto | wrapper disponible | Pendiente |
| Lista | descargar | archivo generado | download success | Pendiente |
| Examen | generar | job creado | respuesta 202 | Pendiente |
| Examen | polling | progreso termina | job completed/failed | Pendiente |
| Examen | abrir preview | modal correcto | wrapper disponible | Pendiente |
| Examen | descargar | archivo generado | download success | Pendiente |
| Recursos | eliminar | card desaparece | backend success | Pendiente |
| Bloque | eliminar | conjunto desaparece | backend success | Pendiente |
| Tabs | navegar | conserva bloque y tab esperado | sin doble render | Pendiente |
| Recarga | recargar dashboard | Biblioteca vuelve a cargar | sin activar árbol legacy | Pendiente |
| Archivados | acceso separado y operaciones vigentes | flujo separado funciona | sin afectar Biblioteca | Pendiente |

## Errores globales

Comprobar en todos los recorridos:

- errores JavaScript y promesas rechazadas;
- funciones `window.*` inexistentes;
- errores HTTP inesperados;
- peticiones o listeners duplicados;
- polling que continúa después de salir;
- activación accidental del árbol o breadcrumbs legacy.

Si se conserva una prueba del explorador antiguo por una dependencia todavía no migrada, marcarla explícitamente como **compatibilidad / no regresión temporal**; nunca como experiencia principal soportada.
