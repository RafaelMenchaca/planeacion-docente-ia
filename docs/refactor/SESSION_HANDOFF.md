# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

- Explorador visual jerárquico: obsoleto para nuevas implementaciones; no es un modo paralelo.
- Jerarquía técnica: puede seguir activa en datos, endpoints, selectores, persistencia o soporte interno.
- Archivados: flujo separado con posibles dependencias jerárquicas.
- `explorerState`: estado mixto; no puede eliminarse como bloque sin clasificar consumidores.

## Estado del roadmap

- **Última fase cerrada:** 4 — Generación y polling.
- **Fase actual:** 5 — Estado de Biblioteca, En progreso por apertura documental.
- **Estado de Fase 4:** Completada en `8dcba86`.
- **Sesión 4.0:** Auditoría documental de apertura, aprobada.
- **Sesión 4.1:** extracción literal de generación de anexos desde Biblioteca; validación manual aprobada.
- **Sesión 4.2:** extracción literal de generación seleccionada de listas de cotejo desde Biblioteca; validación manual aprobada.
- **Sesión 4.3:** extracción literal del inicio y progreso de generación de planeaciones desde Biblioteca; validación manual aprobada.
- **Sesión 4.4:** auditoría específica y extracción literal de generación y polling de exámenes desde Biblioteca; validación manual aprobada y commit `6344374`.
- **Sesión 4.5:** auditoría formal de cierre de generación y polling; aprobada y completada en `8dcba86`.
- **Validaciones estáticas de 4.5:** aprobadas.
- **Validación manual documental de 4.5:** aprobada explícitamente por el usuario.
- **Decisión formal:** A. Cerrar Fase 4.
- **Sesión 5.0:** Auditoría documental de apertura; aprobada y commiteada en `525a21a`.
- **Decisión de apertura:** A. Abrir Fase 5.
- **Validaciones estáticas de 5.0:** aprobadas.
- **Validación documental de 5.0:** aprobada explícitamente por el usuario.
- **Sesión 5.1:** pendiente y no iniciada; sin implementación, validaciones ni commit.
- **Sesión 3.0:** Auditoría de capa API frontend, completada.
- **Sesión 3.1:** Consolidación de lecturas de Biblioteca, completada.
- **Validación manual 3.1:** aprobada.
- **Sesión 3.2:** Consolidación interna de deletes de Biblioteca, completada.
- **Validación manual 3.2:** aprobada.
- **Sesión 3.3:** Auditoría puntual de APIs de anexos, completada.
- **Sesión 3.4:** Consolidación interna de lecturas de anexos, completada.
- **Validación manual 3.4:** aprobada.
- **Sesión 3.5:** Auditoría puntual de APIs de listas de cotejo, completada.
- **Sesión 3.6:** Consolidación interna de lecturas de listas de cotejo, completada.
- **Validación manual 3.6:** aprobada.
- **Sesión 3.7:** Auditoría puntual de APIs de exámenes, completada.
- **Sesión 3.8:** Consolidación interna de lecturas de exámenes, completada.
- **Validación manual 3.8:** aprobada.
- **Sesión 3.9:** Auditoría de cierre de capa API frontend, completada.
- **Validación manual 2.1:** aprobada.
- **Validación manual 2.2:** aprobada.
- **Validación manual 2.3:** aprobada.
- **Validación manual 2.4:** aprobada.
- **Validación manual 2.5:** aprobada.
- **Decisión 2.6:** la eliminación de bloque puede extraerse literalmente.
- **Validación manual 2.7:** aprobada.
- **Validación manual acumulativa de Fase 2:** aprobada.
- **Continuación:** reintentar Fase 5 — Sesión 5.1 desde su puerta inicial.

Las Fases 0, 1, 2, 3 y 4 están completadas. Las validaciones manuales 3.1, 3.2,
3.4, 3.6 y 3.8 están aprobadas. En Fase 4, anexos, listas, planeaciones y
exámenes quedaron validados; la auditoría 4.5, su validación documental y la
decisión formal de cierre también fueron aprobadas. La puerta de la Sesión 5.0
pasó y Fase 5 quedó En progreso por apertura documental, sin implementación.

## Sesión 1.1 — Preview y descarga de examen

### Resultado

- Se creó `js/features/examenes/exam-preview.js` con preview, apertura/cierre y el camino de compatibilidad usado por Biblioteca.
- Se creó `js/features/examenes/exam-download.js` con la descarga Word existente.
- Se retiró únicamente la implementación duplicada de `dashboard.page.js` y la implementación local de apertura de `biblioteca.page.js`.
- `js/ui/wordExport.js` no fue modificado.

### Consumidores y wrappers

- `window.renderExamPreviewModal`: `renderAll()`, Biblioteca y el explorador jerárquico; wrapper conservado en `dashboard.page.js`.
- `window.closeExamPreviewModal`: listeners del modal, Escape y compatibilidad global; wrapper conservado en `dashboard.page.js`.
- `window.downloadExamWord(examenId, filenameOverride)`: cards de Biblioteca, botón del preview y explorador jerárquico; wrapper conservado en `dashboard.page.js`.
- `openBibliotecaExamenPreview(examenId)`: handler `data-bib-action="ver-examen"`; wrapper local conservado en `biblioteca.page.js`.

Los wrappers se retiran únicamente cuando una búsqueda global confirme que no quedan consumidores; el retiro corresponde a una sesión posterior de Fase 10, salvo el wrapper del explorador legacy, que requiere aislamiento de Fase 8-9.

### Dependencias y orden

`wordExport.js` → `exam-download.js` → `exam-preview.js` → `components.private.js`/`shared.ui.js`/APIs → `dashboard.page.js` → `biblioteca.page.js` → `main.js`/inicialización. El módulo de examen conserva su Blob Word actual y no llama a `window.descargarWord`; esa función de `wordExport.js` pertenece a otros consumidores.

### Validación y pendientes

- `node --check` pasó en los cuatro JavaScript modificados/creados.
- `npm test -- --runInBand` pasó: 1 suite y 2 pruebas.
- `git diff --check` pasó.
- La validación manual posterior fue aprobada por el usuario: preview, cierre/reapertura, descarga desde card y preview, apertura del archivo, tabs y recarga sin regresiones visibles.

### Riesgos y hallazgos

- El flujo conserva globals y depende de `explorerState`, `obtenerExamenDetalle`, `AppUI` y el DOM del layout.
- El backend no contiene migraciones SQL visibles; no se modificó ni se infirió schema.
- El examen actualmente no consume `wordExport.js`; cambiarlo estaría fuera de la extracción literal.

## Sesión 1.2 — Preview y descarga de listas de cotejo

### Resultado

- Se creó `js/features/listas-cotejo/lista-cotejo-preview.js` con render, apertura, cierre y el camino de Biblioteca.
- Se creó `js/features/listas-cotejo/lista-cotejo-download.js` con los coordinadores de descarga de card y preview.
- Se retiró únicamente la implementación duplicada de preview de `dashboard.page.js` y los coordinadores locales de lista de `biblioteca.page.js`.
- `js/ui/wordExport.js` conserva sin cambios `window.descargarListaCotejoWord(lista, filenameOverride)`, el generador Word canónico protegido.

### Consumidores y wrappers

- `window.renderListaCotejoPreviewModal`: `renderAll()`, Biblioteca y el explorador jerárquico; wrapper conservado en `dashboard.page.js`.
- `window.closeListaCotejoPreview`: backdrop, botón cerrar, Escape y compatibilidad global; wrapper conservado en `dashboard.page.js`.
- `openListaCotejoPreview(listaId)`: handler `data-content-action="preview-lista-cotejo"` del explorador visual legacy; wrapper local conservado en `dashboard.page.js`.
- `openBibliotecaListaPreview(listaId)`: handler `data-bib-action="ver-lista"`; wrapper local conservado en `biblioteca.page.js`.
- `bibDescargarLista(listaId)`: handler `data-bib-action="descargar-lista"`; wrapper local conservado en `biblioteca.page.js`.

Los wrappers se retiran únicamente cuando una búsqueda global confirme que no quedan consumidores; el wrapper del explorador legacy requiere antes el aislamiento de Fase 8-9 y los demás corresponden a Fase 10.

### Dependencias y orden

`wordExport.js` → `exam-download.js` → `exam-preview.js` → `lista-cotejo-download.js` → `lista-cotejo-preview.js` → `components.private.js`/`shared.ui.js`/APIs → `dashboard.page.js` → `biblioteca.page.js` → `main.js`/inicialización.

Los módulos de listas solo definen namespaces durante la carga; al invocarse consumen el DOM del layout, `window.explorerState`, `window.obtenerListaCoTejoDetalle`, `window.AppUI` y `window.descargarListaCotejoWord` ya disponibles por ese orden.

### Validación y pendientes

- `node --check` pasó en `lista-cotejo-preview.js`, `lista-cotejo-download.js`, `dashboard.page.js` y `biblioteca.page.js`.
- `npm test -- --runInBand` pasó: 1 suite y 2 pruebas.
- `git diff --check` pasó.
- Smoke test JSDOM pasó: namespaces, apertura/render/cierre y delegación de descarga.
- La validación manual posterior fue aprobada por el usuario: preview, cierre/reapertura, descarga desde card y preview, apertura del archivo, tabs y recarga sin regresiones visibles.

### Riesgos y hallazgos

- El preview conserva los estados existentes: el renderer no muestra `loading` ni `error` aunque la apertura de Biblioteca los actualiza; se preservó literalmente y no se corrigió.
- La estructura real de `listas_cotejo` conserva `id` UUID, `planeacion_id` bigint único, `tema_id`, `unidad_id`, `batch_id`, `criterios`, `actividades_evaluadas` y total de 10; no hubo contradicción entre schema y servicio para los campos consumidos.
- `missing_closing_activity` sigue siendo un reason legacy que representa ausencia de actividades evaluables; no se reinterpretó.
- El hallazgo de métricas de planeaciones hacia `public.ia_metrics` frente a `public.ia_metrics_legacy` sigue fuera de alcance y no se modificó.

## Sesión 1.3 — Preview y descarga de anexos

### Resultado

- Se creó `js/features/anexos/anexo-preview.js` con apertura, render y cierre del modal dinámico de Biblioteca.
- Se creó `js/features/anexos/anexo-download.js` con la descarga desde card y el exportador Word propio de anexos.
- Se retiró únicamente la implementación duplicada de preview y descarga de `biblioteca.page.js`.
- `js/ui/wordExport.js` no participa en anexos y no fue modificado.

### Consumidores y wrappers

- `openBibliotecaAnexoPreview(anexoId)`: handler `data-bib-action="ver-anexo"`; wrapper local conservado en `biblioteca.page.js`.
- `closeBibliotecaAnexoModal()`: backdrop, botones de cierre y render del preview; wrapper local conservado en `biblioteca.page.js`.
- `renderBibliotecaAnexoModal(anexo)`: apertura y compatibilidad local; wrapper conservado en `biblioteca.page.js`.
- `bibDescargarAnexo(anexoId)`: handler `data-bib-action="descargar-anexo"`; wrapper local conservado en `biblioteca.page.js`.
- `descargarAnexoWord(anexo, filenameOverride)`: card y botón del preview; wrapper local conservado en `biblioteca.page.js`.

No había wrappers globales de anexos antes de la sesión. Los wrappers locales se retiran únicamente tras migrar sus consumidores y confirmar una búsqueda global sin referencias; corresponde a Fase 10.

### Dependencias y orden

`wordExport.js` → módulos de examen → módulos de listas → `components.private.js` → `shared.ui.js` → APIs de Biblioteca/anexos → `anexo-download.js` → `anexo-preview.js` → `dashboard.page.js` → `biblioteca.page.js` → `main.js`/inicialización.

Los módulos de anexos dependen al invocarse de `window.requireSession`, `apiObtenerAnexoDetalle`, `window.AppUI`, `escapeHtml`, el modal dinámico de Biblioteca y, para el preview, `window.AnexoDownload`.

### Validación y pendientes

- `node --check` pasó en `anexo-preview.js`, `anexo-download.js` y `biblioteca.page.js`.
- `npm test -- --runInBand` pasó: 1 suite y 2 pruebas.
- `git diff --check` pasó.
- Smoke test JSDOM pasó: namespaces, apertura/render/cierre y descarga propia del anexo.
- La validación manual posterior fue aprobada por el usuario: preview, cierre/reapertura, descarga desde card y preview, apertura del archivo, tabs y recarga sin regresiones visibles.

### Riesgos y hallazgos

- El modal de anexos es dinámico y se inyecta durante `initBiblioteca`; no responde a Escape en el flujo previo y se preservó así.
- El exportador de anexos es propio y no consume `wordExport.js`; unificarlo sería un cambio fuera de alcance.
- La estructura de `anexos` conserva `id` UUID, `planeacion_id` bigint único, `tema_id`, `unidad_id`, `batch_id`, `contenido`, `prompt_version` y fechas; no hubo contradicción entre schema, controller y service para los campos consumidos.
- Regeneración, generación, métricas y el hallazgo `public.ia_metrics`/`public.ia_metrics_legacy` permanecen fuera de alcance.

## Evidencia confirmada de Fase 0

- Frontend y backend estaban limpios al iniciar la sesión del 2026-07-23.
- Ambos repositorios tienen el tag anotado `pre-biblioteca-modular-refactor` apuntando a su `HEAD`.
- El tag existe en el remoto `origin` de ambos repositorios.
- Las reglas, arquitectura, roadmap, playbook y matriz protegen Biblioteca, contratos backend y jerarquía técnica.
- El refuerzo backend previo y sus pendientes están documentados en `LOG_AUDIT.md`, `LOG_CONVENTIONS.md` y el handoff backend.
- Los commits de las sesiones 1.1, 1.2 y 1.3 existen y ambos repositorios estaban limpios al iniciar esta auditoría.
- El usuario confirmó la validación manual del flujo vigente, incluidos generación principal, navegación, previews, descargas, archivos, tabs, recarga y ausencia de regresiones relacionadas.

## Cierre de Fase 0

**Completada.** Los hallazgos `public.ia_metrics` frente a `public.ia_metrics_legacy` y `outputSummary.anexos_creados` posiblemente incorrecto permanecen como deudas backend no bloqueantes.

## Auditoría de cierre de Fase 1

Decisión ejecutada: la última extracción aislada fue la Sesión 1.4. Su código, validaciones automáticas y validación acumulativa quedaron completados; la Fase 1 está cerrada.

| Candidato | Archivo actual | Consumidor activo | Dependencias | Riesgo | Fase correcta | Decisión |
| --- | --- | --- | --- | --- | --- | --- |
| Preview de examen | `js/features/examenes/exam-preview.js` | Biblioteca y compatibilidad legacy | `explorerState`, API y DOM | Bajo | 1 | Completado |
| Descarga de examen | `js/features/examenes/exam-download.js` | Card, preview y compatibilidad legacy | detalle de examen y Blob propio | Bajo | 1 | Completado |
| Coordinador de descarga de examen desde card | `js/pages/biblioteca.page.js` | `data-bib-action="descargar-examen"` | `bibliotecaState` y módulo de examen | Bajo/medio | 2 | Fase posterior |
| Preview de lista | `js/features/listas-cotejo/lista-cotejo-preview.js` | Biblioteca y compatibilidad legacy | `explorerState`, API y DOM | Bajo | 1 | Completado |
| Descarga de lista | `js/features/listas-cotejo/lista-cotejo-download.js` | Card y preview | `AppUI` y `wordExport.js` | Bajo | 1 | Completado |
| Preview de anexo | `js/features/anexos/anexo-preview.js` | Biblioteca | API, DOM y módulo de descarga | Bajo | 1 | Completado |
| Descarga de anexo | `js/features/anexos/anexo-download.js` | Card y preview | API, `AppUI` y Blob propio | Bajo | 1 | Completado |
| Preview/detalle de planeación | `js/pages/biblioteca.page.js`, `js/pages/detalle.page.js` | Enlace `detalle.html?id=...` | navegación, carga, edición y estado de página | Medio | 7 | Fase posterior |
| Descarga de planeación desde card | `js/features/planeaciones/planeacion-download.js` | `data-bib-action="descargar-planeacion"` mediante wrapper | detalle por ID, `AppUI` y Blob propio | Bajo | 1 | Completado |
| Word de planeación desde detalle | `js/pages/detalle.page.js`, `js/ui/wordExport.js` | `#btn-descargar-doc` | `PLANEACION_ORIGINAL`, tabla DOM y exportador protegido | Medio | 2 | Fase posterior |
| Excel de planeación desde detalle | `js/pages/detalle.page.js` | Sin botón activo en `detalle.html` | estado de detalle, API y Blob | Medio | 2 | Legacy / no aplica en Fase 1 |
| Modal de nombre documental | `js/ui/shared.ui.js` | Examen, lista, anexo y planeación | `AppUI`, DOM compartido | Bajo | Compartido | Ya aislado |
| Modales de generación | `js/pages/dashboard.page.js`, `js/pages/biblioteca.page.js` | Generación de recursos | estado, jobs, polling y render | Alto | 4/6 | Fase posterior |
| Confirmaciones de eliminación | `js/pages/dashboard.page.js`, `js/pages/biblioteca.page.js` | Acciones delete | estado y actualización de cards | Medio | 2/6 | Fase posterior |
| Modal jerárquico general | `js/pages/dashboard.page.js` | Explorador visual antiguo | `explorerState` y eventos generales | Medio | 8 | Legacy |

No quedó ningún candidato desconocido.

## Sesión 1.4 — Descarga de planeación desde Biblioteca

- Se creó `js/features/planeaciones/planeacion-download.js`.
- Se trasladó literalmente `bibDescargarPlaneacion(planeacionId)` a `window.PlaneacionDownload.downloadFromBiblioteca`.
- `biblioteca.page.js` conserva un wrapper `async` con la firma, promesa, argumentos y retorno actuales.
- `pages/dashboard.html` carga el módulo después de los módulos de anexos y antes de `dashboard.page.js`/`biblioteca.page.js`.
- `wordExport.js`, detalle, edición, Word/Excel de detalle, backend y contratos permanecieron intactos.

### Validaciones

- `node --check` pasó en `planeacion-download.js` y `biblioteca.page.js`.
- `npm test -- --runInBand` pasó: 1 suite y 2 pruebas.
- `git diff --check` pasó.
- Smoke JSDOM pasó: namespace, wrapper, delegación, modal de nombre, Blob y descarga simulada.
- La comparación automatizada contra la función de `HEAD` confirmó HTML, MIME, nombre, URL temporal, revocación y resultado equivalentes.

### Cierre de Fase 1

La validación acumulativa requerida quedó aprobada antes de abrir la Fase 2. No quedaron candidatos aislados de bajo riesgo ni consumidores desconocidos.

## Sesión 2.0 — Auditoría y mapa de acciones

### Estado de entrada

- Frontend: rama `refactor-front`, `HEAD` `fa0f3b1`, working tree limpio.
- Sesiones confirmadas por historial: 1.1 `609d6fd`, 1.2 `6124a6f`, 1.3 `e0c3e85`, 1.4 `fa0f3b1`.
- Backend: rama `refactor-back`, working tree limpio.
- Roadmap recibido: Fase 0 completada, Fase 1 completada y Fase 2 pendiente. Las líneas internas obsoletas de Fase 1 se reconciliaron en esta sesión.
- Biblioteca sigue siendo el único flujo visual principal. Dashboard aporta compatibilidad activa; el explorador jerárquico permanece legacy y Archivados es un flujo separado.

### Tabla maestra de acciones

| Dominio | Acción | Función o coordinador | Consumidor | API | Estado afectado | Render o navegación posterior | Confirmación o feedback | Riesgo | Clasificación |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Planeaciones | Ver detalle | enlace generado por `renderPlaneacionesTab` | `href="detalle.html?id=..."` | Ninguna antes de navegar; detalle carga `GET /api/planeaciones/:id` | Ninguno en Biblioteca | Navega a `detalle.html` | Sin confirmación | Bajo | Biblioteca activa |
| Planeaciones | Descargar | `bibDescargarPlaneacion` → `PlaneacionDownload.downloadFromBiblioteca` | `data-bib-action="descargar-planeacion"` | `GET /api/planeaciones/:id` | Ninguno | Sin render | Modal `AppUI.openDownloadNameModal`; logs de descarga | Bajo | Compatibilidad |
| Planeaciones | Eliminar | `bibEliminarPlaneacion(planeacionId, conjuntoId)` | `data-bib-action="eliminar-planeacion"` | `DELETE /api/planeaciones/:id/directo` | Quita planeación, listas y anexos asociados del conjunto; actualiza tres contadores y tab | Render parcial y recarga silenciosa del bloque | `showBibConfirm`; `console.info`; `alert` en error | Medio | Biblioteca activa |
| Planeaciones | Abrir/cerrar alta en bloque | `openBibliotecaAgregarModal`, `closeBibliotecaAgregarModal`, renderer y helpers | `data-bib-action="agregar-planeacion"` y controles del modal | Ninguna al abrir/cerrar | `agregarModal` y temas temporales | Render del modal | Errores inline | Medio | Biblioteca activa |
| Planeaciones | Generar en bloque existente | `submitBibliotecaAgregarModal` | submit del modal | `POST /api/unidades/:unidadId/generar?stream=1`, con fallback al mismo endpoint sin stream | `pendingPlaneacionesByBatchId`, selección/tab y contenido optimista | Render general repetido y recarga silenciosa | Progreso inline y `console.error` | Alto | Biblioteca activa |
| Planeaciones | Crear bloque y generar | `openQuickCreatePanel`, `submitQuickCreateForm`, `generatePlaneacionesFromStaging` | `data-bib-action="crear-planeaciones"` y formulario de creación rápida | APIs jerárquicas de plantel/grado/materia/unidad y `POST /api/unidades/:unidadId/generar` | `explorerState`, `window.biblioteca`, pending del bloque y planeaciones | Render Biblioteca y progreso | Error del panel y consola | Alto | Compartida activa |
| Planeaciones | Editar/guardar | `detalle.page.js` | página `detalle.html` | `PUT /api/planeaciones/:id` | Estado propio de detalle | Render de detalle | Feedback propio de detalle | Medio | Compartida activa |
| Anexos | Abrir/cerrar modal de generación | `openBibliotecaAnexoCreateModal`, `closeBibliotecaAnexoCreateModal`, renderer | `data-bib-action="abrir-modal-anexos"` y controles del modal | Ninguna al abrir/cerrar | `anexoModal` | Render del modal | Error inline | Medio | Biblioteca activa |
| Anexos | Generar seleccionados | `submitBibliotecaAnexoCreateModal` | submit del modal | `POST /api/anexos/generate`, una vez por `planeacion_id` | `anexosGenerating`, array `anexos` y contador | Render parcial por elemento y recarga silenciosa | Logs start/success; errores inline por card | Alto | Biblioteca activa |
| Anexos | Generar uno | `bibGenerarAnexo(planeacionId, conjuntoId)` | rama `data-bib-action="generar-anexo"` sin emisor DOM actual | `POST /api/anexos/generate` | `anexosGenerating`, array y contador | Render parcial y recarga | Error inline en card | Medio/alto | Compatibilidad |
| Anexos | Regenerar | `bibRegenerarAnexo(anexoId, conjuntoId, planeacionId)` | rama `data-bib-action="regenerar-anexo"` sin emisor DOM actual | `POST /api/anexos/:id/regenerate` | `anexosGenerating` | Render parcial y recarga | Error inline en card | Alto | Compatibilidad |
| Anexos | Ver preview | `openBibliotecaAnexoPreview` → `AnexoPreview.open` | `data-bib-action="ver-anexo"` | `GET /api/anexos/:id` | DOM del modal dinámico | Render del preview | Errores visibles del preview | Bajo | Compatibilidad |
| Anexos | Descargar | `bibDescargarAnexo` → `AnexoDownload.downloadBiblioteca` | card y botón del preview | `GET /api/anexos/:id` desde card; preview reutiliza el objeto cargado | Ninguno | Cierra preview en ese camino; sin render general | Modal de nombre y logs de descarga | Bajo | Compatibilidad |
| Anexos | Eliminar | `bibEliminarAnexo(anexoId, conjuntoId)` | `data-bib-action="eliminar-anexo"` | `DELETE /api/anexos/:id` | Quita anexo y actualiza `total_anexos` | Render parcial y recarga silenciosa | `showBibConfirm`; log de éxito; `alert` en error | Bajo/medio | Biblioteca activa |
| Listas de cotejo | Abrir/cerrar modal de generación | `openBibliotecaListaModal`, `closeBibliotecaListaModal`, renderer | `data-bib-action="generar-lista"` y controles del modal | Ninguna al abrir/cerrar | `listaModal` | Render del modal | Error inline | Medio | Biblioteca activa |
| Listas de cotejo | Generar | `submitBibliotecaListaModal` | submit del modal | `POST /api/listas-cotejo/generate` con `planeacion_ids` | `pendingListaByBatchId` y tab | Render general, espera local de 1.5 s y recarga | Log success; error inline | Alto | Biblioteca activa |
| Listas de cotejo | Ver preview | `openBibliotecaListaPreview` → `ListaCotejoPreview.openBiblioteca` | `data-bib-action="ver-lista"` | `GET /api/listas-cotejo/:id` | `explorerState.listaCotejoPreview` por compatibilidad | Render del modal | Errores visibles del preview | Bajo | Compatibilidad |
| Listas de cotejo | Descargar | `bibDescargarLista` → `ListaCotejoDownload.downloadBiblioteca` | card y botón del preview | `GET /api/listas-cotejo/:id` desde card | Ninguno | Sin render general | Modal de nombre; exportador protegido `wordExport.js` | Bajo | Compatibilidad |
| Listas de cotejo | Eliminar | `bibEliminarLista(listaId, conjuntoId)` | `data-bib-action="eliminar-lista"` | `DELETE /api/listas-cotejo/:id` | Quita lista y actualiza `total_listas_cotejo` | Render parcial y recarga silenciosa | `showBibConfirm`; log de éxito; `alert` en error | Bajo/medio | Biblioteca activa |
| Exámenes | Abrir/cerrar modal de generación | `openBibliotecaExamModal`, `closeBibliotecaExamModal`, renderer | `data-bib-action="generar-examen"` y controles del modal | Ninguna al abrir/cerrar | `examModal` | Render del modal | Error inline | Medio | Biblioteca activa |
| Exámenes | Generar | `submitBibliotecaExamModal` → `ExamGeneration.generateFromBiblioteca` | submit del modal | `POST /api/examenes/generate` | `examModal`, `pendingExamenByBatchId` y tab | Render general y recarga al completar | Logs de payload/job; error inline | Alto | Biblioteca activa |
| Exámenes | Consultar estado | IIFE de `ExamGeneration.generateFromBiblioteca` | job creado por generación | `GET /api/examenes/generacion/:jobId` cada 3 s, máximo 60 intentos | `pendingExamenByBatchId` | Render general en cada paso | Logs `[polling]`; error genérico visible | Alto | Biblioteca activa |
| Exámenes | Cancelar | `closeBibliotecaExamModal` | botones, cierre y backdrop del modal previo al submit | Ninguna; no existe cancelación de job en Biblioteca | `examModal.open` | Oculta modal | Sin feedback | Bajo | Biblioteca activa |
| Exámenes | Ver preview | `openBibliotecaExamenPreview` → `ExamPreview.openBiblioteca` | `data-bib-action="ver-examen"` | `GET /api/examenes/:id` | `explorerState.examPreview` y caché por compatibilidad | Render del modal | Errores visibles del preview | Bajo | Compatibilidad |
| Exámenes | Descargar | `bibDescargarExamen(examenId)` → `window.downloadExamWord` | `data-bib-action="descargar-examen"` | `GET /api/examenes/:id` si no está en caché | Solo lectura de `bibliotecaState.conjuntos`; el exportador usa caché compartida | Sin render | Modal de nombre; logs start/success/error | Bajo | Biblioteca activa |
| Exámenes | Eliminar | `bibEliminarExamen(examenId, conjuntoId)` | `data-bib-action="eliminar-examen"` | `DELETE /api/examenes/:id` | Quita examen y actualiza `total_examenes` | Render parcial y recarga silenciosa | `showBibConfirm`; log de éxito; `alert` en error | Bajo/medio | Biblioteca activa |
| Bloques | Abrir/seleccionar | `setSelectedConjunto` desde `select-conjunto` | item del sidebar | Ninguna | `selectedConjuntoId`, `activeTab` | Actualiza sidebar y detalle | Sin feedback | Bajo | Biblioteca activa |
| Bloques | Cambiar tab | `setSelectedConjunto` desde `switch-tab` | tabs del detalle | Ninguna | `selectedConjuntoId`, `activeTab` | Render parcial del detalle | Sin feedback | Bajo | Biblioteca activa |
| Bloques | Buscar | `onBibliotecaSearch` | `#biblioteca-search` | Ninguna | `searchQuery` | Render parcial de lista lateral | Estado vacío | Bajo | Biblioteca activa |
| Bloques | Recargar/reintentar | `loadAndRenderBiblioteca` | `retry` y `window.biblioteca.refresh` | `GET /api/biblioteca/conjuntos` | Carga/error, conjuntos, selección y pending reconciliado | Render general | Estado loading/error y log | Medio | Compartida activa |
| Bloques | Eliminar bloque | `bibEliminarBloque(conjuntoId)` | `data-bib-action="eliminar-bloque"` | `DELETE /api/biblioteca/bloques/:batchId` | Quita conjunto; cambia selección; limpia tab y cuatro mapas pending | Render general y recarga silenciosa | Confirmación crítica; log de éxito; `alert` en error | Alto | Biblioteca activa |
| Bloques | `toggle-expand` | rama de `onBibliotecaClick` | Sin atributo emisor actual | Ninguna | Equivale hoy a seleccionar | Render parcial | Sin feedback | Bajo | Compatibilidad |

