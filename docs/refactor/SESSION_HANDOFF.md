# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

- Explorador visual jerárquico: obsoleto para nuevas implementaciones; no es un modo paralelo.
- Jerarquía técnica: puede seguir activa en datos, endpoints, selectores, persistencia o soporte interno.
- Archivados: flujo separado con posibles dependencias jerárquicas.
- `explorerState`: estado mixto; no puede eliminarse como bloque sin clasificar consumidores.

## Estado del roadmap

- **Última fase cerrada:** 9 — eliminación controlada de legacy.
- **Estado de Fase 5:** Completada mediante la auditoría de cierre 5.8.
- **Fase 9:** Completada; auditoría formal 9.4 aprobada.
- **Fase 10:** En progreso; 10.0 completada sin implementación funcional.
- **Sesión 9.0:** auditoría aprobada y commiteada en `73d52b4`; manual no requerida.
- **Sesión 9.1:** Batch retirado; manual aprobada y commit `9496303`.
- **Sesión 9.2:** aprobada manualmente y commiteada en `7cca74e`.
- **Sesión 9.3:** fallback visual retirado; manual aprobada y commit `7393909`.
- **Sesión 9.4:** auditoría formal completada y commit documental real `b6eb40e`; cierre acumulativo F9 `aa56e06`.
- **Sesión 10.0:** auditoría técnica/documental de apertura completada; manual no requerida; commit y push pendientes.
- **Siguiente acción:** revisar/commitear 10.0 cuando el usuario lo decida; 10.1 no iniciada.
- **Sesión 8.0:** auditoría completada y commiteada en `9b8ede5`.
- **Sesión 8.1:** explorer visual/navegación aislados; manual aprobada y commit `1aa1599`.
- **Sesión 8.2:** bridges preview/download trasladados a owners existentes; manual acumulada aprobada y commit `6fb39ab`.
- **Sesión 8.3:** CRUD visual aislado; manual aprobada y commit `cf48637`.
- **Sesión 8.4:** auditoría formal aprobada; cierre documental `bf97b1a`, acumulativo `378ac30` y merge `41f933e`.
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
- **Sesión 5.1:** implementación, validaciones estáticas y validación manual aprobadas; commiteada en `1b4c620`.
- **Sesión 5.2:** implementación, validaciones estáticas y validación manual aprobadas; commiteada en `f5bbfdd`.
- **Sesión 5.3:** implementación, validaciones estáticas y validación manual aprobadas; commiteada en `f05e730`.
- **Sesión 5.4:** implementación, validaciones estáticas y validación manual aprobadas; commiteada en `948d627`.
- **Sesión 5.5:** implementación, validaciones estáticas y validación manual aprobadas; commiteada en `3842f20`.
- **Sesión 5.6:** implementación, validaciones estáticas y validación manual aprobadas; commiteada en `d45a493`.
- **Sesión 5.7:** cuatro pending encapsulados mediante superficies específicas; implementación y validaciones aprobadas; commiteada en `9b3c23d`.
- **Sesión 5.8:** auditoría formal de cierre completada y aprobada; sin cambios funcionales.
- **Decisión formal:** A. Fase 5 puede cerrarse.
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
- **Sesión 6.0:** auditoría técnica/documental completada y commiteada en `e27cb0a`; sin implementación funcional ni validación manual requerida.
- **Sesión 6.1:** render no modal extraído, validado manualmente y commiteado en `cef834e`.
- **Sesión 6.2:** renders modales/confirmación extraídos, manual aprobada y commit `ef3364f`.
- **Sesión 6.3:** handlers, delegación y search wiring extraídos; manual aprobada y commit `4306903`.
- **Sesión 6.4:** auditoría formal aprobada; Fase 6 completada, sin implementación funcional ni manual adicional.
- **Sesión 7.0:** auditoría técnica/documental de apertura completada; sin implementación funcional ni manual requerida.
- **Commit real de 7.0:** `7c75738`.
- **Sesión 7.1:** extracción consolidada de Quick Create validada manualmente y commiteada en `97b798c`.
- **Sesión 7.2:** ownership de loader/reconcile validado manualmente y commiteado en `a6840a4`.
- **Sesión 7.3:** bootstrap y bindings Dashboard validados manualmente y commiteados en `bcd361e`.
- **Sesión 7.4:** auditoría formal aprobada; Fase 7 completada, sin implementación funcional ni manual adicional.

Las Fases 0, 1, 2, 3 y 4 están completadas. Las validaciones manuales 3.1, 3.2,
3.4, 3.6 y 3.8 están aprobadas. En Fase 4, anexos, listas, planeaciones y
exámenes quedaron validados; la auditoría 4.5, su validación documental y la
decisión formal de cierre también fueron aprobadas. La puerta de la Sesión 5.0
pasó y Fase 5 quedó En progreso; la Sesión 5.1 completó y validó después el
primer corte funcional en `1b4c620`. La Sesión 5.2 implementó el ownership
léxico de `activeTab`; implementación, validaciones estáticas y validación manual
están aprobadas y commiteadas en `f5bbfdd`. La Sesión 5.3 quedó aprobada y
commiteada en `f05e730`. La Sesión 5.4 quedó aprobada y commiteada en
`948d627`. La Sesión 5.5 tiene implementación y validaciones estáticas
aprobadas; su validación manual también quedó aprobada y la sesión fue
commiteada en `3842f20`. La Sesión 5.6 quedó aprobada y commiteada en
`d45a493`. La Sesión 5.7 quedó aprobada y commiteada en `9b3c23d`. La Sesión
5.8 completó y aprobó la auditoría formal; Fase 5 está completada. La Sesión
6.0 abrió documentalmente Fase 6 y quedó commiteada en `e27cb0a`. 6.1 extrajo
el render no modal, fue validada manualmente y quedó commiteada en `cef834e`.
6.2 extrajo DOM/render y wiring local de overlays, fue validada manualmente y
commiteada en `ef3364f`. 6.3 extrajo el wiring estructural, fue validada y quedó
commiteada en `4306903`. 6.4 aprobó el cierre formal y el commit acumulativo de
Fase 6 es `295d7ed`. Fase 7 abrió con 7.0, completó sus tres cortes en
`97b798c`, `a6840a4` y `bcd361e`, y cerró mediante la auditoría 7.4. Fase 8
permanece pendiente/no iniciada.

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

Dependencias consumidas al invocarse: los bindings léxicos
`BibliotecaSelection`, `bibliotecaState`, `normalizeBibliotecaId`,
`findConjuntoById`, `showBibConfirm`, `renderBibliotecaContent` y
`loadAndRenderBiblioteca`, además de `window.requireSession` y
`apiBibliotecaDeleteBloque`. Expone `window.BibliotecaBlockDelete`;
`bibEliminarBloque` permanece global por script clásico como wrapper. La carga
vigente requiere `biblioteca.api.js` antes de `biblioteca-block-delete.js`, y
este módulo antes de `dashboard.page.js`, `biblioteca.page.js` y `main.js`; los
bindings de Biblioteca están definidos antes de que el usuario pueda invocar
el handler.

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

## Fase 5 — Sesión 5.1: Extracción literal del estado de selección de bloque de Biblioteca

### Puerta, decisión y corte

- Frontend: `refactor-front`, inicio real en `872fdf0`, working tree limpio.
- Apertura de Fase 5: `525a21a`; corrección/aprobación documental de 5.0:
  `872fdf0 docs(refactor): finalize Biblioteca state phase opening`.
- Backend solo lectura: `refactor-back`, `e08d6e4`, working tree limpio.
- Riesgo: alto.
- Decisión: **A. Extracción segura implementada.**

La búsqueda global confirmó una definición y todos los accesos directos. El
valor inicial continúa siendo `null` y la única fuente física continúa en
`bibliotecaState.selectedConjuntoId`. La nueva superficie léxica
`BibliotecaSelection` solo delega `getSelectedConjuntoId()` y
`setSelectedConjuntoId(value)` sobre esa propiedad; no crea global, copia,
archivo o script.

### Escritores, lectores y comportamiento preservado

Los escritores delegados son: `window.biblioteca.setPendingConjunto`,
`setSelectedConjunto`, `applyOptimisticPlaneacionesToConjunto`,
`finishBibliotecaPlaneacionesGeneration`, reconciliación/target/fallback de
`loadAndRenderBiblioteca` y el fallback de
`BibliotecaBlockDelete.deleteFromBiblioteca`. Los lectores delegados son:
`getSelectedConjunto`, comparación del conjunto temporal, sidebar, actualización
de selección activa, snapshots/validación del loader y comparación del delete.

No cambió ninguna expresión asignada. `setSelectedConjunto` sigue usando
`normalizeBibliotecaId` (`String`, sin trim) y rechaza `null`, `undefined` o
cadena vacía. El delete sigue asignando el ID crudo del primer conjunto o
`null`. Load/refetch conservan selección válida, objetivo o selección previa y,
si ya no existe, usan el primer conjunto o `null`. Quick Create sigue entrando
solo por `window.biblioteca`; los modales y coordinadores reciben IDs desde sus
handlers/datasets y no leen directamente la propiedad. Reload/navegación no
persisten selección y el backend solo permite reconstruir conjuntos/recursos.
`activeTab`, pending, render, eventos, mensajes, `window.explorerState` y orden
de scripts permanecen fuera de alcance.

### Riesgos preservados

- El fallback de delete puede mantener un ID Number mientras las demás rutas
  suelen normalizar a String.
- Selección y tabs siguen siendo efímeros y se pierden con reload/navegación.
- Continúan varios sitios de transición, ahora delegados, y la interacción con
  Quick Create por la fachada vigente.
- No se corrigieron pending perdido, delete sin cancelación, submitting
  atascado, `expandedIds` sin consumidor confirmado ni deuda documental ajena.

### Validaciones estáticas de 5.1

- `node --check` aprobó `biblioteca.page.js` y
  `biblioteca-block-delete.js`.
- Jest aprobó 1 suite y 2 pruebas.
- El smoke técnico aprobó 13 comprobaciones de selección, fallback, delete y
  fachada de Quick Create.
- La reversión mecánica de las delegaciones reprodujo byte por byte ambos
  archivos de `HEAD`, confirmando equivalencia literal del corte.

### Validación manual de 5.1

**Validación manual: Aprobada explícitamente por el usuario.**

| Prueba | Resultado a confirmar | Estado |
| --- | --- | --- |
| 1. Selección básica | sidebar y contenido siguen el mismo bloque al alternar y volver | Aprobada |
| 2. Tabs por bloque | recursos y selección no se cruzan; `activeTab` conserva su comportamiento | Aprobada |
| 3. Reload | aplica el fallback previo y no intenta persistir/restaurar selección | Aprobada |
| 4. Refetch | conserva la selección válida sin salto inesperado | Aprobada |
| 5. Creación de recurso | recurso y selección permanecen en el batch correcto | Aprobada |
| 6. Quick Create | navegación/fachada vigentes, bloque correcto y persistencia backend tras reload | Aprobada |
| 7. Delete de otro bloque | el bloque seleccionado permanece y el reload es coherente | Aprobada |
| 8. Delete del seleccionado | usa exactamente el fallback previo y elimina referencias visuales | Aprobada |
| 9. Último bloque, solo si es seguro | no existe confirmación explícita de ejecución | No ejecutada o no confirmada explícitamente; no bloquea |
| 10. Modales | al cambiar de bloque, el mismo modal recibe el bloque nuevo | Aprobada |
| 11. Regresión acumulativa | Planeaciones, Anexos, Listas, Exámenes, previews, descargas, tabs, delete y Quick Create sin errores nuevos | Aprobada |

La aprobación confirmó selección y coherencia sidebar/contenido, tabs sin cruce,
reload y refetch, creación en el bloque correcto, Quick Create mediante
`window.biblioteca`, modales, deletes individuales y de bloque, fallback vigente
y regresión acumulativa sin errores nuevos. Evidencia registrada:
`[examenes] delete:success`, `[listas-cotejo] delete:success`,
`[anexos] delete:success`, `[planeaciones] delete:start/success`,
`[biblioteca] delete:start/success` y `deletedBatch:true`. No se añadieron IDs.
La prueba de último bloque no consta ejecutada o confirmada explícitamente y no
bloquea la aprobación.

### Siguiente corte sugerido

**Sesión 5.2 — Extracción literal del ownership de `activeTab` en Biblioteca**
quedó implementada a continuación sin mezclar pending, modales, render, Quick
Create o `explorerState`.

## Fase 5 — Sesión 5.2: Extracción literal del ownership de `activeTab` en Biblioteca

### Puerta, decisión y fuente de verdad

- Frontend: `refactor-front`, inicio real en `23c5355`, working tree limpio.
- Sesión 5.0: `525a21a`; corrección de apertura: `872fdf0`.
- Sesión 5.1: `1b4c620`; corrección/aprobación documental: `23c5355`.
- Sesión 5.2: implementación y validaciones aprobadas; commit `f5bbfdd`.
- Backend solo lectura: `refactor-back`, `e08d6e4`, limpio.
- Riesgo: alto.
- Decisión: **A. Extracción segura implementada.**

La única fuente física sigue siendo el objeto inicial `{}` de
`bibliotecaState.activeTab`. `BibliotecaTabs` es una superficie léxica, no un
segundo mapa, y delega exclusivamente lectura, asignación y `delete`. No
normaliza claves, valida tabs ni aplica fallback.

### Comportamiento y consumidores preservados

Las claves son IDs de bloque/conjunto; JavaScript conserva su coerción normal a
propiedad de objeto. Los valores observados son `planeaciones`, `anexos`,
`listas` y `examenes`; cualquier valor truthy desconocido sigue almacenándose
sin validación y produciría el mismo render vacío/no activo previo. Ausencia o
valor falsy conserva el fallback `planeaciones` donde ya existía.

Al seleccionar un bloque sin tab explícito se crea `planeaciones` solo si no
hay entrada; al volver, se conserva el tab previo. Reload crea un mapa nuevo y
el loader aplica el fallback vigente. Refetch sin target conserva la entrada;
con target escribe `options.activeTab || "planeaciones"`. Quick Create fija
`planeaciones` para bloque existente o temporal, transfiere el tab temporal al
batch reconciliado y vuelve a `planeaciones` al finalizar.

Planeaciones, Anexos, Listas y Exámenes continúan activando sus tabs mediante
`setSelectedConjunto` y/o la opción del loader en los mismos momentos. Los
deletes individuales conservan el tab de su dominio. Delete de bloque limpia
siempre la entrada del batch eliminado después del fallback de selección y
antes de pending/render/refetch; otro bloque conserva su entrada. Si el nuevo
seleccionado ya tenía tab, se conserva; si no, render usa `planeaciones`.

Lectores directos delegados: `renderBibliotecaTabs`,
`renderBibliotecaTabContent`, fallback de `setSelectedConjunto`, snapshot de
reconciliación y fallback del loader. Escritores/cleanups delegados: fachada de
conjunto temporal, selección, optimista/finalización de planeaciones,
reconciliación, target/fallback del loader y delete de bloque. Legacy no consume
el mapa directamente; Quick Create solo lo alcanza mediante `window.biblioteca`.

### Validaciones estáticas de 5.2

- `node --check` aprobó `biblioteca.page.js` y
  `biblioteca-block-delete.js`.
- Jest aprobó 1 suite y 2 pruebas.
- El smoke técnico aprobó 16 comprobaciones del mapa, fallbacks, claves,
  valores, generación, deletes y fachada Quick Create.
- La reversión mecánica de cada delegación reprodujo byte por byte ambos
  JavaScript de `HEAD`.

### Riesgos preservados

- El mapa y sus tabs se pierden en reload/navegación y no son reconstruibles
  desde backend.
- Existen múltiples transiciones y claves String/Number coercionadas.
- Un tab truthy desconocido no se valida y deja contenido/clase activa vacíos.
- Delete no cancela procesos; pending y submitting permanecen fuera de alcance.
- `BibliotecaSelection`, selección, render, eventos, coordinadores, Quick
  Create, `window.biblioteca` y `window.explorerState` no se modificaron.

### Validación manual de 5.2

**Validación manual: Aprobada explícitamente por el usuario.**

| Prueba | Resultado a confirmar | Estado |
| --- | --- | --- |
| 1. Tab inicial | tab y contenido iniciales coinciden; consola limpia | Aprobada |
| 2. Cambio de tab | cuatro tabs, contenido y clase activa correctos | Aprobada |
| 3. Tabs por bloque | comportamiento previo por bloque y sin recursos cruzados | Aprobada |
| 4. Reload | fallback previo, sin persistencia nueva | Aprobada |
| 5. Refetch | tab resultante conserva el comportamiento previo | Aprobada |
| 6. Generación de planeación | activa Planeaciones en el mismo momento, con pending correcto | Aprobada |
| 7. Generación de anexo | activa Anexos sin cambiar de bloque | Aprobada |
| 8. Generación de lista | activa Listas sin cruzar bloques | Aprobada |
| 9. Generación de examen | activa Exámenes durante pending/polling y al terminar | Aprobada |
| 10. Delete individual | conserva tab, refetch y contenido | Aprobada |
| 11. Delete de otro bloque | selección, tab y contenido del bloque actual permanecen | Aprobada |
| 12. Delete del seleccionado | selección y tab fallback coherentes; reload correcto | Aprobada |
| 13. Último bloque, solo si es seguro | mapa/estado vacío y nuevo bloque con tab inicial; si no, registrar no ejecutada | No ejecutada o no confirmada explícitamente; no bloquea |
| 14. Quick Create | navega al batch real, activa el tab previo y conserva fachada | Aprobada |
| 15. Regresión acumulativa | selección, cuatro dominios, previews, descargas, delete y Quick Create sin errores | Aprobada |

La aprobación confirmó tab inicial y contenido, cambio entre los cuatro tabs,
tabs independientes por bloque, reload con fallback vigente y sin persistencia,
refetch estable, activación correcta durante generación, examen con polling,
deletes individual/de otro bloque/del bloque seleccionado, Quick Create,
regresión acumulativa y ausencia de errores nuevos.

Prueba de último bloque: no ejecutada o no confirmada explícitamente; no
bloquea.

### Siguiente paso

La Sesión 5.3 quedó ejecutada a continuación.

## Fase 5 — Sesión 5.3: Extracción literal del estado del modal de generación de anexos de Biblioteca

### Puerta, decisión y fuente de verdad

- Frontend: `refactor-front`, inicio real en `88844a8`, working tree limpio.
- Sesión 5.0: `525a21a`; corrección de apertura: `872fdf0`.
- Sesión 5.1: `1b4c620`; cierre documental: `23c5355`.
- Sesión 5.2: `f5bbfdd`; cierre documental: `88844a8`.
- Backend solo lectura: `refactor-back`, `e08d6e4`, limpio.
- Riesgo: alto.
- Decisión: **A. Extracción segura implementada.**

La búsqueda global confirmó una definición y todos los accesos directos de
`bibliotecaState.anexoModal`. Su shape inicial permanece exactamente
`{open:false, conjuntoId:null, planeaciones:[], selectedPlaneacionIds:[],
submitting:false, error:""}`. `BibliotecaAnexoModalState` es una superficie
léxica dentro de `biblioteca.page.js`; no crea un segundo objeto ni se publica
en `window`. Sus operaciones `getState`, `open`, `close`,
`setSelectedPlaneacionIds`, `addSelectedPlaneacionId`, `setSubmitting` y
`setError` delegan directamente sobre la única propiedad física.

### Ciclo y consumidores preservados

La apertura recibe el conjunto del dataset/handler vigente, copia la misma
referencia de `planeaciones`, reemplaza todo el estado con selección vacía,
muestra el modal y renderiza. Cierre, cancelación y backdrop solo cambian
`open=false` y el DOM. Reabrir reemplaza nuevamente el objeto; cambiar de bloque
elimina la selección anterior. No existe persistencia del modal.

El render conserva la exclusión de planeaciones con anexo o pending, la
normalización por `String`, los badges/mensajes y la depuración que muta
`selectedPlaneacionIds`. Los checkboxes conservan `push`/`filter` y IDs de
dataset. Submit conserva normalización, deduplicación, mensaje vacío,
`submitting=true`, limpieza de error, orden de `requireSession()` y snapshot.
La sesión nula puede seguir dejando `submitting` atascado; el catch conserva su
reset y mensaje. No se corrigió.

`AnexoGeneration` sigue recibiendo `{conjuntoId, selectedIds, planeaciones,
accessToken}` y conserva pending, cierre, tab Anexos, secuencia, parciales,
errores, actualización optimista y refetch. No lee el modal directamente.
`anexosGenerating`, regeneración, delete individual/de bloque, selección,
`BibliotecaTabs`, otros modales, Quick Create, Dashboard, `window.biblioteca`,
`window.explorerState`, Archivados y legacy quedaron intactos. Planeaciones y
anexos persistidos se reconstruyen por refetch; open/selección/submitting/error
no son reconstruibles.

### Validaciones estáticas de 5.3

- `node --check js/pages/biblioteca.page.js`: aprobado.
- Jest: 1 suite y 2 pruebas aprobadas.
- Smoke aislado: 27 comprobaciones de estado inicial, apertura/cierre/reapertura,
  selección, depuración, submitting/error, cancelación, cambio de bloque, sin
  planeaciones, planeación cubierta y delegación.
- Reversión mecánica: al sustituir solo las delegaciones de 5.3, el archivo
  reconstruye `HEAD` byte por byte.
- Búsqueda global: una fuente física, una superficie léxica, cero consumidores
  desconocidos y ningún global/script nuevo.

### Riesgos preservados

Render sigue mutando selección; una sesión nula puede dejar `submitting=true`;
el estado se pierde con reload/navegación; close conserva el resto del objeto;
IDs String/Number y múltiples puntos de transición no se reinterpretan; delete
no cancela generación; pending tiene ownership separado. No son correcciones de
5.3.

### Validación manual de 5.3

**Validación manual: Aprobada explícitamente por el usuario.** Se confirmaron
apertura con las planeaciones correctas; selección/deselección y reapertura;
cancelación sin POST ni pending; cambio de bloque sin estado cruzado; planeación
con anexo existente; generación individual y múltiple secuencial; pending en las
cards correctas; reutilización sin `submitting` bloqueado; delete y reapertura;
reload/navegación; otros modales intactos; regresión acumulativa y ausencia de
errores nuevos.

Evidencia real resumida: `[anexos] generate:success` para las planeaciones 359,
360 y 361, además de `[anexos] delete:success`. No se registraron tokens,
sesiones, UUIDs completos ni datos personales. El escenario sin planeaciones
elegibles no fue confirmado explícitamente y el error/resultado parcial no
ocurrió de forma natural; ambos quedan no ejecutados y no bloquean.

Los riesgos documentados permanecen: render muta `selectedPlaneacionIds`;
sesión nula puede dejar `submitting=true`; el objeto cerrado puede conservarlo
hasta reapertura; estado perdido tras reload/navegación; IDs String/Number;
delete sin cancelación; y ownership separado de `anexosGenerating`.

### Siguiente corte propuesto

La Sesión 5.4 quedó ejecutada a continuación.

## Fase 5 — Sesión 5.4: Extracción literal del estado del modal de generación de listas de cotejo

