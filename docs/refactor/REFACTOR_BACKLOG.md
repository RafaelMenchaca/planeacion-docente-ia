# REFACTOR_BACKLOG.md — Backlog propuesto de sesiones futuras

> Propuesta de orden de extracción. No se implementó nada de esto en ninguna sesión de auditoría/documentación. Filosofía obligatoria (de `AGENTS.md`): documentar → crear pruebas/validaciones → extraer literalmente → mantener compatibilidad → validar → eliminar duplicados después → eliminar legado al final.
>
> **El backlog NO empieza con eliminación de legado.** Empieza con las extracciones de menor riesgo (preview/descarga, que son de solo-lectura de datos ya generados) y termina con la eliminación controlada, solo después de aislar y validar en runtime. Cada sesión debe caber en un solo alcance concreto (regla 19 de `AGENTS.md`).

---

## Sesión 1 — Extraer preview y descarga de exámenes

**Objetivo:** sacar de `dashboard.page.js` las funciones de render/cierre del modal de preview de examen (`window.renderExamPreviewModal`, `window.closeExamPreviewModal`) y de descarga (`window.downloadExamWord`) a un módulo de feature dedicado, manteniendo wrappers globales. No tocar generación ni polling.

**Archivos permitidos:**
- `js/pages/dashboard.page.js` (solo las funciones de preview/descarga de examen, no otras secciones)
- nuevo módulo `js/features/examenes/exam-preview.js` y/o `js/features/examenes/exam-download.js`
- `pages/dashboard.html` (solo si es necesario agregar un `<script>` nuevo, respetando el orden documentado en `docs/FRONTEND_MAP.md`)
- documentación (`SESSION_HANDOFF.md`, este backlog)

**Archivos prohibidos:**
- backend, SQL
- `js/ui/wordExport.js` (salvo autorización explícita)
- `js/pages/biblioteca.page.js`, salvo que sea estrictamente necesario para actualizar una referencia y quede documentado por qué el wrapper no bastó

**Funciones candidatas:** ver `docs/refactor/REFACTOR_PLAYBOOK.md` Ejemplo A y B para wrappers concretos y líneas exactas.

**Riesgo:** Bajo — consumidor acotado y confirmado (solo `biblioteca.page.js`), no toca payload ni polling.

**Dependencias:** ninguna.

**Validaciones necesarias:** generar un examen, abrir preview, descargar, confirmar mismo contenido/formato/orden de respuestas que antes; `npm test`.

**Criterio de finalización:** `window.renderExamPreviewModal`/`closeExamPreviewModal`/`downloadExamWord` siguen respondiendo igual desde `biblioteca.page.js` sin cambios en ese archivo; comportamiento visual idéntico confirmado manualmente.

**Commit sugerido:** `refactor(exams): extract preview and download rendering to feature module`

---

## Sesión 2 — Extraer preview y descarga de listas de cotejo

**Objetivo:** mismo tratamiento que la Sesión 1, aplicado a `window.renderListaCotejoPreviewModal`/`window.closeListaCotejoPreview` y a la descarga de lista de cotejo (`window.descargarListaCotejoWord`, si su definición real está en `dashboard.page.js`/`wordExport.js` — confirmar ubicación exacta antes de mover, ver pregunta abierta en `SESSION_HANDOFF.md`).

**Archivos permitidos:** análogos a Sesión 1, dominio "listas de cotejo".

**Archivos prohibidos:** iguales a Sesión 1.

**Funciones candidatas:** las listadas en `docs/refactor/FRONTEND_AUDIT.md` sección 4 para lista de cotejo.

**Riesgo:** Bajo, mismo argumento que Sesión 1.

**Dependencias:** ninguna (puede hacerse en paralelo o después de la Sesión 1, no depende de ella).

**Validaciones necesarias:** generar lista de cotejo, abrir preview, descargar, confirmar prevención de duplicados intacta (checkboxes deshabilitados); `npm test`.

**Criterio de finalización:** mismo criterio que Sesión 1, aplicado a listas de cotejo.

**Commit sugerido:** `refactor(checklists): extract preview and download rendering to feature module`

---

## Sesión 3 — Normalizar helpers de descarga sin cambiar formato

**Objetivo:** documentar exhaustivamente (no unificar todavía) las distintas implementaciones de sanitización de nombre de archivo y descarga de blob (`shared.ui.js`, `wordExport.js`, `detalle.page.js`, y las ya movidas en Sesiones 1-2), con ejemplos de entrada/salida reales, como paso previo a decidir si conviene unificar. Solo tras confirmar equivalencia funcional se puede crear un helper compartido, preservando MIME type, extensión y nombre exactos por tipo de documento.

**Archivos permitidos:** `js/ui/shared.ui.js`, `js/ui/wordExport.js` (solo con autorización explícita), `js/pages/detalle.page.js`, los módulos nuevos de la Sesión 1-2, documentación.

**Archivos prohibidos:** backend, SQL, cualquier archivo que cambie el nombre de descarga visible sin autorización.

