# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

## Explorador visual jerárquico

Obsoleto para nuevas implementaciones. No debe recibir funcionalidad, mezclarse con el render o estado nuevo de Biblioteca ni tratarse como un modo paralelo.

## Jerarquía técnica

Puede seguir activa como datos, endpoints, selectores, persistencia o soporte interno. No debe eliminarse ni reinterpretarse sin auditoría y revisión de contratos backend.

## Archivados

Flujo separado con posibles dependencias jerárquicas. Su existencia no reactiva ni legitima el explorador visual antiguo como experiencia principal.

## Objetivo del refactor

Modularizar Biblioteca y separar dependencias activas del código visual legacy, conservando comportamiento y contratos.

## Dependencias conocidas

- `dashboard.html` carga `dashboard.page.js` antes de `biblioteca.page.js` y luego `main.js`.
- `initDashboardPage()` delega a `window.initBiblioteca()` y retorna antes de hidratar el explorador.
- Biblioteca consume partes de `window.explorerState` y wrappers de preview/descarga publicados por Dashboard.
- Dashboard consume `window.biblioteca` durante creación y progreso de planeaciones.
- Archivados consume APIs y services jerárquicos.

## Wrappers pendientes

- `window.explorerState` es mixto y no puede eliminarse completo.
- `window.renderExamPreviewModal` y `window.renderListaCotejoPreviewModal` siguen sirviendo a Biblioteca.
- `window.downloadExamWord`, `window.renderBibliotecaContent` y `window.biblioteca` conservan consumidores.

## Zonas protegidas

- payloads, IDs y contratos backend;
- generación, prompts, polling y jobs;
- schema y jerarquía técnica;
- autenticación y configuración API;
- descargas Word y `wordExport.js`;
- estado compartido y orden de scripts.

## Última sesión

Auditoría documental final del 2026-07-21. Se alinearon reglas, arquitectura, playbook, pruebas y referencias backend para declarar Biblioteca como único flujo visual principal. No se modificó código ni contrato funcional.

## Siguiente sesión recomendada

Clasificar una extracción modular de bajo riesgo que pertenezca inequívocamente a Biblioteca activa; no mover funciones desconocidas.

## Validaciones pendientes

- línea base manual completa de [`TEST_MATRIX.md`](TEST_MATRIX.md);
- confirmar en navegador los consumidores antes de retirar cualquier wrapper;
- tag estable de frontend y backend, si el usuario lo autoriza.