### Puerta, auditoría y decisión

- Frontend: `refactor-front`, inicio real en `f05e730`, working tree limpio.
- Commit funcional real de 5.3: `f05e730`; su estado “commit pendiente” fue
  reconciliado documentalmente sin detener la sesión.
- Backend solo lectura: `refactor-back`, `e08d6e4`, limpio.
- Riesgo: alto.
- Decisión: **A. Extracción segura implementada.**

La búsqueda global confirmó una sola definición física y todos los accesos
directos de `bibliotecaState.listaModal`. El valor inicial exacto permanece
`{open:false, conjuntoId:null, planeaciones:[], selectedPlaneacionIds:[],
submitting:false, error:""}`. `BibliotecaListaModalState` es una superficie
léxica en `biblioteca.page.js`; sus operaciones `getState`, `open`, `close`,
`setSelectedPlaneacionIds`, `addSelectedPlaneacionId`, `setSubmitting` y
`setError` delegan sobre esa misma propiedad. No existe segunda copia, global,
archivo o script.

### Ciclo y consumidores preservados

El handler `data-bib-action="generar-lista"` busca el conjunto vigente. Abrir
reemplaza todo el estado con su referencia de `planeaciones` y selección vacía,
muestra el modal, bloquea scroll y renderiza, en ese orden. Cierre, cancelación
y backdrop solo cambian `open=false`, ocultan el DOM y liberan scroll; reabrir o
cambiar de bloque reemplaza el objeto.

El render conserva la exclusión de planeaciones que ya tienen lista mediante
`planeacion_id`, la normalización de IDs, los checkboxes deshabilitados, los
mensajes y la depuración que muta `selectedPlaneacionIds`. Los checkboxes
mantienen `push`/`filter`. Submit conserva filtrado, normalización,
deduplicación, mensaje de selección vacía, `submitting=true`, limpieza de error,
render previo a `requireSession()` y el snapshot.

`ListaCotejoGeneration` sigue recibiendo `{conjuntoId, selectedIds,
planeaciones, accessToken}` una sola vez. Conserva cierre, activación del tab
Listas, `pendingListaByBatchId`, POST único `{planeacion_ids:selectedIds}`,
resultado `created/skipped`, espera de 1500 ms, cleanup, refetch y error
persistente. No lee el modal directamente. Delete individual muta/refetchea los
datos; delete de bloque limpia pending pero no el modal ni cancela procesos.
Reload/navegación pierden el estado efímero; listas y planeaciones persistidas se
reconstruyen desde backend.

Selección, `BibliotecaTabs`, `BibliotecaAnexoModalState`, otros modales, Quick
Create, Dashboard, `window.biblioteca`, `window.explorerState`, Archivados,
legacy, API y backend quedaron intactos. Render visual, DOM, listeners y event
delegation siguen perteneciendo a Fase 6.

### Validaciones estáticas de 5.4

- `node --check js/pages/biblioteca.page.js`: aprobado.
- Jest: 1 suite y 2 pruebas aprobadas.
- Smoke aislado: estado inicial, apertura/cierre/reapertura, selección,
  depuración, submitting/error, cancelación, cambio de bloque, sin planeaciones,
  lista existente y delegación aprobados.
- Reversión mecánica: al revertir solo las delegaciones de 5.4,
  `biblioteca.page.js` reconstruye `HEAD` byte por byte.
- Búsqueda posterior: una fuente física, una superficie léxica, sin consumidor
  desconocido ni global/script nuevo.

### Riesgos preservados

Render muta selección; `requireSession()` nulo puede dejar `submitting=true`;
close conserva el resto del objeto; estado perdido tras reload/navegación; IDs
String/Number; delete no cancela generación; error de pending persiste; cleanup
de éxito espera 1500 ms; `pendingListaByBatchId` conserva ownership separado.
No se corrigió ninguno.

### Validación manual de 5.4

**Aprobada explícitamente por el usuario.** Se confirmaron apertura y
planeaciones correctas; selección/deselección, cierre/reapertura, cancelación
sin request ni pending, cambio de bloque sin cruce, planeación con lista
existente, generación individual y múltiple, pending/cleanup correctos,
reutilización sin `submitting` bloqueado, delete/reapertura,
reload/navegación, modal de anexos y otros modales intactos, regresión
acumulativa y ausencia de errores nuevos.

Evidencia resumida: `[listas-cotejo] generate:start` con
`planeacionesCount:1`, `[lista-cotejo] lista_generada_por_id` y
`[listas-cotejo] generate:success` con `created:1`, `skipped:0`. La regresión
acumulativa confirmó además generación de anexos, examen con polling/reintentos/
fallback, generación de planeaciones y deletes de planeación y bloque.

El fallo externo al guardar métricas porque `public.ia_metrics` no aparece en
el schema cache permanece fuera de alcance; no fue causado ni corregido por
5.4. Los riesgos del modal documentados arriba permanecen preservados.

**Estado final:** implementación, validaciones estáticas y validación manual
aprobadas; commit `948d627`. Fase 5 continúa En progreso.

### Siguiente corte propuesto

La Sesión 5.5 quedó ejecutada a continuación.

## Fase 5 — Sesión 5.5: Extracción literal del estado del modal de generación de exámenes

### Puerta, auditoría y decisión

- Frontend: `refactor-front`, inicio real en `948d627`, working tree limpio.
- Commit funcional real de 5.4: `948d627`; su estado “commit pendiente” fue
  reconciliado documentalmente sin detener la sesión.
- Backend solo lectura: `refactor-back`, `e08d6e4`, limpio.
- Riesgo: muy alto.
- Decisión: **A. Extracción segura implementada.**

La búsqueda global confirmó una sola definición física y todos los accesos
directos de `bibliotecaState.examModal`. El valor inicial exacto permanece
`{open:false, conjuntoId:null, unidadId:null, planeaciones:[],
selectedPlaneacionIds:[], selectedTypes:[], questionCounts:{},
submitting:false, error:""}`. `BibliotecaExamModalState` es una superficie
léxica en `biblioteca.page.js`; sus operaciones `getState`, `open`, `close`,
`setSelectedTypes`, `addSelectedType`, `setQuestionCount`,
`setSelectedPlaneacionIds`, `addSelectedPlaneacionId`, `setSubmitting` y
`setError` delegan sobre esa misma propiedad. No existe segunda copia, global,
archivo o script.

### Ciclo, snapshot y consumidores preservados

`data-bib-action="generar-examen"` resuelve el conjunto vigente. Abrir reemplaza
el objeto con `conjunto.id`, `conjunto.unidad_id || null`, su referencia de
planeaciones, selección/tipos vacíos y cantidades vacías; luego muestra el
modal, bloquea scroll y renderiza. Cierre, cancelación y backdrop solo cambian
`open=false`, ocultan el DOM y liberan scroll. Reabrir o cambiar de bloque
reemplaza el objeto.

Los checkboxes de planeaciones conservan IDs string y `push`/`filter`, sin
depuración desde render. Los tipos internos y defaults permanecen:
`opcion_multiple:5`, `verdadero_falso:5`, `respuesta_corta:3`,
`emparejamiento:1`, `pregunta_abierta:1`, `calculo_numerico:3` y
`ordenacion_jerarquizacion:1`. Ninguno inicia seleccionado. Desactivar conserva
la cantidad; el input conserva `min=1`, `max=30`, aunque el listener solo acepta
enteros mayores a cero. El modal no calcula ni muestra un total propio.

Submit conserva el orden y mensajes exactos: unidad vinculada, al menos un tipo
y al menos una planeación; después fija `submitting=true`, limpia error,
renderiza y solicita sesión. Construye `cantidades_pregunta` solo para tipos
seleccionados, con el fallback vigente `|| 5`, y entrega una vez a
`ExamGeneration.generateFromBiblioteca` el payload
`{unidad_id,batch_id,tipos_pregunta,cantidades_pregunta,planeacion_ids}` junto
con token y `conjuntoId`. Biblioteca no envía `tema_ids`; backend conserva el
mapeo planeación → tema y la unidad protegida.

`ExamGeneration` continúa creando el job por POST, cerrando el modal, activando
Exámenes, creando `pendingExamenByBatchId` e iniciando el polling de 3000 ms con
máximo 60 consultas. `current_step`, `completed`, `failed`, timeout, cleanup,
refetch, mensajes y logs no cambiaron. Delete individual y de bloque, preview,
selección, tabs, modales anteriores, Quick Create, Dashboard,
`window.biblioteca`, `window.explorerState`, Archivados, legacy, scripts, API y
backend quedaron intactos. El `explorerState.examModal` legacy es un estado
distinto, no un consumidor del modal vigente.

### Validaciones estáticas de 5.5

- `node --check js/pages/biblioteca.page.js`: aprobado.
- Jest: 1 suite y 2 pruebas aprobadas.
- Smoke aislado: 19 comprobaciones de shape, tipos/defaults, apertura, cierre,
  reapertura, selección, cantidades, validaciones, submitting, payload y
  delegación aprobadas.
- Búsqueda posterior: una fuente física, una superficie léxica, sin consumidor
  desconocido ni global/script nuevo.
- Comparación mecánica contra `HEAD`: delegaciones reversibles sin cambio
  funcional intencional.

### Riesgos preservados

`requireSession()` nulo puede dejar `submitting=true`; cierre conserva el resto
del objeto; estado y observación del job se pierden con reload/navegación; IDs
String/Number; el handler no aplica el `max=30`; tipos/cantidades desactivados se
conservan; delete no cancela jobs; failed/timeout dejan pending; polling no se
reanuda y el poll 60 puede clasificar un completed limítrofe como timeout.
`pendingExamenByBatchId`, polling, deduplicación, reintentos y el fallo externo
de `public.ia_metrics` mantienen ownership y comportamiento separados. No se
corrigió ninguno.

### Validación manual de 5.5

**Aprobada explícitamente por el usuario.** La Sesión 5.5 quedó aprobada
funcionalmente: apertura con bloque, unidad y planeaciones correctos;
selección/tipos/cantidades y reapertura; cancelación sin request, job ni
pending; cambio de bloque sin estado cruzado; generación mínima y con varias
planeaciones; distribución por tipos; pending, job, polling y persistencia tras
reload; reutilización; delete/reapertura; modales anteriores, modal de
planeaciones y regresión acumulativa intactos, sin errores nuevos.

Evidencia resumida: dos planeaciones (`690`, `691`); tipos
`opcion_multiple:5`, `verdadero_falso:5`, `emparejamiento:1` y
`ordenacion_jerarquizacion:1`; `totalRequested:12`; contexto correcto para
“Python orientado a objetos” y “javascript para desarrollo web”; resultado de
12 preguntas, cero fallidas, cero retries, `exam:saved` y `generate:success`.
No se registraron UUIDs completos, user IDs, tokens ni datos personales.

Contrato preservado: Biblioteca envía `unidad_id`, `batch_id`,
`planeacion_ids`, `tipos_pregunta` y `cantidades_pregunta`; Biblioteca no envía
`tema_ids`; backend continúa resolviendo los temas desde `planeacion_ids`.

Reintentos/fallback no se ejecutaron en esta corrida porque no ocurrieron de
forma natural; su comportamiento ya había sido validado previamente y no
bloquea. Job failed, timeout, backend caído, credenciales inválidas, ausencia
de planeaciones/tipos y error parcial tampoco se forzaron y no bloquean.

**Estado final:** implementación, validaciones estáticas y validación manual
aprobadas; contrato de exámenes preservado; commit `3842f20`.
Fase 5 continúa En progreso.

### Siguiente corte propuesto

La Sesión 5.6 quedó ejecutada a continuación.

## Fase 5 — Sesión 5.6: Estado del modal de Planeaciones + auditoría de cierre de estados modales

### Puerta y decisión

- Frontend: `refactor-front`, inicio real en `3842f20`, working tree limpio.
- 5.5 quedó reconciliada como aprobada y commiteada en `3842f20`.
- Backend solo lectura: `refactor-back`, `e08d6e4`, limpio.
- Riesgo: alto.
- Decisión: **A. Extracción segura implementada.**

La búsqueda global confirmó una sola fuente física para el modal vigente de
Planeaciones: `bibliotecaState.agregarModal`. Todos sus accesos directos se
encontraban en `biblioteca.page.js`; `PlaneacionGeneration` recibe un snapshot
y no lee el modal. Quick Create usa `explorerState.quickCreate`, staging y la
fachada `window.biblioteca`, no consume `agregarModal`.

### Shape, ciclo y transiciones

El valor inicial exacto permanece `{open:false, conjuntoId:null,
unidadId:null, materia:"", nivel:"", unidad:null, temas:[], error:""}`. No
existe propiedad `submitting`. Cada tema conserva `{localId,titulo,duracion,
actividades_momentos}`.

- `data-bib-action="agregar-planeacion"` resuelve el conjunto mediante
  `findConjuntoById`; sin `unidad_id` muestra el alert previo y no abre.
- Abrir reemplaza todo el estado con bloque/unidad/contexto y temas vacíos;
  muestra el modal, bloquea scroll y renderiza, en ese orden.
- Cerrar, cancelar y backdrop solo cambian `open=false`, ocultan el DOM y
  liberan scroll. Reabrir o cambiar de bloque reemplaza el objeto.
- Alta usa `#bib-agr-titulo` y `#bib-agr-duracion`, default 50, mínimo efectivo
  10 y `localId` temporal; el `max=300` visual no se impone en el handler.
- Baja usa `data-bib-agr-remove`. Actividades usan
  `data-bib-agr-actividad`, `data-local-id` y `data-momento` para
  `conocimientos_previos`, `desarrollo` y `cierre`.
- Render, alta y submit capturan/mutan `actividades_momentos`; la extracción
  conserva esas mutaciones y las deja para Fase 6.
- Validaciones exactas: título vacío solo enfoca; duración inválida muestra
  `La duracion minima es 10 minutos.`; submit vacío muestra
  `Agrega al menos un tema.`.

`BibliotecaPlaneacionModalState` es una superficie léxica privada con
`getState`, `open`, `close`, `setTemas`, `getTemaByLocalId`, `addTema` y
`setError`. Todas operan directamente sobre `bibliotecaState.agregarModal`; no
existe copia, global, archivo o persistencia nueva.

### Snapshot, generación y Quick Create preservados

Submit captura selects pendientes y construye `temasSnap` con
`{titulo,duracion,actividades_momentos,orden,generar_imagenes_en:[]}`. Delega
una vez a `PlaneacionGeneration.generateFromBiblioteca({conjuntoId,unidadId,
materia,nivel,temasSnap})`.

El coordinador permanece intacto: cierra inmediatamente, activa Planeaciones,
crea `pendingPlaneacionesByBatchId[conjuntoId]`, renderiza y llama
`generarPlaneacionesUnidadConProgreso`. El body sigue siendo
`{temas,materia,nivel,batch_id:conjuntoId}`. La API usa
`POST /api/unidades/:unidadId/generar?stream=1`, Bearer, SSE manual y fallback
JSON en error HTTP 5xx. Eventos `item_started`, `item_completed`, `item_error`,
`item_skipped` y `done`, resultados, conteos, cleanup, selección y refetch no
cambiaron. `duplicate_tema` sigue produciendo skipped.

El modal no usa `force_new_batch`; reutiliza el batch mediante `batch_id`.
Quick Create permanece separado y puede enviar `force_new_batch:true`/`mode:
"create"` solo al crear un bloque nuevo. `requireSession()` se ejecuta dentro
del service; si devuelve null no hay `submitting` modal que limpiar y se
conserva el comportamiento previo del coordinador con resultado nulo.

### Auditoría acumulativa de cierre de modales

| Modal | Fuente / superficie | Shape y selección | Open / close | Submitting / error | Generador | Pending / tab | Persistencia y riesgos | Estado manual |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Planeaciones | `bibliotecaState.agregarModal` / `BibliotecaPlaneacionModalState` | bloque, unidad, contexto, temas y actividades por momento | open reemplaza; close solo cambia `open`; reopen reconstruye | No aplica / `error` string | `PlaneacionGeneration` | `pendingPlaneacionesByBatchId` / Planeaciones | Ninguna; render muta actividades, sesión nula y estado efímero | Aprobada 5.6 |
| Anexos | `bibliotecaState.anexoModal` / `BibliotecaAnexoModalState` | bloque, planeaciones y `selectedPlaneacionIds` | open reemplaza; close parcial; reopen reconstruye | boolean / `error` string | `AnexoGeneration` | `anexosGenerating` / Anexos | Ninguna; render muta selección, sesión nula y estado efímero | Aprobada 5.3 |
| Listas | `bibliotecaState.listaModal` / `BibliotecaListaModalState` | bloque, planeaciones y `selectedPlaneacionIds` | open reemplaza; close parcial; reopen reconstruye | boolean / `error` string | `ListaCotejoGeneration` | `pendingListaByBatchId` / Listas | Ninguna; render muta selección, sesión nula y cleanup diferido | Aprobada 5.4 |
| Exámenes | `bibliotecaState.examModal` / `BibliotecaExamModalState` | bloque, unidad, planeaciones, tipos y cantidades | open reemplaza; close parcial; reopen reconstruye | boolean / `error` string | `ExamGeneration` | `pendingExamenByBatchId` / Exámenes | Ninguna; polling no reanudable, sin cancelación y estado efímero | Aprobada 5.5 |

Condiciones técnicas confirmadas: una fuente por modal; superficies léxicas y
específicas; cero store duplicado o modal universal; generación y pending
externos; render/eventos no absorbidos; Quick Create separado;
`window.explorerState` no absorbido; `window.biblioteca` no ampliado; cero
persistencia nueva. El subdominio de modales quedó aprobado.

### Validaciones estáticas de 5.6

- `node --check js/pages/biblioteca.page.js`: aprobado.
- Jest: 1 suite y 2 pruebas aprobadas.
- Smoke aislado: 23 comprobaciones de shape, ausencia de submitting, unidad,
  apertura/cierre/reapertura, cambio de bloque, temas, actividades, error,
  validación, snapshot, delegación y superficies acumulativas aprobadas.
- Reversión mecánica: 14 hunks reconstruyen `HEAD` exactamente.
- Superficies protegidas: `BibliotecaSelection`, `BibliotecaTabs` y los tres
  estados modales anteriores, 5/5 idénticos a `HEAD`.
- Búsqueda posterior: una fuente física y sin consumidor desconocido.

### Riesgos preservados

No existe bloqueo `submitting`, por lo que el modal no impide doble submit por
estado propio. Sesión nula conserva el camino previo con resultado nulo.
Render/eventos mutan actividades; título vacío no genera error inline; máximo
300 no se valida en el handler; IDs y `localId` mantienen tipos previos; close
conserva temas hasta reapertura; reload/navegación pierden estado; request SSE
no es cancelable ni reanudable; delete no cancela generación; skipped puede
limpiarse con error_count cero; `public.ia_metrics` y `duplicate_tema` quedan
fuera de alcance. No se corrigió ninguno.

### Validación manual de 5.6

**Aprobada explícitamente por el usuario.** Se confirmó el modal de
Planeaciones, la regresión mínima de los cuatro modales y la regresión general
registrada en `TEST_MATRIX.md`; los casos artificiales no se forzaron. Commit
funcional: `d45a493`.

### Siguiente corte recomendado

La Sesión 5.7 quedó ejecutada a continuación.

## Fase 5 — Sesión 5.7: Ownership consolidado de pending states de Biblioteca

### Gate y sub-gates

- Frontend: `refactor-front`, inicio real en `d45a493`, working tree limpio.
- 5.6 quedó reconciliada como aprobada y commiteada en `d45a493`.
- Backend solo lectura: `refactor-back`, `e08d6e4`, limpio.
- Planeaciones: **PASS**; una fuente y escritores/lectores completos.
- Anexos: **PASS**; mapa anidado y cleanup asimétrico delegables literalmente.
- Listas: **PASS**; shape y delay de 1500 ms preservables.
- Exámenes: **PASS**; message/error y polling preservables sin guardar jobId.

### Superficies implementadas

Las cuatro superficies son léxicas y operan directamente sobre las propiedades
originales de `bibliotecaState`:

- `BibliotecaPlaneacionesPending`: `get`, `set`, `delete`.
- `BibliotecaAnexosPending`: `getBatch`, `setBatch`, `deleteBatch`, `getItem`,
  `setItem`, `deleteItem`.
- `BibliotecaListaPending`: `get`, `set`, `delete`.
- `BibliotecaExamPending`: `get`, `set`, `delete`.

No se creó copia, global, archivo de estado, `PendingState` universal,
normalización, persistencia o validación nueva. Los coordinadores, render,
fachada Quick Create y delete de bloque solo sustituyen expresiones directas
por llamadas equivalentes.

### Auditoría acumulativa

| Dominio | Fuente / clave | Shape | Escritores | Lectores | Creación | Éxito | Error | Cleanup/delete/reload | Generador |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Planeaciones | `pendingPlaneacionesByBatchId[batchId]` | `{items,error}`; item `{titulo,status,message}` y `statusLabel` opcional en reconciliación | `PlaneacionGeneration`, fachada/finish Quick Create, delete bloque | SSE, reconciliación y tab | antes de SSE o desde Quick Create | conteos/resultados mutan items; cero errores elimina | agregado o item error permanece | `duplicate_tema` skipped preservado; delete bloque elimina; reload pierde | `PlaneacionGeneration` + Quick Create separado |
| Anexos | `anexosGenerating[batchId][planeacionId]` | `{titulo,materia,nivel,status,errorMessage}` | `AnexoGeneration`, wrappers individual/regeneración, delete bloque | cards y modal | antes de requests secuenciales | elimina item; refetch con algún éxito elimina batch | item queda `error`; fallo total permanece | cleanup asimétrico, delete bloque elimina, reload pierde | `AnexoGeneration` y wrappers vigentes |
| Listas | `pendingListaByBatchId[batchId]` | `{items,result,error}` | `ListaCotejoGeneration`, delete bloque | tab Listas | antes del POST único | espera 1500 ms, elimina, refetch | reemplaza conservando items y permanece | delete bloque elimina; reload pierde | `ListaCotejoGeneration` |
| Exámenes | `pendingExamenByBatchId[batchId]` | `{message,error}`, sin `jobId` | `ExamGeneration`, delete bloque | tab Exámenes | después de recibir `job_id` | current_step reemplaza; completed elimina/refetch | failed/timeout reemplaza y permanece | polling 3000 ms/60 intacto; delete no cancela; reload pierde | `ExamGeneration` |

Delete de bloque mantiene el orden Planeaciones, Exámenes, Listas, Anexos. Los
deletes individuales no cancelan procesos ni agregan cleanup. Quick Create
conserva `pendingConjunto`, `pendingBatchId`, `explorerState`, staging, SSE y la
fachada `window.biblioteca`; solo la implementación interna de start/finish usa
la superficie de Planeaciones.

### Riesgos preservados

Los cuatro pending son efímeros y no se reanudan. Las claves String/Number no
se normalizaron adicionalmente. Planeaciones conserva shapes de item variables
y limpieza de skipped con cero errores. Anexos conserva cleanup asimétrico y
pending atascado si sesión nula. Listas conserva errores visibles y delay de
1500 ms. Exámenes conserva jobId solo en closure, poll 60 limítrofe,
failed/timeout visible y delete sin cancelación. Delete de bloque puede ser
seguido por escrituras tardías de procesos que continúan. No se corrigió nada.

