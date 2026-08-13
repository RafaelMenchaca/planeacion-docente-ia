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
no mueve propiedades ni cambia shapes. La auditoría, sus validaciones estáticas
y su validación documental quedaron aprobadas y commiteadas en `525a21a`;
Fase 5 está formalmente abierta y En progreso. La implementación, las
validaciones estáticas y la validación manual de la Sesión 5.1 están aprobadas;
el corte quedó commiteado en `1b4c620`. La implementación, las validaciones
estáticas y la validación manual de la Sesión 5.2 están aprobadas; el corte quedó
commiteado en `f5bbfdd` y Fase 5 continúa En progreso. La Sesión 5.3 tiene
implementación, validaciones estáticas y validación manual aprobadas; quedó
commiteada en `f05e730`. La Sesión 5.4 está implementada, validada y commiteada
en `948d627`. La Sesión 5.5 tiene implementación y validaciones estáticas
aprobadas; su validación manual también quedó aprobada y quedó commiteada en
`3842f20`. La Sesión 5.6 tiene implementación, validaciones estáticas y
validación manual aprobadas; quedó commiteada en `d45a493`. La Sesión 5.7 tiene
implementación, validaciones estáticas y validación manual aprobadas; quedó
commiteada en `9b3c23d`. La Sesión 5.8 completó y aprobó la auditoría formal de
cierre sin cambios funcionales; Fase 5 está completada y Fase 6 permanece
pendiente y no iniciada.

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
| `selectedConjuntoId` | `null`; única fuente física en `bibliotecaState`; acceso encapsulado por `BibliotecaSelection`; ID normalizado normalmente a string | selección, loader/reconciliación, fachada de Quick Create y delete de bloque delegan en la superficie léxica | sidebar, detalle y comparación de delete delegan en la misma superficie | Fallback al primer bloque; se pierde en reload; delete conserva el ID crudo del primer elemento | DOM, render, delete, Quick Create | Biblioteca vigente; riesgo String/Number preservado; Sesión 5.1 aprobada y commiteada en `1b4c620` |
| `expandedIds` | `new Set()` | solo se confirmó `delete(tempId)` en reconciliación | Sin lector ni alta confirmados | Se crea al cargar y se pierde en reload | Sin relación DOM confirmada | No clasificado; no mover hasta confirmar consumidor; F5 |
| `activeTab` | `{}`; única fuente física en `bibliotecaState`; acceso encapsulado por `BibliotecaTabs`; mapa `batchId -> planeaciones|anexos|listas|examenes` | selección/tab, loader/reconciliación y finish de Quick Create delegan; generación y deletes llegan mediante selección/opciones del loader | `renderBibliotecaTabs` y `renderBibliotecaTabContent` delegan lectura | Default `planeaciones`; delete de bloque delega `delete`; sin storage; reload reinicia | DOM, render, delete, generación y Quick Create indirecto | Biblioteca vigente; claves coercionadas, múltiples transiciones y tabs desconocidos preservados; Sesión 5.2 aprobada y commiteada en `f5bbfdd` |
| `pendingBatchId` | `null`; ID de batch reutilizado por Quick Create | fachada `window.biblioteca` y Quick Create | payload de generación de Quick Create | Se fija antes de generar y se limpia en éxito/error/finally; reload reinicia | API/generación compartida | Estado mixto Biblioteca–Quick Create; riesgo de cruce; F5/7 |
| `pendingConjunto` | `null` o objeto temporal con `id/tempId/isPending/status_ui`, metadatos, contadores, `planeaciones`, `examenes` y `listas_cotejo` | fachada Quick Create, loader y reconciliación | sidebar, detalle y tab Planeaciones; progreso indirecto desde `explorerState.progress` | Nace antes de generar bloque nuevo; carga normal/reconciliación lo limpia; reload lo pierde | Render, generación y refetch | Estado mixto; shape parcial y sin job persistido; F5/7 |
| `pendingPlaneacionesByBatchId` | `{}`; mapa a `{items,error}`; items de Biblioteca y Quick Create no tienen exactamente el mismo shape; única fuente encapsulada por `BibliotecaPlaneacionesPending` | `PlaneacionGeneration`, fachada/finish de Quick Create y delete de bloque delegan en la superficie | tab Planeaciones y callbacks de progreso leen mediante `get` | Éxito sin errores/delete limpia; parcial/error permanece; reload/navegación pierde | SSE, render, delete y generación | Generación activa / estado mixto; shapes variables preservados; 5.7 aprobada y commiteada en `9b3c23d`; Quick Create F7 |
| `pendingExamenByBatchId` | `{}`; mapa a `{message,error}`; única fuente encapsulada por `BibliotecaExamPending` | `ExamGeneration` y delete de bloque delegan | tab Exámenes lee mediante `get` | Nace después del job; completed/delete limpia; failed/timeout permanece; reload pierde `jobId` y polling | Polling, render, delete y API | Generación activa; no reanuda job persistido; 5.7 aprobada y commiteada en `9b3c23d` |
| `pendingListaByBatchId` | `{}`; mapa a `{items,result,error}`; única fuente encapsulada por `BibliotecaListaPending` | `ListaCotejoGeneration` y delete de bloque delegan | tab Listas lee mediante `get` | Éxito espera 1500 ms y limpia/refetch; error queda; delete/reload limpia | Request largo, render y delete | Generación activa; no representa skipped por item; 5.7 aprobada y commiteada en `9b3c23d` |
| `anexosGenerating` | `{}`; mapa anidado `batchId -> planeacionId -> {titulo,materia,nivel,status,errorMessage}`; única fuente encapsulada por `BibliotecaAnexosPending` | `AnexoGeneration`, wrappers de generación/regeneración y delete de bloque delegan | tab/modal de Anexos leen mediante `getBatch`/`getItem` | Éxito por item limpia; refetch con algún éxito elimina el mapa completo; fallo total queda; reload limpia | Requests secuenciales, render, delete y generación | Generación activa; múltiples escritores y cleanup asimétrico preservados; 5.7 aprobada y commiteada en `9b3c23d` |
| `anexoModal` | `{open,conjuntoId,planeaciones,selectedPlaneacionIds,submitting,error}`; única fuente física en `bibliotecaState`, encapsulada por `BibliotecaAnexoModalState` | open/close, render, checkboxes y submit delegan sus transiciones en la superficie léxica | modal DOM lee mediante `getState()`; submit pasa snapshot a `AnexoGeneration` | Open reemplaza el objeto; close solo cambia `open`; reload limpia | DOM, pending, API y generación | Biblioteca vigente; render filtra/muta selección y sesión nula puede dejar `submitting`; estado F5, render F6; 5.3 aprobada y commiteada en `f05e730` |
| `listaModal` | `{open,conjuntoId,planeaciones,selectedPlaneacionIds,submitting,error}`; única fuente física en `bibliotecaState`, encapsulada por `BibliotecaListaModalState` | open/close, render, checkboxes y submit delegan sus transiciones en la superficie léxica | modal DOM lee mediante `getState()`; submit pasa snapshot a `ListaCotejoGeneration` | Open reemplaza; close solo `open`; render filtra selección; reload limpia | DOM, API y generación | Biblioteca vigente; sesión nula puede dejar `submitting`; estado F5, render F6; 5.4 aprobada y commiteada en `948d627` |
| `examModal` | `{open,conjuntoId,unidadId,planeaciones,selectedPlaneacionIds,selectedTypes,questionCounts,submitting,error}`; única fuente física en `bibliotecaState`, encapsulada por `BibliotecaExamModalState` | open/close, listeners de tipos/cantidades/planeaciones y submit delegan las mismas transiciones | modal DOM lee mediante `getState()`; submit pasa el payload protegido a `ExamGeneration` | Open reemplaza; close solo `open`; reapertura/reload reconstruyen o limpian el estado efímero | DOM, payload, job y polling indirectos | Biblioteca vigente; sesión nula puede dejar `submitting`; contratos y polling protegidos; 5.5 aprobada y commiteada en `3842f20`; estado F5, render F6 |
| `agregarModal` | `{open,conjuntoId,unidadId,materia,nivel,unidad,temas,error}`; única fuente física en `bibliotecaState`, encapsulada por `BibliotecaPlaneacionModalState`; no tiene `submitting` | open/close, altas/bajas de temas, actividades por momento, error y submit delegan acceso/transiciones | modal DOM lee mediante `getState()`; submit pasa snapshot a `PlaneacionGeneration` | Open reemplaza; close solo `open`; reapertura/reload reconstruyen o limpian estado efímero | DOM, SSE y generación indirectos | Biblioteca vigente; render captura/muta actividades; 5.6 aprobada y commiteada en `d45a493`; estado F5, render/eventos F6 |

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

### Sesión 5.1 — selección de bloque

`BibliotecaSelection` es un binding léxico de `biblioteca.page.js` con solo
`getSelectedConjuntoId()` y `setSelectedConjuntoId(value)`. No contiene una
copia del ID: ambos métodos leen o escriben la propiedad original de
`bibliotecaState`. La superficie no normaliza, valida ni aplica fallback; cada
sitio conserva la expresión previa.

