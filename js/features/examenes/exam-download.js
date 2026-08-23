(function () {
  function getStringSeed(str) {
    let hash = 0;
    const s = typeof str === "string" ? str : "";
    for (let i = 0; i < s.length; i++) {
      hash = ((hash << 5) - hash + s.charCodeAt(i)) | 0;
    }
    return Math.abs(hash) || 1;
  }

  function shuffleArrayDeterministic(arr, seed) {
    const a = [...arr];
    let s = seed;
    for (let i = a.length - 1; i > 0; i--) {
      s = (s * 1664525 + 1013904223) & 0xffffffff;
      const j = Math.abs(s) % (i + 1);
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function normalizeExamAnswerScalar(value) {
    if (typeof value === "string") return value.trim();
    if (typeof value === "number" || typeof value === "boolean") return String(value);
    return "";
  }

  function normalizeExamComparableText(value) {
    return normalizeExamAnswerScalar(value)
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  }

  function getExamCorrectOptionAnswerText(question, answerText) {
    const normalizedAnswer = normalizeExamComparableText(answerText);
    const options = Array.isArray(question?.opciones) ? question.opciones : [];
    const optionIndex = options.findIndex((option) => normalizeExamComparableText(option) === normalizedAnswer);

    return answerText;
  }

  function buildExamAnswerLines(question) {
    const respuestaCorrecta = question?.respuesta_correcta;

    if (Array.isArray(respuestaCorrecta)) {
      return respuestaCorrecta.map((item, index) => {
        if (item && typeof item === "object" && !Array.isArray(item)) {
          const left = normalizeExamAnswerScalar(item.lado_a);
          const right = normalizeExamAnswerScalar(item.lado_b);

          if (left || right) {
            return [left, right].filter(Boolean).join(" - ");
          }

          const objectValues = Object.values(item)
            .map((value) => normalizeExamAnswerScalar(value))
            .filter(Boolean);
          return objectValues.join(" - ");
        }

        const value = normalizeExamAnswerScalar(item);
        return value ? `${index + 1}. ${value}` : "";
      }).filter(Boolean);
    }

    const answerText = normalizeExamAnswerScalar(respuestaCorrecta);
    if (!answerText) return [];

    if (question?.tipo === "opcion_multiple" || question?.tipo === "verdadero_falso") {
      return [getExamCorrectOptionAnswerText(question, answerText)];
    }

    return [answerText];
  }

  async function ensureExamenDetalle(examenId, { force = false } = {}) {
    const explorerState = window.explorerState;
    if (!examenId) return null;
    if (!force && explorerState.examenDetalleById[examenId]) {
      return explorerState.examenDetalleById[examenId];
    }

    const examen = await window.obtenerExamenDetalle(examenId);
    explorerState.examenDetalleById[examenId] = examen;
    return examen;
  }

  function buildExamWordHtml(examen) {
    const examenIa = examen?.examen_ia || {};
    const preguntas = Array.isArray(examenIa.preguntas) ? examenIa.preguntas : [];

    const preguntasHtml = preguntas.map((question, index) => {
      const opciones = Array.isArray(question?.opciones) ? question.opciones : [];
      const pares = Array.isArray(question?.pares) ? question.pares : [];
      const elementos = Array.isArray(question?.elementos) ? question.elementos : [];

      const opcionesHtml = opciones.length > 0
        ? question?.tipo === "verdadero_falso"
          ? `<div class="options">${opciones.map((item, oi) => `<p>${oi + 1}.&nbsp;&nbsp;${escapeHtml(item)}</p>`).join("")}</div>`
          : `<div class="options">${opciones.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}</div>`
        : "";
      const exportSeed = getStringSeed(question?.pregunta || "");
      const exportLadoB = shuffleArrayDeterministic(pares.map((p) => p.lado_b || ""), exportSeed);
      const paresHtml = pares.length > 0
        ? `<table class="match-table">
          <thead><tr><th>Columna A</th><th class="match-gap"></th><th>Columna B</th></tr></thead>
          <tbody>${pares.map((pair, pi) => `<tr>
            <td class="match-col">${pi + 1}.&nbsp;&nbsp;${escapeHtml(pair.lado_a || "")}</td>
            <td class="match-gap"></td>
            <td class="match-col">${String.fromCharCode(65 + pi)}.&nbsp;&nbsp;${escapeHtml(exportLadoB[pi] || "")}</td>
          </tr>`).join("")}</tbody>
        </table>`
        : "";
      const exportElementos = shuffleArrayDeterministic(elementos, exportSeed);
      const elementosHtml = exportElementos.length > 0
        ? `<ol>${exportElementos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
        : "";

      return `
      <div class="question-block">
        <p><strong>${index + 1}.</strong> ${escapeHtml(question?.pregunta || "")}</p>
        ${opcionesHtml}
        ${paresHtml}
        ${elementosHtml}
      </div>
    `;
    }).join("");

    const answerSheetHtml = preguntas.length > 0
      ? `
      <section class="answer-sheet">
        <h2>Hoja de respuestas</h2>
        <p class="answer-sheet-copy">Incluye cada pregunta con su respuesta correcta.</p>
        ${preguntas.map((question, index) => {
          const answerLines = buildExamAnswerLines(question);
          const answerHtml = answerLines.length > 1
            ? `<div class="answer-values">${answerLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>`
            : `<p class="answer-values">${escapeHtml(answerLines[0] || "Sin respuesta disponible.")}</p>`;

          return `
            <div class="answer-item">
              <p><strong>${index + 1}.</strong> ${escapeHtml(question?.pregunta || "")}</p>
              <p class="answer-label"><strong>Respuesta correcta:</strong></p>
              ${answerHtml}
            </div>
          `;
        }).join("")}
      </section>
    `
      : "";

    return `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; color: #0f172a; }
          h1 { text-align: center; margin-bottom: 10px; }
          h2 { margin: 0 0 12px; font-size: 15pt; }
          .student-info { margin: 8px 0 18px; font-size: 11pt; }
          .box { border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; margin-bottom: 16px; background: #f8fafc; }
          .question-block { margin-bottom: 18px; }
          .options { margin: 10px 0 0 28px; }
          .options p { margin: 6px 0; }
          .answer-sheet { page-break-before: always; margin-top: 28px; padding-top: 18px; border-top: 2px solid #cbd5e1; }
          .answer-sheet-copy { margin-bottom: 14px; color: #475569; }
          .answer-item { margin-bottom: 16px; }
          .answer-label { margin: 8px 0 4px; }
          .answer-values { margin-left: 18px; }
          .answer-values p { margin: 4px 0; }
          p { margin: 6px 0; }
          ul, ol { margin: 8px 0 0 22px; }
          .match-table { width: 100%; border-collapse: collapse; margin: 10px 0 0 28px; }
          .match-table th { text-align: left; font-size: 9pt; color: #475569; font-weight: normal; padding-bottom: 4px; border: none; background: none; }
          .match-table td { border: none; padding: 5px 0; vertical-align: top; }
          .match-col { width: 38%; }
          .match-gap { width: 24%; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(examenIa.titulo || examen?.titulo || "Examen de unidad")}</h1>
        <p class="student-info">Nombre del alumno: __________________________________&nbsp;&nbsp;&nbsp;&nbsp;Fecha: __________</p>
        ${examenIa.instrucciones_generales ? `<div class="box"><strong>Instrucciones:</strong><br>${escapeHtml(examenIa.instrucciones_generales)}</div>` : ""}
        ${preguntasHtml}
        ${answerSheetHtml}
      </body>
    </html>
  `;
  }

  async function download(examenId, filenameOverride) {
    const examen = await ensureExamenDetalle(examenId);
    if (!examen?.examen_ia) {
      throw new Error("No hay contenido disponible para exportar.");
    }

    const html = buildExamWordHtml(examen);
    const blob = new Blob([html], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const enlace = document.createElement("a");
    enlace.href = url;
    const defaultName = (examen.titulo || "Examen_unidad").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Examen_unidad";
    enlace.download = `${filenameOverride || defaultName}.doc`;
    document.body.appendChild(enlace);
    enlace.click();
    document.body.removeChild(enlace);
    URL.revokeObjectURL(url);
  }

  async function downloadFromBiblioteca(examenId) {
    console.debug("[downloads] exam:start", { examenId });
    try {
      const conjunto = bibliotecaState.conjuntos.find(c =>
        Array.isArray(c.examenes) &&
        c.examenes.some(e => normalizeBibliotecaId(e.id) === normalizeBibliotecaId(examenId))
      );
      const suggested = window.AppUI.buildDownloadSuggestedName(
        "Examen",
        conjunto?.titulo || ""
      );
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;

      await download(examenId, filename);
      console.debug("[downloads] exam:success", { examenId });
    } catch (error) {
      console.error("[downloads] exam:error", { examenId, message: error?.message });
    }
  }

  window.ExamDownload = {
    download,
    downloadFromBiblioteca
  };
})();
