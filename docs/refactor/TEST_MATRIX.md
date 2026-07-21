# Test Matrix

Matriz manual mínima para validar el comportamiento después de cada refactor. Cambiar el estado solo cuando la prueba haya sido ejecutada realmente.

| Flujo | Acción | Resultado esperado | Log esperado | Estado |
| --- | --- | --- | --- | --- |
| Auth | iniciar sesión | dashboard carga | sin errores | Pendiente |
| Biblioteca | cargar bloques | cards visibles | petición 200 | Pendiente |
| Planeación | crear | card nueva | backend success | Pendiente |
| Anexo | generar | card nueva | backend success | Pendiente |
| Lista | generar | card nueva | backend success/skipped | Pendiente |
| Examen | generar | preguntas completas | job success | Pendiente |
| Preview examen | abrir/cerrar | modal correcto | frontend sin error | Pendiente |
| Descarga examen | descargar | archivo generado | download success | Pendiente |
| Delete | eliminar recurso | desaparece card | backend success | Pendiente |

## Errores globales

En cada recorrido comprobar:

- errores JavaScript en consola;
- promesas rechazadas;
- endpoints fallidos;
- funciones globales inexistentes;
- polling que continúa después de salir.

Registrar fecha, navegador, flujo y evidencia de cualquier fallo sin incluir tokens, datos personales, prompts ni respuestas completas.
