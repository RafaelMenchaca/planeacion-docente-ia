# AGENTS.md — Reglas para IA en Educativo IA

## 1. Propósito

Este archivo define las reglas obligatorias para cualquier agente de IA que analice, modifique o refactorice el código de Educativo IA.

El objetivo principal es mejorar la arquitectura del proyecto sin romper comportamiento existente, sin mezclar flujos antiguos con el sistema actual y sin introducir cambios no solicitados.

Estas reglas tienen prioridad sobre cualquier interpretación libre del código.

---

## 2. Contexto actual del proyecto

Educativo IA es una aplicación web para generar recursos educativos con IA.

El flujo vigente del producto está basado en **Biblioteca**.

Biblioteca organiza y muestra:

- Planeaciones
- Anexos
- Listas de cotejo
- Exámenes

El sistema anterior basado en jerarquías puede seguir teniendo código residual en el frontend.

Ese código debe considerarse legado hasta que se demuestre lo contrario.

No se debe asumir que una función sigue activa solamente porque existe en el repositorio.

Tampoco se debe asumir que una función puede eliminarse solamente porque parece antigua.

Antes de modificar o eliminar código relacionado con jerarquías, se deben localizar y documentar todos sus consumidores.

---

## 2.1 Conceptos que NO deben confundirse

La auditoría de 2026-07-07/08 confirmó que estos siete conceptos son distintos entre sí y **no deben tratarse como sinónimos ni clasificarse en bloque**. Confundirlos es la causa más probable de que una futura sesión rompa Biblioteca o Archivados creyendo que está limpiando "jerarquía legada". Ver evidencia completa en `docs/refactor/LEGACY_HIERARCHY.md`.

1. **Biblioteca vigente** — el flujo activo real de producción (`biblioteca.page.js`, tabs de Planeaciones/Anexos/Listas/Exámenes). Es lo que el usuario ve y usa hoy.
2. **Modelo jerárquico técnico** (`js/api/jerarquia.api.js`, `js/services/jerarquia.service.js`) — CRUD de plantel/grado/materia/unidad/tema. **Sigue activo**: lo consume Archivados y partes de la creación rápida de bloques en Biblioteca. No es legado.
3. **Página Archivados** (`pages/archivados.html`, `js/pages/archivados.page.js`) — activa y funcional, usa estructura jerárquica real para restaurar/eliminar ramas. Está **oculta de la navegación** (link comentado en `components/navbar.html`), pero oculta no significa legado ni significa que se pueda borrar.
4. **Navegación jerárquica visual antigua del dashboard** — el árbol plantel→grado→materia→unidad, breadcrumbs y niveles renderizados dentro de `dashboard.page.js`. Es la única de las siete que la auditoría marca mayormente como **LEGACY_CONFIRMED**, porque `window.BIBLIOTECA_MODE` es siempre `true` en producción y esa rama de `initDashboardPage()` nunca se ejecuta. Aun así, no se elimina sin aislar primero el estado compartido (ver punto 5).
5. **`explorerState` (estado compartido, MIXED)** — objeto definido en `dashboard.page.js` que mezcla subcampos de la navegación antigua (punto 4, inactivos) con subcampos que Biblioteca sigue consumiendo por `window` (`progress`, `examPreview`, `listaCotejoPreview`, `confirmDelete`). No es "todo legado" ni "todo activo": es un solo objeto con partes de ambos.
6. **Código legacy confirmado** (`LEGACY_CONFIRMED`) — evidencia directa de que no tiene consumidores alcanzables (p. ej. ramas `if (!window.BIBLIOTECA_MODE)`, páginas `batch.html`/`planeacion.html` que solo redirigen). Documentado, no eliminado todavía.
7. **Código posiblemente no utilizado / compatibilidad temporal** — dos cosas distintas entre sí: "posiblemente no utilizado" es una sospecha con evidencia parcial que requiere verificación en runtime antes de tocar (ver `docs/refactor/FRONTEND_AUDIT.md` sección 9); "compatibilidad temporal" es código que sí se usa hoy, pero solo como puente hacia una versión futura (wrapper), y debe conservarse hasta confirmar que ya no tiene consumidores.