No quedaron acciones con clasificación desconocida.

No existen acciones activas de renombrar o cerrar un bloque, regenerar una planeación, regenerar una lista ni cancelar un job de examen. `closeBibliotecaExamModal` solo cancela/cierra el modal previo; no llama a backend.

### Eliminaciones por dominio

| Eliminación | Disparador e ID real | API y respuesta | Confirmación exacta | Feedback y logs | Mutación local, render y recarga | Dependencias | Recursos relacionados y error parcial |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Planeación individual | Card `eliminar-planeacion`; `planeacionId` llega como string DOM y representa `planeaciones.id` `bigint`; `conjuntoId` representa UUID de batch | `DELETE /api/planeaciones/:id/directo`; 200 `{ ok: true }`; 400 sin ID, 401 sin token, 404 si no existe o no pertenece al usuario | Título `¿Eliminar esta planeación?`; mensaje `Se eliminarán también sus listas de cotejo y anexos asociados. Esta acción no se puede deshacer.` | Frontend: `[biblioteca] delete:success` o `[biblioteca] Error eliminando planeacion:`; éxito sin toast; error con `alert("No se pudo eliminar la planeación. Intenta nuevamente.")`. Backend: start/success | Filtra `planeaciones`, listas y anexos por `planeacion_id`; actualiza tres contadores; fija tab `planeaciones`; render parcial; vuelve a consultar Biblioteca | Lectura/mutación de `bibliotecaState.conjuntos`; `showBibConfirm`, `requireSession`, `normalizeBibliotecaId`, `setSelectedConjunto`, API y loader. Sin `explorerState` directo | Backend elimina anexos, luego listas y luego planeación; no elimina exámenes. No hay transacción visible: un fallo intermedio puede dejar hijos ya eliminados sin mutación local. Si falla la recarga posterior, el loader muestra el error general y conserva la actualización local; no propaga al `catch` del delete |
| Anexo individual | Card `eliminar-anexo`; UUID string de anexo y UUID string de batch | `DELETE /api/anexos/:id`; 200 `{ ok: true }`; 400/401/404 equivalentes | Título `¿Eliminar este anexo?`; mensaje `Esta acción no se puede deshacer.` | Frontend success/error; éxito sin toast; alerta `No se pudo eliminar el anexo. Intenta nuevamente.`. Backend solo log success | Filtra `anexos`, actualiza contador, fija tab `anexos`, render parcial y recarga | Mismas dependencias locales; sin `explorerState` ni Dashboard directos | Elimina solo el anexo. Si falla la recarga posterior, el loader muestra error general y no revierte la actualización local |
| Lista individual | Card `eliminar-lista`; UUID string de lista y UUID string de batch | `DELETE /api/listas-cotejo/:id`; 200 `{ ok: true }`; 400/401/404 equivalentes | Título `¿Eliminar esta lista de cotejo?`; mensaje `Esta acción no se puede deshacer.` | Frontend success/error; éxito sin toast; alerta `No se pudo eliminar la lista de cotejo. Intenta nuevamente.`. Backend solo log success | Filtra `listas_cotejo`, actualiza contador, fija tab `listas`, render parcial y recarga | Mismas dependencias locales; sin `explorerState` ni Dashboard directos | Elimina solo la lista. No altera planeación ni anexo; un fallo de recarga se maneja como error general del loader |
| Examen individual | Card `eliminar-examen`; UUID string de examen y UUID string de batch | `DELETE /api/examenes/:id`; 200 `{ ok: true }`; 400/401/404 equivalentes | Título `¿Eliminar este examen?`; mensaje `Esta acción no se puede deshacer.` | Frontend success/error; éxito sin toast; alerta `No se pudo eliminar el examen. Intenta nuevamente.`. Backend solo log success | Filtra `examenes`, actualiza contador, fija tab `examenes`, render parcial y recarga | Mismas dependencias locales; sin `explorerState` ni Dashboard directos | Elimina solo el examen. El job relacionado no es eliminado por este servicio; sus referencias usan `ON DELETE SET NULL`. Un fallo de recarga se maneja como error general del loader |
| Bloque completo | Botón del encabezado `eliminar-bloque`; UUID string de `planeacion_batches.id` | `DELETE /api/biblioteca/bloques/:batchId`; 200 `{ ok: true, deleted: { batch: boolean } }`; 400/401/404 equivalentes | Título dinámico `¿Eliminar "<nombre>"?`; mensaje `Se eliminará el bloque completo: planeaciones, exámenes, listas de cotejo y anexos. Esta acción no se puede deshacer.` | Frontend success/error; éxito sin toast; alerta `No se pudo eliminar el bloque. Intenta nuevamente.`. Backend start/success y warning si falla el batch | Filtra el conjunto; si estaba seleccionado elige el primero; limpia `activeTab`, pending de planeaciones/examen/lista y `anexosGenerating`; render general y recarga | Muta varias ramas de `bibliotecaState`; usa confirmación, sesión, API, render y loader. Sin `explorerState` directo | Backend borra secuencialmente anexos, listas, exámenes y planeaciones —incluidas archivadas que conserven ese batch— por batch/usuario, después intenta el batch. No borra jerarquía, jobs o métricas. No hay transacción visible; un fallo final del batch devuelve `ok: true`, `deleted.batch:false`, y la recarga puede volver a mostrar el batch vacío |

Todas las rutas usan `requireAuth`: token ausente devuelve 401 `Token requerido` y token inválido devuelve 401 `Token invalido`. La consulta de propiedad filtra por `user_id`; un recurso ajeno se presenta como 404, no como 403.

### APIs e IDs protegidos

| Recurso | ID persistido | ID en Biblioteca | Relación relevante | Endpoint de acción |
| --- | --- | --- | --- | --- |
| Planeación | `bigint` | string de `data-planeacion-id`, normalizado con `String(...).trim()` | `batch_id` UUID; anexo y lista usan `planeacion_id` único/cascade | `GET /api/planeaciones/:id`; `DELETE /api/planeaciones/:id/directo` |
| Anexo | UUID | string de `data-anexo-id` | uno por planeación; `planeacion_id` bigint; `batch_id`, `unidad_id`, `tema_id` UUID nullable | GET/DELETE `/api/anexos/:id`; POST `/api/anexos/generate`; POST `/api/anexos/:id/regenerate` |
| Lista de cotejo | UUID | string de `data-lista-id` | una por planeación; `planeacion_id` bigint; batch/unidad/tema UUID nullable | GET/DELETE `/api/listas-cotejo/:id`; POST `/api/listas-cotejo/generate` |
| Examen | UUID | string de `data-examen-id` | `batch_id` UUID nullable; `unidad_id` UUID; selección de generación en `planeacion_ids` | GET/DELETE `/api/examenes/:id`; POST `/api/examenes/generate`; GET `/api/examenes/generacion/:jobId` |
| Bloque | UUID | string de `data-conjunto-id` | `planeacion_batches.id`; agrupa por `batch_id` | GET `/api/biblioteca/conjuntos`; DELETE `/api/biblioteca/bloques/:batchId` |

El schema documental y el código ejecutable coinciden en los tipos y relaciones usados por estas acciones. Las claves foráneas de batch usan principalmente `ON DELETE SET NULL`; por eso el servicio de bloque borra explícitamente los recursos antes del batch. No se inventó normalización ni se reinterpretaron `planeacion_ids`, `tema_ids`, `unidad_id` o `batch_id`.

### Dependencias de estado

| Dependencia | Acciones | Tipo | Decisión |
| --- | --- | --- | --- |
| `bibliotecaState.conjuntos` | selección, descarga de examen, deletes, generación optimista y carga | Lectura/mutación | Mantener dentro de Biblioteca hasta Fase 5; una extracción debe recibir acceso explícito sin exponer el store completo |
| `selectedConjuntoId` | selección, carga y delete de bloque | Mutación | Fase 5/6 |
| `activeTab` | tabs, generación, deletes y delete de bloque | Mutación/render | Fase 5/6 |
| `pendingPlaneacionesByBatchId` | generación de planeaciones y delete de bloque | Mutación/render | Fase 4/5 |
| `pendingExamenByBatchId` | generación/polling de examen y delete de bloque | Mutación/render | Fase 4/5 |
| `pendingListaByBatchId` | generación de listas y delete de bloque | Mutación/render | Fase 4/5 |
| `anexosGenerating` | generación/regeneración de anexos y delete de bloque | Mutación/render | Fase 4/5 |
| Estados `examModal`, `listaModal`, `anexoModal`, `agregarModal` | modales y submit de generación | Mutación/render | Fase 4/6 |
| `window.explorerState` | creación rápida, progreso, previews de examen/lista | Compatibilidad/legacy mixto | No mover en Fase 2; auditar en Fase 5 y desacoplar en Fase 7 |
| `window.biblioteca` | creación rápida de Dashboard y refresh compartido | Compatibilidad | Conservar contrato hasta Fase 7/10 |
| `selectedBatchId` | Ninguna acción auditada | No aplica | No existe como dependencia del flujo actual |
| `AppUI` | modal de nombre y toasts de consumidores compartidos | Compartida activa | Conservar |

### Dependencias de render

| Render o efecto | Acciones que lo disparan | Tipo | Fase natural |
| --- | --- | --- | --- |
| `renderBibliotecaDetailInPlace` | selección, tabs, generación/regeneración de anexos, deletes individuales | Render parcial | 6 |
| `renderBibliotecaContent` | carga, generación/polling, creación rápida, errores y delete de bloque | Render general | 6 |
| `loadAndRenderBiblioteca` | retry, refresh, generación completada y todos los deletes | Reconsulta + render | 3/6 |
| renderers de modal de recurso | generación de examen/lista/anexo/planeación | Render de dominio | 4/6 |
| `renderAll` de Dashboard | solo explorador visual/compatibilidad; no es post-render de los deletes de Biblioteca | Legacy | 8 |
| navegación a `detalle.html` | ver planeación | Navegación | 7 |

### Matriz de candidatos

| Candidato | Acciones incluidas | Archivos actuales | Dependencias | Riesgo | Sesión sugerida | Decisión |
| --- | --- | --- | --- | --- | --- | --- |
| Coordinador de descarga de examen | Solo `bibDescargarExamen(examenId)` | `biblioteca.page.js`, `exam-download.js` | lectura de conjuntos, `AppUI`, wrapper global de descarga | Bajo | 2.1 | Primera sesión de Fase 2 |
| Delete de examen | `bibEliminarExamen` | `biblioteca.page.js`, `biblioteca.api.js` | confirmación, conjunto, contador, tab, render y reload | Bajo/medio | 2.2 | Sesión posterior de Fase 2 |
| Delete de lista | `bibEliminarLista` | mismos propietarios por dominio | confirmación, array/contador, tab, render y reload | Bajo/medio | 2.3 | Sesión posterior de Fase 2 |
| Delete de anexo | `bibEliminarAnexo` | mismos propietarios por dominio | confirmación, array/contador, tab, render y reload | Bajo/medio | 2.4 | Sesión posterior de Fase 2 |
| Delete de planeación | `bibEliminarPlaneacion` | `biblioteca.page.js`, `biblioteca.api.js` | tres arrays/contadores y cascada manual backend | Medio | 2.5 | Sesión posterior de Fase 2 |
| Delete de bloque | `bibEliminarBloque` | `biblioteca-block-delete.js`, `biblioteca.page.js`, `biblioteca.api.js` | selección, tab, cuatro pending maps, render general y backend secuencial | Alto | 2.7, después de auditoría 2.6 | Completada y validada |
| Coordinadores de preview restantes | Ninguno de Biblioteca sin módulo | módulos de Fase 1 y wrappers | compatibilidad existente | Bajo | — | No aplica |
| Coordinadores de descarga restantes | Solo el de examen; planeación, anexo y lista ya delegan | `biblioteca.page.js` | lectura de estado y módulos existentes | Bajo | 2.1 | Primera sesión de Fase 2 |
| Regeneración de anexo | rama sin emisor DOM y `bibRegenerarAnexo` | `biblioteca.page.js` | generación IA, estado pending, render y reload | Alto | Fase 4 | Fase posterior |
| Generación de documentos | planeaciones, anexos, listas y exámenes | Biblioteca, Dashboard, APIs/services | jobs, polling, SSE, estado y render | Alto | Fase 4 | Fase posterior |
| Selección, tabs y búsqueda | bloque y navegación local | `biblioteca.page.js` | estado y render general/parcial | Medio/alto | Fases 5-6 | Fase posterior |
| Creación de bloque | quick create y generación | Dashboard/Biblioteca | jerarquía, `explorerState`, generación y render | Alto | Fases 4, 5 y 7 | Fase posterior |
| Acciones del explorador antiguo | previews, archive/delete jerárquico y navegación | `dashboard.page.js` | `explorerState`, render/event delegation legacy | Alto | Fase 8 | Legacy |
| Archivados | restaurar y eliminar definitivamente | `archivados.page.js`, APIs/services de planeaciones | estado y UI separados | Medio/alto | Fuera del roadmap inmediato de Biblioteca | Archivados |

Las eliminaciones individuales no se agrupan en la primera sesión: aunque examen, lista y anexo tienen una forma parecida, cada dominio conserva API, mensajes, array, contador, tab y pruebas propios; planeación añade eliminación relacionada. No se recomienda un helper universal.

### Primera sesión seleccionada

```text
Sesión 2.1 — Coordinador de descarga de examen desde Biblioteca
```

- Función: `async function bibDescargarExamen(examenId)`.
- Consumidor: rama `data-bib-action="descargar-examen"` de `onBibliotecaClick` y cards activas de examen.
- Archivos candidatos: `js/features/examenes/exam-download.js`, `js/pages/biblioteca.page.js` y documentación. No requiere un script nuevo ni reordenar `dashboard.html`.
- Namespace: ampliar el propietario existente `window.ExamDownload` con una operación específica de Biblioteca; no crear exportador universal.
- Wrapper: conservar `bibDescargarExamen(examenId)` con un argumento, promesa, retorno `undefined`, errores capturados y efectos actuales. Retiro en Fase 10 después de migrar el handler y confirmar búsqueda global sin consumidores.
- Dependencias explícitas: acceso de solo lectura a los conjuntos para el título sugerido, `window.AppUI.openDownloadNameModal`, `window.AppUI.buildDownloadSuggestedName` y `window.downloadExamWord`.
- Exclusiones: preview, delete, generación, polling, caché de examen, HTML/Blob Word, `wordExport.js`, otros dominios, render, estado general, API y backend.
- Riesgo: bajo; no muta estado ni dispara render.
- Pruebas obligatorias: nombre sugerido, cancelación del modal, nombre editado, descarga desde card, archivo `.doc`, logs start/success/error, error del exportador, retorno/promesa, ausencia de descarga doble y regresión de preview/descarga desde preview, tabs y recarga.
- Criterio de salida: una implementación canónica en el módulo de examen, wrapper preservado, cero consumidores desconocidos, comportamiento equivalente y documentación/pruebas reales registradas.

### Trabajos posteriores

| Trabajo | Destino |
| --- | --- |
| Deletes individuales por dominio | Sesiones 2.2 a 2.5, empezando por examen |
| Delete de bloque | Sesión 2.7, con alcance definido por la auditoría específica 2.6 |
| Centralización de wrappers HTTP | Fase 3 |
| Generación, regeneración, polling, jobs y retries | Fase 4 |
| `bibliotecaState`, pending y `explorerState` | Fase 5 |
| Render general, tabs y event delegation | Fase 6 |
| Quick create y dependencias activas de Dashboard | Fase 7 |
| Explorador visual jerárquico | Fase 8; eliminación solo en Fase 9 |
| Retiro de wrappers | Fase 10 |

### Código legacy y Archivados

- `dashboard.page.js` conserva previews y descargas de compatibilidad para el explorador, además de creación rápida compartida con Biblioteca.
- `batch.page.js` conserva un archivado de planeación propio de esa página; no consume los coordinadores delete de Biblioteca.
- `initDashboardPage()` activa Biblioteca y retorna después de `window.initBiblioteca()`, sin hidratar el explorador visual.
- Las ramas `data-content-action`, delete/archive jerárquico y `renderAll()` se clasificaron como legacy visual o compatibilidad, no como acciones de Biblioteca para extraer ahora.
- `pages/archivados.html` y `archivados.page.js` mantienen restauración y eliminación definitiva en un flujo separado. No consumen los cinco coordinadores delete de Biblioteca.
- No se eliminó ni mezcló ninguna de estas áreas.

### Hallazgos fuera de alcance

- El delete de bloque no es transaccional en el código visible y tolera el fallo final del registro de batch mediante `deleted.batch:false`.
- El delete directo de planeación elimina anexos y listas secuencialmente antes de la planeación; no elimina exámenes.
- Las ramas `generar-anexo`, `regenerar-anexo` y `toggle-expand` no tienen emisor DOM actual en Biblioteca.
- Cancelar el modal de examen no cancela un job; no existe acción visual de cancelación del job en Biblioteca.
- Permanecen las deudas conocidas `public.ia_metrics` frente a `public.ia_metrics_legacy` y `outputSummary.anexos_creados` posiblemente incorrecto.

## Sesión 2.1 — Coordinador de descarga de examen desde Biblioteca

### Resultado

- `bibDescargarExamen(examenId)` conserva su firma global como wrapper en `js/pages/biblioteca.page.js`.
- La implementación canónica vive en `window.ExamDownload.downloadFromBiblioteca(examenId)` dentro de `js/features/examenes/exam-download.js`.
- La extracción fue literal: conserva búsqueda en `bibliotecaState.conjuntos`, comparación mediante `normalizeBibliotecaId`, nombre sugerido, modal, cancelación, delegación a `window.downloadExamWord`, logs y `try/catch`.
- `pages/dashboard.html` no cambió porque `exam-download.js` ya carga antes de `dashboard.page.js` y `biblioteca.page.js`.

### Consumidores y contrato

| Función | Consumidor | Evento | Retorno | Clasificación |
| --- | --- | --- | --- | --- |
| `bibDescargarExamen(examenId)` | `onBibliotecaClick` | `data-bib-action="descargar-examen"` con `data-examen-id` | Promesa que resuelve `undefined`; errores capturados | Compatibilidad de Biblioteca |
| `ExamDownload.downloadFromBiblioteca(examenId)` | wrapper anterior | delegación directa | Mismo retorno, logs y efectos | Biblioteca activa |
| `window.downloadExamWord(examenId, filenameOverride)` | coordinador de card, preview y explorador legacy | exportación final | Promesa del exportador | Compartida activa |
| `ExamDownload.download(examenId, filenameOverride)` | wrapper `window.downloadExamWord` | descarga desde card/preview/legacy | Promesa; puede lanzar errores de detalle/contenido | Implementación canónica compartida |

No quedaron consumidores desconocidos. El wrapper de Biblioteca se retira en Fase 10, después de migrar el handler y confirmar una búsqueda global limpia.

### Dependencias conservadas

- Estado: lectura sin mutación de `bibliotecaState.conjuntos`.
- UI: `window.AppUI.buildDownloadSuggestedName` y `window.AppUI.openDownloadNameModal`.
- Exportador: `window.downloadExamWord`, cuyo wrapper delega a `ExamDownload.download`.
- Detalle: caché `window.explorerState.examenDetalleById`; fallback `window.obtenerExamenDetalle(examenId)` → service/API → `GET /api/examenes/:id`.
- Backend: UUID `examenes.id`, Bearer auth, filtro por `user_id` y respuesta `{ examen }`; sin cambios.

### Validación

- `node --check js/features/examenes/exam-download.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Smoke JSDOM: pasó para namespace, wrapper, caché, fallback, cancelación, delegación, retorno, error, logs y resolución real entre scripts clásicos en el orden de `dashboard.html`.
- Búsqueda global post-cambio: una implementación canónica, un wrapper y un consumidor activo; cero desconocidos.
- Validación manual de navegador y regresión acumulativa: aprobadas por el usuario. Se confirmaron descarga y cancelación desde card, nombre sugerido y editado, archivo `.doc` válido, preview y descarga desde preview, descargas de los otros documentos, tabs, recarga, ausencia de descargas duplicadas y errores relacionados, y legacy visual no ejecutado.

### Exclusiones confirmadas

No se modificaron preview, `wordExport.js`, delete, generación, polling, estado, render, event delegation, APIs, backend, detalle, Archivados ni legacy. La Sesión 2.2 queda definida, pero no implementada.

## Sesión 2.2 — Eliminación individual de examen

### Resultado

- Se creó `js/features/examenes/exam-delete.js`.
- `window.ExamDelete.deleteFromBiblioteca(examenId, conjuntoId)` es la implementación canónica.
- `bibEliminarExamen(examenId, conjuntoId)` permanece como wrapper en `js/pages/biblioteca.page.js`.
- `pages/dashboard.html` carga `exam-delete.js` junto a los módulos de examen y antes de `biblioteca.page.js`.
- La firma real conserva dos UUID strings: examen y conjunto/batch. No se redujo a un argumento.

### Consumidores y contrato

| Función | Consumidor | Evento | Estado/render | Clasificación |
| --- | --- | --- | --- | --- |
| `bibEliminarExamen(examenId, conjuntoId)` | `onBibliotecaClick` | `data-bib-action="eliminar-examen"` | Delegación sin cambios | Compatibilidad de Biblioteca |
| `ExamDelete.deleteFromBiblioteca(examenId, conjuntoId)` | wrapper anterior | Confirmación de la card | Muta examen/contador, fija tab, renderiza y recarga | Biblioteca activa |
| `apiDeleteExamen(id, accessToken)` | implementación canónica | Después de confirmar y obtener sesión | `DELETE /api/examenes/:id` | Compartida activa |

No quedaron consumidores desconocidos, legacy ni de Archivados. El wrapper se retira en Fase 10 después de migrar el handler y confirmar búsqueda global limpia.

### Comportamiento conservado

1. Normaliza `examenId` y `conjuntoId`; retorna si falta cualquiera.
2. Muestra `¿Eliminar este examen?` y `Esta acción no se puede deshacer.`.
3. Cancelar retorna sin pedir sesión ni llamar API.
4. Obtiene sesión y llama una sola vez `apiDeleteExamen(safeExamenId, token)`.
5. Registra `[biblioteca] delete:success`.
6. Busca el conjunto por UUID; si existe, filtra `conjunto.examenes` y recalcula `total_examenes`.
7. Fija selección/tab `examenes`, ejecuta `renderBibliotecaDetailInPlace()` y después espera `loadAndRenderBiblioteca({ silent: true, targetBatchId, activeTab: "examenes" })`.
8. Si el conjunto no está localmente, conserva selección, render y recarga.
9. Si falla la API, no muta estado y conserva `console.error` más `alert(error.message || mensaje vigente)`.

### API y persistencia verificadas

- Frontend: `apiDeleteExamen` permanece en `js/api/biblioteca.api.js`.
- Backend: `DELETE /api/examenes/:id`, protegido por `requireAuth`.
- `examenes.id` y `batch_id` son UUID; el service filtra por `id` y `user_id`.
- Éxito: `200 { ok: true }`.
- ID vacío: 400; sin token o usuario: 401; inexistente o de otro usuario: 404 `Examen no encontrado.`.
- Solo se elimina la fila de `examenes`. No se elimina el job relacionado; `examen_generation_jobs.examen_id` usa `ON DELETE SET NULL`.

### Validación

- Comparación literal contra `HEAD`: pasó ignorando solo indentación del IIFE.
- `node --check js/features/examenes/exam-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Smoke JSDOM: pasó para namespace, wrapper, cancelación, UUID/API, array, contador, selección/tab, render, recarga, orden, error, promesa, ausencia local y cero llamadas dobles.
- Smoke de scripts clásicos: pasó.
- Validación manual y regresión: aprobadas por el usuario. Cancelación, eliminación individual, permanencia en bloque/tab, conservación de otros recursos, persistencia tras recarga y eliminación de la fila correcta en Supabase fueron confirmadas sin errores relacionados.

### Exclusiones confirmadas

No se modificaron preview, descarga, Word, generación, polling, estado general, renderers, event delegation, API frontend, backend, otros deletes, Archivados ni legacy. La Sesión 2.3 quedó definida, pero no implementada.

## Sesión 2.3 — Eliminación individual de lista de cotejo

### Resultado

- Se creó `js/features/listas-cotejo/lista-cotejo-delete.js`.
- `window.ListaCotejoDelete.deleteFromBiblioteca(listaId, conjuntoId)` es la implementación canónica.
- `bibEliminarLista(listaId, conjuntoId)` permanece como wrapper en `js/pages/biblioteca.page.js`.
- `pages/dashboard.html` carga el módulo después de preview/descarga de listas y antes de los consumidores.
- La firma real conserva dos UUID strings: lista y conjunto/batch.