Escritores delegados: conjunto temporal de Quick Create en
`window.biblioteca.setPendingConjunto`, `setSelectedConjunto`, reconciliación
optimista, finalización de planeaciones, selección objetivo/fallback del loader
y fallback del delete de bloque. Lectores delegados: `getSelectedConjunto`,
comparaciones de reconciliación, sidebar y actualización activa, snapshots y
validación del loader, y comparación del delete de bloque. Los modales y los
cuatro coordinadores de generación no leen el ID directamente: reciben el
`conjuntoId` del handler/dataset y seleccionan indirectamente mediante helpers o
la fachada vigente. Quick Create continúa consumiendo exclusivamente
`window.biblioteca`; el explorador legacy no tiene consumidor directo.

Se preservan `String(id)` en `normalizeBibliotecaId`, el rechazo de ID vacío en
`setSelectedConjunto`, `null` inicial/final, el ID crudo del primer conjunto en
delete, la elección del primer conjunto tras reload, `activeTab`, pending,
modales, render, eventos, mensajes y orden clásico de scripts. La implementación,
las validaciones estáticas y la validación manual de la Sesión 5.1 quedaron
aprobadas; commit `1b4c620`.

### Sesión 5.2 — ownership de `activeTab`

`BibliotecaTabs` es un binding léxico de `biblioteca.page.js` con tres
operaciones: `getActiveTab(conjuntoId)`, `setActiveTab(conjuntoId, tab)` y
`clearActiveTab(conjuntoId)`. El mapa no fue movido ni copiado; cada operación
lee, asigna o aplica `delete` directamente sobre `bibliotecaState.activeTab`.
La superficie no normaliza claves, valida nombres ni incorpora fallback.

Escritores delegados: conjunto temporal de Quick Create, selección explícita o
fallback de `setSelectedConjunto`, reconciliación optimista, finalización de
planeaciones y target/fallback del loader. Cleanups delegados: ID temporal al
reconciliar y batch eliminado en `BibliotecaBlockDelete`. Lectores delegados:
fallback de selección, ambos renders de tabs y snapshot del ID temporal. Los
cuatro coordinadores y deletes individuales siguen usando
`setSelectedConjunto`/`loadAndRenderBiblioteca`; Quick Create continúa usando
solo `window.biblioteca`.

Se conservan el objeto inicial `{}`, coerción normal de claves de objeto,
valores `planeaciones|anexos|listas|examenes`, aceptación de valores desconocidos
truthy, fallback `planeaciones`, persistencia por bloque durante la página,
pérdida tras reload y cleanup por `delete`. La implementación, las validaciones
estáticas y la validación manual están aprobadas; commit `f5bbfdd`.

### Sesión 5.3 — estado del modal de generación de anexos

`BibliotecaAnexoModalState` es un binding léxico de `biblioteca.page.js`. La
fuente física no se movió: continúa siendo `bibliotecaState.anexoModal`, con
valor inicial exacto `{open:false, conjuntoId:null, planeaciones:[],
selectedPlaneacionIds:[], submitting:false, error:""}`. La superficie expone
solo `getState()`, `open(state)`, `close()`,
`setSelectedPlaneacionIds(ids)`, `addSelectedPlaneacionId(id)`,
`setSubmitting(value)` y `setError(value)`. Cada operación lee o muta la misma
propiedad original; no existe copia, sincronización, global, archivo o script
nuevo.

El ciclo previo quedó confirmado y preservado:

1. `data-bib-action="abrir-modal-anexos"` aporta `conjuntoId`; el handler busca
   el conjunto y la apertura reemplaza todo el objeto con sus planeaciones y
   selección vacía. No se selecciona ninguna por defecto.
2. El modal se hace visible, se bloquea el scroll y después se renderiza, en el
   mismo orden previo. Cerrar, cancelar o pulsar el backdrop solo fija
   `open=false`, oculta el DOM y conserva las demás propiedades.
3. El render obtiene anexos persistidos y `anexosGenerating` del bloque. Excluye
   IDs ya cubiertos o en proceso, normaliza comparaciones con
   `normalizeBibliotecaId` y conserva la mutación que filtra
   `selectedPlaneacionIds` cuando alguno deja de ser válido.
4. Cada checkbox usa `data-bib-anexo-planid`; al marcar conserva el `push` del
   ID string si no existe y al desmarcar conserva el `filter` exacto. Luego
   vuelve a renderizar. Planeaciones con anexo aparecen deshabilitadas; sin
   planeaciones se conserva el mensaje de estado vacío y con todas cubiertas se
   conserva la alerta vigente.
5. Submit vuelve a excluir anexos persistidos/pending, normaliza, deduplica y
   exige al menos un ID. Sin selección conserva `Selecciona al menos una
   planeacion.`. Con selección fija `submitting=true`, limpia error, renderiza y
   después solicita sesión.
6. Una sesión nula conserva el riesgo previo de dejar `submitting=true`. Un
   error síncrono restablece `submitting=false`, conserva el mensaje previo y
   renderiza. No se añadió cleanup ni bugfix.
7. La delegación permanece una sola vez hacia
   `AnexoGeneration.generateFromBiblioteca({conjuntoId, selectedIds,
   planeaciones, accessToken})`. El coordinador conserva creación de pending,
   cierre, activación de Anexos, requests secuenciales, éxito parcial, cards,
   actualización optimista y refetch.
8. Reabrir —también tras cambiar de bloque— reemplaza el objeto y reconstruye
   planeaciones desde el conjunto actual. Delete individual se refleja tras su
   mutación/refetch; delete de bloque solo limpia sus mapas y no añade cleanup
   del modal. Reload o navegación recrean el estado inicial: el modal no
   persiste ni puede reconstruirse, aunque planeaciones y anexos guardados sí
   vuelven desde backend.

Lectores directos delegados: render y submit. Escritores delegados: reemplazo de
apertura, cierre, depuración desde render, altas/bajas de checkboxes,
validación, inicio de submit y catch. `AnexoGeneration` no lee el objeto
directamente: recibe el snapshot y llama el cierre existente. Selección de
bloque y tabs solo participan indirectamente mediante el dataset del botón y
`setSelectedConjunto(..., {tab:"anexos"})`. Quick Create, Dashboard,
`window.biblioteca`, `window.explorerState`, Archivados y legacy no tienen
consumidor del modal confirmado.

La propiedad y sus transiciones son Fase 5. HTML, clases, mensajes, botones,
checkboxes, listeners, `onBibliotecaClick`, inyección del modal, depuración
ejecutada desde render y render visual completo permanecen en Fase 6 y no se
reorganizaron. `anexosGenerating`, API, payload `{planeacion_id}`, generación,
regeneración, pending y otros modales quedaron intactos.

Estado de la Sesión 5.3: **Implementación aprobada; validaciones estáticas
aprobadas; validación manual aprobada; commit `f05e730`**. La validación manual
confirmó apertura, selección/reapertura, cancelación sin request ni pending,
cambio de bloque, generación individual y múltiple secuencial, pending correcto,
reutilización, delete/reapertura, reload/navegación, otros modales y regresión
acumulativa sin errores nuevos. Los escenarios opcionales sin planeaciones
elegibles y error/resultado parcial no se confirmaron y no bloquean.

### Sesión 5.4 — estado del modal de generación de listas de cotejo

`BibliotecaListaModalState` es una superficie léxica dentro de
`biblioteca.page.js`. La única fuente física continúa en
`bibliotecaState.listaModal`, con el valor inicial exacto `{open:false,
conjuntoId:null, planeaciones:[], selectedPlaneacionIds:[], submitting:false,
error:""}`. Expone solo `getState`, `open`, `close`,
`setSelectedPlaneacionIds`, `addSelectedPlaneacionId`, `setSubmitting` y
`setError`; no crea copia, global, archivo ni script.

`data-bib-action="generar-lista"` entrega el bloque vigente. Abrir reemplaza el
objeto con la referencia actual de `planeaciones` y selección vacía; el modal se
muestra antes de renderizar. Cerrar, cancelar y backdrop solo fijan `open=false`
y ocultan el DOM. El render conserva la exclusión por `lista.planeacion_id`, la
normalización de IDs, los checkboxes deshabilitados, mensajes y la depuración
que muta selección. Los listeners conservan `push`/`filter` y vuelven a
renderizar.

Submit vuelve a excluir listas persistidas, normaliza/deduplica IDs, conserva
`Selecciona al menos una planeacion.`, fija `submitting=true`, limpia error,
renderiza y luego solicita sesión. El riesgo de sesión nula con `submitting`
atascado permanece. `ListaCotejoGeneration` recibe exactamente `{conjuntoId,
selectedIds, planeaciones, accessToken}`; cierra, activa Listas, crea
`pendingListaByBatchId`, ejecuta un POST con `{planeacion_ids:selectedIds}` y,
en éxito, espera 1500 ms, limpia pending y hace refetch. En error conserva el
pending con mensaje. Ninguna de esas operaciones fue modificada.

Reabrir o cambiar de bloque reemplaza el estado; delete individual se refleja
en el conjunto/refetch y delete de bloque no cancela ni limpia explícitamente
el modal. Reload/navegación reinician el estado efímero; planeaciones y listas
persistidas sí se reconstruyen por backend. Selección de bloque y tabs solo son
consumidores indirectos; Quick Create, `window.biblioteca`,
`window.explorerState`, Archivados y legacy no consumen este modal.

