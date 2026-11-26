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

## Compatibilidad y seguridad

Los adaptadores toleran campos opcionales ausentes sin serializar `undefined`,
`null` u objetos como texto. Anexos persistidos v1, v2 y v3 mantienen su dispatch.
Todo dato se entrega a la biblioteca como texto: no se usa `innerHTML` como XML
ni se ejecuta contenido. La variante de examen del estudiante omite la clave;
solo una variante solicitada explícitamente añade respuestas.

## Pruebas y revisión manual

`tests/docx-export.test.js` abre el Blob como ZIP, verifica las partes OOXML,
parsea `word/document.xml` y comprueba escape, MIME, nombres, cleanup y
adaptadores. Para la revisión manual, abrir sin advertencias en Microsoft Word o
LibreOffice una planeación, un anexo de cada modalidad v3, un examen de opción
múltiple y una lista. Revisar nombre editable, tablas, saltos, Unicode, espacios
de respuesta, contenido completo, paridad card/modal y ausencia de HTML visible.
