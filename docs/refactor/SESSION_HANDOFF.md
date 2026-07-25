# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

- Explorador visual jerárquico: obsoleto para nuevas implementaciones; no es un modo paralelo.
- Jerarquía técnica: puede seguir activa en datos, endpoints, selectores, persistencia o soporte interno.
- Archivados: flujo separado con posibles dependencias jerárquicas.
- `explorerState`: estado mixto; no puede eliminarse como bloque sin clasificar consumidores.

## Estado del roadmap

- **Fase actual:** 1 — Extracciones aisladas.
- **Estado:** En progreso.
- **Sesión actual:** 1.4 — Descarga de planeación desde Biblioteca.
- **Próxima acción recomendada:** validación manual de la Sesión 1.4 y cierre documental de Fase 1.

La Fase 0 está completada. Las sesiones 1.1, 1.2 y 1.3 y su validación manual acumulativa están completadas. La Sesión 1.4 está completada en código; su validación manual y la regresión acumulativa posterior quedan pendientes, por lo que Fase 1 todavía no se cierra.

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

Decisión ejecutada: la última extracción aislada fue la Sesión 1.4. Su código está completado y solo falta la validación manual para cerrar Fase 1.

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
| Descarga de planeación desde card | `js/features/planeaciones/planeacion-download.js` | `data-bib-action="descargar-planeacion"` mediante wrapper | detalle por ID, `AppUI` y Blob propio | Bajo | 1 | Completado en código; manual pendiente |
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

### Pendiente para cerrar Fase 1

- Ejecutar en navegador autenticado la descarga desde card, editar el nombre, abrir el `.doc` y comparar contenido/formato.
- Repetir la regresión acumulativa de examen, lista, anexo, tabs, recarga y otra planeación.
- Confirmar consola sin errores, sin descarga doble, sin listeners duplicados y sin activación del explorador legacy.

No quedan candidatos aislados de bajo riesgo ni consumidores desconocidos. Tras aprobar estas pruebas se puede marcar Fase 1 como completada y recomendar Fase 2 — Acciones por dominio, sin implementarla en esta sesión.

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

2026-07-25 — Sesión 1.4: se extrajo la descarga de planeación desde Biblioteca; código y validaciones automáticas completados, validación manual pendiente antes de cerrar Fase 1.
