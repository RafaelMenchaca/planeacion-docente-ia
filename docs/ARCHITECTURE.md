# Arquitectura del frontend

Este documento describe la arquitectura frontend observada en el código actual. Las reglas obligatorias están en [`AGENTS.md`](../AGENTS.md).

## Estado actual

La arquitectura descrita desde esta sección hasta “Arquitectura objetivo” corresponde al estado observado. Incluye dependencias temporales que todavía no representan el diseño deseado.

Las Fases 0–7 están completadas. Fase 6 cerró mediante la auditoría 6.4 y Fase
7 mediante la auditoría 7.4. Los commits funcionales de Fase 7 son `97b798c`,
`a6840a4` y `bcd361e`; su manual acumulada está aprobada. La auditoría 8.0 abrió
documentalmente Fase 8, sin implementación funcional ni manual requerida. El inventario ejecutable se conserva en
[`FRONTEND_MAP.md`](FRONTEND_MAP.md).

## Regla arquitectónica central

Solo existe un flujo visual principal vigente: **Biblioteca**.

La jerarquía técnica puede seguir existiendo como modelo de datos, API, selector, compatibilidad o soporte de Archivados. El explorador visual jerárquico antiguo no debe mezclarse con Biblioteca ni utilizarse para nuevas implementaciones.

## Stack y carpetas

- HTML multipágina y JavaScript Vanilla mediante scripts clásicos.
- CSS propio, Bootstrap y Tailwind según la página.
- Supabase JS para autenticación y Storage puntual.
- API backend consumida con `fetch`.

| Ruta | Responsabilidad actual |
| --- | --- |
| `pages/` | Páginas privadas, login, redirects y vistas auxiliares. |
| `js/core/` | Configuración de API, Supabase y utilidades. |
| `js/api/` | Wrappers HTTP por recurso. |
| `js/services/` | Autenticación y orquestación. |
| `js/pages/` | Estado, eventos e inicialización de páginas. |
| `js/features/` | Acciones modulares por dominio extraídas en Fases 1, 2 y 4. |
| `js/ui/` | Componentes, modales, helpers y descargas. |
| `tests/` | Suite automatizada existente. |

La auditoría de la capa HTTP y sus contratos se mantiene en
[`FRONTEND_MAP.md`](FRONTEND_MAP.md).

## Capa HTTP actual

La arquitectura ejecutable es mixta:

- `js/api/` contiene todo el HTTP contra Express.
- Los services de exámenes, listas, jerarquía y planeaciones delegan a sus
  respectivos API files, obtienen sesión y, en algunos casos, normalizan la
  respuesta.
- Biblioteca consume directamente `biblioteca.api.js`, partes de las API de
  generación y `anexos.api.js`.
- `planeaciones.service.js` combina wrappers HTTP con un registro local usado
  por Archivados.
- Los únicos `fetch` fuera de `js/api/` cargan fragmentos HTML desde páginas o
  UI; no llaman al backend Express.
- La autenticación y Storage puntuales adicionales se realizan mediante el SDK
  de Supabase.

`API_BASE_URL` y `window.API_BASE_URL` nacen del mismo archivo, pero los
wrappers actuales leen la forma léxica. El orden de carga es contractual porque
se usan scripts clásicos y globals `window.*`, además de funciones globales
implícitas. Los contratos de Biblioteca, Detalle, Archivados y explorador
legacy se mantienen separados.

La Fase 3 cerró la consolidación interna de las fronteras HTTP pequeñas y
equivalentes sin crear un cliente universal. `bibliotecaGet`,
`bibliotecaDelete`, `anexosGet`, `listasCotejoGet` y `examResourceGet` son
bindings léxicos privados, específicos de dominio y método; las APIs públicas,
services y wrappers `window.*` conservan sus firmas. Las diferencias de sesión,
parsing, errores, SSE, blobs, generación y polling permanecen deliberadamente
separadas. La Sesión 4.0 abrió documentalmente la Fase 4 y quedó aprobada. La
Fase 4 está cerrada formalmente: las Sesiones 4.1, 4.2 y 4.3 movieron literalmente las
  operaciones vigentes de generación seleccionada de anexos y listas, el
  coordinador de inicio/progreso de planeaciones y la creación/polling de
  exámenes de Biblioteca, a
  `js/features/anexos/anexo-generation.js`,
  `js/features/listas-cotejo/lista-cotejo-generation.js` y
  `js/features/planeaciones/planeacion-generation.js`, y la Sesión 4.4 añadió
  `js/features/examenes/exam-generation.js`. Conservan APIs, selección, pending,
  feedback, espera, persistencia y refetch. Quick create, la generación
  individual, los parsers SSE compartidos y el coordinador/polling legacy de
  exámenes permanecen en sus propietarios anteriores.