### Consumidores y contrato

| Función | Consumidor | Evento | Estado/render | Clasificación |
| --- | --- | --- | --- | --- |
| `bibEliminarLista(listaId, conjuntoId)` | `onBibliotecaClick` | `data-bib-action="eliminar-lista"` | Delegación sin cambios | Compatibilidad de Biblioteca |
| `ListaCotejoDelete.deleteFromBiblioteca(listaId, conjuntoId)` | wrapper anterior | Confirmación desde card | Muta lista/contador, fija tab, renderiza y recarga | Biblioteca activa |
| `apiDeleteListaCotejo(id, accessToken)` | implementación canónica | Después de confirmar y obtener sesión | `DELETE /api/listas-cotejo/:id` | Compartida activa |

No quedaron consumidores desconocidos, de Archivados ni del explorador legacy. El wrapper se retira en Fase 10 después de migrar el handler y confirmar búsqueda global limpia.

### Comportamiento conservado

1. Normaliza `listaId` y `conjuntoId`; retorna si falta cualquiera.
2. Muestra `¿Eliminar esta lista de cotejo?` y `Esta acción no se puede deshacer.`.
3. Cancelar retorna sin pedir sesión ni llamar API.
4. Obtiene sesión y llama una sola vez `apiDeleteListaCotejo(safeListaId, token)`.
5. Registra `[biblioteca] delete:success` con `resourceType: "lista_cotejo"`.
6. Busca el conjunto por UUID; si existe, filtra `conjunto.listas_cotejo` y recalcula `total_listas_cotejo`.
7. Conserva el bloque y fija el tab `"listas"`.
8. Ejecuta `renderBibliotecaDetailInPlace()` y después espera `loadAndRenderBiblioteca({ silent: true, targetBatchId, activeTab: "listas" })`.
9. Si la lista no está localmente, conserva selección, render y recarga.
10. Si falla la API, no muta estado y conserva el log y la alerta existentes.

### API y persistencia verificadas

- Frontend: `apiDeleteListaCotejo` permanece en `js/api/biblioteca.api.js`.
- Backend: `DELETE /api/listas-cotejo/:id`, protegido por `requireAuth`.
- `listas_cotejo.id` y `batch_id` son UUID; `planeacion_id` es bigint y no se usa como ID de delete.
- El service filtra por `id` y `user_id`.
- Éxito: `200 { ok: true }`.
- ID vacío: 400; sin token o usuario: 401; inexistente o de otro usuario: 404 `Lista de cotejo no encontrada.`.
- Solo se elimina la fila de `listas_cotejo`; no se modifican planeación, anexo, examen ni batch.

### Validación

- Comparación literal contra `HEAD`: pasó ignorando solo indentación del IIFE.
- `node --check js/features/listas-cotejo/lista-cotejo-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, UUID/API, array, contador, selección/tab, render, recarga, orden, error, promesa, ausencia local y cero llamadas dobles.
- Smoke de scripts clásicos: pasó.
- Validación manual y regresión: aprobadas por el usuario. Se confirmó cancelación sin eliminación, eliminación exclusiva de la lista, card retirada, bloque/tab conservados, persistencia tras recarga, recursos relacionados intactos, una única eliminación exitosa en backend y ausencia de errores relacionados.

### Exclusiones confirmadas

No se modificaron preview, descarga, Word, generación, estado general, renderers, event delegation, APIs, backend, `exam-delete.js`, otros deletes, Archivados ni legacy. La Sesión 2.4 quedó definida como siguiente alcance.

## Sesión 2.4 — Eliminación individual de anexo

### Resultado

- Se creó `js/features/anexos/anexo-delete.js`.
- `window.AnexoDelete.deleteFromBiblioteca(anexoId, conjuntoId)` es la implementación canónica.
- `bibEliminarAnexo(anexoId, conjuntoId)` permanece como wrapper en `js/pages/biblioteca.page.js`.
- `pages/dashboard.html` carga el módulo después de preview/descarga de anexos y antes de los consumidores.
- La firma real conserva dos UUID strings: anexo y conjunto/batch.

### Consumidores y contrato

| Función | Consumidor | Evento | Estado/render | Clasificación |
| --- | --- | --- | --- | --- |
| `bibEliminarAnexo(anexoId, conjuntoId)` | `onBibliotecaClick` | `data-bib-action="eliminar-anexo"` | Delegación sin cambios | Compatibilidad de Biblioteca |
| `AnexoDelete.deleteFromBiblioteca(anexoId, conjuntoId)` | wrapper anterior | Confirmación desde card | Muta anexo/contador, fija tab, renderiza y recarga | Biblioteca activa |
| `apiDeleteAnexo(id, accessToken)` | implementación canónica | Después de confirmar y obtener sesión | `DELETE /api/anexos/:id` | Compartida activa |

No quedaron consumidores desconocidos, de Archivados ni del explorador legacy. El wrapper se retira en Fase 10 después de migrar el handler y confirmar búsqueda global limpia.

### Comportamiento conservado

1. Normaliza `anexoId` y `conjuntoId`; retorna si falta cualquiera.
2. Muestra `¿Eliminar este anexo?` y `Esta acción no se puede deshacer.`.
3. Cancelar retorna sin pedir sesión ni llamar API.
4. Obtiene sesión y llama una sola vez `apiDeleteAnexo(safeAnexoId, token)`.
5. Registra `[biblioteca] delete:success` con `resourceType: "anexo"`.
6. Busca el conjunto por UUID; si existe, filtra `conjunto.anexos` y recalcula `total_anexos`.
7. Conserva el bloque y fija el tab `"anexos"`.
8. Ejecuta `renderBibliotecaDetailInPlace()` y después espera `loadAndRenderBiblioteca({ silent: true, targetBatchId, activeTab: "anexos" })`.
9. Si el anexo no está localmente, conserva selección, render y recarga.
10. Si falla la API, no muta estado y conserva el log y la alerta existentes.

### API y persistencia verificadas

- Frontend: `apiDeleteAnexo` permanece en `js/api/biblioteca.api.js`; no existe `js/services/anexos.service.js`.
- Backend: `DELETE /api/anexos/:id`, protegido por `requireAuth`.
- `anexos.id` y `batch_id` son UUID; `planeacion_id` es bigint y no se usa como ID de delete.
- El service filtra por `id` y `user_id`.
- Éxito: `200 { ok: true }`.
- ID vacío: 400; sin token o usuario: 401; inexistente o de otro usuario: 404 `Anexo no encontrado.`.
- Solo se elimina la fila de `anexos`; no se modifican planeación, lista, examen ni batch.
- La relación uno a uno vigente se apoya en el índice único de `planeacion_id`; esa FK apunta a planeaciones con `ON DELETE CASCADE`.

### Validación

- Comparación literal contra `HEAD`: pasó ignorando solo indentación del IIFE.
- `node --check js/features/anexos/anexo-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, sesión, API/UUID, array, `total_anexos`, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, anexo ausente y cero llamadas dobles.
- Validación manual y regresión: aprobadas por el usuario. Se confirmó cancelación sin eliminación, eliminación exclusiva del anexo, card y contador actualizados, bloque/tab conservados, persistencia tras recarga, recursos relacionados intactos y eliminación de una sola fila en Supabase, sin errores relacionados.

### Exclusiones confirmadas

No se modificaron preview, descarga, generación, regeneración, estado general, renderers, event delegation, APIs, backend, deletes de examen/lista/planeación/bloque, Archivados ni legacy. La Sesión 2.5 quedó definida como siguiente alcance.

## Sesión 2.5 — Eliminación individual de planeación

### Resultado

- Se creó `js/features/planeaciones/planeacion-delete.js`.
- `window.PlaneacionDelete.deleteFromBiblioteca(planeacionId, conjuntoId)` es la implementación canónica.
- `bibEliminarPlaneacion(planeacionId, conjuntoId)` permanece como wrapper en `js/pages/biblioteca.page.js`.
- `pages/dashboard.html` carga el módulo después de `planeacion-download.js` y antes de `dashboard.page.js` y `biblioteca.page.js`.
- La firma real conserva `planeacionId` bigint representado desde el DOM como string y `conjuntoId`/batch como UUID string.

### Consumidores y contrato

| Función | Consumidor | Evento | Estado/render | Clasificación |
| --- | --- | --- | --- | --- |
| `bibEliminarPlaneacion(planeacionId, conjuntoId)` | `onBibliotecaClick` | `data-bib-action="eliminar-planeacion"` | Delegación sin cambios | Compatibilidad de Biblioteca |
| `PlaneacionDelete.deleteFromBiblioteca(planeacionId, conjuntoId)` | wrapper anterior | Confirmación desde card | Muta tres arrays/contadores, fija tab, renderiza y recarga | Biblioteca activa |
| `apiDeletePlaneacionDirecta(id, accessToken)` | implementación canónica | Después de confirmar y obtener sesión | `DELETE /api/planeaciones/:id/directo` | Compartida activa |
| `eliminarPlaneacionApi(id)` | Dashboard jerárquico | Confirmación legacy | Endpoint ordinario y render legacy | Legacy visual; excluido |
| `eliminarPlaneacionPermanentementeApi(id)` | Archivados | Eliminación permanente | Endpoint y flujo separados | Archivados; excluido |

No quedaron consumidores desconocidos. El wrapper se retira en Fase 10 tras migrar el handler y confirmar búsqueda global limpia.

### Comportamiento conservado

1. Normaliza `planeacionId` y `conjuntoId`; retorna si falta cualquiera.
2. Muestra `¿Eliminar esta planeación?` y `Se eliminarán también sus listas de cotejo y anexos asociados. Esta acción no se puede deshacer.`.
3. Cancelar retorna sin pedir sesión ni llamar API.
4. Obtiene sesión y llama una sola vez `apiDeletePlaneacionDirecta(safePlanId, token)`.
5. Registra `[biblioteca] delete:success` con recurso, planeación y batch.
6. Busca el conjunto por UUID; si existe, filtra `planeaciones`, las listas cuyo `planeacion_id` coincide y los anexos relacionados, y recalcula sus tres contadores.
7. No modifica `examenes` ni `total_examenes`.
8. Conserva el bloque y fija el tab `"planeaciones"`.
9. Ejecuta `renderBibliotecaDetailInPlace()` y después espera `loadAndRenderBiblioteca({ silent: true, targetBatchId, activeTab: "planeaciones" })`.
10. Si la planeación no está localmente, conserva selección, render y recarga.
11. Si falla la API, no inicia la mutación local y conserva el log y la alerta existentes.

### API y persistencia verificadas

- Frontend: `apiDeletePlaneacionDirecta` permanece en `js/api/biblioteca.api.js`.
- Backend: `DELETE /api/planeaciones/:id/directo`, protegido por `requireAuth`.
- `planeaciones.id` es bigint; `batch_id` y `tema_id` son UUID; IDs de anexos, listas y exámenes son UUID.
- El service busca la planeación por `id` y `user_id`; inexistente o perteneciente a otro usuario produce 404.
- Elimina secuencialmente anexos asociados, listas asociadas y planeación, comprobando cada error.
- No existe transacción ni rollback; un fallo intermedio puede dejar eliminaciones parciales ya confirmadas.
- Éxito: `200 { ok: true }`; ID vacío: 400; falta de autenticación: 401; recurso no encontrado: 404.
- No elimina exámenes ni batch. La relación con `batch_id` y `tema_id` no se reinterpretó.

### Validación

- Comparación literal contra `HEAD`: pasó ignorando solo indentación del IIFE.
- `node --check js/features/planeaciones/planeacion-delete.js`: pasó.
- `node --check js/pages/biblioteca.page.js`: pasó.
- `npm test -- --runInBand`: pasó, 1 suite y 2 pruebas.
- Smoke JSDOM: pasó para namespace, wrapper, firma, cancelación, sesión, API, IDs, tres arrays/contadores, exámenes intactos, selección/tab, render parcial, recarga silenciosa, orden, error, promesa, planeación ausente y cero llamadas dobles.
- Smoke de scripts clásicos: pasó.
- Validación manual de cancelación, eliminación real, persistencia, relaciones, Supabase y regresión: aprobada por el usuario. Se confirmó que cancelar conserva todos los recursos; aceptar elimina la planeación, su anexo y su lista; mantiene examen, batch y recursos de otras planeaciones; actualiza contadores, bloque y tab; persiste tras recarga y no produce errores relacionados.

### Exclusiones confirmadas

No se modificaron descarga de planeación, detalle, edición, Word/Excel, generación, estado general, renderers, event delegation, APIs, backend, otros deletes, delete de bloque, Archivados ni legacy. La Sesión 2.6 quedó definida como auditoría específica.

## Sesión 2.6 — Auditoría específica de eliminación de bloque

### Decisión

**A. La eliminación de bloque puede extraerse en una Sesión 2.7.**

Existe una sola función coordinadora, un consumidor activo conocido, firma y API estables, dependencias de estado/render identificadas y un wrapper viable. La extracción puede ser literal y no requiere migrar `bibliotecaState`, reescribir render, cambiar la API ni corregir las respuestas parciales del backend.

### Consumidores

| Función | Definición | Consumidor | Evento | Estado/render | Clasificación |
| --- | --- | --- | --- | --- | --- |
| `BibliotecaBlockDelete.deleteFromBiblioteca(conjuntoId)` | `js/features/biblioteca/biblioteca-block-delete.js` | wrapper `bibEliminarBloque` | Después de `data-bib-action="eliminar-bloque"` | Coordina confirmación, API, estado, render general y recarga | Biblioteca activa |
| `bibEliminarBloque(conjuntoId)` | `js/pages/biblioteca.page.js` | `onBibliotecaClick` | `data-bib-action="eliminar-bloque"` | Delega literalmente al módulo propietario | Compatibilidad |
| `apiBibliotecaDeleteBloque(batchId, accessToken)` | `js/api/biblioteca.api.js` | `BibliotecaBlockDelete.deleteFromBiblioteca` | Después de confirmar y obtener sesión | `DELETE /api/biblioteca/bloques/:batchId` | Compartida activa |
| `deleteBibliotecaBloque(...)` | backend `biblioteca.service.js` | controller `deleteBloque` | Route autenticada | Borrado secuencial y respuesta parcial | Compartida activa |
| `apiPlaneacionesPermanentDeleteBatch` / `eliminarRutaBatchPermanentementeApi` | API/service de planeaciones | Archivados | Eliminación permanente de planeaciones archivadas | Endpoint y contrato diferentes | Archivados; excluido |

No existen handlers inline, listeners adicionales, tests directos, consumidores legacy visuales ni consumidores desconocidos de `bibEliminarBloque`.

### Comportamiento frontend actual

1. Recibe `conjuntoId`, UUID string de `data-conjunto-id`, y lo normaliza.
2. Busca el conjunto local para obtener el título; si no existe usa `"este bloque"`.
3. Muestra `¿Eliminar "<nombre>"?` y `Se eliminará el bloque completo: planeaciones, exámenes, listas de cotejo y anexos. Esta acción no se puede deshacer.`.
4. Cancelar retorna sin solicitar sesión ni llamar API.
5. Obtiene sesión mediante `window.requireSession()` y llama `apiBibliotecaDeleteBloque`.
6. No inspecciona `{ ok, deleted }`; cualquier JSON de una respuesta HTTP 2xx permite continuar.
7. Registra `[biblioteca] delete:success`.
8. Filtra el bloque completo de `bibliotecaState.conjuntos`.
9. Si era el seleccionado, selecciona el primer bloque restante o `null`.
10. Elimina su tab y cuatro entradas de progreso.
11. Ejecuta `renderBibliotecaContent()` y después espera `loadAndRenderBiblioteca({ silent: true })`.
12. No navega a otra URL ni muestra feedback de éxito adicional.
13. Un error HTTP conserva el estado local previo y muestra log más `alert`.
14. Si el bloque no existe localmente pero sí en backend, usa el título fallback, ejecuta el delete, limpia las claves por batch y recarga; si tampoco existe en backend recibe 404 y no muta estado.
15. La función `async` resuelve `undefined`; captura sus errores y no expone el JSON recibido.

Globals consumidos: `normalizeBibliotecaId`, `findConjuntoById`, `showBibConfirm`, `window.requireSession`, `apiBibliotecaDeleteBloque`, `bibliotecaState`, `renderBibliotecaContent` y `loadAndRenderBiblioteca`. Expone `window.BibliotecaBlockDelete`; `bibEliminarBloque` permanece global por script clásico como wrapper. La carga vigente requiere `biblioteca.api.js` antes de `biblioteca-block-delete.js`, y este módulo antes de `dashboard.page.js`, `biblioteca.page.js` y `main.js`.

### Contrato backend

- Endpoint: `DELETE /api/biblioteca/bloques/:batchId`.
- Frontend: no existe `js/services/biblioteca.service.js`; Biblioteca consume directamente el wrapper clásico de `js/api/biblioteca.api.js`.
- Autenticación: `requireAuth`; token ausente o inválido produce 401.
- `batchId`: UUID de `planeacion_batches.id`.
- Propiedad: consulta inicial por `id` y `user_id`; inexistente o de otro usuario produce 404 `Bloque no encontrado.`.
- Orden: `anexos` → `listas_cotejo` → `examenes` → `planeaciones` → intento de `planeacion_batches`.
- Cada delete de recurso filtra por `batch_id` y `user_id`.
- No existe transacción, RPC ni rollback.
- Un error en anexos, listas, exámenes o planeaciones detiene el flujo y llega como error HTTP; los deletes anteriores ya confirmados permanecen.
- Un error exclusivo al eliminar el batch se convierte en warning y HTTP 200 `{ ok: true, deleted: { batch: false } }`.
- Éxito completo: HTTP 200 `{ ok: true, deleted: { batch: true } }`.

### Recursos y relaciones

| Recurso | Efecto actual |
| --- | --- |
| Anexos | Elimina todas las filas del usuario con el mismo `batch_id`. |
| Listas de cotejo | Elimina todas las filas del usuario con el mismo `batch_id`. |
| Exámenes | Elimina todas las filas del usuario con el mismo `batch_id`. |
| Planeaciones | Elimina todas las filas del usuario con el mismo `batch_id`, incluidas archivadas. |
| Batch | Se intenta al final; puede permanecer vacío con `deleted.batch:false`. |
| Archivados | Planeaciones archivadas con ese `batch_id` también son eliminadas; el endpoint no filtra `is_archived`. |
| Jobs de métricas IA | Permanecen; `ai_generation_jobs.batch_id` no es eliminado por el service. |
| Jobs de examen e items | Permanecen; al eliminar exámenes, referencias `examen_id` pueden quedar en `null` según FK. |
| Métricas/calls | Permanecen; no hay deletes sobre tablas de métricas. |
| Jerarquía | Planteles, grados, materias, unidades y temas permanecen. |
| `unidad_id` y `tema_id` | No se usan como criterio de delete y sus entidades jerárquicas permanecen. |

### Estado auditado

| Propiedad real | Operación inmediata | Resultado tras recarga |
| --- | --- | --- |
| `bibliotecaState.conjuntos` | Filtra el batch completo | Se reemplaza con `GET /api/biblioteca/conjuntos`. |
| `selectedConjuntoId` | Si coincide, primer conjunto restante o `null`; si no, se conserva | El loader conserva la selección existente o elige el primer conjunto disponible. |
| `activeTab[safeBatchId]` | Elimina la clave | Si el batch reaparece y queda seleccionado sin tab, el loader usa `planeaciones`. |
| `pendingPlaneacionesByBatchId[safeBatchId]` | Elimina la clave | No se restaura. |
| `pendingExamenByBatchId[safeBatchId]` | Elimina la clave | No se restaura. |
| `pendingListaByBatchId[safeBatchId]` | Elimina la clave | No se restaura. |
| `anexosGenerating[safeBatchId]` | Elimina la clave | No se restaura. |
| `pendingBatchId`, `pendingConjunto`, `expandedIds` | Sin cambios | Conservan el comportamiento actual. |

Los nombres conceptuales `anexosPending`, `listasPending`, `examenesPending` y `planeacionesPending` no existen. Las propiedades reales son las indicadas arriba.

### Render, recarga y respuestas parciales

| Paso | Función | Efecto |
| --- | --- | --- |
| 1 | `renderBibliotecaContent()` | Render completo inmediato de sidebar y detalle usando el estado filtrado. |
| 2 | `loadAndRenderBiblioteca({ silent: true })` | Solicita sesión otra vez, ejecuta `GET /api/biblioteca/conjuntos`, reemplaza conjuntos y renderiza de nuevo. |
| 3 | Selección | Si se eliminó el seleccionado, usa el primer bloque restante; si no quedan, muestra detalle vacío. |
| 3a | Bloque no seleccionado | La función lo filtra y limpia sus claves, pero conserva la selección actual; no existe emisor activo para este caso. |
| 4 | `deleted.batch:false` con otros bloques | El batch vacío reaparece en sidebar después de la recarga, normalmente sin recuperar la selección. |
| 5 | `deleted.batch:false` sin otros bloques | El loader vuelve a seleccionar el batch vacío al ser el primer elemento disponible. |
| 6 | Fallo de recarga | El loader captura su propio error, muestra el estado general de error y no revierte el delete ni entra al `catch` del coordinador. |

`renderBibliotecaDetailInPlace`, `setSelectedConjunto` y `updateBibliotecaSidebarActive` no son llamados directamente por el delete de bloque. `renderBibliotecaSidebar` se ejecuta indirectamente dentro del render general. No existe navegación.

### Comparación con deletes individuales

| Aspecto | Delete individual | Delete de bloque |
| --- | --- | --- |
| Recursos afectados | Uno; planeación incluye anexo/lista asociados | Cuatro dominios y el batch |
| Estado afectado | Array/contador del recurso y tab | Conjunto completo, selección, tab y cuatro mapas pending |
| Render | Parcial de detalle | General de sidebar y detalle |
| Recarga | Silenciosa con batch/tab objetivo | Silenciosa sin objetivo |
| Riesgo backend | Uno o tres deletes secuenciales | Cinco deletes secuenciales |
| Riesgo parcial | Limitado; planeación no transaccional | Alto; puede vaciar recursos y conservar batch |
| Confirmación | Recurso individual | Nombra todos los dominios y el bloque |
| Wrapper | Ya comprobado | Viable con firma de un argumento |
| Extracción literal | Completada | Viable, sin reutilizar abstracción universal |

## Sesión 2.7 — Eliminación de bloque desde Biblioteca

### Resultado

```text
Módulo: js/features/biblioteca/biblioteca-block-delete.js
Namespace: window.BibliotecaBlockDelete
Función: deleteFromBiblioteca(conjuntoId)
Wrapper: bibEliminarBloque(conjuntoId)
Retiro del wrapper: Fase 10
Riesgo: Medio/alto
Estado de código: completado
Validación manual: aprobada
```

La implementación activa se trasladó literalmente desde `js/pages/biblioteca.page.js`. El wrapper conserva el único consumidor activo, `data-bib-action="eliminar-bloque"`, y no quedaron consumidores desconocidos.

### Dependencias y comportamiento conservados

- `normalizeBibliotecaId`, `findConjuntoById`, `showBibConfirm` y `requireSession`.
- `apiBibliotecaDeleteBloque(batchId, accessToken)` sin cambios.
- `bibliotecaState.conjuntos`, `selectedConjuntoId`, `activeTab`, `pendingPlaneacionesByBatchId`, `pendingExamenByBatchId`, `pendingListaByBatchId` y `anexosGenerating`.
- `renderBibliotecaContent()` seguido de `loadAndRenderBiblioteca({ silent: true })`.
- La respuesta de API no se inspecciona: `deleted.batch:false` continúa tratándose igual que `deleted.batch:true`.
- Se mantienen el texto de confirmación, el fallback `"este bloque"`, los logs, la alerta, la promesa y el retorno.

### Orden de scripts

`planeacion-delete.js` → `biblioteca-block-delete.js` → `dashboard.page.js` → `biblioteca.page.js` → `main.js`.

### Validaciones

- Comparación literal contra `HEAD`: aprobada, ignorando solo la indentación del contenedor.
- `node --check` del módulo y `biblioteca.page.js`: aprobado.
- `npm test -- --runInBand`: aprobado (1 suite, 2 pruebas).
- Smoke JSDOM: aprobado; cubrió namespace, wrapper, UUID, título/fallback, cancelación, sesión, API única, error HTTP, selección, estado vacío, limpieza y conservación de mapas, orden de render/recarga y respuestas `deleted.batch:true/false`.
- Validación manual: aprobada por el usuario. Cancelar conservó el bloque y evitó el DELETE; aceptar eliminó batch, planeaciones, anexos, listas y exámenes; la eliminación persistió, la selección/estado vacío funcionó, los demás bloques permanecieron intactos y no hubo errores relacionados ni ejecución legacy.
- Logs backend confirmados: `[biblioteca] delete:start` y `[biblioteca] delete:success` con `deletedBatch: true`.

### Exclusiones confirmadas

No se modificaron backend, respuesta parcial, transacciones, rollback, API, store, renderers, event delegation, deletes individuales, Archivados, jobs, métricas, jerarquía ni legacy.

## Sesión 2.8 — Auditoría de cierre de Fase 2

### Decisión

**A. Cerrar Fase 2 y abrir Fase 3.**

Las acciones directas de preview, descarga y eliminación activas tienen propietario modular y wrappers conocidos. Las acciones restantes pertenecen inequívocamente a API, generación/polling, estado, render/eventos, Dashboard o legacy. No quedaron consumidores desconocidos ni candidatos adicionales de Fase 2.

### Sesiones cerradas

| Sesión | Acción | Estado |
| --- | --- | --- |
| 2.0 | Auditoría y mapa de acciones | Completada |
| 2.1 | Coordinador de descarga de examen | Completada y validada |
| 2.2 | Delete de examen | Completada y validada |
| 2.3 | Delete de lista de cotejo | Completada y validada |
| 2.4 | Delete de anexo | Completada y validada |
| 2.5 | Delete de planeación | Completada y validada |
| 2.6 | Auditoría específica de delete de bloque | Completada |
| 2.7 | Delete de bloque | Completada y validada |

### Matriz de acciones restantes

