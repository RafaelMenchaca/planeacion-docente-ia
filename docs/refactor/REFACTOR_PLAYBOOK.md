# Refactor Playbook

Este playbook define el método mínimo para extracciones modulares del frontend. Debe leerse junto con [`AGENTS.md`](../../AGENTS.md), la [arquitectura actual](../ARCHITECTURE.md) y el [handoff](SESSION_HANDOFF.md).

## Método de trabajo

1. Auditar el área y registrar su comportamiento actual.
2. Confirmar consumidores en JS, HTML, atributos `data-*`, handlers inline y `window.*`.
3. Extraer la implementación literalmente, sin mejoras simultáneas.
4. Mantener un wrapper compatible en el punto anterior cuando haya consumidores pendientes.
5. Cargar el nuevo script en el orden correcto.
6. Validar sintaxis.
7. Ejecutar las pruebas existentes.
8. Probar manualmente los flujos afectados con [`TEST_MATRIX.md`](TEST_MATRIX.md).
9. Actualizar [`SESSION_HANDOFF.md`](SESSION_HANDOFF.md).
10. Hacer un commit pequeño y enfocado cuando el usuario lo autorice.

> Una sesión de extracción no puede cambiar lógica ni corregir bugs.

Si durante una extracción aparece un bug, documentarlo para una sesión separada. No cambiar comportamiento visible, contratos de API, campos ni payloads como efecto colateral.

## Zonas protegidas

- generación y contratos de salida;
- payloads y polling;
- descargas Word y `js/ui/wordExport.js`;
- autenticación y cliente Supabase;
- configuración de `API_BASE_URL`;
- estado compartido y compatibilidad mediante `window`;
- IDs, persistencia y relaciones con el backend.

Modificar una zona protegida requiere autorización explícita y lectura de las fuentes canónicas del backend enlazadas desde `AGENTS.md`.

## Wrappers temporales

Cada wrapper temporal debe documentar:

- razón de compatibilidad;
- consumidores conocidos;
- implementación canónica a la que delega;
- condición verificable de retiro.

Un wrapper solo puede retirarse cuando:

- todos sus consumidores fueron migrados;
- una búsqueda global no encuentra referencias restantes;
- las pruebas automáticas y manuales son correctas;
- el retiro ocurre en una sesión separada de la extracción inicial;
- el handoff y la arquitectura se actualizaron cuando corresponda.