Estado de 5.4: **implementación, validaciones estáticas y validación manual
aprobadas; commit `948d627`**. La validación confirmó apertura y planeaciones
correctas, selección/reapertura, cancelación sin request ni pending, cambio de
bloque, lista existente, generación individual y múltiple, pending/cleanup,
reutilización, delete/reapertura, reload/navegación, modal de anexos, otros
modales y regresión acumulativa sin errores nuevos. Evidencia resumida:
`[listas-cotejo] generate:start` con una planeación,
`[lista-cotejo] lista_generada_por_id` y
`[listas-cotejo] generate:success` con `created:1`, `skipped:0`.
Render visual, HTML, listeners y event delegation pertenecen a Fase 6 y
permanecen sin reorganizar.

El fallo externo `public.ia_metrics` ausente del schema cache permanece fuera
de alcance y no es una regresión de 5.4.

### Sesión 5.5 — estado del modal de generación de exámenes

`BibliotecaExamModalState` es una superficie léxica dentro de
`biblioteca.page.js`. La única fuente física continúa en
`bibliotecaState.examModal`, con el valor inicial exacto `{open:false,
conjuntoId:null, unidadId:null, planeaciones:[], selectedPlaneacionIds:[],
selectedTypes:[], questionCounts:{}, submitting:false, error:""}`. Expone
`getState`, `open`, `close`, `setSelectedTypes`, `addSelectedType`,
`setQuestionCount`, `setSelectedPlaneacionIds`, `addSelectedPlaneacionId`,
`setSubmitting` y `setError`; no crea copia, global, archivo ni script.

Abrir reemplaza el objeto con bloque, `unidad_id` y referencia de planeaciones
del conjunto; selección, tipos y cantidades comienzan vacíos. Cerrar, cancelar
y backdrop solo fijan `open=false`; reabrir o cambiar de bloque reemplaza el
objeto. Los listeners conservan IDs string, `push`/`filter`, los siete tipos y
sus defaults `5,5,3,1,1,3,1`; desactivar un tipo conserva su cantidad. El input
mantiene `min=1`, `max=30`, pero el handler solo acepta enteros mayores a cero;
no se añadió normalización. El modal no calcula ni muestra un total propio.

Submit conserva sus tres mensajes y orden: valida unidad, tipos y planeaciones;
fija `submitting=true`, limpia error, renderiza y después solicita sesión. El
payload sigue siendo `{unidad_id,batch_id,tipos_pregunta,
cantidades_pregunta,planeacion_ids}`; Biblioteca no envía `tema_ids`.
`ExamGeneration.generateFromBiblioteca` recibe una sola delegación con el mismo
payload, token y conjunto. POST, `job_id`, cierre, tab Exámenes,
`pendingExamenByBatchId`, polling cada 3000 ms con máximo 60 consultas,
`current_step`, terminales, refetch y errores permanecen intactos.

La búsqueda global no confirmó otro consumidor del modal vigente. El
`explorerState.examModal` legacy es un objeto distinto; Quick Create, previews,
Dashboard, Archivados y modales anteriores no consumen
`bibliotecaState.examModal`. Implementación y validaciones estáticas de 5.5:
**Aprobadas**. Validación manual: **Aprobada explícitamente por el usuario**.
Commit: **`3842f20`**. La corrida confirmó dos planeaciones, cuatro tipos y 12
preguntas solicitadas/guardadas, sin preguntas fallidas ni retries; contexto
correcto para “Python orientado a objetos” y “javascript para desarrollo web”.
Biblioteca conserva el payload `{unidad_id,batch_id,planeacion_ids,
tipos_pregunta,cantidades_pregunta}`, no envía `tema_ids` y backend continúa
resolviendo temas desde `planeacion_ids`. Render visual, HTML y eventos siguen
en Fase 6.

### Sesión 5.6 — estado del modal de Planeaciones y cierre de estados modales

`BibliotecaPlaneacionModalState` es una superficie léxica privada dentro de
`biblioteca.page.js`. La fuente física continúa siendo
`bibliotecaState.agregarModal`; expone únicamente `getState`, `open`, `close`,
`setTemas`, `getTemaByLocalId`, `addTema` y `setError`. No crea una copia,
global, archivo, persistencia ni abstracción compartida.

El valor inicial exacto permanece `{open:false, conjuntoId:null,
unidadId:null, materia:"", nivel:"", unidad:null, temas:[], error:""}`. No
existe `submitting`. Abrir rechaza primero un conjunto sin `unidad_id`; si es
válido, reemplaza el objeto con datos del conjunto y temas vacíos, muestra el
modal, bloquea scroll y renderiza. Cerrar, cancelar o backdrop solo fijan
`open=false`, ocultan el DOM y liberan scroll. Reabrir o cambiar de bloque
reemplaza todo el objeto.

Cada tema conserva `{localId,titulo,duracion,actividades_momentos}`. El alta usa
duración predeterminada 50, exige título y duración mínima 10; el atributo
visual mantiene máximo 300 sin validación superior en el handler. Los tres
momentos reales son `conocimientos_previos`, `desarrollo` y `cierre`. Render,
alta y submit capturan selects `data-bib-agr-actividad`; valores válidos mutan
el objeto anidado y valores vacíos/inválidos eliminan la clave. Eliminar tema
usa `data-bib-agr-remove`. Estas mutaciones permanecen en render/eventos y se
dejan para Fase 6.

Submit valida solo temas no vacíos con `Agrega al menos un tema.`, captura
actividades y construye `temasSnap` con `{titulo,duracion,
actividades_momentos,orden,generar_imagenes_en:[]}`. Delega una sola vez a
`PlaneacionGeneration.generateFromBiblioteca({conjuntoId,unidadId,materia,
nivel,temasSnap})`. El coordinador cierra, activa Planeaciones, crea
`pendingPlaneacionesByBatchId`, envía `{temas,materia,nivel,batch_id}` a
`POST /api/unidades/:unidadId/generar?stream=1`, procesa SSE y hace refetch. El
modal no envía `force_new_batch`; Quick Create lo usa únicamente al crear un
bloque nuevo. `duplicate_tema` continúa como `item_skipped`; conteos, fallback
JSON y cleanup no cambiaron.

Auditoría acumulativa de ownership modal:

| Modal | Fuente física | Superficie | Generador | Pending | Tab | Persistencia | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Planeaciones | `bibliotecaState.agregarModal` | `BibliotecaPlaneacionModalState` | `PlaneacionGeneration` | `pendingPlaneacionesByBatchId` | `planeaciones` | Ninguna | 5.6 aprobada, `d45a493` |
| Anexos | `bibliotecaState.anexoModal` | `BibliotecaAnexoModalState` | `AnexoGeneration` | `anexosGenerating` | `anexos` | Ninguna | 5.3 aprobada, `f05e730` |
| Listas | `bibliotecaState.listaModal` | `BibliotecaListaModalState` | `ListaCotejoGeneration` | `pendingListaByBatchId` | `listas` | Ninguna | 5.4 aprobada, `948d627` |
| Exámenes | `bibliotecaState.examModal` | `BibliotecaExamModalState` | `ExamGeneration` | `pendingExamenByBatchId` | `examenes` | Ninguna | 5.5 aprobada, `3842f20` |

Los cuatro modales conservan una sola fuente, superficies léxicas específicas y
generación/pending externos. No existe store o modal universal; Quick Create,
`window.explorerState` y `window.biblioteca` no fueron absorbidos ni ampliados.

### Sesión 5.7 — ownership consolidado de pending states de Biblioteca

Los cuatro sub-gates pasaron. Las superficies son léxicas, específicas y
operan sobre las propiedades originales de `bibliotecaState`:

| Dominio | Fuente y clave | Shape preservado | Superficie / operaciones | Creación y progreso | Éxito / error / cleanup |
| --- | --- | --- | --- | --- | --- |
| Planeaciones | `pendingPlaneacionesByBatchId[batchId]` | `{items,error}`; items pueden añadir `statusLabel` en Quick Create/reconciliación | `BibliotecaPlaneacionesPending`: `get`, `set`, `delete` | Biblioteca y Quick Create crean; SSE muta `pending/generating/ready/error/skipped` | `error_count===0` elimina; parcial/error permanece; `duplicate_tema` puede quedar skipped y limpiarse con cero errores |
| Anexos | `anexosGenerating[batchId][planeacionId]` | `{titulo,materia,nivel,status,errorMessage}` | `BibliotecaAnexosPending`: get/set/delete de batch e item | Lote y wrappers crean; requests continúan secuenciales | Éxito elimina item; algún éxito + refetch elimina batch; fallo total deja errores; cleanup asimétrico intacto |
| Listas | `pendingListaByBatchId[batchId]` | `{items,result,error}` | `BibliotecaListaPending`: `get`, `set`, `delete` | Se crea antes del POST único | Éxito espera 1500 ms, elimina y refetch; error reemplaza conservando items y permanece |
| Exámenes | `pendingExamenByBatchId[batchId]` | `{message,error}`; sin `jobId` | `BibliotecaExamPending`: `get`, `set`, `delete` | Nace tras `job_id`; `current_step` reemplaza message | completed elimina/refetch; failed o timeout reemplaza con error y permanece |

