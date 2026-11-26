(function () {
  const UNKNOWN_VERSION_MESSAGE = "No se puede visualizar este anexo porque su formato no es compatible.";
  const INVALID_V2_MESSAGE = "No se puede visualizar este cuadernillo porque su contenido está incompleto.";
  const BLOCK_TYPES = new Set(["texto", "lista", "conceptos", "tabla", "actividad", "procedimiento", "ejemplo_resuelto", "proyecto", "registro", "evaluacion", "espacio_respuesta"]);
  const ACTIVITY_LABELS = Object.freeze({ preguntas: "Preguntas", completar: "Completar", relacionar: "Relacionar", identificar: "Identificar", clasificar: "Clasificar", ejercicio: "Ejercicio", problema: "Problema", reflexion: "Reflexión" });
  const EVALUATION_LABELS = Object.freeze({ rubrica: "Rúbrica", lista_cotejo: "Lista de cotejo", autoevaluacion: "Autoevaluación" });

  function safe(value) {
    return escapeHtml(String(value ?? ""));
  }

  function detectAnexoSchemaVersion(anexo) {
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

  function getPreviewParts() {
    const modal = document.getElementById("biblioteca-anexo-modal");
    return { modal, card: modal?.querySelector(".biblioteca-modal-card") || null };
  }

  function setCardMode(card, mode) {
    card?.classList.toggle("bib-cuadernillo-preview-card", mode === "v2" || mode === "v3");
  }

  function bindClose() {
    document.getElementById("bib-anexo-close")?.addEventListener("click", closeBibliotecaAnexoModal);
  }

  function renderSafeError(card, message) {
    setCardMode(card, "error");
    card.innerHTML = `
      <div class="bib-anexo-head bib-anexo-error-head">
        <h3>Vista no disponible</h3>
        <button type="button" id="bib-anexo-close" class="bib-lista-close" aria-label="Cerrar">X</button>
      </div>
      <div class="bib-anexo-body bib-anexo-error-body" role="alert"><p>${safe(message)}</p></div>`;
    bindClose();
  }

  async function openBibliotecaAnexoPreview(anexoId) {
    try {
      const session = await window.requireSession();
      if (!session) return;
      const { modal, card } = getPreviewParts();
      if (!modal || !card) return;
      setCardMode(card, "loading");
      card.innerHTML = `
        <div class="bib-anexo-head"><h3>Cargando anexo...</h3><button type="button" id="bib-anexo-close" class="bib-lista-close" aria-label="Cerrar">X</button></div>
        <div class="bib-anexo-body bib-anexo-loading-body"><p class="text-sm text-slate-500">Un momento...</p></div>`;
      bindClose();
      modal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");
      const response = await apiObtenerAnexoDetalle(anexoId, session.access_token);
      const anexo = response?.anexo;
      if (!anexo) throw new Error("No se pudo cargar el anexo.");
      renderBibliotecaAnexoModal(anexo);
    } catch (error) {
      console.error("[biblioteca] Error cargando anexo:", error);
      const { card } = getPreviewParts();
      if (card) renderSafeError(card, "No se pudo cargar el anexo.");
    }
  }

  function closeBibliotecaAnexoModal() {
    const modal = document.getElementById("biblioteca-anexo-modal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function renderResponseLines(lines, className = "") {
    const count = Math.min(Math.max(Number.parseInt(lines, 10) || 1, 1), 8);
    const lineHtml = Array.from({ length: count }, () => '<span class="bib-workbook-response-line" aria-hidden="true"></span>').join("");
    return `<div class="bib-workbook-response-lines ${className}" aria-label="Espacio para responder">${lineHtml}</div>`;
  }

  function renderGeneralField(label, field) {
    const value = typeof field?.valor === "string" ? field.valor.trim() : "";
    const completable = field?.modo === "completar";
    const content = value
      ? safe(value)
      : completable
        ? renderResponseLines(Math.min(Number.parseInt(field?.lineas, 10) || 1, 3), "bib-workbook-general-lines")
        : '<span class="bib-workbook-missing">Sin información disponible</span>';
    return `<div class="bib-workbook-general-field"><dt>${safe(label)}</dt><dd>${content}</dd></div>`;
  }

  function renderCuadernilloV2DatosGenerales(datos) {
    const fields = [["Institución", "institucion"], ["Asignatura", "asignatura"], ["Unidad", "unidad"], ["Tema", "tema"], ["Estudiante", "estudiante"], ["Grupo", "grupo"], ["Fecha", "fecha"]];
    return `<section class="bib-workbook-general" aria-labelledby="bib-workbook-general-title">
      <h4 id="bib-workbook-general-title">Datos generales</h4>
      <dl class="bib-workbook-general-grid">${fields.map(([label, key]) => renderGeneralField(label, datos?.[key])).join("")}</dl>
    </section>`;
  }

  function renderBlockTitle(block) {
    return block?.titulo ? `<h5 class="bib-workbook-block-title">${safe(block.titulo)}</h5>` : "";
  }

  function renderTextBlock(block) {
    return `${renderBlockTitle(block)}<p class="bib-workbook-prose">${safe(block.contenido)}</p>`;
  }

  function renderListBlock(block) {
    return `${renderBlockTitle(block)}<ul class="bib-workbook-list">${(block.items || []).map((item) => `<li>${safe(item)}</li>`).join("")}</ul>`;
  }

  function renderConceptsBlock(block) {
    return `${renderBlockTitle(block)}<div class="bib-workbook-concepts">${(block.items || []).map((item) => `
      <article class="bib-workbook-concept"><h6>${safe(item?.termino)}</h6><p>${safe(item?.explicacion)}</p>
        ${item?.ejemplo ? `<p class="bib-workbook-concept-example"><strong>Ejemplo:</strong> ${safe(item.ejemplo)}</p>` : ""}</article>`).join("")}</div>`;
  }

  function renderTableBlock(block) {
    return `${renderBlockTitle(block)}<div class="bib-workbook-table-scroll" tabindex="0" aria-label="Tabla desplazable">
      <table class="bib-workbook-table"><thead><tr>${(block.columnas || []).map((column) => `<th scope="col">${safe(column)}</th>`).join("")}</tr></thead>
      <tbody>${(block.filas || []).map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => cell === ""
        ? '<td class="bib-workbook-table-answer-cell" aria-label="Espacio para responder"><span aria-hidden="true" style="display:block;min-height:2rem;min-width:8rem;">&nbsp;</span></td>'
        : `<td>${safe(cell)}</td>`).join("")}</tr>`).join("")}</tbody></table>
    </div>`;
  }

  function renderActivityItem(item, index) {
    return `<li class="bib-workbook-activity-item"><p><span class="bib-workbook-item-number" aria-hidden="true">${index + 1}.</span> ${safe(item?.enunciado)}</p>
      ${Array.isArray(item?.opciones) && item.opciones.length ? `<ul class="bib-workbook-options">${item.opciones.map((option) => `<li><span class="bib-workbook-option-mark" aria-hidden="true"></span>${safe(option)}</li>`).join("")}</ul>` : ""}
      ${item?.espacio_respuesta ? renderResponseLines(item.espacio_respuesta.lineas) : ""}</li>`;
  }

  function renderActivityBlock(block) {
    return `${renderBlockTitle(block)}<p class="bib-workbook-modality">${safe(ACTIVITY_LABELS[block.modalidad] || "Actividad")}</p>
      <p class="bib-workbook-prose">${safe(block.instrucciones)}</p><ol class="bib-workbook-activity-list">${(block.items || []).map(renderActivityItem).join("")}</ol>`;
  }

  function renderProcedureBlock(block) {
    return `${renderBlockTitle(block)}<ol class="bib-workbook-steps">${(block.pasos || []).map((step) => `<li>${safe(step)}</li>`).join("")}</ol>`;
  }

  function renderSolvedExampleBlock(block) {
    return `${renderBlockTitle(block)}<div class="bib-workbook-example-prompt"><strong>Enunciado</strong><p>${safe(block.enunciado)}</p></div>
      ${Array.isArray(block.matrices) ? block.matrices.map((matrix) => renderTableBlock(matrix)).join("") : ""}
      <ol class="bib-workbook-steps">${(block.pasos || []).map((step) => `<li>${safe(step)}</li>`).join("")}</ol>
      <div class="bib-workbook-example-result"><strong>Resultado</strong><p>${safe(block.resultado)}</p></div>
      ${Array.isArray(block.verificacion) ? `<div class="bib-workbook-example-verification"><strong>Comprobación</strong><ol class="bib-workbook-steps">${block.verificacion.map((step) => `<li>${safe(step)}</li>`).join("")}</ol></div>` : ""}
      <div class="bib-workbook-example-interpretation"><strong>Interpretación</strong><p>${safe(block.interpretacion)}</p></div>`;
  }

  function renderProjectBlock(block) {
    return `${renderBlockTitle(block)}<dl class="bib-workbook-project-summary"><div><dt>Producto</dt><dd>${safe(block.producto)}</dd></div>
      <div><dt>Instrucciones</dt><dd>${safe(block.instrucciones)}</dd></div></dl><h6 class="bib-workbook-subheading">Etapas</h6>
      <ol class="bib-workbook-steps">${(block.etapas || []).map((stage) => `<li>${safe(stage)}</li>`).join("")}</ol>${renderResponseLines(block.espacio_respuesta?.lineas)}`;
  }

  function renderRecordBlock(block) {
    return `${renderBlockTitle(block)}<div class="bib-workbook-record-fields">${(block.campos || []).map((field) => `
      <div class="bib-workbook-record-field"><span>${safe(field)}</span>${renderResponseLines(block.espacio_respuesta?.lineas)}</div>`).join("")}</div>`;
  }

  function renderEvaluationBlock(block) {
    return `${renderBlockTitle(block)}<p class="bib-workbook-modality">${safe(EVALUATION_LABELS[block.modalidad] || "Evaluación")}</p>
      ${Array.isArray(block.escala) && block.escala.length ? `<p class="bib-workbook-scale"><strong>Escala:</strong> ${block.escala.map(safe).join(" · ")}</p>` : ""}
      <ul class="bib-workbook-criteria">${(block.criterios || []).map((criterion) => `<li><span class="bib-workbook-check" aria-hidden="true"></span><span>${safe(criterion?.texto)}</span></li>`).join("")}</ul>`;
  }

  function renderAnswerSpaceBlock(block) {
    return `<p class="bib-workbook-answer-label">${safe(block.etiqueta)}</p>${renderResponseLines(block.lineas)}`;
  }

  function renderCuadernilloV2Bloque(block) {
    const renderers = { texto: renderTextBlock, lista: renderListBlock, conceptos: renderConceptsBlock, tabla: renderTableBlock, actividad: renderActivityBlock, procedimiento: renderProcedureBlock, ejemplo_resuelto: renderSolvedExampleBlock, proyecto: renderProjectBlock, registro: renderRecordBlock, evaluacion: renderEvaluationBlock, espacio_respuesta: renderAnswerSpaceBlock };
    const renderer = renderers[block?.tipo];
    if (!renderer) return '<div class="bib-workbook-block-error" role="note">Este elemento no se puede visualizar.</div>';
    return `<article class="bib-workbook-block bib-workbook-block-${safe(block.tipo)}">${renderer(block)}</article>`;
  }

  function renderCuadernilloV2Seccion(section, visualIndex) {
    return `<section class="bib-workbook-section" aria-labelledby="bib-workbook-section-${visualIndex}">
      <header class="bib-workbook-section-head"><span class="bib-workbook-section-number" aria-hidden="true">${visualIndex}</span>
        <h4 id="bib-workbook-section-${visualIndex}">${safe(section.titulo)}</h4></header>
      <div class="bib-workbook-section-content">${section.bloques.map(renderCuadernilloV2Bloque).join("")}</div></section>`;
  }

  function isRenderableV2(contenido) {
    if (!contenido || typeof contenido.titulo !== "string" || !contenido.titulo.trim()) return false;
    if (typeof contenido.descripcion !== "string" || !contenido.descripcion.trim()) return false;
    if (!contenido.datos_generales || typeof contenido.datos_generales !== "object") return false;
    if (!Array.isArray(contenido.secciones) || contenido.secciones.length === 0) return false;
    return contenido.secciones.every((section) => section && typeof section.titulo === "string" && section.titulo.trim()
      && Number.isInteger(section.orden) && Array.isArray(section.bloques) && section.bloques.length > 0
      && section.bloques.every((block) => block && BLOCK_TYPES.has(block.tipo)));
  }

  function isRenderableV3(contenido) {
    if (!contenido || typeof contenido.titulo !== "string" || !contenido.titulo.trim()) return false;
    if (typeof contenido.descripcion !== "string" || !contenido.descripcion.trim()) return false;
    if (Object.hasOwn(contenido, "datos_generales")) return false;
    if (!Array.isArray(contenido.secciones) || contenido.secciones.length === 0) return false;
    return contenido.secciones.every((section) => section && section.id !== "datos_generales"
      && typeof section.titulo === "string" && section.titulo.trim()
      && Number.isInteger(section.orden) && Array.isArray(section.bloques) && section.bloques.length > 0
      && section.bloques.every((block) => block && BLOCK_TYPES.has(block.tipo)
        && (block.tipo !== "ejemplo_resuelto" || (Array.isArray(block.verificacion) && block.verificacion.length > 0 && block.verificacion.every((item) => typeof item === "string" && item.trim())))
        && !(block.tipo === "evaluacion" && block.modalidad === "autoevaluacion")));
  }

  function renderCuadernillo(card, anexo, version) {
    const contenido = anexo.contenido;
    const isValid = version === "v2" ? isRenderableV2(contenido) : isRenderableV3(contenido);
    if (!isValid) return renderSafeError(card, INVALID_V2_MESSAGE);
    const typeMeta = window.CuadernilloTypes.get(anexo.tipo_cuadernillo);
    const sortedSections = [...contenido.secciones].sort((a, b) => a.orden - b.orden);
    const subject = version === "v2" ? contenido.datos_generales?.asignatura?.valor || anexo.materia || "" : anexo.materia || "";
    const topic = version === "v2" ? contenido.datos_generales?.tema?.valor || anexo.tema || "" : anexo.tema || "";
    const metadata = [subject && `Asignatura: ${subject}`, topic && `Tema: ${topic}`].filter(Boolean);
    setCardMode(card, version);
    card.innerHTML = `<header class="bib-workbook-header"><div class="bib-workbook-header-copy">
      <p class="bib-workbook-eyebrow">MATERIAL PARA ESTUDIANTES</p><p class="bib-workbook-type-label">${safe(typeMeta.label)}</p>
      <h3>${safe(contenido.titulo)}</h3><p class="bib-workbook-description">${safe(contenido.descripcion)}</p>
      ${metadata.length ? `<ul class="bib-workbook-meta" aria-label="Datos del cuadernillo">${metadata.map((item) => `<li>${safe(item)}</li>`).join("")}</ul>` : ""}</div>
      <button type="button" id="bib-anexo-close" class="bib-lista-close" aria-label="Cerrar">X</button></header>
      <div class="bib-workbook-body">${version === "v2" ? renderCuadernilloV2DatosGenerales(contenido.datos_generales) : ""}
        <div class="bib-workbook-sections">${sortedSections.map((section, index) => renderCuadernilloV2Seccion(section, index + 1)).join("")}</div></div>
      <footer class="bib-workbook-footer"><p>Descarga una copia editable e imprimible en formato Word.</p>
        <button type="button" id="bib-anexo-descargar" class="bib-lista-submit">Descargar Word</button></footer>`;
    bindClose();
    document.getElementById("bib-anexo-descargar")?.addEventListener("click", () => window.AnexoDownload.request(anexo));
  }

  function renderAnexoV1(card, anexo) {
    setCardMode(card, "v1");
    const contenido = anexo.contenido || {};
    const titulo = contenido.titulo_general || anexo.titulo || "Anexos";
    const descripcion = contenido.descripcion || "";
    const listaAnexos = Array.isArray(contenido.anexos) ? contenido.anexos : [];
    function renderAnexoBlock(item) {
      let html = `<div style="margin-bottom:1.5rem;"><p style="font-weight:700; font-size:0.75rem; letter-spacing:0.08em; text-transform:uppercase; color:#64748b; margin-bottom:2px;">ANEXO ${item.numero || ""}</p>`;
      html += `<h4 style="font-size:1rem; font-weight:700; color:#1e293b; margin-bottom:6px;">${safe(item.titulo || "")}</h4>`;
      if (item.instrucciones) html += `<p style="font-style:italic; color:#475569; margin-bottom:10px; font-size:0.875rem;"><em>Instrucciones:</em> ${safe(item.instrucciones)}</p>`;
      if (Array.isArray(item.contenido)) {
        for (const block of item.contenido) {
          if (block.subtitulo) html += `<p style="font-weight:600; color:#334155; margin-top:10px; margin-bottom:4px;">${safe(block.subtitulo)}</p>`;
          if (block.texto) html += `<p style="color:#475569; margin-bottom:6px; font-size:0.875rem;">${safe(block.texto)}</p>`;
          if (Array.isArray(block.preguntas) && block.preguntas.length) html += `<ol style="padding-left:1.25rem; margin-bottom:6px;">${block.preguntas.map((question) => `<li style="color:#475569; font-size:0.875rem; margin-bottom:3px;">${safe(question)}</li>`).join("")}</ol>`;
        }
      }
      if (item.tabla && Array.isArray(item.tabla.columnas) && Array.isArray(item.tabla.filas)) {
        html += `<div style="overflow-x:auto; margin-top:8px;"><table style="border-collapse:collapse; width:100%; font-size:0.8125rem;"><thead><tr>${item.tabla.columnas.map((column) => `<th style="border:1px solid #cbd5e1; background:#f1f5f9; padding:5px 8px; text-align:left; font-weight:600;">${safe(column)}</th>`).join("")}</tr></thead><tbody>`;
        html += item.tabla.filas.map((row) => `<tr>${(Array.isArray(row) ? row : []).map((cell) => `<td style="border:1px solid #cbd5e1; padding:5px 8px;">${safe(cell || "")}</td>`).join("")}</tr>`).join("") + `</tbody></table></div>`;
      }
      return `${html}</div>`;
    }
    const bodyHtml = listaAnexos.length ? listaAnexos.map(renderAnexoBlock).join('<hr style="border:none; border-top:1px solid #e2e8f0; margin:1rem 0;">') : `<p style="color:#94a3b8; font-size:0.875rem;">Este anexo no tiene contenido.</p>`;
    card.innerHTML = `<div class="bib-anexo-head" style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding-bottom:0.75rem; border-bottom:1px solid #e2e8f0; margin-bottom:1rem;"><div>
      <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#0891b2; margin-bottom:2px;">MATERIAL PARA ALUMNOS</p>
      <h3 style="font-size:1.125rem; font-weight:700; color:#1e293b;">${safe(titulo)}</h3>${descripcion ? `<p style="font-size:0.8125rem; color:#64748b; margin-top:2px;">${safe(descripcion)}</p>` : ""}
      ${anexo.materia || anexo.nivel ? `<p style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">${[anexo.materia, anexo.nivel, anexo.tema].filter(Boolean).map(safe).join(" · ")}</p>` : ""}</div>
      <button type="button" id="bib-anexo-close" class="bib-lista-close" style="flex-shrink:0;">X</button></div>
      <div class="bib-anexo-body" style="overflow-y:auto; max-height:45vh; padding-right:4px;">${bodyHtml}</div>
      <div style="display:flex; justify-content:flex-end; padding-top:0.75rem; border-top:1px solid #e2e8f0; margin-top:0.75rem;"><button type="button" id="bib-anexo-descargar" class="bib-lista-submit" data-anexo-id="${safe(String(anexo.id))}">Descargar Word</button></div>`;
    bindClose();
    document.getElementById("bib-anexo-descargar")?.addEventListener("click", async () => {
      const suggested = window.AppUI.buildDownloadSuggestedName("Anexo", anexo.tema || anexo.titulo);
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;
      closeBibliotecaAnexoModal();
      window.AnexoDownload.download(anexo, filename);
    });
  }

  function renderBibliotecaAnexoModal(anexo) {
    const { card } = getPreviewParts();
    if (!card) return;
    const version = detectAnexoSchemaVersion(anexo);
    if (version === "v1") return renderAnexoV1(card, anexo);
    if (version === "v2" || version === "v3") return renderCuadernillo(card, anexo, version);
    return renderSafeError(card, UNKNOWN_VERSION_MESSAGE);
  }

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    const modal = document.getElementById("biblioteca-anexo-modal");
    if (modal && !modal.classList.contains("hidden")) closeBibliotecaAnexoModal();
  });

  window.AnexoPreview = { open: openBibliotecaAnexoPreview, render: renderBibliotecaAnexoModal, close: closeBibliotecaAnexoModal, detectSchemaVersion: detectAnexoSchemaVersion };
})();
