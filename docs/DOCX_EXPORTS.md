# Exportaciones DOCX

## Owner y dependencia

`js/ui/docxExport.js` es la única fuente del empaquetado Word. Convierte datos a
un modelo neutral de títulos, párrafos, listas, tablas, saltos y espacios de
respuesta. Los adaptadores no comparten HTML con los previews.

La serialización usa `docx` 9.16.0 (licencia MIT). La distribución IIFE y su
licencia están versionadas en `js/vendor/`, se cargan antes del owner y no usan
CDN ni servicios externos. `jszip` 3.10.1 se usa solo en pruebas para inspeccionar
el paquete generado.

## Inventario de consumidores

| Recurso | Entrada y adaptador | Card | Modal o preview | Nombre |
| --- | --- | --- | --- | --- |
| Planeación | `PlaneacionDownload` / `adapters.planeacion` | Biblioteca | detalle (`descargarWord`) | diálogo común |
| Anexo v1/v2/v3 | `AnexoDownload` / `adapters.anexo` | Biblioteca | preview | diálogo común |
| Examen | `ExamDownload` / `adapters.exam` | Biblioteca | preview | diálogo común |
| Lista de cotejo | `ListaCotejoDownload` / `adapters.listaCotejo` | Biblioteca | preview | diálogo común |

Los wrappers globales históricos se conservan, pero delegan en el mismo owner.
El archivo siempre termina en `.docx`, usa el MIME
`application/vnd.openxmlformats-officedocument.wordprocessingml.document`, crea
un único object URL y lo revoca una vez después del click.

## Perfiles de presentación

El owner conserva un perfil base para Anexos y aplica perfiles explícitos solo
a los otros recursos:

- `planeacionCompacta`: tamaño vigente A4 horizontal, márgenes de 0.35–0.40 pulgadas,
  Arial 7.5–12 pt, encabezado verde y tabla didáctica con proporciones
  10/37/8/12/11/14/8. Las filas no tienen altura fija y no se dividen cuando
  caben completas.
- `listaCotejo`: Arial 8.5–14 pt, márgenes de 0.5 pulgadas y columnas
  58/8/8/26 para criterio, Sí, No y observaciones. El encabezado de tabla se
  repite al cruzar página.
- `examen`: Arial 10–15 pt, márgenes compactos, preguntas con `keepNext` y
  opciones A–D sin viñeta adicional. Los prefijos que coinciden con el número
  o letra que agrega el adaptador se eliminan antes de serializar; números o
  letras que forman parte real de otro contenido se conservan. Tras un salto de
  página, la descarga añade la misma hoja resuelta que muestra la aplicación:
  cada pregunta y su respuesta correcta. No es una hoja vacía para captura del
  alumno y no se agrega una segunda clave duplicada.

La compactación no elimina ni trunca contenido. Una UDI excepcionalmente larga
puede ocupar más de una página para mantener legibilidad.

## Compatibilidad y seguridad

Los adaptadores toleran campos opcionales ausentes sin serializar `undefined`,
`null` u objetos como texto. Anexos persistidos v1, v2 y v3 mantienen su dispatch.
Todo dato se entrega a la biblioteca como texto: no se usa `innerHTML` como XML
ni se ejecuta contenido. El preview y el adaptador DOCX comparten la misma
transformación pura de `respuesta_correcta` para la hoja resuelta.

## Pruebas y revisión manual

`tests/docx-export.test.js` abre el Blob como ZIP, verifica las partes OOXML,
parsea `word/document.xml` y comprueba escape, MIME, nombres, cleanup y
adaptadores. También comprueba orientación, márgenes, fuentes, tamaños,
proporciones, encabezados repetibles y normalización de numeración. El entorno
automatizado actual no incluye LibreOffice, por lo que el conteo visual de
páginas requiere revisión manual. Para esa revisión, abrir sin advertencias en Microsoft Word o
LibreOffice una planeación, un anexo de cada modalidad v3, un examen de opción
múltiple y una lista. Revisar nombre editable, tablas, saltos, Unicode, espacios
de respuesta, contenido completo, paridad card/modal y ausencia de HTML visible.
