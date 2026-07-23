# Roadmap del refactor de Biblioteca

Este es el único roadmap operativo vigente del frontend. Define **qué** se ejecutará y qué evidencia permite avanzar. El [`REFACTOR_PLAYBOOK.md`](REFACTOR_PLAYBOOK.md) define **cómo** trabajar en cada sesión.

**Biblioteca es el único flujo visual principal vigente y la dirección del refactor es Biblioteca modular.** El explorador visual jerárquico antiguo es legacy: se aísla antes de considerar su eliminación y nunca se convierte nuevamente en arquitectura principal. La jerarquía técnica se conserva cuando sostenga datos, relaciones, endpoints, selectores, compatibilidad o Archivados.

## Responsabilidad documental

| Documento | Responsabilidad |
| --- | --- |
| [`AGENTS.md`](../../AGENTS.md) | Reglas obligatorias para agentes. |
| [`docs/ARCHITECTURE.md`](../ARCHITECTURE.md) | Arquitectura actual y objetivo arquitectónico. |
| [`REFACTOR_PLAYBOOK.md`](REFACTOR_PLAYBOOK.md) | Método para ejecutar cada sesión. |
| `REFACTOR_ROADMAP.md` | Fases, orden, resultados y criterios de salida. |
| [`SESSION_HANDOFF.md`](SESSION_HANDOFF.md) | Estado de la última sesión y siguiente paso. |
| [`TEST_MATRIX.md`](TEST_MATRIX.md) | Validaciones funcionales acumulativas. |
| Backend [`DATABASE_SCHEMA.md`](../../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md) | Datos y relaciones. |
| Backend [`AI_GENERATION_CONTRACTS.md`](../../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md) | Prompts y contratos de generación IA. |

El backlog histórico del backend no es un plan operativo del frontend. Las decisiones transversales se registran en [`REFACTOR_DECISIONS.md`](REFACTOR_DECISIONS.md).

## Resumen

| Fase | Nombre | Objetivo principal | Riesgo | Estado |
| --- | --- | --- | --- | --- |
| 0 | Línea base y protección | Establecer punto seguro | Bajo | En progreso |
| 1 | Extracciones aisladas | Crear primeros módulos | Bajo | Pendiente |
| 2 | Acciones por dominio | Separar documentos | Bajo/medio | Pendiente |
| 3 | Capa API frontend | Centralizar llamadas HTTP | Medio | Pendiente |
| 4 | Generación y polling | Separar procesos largos | Alto | Pendiente |
| 5 | Estado de Biblioteca | Reducir `explorerState` | Alto | Pendiente |
| 6 | Render y eventos | Dividir `biblioteca.page.js` | Medio/alto | Pendiente |
| 7 | Desacoplar dashboard | Quitar dependencias activas | Alto | Pendiente |
| 8 | Aislar legacy visual | Separar explorador antiguo | Medio | Pendiente |
| 9 | Eliminar legacy confirmado | Borrar código sin consumidores | Alto | Pendiente |
| 10 | Consolidación final | Retirar wrappers y deuda | Medio | Pendiente |

Los únicos estados válidos son `Pendiente`, `En progreso`, `Completada`, `Bloqueada` y `Cancelada`. No se marca una fase como completada sin evidencia de todos sus criterios de salida.

## Fase 0 — Línea base y protección

### Objetivo

Asegurar un estado conocido, documentado y recuperable antes de modificar código.

### Estado

**En progreso.** Al 2026-07-23 se confirmaron repositorios inicialmente limpios, documentación canónica, auditoría de logs y tags remotos de recuperación apuntando al `HEAD`. La línea base manual completa sigue pendiente y esta sesión documental no genera commit.

### Dependencias

Ninguna fase anterior. Requiere acceso verificable a frontend, backend y sus remotos.

### Alcance permitido

- Alinear reglas frontend y backend.
- Declarar Biblioteca como flujo canónico y el explorador visual como legacy.
- Proteger schema, contratos IA, observabilidad y jerarquía técnica.
- Mantener la test matrix.
- Verificar commits, tags, limpieza de repositorios y validación manual.

### Fuera de alcance