### Validaciones estáticas de 5.7

- `node --check` de los seis JavaScript modificados: aprobado.
- Jest: aprobado.
- Smoke aislado: 35 comprobaciones de las cuatro superficies, shapes, progreso,
  error, cleanup, delay, polling y orden de delete aprobadas.
- Búsqueda posterior: las únicas referencias directas a las cuatro propiedades
  viven dentro de sus superficies; no hay consumidor desconocido.
- Comparación literal: sustituciones mecánicas hunk por hunk; sin cambio
  funcional intencional.

### Validación manual de 5.7

**Aprobada explícitamente por el usuario.** Se confirmaron: Planeaciones con uno
y varios temas, batch nuevo/reutilizado, SSE, pending, success, cleanup y delete;
Anexos con pending por card y cleanup; Listas con pending, resultado y cleanup;
Exámenes con job, polling, progreso, contexto temático, completed, retry natural
sin cancelación y resultado guardado; además de cambios de bloque, tabs, ausencia
de pending cruzado, Quick Create, delete de bloque, reload, consola sin errores
nuevos y ausencia de requests duplicados visibles. Evidencia natural:
`[planeaciones] generate:success`, `[anexos] generate:success`,
`[listas-cotejo] generate:success`, `[examenes] generate:success` y
`[biblioteca] delete:success`. Commit: `9b3c23d`.

### Siguiente corte recomendado

La Sesión 5.8 quedó ejecutada a continuación.

## Fase 5 — Sesión 5.8: Auditoría formal de cierre

### Resultado

La revisión acumulativa de código, historial y documentación confirmó que el
objetivo canónico de Fase 5 está cumplido. Selección, tabs, cuatro modales y
cuatro pending poseen ownership léxico específico sobre sus fuentes originales;
no hay segunda fuente, store universal, persistencia nueva ni acceso directo
residual no clasificado. Quick Create, `window.explorerState`,
`window.biblioteca`, generación, SSE, polling, delete, render/eventos,
Archivados, jerarquía técnica, legacy y backend conservaron sus contratos.

| Sesión | Objetivo | Validación | Commit | Estado |
| --- | --- | --- | --- | --- |
| 5.0 | Auditoría de apertura | Documental aprobada | `525a21a` | Aprobada y commiteada |
| 5.1 | Selección de bloque | Estática/manual aprobadas | `1b4c620` | Aprobada y commiteada |
| 5.2 | Tab activo | Estática/manual aprobadas | `f5bbfdd` | Aprobada y commiteada |
| 5.3 | Modal de Anexos | Estática/manual aprobadas | `f05e730` | Aprobada y commiteada |
| 5.4 | Modal de Listas | Estática/manual aprobadas | `948d627` | Aprobada y commiteada |
| 5.5 | Modal de Exámenes | Estática/manual aprobadas | `3842f20` | Aprobada y commiteada |
| 5.6 | Modal de Planeaciones y cierre modal | Estática/manual aprobadas | `d45a493` | Aprobada y commiteada |
| 5.7 | Ownership de pending | Estática/manual aprobadas | `9b3c23d` | Aprobada y commiteada |

Estado restante: `conjuntos`, `loading`, `error` y `searchQuery` corresponden a
carga/render de Fases 6–7; `pendingBatchId` y `pendingConjunto`, a Quick Create
de Fase 7; `expandedIds` permanece documentado sin consumidor confirmado. No
justifican una extracción adicional en Fase 5.

### Decisión formal

**A. Fase 5 puede cerrarse.** Fase 5 y la Sesión 5.8 quedan completadas; la
auditoría de cierre queda aprobada. No se requieren pruebas manuales adicionales.
Fase 6 permanece pendiente y no iniciada.

## Fase 6 — Sesión 6.0: Auditoría técnica/documental de apertura

### Gate post-merge

- Frontend: rama `refactor-front`, `HEAD 1254561` (`Merge
  refactor(frontend): complete phases 0–5`), igual a `main` y `origin/main`.
- `origin/refactor-front` permanece en `b5348dd`; la rama local sí contiene el
  merge/pull de Fases 0–5. No se hizo merge, rebase, reset ni checkout.
- Working tree frontend: limpio al abrir.
- Backend solo lectura: `refactor-back`, `HEAD e08d6e4`, limpio.
- Fase 5: Completada. Fase 6: Pendiente antes de la sesión y abierta de forma
  compatible por 6.0. Fases 7–10: Pendientes.
- Puerta: **PASS**.

### Resultado documental

La Fase 6 queda **En progreso**. La Sesión 6.0 queda **Auditoría de apertura
completada**. No se modificó JavaScript, HTML, CSS, backend ni contratos; no se
hizo commit o push. La validación manual no es requerida para esta auditoría
estática.

Objetivo canónico: dividir gradualmente render y eventos para que
`biblioteca.page.js` actúe como coordinador. Se preservan vanilla JS, scripts
clásicos, Bootstrap/Tailwind vigentes, UX, DOM observable, `data-*`, mensajes,
eventos, orden de scripts y contratos de Fases 1–5.

### Inventario resumido

- `biblioteca.page.js`: 2770 líneas, 80 declaraciones de función, 22
  `render*`, 30 `addEventListener`, un `oninput`, 20 acciones emitidas/23 ramas
  delegadas y ≈221 ocurrencias de primitivas DOM auditadas.
- Render no modal: factories de pending, cuatro tabs de recursos, shell,
  sidebar, search, detalle, tabs, loading/error y tres patches (active, detail,
  lista).
- Modales: cuatro renderers de generación reemplazan la card y recrean
  listeners. Anexos y Listas depuran `selectedPlaneacionIds` durante render;
  Exámenes y Planeaciones enlazan closures que escriben ModalState.
- DOM factory: `injectBibliotecaModals` crea seis roots. Confirmación reemplaza
  card y registra listeners `{once}` por apertura.
- Eventos: una delegación permanente en `document`, search por propiedad
  `oninput`, listeners directos de modales recreados, y listeners Dashboard
  estables sobre `#explorer-content`, `document` y `window`.
- Acciones sin emisor actual: `toggle-expand`, `generar-anexo` y
  `regenerar-anexo`. Helpers sin consumidor: `getFilteredConjuntos`,
  `isBibliotecaTechnicalUnidad` y `renderPendingSpinnerCard`. Permanecen sin
  tocar por ambigüedad/compatibilidad.

El inventario completo, matrices de render/eventos/DOM, líneas, estado,
features y clasificación de riesgo están en
[`../FRONTEND_MAP.md`](../FRONTEND_MAP.md).

### Arquitectura y límites

```text
initDashboardPage
→ layout + bindDashboardEvents
→ initBiblioteca
→ inject modals + document delegation + loadAndRenderBiblioteca
→ renderBibliotecaContent
→ sidebar + detail → tabs → Planeaciones/Anexos/Listas/Exámenes
```

Fase 6 posee presentación, DOM patches, modales, search y eventos de Biblioteca.
Fase 7 conserva loader/reconciliación, Quick Create, `pendingBatchId`,
`pendingConjunto`, `explorerState`, bindings compartidos y desacoplamiento de
Dashboard. Previews, downloads, deletes, block delete, API, generación, SSE,
polling, delays/timeouts, payloads y backend permanecen protegidos.

Cruces activos preservados:

- `components/layout.html` aporta el shell, Quick Create y preview DOM.
- `dashboard.page.js` enlaza eventos antes de Biblioteca y conserva
  `renderExplorerContent()` como fachada hacia
  `window.renderBibliotecaContent`.
- Modal Planeaciones consume helpers léxicos de actividades declarados por
  Dashboard.
- render Planeaciones lee `window.explorerState.progress` durante Quick Create.
- Quick Create consume `window.biblioteca` y llama render/finish/refetch.

### Hallazgos no corregidos

- Render de Anexos/Listas mezcla cleanup de selección con presentación.
- `innerHTML`/`outerHTML` exige delegación o re-binding correcto.
- `showBibConfirm` y el modal compartido de nombre pueden conservar listeners
  de backdrop `{once}` no disparados cuando se cierra por otro control.
- `initBiblioteca` no posee guard propio para su listener documental; la ruta
  vigente lo invoca una vez.
- Queries DOM y event delegation están mezcladas con coordinación.
- Tres ramas y tres helpers no tienen consumidor/emisor confirmado; no son
  `unused` probado.
- El Escape de Dashboard no incluye los cuatro modales dinámicos de Biblioteca;
  se preserva como comportamiento actual.

### Roadmap aprobado para ejecución posterior

| Sesión | Alcance | Riesgo | Estado |
| --- | --- | --- | --- |
| 6.1 | render no modal completo: helpers/pending/cards/shell/sidebar/search/detail/tabs/loading-error/patches | Alto | Aprobada; commit `cef834e` |
| 6.2 | DOM y render/wiring literal de cuatro modales + confirmación | Muy alto | Aprobada; commit `ef3364f` |
| 6.3 | ownership de delegación y search; modales estabilizados | Alto | Aprobada; commit `4306903` |
| 6.4 | auditoría formal de cierre | Alto acumulativo | Completada; cierre aprobado |

### Primera sesión recomendada

**6.1 — Render no modal completo de Biblioteca.** Es el mejor primer corte
porque extrae como una unidad coherente el árbol que hoy produce el DOM
observable y reduce sustancialmente `biblioteca.page.js`, sin mover estado,
loader, eventos, modales, Quick Create, generación ni features protegidos. Es
literal, reversible y puede validarse comparando markup/`data-*` más carga,
búsqueda, selección, tabs, cuatro dominios, pending y renders parciales.

Archivos candidatos: `js/pages/biblioteca.page.js`, un único owner real bajo
`js/features/biblioteca/` y `pages/dashboard.html` solo para el script order.
El nombre definitivo no está fijado. Riesgo: Alto.

### Próximo paso reconciliado

6.1 y 6.2 fueron autorizadas, validadas y commiteadas en `cef834e` y `ef3364f`.
6.3 fue validada manualmente y commiteada en `4306903`. La auditoría 6.4 cerró
Fase 6; en ese corte histórico Fase 7 quedó pendiente y posteriormente cerró
mediante la auditoría 7.4.

### Validaciones de 6.0

- `npm test -- --runInBand`: aprobado; 1 suite y 2 pruebas.
- `git diff --check`: aprobado.
- `git diff --name-only`: únicamente los cinco documentos autorizados.
- Frontend funcional: intacto; no hay JS/HTML/CSS modificado.
- Backend: `refactor-back`, `e08d6e4`, limpio e intacto.
- Validación manual adicional: no requerida para la auditoría estática.
- Reconciliación posterior: la sesión fue commiteada por el usuario en
  `e27cb0a`; no se hizo push durante 6.0.

## Fase 6 — Sesión 6.1: Extracción consolidada del render no modal

### Gate y resultado

- Frontend al abrir 6.1: `refactor-front`, `HEAD e27cb0a`, tree limpio.
- 6.0: completada y commiteada; backend `refactor-back`/`e08d6e4`, limpio y
  solo lectura.
- Decisión: **A. Extracción consolidada implementada.** La manual fue aprobada
  después y el usuario commiteó el corte en `cef834e`.

### Arquitectura resultante

```text
initDashboardPage
→ initBiblioteca / loadAndRenderBiblioteca       biblioteca.page.js
→ renderBibliotecaContent + árbol no modal       biblioteca-render.js
→ partial renders                                biblioteca-render.js
```

`js/features/biblioteca/biblioteca-render.js` contiene 20 funciones movidas:
helpers visuales de progreso/sección/exámenes; Planeaciones, Anexos, Listas y
Exámenes; tabs; shell/sidebar/search/detail; loading/error y tres patches.
`biblioteca.page.js` retiene 59 funciones: estado/fachadas, helpers compartidos,
optimismo/finish, loader/refetch/reconciliación, eventos, cuatro modales,
confirmación, wrappers de features, injection e init.

`pages/dashboard.html` conserva el orden previo y añade únicamente:

```text
dashboard.page.js → biblioteca.page.js → biblioteca-render.js → main.js
```

El owner consume bindings definidos antes; no posee store, API, negocio ni
eventos. `renderBibliotecaContent()` sigue sin parámetros, con retorno implícito
y los mismos efectos DOM. La exposición `window.renderBibliotecaContent` se
mantiene antes del arranque; Dashboard/Quick Create, loader, generación y block
delete no cambian. Los tres renders parciales conservan sus nombres globales
para eventos y features.

### Contratos y métricas

- Bloque movido comparado literalmente con `HEAD`: mismas condiciones, loops,
  fallbacks, strings, atributos y lecturas de estado/pending/features.
- DOM: mismos IDs, clases, jerarquía, textos, roles, `aria-*`, `data-*`, tabs,
  cards, empty states, spinners, orden, disabled/hidden, `oninput` y scroll.
- Acciones: 20 valores emitidos y 23 ramas; se conservan las tres ramas sin
  emisor (`toggle-expand`, `generar-anexo`, `regenerar-anexo`).
- Métricas: page 2770→2125 líneas; owner 657; 20 funciones movidas, 59
  retenidas; listeners 30 + un `oninput`, sin cambio.

### Límites preservados

No se tocaron ModalState/Pending de Fase 5, cuatro modales, `showBibConfirm`,
delegación general, Quick Create, `explorerState`, loader/reconciliación,
generación/polling/SSE, previews, downloads, deletes, API, payloads,
`wordExport.js`, CSS ni backend. Loading/error y search solo cambiaron en su
dimensión visual. La lectura de `window.explorerState.progress.items` permanece
como dependencia de compatibilidad/Fase 7.

### Validaciones y próximo paso

- Comparación literal: PASS.
- `node --check` en page y owner: PASS.
- Smoke técnico sin red (carga/error/empty/search/selección/cuatro tabs/cards/
  pending/Quick Create visual/patches/acciones): PASS.
- `npm test -- --runInBand`: PASS, 1 suite/2 tests.
- Validación manual: aprobada; carga, navegación, cuatro generaciones, delete
  de bloque y consola sin regresiones reportadas.

6.2 fue autorizada e implementada en la sesión posterior.

## Fase 6 — Sesión 6.2: Extracción consolidada de modales

### Gate y decisión

- Frontend: `refactor-front`, `HEAD cef834e`, limpio al abrir.
- 6.1: manual aprobada y commit real `cef834e`.
- Backend: `refactor-back`/`e08d6e4`, limpio y solo lectura.
- Sub-gates: Planeaciones, Anexos, Listas, Exámenes y Confirmación: **PASS**.
- Decisión: **A. Extracción consolidada implementada.** La manual se aprobó
  después y el usuario commiteó el corte en `ef3364f`.

### Resultado y límites

`js/features/biblioteca/biblioteca-modal-render.js` contiene los cuatro renders,
`showBibConfirm`, `injectBibliotecaModals` y `BIB_EXAM_TIPOS`. Se movieron 29
listeners locales junto con el DOM que los recrea. `biblioteca.page.js` conserva
open/close, add tema, cuatro submit coordinators, estado, loader, generación,
compatibilidad y la delegación general única.

```text
dashboard.page.js
→ biblioteca.page.js
→ biblioteca-render.js
→ biblioteca-modal-render.js
→ main.js
```

Planeaciones conserva mutación directa de `actividades_momentos` y bindings de
Dashboard. Anexos/Listas conservan cleanup de `selectedPlaneacionIds` durante
render. Exámenes conserva siete tipos/defaults/counts. Confirmación conserva
Promise, scroll lock y listeners `{ once:true }`, incluida la deuda acumulable.
Open/close, submit, pending, generación, payloads, API, Quick Create, render 6.1,
Dashboard, CSS y backend quedaron intactos.

Métricas: `biblioteca.page.js` 2125→1465 líneas; owner modal 683 líneas; seis
funciones y una constante íntima movidas; DOM ops page/owner 61/104; listeners
general/modal 1/29, sin cambio efectivo.

Comparación literal individual, inyección/tipos, smoke JSDOM sin red,
`node --check` y Jest pasaron. La manual posterior aprobó carga, recursos,
modales, generaciones y deletes sin regresiones; commit `ef3364f`.

## Fase 6 — Sesión 6.3: Ownership consolidado de eventos

### Gate y decisión

- Frontend: `refactor-front`, `HEAD ef3364f`, limpio al abrir.
- 6.2: manual aprobada y commit real `ef3364f`.
- Backend: `refactor-back`/`e08d6e4`, limpio y solo lectura.
- Decisión: **A. Ownership consolidado implementado.** La manual posterior fue
  aprobada y el usuario commiteó el corte en `4306903`.

### Resultado

`js/features/biblioteca/biblioteca-events.js` contiene literalmente
`onBibliotecaClick` y `onBibliotecaSearch`, además de `bind()` y
`bindSearch(input)`. El primero registra el mismo `document.click` sin options
ni guard; el segundo asigna el mismo `oninput`. `initBiblioteca` y
`renderBibliotecaContent` delegan en los mismos puntos de timing.

```text
dashboard.page.js
→ biblioteca.page.js
→ biblioteca-render.js
→ biblioteca-modal-render.js
→ biblioteca-events.js
→ main.js
```

Se preservan 20 acciones emitidas/23 ramas, orden, `closest`, datasets, calls,
returns y bubbling. No había prevent/stop ni awaits/catches en el handler. Las
ramas sin emisor `toggle-expand`, `generar-anexo` y `regenerar-anexo` siguen
presentes. Dashboard continúa escuchando antes en `#explorer-content`; la
delegación documental recibe después el mismo click una vez.

Compatibilidad intacta: `window.biblioteca`, `window.renderBibliotecaContent`,
Dashboard, Quick Create, wrappers, features y legacy. `BibliotecaEvents` es
léxico, no una API pública. Los 29 listeners de modales y ambos owners visuales
se conservan; `biblioteca-render.js` solo contiene la delegación mecánica del
binding de search.

Métricas: page 1465→1317 líneas; event owner 163; dos handlers movidos; un
listener estructural y un `oninput`; 29 listeners modales retenidos; DOM ops
page/event owner 52/9; acciones/ramas 20/23.

Comparación literal de handlers/bindings, smoke JSDOM sin red, `node --check`,
Jest y diff check pasan. La manual confirmó carga, selección, tabs, search,
modales, acciones, generación, Quick Create y ausencia de dispatch/requests
duplicados.

## Fase 6 — Sesión 6.4: Auditoría formal de cierre

### Gate y reconciliación

- Frontend: `refactor-front`, `HEAD 4306903`, limpio al abrir.
- Backend: `refactor-back`, `HEAD e08d6e4`, limpio y solo lectura.
- 6.0 `e27cb0a`; 6.1 `cef834e`; 6.2 `ef3364f`; 6.3 `4306903`.
- Manual 6.3 aprobada con Biblioteca, cuatro modales, acciones, deletes,
  generaciones, Quick Create y consola/red sin duplicación ni regresión.

### Resultado acumulativo

Los owners canónicos son `biblioteca-render.js` para render no modal,
`biblioteca-modal-render.js` para overlays y wiring local, y
`biblioteca-events.js` para delegación/search. `biblioteca.page.js` queda como
coordinador de estado, loader/reconcile, open/close/submit, features y
compatibilidad. No se hallaron copias divergentes ni segunda fuente de State o
Pending.

Métricas finales de la página: 1317 líneas, 51 funciones nombradas, un wrapper
`render*` de preview compatible, cero listeners, cero `oninput` y 52 operaciones
DOM según el patrón de apertura. Conteos efectivos: 20 acciones emitidas, 23
ramas, un listener documental, un `oninput` y 29 listeners modales.

Los contratos de generación, API, Exámenes, delete, preview/download,
`window.renderBibliotecaContent`, `window.biblioteca`, DOM y script order están
intactos. Quick Create, `explorerState`, pending de creación rápida,
loader/navegación/reconciliación y Dashboard shell quedan reservados para Fase
7; Archivados/legacy y wrappers conservan sus fases posteriores.

Riesgos no bloqueantes: scripts clásicos/bindings léxicos, `initBiblioteca` sin
guard, confirmaciones `{ once:true }` potencialmente acumulables, mutaciones de
estado históricas durante render, estado efímero y requests no cancelables.
`public.ia_metrics` es externo/preexistente; 17 retries con examen 11/11 y cero
fallos corresponden al mecanismo anti-duplicados.

**Decisión: A. Fase 6 puede cerrarse.** Sesión 6.4 completada, auditoría
aprobada, sin implementación funcional ni prueba manual adicional. Fase 7:
pendiente/no iniciada. Commit y push de 6.4: no realizados.

## Fase 7 — Sesión 7.0: Auditoría técnica/documental de apertura

### Gate e identidad

- Frontend: `refactor-front`, `HEAD 295d7ed`, limpio y alineado con
  `origin/refactor-front` al abrir.
- Backend: `refactor-back`, `HEAD e08d6e4`, limpio y solo lectura.
- El historial confirma cierre de Fase 6 en `295d7ed` y cierre documental en
  `8ad0b0d`.
- Fases 0–6 completadas; Fase 7 en progreso por 7.0; Fases 8–10 pendientes.
- La sesión no modificó JS, HTML, CSS, APIs, services, packages ni backend; no
  hizo commit ni push.

### Pregunta central resuelta

`dashboard.page.js` conserva mezcla activa de bootstrap, Quick Create,
jerarquía técnica, preview/compatibilidad y código visual legacy.
`biblioteca.page.js` conserva estado, fachada, loader y dos niveles de
reconciliación. Quick Create cruza ambos owners mediante `explorerState`,
`window.biblioteca` y `window.renderBibliotecaContent`.

La separación segura no empieza retirando globals: primero debe moverse Quick
Create como unidad funcional, preservando la fachada. Después puede separarse
loader/reconcile con sus consumidores ya delimitados, y por último reducirse
Dashboard a bootstrap/navegación/bindings activos. El aislamiento visual legacy
continúa reservado para Fase 8 y el retiro final de wrappers para Fase 10.

### Flujo y contratos confirmados

- Quick Create usa título existente/nuevo, nivel, materia y temas; resuelve o
  crea plantel/grado/materia/unidad técnica y genera por
  `/api/unidades/:unidadId/generar?stream=1`.
- Bloque nuevo: no envía `batch_id`; conserva `force_new_batch:true`,
  `mode:"create"` y `titulo_conjunto`. Bloque existente: usa
  `pendingBatchId` como `batch_id`.
- El modal normal de Planeaciones usa el mismo service/SSE, pero siempre envía
  batch explícito y escribe `BibliotecaPlaneacionesPending`; no se unifica.
- El feedback activo de Quick Create se muestra en la card temporal/pendiente de
  Biblioteca. Las secciones generating/result del panel no tienen invocador
  confirmado y no se eliminan.
- `pendingConjunto` tiene shape temporal completo de conjunto y se mapea al
  `batch_id` real optimista/refetch. Selection/Tabs/Pending protegidos conservan
  una sola fuente.
- `loadAndRenderBiblioteca` controla carga normal/silenciosa, sesión, GET,
  reconciliación, fallback de selección/tab, error/loading y render. Tiene 15
  call sites en init/retry/generations/deletes/Quick.