La Sesión 4.4 quedó validada manualmente y commiteada. La Sesión 4.5 auditó el
cierre sin modificar código: confirmó los cuatro coordinadores por dominio, sus
globals y consumidores únicos, el orden clásico de scripts y la integridad de
quick create, generación individual, legacy, APIs/services y backend. La
decisión formal **A. Cerrar Fase 4** y su validación documental quedaron
aprobadas en el commit de cierre `8dcba86`. No se detectaron regresiones
introducidas; los riesgos conocidos permanecen preservados. Fase 5 quedó
abierta formalmente y En progreso mediante la Sesión 5.0, aprobada y commiteada
en `525a21a`, sin cambios funcionales. La Sesión 5.1 encapsuló literalmente el
acceso a `bibliotecaState.selectedConjuntoId` mediante la superficie léxica
`BibliotecaSelection`: el valor sigue viviendo una sola vez en el mismo estado,
sin global nuevo, archivo nuevo ni cambio de orden de scripts. Normalización,
fallback crudo de delete, Quick Create, `activeTab`, pending, render y legacy se
preservaron. La implementación, las validaciones estáticas y la validación
manual de 5.1 quedaron aprobadas y commiteadas en `1b4c620`. La Sesión 5.2
encapsuló literalmente el mapa existente `bibliotecaState.activeTab` mediante
la superficie léxica `BibliotecaTabs`, sin moverlo ni duplicarlo. El fallback
`planeaciones`, las claves y valores, selección, generación, delete, render,
eventos, Quick Create y orden de scripts permanecen. La implementación, las
validaciones estáticas y la validación manual de 5.2 están aprobadas; la sesión
quedó commiteada en `f5bbfdd`. `BibliotecaTabs`, la única fuente de verdad y el
fallback `planeaciones` permanecen preservados. La Sesión 5.3 encapsuló
literalmente el estado existente `bibliotecaState.anexoModal` mediante la
superficie léxica `BibliotecaAnexoModalState`, sin moverlo, copiarlo ni exponer
una global. Apertura, cierre, selección, depuración desde render, `submitting`,
error y delegación a `AnexoGeneration` conservan su orden y expresiones. La
implementación, las validaciones estáticas y la validación manual están
aprobadas; la sesión quedó commiteada en `f05e730`. `BibliotecaAnexoModalState` quedó
aprobada, `bibliotecaState.anexoModal` continúa como única fuente de verdad y
`AnexoGeneration`/`anexosGenerating` permanecen preservados. La Sesión 5.4
encapsuló literalmente `bibliotecaState.listaModal` mediante la superficie
léxica `BibliotecaListaModalState`: apertura, cierre, selección, depuración
desde render, `submitting`, error y snapshot hacia `ListaCotejoGeneration`
conservan la fuente física, el shape, el orden y las expresiones previas. La
generación, `pendingListaByBatchId`, el cleanup de 1500 ms, render, eventos,
selección, tabs y los demás modales permanecen intactos. Implementación y
validaciones estáticas y validación manual aprobadas; commit `948d627`.
`BibliotecaListaModalState` quedó aprobada,
`bibliotecaState.listaModal` sigue siendo la única fuente de verdad y
`ListaCotejoGeneration`/`pendingListaByBatchId` permanecen preservados. La
Sesión 5.5 encapsula literalmente `bibliotecaState.examModal` mediante la
superficie léxica `BibliotecaExamModalState`. La propiedad original conserva
la única fuente física, su shape, bloque, unidad, planeaciones, selección,
tipos, cantidades, `submitting` y error; la superficie solo delega las mismas
transiciones. `ExamGeneration`, el payload protegido, la creación del job,
`pendingExamenByBatchId`, polling, render, eventos y modales anteriores no se
modificaron. La Sesión 5.5 quedó implementada y validada manualmente;
`BibliotecaExamModalState` está aprobada y `bibliotecaState.examModal` sigue
siendo la única fuente de verdad. `ExamGeneration`, `pendingExamenByBatchId` y
polling permanecen preservados. El contrato
`unidad_id`/`batch_id`/`planeacion_ids` continúa intacto: Biblioteca envía esos
campos junto con `tipos_pregunta` y `cantidades_pregunta`, y no envía
`tema_ids`; backend sigue resolviendo los temas desde `planeacion_ids`.
Implementación, validaciones estáticas y validación manual aprobadas; commit
`3842f20`. La Sesión 5.6 encapsuló literalmente
`bibliotecaState.agregarModal` mediante la superficie léxica
`BibliotecaPlaneacionModalState`. El shape real permanece `{open, conjuntoId,
unidadId, materia, nivel, unidad, temas, error}` —sin `submitting`— y conserva
una sola fuente física. Apertura, cierre parcial, temas, actividades por
momento, error, snapshot y delegación a `PlaneacionGeneration` mantienen sus
expresiones y orden. `batch_id`, reutilización del bloque, SSE,
`pendingPlaneacionesByBatchId`, tab Planeaciones, refetch, `duplicate_tema` y
Quick Create permanecen fuera de la superficie e intactos. Implementación y
validaciones estáticas y validación manual aprobadas; commit `d45a493`. Fase 5
continúa En progreso.

La auditoría acumulativa de 5.6 confirma que los cuatro modales vigentes poseen
ownership léxico específico sobre una única propiedad física de
`bibliotecaState`: `agregarModal`, `anexoModal`, `listaModal` y `examModal`.
No existe store duplicado, `ModalState` universal, persistencia nueva ni global
adicional. Generación, pending, render/eventos, Quick Create,
`window.explorerState` y `window.biblioteca` conservan sus fronteras actuales.

La Sesión 5.7 encapsula literalmente los cuatro pending vigentes mediante
`BibliotecaPlaneacionesPending`, `BibliotecaAnexosPending`,
`BibliotecaListaPending` y `BibliotecaExamPending`. Sus únicas fuentes físicas
continúan en `bibliotecaState`; cada superficie conserva su shape, claves y
operaciones propias. Los coordinadores solo sustituyen accesos directos por
`get`/`set`/`delete` equivalentes. SSE, requests secuenciales, delay de 1500 ms,
polling de 3000 ms y 60 consultas, errores, cleanup, delete de bloque, render y
Quick Create permanecen funcionalmente intactos. No existe pending universal,
shape común, persistencia nueva ni global adicional. Implementación y
validaciones estáticas y validación manual aprobadas; commit `9b3c23d`.

La Sesión 5.8 auditó formalmente el cierre sin modificar código funcional. La
revisión acumulativa confirmó ownership identificable para selección, tabs,
cuatro modales y cuatro pending; una sola fuente física por estado; ausencia de
stores universales, copias divergentes o persistencia nueva; y preservación de
Quick Create, `window.explorerState`, `window.biblioteca`, generación, SSE,
polling, delete, render/eventos, Archivados, legacy y backend. Los estados de
carga/render y Quick Create que permanecen sin superficie específica están
delimitados para fases posteriores o como deuda conocida y no bloquean. La
decisión formal es **A. Fase 5 puede cerrarse**: Fase 5 y la Sesión 5.8 quedan
completadas, la auditoría de cierre queda aprobada y Fase 6 permanece pendiente
y no iniciada.

La auditoría de apertura de Fase 5 confirmó tres fronteras de estado. El
`bibliotecaState` privado de `biblioteca.page.js` posee carga, selección, tabs,
pending y modales de la Biblioteca vigente. `window.explorerState` sigue siendo
mixto: Quick Create y los previews de examen/lista son consumidores activos,
mientras otros grupos pertenecen a compatibilidad o al explorador visual
legacy. `archivedState` y el registro jerárquico persistido de Archivados son
propietarios separados. Ninguno de estos objetos fue movido, renombrado o
expuesto de una forma nueva.

La frontera de fases permanece contractual: Fase 5 trata ownership y shapes de
estado; Fase 6, render y eventos; Fase 7, Dashboard y Quick Create; Fases 8–9,
aislamiento y posible eliminación del legacy; y Fase 10, retiro de wrappers y
globals. El detalle propiedad-consumidor está en
[`FRONTEND_MAP.md`](FRONTEND_MAP.md).

