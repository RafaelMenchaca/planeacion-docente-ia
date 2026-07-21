# Arquitectura del frontend

Este documento describe la arquitectura frontend observada en el código actual. Las reglas obligatorias están en [`AGENTS.md`](../AGENTS.md).

## Regla arquitectónica central

Solo existe un flujo visual principal vigente: **Biblioteca**.

La jerarquía técnica puede seguir existiendo como modelo de datos, API, selector, compatibilidad o soporte de Archivados. El explorador visual jerárquico antiguo no debe mezclarse con Biblioteca ni utilizarse para nuevas implementaciones.

## Stack y carpetas

- HTML multipágina y JavaScript Vanilla mediante scripts clásicos.
- CSS propio, Bootstrap y Tailwind según la página.
- Supabase JS para autenticación y Storage puntual.
- API backend consumida con `fetch`.

| Ruta | Responsabilidad actual |
| --- | --- |
| `pages/` | Páginas privadas, login, redirects y vistas auxiliares. |
| `js/core/` | Configuración de API, Supabase y utilidades. |
| `js/api/` | Wrappers HTTP por recurso. |
| `js/services/` | Autenticación y orquestación. |
| `js/pages/` | Estado, eventos e inicialización de páginas. |
| `js/ui/` | Componentes, modales, helpers y descargas. |
| `tests/` | Suite automatizada existente. |

`js/features/` no existe en el estado auditado.

## Flujo principal: Biblioteca

`pages/dashboard.html` carga, entre otros, `dashboard.page.js`, `biblioteca.page.js` y `main.js`, en ese orden. `main.js` invoca `window.initDashboardPage()`.

Como `biblioteca.page.js` ya publicó `window.initBiblioteca`, `initDashboardPage()`:

1. establece `window.BIBLIOTECA_MODE = true`;
2. inyecta el layout y componentes privados;
3. registra los eventos compartidos;
4. llama `window.initBiblioteca()`;
5. retorna antes de ejecutar `hydrateExplorerData()`.

Biblioteca controla el render principal: carga conjuntos, renderiza sidebar y detalle, conserva el tab por conjunto y coordina planeaciones, anexos, listas y exámenes. Toda funcionalidad visual nueva debe incorporarse a este flujo.

`dashboard.page.js` todavía contiene utilidades, creación rápida, estado y previews consumidos por Biblioteca. Es deuda técnica de compatibilidad, no un segundo modo de uso. El objetivo del refactor es separar las dependencias activas y retirar gradualmente el código visual obsoleto; nunca mover lógica de Biblioteca hacia el explorador antiguo.

## Páginas

| Página | Clasificación |
| --- | --- |
| `pages/dashboard.html` | Contenedor vigente de Biblioteca. |
| `pages/detalle.html` | Flujo auxiliar vigente para planeaciones. |
| `pages/archivados.html` | Flujo separado; puede usar jerarquía técnica. |
| `pages/batch.html`, `pages/planeacion.html` | Redirects históricos. |
| `pages/dashboard_tailwind.html` | Histórica/por confirmar; no activar ni eliminar sin auditoría. |

## Código legacy y compatibilidad

| Área | Estado | Regla |
| --- | --- | --- |
| Explorador visual jerárquico del dashboard | Legacy visual | No recibir funciones nuevas ni convertirse en arquitectura objetivo. |
| `explorerState` | Mixto | Separar consumidores; no eliminar como bloque. |
| Wrappers `window.*` | Compatibilidad activa | Mantener hasta migrar y verificar consumidores. |
| Estado y helpers compartidos de Dashboard | Compartidos activos/por clasificar | Extraer hacia Biblioteca modular sin cambiar contratos. |
| Archivados | Activo separado | Mantener sus dependencias mientras tenga consumidores. |
| Páginas históricas | Por confirmar | No activar ni eliminar sin evidencia. |
| Endpoints jerárquicos | Jerarquía técnica | No confundir con soporte al explorador visual antiguo. |

La ruta visual antigua incluye árbol, breadcrumbs y render por niveles. Su código no se ejecuta en la inicialización principal confirmada, pero ninguna pieza debe eliminarse únicamente por nombre: algunas funciones jerárquicas sostienen creación, datos, Archivados o compatibilidad.

## Estado global conocido

- Biblioteca publica `window.biblioteca`, `window.initBiblioteca` y `window.renderBibliotecaContent`.
- Dashboard publica `window.explorerState` y wrappers de preview/descarga usados por Biblioteca.
- `window.AppUI` concentra helpers compartidos.
- `window.API_BASE_URL`, `window.supabase` y `window.currentUser` sostienen configuración y sesión.

El acoplamiento bidireccional entre `dashboard.page.js` y `biblioteca.page.js` debe reducirse hacia módulos propiedad de Biblioteca, conservando wrappers temporales mientras existan consumidores.

## Terminología canónica

- **Biblioteca:** flujo visual principal vigente para administrar recursos del usuario.
- **Bloque o conjunto de Biblioteca:** agrupación visual y funcional basada en los datos del conjunto. No equivale automáticamente a una entidad jerárquica específica.
- **Jerarquía técnica:** datos y endpoints de planteles, grados, materias, unidades y temas. Puede seguir activa sin que el explorador visual lo esté.
- **Explorador visual jerárquico:** interfaz antigua por niveles; legacy y prohibida para nuevas implementaciones.
- **Compatibilidad legacy:** globals, wrappers, estado o código conservado porque aún tiene consumidores; no es arquitectura objetivo.
- **Archivados:** flujo separado que puede conservar estructuras jerárquicas.
- **`unidad_id`:** identificador técnico de determinados contratos; no es automáticamente la fuente única de selección visual o temática.
- **`planeacion_ids`:** selección explícita de planeaciones usada, entre otros casos, por la generación vigente de exámenes desde Biblioteca.
- **`tema_id` / `tema_ids`:** identificadores de temas; nunca reciben IDs de planeaciones.

## Matriz de estado funcional

| Área | Estado | Puede recibir funciones nuevas | Puede eliminarse | Notas |
| --- | --- | ---: | ---: | --- |
| Biblioteca | Vigente | Sí | No | Flujo principal. |
| Explorador visual jerárquico | Legacy | No | Solo tras auditoría | No usar en nuevos módulos. |
| Jerarquía técnica backend | Activa/compatibilidad | Solo según contrato | No asumir | Datos y endpoints. |
| Archivados | Activo separado | Solo mantenimiento | No asumir | Puede usar jerarquía. |
| `explorerState` | Mixto | No como arquitectura | Parcialmente | Separar consumidores. |
| Wrappers `window.*` | Compatibilidad | No ampliar sin necesidad | Tras migrar consumidores | Documentar retiro. |
| Páginas históricas | Por confirmar | No | Tras auditoría | No activar. |

## Dependencias del backend

La documentación canónica de datos y generación vive en `educativo_backend/Educativo-Backend`:

- [`DATABASE_SCHEMA.md`](../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md)
- [`AI_GENERATION_CONTRACTS.md`](../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md)
- [`03-backend-guide.md`](../../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md)

El frontend no redefine schema, relaciones, prompts, jobs ni métricas.
