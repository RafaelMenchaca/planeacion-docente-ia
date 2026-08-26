# Arquitectura del frontend

Este documento describe cómo funciona hoy el frontend de Educativo IA / Planea. Las reglas obligatorias para agentes están en [`../AGENTS.md`](../AGENTS.md) y el inventario de archivos en [`FRONTEND_MAP.md`](FRONTEND_MAP.md).

## Principio central

**Biblioteca es el único flujo visual principal del área privada.** Vive dentro de `pages/dashboard.html`.

El Explorer visual jerárquico antiguo fue eliminado. La jerarquía técnica de planteles, grados, materias, unidades y temas permanece cuando sostiene datos, IDs, Quick Create, persistencia, contratos backend o Archivados.

## Modelo de ejecución

- HTML multipágina.
- JavaScript Vanilla mediante scripts clásicos, sin ESM ni bundler.
- Providers y consumers se coordinan mediante funciones léxicas y namespaces `window.*`.
- El orden de scripts de cada HTML es contractual.
- Supabase JS gestiona autenticación y Storage puntual.
- Las llamadas al backend Express pasan por `js/api/`.

No migrar el modelo clásico de carga como efecto lateral de una feature.

## Capas

| Capa | Responsabilidad |
| --- | --- |
| `js/core/` | URL de API, cliente Supabase y utilidades. |
| `js/api/` | Requests HTTP, headers, parsing y errores por dominio. |
| `js/services/` | Sesión y adaptadores compartidos. |
| `js/pages/` | State e inicialización de páginas. |
| `js/features/` | Owners funcionales de Biblioteca, Dashboard y recursos. |
| `js/ui/` | Componentes compartidos y exportación. |

Los únicos `fetch` fuera de `js/api/` cargan fragmentos HTML; no redefinen la API Express.

## Inicio del Dashboard

```text
main.js
  → initDashboardPage()
  → DashboardBootstrap.init()
  → inyección de components/layout.html
  → QuickCreate.bind()
  → initBiblioteca()
  → BibliotecaEvents.bind()
  → BibliotecaLoader.loadAndRender()
```

No existe fallback visual al Explorer ni flag de modo dual.

## Ownership de Biblioteca

### State y coordinación

`js/pages/biblioteca.page.js` conserva la única fuente física de state de Biblioteca. Coordina:

- carga;
- selección de conjunto;
- tab activo por conjunto;
- state de los cuatro modales de generación;
- pending de planeaciones, anexos, listas y exámenes;
- facade `window.biblioteca` usada por Quick Create.

Las superficies internas de selection, tabs, modal state y pending delimitan ownership; no son stores paralelos.

### Loader y reconcile

`js/features/biblioteca/biblioteca-loader.js`:

- obtiene conjuntos;
- normaliza resultados;
- conserva selección/tab al recargar;
- reconcilia items temporales con recursos persistidos;
- expone `window.BibliotecaLoader` a los owners que necesitan refetch.

### Render

`biblioteca-render.js` renderiza sidebar, detalle, tabs y cards. `biblioteca-modal-render.js` posee el markup de modales y confirmación. Ambos son namespaces léxicos, no globals públicas.

### Events

`biblioteca-events.js` posee búsqueda, delegación y dispatch de `data-bib-action`. Envía cada acción al owner del recurso; no implementa generación, preview, download o delete internamente.

## Dashboard y Quick Create

`dashboard-bootstrap.js` posee el arranque visual y bindings compartidos.

`quick-create.js` posee el formulario de creación rápida, resuelve o crea la jerarquía técnica necesaria y coordina la generación mediante la facade de Biblioteca. Su API pública es `window.QuickCreate.open`, `close` y `bind`.

`dashboard.page.js` mantiene:

- `window.explorerState`;
- caches y loaders jerárquicos;
- IDs técnicos seleccionados;
- helpers de actividades;
- progreso compartido;
- state auxiliar de previews.

El nombre `explorerState` es histórico. Sus propiedades tienen consumers actuales y no deben moverse como bloque ni duplicarse en otro store.

## Owners por recurso

| Dominio | Owners |
| --- | --- |
| Planeaciones | generation, download y delete; detalle se abre en `detalle.html`. |
| Anexos | generation, preview, download y delete. |
| Listas de cotejo | generation, preview, download y delete. |
| Exámenes | generation/job polling, preview, download y delete. |
| Bloques | delete de bloque en el dominio Biblioteca. |

Los owners viven en `js/features/<dominio>/`. Biblioteca mantiene coordinación y state, no debe absorber de nuevo la implementación de cada recurso.

## API, generación y persistencia

El frontend conserva los contratos del backend. Los campos `unidad_id`, `planeacion_ids`, `tema_id`, `tema_ids`, `batch_id` y `force_new_batch` no son intercambiables.

- Planeaciones pueden usar SSE para progreso.
- Exámenes crean jobs y realizan polling.
- Anexos y listas conservan sus contratos de selección y duplicados.
- Biblioteca recarga y reconcilia la colección después de operaciones persistentes.

Los contratos detallados viven en el backend:

- [`DATABASE_SCHEMA.md`](../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md)
- [`AI_GENERATION_CONTRACTS.md`](../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md)
- [`03-backend-guide.md`](../../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md)

## Páginas

| Página | Estado actual |
| --- | --- |
| `index.html` y páginas públicas | Activas. |
| `pages/login.html` | Activa. |
| `pages/dashboard.html` | Contenedor activo de Biblioteca. |
| `pages/detalle.html` | Activa para consulta/edición. |
| `pages/archivados.html` | Flujo separado activo. |
| `pages/batch.html`, `pages/planeacion.html` | Redirects compatibles. |
| `pages/dashboard_tailwind.html` | URL histórica directa, fuera de la navegación principal. |

## Compatibilidad aceptada y deuda no bloqueante

- Scripts clásicos y globals con consumers reales.
- Nombre histórico `explorerState`.
- Assets de Planeación sin entrypoint canónico.
- `dashboard_tailwind.html` como decisión futura de producto.
- Integración futura de Archivados dentro de Biblioteca.

Estas observaciones no bloquean features normales. Cualquier cambio requiere una tarea concreta, auditoría de consumers y pruebas proporcionales.