## Flujo principal: Biblioteca

`pages/dashboard.html` carga, entre otros, `dashboard.page.js`, `biblioteca.page.js` y `main.js`, en ese orden. `main.js` invoca `window.initDashboardPage()`.

Como `biblioteca.page.js` ya publicó `window.initBiblioteca`, `initDashboardPage()`:

1. establece `window.BIBLIOTECA_MODE = true`;
2. inyecta el layout y componentes privados;
3. registra los eventos compartidos;
4. llama `window.initBiblioteca()`;
5. retorna antes de ejecutar `hydrateExplorerData()`.

Biblioteca controla el render principal: carga conjuntos, renderiza sidebar y detalle, conserva el tab por conjunto y coordina planeaciones, anexos, listas y exámenes. Toda funcionalidad visual nueva debe incorporarse a este flujo.

`dashboard.page.js` todavía contiene utilidades, creación rápida, estado y previews consumidos por Biblioteca. Es deuda técnica de compatibilidad, no un segundo modo de uso. El objetivo del refactor es separar las dependencias activas y retirar gradualmente el código visual obsoleto; nunca mover lógica de Biblioteca hacia el explorador antiguo.

## Fase 6: render, DOM y eventos de Biblioteca

El objetivo canónico confirmado es dividir gradualmente render y eventos para
que `biblioteca.page.js` actúe como coordinador. La extracción debe conservar
literalmente JavaScript vanilla, scripts clásicos, Bootstrap/Tailwind vigentes,
markup observable, selectores, clases, IDs, `data-*`, mensajes, orden de
ejecución y comportamiento.

La arquitectura real de render no es todavía un árbol modular. Es esta:

```text
initDashboardPage
 ├─ injectComponent(layout.html) + bindDashboardEvents
 └─ initBiblioteca
     ├─ injectBibliotecaModals
     ├─ document.click -> onBibliotecaClick
     └─ loadAndRenderBiblioteca
         └─ renderBibliotecaContent
             ├─ loading / error
             └─ shell
                 ├─ renderBibliotecaSidebar
                 │   └─ renderConjuntoSidebarItem
                 └─ renderBibliotecaDetail
                     ├─ renderBibliotecaTabs
                     └─ renderBibliotecaTabContent
                         ├─ renderPlaneacionesTab
                         ├─ renderAnexosTab
                         ├─ renderListasCotejoTab
                         └─ renderExamenesTab
```

El shell y las cards producen strings HTML y responden mediante una delegación
en `document`. Las actualizaciones parciales reemplazan el panel derecho con
`outerHTML`, la lista lateral con `innerHTML` o solo alternan `is-active`. El
buscador se enlaza con `oninput` después de cada render completo. En contraste,
los cuatro modales de creación reemplazan `.biblioteca-modal-card` y vuelven a
registrar listeners directos sobre sus nodos recreados. Los modales de Anexos y
Listas también depuran `selectedPlaneacionIds` durante render; por ello no son
render puro.

La frontera con Dashboard permanece activa y contractual:

- `components/layout.html` aporta `#explorer-content`, Quick Create y los DOM
  estables de preview de Exámenes/Listas.
- `dashboard.page.js` enlaza el shell antes de `initBiblioteca`, conserva Quick
  Create, `window.explorerState`, previews y wrappers, y despacha
  `renderExplorerContent()` hacia `window.renderBibliotecaContent` cuando
  `BIBLIOTECA_MODE` está activo.
- Biblioteca consume los bindings léxicos compartidos
  `MOMENTOS_ACTIVIDADES_DIDACTICAS`, `buildActividadDidacticaOptions`,
  `isActividadDidacticaValida`, `normalizeActividadesMomentos`,
  `renderProgressPill` y `statusLabelFromTone`. Esta dependencia por orden de
  scripts corresponde principalmente a Fase 7, no debe absorberse en Fase 6.
- Quick Create consume `window.biblioteca` y puede provocar renders/refetch de
  Biblioteca. Su estado, staging, SSE y reconciliación permanecen protegidos.

La Fase 6 incluye el render de loading/error, pero no traslada el loader ni la
navegación: `loadAndRenderBiblioteca()` continúa siendo el coordinador que
escribe `loading`, `error`, `conjuntos`, selección y reconciliación. Tampoco
absorbe generación, polling, preview, download, delete, block delete, API,
payloads ni `wordExport.js`.

El corte ejecutado en 6.1 extrajo de forma literal el árbol no modal
completo —helpers de presentación, pending visual, cuatro tabs de recursos,
shell, sidebar, detalle y renders parciales— a un propietario de render de
Biblioteca. Eventos, modales, carga, estado, features y Quick Create deben
permanecer en sus propietarios durante ese primer corte. Después se propone un
corte de modales, uno de ownership de eventos y una auditoría formal de cierre.

### Resultado arquitectónico de la Sesión 6.1

`js/features/biblioteca/biblioteca-render.js` es el propietario identificable
del render no modal. Contiene literalmente loading/error, shell, sidebar,
búsqueda visual, detalle, tabs, cards/pending de los cuatro dominios y los tres
patches parciales. Después de 6.2, `biblioteca.page.js` conserva estado,
fachadas, loader, reconciliación, coordinación open/close/submit, delegación,
features y `initBiblioteca`.

```text
dashboard.page.js
→ biblioteca.page.js             estado + loader + coordinación
→ biblioteca-render.js           render no modal + patches visuales
→ biblioteca-modal-render.js     roots, render/wiring local y confirmación
→ biblioteca-events.js           delegación documental + search
→ main.js                         arranque por DOMContentLoaded
```

El nuevo owner es un script clásico cargado después de `biblioteca.page.js`.
Consume sus bindings léxicos y las superficies protegidas de Fase 5, sin store
ni API propios. `renderBibliotecaContent()` conserva firma sin parámetros,
retorno implícito y efectos DOM; `window.renderBibliotecaContent` sigue
apuntando a la misma función para Dashboard/Quick Create. Los nombres globales
de los patches permanecen disponibles para features y coordinación. No se
modificaron `window.biblioteca`, `window.explorerState`, modales, delegación,
generación, preview/download/delete ni loader.

### Resultado arquitectónico de la Sesión 6.2