Delete de bloque conserva el orden Planeaciones → Exámenes → Listas → Anexos.
Reload/navegación siguen perdiendo los cuatro estados y no cancelan SSE,
requests, jobs o polling. Render usa getters equivalentes; Quick Create conserva
la fachada `window.biblioteca`, su staging y reconciliación. No se unificaron
shapes ni se creó `PendingState` universal. Implementación y validaciones
estáticas y validación manual aprobadas; commit `9b3c23d`.

### Sesión 5.8 — auditoría formal de cierre de Fase 5

La auditoría acumulativa no encontró segunda fuente física, store universal,
persistencia nueva, acceso directo residual no clasificado ni cambio funcional
en generación, pending, Quick Create, render/eventos, delete, legacy o backend.
El estado restante queda delimitado así: `conjuntos`, `loading`, `error` y
`searchQuery` pertenecen a coordinación de carga/render de Fases 6–7;
`pendingBatchId` y `pendingConjunto`, a Quick Create de Fase 7; `expandedIds`
permanece como deuda sin consumidor confirmado y no se mueve. Ninguno constituye
un bloqueo del objetivo canónico. Decisión: **A. Fase 5 puede cerrarse**. Fase 5
y la Sesión 5.8 quedan completadas; la auditoría de cierre queda aprobada. Fase
6 permanece pendiente y no iniciada.

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

## Fase 6 — Sesión 6.0: auditoría técnica/documental de apertura

### Gate post-merge e identidad

- Frontend: `refactor-front`, `HEAD 1254561` (`Merge refactor(frontend):
  complete phases 0–5`), igual a `main` y `origin/main`; working tree limpio al
  abrir la sesión. `origin/refactor-front` conserva `b5348dd`, el commit
  pre-merge; no es una incoherencia local.
- Backend solo lectura: `refactor-back`, `HEAD e08d6e4`, working tree limpio.
- Fases 0–5: Completadas. Fase 6: En progreso por apertura 6.0. Fases 7–10:
  Pendientes.
- Tipo: auditoría de apertura; implementación funcional no realizada.

Objetivo canónico: **dividir gradualmente render y eventos para que
`biblioteca.page.js` actúe como coordinador**, preservando markup, selectores,
`data-*`, listeners, UX y los contratos ya extraídos.

### Métricas de la superficie principal

Medidas sobre `js/pages/biblioteca.page.js` antes de modificar documentación:

| Indicador | Resultado | Método |
| --- | ---: | --- |
| Líneas | 2770 | conteo físico |
| Declaraciones `function`/`async function` | 80 | declaraciones nombradas; no incluye métodos shorthand de superficies ni closures |
| Declaraciones cuyo nombre empieza con `render` | 22 | incluye wrapper de compatibilidad de Anexos |
| Render/update/inject/show con DOM o HTML | 25 | 22 `render*` + `updateBibliotecaSidebarActive`, `injectBibliotecaModals`, `showBibConfirm` |
| `addEventListener` | 30 | ocurrencias en el archivo |
| Handler de propiedad | 1 | `searchInput.oninput` |
| Valores `data-bib-action` emitidos | 20 | 23 ramas del handler; 3 no tienen emisor vigente |
| Ocurrencias `data-bib-action` en markup | 23 | cuatro corresponden a `switch-tab`; comentarios excluidos |
| Operaciones DOM auditadas | ≈221 | ocurrencias de queries, dataset, clases, HTML/text/value/checked/disabled/style, create/append/remove |
| Queries principales | 53 `getElementById`, 21 `querySelector`, 10 `querySelectorAll`, 1 `closest` | ocurrencias, no nodos únicos |
| Escrituras HTML | 15 `innerHTML`, 1 `outerHTML` | `insertAdjacentHTML` y `replaceChildren`: 0 |
| Factories | 6 `createElement` + 6 `appendChild` | seis bases de modal inyectadas |

Responsabilidades principales mezcladas: estado/fachada, helpers, render no
modal, carga/refetch, delegación general, cuatro modales, confirmación, wrappers
de preview/download/delete, generación individual/regeneración de Anexos,
inyección DOM e inicialización.

### Orden real de scripts y bindings léxicos

`pages/dashboard.html` carga en este orden contractual:

```text
config → Supabase SDK/client → auth → utils
→ APIs/services de planeaciones, jerarquía, exámenes y listas
→ ListaCotejoGeneration → wordExport
→ features de Exámenes → features de Listas
→ components.private → shared.ui
→ APIs de Biblioteca/Anexos
→ features de Anexos → features de Planeaciones → block delete
→ dashboard.page.js → biblioteca.page.js → main.js
```

Los scripts son clásicos. Biblioteca consume al invocarse globals explícitos y
bindings léxicos de archivos anteriores. Los acoplamientos de render más
sensibles son `escapeHtml`, `renderProgressPill`, `statusLabelFromTone`,
`MOMENTOS_ACTIVIDADES_DIDACTICAS`, `buildActividadDidacticaOptions`,
`isActividadDidacticaValida` y `normalizeActividadesMomentos`. Las features de
generación/delete cargadas antes de `biblioteca.page.js` resuelven al ejecutarse
`bibliotecaState`, las superficies de Fase 5 y los renders globales. No se debe
reordenar scripts durante 6.0.

### Inventario de funciones de render y DOM

Las líneas son las observadas en la apertura y pueden desplazarse por esta
documentación. “Escribe estado” distingue mutación ejecutada por el cuerpo del
render de la mutación ejecutada por closures que el render enlaza.

| Archivo/líneas | Función | Responsabilidad y HTML | Estado leído / escrito | DOM, `data-*` y listeners | Llamadas/dependencias | Vigencia |
| --- | --- | --- | --- | --- | --- | --- |
| biblioteca 644–663 | `renderBibliotecaProgressCard` | factory HTML de card pending/error | no escribe; recibe status | produce `.biblioteca-item-row` | `renderProgressPill`, `escapeHtml` | Biblioteca vigente |
| 664–671 | `renderProgressItemHtml` | adapta item pending | lee item; no escribe | produce HTML | progress card | Vigente |
| 672–675 | `renderPendingSpinnerCard` | wrapper de spinner | no escribe | produce HTML | progress card | Sin consumidor confirmado |
| 676–684 | `renderBibliotecaSectionHeader` | header/acción de sección | no escribe | produce HTML | `escapeHtml` | Vigente |
| 707–777 | `renderPlaneacionesTab` | cards, pending, vacío y acciones | planeaciones, `explorerState.progress`, `BibliotecaPlaneacionesPending`; no escribe | `agregar/descargar/eliminar-planeacion`, IDs | helpers de pending | Vigente; Quick Create cruza pending |
| 778–853 | `renderExamenesTab` | cards, pending, vacío, tipos/temas | exámenes, `BibliotecaExamPending`; no escribe | `generar/ver/descargar/eliminar-examen` | helpers de examen/progress | Vigente |
| 854–944 | `renderAnexosTab` | cards reales/temporales, vacío | anexos, `BibliotecaAnexosPending`; no escribe | `abrir-modal`, `ver/descargar/eliminar-anexo` | progress card | Vigente |
| 945–1031 | `renderListasCotejoTab` | cards, pending, vacío | listas, `BibliotecaListaPending`; no escribe | `generar/ver/descargar/eliminar-lista` | progress card | Vigente |
| 1033–1061 | `renderBibliotecaTabs` | cuatro tabs y conteos | `BibliotecaTabs`; no escribe | `switch-tab`, `data-tab`, conjunto | no feature | Vigente |
| 1062–1073 | `renderBibliotecaTabContent` | selecciona renderer activo | `BibliotecaTabs`; no escribe | produce contenedor | cuatro tab renderers | Vigente |
| 1074–1105 | `renderConjuntoSidebarItem` | item/badge/meta/conteos | `BibliotecaSelection`, conjunto; no escribe | `select-conjunto`, conjunto | formatters | Vigente |
| 1106–1135 | `renderBibliotecaSidebar` | sidebar, search y empty filtrado | `searchQuery`, conjuntos/pending; no escribe | `#biblioteca-search`, lista/badge | sidebar item | Vigente |
| 1136–1149 | `renderBibliotecaDetailEmpty` | empty/CTA | no escribe | `crear-planeaciones` | Quick Create vía evento | Vigente |
| 1150–1190 | `renderBibliotecaDetail` | header, metadata, delete, tabs/content | conjunto/tabs; no escribe | `eliminar-bloque`, `#biblioteca-detail-panel` | tabs + active tab | Vigente |
| 1191–1201 | `updateBibliotecaSidebarActive` | patch de clase sin recrear | selección; no escribe estado | lee lista/dataset; `classList.toggle` | selección | Vigente |
| 1203–1210 | `renderBibliotecaDetailInPlace` | reemplaza panel derecho | selección; no escribe | `outerHTML`; fallback full render | detail/full render | Vigente; llamado por features |
| 1212–1226 | `renderBibliotecaSidebarListInPlace` | reemplaza lista/badge | query y conjuntos; no escribe | `innerHTML`, `textContent` | sidebar item/full render | Vigente; search |
| 1228–1280 | `renderBibliotecaContent` | loading/error o shell completo | loading, error, search, selección; no escribe estado | `#explorer-content.innerHTML`, clases; asigna `oninput`; restaura scroll | sidebar/detail | Vigente; global protegido |
| 1531–1653 | `renderBibliotecaAnexoCreateModal` | modal de selección de Anexos | modal, anexos/pending; **depura selección** | reemplaza card; close/cancel/submit y checkbox change recreados | state surfaces, find conjunto | Vigente; render + cleanup + wiring |
| 1861–1863 | `renderBibliotecaAnexoModal` | wrapper a `AnexoPreview.render` | no propio | no DOM propio | feature AnexoPreview | Sin consumidor externo confirmado; no eliminar |
| 1939–2077 | `renderBibliotecaExamModal` | tipos, cantidades y planeaciones | ExamModal; closures escriben tipos/cantidades/selección | reemplaza card; listeners recreados; contador parcial | `BIB_EXAM_TIPOS` | Vigente; render + wiring |
| 2162–2267 | `renderBibliotecaListaModal` | selección de Listas | modal/listas; **depura selección** | reemplaza card; listeners recreados | state surface | Vigente; render + cleanup + wiring |
| 2341–2487 | `renderBibliotecaAgregarModal` | temas/actividades Planeaciones | modal; closures mutan temas/actividades | reemplaza card; listeners recreados; `data-local-id/momento` | helpers léxicos de Dashboard | Vigente; render + wiring |
| 2624–2712 | `injectBibliotecaModals` | crea cinco modales de Biblioteca y confirmación | no escribe state | 6 `createElement`/append; 5 backdrops permanentes | close handlers/features | Vigente; DOM factory |
| 2714–2752 | `showBibConfirm` | render de confirmación Promise | no state de Biblioteca | reemplaza card; 3 listeners `{once:true}` por apertura | features de delete | Vigente; riesgo de listeners residuales |
| dashboard 4154–4175 | `renderExplorerContent` | fachada de render | `BIBLIOTECA_MODE`, legacy state | delega a `window.renderBibliotecaContent` o escribe explorer | Biblioteca/legacy | Compatibilidad activa; Fase 7 |
| dashboard 4176–4190 | `renderAll` | render agregado Dashboard | Quick Create + legacy/previews | múltiples DOM estables | render Biblioteca vía fachada | Compartido/legacy; Fase 7–8 |
| exam-preview 166–226 | `ExamPreview.render` | preview HTML de Exámenes | `window.explorerState.examPreview`/cache; no escribe | DOM estable de `layout.html` | helpers propios | Preview protegido, no Fase 6 |
| lista-preview 50–76 | `ListaCotejoPreview.render` | preview HTML de Lista | `window.explorerState.listaCotejoPreview`; no escribe | DOM estable de `layout.html` | helper body | Preview protegido, no Fase 6 |
| anexo-preview 55–148 | `AnexoPreview.render` + `renderAnexoBlock` | preview dinámico de Anexo | datos de anexo; no state | reemplaza card y recrea close/download | AppUI/AnexoDownload | Preview protegido, no Fase 6 |
| shared.ui 78–184 | `AppUI.openDownloadNameModal` | modal nombre de descarga | estado local Promise | inyecta/reemplaza DOM y listeners | descargas protegidas | Compartido protegido |