- Mover, eliminar o reescribir código.
- Cambiar comportamiento, payloads, endpoints, schema, prompts, polling o jobs.
- Declarar correctas pruebas manuales no ejecutadas.

### Archivos o áreas candidatas

Documentación frontend y backend, `git status`, historial y tags; aplicación en navegador solo para ejecutar la línea base.

### Procedimiento recomendado

1. Confirmar fuentes canónicas y estado documental.
2. Verificar que ambos repositorios estén limpios antes de la línea base.
3. Ejecutar toda la matriz manual con frontend y backend de baseline.
4. Registrar consola, respuestas HTTP y artefactos generados.
5. Confirmar commits recuperables y tags remotos en ambos repositorios.

### Resultado esperado

**Estado estable previo al refactor con punto de recuperación.**

### Criterios de salida

- Frontend y backend limpios.
- Tags remotos creados y apuntando a los commits base.
- Biblioteca carga.
- Planeación, anexo, lista y examen funcionan.
- Previews, descargas y eliminación funcionan.
- No hay errores inesperados en consola ni terminal.
- La documentación final y la matriz están alineadas.
- El refuerzo de logs está documentado y sus pendientes conocidos no bloquean silenciosamente la línea base.

### Pruebas obligatorias

Toda la [`TEST_MATRIX.md`](TEST_MATRIX.md), incluida Auth, Biblioteca, generación, polling, previews, descargas, eliminación, recarga y Archivados como flujo separado.

### Riesgos

- Confundir evidencia documental con validación runtime.
- Etiquetar un commit que no corresponde al estado probado.
- Empezar una extracción con cambios locales no controlados.

### Evidencia que debe registrarse

Commit de frontend y backend, resultado de tags locales/remotos, estado limpio, fecha y resultado real de cada prueba, consola y terminal, además del handoff actualizado.

### Condición para avanzar

Todos los criterios de salida deben estar confirmados. Mientras falte la prueba manual completa o los repositorios no estén limpios, la Fase 1 no debe ejecutarse.

## Fase 1 — Extracciones aisladas de bajo riesgo

### Objetivo

Crear los primeros módulos de Biblioteca mediante extracciones literales, pequeñas y comprobables.

### Estado

**Pendiente.**

### Dependencias

Fase 0 completada y consumidor de cada función clasificado.

### Alcance permitido

- Preview y cierre de preview de examen.
- Descarga de examen sin tocar `wordExport.js`.
- Preview y descarga de lista de cotejo.
- Otras funciones pequeñas confirmadas como Biblioteca activa o compartida activa.
- Crear `js/features/` solo junto con el primer módulo real.

### Fuera de alcance

- Cambios de lógica, UI, firmas públicas, payloads o contratos.
- Generación, polling, estado global amplio o corrección de bugs.
- Elegir nombres definitivos de módulos antes de auditar consumidores y responsabilidades.

### Archivos o áreas candidatas

Funciones de preview y descarga hoy distribuidas entre `dashboard.page.js` y `biblioteca.page.js`, sus wrappers `window.*`, event handlers y orden de scripts en `dashboard.html`.

### Procedimiento recomendado

1. Buscar consumidores en HTML, JS, `window.*`, handlers y `data-*`.
2. Clasificar función y estado asociado.
3. Extraer literalmente una responsabilidad por sesión.
4. Mantener firma y wrapper global.
5. Insertar el script en el orden equivalente.
6. Validar antes y después con las mismas entradas.

### Resultado esperado

**Primeros módulos dentro de `js/features/` sin cambiar comportamiento.**

### Criterios de salida

- Implementación canónica extraída sin diferencias funcionales.
- Wrappers y firmas públicas preservados.
- Consumidores documentados.
- Ningún listener duplicado.
- Preview, cierre y descarga seleccionados pasan sus pruebas.

### Pruebas obligatorias

Preview de examen abrir/cerrar, descarga de examen, preview de lista y descarga de lista según el alcance; además Login, carga de Biblioteca, navegación de tabs y recarga.

### Riesgos

Orden de scripts, dependencia de `explorerState`, globals ausentes, doble binding y alteración accidental del nombre o formato de descarga.

### Evidencia que debe registrarse