### Riesgos conservados

- Pending, SSE, progreso, selección y tab no persisten. Reload no reanuda y
  puede reconstruir solo lo ya guardado por backend.
- No hay AbortController ni timeout cliente para planeaciones. Navegar, logout
  o delete no cancelan generación.
- Delete de bloque existente durante Quick limpia Pending pero no
  `pendingBatchId` ni la request; finish/delete/refetch pueden competir.
- Si falla jerarquía después de que el panel cerró, el error queda solo en
  consola. Error de generación sí actualiza progress/card.
- El mapping sin `targetBatchId` infiere el batch nuevo por diferencia de IDs;
  hay riesgo de selección/tab/card incorrectos bajo carreras.
- Scripts clásicos sostienen bindings léxicos de actividades/progreso entre
  Dashboard y Biblioteca. Reordenarlos prematuramente rompe resolución.
- El listener de Dashboard en `#explorer-content` y el documental de Biblioteca
  coexisten sin doble dispatch porque usan `data-content-action` y
  `data-bib-action` distintos; no alterar esta frontera sin prueba.

### Roadmap aprobado para ejecución posterior

1. **7.1 — Quick Create completo.** Owner específico con estado/DOM/listeners,
   jerarquía técnica, staging/progreso y coordinación, conservando fachada,
   payload, SSE, parser, timing y wrappers.
2. **7.2 — Loader + reconciliación de Biblioteca.** Separar fetch/reconcile sin
   mover State/Pending ni cambiar cargas silenciosas, callbacks o renders.
3. **7.3 — Bootstrap/navegación y bindings activos.** Reducir Dashboard después
   de los dos cortes anteriores; conservar bridges con consumidores y no aislar
   legacy todavía.
4. **7.4 — Auditoría formal de cierre.** Evidencia acumulativa; sin abrir Fase 8.

### Siguiente sesión recomendada

**7.1 — extracción consolidada de Quick Create.** Va primero porque concentra
el único flujo vigente que escribe simultáneamente `explorerState`, fachada y
estado pending de Biblioteca. Es reversible y manualizable; permite mantener
los wrappers y deja una frontera clara para extraer reconciliación después.

No debe mover `PlaneacionGeneration`, State/Pending protegidos, API/service SSE,
payloads, previews/downloads/delete, Archivados, árbol visual ni wrappers
finales. Manual futura: carga, abrir/cancelar/validar, bloque nuevo/existente,
success/partial/error, progreso, reconcile, selección/tab, reload y una sola
request.

### Estado de salida

- Fase 6: Completada.
- Estado histórico al salir de 7.0: Fase 7 en progreso; cerrada posteriormente por 7.4.
- Sesión 7.0: Auditoría de apertura completada.
- Implementación funcional: No realizada.
- Manual: No requerida.
- `npm test -- --runInBand`: PASS, 1 suite y 2 tests.
- `git diff --check`: PASS; solo documentación autorizada modificada.
- Backend final: limpio y sin cambios.
- Commit/push: No realizados.

## Fase 7 — Sesión 7.1: extracción consolidada de Quick Create

### Gate y alcance

- 7.0 quedó realmente commiteada en `7c75738`; este fue el HEAD limpio de
  `refactor-front` al abrir 7.1. `origin/refactor-front` permanecía en
  `295d7ed`.
- Backend: `refactor-back`/`e08d6e4`, limpio, solo lectura y sin cambios.
- Solo se modificaron el owner Dashboard, el orden de script necesario, un
  owner nuevo, un smoke nuevo y los cinco documentos obligatorios. No se
  tocaron API/services, CSS, packages, backend, loader/reconcile ni features.

### Resultado técnico

`js/features/dashboard/quick-create.js` concentra panel, comboboxes,
validación, datos de Biblioteca, resolución/creación de jerarquía técnica,
staging, payload, progreso SSE, result/error y coordinación. Publica
`window.QuickCreate` con `open`, `close`, `bind`, `setPanelVisibility` y
`generateFromStaging`; este namespace no contiene una segunda fuente de estado.

`dashboard.page.js` conserva `window.explorerState`, helpers con consumidores
compartidos y cuatro wrappers finos. `BibliotecaEvents` sigue abriendo Quick
Create por el binding léxico de Dashboard; Escape/render legacy conservan sus
llamadas; la acción legacy de generar conserva la firma. El owner nuevo usa las
19 referencias a `window.biblioteca` que antes estaban en Dashboard y no llama
directamente `loadAndRenderBiblioteca`.

Métricas: Dashboard 5690→4323 líneas; owner nuevo 1414; 44 listeners
preservados como 27+17. La comparación literal normalizada de UI, bindings,
generación y jerarquía pasó. El smoke JSDOM sin red pasó 3 casos: ciclo y
validación local; batch temporal→real con selección/tab y sin duplicado;
success parcial y error con cleanup histórico.
La suite acumulativa pasó 2 suites y 5 tests.

### Contratos y riesgos preservados

- `window.explorerState` sigue siendo la fuente física de Quick Create,
  staging, `progress`, `generating`, contexto y caches; no se creó store nuevo.
- `window.biblioteca`, `window.renderBibliotecaContent` y
  `window.BIBLIOTECA_MODE` conservan contrato. State/Pending, selección/tabs y
  reconciliación permanecen en Biblioteca.
- Payload, `force_new_batch`, batch explícito, endpoint, service, parser SSE,
  fallback, orden y cleanup se copiaron sin rediseño.
- El script carga `dashboard.page.js -> quick-create.js -> biblioteca.page.js`;
  se mantienen scripts clásicos y resolución tardía de bindings.
- Siguen vigentes los riesgos ya documentados: pending efímero, SSE no
  resumible, requests no cancelables, carreras de delete/refetch y fallback de
  mapping cuando falta target real.

### Estado de salida

- Fase 7: Completada por auditoría 7.4.
- Sesión 7.0: Completada y commiteada en `7c75738`.
- Sesión 7.1: Validada manualmente y commiteada en `97b798c`.
- Sesión 7.2: Validada manualmente y commiteada en `a6840a4`.
- Sesión 7.3: Validada manualmente y commiteada en `bcd361e`.
- Sesión 7.4: Auditoría aprobada; manual adicional no requerida.

La manual de 7.1 confirmó Quick Create, reconciliación sin duplicados,
Biblioteca posterior y el flujo normal con batch existente,
`forceNewBatch:false` y reutilización explícita. También confirmó success de
planeaciones, anexos y exámenes.

## Fase 7 — Sesión 7.2: ownership de loader y reconciliación

### Gate y decisión técnica

- Frontend: `refactor-front`, `HEAD 97b798c`, limpio al abrir; commit real de
  7.1 `refactor(frontend): extract Dashboard Quick Create`.
- Backend: `refactor-back`/`e08d6e4`, limpio, solo lectura y sin cambios.
- Decisión: mover loader y reconciliación íntima como una unidad literal; dejar
  State/Pending y coordinación restante en page; conservar wrappers para los
  consumidores clásicos.

### Owner y fronteras

`js/features/biblioteca/biblioteca-loader.js` contiene seis funciones:
normalización de planeaciones generadas, merge por ID, aplicación optimista,
aplicación de result a pending, finish Quick→Biblioteca y load/refetch. Publica
cinco operaciones en `window.BibliotecaLoader`; `mergePlaneaciones` permanece
privada. No es un store ni una capa API nueva.

`biblioteca.page.js` conserva `bibliotecaState`, Selection, Tabs, cuatro
ModalState, cuatro Pending, `pendingBatchId`, `pendingConjunto`, modales,
submits, compatibilidad e init. Cinco wrappers conservan firmas para features,
eventos, deletes, fachada e init. Los 15 caminos siguen siendo init, retry,
refresh, finish, cuatro generaciones, dos anexos directos, cinco deletes.

### Semántica preservada

- Normal: limpia pending temporal, activa loading, limpia error, renderiza,
  exige sesión, hace una GET, reconcilia y renderiza resultado/error.
- Silent: conserva la ausencia de render/loading inicial; hace una GET y un
  render final. Finish mantiene render optimista + un refetch silent.
- Target explícito gana; sin target se conserva inferencia por primer ID nuevo.
  Luego selección conserva ID previo o cae al primer conjunto/null.
- Tabs limpian tempId y conservan/restauran el tab histórico. No se agregó
  limpieza general de claves huérfanas.
- `pendingBatchId` no es writer del loader. `pendingConjunto` conserva shape,
  timing y cleanup. Merge incoming sigue ganando por ID; refetch reemplaza la
  lista optimista por backend.
- Quick Create, generación, SSE/polling, delays, deletes, API, render, Dashboard,
  navegación, jerarquía, Archivados y legacy permanecen funcionalmente intactos.

### Evidencia y estado

- Comparación literal normalizada: PASS en seis funciones.
- Smoke loader/reconcile sin red: PASS en cuatro casos amplios.
- Smoke Quick Create: PASS; integración temporal→real intacta.
- Suite acumulativa: PASS, 3 suites y 9 tests.
- `biblioteca.page.js`: 1317→1118 líneas; owner 233; cinco wrappers.
- Script order: page → loader → render → modal render → events.
- Sesión 7.2: Validada manualmente y commiteada en `a6840a4`.
- Sesión 7.3: Validada manualmente y commiteada en `bcd361e`.
- Sesión 7.4: Auditoría aprobada; manual adicional no requerida.

La manual de 7.2 confirmó Quick Create con `batchIdRecibido:null`,
`forceNewBatch:true` y batch creado; el flujo normal con batch existente,
`forceNewBatch:false` y reutilización explícita; y delete con
`[biblioteca] delete:success`.

## Fase 7 — Sesión 7.3: Dashboard bootstrap y bindings compartidos

### Gate y decisión técnica

- Frontend: `refactor-front`, `HEAD a6840a4`, limpio al abrir; commit real de
  7.2 `refactor(frontend): extract Biblioteca loader and reconciliation`.
- Backend: `refactor-back`/`e08d6e4`, limpio, solo lectura y sin cambios.
- Decisión: extraer literalmente layout, bootstrap y binding estructural;
  retener navegación porque sus branches todavía comparten jerarquía técnica,
  explorer legacy, previews, deletes y Archivados.

### Owner y fronteras

`js/features/dashboard/dashboard-bootstrap.js` contiene `injectComponent`,
`bindDashboardEvents` e `initDashboardPage`, además del guard privado de
binding. Publica únicamente `window.initDashboardPage`; no crea Router, Store,
EventBus ni namespace nuevo. El script carga después de `dashboard.page.js` y
antes de Quick Create/Biblioteca para consumir bindings léxicos ya definidos y
registrar callbacks antes de que `main.js` ejecute el entry point.

El owner conserva 25 sitios `addEventListener`, incluyendo el listener
Dashboard de `#explorer-content`. Este continúa registrándose antes del
listener `document.click` de Biblioteca e ignora `data-bib-action`; no se añadió
`stopPropagation`. Los dos listeners restantes en Dashboard son locales a
checkboxes creados por renders legacy.

### Semántica y límites preservados

- Init conserva detección de Biblioteca, escritura de `BIBLIOTECA_MODE`,
  layout, sidebar condicional, navbar/footer, error DOM, binding y luego init de
  Biblioteca o hidratación legacy, con el mismo orden/await/catch.
- Navegación (`selectRoot/Plantel/Grado/Materia/Unidad`, árbol, breadcrumbs,
  Detalle y back-forward) permanece en Dashboard.
- Helpers de actividades, labels, select visual, nivel/grado,
  progreso/status, jerarquía técnica y preview conservan definición y
  consumidores. `explorerState` no se mueve ni duplica.
- Quick Create, loader/reconcile, Biblioteca, State/Pending, generadores,
  API/payload, SSE/polling, CSS, Archivados y legacy no cambian funcionalmente.

### Evidencia y estado

- Comparación literal normalizada: PASS en las tres funciones movidas.
- Smoke Dashboard sin red: PASS en 3 casos de init/bind/Biblioteca, bridge de
  preview/legacy y error de layout.
- Smokes Quick Create y Biblioteca loader: PASS.
- Suite acumulativa: PASS, 4 suites y 12 tests.
- `dashboard.page.js`: 4323→4049 líneas; owner nuevo 286 líneas.
- Funciones 177→174 + 3; listeners 27→2 + 25; DOM ops 198→171 + 27.
- `explorerState`: 506 referencias intactas en el perímetro Dashboard/bootstrap
  (488 + 18); globals publicados: 7.
- Sesión 7.3: Validada manualmente y commiteada en `bcd361e`.
- Sesión 7.4: Auditoría aprobada; Fase 7 completada.
- Commit/push de 7.4: No realizados.

La manual de 7.3 confirmó Dashboard, layout/navbar/footer y Biblioteca
correctos; Quick Create con `batchIdRecibido:null`, `forceNewBatch:true` y batch
creado; delete con `[biblioteca] delete:success`; y examen del tema Fracciones
con 5/5 preguntas, cero retries y `generate:success`, sin errores visibles
nuevos.

## Fase 7 — Sesión 7.4: auditoría formal de cierre

### Gate y sesiones reconciliadas

- Frontend: `refactor-front`, `HEAD bcd361e`, limpio al abrir; commit real de
  7.3 `refactor(frontend): extract Dashboard bootstrap ownership`.
- Backend: `refactor-back`/`e08d6e4`, limpio, solo lectura y sin cambios.
- 7.0: apertura documental, `7c75738`; manual no requerida.
- 7.1: Quick Create, manual aprobada, `97b798c`.
- 7.2: loader/reconcile, manual aprobada, `a6840a4`.
- 7.3: bootstrap/bindings, manual aprobada, `bcd361e`.

| Sesión | Objetivo / archivos principales | Owner resultante | Manual / commit | Riesgo | Estado |
| --- | --- | --- | --- | --- | --- |
| 7.0 | auditoría de apertura; cinco documentos | mapa y corte propuesto | no requerida / `7c75738` | clasificación incorrecta | completada |
| 7.1 | `quick-create.js`, Dashboard, HTML, smoke y docs | `window.QuickCreate` | aprobada / `97b798c` | SSE, staging y batch | completada |
| 7.2 | `biblioteca-loader.js`, Biblioteca page, HTML, smoke y docs | `window.BibliotecaLoader` | aprobada / `a6840a4` | temporal→real/refetch | completada |
| 7.3 | `dashboard-bootstrap.js`, Dashboard, HTML, smoke y docs | `window.initDashboardPage` | aprobada / `bcd361e` | orden y doble binding | completada |

### Ownership y fuentes únicas

| Dominio | Owner | Estado |
| --- | --- | --- |
| Quick Create | `quick-create.js` | UI, binding, validación, staging, SSE/progreso y bridge completos |
| Loader/reconcile | `biblioteca-loader.js` | load/refetch, loading/error, temporal→real, optimistic/partial y finish |
| Bootstrap Dashboard | `dashboard-bootstrap.js` | layout, binding con guard e init público |
| Biblioteca State/Pending | `biblioteca.page.js` | fuente física única; Selection/Tabs, cuatro ModalState y cuatro Pending intactos |
| Navegación/jerarquía/legacy/Archivados | `dashboard.page.js` + owners existentes | clasificados para Fase 8; no son segunda fuente de los dominios extraídos |

`dashboard.page.js` queda en 4049 líneas, 174 funciones, dos sitios de listener,
488 referencias a `explorerState` y seis globals publicados. Bootstrap aporta
286 líneas, tres funciones, 25 sitios de listener y 18 referencias al mismo
estado. Quick Create tiene 1414 líneas/44 funciones/17 listeners; loader,
233 líneas/6 funciones. Los 15 caminos de load permanecen equivalentes y los
cinco wrappers hacia `BibliotecaLoader` conservan consumidores clásicos.

### Contratos y compatibilidad

- Quick Create usa batch nuevo sin `batch_id` explícito y
  `force_new_batch:true`; el flujo normal conserva batch explícito y false por
  ausencia del flag.
- Exámenes Biblioteca envían `planeacion_ids`, `unidad_id`, `batch_id`, tipos y
  cantidades; `tema_ids` no recibe IDs de planeación. El backend conserva la
  resolución de contexto y batch.
- Deletes individuales y de bloque conservan cleanup optimista, pending,
  Selection/Tabs y un refetch silencioso.
- Planeacion/Anexo/Lista/Exam Generation, polling/SSE, render/modal/events,
  previews/downloads, API/services y payloads no cambiaron en Fase 7.
- Orden clásico confirmado: Dashboard page → bootstrap → Quick → Biblioteca
  page → loader → render → modal render → events → main. No ESM/defer/async,
  `stopPropagation` nuevo ni doble binding detectado.

### Riesgos y handoff

- **No bloqueantes:** scripts clásicos, bindings léxicos, `explorerState`
  mixto, SSE no resumible, falta de AbortController y races delete/refetch.
- **Fase 8:** Archivados, explorer visual, árbol/breadcrumbs, navegación
  jerárquica, previews ligados a `explorerState` y clasificación residual.
- **Fase 10:** globals, wrappers, bridges y superficies de compatibilidad.
- **Externo:** error preexistente de `public.ia_metrics`; no bloquea el flujo
  principal ni pertenece al cierre frontend.
- **Bloqueantes:** ninguno.

### Evidencia y decisión

- Búsquedas obligatorias de owners/state/globals/Pending/actions: PASS.
- Suite acumulativa: PASS, 4 suites y 12 tests.
- Manual acumulada 7.1–7.3: aprobada; no se solicita repetición.
- Backend final: limpio y solo lectura.
- Contradicciones: ninguna.

**Decisión: A. Fase 7 puede cerrarse.** Fase 7 y Sesión 7.4 completadas;
auditoría aprobada. Fase 8 queda pendiente/no iniciada. No se crea 7.5.
Commit/push de 7.4: no realizados.

## Fase 8 — Sesión 8.0: auditoría técnica/documental de apertura

### A. Gate

```text
Frontend rama: refactor-front
Frontend HEAD: 2bb950d (merge de Fases 6 y 7; coincide con origin/main)
Main HEAD: local 1254561; origin/main 2bb950d
Frontend clean: Sí al abrir
Backend: refactor-back / e08d6e4 / limpio / solo lectura
Commit cierre Fase 7: 3a5cf94; integrado por merge 2bb950d
Puerta: PASS con desalineaciones remotas/locales documentadas; sin operación Git automática
```

`origin/refactor-front` permanece en `3a5cf94`, ancestro directo del merge. El
`main` local permanece detrás de `origin/main`. `refactor-front` parte del merge
coherente y el working tree estaba limpio; no se hizo merge, rebase, reset,
fetch, commit ni push.

### B. Objetivo canónico Fase 8

Separar el explorador visual jerárquico antiguo de Biblioteca sin eliminar
jerarquía técnica ni compatibilidad activa. La UI legacy se aísla antes de
considerar eliminación; Biblioteca y Archivados deben seguir operativos.

### C. Métricas

```text
dashboard.page.js: 4049 LOC
funciones: 174 FunctionDeclaration nombradas, incluidas locales
listeners: 2 locales (25 adicionales en dashboard-bootstrap)
DOM ops: 171
explorerState: 488 tokens en Dashboard
archivedState: 0 en Dashboard; 75 en archivados.page.js
localStorage: 0 en Dashboard; 1 acceso directo en el registry service
navegación: 12 funciones de control/selección/handlers/hydrate
previews: 6 wrappers de preview + 1 bridge download de Examen
globals: 6 publicaciones en Dashboard; initDashboardPage en bootstrap
```

### D–H. Arquitectura residual, explorer, navegación y jerarquía

La ruta vigente es `main -> initDashboardPage -> initBiblioteca -> return`. No
inyecta sidebar ni llama `hydrateExplorerData`; Biblioteca oculta path bar y
controla `#explorer-content`. El fallback conserva montaje técnico si
`initBiblioteca` falta, cubierto solo por smoke, no por un HTML alternativo.

Clasificación final:

- A navegación vigente: arranque, Biblioteca, Quick Create y Detalle desde
  cards de Biblioteca.
- B jerarquía técnica activa: planteles/grados/materias/unidades, caches,
  loaders/ensure y current IDs usados por Quick Create.
- C preview/download activo: Examen, Lista, Anexo y Planeación; Examen/Lista
  aún escriben `explorerState`.
- D Archivados activo: página directa, estado, registry, tree, restore/delete;
  emisores archive del Dashboard son legacy.
- E legacy visual confirmado: tree, breadcrumbs, renders por nivel, selección,
  CRUD/archive visual y generaciones por unidad del fallback.
- F compatibilidad activa: fallback, `pageshow`, session location, registry,
  render bridge y globals.
- G helper compartido: actividades, sort/error, select visual, progreso/status.
- H wrapper temporal: cuatro Quick, previews/download, AppUI y render bridge.
- I sin consumidor confirmado y J debug/deuda: lista separada en
  `FRONTEND_MAP.md`; nada se elimina.

`pageshow` sí sigue activo en modo Biblioteca: en back-forward llama
`refreshExplorerAfterReturn`, carga jerarquía y restaura
`educativo.dashboard.last-location`; `renderAll` termina delegando a render de
Biblioteca. No refetchea Biblioteca. Se documenta como compatibilidad frágil,
no se corrige.

### I. Archivados

`archivados.page.js` ya es el owner UI separado. La URL directa es privada y
ejecutable, carga `/api/planeaciones/archived`, construye ramas scope/batch/item,
hidrata grados/materias/unidades al expandir y permite restore/delete
permanente. El navbar tiene su único link comentado: no existe acceso visible
en el repositorio.

Biblioteca vigente usa delete directo y no archiva. Los únicos emisores de
archive están en el explorer fallback y en Batch histórico, que redirige antes
de montar su JS. Archivados conserva valor real para datos ya persistidos y
acceso directo; no se clasifica como muerto.

`archivedState` es efímero: loading/error, filter/search/sort,
`expandedBranches`, data con totales/branches y confirm modal. No se expone en
`window` ni persiste.

El registry `educativo.archivedHierarchy.registry` contiene hidden por cuatro
niveles, scopes con metadata, mappings de planeaciones y batches. No tiene
versión ni migración explícita. Normaliza shapes antiguos reconocibles, cae a
vacío ante storage/JSON inválido y limpia al restore/delete conocido; no tiene
garbage collection contra backend.

### J. `explorerState`

El inventario completo propiedad/writer/reader/persistencia/fase queda en
`FRONTEND_MAP.md`. Resumen:

- técnico + Quick: `planteles`, tres caches descendentes, parte de
  loading/errors y `current`;
- Quick activo: `quickCreate`, staging/context/title, `progress`, `generating`;
- legacy visual: expanded/search, temas/planeaciones por tema, exam/list
  generation/modal, entity modal y confirm delete/archive;
- preview activo: `examPreview`, `examenDetalleById`, `listaCotejoPreview`;
- mixto: `current`, staging, progress, generating, loading/errors y body-lock
  state.

`current` tiene exactamente `level`, `plantelId`, `gradoId`, `materiaId` y
`unidadId`; no tiene tema. Quick escribe IDs directamente; select* escribe y
persiste; Archivados no lo usa.

