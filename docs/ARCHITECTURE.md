# Arquitectura del frontend

Este documento describe la arquitectura frontend observada en el código actual. Las reglas obligatorias están en [`AGENTS.md`](../AGENTS.md).

## Stack

- HTML multipágina y JavaScript Vanilla mediante scripts clásicos.
- CSS propio, Bootstrap 5.3.3 y Tailwind CSS mediante CDN según la página.
- Supabase JS para autenticación y operaciones puntuales de Storage.
- API backend consumida con `fetch`.
- Librerías puntuales cargadas por CDN, como SheetJS en la página de detalle.

No hay un framework SPA ni un empaquetador de módulos. La carpeta `js/features/` no existe en el estado auditado.

## Estructura de carpetas

| Ruta | Responsabilidad actual |
| --- | --- |
| `pages/` | Páginas privadas, login, redirecciones y vistas auxiliares. |
| `js/core/` | Configuración de API, cliente Supabase y utilidades comunes. |
| `js/api/` | Wrappers `fetch` por recurso. |
| `js/services/` | Orquestación de autenticación, jerarquía, planeaciones, exámenes y listas. |
| `js/pages/` | Estado, render e inicialización específica de páginas. |
| `js/ui/` | Componentes, modales, helpers compartidos y exportación Word. |
| `assets/`, `css/`, `components/` | Recursos visuales, estilos y fragmentos estáticos. |
| `tests/` | Pruebas automatizadas existentes. |

## Páginas principales

| Página | Scripts o función principal |
| --- | --- |
| `index.html` y páginas públicas raíz | Componentes públicos y estilos Tailwind propios. |
| `pages/login.html` | Supabase, autenticación, UI compartida, `login.page.js` y `main.js`. |
| `pages/dashboard.html` | Configuración, Supabase/Auth, APIs, services, UI, `dashboard.page.js`, `biblioteca.page.js` y `main.js`, en ese orden. |
| `pages/archivados.html` | Jerarquía y planeaciones, componentes privados, `archivados.page.js` y `main.js`. |
| `pages/detalle.html` | Biblioteca/planeaciones, Storage, exportación Word, UI y página de detalle. |
| `pages/batch.html`, `pages/planeacion.html` | Redirigen actualmente a `dashboard.html`. |
| `pages/dashboard_tailwind.html` | Vista alternativa con un conjunto propio de scripts; no se asume obsoleta por su nombre. |

Los HTML no contienen handlers inline en el estado auditado. Los atributos `data-*` y listeners creados desde JavaScript siguen siendo consumidores que deben buscarse antes de extraer o retirar funciones.

## Flujo de inicio

1. `js/core/config.js` publica `window.API_BASE_URL`: usa el backend local en `localhost`/`127.0.0.1` y la API de producción en otros hosts.
2. El CDN de Supabase carga antes de `js/core/supabase.client.js`, que publica `window.supabase`.
3. `js/services/auth.service.js` protege páginas privadas, obtiene la sesión y publica `window.currentUser`.
4. Los wrappers API y services se cargan antes de las páginas que los consumen.
5. `js/main.js` selecciona el inicializador según el nombre del HTML.
6. En el dashboard, `initDashboardPage` activa el modo Biblioteca y llama `window.initBiblioteca` cuando está disponible.
7. Los componentes de navbar se cargan según la página pública o privada.

El orden de scripts forma parte del acoplamiento actual: debe conservarse o validarse explícitamente al extraer módulos.

## Biblioteca y dashboard

Biblioteca es el flujo visual vigente dentro del dashboard. `dashboard.page.js` aún contiene estado y funciones compartidas; `biblioteca.page.js` consume globals y wrappers expuestos por Dashboard, y Dashboard consume el namespace `window.biblioteca` para generación y actualización de conjuntos.

`window.explorerState` conserva partes activas para progreso y previews. No debe eliminarse completo sin separar y verificar sus consumidores. La jerarquía técnica también sigue participando en archivados y flujos de selección aunque una navegación visual anterior no esté activa.

## APIs frontend

| Wrapper | Responsabilidad |
| --- | --- |
| `planeaciones.api.js` | CRUD, archivo/restauración, generación normal/SSE y exportación. |
| `biblioteca.api.js` | Conjuntos, bloques, detalle y eliminación de recursos de Biblioteca. |
| `jerarquia.api.js` | Planteles, grados, materias, unidades, temas y generación por unidad. |
| `anexos.api.js` | Generación, consulta, eliminación y regeneración de anexos. |
| `listas_cotejo.api.js` | Generación, consulta y eliminación de listas. |
| `examenes.api.js` | Creación de generación, consulta de job, listado y eliminación de exámenes. |

Estos wrappers reflejan consumo frontend, pero no son la fuente canónica del contrato. Los endpoints y payloads deben contrastarse con el backend antes de modificarse.

## Estado global y compatibilidad

Las globals activas incluyen `window.API_BASE_URL`, `window.supabase`, `window.currentUser`, `window.AppUI`, APIs/services, inicializadores de página y wrappers temporales. En Dashboard/Biblioteca destacan:

- `window.biblioteca` y `window.renderBibliotecaContent`;
- `window.explorerState`;
- wrappers de preview de exámenes y listas;
- wrappers de descarga, incluidos los expuestos por `wordExport.js`.

Hay dependencias bidireccionales entre `dashboard.page.js` y `biblioteca.page.js`. Su retiro exige migrar consumidores, conservar wrappers durante la transición y validar el orden de carga.

## Dependencias del backend

### La documentación canónica de datos y generación vive en el backend

Repositorio canónico: `educativo_backend/Educativo-Backend`.

- [Schema y relaciones: `DATABASE_SCHEMA.md`](../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md)
- [Prompts y contratos IA: `AI_GENERATION_CONTRACTS.md`](../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md)
- [Arquitectura y rutas backend: `03-backend-guide.md`](../../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md)

Este repositorio no replica esas definiciones. Cualquier cambio de payloads, IDs, polling, jobs, generación o persistencia debe consultar primero dichas fuentes y el código ejecutable del backend.
