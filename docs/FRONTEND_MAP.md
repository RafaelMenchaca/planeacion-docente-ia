# Mapa ejecutable del frontend

Estado observado en `refactor-front` durante la Fase 3, hasta la Sesión 3.8.
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
| Planeaciones | listado, detalle, tema, update, archivo | API/service | Activo/legacy/Archivados | Medio/alto | Después de separar flujos | Sesión posterior de Fase 3 |
| Anexos | tres lecturas GET | anexos API | Detalle activo; dos sin consumidor | Bajo | 3.4 completada y validada manualmente | Sesión de Fase 3 completada |
| Anexos | generación y regeneración | anexos API/Biblioteca | Generación activa; regeneración compatible | Alto | Separar pending y generación | Fase 4 |
| Listas | dos lecturas GET | API/service | Detalle activo; listado legacy | Bajo | 3.6 completada y validada manualmente | Sesión de Fase 3 completada |
| Exámenes | listado por unidad y detalle | API/service | Detalle activo; listado legacy | Bajo | 3.8 completada en código; validación manual pendiente | Sesión de Fase 3 implementada |
| Autenticación y headers | sesión y builders | core/services/API | Global | Alto | Después de dominios pequeños | Sesión posterior de Fase 3 |
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

## Sesión 3.8 completada en código

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
está pendiente: preview, descarga desde card, descarga desde preview y regresión
mínima no se declaran aprobadas.

Próxima sesión única, sin implementar:
**Sesión 3.9 — Auditoría de cierre de capa API frontend.** Fase 3 permanece en
progreso.

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