Regla derivada: **no clasificar ni actuar sobre código solo por encontrar las palabras "plantel/grado/materia/unidad/jerarquía"**. Siempre verificar a cuál de los 7 conceptos pertenece ese código específico antes de decidir algo.

---

## 3. Regla principal

Durante el refactor, preservar comportamiento antes que mejorar diseño interno.

La prioridad es:

1. Entender.
2. Documentar.
3. Extraer.
4. Validar.
5. Simplificar.
6. Eliminar legado confirmado.

Nunca invertir este orden.

---

## 4. Restricciones obligatorias

La IA no debe realizar ninguno de los siguientes cambios sin autorización explícita:

- Modificar el backend.
- Modificar Supabase.
- Crear o alterar migraciones SQL.
- Cambiar endpoints.
- Cambiar payloads de API.
- Renombrar campos usados por frontend, backend o base de datos.
- Cambiar comportamiento visible.
- Rediseñar la interfaz.
- Cambiar Bootstrap.
- Migrar a React, Vue, Angular u otro framework.
- Convertir todo el proyecto a TypeScript.
- Cambiar autenticación.
- Cambiar permisos o reglas RLS.
- Cambiar la lógica de generación con IA.
- Cambiar prompts de IA.
- Modificar precios, métricas o cálculo de tokens.
- Formatear todo el repositorio.
- Introducir dependencias nuevas sin justificar su necesidad.
- Eliminar código por parecer duplicado, antiguo o innecesario.
- Reescribir módulos completos si una extracción pequeña es suficiente.
- Mezclar refactor con nuevas funcionalidades.
- Cambiar nombres públicos expuestos en `window` sin mantener compatibilidad.

---

## 5. Sistema vigente frente a sistema legado

### Sistema vigente

El sistema vigente es Biblioteca.

Incluye:

- Bloques o conjuntos de Biblioteca.
- Tabs de Planeaciones, Anexos, Listas de cotejo y Exámenes.
- Generación, preview, descarga y eliminación de documentos.
- Estados de generación asociados a cards.
- Flujos actuales usados por usuarios reales.

### Sistema legado

El sistema de jerarquías anterior puede incluir:

- Planteles.
- Grados.
- Materias.
- Unidades.
- Exploradores antiguos.
- Selectores o modales anteriores.
- Estados globales antiguos.
- Funciones de navegación que ya no aparecen en la UI actual.

Toda referencia a jerarquías debe clasificarse antes de tocarse:

- `ACTIVE`: todavía usada por el flujo vigente.
- `COMPATIBILITY`: necesaria como puente temporal.
- `LEGACY_CONFIRMED`: comprobado que ya no se usa.
- `UNKNOWN`: uso no confirmado.

Solo se puede eliminar código marcado como `LEGACY_CONFIRMED`.

---

## 5.1 Reglas endurecidas (auditoría 2026-07-07/08)

Estas reglas son de cumplimiento obligatorio para cualquier sesión de Codex/IA que toque este repositorio, además de todo lo demás en este archivo:

1. **No asumir que un archivo es legacy solo por su nombre o por estar en una carpeta antigua.** Verificar si carga desde algún `<script>` real (`docs/FRONTEND_MAP.md`) y si tiene consumidores confirmados (`docs/refactor/LEGACY_HIERARCHY.md`).
2. **No asumir que una función es "unused" solo porque no aparece en una búsqueda simple.** Repetir la búsqueda con: grep en todo `js/**/*.js`, grep en todo `pages/**/*.html` y `components/**/*.html`, búsqueda de `data-*-action` que la dispare, y verificación de `window.<nombre>`. Ver metodología en `docs/refactor/FRONTEND_AUDIT.md` sección 9.
3. **No eliminar código jerárquico sin verificar primero a cuál de los 7 conceptos de la sección 2.1 pertenece** (modelo técnico, Archivados, navegación visual antigua, etc.).
4. **No tocar `js/ui/wordExport.js` sin autorización explícita del usuario.** Está marcada como zona protegida (ver `ai-context/07-known-bugs-and-decisions.md`).
5. **No tocar payloads de generación de exámenes sin autorización explícita.** Esto incluye no cambiar `unidad_id`, `planeacion_ids`, `tema_ids` ni la relación entre ellos — el código actual ya documenta (comentario en `biblioteca.page.js:2296-2299`) que `planeacion_ids` es la fuente confiable y `unidad_id` puede estar desactualizado; preservar esa relación tal cual.
6. **No modificar la lógica real de generación con IA durante sesiones de extracción/refactor estructural** (regla ya existente en sección 16, reafirmada aquí porque es la que más se ha ignorado en auditorías previas).
7. **No agregar nuevas propiedades a `window` salvo como wrapper temporal documentado.** Cada wrapper temporal nuevo debe llevar un comentario en el propio código con: fecha de creación, motivo, y qué archivo lo consume. Ejemplo:
   ```js
   // wrapper temporal — creado 2026-07-08 — mantiene compatibilidad con biblioteca.page.js
   // hasta que se confirme que ya no llama a window.downloadExamWord directamente
   window.downloadExamWord = (...args) => window.ExamenesDownload.downloadWord(...args);
   ```
8. **No cambiar comportamiento visual durante un refactor** (ya cubierto en sección 17, reafirmado).
9. **No mezclar refactor con corrección de bugs.** Si se encuentra un bug durante una sesión de refactor, documentarlo (en `SESSION_HANDOFF.md` y, si aplica, en `docs/refactor/FRONTEND_AUDIT.md`) y pedir una sesión separada — salvo que el bug bloquee físicamente completar el objetivo de la sesión actual, en cuyo caso se corrige lo mínimo indispensable y se documenta como excepción.
10. **Toda sesión debe actualizar `docs/refactor/SESSION_HANDOFF.md` al terminar**, incluso si la sesión fue solo de documentación.
11. **Lectura obligatoria antes de tocar código** (además de lo listado en la sección 21): `docs/refactor/AI_AGENT_RULES.md` (checklist operativo) y `docs/refactor/REFACTOR_PLAYBOOK.md` (método de extracción con ejemplos concretos de este proyecto).

---

## 6. Método obligatorio de refactor

Cada refactor debe seguir estas etapas.

### Etapa A — Inspección

Antes de modificar código:

- Identificar responsabilidad actual.
- Buscar todas las referencias.
- Revisar HTML relacionado.
- Revisar atributos inline como `onclick`.
- Revisar propiedades expuestas en `window`.
- Revisar listeners.
- Revisar llamadas API.
- Revisar estado global usado.
- Revisar orden de carga de scripts.
- Identificar dependencias cruzadas.

### Etapa B — Extracción literal

Mover código sin cambiar su comportamiento.

No simplificar al mismo tiempo.

No renombrar variables innecesariamente.

No cambiar condiciones.

No cambiar payloads.

No cambiar mensajes visibles.

No cambiar orden de ejecución.

### Etapa C — Compatibilidad

Cuando una función existente tenga consumidores antiguos, conservar un wrapper temporal.

Ejemplo:

```js
window.downloadExamWord = (...args) =>
  window.ExamenesDownload.downloadWord(...args);
```

No eliminar el wrapper hasta comprobar que ya no existen consumidores.

### Etapa D — Validación

Después de cada extracción:

- Ejecutar pruebas disponibles.
- Abrir la aplicación.
- Revisar consola.
- Verificar que no existan errores nuevos.
- Verificar que no existan peticiones duplicadas.
- Verificar que los listeners no se registren dos veces.
- Verificar que el flujo modificado siga funcionando.

### Etapa E — Simplificación

Solo después de validar la extracción se puede:

- Renombrar.
- Unificar duplicados.
- Reducir complejidad.
- Eliminar wrappers.
- Eliminar legado confirmado.