Búsqueda global, consumidores, página/evento, globals consumidas/expuestas, diff literal, sintaxis, pruebas, consola y wrapper conservado.

### Condición para avanzar

Al menos una extracción aislada debe cumplir todos sus criterios y la matriz crítica acumulativa sin regresiones.

## Fase 2 — Acciones por dominio

### Objetivo

Separar gradualmente las acciones específicas de planeaciones, anexos, listas de cotejo y exámenes.

### Estado

**Pendiente.**

### Dependencias

Fase 1 parcial o completa, convenciones de módulos comprobadas y consumidores de cada acción confirmados.

### Alcance permitido

Preview, download, delete, acciones de cards, modales propios y helpers privados por recurso.

### Fuera de alcance

Migración completa del estado, generación compleja, polling, cambios de contratos o abstracciones compartidas prematuras.

### Archivos o áreas candidatas

Acciones de recursos dentro de `biblioteca.page.js`, funciones compartidas activas de `dashboard.page.js`, APIs/services existentes y wrappers asociados.

### Procedimiento recomendado

Extraer un dominio y una responsabilidad por sesión, conservar coordinadores en Biblioteca, mantener wrappers necesarios y ejecutar pruebas del recurso más regresión acumulativa.

### Resultado esperado

**`biblioteca.page.js` deja de contener directamente todas las acciones de cada recurso.**

### Criterios de salida

- Cada acción extraída tiene propietario de dominio claro.
- Cards, modales, previews, descargas y deletes conservan comportamiento.
- No se duplican helpers ni listeners.
- Los contratos públicos y globals necesarios se mantienen.

### Pruebas obligatorias

Todas las acciones del dominio modificado, más Login, carga de Biblioteca, tabs, recarga y pruebas críticas aprobadas de Fase 1.

### Riesgos

Duplicación entre dominios, contexto perdido de card/bloque, mensajes alterados y retiro prematuro de wrappers.

### Evidencia que debe registrarse

Mapa de acciones, consumidores, wrappers, eventos, resultado por recurso, consola, solicitudes HTTP observadas y handoff.

### Condición para avanzar

Los dominios necesarios para la siguiente fase deben estar suficientemente delimitados y sus regresiones acumulativas deben pasar.

## Fase 3 — Capa API frontend

### Objetivo

Eliminar llamadas HTTP dispersas y hacer que las páginas coordinen flujos mientras la capa API ejecuta solicitudes.

### Estado

**Pendiente.**

### Dependencias

Inventario API confirmado; puede avanzar después de Fase 1 o 2 cuando una frontera HTTP concreta esté auditada.

### Alcance permitido

Reutilizar y consolidar wrappers API existentes, headers, parsing y manejo de errores, conservando exactamente rutas, métodos, auth, códigos esperados y payloads.

### Fuera de alcance

Renombrar campos, normalizar contratos, cambiar códigos esperados, cambiar autenticación, adaptar backend, corregir bugs o crear contratos nuevos.

### Archivos o áreas candidatas

`js/api/`, `js/services/` y llamadas HTTP directas confirmadas dentro de páginas.

### Procedimiento recomendado

Inventariar request y response, comparar wrapper existente, mover literalmente la solicitud, conservar el adapter público y validar red/errores antes de eliminar duplicación.

### Resultado esperado

**Las páginas coordinan flujos y la capa API ejecuta solicitudes.**

### Criterios de salida

- No quedan llamadas del alcance duplicadas en páginas.
- URL, método, headers, body, parsing y errores observables son equivalentes.
- Auth continúa obteniéndose del flujo vigente.
- Pruebas de éxito y error pasan.

### Pruebas obligatorias

Operaciones del endpoint movido, sesión expirada/no autorizada cuando exista prueba segura, errores HTTP, carga de Biblioteca y regresión acumulativa previa.

### Riesgos

Cambios sutiles de parsing, doble consumo de response, headers omitidos y divergencia entre APIs existentes.

### Evidencia que debe registrarse

Inventario request/response, equivalencia de contrato, captura de red sin secretos, consumidores, errores y pruebas.

### Condición para avanzar

Las APIs requeridas por generación y dominios deben estar suficientemente separadas; una razón técnica puede ajustar el orden si queda documentada.

## Fase 4 — Generación y polling