`js/features/biblioteca/biblioteca-modal-render.js` posee literalmente los
renders de Planeaciones, Anexos, Listas y Exámenes, `showBibConfirm`, los seis
roots/backdrops inyectados y `BIB_EXAM_TIPOS`. Conserva 29 ocurrencias de
listeners locales: controles recreados, checkboxes, cantidades, actividades,
backdrops y tres listeners `{ once: true }` de confirmación.

Open/close y submit permanecen como coordinadores en `biblioteca.page.js`:
siguen escribiendo ModalState, controlando `overflow-hidden` y llamando a los
coordinadores de generación sin cambiar validación, snapshot, payload o timing.
Anexos/Listas conservan el cleanup de selección durante render; Planeaciones
conserva los bindings léxicos de actividades declarados por Dashboard. La
delegación `onBibliotecaClick`, search y el listener documental único quedan
para 6.3. No se modificó `biblioteca-render.js`.

### Resultado arquitectónico de la Sesión 6.3

`js/features/biblioteca/biblioteca-events.js` posee los handlers literales
`onBibliotecaClick` y `onBibliotecaSearch`, el registro de `document.click` y
la asignación de `searchInput.oninput`. Su superficie léxica mínima ofrece
`bind()` y `bindSearch(input)`; no publica nuevas APIs en `window`.

`initBiblioteca()` sigue coordinando inyección, binding y carga en el mismo
orden, pero delega el registro a `BibliotecaEvents.bind()`. El render no modal
solo sustituye la asignación mecánica por `BibliotecaEvents.bindSearch()` en el
mismo punto, después de restaurar el valor del input. No existe guard nuevo:
la duplicabilidad histórica se conserva.

Las 23 ramas, 20 acciones emitidas, lecturas de dataset, early return y
bubbling permanecen idénticos. El handler no tenía ni incorpora
`preventDefault`/`stopPropagation`. El listener previo de Dashboard sobre
`#explorer-content` continúa ejecutándose antes que la delegación documental y
solo intenta despachar `data-content-action`. Los 29 listeners locales de
modales permanecen intactos en su owner de 6.2.

### Cierre arquitectónico de la Fase 6 — Sesión 6.4

La auditoría acumulativa aprobó la separación final: `biblioteca-render.js`
posee la presentación no modal; `biblioteca-modal-render.js`, el DOM de los
cuatro modales, confirmación y wiring local inseparable; y
`biblioteca-events.js`, la delegación estructural y búsqueda.
`biblioteca.page.js` queda como coordinador razonable de estado, carga,
reconciliación, open/close/submit, features y compatibilidad.

La comparación normalizada contra `1254561` confirmó equivalencia literal de
los renders y eventos trasladados. Se preservan 20 acciones emitidas, 23 ramas,
un listener documental, un `oninput` y 29 listeners modales. Las superficies de
estado/pending de Fase 5 mantienen una única fuente física; generación, API,
payload de Exámenes, delete, preview/download y `wordExport.js` no cambiaron.

La Fase 7 conserva expresamente Quick Create, `window.explorerState`, loaders,
navegación, reconciliación y bindings activos de Dashboard. Los wrappers
`window.biblioteca` y `window.renderBibliotecaContent` siguen siendo
compatibilidad activa, no un bloqueo para cerrar Fase 6.

## Fase 7: frontera real Dashboard / Quick Create / Biblioteca

La auditoría de apertura 7.0 confirmó que el arranque vigente no ejecuta la
hidratación del explorador visual, pero sí carga `dashboard.page.js` completo
porque conserva tres responsabilidades activas: bootstrap del shell, Quick
Create y bindings/previews compartidos. La arquitectura ejecutable es:

```text
main.js / DOMContentLoaded
  -> initDashboardPage
     -> injectComponent(components/layout.html)
     -> initPrivateChrome (navbar + footer + sesión visual)
     -> bindDashboardEvents
     -> initBiblioteca
        -> injectBibliotecaModals
        -> BibliotecaEvents.bind
        -> loadAndRenderBiblioteca
           -> GET /api/biblioteca/conjuntos
           -> selection/tabs/reconcile
           -> renderBibliotecaContent
```

`hydrateExplorerData()` queda detrás del retorno de Biblioteca y no se ejecuta
en `pages/dashboard.html`. Sin embargo, los loaders jerárquicos
`loadPlanteles`/`ensureGrados`/`ensureMaterias`/`ensureUnidades` sí son activos
cuando se abre Quick Create: resuelven o crean IDs técnicos antes del POST de
planeaciones. Por ello la jerarquía técnica no es legacy aunque el árbol y los
breadcrumbs sí sean visuales legacy en esta ruta.

### Quick Create vigente

```text
#btn-hero-quick-create o data-bib-action="crear-planeaciones"
  -> openQuickCreatePanel
  -> carga jerarquía técnica y bloques de window.biblioteca
  -> valida título/nivel/materia/temas
  -> resuelve o crea plantel/grado/materia/unidad técnica
  -> copia quickCreate.temas a stagingTemas
  -> bloque existente: pendingBatchId + PlaneacionesPending
     bloque nuevo: pendingConjunto(tempId)
  -> generarPlaneacionesUnidadConProgreso
     POST /api/unidades/:unidadId/generar?stream=1
  -> explorerState.progress recibe SSE
  -> finishPlaneacionesGeneration
  -> optimista tempId/batch real + refetch silencioso
  -> render de Biblioteca
```

El panel se cierra antes de iniciar la resolución asíncrona. Sus secciones DOM
`quick-create-generating` y `quick-create-result` y las funciones que las
actualizarían no tienen consumidor confirmado; el feedback activo aparece en
Biblioteca. Esta evidencia solo clasifica deuda: no autoriza borrado.

Quick Create y el modal normal de Planeaciones comparten el service/API SSE,
pero no son el mismo coordinador. Quick Create puede enviar
`force_new_batch:true`, `mode:"create"` y `titulo_conjunto`, usa
`explorerState.progress`, `pendingConjunto` y la fachada. El modal normal envía
siempre el `batch_id` explícito, escribe `BibliotecaPlaneacionesPending` y
procesa directamente los tipos de evento. Unificarlos modificaría pending,
reconciliación y manejo parcial; queda prohibido en 7.0.

### Frontera de loader y reconciliación

`loadAndRenderBiblioteca(options)` sigue siendo coordinador legítimo, aunque
mezcla fetch y reconciliación. Captura selección/tab/temporal previos, controla
loading/error, requiere sesión, obtiene conjuntos, intenta mapear `tempId` al
batch nuevo —preferentemente con `targetBatchId`, de otro modo por diferencia
de IDs—, restaura selección/tab, reemplaza `conjuntos` y renderiza. Sus 15 call
sites incluyen init, retry, Quick Create, las cuatro generaciones y deletes.

