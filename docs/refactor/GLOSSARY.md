# GLOSSARY.md — Glosario del dominio y del refactor

> Consultar ante cualquier ambigüedad de término antes de tomar una decisión de clasificación o extracción. Si un término no está aquí, no asumir su significado — preguntar o buscar evidencia en `docs/refactor/FRONTEND_AUDIT.md`.

## Términos de negocio/producto

**Biblioteca** — Vista/flujo principal y vigente del área privada. Agrupa los documentos generados (Planeaciones, Anexos, Listas de cotejo, Exámenes) por bloque/conjunto, con 4 tabs. Controlada por `js/pages/biblioteca.page.js`, cargada dentro de `pages/dashboard.html`.

**Conjunto** / **Bloque** — El mismo concepto visto desde dos ángulos: la unidad de agrupación que el usuario ve y abre en el sidebar de Biblioteca. En código suele llamarse `conjunto` (`bibliotecaState.conjuntos`). Corresponde a un `batch` en el modelo de datos.

**Batch** (`planeacion_batches`) — Nombre en base de datos/backend del mismo concepto que "conjunto"/"bloque" en el frontend. Es el `batch_id` que viaja en varios payloads.

**Planeación** — Documento principal generado por tema; unidad base sobre la que se generan Anexos, Listas de cotejo y (indirectamente) Exámenes.

**Anexo** — Documento de trabajo para alumnos, generado a partir de una planeación específica. Máximo un anexo por planeación (regla de backend).

**Lista de cotejo** — Documento de evaluación generado a partir de una o más planeaciones seleccionadas.

**Examen** — Documento de evaluación generado a partir de planeaciones seleccionadas (no directamente de temas), con job asíncrono y polling de estado.

**Tema** — Título/contenido de una planeación individual; campo central mostrado en Biblioteca (`p.tema`).

**Unidad** — Nivel de la jerarquía académica técnica (plantel→grado→materia→**unidad**→tema). Puede ser un campo real de negocio (materia/nivel educativo) o, en algunos bloques creados directo desde Biblioteca, un valor técnico placeholder (ver `isBibliotecaTechnicalUnidad`).

## Identificadores y payloads

**`unidad_id`** — Campo enviado en el payload de generación de examen. Sigue existiendo, pero el propio código documenta (comentario en `biblioteca.page.js:2296-2299`) que puede estar desactualizado respecto al batch real — **no es la fuente confiable de temas**. No cambiar su relación con `planeacion_ids`/`tema_ids` sin autorización explícita.

**`planeacion_ids`** — Selección de planeaciones específicas enviada en el payload de examen; es la fuente confiable actual, porque el backend resuelve los temas reales a partir de estos ids en vez de depender de `unidad_id`.

**`tema_ids`** — Identificadores de tema; el código de Biblioteca documenta explícitamente que **no** se envían para examen (se usa `planeacion_ids` en su lugar). No confundir con `planeacion_ids`.

## Estado (`window` y objetos internos)

**`BIBLIOTECA_MODE`** — Flag global (`window.BIBLIOTECA_MODE`) definido en `dashboard.page.js`, seteado a `true` en cuanto `initDashboardPage()` detecta que `window.initBiblioteca` existe como función (lo cual siempre ocurre en producción, porque `biblioteca.page.js` se carga antes). Controla qué rama de código se ejecuta dentro de `dashboard.page.js`: `true` → Biblioteca; `false` (nunca alcanzado en producción hoy) → navegación jerárquica visual antigua.

**`explorerState`** — Objeto de estado raíz definido en `dashboard.page.js`, expuesto como `window.explorerState`. Es **MIXED**: mezcla subcampos exclusivos de la navegación jerárquica visual antigua (inactivos) con subcampos que Biblioteca sí consume (`progress`, `examPreview`, `listaCotejoPreview`, `confirmDelete`). No tratar como bloque único — ver `docs/refactor/LEGACY_HIERARCHY.md`.

