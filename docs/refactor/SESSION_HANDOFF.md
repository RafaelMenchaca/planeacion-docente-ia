# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

- Explorador visual jerárquico: obsoleto para nuevas implementaciones; no es un modo paralelo.
- Jerarquía técnica: puede seguir activa en datos, endpoints, selectores, persistencia o soporte interno.
- Archivados: flujo separado con posibles dependencias jerárquicas.
- `explorerState`: estado mixto; no puede eliminarse como bloque sin clasificar consumidores.

## Estado del roadmap

- **Fase actual:** 2 — Acciones por dominio.
- **Estado:** En progreso.
- **Sesión actual:** 2.3 — Eliminación individual de lista de cotejo, completada en código.
- **Validación manual 2.1:** aprobada.
- **Validación manual 2.2:** aprobada.
- **Validación manual 2.3:** pendiente.
- **Próxima sesión recomendada:** 2.4 — Eliminación individual de anexo.

Las Fases 0 y 1 están completadas. Las sesiones 2.0, 2.1 y 2.2 están completadas; la Sesión 2.3 quedó completada en código y pendiente de validación manual. La Fase 2 permanece en progreso.

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
| Exámenes | Generar | `submitBibliotecaExamModal` | submit del modal | `POST /api/examenes/generate` | `examModal`, `pendingExamenByBatchId` y tab | Render general y recarga al completar | Logs de payload/job; error inline | Alto | Biblioteca activa |
| Exámenes | Consultar estado | bucle interno de `submitBibliotecaExamModal` | job creado por generación | `GET /api/examenes/generacion/:jobId` cada 3 s, máximo 60 intentos | `pendingExamenByBatchId` | Render general en cada paso | Logs `[polling]`; error genérico visible | Alto | Biblioteca activa |
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
| Delete de bloque | `bibEliminarBloque` | `biblioteca.page.js`, `biblioteca.api.js` | selección, tab, cuatro pending maps, render general y backend secuencial | Alto | 2.6 o auditoría específica | Sesión posterior de Fase 2 |
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
| Delete de bloque | Sesión 2.6 o auditoría específica posterior; nunca junto al primer delete individual |
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
- Validación manual y regresión: pendientes.

### Exclusiones confirmadas

No se modificaron preview, descarga, Word, generación, estado general, renderers, event delegation, APIs, backend, `exam-delete.js`, otros deletes, Archivados ni legacy. La Sesión 2.4 quedó definida, pero no implementada.

## Dependencias conocidas

- `dashboard.html` carga `dashboard.page.js`, después `biblioteca.page.js` y finalmente `main.js`.
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

2026-07-25 — Sesión 2.3: se extrajo la eliminación individual de lista de cotejo a un módulo propio; validaciones automáticas aprobadas y validación manual pendiente.