Helpers que producen contenido pero no escriben DOM: formatters de fechas/texto
(371–424), `getBibliotecaExamTypeLabel` (685),
`getBibliotecaExamTopics` (702) y los helpers de selección/filtrado. No deben
clasificarse como “puros” los coordinadores optimistas (528–637): mutan estado,
renderizan y/o refetchean, aunque alimenten la presentación.

`getFilteredConjuntos`, `isBibliotecaTechnicalUnidad` y
`renderPendingSpinnerCard` no tienen consumidor ejecutable encontrado.
`bibGenerarAnexo`, `bibRegenerarAnexo` y sus acciones tampoco tienen emisor
actual. Son ambigüedad/compatibilidad conservada, no autorización de borrado.

### Matriz de render

| Superficie | Archivo/funciones | DOM | Estado leído | Estado escrito durante render | Eventos/feature | Riesgo | Candidato |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Shell | biblioteca 1228 | `#explorer-content`, workspace/onboarding | loading/error/query/selección | ninguno | search + delegación documental | Alto por global/Quick Create | 6.1 render no modal |
| Sidebar | 1074–1135, 1191, 1212 | sidebar/list/badge/items | conjuntos, pendingConjunto, Selection, search | ninguno | `select-conjunto` | Medio | 6.1 |
| Search | 1106, 1212, 1267, 1360 | input/list/badge |/escribe `searchQuery` fuera del render | ninguno en render | `oninput` recreado, partial render | Medio | 6.1 presentación; 6.3 evento |
| Detalle/header | 1136–1190, 1203 | panel/header/meta | conjunto seleccionado | ninguno | crear Quick Create, block delete | Alto por contratos externos | 6.1 |
| Tabs | 1033–1073 | tabs/conteos/content | BibliotecaTabs | ninguno | `switch-tab` | Medio | 6.1 |
| Planeaciones | 644–777 | cards/pending/empty | recursos, pending y `explorerState.progress` | ninguno | PlaneacionGeneration/download/delete/Detalle | Alto por Quick Create | 6.1 solo render |
| Anexos | 854–944 | cards/pending/empty | recursos/pending | ninguno | modal/preview/download/delete | Medio | 6.1 solo render |
| Listas | 945–1031 | cards/pending/empty | recursos/pending | ninguno | modal/preview/download/delete | Medio | 6.1 solo render |
| Exámenes | 778–853 | cards/pending/empty | recursos/pending | ninguno | modal/preview/download/delete | Medio | 6.1 solo render |
| Pending visual | 644–675 + cuatro tabs | filas/pills/error | cuatro Pending surfaces + progress Quick Create | ninguno | coordinadores protegidos escriben y renderizan | Alto | 6.1 presentación únicamente |
| Modal Anexos | 1508–1704 | modal/card/checkboxes | ModalState, recursos, pending | cleanup selección | AnexoGeneration | Alto | 6.2 literal; no purificar aún |
| Modal Listas | 2139–2310 | modal/card/checkboxes | ModalState/listas | cleanup selección | ListaCotejoGeneration | Alto | 6.2 literal |
| Modal Exámenes | 1913–2137 | modal/card/checks/counts | ModalState | closures escriben state | ExamGeneration | Alto | 6.2 literal |
| Modal Planeaciones | 2313–2581 | modal/temas/inputs/selects | ModalState + helpers Dashboard | closures mutan temas/actividades | PlaneacionGeneration | Muy alto por script order | 6.2 con pruebas fuertes |
| Confirmación | 2624–2752 | modal dinámico | local Promise | ninguno | cinco deletes protegidos | Alto | 6.2; preservar semántica |
| Loading/error | 1228–1252 | reemplaza content | loading/error | ninguno | retry → loader | Medio | view en 6.1; loader queda Fase 7 |
| Previews/download name | features + shared UI | DOM de layout/dinámico | explorerState/datos | estados en open/close, no render | preview/download protegidos | Alto | Fuera de Fase 6 |

### Superficies DOM principales

| Selector/nodo | Owner/writers | Readers/evento | `data-*` | ¿Se recrea? / supervivencia |
| --- | --- | --- | --- | --- |
| `#dashboard-layout-root` | Dashboard `injectComponent` | init | — | layout se inyecta una vez |
| `#explorer-content` | Biblioteca full render; fachada legacy | click/change/keydown Dashboard + document click Biblioteca | descendientes `data-bib-action` | contenido se recrea; listeners de ancestro sobreviven |
| `.biblioteca-sidebar-list` | full/partial render | scroll, active patch, delegated click | `select-conjunto`, conjunto | lista se recrea; no listeners directos propios |
| `#biblioteca-search` | full render | `onBibliotecaSearch` | — | se recrea; `oninput` se reasigna |
| `#biblioteca-detail-panel` | full render/`outerHTML` | delegated actions | action, IDs, tab | se recrea; delegación sobrevive |
| `.biblioteca-tabs/.biblioteca-tab-content` | detail render | document click | `switch-tab`, conjunto, tab | se recrean con cada tab/bloque |
| `.biblioteca-items-list` | render de dominio | document click | action + resource/conjunto IDs | se recrea; delegación sobrevive |
| cuatro modal roots | `injectBibliotecaModals` | open/close | backdrops por ID | root estable; card interna se recrea |
| `.biblioteca-modal-card` | cuatro renderers, preview Anexo, confirm | listeners directos | modal-specific | contenido se recrea; listeners deben recrearse |
| preview Examen/Lista | `components/layout.html` + features | Dashboard listeners estables | IDs | roots estables; body HTML cambia |
| Quick Create | `components/layout.html` + Dashboard | listeners Dashboard | `data-quick-*` | protegido; cruza render por fachada |

No se usan `replaceChildren` ni `insertAdjacentHTML` en la superficie auditada.
La mayor parte de la creación usa templates con `innerHTML`; solo las seis
bases de modal se construyen con `createElement`/`appendChild`.

