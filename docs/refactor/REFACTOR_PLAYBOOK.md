# Refactor Playbook

Este playbook gobierna las extracciones modulares del frontend. Debe leerse junto con [`AGENTS.md`](../../AGENTS.md), la [arquitectura](../ARCHITECTURE.md) y el [handoff](SESSION_HANDOFF.md).

## Dirección obligatoria

Las extracciones deben avanzar hacia **Biblioteca modular**. No deben restaurar, ampliar ni modularizar el explorador visual jerárquico antiguo como una segunda experiencia.

> Una sesión de extracción no puede cambiar lógica ni corregir bugs.

## Clasificación previa

Antes de mover una función, clasificarla como una de estas opciones:

- Biblioteca activa.
- Compartida activa.
- Archivados activa.
- Compatibilidad temporal.
- Explorador visual legacy.
- Desconocida.

No mover ni eliminar funciones clasificadas como `Desconocida`. El nombre jerárquico de una función no prueba que sea legacy.

## Evidencia requerida

Toda extracción debe registrar:

- consumidor vigente;
- página que la ejecuta;
- evento o acción que la activa;
- globals que consume y expone;
- dependencia de Archivados, si existe;
- pertenencia a Biblioteca o compatibilidad;
- búsqueda global realizada.

## Método de trabajo

1. Auditar y clasificar el área.
2. Confirmar consumidores en JS, HTML, `data-*`, handlers inline y `window.*`.
3. Extraer literalmente, sin mejoras simultáneas.
4. Mantener un wrapper cuando haya consumidores pendientes.
5. Cargar el script en el orden correcto.
6. Validar sintaxis.
7. Ejecutar pruebas existentes.
8. Probar manualmente con [`TEST_MATRIX.md`](TEST_MATRIX.md).
9. Actualizar [`SESSION_HANDOFF.md`](SESSION_HANDOFF.md).
10. Hacer un commit pequeño solo cuando el usuario lo autorice.

## Prohibiciones

- No mezclar estados de Biblioteca y del explorador antiguo.
- No crear abstracciones para soportar ambos flujos visuales por igual.
- No generalizar para dos interfaces cuando solo Biblioteca está vigente.
- No conservar código legacy dentro de módulos nuevos de Biblioteca salvo wrapper explícito.
- No cambiar payloads para acomodar código obsoleto.
- No activar páginas, ramas o scripts antiguos accidentalmente.
- No retirar wrappers hasta identificar y migrar todos sus consumidores.
- No mover lógica de Biblioteca hacia el explorador antiguo.

## Zonas protegidas

- generación, payloads y polling;
- descargas Word y `js/ui/wordExport.js`;
- autenticación y cliente Supabase;
- `API_BASE_URL`;
- estado compartido y `window`;
- IDs, persistencia y relaciones backend;
- Archivados y sus dependencias jerárquicas.

## Retiro de wrappers

Cada wrapper debe documentar razón, consumidores, implementación canónica y condición de retiro. Solo puede retirarse cuando todos los consumidores estén migrados, una búsqueda global no encuentre referencias, las pruebas pasen, el retiro ocurra en una sesión separada y el handoff quede actualizado.