### K–O. Previews, Detalle, persistencia, globals y scripts

- Examen/Lista: Biblioteca abre namespaces activos, pero estado/cache reside en
  `explorerState`; fallback conserva aperturas alternativas. Download Examen
  desde Biblioteca todavía pasa por `window.downloadExamWord`.
- Anexo: estado/DOM de su feature, no explorerState. Planeación: Detalle +
  `PlaneacionDownload`, sin preview Dashboard.
- Detalle vigente recibe `detalle.html?id=` desde Biblioteca. El botón legacy
  conserva la misma URL, pero no se emite en el flujo principal.
- sessionStorage: solo `educativo.dashboard.last-location`. localStorage: solo
  `educativo.archivedHierarchy.registry` en este perímetro.
- Se mantienen `explorerState`, `BIBLIOTECA_MODE`, `biblioteca`,
  `renderBibliotecaContent`, QuickCreate, BibliotecaLoader, initDashboardPage,
  initBiblioteca y globals de features/registry.
- El orden clásico real y sus dependencias léxicas permanecen intactos. No se
  modificó HTML ni se reordenaron scripts.

### P. Legacy confirmado

Tree, breadcrumbs, renders por root/plantel/grado/materia/unidad, CRUD/delete y
archive visual, staging/generación por unidad, generación/polling de examen y
listas del fallback. Tienen consumidores internos y APIs reales, pero ningún
entry point visible de producto. Se aíslan antes de evaluar retiro.

### Q. Sin consumidor confirmado

`renderActividadCierreStatus`, renderer/label/width antiguos de actividad de
cierre, `hasInvalidExamQuestionCounts`, `renderActividadesEvaluadasHtml`,
`getExamOptionLabel`, `findPlantelIdForGrado`, el par ejecutable de imagen
pausada, las dos secciones generating/result de Quick y varios aliases globales
de preview/registry. No se confunden con dead code y no se borran.

### R–S. Handoff Fases 9 y 10

- Fase 9: solo explorer ya aislado sin entry point, ramas sin emisor, helpers
  huérfanos, DOM Quick sin caller y aliases sin reader, tras nueva evidencia.
- Fase 10: globals, wrappers, namespaces, facade/bridge, bindings léxicos,
  compatibilidad registry y orden final de scripts.

### T. Riesgos

- Alto: romper Quick al mover loaders/caches; preview/download de Biblioteca;
  restore/delete permanente; registros antiguos; Detalle/pageshow.
- Medio: fallback no detectado, doble binding/bubbling, tree de Archivados,
  session location obsoleta y orden léxico.
- Bajo/documental: aliases sin reader y helpers huérfanos; aun así requieren
  Fase 9/10.

### U–V. Roadmap y 8.1 recomendada

1. 8.1 — ownership del registro de jerarquía archivada.
2. 8.2 — explorer visual + navegación legacy como bloque.
3. 8.3 — preview/compatibilidad residual ligada a explorerState.
4. 8.4 — auditoría formal de cierre.

8.1 va primero porque Archivados UI ya está separada, mientras su registry
activo sigue mezclado con el service general de planeaciones. Debe mover solo
key, normalización, read/write/register/restore/snapshot/cleanup hacia un owner
Archivados; conservar siete globals, shape/fallback, page, HTTP, Dashboard y
datos. No toca Quick, loaders, explorer, previews, Biblioteca, generación ni
backend. Riesgo: script order y registros antiguos. Manual futura: registro
vacío/válido/antiguo/inválido; scope sin planeaciones; filtros/tree;
restore/delete item/batch/scope; reload; Dashboard/Biblioteca/Quick; consola y
red.

### W–Y. Documentación, validación y estado

Documentos autorizados actualizados: `docs/ARCHITECTURE.md`,
`docs/FRONTEND_MAP.md`, `docs/refactor/REFACTOR_ROADMAP.md`, este handoff y
`docs/refactor/TEST_MATRIX.md`.

Validación ejecutada:

- `git diff --check`: PASS.
- `git diff --name-only`: solo los cinco documentos autorizados.
- `git diff --stat`: 5 archivos; JavaScript, HTML y CSS intactos.
- `npm test -- --runInBand`: PASS, 4 suites y 12 pruebas.
- Backend final: `refactor-back`/`e08d6e4`, limpio y sin cambios.

```text
Fase 7: Completada
Fase 8: En progreso
Sesión 8.0: Auditoría completada
Implementación funcional: No
Manual: No requerida
Commit: 9b8ede5 (realizado posteriormente por el usuario)
Push: no reconciliado dentro de la sesión 8.0
Working tree de 8.0: limpio al abrir la nueva 8.1
```

## Fase 8 — Sesión 8.1: explorer visual y navegación jerárquica legacy

### A. Gate/reconciliación

```text
HEAD: 9b8ede5 docs(refactor): open legacy explorer and archived phase
hash 8.0: 9b8ede5
8.1 anterior: cambios sin commit descartados; owner/smoke registry ausentes
backend: refactor-back / e08d6e4 / limpio / solo lectura
puerta: PASS después de reconciliar el descarte explícito
```

### B. Auditoría explorer

| Función/grupo | Categoría | Consumer | Owner anterior | Owner final/retenido | Riesgo |
| --- | --- | --- | --- | --- | --- |
| location/current/select* | B/E; unidad G | Bootstrap, Quick, tree | Dashboard | legacy owner | session/loaders |
| tree/breadcrumbs | A/B/D | Bootstrap DOM | Dashboard | legacy owner | events/expanded |
| cinco level renders | A/C | content bridge | Dashboard | legacy owner | DOM/actions |
| renderAll/content | A/K | Quick, recursos, Biblioteca | Dashboard | legacy owner | bridge |
| handlers/hydrate | A/B/K | Bootstrap fallback | Dashboard | legacy owner | dispatch/BFCache |
| technical load/ensure | F/G | Quick + owner | Dashboard | retenido | fuente compartida |
| preview/download | H/K | Biblioteca + legacy | Dashboard/features | retenido | 8.2 |
| CRUD/archive | I/J/K | callbacks legacy | Dashboard | retenido | Archivados/API |

### C. Decisión

**A. Explorer visual legacy aislado.** No se elimina el fallback ni se cambia
el flujo normal de Biblioteca.

### D. Owner

```text
archivo: js/features/dashboard/legacy-explorer.js
LOC: 1188
funciones: 42
scope: location, selección, tree, breadcrumbs, niveles, render/dispatch, hydrate
dependencias: explorerState y helpers técnicos/callbacks clásicos de Dashboard
```

No crea namespace, store, listeners ni estado. Las declaraciones top-level
mantienen los bindings existentes.

### E. Arquitectura resultante

```text
dashboard.page.js (2867)
├─ explorerState y helpers/caches técnicos
├─ Quick/shared
├─ recursos/generación legacy
├─ previews/downloads
└─ CRUD/archive callbacks

legacy-explorer.js (1188)
├─ ubicación/current/select*
├─ tree + breadcrumbs
├─ root/plantel/grado/materia/unidad
├─ renderExplorerContent/renderAll
├─ handlers delegados
└─ restore/refresh/hydrate fallback

dashboard-bootstrap.js
└─ listeners/pageshow/init sin cambio funcional
```

### F–G. Jerarquía técnica y `explorerState`

`loadPlanteles`, `ensureGrados`, `ensureMaterias`, `ensureUnidades`, sort,
filtro registry, caches y helpers current/find permanecen en Dashboard porque
Quick Create y callbacks vigentes los consumen. El owner los llama sin copia.

`explorerState` conserva exactamente su shape y publicación. Se trasladaron
158 de sus 488 referencias; 330 quedan con estado técnico, recursos, Quick,
previews, generation, CRUD y callbacks. No hay segunda fuente.

### H–I. Tree, breadcrumbs y navegación

Se movieron literalmente cinco funciones tree, dos breadcrumb, cinco select*,
setCurrent, restore/refresh/hydrate y tres helpers de sessionStorage. HTML,
classes, IDs, `data-*`, labels, order, empty/loading/error, expanded Sets,
current IDs y `detalle.html?id=` coinciden con `HEAD`.

El listener `pageshow` sigue registrado en Bootstrap y resuelve la misma
declaración `refreshExplorerAfterReturn`; BFCache/back-forward no se altera.

### J. Resources/CRUD legacy

`renderUnidadLevel` se movió como composición visual, pero temas, planeaciones,
exámenes, listas, generación, progreso y actividades siguen siendo
dependencias retenidas. CRUD jerárquico, delete/archive, modales y registry
quedan en Dashboard/service; el dispatcher solo conserva sus callbacks.

### K. Preview/download

Exam/Lista Preview, downloads, estados, globals, modal DOM, Escape y
`wordExport.js` permanecen intactos. Son candidatos auditables de 8.2.

### L. Archivados

Sin cambios. `archivados.page.js`, `archivados.html`, registry local,
planeaciones service, restore y delete están fuera de alcance. Biblioteca usa
delete directo; Archivados específico para Biblioteca se difiere a trabajo
posterior al refactor.

### M. Script order/bindings

```text
dashboard.page.js → legacy-explorer.js → dashboard-bootstrap.js
→ quick-create.js → biblioteca.page.js/owners → main.js
```

Scripts clásicos; sin module/import/export/defer/async. El owner carga antes de
Bootstrap y Quick. Los harnesses replican ese orden.

### N–O. Archivos y métricas

Código: Dashboard reducido + owner nuevo. HTML: una etiqueta script. Tests:
dos harnesses adaptados y smoke nuevo. Documentación: cinco canónicos.

```text
dashboard.page.js: 4049 → 2867 LOC
legacy owner: 1188 LOC
funciones: 174 → 132 + 42
explorerState refs: 488 → 330 + 158
DOM primitivas patrón ampliado 8.1: 198 → 136 + 62
tree: 5 movidas
breadcrumbs: 2 movidas
navegación/fallback: 9 + 3 storage movidas
listeners owner: 0
wrappers nuevos: 0; 14 existentes retenidos
```

### P. Validaciones

- Comparación AST literal de 42 funciones: PASS.
- Cero funciones movidas duplicadas en Dashboard: PASS.
- `node --check` preliminar en Dashboard/owner/Bootstrap/Quick: PASS.
- Smoke legacy: PASS, 1 suite/3 pruebas.
- Smoke Bootstrap + Quick: PASS, 2 suites/6 pruebas.
- Suite acumulativa: PASS, 5 suites/15 pruebas.
- Sintaxis de cuatro JS productivos y tres tests: PASS.
- `git diff --check`: PASS.
- Backend final: `refactor-back`/`e08d6e4`, limpio y solo lectura.

### Q. Riesgos

Bindings léxicos entre scripts; `selectUnidad` también consumido por Quick;
`renderAll` mezcla callbacks retained; `pageshow` corre bajo Biblioteca;
session location histórica; callbacks archive/CRUD; previews pendientes de
8.2. No se corrigió ningún comportamiento.

### R. Manual pendiente

- Dashboard/Biblioteca: carga, bloques, tabs, search y reload; sin explorer
  apareciendo.
- Quick Create: abrir y, opcionalmente, validar sin consumir IA.
- Detalle: abrir planeación, volver atrás y confirmar Biblioteca.
- Preview: abrir examen o lista.
- Consola: sin ReferenceError, undefined, doble listener/render o árbol legacy.
- Explorer visible: probar tree/breadcrumbs/niveles solo si existe acceso
  natural; no manipular código.

### S. Roadmap restante

8.2 previews/downloads + compatibilidad residual; 8.3 solo si existe bloque
coherente; 8.4 auditoría formal. Ninguna está iniciada.

### T. Estado final

```text
Fase 8: En progreso
8.0: completada/commiteada en 9b8ede5
8.1: implementada
Manual: pendiente
Commit: no
Push: no
Working tree: cambios de 8.1 sin commit
```

## Fase 8 — Sesión 8.2: preview, download y compatibilidad residual

### A. Gate/reconciliación

```text
HEAD: 1aa1599 refactor(frontend): extract legacy Dashboard explorer
hash 8.1: 1aa1599
manual 8.1: aprobada por el usuario
backend: refactor-back / e08d6e4 / limpio / solo lectura
puerta: PASS
```

La evidencia manual reconciliada incluye Dashboard/Biblioteca y Quick correctos,
generación normal, Anexos y Listas `generate:success`, batch existente con
`forceNewBatch:false`, delete `success` y Examen 11/11 con cero preguntas
fallidas. La documentación que dejó 8.1 pendiente se actualizó en esta sesión.

### B–C. Auditoría residual y decisión

| Dominio | Funciones | LOC aprox. | Consumers | Riesgo | Candidato |
| --- | ---: | ---: | --- | --- | --- |
| Actividades/staging/shared | 38 | 353 | Quick/generation/fallback | Alto | No |
| Jerarquía técnica/loaders | 23 | 296 | Quick/legacy/CRUD/archive | Alto | No |
| Examen/Lista legacy + generation | 38 | 930 | fallback/Bootstrap/generators | Alto/protegido | No |
| Delete/archive | 20 | 627 | legacy/API/Archivados | Alto/congelado | No |
| CRUD jerárquico visual | 6 | 272 | legacy/Bootstrap modal | Medio | Auditar para 8.3 |
| Preview/download bridges | 7 | 21 función; 68 con contratos | legacy/Bootstrap/Biblioteca | Bajo/medio | Sí |

**Decisión: preview/download compatibility se extrajo hacia los owners reales ya
existentes.** No se creó `resource-previews.js`, porque cache, API, DOM, render y
download ya pertenecían a features por dominio. Tampoco se escogió un bloque
mayor que invadiera generación, Archivados o jerarquía técnica.

### D–H. Owners, Examen, Lista y download

```text
exam-preview.js
├─ ExamPreview render/open/openBiblioteca/close
└─ bridges render/open/close compatibles

exam-download.js
├─ ExamDownload download/downloadFromBiblioteca
└─ bridge downloadExamWord compatible

lista-cotejo-preview.js
├─ ListaCotejoPreview render/open/openBiblioteca/close
└─ bridges render/open/close compatibles

lista-cotejo-download.js
└─ ListaCotejoDownload; sin cambio
```

Examen conserva cache `examenDetalleById`, fetch por detalle, render del modal,
loading/error, cierre, Escape y Word. Lista conserva `listasCotejoByUnidad`,
`listaCotejoPreview`, apertura local/Biblioteca, render, cierre y download. Los
siete cuerpos movidos son literalmente iguales a `HEAD`; retornos y promesas no
cambian. `wordExport.js` permanece intacto.

### I–J. `explorerState`, globals y wrappers

El objeto, shape y publicación física de `explorerState` permanecen en
Dashboard. Sus 330 referencias de Dashboard no se movieron porque los bridges
no accedían al estado. Referencias externas auditadas: legacy 158, Quick 98,
Bootstrap 18, Exam Preview/Download 42, Lista Preview 24 y Biblioteca
loader/render 3.

| Global | Consumer | Estado final |
| --- | --- | --- |
| `renderExamPreviewModal` | render legacy; alias | publicado por ExamPreview |
| `openExamPreview` | click legacy | publicado por ExamPreview |
| `closeExamPreviewModal` | Bootstrap click/Escape; alias | publicado por ExamPreview |
| `downloadExamWord` | Bootstrap, legacy, Biblioteca download | publicado por ExamDownload |
| `renderListaCotejoPreviewModal` | render legacy; alias | publicado por Lista Preview |
| `openListaCotejoPreview` | click legacy | publicado por Lista Preview |
| `closeListaCotejoPreview` | Bootstrap click/Escape; alias | publicado por Lista Preview |

Los cuatro aliases render/close sin reader externo confirmado se conservan para
Fase 10; no se confunden con dead code. No se eliminó wrapper ni global.

### K–N. Integraciones protegidas

- Legacy explorer: sin diff; sigue resolviendo los siete bindings clásicos.
- Biblioteca: sin diff; `openBiblioteca` y downloads conservan firma/timing.
- Quick Create: JS productivo sin cambios; su smoke carga el orden real.
- Archivados: sin cambios y fuera de alcance; registry/localStorage intactos.
- Bootstrap: sin diff; sigue registrando cierre, Escape y downloads una vez.
- Anexo, Planeación, Detalle, generation, API/payload y backend: intactos.

### O–P. Archivos y métricas

Código: tres owners existentes + Dashboard. Tests: tres harnesses actualizados y
smoke nuevo. HTML/CSS: sin cambios. Documentación: cinco archivos canónicos.

```text
dashboard.page.js: 2867 → 2799 LOC
funciones Dashboard: 132 → 125
funciones movidas: 7 (6 preview + 1 download)
exam-preview.js: 298 → 328 LOC
exam-download.js: 238 → 248 LOC
lista-cotejo-preview.js: 121 → 151 LOC
lista-cotejo-download.js: 36 → 36 LOC
explorerState refs Dashboard: 330 → 330
DOM ops Dashboard: 134 → 134
globals: 7 → 7
listeners nuevos: 0
```

### Q. Validaciones

- Comparación AST: 7/7 movidas y 125/125 retenidas iguales a `HEAD`; PASS.
- Cero funciones movidas duplicadas en Dashboard; total 132 preservado; PASS.
- Smoke `resource-previews`: 1 suite/4 pruebas; PASS.
- Suite acumulativa: 6 suites/19 pruebas; PASS.
- `node --check`, `git diff --check` y búsqueda global de aliases; PASS.
- Sin diff productivo en Bootstrap, Quick, legacy owner, Biblioteca,
  generación, Archivados o `wordExport.js`; PASS.
- Backend final: `refactor-back`/`e08d6e4`, limpio y solo lectura.

### R. Riesgos

Bindings clásicos entre owners y legacy/Bootstrap; cuatro aliases sin reader
externo confirmado; cache compartido de Examen; `current.unidadId` requerido por
la apertura legacy de Lista; body lock compartido; listeners en Bootstrap. Se
preservaron sin bugfix ni cambio de shape.

### S. Manual pendiente

- Dashboard/Biblioteca: carga, bloques, tabs, search y reload.
- Examen: abrir, contenido, cerrar, reabrir y descargar si es razonable.
- Lista: abrir, contenido, cerrar y descargar si es razonable.
- Quick Create: abrir sin consumir IA.
- Detalle: abrir planeación y volver.
- Consola/red: sin ReferenceError, global undefined, doble modal/listener/fetch.

### T. Roadmap restante

8.3 no está abierta. Solo procede si una auditoría confirma que el CRUD
jerárquico visual residual puede extraerse como bloque reversible sin tocar
archive/delete, generación ni jerarquía técnica. En caso contrario, avanzar a
8.4, auditoría formal de cierre.

### U. Estado final

```text
Fase 8: En progreso
8.1: aprobada y commiteada en 1aa1599
8.2: implementada
Manual: pendiente
Commit: no
Push: no
Working tree: cambios de 8.2 sin commit
```

## Fase 8 — Sesión 8.3: auditoría residual y CRUD jerárquico visual

### A–B. Gate y reconciliación 8.2

```text
rama: refactor-front
HEAD inicial: 6fb39ab refactor(frontend): move preview and download bridges to feature owners
hash 8.2: 6fb39ab
working tree inicial: limpio
backend: refactor-back / 8977c62 / limpio / solo lectura
puerta: PASS
```

8.2 está commiteada, pero su manual continúa marcada pendiente. No se inventó
aprobación. El hotfix `duplicate_tema` quedó aislado en backend y no produjo
cambios frontend.

### C–D. Métricas y mapa residual previo

| Dominio | LOC aprox. | Funciones | Consumers | Riesgo/Fase |
| --- | ---: | ---: | --- | --- |
| Estado físico | 54 | objeto | todos los owners | mixto; F10 |
| Actividades/staging/shared | 353 | 38 | Quick/generation/fallback | alto; conservar |
| Jerarquía técnica/loaders | 296 | 23 | Quick/legacy/CRUD/archive | activa; conservar |
| Examen/Lista + generation legacy | 930 | 38 | fallback/Bootstrap/features | alto/protegido; F9 |
| Delete/archive | 627 | 20 | legacy/API/registry | alto/congelado; F9/futuro |
| CRUD visual | 234 | 5 | legacy + Bootstrap | medio; candidato 8.3 |
| Wrappers/compatibilidad | ~90 | 6 wrappers | Quick/AppUI/legacy | F10 |

Métricas iniciales verificadas: Dashboard 2799 LOC, 125 funciones, 2 listeners,
330 refs de `explorerState`, 142 DOM ops con patrón ampliado, una publicación
`window.*` explícita y seis funciones sin consumer productivo confirmado.

### E–K. Frontera auditada

El CRUD es exclusivamente visual/fallback. `openModalError`,
`closeEntityModal`, `configureEntityModalFields`, `openEntityModal` y
`submitEntityModal` poseen el modal y create/edit de plantel, grado, materia y
unidad. Bootstrap conserva submit/click/Escape; `legacy-explorer.js` emite las
acciones; `handleCreateAction` queda en Dashboard porque también despacha
Examen, Lista y staging.

La extracción consume, pero no mueve ni duplica, `loadPlanteles`, los tres
`ensure*` jerárquicos usados aquí, current/find, `getNextOrder`, services CRUD,
`select*`, `renderAll`, helpers de nivel/error/body lock. Quick Create no consume
las cinco funciones movidas. Delete/archive, generación, preview/download,
Archivados y Biblioteca quedan intactos.

`explorerState` conserva shape y fuente: 330 refs se redistribuyen como 292 en
Dashboard + 38 en el owner. CRUD lee/escribe `modal` y lee `current`,
`gradosByPlantel` y `unidadesByMateria`. No se creó namespace, store, listener
ni global explícito.

### L. Sin consumidor confirmado

No se eliminaron: `renderActividadCierreStatus`,
`renderActividadCierreControl`, `hasInvalidExamQuestionCounts`,
`renderActividadesEvaluadasHtml`, `getExamOptionLabel` y
`findPlantelIdForGrado`. Cada una tiene solo su definición en JS/HTML productivo;
siguen como candidatos Fase 9, no como dead code confirmado.

### M–P. Decisión, implementación y métricas

**A. Ejecutar último corte.** La frontera es de 234 LOC, reversible, sin estado
propio y con consumidores comprendidos. Es el último owner grande justificable
de Fase 8.

```text
owner: js/features/dashboard/legacy-hierarchy-crud.js
LOC: 234
funciones: 5
dashboard.page.js: 2799 → 2564 LOC; 125 → 120 funciones
explorerState: 330 → 292 Dashboard + 38 owner
DOM ops: 142 → 118 Dashboard + 24 owner
listeners: 2 Dashboard; 0 owner
```

Arquitectura resultante:

```text
dashboard.page (estado/técnica/generation/delete/shared/wrappers)
→ legacy-explorer (visual/navegación)
→ legacy-hierarchy-crud (modal create/edit)
→ dashboard-bootstrap (bindings)
→ quick-create
→ Biblioteca
```

### Q. Tests y validaciones

- Comparación literal: 234/234 líneas iguales al bloque de `HEAD`; PASS.
- Smoke CRUD: 1 suite/3 pruebas; open, configure, validación, submit, close,
  payload/loaders/select y superficie léxica; PASS.