---

## 7. Responsabilidades que deben separarse

La IA debe evitar mezclar las siguientes responsabilidades en una sola función o archivo:

- Inicialización de página.
- Estado.
- Acceso a API.
- Transformación de datos.
- Renderizado.
- Eventos.
- Polling.
- Modales.
- Toasts.
- Descargas.
- Confirmaciones.
- Manejo de errores.

Una función de renderizado no debe:

- Llamar a la API.
- Crear intervalos.
- Actualizar la base de datos.
- Descargar archivos.
- Registrar listeners globales.
- Cambiar estado global de forma oculta.

Una función de API no debe:

- Manipular el DOM.
- Mostrar modales.
- Mostrar toasts.
- Renderizar cards.

Una función de eventos no debe contener grandes plantillas HTML ni lógica completa de negocio.

---

## 8. Arquitectura objetivo

La arquitectura objetivo puede organizarse de esta forma:

```text
js/
├── core/
│   ├── config.js
│   ├── auth.js
│   ├── api-client.js
│   ├── errors.js
│   └── logger.js
│
├── api/
│   ├── biblioteca.api.js
│   ├── planeaciones.api.js
│   ├── anexos.api.js
│   ├── listas-cotejo.api.js
│   └── examenes.api.js
│
├── state/
│   ├── app.state.js
│   ├── biblioteca.state.js
│   └── generation.state.js
│
├── ui/
│   ├── shared.ui.js
│   ├── modal.ui.js
│   ├── toast.ui.js
│   ├── loading.ui.js
│   └── download.ui.js
│
├── features/
│   ├── biblioteca/
│   ├── planeaciones/
│   ├── anexos/
│   ├── listas-cotejo/
│   └── examenes/
│
└── pages/
    ├── dashboard.page.js
    ├── biblioteca.page.js
    ├── login.page.js
    └── landing.page.js
```

Esta estructura es una dirección, no una orden para mover todo de una sola vez.

No crear módulos vacíos solo para aparentar arquitectura.

Cada extracción debe responder a una responsabilidad real.

---

## 9. Reglas sobre archivos grandes

Los archivos grandes deben reducirse gradualmente.

No dividir un archivo únicamente por cantidad de líneas.

Dividir por responsabilidad.

Prioridad recomendada:

1. Descargas compartidas.
2. Modales y previews.
3. API compartida.
4. Anexos.
5. Listas de cotejo.
6. Exámenes.
7. Planeaciones.
8. Contenedor de Biblioteca.
9. Inicialización de páginas.
10. Eliminación de jerarquías confirmadas.

No refactorizar todos estos puntos en una sola sesión.

---

## 10. Reglas sobre duplicados

Antes de unificar funciones duplicadas:

- Comparar parámetros.
- Comparar retornos.
- Comparar efectos secundarios.
- Comparar mensajes visibles.
- Comparar manejo de errores.
- Comparar consumidores.
- Confirmar si una versión pertenece al sistema vigente o al legado.

Dos funciones con nombres parecidos no necesariamente son equivalentes.

No reemplazar una por otra sin demostrar equivalencia funcional.

---

## 11. Reglas sobre `window`

No agregar nuevas propiedades globales en `window` salvo que sea necesario como adaptador temporal.

Cuando se use `window` por compatibilidad:

- Documentar por qué existe.
- Indicar qué consumidores lo requieren.
- Marcarlo como temporal.
- Crear una tarea para eliminarlo después.

No renombrar ni eliminar propiedades existentes en `window` sin buscar todos sus consumidores.

---

## 12. Reglas sobre eventos

Antes de registrar un listener:

- Verificar si ya se registra en otro archivo.
- Verificar si la función de inicialización puede ejecutarse más de una vez.
- Evitar listeners duplicados.
- Preferir delegación de eventos cuando sea apropiado.
- Mantener funciones de cleanup cuando existan modales, polling o vistas dinámicas.

