# Educativo IA Frontend

Frontend estático de Educativo IA para crear, consultar y descargar planeaciones, anexos, listas de cotejo y exámenes.

La versión 3.0 se encuentra desplegada y estable después del cierre del refactor modular de Biblioteca.

## Flujo funcional vigente

**Biblioteca es el único flujo visual principal vigente del área privada.** Se carga dentro de `pages/dashboard.html` y permite:

- agrupar recursos en bloques o conjuntos;
- crear temas y generar planeaciones;
- consultar, previsualizar, descargar y eliminar recursos;
- generar anexos, listas de cotejo y exámenes;
- mostrar progreso y feedback de generación;
- navegar entre los tabs del bloque seleccionado.

El flujo de coordinación vigente es **Dashboard → Biblioteca → Quick Create → owners por dominio**. El antiguo Explorer visual `plantel → grado → materia → unidad → tema`, su CRUD jerárquico y el fallback visual del Dashboard fueron retirados. Las tablas, IDs, caches, loaders y endpoints jerárquicos siguen activos cuando soportan Quick Create, persistencia, contratos técnicos o Archivados.

## Stack 

- HTML y JavaScript Vanilla mediante scripts clásicos.
- CSS propio, Tailwind CSS y Bootstrap donde el código actual los carga.
- Supabase JS para autenticación y operaciones puntuales de Storage.
- `fetch` para consumir el backend.
- Jest y JSDOM para las pruebas existentes.

## Estructura

| Ruta | Responsabilidad |
| --- | --- |
| `pages/` | Páginas públicas, privadas, redirects y vistas auxiliares. |
| `js/core/` | Configuración, cliente Supabase y utilidades. |
| `js/api/` | Wrappers HTTP por recurso. |
| `js/services/` | Autenticación y orquestación frontend. |
| `js/pages/` | Estado y coordinación por página. |
| `js/features/` | Owners modulares de Biblioteca, Dashboard y recursos. |
| `js/ui/` | Componentes y helpers compartidos, incluido `AppUI`. |
| `tests/` | Pruebas automatizadas existentes. |

## Arquitectura modular de Biblioteca

| Área | Owner actual |
| --- | --- |
| Biblioteca State / Selection / Tabs / Modal State / Pending | `js/pages/biblioteca.page.js` mantiene una fuente física por estado y la facade de coordinación `window.biblioteca`. |
| Biblioteca Loader / Reconcile | `js/features/biblioteca/biblioteca-loader.js` carga conjuntos y reconcilia resultados de generación. |
| Biblioteca Render | `js/features/biblioteca/biblioteca-render.js` renderiza sidebar, bloque seleccionado, tabs y cards. |
| Biblioteca Modal Render | `js/features/biblioteca/biblioteca-modal-render.js` renderiza los modales del flujo. |
| Biblioteca Events | `js/features/biblioteca/biblioteca-events.js` enlaza los `data-bib-action` con sus owners. |
| Quick Create | `js/features/dashboard/quick-create.js` posee el flujo de creación rápida y coordina la jerarquía técnica necesaria. |
| Dashboard Bootstrap | `js/features/dashboard/dashboard-bootstrap.js` inyecta el layout, enlaza eventos compartidos e inicia Biblioteca. |
| Generation owners | `planeacion-generation.js`, `anexo-generation.js`, `lista-cotejo-generation.js` y `exam-generation.js` dentro de sus dominios en `js/features/`. |
| Preview owners | `anexo-preview.js`, `lista-cotejo-preview.js` y `exam-preview.js` dentro de sus dominios. |
| Download owners | `planeacion-download.js`, `anexo-download.js`, `lista-cotejo-download.js` y `exam-download.js` dentro de sus dominios. |
| Delete owners | Owners de Planeación, Anexo, Lista de cotejo y Examen, más `biblioteca-block-delete.js` para bloques completos. |

`dashboard.page.js` quedó reducido a estado técnico compartido, caches y loaders jerárquicos, helpers de actividades y soporte de progreso/previews. `window.explorerState` conserva ese contrato técnico clásico compartido; su nombre histórico no representa un Explorer visual vigente.

El frontend conserva scripts clásicos. El orden declarado en `pages/dashboard.html` es contractual para las dependencias léxicas y los namespaces `window.*` que siguen justificados.

## Páginas relevantes

| Página | Estado actual |
| --- | --- |
| `index.html` y páginas públicas | Sitio público. |
| `pages/login.html` | Acceso con Supabase Auth. |
| `pages/dashboard.html` | Contenedor del flujo principal Biblioteca. |
| `pages/detalle.html` | Detalle y edición de planeación. |
| `pages/archivados.html` | Flujo separado con dependencias jerárquicas; no equivale al flujo principal. |
| `pages/batch.html`, `pages/planeacion.html` | Redirigen a `dashboard.html`. |
| `pages/dashboard_tailwind.html` | Página histórica sin consumidor de navegación confirmado; no activar ni eliminar sin auditoría. |

No existe `pages/biblioteca.html`: Biblioteca se inicializa desde `js/pages/biblioteca.page.js` dentro del dashboard.

## Inicio del dashboard

`pages/dashboard.html` carga los owners de recursos, `dashboard.page.js`, Dashboard Bootstrap, Quick Create, `biblioteca.page.js`, Loader, Render, Modal Render y Events de Biblioteca; `main.js` queda al final.

`main.js` invoca `window.initDashboardPage()`. Dashboard Bootstrap inyecta `components/layout.html`, enlaza Quick Create y previews compartidos, y llama `window.initBiblioteca()`. Biblioteca enlaza sus eventos y carga los conjuntos mediante `window.BibliotecaLoader`; no existe modo dual ni fallback visual antiguo.

## Configuración

`js/core/config.js` define `window.API_BASE_URL`:

- `localhost` o `127.0.0.1`: `http://localhost:3000`;
- otros hosts: `https://api.educativoia.com`.

No copiar claves, tokens ni valores privados a la documentación. La configuración pública de Supabase no autoriza exponer service role.

## Desarrollo local.

```bash
npm install
npm test
```

Para servir los archivos estáticos puede usarse un servidor local. El backend debe estar disponible en la URL configurada.

## Documentación obligatoria

- Reglas: [`AGENTS.md`](AGENTS.md)
- Arquitectura actual: [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md)
- Método de refactor: [`docs/refactor/REFACTOR_PLAYBOOK.md`](docs/refactor/REFACTOR_PLAYBOOK.md)
- Fases y criterios de avance: [`docs/refactor/REFACTOR_ROADMAP.md`](docs/refactor/REFACTOR_ROADMAP.md)
- Decisiones del refactor: [`docs/refactor/REFACTOR_DECISIONS.md`](docs/refactor/REFACTOR_DECISIONS.md)
- Estado de sesión: [`docs/refactor/SESSION_HANDOFF.md`](docs/refactor/SESSION_HANDOFF.md)
- Pruebas manuales: [`docs/refactor/TEST_MATRIX.md`](docs/refactor/TEST_MATRIX.md)

Los contratos de datos, generación IA, jobs, métricas, RLS y persistencia viven en el repositorio backend enlazado desde `AGENTS.md`.
