# Reglas para agentes del frontend

## Proyecto

Educativo IA / Planea es un frontend estático para crear y administrar planeaciones, anexos, listas de cotejo y exámenes. Usa HTML multipágina, JavaScript Vanilla, scripts clásicos, Supabase Auth/Storage y una API backend separada.

Este archivo es la entrada obligatoria para una IA que trabaje en el frontend. No es necesario leer el archivo histórico para realizar una feature o fix normal.

## Workflow vigente

**Biblioteca es el único flujo visual principal del área privada.** Se ejecuta dentro de `pages/dashboard.html`.

El Explorer visual jerárquico antiguo fue retirado. No crear un modo dual, reintroducir su árbol/breadcrumbs/CRUD ni usar la jerarquía técnica como prueba de que esa UI sigue soportada.

`pages/archivados.html` es un flujo separado. Sus dependencias jerárquicas no lo convierten en un segundo Dashboard.

## Fuentes de trabajo

Siempre leer este archivo. Después consultar solo lo relacionado con la tarea:

| Tema | Fuente |
| --- | --- |
| Producto, setup y estructura general | [`README.md`](README.md) |
| Arquitectura y ownership | [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) |
| Archivos, surfaces y orden de carga | [`docs/FRONTEND_MAP.md`](docs/FRONTEND_MAP.md) |
| Pruebas | [`docs/TESTING.md`](docs/TESTING.md) |
| Backend y rutas | [`backend docs/03-backend-guide.md`](../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md) |
| Schema, IDs y relaciones | [`backend docs/DATABASE_SCHEMA.md`](../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md) |
| Generación IA | [`backend docs/AI_GENERATION_CONTRACTS.md`](../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md) |
| Logs backend | [`backend docs/observability/LOG_CONVENTIONS.md`](../../educativo_backend/Educativo-Backend/docs/observability/LOG_CONVENTIONS.md) |

El código ejecutable y los contratos backend especializados prevalecen sobre resúmenes. Si se contradicen, detener el cambio y reportar la evidencia.

## Ownership actual

- `js/pages/biblioteca.page.js`: state físico de Biblioteca y coordinación de selección, tabs, modales y pending.
- `js/features/biblioteca/biblioteca-loader.js`: carga y reconciliación.
- `js/features/biblioteca/biblioteca-render.js`: sidebar, detalle, tabs y cards.
- `js/features/biblioteca/biblioteca-modal-render.js`: DOM de modales y confirmación.
- `js/features/biblioteca/biblioteca-events.js`: búsqueda, delegación y dispatch de `data-bib-action`.
- `js/features/dashboard/dashboard-bootstrap.js`: layout, bindings compartidos e inicialización.
- `js/features/dashboard/quick-create.js`: Quick Create y coordinación de la jerarquía técnica necesaria.
- `js/features/{planeaciones,anexos,listas-cotejo,examenes}/`: owners de generación, preview, download y delete según el recurso.
- `js/pages/dashboard.page.js`: estado técnico compartido, caches/loaders jerárquicos y helpers de actividades, progreso y previews.

Extender el owner existente. No copiar su estado o lógica en `biblioteca.page.js`, Dashboard u otro dominio.

## State y compatibilidad clásica

`window.explorerState` sigue siendo un state técnico compartido clásico con consumidores reales. Su nombre es histórico; no representa un Explorer visual vigente.

- No renombrarlo ni sustituirlo automáticamente.
- No crear una segunda fuente de verdad.
- No mover un slice sin identificar writers, readers y orden de carga.
- No agregar globals cuando el owner actual puede exponer una operación explícita.

El frontend usa scripts clásicos deliberadamente. El orden de `<script>` en `pages/dashboard.html` forma parte del contrato entre providers y consumers. No migrar a ESM, bundler, framework o TypeScript sin una tarea explícita.

## Jerarquía técnica

Planteles, grados, materias, unidades y temas siguen activos cuando soportan IDs, caches, loaders, Quick Create, persistencia, contratos backend o Archivados.

No eliminar ni reinterpretar una pieza por tener nombre jerárquico. Buscar consumers en JS, HTML, `data-*`, listeners, handlers y `window.*`.

## Contratos protegidos

Conservar la semántica y el tipo de:

- `unidad_id`;
- `planeacion_ids`;
- `tema_id` y `tema_ids`;
- `batch_id`;
- `force_new_batch`;
- estados y polling de generation jobs;
- rutas, métodos, headers y nombres de campos de la API.

No tratar IDs de planeación como IDs de tema. No cambiar payloads, prompts, modelos, retries, parsing, schema o relaciones para facilitar una feature frontend.

No modificar `js/ui/wordExport.js` salvo que la tarea lo autorice explícitamente y cubra todas las descargas afectadas.

## Seguridad

- No registrar tokens, headers `Authorization`, contraseñas, prompts ni respuestas completas.
- No exponer service role ni guardar secretos en código o documentación.
- No copiar datos reales de usuarios a fixtures o docs.

## Workflow normal para features y fixes

1. Leer `AGENTS.md` y la documentación relacionada con la tarea.
2. Identificar el owner y todos sus consumers.
3. Confirmar contratos frontend/backend afectados.
4. Implementar el cambio mínimo dentro del owner correcto.
5. Ejecutar las pruebas relevantes de [`docs/TESTING.md`](docs/TESTING.md).
6. Hacer regresión manual si cambia UI, eventos, state, generación, polling, preview, download o delete.
7. Actualizar documentación solo si cambió arquitectura, ownership, setup o un contrato autorizado.

No mezclar una feature/fix con reorganizaciones no solicitadas. No hacer commits o push salvo petición explícita.