**Riesgo:** Bajo si se limita a documentar; Medio si además se unifica (requiere autorización para tocar `wordExport.js`).

**Dependencias:** Sesiones 1 y 2 (para tener las funciones de examen/lista ya en su módulo destino antes de tocar sus descargas).

**Validaciones necesarias:** descargar cada tipo de documento y comparar contra el comportamiento previo.

**Criterio de finalización:** tabla de comparación entrada→salida documentada en `docs/refactor/FRONTEND_AUDIT.md`; si se unifica, un solo helper compartido con wrapper de compatibilidad.

**Commit sugerido:** `docs(refactor): document download filename sanitization implementations` (o `refactor(downloads): unify blob download helper` si se llega a unificar)

---

## Sesión 4 — Aislar polling de examen

**Objetivo:** extraer el bucle de polling de `submitBibliotecaExamModal` (`biblioteca.page.js:2327-2365`) y de `waitForExamGenerationCompletion` (`dashboard.page.js:1995-2041`, si sigue siendo alcanzable según la Sesión 8) a una función reutilizable con mecanismo de cancelación explícito, sin cambiar endpoint, payload, intervalo (3000ms), máximo de intentos (60) ni mensajes.

**Archivos permitidos:** `js/pages/biblioteca.page.js`, posiblemente `js/pages/dashboard.page.js` (evaluar por separado, no en la misma sesión si ambos requieren cambios no triviales).

**Archivos prohibidos:** backend, SQL, cualquier endpoint de examen.

**Funciones candidatas:** `submitBibliotecaExamModal` (extraer su IIFE de polling), `waitForExamGenerationCompletion`.

**Riesgo:** Medio-Alto — es lógica de generación (`AGENTS.md` sección 16 y 5.1). Limitarse estrictamente a extraer y añadir cancelación.

**Dependencias:** Sesión 1 completada (preview de examen ya extraído, contexto más ordenado).

**Validaciones necesarias:** generar examen y confirmar polling idéntico; navegar fuera a mitad de polling y confirmar que ya no sigue llamando a la API (Network tab); generar dos exámenes seguidos para el mismo bloque sin condición de carrera visible.

**Criterio de finalización:** polling cancelable confirmado en Network, sin cambios en mensajes/tiempos/payload.

**Commit sugerido:** `refactor(exams): extract cancellable polling for generation status`

---

## Sesión 5 — Aislar generación de anexos

**Objetivo:** extraer el loop secuencial de generación de anexos (`submitBibliotecaAnexoCreateModal`, `biblioteca.page.js:1414-1537`) a una función independiente, preservando el feedback en tiempo real card-por-card y el orden secuencial (no paralelo) de las llamadas a `/api/anexos/generate`.

**Archivos permitidos:** `js/pages/biblioteca.page.js`, nuevo módulo `js/features/anexos/anexos-generation.js`.

**Archivos prohibidos:** backend, SQL, endpoint de anexos.

**Riesgo:** Medio — mezcla estado, render por iteración y llamada API; requiere cuidado para no romper el feedback en tiempo real.

**Dependencias:** Sesiones 1-2 completadas.

**Validaciones necesarias:** generar anexos para 2+ planeaciones simultáneamente y confirmar que las cards se actualizan una por una, en el mismo orden, con el mismo comportamiento ante error parcial.

**Criterio de finalización:** mismo comportamiento visual confirmado, llamadas API siguen siendo secuenciales.

**Commit sugerido:** `refactor(attachments): extract sequential generation loop`

---

## Sesión 6 — Aislar eliminación genérica en Biblioteca

**Objetivo:** unificar el patrón de 5 pasos repetido en `bibEliminarBloque`/`bibEliminarPlaneacion`/`bibEliminarExamen`/`bibEliminarLista`/`bibEliminarAnexo` (`biblioteca.page.js:2911-3094`) en una función parametrizada, sin cambiar ningún mensaje visible ni contrato de API.

**Archivos permitidos:** `js/pages/biblioteca.page.js` únicamente.

**Archivos prohibidos:** todo lo demás, incluyendo `dashboard.page.js` (la eliminación de jerarquías en `submitDeleteConfirm` es un caso distinto y de mayor riesgo, no se toca en esta sesión).

**Riesgo:** Bajo — mismo contrato de API confirmado en las 5 funciones.

**Dependencias:** ninguna (puede hacerse en cualquier momento, incluso antes de las Sesiones 1-5).

**Validaciones necesarias:** eliminar un item de cada uno de los 5 tipos manualmente y confirmar mensaje de confirmación, comportamiento de error y refresh idénticos; `npm test`.

**Criterio de finalización:** las 5 funciones delegan al helper compartido; comportamiento visible idéntico.

**Commit sugerido:** `refactor(biblioteca): extract shared resource deletion helper`

---

## Sesión 7 — Separar estado compartido `explorerState`