La reconciliación optimista también se reparte entre
`finishBibliotecaPlaneacionesGeneration`,
`applyOptimisticPlaneacionesToConjunto`, `mergePlaneaciones` y el propio
loader. No hay persistencia frontend de pending, selección, tab o progreso.
Reload reconstruye solo recursos ya persistidos por backend; no reanuda SSE ni
recupera el batch temporal.

### Bridges activos

- `window.biblioteca` es una fachada estrecha de comunicación con Quick Create:
  expone `pendingBatchId`, lectura de conjuntos, selección, alta de pending,
  finish y refresh. No es la fuente física de estado, pero sí un puente activo.
- `window.renderBibliotecaContent` es usado por el bridge de Dashboard y por el
  alta temporal de Quick Create; features de Biblioteca llaman además al
  binding léxico del mismo nombre. Su retiro corresponde a Fase 10.
- `window.explorerState` sigue siendo un store accidental mixto. Quick Create
  usa `quickCreate`, `current`, staging, `progress`, `generating` y caches
  jerárquicos; los previews de Exámenes/Listas consumen otros campos. No puede
  eliminarse como bloque.
- Los bindings léxicos de actividades didácticas y los wrappers
  `renderProgressPill`/`statusLabelFromTone` nacen en Dashboard y son leídos por
  Biblioteca debido al orden de scripts clásicos.

El objetivo de Fase 7 es terminar con owners identificables para Quick Create,
loader/reconcile de Biblioteca y bootstrap/navegación de Dashboard, conservando
los bridges mientras tengan consumidores. Archivados/aislamiento legacy siguen
en Fase 8 y el retiro final de wrappers/globals en Fase 10.

### Resultado implementado en 7.1: owner de Quick Create

`js/features/dashboard/quick-create.js` es ahora el owner único de la
implementación activa de Quick Create: panel y comboboxes, validación, carga y
resolución de jerarquía técnica, staging, payload, progreso SSE, resultado/error
y coordinación con Biblioteca. Publica una superficie pequeña
`window.QuickCreate` (`open`, `close`, `bind`, `setPanelVisibility` y
`generateFromStaging`); no introduce un store ni duplica estado.

```text
dashboard.page.js (estado físico y helpers compartidos)
  -> quick-create.js (owner funcional)
     -> services/jerarquía + generarPlaneacionesUnidadConProgreso
     -> window.biblioteca (pending, finish, refresh, selection)
  -> biblioteca.page.js + render/modal/events (owner Biblioteca)
```

`window.explorerState` continúa como fuente física para `quickCreate`, staging,
`progress`, `generating`, `current` y caches jerárquicos. La fachada
`window.biblioteca`, `window.renderBibliotecaContent` y los bindings léxicos
compartidos conservan sus firmas y timing. Dashboard retiene wrappers finos
para `BibliotecaEvents`, Escape, `renderAll` y la acción legacy de generación;
también retiene los helpers de actividades, jerarquía y progreso con
consumidores fuera de Quick Create.

El orden clásico requerido al cerrar 7.1 fue
`dashboard.page.js -> quick-create.js -> biblioteca.page.js -> render -> modal
render -> events -> main.js`. No se movieron el estado ni Pending de
Biblioteca, `PlaneacionGeneration`, API/services, previews, downloads, deletes
o legacy. La extracción fue validada manualmente y quedó commiteada en
`97b798c`.

### Resultado implementado en 7.2: owner de loader/reconcile

`js/features/biblioteca/biblioteca-loader.js` es el owner canónico de la carga,
refetch y reconciliación de Biblioteca. Contiene literalmente el loader, la
normalización/merge de resultados de planeaciones, el update optimista y el
finish que conecta Quick Create con el refetch. Publica la superficie estrecha
`window.BibliotecaLoader`; no contiene estado físico.

```text
biblioteca.page.js
  ├─ bibliotecaState + Selection/Tabs + ModalState/Pending
  ├─ coordinación de modales/features/compatibilidad
  └─ wrappers léxicos para consumidores clásicos
       -> biblioteca-loader.js
          ├─ load/refetch + loading/error
          ├─ tempId -> target/inferencia -> selección/tab
          └─ optimistic/partial/finish -> render -> refetch
```

La carga normal conserva dos renders (loading y resultado/error); la silenciosa
conserva uno al finalizar o fallar. Cada invocación realiza una sola lectura de
conjuntos tras `requireSession`; si no hay sesión mantiene el early return
histórico. El loader reemplaza `conjuntos` por la respuesta, no crea un merge de
batches nuevo. El merge por ID solo aplica a planeaciones optimistas antes del
refetch; la respuesta persistida vuelve a ser autoritativa.

El orden contractual queda `biblioteca.page.js -> biblioteca-loader.js ->
biblioteca-render.js -> biblioteca-modal-render.js -> biblioteca-events.js`.
Los 15 caminos de carga mantienen sus firmas mediante wrappers. Quick Create,
generadores y deletes no cambiaron funcionalmente; State/Pending, Selection y
Tabs conservan fuente única. La validación manual aprobó 7.2 y la sesión quedó
commiteada en `a6840a4`.

### Resultado implementado en 7.3: bootstrap y bindings de Dashboard

`js/features/dashboard/dashboard-bootstrap.js` posee ahora la inyección del
layout/sidebar, `initDashboardPage` y el registro único de bindings de
Dashboard. El owner se carga después de `dashboard.page.js`, porque sus
callbacks dependen de bindings léxicos allí definidos, y antes de Quick Create
y Biblioteca. Publica la misma entrada `window.initDashboardPage`; no crea
store, router ni segunda API pública.

```text
main.js
  -> window.initDashboardPage (dashboard-bootstrap.js)
     -> layout
     -> chrome/navbar/footer
     -> bind Dashboard (una vez)
     -> ruta vigente: window.initBiblioteca
        ruta sin Biblioteca: hydrateExplorerData legacy retenido
```

Se movieron literalmente 25 call sites estructurales de listeners. Dos
listeners locales creados dentro de renders legacy permanecen en Dashboard. El
listener de `#explorer-content` continúa registrándose antes del listener
documental de Biblioteca, no usa `stopPropagation` y sigue ignorando
`data-bib-action`.

