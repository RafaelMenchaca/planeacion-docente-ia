# SESSION_HANDOFF.md

## Fecha

2026-07-07

## Objetivo

Auditoría técnica completa de solo lectura del frontend de Educativo IA, previa a un refactor gradual del flujo Biblioteca. Sin modificar código funcional, HTML, CSS, backend ni SQL. Producir documentación confiable en `docs/` y `docs/refactor/` para planificar el refactor.

## Metodología

- Lectura directa de `AGENTS.md`, `README.md` y `ai-context/*.md` existentes en el repositorio del frontend.
- Tres agentes de investigación en paralelo (solo lectura, sin herramientas de edición), cada uno con instrucciones detalladas:
  1. Auditoría completa de `js/pages/dashboard.page.js` (6066 líneas), leído íntegro en 6 tramos.
  2. Auditoría completa de `js/pages/biblioteca.page.js` (3244 líneas), leído íntegro en 3 tramos.
  3. Auditoría de todos los demás archivos JS, todas las páginas HTML (orden de scripts, entry points), búsqueda global de vocabulario de jerarquías fuera de los dos archivos grandes, y duplicados semánticos cruzados.
- Cada agente guardó su reporte completo sin truncar en archivos de scratchpad, que fueron leídos íntegros para sintetizar los documentos finales.
- Verificación de `git status` antes y después para confirmar que solo se tocaron archivos de documentación.

## Archivos creados

- `docs/ARCHITECTURE.md`
- `docs/FRONTEND_MAP.md`
- `docs/refactor/FRONTEND_AUDIT.md`
- `docs/refactor/CURRENT_BEHAVIOR.md`
- `docs/refactor/LEGACY_HIERARCHY.md`
- `docs/refactor/REFACTOR_BACKLOG.md`
- `docs/refactor/TEST_MATRIX.md`
- `docs/refactor/SESSION_HANDOFF.md` (este archivo)

No se creó `docs/refactor/REFACTOR_RULES.md` ni `docs/refactor/DECISIONS.md` mencionados en la lista de lectura obligatoria de `AGENTS.md` sección 21 — no fueron solicitados en el encargo de esta sesión y no se inventó su contenido. Quedan pendientes si una sesión futura los necesita.

## Hallazgos principales

