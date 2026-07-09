# AI_AGENT_RULES.md — Checklist operativo por sesión

> Este archivo es más operativo que `AGENTS.md`. `AGENTS.md` explica el *por qué* y las reglas generales; este archivo es la lista de verificación literal que se marca en cada sesión de refactor. Si algo aquí contradice a `AGENTS.md`, gana `AGENTS.md`.

---

## Antes de tocar código

- [ ] Leer `AGENTS.md` completo, incluyendo sección 2.1 "Conceptos que NO deben confundirse".
- [ ] Leer `docs/ARCHITECTURE.md`, `docs/FRONTEND_MAP.md`, `docs/refactor/FRONTEND_AUDIT.md`, `docs/refactor/CURRENT_BEHAVIOR.md`, `docs/refactor/LEGACY_HIERARCHY.md`, `docs/refactor/REFACTOR_BACKLOG.md`, `docs/refactor/TEST_MATRIX.md`.
- [ ] Leer `docs/refactor/REFACTOR_PLAYBOOK.md` para el método de extracción y los ejemplos ya validados de este proyecto.
- [ ] Leer `docs/refactor/GLOSSARY.md` si algún término del dominio no está claro.
- [ ] Leer `docs/refactor/SESSION_HANDOFF.md` para conocer el estado de la última sesión y sus preguntas abiertas.
- [ ] Confirmar la rama actual (`git branch --show-current`).
- [ ] Ejecutar `git status` y `git status --porcelain` — si hay cambios sin commitear que no son de esta sesión, detenerse y preguntar antes de continuar (no asumir que son descartables).
- [ ] Definir el alcance de la sesión en una sola frase concreta (regla 19 de `AGENTS.md`: nunca "refactorizar todo").
- [ ] Confirmar que el alcance corresponde a una sola etapa de `docs/refactor/REFACTOR_BACKLOG.md`, no varias.
- [ ] Identificar explícitamente los **archivos permitidos** para esta sesión (lista cerrada, no "todo lo que parezca relacionado").
- [ ] Identificar explícitamente los **archivos prohibidos** para esta sesión (backend, SQL, `wordExport.js` salvo autorización, etc.).
- [ ] Para cada función/bloque a mover, identificar todos sus consumidores:
  - [ ] Grep en todo `js/**/*.js`.
  - [ ] Grep en todo `pages/**/*.html` y `components/**/*.html` (atributos inline, `data-*-action`).
  - [ ] Grep de `window.<nombre>` (lectura y escritura).
  - [ ] Grep de strings dinámicos que puedan construir el nombre (p. ej. `data-bib-action="..."`, `data-content-action="..."`).
- [ ] Clasificar el riesgo del cambio (Bajo/Medio/Alto/Crítico) usando el mismo criterio de `docs/FRONTEND_MAP.md`.

## Durante los cambios

- [ ] Cambios pequeños — una intención por sesión, una intención por commit.
- [ ] Extracción literal primero: copiar/mover el código tal cual, sin "aprovechar" para mejorar nombres, condiciones o estructura.
- [ ] Mantener wrappers de compatibilidad para todo consumidor externo que dependa de `window.<nombre>` (ver plantilla en `AGENTS.md` sección 5.1, punto 7).
- [ ] No cambiar comportamiento observable: mismos textos, mismos mensajes, mismos nombres de archivo descargado, mismo orden de tabs, mismos data-attributes.
- [ ] No mezclar dominios en la misma sesión (p. ej. no tocar exámenes y anexos a la vez, salvo que la etapa del backlog lo requiera explícitamente).
- [ ] No tocar backend (`educativo_backend/`).
- [ ] No tocar SQL (`sql/migrations/`, `educativo_backend/**/supabase/`).
- [ ] No modificar payloads de ninguna llamada API (mismos campos, mismos tipos, mismo método HTTP, misma ruta).
- [ ] No cambiar el orden de `<script>` en ningún HTML sin validar explícitamente que el nuevo orden sigue satisfaciendo las dependencias documentadas en `docs/FRONTEND_MAP.md`.
- [ ] No formatear archivos completos ni ejecutar formateadores automáticos sobre archivos no relacionados con la sesión.
- [ ] No tocar `js/ui/wordExport.js` sin autorización explícita ya obtenida y registrada en `SESSION_HANDOFF.md`.

## Antes de terminar la sesión

- [ ] Ejecutar todas las validaciones posibles: `npm test`, navegación manual de los flujos afectados según `docs/refactor/TEST_MATRIX.md`.
- [ ] Revisar `git diff` completo — confirmar que no hay cambios accidentales fuera del alcance declarado.
- [ ] Confirmar la lista exacta de archivos modificados (`git status --porcelain`).
- [ ] Actualizar `docs/refactor/SESSION_HANDOFF.md` con: fecha, objetivo, archivos tocados, hallazgos, riesgos, wrappers nuevos, próximo paso.
- [ ] Documentar qué pruebas se ejecutaron (comandos y pasos manuales) y cuáles quedaron pendientes.
- [ ] Documentar riesgos nuevos encontrados, aunque no se hayan resuelto en esta sesión.
- [ ] Documentar todo wrapper temporal nuevo: qué reemplaza, quién lo consume, fecha de creación.
- [ ] Documentar código legacy que se tocó (si alguno) y código legacy que se dejó intacto a propósito, con el motivo.
- [ ] Confirmar que no se eliminó ningún código clasificado como `UNKNOWN` o `LEGACY_CONFIRMED` sin autorización explícita del usuario para esa eliminación puntual.
- [ ] No hacer commit automáticamente — el commit lo decide el usuario, salvo que la sesión indique explícitamente lo contrario.

## Señales para detenerse y preguntar (heredadas de `AGENTS.md` sección 24, repetidas aquí como checklist)

- [ ] No se puede determinar si una función pertenece a Biblioteca, al modelo jerárquico técnico, a Archivados, o a la navegación visual antigua.
- [ ] Se encuentran contratos de API incompatibles entre dos consumidores de la misma función.
- [ ] El orden de carga de `<script>` no está claro o el cambio propuesto lo alteraría.
- [ ] Una función depende de estado global (`window.*`) no documentado en `docs/refactor/FRONTEND_AUDIT.md`.
- [ ] El cambio requeriría tocar backend, Supabase o SQL.
- [ ] El cambio alteraría comportamiento visible no autorizado explícitamente.
- [ ] No existe una forma razonable de validar el resultado manualmente.
