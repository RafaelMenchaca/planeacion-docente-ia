# Decisiones del refactor

Registro breve de decisiones que gobiernan el roadmap. Las reglas obligatorias permanecen en [`AGENTS.md`](../../AGENTS.md); este archivo no las sustituye.

| ID | Fecha | Decisión | Motivo | Impacto |
| --- | --- | --- | --- | --- |
| R-001 | 2026-07-23 | Biblioteca es el único flujo visual principal vigente. | Evitar un modo dual y concentrar las nuevas implementaciones. | Todo refactor frontend avanza hacia Biblioteca modular. |
| R-002 | 2026-07-23 | La jerarquía técnica se conserva mientras sostenga datos, contratos, selectores o Archivados. | Su presencia no equivale a mantener el explorador visual antiguo. | No eliminar endpoints, IDs ni relaciones por una decisión de UI. |
| R-003 | 2026-07-23 | El legacy visual solo puede eliminarse después de aislarlo y demostrar que no tiene consumidores. | Reducir riesgo sobre Biblioteca, Archivados y compatibilidad. | El aislamiento ocurre en la Fase 8 y la eliminación, en una Fase 9 separada. |
| R-004 | 2026-07-23 | `REFACTOR_ROADMAP.md` es el único roadmap operativo vigente. | Evitar planes paralelos o contradictorios. | El playbook explica el método y el handoff registra el estado, sin duplicar fases. |
| R-005 | 2026-07-23 | Una fase se completa por evidencia y pruebas, no solo por movimiento de código. | Hacer verificables los avances y la reversión. | Cada fase exige criterios de salida, pruebas y handoff actualizado. |