| Dominio | Acción restante | Función o área | Dependencias | Riesgo | Fase correcta | Decisión |
| --- | --- | --- | --- | --- | --- | --- |
| Planeaciones | Ver detalle y editar/guardar | enlace `detalle.html`, `detalle.page.js` | navegación, estado de detalle y Dashboard | Medio | 7 | Fase posterior |
| Planeaciones | Agregar temas, crear bloque y generar | `open/submitBibliotecaAgregarModal`, quick create | APIs, SSE, pending, render y Dashboard | Alto | 4, 6 y 7 | Fase posterior |
| Anexos | Generar seleccionados | modal y `submitBibliotecaAnexoCreateModal` | API, pending, render y feedback | Alto | 4 y 6 | Fase posterior |
| Anexos | Generar/regenerar sin emisor DOM | `bibGenerarAnexo`, `bibRegenerarAnexo` | generación, estado pending y recarga | Alto | 4 | Compatibilidad; fase posterior |
| Listas | Generar | `open/submitBibliotecaListaModal` | API, generación asíncrona, pending y render | Alto | 4 y 6 | Fase posterior |
| Exámenes | Generar y consultar estado | `open/submitBibliotecaExamModal`, polling | jobs, polling, pending y render | Alto | 4 y 6 | Fase posterior |
| Bloques | Seleccionar, tabs, buscar y reintentar | `setSelectedConjunto`, handler y loader | `bibliotecaState`, render y event delegation | Medio/alto | 5 y 6 | Fase posterior |
| Bloques | Crear desde quick create | Dashboard y `window.biblioteca` | jerarquía, generación, estado y Dashboard | Alto | 4, 5 y 7 | Fase posterior |
| Todos | Requests, sesión, headers y errores HTTP | `js/api`, `js/services`, fetch directos | contratos API y auth | Medio | 3 | Próxima fase |
| Todos | Wrappers y globals temporales | coordinadores `bib*` y `window.*` | handlers actuales y orden de scripts | Medio | 10 | Conservar |
| Jerarquía visual | Acciones del explorador antiguo | `dashboard.page.js` | `explorerState`, render/eventos legacy | Alto | 8–9 | Legacy; excluido |

### Matriz de módulos por dominio

| Dominio | Preview | Descarga | Delete | Estado |
| --- | --- | --- | --- | --- |
| Exámenes | Completado | Completado | Completado | Fase posterior (5) |
| Listas | Completado | Completado | Completado | Fase posterior (5) |
| Anexos | Completado | Completado | Completado | Fase posterior (5) |
| Planeaciones | No aplica: usa detalle | Completado | Completado | Fase posterior (5) |
| Biblioteca | No aplica | No aplica | Completado | Fase posterior (5) |

### Wrappers vigentes

| Wrapper | Firma | Consumidor | Propietario | Retiro |
| --- | --- | --- | --- | --- |
| `bibDescargarExamen` | `(examenId)` | `data-bib-action="descargar-examen"` | `ExamDownload` | Fase 10 |
| `bibEliminarExamen` | `(examenId, conjuntoId)` | `data-bib-action="eliminar-examen"` | `ExamDelete` | Fase 10 |
| `bibEliminarLista` | `(listaId, conjuntoId)` | `data-bib-action="eliminar-lista"` | `ListaCotejoDelete` | Fase 10 |
| `bibEliminarAnexo` | `(anexoId, conjuntoId)` | `data-bib-action="eliminar-anexo"` | `AnexoDelete` | Fase 10 |
| `bibEliminarPlaneacion` | `(planeacionId, conjuntoId)` | `data-bib-action="eliminar-planeacion"` | `PlaneacionDelete` | Fase 10 |
| `bibEliminarBloque` | `(conjuntoId)` | `data-bib-action="eliminar-bloque"` | `BibliotecaBlockDelete` | Fase 10 |

Todos permanecen disponibles globalmente por scripts clásicos.

### Próxima fase

`Fase 3 — Sesión 3.0: Auditoría de capa API frontend`, exclusivamente documental. Debe mapear funciones de `js/api`, funciones de `js/services`, fetch directos, obtención de sesión, headers, parseo de errores, endpoints duplicados, contratos por dominio, consumidores, APIs legacy y APIs de Archivados.

## Dependencias conocidas

- `dashboard.html` carga `planeacion-download.js`, después `planeacion-delete.js`, `biblioteca-block-delete.js`, `dashboard.page.js`, `biblioteca.page.js` y finalmente `main.js`.
- `initDashboardPage()` delega a `window.initBiblioteca()` y retorna antes de hidratar el explorador.
- Biblioteca consume partes de `window.explorerState` y wrappers de preview/descarga publicados por Dashboard.
- Dashboard consume `window.biblioteca` durante creación y progreso de planeaciones.
- Archivados consume APIs y services jerárquicos.

## Wrappers pendientes

- `window.explorerState` es mixto y no puede eliminarse completo.
- `window.renderExamPreviewModal` y `window.renderListaCotejoPreviewModal` sirven a Biblioteca.
- `window.downloadExamWord`, `window.renderBibliotecaContent` y `window.biblioteca` conservan consumidores.
- `bibDescargarPlaneacion(planeacionId)` conserva un wrapper modular hasta migrar el handler y confirmar una búsqueda global sin consumidores en Fase 10.
- `bibDescargarExamen(examenId)` conserva un wrapper modular hasta migrar `data-bib-action="descargar-examen"` y confirmar una búsqueda global sin consumidores en Fase 10.
- `bibEliminarExamen(examenId, conjuntoId)` conserva un wrapper modular hasta migrar `data-bib-action="eliminar-examen"` y confirmar una búsqueda global sin consumidores en Fase 10.
- `bibEliminarLista(listaId, conjuntoId)` conserva un wrapper modular hasta migrar `data-bib-action="eliminar-lista"` y confirmar una búsqueda global sin consumidores en Fase 10.
- `bibEliminarAnexo(anexoId, conjuntoId)` conserva un wrapper modular hasta migrar `data-bib-action="eliminar-anexo"` y confirmar una búsqueda global sin consumidores en Fase 10.
- `bibEliminarPlaneacion(planeacionId, conjuntoId)` conserva un wrapper modular hasta migrar `data-bib-action="eliminar-planeacion"` y confirmar una búsqueda global sin consumidores en Fase 10.
- `bibEliminarBloque(conjuntoId)` conserva un wrapper modular hasta migrar `data-bib-action="eliminar-bloque"` y confirmar una búsqueda global sin consumidores en Fase 10.

## Zonas protegidas

- payloads, IDs y contratos backend;
- generación, prompts, polling y jobs;
- schema y jerarquía técnica;
- autenticación y configuración API;
- descargas Word y `js/ui/wordExport.js`;
- estado compartido, wrappers y orden de scripts;
- Archivados como flujo separado.

## Documentos de continuidad

- [Roadmap](REFACTOR_ROADMAP.md)
- [Playbook](REFACTOR_PLAYBOOK.md)
- [Test matrix](TEST_MATRIX.md)
- [Arquitectura frontend](../ARCHITECTURE.md)
- [Decisiones](REFACTOR_DECISIONS.md)
- Backend: [`DATABASE_SCHEMA.md`](../../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md)
- Backend: [`AI_GENERATION_CONTRACTS.md`](../../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md)
- Backend: [`03-backend-guide.md`](../../../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md)

## Última sesión

2026-07-26 — Fase 3, Sesión 3.0: auditoría e inventario de contratos
HTTP. Sesión exclusivamente documental; no se modificó código funcional.

## Estado de entrada de la Sesión 3.0

| Verificación | Resultado |
| --- | --- |
| Frontend | Rama `refactor-front`, HEAD `7414292`, working tree limpio |
| Cierre de Fase 2 | `7414292 docs(refactor): close domain actions phase` presente |
| Backend | Rama `refactor-back`, HEAD `e08d6e4`, working tree limpio |
| Roadmap al iniciar | Fases 0, 1 y 2 completadas; Fase 3 pendiente |
| Trabajo previo | Validación manual acumulativa de Fase 2 aprobada; no se volvió a solicitar |

## Resultado de la auditoría HTTP

El inventario exhaustivo, incluida cada función HTTP, wrapper, helper,
consumidor, global y contrato, se conserva en
[`docs/FRONTEND_MAP.md`](../FRONTEND_MAP.md). No quedan archivos, funciones ni
endpoints desconocidos.

### Inventario de archivos

| Grupo | Archivos | Clasificación |
| --- | --- | --- |
| API | `anexos.api.js`, `biblioteca.api.js`, `examenes.api.js`, `listas_cotejo.api.js` | API activa |
| API mixta | `jerarquia.api.js` | Compatibilidad, Archivados y legacy |
| API mixta | `planeaciones.api.js` | Detalle/edición, Archivados, compatibilidad y legacy |
| Services de dominio | `examenes.service.js`, `listas_cotejo.service.js` | Service activo/compatibilidad |
| Service jerárquico | `jerarquia.service.js` | Compartido, Archivados y legacy |
| Service de planeaciones | `planeaciones.service.js` | Detalle/edición, Archivados, compatibilidad y legacy |
| Auth | `auth.service.js` | Compartido |
| Core | `config.js`, `supabase.client.js`, `utils.js` | Compartido |

Los consumidores exactos, responsabilidades y globals de cada archivo están en
la tabla de inventario de `FRONTEND_MAP.md`.

### Inventario de funciones

| Familia | Funciones HTTP/wrappers | Estado |
| --- | ---: | --- |
| Anexos API | 5 | Activa; 2 lecturas sin consumidor y 1 regeneración de compatibilidad |
| Biblioteca API | 7 | Activa en Biblioteca/Detalle |
| Exámenes API + service | 4 + 4 | Activa y legacy |
| Listas API + service | 3 + 3 | Activa y legacy |
| Jerarquía API + service | 25 + 25 | Compartida, Archivados y legacy |
| Planeaciones API + wrappers HTTP | 16 + 16 | Detalle, Archivados, compatibilidad y legacy |
| Auth | 2 métodos públicos | Compartida |
| Helpers API/session/normalización | 28 | Clasificados; `debugPlaneacionRequest` sin consumidor |
| Registro local no HTTP de Archivados | 19 | Archivados/compatibilidad |

Funciones sin consumidor confirmado, por nombre:
`apiObtenerAnexosPorBatch`, `apiObtenerAnexoPorPlaneacion`,
`debugPlaneacionRequest`, `crearTemas`, `generarPlaneacionesUnidad`,
`generarPlaneacionApi` y `restoreArchivedHierarchyScope`. Se conservan y se
clasifican como `Sin consumidor` o compatibilidad, nunca como desconocidas.

### Fetch directos fuera de API

| Función | Archivo | Uso | Contrato |
| --- | --- | --- | --- |
| `injectComponent` | `dashboard.page.js` | Layout/sidebar | GET relativo, sin auth, `text()` |
| `loadPrivateComponent` | `components.private.js` | Navbar/footer privados | GET relativo, sin auth, `text()` |
| `loadComponent` | `components.public.js` | Navbar/footer públicos | GET relativo, sin auth, `text()` |

No hay `fetch` directo al backend Express fuera de `js/api`; no se encontró
`axios` ni `XMLHttpRequest`.

### Sesión y token

| Método | Retorno/efecto | Consumidores | Error |
| --- | --- | --- | --- |
| `protegerRuta()` | Publica `currentUser` | `main.js` | Redirige y no lanza |
| `requireSession()` | Session o `null` | Services, páginas y features | Redirige y no lanza |
| `supabase.auth.getSession()` | Sesión SDK | Los dos anteriores | No se transforma expresamente |
| `withSession` y wrappers equivalentes | Resultado callback o `null` | Services | Delegan a `requireSession` |
| `supabase.auth.getUser()` | Usuario | UI privada/Detalle | Manejo local |
| `onAuthStateChange()` | Suscripción | Auth global | Toast opcional y redirect al cerrar sesión |

Todos los endpoints Express auditados requieren Bearer. Archivados y legacy
usan los mismos métodos de sesión.

### Headers

| Patrón | Ámbito | Riesgo |
| --- | --- | --- |
| Bearer | GET/PATCH/DELETE sin body | Bajo |
| Bearer + JSON | POST/PUT/PATCH con body; un GET de batch también lo añade | Bajo/medio |
| Bearer + JSON + `Accept: text/event-stream, application/json` | Generación por unidad | Alto |
| Bearer + JSON sin `Accept`, con `?stream=1` | Generación de planeación | Alto |
| Bearer y respuesta blob | Export opcional | Medio |
| Sin headers/auth | Fragmentos HTML | Bajo |
| SDK Supabase | Auth/Storage | Medio |

### Parsing y errores

| Familia | Éxito | Error | Observación |
| --- | --- | --- | --- |
| Anexos/exámenes/listas/jerarquía | `text()` → JSON o `null` | Conserva mensaje, `status` y `payload` | Robusto |
| Planeaciones robustas | Igual | Igual | Solo un subconjunto |
| Biblioteca | `json()` | Solo `payload.error` o HTTP | Pierde `message` y metadata |
| Delete normal planeación | `Response` crudo | Solo estado HTTP | Contrato especial |
| Planeaciones mixtas | JSON/blob/SSE | Frecuentemente genérico | Pierde detalle backend |
| Services | Normalización selectiva o crudo | Repropaga | Session ausente da `null` |
| Loaders HTML | `text()` | Estado HTTP | No conserva cuerpo |

Los errores finales se muestran como alerta, toast o estado local según feature;
algunas descargas solo registran consola. SSE malformado se ignora en los
parsers actuales. No se cambió ningún comportamiento.

### Duplicados y aliases

| Caso | Clasificación | Decisión |
| --- | --- | --- |
| Dos GET de planeación por tema y sus fallbacks | Duplicado real | Conservar hasta aislar legacy |
| API directa + service en examen/lista | Alias/wrapper de compatibilidad | Conservar |
| Generación normal frente a SSE | Contrato distinto | Fase 4 |
| Delete normal/directo/permanente | Contratos distintos | No combinar |
| Delete de bloque frente a batch permanente | Contratos distintos | No combinar |
| Lectura y DELETE con mismo path de recurso | Método distinto, no duplicado | Conservar |
| `/api/examenes/generar` | Alias backend no usado por frontend | Conservar backend |
| Tres loaders de HTML | Duplicación visual | Fase 7 |

El fallback `/api/planeaciones?tema_id=...` está implementado dos veces, pero el
controller backend auditado lista planeaciones activas sin filtrar ese query.
Se documenta como riesgo, no se corrige.

### Globals

Se protegen todos los `api*`, todos los wrappers públicos de services,
`protegerRuta`, `requireSession`, las globals del registro de Archivados,
`API_BASE_URL`, `supabase`, `currentUser` y `escapeHtml`. Las funciones
top-level sin asignación explícita también son globals porque los scripts son
clásicos. Firmas, orden y consumidores están detallados en
`FRONTEND_MAP.md`. Retiro posible: Fase 10, o Fases 8–9 para legacy únicamente
después de comprobar ausencia de consumidores.

### Clasificación por dominio

- Biblioteca: lecturas de conjuntos, generación coordinada, detalles por
  dominio, refresh por recarga y cinco deletes propios.
- Planeaciones: activos, detalle/edición, generación, normal/directo,
  Archivados, batches y export de compatibilidad.
- Anexos: generación/regeneración, detalle, dos lecturas sin consumidor y
  delete de Biblioteca.
- Listas: generación directa vigente, detalle activo, listado/generación
  legacy y delete de Biblioteca.
- Exámenes: generación/polling directos vigentes, detalle activo,
  listado/generación/polling legacy y delete de Biblioteca.
- Archivados: listado, restore y delete permanente individual/batch, más
  jerarquía técnica y registro local.
- Legacy: CRUD jerárquico, navegación por niveles, contratos por unidad,
  planeación por tema, delete normal y archive.
- Métricas: no existe consumo frontend.

### Relación API/services

| Dominio | Dirección ejecutable | Problema |
| --- | --- | --- |
| Biblioteca/anexos | Página o feature → API | Sin service; propiedad mezclada en deletes |
| Exámenes/listas | Service → API; Biblioteca también → API | Normalización y flujos legacy/vigentes |
| Jerarquía | Service → API | Técnica, Archivados y legacy mezclados |
| Planeaciones | Service → API | Service además mantiene estado local |
| Auth | SDK → service → consumidores | Redirect y sesión global |

Ningún API delega a service.

### Candidatos

| Candidato | Riesgo | Decisión |
| --- | --- | --- |
| Lecturas de Biblioteca | Bajo | Primera sesión de Fase 3 |
| Deletes de Biblioteca | Bajo/medio | Sesión posterior; preservar contratos distintos |
| Planeaciones/anexos/listas/exámenes | Medio/alto | Sesiones posteriores por dominio |
| Auth/headers y parsing común | Alto | Posterior; no helper universal inicial |
| Fetch de páginas | Medio | Fase 7 |
| Archivados | Alto | Fase 8 |
| Legacy | Alto | Legacy/Fases 8–9 |
| SSE y polling | Alto | Fase 4 |

## Sesión 3.1 seleccionada

**Sesión 3.1 — Consolidación de lecturas de Biblioteca.**

- Funciones: `apiBibliotecaConjuntos(accessToken)` y
  `apiBibliotecaConjuntoById(batchId, accessToken)`.
- Archivo propietario: `js/api/biblioteca.api.js`.
- Consumidores: carga de Biblioteca y metadata de Detalle.
- Wrappers/globals: ambas firmas quedan intactas.
- Contratos protegidos: GET, Bearer, array frente a objeto, `json()` en éxito,
  `payload.error` y fallback `HTTP <status>`.
- Exclusiones: deletes, generación, polling, SSE, autenticación general,
  backend, Archivados y legacy.
- Riesgo: bajo.
- Pruebas futuras: array/objeto de éxito, 401 JSON, error no JSON, JSON inválido
  de éxito, disponibilidad de globals, carga de Biblioteca y apertura de
  Detalle.

No existe otra Sesión 3.1 seleccionada.

## Exclusiones y riesgos

- No se centralizó ni movió ninguna llamada.
- No se modificaron sesión, headers, parsing, errores ni globals.
- Generación, polling y SSE quedan para Fase 4.
- Archivados y legacy permanecen separados.
- Riesgos prioritarios: orden de globals, parsing divergente, fallbacks por
  tema, deletes de distinto alcance, service de planeaciones mixto, export sin
  ruta backend y consumidores legacy indirectos.

## Estado documental

Fase 0: Completada. Fase 1: Completada. Fase 2: Completada. Fase 3: En
progreso. No se añadió decisión arquitectónica transversal: la selección de
3.1 aplica los criterios ya vigentes, por lo que `REFACTOR_DECISIONS.md` no
requiere una entrada nueva.

## Sesión 3.1 — Consolidación de lecturas de Biblioteca

### Estado de entrada

- Frontend: `refactor-front`, HEAD `ac23955`, working tree limpio.
- Commit 3.0: `ac23955 docs(refactor): audit frontend API contracts`.
- Backend: `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; Sesión 3.0 completada.

### Consumidores confirmados

| Función | Consumidor | Argumentos | Retorno esperado | Error del consumidor | Clasificación |
| --- | --- | --- | --- | --- | --- |
| `apiBibliotecaConjuntos(accessToken)` | `loadAndRenderBiblioteca` en `biblioteca.page.js` | `session.access_token` string | Array directo; el consumidor usa `Array.isArray` | Captura, registra y muestra estado de error | Biblioteca activa |
| `apiBibliotecaConjuntoById(batchId, accessToken)` | `obtenerBloqueDetalle` en `detalle.page.js` | UUID normalizado y token string | Objeto de conjunto directo | Captura, hace warning y devuelve `null` | Detalle/edición |

No existen consumidores desconocidos, de Archivados ni del explorador visual
legacy.

### Contrato previo y preservado

| Aspecto | Listado | Detalle |
| --- | --- | --- |
| Firma | `(accessToken)` | `(batchId, accessToken)` |
| URL | `${API_BASE_URL}/api/biblioteca/conjuntos` | `${API_BASE_URL}/api/biblioteca/conjuntos/${encodeURIComponent(batchId)}` |
| Método | GET implícito | GET implícito |
| Headers | Solo `Authorization: Bearer <token>` | Igual |
| Cache | `"no-store"` | `"no-store"` |
| Éxito | `response.json()`; array directo | `response.json()`; objeto directo |
| Error HTTP | `text()`; JSON tolerante; `payload.error` o `HTTP <status>` | Igual |
| JSON inválido 2xx | Rechazo nativo de `response.json()` | Igual |
| JSON inválido/error no JSON HTTP | Se ignora el fallo de `JSON.parse` y se lanza `Error("HTTP <status>")` | Igual |
| Metadata de Error | No adjunta `status` ni payload | Igual |

El backend confirma Bearer obligatorio, `planeacion_batches.id` UUID, filtros
por `user_id`, array directo para listado y objeto directo para detalle. El
detalle puede responder 400 por `batchId` vacío, 404 por conjunto
inexistente/no propio y 500 por error inesperado; auth responde 401. Los
controllers entregan `{error}` en errores conocidos y genéricos.

### Implementación

- Se creó `bibliotecaGet(path, accessToken)` como constante léxica privada de
  `js/api/biblioteca.api.js`; no se publica en `window`.
- El helper solo construye la URL con `API_BASE_URL`, ejecuta el GET implícito,
  añade Bearer y `cache: "no-store"`, preserva el parsing y devuelve el JSON.
- `apiBibliotecaConjuntos` delega el path fijo del listado.
- `apiBibliotecaConjuntoById` conserva `encodeURIComponent(batchId)` y delega
  el path del detalle.
- `window.apiBibliotecaConjuntos` y
  `window.apiBibliotecaConjuntoById` permanecen sin cambios.
- Los cinco deletes empiezan en el mismo punto lógico de `HEAD`, conservan su
  implementación literal y no llaman a `bibliotecaGet`.

### Validaciones ejecutadas

- Smoke previo: aprobado, 10 requests simulados y 18 aserciones.
- `node --check js/api/biblioteca.api.js`: aprobado.
- `npm test -- --runInBand`: aprobado, 1 suite y 2 pruebas.
- Smoke posterior: aprobado, 10 requests simulados y 20 aserciones de contrato
  y aislamiento.
- Búsqueda global: dos consumidores conocidos, dos globals públicas, un helper
  privado y cero duplicados del GET.
- Aislamiento: helper ausente de `window`; una sola llamada por invocación;
  orden de scripts sin cambios.

### Validación manual

Aprobada por el usuario antes de abrir 3.2. Evidencia registrada: carga inicial
de Biblioteca, cambio entre bloques, tabs, recarga, apertura de planeación,
metadata del bloque, título/unidad, navegación de vuelta, previews, descargas y
deletes en estado correcto; cero peticiones duplicadas inesperadas y cero
errores relacionados con el refactor.

### Exclusiones y hallazgos conservados

No se modificaron consumidores, deletes, autenticación, otros API files,
generación, polling, SSE, estado, render, HTML, backend, SQL, Archivados ni
legacy. Permanecen: pérdida de `payload.message` y status estructurado,
parsing incompatible entre dominios, duplicado por tema, deletes no
equivalentes, export Excel sin ruta backend, SSE/polling propios,
`planeaciones.service.js` mixto y dependencia del orden de scripts.

### Próxima sesión

**Sesión 3.2 — Consolidación interna de deletes de Biblioteca.**

Implementada en código después de comparar los cinco contratos. Sus resultados
se registran a continuación. Fase 3 continúa en progreso.

## Sesión 3.2 — Consolidación interna de deletes de Biblioteca

### Estado de entrada

- Frontend: `refactor-front`, HEAD `a6a2941`, working tree limpio.
- Commit 3.1: `a6a2941 refactor(frontend): consolidate Biblioteca read requests`.
- Backend: `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0 y 3.1 completadas.
- Validación manual 3.1 aprobada con la evidencia proporcionada por el usuario.

### Consumidores confirmados

| Función | Consumidor | ID | Retorno usado | Error usado | Clasificación |
| --- | --- | --- | --- | --- | --- |
| `apiBibliotecaDeleteBloque(batchId, accessToken)` | `BibliotecaBlockDelete.deleteFromBiblioteca` | UUID de `planeacion_batches.id` | Espera resolución; no inspecciona `{ok, deleted}` | El feature captura, registra y muestra alerta | Biblioteca activa |
| `apiDeletePlaneacionDirecta(id, accessToken)` | `PlaneacionDelete.deleteFromBiblioteca` | `planeaciones.id` bigint recibido como string DOM | Espera resolución; no inspecciona `{ok:true}` | El feature captura, registra y muestra alerta | Biblioteca activa |
| `apiDeleteExamen(id, accessToken)` | `ExamDelete.deleteFromBiblioteca` | UUID de `examenes.id` | Espera resolución; no inspecciona `{ok:true}` | El feature captura, registra y muestra alerta | Biblioteca activa |
| `apiDeleteListaCotejo(id, accessToken)` | `ListaCotejoDelete.deleteFromBiblioteca` | UUID de `listas_cotejo.id` | Espera resolución; no inspecciona `{ok:true}` | El feature captura, registra y muestra alerta | Biblioteca activa |
| `apiDeleteAnexo(id, accessToken)` | `AnexoDelete.deleteFromBiblioteca` | UUID de `anexos.id` | Espera resolución; no inspecciona `{ok:true}` | El feature captura, registra y muestra alerta | Biblioteca activa |

Cada feature normaliza el ID, obtiene `session.access_token` mediante
`requireSession` y llama una sola global. No existen consumidores desconocidos.
Los wrappers `bibEliminar*` de `biblioteca.page.js` delegan en los features y no
llaman directamente a estas API.

### Contratos previos y preservados

| Función | URL | ID/encode | Método y headers | Body/cache | Éxito backend |
| --- | --- | --- | --- | --- | --- |
| `apiBibliotecaDeleteBloque` | `/api/biblioteca/bloques/:batchId` | UUID; `encodeURIComponent(batchId)` | DELETE; solo `Authorization: Bearer <token>` | Ausentes | `{ok:true, deleted:{batch:boolean}}` |
| `apiDeletePlaneacionDirecta` | `/api/planeaciones/:id/directo` | bigint representado como string; `encodeURIComponent(id)` | Igual | Ausentes | `{ok:true}` |
| `apiDeleteExamen` | `/api/examenes/:id` | UUID; `encodeURIComponent(id)` | Igual | Ausentes | `{ok:true}` |
| `apiDeleteListaCotejo` | `/api/listas-cotejo/:id` | UUID; `encodeURIComponent(id)` | Igual | Ausentes | `{ok:true}` |
| `apiDeleteAnexo` | `/api/anexos/:id` | UUID; `encodeURIComponent(id)` | Igual | Ausentes | `{ok:true}` |

En éxito todos ejecutan `response.json()` y devuelven el payload completo sin
transformación. Un JSON vacío o inválido en HTTP 2xx conserva el rechazo nativo.
En error HTTP leen `response.text()` —con fallback a string vacío si esa lectura
rechaza—, intentan `JSON.parse`, priorizan solo `payload.error` y lanzan
`Error("HTTP <status>")` cuando no existe o el cuerpo no es JSON. No conservan
`status`, `payload.message` ni el payload estructurado.

El backend mantiene Bearer obligatorio y filtro por `user_id`. Los servicios
normalizan los IDs como string; el schema confirma UUID para batch, examen,
lista y anexo, y bigint para planeación. Los controllers responden JSON. Los
errores conocidos incluyen 400 por ID ausente, 401 por auth y 404 por recurso
inexistente/no propio; fallos inesperados producen 500.

El delete directo de planeación elimina anexos y listas antes de la planeación y
retorna `{ok:true}`. Los deletes de examen, lista y anexo retornan `{ok:true}`.
El delete de bloque elimina secuencialmente cuatro dominios y después intenta
el batch; si solo falla ese último paso conserva HTTP 200 y
`{ok:true, deleted:{batch:false}}`.

### Implementación

- Se creó `bibliotecaDelete(path, accessToken)` como constante léxica privada
  de `js/api/biblioteca.api.js`; no se publica en `window`.
