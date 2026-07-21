# Reglas para agentes del frontend

## Propósito

Este archivo contiene las reglas obligatorias para cualquier agente que modifique el frontend de Educativo IA. Es la única fuente local de reglas de trabajo del repositorio frontend.

## Alcance del frontend

El frontend es responsable de la UI, navegación, estado de interfaz, llamadas a la API, feedback de generación, polling frontend, previews, descargas, validación de formularios y compatibilidad temporal mediante `window`.

El frontend no es la fuente de verdad del schema, RLS, prompts, modelos, retries backend, jobs backend, métricas IA ni relaciones persistentes. Esas definiciones viven en el repositorio backend.

Repositorio canónico: `educativo_backend/Educativo-Backend`.

## Flujo visual canónico

**Biblioteca es el único flujo visual principal vigente.** Toda función nueva del área privada debe integrarse a Biblioteca.

El explorador visual jerárquico antiguo (`plantel → grado → materia → unidad → tema`) es **legacy visual / obsoleto / no usar para nuevas implementaciones**. No es un segundo modo soportado y no debe recibir funciones nuevas, decidir dónde renderizar contenido ni compartir nuevos estados o eventos con Biblioteca.

- Si una tarea puede resolverse usando Biblioteca o reutilizando el explorador jerárquico antiguo, se debe implementar en Biblioteca.
- No crear un “modo dual”, nuevos flags para alternar Biblioteca y jerarquía ni reactivar el árbol visual por accidente.
- No reutilizar funciones legacy solo porque ya existen; primero identificar su consumidor vigente.
- Antes de extraer una función, clasificar su consumidor como Biblioteca, compartido activo, Archivados, compatibilidad temporal, explorador visual legacy o desconocido.
- No mover ni eliminar una función desconocida.
- No eliminar helpers jerárquicos sin buscar todos los consumidores: la jerarquía técnica puede seguir sosteniendo persistencia, selectores, creación o Archivados.
- Archivados es un flujo separado; sus dependencias jerárquicas no convierten al explorador antiguo en flujo principal.
- Durante un refactor, el código legacy solo puede conservarse como compatibilidad; no puede convertirse nuevamente en arquitectura principal.
- No modificar contratos backend para adaptar Biblioteca a código legacy.

## Fuentes obligatorias

| Tema | Fuente |
| --- | --- |
| Reglas frontend | `AGENTS.md` |
| Arquitectura frontend | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Plan de refactor | [`docs/refactor/REFACTOR_PLAYBOOK.md`](docs/refactor/REFACTOR_PLAYBOOK.md) |
| Estado de sesión | [`docs/refactor/SESSION_HANDOFF.md`](docs/refactor/SESSION_HANDOFF.md) |
| Reglas backend | [repositorio backend: `AGENTS.md`](../../educativo_backend/Educativo-Backend/AGENTS.md) |
| Schema y relaciones | [repositorio backend: `docs/DATABASE_SCHEMA.md`](../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md) |
| Contratos IA | [repositorio backend: `docs/AI_GENERATION_CONTRACTS.md`](../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md) |
| Arquitectura backend | [repositorio backend: `docs/03-backend-guide.md`](../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md) |
| Logs backend | [repositorio backend: `docs/observability/LOG_CONVENTIONS.md`](../../educativo_backend/Educativo-Backend/docs/observability/LOG_CONVENTIONS.md) |

El backend se encuentra en `../../educativo_backend/Educativo-Backend`, relativo a la raíz de este repositorio. Si una fuente documental contradice el código o las migraciones, detener el cambio y reportar la contradicción; no corregir el contrato sin autorización.

## Lectura obligatoria por tipo de cambio

- Para estilos o layout, leer `AGENTS.md` y `docs/ARCHITECTURE.md`.
- Para payloads, IDs, generación, polling, jobs o persistencia, leer además `DATABASE_SCHEMA.md`, `AI_GENERATION_CONTRACTS.md` y la guía de arquitectura del backend.
- Para logs relacionados con el backend, revisar sus convenciones de observabilidad.
- Para extraer una función durante el refactor, revisar `REFACTOR_PLAYBOOK.md` y `SESSION_HANDOFF.md` antes de editar.

## Reglas de refactor

- No hacer reescrituras completas: extraer literalmente antes de mejorar.
- No mezclar refactor y corrección de bugs ni cambiar comportamiento visible.
- No cambiar contratos de API ni nombres de campos.
- No eliminar compatibilidad `window` sin confirmar todos sus consumidores.
- No eliminar código por parecer legacy ni inferir que lo es por su nombre.
- Buscar consumidores en JS, HTML, atributos `data-*`, handlers inline y referencias `window.*`.
- Mantener wrappers temporales cuando exista acoplamiento.
- Cada wrapper temporal debe documentar su razón, consumidor y condición de retiro.
- Mantener commits pequeños y actualizar `docs/refactor/SESSION_HANDOFF.md` después de cada sesión.
- No tocar `js/ui/wordExport.js` salvo autorización explícita.
- Las extracciones deben avanzar hacia una Biblioteca modular, no hacia restaurar o modularizar el explorador visual antiguo.

## Reglas de datos e IA

- No reinterpretar `unidad_id`, `planeacion_ids`, `tema_id` ni `tema_ids`.
- No tratar IDs de planeación como IDs de tema.
- No cambiar payloads para facilitar un refactor.
- No modificar prompts desde el frontend ni replicar lógica de generación backend.
- No asumir relaciones que no estén documentadas en el backend.
- Si frontend, backend y documentación se contradicen, detenerse y reportarlo.

## Reglas de seguridad

- No registrar tokens, headers `Authorization`, contraseñas, prompts ni respuestas completas.
- No exponer service role ni guardar secretos en código.
- No copiar datos reales de usuarios en documentación.

## Validación mínima

Antes de terminar una sesión:

```bash
git status
git diff --stat
git diff --check
```

Además, según el alcance: validar sintaxis, ejecutar las pruebas existentes, comprobar la consola, revisar que los scripts carguen en orden y actualizar `docs/refactor/SESSION_HANDOFF.md`. No declarar una validación como ejecutada si no ocurrió.