Nunca agregar un listener dentro de una función de render sin comprobar si el render puede repetirse.

---

## 13. Reglas sobre estado

No crear nuevas variables globales dispersas.

El estado debe tener propietario claro.

No mantener dos estados paralelos para representar la misma información.

No mezclar estado del sistema antiguo de jerarquías con estado de Biblioteca.

Toda migración de estado debe:

- Mantener compatibilidad temporal.
- Documentar origen y destino.
- Validar todos los consumidores.
- Eliminar el estado antiguo solo al final.

---

## 14. Reglas sobre API

Toda llamada API debe respetar los contratos existentes.

No cambiar:

- Método HTTP.
- Ruta.
- Headers.
- Nombres de campos.
- Tipos de datos.
- Manejo de autenticación.
- Interpretación de respuestas.

Si se centralizan llamadas en un API client, primero debe comportarse igual que la implementación anterior.

Los errores HTTP, respuestas vacías y respuestas JSON deben manejarse de forma explícita.

---

## 15. Reglas sobre descargas

Las descargas desde cards y previews deben usar una implementación compartida cuando se confirme que tienen el mismo contrato.

La IA debe preservar:

- Nombre sugerido.
- Posibilidad de editar nombre.
- Sanitización de filename.
- Extensión correcta.
- Tipo MIME.
- Manejo de Blob.
- Mensajes de error.
- Comportamiento de descarga.

No crear una nueva implementación paralela si ya existe una canónica.

---

## 16. Reglas sobre generación y polling

No cambiar la lógica de generación durante un refactor estructural.

Preservar:

- Creación de jobs.
- IDs de recursos.
- IDs de unidad o planeación.
- Estado visual del card.
- Polling.
- Intervalos.
- Condiciones de finalización.
- Manejo de errores.
- Feedback mostrado al usuario.

No permitir que el polling de un recurso actualice el card de otro recurso.

No crear múltiples intervalos para el mismo job.

Todo intervalo debe tener una condición clara de limpieza.

---

## 17. Reglas sobre comportamiento visible

Durante una extracción no se deben cambiar:

- Textos.
- Botones.
- Orden de tabs.
- Clases CSS.
- IDs del DOM.
- Data attributes.
- Estructura de cards.
- Modales.
- Feedback.
- Animaciones.
- Nombres de archivos descargados.

Si se detecta un problema visual o funcional no relacionado con la tarea:

- Documentarlo.
- No corregirlo en el mismo cambio.
- Proponer una tarea separada.

---

## 18. Reglas sobre cambios automáticos

No realizar cambios masivos con reemplazos globales sin revisar cada coincidencia.

No usar scripts de búsqueda y reemplazo para eliminar jerarquías de forma indiscriminada.

No ejecutar formateadores sobre archivos no relacionados.

No cambiar finales de línea de todo el repositorio.

No renombrar archivos sin actualizar y validar el orden de carga de scripts.

---

## 19. Tamaño y alcance de cada sesión

Cada sesión debe tener un objetivo concreto.

Ejemplos válidos:

- Auditar descargas duplicadas.
- Extraer el preview de exámenes.
- Centralizar el API client sin cambiar contratos.
- Separar eventos de anexos.
- Documentar jerarquías activas y obsoletas.

Ejemplos no válidos:

- Refactorizar todo el frontend.
- Limpiar todo el código viejo.
- Modernizar toda la aplicación.
- Reescribir Biblioteca completa.

Si durante una sesión aparece trabajo adicional, se debe registrar como pendiente en lugar de ampliar el alcance sin control.

---

## 20. Validación mínima obligatoria

Después de cada cambio, validar como mínimo:

### Aplicación

- La página carga.
- No aparecen nuevos errores de consola.
- No faltan funciones globales requeridas.
- No se rompen imports o scripts.

### Biblioteca

- Se cargan los bloques.
- Se abre un bloque.
- Se puede cambiar entre tabs.

### Recurso afectado