1. **Hallazgo estructural clave**: `window.BIBLIOTECA_MODE` es siempre `true` en producción porque `pages/dashboard.html` carga `biblioteca.page.js` antes de que `dashboard.page.js` decida el modo. Esto vuelve inalcanzable, por el flujo normal de carga, a un sistema completo de navegación jerárquica dentro de `dashboard.page.js` (árbol, breadcrumbs, niveles root/plantel/grado/materia).
2. **`explorerState` no es un bloque monolítico legado**: mezcla subcampos activos (compartidos con Biblioteca: `progress`, `examPreview`, `listaCotejoPreview`, `confirmDelete`) con subcampos exclusivos de la navegación jerárquica inalcanzable. Cualquier limpieza requiere separarlos primero.
3. **Acoplamiento bidireccional fuerte y no documentado previamente** entre `dashboard.page.js` y `biblioteca.page.js`, mediado enteramente por `window` (11+ puntos de uso cruzado confirmados).
4. **El vocabulario "jerarquía" existe en dos sistemas distintos que no deben confundirse**: uno inactivo dentro de `dashboard.page.js`, y uno activo y vigente en `js/api/jerarquia.api.js`, `js/services/jerarquia.service.js` y `js/pages/archivados.page.js` (sostiene el árbol de restauración de Archivados).
5. **Polling de examen sin cancelación** en dos lugares (`dashboard.page.js:1995-2041` y `biblioteca.page.js:2327-2365`) — mayor riesgo operativo identificado; no se detiene si el usuario navega fuera o dispara dos generaciones seguidas para el mismo bloque.
6. **4 fragmentos de código en `biblioteca.page.js` confirmados sin consumidores** (confianza alta): `isBibliotecaTechnicalUnidad`, `getFilteredConjuntos`, `bibliotecaState.expandedIds`/`case "toggle-expand"`, `bibRegenerarAnexo`/`case "regenerar-anexo"`.
7. **Al menos 3 páginas/flujos completos muertos**: `pages/batch.html`, `pages/planeacion.html` (ambas solo redirigen) y `pages/dashboard_tailwind.html` (huérfana), con sus JS asociados (`js/planeacion.js`, `js/pages/planeacion.page.js`, `js/pages/batch.page.js`, `js/ui/planeacion.ui.js`, `js/ui/batch.ui.js`, `js/ui/dashboard.ui.js`, `js/pages/dashboard-tailwind.page.js`).
8. **`pages/archivados.html` es funcional pero inalcanzable** desde la navegación (link comentado en `components/navbar.html:27-28`).
9. **4 patrones con 3+ implementaciones redundantes**: toast/notificación, sanitización de nombre de archivo, descarga de blob, formateo de fechas.
10. **Inconsistencia de manejo de errores** dentro del mismo archivo `js/api/planeaciones.api.js` (algunas funciones usan el helper `requestPlaneacionesJson`, otras `fetch` directo con manejo distinto).
11. **`detalle.page.js` referencia `#btn-export-excel`**, id inexistente en `detalle.html` — no-op silencioso, botón de exportar Excel inalcanzable desde la UI real.
12. **`refreshExplorerAfterReturn`** (listener `pageshow` en `dashboard.page.js:5982`) dispara `loadPlanteles()` en cada navegación back/forward sin verificar `BIBLIOTECA_MODE` — posible llamada de red innecesaria activa, no legado inactivo.
13. **`onBibliotecaClick`** (router central de clicks de Biblioteca) no tiene guard contra doble-inicialización — riesgo si `initBiblioteca()` llegara a invocarse dos veces.
14. **`submitQuickCreateForm`** (creación rápida de bloque) encadena hasta 4 llamadas API secuenciales sin atomicidad — un fallo parcial puede dejar entidades huérfanas (p. ej. grado creado sin materia).
15. **Patrón de eliminación duplicado 5 veces** en `biblioteca.page.js` (bloque/planeación/examen/lista/anexo) — buen primer candidato de extracción de bajo riesgo.

## Riesgos

Ver registro completo en `docs/refactor/FRONTEND_AUDIT.md` sección 11. Los de mayor impacto potencial: reordenar/eliminar un `<script>` de `dashboard.html` (18 scripts en cadena sin verificación en runtime), eliminar una propiedad `window.X` sin buscar todos los consumidores, y tocar la lógica de polling de generación.

## Preguntas abiertas

- ¿Existe algún entry point alternativo (test, script de migración) que cargue `dashboard.page.js` sin `biblioteca.page.js` y active la rama de navegación jerárquica legado? No se encontró evidencia, pero tampoco se descartó al 100%.
- ¿El modal genérico de entidad (`openEntityModal`/`submitEntityModal`, `dashboard.page.js:5130-5363`) tiene botones equivalentes en el marcado que renderiza `biblioteca.page.js`? Requiere lectura cruzada más profunda del HTML inyectado por Biblioteca.
- ¿Dónde está definida exactamente `generarPlaneacionesUnidadConProgreso`, invocada desde `biblioteca.page.js:2866` pero no encontrada dentro de ese archivo? Los agentes no confirmaron el archivo exacto (probablemente `dashboard.page.js` o un servicio de generación).
- ¿La validación de "ocultar actividad evaluada" en Listas de cotejo (mencionada en `AGENTS.md`/instrucciones del encargo) vive en el frontend o solo en el backend? No se encontró en `biblioteca.page.js`.
- ¿`QUICK_CREATE_NEW_VALUE` (`dashboard.page.js:64`) tiene algún uso no detectado por el grep no exhaustivo realizado?

