(function () {
  function formatExamDate(value) {
    const parsed = value ? new Date(value) : null;
    if (!parsed || Number.isNaN(parsed.getTime())) return "";

    return parsed.toLocaleString("es-MX", {
      dateStyle: "short",
      timeStyle: "short"
    });
  }

  function syncExamPreviewBodyScrollLock() {
    if (!document.body) return;
    const explorerState = window.explorerState;
    const entityModalOpen = !document.getElementById("entity-modal")?.classList.contains("hidden");

    document.body.classList.toggle(
      "overflow-hidden",
      explorerState.quickCreate.open || explorerState.confirmDelete.open || explorerState.examModal.open || explorerState.examPreview.open || explorerState.listaCotejoModal.open || explorerState.listaCotejoPreview.open || entityModalOpen
    );
  }

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

  function renderExamAnswerSheetPreviewItem(question, index) {
    const answerLines = buildExamAnswerLines(question);
    const answerHtml = answerLines.length > 1
      ? `<div class="mt-2 space-y-1 text-sm text-emerald-900">${answerLines.map((line) => `<p>${escapeHtml(line)}</p>`).join("")}</div>`
      : `<p class="mt-2 text-sm font-semibold text-emerald-900">${escapeHtml(answerLines[0] || "Sin respuesta disponible.")}</p>`;

    return `
    <article class="rounded-2xl border border-emerald-200 bg-white/90 p-4">
      <p class="text-sm font-semibold text-slate-900">Pregunta ${index + 1}</p>
      <p class="mt-2 text-sm text-slate-700">${escapeHtml(question?.pregunta || "")}</p>
      <p class="mt-3 text-xs font-semibold uppercase tracking-wide text-emerald-700">Respuesta correcta</p>
      ${answerHtml}
    </article>
  `;
  }

  function renderExamAnswerSheetPreviewSection(examen) {
    const preguntas = Array.isArray(examen?.examen_ia?.preguntas) ? examen.examen_ia.preguntas : [];
    if (preguntas.length === 0) return "";

    return `
    <section class="border-t border-dashed border-slate-300 pt-6">
      <div class="rounded-3xl border border-emerald-200 bg-emerald-50/50 p-4 sm:p-5">
        <p class="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-700">Seccion final</p>
        <h4 class="mt-2 text-lg font-semibold text-slate-900">Hoja de respuestas</h4>
        <p class="mt-1 text-sm text-slate-600">Incluye cada pregunta con su respuesta correcta.</p>
        <div class="mt-4 space-y-3">
          ${preguntas.map((question, index) => renderExamAnswerSheetPreviewItem(question, index)).join("")}
        </div>
      </div>
    </section>
  `;
  }

  function renderExamQuestionPreview(question, index) {
    const opciones = Array.isArray(question?.opciones) ? question.opciones : [];
    const pares = Array.isArray(question?.pares) ? question.pares : [];
    const elementos = Array.isArray(question?.elementos) ? question.elementos : [];

    const opcionesHtml = opciones.length > 0
      ? question?.tipo === "verdadero_falso"
        ? `<ul class="mt-2 list-none space-y-1 pl-0 text-sm text-slate-600">${opciones.map((item, oi) => `<li class="flex items-start gap-2"><span>${oi + 1}.&nbsp;&nbsp;${escapeHtml(item)}</span></li>`).join("")}</ul>`
        : `<ul class="mt-2 list-none space-y-1 pl-0 text-sm text-slate-600">${opciones.map((item) => `<li class="flex items-start gap-2"><span>${escapeHtml(item)}</span></li>`).join("")}</ul>`
      : "";
    const seed = getStringSeed(question?.pregunta || "");
    const ladoB = shuffleArrayDeterministic(pares.map((p) => p.lado_b || ""), seed);
    const paresHtml = pares.length > 0
      ? `<div class="mt-2 flex gap-10 text-sm text-slate-600">
        <div class="space-y-2">${pares.map((pair, pi) => `<p>${pi + 1}.&nbsp;&nbsp;${escapeHtml(pair.lado_a || "")}</p>`).join("")}</div>
        <div class="space-y-2">${ladoB.map((b, bi) => `<p>${String.fromCharCode(65 + bi)}.&nbsp;&nbsp;${escapeHtml(b)}</p>`).join("")}</div>
      </div>`
      : "";
    const elementosShuffled = shuffleArrayDeterministic(elementos, seed);
    const elementosHtml = elementosShuffled.length > 0
      ? `<ol class="mt-2 space-y-1 pl-0 text-sm text-slate-600 list-none">${elementosShuffled.map((item, ei) => `<li>${ei + 1}.&nbsp;&nbsp;${escapeHtml(item)}</li>`).join("")}</ol>`
      : "";

    return `
    <article class="rounded-2xl border border-slate-200 bg-white p-4">
      <p class="text-sm font-semibold text-slate-900">Pregunta ${index + 1}</p>
      <p class="mt-2 text-sm text-slate-700">${escapeHtml(question?.pregunta || "")}</p>
      ${opcionesHtml}
      ${paresHtml}
      ${elementosHtml}
    </article>
  `;
  }

  function render() {
    const explorerState = window.explorerState;
    const modal = document.getElementById("unit-exam-preview-modal");
    const title = document.getElementById("unit-exam-preview-title");
    const meta = document.getElementById("unit-exam-preview-meta");
    const body = document.getElementById("unit-exam-preview-body");
    const error = document.getElementById("unit-exam-preview-error");
    const download = document.getElementById("unit-exam-preview-download");
    const close = document.getElementById("unit-exam-preview-close");

    if (!modal || !title || !meta || !body || !error || !download || !close) return;

    const state = explorerState.examPreview;
    const examen = state.examenId ? explorerState.examenDetalleById[state.examenId] : null;

    modal.classList.toggle("hidden", !state.open);
    syncExamPreviewBodyScrollLock();

    if (!state.open) {
      error.classList.add("hidden");
      error.textContent = "";
      body.innerHTML = "";
      meta.textContent = "";
      return;
    }

    title.textContent = examen?.titulo || "Vista previa del examen";
    meta.textContent = examen?.created_at
      ? `${formatExamDate(examen.created_at)} · ${Array.isArray(examen?.examen_ia?.preguntas) ? examen.examen_ia.preguntas.length : (examen.total_preguntas || 0)} pregunta(s)`
      : "";

    if (state.error) {
      error.classList.remove("hidden");
      error.textContent = state.error;
    } else {
      error.classList.add("hidden");
      error.textContent = "";
    }

    if (state.loading) {
      body.innerHTML = '<p class="text-sm text-slate-500">Cargando examen...</p>';
    } else if (!examen?.examen_ia?.preguntas?.length) {
      body.innerHTML = '<p class="text-sm text-slate-500">No hay contenido disponible para este examen.</p>';
    } else {
      body.innerHTML = `
      <div class="space-y-4">
        ${examen.examen_ia?.instrucciones_generales ? `<div class="rounded-2xl border border-cyan-200 bg-cyan-50 px-4 py-3 text-sm text-cyan-900">${escapeHtml(examen.examen_ia.instrucciones_generales)}</div>` : ""}
        ${examen.examen_ia.preguntas.map((question, index) => renderExamQuestionPreview(question, index)).join("")}
        ${renderExamAnswerSheetPreviewSection(examen)}
      </div>
    `;
    }

    download.disabled = state.loading || !examen?.examen_ia;
    close.disabled = state.loading;
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

  function formatFetchError(error, fallbackMessage) {
    if (!error) return fallbackMessage;
    if (typeof error.message === "string" && error.message.trim()) return error.message;
    return fallbackMessage;
  }

  async function open(examenId) {
    const explorerState = window.explorerState;
    explorerState.examPreview = {
      open: true,
      examenId,
      loading: true,
      error: ""
    };
    render();

    try {
      await ensureExamenDetalle(examenId);
      explorerState.examPreview.loading = false;
      render();
    } catch (error) {
      explorerState.examPreview.loading = false;
      explorerState.examPreview.error = formatFetchError(error, "No se pudo cargar el examen.");
      render();
    }
  }

  async function openBiblioteca(examenId) {
    const explorerState = window.explorerState;
    if (!explorerState) return;

    console.debug("[preview] exam:open", { examenId });

    explorerState.examPreview = { open: true, examenId, loading: true, error: "" };
    render();

    try {
      const examen = await window.obtenerExamenDetalle(examenId);
      explorerState.examenDetalleById = explorerState.examenDetalleById || {};
      explorerState.examenDetalleById[examenId] = examen;
      explorerState.examPreview.loading = false;
      render();
    } catch (error) {
      console.error("[preview] exam:error", { examenId, message: error?.message });
      explorerState.examPreview.loading = false;
      explorerState.examPreview.error   = "No se pudo cargar el examen.";
      render();
    }
  }

  function close() {
    const explorerState = window.explorerState;
    if (explorerState.examPreview.loading) return;
    explorerState.examPreview = { open: false, examenId: null, loading: false, error: "" };
    render();
  }

  // Compatibilidad temporal: conserva la firma pública y los consumidores del dashboard/Biblioteca.
  // Motivo: mantener la API global durante la extracción.
  // Consumidores actuales: renderAll(), Biblioteca y el explorador jerárquico.
  // Condición para retirarlo: búsqueda global sin consumidores de window.renderExamPreviewModal.
  // Fase prevista de retiro: Fase 10.
  function renderExamPreviewModal() {
    return window.ExamPreview.render();
  }

  // Compatibilidad temporal: conserva la apertura usada por el explorador histórico.
  // Motivo: mantener la firma local durante la extracción del preview.
  // Consumidores actuales: handleContentClick del explorador jerárquico.
  // Condición para retirarlo: retiro separado del consumidor legacy confirmado.
  // Fase prevista de retiro: Fase 8-9.
  async function openExamPreview(examenId) {
    return window.ExamPreview.open(examenId);
  }

  // Compatibilidad temporal: conserva la firma pública de cierre del modal.
  // Motivo: mantener listeners y Escape sin cambiar el flujo de cierre.
  // Consumidores actuales: listeners de Dashboard y compatibilidad global.
  // Condición para retirarlo: búsqueda global sin consumidores de window.closeExamPreviewModal.
  // Fase prevista de retiro: Fase 10.
  function closeExamPreviewModal() {
    return window.ExamPreview.close();
  }

  window.ExamPreview = {
    render,
    open,
    openBiblioteca,
    close
  };
  window.renderExamPreviewModal = renderExamPreviewModal;
  window.openExamPreview = openExamPreview;
  window.closeExamPreviewModal = closeExamPreviewModal;
})();
