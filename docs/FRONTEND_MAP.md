# Mapa actual del frontend

Mapa operativo de archivos, owners y contratos. Para contexto arquitectónico consultar [`ARCHITECTURE.md`](ARCHITECTURE.md).

## Entry points

| Entry | Inicialización | Responsabilidad |
| --- | --- | --- |
| `index.html` y páginas públicas | `components.public.js` | Sitio público. |
| `pages/login.html` | `initLoginPage` | Autenticación. |
| `pages/dashboard.html` | `initDashboardPage` | Dashboard y Biblioteca. |
| `pages/detalle.html` | `initDetallePage` | Detalle/edición de planeación. |
| `pages/archivados.html` | `initArchivadosPage` | Restauración y eliminación permanente. |
| `pages/batch.html`, `pages/planeacion.html` | Redirect | Compatibilidad de URL. |
| `pages/dashboard_tailwind.html` | Stack propio | Página histórica directa. |

`js/main.js` despacha únicamente Login, Dashboard, Detalle y Archivados.

## Core y sesión

| Archivo | Surface principal |
| --- | --- |
| `js/core/config.js` | `API_BASE_URL` / `window.API_BASE_URL`. |
| `js/core/supabase.client.js` | Cliente Supabase público. |
| `js/core/utils.js` | `escapeHtml`. |
| `js/services/auth.service.js` | `protegerRuta`, `requireSession` y logout. |
| `js/ui/shared.ui.js` | `window.AppUI`: toast, progreso y nombres de descarga. |
| `js/ui/components.private.js` | Navbar/footer privado y perfil. |
| `js/ui/wordExport.js` | Exportaciones Word compartidas; zona protegida. |

## HTTP por dominio

| Dominio | API | Service/consumidor |
| --- | --- | --- |
| Biblioteca | `js/api/biblioteca.api.js` | Loader, Detalle y deletes. |
| Planeaciones | `js/api/planeaciones.api.js` | `planeaciones.service.js`, Detalle y owners. |
| Jerarquía técnica | `js/api/jerarquia.api.js` | `jerarquia.service.js`, Quick y Archivados. |
| Exámenes | `js/api/examenes.api.js` | `examenes.service.js` y owners. |
| Listas | `js/api/listas_cotejo.api.js` | `listas_cotejo.service.js` y owners. |
| Anexos | `js/api/anexos.api.js` | Owners de Anexos. |

Los services agregan sesión, adaptación o estado compartido. No deben duplicar un request existente solo para cambiar su consumidor.

## Dashboard y Biblioteca

| Archivo | Ownership actual |
| --- | --- |
| `js/pages/dashboard.page.js` | `explorerState`, caches/loaders jerárquicos, actividades, progreso y previews compartidos. |
| `js/features/dashboard/dashboard-bootstrap.js` | Layout, bindings e inicio de Biblioteca. |
| `js/features/dashboard/quick-create.js` | Quick Create y coordinación de creación/generación. |
| `js/pages/biblioteca.page.js` | State físico, selection, tabs, modales, pending y facade. |
| `js/features/biblioteca/biblioteca-loader.js` | Load, normalización y reconcile. |
| `js/features/biblioteca/biblioteca-render.js` | Sidebar, detalle, tabs y cards. |
| `js/features/biblioteca/biblioteca-modal-render.js` | Modales y confirmación. |
| `js/features/biblioteca/biblioteca-events.js` | Search y dispatch de actions. |
| `js/features/biblioteca/biblioteca-block-delete.js` | Eliminación de bloques. |

### Surfaces públicas de coordinación

- `window.QuickCreate`: `open`, `close`, `bind`.
- `window.biblioteca`: `pendingBatchId`, `getConjuntos`, `startPlaneacionesGeneration`, `setPendingConjunto`, `finishPlaneacionesGeneration`.
- `window.BibliotecaLoader`: carga y reconciliación usadas por init, generation y delete.
- `window.initDashboardPage` y `window.initBiblioteca`: contratos de arranque.

`BibliotecaRender`, `BibliotecaModalRender` y `BibliotecaEvents` son bindings léxicos internos.

## State técnico compartido

`window.explorerState` contiene 17 propiedades con consumers actuales:

- jerarquía/caches: `planteles`, `gradosByPlantel`, `materiasByGrado`, `unidadesByMateria`, `temasByUnidad`;
- carga: `loading`, `errors`;
- selección técnica: `current`;
- Quick Create: `stagingTemas`, `stagingTituloConjunto`, `stagingContext`, `quickCreate`, `generating`;
- coordinación: `progress`;
- previews: `examPreview`, `examenDetalleById`, `listaCotejoPreview`.

No existe una slice de navegación visual legacy. No renombrar el objeto ni mover propiedades sin auditar todos los writers/readers.

## Features por dominio

### Planeaciones

- `planeacion-generation.js`
- `planeacion-download.js`
- `planeacion-delete.js`
- detalle/edición: `pages/detalle.html`, `detalle.page.js`, `detalle.ui.js`

### Anexos

- `anexo-generation.js`
- `anexo-preview.js`
- `anexo-download.js`
- `anexo-delete.js`

### Listas de cotejo

- `lista-cotejo-generation.js`
- `lista-cotejo-preview.js`
- `lista-cotejo-download.js`
- `lista-cotejo-delete.js`

### Exámenes

- `exam-generation.js`
- `exam-preview.js`
- `exam-download.js`
- `exam-delete.js`

## Orden de carga del Dashboard

`pages/dashboard.html` carga 42 scripts locales y el CDN de Supabase. El orden conceptual es:

```text
core/Supabase/auth
→ APIs y services
→ generation owners requeridos temprano
→ wordExport y preview/download owners
→ UI compartida
→ Biblioteca/Anexos APIs
→ owners por recurso
→ Dashboard page/bootstrap/Quick
→ Biblioteca page/Loader/Render/Modal Render/Events
→ main.js
```

No reordenar scripts basándose solo en el nombre del archivo. Confirmar providers, consumers y si la llamada ocurre en top-level o después de init/eventos.

## Actions y eventos

`biblioteca-events.js` centraliza `data-bib-action` y delega en owners. Al agregar o retirar una acción:

1. localizar todos los emitters en render/modal render;
2. localizar el branch handler;
3. confirmar el namespace owner;
4. evitar listeners duplicados;
5. cubrir el cambio con smoke o regresión manual.

## Tests

Las suites viven en `tests/`. Cubren compatibilidad de redirects, ausencia del fallback legacy, owners de actions, loader, bootstrap, Quick Create, previews y frontera clásica final.

Comandos y matriz manual: [`TESTING.md`](TESTING.md).