Navegación no se extrajo: `selectRoot/Plantel/Grado/Materia/Unidad`, persistencia
de ubicación, árbol, breadcrumbs, `data-content-action`, Detalle, previews,
archive/delete y pageshow están entrelazados con jerarquía y legacy. Dashboard
queda como compatibility hub temporal para esos handlers, jerarquía técnica,
previews y helpers compartidos. Su aislamiento corresponde a Fases 8–10, no a
7.3.

El orden contractual es `dashboard.page.js -> dashboard-bootstrap.js ->
quick-create.js -> biblioteca.page.js -> biblioteca-loader.js -> render ->
modal render -> events -> main.js`. Quick Create, loader/reconcile,
State/Pending, API, generación, CSS, Archivados y backend permanecen intactos.
La validación manual de 7.3 aprobó Dashboard, layout/navbar/footer, Biblioteca,
Quick Create con batch nuevo, delete y generación de examen; la sesión quedó
commiteada en `bcd361e`.

### Cierre formal de Fase 7

La auditoría 7.4 aprueba el objetivo canónico: Quick Create, carga/reconciliación
de Biblioteca y bootstrap/bindings de Dashboard tienen owners identificables y
sin segunda fuente de estado. `dashboard.page.js` pasó de 5690 a 4049 líneas,
pero el criterio de cierre es ownership y no LOC: conserva legítimamente
`explorerState`, navegación, jerarquía técnica, previews, legacy, Archivados,
helpers compartidos y compatibilidad con consumidores reales.

```text
dashboard.page.js
  ├─ explorerState + navegación + jerarquía técnica
  ├─ previews/download bridges
  ├─ explorer visual legacy + Archivados
  └─ helpers/wrappers compartidos
dashboard-bootstrap.js -> layout + bindings + initDashboardPage
quick-create.js         -> Quick Create completo
biblioteca.page.js      -> State/Pending + coordinación + wrappers
biblioteca-loader.js    -> load/refetch/reconcile
biblioteca-render.js -> biblioteca-modal-render.js -> biblioteca-events.js
```

Los residuos no bloquean el cierre: Fase 8 recibe el aislamiento de Archivados,
explorer visual, navegación jerárquica y previews ligados a `explorerState`;
Fase 10 recibe cleanup de `window.*`, wrappers, bridges y superficies finales de
compatibilidad. Scripts clásicos, bindings léxicos, requests no cancelables,
SSE no resumible y races de refetch permanecen como riesgos conocidos. El fallo
externo/preexistente de `public.ia_metrics` es no bloqueante.

**Decisión: A. Fase 7 puede cerrarse.** Fase 7 y la Sesión 7.4 quedan
completadas; auditoría aprobada. Fase 8 permanece pendiente y no iniciada.

## Fase 8: frontera Archivados / explorer legacy / jerarquía técnica

La auditoría 8.0 confirma que `dashboard.page.js` no puede tratarse como un
bloque legacy. Sus 4049 líneas conservan cuatro fronteras distintas:

```text
pages/dashboard.html
  -> dashboard.page.js
     ├─ estado/caches jerárquicos compartidos con Quick Create
     ├─ preview Examen/Lista y bridges activos de Biblioteca
     ├─ recursos/generación/CRUD/archive legacy como callbacks
     └─ helpers léxicos compartidos y wrappers
  -> legacy-explorer.js
     ├─ ubicación + selección visual root/plantel/grado/materia/unidad
     ├─ tree + breadcrumbs + renders por nivel
     ├─ dispatch data-tree-action/data-content-action
     └─ renderAll + hydrate fallback
  -> dashboard-bootstrap.js
     ├─ bindings estructurales, incluidos handlers del fallback
     ├─ pageshow back-forward todavía activo en modo Biblioteca
     └─ initDashboardPage -> initBiblioteca -> return

pages/archivados.html
  -> planeaciones.service.js
     ├─ HTTP de planeaciones archivadas
     └─ educativo.archivedHierarchy.registry (localStorage)
  -> archivados.page.js
     ├─ archivedState efímero
     ├─ cards/filtros/árbol por rama
     └─ restore/delete permanente
```

La ruta real de `dashboard.html` siempre carga `biblioteca.page.js` antes de
`main.js`. Por ello `initDashboardPage()` detecta `window.initBiblioteca`, fija
`BIBLIOTECA_MODE`, no inyecta `components/sidebar.html`, llama Biblioteca y
retorna antes de `hydrateExplorerData()`. El árbol, los breadcrumbs y los
renders por nivel no se montan en el arranque normal. Sí pueden montarse por el
fallback conservado cuando `initBiblioteca` no existe; solo el smoke técnico
ejercita hoy ese entry point, no una página de producto separada.

El fallback no está completamente inerte. `bindDashboardEvents()` registra sus
handlers contra nodos que existen en `components/layout.html`, y el listener
`pageshow` se ejecuta también en modo Biblioteca. Al volver por back-forward,
`refreshExplorerAfterReturn()` carga planteles y trata de restaurar
`educativo.dashboard.last-location`; `renderAll()` despacha finalmente el
contenido principal a `window.renderBibliotecaContent`. Esa ruta activa es
compatibilidad/deuda y no autoriza borrar navegación ni storage todavía.

### Jerarquía visual frente a técnica

| Superficie | Visual | Técnica | Quick Create | Archivados | Legacy | Compatibilidad | Retirable ahora |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| `planteles`, `gradosByPlantel`, `materiasByGrado`, `unidadesByMateria` | sí en fallback | sí | sí | no directamente | parcial | sí | no |
| `loadPlanteles`, `ensureGrados/Materias/Unidades` | sí en fallback | sí | sí | loaders equivalentes propios | parcial | sí | no |
| `current` y `setCurrentLevel/select*` | sí | IDs compartidos | Quick escribe IDs | no | sí | `pageshow` | no como bloque |
| `expanded*`, `searchQuery`, tree y breadcrumbs | sí | no | no | no | sí | fallback | no en 8.0 |
| temas/planeación por tema, generación/listas/exámenes por unidad | sí | contratos reales | solo staging/progreso compartido | no | sí | services activos | no en 8.0 |
| archive visual de plantel/grado/materia/unidad/planeación | sí | endpoints reales | no | produce registro | sí | datos antiguos | no en 8.0 |
| árbol de `archivados.page.js` | sí | sí al expandir scopes | no | sí | no | registro local | no |
| previews Examen/Lista | modal compartido | detalle por ID | no | no | consumidor adicional | Biblioteca activa | no |