- El helper se limita a URL base + path, DELETE, Bearer, parsing, validación
  HTTP y retorno JSON. No obtiene sesión, no admite GET/POST/PUT/PATCH y no es
  un cliente universal.
- Los cinco wrappers públicos conservan la construcción y codificación de su
  propio path y delegan una única vez al helper.
- Las cinco asignaciones `window.*`, nombres, firmas y orden de argumentos
  permanecen.
- `bibliotecaGet` no cambió y ninguno de los deletes lo usa.

### Validaciones ejecutadas

- Smoke previo: aprobado; 32 peticiones simuladas para las cinco globals.
- `node --check js/api/biblioteca.api.js`: aprobado.
- `npm test -- --runInBand`: aprobado; 1 suite y 2 pruebas.
- Smoke posterior: aprobado; 32 peticiones simuladas, una por invocación.
- Cobertura del smoke: URLs codificadas, DELETE, Bearer, ausencia de body/cache,
  identidad de retornos, error JSON con/sin `error`, cuerpo no JSON, JSON
  inválido HTTP/error y 2xx, globals y helper privado.
- Casos de bloque `{batch:true}` y `{batch:false}`: devueltos por identidad y
  sin transformación.
- Búsqueda global: cinco consumidores conocidos, cinco globals públicas, un
  helper DELETE privado y cero consumidores desconocidos.
- Aislamiento: consumidores, otros API files, HTML, backend y orden de scripts
  sin cambios.

### Validación manual

Aprobada por el usuario antes de abrir 3.3. Las cancelaciones de examen, lista,
anexo, planeación y bloque no ejecutaron DELETE. Los cinco deletes reales
eliminaron el recurso esperado; la base de datos fue revisada y confirmó cada
eliminación. Se observaron los eventos backend de éxito de exámenes, listas,
anexos, planeación directa y bloque, incluido `deletedBatch: true`, sin errores
relacionados con el refactor.

### Exclusiones y hallazgos conservados

No se modificaron helper GET, consumidores, autenticación, otros API files,
generación, regeneración, polling, SSE, jobs, callbacks, estado, render, HTML,
backend, SQL, Archivados ni legacy. Permanecen: pérdida de `payload.message` y
status estructurado, parsing incompatible entre dominios, duplicado de
planeación por tema, deletes normal/directo/permanente no equivalentes, export
Excel sin ruta backend, SSE/polling propios, `planeaciones.service.js` mixto,
dependencia del orden de scripts y posibilidad de `deleted.batch:false`.

### Próxima sesión

**Sesión 3.3 — Auditoría puntual de APIs de anexos.**

Completada como auditoría documental. Sus resultados se registran a
continuación. Fase 3 continúa en progreso.

## Sesión 3.3 — Auditoría puntual de APIs de anexos

### Estado de entrada

- Frontend: `refactor-front`, HEAD `6a96d79`, working tree limpio.
- Commit 3.2: `6a96d79 refactor(frontend): consolidate Biblioteca delete requests`.
- Backend: `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0–3.2 completadas.
- Validaciones manuales 3.1 y 3.2 aprobadas.
- `js/services/anexos.service.js` no existe.

### Inventario de funciones y consumidores

| Función | Propietario | Contrato | Consumidores confirmados | Clasificación |
| --- | --- | --- | --- | --- |
| `apiGenerarAnexo(planeacionId, accessToken)` | `js/api/anexos.api.js` | POST `/api/anexos/generate` | `submitBibliotecaAnexoCreateModal` activo; `bibGenerarAnexo` compatible sin emisor propio | Generación activa |
| `apiObtenerAnexosPorBatch(batchId, accessToken)` | `js/api/anexos.api.js` | GET `/api/anexos/batch/:batchId` | Ninguno, incluidas búsquedas de aliases y wrappers | Sin consumidor confirmado |
| `apiObtenerAnexoPorPlaneacion(planeacionId, accessToken)` | `js/api/anexos.api.js` | GET `/api/anexos/planeacion/:planeacionId` | Ninguno, incluidas búsquedas de aliases y wrappers | Sin consumidor confirmado |
| `apiObtenerAnexoDetalle(anexoId, accessToken)` | `js/api/anexos.api.js` | GET `/api/anexos/:anexoId` | `AnexoPreview.open` y `AnexoDownload.downloadBiblioteca` | Preview/descarga activa |
| `apiRegenerarAnexo(anexoId, accessToken)` | `js/api/anexos.api.js` | POST `/api/anexos/:anexoId/regenerate` | `bibRegenerarAnexo`; rama `data-bib-action` sin emisor DOM | Regeneración de compatibilidad |
| `apiDeleteAnexo(id, accessToken)` | `js/api/biblioteca.api.js` | DELETE `/api/anexos/:id` | `AnexoDelete.deleteFromBiblioteca` | Biblioteca activa |

No existen consumidores de estas API en Detalle, Archivados ni el explorador
visual legacy. `dashboard.page.js` no contiene llamadas de anexos; el dashboard
solo aporta el shell que carga los scripts antes de `biblioteca.page.js`.

| API | Archivo y función consumidora | Argumentos | Retorno usado | Error del consumidor |
| --- | --- | --- | --- | --- |
| `apiGenerarAnexo` | `biblioteca.page.js` — `submitBibliotecaAnexoCreateModal` | ID bigint normalizado + token | `anexo_id`; crea card optimista | Error por item en `anexosGenerating` |
| `apiGenerarAnexo` | `biblioteca.page.js` — `bibGenerarAnexo` | ID bigint normalizado + token | `anexo_id` opcional | Error inline en card; rama compatible |
| `apiObtenerAnexosPorBatch` | — | — | — | Sin consumidor confirmado |
| `apiObtenerAnexoPorPlaneacion` | — | — | — | Sin consumidor confirmado |
| `apiObtenerAnexoDetalle` | `anexo-preview.js` — `AnexoPreview.open` | UUID de anexo + token | `res?.anexo` | Log y mensaje dentro del modal |
| `apiObtenerAnexoDetalle` | `anexo-download.js` — `AnexoDownload.downloadBiblioteca` | UUID de anexo + token | `res?.anexo` | Log y alerta |
| `apiRegenerarAnexo` | `biblioteca.page.js` — `bibRegenerarAnexo` | UUID normalizado + token | Ignorado | Error inline en pending; sin emisor DOM |
| `apiDeleteAnexo` | `anexo-delete.js` — `AnexoDelete.deleteFromBiblioteca` | UUID normalizado + token | Ignorado | Log y alerta; Biblioteca activa |

### Contratos HTTP frontend

| Función | ID y encoding | Headers/body/cache | Éxito | Error observable |
| --- | --- | --- | --- | --- |
| `apiGenerarAnexo` | `planeacionId`, bigint como string/número; no va en URL | JSON + Bearer; body `{planeacion_id}`; sin cache | Payload sin transformar: `{ok, anexo_id, status, anexo?}` | `error` → `message` → `"No se pudo generar el anexo"`; adjunta `status` y `payload` |
| `apiObtenerAnexosPorBatch` | UUID; `encodeURIComponent` | Solo Bearer; sin body; `cache:"no-store"` | `{anexos}`; array dentro del contenedor | `error` → `message` → fallback propio; adjunta metadata |
| `apiObtenerAnexoPorPlaneacion` | bigint como string/número; `encodeURIComponent` | Igual | `{anexo}`; objeto dentro del contenedor | Igual, con fallback propio |
| `apiObtenerAnexoDetalle` | UUID; `encodeURIComponent` | Igual | `{anexo}`; objeto completo dentro del contenedor | Igual, con fallback propio |
| `apiRegenerarAnexo` | UUID; `encodeURIComponent` | JSON + Bearer; sin body ni cache | `{ok:true, anexo}` sin transformar | `error` → `message` → `"No se pudo regenerar el anexo"`; adjunta metadata |
| `apiDeleteAnexo` | UUID; `encodeURIComponent` | Solo Bearer; sin body ni cache | `response.json()`; `{ok:true}` | Solo `payload.error` o `HTTP <status>`; sin metadata |

Las cinco funciones de `anexos.api.js` pasan por `requestAnexosJson`. Este
helper lee primero `response.text()`: cuerpo vacío o JSON inválido produce
`null`. En HTTP exitoso ese `null` se devuelve; en HTTP de error se usa el
fallback específico. En cambio, `apiDeleteAnexo` conserva el parsing de
Biblioteca: JSON inválido o vacío en 2xx rechaza mediante `response.json()`.

### Contratos backend y relaciones

Todas las rutas usan `requireAuth`, Bearer, `createUserClient(req.accessToken)`
y `req.user.id`. Las consultas principales filtran por `user_id`; las
operaciones posteriores siguen sujetas al cliente de usuario/RLS.

| Operación | Status de éxito | Errores confirmados | Relación |
| --- | --- | --- | --- |
| Generar | 201 `generated`; 200 `already_exists` | 400 ID ausente, 401 auth, 404 planeación, 502 salida IA inválida, 504 timeout, 500 inesperado | Carga planeación propia y copia `planeacion_id`, `batch_id`, `tema_id` y contexto |
| Regenerar | 200 `{ok:true, anexo}` | 400, 401, 404 anexo/planeación, 502, 504, 500 | Actualiza la misma fila; no crea otra |
| Listar por batch | 200 `{anexos:[]}` | 400, 401, 500 | Filtra `batch_id` y `user_id`; orden ascendente |
| Obtener por planeación | 200 `{anexo}` | 400, 401, 404, 500 | Filtra `planeacion_id` y `user_id` |
| Obtener detalle | 200 `{anexo}` | 400, 401, 404, 500 | Filtra UUID de anexo y `user_id` |
| Eliminar | 200 `{ok:true}` | 400, 401, 404, 500 | Verifica y elimina por UUID + `user_id` |

`anexos.id` y `batch_id` son UUID; `planeacion_id` es bigint. Existe FK
`anexos.planeacion_id → planeaciones.id ON DELETE CASCADE` e índice único
`unique_anexo_por_planeacion`, por lo que hay como máximo un anexo por
planeación. `batch_id` está indexado y se copia desde la planeación, pero el
schema documentado no declara una FK desde anexos al batch.

### Helpers internos

| Helper | Responsabilidad | Consumidores | Global | Duplicación |
| --- | --- | --- | --- | --- |
| `buildAnexosHeaders` | `Content-Type: application/json` + Bearer | Generar y regenerar | Implícita por script clásico; sin asignación `window` | No; es específico de POST JSON |
| `parseAnexosApiJson` | Texto → JSON; vacío/inválido → `null` | `requestAnexosJson` | Implícita | No |
| `createAnexosApiError` | `Error` con `status` y `payload` | `requestAnexosJson` | Implícita | No |
| `requestAnexosJson` | Fetch, parsing, validación HTTP y mensaje | Las cinco API de `anexos.api.js` | Implícita | Ya concentra la mecánica común |

`buildAnexosHeaders` no debe reutilizarse para GET: añadiría
`Content-Type: application/json`, ausente en las tres lecturas actuales.

### Comparación de lecturas

| Aspecto | Por batch | Por planeación | Detalle |
| --- | --- | --- | --- |
| Consumidor | Ninguno | Ninguno | Preview y descarga |
| Endpoint | `/batch/:batchId` | `/planeacion/:planeacionId` | `/:anexoId` |
| ID | UUID | bigint | UUID |
| Retorno | `{anexos}` | `{anexo}` | `{anexo}` |
| Error | Metadata + fallback de batch | Metadata + fallback de planeación | Metadata + fallback de detalle |
| Encoding | Sí | Sí | Sí |
| GET/Bearer/cache/parsing | Equivalente | Equivalente | Equivalente |
| Consolidación viable | Sí, conservando global y contenedor | Sí, conservando global y contenedor | Sí, conservando dos consumidores |

La duplicación reducible es solo la construcción de las opciones GET y la
delegación a `requestAnexosJson`. Los paths, fallbacks y contenedores permanecen
propiedad de cada wrapper.

### Generación, regeneración y estado

La generación activa parte del modal de Biblioteca, selecciona planeaciones,
crea entradas en `anexosGenerating`, ejecuta POST secuenciales y usa
`anexo_id`. Muestra feedback por card, registra éxitos/errores y recarga el
bloque. El wrapper individual `bibGenerarAnexo` permanece como compatibilidad
de una rama sin emisor propio.

Regeneración usa el mismo estado pending y recarga, pero su rama
`data-bib-action="regenerar-anexo"` no tiene emisor DOM vigente. El retorno se
ignora. Ambos contratos ejecutan IA síncrona, métricas y prompt version
`v1_anexos_desde_planeacion`; no usan polling ni SSE. La versión, tokens y
métricas no forman parte del retorno nuevo utilizado por Biblioteca. Ambos
pertenecen a Fase 4 y quedan fuera de 3.4.

### Preview, descarga y delete

Flujo de card:

```text
card → wrapper de compatibilidad → AnexoPreview o AnexoDownload
     → apiObtenerAnexoDetalle → {anexo} → render o Word
```

Preview y descarga directa comparten la misma lectura. Cada acción de card
realiza una sola petición con `cache:"no-store"`; no existe cache de objeto ni
fallback de endpoint. Descargar desde el preview usa el objeto ya cargado y no
repite la petición. Preview consume `id`, metadata y `contenido`; download
consume título, materia, tema y la estructura completa de contenido. Preview
muestra error dentro del modal; descarga registra y muestra alerta.

`apiDeleteAnexo` permanece en `biblioteca.api.js`, ya delega en
`bibliotecaDelete` desde 3.2 y fue validado manualmente. No se mueve ni duplica
en esta auditoría. Una reorganización por propietario de dominio solo puede
evaluarse después de migrar consumidores y globals, como retiro de
compatibilidad en Fase 10.

### Globals protegidas

| Global | Firma/superficie | Propietario | Estado | Fase futura |
| --- | --- | --- | --- | --- |
| `window.apiGenerarAnexo` | `(planeacionId, accessToken)` | API anexos | Generación activa | 4 |
| `window.apiObtenerAnexosPorBatch` | `(batchId, accessToken)` | API anexos | Sin consumidor confirmado; protegida | 3.4 conserva |
| `window.apiObtenerAnexoPorPlaneacion` | `(planeacionId, accessToken)` | API anexos | Sin consumidor confirmado; protegida | 3.4 conserva |
| `window.apiObtenerAnexoDetalle` | `(anexoId, accessToken)` | API anexos | Preview/descarga activa | 3.4 conserva |
| `window.apiRegenerarAnexo` | `(anexoId, accessToken)` | API anexos | Compatibilidad | 4 |
| `window.apiDeleteAnexo` | `(id, accessToken)` | API Biblioteca | Activa y consolidada | 10, si cambia propietario |
| `window.AnexoPreview` | `open`, `render`, `close` | Feature preview | Activa | Conservar |
| `window.AnexoDownload` | `download`, `downloadBiblioteca` | Feature download | Activa | Conservar |
| `window.AnexoDelete` | `deleteFromBiblioteca` | Feature delete | Activa | Conservar |
| `bibGenerarAnexo`, `bibRegenerarAnexo` | Firmas actuales | Página Biblioteca | Generación/compatibilidad | 4/10 |
| `bibDescargarAnexo`, `descargarAnexoWord` | Firmas actuales | Página Biblioteca | Wrappers compatibles | 10 |
| `openBibliotecaAnexoPreview`, `closeBibliotecaAnexoModal`, `renderBibliotecaAnexoModal` | Firmas actuales | Página Biblioteca | Wrappers compatibles | 10 |
| `open/close/render/submitBibliotecaAnexoCreateModal`, `renderAnexosTab` | Firmas actuales | Página Biblioteca | UI activa global implícita | 4/6 |
| `bibEliminarAnexo` | `(anexoId, conjuntoId)` | Página Biblioteca | Wrapper compatible | 10 |

### Duplicación y candidatos

| Candidato | Evidencia | Riesgo | Decisión |
| --- | --- | --- | --- |
| Helper GET privado para tres lecturas | Opciones GET idénticas; paths/fallbacks parametrizables | Bajo | Sesión 3.4 |
| Rehacer helpers internos existentes | Parsing, error y request ya están compartidos | Bajo pero sin beneficio | No realizar |
| Eliminar lecturas sin consumidor | Dos globals sin consumidor confirmado | Medio por contrato clásico | Fase 10; no eliminar ahora |
| Mover `apiDeleteAnexo` | Activo, consolidado y validado en Biblioteca | Medio | Fase 10 |
| Unir generación y regeneración | IA, métricas, pending y retornos distintos | Alto | Fase 4 |

No son duplicación: los contenedores distintos de las lecturas, los dos
consumidores de detalle, los wrappers de compatibilidad ni GET/DELETE sobre el
mismo path.

### Exclusiones y hallazgos conservados

No se modificaron JavaScript, HTML, CSS, autenticación, generación,
regeneración, pending, preview, descarga, delete, backend, SQL, Archivados ni
legacy. No existen pruebas automatizadas específicas para estas seis APIs.
`README.md` conserva una afirmación desactualizada de que `js/features/` no
existe; el código y `ARCHITECTURE.md` confirman que sí existe. `README.md` no
está permitido en 3.3 y esta discrepancia no cambia los contratos auditados.

También permanecen el parsing tolerante que convierte JSON inválido exitoso en
`null`, dos globals de lectura sin consumidor, helpers internos globales
implícitos por script clásico, generación síncrona secuencial y dependencia del
orden de scripts.

### Próxima sesión

**Sesión 3.4 — Consolidación interna de lecturas de anexos.**

Incluirá exclusivamente `apiObtenerAnexosPorBatch`,
`apiObtenerAnexoPorPlaneacion` y `apiObtenerAnexoDetalle` dentro de
`js/api/anexos.api.js`. Podrá crear un helper privado GET específico que reciba
path y fallback y delegue en `requestAnexosJson`. Debe preservar headers sin
`Content-Type`, Bearer, `cache:"no-store"`, encoding, retorno `null` ante cuerpo
vacío/JSON inválido exitoso, prioridad `error/message/fallback`, metadata
`status/payload`, globals y consumidores.

Riesgo bajo. Excluye generación, regeneración, delete, autenticación, features,
páginas, services, backend, Archivados y legacy. Las validaciones futuras deben
cubrir las tres URLs, una petición por llamada, contenedores sin transformar,
errores JSON/texto/vacío/inválido, metadata, globals, helper privado y regresión
manual de preview/descarga. La implementación se completó en 3.4 y se registra
a continuación.

## Sesión 3.4 — Consolidación interna de lecturas de anexos

### Estado de entrada

- Frontend: `refactor-front`, HEAD `3cbf8b1`, working tree limpio.
- Commit 3.3: `3cbf8b1 docs(refactor): audit annex API contracts`.
- Backend: `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0–3.3 completadas.
- Validaciones manuales 3.1 y 3.2 aprobadas.

### Consumidores y contratos preservados

| Función | Consumidor | Argumentos | Retorno esperado | Clasificación |
| --- | --- | --- | --- | --- |
| `apiObtenerAnexosPorBatch(batchId, accessToken)` | Sin consumidor confirmado | UUID y token | Contenedor `{anexos}` | Compatibilidad sin consumidor |
| `apiObtenerAnexoPorPlaneacion(planeacionId, accessToken)` | Sin consumidor confirmado | bigint y token | Contenedor `{anexo}` | Compatibilidad sin consumidor |
| `apiObtenerAnexoDetalle(anexoId, accessToken)` | `AnexoPreview.open` | UUID y token | `res?.anexo` | Preview activa |
| `apiObtenerAnexoDetalle(anexoId, accessToken)` | `AnexoDownload.downloadBiblioteca` | UUID y token | `res?.anexo` | Descarga activa |

| Aspecto | Por batch | Por planeación | Detalle |
| --- | --- | --- | --- |
| Path | `/api/anexos/batch/:batchId` | `/api/anexos/planeacion/:planeacionId` | `/api/anexos/:anexoId` |
| Encoding | `encodeURIComponent(batchId)` | `encodeURIComponent(planeacionId)` | `encodeURIComponent(anexoId)` |
| Método | GET implícito | GET implícito | GET implícito |
| Headers | Solo Bearer | Solo Bearer | Solo Bearer |
| Cache/body | `no-store` / sin body | `no-store` / sin body | `no-store` / sin body |
| Retorno | `{anexos}` sin transformar | `{anexo}` sin transformar | `{anexo}` sin transformar |
| Fallback | Anexos del bloque | Anexo de la planeación | Anexo |

### Implementación

Se creó `const anexosGet = function (path, accessToken, fallbackMessage)` dentro
de `js/api/anexos.api.js`. Es un binding léxico privado del script clásico: no
aparece en `window`, solo maneja las opciones compartidas de las tres lecturas
y retorna directamente la promesa de `requestAnexosJson`.

Las funciones públicas siguen siendo `async`, construyen su path y encoding, y
aportan su fallback específico. El helper comparte únicamente:

- prefijo `API_BASE_URL`;
- GET implícito, sin propiedad `method` nueva;
- `Authorization: Bearer <token>`;
- ausencia de `Content-Type` y body;
- `cache: "no-store"`;
- delegación al ejecutor canónico `requestAnexosJson`.

Los cuatro helpers anteriores, `apiGenerarAnexo` y `apiRegenerarAnexo` fueron
comparados contra `HEAD` y quedaron literalmente intactos. `apiDeleteAnexo`
permanece en `biblioteca.api.js` y tampoco cambió.

### Parsing y errores

`requestAnexosJson` sigue leyendo `response.text()`. JSON válido retorna el
payload; cuerpo vacío o JSON inválido retorna `null` incluso en éxito. Ante
HTTP de error conserva la prioridad `payload.error` → `payload.message` →
fallback específico y crea un `Error` con `status` y `payload`. Un cuerpo HTTP
no JSON usa el fallback, conserva el status y adjunta `payload:null`.

### Validaciones

- Smoke previo: aprobado, 21 peticiones simuladas y 113 aserciones.
- Smoke posterior: aprobado, 21 peticiones simuladas y 114 aserciones.
- Se validaron tres URLs, encoding, GET implícito, Bearer, ausencia de
  `Content-Type`/body, `no-store`, una petición por llamada, contenedores,
  fallbacks, errores JSON/no JSON, metadata, vacío, JSON inválido, globals y
  helper ausente de `window`.
- Comparación de funciones protegidas contra `HEAD`: seis sin cambios.
- `node --check js/api/anexos.api.js`: aprobado.
- `npm test -- --runInBand`: aprobado, 1 suite y 2 pruebas.
- `git diff --check`: se ejecuta en el cierre de sesión.

### Validación manual

Aprobada por el usuario. Se confirmaron preview, metadata y contenido, cierre y
reapertura, descarga desde card, modal de nombre, apertura correcta del archivo,
descarga desde preview, reutilización del objeto y cero GET duplicados o errores
relacionados con `anexosGet`. Las lecturas sin consumidor por batch y por
planeación permanecen cubiertas por smoke.

### Exclusiones y hallazgos conservados

No se modificaron generación, regeneración, pending, delete, preview, descarga,
consumidores, autenticación, otros API files, HTML, estado, render, backend,
SQL, Archivados ni legacy. Permanecen dos lecturas sin consumidor, JSON
inválido exitoso convertido en `null`, helpers top-level anteriores como
globals implícitas, generación secuencial, regeneración sin emisor DOM vigente,
`batch_id` sin FK documentada, README desactualizado y orden de scripts
contractual.

### Próxima sesión

**Sesión 3.5 — Auditoría puntual de APIs de listas de cotejo.**

Fue completada como auditoría documental. Sus resultados se registran a
continuación.

## Sesión 3.5 — Auditoría puntual de APIs de listas de cotejo

### Estado de entrada y evidencia previa