**Objetivo:** dividir el objeto monolítico `explorerState` (`dashboard.page.js:1-53`) en un sub-estado exclusivo de navegación jerárquica visual antigua y un sub-estado compartido con Biblioteca (`progress`, `examPreview`, `listaCotejoPreview`, `confirmDelete`), sin cambiar ninguna referencia externa (`window.explorerState` debe seguir respondiendo igual).

**Archivos permitidos:** `js/pages/dashboard.page.js`; lectura (no escritura) de `js/pages/biblioteca.page.js` para no romper sus referencias.

**Archivos prohibidos:** todo lo demás.

**Riesgo:** Alto — es el corazón del acoplamiento entre los dos archivos más grandes del proyecto.

**Dependencias:** Sesiones 1, 2, 4, 5, 6 completadas (contexto ya más ordenado en ambos archivos).

**Validaciones necesarias:** matriz de pruebas completa de `docs/refactor/TEST_MATRIX.md`, especial atención a generación/preview de examen y lista de cotejo desde Biblioteca.

**Criterio de finalización:** `biblioteca.page.js` sigue funcionando sin ningún cambio en su propio código; `window.explorerState` sigue existiendo con la misma forma observable desde fuera.

**Commit sugerido:** `refactor(dashboard): split explorerState into legacy-navigation and shared-with-biblioteca substates`

---

## Sesión 8 — Verificación runtime de navegación jerárquica antigua

**Objetivo:** confirmar en navegador real (DevTools, no solo lectura estática) que los contenedores `#explorer-tree`/`#explorer-breadcrumbs`/niveles legado efectivamente no existen ni se disparan en el DOM servido por `dashboard.html` en modo Biblioteca. Aislar (no eliminar todavía) las funciones `LEGACY_CONFIRMED` de `docs/refactor/LEGACY_HIERARCHY.md` sección A en un archivo separado, cargado condicionalmente solo si `BIBLIOTECA_MODE` fuera `false`.

**Archivos permitidos:** `js/pages/dashboard.page.js`, nuevo archivo `js/pages/dashboard-legacy-explorer.js`, `pages/dashboard.html` (script condicional).

**Archivos prohibidos:** todo lo demás.

**Riesgo:** Alto — toca el archivo más grande y crítico del proyecto.

**Dependencias:** Sesión 7 completada (estado ya separado).

**Validaciones necesarias:** matriz de pruebas completa; confirmar que `dashboard.html` sigue funcionando idéntico en modo Biblioteca (único modo real de producción hoy).

**Criterio de finalización:** `dashboard.page.js` reducido significativamente en líneas; comportamiento de Biblioteca sin cambios confirmados; evidencia runtime de que el código aislado no tiene consumidores, documentada en `docs/refactor/LEGACY_HIERARCHY.md`.

**Commit sugerido:** `refactor(dashboard): isolate unreachable legacy hierarchy navigation behind explicit flag`

---

## Sesión 9 — Eliminación controlada de legado confirmado

**Objetivo:** eliminar definitivamente el código aislado en la Sesión 8, y los fragmentos de `docs/refactor/FRONTEND_AUDIT.md` sección 9 con confianza Alta (páginas muertas `batch.html`/`planeacion.html`/`dashboard_tailwind.html` y su JS asociado; `isBibliotecaTechnicalUnidad`, `getFilteredConjuntos`, `expandedIds`/`toggle-expand`, `bibRegenerarAnexo`/`regenerar-anexo` en `biblioteca.page.js`), solo tras confirmar en producción/staging que no tienen consumidores.

**Archivos permitidos:** los archivos legado confirmados listados arriba.

**Archivos prohibidos:** cualquier archivo no explícitamente clasificado `LEGACY_CONFIRMED` con evidencia runtime.

**Riesgo:** Medio (ya aislado y verificado, pero es la eliminación final e irreversible sin control de versiones).

**Dependencias:** Sesión 8 validada, y un periodo de observación en uso real antes de eliminar.

**Validaciones necesarias:** repetir matriz completa de `docs/refactor/TEST_MATRIX.md`.

**Criterio de finalización:** líneas eliminadas; `AGENTS.md`, `docs/refactor/LEGACY_HIERARCHY.md` y `docs/FRONTEND_MAP.md` actualizados para reflejar la eliminación.

**Commit sugerido:** `refactor(cleanup): remove confirmed dead legacy hierarchy code and orphaned pages`

---

## Fuera de alcance de este backlog (requiere decisión de producto, no solo técnica)

- Recuperar el link a `pages/archivados.html` en `components/navbar.html` (está comentado) — decisión de producto, no de refactor.
- Decidir si `pages/registro.html`/`recuperar.html`/`contacto.html` deben tener lógica de submit real — hoy no tienen comportamiento funcional que preservar.
- Unificar formato de fechas — requiere decidir un formato canónico único, es una decisión de UX no solo técnica.
- Confirmar la ubicación exacta de `generarPlaneacionesUnidadConProgreso` (pregunta abierta en `SESSION_HANDOFF.md`) antes de tocar generación de planeaciones en cualquier sesión futura.