### Objetivo

Separar por dominio el inicio, feedback, progreso, polling, finalización, error y limpieza de procesos largos.

### Estado

**Pendiente.**

### Dependencias

Capa API y dominios suficientemente separados, contratos backend leídos y baseline completa.

### Alcance permitido

Extracción literal de flujos de anexos, listas, planeaciones y exámenes. Orden sugerido: anexos → listas de cotejo → planeaciones → exámenes, ajustable según dependencias reales documentadas.

### Fuera de alcance

Cambiar prompts, modelos, parámetros, payloads, IDs, jobs, retries, duplicados, métricas, estados backend o polling. La cancelación al navegar solo puede cambiar si el comportamiento vigente o una tarea explícita lo autoriza.

### Archivos o áreas candidatas

Orquestación de generación en Biblioteca/Dashboard, APIs y services de cada recurso, feedback visual, timers y estado de progreso.

### Procedimiento recomendado

Leer los contratos IA backend, diagramar transiciones actuales, extraer un recurso por sesión, preservar eventos/intervalos/estados/errores y medir la regresión completa del recurso.

### Resultado esperado

**Los procesos de generación ya no están mezclados con el render general de Biblioteca.**

### Criterios de salida

- Cada flujo conserva inicio, progreso, terminales y errores.
- No hay polling duplicado ni cambios de frecuencia.
- Exámenes conservan jobs, `planeacion_ids`, contexto de `unidad_id` y progreso por pregunta.
- No se alteran métricas ni mensajes contractuales.

### Pruebas obligatorias

Generación exitosa y fallo permitido de cada recurso; estados `skipped` de listas; SSE de planeaciones; creación/polling/resultado de examen; navegación y recarga según comportamiento vigente; regresión acumulativa.

### Riesgos

Fugas de timers, polling simultáneo, estados terminales perdidos, doble generación, cambios de IDs y exposición de errores internos.

### Evidencia que debe registrarse

Diagrama de estados observado, timers, payloads comparados sin datos sensibles, eventos/respuestas, consumidores, pruebas y consola/terminal.

### Condición para avanzar

Los procesos extraídos deben ser funcionalmente equivalentes y el estado que consumen debe estar clasificado antes de Fase 5.

## Fase 5 — Estado de Biblioteca

### Objetivo

Crear un estado identificable de Biblioteca y reducir su dependencia de `window.explorerState`.

### Estado

**Pendiente.**

### Dependencias

Consumidores de estado clasificados y flujos de dominio suficientemente delimitados.

### Alcance permitido

Clasificar cada propiedad como Biblioteca activa, Preview activa, Generación activa, Compartida activa, Archivados, Compatibilidad, Explorador visual legacy o Desconocida; mover solo propiedades confirmadas y mantener aliases/wrappers temporales.

### Fuera de alcance

Mover propiedades desconocidas, eliminar `explorerState` como bloque, imponer `window.BibliotecaState` o mezclar correcciones de sincronización.

### Archivos o áreas candidatas

`explorerState`, estado privado de `biblioteca.page.js`, `window.biblioteca`, previews, progreso, modales y confirmación de eliminación.

### Procedimiento recomendado

Construir mapa propiedad-consumidor, separar una categoría por sesión, mantener alias bidireccional solo si es imprescindible y comprobar identidad/transiciones antes de retirar accesos antiguos.

### Resultado esperado

**Biblioteca tiene estado identificable y `explorerState` conserva solo compatibilidad pendiente.**

### Criterios de salida

- Todas las propiedades movidas tienen consumidores conocidos.
- Biblioteca no depende de copias divergentes.
- Wrappers/aliases documentan retiro.
- Archivados y jerarquía técnica no se ven afectados.

### Pruebas obligatorias

Tabs, selección de bloque, previews, modales, feedback/progreso, recarga, deletes, generación y regresión acumulativa.

### Riesgos

Estado duplicado, referencias mutables distintas, pérdida de selección, condiciones de carrera y clasificación incorrecta de compatibilidad.

### Evidencia que debe registrarse

Matriz propiedad-consumidor-clasificación, globals, aliases, transiciones, pruebas y cualquier dependencia desconocida.

### Condición para avanzar