## Qué NO se modificó

Ningún archivo JavaScript, HTML, CSS, backend, SQL ni de configuración funcional. Confirmado por `git status --porcelain` antes y después de la sesión: los únicos cambios nuevos están dentro de `docs/`. Los archivos `AGENTS.md`, `AI_CONTEXT.md`, `ai-context/`, `ai-rules/` y la modificación a `.gitignore` ya existían como cambios sin commitear **antes** de iniciar esta sesión (no fueron tocados por este trabajo).

## Próxima sesión recomendada (registrada en la sesión 1, ver actualización en la sesión 2 más abajo)

**Etapa 1 del backlog** (`docs/refactor/REFACTOR_BACKLOG.md`): confirmar en navegador real (DevTools, no solo lectura estática) los 4 fragmentos de código sin consumidores detectados en `biblioteca.page.js` y las 3 páginas/flujos muertos, antes de tocar cualquier línea de código. Es la validación de menor riesgo posible y desbloquea con evidencia sólida las etapas 2 en adelante.

---

# Sesión 2 — Pulido de documentación y reglas de agentes

## Fecha

2026-07-08

## Objetivo

Pulir los `.md` de reglas y auditoría para que futuras sesiones de IA trabajen de forma segura y consistente: reforzar `AGENTS.md`, distinguir explícitamente Biblioteca vigente / modelo jerárquico técnico / navegación jerárquica visual antigua / código legado, crear guías operativas nuevas y reordenar el backlog para que no empiece con eliminación de legado. Sesión únicamente de documentación — sin tocar código funcional.

## Archivos `.md` revisados

Todos los de la sesión 1 (`AGENTS.md`, `docs/ARCHITECTURE.md`, `docs/FRONTEND_MAP.md`, `docs/refactor/FRONTEND_AUDIT.md`, `docs/refactor/CURRENT_BEHAVIOR.md`, `docs/refactor/LEGACY_HIERARCHY.md`, `docs/refactor/REFACTOR_BACKLOG.md`, `docs/refactor/TEST_MATRIX.md`, `docs/refactor/SESSION_HANDOFF.md`), más `README.md`, `ai-context/*.md` del frontend, y `AGENTS.md`/`AI_CONTEXT.md` del backend (`educativo_backend/Educativo-Backend/`) para verificar consistencia entre repos.

**Hallazgo de la revisión cruzada con backend:** `educativo_backend/Educativo-Backend/AGENTS.md` es una copia textual idéntica del `AGENTS.md` del frontend (mismo contenido, incluidas referencias a Biblioteca/jerarquías del frontend). No se modificó — está fuera del alcance de esta sesión (enfocada en refactor frontend) y no se detectó ninguna contradicción que requiriera tocarlo; se deja como hallazgo documentado por si una sesión futura decide especializarlo para el backend.

## Archivos `.md` modificados

- `AGENTS.md` — nueva sección 2.1 "Conceptos que NO deben confundirse"; nueva sección 5.1 "Reglas endurecidas"; sección 21 actualizada con la lista real de documentos existentes (se quitaron referencias a `REFACTOR_RULES.md`/`DECISIONS.md`, que no existen).
- `docs/refactor/LEGACY_HIERARCHY.md` — añadida sección "Conceptos que NO deben confundirse" (versión resumida, remite a `AGENTS.md`) y la tabla de decisión rápida solicitada.
- `docs/refactor/REFACTOR_BACKLOG.md` — reescrito completo: 9 sesiones en el orden especificado (preview/descarga de examen y lista de cotejo primero, eliminación de legado al final), cada una con objetivo/archivos permitidos/archivos prohibidos/funciones candidatas/riesgo/dependencias/validaciones/criterio de terminado/commit sugerido.
- `docs/refactor/TEST_MATRIX.md` — añadida fila de verificación de payload conceptual de examen (`planeacion_ids` vs `unidad_id`), nueva sección "Código legacy" (redirects, Archivados por URL directa, ausencia de navegación jerárquica visual), y nota explícita en "Dashboard carga" sobre que la navegación antigua no debe aparecer.
- `docs/refactor/CURRENT_BEHAVIOR.md` — añadido "Resumen rápido" al inicio con los puntos que el encargo pedía asegurar explícitamente (todos ya estaban cubiertos en el detalle, se resumen para lectura rápida).