### Matriz `data-bib-action`

| Acción | Elemento | Handler/estado | Coordinador llamado | Render posterior | Riesgo de extracción |
| --- | --- | --- | --- | --- | --- |
| `select-conjunto` | item sidebar | set Selection/Tab default | ninguno | active patch + detail | Medio |
| `switch-tab` | cuatro botones tab | set Selection/Tabs | ninguno | detail in place | Medio |
| `agregar-planeacion` | CTA Planeaciones | find conjunto/open ModalState | modal Planeaciones | modal render | Alto |
| `generar-examen` | CTA Exámenes | find/open ExamModalState | modal Exámenes | modal render | Alto |
| `generar-lista` | CTA Listas | find/open ListaModalState | modal Listas | modal render | Alto |
| `abrir-modal-anexos` | CTA Anexos | find/open AnexoModalState | modal Anexos | modal render | Alto |
| `crear-planeaciones` | empty detail CTA | no state Biblioteca directo | `openQuickCreatePanel` | Dashboard/Quick Create | Muy alto; Fase 7 |
| `retry` | error CTA | loader | `loadAndRenderBiblioteca` | full render antes/después | Alto; loader frontera 7 |
| `ver-examen` | card | `explorerState.examPreview` en feature | `ExamPreview` | preview feature | Alto protegido |
| `ver-lista` | card | `explorerState.listaCotejoPreview` | `ListaCotejoPreview` | preview feature | Alto protegido |
| `ver-anexo` | card | modal dinámico | `AnexoPreview` | preview feature | Alto protegido |
| `descargar-planeacion` | card | datos remotos/local modal | `PlaneacionDownload` | modal descarga | Alto protegido |
| `descargar-examen` | card | conjunto/cache | `ExamDownload` | modal descarga | Alto protegido |
| `descargar-lista` | card | detalle remoto | `ListaCotejoDownload` | modal descarga | Alto protegido |
| `descargar-anexo` | card | detalle remoto | `AnexoDownload` | modal descarga | Alto protegido |
| `eliminar-bloque` | header | conjuntos/Selection/Tabs/4 pending | `BibliotecaBlockDelete` | full + refetch | Muy alto protegido |
| `eliminar-planeacion` | card | recursos/conteos/Selection | `PlaneacionDelete` | detail + refetch | Alto protegido |
| `eliminar-examen` | card | recursos/conteos/Selection | `ExamDelete` | detail + refetch | Alto protegido |
| `eliminar-lista` | card | recursos/conteos/Selection | `ListaCotejoDelete` | detail + refetch | Alto protegido |
| `eliminar-anexo` | card | recursos/conteos/Selection | `AnexoDelete` | detail + refetch | Alto protegido |
| `toggle-expand` | sin emisor encontrado | equivale a selección | ninguno | active + detail | Ambiguo; conservar |
| `generar-anexo` | sin emisor encontrado | pending/optimista | API directa local | detail + refetch | Ambiguo; conservar |
| `regenerar-anexo` | sin emisor encontrado | pending | API directa local | detail/refetch | Ambiguo; conservar |

Los primeros 20 valores son los emitidos por el markup actual. Las últimas tres
ramas existen en `onBibliotecaClick` pero no aparecen en JS/HTML ejecutable como
atributo emisor. No se clasifican como eliminables.

### Matriz de eventos y listeners

| Evento | Elemento/data | Handler | Estado/feature | DOM estable | Permanente / recreado | Riesgo |
| --- | --- | --- | --- | ---: | --- | --- |
| click | `document` + `[data-bib-action]` | `onBibliotecaClick` | matriz anterior | Sí | permanente al init; init no tiene guard propio | Alto |
| input | `#biblioteca-search` | `onBibliotecaSearch` | `searchQuery` + sidebar partial | No | propiedad reasignada por full render; no acumula | Medio |
| click | 5 backdrops inyectados | close de cada modal | cuatro ModalState/AnexoPreview | Sí | una vez al inyectar | Medio |
| click/change | card modal Anexos | close/cancel/submit/checkbox | AnexoModalState | No | recreado con `innerHTML` | Alto |
| click/change/input | card modal Exámenes | close/cancel/submit/type/count/plan | ExamModalState | No | recreado con `innerHTML` | Alto |
| click/change | card modal Listas | close/cancel/submit/checkbox | ListaModalState | No | recreado con `innerHTML` | Alto |
| click/keydown/change | card modal Planeaciones | close/cancel/add/submit/remove/actividad | PlaneacionModalState | No | recreado con `innerHTML` | Muy alto |
| click | confirm buttons/backdrop | closure `close(result)` | Promise de delete | botones no; backdrop sí | tres `{once}` por apertura | Alto; backdrop puede conservar listeners no disparados |
| click | preview Anexo dynamic | feature close/download | AnexoPreview/Download | No | recreado | Alto protegido |
| click/change/keydown/submit | Quick Create | Dashboard handlers | `explorerState.quickCreate` | Sí/parcial | permanente, guard `isDashboardBound` | Fuera de Fase 6 |
| click/change/keydown | `#explorer-content` | Dashboard legacy handlers | no action para `data-bib-action` | ancestro estable | permanente y activo aun en modo Biblioteca | Alto; Fase 7 |
| keydown | `document` | Dashboard Escape | previews/Quick Create/legacy modals | Sí | permanente | Fase 7; no cierra los cuatro modales Biblioteca |
| pageshow | `window` | refresh Dashboard | refresh/reconcile | Sí | permanente | Fase 7 |
| click/keydown | `document` | private chrome | navbar/profile | Sí | permanente con guard | Compartido |

Hallazgo de listener: `showBibConfirm` agrega un listener `{once:true}` al
backdrop estable en cada apertura. Si el usuario cierra con Cancelar/Eliminar,
ese listener de backdrop no se dispara ni se retira y puede quedar acumulado
para una apertura posterior. `AppUI.openDownloadNameModal` tiene el mismo
patrón entre sus alternativas de cierre. Se documenta; no se corrige en 6.0 ni
se debe mezclar su corrección con una extracción literal.

### Mutaciones durante render

| Clasificación | Función | Mutación |
| --- | --- | --- |
| A. puramente render | factories/tabs/cards/sidebar/detail/loading/error | leen estado y producen HTML/DOM sin escribir estado |
| D. render + event wiring | `renderBibliotecaContent` | reasigna `oninput` al input recién creado; restaura scroll DOM |
| C + D. render + cleanup + wiring | `renderBibliotecaAnexoCreateModal` | filtra selección contra planeaciones disponibles y escribe `selectedPlaneacionIds`; luego enlaza listeners |
| C + D. render + cleanup + wiring | `renderBibliotecaListaModal` | filtra selección contra listas existentes y escribe `selectedPlaneacionIds`; luego enlaza listeners |
| D. render + wiring | `renderBibliotecaExamModal` | el cuerpo no escribe; closures cambian tipos, counts y selección; type change rerenderiza |
| D. render + wiring | `renderBibliotecaAgregarModal` | el cuerpo no escribe; closures cambian temas/actividades; remove rerenderiza |
| D. render + wiring | Anexo preview / confirm / download modal | reemplazan HTML y enlazan acciones locales |

No se encontró API, download, delete o generación ejecutada dentro de los
renderers de cards/shell. La lógica de negocio está en handlers, submitters o
features; la excepción crítica es el cleanup de selección en los dos modales.

### Dependencias y ciclos

```text
render no modal → BibliotecaSelection/BibliotecaTabs/4 Pending
render Planeaciones → explorerState.progress (Quick Create)
render modal → ModalState → listener directo → ModalState → render modal
document click → Selection/Tabs o feature → render parcial/completo
generation → Pending → render → API/SSE/poll/delay → refetch → conjuntos → render
delete → confirm DOM → API → mutación optimista → render parcial → refetch → render
Quick Create → window.biblioteca → pending/selección/render → SSE → finish/refetch → render
Dashboard renderExplorerContent → window.renderBibliotecaContent
```

Ciclos relevantes: `render → listener → state → render`,
`feature → pending → render → refetch → state → render` y
`Quick Create → fachada Biblioteca → render → finish → refetch → render`.

### Límites y clasificación

- **Fase 6:** presentación no modal, factories HTML, DOM patches, render y
  wiring de los cuatro modales, búsqueda, delegación `data-bib-action` y
  visualización de loading/error.
- **Fase 7:** `loadAndRenderBiblioteca` como loader/navegación/reconciliación,
  Quick Create, `pendingBatchId`, `pendingConjunto`, `explorerState`, bindings
  compartidos de Dashboard, `renderExplorerContent`, listeners Dashboard y
  desacoplamiento bidireccional.
- **Compatibilidad activa:** `window.biblioteca`,
  `window.renderBibliotecaContent`, previews Examen/Lista que usan DOM de
  `layout.html`, wrappers y globals de features.
- **Legacy visual:** árbol, breadcrumbs y render por nivel. Sus listeners se
  registran, pero `hydrateExplorerData()` no se ejecuta en la ruta vigente.
- **Ambigüedad conservada:** tres acciones sin emisor y helpers sin consumidor;
  no eliminar ni mover como supuesto legacy.

