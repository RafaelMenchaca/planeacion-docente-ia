# Session Handoff

## Estado funcional actual

**Biblioteca es el flujo principal vigente y el único objetivo de nuevas implementaciones frontend.**

- Explorador visual jerárquico: obsoleto para nuevas implementaciones; no es un modo paralelo.
- Jerarquía técnica: puede seguir activa en datos, endpoints, selectores, persistencia o soporte interno.
- Archivados: flujo separado con posibles dependencias jerárquicas.
- `explorerState`: estado mixto; no puede eliminarse como bloque sin clasificar consumidores.

## Estado del roadmap

- **Fase actual:** 0 — Línea base y protección.
- **Estado:** En progreso.
- **Próxima fase:** 1 — Extracciones aisladas de bajo riesgo.
- **Primera sesión sugerida:** preview y descarga de examen.

La Fase 0 no está completada: la línea base manual completa continúa pendiente y los cambios documentales de esta sesión no tienen commit por instrucción del usuario.

## Evidencia confirmada de Fase 0

- Frontend y backend estaban limpios al iniciar la sesión del 2026-07-23.
- Ambos repositorios tienen el tag anotado `pre-biblioteca-modular-refactor` apuntando a su `HEAD`.
- El tag existe en el remoto `origin` de ambos repositorios.
- Las reglas, arquitectura, roadmap, playbook y matriz protegen Biblioteca, contratos backend y jerarquía técnica.
- El refuerzo backend previo y sus pendientes están documentados en `LOG_AUDIT.md`, `LOG_CONVENTIONS.md` y el handoff backend.

## Pendientes de Fase 0

- Ejecutar la línea base manual completa de [`TEST_MATRIX.md`](TEST_MATRIX.md).
- Registrar resultados reales de Biblioteca, generación, polling, previews, descargas y eliminación.
- Confirmar ausencia de errores inesperados en consola y terminal durante la línea base.
- Dejar los cambios documentales revisados en un commit pequeño, solo cuando el usuario lo autorice.
- Volver a confirmar ambos repositorios limpios antes de iniciar Fase 1.

## Alcance de la primera sesión sugerida

Clasificar y extraer literalmente el preview y la descarga de examen que Biblioteca consume hoy desde wrappers publicados por Dashboard.

Condición de salida:

- consumidores confirmados en JS, HTML, `window.*` y `data-*`;
- firmas y wrappers preservados;
- `js/ui/wordExport.js` sin cambios;
- orden de scripts equivalente;
- preview abre/cierra y la descarga conserva nombre y contenido;
- Login, carga de Biblioteca, tabs y recarga sin regresiones;
- consola y terminal sin errores inesperados.

No se deben fijar nombres definitivos de archivos hasta completar la clasificación al inicio de esa sesión.

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

2026-07-23 — Se creó el roadmap canónico de Fases 0–10 y se alinearon reglas, arquitectura, playbook, handoff, test matrix y decisiones. No se modificó código ni ningún contrato funcional.