El estado necesario para render y eventos debe tener propietario claro; las propiedades desconocidas permanecen sin mover y documentadas.

## Fase 6 — Render y eventos

### Objetivo

Dividir gradualmente render y eventos para que `biblioteca.page.js` actúe como coordinador.

### Estado

**Pendiente.**

### Dependencias

Dominios y estado parcialmente separados.

### Alcance permitido

Render de bloques, tabs, cards, estados vacíos, feedback, event delegation, modales, acciones optimistas y recarga parcial.

### Fuera de alcance

Rediseño visual, cambio de UX, reactivación del árbol legacy, mezcla de estados o generalización para dos interfaces.

### Archivos o áreas candidatas

Renderers y handlers de `biblioteca.page.js`, selectores de `dashboard.html`, componentes compartidos activos y módulos de dominio ya extraídos.

### Procedimiento recomendado

Separar render puro de coordinación, extraer un área visible por sesión, preservar markup/selectores/atributos, registrar listeners una vez y verificar tras recargas parciales.

### Resultado esperado

**`biblioteca.page.js` actúa como coordinador y no como contenedor de toda la implementación.**

### Criterios de salida

- Render y eventos tienen fronteras claras.
- No existe doble render ni listener duplicado.
- Selectores y `data-*` conservan contrato.
- Acciones responden después de recarga parcial y cambio de tabs.

### Pruebas obligatorias

Carga, tabs, cards, vacíos, modales, acciones, recarga parcial/completa, consola y regresión acumulativa.

### Riesgos

Listeners duplicados, render doble, selectores inconsistentes, eventos perdidos y UI optimista sin reconciliación.

### Evidencia que debe registrarse

Árbol de eventos, selectores, punto de registro, conteo de listeners/requests observado, capturas funcionales y pruebas.

### Condición para avanzar

Las funciones propias de Biblioteca deben estar identificables para auditar el acoplamiento restante con Dashboard.

## Fase 7 — Desacoplar Biblioteca de dashboard

### Objetivo

Quitar dependencias activas de `dashboard.page.js` que pertenecen a Biblioteca sin eliminar Dashboard todavía.

### Estado

**Pendiente.**

### Dependencias

Funciones activas de Biblioteca identificadas y estado/render suficientemente separados.

### Alcance permitido

Clasificar cada dependencia de `dashboard.page.js`, `window.*`, `explorerState` y helpers compartidos como: mover a Biblioteca, mover a core compartido, conservar para Archivados, wrapper temporal, legacy o desconocida.

### Fuera de alcance

Eliminar `dashboard.page.js`, romper el orden de inicialización, quitar wrappers con consumidores o modificar Archivados.

### Archivos o áreas candidatas

Previews, descargas, creación/progreso de planeaciones, confirmaciones, helpers compartidos, globals y bootstrap del dashboard.

### Procedimiento recomendado

Crear inventario bidireccional Dashboard↔Biblioteca, resolver una dependencia por sesión, preservar wrapper en el propietario anterior y validar inicialización/orden.

### Resultado esperado

**Biblioteca deja de depender de `dashboard.page.js` para funciones que son propias de Biblioteca.**

### Criterios de salida

- No quedan dependencias propias de Biblioteca sin clasificación.
- Las movidas tienen propietario estable.
- Las compartidas y de Archivados permanecen accesibles.
- Dashboard sigue cargando sin cambiar el contrato de entrada.

### Pruebas obligatorias

Inicialización, carga Biblioteca, creación/progreso, previews/descargas, modales, recarga, Archivados separado y regresión acumulativa.

### Riesgos

Acoplamiento bidireccional oculto, globals creadas tarde, orden de scripts y helpers falsamente clasificados como legacy.

### Evidencia que debe registrarse

Inventario de dependencias, resolución elegida, búsqueda global, orden de scripts, wrappers y pruebas.

### Condición para avanzar

Biblioteca debe poder operar sin depender del código visual del explorador antiguo; las dependencias desconocidas bloquean el aislamiento.

## Fase 8 — Aislar legacy visual

### Objetivo

Separar el explorador visual jerárquico antiguo de Biblioteca sin eliminar jerarquía técnica ni compatibilidad activa.

### Estado