**`bibliotecaState`** — Objeto de estado raíz definido en `biblioteca.page.js`, no expuesto directamente en `window` (se expone selectivamente vía `window.biblioteca`). Contiene `conjuntos`, `selectedConjuntoId`, `activeTab`, estados de cada modal, y los mapas `pending*ByBatchId` de progreso de generación.

## Clasificación de código

**Compatibilidad (temporal)** — Código que sigue siendo consumido hoy, pero cuya única razón de existir es servir de puente hacia una versión futura (típicamente un wrapper `window.X = (...args) => window.NuevoModulo.metodo(...args)`). Se mantiene hasta confirmar que ya no tiene consumidores del nombre antiguo. No confundir con "legacy confirmado": la compatibilidad se usa activamente, el legado no.

**Legacy confirmado (`LEGACY_CONFIRMED`)** — Clasificación que requiere evidencia directa de que el código no tiene consumidores alcanzables (p. ej. una rama `if (!window.BIBLIOTECA_MODE)` cuando `BIBLIOTECA_MODE` es siempre `true`). Documentado pero no eliminado hasta verificación runtime y autorización explícita.

**Legacy candidate (`LEGACY_CANDIDATE`)** — Un paso antes de `LEGACY_CONFIRMED`: hay evidencia fuerte pero no verificación en runtime real (navegador). Usado cuando la auditoría estática sugiere que el código es inalcanzable pero no se probó en vivo.

**Possibly unused / posiblemente no utilizado** — Término obligatorio (no usar "código muerto") para código sin consumidores encontrados tras búsqueda exhaustiva (grep en JS, HTML, `window`, `data-*-action`), pero sin confirmación en runtime. Requiere nivel de confianza (Bajo/Medio/Alto) y debe listar las búsquedas realizadas.

**`ACTIVE`** — Participa del flujo vigente con evidencia de consumidor real.

**`UNKNOWN`** — Evidencia insuficiente para clasificar; no se debe actuar sobre código `UNKNOWN` sin investigación adicional.

## Mecánica de refactor

**Wrapper temporal** — Función que conserva el nombre público antiguo (`window.X`) pero delega su implementación a un módulo nuevo. Debe llevar comentario con fecha, motivo y consumidor (ver plantilla en `AGENTS.md` sección 5.1).

**Extracción literal** — Mover código de un archivo a otro sin cambiar su comportamiento: mismos nombres, mismas condiciones, mismos mensajes. No se simplifica ni se "mejora" en el mismo paso.

**Refactor seguro** — El método completo descrito en `docs/refactor/REFACTOR_PLAYBOOK.md`: identificar → buscar consumidores → clasificar dependencias → mover literal → wrapper → validar → documentar.

## Mecánica de generación y render

**Polling** — Consulta repetida a un endpoint de estado hasta que el job termina o se agota un máximo de intentos. En este proyecto: examen (cada 3000ms, máx. 60 intentos ≈ 3 min, en `biblioteca.page.js` y `dashboard.page.js`, ambos sin cancelación al día de la auditoría).

**Render completo** — Volver a renderizar todo el contenido de una sección/vista desde cero (p. ej. `renderBibliotecaContent()`), típicamente tras una carga inicial o tras `loadAndRenderBiblioteca`.

**Render in-place** — Reemplazar solo una porción del DOM (p. ej. `renderBibliotecaDetailInPlace()`, que solo toca `#biblioteca-detail-panel`), preservando scroll/foco/estado del resto de la página.

**Mutación optimista** — Actualizar el estado local en memoria y el render inmediatamente después de una acción (generar/eliminar), antes de confirmar con el backend, para dar feedback rápido al usuario.

**Reload silencioso** — Llamada posterior a `loadAndRenderBiblioteca({silent:true, ...})` que vuelve a pedir los datos reales al backend para reconciliar la mutación optimista, sin mostrar un estado de carga visible al usuario.