### Contratos protegidos

La Fase 6 no puede romper ni rediseñar:

- `BibliotecaSelection`, `BibliotecaTabs`, cuatro ModalState y cuatro Pending;
- `window.biblioteca`, `window.explorerState` y Quick Create;
- `PlaneacionGeneration`, `AnexoGeneration`, `ListaCotejoGeneration` y
  `ExamGeneration`;
- preview, download, delete, block delete, capa API y services;
- payloads, IDs, SSE, polling, delay de 1500 ms, intervalos/timeouts y mensajes;
- los 20 `data-bib-action` emitidos, demás `data-*`, DOM observable y orden de
  scripts;
- `js/ui/wordExport.js` y backend.

### Hallazgos y riesgo de extracción

- **Muy alto:** modal Planeaciones por bindings léxicos de Dashboard; block
  delete/Quick Create por ciclos; cualquier movimiento de loader o fachada.
- **Alto:** árbol no modal completo por cantidad de consumidores; modales por
  cleanup y recreación de listeners; confirmación por listeners alternativos;
  delegación global por 23 ramas y features protegidos.
- **Medio:** sidebar/search/tabs de forma aislada, aunque dividirlos en
  micro-sesiones no aporta una frontera mejor.
- Queries DOM repetidas y templates `innerHTML` son deuda observada, no tareas
  automáticas. No se halló `insertAdjacentHTML`/`replaceChildren`.
- `initBiblioteca` no tiene guard de binding. La ruta confirmada lo llama una
  vez; no se agrega guard en la auditoría.
- `renderBibliotecaContent` es llamado por Biblioteca, features y Dashboard/
  Quick Create; su firma/global es contractual.

### Candidatos agrupados y roadmap técnico

| Sesión | Corte coherente | Archivos candidatos | Riesgo | Validación principal |
| --- | --- | --- | --- | --- |
| 6.1 | Render no modal completo: helpers visuales, pending, cards de cuatro dominios, shell/sidebar/search/detail/tabs y patches parciales | nuevo owner en `js/features/biblioteca/`, `biblioteca.page.js`, `dashboard.html` solo para carga | Alto | markup/data exactos; carga, selección, search, tabs, cuatro cards/pending, partial/full render, Quick Create smoke |
| 6.2 | DOM y render de modales: injection, Planeaciones/Anexos/Listas/Exámenes y confirmación; conservar cleanup y wiring literal | owner de modal de Biblioteca + page/script order | Muy alto | open/close/backdrop/cancel/inputs/checks/re-render de cuatro modales y cinco deletes; no generación real obligatoria si no cambia coordinador |
| 6.3 | Ownership de eventos: delegación general, search y bindings modales ya estabilizados; preservar ramas sin emisor | owner de eventos + page | Alto | un clic/una acción, listeners tras full/partial render, modales, preview/download/delete/generation smoke, sin requests dobles |
| 6.4 | Auditoría formal de cierre | solo documentación | Alto acumulativo | búsqueda global, script order, suite, matriz manual acumulativa y decisión de cierre |

No se fija todavía el nombre de archivos. `biblioteca-render.js`,
`biblioteca-modal-render.js` y `biblioteca-events.js` son nombres plausibles,
pero el corte debe decidir namespace y posición exacta después de un smoke de
bindings clásicos.

**Primera sesión recomendada: 6.1 — render no modal completo.** Es un corte
grande y reversible de presentación, cubre el árbol que actualmente se
reemplaza como unidad y evita introducir callbacks artificiales entre shell y
cards. No mueve estado, carga, eventos, modales, Quick Create, generación,
features ni backend. La estrategia recomendada es estabilizar primero el
render, luego los modales y finalmente el ownership de eventos.

## Fase 6 — Sesión 6.1: extracción consolidada del render no modal

### Reconciliación y decisión

- La auditoría 6.0 está completada y commiteada en `e27cb0a`; se corrigió la
  referencia documental que aún decía “commit pendiente”.
- Decisión: **A. Extracción consolidada implementada.** La validación manual de
  6.1 fue aprobada y el corte quedó commiteado en `cef834e`.
- Owner nuevo: `js/features/biblioteca/biblioteca-render.js`, script clásico
  cargado entre `biblioteca.page.js` y `main.js`.

### Inventario movido y retenido

| Clasificación | Funciones/superficie | Owner después de 6.1 |
| --- | --- | --- |
| A — movida | `renderBibliotecaProgressCard`, `renderProgressItemHtml`, `renderPendingSpinnerCard`, `renderBibliotecaSectionHeader` | `biblioteca-render.js` |
| A — movida | `getBibliotecaExamTypeLabel`, `getBibliotecaExamTopics`; cuatro renders de tabs de recursos | `biblioteca-render.js` |
| A — movida | tabs, tab activo, item/lista de sidebar, detalle/empty y `renderBibliotecaContent` | `biblioteca-render.js` |
| A — movida | `updateBibliotecaSidebarActive`, `renderBibliotecaDetailInPlace`, `renderBibliotecaSidebarListInPlace` | `biblioteca-render.js` |
| B — retenida | helpers compartidos, `getAllConjuntosForSidebar`, selección, optimismo, finish, `loadAndRenderBiblioteca`, `initBiblioteca` | `biblioteca.page.js` |
| C — retenida | cuatro renderers modales, injection y `showBibConfirm` | `biblioteca.page.js`; candidato 6.2 |
| D — retenida | `onBibliotecaClick`, `onBibliotecaSearch` y listeners directos/documentales | `biblioteca.page.js`; candidato 6.3 |
| E/F — retenida | Quick Create/loader, `window.explorerState`, compatibilidad y ramas sin emisor | propietarios actuales; Fase 7/compatibilidad |

Se movieron 20 declaraciones de función como un bloque literal. Los helpers de
fecha/escape y derivación que también consumen loader o modales permanecen en
la página para no convertir el owner visual en propietario de coordinación ni
adelantar 6.2.

### Contrato y consumidores

| Superficie | Firma/retorno | Efectos y consumidores | Compatibilidad |
| --- | --- | --- | --- |
| `renderBibliotecaContent()` | sin parámetros; retorno implícito | reemplaza `#explorer-content`, alterna workspace/onboarding, enlaza el mismo `oninput`, restaura scroll; loader, generación y block delete | mismo nombre global |
| `window.renderBibliotecaContent` | alias de la función anterior | `dashboard.page.js`/Quick Create y compatibilidad | exposición y timing conservados antes de `DOMContentLoaded` |
| `renderBibliotecaDetailInPlace()` | sin parámetros | reemplaza `#biblioteca-detail-panel`; deletes/generación de recursos y eventos | mismo global implícito |
| sidebar partial/active | sin parámetros | búsqueda, selección y fachada `window.biblioteca` | nombres y timing conservados |

El DOM generado mantiene literalmente strings, condiciones, loops, fallbacks,
orden, IDs, clases, roles, `aria-*`, atributos disabled/hidden, textos y 20
valores emitidos de `data-bib-action`. `onBibliotecaClick` conserva sus 23
ramas, incluidas `toggle-expand`, `generar-anexo` y `regenerar-anexo` sin emisor
confirmado. El render sigue leyendo pending mediante las cuatro superficies de
Fase 5 y `window.explorerState.progress.items` solo para el feedback compatible
de Quick Create.

### Métricas y límites

| Indicador | Antes | Después |
| --- | ---: | ---: |
| Líneas `biblioteca.page.js` | 2770 | 2125 |
| Líneas owner nuevo | — | 657 |
| Funciones movidas / retenidas | — | 20 / 59 |
| Render/update retenidos en page | 25 superficies totales auditadas | 5 declaraciones modales/compat; injection/confirm permanecen |
| Operaciones DOM en page / owner | ≈221 en page | 165 / 24 ocurrencias con el patrón de medición 6.1 |
| Listeners / `oninput` | 30 / 1 | 30 / 1, sin reorganizar |
| Acciones emitidas / ramas | 20 / 23 | 20 / 23 |

Loading/error solo cambió de propietario visual: el loader y los escritores de
estado siguen en la página. Search solo movió markup/filtro visual: el handler y
la escritura de `searchQuery` siguen en la página. Quick Create, reconciliación,
generación, polling/SSE, API, payloads, previews, downloads, deletes,
`wordExport.js` y backend quedaron intactos.

### Evidencia de 6.1

- Comparación literal del bloque movido contra `HEAD`: PASS.
- Smoke técnico aislado: loading, error, sin bloques, search match/no match,
  selección, cuatro tabs empty/con recursos/con pending, feedback de Quick
  Create y tres patches: PASS.
- `node --check` de ambos JS, Jest (1 suite/2 tests) y conservación de acciones:
  PASS. La prueba manual confirmó carga, navegación, cuatro generaciones,
  delete de bloque y ausencia de errores nuevos visibles o de consola.
- Riesgos preservados: dependencia por orden clásico, `oninput` recreado por
  full render, globals de patches, lectura de `explorerState.progress` y falta
  de cobertura DOM persistente. No se corrigieron en esta extracción.

## Fase 6 — Sesión 6.2: DOM y render consolidado de modales

### Gate, sub-gates y owner

