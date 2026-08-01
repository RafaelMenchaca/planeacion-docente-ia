# Mapa ejecutable del frontend

Estado observado en `refactor-front` durante la Fase 3, hasta su cierre en la
Sesión 3.9.
Este documento inventaría la arquitectura HTTP real y registra las
consolidaciones internas ya ejecutadas sin cambiar contratos públicos.

## Configuración y carga

- `js/core/config.js` declara el identificador global léxico
  `API_BASE_URL` y publica el mismo valor como `window.API_BASE_URL`.
- En `localhost` y `127.0.0.1` usa `http://localhost:3000`; en los demás
  hosts usa `https://api.educativoia.com`.
- Todos los wrappers Express usan `API_BASE_URL`; ningún consumidor usa
  explícitamente `window.API_BASE_URL`. No existe fallback de entorno.
- Las únicas rutas relativas solicitadas con `fetch` son fragmentos HTML.
- `pages/dashboard.html` carga, en orden: configuración, SDK y cliente
  Supabase, autenticación, utilidades, cada API antes de su service, features,
  UI privada, API de Biblioteca y anexos, features restantes, páginas y
  `main.js`.
- `pages/archivados.html` carga jerarquía y planeaciones, con cada API antes
  de su service. `pages/detalle.html` carga Biblioteca y planeaciones antes de
  `detalle.page.js`.
- Los scripts son clásicos. Toda declaración de función de nivel superior
  queda disponible en el objeto global aunque no tenga una asignación
  `window.*` explícita. Por ello, el orden de scripts forma parte del contrato.
- `js/core/supabase.client.js` contiene la configuración pública del cliente
  Supabase y publica `window.supabase`; sus valores no se reproducen aquí.

## Inventario de archivos API, services y core

| Archivo | Responsabilidad actual | Dominios | Consumidores | Globals expuestas | Estado |
| --- | --- | --- | --- | --- | --- |
| `js/api/anexos.api.js` | HTTP, parsing tolerante y metadata de error de anexos | Anexos | Biblioteca y features de preview/descarga | 5 API públicas; 4 helpers globales implícitos | API activa |
| `js/api/biblioteca.api.js` | Lecturas de conjuntos y deletes de Biblioteca consolidados internamente por método | Biblioteca, planeaciones, anexos, listas, exámenes | Biblioteca, Detalle y features de delete | 7 API públicas; `bibliotecaGet` y `bibliotecaDelete` privados | API activa |
| `js/api/examenes.api.js` | Generación, polling y lecturas de exámenes | Exámenes | Biblioteca directa y `examenes.service.js` | 4 API públicas; 4 helpers implícitos | API activa |
| `js/api/jerarquia.api.js` | CRUD jerárquico, generación y planeación por tema | Planteles, grados, materias, unidades, temas, planeaciones | `jerarquia.service.js` | 18 asignaciones explícitas; el resto de funciones de nivel superior son globals implícitas | Compatibilidad |
| `js/api/listas_cotejo.api.js` | Generación y lecturas de listas | Listas de cotejo | Biblioteca directa y `listas_cotejo.service.js` | 3 API públicas; 4 helpers implícitos | API activa |
| `js/api/planeaciones.api.js` | HTTP mixto de activos, Archivados, generación, edición y export | Planeaciones y batches | `planeaciones.service.js` | 16 API públicas; 3 helpers implícitos | Detalle/edición |
| `js/services/auth.service.js` | Protección de ruta y obtención de sesión | Autenticación | Páginas, services y features | `protegerRuta`, `requireSession`, `currentUser` | Compartido |
| `js/services/examenes.service.js` | Sesión y normalización sobre API de exámenes | Exámenes | Biblioteca features y explorador legacy | 4 wrappers públicos; helpers implícitos | Service activo |
| `js/services/jerarquia.service.js` | Sesión, normalización y API jerárquica | Jerarquía y generación | Explorador legacy, Archivados y creación activa | 25 wrappers públicos; helpers implícitos | Compatibilidad |
| `js/services/listas_cotejo.service.js` | Sesión y normalización sobre API de listas | Listas | Biblioteca features y explorador legacy | 3 wrappers públicos; helper implícito | Service activo |
| `js/services/planeaciones.service.js` | Wrappers HTTP y registro local de jerarquía archivada | Planeaciones, batches, Archivados | Biblioteca, Detalle, Archivados y páginas históricas | 23 globals explícitas; helpers implícitos | Archivados |
| `js/core/config.js` | Base URL por hostname | Configuración | Todos los archivos API | `API_BASE_URL`, `window.API_BASE_URL` | Compartido |
| `js/core/supabase.client.js` | Cliente Supabase | Auth y Storage | Auth, UI privada, login y Detalle | `window.supabase` | Compartido |
| `js/core/utils.js` | Escape HTML | UI | Páginas y render | `escapeHtml` | Compartido |

No queda ningún archivo de estas carpetas con estado desconocido.
`js/services/anexos.service.js` no existe; Biblioteca y los features de anexos
consumen las globals de `anexos.api.js` directamente.

## Funciones HTTP directas

La columna Token indica el argumento que el wrapper convierte en
`Authorization: Bearer <token>`.

