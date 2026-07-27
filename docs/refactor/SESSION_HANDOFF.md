# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

- Explorador visual jerárquico: obsoleto para nuevas implementaciones; no es un modo paralelo.
- Jerarquía técnica: puede seguir activa en datos, endpoints, selectores, persistencia o soporte interno.
- Archivados: flujo separado con posibles dependencias jerárquicas.
- `explorerState`: estado mixto; no puede eliminarse como bloque sin clasificar consumidores.

## Estado del roadmap

- **Última fase cerrada:** 2 — Acciones por dominio.
- **Fase actual:** 3 — Capa API frontend.
- **Estado:** En progreso.
- **Sesión 3.0:** Auditoría de capa API frontend, completada.
- **Sesión 3.1:** Consolidación de lecturas de Biblioteca, completada en código.
- **Validación manual 3.1:** pendiente.
- **Validación manual 2.1:** aprobada.
- **Validación manual 2.2:** aprobada.
- **Validación manual 2.3:** aprobada.
- **Validación manual 2.4:** aprobada.
- **Validación manual 2.5:** aprobada.
- **Decisión 2.6:** la eliminación de bloque puede extraerse literalmente.
- **Validación manual 2.7:** aprobada.
- **Validación manual acumulativa de Fase 2:** aprobada.
- **Próxima sesión seleccionada:** 3.2 — Consolidación interna de deletes de Biblioteca.

Las Fases 0, 1 y 2 están completadas. La Fase 3 permanece en progreso. La
Sesión 3.1 conserva validación manual pendiente y no autoriza el cierre de la
fase ni el inicio de generación, polling, Archivados o legacy.

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

Pendiente. No se ejecutó navegador en esta sesión automatizada. Deben
confirmarse Biblioteca, cambio de bloques/tabs, recarga, metadata de Detalle,
navegación de vuelta y regresión de previews, descargas y deletes. Generación,
Archivados y legacy no deben ejecutarse para esta validación.

### Exclusiones y hallazgos conservados

No se modificaron consumidores, deletes, autenticación, otros API files,
generación, polling, SSE, estado, render, HTML, backend, SQL, Archivados ni
legacy. Permanecen: pérdida de `payload.message` y status estructurado,
parsing incompatible entre dominios, duplicado por tema, deletes no
equivalentes, export Excel sin ruta backend, SSE/polling propios,
`planeaciones.service.js` mixto y dependencia del orden de scripts.

### Próxima sesión

**Sesión 3.2 — Consolidación interna de deletes de Biblioteca.**

No está implementada. Debe comparar primero los cinco contratos y conservar
por separado endpoints, IDs, efectos backend y formas de respuesta. Fase 3
continúa en progreso.