- Suite acumulativa: 7 suites/22 pruebas; PASS.
- `node --check` sobre JS/tests tocados; PASS.
- Script order clásico; sin module/defer/async; PASS.
- Backend, owners protegidos, API/payload, generation, Archivados y CSS: sin
  cambios.

### R. Manual pendiente

- Dashboard/Biblioteca: carga, bloques, tabs, search y reload; sin explorer
  legacy apareciendo.
- Quick Create: abrir sin regresión ni necesidad de generar IA.
- Detalle: abrir una planeación y volver.
- Preview: abrir/cerrar Examen y Lista.
- Consola: sin ReferenceError, función undefined, doble listener/modal/render.
- CRUD legacy solo si existe una ruta natural visible; no activar el fallback
  mediante manipulación de código.

### S–T. Handoff Fases 9/10

- Fase 9: seis funciones sin consumer confirmado; explorer/CRUD aislados;
  generation visual legacy; branches fallback no montadas; `batch.html`.
- Fase 10: `window.explorerState`, wrappers Quick/AppUI, aliases preview,
  bindings léxicos, compatibilidad y orden final de scripts.

### U–X. Documentación, riesgos y estado

Riesgos no bloqueantes: bindings clásicos entre cuatro scripts, modal state
físico en Dashboard, fallback no visible en ruta Biblioteca y manual 8.2 aún
pendiente. Ningún contrato funcional se cambió.

```text
Fase 8: En progreso
8.2: commiteada en 6fb39ab / manual pendiente
8.3: implementada
Manual: pendiente
Commit: no
Push: no
8.4: recomendada / no iniciada
```

## Fase 8 — Sesión 8.4: auditoría formal de cierre

### A–C. Gate, objetivo y sesiones

```text
rama: refactor-front
HEAD: cf48637 refactor(frontend): extract legacy hierarchy CRUD
8.0: 9b8ede5
8.1: 1aa1599
8.2: 6fb39ab
8.3: cf48637
backend: refactor-back / 8977c62 / limpio / solo lectura
puerta: PASS
```

Objetivo canónico confirmado: separar del Dashboard residual las superficies
visuales legacy sin eliminar jerarquía técnica ni compatibilidad activa.
Archivados quedó congelado por decisión de producto; Biblioteca usa delete
directo y un Archivados propio de Biblioteca se diseñará después del refactor.

| Sesión | Commit | Manual | Estado |
| --- | --- | --- | --- |
| 8.0 | `9b8ede5` | no requerida | completada |
| 8.1 | `1aa1599` | aprobada | completada |
| 8.2 | `6fb39ab` | aprobada por regresión acumulativa posterior | completada |
| 8.3 | `cf48637` | aprobada | completada |
| 8.4 | pendiente | auditoría documental | cierre aprobado |

### D. Métricas Fase 8

| Métrica Dashboard | Inicio | Final | Delta |
| --- | ---: | ---: | ---: |
| LOC | 4049 | 2564 | -1485 |
| funciones | 174 | 120 | -54 |
| refs `explorerState` | 488 | 292 | -196 |
| DOM ops patrón ampliado | 191 | 118 | -73 |
| listeners | 2 | 2 | 0 |
| wrappers auditados | 13 | 6 | -7 |
| publicaciones `window.*` explícitas | 6 | 1 | -5 |

### E–F. Arquitectura y ownership final

```text
dashboard.page.js (estado/técnica/shared/generation/delete/wrappers)
→ legacy-explorer.js (location/select/tree/breadcrumbs/renders/fallback)
→ legacy-hierarchy-crud.js (modal create/edit)
→ dashboard-bootstrap.js (bindings/init/Biblioteca-vs-fallback)
→ quick-create.js
→ biblioteca.page + loader/render/modal-render/events
→ main.js
```

| Dominio | Owner | State | Consumers | Estado |
| --- | --- | --- | --- | --- |
| explorer/navegación | `legacy-explorer.js` | `explorerState` | fallback, Bootstrap, Quick | aislado |
| CRUD visual | `legacy-hierarchy-crud.js` | `explorerState.modal/current` | dispatcher, Bootstrap | aislado |
| Examen preview/download | feature owners | cache/modal compartido | Biblioteca/fallback/Bootstrap | vigente/compatible |
| Lista preview/download | feature owners | cache/modal compartido | Biblioteca/fallback/Bootstrap | vigente/compatible |
| jerarquía técnica | Dashboard loaders | caches por ID | Quick/explorer/CRUD/delete | activa |
| Biblioteca | cinco owners protegidos | State/Pending propios | ruta principal | vigente |

### G–N. Dashboard residual y fronteras

- Estado físico: `explorerState` permanece en Dashboard por consumidores
  cross-script de Quick, legacy, CRUD, previews, Bootstrap y Biblioteca.
- Jerarquía técnica: `loadPlanteles`, `ensureGrados`, `ensureMaterias` y
  `ensureUnidades` tienen consumers reales en Quick, explorer y CRUD; no son
  legacy eliminable.
- Actividades/staging/shared: consumido por Quick, generation y fallback; no
  existe frontera segura adicional.
- Generation residual: modales/renders/coordinación de Examen, Lista y
  Planeación legacy se clasifican para Fase 9/10; no se reabre Fase 4.
- Delete/archive: callbacks, prune, confirm y refresh legacy permanecen; el
  registry y Archivados no se modificaron.
- Explorer: 1188 LOC/42 funciones/158 refs de estado/0 listeners; usa la fuente
  existente, conserva session location y fallback, y no se hidrata bajo la ruta
  normal Biblioteca.
- CRUD: 234 LOC/5 funciones/38 refs/0 listeners; state sigue en Dashboard,
  loaders compartidos y listeners en Bootstrap; delete/archive quedó fuera.
- Preview/download: siete bridges conservan firma/global en los owners
  `ExamPreview`, `ExamDownload` y `ListaCotejoPreview`; Lista Download ya era
  owner completo.
- Archivados: page, localStorage registry, restore y delete intactos. La feature
  futura de Biblioteca no se asigna automáticamente a Fase 9.

### O. `explorerState`

| Grupo | Consumers | Clasificación | Fase |
| --- | --- | --- | --- |
| caches plantel→unidad/loading/errors | Quick/explorer/CRUD | técnica activa + legacy | preservar/10 |
| current | Quick/explorer/CRUD/resources | mixto activo | 10 |
| quickCreate/progress/generating/staging | Quick/Biblioteca/fallback | vigente + bridge | 10 |
| expanded/search | tree legacy | visual legacy | 9 |
| preview caches/state | feature owners/Bootstrap | vigente compatible | 10 |
| generation/modal resource | fallback/Bootstrap | legacy coordinado | 9/10 |
| entity modal/confirmDelete | CRUD/delete/archive | legacy/compatibilidad | 9/10 |

### P. Globals y wrappers

Globals preservados: `explorerState`, `BIBLIOTECA_MODE`, `biblioteca`,
`renderBibliotecaContent`, `QuickCreate`, `BibliotecaLoader`,
`initDashboardPage`, `initBiblioteca`, namespaces de Preview/Download y los
siete aliases compatibles. Fase 10 recibe su cleanup.

| Wrapper Dashboard | Owner real | Consumer | Necesario | Fase |
| --- | --- | --- | ---: | --- |
| `setQuickPanelVisibility` | QuickCreate | render legacy | sí | 10 |
| `openQuickCreatePanel` | QuickCreate | Biblioteca events | sí | 10 |
| `closeQuickCreatePanel` | QuickCreate | Bootstrap | sí | 10 |
| `generatePlaneacionesFromStaging` | QuickCreate | dispatcher legacy | sí | 10 |
| `renderProgressPill` | AppUI | legacy/Biblioteca | sí | 10 |
| `statusLabelFromTone` | AppUI | Quick/Biblioteca | sí | 10 |

### Q. Sin consumidor confirmado

Solo su definición aparece en JS/HTML productivo, sin data attribute, alias,
callback, global ni test consumidor: `renderActividadCierreStatus`,
`renderActividadCierreControl`, `hasInvalidExamQuestionCounts`,
`renderActividadesEvaluadasHtml`, `getExamOptionLabel` y
`findPlantelIdForGrado`. Se entregan a Fase 9; no se etiquetan dead code.

### R–T. Orden, listeners y rutas vigentes

Orden real: base APIs/services/features → Dashboard → Explorer → CRUD →
Bootstrap → Quick → Biblioteca page/loader/render/modal/events → main. Todos son
scripts clásicos, sin module/defer/async. Los bindings existen cuando
`main.js` ejecuta `initDashboardPage`.

Explorer, CRUD y previews añaden 0 listeners. Bootstrap conserva 25 bindings
estructurales con guard `isDashboardBound`; Quick conserva su owner y Biblioteca
su delegación. `initDashboardPage` detecta `initBiblioteca`, fija
`BIBLIOTECA_MODE`, inicializa Biblioteca y retorna antes de
`hydrateExplorerData`. No se observó doble árbol, render, preview ni listener en
la regresión manual o smokes. `BibliotecaEvents.bind()` conserva duplicabilidad
histórica sin guard interno, pero la ruta normal inicializa una vez; deuda no
bloqueante para cleanup final.

Quick Create mantiene `batch_id` explícito sin `force_new_batch` al agregar a un
bloque y `force_new_batch:true` cuando Biblioteca crea uno nuevo. Biblioteca
mantiene State/Pending, loader, render, modal render y events. Detalle conserva
`detalle.html?id=` desde Biblioteca y fallback.

### U. Evidencia manual acumulada

- Planeación: `successCount:1`, `errorCount:0`, `skippedCount:0`.
- Anexos: `generate:success`, `anexos_creados:5`.
- Lista: `created:1`, `skipped:0`.
- Examen: 13/13, `preguntas_fallidas:0`; 12 retries pertenecen al control de
  similitud existente, no a una regresión Fase 8.
- Deletes: Examen, Lista, Anexo, Planeación y Batch con success.
- Usuario: “todo funciona bien después de la sesión”.
- `duplicate_tema`: incidencia backend preexistente resuelta externamente en
  Supabase; `Fracciones 1` llegó a AI request/response con success 1 y skipped 0.

### V–W. Tests y riesgos

`node --check`: 9 archivos críticos PASS. Jest: 7 suites/22 pruebas PASS.

- Blockers: ninguno.
- No bloqueantes: bindings léxicos, fallback cargado pero no montado,
  duplicabilidad histórica de BibliotecaEvents y 12 retries de Examen.
- Deuda futura: legacy/branches/functions sin consumer para F9; estado,
  globals/wrappers/aliases/order para F10; temas huérfanos fuera del frontend.
- Externos: `public.ia_metrics` ausente continúa conocido y fuera de alcance.

### X–Y. Handoffs

Fase 9 recibe explorer y CRUD ya aislados, seis funciones sin consumer
confirmado, `batch.html` redirect, generation visual legacy, branches fallback y
acciones jerárquicas antiguas. Requisito: búsqueda exhaustiva y prueba de cero
consumers antes de borrar.

Fase 10 recibe `explorerState`, globals, wrappers, aliases, bridges, bindings
léxicos cross-script, compatibilidad y orden final.

### Z–AC. Documentación, contradicciones, decisión y estado

Contradicción reconciliada: el criterio antiguo decía que Biblioteca “no carga”
el explorer; el HTML sí carga el script para mantener fallback. El criterio
correcto y verificado es “no monta ni hidrata” el explorer bajo Biblioteca.

**A. Fase 8 puede cerrarse.**

```text
Fase 8: Completada
Sesión 8.4: Completada
Auditoría de cierre: Aprobada
Fase 9: Pendiente / no iniciada
Commit: no
Push: no
Working tree: cinco documentos de cierre
```

## Fase 9 — Sesión 9.0: auditoría técnica/documental de apertura

### A. Gate

```text
rama: refactor-front
HEAD: 41f933e Merge refactor(frontend): complete phase 8 legacy Dashboard isolation
cierre F8: bf97b1a (documental), 378ac30 (acumulativo), 41f933e (merge actual)
working tree inicial: limpio
backend: refactor-back / fe25abe / limpio / solo lectura
puerta: PASS
```

`origin/refactor-front` permanece en `378ac30`; `origin/main` y HEAD coinciden
en `41f933e`. No se ejecutó fetch, merge, rebase, reset, commit ni push.

### B. Objetivo canónico F9

Eliminar únicamente código del explorador visual obsoleto demostrado sin
consumidores, preservando Biblioteca, Quick Create, jerarquía técnica,
previews/downloads, generación, Detalle, Archivados y contratos backend.

### C. Baseline

Dashboard conserva 2564 LOC, 120 funciones y 292 refs de `explorerState`;
Explorer 1188 LOC/42 funciones/158 refs; CRUD 234 LOC/5 funciones/38 refs.
Hay seis funciones cero-consumer, siete ramas sin emitter, dos script tags
legacy, 57 hooks DOM legacy, una key sessionStorage (reader+writer) y un
listener `pageshow`. Generation legacy ocupa ~930 LOC/38 funciones y
delete/archive ~627 LOC/20 funciones.

Baseline funcional aprobado que no se repite en 9.0: Planeación, Anexo, Lista
y Examen success; deletes success; `duplicate_tema` resuelto externamente. El
error `public.ia_metrics` sigue fuera de alcance.

### D. Entry points

| Página | Cómo se alcanza | Scripts | Vigente/legacy | Riesgo |
| --- | --- | --- | --- | --- |
| Dashboard | login/navbar/redirect/directa | stack completo + `main.js` | Biblioteca vigente | legacy cargado |
| Detalle | cards Biblioteca; fallback | owner Detalle | vigente | preservar `id`/back |
| Batch | directa/bookmark; links en UI muerta | ningún script, redirect | compatibilidad | bookmarks externos |
| Archivados | URL directa; navbar comentado | owner propio + main | activo separado | datos históricos |
| Tailwind | solo URL directa | stack propio | legacy huérfano ejecutable | requiere decisión |

### E. Legacy Explorer

Se carga siempre en Dashboard pero no monta bajo la entrada normal. Bootstrap
consume handlers, refresh/pageshow e hydrate; Dashboard consume `setCurrentLevel`,
`select*`, render bridge y `renderAll`; CRUD consume `select*`; Quick conserva
`selectUnidad` en la rama no-Biblioteca. Usa current, expanded, recursos,
sessionStorage y 42 bindings globales implícitos. Solo los tests montan el
fallback intencionalmente. No es retirable como archivo en 9.1.

### F. Legacy CRUD

| Función | Consumer | Estado |
| --- | --- | --- |
| `openModalError` | CRUD + catch Bootstrap | callback fallback |
| `closeEntityModal` | CRUD + click/Escape Bootstrap | callback fallback |
| `configureEntityModalFields` | `openEntityModal` | interno |
| `openEntityModal` | dispatcher/onboarding con guard | sin ruta normal; fallback |
| `submitEntityModal` | submit Bootstrap | callback fallback |

### G. Fallback

`main.js → initDashboardPage → initBiblioteca existe →
BIBLIOTECA_MODE → initBiblioteca → return`. Si el asset falta/falla o un
harness lo omite: sidebar → `hydrateExplorerData` → load → restore/primer
plantel → select/render → tree/breadcrumbs. El orden clásico normal garantiza
Biblioteca; no hay HTML alternativo de producto.

### H. Jerarquía técnica

| Superficie | Consumers | Decisión |
| --- | --- | --- |
| `loadPlanteles` | Quick, fallback, CRUD, pageshow | proteger |
| `ensureGrados/Materias/Unidades` | Quick, fallback, CRUD, callbacks | proteger |
| caches/current | Quick + owners legacy | mixto; no borrar |
| `selectUnidad` | Quick condicional + legacy/CRUD | migración previa obligatoria |

### I. Quick Create crossings

Estado/caches/current/staging/progress/generating; cuatro loaders; rama
`selectUnidad`; render bridge; helpers pedagógicos/status; services de
jerarquía y SSE. Todos protegidos.

### J. Biblioteca crossings

Quick wrapper, progress de `explorerState`, render/status helpers, actividades,
render bridge, Preview/Download namespaces y aliases. No depende de tree,
breadcrumbs o CRUD visual, pero sí de compatibilidad Dashboard compartida.

### K. Generation legacy

Examen y Lista conservan modal/coordinación/render por unidad sin entrada
normal; sus owners vigentes de preview/download y generation Biblioteca se
preservan. Staging visual es legacy, pero el generator Quick, progress y bridge
son activos. No se reabre Fase 4.

### L. Delete/archive legacy

Seis acciones `delete-*` y `archive-batch` tienen handler pero cero emitter.
Cinco acciones archive sí se emiten en el fallback y usan APIs/registry. El
confirm modal y `confirmDelete` son compartidos entre ambos grupos. Archivados
page, registry, restore y delete permanente permanecen congelados.

### M. `explorerState` legacy slices

Expanded/search son visuales; temas/planeaciones tienen writers incidentales
desde Quick post-generation; generation/modales Examen/Lista son legacy con
body-lock/listeners; entity modal pertenece al CRUD; confirm pertenece a
delete/archive. Preview caches, current, caches, staging, progress y Quick son
mixtos/vigentes. Se clasifican, no se modifican.

### N. SessionStorage/pageshow

`educativo.dashboard.last-location`: un reader y un writer en Explorer.
`pageshow` se registra siempre y, al volver, hace requests jerárquicos y
`renderAll`; en Biblioteca termina delegando a `renderBibliotecaContent`, sin
refetch de Biblioteca. Retirable solo con el fallback y una prueba de
Detalle/back.

### O. `batch.html`

Redirect ejecutable y útil como compatibilidad; conservar. Su implementación
antigua (61 JS page + 74 JS UI + 10 CSS LOC) no se carga desde ningún HTML. El
registro `main.js → initBatchPage` tampoco puede ejecutarse porque el redirect
no carga main.

### P. `dashboard_tailwind.html`

Legacy huérfana sin enlaces entrantes ni tests, pero es un entry point directo
real de 85 HTML + 195 JS + 29 CSS LOC. No se elimina sin decisión explícita.

### Q. Funciones sin consumer

| Función | JS | HTML/data/global/tests | Resultado |
| --- | --- | --- | --- |
| `renderActividadCierreStatus` | definición | 0 | E: cero consumers |
| `renderActividadCierreControl` | definición | 0 | E: cero consumers |
| `hasInvalidExamQuestionCounts` | definición | 0 | E: cero consumers |
| `renderActividadesEvaluadasHtml` | definición | 0 | E: cero consumers |
| `getExamOptionLabel` | definición | 0 | E: cero consumers |
| `findPlantelIdForGrado` | definición | 0 | E: cero consumers |

### R. Handlers/emitters

Tree emite 7 acciones, breadcrumbs 5 niveles y content 27 acciones; todas las
emitidas tienen handler. No hay emitter sin handler. Hay siete handlers sin
emitter: `archive-batch` y seis `delete-*`; candidatos, no eliminados.

### S. DOM legacy

57 hooks en siete superficies: onboarding/sidebar/path, entity modal, Examen
legacy, Lista legacy y delete/archive. Preview modals, Quick y
`#explorer-content` son compartidos/vigentes y se excluyen. CSS por prefijo no
es eliminable indiscriminadamente porque hero/card/content/progress se comparte.

### T. Globals/wrappers

Explorer/CRUD aportan 47 bindings implícitos; quedan `explorerState`, modo,
facades, init, namespaces y siete aliases. Los seis wrappers Dashboard tienen
consumers. Cleanup completo se entrega a Fase 10.

### U. Candidatos eliminables

- Seguro probable: implementación Batch no cargada y seis funciones con cero consumers.
- Requiere corte previo: siete ramas sin emitter y DOM/CSS exclusivamente legacy.
- Requiere más evidencia/decisión: fallback completo, Explorer, CRUD,
  generation/archive visual y Tailwind.
- No eliminable: jerarquía técnica, Quick, Biblioteca, previews/downloads,
  Detalle, estado mixto, Archivados y redirect Batch.

### V. Riesgos

Blockers: ninguno para 9.1. No bloqueantes: bindings léxicos, `pageshow` con
efecto real, asset failure como fallback accidental, estado mixto, registry
histórico y posibles bookmarks externos no observables en el repo.

### W. Roadmap Fase 9

9.1 Batch sin entry point; 9.2 hojas cero-consumer/handlers sin emitter; 9.3
fallback visual coordinado; 9.4 auditoría formal. Fase 10 no se abre.

### X. 9.1 recomendada

Eliminar `batch.page.js`, `batch.ui.js`, `batch.css` y la entrada inalcanzable
de `initBatchPage` en `main.js`; conservar `batch.html` redirect. Es un único
corte reversible con cero HTML consumidor.

### Y. Manual futura

Dashboard/Biblioteca, Quick Create, Agregar Tema, Detalle/back, previews
Examen/Lista, generación, deletes vigentes, reload y consola/red. No pedir probar
UI deliberadamente retirada. Para 9.1, comprobar además URL Batch → Dashboard.

### Z. Documentación

Solo `ARCHITECTURE.md`, `FRONTEND_MAP.md`, `REFACTOR_ROADMAP.md`, este handoff y
`TEST_MATRIX.md`. Código, HTML, CSS y backend intactos.

### AA. Validaciones

- `npm test -- --runInBand`: PASS, 7 suites/22 pruebas, 0 snapshots.
- `git diff --check`: PASS.
- `git diff --name-only`: exclusivamente los cinco documentos autorizados.
- Backend: `refactor-back`/`fe25abe`, limpio y sin cambios.
- Prueba manual: no requerida; 9.0 no modifica runtime.

### AB. Estado final

```text
Fase 8: Completada
Fase 9: En progreso
Sesión 9.0: Auditoría completada
Implementación funcional: no
Manual: no requerida
Commit: no
Push: no
Working tree: cinco documentos
```

## Fase 9 — Sesión 9.1: retiro de implementación Batch sin entry point

### A. Gate

```text
rama: refactor-front
HEAD: 73d52b4
hash 9.0: 73d52b4 docs(refactor): open controlled legacy removal phase
working tree inicial: limpio
backend: refactor-back / fe25abe / limpio / solo lectura
puerta: PASS
```

### B. Reconciliación 9.0

Fase 8 completada. Fase 9 en progreso. 9.0 fue aprobada, no requirió manual y
quedó commiteada en `73d52b4`. Su primer corte recomendado se revalidó antes de
editar.

### C. Auditoría Batch previa

| Asset | Entry point | Consumers | Cargado | Resultado |
| --- | --- | --- | --- | --- |
| `pages/batch.html` | URL/bookmark/link histórico | redirect del navegador | directo | preservar |
| `js/pages/batch.page.js` | ninguno | solo UI Batch retirada | ningún HTML | eliminar |
| `js/ui/batch.ui.js` | ninguno | solo page Batch retirada | ningún HTML | eliminar |
| `css/batch.css` | ninguno | dos selectores Batch autónomos | ningún HTML | eliminar |
| `main.js → initBatchPage` | ninguno | init map inalcanzable | Batch no carga main | eliminar entrada |

### D. `batch.html`

`pages/batch.html` permanece sin cambios. Contiene meta refresh a
`dashboard.html`, `window.location.replace("dashboard.html")` y enlace
`noscript` al mismo destino. Una query o hash de entrada no se preserva porque
el target histórico es explícito; no se modernizó el redirect.