| Función | Archivo | Método | Endpoint | Parámetros | Token | Respuesta | Error | Consumidores | Clasificación |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `apiGenerarAnexo` | anexos | POST | `/api/anexos/generate` | `planeacionId` → `{planeacion_id}` | Sí | `{ok, anexo_id, status, anexo?}` | JSON/texto con `status` y `payload` | Modal activo y wrapper compatible | Generación activa |
| `apiObtenerAnexosPorBatch` | anexos | GET | `/api/anexos/batch/:batchId` | `batchId` | Sí | `{anexos}` | JSON/texto con metadata | Ninguno | Sin consumidor confirmado |
| `apiObtenerAnexoPorPlaneacion` | anexos | GET | `/api/anexos/planeacion/:planeacionId` | `planeacionId` | Sí | `{anexo}` | JSON/texto con metadata | Ninguno | Sin consumidor confirmado |
| `apiObtenerAnexoDetalle` | anexos | GET | `/api/anexos/:anexoId` | `anexoId` | Sí | `{anexo}` | JSON/texto con metadata | Preview y descarga de anexo | Preview/descarga activa |
| `apiRegenerarAnexo` | anexos | POST | `/api/anexos/:anexoId/regenerate` | `anexoId` | Sí | `{ok, anexo}` | JSON/texto con metadata | Rama de Biblioteca sin emisor DOM vigente | Regeneración de compatibilidad |
| `apiBibliotecaConjuntos` | biblioteca | GET | `/api/biblioteca/conjuntos` | — | Sí | Array de conjuntos | `error` JSON o estado HTTP | Biblioteca | Biblioteca activa |
| `apiBibliotecaConjuntoById` | biblioteca | GET | `/api/biblioteca/conjuntos/:batchId` | `batchId` | Sí | Conjunto | `error` JSON o estado HTTP | Detalle | Detalle/edición |
| `apiBibliotecaDeleteBloque` | biblioteca | DELETE | `/api/biblioteca/bloques/:batchId` | `batchId` | Sí | `{ok, deleted:{batch}}` | `error` JSON o estado HTTP | Delete de bloque | Biblioteca activa |
| `apiDeletePlaneacionDirecta` | biblioteca | DELETE | `/api/planeaciones/:id/directo` | `id` | Sí | `{ok:true}` | `error` JSON o estado HTTP | Delete de planeación | Biblioteca activa |
| `apiDeleteExamen` | biblioteca | DELETE | `/api/examenes/:id` | `id` | Sí | `{ok:true}` | `error` JSON o estado HTTP | Delete de examen | Biblioteca activa |
| `apiDeleteListaCotejo` | biblioteca | DELETE | `/api/listas-cotejo/:id` | `id` | Sí | `{ok:true}` | `error` JSON o estado HTTP | Delete de lista | Biblioteca activa |
| `apiDeleteAnexo` | biblioteca | DELETE | `/api/anexos/:id` | `id` | Sí | `{ok:true}` | `error` JSON o estado HTTP | Delete de anexo | Biblioteca activa |
| `apiExamenesGenerate` | exámenes | POST | `/api/examenes/generate` | `payload` JSON | Sí | HTTP 202 `{ok, job_id, status}` | JSON/texto con metadata | Biblioteca y service legacy | Biblioteca activa |
| `apiExamenesListByUnidad` | exámenes | GET | `/api/examenes/unidad/:unidadId` | `unidadId` | Sí | `{examenes}` | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiExamenGenerationStatus` | exámenes | GET | `/api/examenes/generacion/:jobId` | `jobId` | Sí | Estado de job | JSON/texto con metadata | Biblioteca y service legacy | Biblioteca activa |
| `apiExamenById` | exámenes | GET | `/api/examenes/:id` | `id` | Sí | `{examen}` | JSON/texto con metadata | Service → preview/descarga | Compartida activa |
| `apiPlantelesList` | jerarquía | GET | `/api/planteles` | — | Sí | Array | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiPlantelesCreate` | jerarquía | POST | `/api/planteles` | `payload` | Sí | Plantel | JSON/texto con metadata | Service, creación rápida/legacy | Compartida activa |
| `apiPlantelesUpdate` | jerarquía | PATCH | `/api/planteles/:id` | `id`, `payload` | Sí | Plantel | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiPlantelesArchive` | jerarquía | PATCH | `/api/planteles/:id/archive` | `id` | Sí | Resultado de archivado | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiPlantelesDelete` | jerarquía | DELETE | `/api/planteles/:id` | `id` | Sí | `{ok, deleted}` | JSON/texto con metadata | Service legacy/Archivados | Archivados |
| `apiGradosListByPlantel` | jerarquía | GET | `/api/planteles/:plantelId/grados` | `plantelId` | Sí | Array | JSON/texto con metadata | Legacy y Archivados | Archivados |
| `apiGradosCreate` | jerarquía | POST | `/api/grados` | `payload` | Sí | Grado | JSON/texto con metadata | Service, creación rápida/legacy | Compartida activa |
| `apiGradosUpdate` | jerarquía | PATCH | `/api/grados/:id` | `id`, `payload` | Sí | Grado | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiGradosArchive` | jerarquía | PATCH | `/api/grados/:id/archive` | `id` | Sí | Resultado de archivado | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiGradosDelete` | jerarquía | DELETE | `/api/grados/:id` | `id` | Sí | `{ok, deleted}` | JSON/texto con metadata | Legacy y Archivados | Archivados |
| `apiMateriasListByGrado` | jerarquía | GET | `/api/grados/:gradoId/materias` | `gradoId` | Sí | Array | JSON/texto con metadata | Legacy y Archivados | Archivados |
| `apiMateriasCreate` | jerarquía | POST | `/api/materias` | `payload` | Sí | Materia | JSON/texto con metadata | Service, creación rápida/legacy | Compartida activa |
| `apiMateriasArchive` | jerarquía | PATCH | `/api/materias/:id/archive` | `id` | Sí | Resultado de archivado | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiMateriasDelete` | jerarquía | DELETE | `/api/materias/:id` | `id` | Sí | `{ok, deleted}` | JSON/texto con metadata | Legacy y Archivados | Archivados |
| `apiUnidadesListByMateria` | jerarquía | GET | `/api/materias/:materiaId/unidades` | `materiaId` | Sí | Array | JSON/texto con metadata | Legacy y Archivados | Archivados |
| `apiUnidadesCreate` | jerarquía | POST | `/api/unidades` | `payload` | Sí | Unidad | JSON/texto con metadata | Service, creación rápida/legacy | Compartida activa |
| `apiUnidadesUpdate` | jerarquía | PATCH | `/api/unidades/:id` | `id`, `payload` | Sí | Unidad | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiUnidadesArchive` | jerarquía | PATCH | `/api/unidades/:id/archive` | `id` | Sí | Resultado de archivado | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiUnidadesDelete` | jerarquía | DELETE | `/api/unidades/:id` | `id` | Sí | `{ok, deleted}` | JSON/texto con metadata | Legacy y Archivados | Archivados |
| `apiTemasListByUnidad` | jerarquía | GET | `/api/unidades/:unidadId/temas` | `unidadId` | Sí | Array | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiTemasCreate` | jerarquía | POST | `/api/temas` | `payload` | Sí | `{total, temas}` | JSON/texto con metadata | Service sin consumidor | Sin consumidor |
| `apiTemasDelete` | jerarquía | DELETE | `/api/temas/:id` | `id` | Sí | `{ok, deleted}` | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiUnidadGenerar` | jerarquía | POST | `/api/unidades/:id/generar` | `unidadId`, `payload` | Sí | Resultado de generación | JSON/texto con metadata | Service fallback | Compartida activa |
| `apiUnidadGenerarConProgreso` | jerarquía | POST/SSE | `/api/unidades/:id/generar?stream=1` | `unidadId`, `payload`, `onEvent` | Sí | JSON o stream y payload final | HTTP, evento `error` o stream truncado | Biblioteca y creación rápida | Compartida activa |
| `apiTemaPlaneacion` | jerarquía | GET | `/api/temas/:id/planeacion`; fallback `/api/planeaciones?tema_id=:id` | `temaId` | Sí | Planeación, array o `null` | JSON/texto; 404 activa fallback | Service legacy | Legacy visual |
| `apiListasCoTejoGenerate` | listas | POST | `/api/listas-cotejo/generate` | `payload` | Sí | Resumen y listas | JSON/texto con metadata | Biblioteca y service legacy | Biblioteca activa |
| `apiListasCoTejoByUnidad` | listas | GET | `/api/listas-cotejo/unidad/:unidadId` | `unidadId` | Sí | `{listas}` | JSON/texto con metadata | Service legacy | Legacy visual |
| `apiListaCoTejoById` | listas | GET | `/api/listas-cotejo/:id` | `id` | Sí | `{lista}` | JSON/texto con metadata | Service → preview/descarga | Biblioteca activa |
| `apiPlaneacionesList` | planeaciones | GET | `/api/planeaciones` | — | Sí | Array activo | JSON/texto con metadata | Service/página histórica | Compatibilidad |
| `apiPlaneacionesDelete` | planeaciones | DELETE | `/api/planeaciones/:id` | `id` | Sí | `Response` crudo; backend `{ok:true}` | Solo estado HTTP | Service legacy | Legacy visual |
| `apiPlaneacionesArchive` | planeaciones | PATCH | `/api/planeaciones/:id/archive` | `id` | Sí | Planeación | JSON/texto con metadata | Dashboard/batch histórico | Compatibilidad |
| `apiPlaneacionesRestore` | planeaciones | PATCH | `/api/planeaciones/:id/restore` | `id` | Sí | Planeación | JSON/texto con metadata | Archivados | Archivados |
| `apiPlaneacionesArchiveBatch` | planeaciones | PATCH | `/api/planeaciones/batch/:batchId/archive` | `batchId` | Sí | `{batch_id,total_updated,planeaciones}` | JSON/texto con metadata | Dashboard legacy | Legacy visual |
| `apiPlaneacionesRestoreBatch` | planeaciones | PATCH | `/api/planeaciones/batch/:batchId/restore` | `batchId` | Sí | `{batch_id,total_updated,planeaciones}` | JSON/texto con metadata | Archivados | Archivados |
| `apiPlaneacionesArchived` | planeaciones | GET | `/api/planeaciones/archived` | — | Sí | Totales, rutas y planeaciones | JSON/texto con metadata | Archivados | Archivados |
| `apiPlaneacionesPermanentDelete` | planeaciones | DELETE | `/api/planeaciones/:id/permanent` | `id` | Sí | `{ok, deleted}` | JSON/texto con metadata | Archivados | Archivados |
| `apiPlaneacionesPermanentDeleteBatch` | planeaciones | DELETE | `/api/planeaciones/batch/:batchId/permanent` | `batchId` | Sí | `{ok, deleted}` | JSON/texto con metadata | Archivados | Archivados |
| `apiPlaneacionesGenerate` | planeaciones | POST | `/api/planeaciones/generate` | `payload` | Sí | Resultado JSON | Genérico, pierde cuerpo backend | Service sin consumidor externo | Sin consumidor |
| `apiPlaneacionesGenerateWithProgress` | planeaciones | POST/SSE | `/api/planeaciones/generate?stream=1` | `payload`, `onEvent` | Sí | JSON o stream y payload final | HTTP genérico; eventos no se tipan como error | Página histórica | Compatibilidad |
| `apiPlaneacionesBatch` | planeaciones | GET | `/api/planeaciones/batch/:batchId` | `batchId` | Sí | `{batch_id,total,planeaciones}` | JSON/texto con metadata | Batch histórico | Compatibilidad |
| `apiPlaneacionesGet` | planeaciones | GET | `/api/planeaciones/:id` | `id` | Sí | Planeación | Loguea cuerpo y lanza error genérico | Detalle y descarga activa | Detalle/edición |
| `apiPlaneacionesByTema` | planeaciones | GET | `/api/temas/:id/planeacion`; fallback `/api/planeaciones?tema_id=:id` | `temaId` | Sí | Planeación, array o `null` | Genérico; 404 activa fallback | Detalle | Detalle/edición |
| `apiPlaneacionesUpdate` | planeaciones | PUT | `/api/planeaciones/:id` | `id`, `payload` | Sí | Planeación | Genérico | Detalle | Detalle/edición |
| `apiPlaneacionesExportExcel` | planeaciones | GET | `/api/planeaciones/:id/export/excel` | `id` | Sí | Blob | Genérico | Listener opcional de Detalle | Compatibilidad |

La ruta de export Excel no existe en el router backend auditado. El listener es
opcional y el botón no está presente en el HTML vigente de Detalle. El endpoint
queda clasificado como contrato frontend de compatibilidad con backend ausente,
no como desconocido.

## Wrappers de services

Todos los wrappers HTTP obtienen una sesión con `requireSession()`, retornan
`null` si no hay sesión y delegan el `access_token`; las excepciones se
propagan salvo los fallbacks de generación indicados.

| Wrapper | Delega a | Transformación/retorno | Consumidores | Clasificación |
| --- | --- | --- | --- | --- |
| `generarExamenUnidad` | `apiExamenesGenerate` | `examen`, `item` o payload crudo | Dashboard legacy | Legacy visual |
| `obtenerEstadoGeneracionExamen` | `apiExamenGenerationStatus` | Payload crudo | Dashboard legacy | Legacy visual |
| `obtenerExamenesPorUnidad` | `apiExamenesListByUnidad` | Normaliza a array | Dashboard legacy | Legacy visual |
| `obtenerExamenDetalle` | `apiExamenById` | Normaliza entidad | Features de Biblioteca y Dashboard | Compartida activa |
| `generarListasCotejoUnidad` | `apiListasCoTejoGenerate` | Payload crudo | Dashboard legacy | Legacy visual |
| `obtenerListasCotejoPorUnidad` | `apiListasCoTejoByUnidad` | Normaliza a array | Dashboard legacy | Legacy visual |
| `obtenerListaCoTejoDetalle` | `apiListaCoTejoById` | Normaliza entidad | Features de Biblioteca y Dashboard | Compartida activa |
| `obtenerPlanteles` | `apiPlantelesList` | Normaliza array | Dashboard legacy | Legacy visual |
| `crearPlantel` | `apiPlantelesCreate` | Normaliza entidad | Creación rápida/legacy | Compartida activa |
| `actualizarPlantel` | `apiPlantelesUpdate` | Normaliza entidad | Dashboard legacy | Legacy visual |
| `archivarPlantel` | `apiPlantelesArchive` | Crudo | Dashboard legacy | Legacy visual |
| `eliminarPlantel` | `apiPlantelesDelete` | Crudo | Dashboard y Archivados | Archivados |
| `obtenerGradosPorPlantel` | `apiGradosListByPlantel` | Normaliza array | Dashboard y Archivados | Archivados |
| `crearGrado` | `apiGradosCreate` | Normaliza entidad | Creación rápida/legacy | Compartida activa |
| `actualizarGrado` | `apiGradosUpdate` | Normaliza entidad | Dashboard legacy | Legacy visual |
| `archivarGrado` | `apiGradosArchive` | Crudo | Dashboard legacy | Legacy visual |
| `eliminarGrado` | `apiGradosDelete` | Crudo | Dashboard y Archivados | Archivados |
| `obtenerMateriasPorGrado` | `apiMateriasListByGrado` | Normaliza array | Dashboard y Archivados | Archivados |
| `crearMateria` | `apiMateriasCreate` | Normaliza entidad | Creación rápida/legacy | Compartida activa |
| `archivarMateria` | `apiMateriasArchive` | Crudo | Dashboard legacy | Legacy visual |
| `eliminarMateria` | `apiMateriasDelete` | Crudo | Dashboard y Archivados | Archivados |
| `obtenerUnidadesPorMateria` | `apiUnidadesListByMateria` | Normaliza array | Dashboard y Archivados | Archivados |
| `crearUnidad` | `apiUnidadesCreate` | Normaliza entidad | Creación rápida/legacy | Compartida activa |
| `actualizarUnidad` | `apiUnidadesUpdate` | Normaliza entidad | Dashboard legacy | Legacy visual |
| `archivarUnidad` | `apiUnidadesArchive` | Crudo | Dashboard legacy | Legacy visual |
| `eliminarUnidad` | `apiUnidadesDelete` | Crudo | Dashboard y Archivados | Archivados |
| `obtenerTemasPorUnidad` | `apiTemasListByUnidad` | Normaliza array | Dashboard legacy | Legacy visual |
| `crearTemas` | `apiTemasCreate` | Normaliza array | Ninguno | Sin consumidor |
| `eliminarTema` | `apiTemasDelete` | Crudo | Dashboard legacy | Legacy visual |
| `generarPlaneacionesUnidad` | `apiUnidadGenerar` | Crudo | Ninguno externo | Sin consumidor |
| `generarPlaneacionesUnidadConProgreso` | API stream; fallback API JSON solo en error 5xx | Crudo | Biblioteca y creación rápida | Compartida activa |
| `obtenerPlaneacionTema` | `apiTemaPlaneacion` | Entidad/array/`null` | Dashboard legacy | Legacy visual |
| `obtenerPlaneaciones` | `apiPlaneacionesList` | Crudo | Dashboard Tailwind histórico | Compatibilidad |
| `eliminarPlaneacionApi` | `apiPlaneacionesDelete` | `Response` crudo | Dashboard legacy | Legacy visual |
| `archivarPlaneacionApi` | `apiPlaneacionesArchive` | Crudo | Dashboard/batch histórico | Compatibilidad |
| `restaurarPlaneacionApi` | `apiPlaneacionesRestore` | Crudo | Archivados | Archivados |
| `archivarRutaBatchApi` | `apiPlaneacionesArchiveBatch` | Crudo | Dashboard legacy | Legacy visual |
| `restaurarRutaBatchApi` | `apiPlaneacionesRestoreBatch` | Crudo | Archivados | Archivados |
| `obtenerArchivadosPlaneaciones` | `apiPlaneacionesArchived` | Crudo | Archivados | Archivados |
| `eliminarPlaneacionPermanentementeApi` | `apiPlaneacionesPermanentDelete` | Crudo | Archivados | Archivados |
| `eliminarRutaBatchPermanentementeApi` | `apiPlaneacionesPermanentDeleteBatch` | Crudo | Archivados | Archivados |
| `generarPlaneacionApi` | `apiPlaneacionesGenerate` | Crudo | Ninguno | Sin consumidor |
| `generarPlaneacionApiConProgreso` | API stream; fallback API JSON según mensaje | Crudo | Página histórica | Compatibilidad |
| `obtenerBatchPlaneaciones` | `apiPlaneacionesBatch` | Crudo | Batch histórico | Compatibilidad |
| `obtenerPlaneacionDetalle` | `apiPlaneacionesGet` | Crudo | Detalle y descarga de Biblioteca | Detalle/edición |
| `obtenerPlaneacionPorTema` | `apiPlaneacionesByTema` | Normaliza entidad/array/`null` | Detalle | Detalle/edición |
| `actualizarPlaneacion` | `apiPlaneacionesUpdate` | Crudo | Detalle | Detalle/edición |
| `exportarPlaneacionExcel` | `apiPlaneacionesExportExcel` | Blob | Listener opcional de Detalle | Compatibilidad |

Helpers de sesión/normalización de services:

| Función | Archivo | Responsabilidad | Consumidores | Clasificación |
| --- | --- | --- | --- | --- |
| `withExamSession` | exámenes service | Sesión y token | Cuatro wrappers del archivo | Compartida activa |
| `normalizeExamEntityPayload` | exámenes service | Normaliza entidad | Service de exámenes | Compatibilidad |
| `normalizeExamListPayload` | exámenes service | Normaliza lista | Service de exámenes | Compatibilidad |
| `withListaCoTejoSession` | listas service | Sesión y token | Tres wrappers del archivo | Compartida activa |
| `withSession` | jerarquía service | Sesión y token | Wrappers jerárquicos | Compartida activa |
| `normalizeEntityPayload` | jerarquía service | Normaliza entidad | Service jerárquico | Compatibilidad |
| `normalizeListPayload` | jerarquía service | Normaliza lista | Service jerárquico | Compatibilidad |
| `normalizarPlaneacionTemaPayload` | planeaciones service | Normaliza planeación por tema | `obtenerPlaneacionPorTema` | Detalle/edición |

Las demás funciones de `planeaciones.service.js` no hacen HTTP: mantienen en
`localStorage` el registro de jerarquía archivada. Son
`getArchivedHierarchyRegistryStorage`, `buildEmptyArchivedHierarchyRegistry`,
`normalizeArchivedHierarchyScope`, `buildArchivedHierarchyScopeKey`,
`normalizeArchivedHierarchyText`, `normalizeArchivedHierarchyId`,
`normalizeArchivedHierarchyScopeRecord`,
`isArchivedHierarchyScopeWithinScope`, `pruneArchivedHierarchyRegistry`,
`normalizeArchivedHierarchyRegistry`, `readArchivedHierarchyRegistry`,
`writeArchivedHierarchyRegistry`, `registerArchivedHierarchyScope`,
`restoreArchivedHierarchyScope`,
`restoreArchivedHierarchyScopeByPlaneacionId`,
`restoreArchivedHierarchyScopeByBatchId`,
`isArchivedHierarchyScopeHidden`, `getArchivedHierarchyRegistrySnapshot` y
`restoreArchivedHierarchyBranch`. Su clasificación es Archivados/compatibilidad;
`restoreArchivedHierarchyScope` no tiene consumidor externo confirmado.

Helpers de API sin HTTP propio:

| Archivo | Funciones | Uso | Clasificación |
| --- | --- | --- | --- |
| biblioteca | `bibliotecaGet` | Solo las dos lecturas GET de conjuntos; no está en `window` | Biblioteca activa |
| biblioteca | `bibliotecaDelete` | Solo los cinco deletes de Biblioteca; no está en `window` | Biblioteca activa |
| anexos | `buildAnexosHeaders`, `parseAnexosApiJson`, `createAnexosApiError`, `requestAnexosJson` | Todas las API del dominio | Compartida activa |
| anexos | `anexosGet` | Solo las tres lecturas GET; delega en `requestAnexosJson` y no está en `window` | Compartida activa |
| exámenes | `buildExamJsonHeaders`, `parseExamApiJson`, `createExamApiError`, `requestExamJson` | Todas las API del dominio | Compartida activa |
| listas | `buildListaCoTejoHeaders`, `parseListaCoTejoApiJson`, `createListaCoTejoApiError`, `requestListaCoTejoJson` | Todas las API del dominio | Compartida activa |
| jerarquía | `buildJsonHeaders`, `parseApiJson`, `createApiError`, `requestJson` | Todas las API del dominio | Compatibilidad |
| jerarquía | `debugPlaneacionRequest` | Ninguno | Sin consumidor |
| planeaciones | `parsePlaneacionesJson`, `createPlaneacionesApiError`, `requestPlaneacionesJson` | Subconjunto de API | Compartida activa |

## Fetch directos fuera de `js/api`

| Archivo y función | URL | Auth | Parsing | Consumidores | Clasificación |
| --- | --- | --- | --- | --- | --- |
| `js/pages/dashboard.page.js` — `injectComponent` | `../components/layout.html`, `../components/sidebar.html` | No | `response.ok`, luego `text()` | Bootstrap de Dashboard/Biblioteca | Compartido |
| `js/ui/components.private.js` — `loadPrivateComponent` | navbar/footer privados | No | `response.ok`, luego `text()` | `initPrivateChrome` | Compartido |
| `js/ui/components.public.js` — `loadComponent` | navbar/footer públicos | No | `response.ok`, luego `text()` | Bootstrap público | Compartido |

No se encontró `axios`, `XMLHttpRequest`, ni otro `fetch` Express fuera de
`js/api`. Las operaciones de Auth y Storage de Supabase usan su SDK y se
inventarían por separado, no como aliases de la API Express.

## Autenticación

| Método de sesión | Archivo | Consumidores | Retorno | Error/efecto | Clasificación |
| --- | --- | --- | --- | --- | --- |
| `protegerRuta()` | auth service | `main.js` | `undefined`; publica `currentUser` con sesión | Redirige a login si falta sesión; no lanza | Compartida activa |
| `requireSession()` | auth service | Services, Biblioteca, Detalle y features | Session o `null` | Redirige a login; no lanza ni alerta | Compartida activa |
| `supabase.auth.getSession()` | auth service | Los dos métodos anteriores | `{data:{session}}` | Error SDK no se transforma explícitamente | Compartida activa |
| `supabase.auth.getUser()` | UI privada y Detalle | Navbar y Storage de Detalle | Usuario | Manejo local/log según consumidor | Detalle/edición |
| `withSession` / `withExamSession` / `withListaCoTejoSession` | services | Wrappers respectivos | Resultado callback o `null` | Delegan redirect a `requireSession` | Compatibilidad |
| `session.access_token` directo | Páginas/features/services | Todos los wrappers Express | String Bearer | El consumidor retorna si sesión es `null` | Compartida activa |
| `supabase.auth.onAuthStateChange()` | auth service | Global | Suscripción | En `SIGNED_OUT` muestra toast si existe y redirige | Compartida activa |
| `supabase.auth.signInWithPassword()` | login | Login | Sesión SDK | UI local | Compartida activa |
| `supabase.auth.signOut()` | UI privada y página histórica | Logout | Resultado SDK | UI local | Compatibilidad |

Archivados usa `requireSession()` mediante services. El explorador legacy usa
los mismos wrappers; no existe un segundo token backend.

## Headers

| Patrón | Archivos | Métodos | Diferencias | Consumidores | Riesgo |
| --- | --- | --- | --- | --- | --- |
| Solo `Authorization: Bearer` | Todos los API | GET, PATCH y DELETE sin body | Algunos GET añaden `cache: no-store` | Todos los dominios | Bajo |
| Bearer + `Content-Type: application/json` | Todos los API | POST, PUT, PATCH con body | `apiPlaneacionesBatch` lo añade también en GET | Generación, creación, edición | Bajo/medio |
| Bearer + JSON + `Accept: text/event-stream, application/json` | jerarquía API | POST SSE | Selección explícita de stream | Generación por unidad | Alto |
| Bearer + JSON sin `Accept` | planeaciones API | POST SSE | Depende de `?stream=1` y content-type de respuesta | Generación histórica | Alto |
| Bearer; respuesta blob | planeaciones API | GET descarga | No fija `Accept` | Export opcional de Detalle | Medio |
| Sin headers ni auth | loaders de componentes | GET relativo | HTML/texto, no API Express | Shell público/privado | Bajo |
| Headers internos del SDK | Supabase | Auth y Storage | No los construye el frontend manualmente | Login, navbar, Detalle | Medio |

No existe petición Express sin autenticación. No se fija `Accept` general para
JSON.

## Parsing de respuestas

| Función o familia | Respuesta éxito | Respuesta error | Parsing | Contrato preservable |
| --- | --- | --- | --- | --- |
| Helpers de anexos/exámenes/listas/jerarquía | Objeto, array o `null` | `payload.error`, luego `payload.message`, fallback; conserva `status`/`payload` | `text()` y JSON condicional | Forma exacta y metadata del Error |
| Helper robusto de planeaciones | Objeto, array o `null` | Igual al anterior | `text()` y JSON condicional | Solo en las funciones que ya lo usan |
| Lecturas de Biblioteca mediante `bibliotecaGet` | `response.json()` | En HTTP no exitoso usa `text()`, intenta JSON y prioriza solo `error`; si falla usa HTTP | JSON directo solo en éxito | Excepción nativa de JSON en 2xx y mensaje HTTP actual |
| Delete normal de planeación | `Response` sin consumir | `Error("HTTP <status>")` | No parsea éxito | Retorno `Response` |
| Generate/Get/ByTema/Update de planeación | JSON directo | Mensaje genérico; Get registra cuerpo | Mixto | Errores genéricos actuales |
| Export de planeación | Blob | Mensaje genérico | `blob()` | Blob, aunque la ruta backend no exista |
| Generación por unidad | JSON o eventos SSE | HTTP JSON/texto y evento `error` | `ReadableStream`, `TextDecoder`, líneas SSE | Callback, payload final y fallback |
| Generación de planeación | JSON o SSE | HTTP genérico; eventos parciales | Stream manual | Callback y criterio de fallback |
| Services de exámenes/listas/jerarquía | Entidad/lista normalizada | Repropaga | Selecciona claves conocidas o payload crudo | Normalización actual |
| Componentes HTML | Texto HTML | Error por estado | `text()` | Inserción y mensajes actuales |

Contratos de éxito confirmados: Biblioteca devuelve arrays/objetos; deletes
devuelven `{ok:true}` o un resumen `deleted`; detalle de examen/lista/anexo
devuelve `{examen}`, `{lista}` o `{anexo}`; generación devuelve resúmenes o
jobs; planeaciones activas devuelven objetos/arrays crudos; Archivados devuelve
totales, rutas y planeaciones. Los helpers toleran cuerpo vacío devolviendo
`null`; las funciones con `response.json()` no lo toleran.

## Manejo de errores

| Capa | Transformación | Captura/presentación | Pérdida o silencio |
| --- | --- | --- | --- |
| Helpers robustos de API | `Error` con mensaje backend, `status`, `payload` | Services repropagan | Conserva detalle disponible |
| Biblioteca API | `Error` con `payload.error` o HTTP | Features/Biblioteca muestran alerta o estado y registran consola | Pierde `payload.message`, status estructurado y payload |
| Planeaciones API mixta | Genérico en delete/generate/get/byTema/update/export | Páginas/features capturan | Pierde detalle backend; Get además escribe cuerpo en consola |
| Services | Generalmente no transforman | Consumidor final captura | Session ausente retorna `null` |
| Generación con progreso | Fallback condicionado por 5xx o texto | UI de progreso | SSE malformado se ignora; riesgo de payload final nulo |
| Features de preview/download | Mensaje genérico, alerta/estado o toast | UI del dominio | Algunos downloads dejan el detalle solo en consola |
| Loaders HTML | Error por estado | Shell muestra fallback visual o consola | Cuerpo de error no se conserva |
| Auth | `null` y redirect | Toast solo en `SIGNED_OUT` si AppUI existe | Error de `getSession` no se expone expresamente |

## Duplicados, aliases y contratos distintos

| Endpoint | Funciones frontend | Diferencias | Consumidores | Decisión futura |
| --- | --- | --- | --- | --- |
| `GET /api/temas/:id/planeacion` | `apiTemaPlaneacion`, `apiPlaneacionesByTema` | Helpers, errores y normalización distintos | Legacy y Detalle | Duplicado real; no tocar antes de aislar legacy |
| `GET /api/planeaciones?tema_id=:id` | Fallback de las dos anteriores | El backend listado no filtra `tema_id` | Legacy y Detalle | Duplicado real y fallback riesgoso; conservar por ahora |
| `POST /api/examenes/generate` | API directa y `generarExamenUnidad` | Biblioteca usa job/polling; service conserva normalización legacy | Biblioteca y legacy | Wrapper de compatibilidad |
| `POST /api/listas-cotejo/generate` | API directa y `generarListasCotejoUnidad` | Payload vigente por `planeacion_ids` frente a unidad legacy | Biblioteca y legacy | Contrato distinto |
| `GET /api/examenes/generacion/:jobId` | API directa y wrapper service | Retorno crudo en ambos | Biblioteca y legacy | Wrapper de compatibilidad |
| `GET /api/examenes/:id` | API y `obtenerExamenDetalle` | Service normaliza `{examen}` | Biblioteca y legacy | Wrapper de compatibilidad |
| `GET /api/listas-cotejo/:id` | API y `obtenerListaCoTejoDetalle` | Service normaliza `{lista}` | Biblioteca y legacy | Wrapper de compatibilidad |
| `POST /api/unidades/:id/generar` | `apiUnidadGenerar`, `apiUnidadGenerarConProgreso` | JSON frente a SSE; fallback del service | Biblioteca/legacy | Contrato distinto |
| `POST /api/planeaciones/generate` | API normal y con progreso | JSON frente a SSE | Histórico | Contrato distinto |
| `/api/planeaciones/:id` | Get, PUT, DELETE normal | Mismo path, método y respuesta distintos | Detalle/legacy | No duplicado |
| Deletes de planeación | normal, `/directo`, `/permanent` | Legacy; cascada de Biblioteca; solo archivado | Legacy, Biblioteca, Archivados | Contratos distintos |
| Deletes por batch | Biblioteca `/bloques/:id` y planeaciones `/batch/:id/permanent` | Todos los recursos frente a planeaciones archivadas | Biblioteca/Archivados | Contratos distintos |
| Paths de examen/lista/anexo | Lectura en API de dominio; DELETE en Biblioteca API | Método y propietario distintos | Biblioteca | Mezcla de propiedad, no duplicado |
| `POST /api/examenes/generar` | Alias solo backend | Frontend usa `/generate` | Ninguno frontend | Alias backend de compatibilidad |
| Loaders de fragmentos HTML | Tres funciones | Shell, rutas y fallback visual distintos | Público/privado/dashboard | Duplicado visual; Fase 7 |

## APIs por dominio

### Biblioteca

- Cargar conjuntos: `apiBibliotecaConjuntos`.
- Detalle de conjunto: `apiBibliotecaConjuntoById`.
- Crear bloque: creación jerárquica y
  `generarPlaneacionesUnidadConProgreso`; no existe un único endpoint
  `crear bloque`.
- Refresh: vuelve a `apiBibliotecaConjuntos`; no existe endpoint de refresh.
- Acciones de documentos: detalles mediante API/service de cada dominio;
  deletes mediante `biblioteca.api.js`.
- Eliminar bloque: `apiBibliotecaDeleteBloque`.

### Planeaciones

- Listar: `apiPlaneacionesList` → `obtenerPlaneaciones`, histórico.
- Detalle: `apiPlaneacionesGet` → `obtenerPlaneacionDetalle`, activo.
- Por tema: `apiPlaneacionesByTema` → `obtenerPlaneacionPorTema`, Detalle;
  existe duplicado legacy en jerarquía.
- Generar: normal y SSE; quedan fuera de Fase 3 inicial.
- Actualizar: `apiPlaneacionesUpdate` → `actualizarPlaneacion`.
- Delete normal: `apiPlaneacionesDelete`, legacy.
- Delete directo: `apiDeletePlaneacionDirecta`, Biblioteca.
- Delete permanente: API/service de Archivados.
- Exportar: wrapper de blob con ruta backend ausente.
- Jerarquía relacionada: API/service jerárquicos, compartidos con Archivados.

### Anexos

- Listar por batch y obtener por planeación: API sin consumidor.
- Detalle: API directa usada por preview/descarga.
- Generar y regenerar: API directa desde Biblioteca; quedan fuera de la
  primera consolidación.
- Delete: API de Biblioteca usada por feature de delete.

### Listas de cotejo

- Listar por unidad: service legacy.
- Detalle: service activo para preview/descarga.
- Generar: API directa Biblioteca y wrapper legacy con payloads diferentes.
- Delete: API de Biblioteca usada por feature de delete.

### Exámenes

- Listar por unidad: service legacy.
- Detalle: service compartido para preview/descarga.
- Generar y estado del job: API directa Biblioteca y wrappers legacy.
- Delete: API de Biblioteca usada por feature de delete.

### Archivados

- Listado: `obtenerArchivadosPlaneaciones`.
- Restauración individual/batch: wrappers de planeaciones.
- Eliminación permanente individual/batch: wrappers de planeaciones.
- Hidratación y borrado permanente de ramas: services jerárquicos.
- Registro local de ramas ocultas: funciones no HTTP de
  `planeaciones.service.js`.
- No comparte los deletes de Biblioteca.

### Legacy visual

- CRUD y navegación completa de planteles, grados, materias, unidades y temas.
- Listados/generación/polling de exámenes y listas por unidad.
- Delete normal y archivado de planeaciones/batches.
- Planeación por tema mediante el duplicado de `jerarquia.api.js`.
- La rama `hasBiblioteca` retorna antes de `hydrateExplorerData`; estas APIs
  permanecen por compatibilidad y consumidores indirectos, no por ser parte de
  la Biblioteca vigente.

No existe consumo frontend de endpoints de métricas.

## Globals protegidos

Todos deben conservar firma durante Fase 3; los wrappers temporales se retiran
como máximo en Fase 10 salvo nueva evidencia.

| Global o grupo | Firma | Propietario | Consumidores | Retiro posible | Fase |
| --- | --- | --- | --- | --- | --- |
| `apiBibliotecaConjuntos`, `apiBibliotecaConjuntoById` | `(token)`; `(batchId, token)` | biblioteca API | Biblioteca/Detalle | Tras migrar consumidores | 10 |
| `apiBibliotecaDeleteBloque`, `apiDeletePlaneacionDirecta`, `apiDeleteExamen`, `apiDeleteListaCotejo`, `apiDeleteAnexo` | `(id, token)` | biblioteca API | Features de delete | Tras migrar consumidores | 10 |
| `apiGenerarAnexo`, `apiObtenerAnexosPorBatch`, `apiObtenerAnexoPorPlaneacion`, `apiObtenerAnexoDetalle`, `apiRegenerarAnexo` | IDs y token actuales | anexos API | Biblioteca/features/compatibilidad | Tras auditoría de no consumidores | 10 |
| `apiExamenesGenerate`, `apiExamenesListByUnidad`, `apiExamenGenerationStatus`, `apiExamenById` | Payload/ID y token | exámenes API | Biblioteca/services | No durante generación | 4/10 |
| `apiListasCoTejoGenerate`, `apiListasCoTejoByUnidad`, `apiListaCoTejoById` | Payload/ID y token | listas API | Biblioteca/services | Tras migrar consumidores | 4/10 |
| `apiPlantelesList`, `apiPlantelesCreate`, `apiPlantelesUpdate`, `apiPlantelesArchive`, `apiPlantelesDelete` | `([id,][payload,]token)` según operación | jerarquía API | Service, legacy y Archivados | Solo tras Fases 8–9 | 8–10 |
| `apiGradosListByPlantel`, `apiGradosCreate`, `apiGradosUpdate`, `apiGradosArchive`, `apiGradosDelete` | `([parentId|id,][payload,]token)` | jerarquía API | Service, legacy y Archivados | Solo tras Fases 8–9 | 8–10 |
| `apiMateriasListByGrado`, `apiMateriasCreate`, `apiMateriasArchive`, `apiMateriasDelete` | `([parentId|id,][payload,]token)` | jerarquía API | Service, legacy y Archivados | Solo tras Fases 8–9 | 8–10 |
| `apiUnidadesListByMateria`, `apiUnidadesCreate`, `apiUnidadesUpdate`, `apiUnidadesArchive`, `apiUnidadesDelete` | `([parentId|id,][payload,]token)` | jerarquía API | Service, legacy y Archivados | Solo tras Fases 8–9 | 8–10 |
| `apiTemasListByUnidad`, `apiTemasCreate`, `apiTemasDelete` | `([parentId|id|payload],token)` | jerarquía API | Service y legacy | Solo tras Fases 8–9 | 8–10 |
| `apiUnidadGenerar`, `apiUnidadGenerarConProgreso` | `(unidadId,payload,token[,onEvent])` | jerarquía API | Biblioteca/service | No durante generación | 4/10 |
| `apiTemaPlaneacion` | `(temaId, token)` | jerarquía API | Service legacy | Tras aislar legacy | 8–10 |
| `apiPlaneacionesList`, `apiPlaneacionesGet`, `apiPlaneacionesByTema`, `apiPlaneacionesUpdate`, `apiPlaneacionesBatch`, `apiPlaneacionesExportExcel` | Firmas exactas del inventario HTTP | planeaciones API | Services de activo/Detalle/histórico | Según flujo | 3–10 |
| `apiPlaneacionesDelete`, `apiPlaneacionesArchive`, `apiPlaneacionesArchiveBatch` | ID/batch y token | planeaciones API | Service legacy/histórico | Tras aislar legacy | 8–10 |
| `apiPlaneacionesRestore`, `apiPlaneacionesRestoreBatch`, `apiPlaneacionesArchived`, `apiPlaneacionesPermanentDelete`, `apiPlaneacionesPermanentDeleteBatch` | ID/batch y token | planeaciones API | Service de Archivados | No mientras Archivados las use | 10 |
| `apiPlaneacionesGenerate`, `apiPlaneacionesGenerateWithProgress` | `(payload,token[,onEvent])` | planeaciones API | Service histórico | No durante generación | 4/10 |
| `protegerRuta`, `requireSession` | `()` | auth service | Todo flujo privado | No antes de consolidar auth | 3/10 |
| `generarExamenUnidad`, `obtenerEstadoGeneracionExamen`, `obtenerExamenesPorUnidad`, `obtenerExamenDetalle` | Firmas actuales | exámenes service | Biblioteca/legacy | Tras migrar consumidores | 4/8/10 |
| `generarListasCotejoUnidad`, `obtenerListasCotejoPorUnidad`, `obtenerListaCoTejoDetalle` | Payload/ID actuales | listas service | Biblioteca/legacy | Tras migrar consumidores | 4/8/10 |
| `obtenerPlanteles`, `crearPlantel`, `actualizarPlantel`, `archivarPlantel`, `eliminarPlantel`; wrappers equivalentes de grados, materias, unidades y temas | Firmas exactas del inventario de wrappers | jerarquía service | Biblioteca/legacy/Archivados | Solo tras separar flujos | 7–10 |
| `generarPlaneacionesUnidad`, `generarPlaneacionesUnidadConProgreso`, `obtenerPlaneacionTema` | Payload/ID y callback actuales | jerarquía service | Biblioteca/legacy | Según generación/legacy | 4/8/10 |
| `obtenerPlaneaciones`, `eliminarPlaneacionApi`, `archivarPlaneacionApi`, `restaurarPlaneacionApi`, `archivarRutaBatchApi`, `restaurarRutaBatchApi`, `obtenerArchivadosPlaneaciones`, `eliminarPlaneacionPermanentementeApi`, `eliminarRutaBatchPermanentementeApi` | Firmas exactas del inventario de wrappers | planeaciones service | Legacy/Archivados | Solo por flujo | 8–10 |
| `generarPlaneacionApi`, `generarPlaneacionApiConProgreso`, `obtenerBatchPlaneaciones`, `obtenerPlaneacionDetalle`, `obtenerPlaneacionPorTema`, `actualizarPlaneacion`, `exportarPlaneacionExcel` | Firmas exactas del inventario de wrappers | planeaciones service | Detalle/histórico | Según flujo | 3–10 |
| `registerArchivedHierarchyScope`, `restoreArchivedHierarchyScope`, `restoreArchivedHierarchyScopeByPlaneacionId`, `restoreArchivedHierarchyScopeByBatchId`, `isArchivedHierarchyScopeHidden`, `getArchivedHierarchyRegistrySnapshot`, `restoreArchivedHierarchyBranch` | Firmas actuales | planeaciones service | Dashboard/Archivados | No mientras Archivados las use | 10 |
| `API_BASE_URL`, `supabase`, `currentUser`, `escapeHtml` | Valores/función actuales | core/auth | Compartidos | No en 3.1 | 10 |

Los helpers internos también son globals implícitas por el uso de scripts
clásicos. No se deben renombrar ni introducir colisiones antes de modularizar
la carga.

## Relación API/services

| Dominio | API file | Service file | Dirección real | Consumidores | Problema |
| --- | --- | --- | --- | --- | --- |
| Auth | — | auth | SDK → service | Todos | Sesión global y redirect acoplados |
| Biblioteca | biblioteca | — | Página/features → API | Biblioteca/Detalle | HTTP y deletes de cuatro dominios mezclados |
| Anexos | anexos | — | Página/features → API | Biblioteca | No existe service; dos lecturas sin consumidor |
| Exámenes | exámenes | exámenes | Service → API; Biblioteca también → API | Activo/legacy | Dos niveles de consumo y normalización |
| Listas | listas | listas | Service → API; Biblioteca también → API | Activo/legacy | Payloads de generación distintos |
| Jerarquía | jerarquía | jerarquía | Service → API | Activo/legacy/Archivados | API legacy y técnica inseparadas |
| Planeaciones | planeaciones | planeaciones | Service → API | Activo/legacy/Archivados | Service mezcla HTTP y registro local |

No se encontró ningún API file que delegue a un service. Los services de
exámenes, listas, jerarquía y planeaciones delegan a API; Biblioteca y anexos
son consumidos directamente. Ambos niveles no hacen HTTP para un mismo wrapper,
pero existen consumidores directos y consumidores mediante service.

## Matriz de candidatos de Fase 3

| Candidato | Funciones | Archivos | Consumidores | Riesgo | Sesión sugerida | Decisión |
| --- | --- | --- | --- | --- | --- | --- |
| Lecturas de Biblioteca | conjuntos y conjunto por ID | biblioteca API, Biblioteca, Detalle | Conocidos | Bajo | 3.1 completada y validada manualmente | Sesión de Fase 3 completada |
| Deletes de Biblioteca | bloque, planeación directa, examen, lista, anexo | biblioteca API y features | Conocidos | Bajo/medio | 3.2 completada y validada manualmente | Sesión de Fase 3 completada |
| Planeaciones | listado, detalle, tema, update, archivo | API/service | Activo/legacy/Archivados | Medio/alto | Separar por flujo en Fases 4, 7, 8 y 10 | Fase posterior |
| Anexos | tres lecturas GET | anexos API | Detalle activo; dos sin consumidor | Bajo | 3.4 completada y validada manualmente | Sesión de Fase 3 completada |
| Anexos | generación y regeneración | anexos API/Biblioteca | Generación activa; regeneración compatible | Alto | Separar pending y generación | Fase 4 |
| Listas | dos lecturas GET | API/service | Detalle activo; listado legacy | Bajo | 3.6 completada y validada manualmente | Sesión de Fase 3 completada |
| Exámenes | listado por unidad y detalle | API/service | Detalle activo; listado legacy | Bajo | 3.8 completada y validada manualmente | Sesión de Fase 3 completada |
| Autenticación y headers | sesión y builders | core/services/API | Global | Alto | No universalizar contratos incompatibles | Conservar; reevaluar en Fase 10 |
| Parsing común de errores | seis familias | Todos los API | Global | Alto | No universalizar prematuramente | Conservar |
| Fetch directos de páginas | tres loaders HTML | páginas/UI | Shell | Medio | Desacople de dashboard | Fase 7 |
| Archivados | listar/restaurar/permanente | planeaciones/jerarquía services | Archivados | Alto | Aislamiento propio | Fase 8 |
| Legacy | CRUD y lecturas por unidad | jerarquía y services | Explorador | Alto | Aislamiento legacy | Legacy |
| SSE y polling | generación de unidad, planeación y examen | API/pages/services | Activo/legacy | Alto | Separación de procesos largos | Fase 4 |

## Sesión 3.1 completada en código

**Sesión 3.1 — Consolidación de lecturas de Biblioteca.**

Alcance ejecutado: `apiBibliotecaConjuntos(accessToken)` y
`apiBibliotecaConjuntoById(batchId, accessToken)` delegan exclusivamente en
`bibliotecaGet(path, accessToken)` dentro de `js/api/biblioteca.api.js`. El
helper es una constante léxica del script clásico y no se publica en `window`.
Se extrajo únicamente la repetición local de URL base, GET implícito, Bearer,
`cache: "no-store"` y parsing, preservando:

- ambas firmas y globals;
- array frente a objeto;
- `response.json()` en éxito;
- `response.text()` y `JSON.parse` tolerante solo en HTTP de error;
- prioridad de `payload.error` y fallback `HTTP <status>`;
- rechazo por JSON inválido en una respuesta HTTP 2xx;
- sesión obtenida por los consumidores;
- `API_BASE_URL` y orden de scripts.

Consumidores: carga de Biblioteca y metadata de Detalle. Exclusiones:
deletes, generación, polling, SSE, autenticación general, Archivados, API
jerárquica, legacy y backend. Riesgo bajo. El smoke previo y posterior pasó
para éxito array/objeto, URL, GET, Bearer, cache, error JSON, fallback, error no
JSON, JSON inválido en éxito, una llamada por invocación, globals y aislamiento
del helper. `node --check` y la suite Jest pasaron. La validación manual fue
aprobada por el usuario: carga inicial, cambio entre bloques, tabs, recarga,
apertura de planeación, metadata, título/unidad, navegación de vuelta,
previews, descargas y deletes quedaron correctos, con cero peticiones
duplicadas inesperadas y cero errores relacionados.

## Sesión 3.2 completada y validada

**Sesión 3.2 — Consolidación interna de deletes de Biblioteca.**

Alcance ejecutado: `apiBibliotecaDeleteBloque(batchId, accessToken)`,
`apiDeletePlaneacionDirecta(id, accessToken)`, `apiDeleteExamen(id,
accessToken)`, `apiDeleteListaCotejo(id, accessToken)` y
`apiDeleteAnexo(id, accessToken)` delegan exclusivamente la mecánica DELETE
equivalente en `bibliotecaDelete(path, accessToken)`. El helper es una constante
léxica privada de `js/api/biblioteca.api.js`, no está en `window`, no obtiene
sesión y no admite otros métodos.

Cada wrapper sigue construyendo su path y conserva `encodeURIComponent`, firma,
global, promesa y consumidor. El helper preserva `API_BASE_URL`, método
`DELETE`, único header `Authorization: Bearer <token>`, ausencia de body y
cache, `response.json()` en éxito, lectura de texto en error, prioridad
exclusiva de `payload.error`, fallback `HTTP <status>` y `Error` estándar. Los
cuatro deletes individuales conservan `{ok:true}` y el delete de bloque devuelve
sin transformar `{ok:true, deleted:{batch:boolean}}`, incluido
`deleted.batch:false`.

Consumidores confirmados: `BibliotecaBlockDelete`, `PlaneacionDelete`,
`ExamDelete`, `ListaCotejoDelete` y `AnexoDelete`, uno por global y sin
consumidores desconocidos. El smoke previo y posterior pasó con 32 peticiones
simuladas en cada ejecución; cubrió éxito, URL codificada, Bearer, ausencia de
body/cache, una petición por invocación, errores JSON, payload sin `error`,
cuerpo no JSON, JSON inválido, ambos valores de `deleted.batch`, globals y
aislamiento. `node --check` y Jest pasaron. La validación manual 3.2 fue
aprobada por el usuario: cinco cancelaciones sin DELETE, cinco eliminaciones
reales, persistencia verificada en base de datos, logs backend de éxito y cero
errores relacionados.

`bibliotecaGet` quedó intacto. También quedaron fuera consumidores,
autenticación, otros API files, generación, polling, SSE, estado, render,
backend, Archivados y legacy.

## Sesión 3.3 completada

**Sesión 3.3 — Auditoría puntual de APIs de anexos.**

La auditoría confirmó cinco funciones en `anexos.api.js`, cuatro helpers
internos ya compartidos y `apiDeleteAnexo` en `biblioteca.api.js`. No existe
`js/services/anexos.service.js`. Las lecturas por batch y por planeación no
tienen consumidor; el detalle es compartido por preview y descarga. Las tres
lecturas conservan GET, Bearer sin `Content-Type`, `cache:"no-store"`, parsing
tolerante y errores con `status/payload`, aunque retornan contenedores y
fallbacks distintos.

Generación tiene un consumidor activo desde el modal de Biblioteca y usa
`anexosGenerating`; regeneración conserva una rama sin emisor DOM. Ambas quedan
en Fase 4. El delete ya fue consolidado y validado en 3.2, por lo que no se
mueve. No existen consumidores desconocidos, de Archivados o legacy.

La sesión seleccionada fue
**Sesión 3.4 — Consolidación interna de lecturas de anexos.** Incluyó
exclusivamente `apiObtenerAnexosPorBatch`,
`apiObtenerAnexoPorPlaneacion` y `apiObtenerAnexoDetalle`, mediante un helper
GET privado y específico que preserve paths, encoding, fallbacks, contenedores,
parsing, metadata y globals. Su implementación se registra a continuación.

## Sesión 3.4 completada y validada

**Sesión 3.4 — Consolidación interna de lecturas de anexos.**

Las tres funciones públicas conservan firmas, globals, `encodeURIComponent`,
paths y fallbacks propios. Ahora delegan únicamente la construcción de la URL
base y las opciones repetidas de GET implícito, Bearer sin `Content-Type`,
ausencia de body y `cache:"no-store"` al helper léxico privado
`anexosGet(path, accessToken, fallbackMessage)`.

`anexosGet` no se publica en `window`, no obtiene sesión, no acepta opciones
universales y delega sin transformar el resultado en `requestAnexosJson`. Este
último, junto con `buildAnexosHeaders`, `parseAnexosApiJson` y
`createAnexosApiError`, quedó literalmente intacto. También permanecieron sin
cambios generación, regeneración, el delete alojado en Biblioteca, preview,
descarga, consumidores, autenticación, HTML, backend, Archivados y legacy.

| Función | Consumidores | Retorno preservado | Fallback preservado |
| --- | --- | --- | --- |
| `apiObtenerAnexosPorBatch(batchId, accessToken)` | Sin consumidor confirmado | `{anexos}` o `null` según parsing | `No se pudieron obtener los anexos del bloque` |
| `apiObtenerAnexoPorPlaneacion(planeacionId, accessToken)` | Sin consumidor confirmado | `{anexo}` o `null` según parsing | `No se pudo obtener el anexo de la planeacion` |
| `apiObtenerAnexoDetalle(anexoId, accessToken)` | `AnexoPreview` y `AnexoDownload` | `{anexo}` o `null` según parsing | `No se pudo obtener el anexo` |

Los smokes previo y posterior aprobaron 21 peticiones y 113/114 aserciones,
respectivamente. Cubrieron URLs y encoding, opciones HTTP, una petición por
llamada, contenedores, prioridad `error` → `message` → fallback, metadata
`status/payload`, cuerpo vacío y JSON inválido exitoso convertido en `null`,
HTTP no JSON, globals y aislamiento del helper. `node --check` y Jest también
pasaron. La validación manual fue aprobada por el usuario: preview, metadata,
contenido, cierre y reapertura, descarga desde card, modal de nombre, archivo
descargado, descarga desde preview y reutilización del objeto quedaron
correctos, sin GET duplicados inesperados ni errores de `anexosGet`.

## Sesión 3.5 completada

**Sesión 3.5 — Auditoría puntual de APIs de listas de cotejo.**

La auditoría confirmó tres APIs en `listas_cotejo.api.js`, tres wrappers en
`listas_cotejo.service.js` y `apiDeleteListaCotejo` en
`biblioteca.api.js`. Los cuatro helpers del API ya concentran headers JSON,
parsing tolerante, errores con metadata y ejecución HTTP. El service agrega
sesión y normaliza retornos; devuelve `null` si no existe sesión.

| Función | Flujo | Consumidor | Retorno público |
| --- | --- | --- | --- |
| `apiListasCoTejoGenerate` | Generación activa y compatibilidad legacy | Biblioteca directa; service desde Dashboard legacy | Payload backend sin transformar |
| `apiListasCoTejoByUnidad` | Listado legacy | `obtenerListasCotejoPorUnidad` → explorador | `{listas}` |
| `apiListaCoTejoById` | Detalle activo | `obtenerListaCoTejoDetalle` → preview/descarga | `{lista}` |
| `apiDeleteListaCotejo` | Delete activo de Biblioteca | `ListaCotejoDelete` | `{ok:true}` |
| `generarListasCotejoUnidad` | Compatibilidad de generación | Dashboard legacy | Payload API o `null` sin sesión |
| `obtenerListasCotejoPorUnidad` | Normalización legacy | `ensureListasCotejo` | Array, `[]` o `null` sin sesión |
| `obtenerListaCoTejoDetalle` | Normalización compartida activa | Features de preview/descarga | Entidad, payload compatible o `null` |

Las dos lecturas API comparten GET implícito, Bearer sin `Content-Type`,
ausencia de body, `cache:"no-store"`, parsing, prioridad de errores y metadata.
Solo difieren en path, fallback y contenedor. El service conserva diferencias
necesarias: el listado normaliza a array y el detalle extrae `lista`.

Generación queda fuera de Fase 3. Biblioteca envía `planeacion_ids`; el
Dashboard legacy envía `planeacion_ids` y `unidad_id`, por lo que también activa
la rama backend por IDs. La rama backend exclusivamente por `unidad_id`
permanece disponible, pero no tiene emisor frontend confirmado. La generación
es secuencial por planeación, crea métricas y usa
`v2_lista_cotejo_actividades_momentos`.

El preview de Biblioteca solicita un detalle por apertura y la descarga desde
card solicita otro detalle por acción. La descarga desde el preview reutiliza
`explorerState.listaCotejoPreview.listaData` y no hace otro GET. El explorador
legacy abre el preview desde el array ya cargado por unidad.

`apiDeleteListaCotejo` sigue consolidado en Biblioteca desde 3.2; no se mueve ni
duplica. No hay funciones o consumidores desconocidos.

## Sesión 3.6 completada en código

**Sesión 3.6 — Consolidación interna de lecturas de listas de cotejo.**

`apiListasCoTejoByUnidad(unidadId, accessToken)` y
`apiListaCoTejoById(id, accessToken)` conservan firmas, globals, paths,
`encodeURIComponent`, contenedores y fallbacks. Ambas delegan únicamente la URL
base y las opciones repetidas —GET implícito, Bearer sin `Content-Type`,
ausencia de body y `cache:"no-store"`— al helper léxico privado
`listasCotejoGet(path, accessToken, fallbackMessage)`.

El helper no se publica en `window`, no obtiene sesión, no acepta opciones
universales y delega sin transformar el payload en `requestListaCoTejoJson`.
Este ejecutor, los otros tres helpers existentes, `apiListasCoTejoGenerate`, los
services, el delete alojado en Biblioteca, consumidores, preview, descarga,
autenticación, backend, Archivados y legacy quedaron intactos.

| Función | Consumidores | Retorno API preservado | Fallback preservado |
| --- | --- | --- | --- |
| `apiListasCoTejoByUnidad(unidadId, accessToken)` | `obtenerListasCotejoPorUnidad` → `ensureListasCotejo` → explorador legacy | `{listas}` o `null` según parsing | `No se pudieron obtener las listas de cotejo` |
| `apiListaCoTejoById(id, accessToken)` | `obtenerListaCoTejoDetalle` → preview/descarga | `{lista}` o `null` según parsing | `No se pudo obtener la lista de cotejo` |

Los smokes previo y posterior aprobaron 14 peticiones simuladas y 48/50
aserciones, respectivamente. Cubrieron URLs y encoding, opciones HTTP, una
petición por llamada, contenedores, prioridad `error` → `message` → fallback,
metadata `status/payload`, cuerpo vacío y JSON inválido exitoso convertido en
`null`, HTTP no JSON, globals y aislamiento del helper. `node --check` y Jest
también pasaron. La validación manual 3.6 fue aprobada por el usuario: preview,
cierre/reapertura, ambas descargas, reutilización del objeto, Biblioteca, tabs,
cinco deletes, persistencia/base de datos y `deletedBatch:true` quedaron
confirmados sin errores relacionados con `listasCotejoGet`.

## Sesión 3.7 completada

**Sesión 3.7 — Auditoría puntual de APIs de exámenes.**

La auditoría confirmó cuatro APIs explícitas en `examenes.api.js`, cuatro
wrappers en `examenes.service.js`, cuatro helpers HTTP top-level y
`apiDeleteExamen` en `biblioteca.api.js`. No hay funciones ni consumidores
desconocidos.

| Función | Flujo | Consumidor | Retorno público |
| --- | --- | --- | --- |
| `apiExamenesGenerate` | Generación vigente/legacy | Biblioteca directa; service desde Dashboard | `{ok, job_id, status}` |
| `apiExamenGenerationStatus` | Polling vigente/legacy | Biblioteca directa; service desde Dashboard | Estado completo del job |
| `apiExamenesListByUnidad` | Listado legacy | `obtenerExamenesPorUnidad` → `ensureExamenes` | `{examenes}` |
| `apiExamenById` | Detalle activo/compartido | `obtenerExamenDetalle` → preview, descarga y post-generación | `{examen}` |
| `apiDeleteExamen` | Delete activo | `ExamDelete.deleteFromBiblioteca` | `{ok:true}` |

Las tres operaciones GET de `examenes.api.js` comparten Bearer,
`cache:"no-store"`, ausencia de `Content-Type`/body/`Accept`, parsing tolerante
y errores con `status/payload`. El status del job no es una lectura de recurso
intercambiable: forma parte del polling y queda en Fase 4. Solo listado por
unidad y detalle pueden compartir un helper GET privado en Fase 3, conservando
paths, fallbacks, contenedores y normalizaciones service.

Biblioteca genera directamente con `unidad_id`, `batch_id`,
`tipos_pregunta`, `cantidades_pregunta` y `planeacion_ids`, y consulta el job
cada 3 segundos con máximo de 60 polls. El Dashboard legacy genera mediante el
service con `unidad_id`, tipos/cantidades y `tema_ids`, y consulta primero a
1.5 segundos y después cada 4 segundos, sin timeout frontend. Cerrar los
modales no cancela el job ni el polling. Generación, worker, estados, retries,
deduplicación, prompts, métricas y polling pertenecen a Fase 4.

Preview y descarga comparten `explorerState.examenDetalleById`. Biblioteca hace
una lectura por apertura de preview; descarga desde preview reutiliza el objeto.
La descarga directa hace una lectura solo si el detalle no está ya en caché.
El explorador legacy conserva listado por unidad y preview/descarga mediante
wrappers. El delete permanece consolidado en Biblioteca desde 3.2.

Próxima sesión única, sin implementar:
**Sesión 3.8 — Consolidación interna de lecturas de exámenes.** Incluirá
exclusivamente `apiExamenesListByUnidad(unidadId, accessToken)` y
`apiExamenById(id, accessToken)` en `examenes.api.js`. Excluirá generación,
`apiExamenGenerationStatus`, polling, services, consumidores, preview,
descarga, delete, autenticación, backend, Archivados y legacy.

## Sesión 3.8 completada y validada

**Sesión 3.8 — Consolidación interna de lecturas de exámenes.**

`apiExamenesListByUnidad(unidadId, accessToken)` y
`apiExamenById(id, accessToken)` conservan firmas, globals, paths,
`encodeURIComponent`, contenedores y fallbacks. Ambas delegan únicamente la URL
base y las opciones repetidas —GET implícito, Bearer sin `Content-Type` ni
`Accept`, ausencia de body y `cache:"no-store"`— al helper léxico privado
`examResourceGet(path, accessToken, fallbackMessage)`.

El helper no se publica en `window`, no obtiene sesión, no acepta opciones
universales y delega sin transformar el payload en `requestExamJson`.
`requestExamJson`, `buildExamJsonHeaders`, `parseExamApiJson`,
`createExamApiError`, `apiExamenesGenerate` y `apiExamenGenerationStatus`
quedaron literalmente intactos.

| Función | Consumidores | Retorno API preservado | Fallback preservado |
| --- | --- | --- | --- |
| `apiExamenesListByUnidad(unidadId, accessToken)` | `obtenerExamenesPorUnidad` → `ensureExamenes` → explorador legacy | `{examenes}` o `null` según parsing | `No se pudieron obtener los examenes de la unidad` |
| `apiExamenById(id, accessToken)` | `obtenerExamenDetalle` → preview, descarga y post-generación legacy | `{examen}` o `null` según parsing | `No se pudo obtener el examen` |

El smoke previo aprobó 55 aserciones y 14 peticiones simuladas; el posterior
aprobó 57 aserciones y las mismas 14 peticiones. Se cubrieron URLs y encoding,
GET implícito, Bearer único, ausencia de `Content-Type`, `Accept` y body,
`no-store`, una petición por llamada, contenedores, prioridad
`error` → `message` → fallback, metadata `status/payload`, cuerpo vacío y JSON
inválido exitoso convertido en `null`, HTTP no JSON, globals y aislamiento del
helper. `node --check` y Jest pasaron.

Services, generación, polling, delete, features, páginas, autenticación, HTML,
backend, Archivados y legacy permanecen sin cambios. La validación manual 3.8
fue aprobada: preview, reapertura, contenido y tipos de reactivo, descarga desde
card, descarga desde preview con reutilización, Biblioteca/tabs y ausencia de
GET duplicados o errores de `examResourceGet`.

La regresión adicional de generación confirmó que la consolidación de lecturas
no alteró generación de anexos/listas/exámenes, payload protegido, selección de
planeaciones y temas, polling, deduplicación, reintentos, fallbacks, guardado o
métricas. Esta evidencia es regresión de 3.8, no inicio de Fase 4.

## Sesión 3.9 — Auditoría de cierre

### Helpers finales de Fase 3

| Helper | Archivo | Alcance | Global | Estado |
| --- | --- | --- | --- | --- |
| `bibliotecaGet` | `js/api/biblioteca.api.js` | GET de conjuntos | No | Activo |
| `bibliotecaDelete` | `js/api/biblioteca.api.js` | Cinco deletes vigentes | No | Activo |
| `anexosGet` | `js/api/anexos.api.js` | Tres lecturas de anexos | No | Activo |
| `listasCotejoGet` | `js/api/listas_cotejo.api.js` | Dos lecturas de listas | No | Activo |
| `examResourceGet` | `js/api/examenes.api.js` | Dos lecturas de recursos de examen | No | Activo |

Todos son bindings léxicos, específicos de archivo y dominio. Ninguno obtiene
sesión, transforma el payload público, cruza dominios o constituye un cliente
HTTP universal.

### Globals y wrappers conservados

| Grupo | Propietario | Consumidores | Estado | Fase futura |
| --- | --- | --- | --- | --- |
| APIs de Biblioteca, anexos, listas y exámenes | `js/api/*` | Páginas, features y services | Firmas/globals conservadas | 10 |
| APIs de planeaciones y jerarquía | `js/api/*` | Detalle, generación, Archivados y legacy | Conservadas | 4/7/8/10 |
| Wrappers service | `js/services/*` | Biblioteca compartida, Dashboard y Archivados | Conservados | 7/8/10 |
| Wrappers `bib*` y namespaces feature | Biblioteca/features | Handlers de cards y modales | Conservados | 6/7/10 |
| Generación, polling y SSE | API/services/páginas | Flujos vigentes y legacy | Intactos | 4 |
| Globals de Archivados | Planeaciones service/Archivados | Flujo separado | Intactas | 8/10 |

El orden de scripts continúa cargando configuración antes de API, API antes de
sus services/features y páginas antes de `main.js`.

### Duplicación restante y fase futura

| Duplicación restante | Motivo de conservar | Fase futura |
| --- | --- | --- |
| Generación, polling y SSE por dominio | Procesos, estados y errores no equivalentes | 4 |
| Sesión y pending dispersos | Estado y redirects observables | 5 |
| Render, eventos y wrappers `bib*` | Contratos DOM y listeners | 6 |
| Dependencias activas de Dashboard y loaders HTML | Shell y compatibilidad | 7 |
| Jerarquía técnica y Archivados | Consumidores indirectos y flujo separado | 8 |
| Código legacy visual | Requiere aislamiento previo | 8–9 |
| Globals, aliases y service wrappers | Compatibilidad activa | 10 |
| Headers/parsers entre dominios | JSON inválido, errores, SSE, blobs y crudos incompatibles | Conservar; reevaluar en 10 |

### Candidatos restantes

| Candidato | Estado | Motivo | Decisión |
| --- | --- | --- | --- |
| APIs de planeaciones | Mezcla detalle, edición, generación, SSE y Archivados | No es una extracción pequeña equivalente | Fases 4/7/8/10 |
| APIs de jerarquía | Mezcla CRUD técnico, generación, legacy y Archivados | Consumidores indirectos activos | Fases 4/8/10 |
| Autenticación común | Redirects y `null` observables | Contrato transversal de mayor riesgo | Conservar |
| Headers comunes | Diferencias por JSON, GET, SSE, blob y crudos | Universalizar cambiaría contratos | No realizar |
| Parsing común de errores | Familias incompatibles | Preservar comportamiento por dominio | No realizar |
| Helper HTTP universal | Sin equivalencia global | Generalización prematura | No realizar |
| Mover deletes a sus dominios | Propiedad validada en Biblioteca API | Movimiento sin beneficio funcional | Fase 10 |
| Eliminar APIs sin consumidor | Globals protegidas y compatibilidad | Requiere retiro separado | Fase 10 |
| Retirar service wrappers | Consumidores vigentes/legacy | Requiere migración previa | Fase 10 |

No quedan funciones ni consumidores desconocidos y no existe una extracción
pequeña imprescindible pendiente dentro de Fase 3.

### Cierre

**Decisión: A. Cerrar Fase 3.**

Fase cerrada: `3 — Capa API frontend`. Sesiones 3.0–3.9 completadas y
validación manual acumulativa aprobada. La Fase 4 permanece pendiente y no fue
iniciada; debe comenzar en una nueva conversación.

## Sesión 4.0 — Auditoría documental de apertura

### Identidad y alcance documental

El roadmap define la fase `4 — Generación y polling`, con el objetivo de separar
por dominio el inicio, feedback, progreso, polling, finalización, error y
limpieza de procesos largos. La identidad formal aprobada para esta auditoría es
**Sesión 4.0 — Auditoría documental de apertura**.

Riesgo de esta auditoría: **medio documental**. Riesgo funcional si se excede
el alcance: **alto**. La confirmación explícita del usuario quedó recibida al
abrir el primer corte funcional; la Fase 4 está **En progreso**. La auditoría no
modificó código funcional.

El roadmap respalda el orden conservador
`anexos → listas de cotejo → planeaciones → exámenes`, un recurso por sesión.
La numeración formal aprobada identifica los cortes como Sesión 4.1 para anexos,
Sesión 4.2 para listas, Sesión 4.3 para planeaciones y Sesión 4.4 para la
auditoría específica y extracción literal de generación y polling de exámenes
desde Biblioteca.

Convención del inventario: **No aplica** significa que el mecanismo no forma
parte del flujo; **No confirmado** significa que la búsqueda global no aportó
evidencia suficiente. Ningún `No confirmado` se interpreta como código legacy
o eliminable.

### Clasificación de superficies y consumidores

| Clasificación | Componentes | Evidencia de ejecución o consumo |
| --- | --- | --- |
| Biblioteca vigente | `pages/dashboard.html`, `biblioteca.page.js`, sus modales, tabs, pending maps y delegación `data-bib-action` | `initDashboardPage()` detecta `window.initBiblioteca`, activa `BIBLIOTECA_MODE`, llama `initBiblioteca()` y retorna antes de hidratar el explorador |
| Dashboard vigente | Shell inyectado, `bindDashboardEvents()`, creación rápida y helpers compartidos en `dashboard.page.js` | Los eventos se enlazan antes del retorno a Biblioteca; `#btn-hero-quick-create` y `data-bib-action="crear-planeaciones"` abren el panel |
| Detalle vigente | `pages/detalle.html`, `detalle.page.js` y edición/descarga | No inicia generación; consume planeaciones ya persistidas |
| Archivados | `pages/archivados.html`, `archivados.page.js` y registro local de jerarquía archivada | Flujo separado; no inicia los cuatro procesos de generación auditados |
| Jerarquía técnica activa | API/service de plantel, grado, materia, unidad y tema | Creación rápida crea o reutiliza IDs técnicos antes de generar planeaciones |
| Compatibilidad | `window.biblioteca`, `window.explorerState`, globals API/service, `window.PlaneacionGeneration`, wrappers `bibGenerarAnexo`/`bibRegenerarAnexo`, aliases de `AppUI` | Tienen consumidores activos o ramas de handler conservadas; no se declaran eliminables |
| Legacy visual confirmado | Render jerárquico y coordinadores por unidad de listas/exámenes en `dashboard.page.js` | El código y sus listeners se cargan, pero el render visual no se alcanza porque la inicialización vigente retorna tras `initBiblioteca()` |
| No clasificado | Generación individual en `planeacion.page.js` | Tiene definición y mapeo en `main.js`, pero `pages/planeacion.html` redirige inmediatamente a Dashboard y no carga ese script; no hay entry point ejecutable confirmado |

`pages/batch.html` también redirige a Dashboard. Los handlers inline hallados en
UI histórica no inician ninguno de los flujos vigentes de esta auditoría.

### Inventario de planeaciones

#### Agregar temas a un bloque vigente

| Campo | Evidencia actual |
| --- | --- |
| Acción, página y DOM | En Biblioteca, botón dinámico `data-bib-action="agregar-planeacion"`; modal con `#bib-agr-submit` |
| Handler y coordinador | Delegación `onBibliotecaClick()` → `openBibliotecaAgregarModal()`; listener directo → `submitBibliotecaAgregarModal()` → `PlaneacionGeneration.generateFromBiblioteca()` |
| Service y helper API | `generarPlaneacionesUnidadConProgreso()` → `apiUnidadGenerarConProgreso()`; fallback 5xx → `apiUnidadGenerar()` |
| Endpoint y método | `POST /api/unidades/:unidadId/generar?stream=1`; fallback `POST /api/unidades/:unidadId/generar` |
| Headers y autenticación | `Content-Type: application/json`, `Authorization: Bearer <token>` y `Accept: text/event-stream, application/json` en stream; sesión obtenida con `requireSession()` |
| Payload | `temas[{titulo,duracion,actividades_momentos,orden,generar_imagenes_en:[]}]`, `materia`, `nivel`, `batch_id`; `unidadId` viaja en ruta |
| Parsing | JSON tolerante si el servidor responde JSON; para SSE usa `ReadableStream`, `TextDecoder`, líneas `data:` y JSON por evento; fragmentos inválidos se ignoran |
| Estado y pending | Escribe `bibliotecaState.pendingPlaneacionesByBatchId[batchId]`; items `pending/generating/ready/error/skipped` y error agregado |
| Lectores y render | `renderPlaneacionesTab()`, `renderProgressItemHtml()` y `renderBibliotecaProgressCard()`; clases `bib-item-generating`/`bib-item-error`, pill de progreso y mensaje inline |
| Feedback | Modal se cierra al iniciar; cards por tema; errores de item y error agregado; consola en API y catch de Biblioteca |
| Espera | SSE sobre el mismo request. No `EventSource`, polling, intervalo, timeout frontend, reconexión, `AbortController` ni cancelación |
| Éxito y persistencia | Evento terminal `done` devuelve el resumen; aplica resultado y planeaciones optimistas, limpia pending si `error_count === 0` y hace refetch silencioso de Biblioteca |
| Error y cleanup | Error SSE o HTTP deja `pending.error`; resultados parciales conservan pending. Navegar/reload elimina el estado léxico local, pero no cancela el trabajo backend |
| Globals/wrappers | `window.PlaneacionGeneration.generateFromBiblioteca`, consumidor único `submitBibliotecaAgregarModal()`; `window.generarPlaneacionesUnidadConProgreso`, `window.apiUnidadGenerarConProgreso`; `renderProgressPill`/`statusLabelFromTone` delegan a `window.AppUI` |
| Logs | Frontend `[planeaciones] generate:start/success`; backend eventos de generación y métricas |
| Pruebas | No hay prueba automatizada de este flujo; la matriz manual base cubre generación/SSE |
| Regresiones protegidas | Eventos, orden de items, `batch_id`, IDs técnicos, fallback solo 5xx, mensajes, métricas, persistencia y refetch |

La Sesión 4.3 — **Extracción literal del inicio y progreso de generación de
planeaciones desde Biblioteca** confirmó mediante su puerta de seguridad un
bloque exclusivo: `submitBibliotecaAgregarModal()`
conserva apertura/cierre previo, captura DOM, validación y snapshot; delega una
vez en `window.PlaneacionGeneration.generateFromBiblioteca()` el cierre posterior
al submit, selección de conjunto/tab, pending, request, callbacks, resultado,
reconciliación, refetch y error. El feature se carga como script clásico después
del service de jerarquía y antes de ambos archivos de página.

El modal obtiene `unidadId`, `conjuntoId`, `materia` y `nivel` del conjunto ya
cargado. Solo permite abrir si existe `unidad_id`; exige al menos un tema y la
captura individual exige título y duración mínima de 10. Antes de delegar vuelve
a leer los selectores de actividades y crea `temasSnap` con `titulo`, `duracion`,
`actividades_momentos`, `orden` y `generar_imagenes_en: []`. No filtra duplicados
contra los temas persistidos ni usa flag `submitting`: el backend aplica la
restricción al crear temas y emite `item_skipped` para duplicados. La sesión se
obtiene dentro de `generarPlaneacionesUnidadConProgreso()` mediante su wrapper
vigente, no en el modal ni en el feature.

El parser compartido conserva `fetch`, `ReadableStream`, `TextDecoder`, buffer
por saltos de línea y JSON de cada línea `data:`. Reenvía eventos no terminales
al callback; `done` guarda `data`/`payload`, `error` prepara la excepción y
`[DONE]` se ignora. Si la respuesta es JSON la retorna sin callbacks; si no hay
body retorna `null`. Al terminar el reader lanza el error guardado o retorna el
payload terminal; no procesa explícitamente un fragmento final que quedara sin
salto de línea. El service conserva su fallback a request JSON únicamente para
errores con `status >= 500`.

Biblioteca no mantiene progreso global: cada `item_started`, `item_completed`,
`item_error` o `item_skipped` actualiza el item por índice y renderiza. El
resultado `done` aplica conteos/registros, mezcla las planeaciones persistidas,
conserva pending cuando `error_count > 0`, limpia cuando es cero y siempre intenta
el refetch silencioso después de un resultado. `pendingConjunto` no se crea ni se
escribe en este flujo, aunque el helper compartido de reconciliación puede leerlo
para quick create. Delete de bloque sigue eliminando el mapa pending; no cancela
la IIFE ni el trabajo backend. Reload o navegación pierden el pending y no hay
timeout, abort, reconexión ni cancelación frontend.

#### Creación rápida compartida

| Campo | Evidencia actual |
| --- | --- |
| Acción, página y DOM | Biblioteca vacía emite `data-bib-action="crear-planeaciones"`; shell emite `#btn-hero-quick-create`; submit de `#quick-create-form` |
| Handler y coordinador | `openQuickCreatePanel()` → `submitQuickCreateForm()` → `generatePlaneacionesFromStaging()` |
| Preparación técnica | Crea/reutiliza plantel, grado, materia y unidad mediante `jerarquia.service.js`; fija `explorerState.current`, staging y contexto |
| Service/API | Mismo service y endpoints por unidad del flujo anterior |
| Payload adicional | Puede añadir `batch_id`, `titulo_conjunto` o `force_new_batch:true, mode:"create"`; conserva actividades y contexto legacy |
| Estado | `explorerState.quickCreate`, `stagingTemas`, `stagingContext`, `generating`, `progress`; coordina `window.biblioteca.pendingBatchId`, `pendingConjunto` y `pendingPlaneacionesByBatchId` |
| Render y feedback | Panel de creación rápida, progreso de `explorerState` y cards de Biblioteca; alertas de precondición, mensaje final y consola |
| Espera/cleanup | Mismo SSE sin timeout/cancelación. `finally` limpia `explorerState.generating` y `pendingBatchId`; staging se limpia tras resultado |
| Persistencia/reload | `finishPlaneacionesGeneration()` reconcilia batch temporal/real y refetch. Reload pierde staging y pending local; backend puede continuar |
| Clasificación | Dashboard vigente compartido + Biblioteca vigente + jerarquía técnica activa + compatibilidad por globals |
| Riesgo principal | Modificar el service, parser, callback, payload o reconciliación compartida puede romper creación rápida, jerarquía técnica o `pendingConjunto`; el corte vigente solo movió el adaptador exclusivo de Biblioteca |

#### Generación individual histórica

| Campo | Evidencia actual |
| --- | --- |
| Definición | `planeacion.page.js`: `#btn-generar`/`#btn-generar-mobile` → `generarPlaneacion()` |
| Coordinación | `generarPlaneacionApiConProgreso()` → `apiPlaneacionesGenerateWithProgress()`; fallback según mensaje → `apiPlaneacionesGenerate()` |
| HTTP | `POST /api/planeaciones/generate?stream=1`, JSON + Bearer; no header `Accept`; fallback sin `stream` |
| Payload/feedback | `materia`, `nivel`, `unidad` numérica y `temas`; progreso mediante helpers UI opcionales, resultado batch, alertas |
| Espera/cleanup | Fetch SSE manual; sin polling, timeout, cancelación o reconexión |
| Estado/pending/render | `estadoPlaneacion` léxico y helpers UI opcionales; pending map: **No aplica**; render de resultado histórico |
| Persistencia/reload | Backend persiste batch/planeaciones; no hay refetch posterior; `resetearFormulario()` recarga la página |
| Globals/wrappers | `window.planeacionPage`, `window.generarPlaneacionApiConProgreso`, API global y helpers UI implícitos |
| Logs/pruebas | Logs frontend `[planeaciones] generate:start/success`; prueba de generación: **No confirmado**; Jest solo cubre `validateForm` histórico |
| Consumidor | `main.js` contiene el mapeo, pero `pages/planeacion.html` redirige y no carga el script. Consumidor ejecutable: **No confirmado** |
| Clasificación | No clasificado; no se declara legacy ni eliminable |

### Inventario de anexos

#### Generación seleccionada vigente

| Campo | Evidencia actual |
| --- | --- |
| Acción, página y DOM | Tab Anexos, `data-bib-action="abrir-modal-anexos"`; selección `data-bib-anexo-planid`; submit `#bib-anexo-create-submit` |
| Handler y coordinador | `onBibliotecaClick()` → `openBibliotecaAnexoCreateModal()` → `submitBibliotecaAnexoCreateModal()` → `AnexoGeneration.generateFromBiblioteca()` |
| Service y helper API | **No aplica service frontend**; llamada directa a `apiGenerarAnexo()` por cada planeación |
| Endpoint y método | `POST /api/anexos/generate` |
| Headers/auth/payload | JSON + Bearer; body `{planeacion_id}`; una sesión capturada antes del bucle |
| Parsing | `response.text()` → JSON tolerante; error prioriza `error`, luego `message`, conserva `status/payload` |
| Estado/pending | `bibliotecaState.anexosGenerating[batchId][planeacionId]` con título, materia, nivel, `generating/error` y mensaje |
| Render/feedback | Card temporal por planeación; modal se cierra; actualización optimista por éxito; error inline por card; logs start/success |
| Espera | Requests largos **secuenciales**; sin polling/SSE, timeout frontend, cancelación ni abort |
| Duración backend | El intento IA usa timeout de 90 s por anexo; la duración total frontend depende del número seleccionado |
| Éxito/persistencia | Backend persiste un anexo único por planeación y puede devolver `already_exists`; se borra cada pending exitoso y se hace refetch si hubo algún éxito |
| Error/cleanup | Un item fallido permanece como card error. Si hubo al menos un éxito, el refetch posterior elimina todo el mapa, incluidos errores; si ninguno tuvo éxito, los errores permanecen hasta otra acción/reload |
| Globals/wrappers | `window.AnexoGeneration.generateFromBiblioteca`, consumidor único `submitBibliotecaAnexoCreateModal()`; `window.apiGenerarAnexo`; sin wrapper service |
| Logs confirmados | Frontend `[anexos] generate:start/success`; backend `[anexos] generate:start/success`; métricas `aiMetrics` |
| Pruebas | Sin automatización específica; evidencia manual previa protege generación exitosa y versión `v1_anexos_desde_planeacion` |
| Regresiones | Orden secuencial, unicidad/already_exists, race 23505, cards por item, refetch, timeout backend, payload y logs |

La Sesión 4.1 — **Extracción literal de generación de anexos desde Biblioteca**
extrajo literalmente la operación que comienza después de validar selección y sesión:
construcción de cards pending, cierre del modal, selección del tab, requests
secuenciales, actualización optimista, error por card, render por item, log y
refetch. `submitBibliotecaAnexoCreateModal()` conserva la lectura del modal, el
bloqueo/deduplicación de IDs, los mensajes y `requireSession()`, y funciona como
wrapper estable. La carga clásica quedó
`anexos.api.js → anexo-generation.js → features de preview/download/delete →
dashboard.page.js → biblioteca.page.js`. Regeneración y wrappers individuales
no se movieron. La superficie `window.AnexoGeneration` solo podrá retirarse
cuando una fase autorizada migre el orden de carga y confirme que el consumidor
ya no depende de `window`.

#### Generación/regeneración compatibles sin emisor vigente

`bibGenerarAnexo()` y `bibRegenerarAnexo()` son consumidores directos de
`apiGenerarAnexo()` y `apiRegenerarAnexo()`. Sus ramas
`data-bib-action="generar-anexo"` y `"regenerar-anexo"` existen en la delegación,
pero ningún render HTML actual emite esos atributos. La regeneración usa
`POST /api/anexos/:anexoId/regenerate`, JSON + Bearer, sin body, y comparte
`anexosGenerating`, cards, refetch y ausencia de polling/cancelación. Se
clasifican como **Compatibilidad**, no como código eliminable. El
`planeacionId` vacío no se valida en `bibRegenerarAnexo()` antes de usarlo como
clave pending; es un riesgo registrado, no un bug corregido.

| Campo | Generar uno compatible | Regenerar compatible |
| --- | --- | --- |
| Emisor DOM | **No confirmado**; solo rama de delegación | **No confirmado**; solo rama de delegación |
| Handler/coordinador | `onBibliotecaClick()` → `bibGenerarAnexo()` | `onBibliotecaClick()` → `bibRegenerarAnexo()` |
| Service | **No aplica** | **No aplica** |
| API/payload | `apiGenerarAnexo()`, `{planeacion_id}` | `apiRegenerarAnexo()`, anexo ID en ruta; body: **No aplica** |
| Parsing/auth | Parser tolerante común de anexos; JSON + Bearer | Mismo parser; JSON + Bearer |
| Espera/timeout | Request largo; timeout frontend: **No aplica**; backend 90 s IA | Request largo; timeout frontend: **No aplica**; backend 90 s IA |
| Estado/render/feedback | `anexosGenerating`, card y error inline | Mismo mapa; card “Regenerando...” y error inline |
| Éxito/cleanup | Optimista, limpia item y refetch | Limpia item y refetch |
| Error/reload/cancelación | Error permanece; reload pierde pending; cancelación: **No aplica** | Igual; posible clave pending vacía |
| Logs | Frontend solo errores; backend generate start/success | Frontend solo errores; backend regenerate start/error/success |
| Pruebas | Automatizada: **No confirmado** | Automatizada: **No confirmado** |
| Regresión | Firma, unicidad, retorno, mapa, render y refetch | Firma, endpoint, contenido reemplazado, mapa y refetch |

### Inventario de listas de cotejo

#### Generación vigente de Biblioteca

| Campo | Evidencia actual |
| --- | --- |
| Acción, página y DOM | Tab Listas, `data-bib-action="generar-lista"`; selección `data-bib-lista-planid`; submit `#bib-lista-submit` |
| Handler y coordinador | `onBibliotecaClick()` → `openBibliotecaListaModal()` → `submitBibliotecaListaModal()` → `ListaCotejoGeneration.generateFromBiblioteca()` |
| Service y helper API | Biblioteca llama directo a `apiListasCoTejoGenerate()`; el service no participa en este flujo |
| Endpoint/método | `POST /api/listas-cotejo/generate` |
| Headers/auth/payload | JSON + Bearer; `{planeacion_ids:[...]}`; sesión capturada antes de la IIFE |
| Parsing | Texto → JSON tolerante; errores con prioridad `error`/`message` y metadata |
| Estado/pending | `pendingListaByBatchId[batchId] = {items,result:null,error}`; un item por planeación |
| Render/feedback | Cards por item; mismo estado global para todos; log success con conteos; error inline repetido por card |
| Espera | Request largo único; backend procesa planeaciones secuencialmente y limita cada intento IA a 60 s. Sin polling/SSE/timeout frontend/cancelación |
| Éxito/persistencia | Backend devuelve `created`, `skipped` y listas; frontend espera 1.5 s, borra pending y refetch |
| Estados omitidos | `already_exists`, `missing_closing_activity`, `invalid_ai_response`; frontend solo registra el conteo y no asigna la razón a cada card |
| Error/cleanup | Error conserva todas las cards con el mismo mensaje. Reload pierde pending; la persistencia backend ya confirmada aparece en un refetch posterior |
| Globals/wrappers | `window.ListaCotejoGeneration.generateFromBiblioteca`, consumidor único `submitBibliotecaListaModal()`; `window.apiListasCoTejoGenerate`; `window.generarListasCotejoUnidad` queda para el camino legacy |
| Logs confirmados | Frontend `[listas-cotejo] generate:success`; backend `[listas-cotejo] generate:start/success`; no se confirmó log frontend start |
| Pruebas | Sin automatización específica; evidencia manual previa protege selección, `created:1`, `skipped:0`, diez puntos y versión `v2_lista_cotejo_actividades_momentos` |
| Regresiones | Selección explícita, actividades evaluables, fallback `actividad_cierre`, exactamente cinco criterios de 2/0, total 10, skipped, refetch y métricas |

La Sesión 4.2 — **Extracción literal de generación seleccionada de listas de
cotejo desde Biblioteca** extrajo literalmente la operación posterior a
selección y sesión: cierre del modal,
selección del tab, construcción de pending, request único, conteo de
`created`/`skipped`, espera de 1500 ms, cleanup, refetch y feedback de error.
`submitBibliotecaListaModal()` conserva el modal, exclusión de listas existentes,
normalización, deduplicación, mensajes y `requireSession()`. El pending vigente
no se usa para bloquear selecciones al reabrir el modal; ese riesgo se conserva
sin corrección. `lista-cotejo-generation.js` se carga después de la API/service
de listas y antes de `biblioteca.page.js`. El coordinador legacy por unidad no
se movió ni comparte la nueva global.

El coordinador `submitListaCotejoGenerate()` del Dashboard llama
`generarListasCotejoUnidad({planeacion_ids, unidad_id})`, escribe
`explorerState.listaCotejoGeneration`, refetch por unidad y muestra toast con
detalle de skipped. Su emisor `data-content-action="open-lista-cotejo-modal"`
solo aparece en el render del explorador que no se ejecuta en Biblioteca. Se
clasifica como **Legacy visual confirmado**; el service y la ruta siguen siendo
compatibilidad protegida.

| Campo legacy | Evidencia |
| --- | --- |
| Acción/DOM/handler | `data-content-action="open-lista-cotejo-modal"` → `openListaCotejoModal()`; submit `#lista-cotejo-confirm-submit` → `submitListaCotejoGenerate()` |
| Service/API/HTTP | `generarListasCotejoUnidad()` → `apiListasCoTejoGenerate()`; POST JSON + Bearer al mismo endpoint |
| Payload/parsing | `{planeacion_ids,unidad_id}`; parser y retorno crudo del service |
| Estado/render/feedback | `listaCotejoModal`, `listaCotejoGeneration`, `errors.listaCotejo`; render legacy y toast con skipped |
| Espera/timeout/cancelación | Request largo; polling/SSE: **No aplica**; timeout y cancelación frontend: **No aplica** |
| Terminal/cleanup/refetch | HTTP éxito → estado ready, `ensureListasCotejo(force)` y render; error → estado error y mensaje por unidad |
| Reload/persistencia | Estado local se pierde; listas backend persisten |
| Globals/wrappers/logs/pruebas | Service/API globals; logs backend start/success; prueba UI ejecutada: **No confirmado** |
| Regresión | Payload legacy, toast, skipped, estado por unidad y ausencia de timeout |

### Inventario de exámenes

#### Generación y polling vigentes de Biblioteca

| Campo | Evidencia actual |
| --- | --- |
| Acción, página y DOM | Tab Exámenes, `data-bib-action="generar-examen"`; checkboxes `data-bib-exam-type`, counts y `data-bib-exam-planid`; submit `#bib-exam-submit` |
| Handler/coordinador | `onBibliotecaClick()` → `openBibliotecaExamModal()` → `submitBibliotecaExamModal()` → `ExamGeneration.generateFromBiblioteca()` |
| Service/API | Biblioteca llama directo `apiExamenesGenerate()` y `apiExamenGenerationStatus()`; no usa service |
| Inicio HTTP | `POST /api/examenes/generate`, JSON + Bearer |
| Payload protegido | `{unidad_id,batch_id,tipos_pregunta,cantidades_pregunta,planeacion_ids}`; total derivado de cantidades, no enviado como campo independiente |
| Respuesta inicial | Texto → JSON tolerante; HTTP 202 exige `job_id`; backend crea job/items y agenda worker con `setTimeout(...,0)` |
| Estado/pending | `examModal` antes del submit; luego `pendingExamenByBatchId[batchId] = {message,error}` |
| Render/feedback | Modal se cierra tras crear job; una card de examen muestra `current_step`; error visible siempre usa mensaje genérico protegido |
| Polling | `GET /api/examenes/generacion/:jobId`, Bearer y `no-store`; espera 3 s antes de cada poll, máximo 60 |
| Terminales | Biblioteca reconoce `completed` y `failed`; el backend vigente expone `processing/completed/failed` |
| Timeout real | Nominal aproximado de 180 s más duración HTTP. Si `completed` llega en el poll 60, el chequeo posterior `polls >= MAX_POLLS` lo trata como timeout; riesgo registrado |
| Cleanup | No usa interval handle; el `while` termina en éxito/fallo/timeout. En éxito borra pending y refetch; en fallo/timeout conserva card error |
| Navegación/cancelación | No `AbortController`, cancel endpoint, cleanup al cerrar modal o listener de navegación. Cerrar modal solo aplica antes del job; reload detiene el polling local, no el worker |
| Reload/persistencia | Job, items y examen persisten en backend. Pending/jobId no persisten en frontend y el polling no se reanuda; un reload posterior puede mostrar el examen terminado |
| Reintentos | No hay botón de retry dedicado ni retry frontend. Worker reintenta, sustituye duplicados y usa fallbacks según contrato backend |
| Globals/wrappers | `window.ExamGeneration.generateFromBiblioteca`, consumidor único `submitBibliotecaExamModal()`; `window.apiExamenesGenerate`, `window.apiExamenGenerationStatus`; service `generarExamenUnidad`/`obtenerEstadoGeneracionExamen` queda para legacy |
| Logs frontend | Payload Biblioteca, `[examenes] job:created`, `[polling] examen:start/finished` y errores |
| Logs backend confirmados | `[examenes] generar examen recibido`, `worker:start`, `pregunta aceptada`, `pregunta rechazada, reintentando`, `exam:saved`, `generate:success`, `[aiMetrics] job:finished` |
| Pruebas | Sin automatización específica; evidencia manual previa protege diez preguntas, distribución, deduplicación, reintentos, fallback, guardado y métricas |

La Sesión 4.4 — **Auditoría específica y extracción literal de generación y
polling de exámenes desde Biblioteca** confirmó un corte exclusivo. El submit
vigente conserva apertura y lectura del modal, selección, orden de IDs,
validaciones, tipos, cantidades, sesión, flag `submitting` y payload; delega una
vez en `window.ExamGeneration.generateFromBiblioteca({payload, accessToken,
conjuntoId})`. El feature crea el job, exige `job_id`, cierra el modal, activa el
tab Exámenes, crea pending, inicia la IIFE de polling y conserva `current_step`,
terminales, timeout, cleanup, render y refetch. Se carga como script clásico
después de API/service de exámenes y antes de ambas páginas.

Las planeaciones seleccionables siguen siendo `conjunto.planeaciones` sin
filtrado por ausencia de tema: el título visual usa `tema`, `custom_title` o
`Sin titulo`. Los IDs se convierten a `String`, se añaden solo si no estaban ya
seleccionados y conservan el orden de selección. No se excluyen planeaciones por
exámenes existentes ni se bloquea el modal por un pending vigente. `submitting`
se marca antes de `requireSession()`; si devuelve `null`, el retorno vigente no
restablece el flag. El total no se envía: el backend lo deriva de
`cantidades_pregunta`. `queued`, `processing`
y estados desconocidos no terminales continúan el loop; si traen `current_step`
actualizan la card. `completed` rompe el loop, `failed` entra al error genérico y
60 consultas sin terminal producen timeout. El borde que trata como timeout un
`completed` recibido en la consulta 60 se conserva sin corrección.

El job y su examen final persisten en backend, pero `jobId` y pending viven solo
en memoria. Reload o navegación detienen la observación local sin cancelar el
worker; si el job termina después del timeout puede aparecer tras un refetch o
reload posterior. Delete de bloque conserva su eliminación indirecta de
`pendingExamenByBatchId`, sin cancelar job o polling. La validación manual de
Sesión 4.4 quedó aprobada con 19 preguntas solicitadas/guardadas, cero fallidas,
cero retries y contexto confirmado para Gravedad y Movimiento.

El Dashboard legacy usa `submitUnitExamModal()` y envía
`{unidad_id,tipos_pregunta,cantidades_pregunta,tema_ids}` mediante
`generarExamenUnidad()`. `waitForExamGenerationCompletion()` espera 1.5 s antes
del primer poll y 4 s después, renueva sesión por service en cada consulta, no
tiene límite y considera `failed`, `partial` o `cancelled` como fallo. Actualiza
`explorerState.examGeneration`, progreso numérico y detalle final. Su emisor
solo existe en el render visual legacy; no es el flujo vigente y no puede
unificarse con el polling de Biblioteca sin cambiar contratos observables.

| Campo legacy | Evidencia |
| --- | --- |
| Acción/DOM/handler | `data-content-action="open-unit-exam-modal"` → `openUnitExamModal()`; submit `#unit-exam-form` → `submitUnitExamModal()` |
| Service/API | `generarExamenUnidad()`/`obtenerEstadoGeneracionExamen()` → APIs de generación/status |
| HTTP/auth/parsing | Mismos POST/GET JSON y parser; el service llama `requireSession()` en inicio y en cada poll |
| Payload | `{unidad_id,tipos_pregunta,cantidades_pregunta,tema_ids}`; `batch_id` y `planeacion_ids`: **No aplica** en este caller |
| Estado/render/feedback | `examModal`, `examGeneration`, `errors.examenes`; render legacy, progreso numérico, scroll y detalle final |
| Polling/timeout | 1.5 s inicial y 4 s posteriores; límite/timeout: **No aplica** |
| Terminal/cleanup | completed retorna; failed/partial/cancelled lanzan; no interval handle |
| Reload/cancelación | Estado se pierde; worker persiste; reanudación y cancelación: **No aplica** |
| Globals/wrappers/logs/pruebas | Service/API globals; logs payload Dashboard y backend; prueba UI ejecutada: **No confirmado** |
| Regresión | Selección de temas de la unidad, cantidades, progreso, detalle, terminales y sesión renovada por poll |

### Mecanismos de espera

| Flujo | Mecanismo | Función | Endpoint | Intervalo/duración | Terminal | Cleanup actual | Riesgo |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Planeaciones por unidad | SSE manual sobre fetch | `PlaneacionGeneration.generateFromBiblioteca()` → `generarPlaneacionesUnidadConProgreso()` → `apiUnidadGenerarConProgreso()` | POST `/api/unidades/:unidadId/generar?stream=1` | Sin intervalo/timeout frontend | `done` o `error`; items started/completed/error/skipped | Fin del reader; sin abort/reconexión | Request continúa al navegar; fragmentos inválidos se ignoran |
| Planeación individual no confirmada | SSE manual sobre fetch | `apiPlaneacionesGenerateWithProgress()` | POST `/api/planeaciones/generate?stream=1` | Sin intervalo/timeout | `done` o fin sin payload | Fin del reader | Entry point no confirmado y fallback distinto |
| Anexos | Request largo secuencial | `AnexoGeneration.generateFromBiblioteca()` | POST `/api/anexos/generate` | 90 s backend por intento IA; total variable | HTTP éxito/error por item | Borrado por item/refetch | Navegación no cancela; error puede limpiarse tras éxito parcial |
| Listas | Request largo | `ListaCotejoGeneration.generateFromBiblioteca()` | POST `/api/listas-cotejo/generate` | 60 s backend por intento IA; luego gracia local 1.5 s | HTTP éxito/error | Borra pending y refetch | Skipped no se reflejan por card |
| Examen Biblioteca | Polling con `setTimeout` awaited | IIFE de `ExamGeneration.generateFromBiblioteca()` | GET `/api/examenes/generacion/:jobId` | 3 s, 60 polls, ~180 s nominal | completed/failed/timeout | Salida del while; sin handle | Poll 60 completado se clasifica timeout; reload no reanuda |
| Examen Dashboard legacy | Polling con `setTimeout` awaited | `waitForExamGenerationCompletion()` | Mismo GET | 1.5 s inicial, 4 s siguientes, sin límite | completed o failed/partial/cancelled | Retorno/throw | Polling indefinido y contrato terminal distinto |

No existe `EventSource`, `setInterval`, `AbortController` ni mecanismo de
cancelación para estos procesos. El SSE se implementa mediante lectura manual
del body del fetch. El botón “Cancelar” de cada modal solo cierra la captura
previa al submit; no cancela una generación ya iniciada.

### Propiedad del estado pending y feedback

| Estado | Propietario | Escritores | Lectores | Creación/limpieza | Error y reload | Riesgo |
| --- | --- | --- | --- | --- | --- | --- |
| `pendingConjunto` | `bibliotecaState` léxico | quick create mediante `window.biblioteca.setPendingConjunto()`; loader | sidebar/detail y reconciliación | Antes de generar bloque nuevo; se limpia al cargar/reconciliar | Reload lo recrea vacío | Card temporal sin job persistido |
| `pendingPlaneacionesByBatchId` | `bibliotecaState` | `PlaneacionGeneration.generateFromBiblioteca()`, quick create/`finishPlaneacionesGeneration`, delete de bloque | tab Planeaciones y callbacks SSE | Inicio; limpia solo sin errores o delete | Error/partial permanece; reload lo pierde | Dos coordinadores escriben el mismo mapa |
| `anexosGenerating` | `bibliotecaState` | `AnexoGeneration.generateFromBiblioteca()`, wrappers individuales/regeneración, delete bloque | tab/modales Anexos | Por item; éxito/refetch/delete | Error queda salvo refetch con algún éxito; reload lo pierde | Limpieza asimétrica y posible clave vacía en regeneración |
| `pendingListaByBatchId` | `bibliotecaState` | `ListaCotejoGeneration.generateFromBiblioteca()`, delete bloque | tab Listas | Inicio; éxito + 1.5 s/refetch; delete | Error queda; reload lo pierde | Skipped y progreso por item no representados |
| `pendingExamenByBatchId` | `bibliotecaState` | `ExamGeneration.generateFromBiblioteca()`, delete bloque | tab Exámenes | Tras job; limpia en completed/refetch o delete | Failed/timeout queda; reload pierde jobId | Sin reanudación; doble submit posible tras reload |
| Modal flags `submitting/error` | `bibliotecaState` | renders/submits de cada modal | botones y mensajes de modal | Antes del request; modal suele cerrarse al iniciar | Error de inicio vuelve al modal; reload limpia | No son cancelación del proceso |
| `explorerState.generating/progress` | Dashboard compartido | creación rápida y SSE | panel rápido y Biblioteca para conjunto temporal | Inicio/finally; items quedan para resultado visual | Reload limpia | Global mixta; no mover en Fase 4 |
| `examGeneration`/`listaCotejoGeneration` | `explorerState` | coordinadores legacy | render legacy | Inicio/terminal | Reload limpia | No mezclar con pending vigente |

`biblioteca-block-delete.js` es consumidor indirecto de los cuatro mapas:
los elimina al borrar un bloque. `renderBibliotecaProgressCard()` controla el
feedback común de cards y depende de `renderProgressPill()` y
`statusLabelFromTone()`, wrappers locales de Dashboard sobre `window.AppUI`.
Estos son contratos de render de Fase 6 y no deben moverse durante la extracción
de procesos.

### Contratos protegidos y regresiones futuras

- Preservar autenticación Supabase, Bearer, headers, parsing, metadata de error,
  mensajes, orden clásico de scripts y globals actuales.
- Planeaciones: payload por unidad/individual, `batch_id`, unidad técnica,
  estados y orden de eventos SSE, fallback JSON y creación de temas/planeación
  pending.
- Anexos: `planeacion_id`, unicidad por planeación, `already_exists`, resolución
  de race, request secuencial, timeout backend, prompt/version y métricas.
- Listas: `planeacion_ids`, `unidad_id` legacy, selección de actividades en
  `actividades_momentos`, fallback `actividad_cierre`, skipped, cinco criterios
  de dos puntos, total 10, prompt/version y métricas.
- Exámenes: `unidad_id`, `planeacion_ids`, `tema_ids`, `tipos_pregunta`,
  `cantidades_pregunta`, total derivado, selección/deduplicación, jobs/items,
  estados, polling, retries, reemplazo de duplicados, cantidad final, prompts,
  worker, mensaje genérico y métricas.
- Preservar reload/refetch, feedback, errores, timeouts y ausencia de
  cancelación exactamente como comportamiento vigente hasta una tarea
  funcional explícita.
- Mantener `window.explorerState`, Archivados, jerarquía técnica,
  `js/ui/wordExport.js`, preview/descargas y evidencia manual cerrada de Fase 3.

Las sesiones funcionales de Fase 4 deberán probar, por recurso, éxito y fallo
permitido, reload/navegación según el comportamiento actual, una sola petición
o polling esperado, ausencia de duplicados, consola limpia y regresión
acumulativa. Además: skipped de listas, SSE y parciales de planeaciones,
already_exists/error por item de anexos, y creación/job/progreso/terminal/
persistencia de exámenes.

### Riesgos y hallazgos de apertura

- El polling de examen vigente tiene un borde confirmado en el poll 60 y no
  persiste `jobId` para reanudación.
- El polling legacy no tiene timeout y sus terminales difieren del vigente.
- Requests y SSE no se cancelan al cerrar, navegar o recargar; el backend puede
  continuar.
- Los cuatro pending viven en memoria, se pierden al reload y tienen reglas de
  limpieza distintas.
- Quick create cruza Dashboard, Biblioteca y jerarquía técnica; no es una
  función exclusiva de uno de esos archivos.
- Anexos no tiene service frontend; crear uno sería implementación nueva, no
  extracción literal.
- Listas oculta el detalle de skipped en las cards vigentes.
- Generación/regeneración individual de anexos conserva handlers sin emisor DOM
  actual; no se debe retirar ni elevar a flujo vigente sin sesión separada.
- La generación individual de `planeacion.page.js` no tiene entry point
  ejecutable confirmado; no se clasifica como eliminable.
- `README.md` afirma que `js/features/` no existe, mientras el árbol y
  `ARCHITECTURE.md` confirman módulos en esa carpeta. Es contradicción
  documental previa, fuera de los documentos autorizados para este cambio.
- No se confirmaron pruebas automatizadas de generación/polling; el único test
  actual cubre `validateForm` histórico.

## Sesión 4.5 — Auditoría formal de cierre de generación y polling

La comparación acumulativa usó como baseline real `ecb1785`, último commit
anterior a la apertura documental de Fase 4. Los únicos cambios funcionales
entre ese punto y `6344374` son cuatro features específicos, cuatro delegaciones
únicas desde `biblioteca.page.js` y cuatro líneas de carga clásica en
`pages/dashboard.html`. Los bloques trasladados conservan el comportamiento
previo; `dashboard.page.js`, generación individual, API/services compartidos,
delete de bloque, `wordExport.js`, CSS y packages permanecen idénticos al
baseline.

La búsqueda global confirmó `AnexoGeneration`, `ListaCotejoGeneration`,
`PlaneacionGeneration` y `ExamGeneration`, cada uno con un único consumidor en
Biblioteca, sin definición duplicada ni consumo desde quick create o legacy.
Las validaciones manuales 4.0–4.4 están aprobadas. Los riesgos ya inventariados
son comportamiento preservado y deuda de fases futuras, no regresiones de Fase
4. La validación documental de 4.5 y la decisión formal **A. Cerrar Fase 4**
quedaron aprobadas; el cierre consta en `8dcba86`. Fase 5 permanece pendiente y
no iniciada.

## Fase 5 — Sesión 5.0: auditoría documental de apertura

La puerta de entrada pasó en `refactor-front` desde `e1991de`, con working tree
limpio. Fase 4, la Sesión 4.5 y su validación documental constan completadas;
el backend estaba limpio en `refactor-back` y permaneció en solo lectura. La
decisión es **A. Abrir Fase 5**. Esta sesión solo clasifica el estado actual:
no mueve propiedades, no cambia shapes y no inicia un corte funcional.

### Propietarios confirmados

| Objeto | Definición y valor inicial | Consumidores | Persistencia / reconstrucción | Clasificación | Fase propietaria |
| --- | --- | --- | --- | --- | --- |
| `bibliotecaState` | `js/pages/biblioteca.page.js`; objeto léxico creado al cargar el script | Biblioteca, features de generación/delete y fachada `window.biblioteca` | Ninguna persistencia local; `conjuntos` se reconstruye por GET, no su estado efímero | Biblioteca vigente | 5; render/eventos quedan en 6 |
| `window.biblioteca` | Fachada global sobre el mismo binding léxico | Solo Quick Create de `dashboard.page.js` | No persiste; delega selección, pending y refetch | Compatibilidad activa / estado mixto | 5 y desacoplamiento en 7; retiro en 10 |
| `window.explorerState` | `js/pages/dashboard.page.js`; objeto publicado al final del script | Quick Create, previews activos, listeners compartidos y explorador visual legacy | Solo `current` tiene helper de `sessionStorage`; la ruta Biblioteca retorna antes de la restauración legacy | Estado mixto | Clasificar en 5; Quick Create en 7; legacy en 8–9; globals en 10 |
| `archivedState` | `js/pages/archivados.page.js`; estado léxico independiente | Página Archivados y su event delegation | Estado visual efímero; datos se recargan del backend | Archivados | 8; fuera de una extracción de Biblioteca |
| Registro `educativo.archivedHierarchy.registry` | `js/services/planeaciones.service.js`; `{hidden,scopes,planeaciones,batches}` | planeaciones service y Archivados mediante wrappers `window.*` | `localStorage`; complementa datos archivados del backend | Archivados / jerarquía técnica activa | 8; no mover en 5 |
| `PLANEACION_ORIGINAL`, tablas y flags de edición | `js/pages/detalle.page.js`; bindings léxicos separados | Página Detalle, edición, uploads y descargas | Planeación refetchable por URL/API; edición local se pierde y el guardado sí persiste | Detalle vigente | Fuera del store de Biblioteca; proteger como regresión, no mover en F5 |

No existe `window.bibliotecaState`. Los features clásicos de Fase 4 acceden al
binding léxico `bibliotecaState` por orden de scripts. No se confirmó consumo
de estos objetos desde tests; la suite existente no cubre estado de Biblioteca.

### Matriz de propiedades de `bibliotecaState`

| Propiedad | Inicial / shape observado | Escritores | Lectores y consumidores indirectos | Creación, limpieza y persistencia | Relaciones | Clasificación, riesgo y fase futura |
| --- | --- | --- | --- | --- | --- | --- |
| `conjuntos` | `[]`; luego array de objetos de `/api/biblioteca/conjuntos` | loader, reconciliación optimista y features delete | sidebar, detalle, selección, modales, descargas, Quick Create vía fachada | Se reemplaza en load/refetch; delete muta; backend reconstruye recursos terminados tras reload | API, render, delete y generación | Biblioteca vigente; shape del conjunto temporal no es idéntico al persistido; F5 |
| `loading` | `false`, boolean | `loadAndRenderBiblioteca()` | render general | `true` solo en carga no silenciosa; `false` en éxito/error; reload reinicia | API y render | Biblioteca vigente; carga silenciosa no la activa; F5/F6 |
| `error` | `""`, string | loader | render general/retry | Vacía al cargar; mensaje en excepción; reload reinicia | API, DOM y render | Biblioteca vigente; F5/F6 |
| `searchQuery` | `""`, string | input de búsqueda | filtro, estados vacíos y valor DOM | Vive durante la página; sin storage; reload limpia | DOM y render | Biblioteca vigente; F5; binding/render en F6 |
| `selectedConjuntoId` | `null`; ID normalizado normalmente a string | selección, loader/reconciliación, Quick Create y delete de bloque | sidebar, detalle y fachada | Fallback al primer bloque; se pierde en reload; delete puede asignar el ID crudo del primer elemento | DOM, render, delete, Quick Create | Biblioteca vigente; riesgo confirmado String/Number y múltiples escritores; primer corte F5 propuesto |
| `expandedIds` | `new Set()` | solo se confirmó `delete(tempId)` en reconciliación | Sin lector ni alta confirmados | Se crea al cargar y se pierde en reload | Sin relación DOM confirmada | No clasificado; no mover hasta confirmar consumidor; F5 |
| `activeTab` | `{}`; mapa `batchId -> planeaciones|anexos|listas|examenes` | selección/tab, loader/reconciliación, generación y deletes | render de tabs/cards | Default `planeaciones`; delete de bloque limpia su clave; sin storage; reload reinicia | DOM, render, delete y generación | Biblioteca vigente; múltiples escritores y claves coercionadas; F5, render F6 |
| `pendingBatchId` | `null`; ID de batch reutilizado por Quick Create | fachada `window.biblioteca` y Quick Create | payload de generación de Quick Create | Se fija antes de generar y se limpia en éxito/error/finally; reload reinicia | API/generación compartida | Estado mixto Biblioteca–Quick Create; riesgo de cruce; F5/7 |
| `pendingConjunto` | `null` o objeto temporal con `id/tempId/isPending/status_ui`, metadatos, contadores, `planeaciones`, `examenes` y `listas_cotejo` | fachada Quick Create, loader y reconciliación | sidebar, detalle y tab Planeaciones; progreso indirecto desde `explorerState.progress` | Nace antes de generar bloque nuevo; carga normal/reconciliación lo limpia; reload lo pierde | Render, generación y refetch | Estado mixto; shape parcial y sin job persistido; F5/7 |
| `pendingPlaneacionesByBatchId` | `{}`; mapa a `{items,error}`; items de Biblioteca y Quick Create no tienen exactamente el mismo shape | `PlaneacionGeneration`, fachada/finish de Quick Create y delete de bloque | tab Planeaciones y callbacks de progreso | Éxito sin errores/delete limpia; parcial/error permanece; reload/navegación pierde | SSE, render, delete y generación | Generación activa / estado mixto; múltiples escritores y shapes variables confirmados; F5, Quick Create F7 |
| `pendingExamenByBatchId` | `{}`; mapa a `{message,error}` | `ExamGeneration` y delete de bloque | tab Exámenes | Nace después del job; completed/delete limpia; failed/timeout permanece; reload pierde `jobId` y polling | Polling, render, delete y API | Generación activa; no reanuda job persistido; F5 |
| `pendingListaByBatchId` | `{}`; mapa a `{items,result,error}` | `ListaCotejoGeneration` y delete de bloque | tab Listas | Éxito espera 1500 ms y limpia/refetch; error queda; delete/reload limpia | Request largo, render y delete | Generación activa; no representa detalle de skipped por item; F5 |
| `anexosGenerating` | `{}`; mapa anidado `batchId -> planeacionId -> {titulo,materia,nivel,status,errorMessage}` | `AnexoGeneration`, wrappers de generación/regeneración y delete de bloque | tab y modal de Anexos | Éxito por item limpia; refetch con algún éxito elimina el mapa completo; fallo total queda; reload limpia | Requests secuenciales, render, delete y generación | Generación activa; múltiples escritores y cleanup asimétrico; F5 |
| `anexoModal` | `{open,conjuntoId,planeaciones,selectedPlaneacionIds,submitting,error}` | open/close, render, checkboxes y submit | modal DOM y `AnexoGeneration` | Open reemplaza el objeto; close solo cambia `open`; reload limpia | DOM, pending, API y generación | Biblioteca vigente; render filtra/muta selección y sesión nula puede dejar `submitting`; estado F5, render F6 |
| `listaModal` | Mismo patrón, sin tipos/cantidades | open/close, render, checkboxes y submit | modal DOM y `ListaCotejoGeneration` | Open reemplaza; close solo `open`; reload limpia | DOM, API y generación | Biblioteca vigente; render filtra/muta selección y sesión nula puede dejar `submitting`; F5/F6 |
| `examModal` | Modal más `{unidadId,selectedTypes,questionCounts}` | open/close, listeners y submit | modal DOM y `ExamGeneration` | Open reemplaza; close solo `open`; reload limpia | DOM, payload y polling | Biblioteca vigente; sesión nula puede dejar `submitting`; contratos de payload protegidos; F5/F6 |
| `agregarModal` | `{open,conjuntoId,unidadId,materia,nivel,unidad,temas,error}` | open/close, inputs/selects y submit | modal DOM y `PlaneacionGeneration` | Open reemplaza; close solo `open`; snapshot previo a generar; reload limpia | DOM, SSE y generación | Biblioteca vigente; render/DOM capturan parte del estado; F5/F6 |

Los cuatro pending y `pendingConjunto` son memoria frontend, no datos
persistidos. Un refetch puede reconstruir bloques y recursos ya guardados, pero
no la intención de selección, progreso intermedio, mensaje, timer, `jobId`,
modal o tab. Delete de bloque limpia los cuatro mapas por ID, pero no cancela
request, SSE, worker o polling y no tiene limpieza explícita de
`pendingBatchId`/`pendingConjunto`.

### Matriz de propiedades relevantes de `explorerState`

| Propiedad o grupo | Shape / escritores | Lectores actuales | Persistencia y reload | Clasificación | Riesgo y fase |
| --- | --- | --- | --- | --- | --- |
| `planteles`, `gradosByPlantel`, `materiasByGrado`, `unidadesByMateria` | arrays/mapas cargados por services de jerarquía | selectores de Quick Create y render legacy | Backend reconstruible; memoria local se pierde | Jerarquía técnica activa / estado mixto | Compartidos por Quick Create y legacy; F7/8 |
| `temasByUnidad`, `examenesByUnidad`, `planeacionByTema`, `listasCotejoByUnidad` | caches por unidad/tema | coordinadores y render del explorador; lista preview legacy | Backend reconstruible; reload limpia | Explorador visual legacy con compatibilidad de preview | No mover por nombre; F8–9 |
| `loading`, `errors` | objetos por nivel y recurso | loaders Quick Create y render legacy | Efímeros | Estado mixto | Shapes por dominio y consumidores cruzados; F5 clasifica, F7/8 separan |
| `expandedPlanteles`, `expandedGrados`, `expandedMaterias` | `Set` mutados por navegación legacy | render visual jerárquico | Efímeros | Legacy visual confirmado | F8–9 |
| `current` | `{level,plantelId,gradoId,materiaId,unidadId}`; navegación y Quick Create escriben | jerarquía, generación legacy, previews y Quick Create | Existe helper `sessionStorage`, pero Biblioteca retorna antes de hidratación; Quick Create asigna sin persistir en ese punto | Estado mixto | Contexto activo y legacy coinciden; F7/8 |
| `stagingTemas`, `stagingTituloConjunto`, `stagingContext`, `stagingPanelOpen` | staging mutable de generación | Quick Create/generación y panel legacy | Efímero | Quick Create vigente / compartida activa | No mezclar con modal `agregarModal`; F7 |
| `progress` | `{total,completed,items,finalMessage,finalTone}`; SSE/Quick Create escribe | panel Quick Create y `pendingConjunto` de Biblioteca | Efímero | Estado mixto, generación activa | Shape rico copiado parcialmente a pending; F5 clasifica, F7 desacopla |
| `generating` | boolean | submit/render Quick Create y progreso | `finally` lo limpia; reload limpia | Quick Create vigente | Puede continuar request al navegar; F7 |
| `quickCreate` | `{open,temas,requestVersion,selectedConjunto}` | shell, listeners, selects y submit | Open reinicializa partes; reload limpia | Quick Create vigente | Comparte fachada/API/parser/reconciliación con Biblioteca; F7 |
| `examPreview`, `examenDetalleById` | estado de modal y cache por ID | `ExamPreview`, `ExamDownload`, Biblioteca y legacy | Efímero; detalle refetchable | Preview activa / compartida activa | Dependencia vigente de `window.explorerState`; F5, render F6 |
| `listaCotejoPreview` | `{open,listaId,listaData,loading,error}` | `ListaCotejoPreview`, descargas, Biblioteca y legacy | Efímero; detalle refetchable | Preview activa / compartida activa | Usa `current.unidadId` en camino legacy y fetch directo en Biblioteca; F5/F6 |
| `examGeneration`, `examModal`, `listaCotejoGeneration`, `listaCotejoModal` | estados de coordinadores/modales anteriores | polling, generación y render legacy | Efímeros | Compatibilidad / explorador visual legacy | No confundir con pending/modales vigentes; F8–9 |
| `modal`, `confirmDelete`, `searchQuery` | estado de modal jerárquico, confirmación y filtro | listeners/render del explorador visual | Efímero | Legacy visual confirmado | El chequeo global de modales sigue siendo compatibilidad; F8–9 |

El preview de Anexos no mantiene un objeto de estado: `AnexoPreview` conserva el
recurso en closures/listeners del modal dinámico y el DOM refleja loading,
contenido o error. El modal de nombre de archivo pertenece a `window.AppUI` y
no a `bibliotecaState`. La confirmación de delete de Biblioteca usa estado
léxico dentro del helper/promesa de UI; `explorerState.confirmDelete` es el
estado separado del flujo jerárquico legacy.

### Consumidores, eventos y vigencia

- `pages/dashboard.html` confirma scripts clásicos en orden API/service →
  features → `dashboard.page.js` → `biblioteca.page.js` → `main.js`; no hay
  `type="module"`, `defer` ni `async`.
- `onBibliotecaClick()` es la delegación vigente de `data-bib-action`; inputs
  de búsqueda, checkboxes y botones de modal añaden listeners directos después
  del render.
- Los cuatro features de Fase 4 tienen un consumidor esperado desde Biblioteca
  y escriben pending del binding léxico. Quick Create no consume
  `PlaneacionGeneration`; usa parser/service SSE compartido y la fachada
  `window.biblioteca`.
- `window.explorerState` es un global real con consumidores indirectos en
  previews, descargas, Escape y comprobación de modales; no es eliminable como
  bloque. El explorador visual no se inicializa en la ruta vigente porque
  `initDashboardPage()` retorna después de `initBiblioteca()`.
- El shell y los listeners compartidos de `dashboard.page.js` son **Dashboard
  vigente**; su `quickCreate` es **Quick Create vigente**. El resto de
  `explorerState` se clasifica propiedad por propiedad, no por el archivo.
- `archivedState` solo pertenece al entry point `pages/archivados.html`; el registro local
  de jerarquía se comparte mediante wrappers del service. Archivados no es
  legacy visual ni estado de Biblioteca.
- Los bindings léxicos de `detalle.page.js` son **Detalle vigente** e
  independientes de ambos stores; la navegación desde una card pasa IDs por
  URL y Detalle reconstruye desde API.
- `expandedIds` quedó sin consumidor confirmado más allá de una limpieza; se
  conserva como **No clasificado**. No se declararon propiedades eliminables.

### Riesgos y límites confirmados

- **Riesgo confirmado:** múltiples escritores en selección, tab,
  `pendingPlaneacionesByBatchId` y `anexosGenerating`; shapes variables entre
  progreso de Quick Create, pending temporal y conjuntos persistidos.
- **Riesgo confirmado:** estado derivado y mutable dentro de render; los
  renders de Anexos/Listas depuran `selectedPlaneacionIds`.
- **Bug confirmado por control de flujo, no corregido:** Anexos, Listas y
  Exámenes fijan `submitting=true` antes de `requireSession()`; si devuelve
  `null`, el retorno no lo restablece hasta una reapertura/reload.
- **Comportamiento deliberado:** pending, tabs, búsqueda, selección y modales
  viven en memoria; reload no reanuda procesos. Delete limpia feedback local
  sin cancelar procesos backend.
- **Riesgo posible:** IDs crudos y normalizados pueden alternar String/Number;
  `batchId`, `conjuntoId` y `unidadId` tienen roles distintos pero coinciden en
  varios handlers. No se confirmó una colisión funcional actual.
- **No confirmado:** consumidor de `expandedIds` o reanudación segura de los
  pending a partir del backend. No se moverán por inferencia.
- Fase 5 posee ownership, shapes, selección, pending y modal state. Fase 6
  conserva render/DOM/event delegation; Fase 7, Dashboard y Quick Create;
  Fase 8, Archivados/compatibilidad/aislamiento legacy; Fase 9, solo eliminación
  con cero consumidores; Fase 10, wrappers/globals y consolidación.

### Siguiente corte propuesto

El roadmap no asigna número ni nombre a sesiones funcionales de Fase 5. Se
propone, sin presentarlo como decisión aprobada, **Extracción literal del estado
de selección de bloque de Biblioteca**: dar ownership explícito únicamente a
`selectedConjuntoId` y sus transiciones normalizadas, manteniendo `activeTab`,
pending, modales, render, Quick Create, `window.biblioteca` y
`window.explorerState` intactos. Es el corte conservador porque tiene un objeto
de estado pequeño, consumidores enumerados y una regresión manual delimitable.

## Riesgos priorizados

1. Globals implícitas y explícitas dependientes del orden de scripts.
2. Parsing de error incompatible entre dominios; una abstracción universal
   cambiaría mensajes, metadata o excepciones.
3. Dos wrappers de planeación por tema duplicados y fallback que el backend no
   filtra.
4. Delete normal, directo, de bloque y permanente tienen alcances distintos.
5. Archivados comparte services jerárquicos pero no contratos de delete con
   Biblioteca.
6. Generación JSON, regeneración, SSE y polling requieren preservar estado,
   métricas, callbacks y fallbacks; quedan fuera de 3.4.
7. `planeaciones.service.js` mezcla HTTP con estado local de Archivados.
8. Fetch directos viven en loaders visuales de páginas/UI, no en la API
   backend.
9. Export Excel conserva un endpoint frontend sin ruta backend actual.
10. API legacy tiene consumidores indirectos mediante services y no puede
    eliminarse por ausencia de uso en Biblioteca.