- Gate: `refactor-front` limpio en `cef834e`; backend de solo lectura limpio en
  `refactor-back`/`e08d6e4`.
- Manual 6.1: aprobada según el recorrido acumulativo informado por el usuario.
- Sub-gates: Planeaciones **PASS** (Muy alto), Anexos **PASS** (Alto), Listas
  **PASS** (Alto), Exámenes **PASS** (Alto), Confirmación **PASS** (Alto).
- Decisión: **A. Extracción consolidada implementada.** Reconciliación 6.3:
  manual aprobada y commit `ef3364f`.

Owner: `js/features/biblioteca/biblioteca-modal-render.js`, script clásico
cargado después de los dos scripts de Biblioteca y antes de `main.js`:

```text
dashboard.page.js → biblioteca.page.js → biblioteca-render.js
→ biblioteca-modal-render.js → main.js
```

### Auditoría por superficie

| Superficie | DOM y mutación | Wiring local | Dependencias preservadas | Riesgo/resultado |
| --- | --- | --- | --- | --- |
| Planeaciones | card, temas/form/selects/error; closures mutan `actividades_momentos` y remove escribe temas | close/cancel/add/Enter/submit, remove y activity change | PlaneacionModalState, helpers escape/find y cuatro bindings Dashboard | Muy alto / PASS literal |
| Anexos | card/checkboxes/badges/empty/error; render depura IDs no disponibles | close/cancel/submit y change con re-render | AnexoModalState, AnexosPending, conjunto/normalización | Alto / PASS literal |
| Listas | card/checkboxes/badges/note/empty/error; render depura IDs no disponibles | close/cancel/submit y change con re-render | ListaModalState, listas persistidas, conjunto/normalización | Alto / PASS literal |
| Exámenes | siete tipos, counts 1–30, planeaciones, counter/error/disabled | close/cancel/submit, type/count/plan changes | ExamModalState, `BIB_EXAM_TIPOS`, escape | Alto / PASS literal |
| Confirmación | Promise, card, scroll lock y resultado | cancel/ok/backdrop con `{ once:true }` | cinco deletes consumidores | Alto / PASS literal |
| Inyección | seis roots, cards y backdrops; incluye root compatible de preview Anexo | cinco backdrop listeners al crear roots | callbacks close retenidos en page | Alto / PASS literal |

### Ownership y contratos

Se movieron seis funciones (`renderBibliotecaAgregarModal`,
`renderBibliotecaAnexoCreateModal`, `renderBibliotecaListaModal`,
`renderBibliotecaExamModal`, `showBibConfirm`, `injectBibliotecaModals`) y la
constante íntima `BIB_EXAM_TIPOS`. Sus nombres globales siguen resolviendo para
open/close/submit, features de delete e `initBiblioteca`; no se amplió
`window.biblioteca`.

Permanecen en `biblioteca.page.js` todas las funciones open/close, cuatro
submit coordinators, `addBibliotecaAgregarTema`, previews, generación/
regeneración compatible, loader, estado y `onBibliotecaClick`. No se alteraron
ModalState, Pending, coordinadores, requests, payloads, SSE/polling, delays,
Quick Create, Dashboard, render 6.1, CSS, API ni backend.

DOM y listeners se compararon por función contra `HEAD`: mismos IDs, clases,
jerarquía, textos, `data-*`, labels, placeholders, tipos/min/max, checked,
disabled, spinner/error/empty, targets, orden, closures y timing. El hallazgo de
listeners de backdrop `{ once:true }` potencialmente acumulables se preserva
sin corrección.

### Métricas y evidencia

| Indicador | Antes de 6.2 | Después |
| --- | ---: | ---: |
| Líneas `biblioteca.page.js` | 2125 | 1465 |
| Líneas owner modal | — | 683 |
| Funciones movidas / helper íntimo | — | 6 / 1 constante |
| Listeners generales / modales | 1 / 29 en page | 1 en page / 29 en owner |
| Operaciones DOM page / owner modal | 165 en page | 61 / 104 |
| Scripts nuevos en 6.2 | — | 1 |

Comparación literal de cinco superficies, tipos e inyección: PASS. Smoke JSDOM
sin red de los cuatro modales, confirm/cancel/backdrop e inyección: PASS.
`node --check`, Jest (1 suite/2 tests) y `git diff --check`: PASS. La validación
manual posterior aprobó carga, recursos, cuatro modales/generaciones, deletes
individual/de bloque y ausencia de regresiones; commit real `ef3364f`.

## Fase 6 — Sesión 6.3: ownership consolidado de eventos

### Gate y clasificación

- Gate: `refactor-front` limpio en `ef3364f`; backend limpio y de solo lectura
  en `refactor-back`/`e08d6e4`.
- 6.2: validación manual aprobada y commit real `ef3364f`.
- Decisión: **A. Ownership consolidado implementado.** Manual 6.3 pendiente;
  Fase 6 sigue En progreso y 6.4 no está iniciada.

| Listener/superficie | Clasificación | Owner después de 6.3 | Contrato |
| --- | --- | --- | --- |
| `document.click → onBibliotecaClick` | A Biblioteca estructural | `biblioteca-events.js` | bubble, sin options/guard, mismo momento dentro de `initBiblioteca` |
| `searchInput.oninput → onBibliotecaSearch` | A Biblioteca estructural | `biblioteca-events.js`; invocado desde render | misma propiedad/timing, escritura literal de `event.target.value` y partial render |
| 29 listeners de cards/inputs/backdrops de overlays | B modal local | `biblioteca-modal-render.js` | intactos desde 6.2 |
| llamadas preview/download/delete/generation | C features protegidos | features/coordinadores actuales | event owner solo despacha mismas funciones |
| click/change/keydown/pageshow de Dashboard | D/E Dashboard/Quick Create | `dashboard.page.js` | no modificados |
| ramas `toggle-expand`, `generar-anexo`, `regenerar-anexo` | F/G legacy/compatibilidad | `biblioteca-events.js` | conservadas sin inventar emisores |

### Matriz compacta de `data-bib-action`

| Grupo | Acciones | Dispatch preservado |
| --- | --- | --- |
| Selección/tabs | `select-conjunto`, `toggle-expand`, `switch-tab` | selección, active sidebar y detail partial |
| Apertura/bridge/carga | `agregar-planeacion`, `abrir-modal-anexos`, `generar-lista`, `generar-examen`, `crear-planeaciones`, `retry` | cuatro open coordinators, Quick Create bridge y loader |
| Preview | `ver-examen`, `ver-lista`, `ver-anexo` | wrappers protegidos |
| Download | `descargar-planeacion`, `descargar-examen`, `descargar-lista`, `descargar-anexo` | mismos wrappers/features |
| Generación compatible | `generar-anexo`, `regenerar-anexo` | coordinadores históricos conservados |
| Delete | `eliminar-bloque`, `eliminar-planeacion`, `eliminar-examen`, `eliminar-lista`, `eliminar-anexo` | mismos coordinadores/confirm/refetch |

El baseline y resultado son 20 valores emitidos y 23 ramas en el mismo orden.
El matching continúa en `event.target.closest("[data-bib-action]")`, con early
return si no existe y lectura anticipada de los mismos siete campos dataset.
No hay awaits, catches, `preventDefault` ni `stopPropagation` que trasladar.

### Owner, integración y coexistencia

`js/features/biblioteca/biblioteca-events.js` contiene exclusivamente dos
handlers y dos operaciones de binding. Consume Selection/Tabs mediante los
coordinadores existentes, renders parciales, cuatro open coordinators,
loader/Quick Create bridge y wrappers de features; no contiene render, HTML,
store, API, generación ni loader.

Orden clásico resultante:

```text
dashboard.page.js → biblioteca.page.js → biblioteca-render.js
→ biblioteca-modal-render.js → biblioteca-events.js → main.js
```

Dashboard registra primero su listener sobre `#explorer-content`; un click de
Biblioteca lo atraviesa, `handleContentClick` no encuentra
`data-content-action`, y luego llega al listener documental de Biblioteca. No
se cambió captura, bubbling ni orden. `window.biblioteca`,
`window.renderBibliotecaContent`, Quick Create, aliases, wrappers y ramas legacy
quedaron intactos; `BibliotecaEvents` es léxico y no amplía la API pública.

### Métricas y evidencia

| Indicador | Antes de 6.3 | Después |
| --- | ---: | ---: |
| Líneas `biblioteca.page.js` | 1465 | 1317 |
| Líneas event owner | — | 163 |
| Handlers movidos | — | 2 |
| Listener estructural / `oninput` | 1 / 1 en owners previos | 1 / 1 en event owner |
| Listeners modales retenidos | 29 | 29 |
| DOM ops page / event owner | 61 / — | 52 / 9 |
| Acciones emitidas / ramas | 20 / 23 | 20 / 23 |

Comparación literal de handlers y líneas de binding: PASS. Smoke JSDOM sin red
de selección, tabs, search/clear, cuatro modales, Quick Create, retry,
preview/download, generación, deletes, compatibilidad, acción desconocida y
bubbling: PASS, una llamada por acción. Owners de render/modal intactos salvo la
delegación mecánica de search en el primero. Sintaxis, Jest y diff check: PASS.