### Archivados vigente pero sin acceso visible

`pages/archivados.html` es una página privada ejecutable y `main.js` invoca
`window.initArchivadosPage`. Carga datos desde `/api/planeaciones/archived`,
combina payload persistido con el registro local, construye ramas `scope`,
`batch` o `planeacion`, hidrata estructura jerárquica al expandir y permite
restaurar o eliminar permanentemente. Sin embargo, el único enlace del navbar
está comentado; el usuario solo puede llegar por URL directa o un enlace
externo/no encontrado en el repositorio.

Biblioteca no emite archive: sus acciones vigentes son delete directo. Los
emisores de archive restantes están en el explorer fallback y en
`batch.page.js`, cuya página redirige inmediatamente a Dashboard. Archivados
sigue siendo una feature real para datos persistidos previamente, no una ruta
visible del flujo principal.

El registro `educativo.archivedHierarchy.registry` no tiene versión. Su shape
normalizado contiene `hidden.{planteles,grados,materias,unidades}`, `scopes`,
`planeaciones` y `batches`. Storage ausente, inaccesible, JSON inválido o shape
desconocido cae a registro vacío; shapes antiguos sin `scopes` conservan las
colecciones reconocidas. Restore/delete limpia la rama y referencias conocidas,
pero no existe migración explícita ni garbage collection contra backend.

Archivados queda congelado por decisión de producto durante el refactor actual.
Biblioteca usa delete directo; un sistema de Archivados específico para
Biblioteca será trabajo futuro posterior. La propuesta original de extraer el
registry como 8.1 fue descartada antes de commit. `archivados.page.js`,
`planeaciones.service.js`, `archivados.html`, restore/delete y la key local no
se modifican en Fase 8.

### Owner del explorer visual desde 8.1

`js/features/dashboard/legacy-explorer.js` posee 42 funciones movidas
literalmente y 1188 LOC. Conserva el mismo estado físico `explorerState`, los
mismos IDs/classes/data-attributes, HTML, mensajes, sessionStorage y URL de
Detalle. No crea namespace, store, listener ni fuente de estado adicional.

```text
dashboard.page.js (2799 LOC desde 8.2)
├─ explorerState físico
├─ loadPlanteles + ensureGrados/Materias/Unidades
├─ temas/exámenes/listas + generación legacy
├─ CRUD/archive y callbacks de contenido
└─ helpers compartidos / Quick / Biblioteca

legacy-explorer.js (1188 LOC)
├─ get/persist location + setCurrentLevel
├─ select* + restore + refresh/pageshow target
├─ tree + breadcrumbs + root/plantel/grado/materia/unidad
├─ renderExplorerContent + renderAll
├─ handlers delegados
└─ hydrateExplorerData
```

El owner se carga entre `dashboard.page.js` y `dashboard-bootstrap.js`. Sus
declaraciones top-level mantienen los bindings clásicos que consumen Bootstrap,
Quick Create y callbacks retenidos. Los loaders técnicos no se duplican: el
owner los llama como dependencias compartidas.

### Previews y estado mixto

Los previews activos de Examen y Lista almacenan `examPreview`,
`examenDetalleById` y `listaCotejoPreview` en `window.explorerState`.
Biblioteca los abre mediante `ExamPreview.openBiblioteca` y
`ListaCotejoPreview.openBiblioteca`; el explorer fallback conserva aperturas
alternativas. Anexo tiene modal/estado interno de su feature y Planeación no
tiene preview modal en Dashboard: abre Detalle y descarga desde su feature.

Desde 8.2, los siete bridges residuales ya no pertenecen a Dashboard. Examen
publica `renderExamPreviewModal`, `openExamPreview` y
`closeExamPreviewModal` desde `exam-preview.js`, además de
`downloadExamWord` desde `exam-download.js`. Lista publica
`renderListaCotejoPreviewModal`, `openListaCotejoPreview` y
`closeListaCotejoPreview` desde `lista-cotejo-preview.js`. Las firmas y cuerpos
de delegación son literalmente los anteriores; los namespaces `ExamPreview`,
`ExamDownload`, `ListaCotejoPreview` y `ListaCotejoDownload` siguen siendo los
owners funcionales.

No se creó `resource-previews.js`: habría duplicado owners existentes. El shape
físico de `explorerState`, sus caches y estados de modal no se movieron. Los
listeners de cierre, Escape y descarga continúan en `dashboard-bootstrap.js`;
la UI, API, cache, filename, `wordExport.js`, Anexo y Planeación no cambiaron.

### Roadmap técnico actualizado por 8.2

1. 8.1: explorer visual, navegación y fallback aislados; manual aprobada y
   commit `1aa1599`.
2. 8.2: bridges preview/download consolidados en los owners existentes;
   manual pendiente.
3. 8.3: solo si el CRUD jerárquico visual residual demuestra un corte grande,
   reversible y separado de Archivados/generación.
4. 8.4: auditoría formal de cierre antes de considerar Fase 9.

Fase 9 recibe únicamente piezas visuales y ramas sin emisor que después del
aislamiento demuestren cero consumidores. Fase 10 conserva globals, wrappers,
bindings léxicos y limpieza final del orden de scripts.

## Páginas

| Página | Clasificación |
| --- | --- |
| `pages/dashboard.html` | Contenedor vigente de Biblioteca. |
| `pages/detalle.html` | Flujo auxiliar vigente para planeaciones. |
| `pages/archivados.html` | Flujo separado; puede usar jerarquía técnica. |
| `pages/batch.html`, `pages/planeacion.html` | Redirects históricos. |
| `pages/dashboard_tailwind.html` | Histórica/por confirmar; no activar ni eliminar sin auditoría. |

## Código legacy y compatibilidad

| Área | Estado | Regla |
| --- | --- | --- |
| Explorador visual jerárquico del dashboard | Legacy visual | No recibir funciones nuevas ni convertirse en arquitectura objetivo. |
| `explorerState` | Mixto | Separar consumidores; no eliminar como bloque. |
| Wrappers `window.*` | Compatibilidad activa | Mantener hasta migrar y verificar consumidores. |
| Estado y helpers compartidos de Dashboard | Compartidos activos/por clasificar | Extraer hacia Biblioteca modular sin cambiar contratos. |
| Archivados | Activo separado | Mantener sus dependencias mientras tenga consumidores. |
| Páginas históricas | Por confirmar | No activar ni eliminar sin evidencia. |
| Endpoints jerárquicos | Jerarquía técnica | No confundir con soporte al explorador visual antiguo. |