## Archivos `.md` creados

- `docs/refactor/AI_AGENT_RULES.md` — checklist operativo (antes/durante/después de tocar código).
- `docs/refactor/REFACTOR_PLAYBOOK.md` — método de extracción en 10 pasos + 3 ejemplos concretos de este proyecto (preview de examen, descarga de examen, código que no debe extraerse todavía).
- `docs/refactor/GLOSSARY.md` — definiciones de todos los términos solicitados (Biblioteca, Conjunto, Bloque, Batch, Planeación, Anexo, Lista de cotejo, Examen, Tema, Unidad, `unidad_id`, `planeacion_ids`, `tema_ids`, `BIBLIOTECA_MODE`, `explorerState`, `bibliotecaState`, Compatibilidad, Legacy confirmado, Legacy candidate, Possibly unused, Wrapper temporal, Extracción literal, Refactor seguro, Polling, Render completo, Render in-place, Mutación optimista, Reload silencioso).

No se crearon otros archivos fuera de la lista sugerida por el encargo.

## Cambios principales

Ver "Archivos `.md` modificados" y "Archivos `.md` creados" arriba. En síntesis: se pasó de una auditoría descriptiva (sesión 1) a un conjunto de reglas operativas y accionables (sesión 2) que una sesión de refactor real puede seguir paso a paso sin volver a investigar desde cero.

## Contradicciones corregidas

- `AGENTS.md` sección 21 listaba `docs/refactor/REFACTOR_RULES.md` y `docs/refactor/DECISIONS.md` como lectura obligatoria, pero ninguno de los dos existe en el repositorio — corregido para listar únicamente los archivos reales, más los dos nuevos (`AI_AGENT_RULES.md`, `REFACTOR_PLAYBOOK.md`, `GLOSSARY.md`).
- Ninguna contradicción real de contenido entre Biblioteca vigente vs. jerarquía se encontró en los documentos de la sesión 1 (ya estaban bien clasificados) — el riesgo detectado no era una contradicción existente sino la falta de una sección explícita y centralizada que previniera que una futura sesión mezclara los 7 conceptos. Esa sección ahora existe en `AGENTS.md` 2.1 y se referencia desde `LEGACY_HIERARCHY.md`.
- El backlog original (sesión 1) empezaba con "confirmar código muerto" y "eliminar páginas muertas" como Etapas 1-2, lo cual —aunque de bajo riesgo— no seguía el orden explícito pedido en este encargo (empezar por extracciones de preview/descarga). Se reordenó a 9 sesiones que empiezan por extracción de bajo riesgo funcional (preview/descarga) y terminan con eliminación controlada.

## Reglas nuevas agregadas

Ver `AGENTS.md` sección 5.1 (11 reglas endurecidas) y el checklist completo de `docs/refactor/AI_AGENT_RULES.md`. Resumen: no asumir legado por nombre; no asumir unused sin búsqueda exhaustiva documentada; no tocar `wordExport.js` ni payloads de examen sin autorización explícita; no cambiar la relación `unidad_id`/`planeacion_ids`/`tema_ids`; todo wrapper temporal debe llevar comentario con fecha/motivo/consumidor; no mezclar refactor con bugfix; toda sesión debe actualizar este archivo.

## Riesgos que siguen abiertos

