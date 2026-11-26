(function () {
  "use strict";

  const MIME = "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

  function scalar(value) {
    if (typeof value === "string") return value;
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
  }

  function compactText(value) {
    return scalar(value).replace(/\s+/g, " ").trim();
  }

  function editorialText(value) {
    const text = scalar(value);
    return window.EditorialText?.normalizeParagraphSeparators?.(text) ?? text;
  }

  function normalizeFilename(raw, fallback) {
    const withoutExtension = scalar(raw || fallback || "Documento").replace(/\.docx?$/i, "");
    const clean = withoutExtension.replace(/[\u0000-\u001f<>:"/\\|?*]/g, "")
      .replace(/[. ]+$/g, "").replace(/^\s+|\s+$/g, "").slice(0, 120);
    return `${clean || compactText(fallback) || "Documento"}.docx`;
  }

  const paragraph = (text, options) => ({ type: "paragraph", text: scalar(text), ...(options || {}) });
  const heading = (text, level = 1) => ({ type: "heading", text: scalar(text), level });
  const list = (items, ordered = false) => ({ type: "list", ordered, items: (Array.isArray(items) ? items : []).map(scalar).filter(Boolean) });
  const table = (headers, rows, options) => ({ type: "table", headers: (headers || []).map(scalar), rows: (rows || []).map((row) => (Array.isArray(row) ? row.map(scalar) : [])), ...(options || {}) });
  const answerLines = (count = 3) => ({ type: "answerLines", count: Math.min(Math.max(Number(count) || 1, 1), 10) });
  const pageBreak = () => ({ type: "pageBreak" });

  function requireLibrary() {
    if (!window.docx?.Document || !window.docx?.Packer) throw new Error("docx_library_unavailable");
    return window.docx;
  }

  function modelNodeToDocx(node, d) {
    const textRun = (value, options) => new d.TextRun({ text: scalar(value), ...(options || {}) });
    const textRunsWithBreaks = (value, options) => editorialText(value).split("\n")
      .map((line, index) => textRun(line, { ...(options || {}), ...(index ? { break: 1 } : {}) }));
    if (!node || typeof node !== "object") return [];
    if (node.type === "heading") {
      const levels = [d.HeadingLevel.TITLE, d.HeadingLevel.HEADING_1, d.HeadingLevel.HEADING_2, d.HeadingLevel.HEADING_3];
      return [new d.Paragraph({ text: scalar(node.text), heading: levels[Math.min(Math.max(node.level || 1, 0), 3)], keepNext: true, spacing: { before: 180, after: 100 } })];
    }
    if (node.type === "paragraph") {
      return [new d.Paragraph({ children: textRunsWithBreaks(node.text, { bold: Boolean(node.bold), italics: Boolean(node.italics) }), spacing: { after: 100 }, keepNext: Boolean(node.keepNext) })];
    }
    if (node.type === "list") {
      return node.items.map((item) => new d.Paragraph({ children: textRunsWithBreaks(item), numbering: node.ordered ? { reference: "educativo-numbering", level: 0 } : undefined, bullet: node.ordered ? undefined : { level: 0 }, indent: { left: 360 }, spacing: { after: 70 } }));
    }
    if (node.type === "answerLines") {
      return Array.from({ length: node.count }, () => new d.Paragraph({ children: [textRun(" ")], border: { bottom: { style: d.BorderStyle.SINGLE, size: 4, color: "94A3B8" } }, spacing: { before: 100, after: 80 } }));
    }
    if (node.type === "pageBreak") return [new d.Paragraph({ children: [new d.PageBreak()] })];
    if (node.type === "table") {
      const border = { style: d.BorderStyle.SINGLE, size: 4, color: "94A3B8" };
      const borders = { top: border, bottom: border, left: border, right: border, insideHorizontal: border, insideVertical: border };
      const cell = (value, header) => new d.TableCell({
        children: [new d.Paragraph({ children: [textRun(value, { bold: header })], spacing: { after: 0 } })],
        shading: header ? { fill: "DCE6F1", type: d.ShadingType.CLEAR } : undefined,
        margins: { top: 90, bottom: 90, left: 100, right: 100 },
        verticalAlign: d.VerticalAlign.CENTER
      });
      const rows = [];
      if (node.headers.length) rows.push(new d.TableRow({ tableHeader: true, cantSplit: true, children: node.headers.map((value) => cell(value, true)) }));
      node.rows.forEach((row) => rows.push(new d.TableRow({ cantSplit: false, children: row.map((value) => cell(value, false)) })));
      return [new d.Table({ rows, width: { size: 100, type: d.WidthType.PERCENTAGE }, borders, layout: d.TableLayoutType.FIXED })];
    }
    return [];
  }

  function buildDocument(model) {
    const d = requireLibrary();
    if (!model || !Array.isArray(model.children)) throw new Error("docx_model_invalid");
    const children = model.children.flatMap((node) => modelNodeToDocx(node, d));
    if (!children.length) throw new Error("docx_model_empty");
    return new d.Document({
      styles: { default: { document: { run: { font: "Arial", size: 22, color: "1F2937" }, paragraph: { spacing: { line: 276 } } } } },
      numbering: { config: [{ reference: "educativo-numbering", levels: [{ level: 0, format: d.LevelFormat.DECIMAL, text: "%1.", alignment: d.AlignmentType.START, style: { paragraph: { indent: { left: 360, hanging: 180 } } } }] }] },
      sections: [{ properties: { page: {
        margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
        ...(model.orientation === "landscape" ? { size: { orientation: d.PageOrientation.LANDSCAPE } } : {})
      } }, children }]
    });
  }

  async function createBlob(model) {
    const d = requireLibrary();
    const packed = await d.Packer.toBlob(buildDocument(model));
    return packed.type === MIME ? packed : new Blob([packed], { type: MIME });
  }

  async function download(model, filename, fallback = "Documento") {
    const blob = await createBlob(model);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = normalizeFilename(filename, fallback);
    document.body.appendChild(link);
    try {
      link.click();
    } finally {
      link.remove();
      URL.revokeObjectURL(url);
    }
    return true;
  }

  function planeacionModel(data, rowsOverride) {
    const rows = Array.isArray(rowsOverride) ? rowsOverride : (Array.isArray(data?.tabla_ia) ? data.tabla_ia.map((row) => [row?.tiempo_sesion, row?.actividades, row?.tiempo_min, row?.producto, row?.instrumento, row?.formativa, row?.sumativa]) : []);
    return { orientation: "landscape", children: [heading("Planeación didáctica", 0), table(["Asignatura", "Nivel", "Tema", "Subtema", "Duración", "Sesiones"], [[data?.materia, data?.nivel, data?.tema, data?.subtema, data?.duracion ? `${scalar(data.duracion)} min` : "", data?.sesiones]]), heading("Secuencia didáctica", 1), table(["Momento / Sesión", "Actividades", "Tiempo (min)", "Producto", "Instrumento", "Formativa", "Sumativa"], rows)] };
  }

  function listaModel(lista) {
    let criterios = lista?.criterios;
    if (typeof criterios === "string") { try { criterios = JSON.parse(criterios); } catch { criterios = []; } }
    if (!Array.isArray(criterios) || !criterios.length) throw new Error("lista_sin_criterios");
    return { children: [heading("Lista de cotejo", 0), paragraph(`Tema: ${compactText(lista?.tema || "Sin tema")}`), ...(lista?.materia ? [paragraph(`Materia: ${compactText(lista.materia)}`)] : []), ...(lista?.nivel ? [paragraph(`Nivel: ${compactText(lista.nivel)}`)] : []), table(["Criterio", "Sí", "No", "Observaciones"], criterios.map((item) => [item?.criterio, item?.si ?? 2, item?.no ?? 0, ""]), { landscape: false }), paragraph(`Total: ${scalar(lista?.total_puntos ?? 10)} puntos`, { bold: true })] };
  }

  function answerValues(question) {
    const raw = question?.respuesta_correcta;
    if (Array.isArray(raw)) return raw.map((item) => typeof item === "object" && item ? Object.values(item).map(scalar).filter(Boolean).join(" - ") : scalar(item)).filter(Boolean);
    const value = scalar(raw).trim();
    return value ? [value] : [];
  }

  function examModel(examen, { includeAnswers = false } = {}) {
    const content = examen?.examen_ia || {};
    const questions = Array.isArray(content.preguntas) ? content.preguntas : [];
    if (!questions.length) throw new Error("exam_content_missing");
    const children = [
      heading(content.titulo || examen?.titulo || "Examen de unidad", 0),
      paragraph("Nombre del alumno: __________________________________    Fecha: ______________"),
      ...(content.instrucciones_generales ? [heading("Instrucciones", 2), paragraph(content.instrucciones_generales)] : [])
    ];
    questions.forEach((question, index) => {
      children.push(heading(`${index + 1}. ${compactText(question?.pregunta)}`, 2));
      const options = Array.isArray(question?.opciones) ? question.opciones : [];
      if (options.length) children.push(list(options.map((option, optionIndex) => `${String.fromCharCode(65 + optionIndex)}. ${scalar(option)}`)));
      const pairs = Array.isArray(question?.pares) ? question.pares : [];
      if (pairs.length) children.push(table(["Columna A", "Columna B"], pairs.map((pair, pairIndex) => [`${pairIndex + 1}. ${scalar(pair?.lado_a)}`, `${String.fromCharCode(65 + pairIndex)}. ${scalar(pair?.lado_b)}`])));
      const elements = Array.isArray(question?.elementos) ? question.elementos : [];
      if (elements.length) children.push(list(elements, true));
      if (!options.length && !pairs.length && !elements.length) children.push(answerLines(4));
    });
    if (includeAnswers) {
      children.push(pageBreak(), heading("Clave de respuestas", 1));
      questions.forEach((question, index) => {
        children.push(paragraph(`${index + 1}. ${answerValues(question).join("; ") || "Sin respuesta disponible."}`));
      });
    }
    return { children };
  }

  function workbookBlockNodes(block) {
    const nodes = [];
    if (block?.titulo) nodes.push(heading(block.titulo, 3));
    switch (block?.tipo) {
      case "texto":
        editorialText(block.contenido).split("\n").forEach((line) => nodes.push(paragraph(line)));
        break;
      case "lista": nodes.push(list(block.items)); break;
      case "conceptos":
        (block.items || []).forEach((item) => { nodes.push(paragraph(item?.termino, { bold: true, keepNext: true }), paragraph(item?.explicacion)); if (item?.ejemplo) nodes.push(paragraph(`Ejemplo: ${scalar(item.ejemplo)}`, { italics: true })); });
        break;
      case "tabla": nodes.push(table(block.columnas, block.filas)); break;
      case "actividad":
        nodes.push(paragraph(block.instrucciones, { bold: true }));
        (block.items || []).forEach((item, index) => { nodes.push(paragraph(`${index + 1}. ${scalar(item?.enunciado)}`)); if (item?.opciones) nodes.push(list(item.opciones)); if (item?.espacio_respuesta) nodes.push(answerLines(item.espacio_respuesta.lineas)); });
        break;
      case "procedimiento": nodes.push(list(block.pasos, true)); break;
      case "ejemplo_resuelto":
        nodes.push(paragraph(`Enunciado: ${scalar(block.enunciado)}`, { bold: true }));
        (block.matrices || []).forEach((matrix) => { if (matrix?.titulo) nodes.push(heading(matrix.titulo, 3)); nodes.push(table(matrix?.columnas, matrix?.filas)); });
        nodes.push(heading("Procedimiento", 3), list(block.pasos, true), paragraph(`Resultado: ${scalar(block.resultado)}`, { bold: true }));
        if (Array.isArray(block.verificacion)) nodes.push(heading("Comprobación", 3), list(block.verificacion, true));
        nodes.push(paragraph(`Interpretación: ${scalar(block.interpretacion)}`));
        break;
      case "proyecto":
        nodes.push(paragraph(`Producto: ${scalar(block.producto)}`, { bold: true }), paragraph(block.instrucciones), list(block.etapas, true), answerLines(block.espacio_respuesta?.lineas));
        break;
      case "registro":
        (block.campos || []).forEach((field) => nodes.push(paragraph(field, { bold: true }), answerLines(block.espacio_respuesta?.lineas)));
        break;
      case "evaluacion": nodes.push(table(["Criterio", "Valoración"], (block.criterios || []).map((criterion) => [criterion?.texto, "☐"]))); break;
      case "espacio_respuesta": nodes.push(paragraph(block.etiqueta, { bold: true }), answerLines(block.lineas)); break;
      default: throw new Error("unsupported_workbook_block");
    }
    return nodes;
  }

  function anexoModel(anexo, version) {
    const content = anexo?.contenido || {};
    if (version === "v1") {
      const children = [heading(content.titulo_general || anexo?.titulo || "Anexos", 0)];
      if (content.descripcion) children.push(paragraph(content.descripcion));
      children.push(paragraph("Nombre del alumno: ______________________________    Fecha: ______________"));
      if (anexo?.materia) children.push(paragraph(`Materia: ${scalar(anexo.materia)}`));
      if (anexo?.tema) children.push(paragraph(`Tema: ${scalar(anexo.tema)}`));
      (content.anexos || []).forEach((item) => {
        children.push(heading(`ANEXO ${scalar(item?.numero)}: ${scalar(item?.titulo)}`, 1));
        if (item?.instrucciones) children.push(paragraph(item.instrucciones, { italics: true }));
        (item?.contenido || []).forEach((block) => { if (block?.subtitulo) children.push(heading(block.subtitulo, 2)); if (block?.texto) children.push(paragraph(block.texto)); if (block?.preguntas) children.push(list(block.preguntas, true)); });
        if (item?.tabla) children.push(table(item.tabla.columnas, item.tabla.filas));
      });
      return { children };
    }
    const children = [heading(content.titulo || "Cuadernillo", 0), paragraph(content.descripcion || "")];
    const subject = version === "v2" ? content.datos_generales?.asignatura?.valor || anexo?.materia : anexo?.materia;
    const topic = version === "v2" ? content.datos_generales?.tema?.valor || anexo?.tema : anexo?.tema;
    if (subject || topic) children.push(table(["Asignatura", "Tema"], [[subject, topic]]));
    if (version === "v2" && content.datos_generales) {
      const fields = [["Institución", "institucion"], ["Asignatura", "asignatura"], ["Unidad", "unidad"], ["Tema", "tema"], ["Estudiante", "estudiante"], ["Grupo", "grupo"], ["Fecha", "fecha"]];
      children.push(heading("Datos generales", 1), table(["Campo", "Valor"], fields.map(([label, key]) => [label, content.datos_generales?.[key]?.valor || ""])));
    }
    [...(content.secciones || [])].sort((a, b) => a.orden - b.orden).filter((section) => section.id !== "datos_generales").forEach((section, index) => {
      children.push(heading(`${index + 1}. ${scalar(section.titulo)}`, 1));
      (section.bloques || []).forEach((block) => children.push(...workbookBlockNodes(block)));
    });
    return { children };
  }

  window.DocxExport = {
    MIME, scalar, compactText, editorialText, normalizeFilename, paragraph, heading, list, table, answerLines, pageBreak,
    buildDocument, createBlob, download,
    adapters: { planeacion: planeacionModel, listaCotejo: listaModel, exam: examModel, anexo: anexoModel }
  };
})();
