(function () {
  const DOWNLOAD_ERROR_MESSAGE = "No se pudo descargar el anexo. Intenta nuevamente.";
  const UNKNOWN_VERSION_MESSAGE = "No se puede descargar este anexo porque su formato no es compatible.";
  const INVALID_V2_MESSAGE = "No se puede descargar este cuadernillo porque su contenido está incompleto.";
  const BLOCK_TYPES = new Set(["texto", "lista", "conceptos", "tabla", "actividad", "procedimiento", "ejemplo_resuelto", "proyecto", "registro", "evaluacion", "espacio_respuesta"]);
  const ACTIVITY_LABELS = Object.freeze({ preguntas: "Preguntas", completar: "Completar", relacionar: "Relacionar", identificar: "Identificar", clasificar: "Clasificar", ejercicio: "Ejercicio", problema: "Problema", reflexion: "Reflexión" });
  const EVALUATION_LABELS = Object.freeze({ rubrica: "Rúbrica", lista_cotejo: "Lista de cotejo", autoevaluacion: "Autoevaluación" });
  let requestInProgress = false;

  function safe(value) {
    return escapeHtml(String(value ?? ""));
  }

  function paragraphs(value) {
    return safe(value).split(/\r?\n/).map((line) => `<p>${line || "&nbsp;"}</p>`).join("");
  }

  function detectAnexoDownloadVersion(anexo) {
    const contenido = anexo?.contenido;
    if (!contenido || typeof contenido !== "object" || Array.isArray(contenido)) return "unknown";
    const declaredVersion = contenido.schema_version ?? anexo?.schema_version;
    if (Number(declaredVersion) === 2) {
      const validType = Boolean(window.CuadernilloTypes?.isValid?.(anexo?.tipo_cuadernillo));
      return validType && Array.isArray(contenido.secciones) ? "v2" : "unknown";
    }
    if (Number(declaredVersion) === 3) {
      const validType = Boolean(window.CuadernilloTypes?.isValid?.(anexo?.tipo_cuadernillo));
      return validType && Array.isArray(contenido.secciones) ? "v3" : "unknown";
    }
    if (declaredVersion == null && Array.isArray(contenido.anexos) && !anexo?.tipo_cuadernillo) return "v1";
    return "unknown";
  }

  function buildCuadernilloFilename(anexo) {
    const typeMeta = window.CuadernilloTypes?.get?.(anexo?.tipo_cuadernillo);
    const topic = anexo?.contenido?.datos_generales?.tema?.valor || anexo?.tema || "";
    const raw = [typeMeta?.label || "Cuadernillo", topic].filter(Boolean).join(" - ");
    const clean = raw.replace(/[\/\\:*?"<>|]/g, "").replace(/\s+/g, " ").trim().slice(0, 100);
    return clean || "Cuadernillo";
  }

  function sanitizeFilename(raw, fallback) {
    const source = String(raw || fallback || "Documento").replace(/\.doc$/i, "");
    if (window.AppUI?.sanitizeDownloadFilename) return window.AppUI.sanitizeDownloadFilename(source, "doc");
    const clean = source.replace(/[\/\\:*?"<>|]/g, "").replace(/\s+/g, "_").replace(/^_+|_+$/g, "");
    return clean || fallback || "Documento";
  }

  async function createWordDownload(model, filename) {
    return window.DocxExport.download(model, filename, "Documento");
  }

  function buildAnexoV1WordHtml(anexo) {
    const contenido = anexo.contenido || {};
    const tituloGeneral = contenido.titulo_general || anexo.titulo || "Anexos";
    const descripcion = contenido.descripcion || "";
    const listaAnexos = Array.isArray(contenido.anexos) ? contenido.anexos : [];
    const materia = anexo.materia || "";
    const tema = anexo.tema || "";

    function renderAnexoHtml(item) {
      let html = `<h2 style="font-size:13pt; margin-top:18pt; margin-bottom:4pt; font-weight:bold;">ANEXO ${item.numero || ""}: ${safe(item.titulo || "")}</h2>`;
      if (item.instrucciones) html += `<p style="font-style:italic; margin-bottom:8pt;"><strong>Instrucciones:</strong> ${safe(item.instrucciones)}</p>`;
      if (Array.isArray(item.contenido)) {
        for (const block of item.contenido) {
          if (block.subtitulo) html += `<p style="font-weight:bold; margin-top:8pt;">${safe(block.subtitulo)}</p>`;
          if (block.texto) html += `<p style="margin-bottom:6pt;">${safe(block.texto)}</p>`;
          if (Array.isArray(block.preguntas) && block.preguntas.length) html += `<ol style="margin-left:20pt;">${block.preguntas.map((question) => `<li style="margin-bottom:4pt;">${safe(question)}</li>`).join("")}</ol>`;
        }
      }
      if (item.tabla && Array.isArray(item.tabla.columnas) && Array.isArray(item.tabla.filas)) {
        html += `<table style="border-collapse:collapse; width:100%; margin-top:8pt;"><tr>${item.tabla.columnas.map((column) => `<th style="border:1px solid #999; background:#f0f0f0; padding:4pt 6pt; font-weight:bold;">${safe(column)}</th>`).join("")}</tr>`;
        html += item.tabla.filas.map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => `<td style="border:1px solid #999; padding:4pt 6pt;">${safe(cell || "")}</td>`).join("")}</tr>`).join("") + "</table>";
      }
      return html;
    }

    return `<html><head><meta charset="UTF-8"><style>body { font-family: Arial, sans-serif; font-size: 11pt; } h1 { text-align: center; font-size: 14pt; margin-bottom: 6pt; } p.descripcion { text-align: center; color: #555; margin-bottom: 16pt; font-size: 10pt; }</style></head><body>
      <h1>${safe(tituloGeneral)}</h1>${descripcion ? `<p class="descripcion">${safe(descripcion)}</p>` : ""}
      <p style="margin-bottom:6pt;">Nombre del alumno: ___________________________&nbsp;&nbsp;&nbsp;&nbsp;Fecha: ____________</p>
      ${materia ? `<p style="margin-bottom:2pt;"><strong>Materia:</strong> ${safe(materia)}</p>` : ""}
      ${tema ? `<p style="margin-bottom:10pt;"><strong>Tema:</strong> ${safe(tema)}</p>` : ""}
      ${listaAnexos.map(renderAnexoHtml).join("")}</body></html>`;
  }

  function responseLines(lines) {
    const count = Math.min(Math.max(Number.parseInt(lines, 10) || 1, 1), 10);
    return `<div class="answer-lines">${Array.from({ length: count }, () => "<p>________________________________________________________________________________</p>").join("")}</div>`;
  }

  function buildCuadernilloV2GeneralDataHtml(datos) {
    const fields = [["Institución", "institucion"], ["Asignatura", "asignatura"], ["Unidad", "unidad"], ["Tema", "tema"], ["Estudiante", "estudiante"], ["Grupo", "grupo"], ["Fecha", "fecha"]];
    const rows = fields.map(([label, key]) => {
      const field = datos?.[key];
      const value = typeof field?.valor === "string" ? field.valor.trim() : "";
      const printable = value ? safe(value) : field?.modo === "completar" ? "________________________________________" : "";
      return `<tr><th>${safe(label)}</th><td>${printable}</td></tr>`;
    }).join("");
    return `<section class="general-data"><h2>Datos generales</h2><table class="general-table"><tbody>${rows}</tbody></table></section>`;
  }

  function blockTitle(block) {
    return block?.titulo ? `<h3>${safe(block.titulo)}</h3>` : "";
  }

  function buildCuadernilloV2BlockHtml(block) {
    if (!block || !BLOCK_TYPES.has(block.tipo)) throw new Error("tipo_bloque_no_soportado");
    switch (block.tipo) {
      case "texto":
        return `<div class="block text-block">${blockTitle(block)}${paragraphs(block.contenido)}</div>`;
      case "lista":
        return `<div class="block list-block">${blockTitle(block)}<ul>${(block.items || []).map((item) => `<li>${safe(item)}</li>`).join("")}</ul></div>`;
      case "conceptos":
        return `<div class="block concepts-block">${blockTitle(block)}${(block.items || []).map((item) => `<div class="concept"><p><strong>${safe(item?.termino)}</strong></p><p>${safe(item?.explicacion)}</p>${item?.ejemplo ? `<p><em>Ejemplo:</em> ${safe(item.ejemplo)}</p>` : ""}</div>`).join("")}</div>`;
      case "tabla":
        return `<div class="block table-block">${blockTitle(block)}<table><thead><tr>${(block.columnas || []).map((column) => `<th>${safe(column)}</th>`).join("")}</tr></thead><tbody>${(block.filas || []).map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => cell === "" ? '<td style="height:28pt;">&nbsp;</td>' : `<td>${safe(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      case "actividad":
        return `<div class="block activity-block">${blockTitle(block)}<p class="tag">${safe(ACTIVITY_LABELS[block.modalidad] || "Actividad")}</p><p><strong>Instrucciones:</strong> ${safe(block.instrucciones)}</p><ol>${(block.items || []).map((item) => `<li>${safe(item?.enunciado)}${Array.isArray(item?.opciones) ? `<ul class="options">${item.opciones.map((option) => `<li>○ ${safe(option)}</li>`).join("")}</ul>` : ""}${item?.espacio_respuesta ? responseLines(item.espacio_respuesta.lineas) : ""}</li>`).join("")}</ol></div>`;
      case "procedimiento":
        return `<div class="block procedure-block">${blockTitle(block)}<ol>${(block.pasos || []).map((step) => `<li>${safe(step)}</li>`).join("")}</ol></div>`;
      case "ejemplo_resuelto":
        return `<div class="block example-block">${blockTitle(block)}<p><strong>Enunciado:</strong> ${safe(block.enunciado)}</p>${Array.isArray(block.matrices) ? block.matrices.map((matrix) => `<div class="table-block">${matrix?.titulo ? `<h4>${safe(matrix.titulo)}</h4>` : ""}<table><thead><tr>${(matrix?.columnas || []).map((column) => `<th>${safe(column)}</th>`).join("")}</tr></thead><tbody>${(matrix?.filas || []).map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => `<td>${safe(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`).join("") : ""}<p><strong>Procedimiento:</strong></p><ol>${(block.pasos || []).map((step) => `<li>${safe(step)}</li>`).join("")}</ol><p><strong>Resultado:</strong> ${safe(block.resultado)}</p>${Array.isArray(block.verificacion) ? `<p><strong>Comprobación:</strong></p><ol>${block.verificacion.map((step) => `<li>${safe(step)}</li>`).join("")}</ol>` : ""}<p><strong>Interpretación:</strong> ${safe(block.interpretacion)}</p></div>`;
      case "proyecto":
        return `<div class="block project-block">${blockTitle(block)}<p><strong>Producto:</strong> ${safe(block.producto)}</p><p><strong>Instrucciones:</strong> ${safe(block.instrucciones)}</p><p><strong>Etapas:</strong></p><ol>${(block.etapas || []).map((stage) => `<li>${safe(stage)}</li>`).join("")}</ol>${responseLines(block.espacio_respuesta?.lineas)}</div>`;
      case "registro":
        return `<div class="block record-block">${blockTitle(block)}${(block.campos || []).map((field) => `<div class="record-field"><p><strong>${safe(field)}</strong></p>${responseLines(block.espacio_respuesta?.lineas)}</div>`).join("")}</div>`;
      case "evaluacion":
        return `<div class="block evaluation-block">${blockTitle(block)}<p class="tag">${safe(EVALUATION_LABELS[block.modalidad] || "Evaluación")}</p>${Array.isArray(block.escala) && block.escala.length ? `<p><strong>Escala:</strong> ${block.escala.map(safe).join(" · ")}</p>` : ""}<table class="evaluation-table"><thead><tr><th>Criterio</th><th>Valoración</th></tr></thead><tbody>${(block.criterios || []).map((criterion) => `<tr><td>${safe(criterion?.texto)}</td><td>☐</td></tr>`).join("")}</tbody></table></div>`;
      case "espacio_respuesta":
        return `<div class="block answer-block"><p><strong>${safe(block.etiqueta)}</strong></p>${responseLines(block.lineas)}</div>`;
      default:
        throw new Error("tipo_bloque_no_soportado");
    }
  }

  function buildCuadernilloV2SectionHtml(section, index) {
    if (!section || typeof section.titulo !== "string" || !section.titulo.trim() || !Array.isArray(section.bloques) || section.bloques.length === 0) throw new Error("seccion_invalida");
    return `<section class="workbook-section"><h2><span class="section-number">${index}.</span> ${safe(section.titulo)}</h2>${section.bloques.map(buildCuadernilloV2BlockHtml).join("")}</section>`;
  }

  function hasText(value) {
    return typeof value === "string" && Boolean(value.trim());
  }

  function hasTextArray(value) {
    return Array.isArray(value) && value.length > 0 && value.every(hasText);
  }

  function assertValidBlock(block, version = "v2") {
    if (!block || !BLOCK_TYPES.has(block.tipo)) throw new Error("tipo_bloque_no_soportado");
    if (block.titulo !== undefined && !hasText(block.titulo)) throw new Error("bloque_invalido");
    switch (block.tipo) {
      case "texto":
        if (!hasText(block.contenido)) throw new Error("bloque_invalido");
        break;
      case "lista":
        if (!hasTextArray(block.items)) throw new Error("bloque_invalido");
        break;
      case "conceptos":
        if (!Array.isArray(block.items) || !block.items.length || block.items.some((item) => !hasText(item?.termino) || !hasText(item?.explicacion) || (item.ejemplo !== undefined && !hasText(item.ejemplo)))) throw new Error("bloque_invalido");
        break;
      case "tabla": {
        if (!hasTextArray(block.columnas) || !Array.isArray(block.filas) || !block.filas.length) throw new Error("bloque_invalido");
        const width = block.columnas.length;
        const isClassificationWorkspace = version === "v3"
          && Array.isArray(block.cobertura) && block.cobertura.length === 1 && block.cobertura[0] === 26;
        const invalidRow = isClassificationWorkspace
          ? (row) => !Array.isArray(row) || row.length !== 2 || !hasText(row[0]) || row[1] !== ""
          : (row) => !Array.isArray(row) || row.length !== width || !row.every(hasText);
        if (block.filas.some(invalidRow)) throw new Error("tabla_invalida");
        break;
      }
      case "actividad":
        if (!Object.hasOwn(ACTIVITY_LABELS, block.modalidad) || !hasText(block.instrucciones) || !Array.isArray(block.items) || !block.items.length || block.items.some((item) => !hasText(item?.enunciado))) throw new Error("bloque_invalido");
        break;
      case "procedimiento":
        if (!hasTextArray(block.pasos)) throw new Error("bloque_invalido");
        break;
      case "ejemplo_resuelto":
        if (!hasText(block.enunciado) || !hasTextArray(block.pasos) || !hasText(block.resultado) || !hasText(block.interpretacion)) throw new Error("bloque_invalido");
        if (version === "v3" && !hasTextArray(block.verificacion)) throw new Error("bloque_invalido");
        break;
      case "proyecto":
        if (!hasText(block.producto) || !hasText(block.instrucciones) || !hasTextArray(block.etapas) || !Number.isInteger(block.espacio_respuesta?.lineas) || block.espacio_respuesta.lineas <= 0) throw new Error("bloque_invalido");
        break;
      case "registro":
        if (!hasTextArray(block.campos) || !Number.isInteger(block.espacio_respuesta?.lineas) || block.espacio_respuesta.lineas <= 0) throw new Error("bloque_invalido");
        break;
      case "evaluacion":
        if (!Object.hasOwn(EVALUATION_LABELS, block.modalidad) || !Array.isArray(block.criterios) || !block.criterios.length || block.criterios.some((criterion) => !hasText(criterion?.texto))) throw new Error("bloque_invalido");
        break;
      case "espacio_respuesta":
        if (!hasText(block.etiqueta) || !Number.isInteger(block.lineas) || block.lineas <= 0) throw new Error("bloque_invalido");
        break;
      default:
        throw new Error("tipo_bloque_no_soportado");
    }
  }

  function assertRenderableWorkbook(anexo, version) {
    const content = anexo?.contenido;
    if (!content || typeof content.titulo !== "string" || !content.titulo.trim() || typeof content.descripcion !== "string" || !content.descripcion.trim()) throw new Error("contenido_v2_invalido");
    if (version === "v2" && !content.datos_generales) throw new Error("contenido_v2_invalido");
    if (version === "v3" && Object.hasOwn(content, "datos_generales")) throw new Error("contenido_v3_invalido");
    if (!Array.isArray(content.secciones) || content.secciones.length === 0) throw new Error("contenido_v2_invalido");
    content.secciones.forEach((section) => {
      if (!section || !Number.isInteger(section.orden) || !Array.isArray(section.bloques) || section.bloques.length === 0) throw new Error("contenido_v2_invalido");
      if (version === "v3" && section.id === "datos_generales") throw new Error("contenido_v3_invalido");
      if (version === "v3" && section.bloques.some((block) => block?.tipo === "evaluacion" && block.modalidad === "autoevaluacion")) throw new Error("contenido_v3_invalido");
      section.bloques.forEach((block) => assertValidBlock(block, version));
    });
  }

  function buildCuadernilloWordHtml(anexo, version) {
    assertRenderableWorkbook(anexo, version);
    const content = anexo.contenido;
    const typeMeta = window.CuadernilloTypes.get(anexo.tipo_cuadernillo);
    const subject = version === "v2" ? content.datos_generales?.asignatura?.valor || anexo.materia || "" : anexo.materia || "";
    const topic = version === "v2" ? content.datos_generales?.tema?.valor || anexo.tema || "" : anexo.tema || "";
    const sections = [...content.secciones].sort((a, b) => a.orden - b.orden);
    const sectionHtml = sections
      .filter((section) => section.id !== "datos_generales")
      .map((section, index) => buildCuadernilloV2SectionHtml(section, index + 1))
      .join("");
    return `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>
      @page { margin: 1.8cm; }
      body { font-family: Arial, sans-serif; font-size: 11pt; line-height: 1.45; color: #1f2937; }
      h1 { font-size: 20pt; color: #164e63; margin: 8pt 0; text-align: center; }
      h2 { font-size: 14pt; color: #164e63; margin: 18pt 0 8pt; page-break-after: avoid; }
      h3 { font-size: 11.5pt; color: #1e3a5f; margin: 10pt 0 5pt; page-break-after: avoid; }
      p { margin: 4pt 0 7pt; }
      ul, ol { margin: 5pt 0 9pt 20pt; } li { margin-bottom: 4pt; }
      table { width: 100%; border-collapse: collapse; margin: 8pt 0 12pt; }
      th, td { border: 1px solid #94a3b8; padding: 5pt; vertical-align: top; }
      th { background: #e2e8f0; font-weight: bold; }
      .cover { text-align: center; margin-bottom: 20pt; }
      .eyebrow { font-size: 9pt; font-weight: bold; letter-spacing: 1pt; color: #0e7490; }
      .type-label { font-size: 11pt; font-weight: bold; color: #155e75; }
      .description { color: #475569; margin: 8pt auto 12pt; }
      .metadata { font-size: 10pt; color: #475569; }
      .general-data { margin-bottom: 16pt; }
      .general-table th { width: 24%; text-align: left; }
      .workbook-section { margin-top: 14pt; }
      .block { margin: 7pt 0 11pt; }
      .concept, .example-block, .project-block { border: 1px solid #cbd5e1; padding: 7pt; margin: 6pt 0; page-break-inside: avoid; }
      .example-block { background: #ecfeff; }
      .tag { display: inline; font-weight: bold; color: #155e75; }
      .answer-lines p { margin: 4pt 0; color: #64748b; line-height: 1; }
      .record-field, .activity-block, .procedure-block, .evaluation-block { page-break-inside: avoid; }
      .evaluation-table td:last-child { width: 24%; text-align: center; }
      .options { list-style: none; margin-left: 10pt; }
    </style></head><body>
      <header class="cover"><p class="eyebrow">MATERIAL PARA ESTUDIANTES</p><p class="type-label">${safe(typeMeta.label)}</p>
        <h1>${safe(content.titulo)}</h1><div class="description">${paragraphs(content.descripcion)}</div>
        <p class="metadata">${subject ? `<strong>Asignatura:</strong> ${safe(subject)}` : ""}${subject && topic ? " &nbsp;·&nbsp; " : ""}${topic ? `<strong>Tema:</strong> ${safe(topic)}` : ""}</p></header>
      ${version === "v2" ? buildCuadernilloV2GeneralDataHtml(content.datos_generales) : ""}${sectionHtml}
    </body></html>`;
  }

  function buildCuadernilloV2WordHtml(anexo) {
    return buildCuadernilloWordHtml(anexo, "v2");
  }

  function buildCuadernilloV3WordHtml(anexo) {
    return buildCuadernilloWordHtml(anexo, "v3");
  }

  async function downloadAnexo(anexo, filenameOverride) {
    const version = detectAnexoDownloadVersion(anexo);
    try {
      if (version === "v1") {
        const title = anexo.contenido?.titulo_general || anexo.titulo || "Anexos";
        const defaultName = title.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim() || "Anexos";
        return await createWordDownload(window.DocxExport.adapters.anexo(anexo, "v1"), filenameOverride || defaultName);
      }
      if (version === "v2") {
        assertRenderableWorkbook(anexo, "v2");
        return await createWordDownload(window.DocxExport.adapters.anexo(anexo, "v2"), filenameOverride || buildCuadernilloFilename(anexo));
      }
      if (version === "v3") {
        assertRenderableWorkbook(anexo, "v3");
        return await createWordDownload(window.DocxExport.adapters.anexo(anexo, "v3"), filenameOverride || buildCuadernilloFilename(anexo));
      }
      alert(UNKNOWN_VERSION_MESSAGE);
      return false;
    } catch (error) {
      console.error("[downloads] anexo:build_error", { version, errorType: error?.message || "unknown" });
      alert(version === "v2" || version === "v3" ? INVALID_V2_MESSAGE : DOWNLOAD_ERROR_MESSAGE);
      return false;
    }
  }

  async function requestAnexoDownload(anexo) {
    if (requestInProgress) return false;
    const version = detectAnexoDownloadVersion(anexo);
    if (version === "unknown") {
      alert(UNKNOWN_VERSION_MESSAGE);
      return false;
    }
    requestInProgress = true;
    try {
      const suggested = version === "v2" || version === "v3"
        ? buildCuadernilloFilename(anexo)
        : window.AppUI.buildDownloadSuggestedName("Anexo", anexo.tema || anexo.titulo);
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "docx" });
      if (filename === null) return false;
      return await downloadAnexo(anexo, filename);
    } finally {
      requestInProgress = false;
    }
  }

  async function bibDescargarAnexo(anexoId) {
    console.debug("[downloads] anexo:start", { anexoId });
    try {
      const session = await window.requireSession();
      if (!session) return false;
      const response = await apiObtenerAnexoDetalle(anexoId, session.access_token);
      const anexo = response?.anexo;
      if (!anexo) throw new Error("No se pudo obtener el anexo.");
      const downloaded = await requestAnexoDownload(anexo);
      if (downloaded) console.debug("[downloads] anexo:success", { anexoId });
      return downloaded;
    } catch (error) {
      console.error("[downloads] anexo:error", { anexoId, message: error?.message });
      alert(DOWNLOAD_ERROR_MESSAGE);
      return false;
    }
  }

  window.AnexoDownload = {
    download: downloadAnexo,
    request: requestAnexoDownload,
    downloadBiblioteca: bibDescargarAnexo,
    detectVersion: detectAnexoDownloadVersion,
    buildV1WordHtml: buildAnexoV1WordHtml,
    buildV2WordHtml: buildCuadernilloV2WordHtml,
    buildV3WordHtml: buildCuadernilloV3WordHtml,
    buildSuggestedFilename: buildCuadernilloFilename
  };
})();
