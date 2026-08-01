# Arquitectura del frontend

Este documento describe la arquitectura frontend observada en el código actual. Las reglas obligatorias están en [`AGENTS.md`](../AGENTS.md).

## Estado actual

La arquitectura descrita desde esta sección hasta “Arquitectura objetivo” corresponde al estado observado. Incluye dependencias temporales que todavía no representan el diseño deseado.

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
| `js/features/` | Acciones modulares por dominio extraídas en Fases 1, 2 y 4. |
| `js/ui/` | Componentes, modales, helpers y descargas. |
| `tests/` | Suite automatizada existente. |

La auditoría de la capa HTTP y sus contratos se mantiene en
[`FRONTEND_MAP.md`](FRONTEND_MAP.md).

## Capa HTTP actual

La arquitectura ejecutable es mixta:

- `js/api/` contiene todo el HTTP contra Express.
- Los services de exámenes, listas, jerarquía y planeaciones delegan a sus
  respectivos API files, obtienen sesión y, en algunos casos, normalizan la
  respuesta.
- Biblioteca consume directamente `biblioteca.api.js`, partes de las API de
  generación y `anexos.api.js`.
- `planeaciones.service.js` combina wrappers HTTP con un registro local usado
  por Archivados.
- Los únicos `fetch` fuera de `js/api/` cargan fragmentos HTML desde páginas o
  UI; no llaman al backend Express.
- La autenticación y Storage puntuales adicionales se realizan mediante el SDK
  de Supabase.

`API_BASE_URL` y `window.API_BASE_URL` nacen del mismo archivo, pero los
wrappers actuales leen la forma léxica. El orden de carga es contractual porque
se usan scripts clásicos y globals `window.*`, además de funciones globales
implícitas. Los contratos de Biblioteca, Detalle, Archivados y explorador
legacy se mantienen separados.

La Fase 3 cerró la consolidación interna de las fronteras HTTP pequeñas y
equivalentes sin crear un cliente universal. `bibliotecaGet`,
`bibliotecaDelete`, `anexosGet`, `listasCotejoGet` y `examResourceGet` son
bindings léxicos privados, específicos de dominio y método; las APIs públicas,
services y wrappers `window.*` conservan sus firmas. Las diferencias de sesión,
parsing, errores, SSE, blobs, generación y polling permanecen deliberadamente
separadas. La Sesión 4.0 abrió documentalmente la Fase 4 y quedó aprobada. La
Fase 4 está cerrada formalmente: las Sesiones 4.1, 4.2 y 4.3 movieron literalmente las
  operaciones vigentes de generación seleccionada de anexos y listas, el
  coordinador de inicio/progreso de planeaciones y la creación/polling de
  exámenes de Biblioteca, a
  `js/features/anexos/anexo-generation.js`,
  `js/features/listas-cotejo/lista-cotejo-generation.js` y
  `js/features/planeaciones/planeacion-generation.js`, y la Sesión 4.4 añadió
  `js/features/examenes/exam-generation.js`. Conservan APIs, selección, pending,
  feedback, espera, persistencia y refetch. Quick create, la generación
  individual, los parsers SSE compartidos y el coordinador/polling legacy de
  exámenes permanecen en sus propietarios anteriores.

La Sesión 4.4 quedó validada manualmente y commiteada. La Sesión 4.5 auditó el
cierre sin modificar código: confirmó los cuatro coordinadores por dominio, sus
globals y consumidores únicos, el orden clásico de scripts y la integridad de
quick create, generación individual, legacy, APIs/services y backend. La
decisión formal **A. Cerrar Fase 4** y su validación documental quedaron
aprobadas en el commit de cierre `8dcba86`. No se detectaron regresiones
introducidas; los riesgos conocidos permanecen preservados. Fase 5 continúa
pendiente y no iniciada.

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

## Arquitectura objetivo

La arquitectura objetivo es una **Biblioteca modular** con:

- estado delimitado;
- módulos por dominio;
- capa API frontend;
- generación y polling separados del render general;
- render y eventos separados;
- compatibilidad temporal controlada;
- explorador visual legacy aislado y, solo después de confirmar que no tiene consumidores, eliminado;
- jerarquía técnica preservada cuando siga siendo necesaria para datos, contratos, selectores o Archivados.

Este apartado describe una meta, no el estado ya implementado. El orden, los criterios y las pruebas están en el [`REFACTOR_ROADMAP.md`](refactor/REFACTOR_ROADMAP.md).
