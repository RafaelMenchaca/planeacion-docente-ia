# REFACTOR_PLAYBOOK.md — Método estándar de extracción

> Complementa a `AGENTS.md` (reglas) y `docs/refactor/AI_AGENT_RULES.md` (checklist). Este archivo explica *cómo* ejecutar una extracción paso a paso, con ejemplos concretos de este proyecto.

## Método estándar (10 pasos)

```text
1. Identificar función o bloque.
2. Buscar consumidores.
3. Clasificar dependencias.
4. Crear archivo destino.
5. Mover código literalmente.
6. Exponer namespace temporal si es necesario.
7. Mantener wrapper global antiguo si existe consumidor.
8. Actualizar llamadas internas solo si es seguro.
9. Validar manualmente.
10. Documentar en SESSION_HANDOFF.md.
```

Detalle de cada paso:

1. **Identificar función o bloque** — con línea exacta, usando `docs/refactor/FRONTEND_AUDIT.md` como fuente. No extraer "toda un área" de una vez; extraer una función o un grupo pequeño y cohesivo.
2. **Buscar consumidores** — grep en `js/**/*.js`, `pages/**/*.html`, `components/**/*.html`, y de `window.<nombre>`. Ver checklist completo en `AI_AGENT_RULES.md`.
3. **Clasificar dependencias** — qué necesita el código para funcionar (otras funciones, estado global, DOM esperado) y qué expone hacia afuera.
4. **Crear archivo destino** — nombre y ubicación consistentes con la dirección de `AGENTS.md` sección 8 (`js/features/<dominio>/...`), sin crear carpetas vacías "por si acaso".
5. **Mover código literalmente** — copiar tal cual, sin renombrar variables, sin cambiar condiciones, sin "aprovechar" para simplificar.
6. **Exponer namespace temporal si es necesario** — p. ej. `window.ExamPreview = { render, close }`, como punto de entrada único del nuevo módulo.
7. **Mantener wrapper global antiguo si existe consumidor** — el nombre `window.X` original sigue existiendo, pero delega al nuevo namespace. Ver ejemplos abajo.
8. **Actualizar llamadas internas solo si es seguro** — si el propio archivo de origen llamaba a la función movida, decidir caso por caso si conviene que llame al wrapper o al namespace nuevo directamente; nunca dejarlo roto.
9. **Validar manualmente** — ejecutar el subconjunto relevante de `docs/refactor/TEST_MATRIX.md`.
10. **Documentar en `SESSION_HANDOFF.md`** — archivo origen, archivo destino, wrappers creados, consumidores confirmados, pruebas ejecutadas.

---

## Ejemplo A: extracción segura de preview de examen

**Origen:** `dashboard.page.js` (funciones de render del modal de preview de examen, ver `docs/refactor/FRONTEND_AUDIT.md` sección 4 para líneas exactas de `window.renderExamPreviewModal`/`window.closeExamPreviewModal`).

**Destino sugerido:**
```text
js/features/examenes/exam-preview.js
```

**Wrappers temporales:**
```js
// wrapper temporal — mantiene compatibilidad con biblioteca.page.js,
// que llama window.renderExamPreviewModal/closeExamPreviewModal directamente
window.renderExamPreviewModal = (...args) => window.ExamPreview.render(...args);
window.closeExamPreviewModal = (...args) => window.ExamPreview.close(...args);
```

**Regla:** `biblioteca.page.js` no debe modificarse en esta primera extracción si puede seguir consumiendo el wrapper existente sin cambios. El objetivo de esta etapa es mover el código, no tocar sus consumidores.

**Por qué es de bajo riesgo:** el preview de examen es un consumidor confirmado y acotado (solo `biblioteca.page.js`, 3 puntos de uso: `openBibliotecaExamenPreview`, `closeBibliotecaExamModal` indirectamente, y el propio modal). No toca polling, no toca payload de generación, no toca `explorerState` como bloque completo (solo el subcampo `examPreview`, ya identificado como compartido en `LEGACY_HIERARCHY.md`).

---

## Ejemplo B: extracción segura de descarga de examen

**Destino sugerido:**
```text
js/features/examenes/exam-download.js
```

**Wrapper temporal:**
```js
// wrapper temporal — mantiene compatibilidad con biblioteca.page.js:2028-2029
window.downloadExamWord = (...args) => window.ExamDownload.download(...args);
```

**Regla:** no cambiar formato Word ni orden de respuestas durante la extracción. El algoritmo de barajado determinista (`shuffleArrayDeterministic`/`getStringSeed`, ver `FRONTEND_AUDIT.md` sección 7) debe copiarse literal, no reescribirse ni "mejorarse", aunque esté duplicado con la vista previa HTML — unificar esa duplicación es una etapa posterior y separada (ver `REFACTOR_BACKLOG.md`).

---

## Ejemplo C: código que NO debe extraerse todavía

| Código | Por qué es de mayor riesgo |
|---|---|
| **Polling de examen** (`dashboard.page.js:1995-2041`, `biblioteca.page.js:2327-2365`) | Es lógica de generación (regla 16 de `AGENTS.md`). Tocarlo cambia condiciones de finalización, intervalos o manejo de errores casi por accidente. Requiere su propia etapa dedicada (Etapa 4 de `REFACTOR_BACKLOG.md`), no debe mezclarse con extracción de preview/descarga. |
| **Generación de planeaciones** (`generatePlaneacionesFromStaging`, `generarPlaneacionesUnidadConProgreso`) | Toca payload de generación real con IA — prohibido tocar sin autorización explícita (`AGENTS.md` sección 5.1). |
| **Creación rápida** (`submitQuickCreateForm`, `dashboard.page.js:4933-5128`) | Encadena hasta 4 llamadas API secuenciales no atómicas; un cambio mal hecho puede dejar entidades huérfanas en el modelo jerárquico técnico (que sí está activo, ver `LEGACY_HIERARCHY.md`). |
| **Eliminación de jerarquías** (`submitDeleteConfirm`, tipos `plantel/grado/materia/unidad`) | Mezclada en la misma función con eliminación de recursos de Biblioteca (`planeacion`/`batch`); separar sin evidencia suficiente de cuáles data-actions vienen de Biblioteca puede romper la eliminación real de documentos. |
| **`wordExport.js`** | Zona protegida por decisión explícita del proyecto (`ai-context/07-known-bugs-and-decisions.md`). No tocar sin autorización explícita del usuario, documentada en `SESSION_HANDOFF.md`. |
| **`jerarquia.api.js` / `jerarquia.service.js`** | Es el modelo técnico **activo**, consumido por Archivados y por la creación rápida de bloques en Biblioteca. No es candidato de extracción "porque es jerárquico" — es infraestructura vigente, no legado. |

---

## Cuándo SÍ crear un archivo `.md` nuevo fuera de esta lista

Solo si una sesión descubre una regla crítica faltante que no encaja en ninguno de los documentos existentes. En ese caso, debe justificarse explícitamente en `SESSION_HANDOFF.md` por qué el archivo nuevo era necesario y por qué no bastaba con extender uno existente.