- Las preguntas abiertas de la sesión 1 (ubicación exacta de `generarPlaneacionesUnidadConProgreso`, si el modal genérico de entidad tiene botones equivalentes en Biblioteca, si `QUICK_CREATE_NEW_VALUE` tiene uso real) siguen sin resolver — esta sesión fue de documentación, no de investigación adicional de código.
- El backend tiene un `AGENTS.md` idéntico al del frontend, lo cual puede confundir a una sesión que trabaje en el backend y encuentre reglas específicas de Biblioteca/jerarquías del frontend — queda como hallazgo, no se corrigió (fuera de alcance de esta sesión).
- Ningún elemento de `LEGACY_CONFIRMED` fue verificado en runtime todavía — sigue pendiente la Sesión 8 del nuevo backlog (verificación runtime) antes de poder ejecutar la Sesión 9 (eliminación).

## Qué NO se modificó

Ningún archivo `.js`, `.html`, `.css`, backend, SQL, endpoint, payload ni configuración funcional. No se renombraron ni movieron funciones, no se cambió orden de scripts, no se instalaron dependencias, no se formateó el proyecto. Confirmado por `git status`/`git diff --stat` — ver sección de validación al final de esta sesión.

## Próxima sesión recomendada

**Sesión 1 del nuevo backlog** (`docs/refactor/REFACTOR_BACKLOG.md`): extraer preview y descarga de exámenes de `dashboard.page.js` a un módulo de feature dedicado, manteniendo wrappers globales tal como se especifica en `docs/refactor/REFACTOR_PLAYBOOK.md` Ejemplo A y B. Es la extracción de menor riesgo con mayor valor porque tiene un consumidor acotado y confirmado (`biblioteca.page.js`) y no toca payload ni polling.

---

# Sesión 3 — Auditoría y refuerzo de observabilidad (logs)

## Fecha

2026-07-10

## Objetivo

Sesión dedicada exclusivamente a auditar los logs existentes de Educativo IA (frontend y backend) y completar únicamente los huecos, para poder seguir en terminal el ciclo completo de creación de planeaciones, anexos, listas de cotejo, exámenes (jobs/reintentos/duplicados), guardado en DB, errores, eliminaciones, acciones de Biblioteca y métricas de IA. Esta sesión **sí tocó backend** (`educativo_backend/Educativo-Backend`), autorizado explícitamente por el encargo de la sesión — es una excepción puntual a la restricción de "no modificar el backend" de `AGENTS.md` sección 4, limitada estrictamente a sentencias `console.*`, sin tocar lógica, payloads, endpoints, SQL ni comportamiento. No se refactorizó arquitectura ni se movieron funciones.

## Archivos revisados (lectura completa o casi completa)

Backend: `app.js`, `middleware/auth.middleware.js`, todos los `controllers/*.js`, todos los `services/*.js` (`anexos`, `biblioteca`, `examenes` completo — 2750 líneas —, `listas_cotejo`, `planeaciones` completo — 1805 líneas —, `aiMetrics`, `jerarquia` parcial).
Frontend: `js/api/planeaciones.api.js`, `js/api/jerarquia.api.js` completos; `js/pages/biblioteca.page.js` completo (las secciones de generación, descarga, preview y eliminación); inventario por grep de `console.*` en el resto de `js/**`.

## Archivos modificados

Backend: `src/services/anexos.service.js`, `src/services/listas_cotejo.service.js`, `src/services/examenes.service.js`, `src/services/biblioteca.service.js`, `src/services/planeaciones.service.js`, `src/services/aiMetrics.service.js`, `src/controllers/planeaciones.controller.js`, `src/controllers/jerarquia.controller.js`.
Frontend: `js/api/planeaciones.api.js`, `js/api/jerarquia.api.js`, `js/pages/biblioteca.page.js`.