- Se muestran sus cards.
- Se abre preview.
- Se ejecuta la acción modificada.
- Se conserva feedback.
- Se conserva descarga.
- Se conserva eliminación cuando corresponda.

### Red

- No hay peticiones duplicadas nuevas.
- Los payloads mantienen su forma.
- Los endpoints siguen siendo los mismos.

### Eventos

- Un clic ejecuta una sola acción.
- No se duplican modales.
- No se crean intervalos duplicados.

---

## 21. Archivos de documentación obligatorios

Antes de iniciar una modificación grande, leer en este orden:

1. `README.md`
2. `AGENTS.md` (este archivo, completo, incluyendo sección 2.1 "Conceptos que NO deben confundirse")
3. `docs/ARCHITECTURE.md`
4. `docs/FRONTEND_MAP.md`
5. `docs/refactor/FRONTEND_AUDIT.md`
6. `docs/refactor/CURRENT_BEHAVIOR.md`
7. `docs/refactor/LEGACY_HIERARCHY.md`
8. `docs/refactor/REFACTOR_BACKLOG.md`
9. `docs/refactor/TEST_MATRIX.md`
10. `docs/refactor/AI_AGENT_RULES.md` (checklist operativo por sesión)
11. `docs/refactor/REFACTOR_PLAYBOOK.md` (método de extracción con ejemplos)
12. `docs/refactor/GLOSSARY.md` (términos del dominio, consultar ante cualquier ambigüedad)
13. `docs/refactor/SESSION_HANDOFF.md` (estado de la última sesión)

Si alguno no existe, no inventar su contenido. Indicar que falta y continuar únicamente si la tarea puede hacerse con seguridad.

`docs/refactor/REFACTOR_RULES.md` y `docs/refactor/DECISIONS.md`, mencionados en versiones anteriores de esta lista, no existen en el repositorio — no se inventó su contenido. Si una sesión futura los necesita, debe crearlos explícitamente y documentar por qué.

---

## 22. Entrega obligatoria al terminar una sesión

Toda sesión debe terminar con un reporte que incluya:

### Objetivo realizado

Descripción breve y concreta.

### Archivos modificados

Lista exacta.

### Cambios realizados

Qué se movió, extrajo, documentó o eliminó.

### Compatibilidad

Wrappers, aliases o puentes temporales que quedaron activos.

### Validaciones ejecutadas

Comandos y pruebas manuales.

### Riesgos encontrados

Dependencias ocultas, estado global, listeners, código legado o contratos frágiles.

### Pendientes

Trabajo detectado pero no incluido.

### Próximo paso recomendado

Una sola tarea siguiente, pequeña y verificable.

También se debe actualizar `docs/refactor/SESSION_HANDOFF.md` cuando exista.

---

## 23. Formato de commits

Los commits deben ser pequeños y describir una sola intención.

Ejemplos:

```text
refactor(frontend): extract shared download helpers
refactor(exams): move preview rendering to feature module
refactor(attachments): separate API calls from rendering
chore(refactor): document legacy hierarchy consumers
```

Evitar commits como:

```text
refactor everything
cleanup code
fix frontend
large changes
```

---

## 24. Criterio para detenerse

La IA debe detener una modificación y reportar el riesgo cuando:

- No puede determinar si una función pertenece al flujo vigente o legado.
- Existen múltiples contratos incompatibles.
- El orden de carga de scripts no está claro.
- Una función depende de estado global no documentado.
- El cambio requiere modificar backend o base de datos.
- El cambio altera comportamiento visible no autorizado.
- No existe una forma razonable de validar el resultado.

Detenerse no significa abandonar la tarea.

Debe entregar:

- Lo descubierto.
- La evidencia.
- El riesgo.
- La opción más segura para continuar.

---

## 25. Instrucción final

No buscar una solución elegante a costa de estabilidad.

No asumir.

No borrar primero.

No reescribir por impulso.

No mezclar sistemas.

Entender el flujo actual de Biblioteca, conservar compatibilidad y avanzar mediante cambios pequeños, comprobables y reversibles.
