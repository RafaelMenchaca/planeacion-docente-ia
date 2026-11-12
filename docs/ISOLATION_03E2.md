# 03E2 — aislamiento del estado del navegador

## Alcance y owner

`js/services/auth.service.js` es el owner del sujeto autenticado en memoria. `window.BrowserSessionState` conserva únicamente el UUID canónico recibido de la sesión Supabase, permite registrar limpiezas idempotentes y genera un contexto que invalida respuestas asíncronas iniciadas por otro sujeto.

Los owners consumidores siguen siendo los existentes:

- `planeaciones.service.js`: registro persistente de la jerarquía de Archivados;
- `dashboard.page.js`: `window.explorerState`, Quick Create, progreso y previews;
- `biblioteca.page.js`: conjuntos, tabs, filtros, modales y pendientes de Biblioteca;
- `archivados.page.js`: datos, filtros, selección y modal de Archivados.

## Persistencia y cambio de sujeto

El registro de Archivados se guarda como `educativo.archivedHierarchy.registry.<uuid>`. El UUID procede exclusivamente de la sesión autenticada; no se acepta un identificador pasado por el consumidor. La clave histórica global `educativo.archivedHierarchy.registry` no tiene propietario demostrable, por lo que se ignora y no se migra al siguiente usuario.

Al recibir `SIGNED_OUT` o un cambio directo de UUID, Auth invalida el contexto anterior y pide a cada owner que vacíe su estado en memoria. Biblioteca y Archivados vuelven a renderizarse vacíos, y `explorerState` conserva su objeto global y su shape contractual con valores iniciales nuevos. Repetir la limpieza es seguro. Sin sesión no se lee ni escribe persistencia específica de usuario.

Las respuestas de carga de Biblioteca y Archivados comprueban el contexto antes de incorporarse a la UI. Las preferencias verdaderamente globales y no sensibles no son eliminadas.

## Validación automatizada

`tests/browser-session-isolation.test.js` cubre A → B → A, aislamiento de escrituras, rechazo de la clave legacy, ausencia de sesión, preservación de configuración global, logout repetido, cambio directo de sujeto, invalidación de respuestas y registro de los tres resets. La suite existente protege Biblioteca, Quick Create, previews y el orden contractual de scripts.

## Prueba manual aprobada

La prueba se ejecutó exclusivamente en local/test, en el mismo navegador y la misma pestaña, sin limpiar Storage entre sesiones. La transición observada fue A → logout → B.

1. A inició sesión y cargó exclusivamente sus datos.
2. A creó la planeación sintética `Prueba user A` y editó su contenido para identificar inequívocamente al usuario A.
3. A cerró sesión.
4. B inició sesión en la misma pestaña y no vio `Prueba user A` ni su contenido.
5. B vio únicamente su bloque sintético previo `Física 1`.
6. No hubo mezcla visible de Biblioteca, planeaciones, selección, modales o contenido, ni se observaron errores relacionados con aislamiento de sesión.

Resultado general: **PASS**. Las respuestas HTTP 200/304 fueron normales; el 404 de `favicon.ico` no corresponde al alcance de 03E2.

La evidencia manual no incluye el regreso A → B → A ni demuestra visualmente la recuperación de estado al volver a A.

## Archivados

La prueba visual de Archivados queda registrada como **NO APLICA**. Archivados no está funcionalmente habilitado por incompatibilidades previas entre la jerarquía legacy y Biblioteca; no fue probado manualmente, no se reactiva y no bloquea el cierre de 03E2. El namespacing por UUID implementado queda como protección preventiva para cuando se retome la función. La recuperación visual A → B → A de Archivados no forma parte de la evidencia manual actual.

03E2 no cambia backend, APIs, Storage, generación, SSE ni polling. Con la prueba manual aprobada y los límites anteriores registrados, **03E2 queda cerrado**. El siguiente paso es **03F**.