La ruta visual antigua incluye árbol, breadcrumbs y render por niveles. Su código no se ejecuta en la inicialización principal confirmada, pero ninguna pieza debe eliminarse únicamente por nombre: algunas funciones jerárquicas sostienen creación, datos, Archivados o compatibilidad.

## Estado global conocido

- Biblioteca publica `window.biblioteca`, `window.initBiblioteca`,
  `window.BibliotecaLoader` y `window.renderBibliotecaContent`.
- Quick Create publica `window.QuickCreate` como namespace funcional; ni este
  ni `window.BibliotecaLoader` son fuentes de estado.
- Dashboard publica `window.explorerState`; los owners de Examen/Lista publican
  los wrappers de preview/descarga compatibles usados por Bootstrap, Biblioteca
  y el explorer legacy.
- `window.AppUI` concentra helpers compartidos.
- `window.API_BASE_URL`, `window.supabase` y `window.currentUser` sostienen configuración y sesión.

El acoplamiento bidireccional entre `dashboard.page.js` y `biblioteca.page.js` debe reducirse hacia módulos propiedad de Biblioteca, conservando wrappers temporales mientras existan consumidores.

## Terminología canónica

- **Biblioteca:** flujo visual principal vigente para administrar recursos del usuario.
- **Bloque o conjunto de Biblioteca:** agrupación visual y funcional basada en los datos del conjunto. No equivale automáticamente a una entidad jerárquica específica.
- **Jerarquía técnica:** datos y endpoints de planteles, grados, materias, unidades y temas. Puede seguir activa sin que el explorador visual lo esté.
- **Explorador visual jerárquico:** interfaz antigua por niveles; legacy y prohibida para nuevas implementaciones.
- **Compatibilidad legacy:** globals, wrappers, estado o código conservado porque aún tiene consumidores; no es arquitectura objetivo.
- **Archivados:** flujo separado que puede conservar estructuras jerárquicas.
- **`unidad_id`:** identificador técnico de determinados contratos; no es automáticamente la fuente única de selección visual o temática.
- **`planeacion_ids`:** selección explícita de planeaciones usada, entre otros casos, por la generación vigente de exámenes desde Biblioteca.
- **`tema_id` / `tema_ids`:** identificadores de temas; nunca reciben IDs de planeaciones.

## Matriz de estado funcional

| Área | Estado | Puede recibir funciones nuevas | Puede eliminarse | Notas |
| --- | --- | ---: | ---: | --- |
| Biblioteca | Vigente | Sí | No | Flujo principal. |
| Explorador visual jerárquico | Legacy | No | Solo tras auditoría | No usar en nuevos módulos. |
| Jerarquía técnica backend | Activa/compatibilidad | Solo según contrato | No asumir | Datos y endpoints. |
| Archivados | Activo separado | Solo mantenimiento | No asumir | Puede usar jerarquía. |
| `explorerState` | Mixto | No como arquitectura | Parcialmente | Separar consumidores. |
| Wrappers `window.*` | Compatibilidad | No ampliar sin necesidad | Tras migrar consumidores | Documentar retiro. |
| Páginas históricas | Por confirmar | No | Tras auditoría | No activar. |

## Dependencias del backend

La documentación canónica de datos y generación vive en `educativo_backend/Educativo-Backend`:

- [`DATABASE_SCHEMA.md`](../../../educativo_backend/Educativo-Backend/docs/DATABASE_SCHEMA.md)
- [`AI_GENERATION_CONTRACTS.md`](../../../educativo_backend/Educativo-Backend/docs/AI_GENERATION_CONTRACTS.md)
- [`03-backend-guide.md`](../../../educativo_backend/Educativo-Backend/docs/03-backend-guide.md)

El frontend no redefine schema, relaciones, prompts, jobs ni métricas.

## Arquitectura objetivo

La arquitectura objetivo es una **Biblioteca modular** con:

- estado delimitado;
- módulos por dominio;
- capa API frontend;
- generación y polling separados del render general;
- render y eventos separados;
- compatibilidad temporal controlada;
- explorador visual legacy aislado y, solo después de confirmar que no tiene consumidores, eliminado;
- jerarquía técnica preservada cuando siga siendo necesaria para datos, contratos, selectores o Archivados.

Este apartado describe una meta, no el estado ya implementado. El orden, los criterios y las pruebas están en el [`REFACTOR_ROADMAP.md`](refactor/REFACTOR_ROADMAP.md).

## Fase 8 — Sesión 8.3: owner del CRUD jerárquico visual legacy

8.2 quedó commiteada en `6fb39ab refactor(frontend): move preview and download
bridges to feature owners`; su manual continúa pendiente, sin aprobación
inferida. La auditoría residual de 8.3 confirmó un último bloque coherente:
cinco funciones y 234 LOC del modal de creación/edición jerárquica, emitido solo
por el fallback legacy y enlazado por Bootstrap.

```text
dashboard.page.js (2564 LOC)
├─ explorerState físico y jerarquía técnica compartida
├─ actividades/staging y generación legacy residual
├─ delete/archive legacy congelado
├─ wrappers y compatibilidad clásica
└─ dispatch handleCreateAction

legacy-explorer.js
└─ tree, breadcrumbs, niveles y navegación fallback

legacy-hierarchy-crud.js (234 LOC)
├─ open/close/error/configuración del entity modal
└─ submit create/edit para plantel, grado, materia y unidad

dashboard-bootstrap.js
└─ listeners únicos del modal y Escape; delega al owner CRUD
```

El owner CRUD no posee estado ni listeners. Consume `explorerState.modal`, los
loaders técnicos existentes, los services CRUD y los `select*` del explorer
legacy mediante los mismos bindings de scripts clásicos. Delete/archive,
Archivados, Quick Create, Biblioteca, generación y APIs no cambiaron.

El orden protegido queda:

```text
dashboard.page → legacy-explorer → legacy-hierarchy-crud
→ dashboard-bootstrap → quick-create → Biblioteca
```

El residual de Dashboard ya no presenta otro owner grande obvio de Fase 8:
jerarquía/loaders y actividades son compartidos; generación está protegida;
delete/archive cruza Archivados; globals, wrappers y `explorerState` corresponden
a cleanup final. Tras manual y commit de 8.3, procede 8.4, auditoría formal de
cierre.