### E. `main.js`

El mapping previo asociaba `"batch.html"` con `window.initBatchPage`, pero la
página redirect no carga `main.js`. Se eliminó solo esa propiedad. La inclusión
de `batch.html` en `isPrivatePage()` permanece y no constituye dispatch.

### F. Consumer audit

No había tags HTML, callers, globals externos ni tests de entrada productiva
para los tres assets. Los links a `batch.html` son referencias al redirect y se
conservaron. La búsqueda posterior deja cero referencias productivas a los
assets o `initBatchPage`.

### G. Decisión

```text
A. Retiro seguro.
```

### H. Implementación

```text
archivos eliminados:
- css/batch.css
- js/pages/batch.page.js
- js/ui/batch.ui.js

archivos productivos modificados:
- js/main.js (una propiedad retirada)

test añadido:
- tests/batch-compatibility.smoke.test.js
```

### I. Métricas

145 LOC de assets y una línea de mapping eliminadas: 146 LOC productivas. Se
retiraron 6 funciones, 0 listeners, 11 operaciones DOM, 2 referencias API, 6
bindings globales clásicos implícitos y 6 publicaciones `window.*`.

### J. Referencias post-change

Producción contiene cero `batch.page.js`, `batch.ui.js`, `batch.css`,
`initBatchPage`, `BatchUI`, `BatchPage` y `batchState`. El smoke contiene los
nombres únicamente para comprobar ausencia. Documentación los conserva como
evidencia de retiro.

### K. Tests

Baseline: 7 suites/22 pruebas PASS. Final: 8 suites/24 pruebas PASS. Sintaxis de
`js/main.js` y del smoke PASS.

### L. Smoke Batch

`tests/batch-compatibility.smoke.test.js`: 1 suite/2 pruebas PASS. Verifica
redirect meta/script/noscript, ausencia de tags a assets, inexistencia física de
los tres archivos y ausencia del dispatch `initBatchPage`.

### M. Arquitectura

```text
antes: URL Batch → redirect; implementación histórica huérfana en disco
después: URL Batch → redirect → Dashboard/Biblioteca; sin implementación huérfana
```

### N. Scope protegido

`pages/batch.html`, destino Dashboard, links históricos, Dashboard page,
Tailwind, Explorer/CRUD, fallback, storage/pageshow, Quick, Biblioteca, Detalle,
generación, previews, Archivados, APIs, payloads, `wordExport.js`, backend y DB
permanecen sin cambios.

### O. Manual pendiente

1. Abrir `/batch.html`: debe redirigir a Dashboard y cargar Biblioteca.
2. Abrir `/batch.html?id=test`: debe continuar redirigiendo; no se exige
   preservar la query.
3. Entrar por login/Dashboard: Biblioteca, bloques y tabs operativos.
4. Abrir y cerrar Quick Create, sin generar IA.
5. Abrir una planeación y volver a Dashboard/Biblioteca.
6. Confirmar en consola/red: sin 404 de los tres assets, sin ReferenceError de
   `initBatchPage` y sin errores nuevos.

### P. Documentación

Actualizados los cinco archivos autorizados: `ARCHITECTURE.md`,
`FRONTEND_MAP.md`, `REFACTOR_ROADMAP.md`, este handoff y `TEST_MATRIX.md`.

### Q. Riesgos

Blockers: ninguno. No bloqueantes: bookmarks externos no observables y pérdida
histórica de query/hash al redirigir. No se corrigieron porque forman parte del
contrato previo. 9.2 permanece pendiente.

### R. Estado final

```text
Fase 9: En progreso
9.0: completada/commiteada en 73d52b4
9.1: implementada
Manual 9.1: pendiente
Commit 9.1: no
Push: no
9.2: no iniciada
```

## Fase 9 — Sesión 9.2: funciones cero-consumer y branches sin emitter

### A. Gate

```text
rama: refactor-front
HEAD/hash 9.1: 9496303 refactor(frontend): remove orphaned Batch implementation
working tree inicial: limpio
backend: refactor-back / fe25abe / limpio / solo lectura
puerta: PASS
```

### B. Reconciliación 9.1

9.0 completada en `73d52b4`. 9.1 fue aprobada manualmente y commiteada en
`9496303`. La evidencia recibida confirma únicamente que Dashboard/Biblioteca
carga, los bloques cargan sin errores y no se observaron errores posteriores al
retiro. `pages/batch.html` permanece como redirect.

### C. Baseline

Dashboard: 2564 LOC, 120 funciones y 292 refs a `explorerState`. Explorer: 1188
LOC. Jest baseline: 8 suites/24 pruebas PASS.

### D. Grupo A audit

| Función | Consumers productivos | Resultado |
| --- | --- | --- |
| `renderActividadCierreStatus` | solo definición | ZERO_CONSUMER |
| `renderActividadCierreControl` | solo definición | ZERO_CONSUMER |
| `hasInvalidExamQuestionCounts` | solo definición | ZERO_CONSUMER |
| `renderActividadesEvaluadasHtml` | solo definición | ZERO_CONSUMER |
| `getExamOptionLabel` | solo definición | ZERO_CONSUMER |
| `findPlantelIdForGrado` | solo definición | ZERO_CONSUMER |

La búsqueda incluyó JS, HTML, CSS/strings, `data-*`, globals, aliases, callbacks,
tests y documentación. No había Quick/Biblioteca consumer. Tras el retiro se
revalidaron tres hojas derivadas: `getActividadCierreSelectLabel`,
`getActividadCierreSelectWidth` y `findTemaById`, todas en cero.

### E. Grupo A decisión

```text
eliminadas: las seis candidatas + tres helpers privados derivados
preservadas: ninguna candidata
helpers/constantes compartidos: preservados
```

### F. Grupo B audit

| Action | Emitter productivo/test | Handler/state previo | Side effects previos | Resultado |
| --- | --- | --- | --- | --- |
| `archive-batch` | ninguno/ninguno | archive config + confirm | API archive batch + refresh | retirado |
| `delete-plantel` | ninguno/ninguno | delete config + confirm | API + refresh | retirado |
| `delete-grado` | ninguno/ninguno | delete config + confirm | API + refresh | retirado |
| `delete-materia` | ninguno/ninguno | delete config + confirm | API + refresh | retirado |
| `delete-unidad` | ninguno/ninguno | delete config + confirm | API + refresh | retirado |
| `delete-tema` | ninguno/ninguno | delete config + confirm | API + refresh | retirado |
| `delete-planeacion` | ninguno/ninguno | delete config + confirm | API + refresh | retirado |

No había HTML, template, tree, breadcrumb, card, onboarding, context menu,
callback dinámico, alias ni test que emitiera estas acciones.

### G. `confirmDelete`

```text
renderActionButton archive
→ handleContentClick
→ requestArchiveAction/getArchiveDialogConfig
→ openDeleteConfirm
→ explorerState.confirmDelete
→ render modal / Bootstrap close-Escape-submit
→ submitDeleteConfirm
→ archive service / registry / refresh
```

`open`, `type`, `id`, `parentIds`, textos, labels, tonos, `busy` y `error`
mantienen writers/readers en las cinco rutas archive. State, shape, DOM y
listeners se preservaron; no se reescribió el modal.

### H. Archive vigente

`archive-plantel`, `archive-grado`, `archive-materia`, `archive-unidad` y
`archive-planeacion` conservan emitter generado, handler, config, submit API,
registry para jerarquía y refresh. `archivados.page.js`, HTML, localStorage,
restore y permanent delete permanecen sin diff.

### I. Grupo B decisión

```text
branches eliminadas: archive-batch + seis delete-*
branches preservadas: cinco archive-* con emitter real
confirmDelete: preservado
```

Se retiraron también los tres owners exclusivos de la cadena delete:
`getDeleteDialogConfig`, `requestDeleteAction` y
`refreshAfterHierarchyDelete`. Services/endpoints permanecieron intactos.

### J. Implementación

Productivos modificados: `js/pages/dashboard.page.js` y
`js/features/dashboard/legacy-explorer.js`. Test añadido:
`tests/legacy-zero-consumer-removal.smoke.test.js`. No se modificó otro código
productivo.

### K. Métricas

| Métrica | Antes | Después |
| --- | ---: | ---: |
| Dashboard LOC | 2564 | 2274 |
| Funciones Dashboard | 120 | 108 |
| `explorerState` refs Dashboard | 292 | 273 |
| Explorer LOC | 1188 | 1183 |
| Funciones retiradas | 0 | 12 |
| Acciones sin emitter | 7 | 0 |
| DOM/CSS cambiado | 0 | 0 |
| Dispatch API retirado | 0 | 7 call sites |

### L. Consumer audit post-change

Cero definiciones/referencias productivas para las nueve hojas y siete acciones.
Cero `getDeleteDialogConfig`, `requestDeleteAction` o
`refreshAfterHierarchyDelete`. Los cinco archive vigentes conservan emitter y
handler. Los nombres retirados solo permanecen en documentación y en el smoke
que comprueba ausencia.

### M. Tests

Baseline: 8 suites/24 pruebas PASS. Final: 9 suites/27 pruebas PASS. Sintaxis
Dashboard, Explorer y smoke PASS.

### N. Smoke

`legacy-zero-consumer-removal.smoke.test.js`: 1 suite/3 pruebas PASS. Comprueba
hojas ausentes, siete acciones imposibles ausentes, cinco archives completos,
modal confirm preservado y cinco deletes Biblioteca emitter+handler.

### O. Quick/Biblioteca

Quick y Biblioteca no tienen diff. Búsqueda source-level confirma cero consumo
de Grupo A/B. Biblioteca conserva `eliminar-bloque`, `eliminar-planeacion`,
`eliminar-examen`, `eliminar-lista` y `eliminar-anexo` en render/events.

### P. Scope protegido

Sin cambios: Quick, Biblioteca, CRUD, Bootstrap, Archivados, generation,
previews/downloads, Detalle, services/APIs/payloads, DOM/CSS, `explorerState`
shape, pageshow, sessionStorage, `wordExport.js`, backend y DB.

### Q. Manual pendiente

1. Dashboard/Biblioteca: carga, bloques, tabs, search y reload.
2. Quick Create: abrir/cerrar y Agregar Tema; IA no obligatoria.
3. Abrir una planeación y volver.
4. Ejecutar al menos un delete vigente de Biblioteca si hay recurso de prueba.
5. No activar archive legacy artificialmente; source/smoke basta sin acceso
   natural.
6. Consola/red: sin ReferenceError, handler undefined, 404, doble listener ni
   error nuevo.

### R. Handoff 9.3

Permanecen: cinco `Quick → renderExplorerContent`, uno
`Quick → selectUnidad`, archive refresh → `selectPlantel/selectGrado/selectMateria`
y `pageshow → refreshExplorerAfterReturn → select*` indirecto desde Bootstrap.
9.3 debe resolverlos antes de retirar fallback, Explorer/CRUD, generation
legacy, DOM, sessionStorage o pageshow.

### S. Documentación

Actualizados los cinco documentos autorizados: `ARCHITECTURE.md`,
`FRONTEND_MAP.md`, `REFACTOR_ROADMAP.md`, este handoff y `TEST_MATRIX.md`.

### T. Riesgos

Blockers: ninguno técnico. No bloqueantes: archive solo tiene entrada natural
en fallback, `confirmDelete` conserva nombre histórico, crossings de Quick y
pageshow siguen activos. No justifican ampliar 9.2.

### U. Estado final

```text
Fase 9: En progreso
9.0: completada
9.1: completada/commiteada/manual aprobada (9496303)
9.2: completada/commiteada/manual aprobada (7cca74e)
Manual 9.2: aprobada
Commit 9.2: 7cca74e
Push: no
9.3: iniciada; ver sección siguiente
```

## Sesión 9.3 — Retiro coordinado del fallback visual

### Gate y reconciliación

- Frontend: `refactor-front`, HEAD inicial `7cca74e`, árbol limpio.
- 9.2: manual aprobada y commit real `7cca74e`.
- Backend: `refactor-back`, `fe25abe`, limpio y solo lectura.
- Evidencia 9.2: Planeación 1/0/0; Anexo success; Lista 1/0; Examen 11/11,
  cero fallidas, un retry; Agregar Tema 1/0; sin errores nuevos.

### Decisión y cruces

Decisión A: retiro completo. Los cinco `Quick → renderExplorerContent` eran un
bridge a Biblioteca y migraron a `BibliotecaRender.renderContent`. El único
`Quick → selectUnidad` mezclaba selección técnica y render visual; se sustituyó
por el mismo objeto `explorerState.current`. El reset root de `loadPlanteles`
también usa asignación técnica directa.

No existe archive en Biblioteca. Sus cinco emitters vivían únicamente en
Explorer, por lo que UI, confirmación, branches y refresh Dashboard quedaron
sin entry point y fueron retirados. Services, registry/localStorage y
Archivados no cambiaron. Biblioteca posee loader/reconciliation propio; el
`pageshow` que rehidrataba Explorer era redundante para Detalle/back y se retiró
sin bridge sustituto.

### Implementación

Eliminados: `legacy-explorer.js`, `legacy-hierarchy-crud.js`,
`components/sidebar.html` y sus dos smokes. `dashboard.html` ya no carga esos
scripts. `layout.html` conserva hero, Biblioteca, Quick y previews; elimina
tree, breadcrumbs, onboarding, CRUD, generación y archive legacy. CSS elimina
59 reglas exclusivas. Los previews apuntan a sus owners vigentes y su scroll
lock ya no consulta modales retirados.

Jerarquía técnica preservada: planteles, grados, materias, unidades, temas,
loaders, caches, IDs y contratos. Generation owners, polling/SSE, downloads,
Detalle, Quick, Biblioteca, Batch, `dashboard_tailwind.html`, Archivados,
backend, DB, APIs, payloads y `wordExport.js` permanecen.

### Métricas y pruebas

| Métrica | Antes | Después |
| --- | ---: | ---: |
| Dashboard LOC/funciones | 2274 / 108 | 464 / 32 |
| Explorer LOC/funciones | 1183 / 42 | 0 / 0 |
| CRUD LOC/funciones | 234 / 5 | 0 / 0 |
| Bootstrap LOC/listeners | 286 / 25 | 99 / 5 |
| Layout IDs | 104 | 51 |
| CSS LOC/reglas | 2257 / 294 | 1841 / 235 |
| `explorerState` refs auditadas | 585 | 160 |

Baseline: 9 suites/27 pruebas PASS. Final: 8 suites/24 pruebas PASS. La reducción
es deliberada: se retiraron dos suites/6 pruebas de UI eliminada y se añadió una
suite/4 pruebas de ausencia/contrato. `node --check` y diff checks pasan.

### Manual pendiente al entregar 9.3 (snapshot histórico)

1. Dashboard/Biblioteca: login, bloques, search, tabs, cambio de bloque, reload.
2. Quick: crear bloque con una planeación y validar pending/feedback/success.
3. Agregar Tema a batch existente y confirmar reutilización.
4. Detalle/back con navegador: Biblioteca correcta y sin Explorer visual.
5. Preview/download de Examen y Lista; cerrar y reabrir.
6. Generar Anexo, Lista y Examen; Planeación queda cubierta por Quick.
7. Eliminar Examen, Lista, Anexo y planeación/batch de prueba según datos.
8. Consola/red: sin ReferenceError, undefined, 404, request/listener/render
   duplicado ni error nuevo. `public.ia_metrics` continúa como issue externo no
   bloqueante.

### Estado al entregar 9.3 (snapshot histórico; supersedido por 9.4)

```text
Fase 9: En progreso
9.0: completada
9.1: completada
9.2: completada/commiteada/manual aprobada (7cca74e)
9.3: implementada
Manual 9.3: pendiente
Commit 9.3: no
Push: no
9.4: recomendada/no iniciada
```

## Sesión 9.4 — Auditoría formal de cierre de Fase 9

### A. Gate y sesiones

- Frontend: `refactor-front`, HEAD inicial `7393909`, working tree limpio.
- Backend: `refactor-back`, HEAD `fe25abe`, limpio y solo lectura.
- Commits: 9.0 `73d52b4`; 9.1 `9496303`; 9.2 `7cca74e`; 9.3 `7393909`.
- 9.3: manual aprobada con la evidencia entregada por el usuario.

| Sesión | Commit | Manual | Estado |
| --- | --- | --- | --- |
| 9.0 | `73d52b4` | no requerida | completada |
| 9.1 | `9496303` | aprobada | completada |
| 9.2 | `7cca74e` | aprobada | completada |
| 9.3 | `7393909` | aprobada | completada |
| 9.4 | sin commit | auditoría documental | completada |

### B. Decisión de cierre

El objetivo canónico se cumplió: todo retiro de Fase 9 estuvo precedido por
prueba de cero consumers y no se reescribieron jerarquía técnica, contratos,
Archivados, globals ni estado general. Decisión **A. Fase 9 puede cerrarse**.

Superficie retirada y revalidada: Batch huérfano, seis funciones candidatas y
hojas derivadas, siete branches sin emitter, Explorer/CRUD visual, fallback
Bootstrap, tree/breadcrumbs/onboarding, archive Dashboard, UI de generación
legacy, DOM/CSS exclusivo, `pageshow` Explorer y
`educativo.dashboard.last-location`.

### C. Arquitectura y métricas finales

```text
dashboard.html
└─ Bootstrap (Biblioteca obligatoria)
   ├─ QuickCreate → jerarquía técnica/IDs/caches/loaders
   ├─ Biblioteca → State/Loader/Render/ModalRender/Events
   └─ generation + previews/downloads

Compatibilidad separada
├─ batch.html redirect
├─ dashboard_tailwind.html URL directa
└─ Archivados + registry/localStorage/services
```

| Métrica | Inicio F9 | Final F9 | Delta |
| --- | ---: | ---: | ---: |
| Dashboard LOC/funciones | 2564 / 120 | 464 / 32 | -2100 / -88 |
| Explorer LOC/funciones | 1188 / 42 | 0 / 0 | -1188 / -42 |
| CRUD LOC/funciones | 234 / 5 | 0 / 0 | -234 / -5 |
| `explorerState` refs auditadas | 604 | 160 | -444 |
| Layout IDs | 104 | 51 | -53 |
| CSS LOC/reglas | 2257 / 294 | 1841 / 235 | -416 / -59 |
| Scripts exclusivamente legacy | 2 | 0 | -2 |
| Hooks DOM exclusivamente legacy | 53 | 0 | -53 |
| `window.*` en cinco superficies | 7 | 4 | -3 |
| Suites/tests | 7 / 22 | 8 / 24 | +1 / +2 |

### D. Dashboard residual y jerarquía técnica

Las 464 LOC se clasifican en: shape físico de `explorerState`; caches/loaders
jerárquicos; helpers técnicos compartidos; payload, staging y progress de Quick
/generation; soporte de previews; y publicación global compatible. No queda UI
Explorer grande.

| Slice/propiedad | Consumer vigente | Estado | F10 |
| --- | --- | --- | --- |
| `planteles`, `gradosByPlantel`, `materiasByGrado`, `unidadesByMateria` | Quick + loaders Dashboard | técnica activa | revisar owner/nombre |
| `temasByUnidad` | `ensureTemas`, invocado por Quick | cache técnica | revisar cache |
| `loading`, `errors`, `current` | loaders Dashboard + Quick | técnica activa | posible consolidación |
| staging + `progress` + `quickCreate` + `generating` | Quick, BibliotecaLoader, Bootstrap | activa | revisar frontera |
| `examenDetalleById`, `examPreview`, `listaCotejoPreview` | preview/download owners + Bootstrap | activa | revisar compatibilidad |
| `expanded*`, search Explorer, modal/generation legacy, `confirmDelete` | ninguno | eliminadas | no aplica |

`loadPlanteles()` y `ensureGrados/Materias/Unidades/Temas()` permanecen porque
Quick depende de ellos. Biblioteca no usa esas caches directamente: mantiene
State/Selection/Tabs/Pending, Loader, Render, Modal Render y Events propios.

### E. Globals, wrappers y orden clásico

| Global/bridge | Owner | Consumer | Clasificación F10 |
| --- | --- | --- | --- |
| `window.explorerState` | Dashboard | Quick/previews/Bootstrap | estado técnico con nombre histórico |
| `window.QuickCreate` | Quick | Bootstrap | namespace activo |
| `window.biblioteca` | Biblioteca | Quick | bridge activo de pending/reconcile |
| `window.initBiblioteca` | Biblioteca | Bootstrap | entry clásico activo |
| `BibliotecaLoader/Render/ModalRender/Events` | Biblioteca modular | Biblioteca/Quick | namespaces activos |
| `AppUI`, `statusLabelFromTone`, `renderProgressPill` | shared UI | Quick/Biblioteca | aliases compatibles |
| generation/preview/download namespaces | feature owners | Biblioteca/Bootstrap | activos |
| wrappers `bib*`, preview/download y loader | Biblioteca page | Events/features | migrar antes de retirar |
| `renderBibliotecaContent` | BibliotecaRender | Quick/features clásicos | bridge activo |

`dashboard.html` tiene 43 scripts, cero rutas locales inexistentes y cero tags
a archivos retirados. El orden clásico es válido; APIs/services y owners se
cargan antes de sus consumidores, Biblioteca completa antes de `main.js`. El
orden y los contratos léxicos se auditarán en Fase 10, no se cambiaron en 9.4.

### F. DOM, CSS y data-actions

`layout.html` conserva Biblioteca, Quick, previews y chrome. No contiene tree,
breadcrumbs, entity modal, onboarding, archive Dashboard ni modales de
generación legacy. Los selectores con prefijo `explorer-*` que permanecen sí
tienen consumers en layout, Quick, AppUI o Archivados; `delete-confirm` es de
Archivados. No se hizo cleanup CSS adicional.

Los 20 emitters finales `data-bib-action` tienen handler. No existen emitters
huérfanos ni actions del fallback eliminado. Tres handlers sin emitter
(`toggle-expand`, `generar-anexo`, `regenerar-anexo`) son compatibilidad de
Biblioteca ya documentada y se transfieren a Fase 10 sin eliminarlos.

### G. Owners y compatibilidad preservada

- Generation: `PlaneacionGeneration`, `AnexoGeneration`,
  `ListaCotejoGeneration`, `ExamGeneration` activos.
- Preview/download: `ExamPreview`, `ExamDownload`, `ListaCotejoPreview`,
  `ListaCotejoDownload` activos y con consumers.
- Detalle/back: sin `pageshow` Explorer; Biblioteca/loader y navegador conservan
  ownership. La manual general 9.3 no reportó regresiones.
- Batch: `pages/batch.html` preservado y smoke PASS; assets/init ausentes.
- Archive: UI Dashboard eliminada; Archivados, registry/localStorage, services y
  endpoints preservados.
- `dashboard_tailwind.html`: sin cambios; legacy ejecutable por URL directa,
  decisión futura no bloqueante.
- `wordExport.js`, API, payloads, backend y DB: intactos.

### H. Evidencia y validaciones