**Pendiente.**

### Dependencias

Biblioteca desacoplada de las piezas visuales legacy y consumidores clasificados.

### Alcance permitido

Mover el explorador a un módulo legacy, dejar de cargarlo en rutas vigentes, conservarlo temporalmente para referencia, marcarlo no ejecutable o separarlo de helpers activos.

### Fuera de alcance

Eliminar código con consumidores o dudas; eliminar endpoints, relaciones, IDs, selectores, Archivados o helpers activos.

### Archivos o áreas candidatas

Árbol, breadcrumbs, navegación por niveles, ramas de inicialización legacy y estado exclusivamente visual confirmado.

### Procedimiento recomendado

Delimitar el bloque visual, separar helpers activos, comprobar entry points alternativos, aislar sin borrar y ejecutar la matriz completa.

### Resultado esperado

**El explorador visual antiguo ya no está mezclado con Biblioteca.**

### Criterios de salida

- La ruta vigente no carga ni ejecuta el explorador visual.
- Biblioteca y Archivados siguen funcionando.
- Jerarquía técnica y helpers activos permanecen.
- Todo componente aislado tiene clasificación y evidencia de consumidores.

### Pruebas obligatorias

Matriz completa de Biblioteca, Auth, recarga, ausencia de árbol/breadcrumbs legacy, Archivados separado y pruebas de compatibilidad temporal explícitas.

### Riesgos

Entry points no detectados, efectos laterales de carga, helpers activos dentro del bloque visual y falsa equivalencia entre jerarquía técnica y UI legacy.

### Evidencia que debe registrarse

Scripts/entry points revisados, búsqueda global, componentes aislados, no ejecución en ruta vigente, pruebas y plan de reversión.

### Condición para avanzar

El legacy debe estar aislado y no tener consumidores confirmados; cualquier duda mantiene la Fase 9 bloqueada.

## Fase 9 — Eliminar legacy confirmado

### Objetivo

Eliminar únicamente código del explorador visual obsoleto demostrado sin consumidores.

### Estado

**Pendiente.**

### Dependencias

Legacy aislado, sin consumidores y con commit previo estable.

### Alcance permitido

Eliminar piezas visuales legacy confirmadas mediante búsqueda global, revisión manual y pruebas.

### Fuera de alcance

Eliminar `unidad_id`, `tema_id`, relaciones, endpoints técnicos, modelos de datos, selectores usados, contratos backend, Archivados o cualquier elemento desconocido.

### Archivos o áreas candidatas

Solo los componentes incluidos en el inventario de Fase 8 con evidencia explícita de cero consumidores.

### Procedimiento recomendado

1. Buscar en HTML, scripts cargados, `window.*`, `data-*`, handlers, rutas e imports.
2. Revisar Archivados y entry points alternativos.
3. Confirmar pruebas completas y commit estable previo.
4. Documentar plan de reversión.
5. Eliminar en una sesión separada y pequeña.

### Resultado esperado

**Se elimina solo el explorador visual obsoleto sin afectar Biblioteca, Archivados ni la jerarquía técnica.**

### Criterios de salida

- Búsqueda posterior sin referencias rotas.
- Biblioteca y Archivados pasan toda la matriz.
- No cambian contratos, IDs ni rutas backend.
- La reversión está identificada y el handoff actualizado.

### Pruebas obligatorias

Matriz completa, pruebas automatizadas, carga/recarga, consola, red, scripts y compatibilidad temporal restante.

### Riesgos

Consumidor oculto, carga dinámica, restauración de Archivados afectada, eliminación demasiado amplia y reversión incompleta.

### Evidencia que debe registrarse

Búsquedas antes/después, alcance exacto eliminado, commit previo, plan de reversión, pruebas completas y confirmación de jerarquía técnica intacta.

### Condición para avanzar

La aplicación debe permanecer estable sin el legacy eliminado y sin referencias residuales; de lo contrario se revierte y la fase continúa.

## Fase 10 — Consolidación final

### Objetivo

Retirar compatibilidad ya innecesaria y cerrar una Biblioteca modular con documentación actualizada.

### Estado

**Pendiente.**

### Dependencias

Refactor funcional completado, legacy confirmado retirado o explícitamente conservado y matriz completa aprobada.