- Frontend: `refactor-front`, HEAD `18e96ba`, working tree limpio.
- Commit 3.4: `18e96ba refactor(frontend): consolidate annex read requests`.
- Backend: `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0–3.4 completadas.
- Validaciones manuales 3.1, 3.2 y 3.4 aprobadas.
- La evidencia 3.4 confirmó preview, metadata, reapertura, ambas descargas,
  reutilización del objeto y cero GET duplicados o errores de `anexosGet`.

### Inventario de funciones

| Función | Archivo | Método/endpoint | Argumentos | Retorno | Error | Consumidores | Clasificación |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `apiListasCoTejoGenerate` | `js/api/listas_cotejo.api.js` | POST `/api/listas-cotejo/generate` | payload, token | Payload backend | Error con `status/payload` | Biblioteca directa y service | Generación activa de Biblioteca |
| `apiListasCoTejoByUnidad` | Mismo | GET `/api/listas-cotejo/unidad/:unidadId` | UUID, token | `{listas}` | Error con `status/payload` | Service legacy | Listado legacy |
| `apiListaCoTejoById` | Mismo | GET `/api/listas-cotejo/:id` | UUID, token | `{lista}` | Error con `status/payload` | Service de detalle | Preview/descarga activa |
| `apiDeleteListaCotejo` | `js/api/biblioteca.api.js` | DELETE `/api/listas-cotejo/:id` | UUID, token | `{ok:true}` | `payload.error` o `HTTP <status>` | `ListaCotejoDelete` | Biblioteca activa |
| `generarListasCotejoUnidad` | `js/services/listas_cotejo.service.js` | Delega POST generate | payload | Payload API o `null` | Propaga API | Dashboard legacy | Generación legacy |
| `obtenerListasCotejoPorUnidad` | Mismo | Delega GET por unidad | UUID | Array, `[]` o `null` | Propaga API | `ensureListasCotejo` | Listado legacy |
| `obtenerListaCoTejoDetalle` | Mismo | Delega GET por ID | UUID | Entidad, payload compatible o `null` | Propaga API | Preview y descarga | Service de compatibilidad |

No existen funciones desconocidas. El backend expone además
`GET /api/listas-cotejo/planeacion/:planeacionId`, con bigint, Bearer,
`user_id` y `{lista}`; no existe wrapper o consumidor frontend confirmado.

### Consumidores confirmados

| Función | Consumidor | Argumentos | Uso del retorno | Error | Flujo |
| --- | --- | --- | --- | --- | --- |
| `apiListasCoTejoGenerate` | `submitBibliotecaListaModal` | `{planeacion_ids}`, token | `created` y `skipped`; luego recarga | Pending inline y log | Biblioteca activa |
| `generarListasCotejoUnidad` | `submitListaCotejoGenerate` | `{planeacion_ids, unidad_id}` | `created/created_or_updated`, `skipped` | Estado y mensaje del explorador | Legacy |
| `apiListasCoTejoByUnidad` | `obtenerListasCotejoPorUnidad` | UUID, token | Payload para normalización | Propaga | Service |
| `obtenerListasCotejoPorUnidad` | `ensureListasCotejo` | UUID | Array en `listasCotejoByUnidad` | Array vacío y error visual | Legacy |
| `apiListaCoTejoById` | `obtenerListaCoTejoDetalle` | UUID, token | Payload para extraer `lista` | Propaga | Service |
| `obtenerListaCoTejoDetalle` | `ListaCotejoPreview.openBiblioteca` | UUID | Entidad para modal | Log y error visual | Biblioteca activa |
| `obtenerListaCoTejoDetalle` | `ListaCotejoDownload.downloadBiblioteca` | UUID | Entidad para Word | Solo log | Biblioteca activa |
| `apiDeleteListaCotejo` | `ListaCotejoDelete.deleteFromBiblioteca` | UUID, token | Resolución; ignora `{ok:true}` | Log y alerta | Biblioteca activa |

`bibGenerarLista` no existe. La generación vigente se coordina mediante
`submitBibliotecaListaModal`. No hay consumidores de Archivados ni consumidores
desconocidos.

### Contratos HTTP

| Función | Headers/body/cache | Parsing éxito | Error y fallback | Status backend | Vacío/JSON inválido |
| --- | --- | --- | --- | --- | --- |
| `apiListasCoTejoGenerate` | JSON + Bearer; body serializado; sin cache | `response.text()` → JSON | `error` → `message` → fallback; `status/payload` | 201; 400/401/404/500 | Éxito retorna `null` |
| `apiListasCoTejoByUnidad` | Solo Bearer; sin body; `no-store` | Igual | Fallback “obtener las listas”; metadata | 200; 400/401/500; vacío válido es `{listas:[]}` | Éxito retorna `null` |
| `apiListaCoTejoById` | Solo Bearer; sin body; `no-store` | Igual | Fallback “obtener la lista”; metadata | 200; 400/401/404/500 | Éxito retorna `null` |
| `apiDeleteListaCotejo` | Solo Bearer; DELETE; sin body/cache | `response.json()` | Solo `payload.error`, luego `HTTP <status>`; sin metadata | 200; 400/401/404/500 | Rechaza al parsear éxito inválido/vacío |

Los IDs de lista y unidad son UUID; `planeacion_ids` contiene bigint recibido
como strings/números; `batch_id`, `tema_id` y `unidad_id` persistidos son UUID.
Todas las rutas usan `requireAuth`. Los services filtran por `user_id`.
`listas_cotejo.planeacion_id` es único y FK con cascade; `batch_id` y
`unidad_id` son FK con `set null`.

Los fallos 502/504 de generación IA se producen dentro del procesamiento por
planeación y normalmente se convierten en entradas `skipped`; no deben
reinterpretarse desde el frontend.

### Helpers internos

| Helper | Responsabilidad | Consumidores | Global implícito | Duplicación |
| --- | --- | --- | --- | --- |
| `buildListaCoTejoHeaders` | JSON, Bearer | Generación | Sí | No; POST únicamente |
| `parseListaCoTejoApiJson` | Texto a JSON; vacío/inválido a `null` | Request común | Sí | No |
| `createListaCoTejoApiError` | `Error` con `status/payload` | Request común | Sí | No |
| `requestListaCoTejoJson` | Fetch, parsing y validación HTTP | Tres APIs | Sí | Ya es ejecutor canónico |

El service añade `withListaCoTejoSession(callback)`: obtiene sesión mediante
`window.requireSession`, devuelve `null` sin sesión y pasa el token al callback.
No transforma errores.

### Relación API/service

| Función API | Wrapper service | API directa | Service | Diferencia contractual |
| --- | --- | --- | --- | --- |
| `apiListasCoTejoGenerate` | `generarListasCotejoUnidad` | Biblioteca | Dashboard legacy | Service obtiene sesión; retorno intacto; payload depende del caller |
| `apiListasCoTejoByUnidad` | `obtenerListasCotejoPorUnidad` | Ninguno | Explorador legacy | Service normaliza array o `{listas}` a array/`[]` |
| `apiListaCoTejoById` | `obtenerListaCoTejoDetalle` | Ninguno | Preview/descarga activos | Service extrae `response.lista` o conserva payload |
| `apiDeleteListaCotejo` | Ninguno | Feature delete | Ninguno | Propiedad de Biblioteca desde 3.2 |

Ambos niveles deben conservarse: Biblioteca genera mediante API directa,
features consumen el service de detalle y el explorador legacy conserva los
wrappers por unidad.

### Comparación de lecturas

| Aspecto | Por unidad | Detalle |
| --- | --- | --- |
| Consumidor | Explorador legacy | Preview/descarga de Biblioteca |
| Endpoint | `/unidad/:unidadId` | `/:id` |
| Retorno API | `{listas}` | `{lista}` |
| Retorno service | Array/`[]`/`null` | Entidad/payload/`null` |
| Error | Misma familia, fallback propio | Misma familia, fallback propio |
| Encoding | `encodeURIComponent(unidadId)` | `encodeURIComponent(id)` |
| HTTP | GET, Bearer, `no-store`, sin body/Content-Type | Igual |
| Fase | 8 para consumidor legacy; API conservada | 3 para mecánica HTTP; 10 para wrapper |
| Viable consolidar | Sí, conservando wrapper | Sí, conservando wrapper |

### Generación

Biblioteca llama directamente `apiListasCoTejoGenerate` con
`{planeacion_ids}` y mantiene `pendingListaByBatchId`, feedback, espera local de
1.5 segundos y recarga. El Dashboard legacy llama el service con
`{planeacion_ids, unidad_id}` y mantiene `listaCotejoGeneration`.

Al existir `planeacion_ids`, ambos callers ejecutan la rama backend
`generarListasCotejoPorIds`; la rama solo por `unidad_id` no tiene emisor
frontend confirmado. El backend procesa secuencialmente cada planeación,
previene duplicados por `planeacion_id`, crea un job de métricas por request y
una call por lista. Prompt version:
`v2_lista_cotejo_actividades_momentos`. Todo el flujo pertenece a Fase 4.

### Preview, descarga y delete

Flujo activo:

```text
card → wrapper bib → feature → obtenerListaCoTejoDetalle
     → apiListaCoTejoById → {lista} → entidad → modal o Word
```

Preview y descarga desde card hacen una lectura independiente por acción; no
hay caché compartida. Descargar desde el preview reutiliza
`explorerState.listaCotejoPreview.listaData`, por lo que no hace otra lectura.
Preview consume `titulo`, `tema`, `criterios` y `total_puntos`; Word consume
además `materia` y `nivel`. Los errores de preview se muestran en el modal; la
descarga solo registra error.

El preview legacy usa la entidad ya almacenada en
`listasCotejoByUnidad`, sin GET de detalle.

`apiDeleteListaCotejo` permanece en `biblioteca.api.js`, consolidado y validado
en 3.2. Su consumidor es `ListaCotejoDelete`; moverlo duplicaría o cambiaría una
frontera ya validada. Su reorganización solo puede reevaluarse en Fase 10.

### Globals protegidas

| Global | Firma/superficie | Propietario | Consumidores | Estado | Fase |
| --- | --- | --- | --- | --- | --- |
| `apiListasCoTejoGenerate` | `(payload, token)` | API listas | Biblioteca/service | Activa | 4/10 |
| `apiListasCoTejoByUnidad` | `(unidadId, token)` | API listas | Service legacy | Legacy conservada | 8/10 |
| `apiListaCoTejoById` | `(id, token)` | API listas | Service detalle | Activa | 3/10 |
| Helpers API de listas | Firmas actuales de headers/parse/error/request | API listas | APIs del dominio | Globals implícitas | 10 |
| `apiDeleteListaCotejo` | `(id, token)` | API Biblioteca | Feature delete | Activa | 10 |
| `withListaCoTejoSession` | `(callback)` | Service listas | Tres wrappers service | Global implícita interna | 10 |
| `generarListasCotejoUnidad` | `(payload)` | Service listas | Dashboard legacy | Compatibilidad | 4/8/10 |
| `obtenerListasCotejoPorUnidad` | `(unidadId)` | Service listas | Dashboard legacy | Legacy | 8/10 |
| `obtenerListaCoTejoDetalle` | `(id)` | Service listas | Features | Activa | 10 |
| `ListaCotejoPreview` | `render/open/openBiblioteca/close` | Feature preview | Biblioteca/Dashboard | Activa/legacy | 8/10 |
| `ListaCotejoDownload` | `download/downloadBiblioteca` | Feature download | Biblioteca/Dashboard | Activa | 10 |
| `ListaCotejoDelete` | `deleteFromBiblioteca` | Feature delete | Biblioteca | Activa | 10 |
| `bibDescargarLista` | `(listaId)` | Página Biblioteca | Handler card | Wrapper activo | 10 |
| `openBibliotecaListaPreview` | `(listaId)` | Página Biblioteca | Handler card | Wrapper activo | 10 |
| `bibEliminarLista` | `(listaId, conjuntoId)` | Página Biblioteca | Handler card | Wrapper activo | 10 |
| Coordinadores de modal de lista | Firmas actuales de open/close/render/submit | Página Biblioteca | Handler y modal activos | Globals implícitas activas | 4/6/10 |
| `renderListaCotejoPreviewModal` / `closeListaCotejoPreview` | `()` | Dashboard | Render/listeners | Compatibilidad | 8/10 |
| `openListaCotejoPreview` | `(listaId)` | Dashboard | Explorador | Global implícita legacy | 8 |
| `ensureListasCotejo` / `submitListaCotejoGenerate` | Firmas actuales | Dashboard | Explorador | Globals implícitas legacy | 4/8 |
| `descargarListaCotejoWord` | `(lista, filename)` | `wordExport.js` | Feature download | Compartida activa | Conservar |

### Duplicaciones y candidatos

| Duplicación/candidato | Funciones | Tipo | Riesgo | Decisión |
| --- | --- | --- | --- | --- |
| Opciones GET repetidas | Dos lecturas API | Duplicación HTTP real | Bajo | Sesión 3.6 |
| Helpers de request | Cuatro helpers API | No duplicado | Bajo sin beneficio | No realizar |
| API + service detalle | API por ID y wrapper | Alias de compatibilidad con normalización | Medio | Conservar |
| API + service unidad | API por unidad y wrapper | Listado legacy con normalización | Medio | Fase 8 |
| Generación directa/service | API generate y wrapper | Generación con callers distintos | Alto | Fase 4 |
| Eliminar wrappers | Tres services y wrappers `bib*` | Compatibilidad activa | Medio/alto | Fase 10 |
| Mover delete | `apiDeleteListaCotejo` | Frontera validada | Medio | Fase 10 |

### Sesión 3.6 seleccionada

**Sesión 3.6 — Consolidación interna de lecturas de listas de cotejo.**

Incluirá únicamente `apiListasCoTejoByUnidad(unidadId, accessToken)` y
`apiListaCoTejoById(id, accessToken)` dentro de
`js/api/listas_cotejo.api.js`. Podrá crear un helper GET léxico privado que
reciba path, token y fallback, y delegue en `requestListaCoTejoJson`.

Debe preservar GET implícito, paths, encoding, Bearer sin `Content-Type`,
`no-store`, ausencia de body, contenedores, fallbacks, parsing tolerante,
metadata, globals, services y consumidores. Riesgo bajo. Excluye generación,
pending, delete, services, features, páginas, autenticación, backend,
Archivados y legacy.

Validaciones planificadas: sintaxis, Jest, smoke previo/posterior para URLs,
encoding, opciones, contenedores, `error/message/fallback`, `status/payload`,
vacío/JSON inválido a `null`, una petición, globals y helper fuera de `window`;
preview/descarga activa en manual. El listado legacy se valida por smoke. No
estaba implementada al cierre de 3.5; su resultado se registra a continuación.

### Exclusiones y riesgos

No se modificaron JavaScript, HTML, CSS, generación, pending, preview,
descarga, delete, autenticación, backend, SQL, Archivados ni legacy. Permanecen
el orden de scripts contractual, helpers top-level como globals implícitas,
parsing tolerante a `null`, service que puede devolver `null` sin sesión,
Dashboard legacy con payload híbrido, generación secuencial, wrappers activos
y endpoint backend por planeación sin wrapper frontend.

## Sesión 3.6 — Consolidación interna de lecturas de listas de cotejo

### Estado de entrada

- Frontend: rama `refactor-front`, HEAD `1006abb`, working tree limpio.
- Commit documental 3.5 presente: `0c3c1e3 docs(refactor): audit checklist API contracts`.
- Backend: rama `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0–3.5 completadas.
- Validaciones manuales 3.1, 3.2 y 3.4 aprobadas.

### Consumidores y contratos preservados

| Función | Consumidor | Argumentos | Retorno esperado | Clasificación |
| --- | --- | --- | --- | --- |
| `apiListasCoTejoByUnidad` | `obtenerListasCotejoPorUnidad` → `ensureListasCotejo` | UUID de unidad, token | API `{listas}`; service array/`[]` | Listado legacy |
| `apiListaCoTejoById` | `obtenerListaCoTejoDetalle` → `ListaCotejoPreview.openBiblioteca` | UUID de lista, token | API `{lista}`; service entidad | Preview activa |
| `apiListaCoTejoById` | `obtenerListaCoTejoDetalle` → `ListaCotejoDownload.downloadBiblioteca` | UUID de lista, token | API `{lista}`; service entidad | Descarga activa |

No aparecieron consumidores adicionales ni desconocidos. Los wrappers service
y el flujo legacy se conservan.

| Aspecto | Por unidad | Detalle |
| --- | --- | --- |
| Firma | `(unidadId, accessToken)` | `(id, accessToken)` |
| Endpoint | `/api/listas-cotejo/unidad/:unidadId` | `/api/listas-cotejo/:id` |
| Encoding | `encodeURIComponent(unidadId)` | `encodeURIComponent(id)` |
| HTTP | GET implícito; Bearer; sin `Content-Type`, body ni method explícito; `no-store` | Igual |
| Retorno API | `{listas}` o `null` según parsing | `{lista}` o `null` según parsing |
| Fallback | `No se pudieron obtener las listas de cotejo` | `No se pudo obtener la lista de cotejo` |
| Service | Normaliza array/`{listas}` a array o `[]`; `null` sin sesión | Extrae `response.lista` o conserva payload; `null` sin sesión |

### Implementación

Se añadió el helper léxico privado
`listasCotejoGet(path, accessToken, fallbackMessage)` dentro de
`js/api/listas_cotejo.api.js`. Construye `${API_BASE_URL}${path}` y delega a
`requestListaCoTejoJson` con solo el header Bearer y `cache:"no-store"`. No
transforma el payload, no obtiene sesión, no acepta opciones generales y no se
publica en `window`.

Las funciones públicas conservan asincronía, firmas, globals, encoding, paths,
fallbacks, promesas y retornos. `requestListaCoTejoJson`,
`buildListaCoTejoHeaders`, `parseListaCoTejoApiJson`,
`createListaCoTejoApiError` y `apiListasCoTejoGenerate` quedaron intactos.

### Parsing y errores preservados

El ejecutor continúa usando `response.text()`: JSON válido retorna el payload;
cuerpo vacío o JSON inválido exitoso retorna `null`. En error mantiene prioridad
`payload.error` → `payload.message` → fallback específico → `HTTP <status>`, y
conserva `status` y `payload`; HTTP no JSON usa el fallback y `payload:null`.

### Validaciones

- Smoke previo: aprobado, 48 aserciones y 14 peticiones simuladas.
- Smoke posterior: aprobado, 50 aserciones y 14 peticiones simuladas.
- URLs codificadas, GET implícito, Bearer único, ausencia de `Content-Type`,
  body y llamadas dobles, `no-store`, contenedores y fallbacks: aprobados.
- Globals públicas y helper ausente de `window`: aprobados.
- `node --check js/api/listas_cotejo.api.js`: aprobado.
- `npm test -- --runInBand`: 1 suite y 2 pruebas aprobadas.
- Services, generación, delete, features, páginas, HTML y backend: sin cambios.

### Validación manual

Aprobada por el usuario. Se confirmaron preview, cierre/reapertura, descarga
desde card, descarga desde preview con reutilización del objeto, Biblioteca,
tabs y ausencia de errores relacionados con `listasCotejoGet`. La regresión
confirmó deletes de examen, lista, anexo, planeación directa y bloque completo,
persistencia/base de datos y `deletedBatch:true`. El listado legacy permaneció
fuera del recorrido manual.

### Exclusiones y hallazgos

No se modificaron generación, pending, delete, services, preview, descarga,
consumidores, autenticación, otros dominios, backend, SQL, Archivados o legacy.
Permanecen fuera de alcance: rama backend exclusivamente por unidad sin emisor
frontend confirmado, payload híbrido del Dashboard legacy, generación
secuencial, services que pueden devolver `null` sin sesión, JSON inválido
exitoso convertido en `null`, helpers top-level como globals implícitas,
endpoint backend por planeación sin wrapper frontend y orden contractual de
scripts.

### Próxima sesión

**Sesión 3.7 — Auditoría puntual de APIs de exámenes.**

Fue completada como auditoría documental. Sus resultados se registran a
continuación. Fase 3 continúa en progreso.

## Sesión 3.7 — Auditoría puntual de APIs de exámenes

### Estado de entrada y evidencia previa

- Frontend: rama `refactor-front`, HEAD `6ce5a95`, working tree limpio.
- Commit 3.6: `6ce5a95 refactor(frontend): consolidate checklist read requests`.
- Backend: rama `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0–3.6 completadas.
- Validaciones manuales 3.1, 3.2, 3.4 y 3.6 aprobadas.
- La evidencia 3.6 confirmó preview/reapertura de lista, descargas desde card y
  preview, reutilización del objeto, Biblioteca/tabs, cinco deletes,
  persistencia/base de datos, `deletedBatch:true` y cero errores relacionados
  con `listasCotejoGet`.

### Inventario de funciones

| Función | Archivo | Método/endpoint | Argumentos | Retorno | Error | Consumidores | Clasificación |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `apiExamenesGenerate` | `js/api/examenes.api.js` | POST `/api/examenes/generate` | payload, token | `{ok, job_id, status}` o `null` según parsing | Error con `status/payload` | Biblioteca directa y service | Generación activa de Biblioteca |
| `apiExamenGenerationStatus` | Mismo | GET `/api/examenes/generacion/:jobId` | UUID job, token | Estado del job o `null` | Error con `status/payload` | Biblioteca directa y service | Polling activo de Biblioteca |
| `apiExamenesListByUnidad` | Mismo | GET `/api/examenes/unidad/:unidadId` | UUID unidad, token | `{examenes}` o `null` | Error con `status/payload` | Service → explorador | Listado legacy |
| `apiExamenById` | Mismo | GET `/api/examenes/:id` | UUID examen, token | `{examen}` o `null` | Error con `status/payload` | Service → preview/descarga/post-generación | Preview/descarga activa |
| `apiDeleteExamen` | `js/api/biblioteca.api.js` | DELETE `/api/examenes/:id` | UUID examen, token | `{ok:true}` | `payload.error` o `HTTP <status>` | `ExamDelete` | Biblioteca activa |
| `generarExamenUnidad` | `js/services/examenes.service.js` | Delega POST generate | payload | Entidad compatible; actualmente job; `null` sin sesión | Propaga API | Dashboard | Generación legacy |
| `obtenerEstadoGeneracionExamen` | Mismo | Delega GET status | UUID job | Payload intacto; `null` sin sesión | Propaga API | Polling Dashboard | Polling legacy |
| `obtenerExamenesPorUnidad` | Mismo | Delega GET unidad | UUID unidad | Array/`[]`; `null` sin sesión | Propaga API | `ensureExamenes` | Listado legacy |
| `obtenerExamenDetalle` | Mismo | Delega GET detalle | UUID examen | Entidad/payload; `null` sin sesión | Propaga API | Features y Dashboard | Service de compatibilidad |

No existen funciones o consumidores desconocidos. `POST /api/examenes/generar`
es alias backend de compatibilidad sin wrapper o consumidor frontend; el
frontend usa exclusivamente `/generate`.

### Consumidores confirmados

| Función | Consumidor | Argumentos | Uso del retorno/error | Flujo |
| --- | --- | --- | --- | --- |
| `apiExamenesGenerate` | `submitBibliotecaExamModal` | Payload Biblioteca, token | Exige `job_id`; error queda en modal | Biblioteca vigente |
| `generarExamenUnidad` | `submitUnitExamModal` | Payload por temas | Exige `job_id`; error genérico en sección | Legacy |
| `apiExamenGenerationStatus` | IIFE de `ExamGeneration.generateFromBiblioteca` | Job UUID, token capturado | Actualiza pending; termina/falla/timeout | Polling Biblioteca |
| `obtenerEstadoGeneracionExamen` | `waitForExamGenerationCompletion` | Job UUID | Actualiza `examGeneration`; termina/falla | Polling legacy |
| `apiExamenesListByUnidad` | `obtenerExamenesPorUnidad` | UUID, token | Payload para normalizar | Service |
| `obtenerExamenesPorUnidad` | `ensureExamenes` | UUID | Array en `examenesByUnidad`; error visual | Legacy |
| `apiExamenById` | `obtenerExamenDetalle` | UUID, token | Payload para extraer examen | Service |
| `obtenerExamenDetalle` | `ExamPreview.openBiblioteca/open` | UUID | Entidad en caché/modal | Vigente/legacy |
| `obtenerExamenDetalle` | `ExamDownload.download` | UUID | Entidad para Word | Compartido |
| `obtenerExamenDetalle` | `submitUnitExamModal` | UUID de examen completado | Inserta entidad en estado y recarga | Legacy |
| `apiDeleteExamen` | `ExamDelete.deleteFromBiblioteca` | UUID, token | Ignora `{ok:true}`; log/alerta | Biblioteca vigente |

`bibGenerarExamen` no existe. Biblioteca coordina generación con
`openBibliotecaExamModal` y `submitBibliotecaExamModal`. No existen consumidores
en Detalle o Archivados.

### Contratos HTTP

| Función | Request | Respuesta exitosa | Error/fallback | Vacío o JSON inválido |
| --- | --- | --- | --- | --- |
| `apiExamenesGenerate` | POST JSON; Bearer; body serializado; sin `Accept`/cache | Payload backend | `error` → `message` → `No se pudo generar el examen`; metadata | `null` |
| `apiExamenGenerationStatus` | GET implícito; Bearer; `no-store`; sin body/`Content-Type`/`Accept` | Estado del job | Mismo orden; `No se pudo obtener el progreso del examen`; metadata | `null` |
| `apiExamenesListByUnidad` | GET implícito; Bearer; `no-store`; sin body/`Content-Type`/`Accept` | `{examenes}` | Mismo orden; `No se pudieron obtener los examenes de la unidad`; metadata | `null` |
| `apiExamenById` | GET implícito; Bearer; `no-store`; sin body/`Content-Type`/`Accept` | `{examen}` | Mismo orden; `No se pudo obtener el examen`; metadata | `null` |
| `apiDeleteExamen` | DELETE; Bearer; sin body/cache/`Accept` | `{ok:true}` mediante `response.json()` | Solo `payload.error`, luego `HTTP <status>`; sin metadata | Rechaza al parsear éxito inválido/vacío |

`parseExamApiJson` usa `response.text()`: JSON válido produce payload; cuerpo
vacío o JSON inválido produce `null`, incluso en 2xx. `requestExamJson` conserva
prioridad `payload.error` → `payload.message` → fallback específico →
`HTTP <status>` y crea `Error` con `status` y `payload`.

`unidadId`, `jobId`, `id` de detalle e `id` de delete pasan por
`encodeURIComponent`; generación no interpola IDs en el path.

Todas las rutas usan `requireAuth`: Bearer ausente o inválido devuelve 401. Los
services filtran por `user_id`; recursos y jobs ajenos resultan no encontrados.
Los IDs `unidadId`, `tema_ids`, `batch_id`, job y examen son UUID;
`planeacion_ids` contiene bigint. Listado vacío responde `{examenes:[]}`.
Detalle o job inexistente responde 404; validaciones pueden responder 400 y
fallos inesperados 500.

### Helpers internos

| Helper | Responsabilidad | Funciones consumidoras | Global implícito | Duplicación |
| --- | --- | --- | --- | --- |
| `buildExamJsonHeaders` | `Content-Type` JSON y Bearer | Generación | Sí | No; POST |
| `parseExamApiJson` | Texto a JSON; vacío/inválido a `null` | Request común | Sí | No |
| `createExamApiError` | `Error` con `status/payload` | Request común | Sí | No |
| `requestExamJson` | Fetch, parsing y validación HTTP | Cuatro APIs | Sí | Ejecutor canónico |

El service agrega `normalizeExamEntityPayload`,
`normalizeExamListPayload` y `withExamSession`; son funciones top-level
globales implícitas. `withExamSession` usa `window.requireSession`, devuelve
`null` sin sesión y no transforma errores.

### Relación API/service

| Función API | Wrapper service | API directa | Service | Diferencia contractual |
| --- | --- | --- | --- | --- |
| `apiExamenesGenerate` | `generarExamenUnidad` | Biblioteca | Dashboard legacy | Service obtiene sesión y permite normalización `examen/item`; payloads caller distintos |
| `apiExamenGenerationStatus` | `obtenerEstadoGeneracionExamen` | Polling Biblioteca | Polling legacy | Service renueva sesión por poll; retorno intacto |
| `apiExamenesListByUnidad` | `obtenerExamenesPorUnidad` | Ninguno | Explorador legacy | Service normaliza array, `items`, `data` o `{examenes}` a array/`[]` |
| `apiExamenById` | `obtenerExamenDetalle` | Ninguno | Preview/descarga/Dashboard | Service extrae `examen`/`item` o conserva payload |
| `apiDeleteExamen` | Ninguno | Feature delete | Ninguno | Propiedad de Biblioteca desde 3.2 |

Ambos niveles deben conservarse: Biblioteca usa directamente generación y
polling, mientras features y explorador usan services para sesión y
normalización.

### Comparación de lecturas

| Aspecto | Por unidad | Detalle |
| --- | --- | --- |
| Consumidor | Explorador legacy | Preview/descarga activa y post-generación legacy |
| Endpoint | `/api/examenes/unidad/:unidadId` | `/api/examenes/:id` |
| Retorno API | `{examenes}` | `{examen}` |
| Retorno service | Array/`[]`/`null` | Entidad/payload/`null` |
| Error | Misma familia, fallback propio | Misma familia, fallback propio |
| Encoding | `encodeURIComponent(unidadId)` | `encodeURIComponent(id)` |
| HTTP | GET, Bearer, `no-store`, sin body/Content-Type/Accept | Igual |
| Fase correcta | 8 para consumidor legacy; API conservada | 3 para mecánica; 10 para wrapper |
| Viable consolidar | Sí, conservando wrapper | Sí, conservando wrapper |

`apiExamenGenerationStatus` comparte opciones GET, pero su retorno y consumidor
son de polling; no se incluye en la consolidación de lecturas.

### Generación y payload protegido

Biblioteca llama `apiExamenesGenerate` directamente con:

```text
unidad_id
batch_id
tipos_pregunta
cantidades_pregunta
planeacion_ids
```

El Dashboard legacy llama `generarExamenUnidad` con:

```text
unidad_id
tipos_pregunta
cantidades_pregunta
tema_ids
```

El total no se envía como campo independiente: se deriva de
`cantidades_pregunta`. El backend resuelve `planeacion_ids` bigint a
`tema_ids` UUID, valida unidad, puede corregir el `unidad_id` hacia la unidad
real, rechaza mezcla de unidades, resuelve/detecta `batch_id`, crea job/items y
responde 202 `{ok:true, job_id, status}`. El worker se agenda con
`setTimeout(..., 0)`.

La versión vigente es `v8_unit_exam_counts_by_type_completion`. Items:
`pending`, `processing`, `retrying`, `completed`, `failed`; jobs ejecutables:
`processing`, `completed`, `failed` —el schema conserva default `pending`.
Tipos, cantidades, total, selección, deduplicación, retries, sustitución,
prompts, worker, persistencia y métricas quedan protegidos y pertenecen a
Fase 4.

### Polling

| Flujo | API | Frecuencia/límite | Salida | Estado/feedback |
| --- | --- | --- | --- | --- |
| Biblioteca | `apiExamenGenerationStatus(jobId, token)` directa | Cada 3 s; máximo 60 polls, ~180 s | `completed`, `failed` o timeout | Muta `pendingExamenByBatchId`, renderiza y recarga Biblioteca |
| Dashboard legacy | `obtenerEstadoGeneracionExamen(jobId)` | 1.5 s inicial; luego cada 4 s; sin timeout | `completed`; también trata `failed/partial/cancelled` como fallo | Muta `examGeneration`, renderiza y desplaza sección |

Job inexistente: 404 convertido en `Error` con `status/payload`. Job fallido:
status HTTP 200 con `status:"failed"` y mensaje genérico; ambos coordinadores lo
transforman en fallo visible genérico. El backend actual no emite `partial` o
`cancelled`, aunque el Dashboard legacy los contempla.

Biblioteca cierra el modal apenas recibe `job_id` y mantiene una IIFE de polling
en background. Dashboard fuerza el cierre antes de iniciar la espera. Ningún
cierre cancela el job, aborta la petición o detiene el polling. El polling y su
estado pertenecen íntegramente a Fase 4.

### Preview, descarga y delete

Flujo:

```text
card → wrapper Biblioteca/Dashboard → feature
     → obtenerExamenDetalle → apiExamenById → {examen}
     → examenDetalleById → modal o Word