Todos los cambios son adiciones/ajustes de sentencias `console.*` (mensajes y datos que reciben), variables `startedAt`/`durationMs` derivadas, y en 2 casos (`anexos.service.js`, `planeaciones.service.js`) una variable local extra para acumular un conteo ya calculado antes de loguearlo. Ningún `throw`, `return`, condición, payload o endpoint fue modificado.

## Documentos creados

- `docs/observability/LOG_AUDIT.md` (en la raíz del proyecto, `educativo_ia/docs/observability/`, porque cubre frontend y backend).
- `docs/observability/LOG_CONVENTIONS.md` (misma ubicación).

## Hallazgo de seguridad/ruido corregido (el más relevante de la sesión)

`generarTablaIa` (`planeaciones.service.js`) y los helpers `logPlaneacionDebug`/`debugPlaneacionRequest` (en ambos controllers de backend y en `planeaciones.api.js`/`jerarquia.api.js` del frontend) imprimían el **prompt completo enviado a OpenAI** y la **respuesta completa generada** en cada llamada de generación de planeaciones (individual y por unidad). Se corrigió en los 3 archivos backend y 2 archivos frontend, reemplazando el volcado completo por resúmenes (materia/nivel/tema/conteos/IDs). Ver detalle completo en `docs/observability/LOG_AUDIT.md` sección 4. También se recortaron 4 sitios en `examenes.service.js` que logueaban `rawResponse: rawText` (respuesta cruda de IA) ante fallos de parseo, reemplazado por `rawLength`.

## Compatibilidad

No se crearon wrappers nuevos ni se tocó ninguna propiedad de `window`. `debugPlaneacionRequest` (`jerarquia.api.js`) quedó definida pero sin consumidores tras el fix de logs sensibles — no se eliminó (fuera de alcance de una sesión de logs), documentado como pendiente de limpieza.

## Validaciones ejecutadas

`node --check` sobre los 11 archivos modificados (backend y frontend) — todos OK. `npm test` en frontend — 2/2 tests pasaron (no relacionados con los cambios; backend no tiene suite de tests configurada). `git diff --check` y `git status --porcelain` en ambos repos — sin problemas de whitespace, solo los archivos listados arriba modificados. Revisión manual del diff completo de cada archivo para confirmar que ningún `catch` dejó de re-lanzar su error.

## Riesgos encontrados

- No existe manejador global de errores en Express (`app.js`) ni listeners de `window.error`/`unhandledrejection` en el frontend — documentados como huecos abiertos, no implementados esta sesión (agregar cualquiera de los dos cambia comportamiento observable ante errores no capturados, fuera del alcance de "solo logs").
- `generateExamWithIa`/`generateMissingQuestionsWithIa` (`examenes.service.js`) parecen no tener consumidores (posible código legado del flujo de examen "todo de una vez", reemplazado por el flujo por-pregunta). No se tocó su lógica, solo se corrigieron sus logs sensibles por precaución.
- `dashboard.page.js` (el archivo más grande y crítico, 6066 líneas) no fue auditado en esta sesión — su flujo de examen "por unidad" (`waitForExamGenerationCompletion`, `submitUnitExamModal`) y su navegación jerárquica quedan pendientes para una sesión de logs separada.

## Pendientes

Ver sección 8 "Huecos que siguen abiertos" de `docs/observability/LOG_AUDIT.md` (6 puntos: manejador global de errores backend, listener global de errores frontend, `dashboard.page.js` sin auditar, `archivados.page.js`/`jerarquia.service.js`/`detalle.page.js` sin auditar a fondo, código posiblemente sin consumidores en `examenes.service.js`, y `debugPlaneacionRequest` sin consumidores).

## Próximo paso recomendado

Ejecutar la validación manual pendiente (sección 10 de `LOG_AUDIT.md`): correr el backend y el frontend localmente, realizar el ciclo completo (crear planeación → generar anexo → generar lista de cotejo → generar examen → eliminar un recurso) y confirmar que la secuencia de logs en terminal coincide con lo documentado.