### Alcance permitido

Retirar wrappers sin consumidores, aliases temporales y helpers duplicados; reducir globals; normalizar nombres internos; ordenar carga de scripts; actualizar arquitectura, roadmap y handoff.

### Fuera de alcance

Mezclar limpieza con bugs, mejoras de producto o cambios de contratos. Cualquier cambio funcional requiere una tarea separada.

### Archivos o áreas candidatas

Wrappers documentados, aliases, helpers duplicados, orden de scripts y documentación del estado final.

### Procedimiento recomendado

Retirar una deuda por sesión con búsqueda global y pruebas, separar cualquier mejora detectada, actualizar inventarios y cerrar decisiones temporales.

### Resultado esperado

**Biblioteca modular, sin dependencias visuales legacy innecesarias y con contratos preservados.**

### Criterios de salida

- Wrappers restantes tienen consumidores y motivo documentado.
- Globals y aliases innecesarios fueron retirados con evidencia.
- Arquitectura refleja el estado real.
- Matriz completa y pruebas automatizadas pasan.
- Roadmap y handoff registran cierre verificable.

### Pruebas obligatorias

Suite automatizada completa, matriz manual completa, consola/terminal, enlaces documentales, carga de scripts y verificación de contratos protegidos.

### Riesgos

Convertir limpieza en cambio funcional, renombrar contratos públicos y retirar compatibilidad todavía activa.

### Evidencia que debe registrarse

Inventario final de globals/wrappers, pruebas, estado de repositorios, documentación final y deudas explícitamente diferidas.

### Condición para avanzar

No hay fase posterior: el roadmap se marca completado solo cuando todos los criterios finales tienen evidencia y los pendientes quedan fuera del refactor con propietario.

## Reglas de avance

- No avanzar a una fase de mayor riesgo con validaciones pendientes.
- No eliminar código legacy antes de completar aislamiento.
- No marcar una fase como completada solo porque el código fue movido.
- Cada fase debe cumplir criterios de salida y pruebas.
- Una dependencia nueva puede cambiar el orden.
- Los cambios de orden deben documentarse.
- No mezclar dos fases grandes en una sola sesión.
- Cada fase puede dividirse en múltiples sesiones pequeñas.
- Cada sesión debe terminar con handoff actualizado.
- Cada fase debe tener uno o varios commits pequeños.

## Dependencias entre fases

| Fase | Requiere |
| --- | --- |
| 1 | Fase 0 |
| 2 | Fase 1 parcial o completa |
| 3 | Inventario API confirmado |
| 4 | API y dominios suficientemente separados |
| 5 | Consumidores de estado clasificados |
| 6 | Dominios y estado parcialmente separados |
| 7 | Funciones activas de Biblioteca identificadas |
| 8 | Biblioteca desacoplada |
| 9 | Legacy aislado y sin consumidores |
| 10 | Refactor funcional completado |

Estas dependencias expresan el camino seguro esperado. Pueden ajustarse por una razón técnica concreta, siempre que el cambio de orden, el riesgo y las validaciones compensatorias queden registrados en este roadmap y en el handoff.

## Entregables por fase

| Fase | Entregables mínimos | Verificación |
| --- | --- | --- |
| 0 | baseline, tags, test matrix | commits/tags remotos, repos limpios y matriz completa |
| 1 | primeros módulos y wrappers | consumidor, diff literal y pruebas de preview/descarga |
| 2 | módulos por recurso | acciones del dominio fuera del coordinador y regresión |
| 3 | wrappers API consolidados | equivalencia de request/response y errores |
| 4 | módulos de generación/polling | transiciones y terminales equivalentes |
| 5 | mapa y estado de Biblioteca | matriz propiedad-consumidor y aliases |
| 6 | módulos de render/eventos | un solo binding y render estable |
| 7 | eliminación de dependencias activas de dashboard | inventario resuelto y Biblioteca operativa |
| 8 | módulo o aislamiento legacy | ruta vigente sin ejecución del explorador |
| 9 | eliminación segura del legacy | cero consumidores y matriz completa |
| 10 | documentación final y wrappers retirados | inventario final, pruebas y cierre documental |