```

Biblioteca hace una lectura por apertura de preview y guarda el objeto en
`explorerState.examenDetalleById`; reabrir vuelve a leer. El explorador legacy
usa `ensureExamenDetalle` y reutiliza caché. Descargar desde card solicita
detalle solo si no está ya almacenado; descargar desde preview reutiliza el
objeto y no hace otra lectura.

Preview consume título, fecha, `total_preguntas`,
`examen_ia.instrucciones_generales` y preguntas con tipo, texto, opciones,
pares, elementos y respuesta correcta. Word usa el mismo contenido. Preview de
Biblioteca muestra un mensaje genérico; preview legacy conserva `error.message`.
Las descargas registran error y el handler legacy puede mostrar notificación.

`apiDeleteExamen` permanece en `biblioteca.api.js`, consolidado y validado en
3.2. `ExamDelete.deleteFromBiblioteca` es su consumidor; moverlo duplicaría una
frontera validada. Solo puede reevaluarse en Fase 10.

### Globals protegidas

| Global/grupo | Firma o superficie | Propietario | Consumidores | Estado | Fase |
| --- | --- | --- | --- | --- | --- |
| `apiExamenesGenerate` | `(payload, accessToken)` | API exámenes | Biblioteca/service | Generación activa | 4/10 |
| `apiExamenGenerationStatus` | `(jobId, accessToken)` | API exámenes | Biblioteca/service | Polling activo | 4/10 |
| `apiExamenesListByUnidad` | `(unidadId, accessToken)` | API exámenes | Service legacy | Legacy conservada | 3/8/10 |
| `apiExamenById` | `(id, accessToken)` | API exámenes | Service detalle | Compartida activa | 3/10 |
| Helpers API | `buildExamJsonHeaders`, `parseExamApiJson`, `createExamApiError`, `requestExamJson` | API exámenes | Cuatro APIs | Globals implícitas | 10 |
| `generarExamenUnidad` | `(payload)` | Service exámenes | Dashboard legacy | Generación legacy | 4/8/10 |
| `obtenerEstadoGeneracionExamen` | `(jobId)` | Service exámenes | Polling legacy | Polling legacy | 4/8/10 |
| `obtenerExamenesPorUnidad` | `(unidadId)` | Service exámenes | `ensureExamenes` | Listado legacy | 8/10 |
| `obtenerExamenDetalle` | `(id)` | Service exámenes | Features/Dashboard | Compartida activa | 10 |
| Helpers service | `normalizeExamEntityPayload`, `normalizeExamListPayload`, `withExamSession` | Service exámenes | Cuatro wrappers | Globals implícitas | 10 |
| `apiDeleteExamen` | `(id, token)` | API Biblioteca | Feature delete | Activa | 10 |
| `ExamPreview` | `render/open/openBiblioteca/close` | Feature preview | Biblioteca/Dashboard | Activa/legacy | 8/10 |
| `ExamDownload` | `download/downloadFromBiblioteca` | Feature descarga | Biblioteca/Dashboard | Activa/legacy | 10 |
| `ExamDelete` | `deleteFromBiblioteca` | Feature delete | Biblioteca | Activa | 10 |
| `bibDescargarExamen` | `(examenId)` | Página Biblioteca | Handler card | Wrapper activo | 10 |
| `openBibliotecaExamenPreview` | `(examenId)` | Página Biblioteca | Handler card | Wrapper activo | 10 |
| `bibEliminarExamen` | `(examenId, conjuntoId)` | Página Biblioteca | Handler card | Wrapper activo | 10 |
| Modal/generación Biblioteca | `open/close/renderBibliotecaExamModal`, `submitBibliotecaExamModal` | Página Biblioteca | Handler/modal | Globals implícitas activas | 4/10 |
| `renderExamPreviewModal` / `closeExamPreviewModal` | `()` | Dashboard | Render/listeners | Compatibilidad explícita | 8/10 |
| `downloadExamWord` | `(examenId, filenameOverride)` | Dashboard | Biblioteca/preview/legacy | Compatibilidad explícita | 10 |
| `openExamPreview` | `(examenId)` | Dashboard | Explorador | Global implícita legacy | 8 |
| `ensureExamenes` | `(unidadId, options)` | Dashboard | Explorador | Listado legacy | 8 |
| Polling legacy | `waitForExamPolling(ms)`, `waitForExamGenerationCompletion(jobId, unidadId)` | Dashboard | Submit legacy | Globals implícitas | 4/8 |
| Modal/generación legacy | `open/close/renderUnitExamModal`, `submitUnitExamModal(event)` | Dashboard | Explorador/listeners | Globals implícitas | 4/8 |

No se elimina ni renombra ninguna global.

### Duplicaciones y candidatos

| Duplicación/candidato | Funciones | Tipo | Riesgo | Decisión |
| --- | --- | --- | --- | --- |
| Opciones GET de recursos | Listado por unidad y detalle | Duplicación HTTP real | Bajo | Sesión 3.8 |
| GET de estado | Status frente a lecturas | Polling, contrato distinto | Alto | Fase 4 |
| Helpers HTTP existentes | Cuatro helpers API | No duplicado | Bajo sin beneficio | No realizar |
| API + services | Cuatro pares | Alias de compatibilidad con sesión/normalización | Medio | Conservar |
| Generación directa/service | API generate y wrapper | Generación con payloads distintos | Alto | Fase 4 |
| Polling directo/service | API status y wrapper | Polling con bucles distintos | Alto | Fase 4 |
| Eliminar wrappers | Services, Biblioteca y Dashboard | Compatibilidad activa | Medio/alto | Fase 10 |
| Mover delete | `apiDeleteExamen` | Frontera validada | Medio | Fase 10 |

### Sesión 3.8 seleccionada

**Sesión 3.8 — Consolidación interna de lecturas de exámenes.**

Incluirá únicamente:

```text
apiExamenesListByUnidad(unidadId, accessToken)
apiExamenById(id, accessToken)
```

El único archivo funcional candidato es `js/api/examenes.api.js`. Podrá añadir
un helper GET léxico privado que reciba path, token y fallback y delegue en
`requestExamJson`, preservando GET implícito, encoding, Bearer,
`cache:"no-store"`, ausencia de `Content-Type`/`Accept`/body, contenedores,
parsing, metadata, globals, services y consumidores.

Riesgo bajo. Excluirá explícitamente `apiExamenesGenerate`,
`apiExamenGenerationStatus`, generación, polling, jobs, pending, services,
features, páginas, autenticación, delete, backend, Archivados y legacy.
Validaciones futuras: sintaxis, Jest y smoke previo/posterior de URL, encoding,
opciones, retornos, `error/message/fallback`, `status/payload`, vacío/JSON
inválido a `null`, una petición, globals y helper fuera de `window`; preview y
descarga en validación manual, listado legacy solo por smoke.

### Exclusiones y riesgos

No se modificaron JavaScript, HTML, CSS, generación, polling, pending, preview,
descarga, delete, services, autenticación, payloads, backend, SQL, prompts,
retries, deduplicación, Archivados ni legacy. Permanecen: polling Biblioteca
con máximo de 60 iteraciones, polling legacy sin timeout, cierre de modal sin
cancelación, JSON inválido exitoso convertido en `null`, services que pueden
devolver `null` sin sesión, helpers top-level globales implícitos, duplicación
de `ensureExamenDetalle`, alias backend `/generar` sin consumidor frontend y
orden contractual de scripts.

### Próxima sesión

**Sesión 3.8 — Consolidación interna de lecturas de exámenes.**

Es la única siguiente sesión seleccionada. No está implementada. Fase 3
continúa en progreso.

## Sesión 3.8 — Consolidación interna de lecturas de exámenes

### Estado de entrada

- Frontend: rama `refactor-front`, HEAD `00665b6`, working tree limpio.
- Commit 3.7: `00665b6 docs(refactor): audit exam API contracts`.
- Backend: rama `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso; sesiones 3.0–3.7 completadas.
- Validaciones manuales 3.1, 3.2, 3.4 y 3.6 aprobadas.

### Consumidores y contratos preservados

| Función API | Consumidor | Clasificación | Retorno API |
| --- | --- | --- | --- |
| `apiExamenesListByUnidad(unidadId, accessToken)` | `obtenerExamenesPorUnidad` → `ensureExamenes` | Listado legacy conservado | `{examenes}` o `null` |
| `apiExamenById(id, accessToken)` | `obtenerExamenDetalle` → `ExamPreview`, `ExamDownload` y `submitUnitExamModal` | Detalle activo/compartido | `{examen}` o `null` |

Ambas funciones conservan `encodeURIComponent`, paths, GET implícito, único
header Bearer, ausencia de `Content-Type`, `Accept` y body,
`cache:"no-store"`, una petición por llamada, fallbacks, promesa, payload y
globals explícitas.

### Helper privado

Se creó `examResourceGet(path, accessToken, fallbackMessage)` como constante
léxica exclusiva de lecturas GET de recursos de examen. Comparte solamente URL
base, Bearer y `no-store`, y delega sin transformar en `requestExamJson`. No se
publica en `window`, no obtiene sesión, no acepta opciones generales y no se usa
para generación, polling, status del job o delete.

`requestExamJson`, `buildExamJsonHeaders`, `parseExamApiJson`,
`createExamApiError`, `apiExamenesGenerate` y
`apiExamenGenerationStatus` quedaron literalmente idénticos a `HEAD`.

### Parsing y errores preservados

`response.text()` continúa produciendo payload para JSON válido y `null` para
cuerpo vacío o JSON inválido, incluso con HTTP exitoso. En error se conserva la
prioridad `payload.error` → `payload.message` → fallback específico →
`HTTP <status>`, además de `error.status` y `error.payload`. HTTP no JSON usa el
fallback específico, conserva status y deja `payload:null`.

### Validaciones técnicas

- Smoke previo: 55 aserciones y 14 peticiones simuladas, aprobado.
- Smoke posterior: 57 aserciones y 14 peticiones simuladas, aprobado.
- URLs, encoding, GET implícito, Bearer, headers ausentes, body ausente,
  `no-store`, contenedores, errores, metadata, vacío/JSON inválido, una petición
  y cuatro globals: aprobados.
- `examResourceGet` existe léxicamente y está ausente de `window`.
- `node --check js/api/examenes.api.js`: aprobado.
- `npm test -- --runInBand`: 1 suite y 2 pruebas aprobadas.
- Services, generación, polling, delete, features, páginas, autenticación, HTML
  y backend: sin cambios.

### Validación manual

Aprobada por el usuario. Se confirmaron preview, cierre/reapertura, contenido,
preguntas, opciones, respuestas, tipos de reactivo, descarga desde card, modal
de nombre, archivo descargado, descarga desde preview con reutilización del
objeto, Biblioteca/tabs, previews y descargas de otros dominios, cero GET
duplicados inesperados y cero errores de `examResourceGet`. El listado legacy
se cubrió únicamente mediante smoke, conforme al alcance.

La regresión adicional confirmó generación exitosa de anexo, lista y examen,
incluidos prompt versions vigentes, selección de una planeación y su tema, diez
preguntas finales con distribución 5/5, deduplicación, reintentos, fallbacks,
guardado y métricas `success`. Esta evidencia demuestra no regresión de 3.8; no
constituye trabajo ni inicio de Fase 4.

- Anexo: `v1_anexos_desde_planeacion`, generación exitosa y métricas
  `success`.
- Lista: `v2_lista_cotejo_actividades_momentos`, `created:1`, `skipped:0` y
  métricas `success`.
- Examen: una planeación y un tema, diez preguntas finales —cinco de opción
  múltiple y cinco de verdadero/falso—, cero fallidas, doce reintentos,
  guardado exitoso y métricas `success`.

### Exclusiones y hallazgos

No se modificaron generación, polling, jobs, pending, payloads protegidos,
services, delete, preview, descarga, consumidores, autenticación, otros API
files, backend, SQL, Archivados o legacy. Permanecen fuera de alcance: polling
de Biblioteca limitado a 60 iteraciones, polling legacy sin timeout, cierre de
modal sin cancelación, JSON inválido exitoso convertido en `null`, services que
pueden devolver `null` sin sesión, helpers top-level globales implícitas,
duplicación de `ensureExamenDetalle`, alias backend `/generar` sin consumidor y
orden contractual de scripts.

## Sesión 3.9 — Auditoría de cierre de capa API frontend

### Estado de entrada

- Frontend: rama `refactor-front`, HEAD `b59366c`, working tree limpio.
- Commit 3.8: `b59366c refactor(frontend): consolidate exam read requests`.
- Backend: rama `refactor-back`, HEAD `e08d6e4`, working tree limpio.
- Fases 0–2 completadas; Fase 3 en progreso al iniciar.
- Sesiones 3.0–3.8 presentes en el historial.
- Validaciones manuales 3.1, 3.2, 3.4, 3.6 y 3.8 aprobadas.

### Sesiones y commits

| Sesión | Commit | Estado |
| --- | --- | --- |
| 3.0 | `ac23955` | Auditoría global completada |
| 3.1 | `a6a2941` | Lecturas de Biblioteca completadas y validadas |
| 3.2 | `6a96d79` | Deletes de Biblioteca completados y validados |
| 3.3 | `3cbf8b1` | Auditoría de anexos completada |
| 3.4 | `18e96ba` | Lecturas de anexos completadas y validadas |
| 3.5 | `0c3c1e3` | Auditoría de listas completada |
| 3.6 | `6ce5a95` | Lecturas de listas completadas y validadas |
| 3.7 | `00665b6` | Auditoría de exámenes completada |
| 3.8 | `b59366c` | Lecturas de exámenes completadas y validadas |

### Resultado acumulado

- La auditoría 3.0 documentó todos los API files, services, funciones HTTP,
  consumidores, globals, sesión, headers, parsing, errores, duplicados,
  aliases, Archivados, legacy, generación y polling.
- Biblioteca consolidó dos lecturas GET en `bibliotecaGet` y cinco deletes en
  `bibliotecaDelete`.
- Anexos consolidó tres lecturas GET en `anexosGet`.
- Listas consolidó dos lecturas GET en `listasCotejoGet`.
- Exámenes consolidó dos lecturas GET de recursos en `examResourceGet`; el
  status del job quedó excluido.
- Generación, regeneración, polling, SSE, pending, payloads, retries,
  deduplicación, prompts, worker, métricas y feedback permanecieron intactos.

### Helpers, globals y wrappers

| Helper | Archivo | Alcance | Global |
| --- | --- | --- | --- |
| `bibliotecaGet` | `js/api/biblioteca.api.js` | GET de conjuntos | No |
| `bibliotecaDelete` | `js/api/biblioteca.api.js` | Deletes vigentes | No |
| `anexosGet` | `js/api/anexos.api.js` | Lecturas de anexos | No |
| `listasCotejoGet` | `js/api/listas_cotejo.api.js` | Lecturas de listas | No |
| `examResourceGet` | `js/api/examenes.api.js` | Lecturas de recursos de examen | No |

Los cinco son bindings léxicos privados, no obtienen sesión, no transforman el
payload y no cruzan dominios. No existe cliente HTTP universal, helper Bearer
global, helper universal de sesión, parser común ni clase de error transversal.

Las globals API, wrappers service, namespaces feature, wrappers `bib*`, globals
de generación/polling, compatibilidad legacy y Archivados continúan disponibles
con sus firmas. El orden de scripts permanece compatible.

### Duplicación y candidatos restantes

| Candidato | Motivo de conservar | Decisión |
| --- | --- | --- |
| APIs de planeaciones | Detalle/edición, JSON, SSE, Archivados, export y estado local | Fases 4/7/8/10 |
| APIs de jerarquía | CRUD técnico, generación, legacy, Archivados y wrappers indirectos | Fases 4/8/10 |
| Autenticación común | Redirects y `null` observables | Conservar |
| Headers/parsing comunes | JSON inválido, errores, SSE, blobs y crudos incompatibles | No realizar |
| Helper HTTP universal | No existe equivalencia contractual global | No realizar |
| Movimiento de deletes | Frontera validada en Biblioteca API | Fase 10 |
| APIs sin consumidor | Globals protegidas/compatibilidad | Fase 10 |
| Service wrappers | Consumidores activos y legacy | Fase 10 |

Generación y polling corresponden a Fase 4; estado a Fase 5; render/eventos a
Fase 6; Dashboard/shell a Fase 7; Archivados y aislamiento legacy a Fase 8;
eliminación de legacy a Fase 9; wrappers/globals a Fase 10. Ninguna deuda
restante bloquea Fase 3.

### Criterios de cierre

- Sesiones 3.0–3.8 con commit: cumplido.
- Validaciones manuales requeridas: aprobadas.
- Inventario y consumidores: completos, cero desconocidos.
- Globals, firmas y wrappers: preservados.
- Biblioteca GET/DELETE, anexos GET, listas GET y exámenes GET: consolidados.
- Generación, polling y payloads protegidos: intactos y excluidos.
- APIs restantes: asignadas a fases futuras.
- Acción pequeña imprescindible pendiente de Fase 3: ninguna.
- Código necesario para cerrar: ninguno.

### Decisión

**A. Cerrar Fase 3.**

Fase cerrada: `3 — Capa API frontend`. Sesiones completadas: 3.0–3.9.
Validación manual acumulativa: aprobada. Siguiente fase: `4 — Generación y
polling`, pendiente y no iniciada.

## Límite de la conversación actual

La Fase 3 quedó cerrada.

No se inició la Fase 4.

La Fase 4 debe comenzar en una nueva conversación y debe partir de:

- `REFACTOR_ROADMAP.md`
- `SESSION_HANDOFF.md`
- `FRONTEND_MAP.md`
- `TEST_MATRIX.md`
- `REFACTOR_DECISIONS.md`

## Sesión 4.0 — Auditoría documental de apertura

### Estado de entrada

- Frontend: rama `refactor-front`, HEAD `ecb1785`, working tree limpio.
- Backend revisado en solo lectura: rama `refactor-back`, HEAD `e08d6e4`,
  working tree limpio.
- Fase 3 cerrada mediante decisión **A. Cerrar Fase 3**; no se reabre su
  validación manual.
- Fase 4: `Generación y polling`, pendiente y no iniciada al entrar.
- Riesgo de la sesión: medio documental; riesgo funcional alto si se excede el
  alcance.

### Identidad de la sesión

La identidad formal aprobada de este trabajo es **Sesión 4.0 — Auditoría
documental de apertura**. Se mantiene el alcance documentado para la Fase
`4 — Generación y polling`: objetivo de separar por dominio inicio, feedback,
progreso, polling, finalización, error y limpieza; un recurso por sesión; orden
sugerido anexos, listas, planeaciones, exámenes.

La auditoría fue aprobada explícitamente por el usuario al solicitar el primer
corte funcional. La numeración formal aprobada identifica además los cortes ya
abiertos como Sesiones 4.1, 4.2 y 4.3; no asigna número al trabajo futuro de
exámenes ni a la auditoría de cierre.

### Resultado de la auditoría

El inventario verificable quedó registrado en `docs/FRONTEND_MAP.md`. Incluye:

- generación de planeaciones al agregar temas y mediante creación rápida;
- generación individual histórica sin entry point ejecutable confirmado;
- generación secuencial vigente y regeneración compatible de anexos;
- generación vigente y coordinador legacy de listas de cotejo;
- creación de job, polling vigente y polling legacy de exámenes;
- endpoints, método, auth, headers, payload, parsing, terminales, intervalos,
  timeouts, refetch, persistencia, feedback, cleanup y ausencia de cancelación;
- propietarios, lectores y escritores de pending;
- consumidores directos, indirectos, globals, wrappers, handlers y delegación;
- clasificación entre Biblioteca, Dashboard, Detalle, Archivados, jerarquía
  técnica, compatibilidad, legacy visual y no clasificado;
- contratos backend y logs que deben conservarse;
- riesgos confirmados y elementos no confirmados.

No se implementó, extrajo, movió, renombró, consolidó ni reescribió lógica de
generación, polling, SSE, pending, feedback, render, error, timeout, retry o
cancelación.

### Hallazgos que condicionan Fase 4

1. Biblioteca vigente coordina los cuatro dominios en
   `biblioteca.page.js`, pero creación rápida de planeaciones sigue compartida
   con `dashboard.page.js` y jerarquía técnica.
2. Anexos no tiene service frontend. Biblioteca llama API directa y procesa
   selecciones secuencialmente.
3. Listas usa API directa en Biblioteca y service en legacy; sus skipped no se
   proyectan por card.
4. Exámenes tiene dos pollings no equivalentes: Biblioteca usa 3 s/60 intentos;
   Dashboard legacy usa 1.5 s/4 s sin límite.
5. El polling vigente clasifica como timeout una finalización recibida en el
   poll 60 por el chequeo posterior `polls >= MAX_POLLS`.
6. No existe `EventSource`, `AbortController`, `setInterval` ni cancelación de
   procesos; el SSE es lectura manual de fetch.
7. Los pending son léxicos, viven en memoria y se pierden con reload; los jobs
   de examen y artefactos backend sí persisten.
8. `biblioteca-block-delete.js` es consumidor indirecto de los cuatro mapas
   pending.
9. Las ramas individuales de generar/regenerar anexo no tienen emisor DOM
   vigente confirmado; permanecen como compatibilidad.
10. `planeacion.page.js` conserva generación individual, pero su página
    redirige a Dashboard; no se declara legacy ni eliminable.
11. `README.md` contradice el árbol y `ARCHITECTURE.md` al afirmar que
    `js/features/` no existe. Es deuda documental previa, no corregida aquí.
12. Los documentos complementarios `CURRENT_BEHAVIOR.md`,
    `FRONTEND_AUDIT.md`, `LEGACY_HIERARCHY.md` y `REFACTOR_BACKLOG.md` no
    existen en el frontend. Se localizaron homónimos en
    `educativo_backend/Educativo-Backend/docs/refactor/`, pero todos se
    autodeclaran históricos, remiten la vigencia al frontend y contienen
    líneas/clasificaciones anteriores. No son reemplazos movidos ni roadmap
    operativo. En particular,
    la propuesta histórica de añadir cancelación al polling no prevalece sobre
    R-004, el roadmap actual ni el alcance explícito de esta sesión.

### Contratos protegidos

Permanecen protegidos autenticación, Bearer, headers, parsing, mensajes,
payloads, IDs, orden de scripts, globals, refetch y ausencia de cancelación.
Para exámenes se preservan expresamente `unidad_id`, `planeacion_ids`,
`tema_ids`, `tipos_pregunta`, `cantidades_pregunta`, total derivado, selección,
deduplicación, jobs/items, estados, reintentos, reemplazo de duplicados,
cantidad final, prompts, worker y métricas. También quedan fuera de alcance
backend, esquema, SQL, RLS, migraciones y `js/ui/wordExport.js`.

Los logs conocidos fueron confirmados en el código actual:

- frontend: `[planeaciones] generate:start/success`,
  `[anexos] generate:start/success`,
  `[listas-cotejo] generate:success`, payload/job de exámenes y
  `[polling] examen:start/finished`;
- backend: `[anexos] generate:start/success`,
  `[listas-cotejo] generate:start/success`,
  `[examenes] generar examen recibido`, `worker:start`,
  `pregunta aceptada`, `pregunta rechazada, reintentando`, `exam:saved`,
  `generate:success` y `[aiMetrics] job:finished`.

No se confirmó `[listas-cotejo] generate:start` en frontend; sí existe en
backend. No se modificó ningún log.

### Secuencia conservadora respaldada y propuesta

El orden aprobado y sus sesiones formalmente abiertas son:

1. Sesión 4.1 — anexos;
2. Sesión 4.2 — listas de cotejo;
3. Sesión 4.3 — planeaciones;
4. exámenes, todavía sin número asignado.

La Sesión 4.1 — **Extracción literal de generación de anexos desde Biblioteca**
se definió como primer corte funcional. Debe limitarse al
coordinador vigente, preservar API directa, secuencia por item, pending,
feedback, refetch, errores, timeout backend y compatibilidad, y no incorporar
regeneración ni crear un service nuevo.

Es el corte más conservador porque abre con el primer dominio del orden
documentado, no contiene polling ni SSE y permite verificar un proceso largo
por recurso sin mezclar listas, planeaciones, exámenes, estado general o render
general.

### Revisión manual pendiente

La revisión de esta sesión es exclusivamente documental. Debe confirmar:

- identidad formal `Sesión 4.0 — Auditoría documental de apertura`;
- alcance real de Fase 4;
- inventario por dominio y consumidores;
- polling, SSE y requests largos;
- pending, feedback, wrappers y globals;
- clasificación de vigencia;
- contratos protegidos, riesgos y regresiones;
- propuesta del siguiente corte;
- archivos documentales modificados.

Estado: **Aprobada explícitamente por el usuario**. La aprobación corresponde
al contenido documental de apertura y no aprueba pruebas manuales funcionales
de Fase 4.

## Sesión 4.1 — Extracción literal de generación de anexos desde Biblioteca

### Identidad y estado

- Fase: `4 — Generación y polling`.
- Número: `4.1`.
- Nombre descriptivo: **Extracción literal de generación de anexos desde Biblioteca**.
- Riesgo: alto.
- Estado de implementación: completada y validada manualmente.

### Corte implementado

`submitBibliotecaAnexoCreateModal()` conserva el contrato de modal: estado,
conjunto, anexos existentes, selección disponible, normalización,
deduplicación, mensaje vacío, flag `submitting`, render y `requireSession()`.
Después delega una sola vez en
`window.AnexoGeneration.generateFromBiblioteca({ conjuntoId, selectedIds,
planeaciones, accessToken })`.