Evidencia manual real 9.3: Dashboard/Biblioteca carga correctamente; los bloques
aparecen donde deben; no se detectaron problemas tras el retiro. Planeación
1/0/0; Agregar Tema reutilizó batch y terminó 1/0; Anexo success; Lista 1/0;
Examen 11/11, cero fallidas y un retry; deletes de Examen, Lista, Anexo,
Planeación y Batch exitosos.

Automatización: 8/8 suites y 24/24 pruebas PASS. `node --check` PASS en
Dashboard, Bootstrap, Quick, Biblioteca page/render/events y previews de Examen
y Lista. Consumer audit: cero referencias productivas a todos los nombres
retirados. El error `public.ia_metrics` es externo, preexistente, no bloqueante
y fuera de F9.

### I. Handoff Fase 10

Fase 10 permanece pendiente/no iniciada. Su frontera exacta es: nombre y slices
residuales de `explorerState`; globals; wrappers; aliases; bridges; namespaces;
dependencias léxicas cross-script; script order; compatibilidad
Biblioteca/Quick; compatibilidad de previews; y limpieza del namespace global.
También debe reclasificar los tres handlers Biblioteca sin emitter. No incluye
retomar Explorer, retirar jerarquía técnica ni refactorizar Archivados.

### J. Estado final

```text
Fase 9: Completada
Sesión 9.4: Completada
Auditoría de cierre: Aprobada
Fase 10: Pendiente / no iniciada
Commit 9.4: no
Push: no
Working tree: cinco documentos autorizados
```

## Fase 10 — Sesión 10.0: auditoría técnica/documental de apertura

### A. Gate

```text
rama: refactor-front
HEAD: aa56e06 (igual a origin/refactor-front)
cierre F9: 9.0 73d52b4; 9.1 9496303; 9.2 7cca74e; 9.3 7393909; 9.4 b6eb40e; cierre acumulativo aa56e06
working tree: limpio al abrir
backend: refactor-back / fe25abe / limpio / solo lectura
puerta: PASS; Fase 10 pasa de Pendiente a En progreso
```

### B. Objetivo F10

Cerrar la arquitectura de compatibilidad posterior al retiro del Explorer,
eliminando únicamente wrappers, aliases, bridges, globals, handlers y branches
redundantes con evidencia de consumer; conservar contratos útiles, jerarquía
técnica y owners vigentes. No es reescritura, migración de módulos/framework ni
rewrite de estado.

### C. Baseline

| Superficie | Métrica real |
| --- | ---: |
| Dashboard | 464 LOC / 32 funciones |
| Quick Create | 1406 LOC / 54 funciones |
| Dashboard Bootstrap | 99 LOC / 4 funciones |
| Biblioteca page / Loader / Render / Modal / Events | 1110 / 233 / 651 / 683 / 160 LOC |
| Exam Preview / Download | 256 / 248 LOC |
| Lista Preview / Download | 108 / 36 LOC |
| Explorer / CRUD | archivos eliminados |
| Jest | 8 suites / 24 tests PASS |

Evidencia manual acumulada aprobada de F9, no repetida en 10.0: Dashboard y
Biblioteca cargan; bloques y Quick correctos; Agregar Tema correcto; Planeación
1/0/0; Anexo success; Lista 1/0; Examen 11/11, 0 fallidas, 1 retry; cinco deletes
de recursos/bloque success; sin errores nuevos.

### D. `explorerState`

| Grupo / propiedad | Writer | Reader | Owner conceptual | Estado F10 |
| --- | --- | --- | --- | --- |
| `planteles`, cuatro caches jerárquicos | Dashboard loaders | Dashboard/Quick | technical Dashboard | F, activo |
| `loading`, `errors`, `current` y cinco IDs | Dashboard/Quick | Dashboard/Quick | technical Dashboard + Quick | F, activo |
| `stagingTemas`, `stagingTituloConjunto`, `stagingContext` | Quick | Quick/generation | Quick | A |
| `progress` completo | Quick/Dashboard helper | Quick/Loader/Render | Quick + generation | B/F |
| `quickCreate` completo | Quick | Quick/Bootstrap/previews | Quick | A |
| `generating` | Quick | Quick guard | generation Quick | A |
| `examenDetalleById`, `examPreview` | Exam owners | Exam/Bootstrap | Preview owner | B/F |
| `listaCotejoPreview` | Lista Preview | Lista/Bootstrap | Preview owner | B/F |

Shape completo: 17 top-level, 53 paths declarados y 207 referencias
productivas. Es store real compartido físicamente por ocho archivos y, a la
vez, contenedor histórico de cinco slices conceptuales. No se mueve, renombra
ni sustituye en 10.0. La tabla de cada path está en `FRONTEND_MAP.md`.

### E. Globals

| Alcance | Resultado |
| --- | ---: |
| Publicaciones explícitas `window.*` repo | 174 |
| Publicaciones cargadas por Dashboard | 147 |
| Tokens `window.` JS / HTML / tests | 422 / 2 / 166 |
| Publicaciones sin consumer externo | 35; requieren revisión individual |
| Inline HTML consumers | 0 |

Owners y nombres completos están inventariados por archivo en
`FRONTEND_MAP.md`. Prioritarios: `explorerState` F; `BIBLIOTECA_MODE` C;
`biblioteca` B; `renderBibliotecaContent` B; `QuickCreate` A/D;
`BibliotecaLoader` A/B; `initBiblioteca` e `initDashboardPage` A.
`window.BibliotecaRender`, `window.BibliotecaModalRender` y
`window.BibliotecaEvents` no existen: sus owners son léxicos.

### F. Namespaces

| Namespace | Surface | Clasificación |
| --- | --- | --- |
| Generation x4 | un `generateFromBiblioteca` por owner | A |
| Exam Preview/Download | 3 / 2 métodos | A |
| Lista Preview/Download | 3 / 2 métodos | A |
| AppUI | 6 métodos | A |
| QuickCreate | 5 métodos; dos sin consumer | A/D |
| BibliotecaLoader | 5 métodos | A/B |
| BibliotecaRender/ModalRender/Events | 4 / 6 / 4 métodos léxicos | A; no `window` |

### G. Wrappers

Hay 21 wrappers de compatibilidad: cinco Loader/Reconcile; 15 de actions
Biblioteca (preview/download/delete, incluidos dos sin consumer); y
`downloadExamWord`. Todos tienen owner real identificado. 10.1 puede retirar
los 15 de actions tras migrar Events/modal; 10.2 recibe los cinco Loader y el
wrapper de Examen. Ninguno se retiró en 10.0.

### H. Aliases

| Alias | Target | Consumer | Estado |
| --- | --- | --- | --- |
| `statusLabelFromTone` | `AppUI.statusLabelFromTone` | Quick/Loader | B→C tras migración |
| `renderProgressPill` | `AppUI.renderProgressPill` | Render | B→C tras migración |

No se cuentan namespace methods ni publicaciones homónimas como aliases.

### I. Bridges

Seis familias: Quick→facade Biblioteca; Quick→render Biblioteca;
Biblioteca→Preview; Biblioteca→Download; Generation→Loader/Reconcile; y
Bootstrap→Quick/Biblioteca. El bridge de render contiene el hallazgo más
importante: cinco calls opcionales a `window.BibliotecaRender` sin writer y un
caller real de `window.renderBibliotecaContent`.

### J. Lexical cross-script contracts

164 símbolos, 74 edges archivo→archivo; 31 edges usan provider cargado después
y afectan 13 consumers. Dashboard/API/service/Biblioteca dependen del scope
clásico. La tabla agrupada completa está en `FRONTEND_MAP.md`. No se convierte
a ESM ni se fuerza migración global.

### K. Script order

`dashboard.html`: 43 tags, 42 locales + CDN; cero rutas faltantes. 33 scripts
consumen bindings implícitos; cinco consumen solo globals/namespaces explícitos;
cuatro no tienen dependencia interna como consumer. Nueve son léxicamente
desacoplados como consumers, pero varios son providers y no se mueven. Orden
intacto en 10.0.

### L. `main.js`

Pages: Dashboard, Planeación, Detalle, Archivados, Login. `isPrivatePage`
incluye Dashboard, Planeación, Detalle, Batch y Archivados. Cuatro mappings son
alcanzables; `planeacion.html → planeacionPage.init` es huérfano porque el HTML
redirige y no carga `main.js`. Batch conserva solo su clasificación privada y
redirect; no se toca.

### M. Dashboard Bootstrap

Owner de init, layout injection, private chrome, bind Quick, previews,
downloads, Escape, `BIBLIOTECA_MODE` e init Biblioteca. `isDashboardBound`
protege el binding. No contiene fallback Explorer ni wrappers históricos. Sí
consume cuatro bindings bare (`explorerState`, `downloadExamWord`,
`notifyDashboard`, `formatFetchError`).

### N. Quick Create public surface

| Method | Consumer | Internal/external | Required | Candidate private |
| --- | --- | --- | --- | --- |
| `open` | Events + smoke | external | sí | no |
| `close` | Bootstrap + smoke | external | sí | no |
| `bind` | Bootstrap + smoke | external | sí | no |
| `setPanelVisibility` | ninguno | export de helper activo interno | no externo | sí, D |
| `generateFromStaging` | ninguno | export de flujo activo interno | no externo | sí, D |

### O. Biblioteca public surface

`window.biblioteca` es facade de siete miembros requerida por Quick; tres
miembros principales (`getConjuntos`, start/set pending, finish/pending ID) son
activos y `selectConjunto`/`refresh` son fallbacks redundantes probables.
Bootstrap necesita `initBiblioteca`; Quick necesita facade y el bridge de
render; HTML no consume globals inline; generation/delete owners necesitan
state y helpers léxicos. Loader es `window`; Render/Modal/Events son léxicos.

### P. Preview/download compatibility

De siete bridges preservados en F8 solo `downloadExamWord` existe hoy; los
otros seis fueron retirados en F9. Los namespaces Preview/Download tienen
consumers reales. Biblioteca conserva cinco wrappers de apertura/descarga y un
wrapper de cierre Anexo migrables en 10.1. Lista Word depende de
`wordExport.js`, protegido.

### Q. Generation compatibility

Los cuatro namespaces generation son owners activos y consumidos por
Biblioteca. Internamente dependen de state/render/Loader léxicos declarados más
tarde. Quick usa su flujo de jerarquía técnica y facade Biblioteca, no reabre
F4. Payloads, polling, SSE, jobs y métricas permanecen intactos.

### R. AppUI compatibility

`AppUI` es owner público real. Quick/Loader/Render todavía usan dos aliases
bare; pueden migrarse a `window.AppUI` en 10.2 y retirar aliases después. Los
otros cuatro métodos ya se consumen desde el namespace.

### S. Handlers/emitters

20 emitters con handler; cero emitters huérfanos; tres handlers sin emitter:
`toggle-expand`, `generar-anexo`, `regenerar-anexo`. Búsqueda exhaustiva en
HTML, templates, innerHTML, `data-*`, tests y globals: zero-emitter confirmed,
clasificación D, candidatos 10.1.

### T. Listeners

102 sites repo / 72 Dashboard. `BibliotecaEvents.bind()` no tiene guard interno:
se llama una vez en el entry normal, pero una segunda llamada pública a
`initBiblioteca` duplicaría el listener. Preview Examen/Lista y Bootstrap tienen
guard; Anexo reemplaza nodos. `showBibConfirm` puede acumular listener backdrop
`once` si se cierra por otro botón. Riesgos no corregidos en 10.0.

### U. `BIBLIOTECA_MODE`

Un writer y 23 referencias; Quick es su único reader productivo. Siempre es
`true` en Dashboard tras F9. Contract histórico C y candidato 10.2; no se
elimina todavía.

### V. Defensive compatibility branches

Activos/legítimos: guard de `initBiblioteca`, private chrome, Supabase y
Archivados. Históricos/redundantes: fallbacks de facade siempre completa,
optional Quick→`window.BibliotecaRender` sin provider, aliases download/AppUI y
ramas false de `BIBLIOTECA_MODE`. No hay catch dedicado solo a ocultar un owner
ausente.

### W. Zero-consumer candidates

Dos wrappers page, tres handler branches y dos implementaciones Anexo, dos
exports Quick, mapping `planeacionPage`, assets Planeación sin entry y 35
publicaciones sin consumer externo. No se borran en lote: algunos owners siguen
activos internamente y algunas páginas son G/outside.

### X. Redundant compatibility candidates

15 wrappers de action después de migrar Events; dos aliases AppUI; facade
`select/refresh` fallback; `downloadExamWord`; cinco calls al namespace Render
inexistente; bridge render global después de migrar caller; branches
`BIBLIOTECA_MODE`; miembros Quick sin consumer.

### Y. Active contracts

Jerarquía técnica/current IDs, Quick open/close/bind, facade principal,
Loader, entry globals, generation/preview/download/delete owners, AppUI, 20
actions, 164 bindings mientras tengan consumers, Detalle, Archivados y redirects
protegidos.

### Z. Metrics

```text
dashboard: 464 LOC / 32 functions
explorerState: 17 top-level / 53 paths / 207 product refs
window globals: 174 repo / 147 Dashboard
explicit object surfaces: 21 repo / 20 Dashboard
wrappers: 21
aliases: 2
bridges: 6 families
lexical cross-file symbols: 164 / 74 edges
dashboard scripts: 43
listeners: 102 repo / 72 Dashboard
handlers without emitter: 3
emitters without handler: 0
test-only references among candidates: 2
```

### AA. Roadmap F10

10.1 dispatch Biblioteca→owners y retiro de actions/wrappers demostrados;
10.2 frontera global/Loader/AppUI/render/Quick/Mode/main; 10.3 auditoría formal
de cierre. Máximo dos sesiones funcionales y cierre.

### AB. 10.1 recomendada

Un corte: migrar `BibliotecaEvents` y el backdrop Anexo a namespaces reales;
retirar los 15 wrappers de actions resultantes, los tres handlers sin emitter y
las dos implementaciones Anexo sin entrada. Dejar Loader/Reconcile,
`explorerState`, Mode, script order y listeners fuera del corte.

### AC. Manual futura

- Dashboard/Biblioteca y bloques.
- Quick Create: conjunto existente y nuevo.
- Agregar Tema y Detalle/back.
- Preview/download de Planeación, Anexo, Lista y Examen.
- Generación de los cuatro recursos.
- Deletes de cinco recursos/bloque.
- Reload, consola, red, un clic→una acción y ausencia de duplicados.

### AD. Riesgos

No hay blocker para abrir 10.1. Riesgos no bloqueantes: 164 contratos léxicos;
31 late-provider edges; namespace Render fantasma; listener Events sin guard;
backdrop confirm acumulable; estado Quick/Biblioteca duplicado coordinado;
mapping/asset Planeación sin entry; tests que fijan compatibilidad histórica.

### AE. Documentación

Modificados únicamente: `docs/ARCHITECTURE.md`, `docs/FRONTEND_MAP.md`,
`docs/refactor/REFACTOR_ROADMAP.md`, `docs/refactor/SESSION_HANDOFF.md` y
`docs/refactor/TEST_MATRIX.md`.

### AF. Validaciones

`npm test -- --runInBand`: PASS, 8/8 suites y 24/24 tests. Manual: no requerida.
Gate y búsquedas AST/ripgrep: PASS. Source checks finales se registran al cerrar
el diff; no se modificó código productivo ni backend.

### AG. Estado final

```text
Fase 9: Completada
Fase 10: En progreso
10.0: Auditoría completada
Implementación funcional: no
Manual: no requerida
Commit: no
Push: no
10.1: no iniciada
```

## Fase 10 — Sesión 10.1: migración de actions de Biblioteca

### A. Gate

```text
rama: refactor-front
HEAD/hash 10.0: ec03f94 (docs(refactor): open final compatibility cleanup phase)
working tree al abrir: limpio
origin/refactor-front al abrir: aa56e06
backend: refactor-back / fe25abe / limpio / solo lectura
puerta: PASS
```

### B. Reconciliación 10.0

Fase 9 completada; Fase 10 en progreso; auditoría 10.0 aprobada, commiteada en
`ec03f94` y sin manual requerida. Baseline transferido: 21 wrappers, dos
aliases, 15 wrappers action migrables, tres handlers sin emitter;
`BIBLIOTECA_MODE` y Loader/Reconcile reservados para 10.2.

### C. Baseline

`npm test -- --runInBand`: 8/8 suites, 24/24 pruebas, PASS. Actions: 20
emitters, 23 branches y tres handlers sin emitter. Wrappers: 21.

### D. Wrapper audit

| Wrapper/grupo | Owner | Consumers | Global | Resultado |
| --- | --- | --- | --- | --- |
| cinco Anexo page | Anexo Preview/Download | Events, Modal o cero | no | cinco retirados |
| tres `bibDescargar*` | Download owners | Events | no | retirados |
| dos `openBiblioteca*Preview` | Exam/Lista Preview | Events | no | retirados |
| cinco `bibEliminar*` | Block/Resource Delete | Events | no | retirados |
| cinco Loader/Reconcile | `BibliotecaLoader` | generation/facade/features | no | preservados para 10.2 |
| `downloadExamWord` | `ExamDownload.download` | Bootstrap, ExamDownload, tests | sí | preservado para 10.2 |

La tabla individual de los 16 candidatos está en `FRONTEND_MAP.md`. Los 15
retirados eran passthroughs sin adaptación de firma, contexto, pending, modal o
errores. Los owners Anexo conservan funciones internas homónimas; no son los
wrappers page retirados.

### E. Zero-emitter audit

| Action/símbolo | Emitter | Caller/global | Resultado |
| --- | --- | --- | --- |
| `toggle-expand` | 0 | solo branch | branch retirado |
| `generar-anexo` / `bibGenerarAnexo` | 0 | 0 / 0 | ambos retirados |
| `regenerar-anexo` / `bibRegenerarAnexo` | 0 | 0 / 0 | ambos retirados |

Búsqueda: HTML, templates, `innerHTML`, `data-bib-action`, `data-action`, otros
`data-*`, tests, Quick, Biblioteca, globals y strings productivos.

### F. Preview migration

`ver-examen`, `ver-lista` y `ver-anexo` llaman ahora directamente a
`ExamPreview.openBiblioteca(examenId)`,
`ListaCotejoPreview.openBiblioteca(listaId)` y `AnexoPreview.open(anexoId)`.
El backdrop Anexo conserva su listener/target y llama `AnexoPreview.close()`.
No se modificaron preview internals ni sus listeners locales.

### G. Download migration

Las cuatro actions llaman directamente a `PlaneacionDownload`, `ExamDownload`,
`ListaCotejoDownload` y `AnexoDownload` con el mismo ID. Filenames, modal de
nombre, Word export, catch/log/alert y flujo async permanecen dentro de los
owners sin cambios. `downloadExamWord` permanece por consumers reales.

### H. Delete migration

Las cinco actions llaman directamente a `BibliotecaBlockDelete`,
`PlaneacionDelete`, `ExamDelete`, `ListaCotejoDelete` y `AnexoDelete` con los
mismos IDs. Los owner files no cambiaron: confirmación, normalización, pending,
selection/tab, render, reload/reconcile, endpoints, errores y logs siguen
idénticos.

### I. Anexo compatibility

Retirados cinco wrappers page y las dos implementaciones generation sin
entrada. `AnexoGeneration`, `AnexoPreview`, `AnexoDownload`, `AnexoDelete`, el
modal create y el preview DOM permanecen activos e intactos. No se mezcló
generation con preview/download.

### J. BibliotecaEvents

Antes: 23 branches, 20 emitters, 12 rutas mediante wrapper y tres ramas sin
emitter. Después: 20 branches para los mismos 20 emitters, 12 rutas directas a
owner y cero handler sin emitter. Delegación, `closest`, dataset, guards de ID,
bubbling y ausencia histórica de await/catch en el dispatcher no cambian.

### K. Implementación

Productivo modificado: `biblioteca-events.js`, `biblioteca-modal-render.js` y
`biblioteca.page.js`. Test añadido:
`tests/biblioteca-action-owners.smoke.test.js`. Owners de dominio, Bootstrap,
Quick, Loader, HTML y orden de scripts no se modificaron.

### L. Metrics

```text
wrappers: 21 → 6 (15 retirados)
branches: 23 → 20
emitters: 20 → 20
handlers sin emitter: 3 → 0
biblioteca.page.js: 1110 LOC/50 funciones → 863/33
biblioteca-events.js: 160 LOC → 143
window publications: sin cambio (174 repo / 147 Dashboard)
window. tokens productivos: 422 → 418
listener sites: sin cambio
```

### M. Consumer audit

Cero definiciones wrapper en `biblioteca.page.js` y cero callers residuales.
Los cinco nombres internos homónimos de Anexo permanecen exclusivamente dentro
de sus owners protegidos. Cero referencias productivas a los tres actions
retirados o a `bibGenerarAnexo`/`bibRegenerarAnexo`. Todos los namespaces owner
y sus tags siguen presentes. `downloadExamWord` conserva sus consumers.

### N. Tests

Baseline: 8 suites/24 pruebas PASS. Final automatizado: 9 suites/27 pruebas
PASS, cero snapshots, 2.498 s. `node --check` pasa en los tres JS productivos y
el smoke nuevo.

### O. Smoke

`biblioteca-action-owners.smoke.test.js`: 1 suite/3 pruebas PASS. Verifica
20/20, retiro de tres ramas, dispatch dinámico directo con IDs exactos,
ausencia de wrappers page, owners cargados y preservación de
`downloadExamWord`.

### P. Scope protegido

Sin cambios en shape de `explorerState`, Quick API, Loader/Reconcile,
`window.biblioteca`, render bridge, aliases AppUI, `BIBLIOTECA_MODE`, `main.js`,
script order, listeners generales, generation/preview/delete internals,
backend/API/DB/payloads, `wordExport.js`, Archivados, Dashboard Tailwind y
Batch.

### Q. Manual pendiente

Pendiente: Dashboard/Biblioteca carga/bloques/tabs/search/reload; Quick
abrir/cerrar/crear/Agregar Tema; previews Examen/Lista/Anexo; downloads de los
cuatro recursos; deletes de cuatro recursos y bloque si es práctico; cuatro
generaciones; Detalle/back; consola/red sin ReferenceError, owner undefined,
404, requests/listeners duplicados ni error nuevo. `public.ia_metrics` no
bloquea.

### R. Handoff 10.2

No iniciada. Conserva cinco wrappers Loader/Reconcile, AppUI aliases,
`downloadExamWord`, render bridge, revisión de facade `window.biblioteca`,
Quick public surface, `BIBLIOTECA_MODE`, mapping huérfano de `main.js`, frontera
global/léxica final y listener guards solo si corresponde.

### S. Documentación

Actualizados únicamente los cinco documentos autorizados: Arquitectura, mapa
frontend, roadmap, handoff y matriz de pruebas.

### T. Riesgos

Sin blocker técnico. No bloqueantes: manual pendiente; compatibilidad global de
10.2; `BibliotecaEvents.bind` sin guard; backdrop confirm `{once:true}`; y
`origin/refactor-front` aún detrás del commit local 10.0. No se corrigieron.

### U. Estado final

```text
Fase 10: En progreso
10.0: completada/commiteada en ec03f94
10.1: implementada
Manual 10.1: pendiente
Commit: no
Push: no
10.2: no iniciada
```