`js/features/anexos/anexo-generation.js` contiene, de forma literal, la
operación antes embebida en la página:

1. crea `bibliotecaState.anexosGenerating[conjuntoId]` y sus cards;
2. cierra el modal, selecciona el tab Anexos y renderiza;
3. ejecuta `apiGenerarAnexo()` secuencialmente por `selectedIds`;
4. actualiza optimistamente `conjunto.anexos` y `total_anexos`;
5. elimina el pending exitoso o conserva error y mensaje por item;
6. renderiza después de cada intento;
7. conserva logs, limpieza asimétrica y refetch silencioso si hubo éxito.

La dependencia se expone como `window.AnexoGeneration` porque la aplicación usa
scripts clásicos. `pages/dashboard.html` la carga después de `anexos.api.js` y
antes de los consumidores de página. Su retiro solo puede evaluarse al migrar
la carga clásica en una fase autorizada y confirmar cero consumidores globales.

### Contratos preservados y fuera de alcance

Permanecen iguales `POST /api/anexos/generate`, JSON + Bearer,
`{planeacion_id}`, parser/error de `apiGenerarAnexo`, orden secuencial,
pending, mensajes, actualización optimista, refetch, persistencia y logs. No se
tocaron regeneración, wrappers individuales, listas, planeaciones, exámenes,
polling, SSE, estado general, render general, backend, CSS, `wordExport.js`,
prompts, payloads ni contratos HTTP.

### Validación

Pasaron la comprobación sintáctica, la comparación literal contra `HEAD` y un
smoke aislado de 19 aserciones para éxito, secuencia, éxito parcial, fallo total,
pending, actualización optimista y refetch. El usuario aprobó cancelación,
generación individual y múltiple, pending, preview/reapertura, persistencia,
reutilización del modal, delete de bloque y tabs. El error parcial no se ejecutó
por ausencia de un mecanismo controlado seguro y no bloqueó la aprobación.

### Siguiente corte sugerido

**Sesión 4.2 — Extracción literal de generación seleccionada de listas de
cotejo desde Biblioteca**. Este corte quedó implementado a continuación.

## Sesión 4.2 — Extracción literal de generación seleccionada de listas de cotejo desde Biblioteca

### Identidad y estado

- Fase: `4 — Generación y polling`.
- Número: `4.2`.
- Nombre descriptivo: **Extracción literal de generación seleccionada de listas de cotejo desde Biblioteca**.
- Riesgo: alto.
- Estado de implementación: completada y validada manualmente.

### Corte implementado

`submitBibliotecaListaModal()` conserva estado del modal, conjunto, listas
existentes, selección disponible, normalización, deduplicación, mensaje vacío,
flag `submitting`, render y `requireSession()`. Después delega una vez en
`window.ListaCotejoGeneration.generateFromBiblioteca({ conjuntoId, selectedIds,
planeaciones, accessToken })`.

`js/features/listas-cotejo/lista-cotejo-generation.js` contiene literalmente la
operación antes embebida en la página:

1. cierra el modal y selecciona el tab Listas;
2. crea `pendingListaByBatchId[conjuntoId]` con un item por planeación;
3. ejecuta un único `apiListasCoTejoGenerate({planeacion_ids}, accessToken)`;
4. conserva los conteos `created` y `skipped` del log frontend;
5. espera exactamente 1500 ms, limpia pending y hace refetch silencioso;
6. ante error conserva todos los items, replica el mensaje y renderiza.

La global temporal incluye fecha, motivo, consumidor y condición de retiro.
`pages/dashboard.html` la carga después de la API y el service de listas, antes
de los consumidores de página. `submitListaCotejoGenerate()`,
`generarListasCotejoUnidad()` y `explorerState.listaCotejoGeneration` quedaron
intactos como flujo legacy protegido.

### Contratos y riesgos preservados

Permanecen iguales `POST /api/listas-cotejo/generate`, JSON + Bearer,
`{planeacion_ids}`, parser/error, request único, forma de pending,
`created`/`skipped`, espera, refetch, render, persistencia y logs. Biblioteca
continúa sin proyectar razones individuales de skipped; un error se muestra en
todas las cards; pending se pierde con reload y no bloquea por sí mismo una
reapertura del modal. No se añadieron timeout, cancelación ni bugfixes.

### Validación

Pasaron sintaxis, comparación literal contra `HEAD`, suite Jest y smoke aislado
de 33 comprobaciones para global, delegación única, payload/orden, request
único, pending, created/skipped, espera de 1500 ms, cleanup/refetch, error y
cleanup indirecto de bloque. El usuario aprobó cancelación, generación,
request y payload, pending por card, preview, persistencia, modal reutilizable,
conteos, delete de bloque, tabs, backend y contratos. Skipped y error controlado
no se forzaron por no existir un mecanismo seguro y no bloquearon la aprobación.

### Siguiente corte sugerido

**Sesión 4.3 — Extracción literal del inicio y progreso de generación de
planeaciones desde Biblioteca**. Este corte quedó implementado a continuación.

## Sesión 4.3 — Extracción literal del inicio y progreso de generación de planeaciones desde Biblioteca

### Identidad y estado

- Fase: `4 — Generación y polling`.
- Número: `4.3`.
- Nombre descriptivo: **Extracción literal del inicio y progreso de generación de planeaciones desde Biblioteca**.
- Riesgo: crítico.
- Estado de implementación: completada y validada manualmente.

### Puerta de seguridad y corte implementado

La búsqueda global confirmó tres coordinadores distintos. Biblioteca inicia en
`submitBibliotecaAgregarModal()`; quick create conserva
`generatePlaneacionesFromStaging()` y la generación individual no clasificada
conserva `generarPlaneacion()`. Los dos primeros comparten solo
`generarPlaneacionesUnidadConProgreso()` y `apiUnidadGenerarConProgreso()`; no
comparten callback, pending, payload completo ni render. La generación individual
usa otro service/API y otro endpoint.

Por ello se extrajo únicamente el bloque exclusivo posterior al snapshot. El
submit conserva modal, lectura DOM, validación, `unidadId`, `conjuntoId`,
contexto y `temasSnap`; delega una vez en
`window.PlaneacionGeneration.generateFromBiblioteca({ conjuntoId, unidadId,
materia, nivel, temasSnap })`. El nuevo feature contiene literalmente:

1. cierre inmediato del modal, selección del conjunto/tab y pending por tema;
2. payload `{temas, materia, nivel, batch_id}` y llamada al service vigente;
3. callbacks `item_started`, `item_completed`, `item_error` e `item_skipped`;
4. aplicación de resultado y mezcla optimista de planeaciones;
5. limpieza solo si `error_count === 0`, conservación de parciales y feedback;
6. selección/render final, refetch silencioso y catch vigente.

`pages/dashboard.html` carga el feature como script clásico después de las API y
services requeridos y antes de `dashboard.page.js`/`biblioteca.page.js`. La
global temporal registra fecha, motivo, consumidor y condición de retiro.

### Contratos y riesgos preservados

Permanecen intactos `POST /api/unidades/:unidadId/generar?stream=1`, fallback
JSON solo en errores 5xx, sesión Supabase, Bearer, headers, payload, parser SSE,
buffer, eventos, orden de callbacks, resultados parciales, conteos, persistencia,
logs, refetch y ausencia de timeout/cancelación. Quick create,
`explorerState.generating/progress`, `pendingConjunto`, generación individual,
APIs/services compartidos, backend, CSS, `wordExport.js`, otros dominios y
orden previo de scripts no se modificaron.

El pending local se pierde al reload; navegar no cancela el trabajo backend;
delete de bloque limpia el mapa pero no cancela la generación; un error/parcial
conserva pending; el parser ignora fragmentos inválidos y no procesa
explícitamente un último fragmento sin salto de línea. Son riesgos vigentes, no
bugfixes de esta sesión.

### Validación

Las validaciones estáticas, equivalencia literal y smoke técnico se registran en
`TEST_MATRIX.md`. El usuario aprobó cancelación; generación de una planeación y
de varios temas; un único request SSE con `stream=1`; payload, pending, progreso,
persistencia y reutilización del modal; quick create, delete y tabs; y la
regresión acumulativa. La corrida confirmó `success_count:2`, `error_count:0`,
`skipped_count:0` para Gravedad y Movimiento. El error legacy de schema cache de
`public.ia_metrics` permanece como hallazgo previo; `[aiMetrics] job:finished`
continuó operativo.

### Siguiente corte sugerido

**Sesión 4.4 — Auditoría específica y extracción literal de generación y polling
de exámenes desde Biblioteca**. Este corte quedó implementado a continuación.

## Sesión 4.4 — Auditoría específica y extracción literal de generación y polling de exámenes desde Biblioteca

### Identidad y estado

- Fase: `4 — Generación y polling`.
- Número: `4.4`.
- Nombre: **Auditoría específica y extracción literal de generación y polling de exámenes desde Biblioteca**.
- Riesgo: crítico.
- Estado de implementación: completada y validada manualmente.

### Puerta de seguridad y corte implementado

La búsqueda global confirmó dos coordinadores no equivalentes. Biblioteca usa
`submitBibliotecaExamModal()` y APIs directas; el Dashboard visual legacy usa
`submitUnitExamModal()` → `generarExamenUnidad()` →
`waitForExamGenerationCompletion()` → `obtenerEstadoGeneracionExamen()`.
Comparten `apiExamenesGenerate()`, `apiExamenGenerationStatus()` y el parser
HTTP, pero no payload caller, sesión por poll, estado, render, feedback,
terminales ni ritmo. Biblioteca escribe `pendingExamenByBatchId`; legacy escribe
`explorerState.examGeneration`. Por ello existía un bloque exclusivo seguro.

`submitBibliotecaExamModal()` conserva DOM, modal, selecciones, validaciones,
orden de IDs, tipos/cantidades, `requireSession()`, flag `submitting` y payload.
Delega una vez en `window.ExamGeneration.generateFromBiblioteca({ payload,
accessToken, conjuntoId })`. El nuevo `js/features/examenes/exam-generation.js`
contiene literalmente creación del job, validación de `job_id`, cierre del
modal, tab, pending, polling en background, `current_step`, `completed`,
`failed`, timeout, cleanup, render y refetch. `pages/dashboard.html` añade una
sola línea después de API/service y antes de las páginas. La global temporal
registra fecha, motivo, consumidor y condición de retiro.

### Comportamiento y contratos preservados

El modal parte de `conjunto.planeaciones` sin filtrar las que carecen de tema;
usa `tema`, `custom_title` o `Sin titulo`. Normaliza cada ID con `String`, evita
duplicarlo en la selección y conserva el orden de selección. No excluye por
examen existente ni bloquea por pending. Exige unidad, al menos un tipo y al
menos una planeación; usa defaults actuales y envía exactamente
`{unidad_id,batch_id,tipos_pregunta,cantidades_pregunta,planeacion_ids}`. El
total se deriva en backend y no se envía.

El POST conserva JSON + Bearer y exige `job_id`. Tras crearlo cierra el modal,
activa Exámenes y crea `{message,error}`. La IIFE espera 3000 ms antes de cada
GET, incrementa el contador y consulta como máximo 60 veces con token capturado.
`queued`, `processing` y estados desconocidos continúan; cualquier
`current_step` reemplaza el mensaje y renderiza. `completed` rompe el loop,
`failed` lanza el mensaje protegido y la ausencia de terminal produce timeout.
Éxito borra pending y hace refetch; fallo/timeout conserva una card con error
genérico. No hay handle, cancelación, reanudación ni persistencia local de
`jobId`.

Permanecen intactos payloads, APIs, parser, auth, headers, logs, selección y
contexto backend, deduplicación, retries, reemplazo de duplicados, fallbacks,
worker, items, examen final, métricas, preview, descargas y deletes. El flujo
legacy, sus services, `explorerState.examGeneration` y sus esperas 1.5 s/4 s sin
límite quedaron byte-idénticos. `biblioteca-block-delete.js` sigue eliminando el
pending del bloque, sin cancelar el job o polling.

### Riesgos preservados

- Un `completed` recibido en el poll 60 sigue clasificándose como timeout por el chequeo posterior `polls >= MAX_POLLS`.
- Reload o navegación pierde pending/jobId y no reanuda ni cancela el worker.
- Un job que termina después del timeout puede aparecer solo tras refetch/reload posterior.
- Pending no impide abrir otro modal o iniciar otro job; no se corrigió doble submit.
- `submitting` se fija antes de `requireSession()` y un retorno `null` no lo restablece; se preservó sin bugfix.
- El polling legacy permanece indefinido y con terminales distintos; no se consolidó.
- Delete durante polling elimina feedback local pero no cancela la IIFE; queda excluido de pruebas.

### Validaciones técnicas

`node --check` aprobó el feature y la página; Jest aprobó 1 suite y 2 pruebas.
La comparación contra `HEAD` confirmó 62 líneas literales, con las únicas
adaptaciones de `accessToken` y `conjuntoId` explícitos. El smoke aislado aprobó
22 comprobaciones en seis escenarios: `queued → processing → completed`,
`queued → failed`, timeout a 60 polls, ausencia de `job_id`, error HTTP y status
desconocido seguido de `completed`. API/service, Dashboard legacy y delete de
bloque quedaron idénticos a `HEAD`; `git diff --check` pasó.

### Fase 4 — Sesión 4.4

**Validación manual: Aprobada.** Se usó un bloque con las planeaciones 668 y 669,
correspondientes a Gravedad y Movimiento.

| Prueba | Verificación pendiente |
| --- | --- |
| 1 — Cancelación | Aprobada: cero POST y reapertura funcional. |
| 2 — Generación básica | Aprobada: jobId, polling, `current_step`, `completed`, persistencia y reload. |
| 3 — Contratos de tipos y cantidades | Aprobada: 19 solicitadas y 19 guardadas; tipos/cantidades documentados abajo. |
| 4 — Contexto correcto | Aprobada: unidad, batch, planeaciones 668/669 y temas Gravedad/Movimiento. |
| 5 — Polling | Aprobada: comportamiento y terminal `completed` correctos. |
| 6 — Reutilización del modal | Aprobada. |
| 7 — Preview y descarga | Aprobada desde card y preview. |
| 8 — Delete | Aprobada. |
| 9 — Regresión de recursos | Aprobada: otros recursos sin regresiones. |
| 10 — Failed o timeout | No ejecutada: no ocurrió de forma natural y segura; no se forzó. |
| 11 — Duplicados y reintentos | Aprobada por observación: cero preguntas fallidas y `retries:0`. |

Contexto confirmado: `unidadId` `56377d0c-e5b5-4ded-8ab0-9fbb992228c4`,
`batchId` `3df729c9-a803-4f6e-884d-9685ec971398`, planeaciones 668/669. Tipos y
cantidades: `opcion_multiple:5`, `verdadero_falso:5`, `emparejamiento:1`,
`respuesta_corta:3`, `calculo_numerico:3`, `pregunta_abierta:1` y
`ordenacion_jerarquizacion:1`. Resultado: `totalRequested:19`,
`totalPreguntas:19`, `preguntasFallidas:0`, `retries:0`.

Se observaron `[examenes] generar examen recibido`, los eventos `exam-debug` de
input/batch/job, `worker:start`, contexto final, preguntas aceptadas,
`exam:saved`, `generate:success` y `[aiMetrics] job:finished`. No hubo retries.

### Siguiente corte sugerido

**Sesión 4.5 — Auditoría formal de cierre de generación y polling**. Este corte
documental quedó ejecutado a continuación.

## Sesión 4.5 — Auditoría formal de cierre de generación y polling

### Identidad y estado de entrada

- Tipo: auditoría documental y técnica; sin implementación funcional.
- Riesgo: medio documental; alto si se modifica comportamiento.
- Frontend inicial: `refactor-front`, `6344374`, working tree limpio.
- Backend solo lectura: `refactor-back`, `e08d6e4`, working tree limpio.
- Sesiones 4.0–4.4: aprobadas y commiteadas.
- Baseline previo a Fase 4: `ecb1785`; apertura documental: `6be271d`.

### Auditoría acumulativa

| Sesión | Feature / resultado | Validación manual | Commit |
| --- | --- | --- | --- |
| 4.0 | Auditoría documental de apertura | Aprobada | `6be271d` |
| 4.1 | `AnexoGeneration.generateFromBiblioteca()` | Aprobada | `5cb3458` |
| 4.2 | `ListaCotejoGeneration.generateFromBiblioteca()` | Aprobada | `d695acd` |
| 4.3 | `PlaneacionGeneration.generateFromBiblioteca()` | Aprobada | `d54ca4e` |
| 4.4 | `ExamGeneration.generateFromBiblioteca()` | Aprobada | `6344374` |
| 4.5 | Auditoría formal de cierre; sin código funcional | Aprobada | `8dcba86` |

Cada feature conserva un consumidor único en `biblioteca.page.js`. Las cuatro
globals existen sin colisión; APIs/services se cargan antes de los features y
estos antes de Biblioteca. Quick create no consume `PlaneacionGeneration`; el
polling legacy no consume `ExamGeneration`. No hay definiciones duplicadas,
referencias rotas, módulos, `defer`, `async` ni dependencias circulares evidentes.

La comparación `ecb1785..6344374` confirmó solo cuatro archivos feature nuevos,
cuatro delegaciones en Biblioteca, cuatro líneas de script y documentación.
`dashboard.page.js`, `planeacion.page.js`, APIs/services compartidos, delete de
bloque, `wordExport.js`, CSS y packages son byte-idénticos al baseline. Los
diffs de cada commit confirman extracción literal con parámetros explícitos.

### Evidencia manual acumulada

- 4.1: cancelación, uno/varios anexos secuenciales, pending, preview,
  persistencia, modal, delete y tabs; `[anexos] generate:start`, `[anexos]
  generate:success`, `[anexos] delete:success` y `[aiMetrics] job:finished`.
- 4.2: cancelación, request único, `planeacion_ids`, pending, preview,
  persistencia, modal, `created:1`, `skipped:0`, delete y tabs; logs de
  `[listas-cotejo] generate:start`, `[lista-cotejo]
  lista_generada_por_id`, `[listas-cotejo] generate:success`, `[aiMetrics]
  job:finished` y `[biblioteca] delete:success`.
- 4.3: cancelación, uno/varios temas, SSE único con `stream=1`, payload,
  pending/progreso, persistencia, modal, quick create, delete y recursos;
  Gravedad/Movimiento, `success_count:2`, cero errores/skipped.
- 4.4: cancelación, job/polling/current_step/completed, 19 preguntas de siete
  tipos, contexto Gravedad/Movimiento, cero fallidas/retries, persistencia,
  modal, preview, descargas, delete y recursos.

Failed/timeout de examen no se forzaron y no bloquean el cierre. El error legacy
de schema cache de `public.ia_metrics` es preexistente; no es regresión de Fase
4 y las métricas modernas confirmaron `[aiMetrics] job:finished`.

### Validaciones técnicas y riesgos

Pasaron `node --check` en los cuatro features y `biblioteca.page.js`, Jest con 1
suite/2 pruebas y el smoke acumulativo final con 38 comprobaciones, cuatro
globals y cuatro consumidores. Un primer patrón textual del smoke confundió
`getExamGenerationUserMessage` con el namespace; al comprobar
`window.ExamGeneration` exactamente, confirmó cero consumo legacy.

Pending en memoria, reload sin reanudación, ausencia de cancelación/
`AbortController`, procesos sin timeout frontend, continuidad al navegar,
delete sin cancelación, parciales que conservan pending, polling legacy separado,
borde del poll 60 y fallo `public.ia_metrics` permanecen riesgos conocidos. No
son regresiones introducidas ni incumplimientos del objetivo de Fase 4.

### Decisión formal

**A. Cerrar Fase 4.** Los cuatro dominios previstos están separados, contratos y
consumidores permanecen intactos, las validaciones funcionales y documentales
están aprobadas y no se detectaron regresiones introducidas. La Fase 4 quedó
**Completada** en `8dcba86`. Fase 5 — Estado de Biblioteca permanece
**Pendiente** y no iniciada.

### Fase 4 — Sesión 4.5

**Validación manual documental: Aprobada explícitamente por el usuario.**

La aprobación confirmó el inventario y estado de 4.0–4.5, la evidencia manual
acumulada, los contratos y riesgos preservados, los archivos funcionales de Fase
4, la ausencia de regresiones introducidas, la decisión A y que Fase 5 continúa
pendiente y no iniciada.

## Fase 5 — Sesión 5.0: Auditoría documental de apertura

### Puerta e identidad

- Frontend: `refactor-front`, inicio en `e1991de`, working tree limpio.
- Commit correctivo posterior al cierre: `e1991de docs(refactor): finalize generation phase closure`.
- Backend solo lectura: `refactor-back`, `e08d6e4`, working tree limpio.
- La puerta confirmó Fase 4 y 4.5 completadas, validación documental aprobada,
  decisión **A. Cerrar Fase 4** y Fase 5 pendiente antes de esta auditoría.
- Nombre canónico: **Fase 5 — Estado de Biblioteca**.
- Objetivo canónico: crear un estado identificable de Biblioteca y reducir la
  dependencia de `window.explorerState`.
- Tipo: auditoría documental de apertura.
- Riesgo: alto documental; crítico si se modifica comportamiento.
- Decisión: **A. Abrir Fase 5.** La fase queda En progreso; esta sesión no la
  completa ni inicia una sesión funcional.

### Inventario resumido

| Propietario | Estado confirmado | Clasificación | Persistencia / reload |
| --- | --- | --- | --- |
| `bibliotecaState` | `conjuntos`, carga/error/búsqueda, selección/tab, cinco estados pending/progreso y cuatro modales | Biblioteca vigente, con pending de generación y cruces de Quick Create | Solo recursos terminados se reconstruyen por refetch; el estado efímero se pierde |
| `window.biblioteca` | fachada de conjuntos, selección, `pendingBatchId`, conjunto temporal, inicio/fin/refetch | Compatibilidad activa y estado mixto | No persiste |
| `window.explorerState` | jerarquía/cache, `current`, staging/Quick Create/progreso, previews, modales/generación legacy | Estado mixto: Quick Create y previews vigentes, jerarquía técnica, compatibilidad y legacy visual | Memoria; `current` tiene helper de `sessionStorage`, no hidratado en la ruta Biblioteca |
| `archivedState` | carga, filtro, búsqueda, orden, ramas y confirmación | Archivados | Efímero; datos backend refetchables |
| Registro jerárquico de Archivados | `hidden`, `scopes`, `planeaciones`, `batches` | Archivados / jerarquía técnica activa | `localStorage` |

La matriz propiedad-consumidor completa, incluyendo valores iniciales, shapes,
escritores, lectores, limpieza, DOM/API/render/delete/generación, clasificación
y fase propietaria, está en `docs/FRONTEND_MAP.md`. No existe
`window.bibliotecaState`; los features clásicos acceden al binding léxico por
orden de scripts.

### Pending, selección, tabs y modales

- `pendingPlaneacionesByBatchId` tiene múltiples escritores y shapes de item
  distintos entre Biblioteca y Quick Create; éxito completo limpia y parciales/
  errores pueden permanecer.
- `anexosGenerating` es anidado por batch/planeación; generación por lote,
  wrappers individuales/regeneración y delete escriben o limpian el mismo mapa.
- `pendingListaByBatchId` conserva items/error, espera 1500 ms en éxito y se
  pierde al reload.
- `pendingExamenByBatchId` conserva mensaje/error, no `jobId`; reload pierde
  observación y polling aunque el job backend persista.
- `pendingConjunto` y `pendingBatchId` enlazan Quick Create con Biblioteca y
  consumen indirectamente `explorerState.progress`.
- `selectedConjuntoId` y `activeTab` tienen múltiples escritores; la selección
  suele normalizarse a string, pero el fallback de delete puede conservar el ID
  crudo. Ninguno se persiste.
- Los modales de Anexos/Listas/Exámenes guardan selección, `submitting` y error;
  el de Planeaciones guarda temas/actividades. Open reemplaza el objeto, close
  solo cambia `open`, y reload limpia todo. Los renders de Anexos/Listas pueden
  depurar selección, por lo que render y estado siguen acoplados.
- Preview de examen/lista permanece en `explorerState`; preview de Anexo usa
  DOM/closures. Confirmación de delete de Biblioteca es léxica; la de
  `explorerState` pertenece al flujo jerárquico.

### Quick Create, compatibilidad y legacy

Quick Create escribe `explorerState.quickCreate`, `current`, staging,
`generating` y `progress`; usa jerarquía técnica, el service/parser SSE
compartido y `window.biblioteca` para conjuntos, selección, pending temporal y
refetch. No consume `PlaneacionGeneration`. Debe permanecer separado hasta Fase
7. El explorador visual antiguo no se inicializa en la ruta vigente, pero su
estado y listeners siguen cargados. Previews activos impiden clasificar
`window.explorerState` completo como legacy. Archivados es un flujo separado,
no legacy de Biblioteca.

### Riesgos, límites y revisión

- Riesgos confirmados: múltiples escritores, shapes variables, estado mutado
  desde render, pending perdido al reload y delete sin cancelación.
- Bug confirmado por código, no corregido: Anexos, Listas y Exámenes pueden
  conservar `submitting=true` si `requireSession()` retorna `null`.
- Riesgos posibles: mezcla String/Number de IDs y confusión futura entre
  `batchId`, `conjuntoId` y `unidadId`; no se confirmó regresión actual.
- No confirmado: consumidor de `expandedIds` aparte de su limpieza y una forma
  segura de reconstruir pending desde backend.
- Fase 5 se limita a ownership/shapes/selección/pending/modales; render/eventos
  quedan en 6, Quick Create/Dashboard en 7, Archivados y aislamiento legacy en
  8, eliminación confirmada en 9 y wrappers/globals en 10.

**Validación manual documental: Aprobada explícitamente por el usuario.** La
aprobación cubrió nombre/objetivo, inventario y matriz, pending, selección,
tabs, modales, Quick Create, compatibilidad/Archivados/legacy, riesgos, límites
entre Fases 5–10, siguiente corte propuesto, pruebas futuras, Fase 4 completada y
la decisión **A. Abrir Fase 5**. La sesión quedó commiteada en `525a21a`.

### Siguiente corte propuesto

El roadmap no define numeración para sesiones funcionales de Fase 5. Se propone
**Extracción literal del estado de selección de bloque de Biblioteca**, limitada
a `selectedConjuntoId` y sus transiciones. Riesgo alto. Archivos probables:
`js/pages/biblioteca.page.js`, un módulo de estado solo si la siguiente sesión
autoriza la convención, `pages/dashboard.html` por carga clásica y documentación.
Deja fuera `activeTab`, pending, modales, render, Quick Create,
`window.biblioteca` y `window.explorerState`. Las pruebas futuras son selección,
fallback tras delete, reload, cambio de tabs sin regresión y Quick Create sin
estado cruzado. La propuesta fue formalizada como **Sesión 5.1 — Extracción
literal del estado de selección de bloque de Biblioteca**, pero permanece
pendiente y no iniciada; debe reintentarse desde su puerta inicial.
