// =========================================================
// Biblioteca de materiales — biblioteca.page.js
// Vista principal: conjuntos de planeaciones (planeacion_batches)
// =========================================================

const BIB_EXAM_GENERIC_FAILURE_MESSAGE = "No se pudo completar la generacion del examen. Intenta nuevamente.";

const bibliotecaState = {
  conjuntos: [],
  loading: false,
  error: "",
  searchQuery: "",
  selectedConjuntoId: null,
  expandedIds: new Set(),
  activeTab: {},          // { [conjuntoId]: "planeaciones" | "examenes" | "listas" | "anexos" }
  pendingBatchId: null,

  // Progress shown inline in cards (not inside modals)
  pendingConjunto: null,               // { tempId, titulo } — temp card during quick-create
  pendingPlaneacionesByBatchId: {},    // { [batchId]: { items:[{titulo,status,message}], error } }
  pendingExamenByBatchId: {},          // { [batchId]: { message, error } }
  pendingListaByBatchId: {},           // { [batchId]: { message, result, error } }
  // { [batchId]: { [planeacionId]: { titulo, materia, nivel, status: "generating"|"error", errorMessage } } }
  anexosGenerating: {},

  anexoModal: {
    open: false,
    conjuntoId: null,
    planeaciones: [],
    selectedPlaneacionIds: [],
    submitting: false,
    error: ""
  },

  examModal: {
    open: false,
    conjuntoId: null,
    unidadId: null,
    planeaciones: [],
    selectedPlaneacionIds: [],  // ids checked by user
    selectedTypes: [],
    questionCounts: {},
    submitting: false,
    error: ""
  },

  listaModal: {
    open: false,
    conjuntoId: null,
    planeaciones: [],
    selectedPlaneacionIds: [],  // ids checked by user
    submitting: false,
    error: ""
  },

  agregarModal: {
    open: false,
    conjuntoId: null,
    unidadId: null,
    materia: "",
    nivel: "",
    unidad: null,
    temas: [],  // [{ localId, titulo, duracion, actividades_momentos }]
    error: ""
    // generating/progress/done removed — progress tracked in pendingPlaneacionesByBatchId
  }
};

// Fase 5 — Sesión 5.1: ownership léxico de la selección vigente de Biblioteca.
// La única fuente de verdad permanece en bibliotecaState.selectedConjuntoId.
// Estas operaciones no normalizan ni reinterpretan valores: cada consumidor
// conserva exactamente su normalización y fallback previos.
const BibliotecaSelection = {
  getSelectedConjuntoId() {
    return bibliotecaState.selectedConjuntoId;
  },
  setSelectedConjuntoId(value) {
    bibliotecaState.selectedConjuntoId = value;
    return value;
  }
};

// Fase 5 — Sesión 5.2: ownership léxico del tab activo por bloque.
// La única fuente de verdad permanece en bibliotecaState.activeTab.
// Estas operaciones no normalizan claves, validan tabs ni aplican fallback:
// cada consumidor conserva exactamente sus expresiones y orden previos.
const BibliotecaTabs = {
  getActiveTab(conjuntoId) {
    return bibliotecaState.activeTab[conjuntoId];
  },
  setActiveTab(conjuntoId, tab) {
    bibliotecaState.activeTab[conjuntoId] = tab;
    return tab;
  },
  clearActiveTab(conjuntoId) {
    delete bibliotecaState.activeTab[conjuntoId];
  }
};

// Fase 5 â€” SesiÃ³n 5.3: ownership lÃ©xico del estado del modal de anexos.
// La Ãºnica fuente de verdad permanece en bibliotecaState.anexoModal.
// Estas operaciones conservan el reemplazo total y las mutaciones parciales
// previas sin normalizar, validar ni limpiar valores adicionales.
const BibliotecaAnexoModalState = {
  getState() {
    return bibliotecaState.anexoModal;
  },
  open(state) {
    bibliotecaState.anexoModal = state;
    return state;
  },
  close() {
    bibliotecaState.anexoModal.open = false;
  },
  setSelectedPlaneacionIds(ids) {
    bibliotecaState.anexoModal.selectedPlaneacionIds = ids;
    return ids;
  },
  addSelectedPlaneacionId(id) {
    bibliotecaState.anexoModal.selectedPlaneacionIds.push(id);
    return id;
  },
  setSubmitting(value) {
    bibliotecaState.anexoModal.submitting = value;
    return value;
  },
  setError(value) {
    bibliotecaState.anexoModal.error = value;
    return value;
  }
};

// Superficie pública para comunicación entre scripts
window.biblioteca = {
  get pendingBatchId() { return bibliotecaState.pendingBatchId; },
  set pendingBatchId(v) { bibliotecaState.pendingBatchId = v; },
  getConjuntos: () => Array.isArray(bibliotecaState.conjuntos) ? bibliotecaState.conjuntos : [],
  selectConjunto: (conjuntoId, options = {}) => {
    setSelectedConjunto(conjuntoId, { tab: options.tab || "planeaciones" });
    updateBibliotecaSidebarActive();
    renderBibliotecaDetailInPlace();
  },
  startPlaneacionesGeneration: (conjuntoId, temas = []) => {
    const safeId = normalizeBibliotecaId(conjuntoId);
    if (!safeId) return;
    setSelectedConjunto(safeId, { tab: "planeaciones" });
    bibliotecaState.pendingPlaneacionesByBatchId[safeId] = {
      items: (Array.isArray(temas) ? temas : []).map((tema) => ({
        titulo: tema?.titulo || "",
        status: "pending",
        message: ""
      })),
      error: ""
    };
    renderBibliotecaContent();
  },
  setPendingConjunto: (data) => {
    const tempId = data.tempId || `tmp-${Date.now()}`;
    bibliotecaState.pendingConjunto = {
      id:                  tempId,
      tempId,
      isPending:           true,
      status_ui:           "generating",
      titulo:              data.titulo  || "Nuevo bloque",
      nivel:               data.nivel   || "",
      materia:             data.materia || "",
      unidad:              data.unidad  || null,
      created_at:          null,
      total_planeaciones:  0,
      total_examenes:      0,
      total_listas_cotejo: 0,
      planeaciones:        [],
      examenes:            [],
      listas_cotejo:       []
    };
    BibliotecaSelection.setSelectedConjuntoId(tempId);
    BibliotecaTabs.setActiveTab(tempId, "planeaciones");
  },
  refresh: (options = {}) => loadAndRenderBiblioteca(options),
  finishPlaneacionesGeneration: (result) => finishBibliotecaPlaneacionesGeneration(result)
};

// Tipos de pregunta para el modal de examen
const BIB_EXAM_TIPOS = [
  { value: "opcion_multiple",           label: "Opcion multiple", defaultCount: 5 },
  { value: "verdadero_falso",           label: "Verdadero/Falso", defaultCount: 5 },
  { value: "respuesta_corta",           label: "Respuesta corta / completar", defaultCount: 3 },
  { value: "emparejamiento",            label: "Emparejamiento / relacion de columnas", defaultCount: 1 },
  { value: "pregunta_abierta",          label: "Pregunta abierta / ensayo", defaultCount: 1 },
  { value: "calculo_numerico",          label: "Calculo / numerica", defaultCount: 3 },
  { value: "ordenacion_jerarquizacion", label: "Ordenacion / jerarquizacion", defaultCount: 1 }
];

// ---- HELPERS ----

function bibFormatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric"
    });
  } catch { return ""; }
}

function bibFormatDateTime(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch { return ""; }
}

function bibFormatShortDateTime(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "numeric",
      minute: "2-digit"
    });
  } catch { return ""; }
}

function formatBibliotecaDisplayText(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.charAt(0).toLocaleUpperCase("es-MX") + text.slice(1);
}

function escapeBibliotecaDisplayText(value, fallback = "") {
  return escapeHtml(formatBibliotecaDisplayText(value) || fallback);
}

function isBibliotecaTechnicalUnidad(value) {
  const normalized = String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return normalized === "bloque de planeacion";
}

function getFilteredConjuntos() {
  const q = bibliotecaState.searchQuery.trim().toLowerCase();
  if (!q) return bibliotecaState.conjuntos;
  return bibliotecaState.conjuntos.filter(c =>
    (c.titulo   || "").toLowerCase().includes(q) ||
    (c.materia  || "").toLowerCase().includes(q) ||
    (c.nivel    || "").toLowerCase().includes(q) ||
    String(c.unidad || "").toLowerCase().includes(q)
  );
}

function findConjuntoById(id) {
  const safeId = normalizeBibliotecaId(id);
  if (!safeId) return null;
  if (normalizeBibliotecaId(bibliotecaState.pendingConjunto?.id) === safeId) {
    return bibliotecaState.pendingConjunto;
  }
  return bibliotecaState.conjuntos.find(c => normalizeBibliotecaId(c.id) === safeId) || null;
}

function normalizeBibliotecaId(value) {
  if (value === undefined || value === null) return "";
  return String(value);
}

function getGenerationBatchId(result) {
  return normalizeBibliotecaId(result?.batch_id || result?.batchId);
}

function getAllConjuntosForSidebar() {
  const pending = bibliotecaState.pendingConjunto;
  const list = Array.isArray(bibliotecaState.conjuntos) ? bibliotecaState.conjuntos : [];
  if (!pending) return list;

  const pendingId = normalizeBibliotecaId(pending.id);
  const withoutDuplicate = list.filter(c => normalizeBibliotecaId(c.id) !== pendingId);
  return [pending, ...withoutDuplicate];
}

function getFilteredConjuntosForSidebar() {
  const q = bibliotecaState.searchQuery.trim().toLowerCase();
  const list = getAllConjuntosForSidebar();
  if (!q) return list;
  return list.filter(c =>
    (c.titulo   || "").toLowerCase().includes(q) ||
    (c.materia  || "").toLowerCase().includes(q) ||
    (c.nivel    || "").toLowerCase().includes(q) ||
    String(c.unidad || "").toLowerCase().includes(q)
  );
}

function setSelectedConjunto(conjuntoId, { tab } = {}) {
  const safeId = normalizeBibliotecaId(conjuntoId);
  if (!safeId) return;
  BibliotecaSelection.setSelectedConjuntoId(safeId);
  if (tab) {
    BibliotecaTabs.setActiveTab(safeId, tab);
  } else if (!BibliotecaTabs.getActiveTab(safeId)) {
    BibliotecaTabs.setActiveTab(safeId, "planeaciones");
  }
}

function getSelectedConjunto() {
  return findConjuntoById(BibliotecaSelection.getSelectedConjuntoId());
}

function normalizeGeneratedPlaneaciones(result) {
  if (Array.isArray(result?.planeaciones)) return result.planeaciones;

  const records = [];
  if (Array.isArray(result?.resultados)) records.push(...result.resultados);
  if (Array.isArray(result?.results)) records.push(...result.results);

  return records
    .filter(item => item?.planeacion_id)
    .map(item => ({
      id: item.planeacion_id,
      tema_id: item.tema_id || null,
      tema: item.titulo || item.tema || "Planeacion",
      duracion: item.duracion || null,
      status: item.status || "ready",
      batch_id: result?.batch_id || null
    }));
}

function mergePlaneaciones(existing, incoming) {
  const byId = new Map();
  (Array.isArray(existing) ? existing : []).forEach(item => {
    const id = normalizeBibliotecaId(item?.id);
    if (id) byId.set(id, item);
  });
  (Array.isArray(incoming) ? incoming : []).forEach(item => {
    const id = normalizeBibliotecaId(item?.id || item?.planeacion_id);
    if (!id) return;
    byId.set(id, {
      ...item,
      id,
      batch_id: item.batch_id || item.batchId || null
    });
  });
  return [...byId.values()];
}

function applyOptimisticPlaneacionesToConjunto(batchId, planeaciones) {
  const safeBatchId = normalizeBibliotecaId(batchId);
  if (!safeBatchId) return;

  const pending = bibliotecaState.pendingConjunto;
  let conjunto = findConjuntoById(safeBatchId);

  if (!conjunto && pending) {
    conjunto = {
      ...pending,
      id: safeBatchId,
      tempId: undefined,
      isPending: false,
      status_ui: "ready",
      batch_id: safeBatchId
    };
    bibliotecaState.conjuntos = [conjunto, ...bibliotecaState.conjuntos];
    bibliotecaState.expandedIds.delete(pending.tempId);
    BibliotecaTabs.clearActiveTab(pending.tempId);
    if (normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === normalizeBibliotecaId(pending.tempId)) {
      BibliotecaSelection.setSelectedConjuntoId(safeBatchId);
    }
    bibliotecaState.pendingConjunto = null;
  }

  if (!conjunto) return;

  conjunto.isPending = false;
  conjunto.status_ui = "ready";
  conjunto.planeaciones = mergePlaneaciones(conjunto.planeaciones, planeaciones || []);
  conjunto.total_planeaciones = conjunto.planeaciones.length;
  BibliotecaSelection.setSelectedConjuntoId(safeBatchId);
  BibliotecaTabs.setActiveTab(safeBatchId, "planeaciones");
}

function applyGenerationResultToPendingItems(batchId, result) {
  const safeBatchId = normalizeBibliotecaId(batchId);
  if (!safeBatchId) return;

  const pending = bibliotecaState.pendingPlaneacionesByBatchId[safeBatchId];
  if (!pending) return;

  const records = [
    ...(Array.isArray(result?.resultados) ? result.resultados : []),
    ...(Array.isArray(result?.results) ? result.results : [])
  ];

  records.forEach((record, index) => {
    const itemIndex = Number.isFinite(Number(record?.index)) ? Number(record.index) - 1 : index;
    const target = pending.items[itemIndex];
    if (!target) return;
    target.status = record.status || "ready";
    target.statusLabel = typeof statusLabelFromTone === "function"
      ? statusLabelFromTone(target.status)
      : target.status;
    target.message = record.message || "";
  });

  if (Number(result?.success_count || 0) > 0) {
    pending.items.forEach(item => {
      if (item.status === "pending" || item.status === "generating") {
        item.status = "ready";
        item.statusLabel = typeof statusLabelFromTone === "function" ? statusLabelFromTone("ready") : "Listo";
      }
    });
  }

  if (Number(result?.error_count || 0) > 0) {
    pending.error = `${result.error_count} planeacion(es) no se pudieron generar.`;
  }
}

async function finishBibliotecaPlaneacionesGeneration(result) {
  const batchId = getGenerationBatchId(result);
  const planeaciones = normalizeGeneratedPlaneaciones(result);

  if (batchId) {
    if (!bibliotecaState.pendingPlaneacionesByBatchId[batchId] && Number(result?.error_count || 0) > 0) {
      const progressItems = Array.isArray(window.explorerState?.progress?.items)
        ? window.explorerState.progress.items
        : [];
      bibliotecaState.pendingPlaneacionesByBatchId[batchId] = {
        items: progressItems.map(item => ({
          titulo: item.titulo || "",
          status: item.status || "pending",
          statusLabel: item.statusLabel || "",
          message: item.message || ""
        })),
        error: `${result.error_count} planeacion(es) no se pudieron generar.`
      };
    }
    applyGenerationResultToPendingItems(batchId, result || {});
    applyOptimisticPlaneacionesToConjunto(batchId, planeaciones);
    if (Number(result?.error_count || 0) === 0) {
      delete bibliotecaState.pendingPlaneacionesByBatchId[batchId];
    }
    BibliotecaSelection.setSelectedConjuntoId(batchId);
    BibliotecaTabs.setActiveTab(batchId, "planeaciones");
  }

  renderBibliotecaContent();

  await loadAndRenderBiblioteca({
    silent: true,
    targetBatchId: batchId,
    activeTab: "planeaciones"
  });
}

// ---- RENDER TABS ----

/**
 * Card estándar de Biblioteca para estados generating/error/skipped/ready.
 * titulo y meta deben ser HTML seguro (ya escapado).
 * opts.errorMessage es texto plano (se escapa aquí).
 */
function renderBibliotecaProgressCard(titulo, meta, status, opts) {
  opts = opts || {};
  const resolvedStatus = (status === "pending" || !status) ? "generating" : status;
  const pill = typeof renderProgressPill === "function"
    ? renderProgressPill(resolvedStatus, resolvedStatus === "generating" ? "Generando" : undefined)
    : `<span>${resolvedStatus}</span>`;
  const rowExtra = resolvedStatus === "generating" ? " bib-item-generating"
    : resolvedStatus === "error"     ? " bib-item-error"
    : "";
  return `
    <div class="biblioteca-item-row${rowExtra}">
      <div class="biblioteca-item-info">
        <span class="biblioteca-item-title">${titulo}</span>
        ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
        ${opts.errorMessage ? `<span class="bib-item-status-msg bib-item-error-msg">${escapeHtml(opts.errorMessage)}</span>` : ""}
      </div>
      <div class="biblioteca-item-actions">${pill}</div>
    </div>`;
}

function renderProgressItemHtml(item) {
  const status   = item.status === "pending" ? "generating" : (item.status || "generating");
  const titulo   = escapeBibliotecaDisplayText(item.titulo);
  const errorMsg = status === "error" ? (item.message || "") : "";
  const meta     = (status !== "error" && item.message) ? escapeHtml(item.message) : "";
  return renderBibliotecaProgressCard(titulo, meta, status, { errorMessage: errorMsg });
}

function renderPendingSpinnerCard(message) {
  return renderBibliotecaProgressCard(escapeHtml(message || "Generando..."), "", "generating");
}

function renderBibliotecaSectionHeader(title, actionHtml = "") {
  return `
    <div class="biblioteca-section-header">
      <h4 class="biblioteca-section-title">${escapeHtml(title)}</h4>
      ${actionHtml ? `<div class="biblioteca-section-actions">${actionHtml}</div>` : ""}
    </div>
  `;
}

function getBibliotecaExamTypeLabel(tipo) {
  const labels = {
    opcion_multiple: "Opcion multiple",
    verdadero_falso: "Verdadero/Falso",
    respuesta_corta: "Respuesta corta / completar",
    completar: "Respuesta corta / completar",
    emparejamiento: "Emparejamiento / relacion de columnas",
    relacion_columnas: "Emparejamiento / relacion de columnas",
    pregunta_abierta: "Pregunta abierta / ensayo",
    ensayo: "Pregunta abierta / ensayo",
    calculo_numerico: "Calculo / Numerica",
    ordenacion_jerarquizacion: "Ordenacion / jerarquizacion",
    ordenacion: "Ordenacion / jerarquizacion"
  };
  return labels[String(tipo || "").trim()] || formatBibliotecaDisplayText(tipo);
}

function getBibliotecaExamTopics(examen) {
  const temas = Array.isArray(examen?.contexto_temas) ? examen.contexto_temas : [];
  return [...new Set(temas.map((tema) => tema?.tema || tema?.titulo).filter(Boolean))];
}

function renderPlaneacionesTab(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  const id = escapeHtml(String(conjunto.id));
  const addButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="agregar-planeacion" data-conjunto-id="${id}">
      + Agregar Tema
    </button>`;

  let pendingHtml = "";
  if (conjunto.isPending) {
    const items = (window.explorerState?.progress?.items) || [];
    if (items.length) {
      pendingHtml = items.map(renderProgressItemHtml).join("");
    } else {
      pendingHtml = renderBibliotecaProgressCard(
        escapeHtml("Preparando generacion..."), "", "generating"
      );
    }
  } else {
    const pending = bibliotecaState.pendingPlaneacionesByBatchId[conjunto.id];
    if (pending) {
      const errorHtml = pending.error
        ? `<div class="mt-1 text-xs text-rose-600">${escapeHtml(pending.error)}</div>`
        : "";
      pendingHtml = pending.items.map(renderProgressItemHtml).join("") + errorHtml;
    }
  }

  if (!planeaciones.length && !pendingHtml) {
    return `
      ${renderBibliotecaSectionHeader("Planeaciones", addButton)}
      <p class="biblioteca-empty-tab">Este bloque no tiene planeaciones.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Planeaciones", addButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${planeaciones.map(p => {
        const titulo   = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
        const duracion = p.duracion ? `${p.duracion} min` : "";
        const fecha    = bibFormatShortDateTime(p.fecha_creacion);
        const meta     = [duracion, fecha].filter(Boolean).join(" &middot; ");
        const pid      = escapeHtml(String(p.id));
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <a href="detalle.html?id=${encodeURIComponent(p.id)}" class="biblioteca-btn-link">Ver</a>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-planeacion"
                data-planeacion-id="${pid}">Descargar</button>
              <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
                data-bib-action="eliminar-planeacion"
                data-planeacion-id="${pid}"
                data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderExamenesTab(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const actionButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="generar-examen" data-conjunto-id="${id}">
      + Generar examen
    </button>`;

  if (conjunto.isPending) {
    return `
      ${renderBibliotecaSectionHeader("Examenes")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear examenes cuando el bloque este listo.</p>
    `;
  }

  const examenes = Array.isArray(conjunto.examenes) ? conjunto.examenes : [];
  const pending  = bibliotecaState.pendingExamenByBatchId[conjunto.id];

  let pendingHtml = "";
  if (pending) {
    const examTitulo = `Examen de ${escapeBibliotecaDisplayText(conjunto.titulo, "Bloque de planeacion")}`;
    const examStatus = pending.error ? "error" : "generating";
    pendingHtml = renderBibliotecaProgressCard(
      examTitulo,
      pending.message ? escapeHtml(pending.message) : "",
      examStatus,
      { errorMessage: pending.error || "" }
    );
  }

  if (!examenes.length && !pending) {
    return `
      ${renderBibliotecaSectionHeader("Examenes", actionButton)}
      <p class="biblioteca-empty-tab">Aun no hay examenes en este bloque.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Examenes", actionButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${examenes.map(ex => {
        const titulo    = `Examen de ${escapeBibliotecaDisplayText(conjunto.titulo, "Bloque de planeacion")}`;
        const preguntas = ex.total_preguntas ? `${ex.total_preguntas} pregunta(s)` : "";
        const fecha     = bibFormatShortDateTime(ex.created_at);
        const tipos     = [...new Set((Array.isArray(ex.tipos_pregunta) ? ex.tipos_pregunta : []).map(getBibliotecaExamTypeLabel).filter(Boolean))].map(escapeHtml).join(" · ");
        const temas     = getBibliotecaExamTopics(ex).map((tema) => escapeBibliotecaDisplayText(tema)).join(" · ");
        const meta      = [fecha, preguntas, tipos, temas ? `Temas: ${temas}` : ""].filter(Boolean).join(" &bull; ");
        const exId      = escapeHtml(String(ex.id));
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="ver-examen"
                data-examen-id="${exId}">Ver</button>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-examen"
                data-examen-id="${exId}">Descargar</button>
              <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
                data-bib-action="eliminar-examen"
                data-examen-id="${exId}"
                data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderAnexosTab(conjunto) {
  const id = escapeHtml(String(conjunto.id));

  const actionButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="abrir-modal-anexos" data-conjunto-id="${id}">
      + Generar anexos
    </button>`;

  if (conjunto.isPending) {
    return `
      ${renderBibliotecaSectionHeader("Anexos")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear anexos cuando el bloque este listo.</p>
    `;
  }

  const anexos         = Array.isArray(conjunto.anexos) ? conjunto.anexos : [];
  const generatingMap  = bibliotecaState.anexosGenerating[conjunto.id] || {};

  const anexosByPlanId = new Map(
    anexos.map((a) => [normalizeBibliotecaId(a.planeacion_id), a])
  );

  // Cards de anexos ya generados
  const realRowsHtml = anexos.map((anexo) => {
    const pid     = normalizeBibliotecaId(anexo.planeacion_id);
    const tema    = escapeBibliotecaDisplayText(anexo.tema, "Sin titulo");
    const titulo  = tema;
    const fecha   = bibFormatShortDateTime(anexo.created_at);
    const meta    = fecha || "";
    const anexoId = escapeHtml(String(anexo.id));
    return `
      <div class="biblioteca-item-row">
        <div class="biblioteca-item-info">
          <span class="biblioteca-item-title">${titulo}</span>
          ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
        </div>
        <div class="biblioteca-item-actions">
          <button type="button" class="biblioteca-btn-link"
            data-bib-action="ver-anexo"
            data-anexo-id="${anexoId}">Ver</button>
          <button type="button" class="biblioteca-btn-link"
            data-bib-action="descargar-anexo"
            data-anexo-id="${anexoId}">Descargar</button>
          <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
            data-bib-action="eliminar-anexo"
            data-anexo-id="${anexoId}"
            data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
        </div>
      </div>`;
  }).join("");

  // Cards temporales para los que están en proceso (excluir los que ya tienen anexo real)
  const tempRowsHtml = Object.entries(generatingMap)
    .filter(([pid]) => !anexosByPlanId.has(pid))
    .map(([pid, item]) => {
      const titulo = escapeBibliotecaDisplayText(item.titulo, "Sin titulo");
      const meta   = [
        escapeBibliotecaDisplayText(item.materia),
        escapeBibliotecaDisplayText(item.nivel)
      ].filter(Boolean).join(" &middot; ");

      if (item.status === "error") {
        return renderBibliotecaProgressCard(titulo, meta, "error", {
          errorMessage: item.errorMessage || "No se pudo generar el anexo."
        });
      }

      return renderBibliotecaProgressCard(titulo, meta, "generating");
    }).join("");

  const hasContent = realRowsHtml || tempRowsHtml;

  if (!hasContent) {
    return `
      ${renderBibliotecaSectionHeader("Anexos", actionButton)}
      <p class="biblioteca-empty-tab">Este bloque todavia no tiene anexos generados.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Anexos", actionButton)}
    <div class="biblioteca-items-list">
      ${realRowsHtml}
      ${tempRowsHtml}
    </div>
  `;
}

function renderListasCotejoTab(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const actionButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="generar-lista" data-conjunto-id="${id}">
      + Generar lista de cotejo
    </button>`;

  if (conjunto.isPending) {
    return `
      ${renderBibliotecaSectionHeader("Listas de cotejo")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear listas de cotejo cuando el bloque este listo.</p>
    `;
  }

  const listas  = Array.isArray(conjunto.listas_cotejo) ? conjunto.listas_cotejo : [];
  const pending = bibliotecaState.pendingListaByBatchId[conjunto.id];

  let pendingHtml = "";
  if (pending) {
    const itemStatus = pending.error ? "error" : "generating";
    const errMsg = pending.error || "";
    if (pending.items && pending.items.length) {
      pendingHtml = pending.items.map(item =>
        renderBibliotecaProgressCard(
          escapeBibliotecaDisplayText(item.titulo, "Lista de cotejo"),
          "",
          itemStatus,
          { errorMessage: errMsg }
        )
      ).join("");
    } else {
      // Fallback si no hay items (compatibilidad con estados guardados sin items)
      pendingHtml = renderBibliotecaProgressCard(
        escapeHtml("Lista de cotejo"),
        "",
        itemStatus,
        { errorMessage: errMsg }
      );
    }
  }

  if (!listas.length && !pending) {
    return `
      ${renderBibliotecaSectionHeader("Listas de cotejo", actionButton)}
      <p class="biblioteca-empty-tab">Aun no hay listas de cotejo en este bloque.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Listas de cotejo", actionButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${listas.map(lista => {
        const titulo  = escapeBibliotecaDisplayText(lista.tema || lista.titulo, "Lista de cotejo");
        const puntos  = lista.total_puntos ? `${lista.total_puntos} puntos` : "";
        const fecha   = bibFormatShortDateTime(lista.created_at);
        const meta    = [puntos, fecha].filter(Boolean).join(" &middot; ");
        const listaId = escapeHtml(String(lista.id));
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="ver-lista"
                data-lista-id="${listaId}">Ver</button>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-lista"
                data-lista-id="${listaId}">Descargar</button>
              <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
                data-bib-action="eliminar-lista"
                data-lista-id="${listaId}"
                data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ---- RENDER CONJUNTO ----

function renderBibliotecaTabs(conjunto) {
  const activeTab = BibliotecaTabs.getActiveTab(conjunto.id) || "planeaciones";
  const id = escapeHtml(String(conjunto.id));
  return `
    <div class="biblioteca-tabs" role="tablist">
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "planeaciones" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="planeaciones">
        Planeaciones <span class="biblioteca-tab-count">${conjunto.total_planeaciones || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "anexos" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="anexos">
        Anexos <span class="biblioteca-tab-count">${conjunto.total_anexos || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "listas" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="listas">
        Listas de cotejo <span class="biblioteca-tab-count">${conjunto.total_listas_cotejo || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "examenes" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="examenes">
        Examenes <span class="biblioteca-tab-count">${conjunto.total_examenes || 0}</span>
      </button>
    </div>
  `;
}

function renderBibliotecaTabContent(conjunto) {
  const activeTab = BibliotecaTabs.getActiveTab(conjunto.id) || "planeaciones";
  return `
    <div class="biblioteca-tab-content">
      ${activeTab === "planeaciones" ? renderPlaneacionesTab(conjunto) : ""}
      ${activeTab === "examenes"     ? renderExamenesTab(conjunto)     : ""}
      ${activeTab === "listas"       ? renderListasCotejoTab(conjunto) : ""}
      ${activeTab === "anexos"       ? renderAnexosTab(conjunto)       : ""}
    </div>
  `;
}

function renderConjuntoSidebarItem(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const isSelected = normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === normalizeBibliotecaId(conjunto.id);
  const isPending = !!conjunto.isPending;
  const titulo = escapeBibliotecaDisplayText(conjunto.titulo, "Sin titulo");
  const meta = [
    conjunto.nivel ? escapeBibliotecaDisplayText(conjunto.nivel) : "Sin nivel",
    conjunto.materia ? escapeBibliotecaDisplayText(conjunto.materia) : "Sin materia"
  ].filter(Boolean).join(" | ");
  const fecha = bibFormatDateTime(conjunto.created_at);
  const planeaciones = Number(conjunto.total_planeaciones || 0);
  const examenes = Number(conjunto.total_examenes || 0);
  const listas = Number(conjunto.total_listas_cotejo || 0);
  const anexos = Number(conjunto.total_anexos || 0);

  return `
    <button type="button"
      class="biblioteca-sidebar-item ${isSelected ? "is-active" : ""} ${isPending ? "is-generating" : ""}"
      data-bib-action="select-conjunto"
      data-conjunto-id="${id}">
      <span class="biblioteca-sidebar-item-main">
        <span class="biblioteca-sidebar-title">${titulo}</span>
        <span class="biblioteca-sidebar-meta">${meta || "Sin datos"}</span>
        <span class="biblioteca-sidebar-date">${fecha || (isPending ? "Generando" : "")}</span>
        <span class="biblioteca-sidebar-counts">
          ${planeaciones} planeaciones · ${examenes} examenes · ${listas} listas · ${anexos} anexos
        </span>
      </span>
    </button>
  `;
}

function renderBibliotecaSidebar(conjuntos) {
  const total = getAllConjuntosForSidebar().length;
  const emptyMessage = bibliotecaState.searchQuery.trim()
    ? "No se encontraron bloques con esa busqueda."
    : "Aun no tienes bloques de planeación.";

  return `
    <aside class="biblioteca-sidebar" aria-label="Bloques de planeación">
      <div class="biblioteca-sidebar-head">
        <h3>Bloques de planeación</h3>
        <span class="biblioteca-sidebar-badge">${total}</span>
      </div>
      <div class="biblioteca-search-wrap">
        <input
          id="biblioteca-search"
          type="search"
          class="biblioteca-search-input"
          placeholder="Buscar bloque..."
          autocomplete="off"
        />
      </div>
      <div class="biblioteca-sidebar-list">
        ${conjuntos.length
          ? conjuntos.map(renderConjuntoSidebarItem).join("")
          : `<p class="biblioteca-sidebar-empty">${escapeHtml(emptyMessage)}</p>`}
      </div>
    </aside>
  `;
}

function renderBibliotecaDetailEmpty() {
  return `
    <section id="biblioteca-detail-panel" class="biblioteca-detail">
      <div class="biblioteca-detail-empty">
        <h3>Selecciona un bloque</h3>
        <p>Elige un bloque de la izquierda para ver sus planeaciones, examenes y listas.</p>
        <button type="button" class="biblioteca-btn-primary" data-bib-action="crear-planeaciones">
          + Crear bloque de planeación
        </button>
      </div>
    </section>
  `;
}

function renderBibliotecaDetail(conjunto) {
  if (!conjunto) return renderBibliotecaDetailEmpty();

  const titulo = escapeBibliotecaDisplayText(conjunto.titulo, "Sin titulo");
  const id = escapeHtml(String(conjunto.id));
  const metaItems = [
    { label: "Nivel", value: conjunto.nivel ? escapeBibliotecaDisplayText(conjunto.nivel) : "Sin nivel" },
    { label: "Materia", value: conjunto.materia ? escapeBibliotecaDisplayText(conjunto.materia) : "Sin materia" }
  ];
  metaItems.push({ label: "Creado", value: bibFormatDateTime(conjunto.created_at) || (conjunto.isPending ? "Generando" : "Sin fecha") });

  const deleteBtn = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-danger"
      data-bib-action="eliminar-bloque"
      data-conjunto-id="${id}"
      aria-label="Eliminar bloque"
      title="Eliminar bloque">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
    </button>`;

  return `
    <section id="biblioteca-detail-panel" class="biblioteca-detail">
      <div class="biblioteca-detail-head">
        <div class="biblioteca-detail-summary">
          <p class="biblioteca-detail-eyebrow">BLOQUE SELECCIONADO</p>
          <h3 class="biblioteca-detail-title">${titulo}</h3>
          <div class="biblioteca-detail-meta-row">
            ${metaItems.map((item, i) => `<span class="biblioteca-detail-meta-chip"><span class="biblioteca-detail-meta-chip-label">${escapeHtml(item.label)}:</span>&nbsp;${item.value}</span>${i < metaItems.length - 1 ? '<span class="biblioteca-detail-meta-sep" aria-hidden="true">·</span>' : ""}`).join("")}
          </div>
        </div>
        ${deleteBtn ? `<div class="biblioteca-detail-actions">${deleteBtn}</div>` : ""}
      </div>
      ${renderBibliotecaTabs(conjunto)}
      ${renderBibliotecaTabContent(conjunto)}
    </section>
  `;
}

// ---- PARTIAL RENDERS (preserve sidebar scroll) ----

// Actualiza solo las clases is-active en el sidebar sin re-renderizar la lista.
function updateBibliotecaSidebarActive() {
  const list = document.querySelector(".biblioteca-sidebar-list");
  if (!list) return;
  const currentId = normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId());
  list.querySelectorAll("[data-bib-action='select-conjunto']").forEach((btn) => {
    const btnId = normalizeBibliotecaId(btn.dataset.conjuntoId);
    btn.classList.toggle("is-active", btnId === currentId);
  });
}

// Reemplaza solo el panel derecho (#biblioteca-detail-panel) sin tocar el sidebar.
// Si el panel aún no existe en el DOM, cae a un render completo.
function renderBibliotecaDetailInPlace() {
  const panel = document.getElementById("biblioteca-detail-panel");
  if (!panel) { renderBibliotecaContent(); return; }
  const selected = getSelectedConjunto();
  panel.outerHTML = renderBibliotecaDetail(selected);
}

// Actualiza solo la lista de items del sidebar sin tocar el input del buscador.
// Esto preserva el focus y el valor escrito mientras el usuario busca.
function renderBibliotecaSidebarListInPlace() {
  const list = document.querySelector(".biblioteca-sidebar-list");
  if (!list) { renderBibliotecaContent(); return; }
  const filtered = getFilteredConjuntosForSidebar();
  const emptyMessage = bibliotecaState.searchQuery.trim()
    ? "No se encontraron bloques con esa busqueda."
    : "Aun no tienes bloques de planeación.";
  list.innerHTML = filtered.length
    ? filtered.map(renderConjuntoSidebarItem).join("")
    : `<p class="biblioteca-sidebar-empty">${escapeHtml(emptyMessage)}</p>`;
  const badge = document.querySelector(".biblioteca-sidebar-badge");
  if (badge) badge.textContent = String(getAllConjuntosForSidebar().length);
}

// ---- MAIN RENDER ----

function renderBibliotecaContent() {
  const container = document.getElementById("explorer-content");
  if (!container) return;

  const workspace  = document.getElementById("explorer-workspace");
  const onboarding = document.getElementById("explorer-onboarding");
  if (workspace)  workspace.classList.remove("hidden");
  if (onboarding) onboarding.classList.add("hidden");

  if (bibliotecaState.loading) {
    container.innerHTML = `<div class="biblioteca-loading"><p>Cargando biblioteca...</p></div>`;
    return;
  }

  if (bibliotecaState.error) {
    container.innerHTML = `
      <div class="biblioteca-error">
        <p>No pudimos cargar tu biblioteca. Intenta nuevamente.</p>
        <button type="button" class="biblioteca-btn-primary" style="margin-top:0.75rem"
          data-bib-action="retry">Reintentar</button>
      </div>
    `;
    return;
  }

  const filtered = getFilteredConjuntosForSidebar();
  const selected = getSelectedConjunto();

  const prevSidebarScroll = document.querySelector(".biblioteca-sidebar-list")?.scrollTop ?? 0;

  container.innerHTML = `
    <div class="biblioteca-shell">
      <div class="biblioteca-layout">
        ${renderBibliotecaSidebar(filtered)}
        ${renderBibliotecaDetail(selected)}
      </div>
    </div>
  `;

  const searchInput = document.getElementById("biblioteca-search");
  if (searchInput) {
    searchInput.value = bibliotecaState.searchQuery;
    searchInput.oninput = onBibliotecaSearch;
  }

  if (prevSidebarScroll > 0) {
    requestAnimationFrame(() => {
      const list = document.querySelector(".biblioteca-sidebar-list");
      if (list) list.scrollTop = prevSidebarScroll;
    });
  }
}

window.renderBibliotecaContent = renderBibliotecaContent;

// ---- DATA LOADING ----

async function loadAndRenderBiblioteca(options = {}) {
  const silent = options.silent === true;
  const targetBatchId = normalizeBibliotecaId(options.targetBatchId);
  const targetActiveTab = options.activeTab || "planeaciones";

  // Capture pending info before clearing (for reconciliation after quick-create)
  const prevTempId    = bibliotecaState.pendingConjunto?.tempId || null;
  const wasSelected   = prevTempId ? normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === normalizeBibliotecaId(prevTempId) : false;
  const prevActiveTab = prevTempId ? (BibliotecaTabs.getActiveTab(prevTempId) || "planeaciones") : null;
  const prevSelectedId = normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId());
  const prevConjuntos = getAllConjuntosForSidebar();

  if (!silent) {
    bibliotecaState.pendingConjunto = null;
    bibliotecaState.loading = true;
  }
  bibliotecaState.error   = "";
  if (!silent) renderBibliotecaContent();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const data    = await apiBibliotecaConjuntos(session.access_token);
    const newList = Array.isArray(data) ? data : [];

    // Reconciliation: map tempId expanded state to the newly created real conjunto
    if (prevTempId) {
      BibliotecaTabs.clearActiveTab(prevTempId);
      if (wasSelected) {
        const prevIds     = new Set(prevConjuntos.map(c => normalizeBibliotecaId(c.id)));
        const newConjunto = targetBatchId
          ? newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId)
          : newList.find(c => !prevIds.has(normalizeBibliotecaId(c.id)));
        if (newConjunto) {
          BibliotecaSelection.setSelectedConjuntoId(normalizeBibliotecaId(newConjunto.id));
          BibliotecaTabs.setActiveTab(newConjunto.id, prevActiveTab);
        }
      }
    }

    if (targetBatchId) {
      const target = newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId);
      if (target) {
        BibliotecaSelection.setSelectedConjuntoId(normalizeBibliotecaId(target.id));
        BibliotecaTabs.setActiveTab(target.id, targetActiveTab);
      }
    }

    bibliotecaState.conjuntos = newList;
    bibliotecaState.loading   = false;
    bibliotecaState.pendingConjunto = null;

    const selectedStillExists = findConjuntoById(BibliotecaSelection.getSelectedConjuntoId());
    if (!selectedStillExists) {
      const fallback = targetBatchId
        ? newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId)
        : newList.find(c => normalizeBibliotecaId(c.id) === prevSelectedId) || newList[0] || null;
      BibliotecaSelection.setSelectedConjuntoId(fallback ? normalizeBibliotecaId(fallback.id) : null);
      if (fallback && !BibliotecaTabs.getActiveTab(fallback.id)) {
        BibliotecaTabs.setActiveTab(fallback.id, "planeaciones");
      }
    }

    renderBibliotecaContent();
  } catch (error) {
    console.error("[biblioteca] Error al cargar conjuntos:", error);
    bibliotecaState.loading = false;
    bibliotecaState.error   = error.message || "Error al cargar la biblioteca.";
    renderBibliotecaContent();
  }
}

// ---- EVENT HANDLERS ----

function onBibliotecaSearch(event) {
  bibliotecaState.searchQuery = event.target.value;
  renderBibliotecaSidebarListInPlace();
}

function onBibliotecaClick(event) {
  const btn = event.target.closest("[data-bib-action]");
  if (!btn) return;

  const action       = btn.dataset.bibAction;
  const conjuntoId   = btn.dataset.conjuntoId;
  const tab          = btn.dataset.tab;
  const examenId     = btn.dataset.examenId;
  const listaId      = btn.dataset.listaId;
  const anexoId      = btn.dataset.anexoId;
  const planeacionId = btn.dataset.planeacionId;

  switch (action) {
    case "select-conjunto": {
      setSelectedConjunto(conjuntoId);
      updateBibliotecaSidebarActive();
      renderBibliotecaDetailInPlace();
      break;
    }

    case "toggle-expand": {
      setSelectedConjunto(conjuntoId);
      updateBibliotecaSidebarActive();
      renderBibliotecaDetailInPlace();
      break;
    }

    case "switch-tab": {
      setSelectedConjunto(conjuntoId, { tab });
      renderBibliotecaDetailInPlace();
      break;
    }

    case "agregar-planeacion": {
      const cj = findConjuntoById(conjuntoId);
      if (cj) openBibliotecaAgregarModal(cj);
      break;
    }

    case "generar-examen": {
      const conjunto = findConjuntoById(conjuntoId);
      if (conjunto) openBibliotecaExamModal(conjunto);
      break;
    }

    case "generar-lista": {
      const conjunto = findConjuntoById(conjuntoId);
      if (conjunto) openBibliotecaListaModal(conjunto);
      break;
    }

    case "crear-planeaciones": {
      if (typeof openQuickCreatePanel === "function") {
        openQuickCreatePanel().catch(console.error);
      }
      break;
    }

    case "retry": {
      loadAndRenderBiblioteca();
      break;
    }

    case "ver-examen": {
      if (examenId) openBibliotecaExamenPreview(examenId);
      break;
    }

    case "ver-lista": {
      if (listaId) openBibliotecaListaPreview(listaId);
      break;
    }

    case "descargar-planeacion": {
      if (planeacionId) bibDescargarPlaneacion(planeacionId);
      break;
    }

    case "descargar-examen": {
      if (examenId) bibDescargarExamen(examenId);
      break;
    }

    case "descargar-lista": {
      if (listaId) bibDescargarLista(listaId);
      break;
    }

    case "abrir-modal-anexos": {
      const cj = findConjuntoById(conjuntoId);
      if (cj) openBibliotecaAnexoCreateModal(cj);
      break;
    }

    case "generar-anexo": {
      if (planeacionId && conjuntoId) bibGenerarAnexo(planeacionId, conjuntoId);
      break;
    }

    case "ver-anexo": {
      if (anexoId) openBibliotecaAnexoPreview(anexoId);
      break;
    }

    case "descargar-anexo": {
      if (anexoId) bibDescargarAnexo(anexoId);
      break;
    }

    case "regenerar-anexo": {
      if (anexoId && conjuntoId && planeacionId) bibRegenerarAnexo(anexoId, conjuntoId, planeacionId);
      break;
    }

    case "eliminar-bloque": {
      if (conjuntoId) bibEliminarBloque(conjuntoId);
      break;
    }

    case "eliminar-planeacion": {
      if (planeacionId && conjuntoId) bibEliminarPlaneacion(planeacionId, conjuntoId);
      break;
    }

    case "eliminar-examen": {
      if (examenId && conjuntoId) bibEliminarExamen(examenId, conjuntoId);
      break;
    }

    case "eliminar-lista": {
      if (listaId && conjuntoId) bibEliminarLista(listaId, conjuntoId);
      break;
    }

    case "eliminar-anexo": {
      if (anexoId && conjuntoId) bibEliminarAnexo(anexoId, conjuntoId);
      break;
    }
  }
}

// ---- ANEXOS CREATE MODAL ----

function openBibliotecaAnexoCreateModal(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  BibliotecaAnexoModalState.open({
    open:                  true,
    conjuntoId:            conjunto.id,
    planeaciones,
    selectedPlaneacionIds: [],
    submitting:            false,
    error:                 ""
  });
  const modal = document.getElementById("biblioteca-anexo-create-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaAnexoCreateModal();
}

function closeBibliotecaAnexoCreateModal() {
  BibliotecaAnexoModalState.close();
  const modal = document.getElementById("biblioteca-anexo-create-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function renderBibliotecaAnexoCreateModal() {
  const modal = document.getElementById("biblioteca-anexo-create-modal");
  if (!modal) return;

  const state    = BibliotecaAnexoModalState.getState();
  const conjunto = findConjuntoById(state.conjuntoId);
  const anexosExistentes = Array.isArray(conjunto?.anexos) ? conjunto.anexos : [];
  const generatingMap    = bibliotecaState.anexosGenerating[state.conjuntoId] || {};
  const anexosPlaneacionIds = new Set([
    ...anexosExistentes.map((a) => normalizeBibliotecaId(a.planeacion_id)),
    ...Object.keys(generatingMap)
  ].filter(Boolean));

  const totalPlaneaciones = state.planeaciones.length;
  const disponibles = state.planeaciones.filter(
    (p) => !anexosPlaneacionIds.has(normalizeBibliotecaId(p.id))
  );
  const availableIds = new Set(disponibles.map((p) => normalizeBibliotecaId(p.id)));
  const selectedValidIds = state.selectedPlaneacionIds.filter((id) =>
    availableIds.has(normalizeBibliotecaId(id))
  );
  if (selectedValidIds.length !== state.selectedPlaneacionIds.length) {
    BibliotecaAnexoModalState.setSelectedPlaneacionIds(selectedValidIds);
  }
  const canSubmit = selectedValidIds.length > 0 && disponibles.length > 0 && !state.submitting;

  const planeacionesHtml = state.planeaciones.length
    ? `<div class="bib-lista-topic-list">
        ${state.planeaciones.map((p) => {
          const pid          = normalizeBibliotecaId(p.id);
          const tieneAnexo   = anexosExistentes.some((a) => normalizeBibliotecaId(a.planeacion_id) === pid);
          const estaGenerando = !tieneAnexo && !!generatingMap[pid];
          const bloqueada    = tieneAnexo || estaGenerando;
          const checked      = selectedValidIds.includes(pid);
          const titulo_p     = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          const badge        = tieneAnexo
            ? `<span class="bib-lista-generated-badge">Anexo generado</span>`
            : estaGenerando
              ? `<span class="bib-lista-generated-badge" style="opacity:0.65;">Generando...</span>`
              : "";
          return `
            <label class="bib-lista-topic ${bloqueada ? "is-disabled" : ""}">
              <input type="checkbox" class="bib-lista-checkbox"
                data-bib-anexo-planid="${escapeHtml(pid)}"
                ${checked   ? "checked"  : ""}
                ${bloqueada ? "disabled" : ""} />
              <span class="bib-lista-topic-title">${titulo_p}</span>
              ${badge}
            </label>`;
        }).join("")}
      </div>`
    : `<p class="bib-lista-empty">Este bloque no tiene planeaciones disponibles.</p>`;

  const allGeneratedMessage = totalPlaneaciones > 0 && disponibles.length === 0
    ? `<p class="bib-lista-note-alert">Todas las planeaciones de este bloque ya tienen anexo generado.</p>`
    : "";

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const card = modal.querySelector(".biblioteca-modal-card");
  card.classList.add("biblioteca-lista-create-card");
  card.innerHTML = `
    <div class="bib-lista-head">
      <div class="bib-lista-title-block">
        <p class="bib-lista-eyebrow">MATERIAL PARA ESTUDIANTES</p>
        <h3>Crear anexos</h3>
        <p>Selecciona las planeaciones para las que deseas generar anexos.<br>Las que ya tienen anexo generado no se pueden volver a seleccionar.</p>
      </div>
      <button type="button" id="bib-anexo-create-close" class="bib-lista-close">X</button>
    </div>

    <div class="bib-lista-content">
      <section class="bib-lista-section">
        <div class="bib-lista-section-head">
          <h4>PLANEACIONES DEL BLOQUE</h4>
          <span id="bib-anexo-create-count">${disponibles.length} disponible(s) de ${totalPlaneaciones}</span>
        </div>
        ${planeacionesHtml}
      </section>

      ${allGeneratedMessage}

      ${errorHtml}

      <div class="bib-lista-actions">
        <button type="button" id="bib-anexo-create-cancel" class="bib-lista-cancel"
          ${state.submitting ? "disabled" : ""}>Cancelar</button>
        <button type="button" id="bib-anexo-create-submit" class="bib-lista-submit"
          ${canSubmit ? "" : "disabled"}>
          ${state.submitting ? "Generando..." : "Generar anexos seleccionados"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-anexo-create-close")?.addEventListener("click",  closeBibliotecaAnexoCreateModal);
  document.getElementById("bib-anexo-create-cancel")?.addEventListener("click", closeBibliotecaAnexoCreateModal);
  document.getElementById("bib-anexo-create-submit")?.addEventListener("click", submitBibliotecaAnexoCreateModal);

  modal.querySelectorAll("[data-bib-anexo-planid]").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      if (e.target.disabled) return;
      const pid = e.target.dataset.bibAnexoPlanid;
      if (!availableIds.has(normalizeBibliotecaId(pid))) {
        e.target.checked = false;
        return;
      }
      const modalState = BibliotecaAnexoModalState.getState();
      if (e.target.checked) {
        if (!modalState.selectedPlaneacionIds.includes(pid)) {
          BibliotecaAnexoModalState.addSelectedPlaneacionId(pid);
        }
      } else {
        BibliotecaAnexoModalState.setSelectedPlaneacionIds(
          modalState.selectedPlaneacionIds.filter((id) => id !== pid)
        );
      }
      renderBibliotecaAnexoCreateModal();
    });
  });
}

async function submitBibliotecaAnexoCreateModal() {
  const state    = BibliotecaAnexoModalState.getState();
  const conjunto = findConjuntoById(state.conjuntoId);
  const anexosExistentes  = Array.isArray(conjunto?.anexos) ? conjunto.anexos : [];
  const currentGenerating = bibliotecaState.anexosGenerating[state.conjuntoId] || {};
  const blockedIds = new Set([
    ...anexosExistentes.map((a) => normalizeBibliotecaId(a.planeacion_id)),
    ...Object.keys(currentGenerating)
  ].filter(Boolean));
  const availableIds = new Set(
    (Array.isArray(state.planeaciones) ? state.planeaciones : [])
      .map((p) => normalizeBibliotecaId(p.id))
      .filter((id) => id && !blockedIds.has(id))
  );
  const selectedIds = [...new Set(
    state.selectedPlaneacionIds
      .map((id) => normalizeBibliotecaId(id))
      .filter((id) => availableIds.has(id))
  )];

  if (!selectedIds.length) {
    BibliotecaAnexoModalState.setError("Selecciona al menos una planeacion.");
    renderBibliotecaAnexoCreateModal();
    return;
  }

  BibliotecaAnexoModalState.setSubmitting(true);
  BibliotecaAnexoModalState.setError("");
  renderBibliotecaAnexoCreateModal();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const conjuntoId = state.conjuntoId;
    window.AnexoGeneration.generateFromBiblioteca({
      conjuntoId,
      selectedIds,
      planeaciones: state.planeaciones,
      accessToken: session.access_token
    });

  } catch (error) {
    console.error("[biblioteca] Error iniciando anexos:", error);
    BibliotecaAnexoModalState.setSubmitting(false);
    BibliotecaAnexoModalState.setError(error.message || "No se pudieron generar los anexos.");
    renderBibliotecaAnexoCreateModal();
  }
}

// ---- ANEXOS ACTIONS ----

async function bibGenerarAnexo(planeacionId, conjuntoId) {
  const safePlanId  = normalizeBibliotecaId(planeacionId);
  const safeBatchId = normalizeBibliotecaId(conjuntoId);
  if (!safePlanId || !safeBatchId) return;

  // Obtener info de la planeación para la card temporal
  const conjunto = findConjuntoById(safeBatchId);
  const plan = (Array.isArray(conjunto?.planeaciones) ? conjunto.planeaciones : [])
    .find((p) => normalizeBibliotecaId(p.id) === safePlanId);

  if (!bibliotecaState.anexosGenerating[safeBatchId]) {
    bibliotecaState.anexosGenerating[safeBatchId] = {};
  }
  bibliotecaState.anexosGenerating[safeBatchId][safePlanId] = {
    titulo:  plan?.tema || plan?.custom_title || "Sin titulo",
    materia: plan?.materia || null,
    nivel:   plan?.nivel   || null,
    status:  "generating",
    errorMessage: ""
  };
  setSelectedConjunto(safeBatchId, { tab: "anexos" });
  renderBibliotecaDetailInPlace();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const res = await apiGenerarAnexo(safePlanId, session.access_token);

    // Update optimista
    const conjuntoObj = bibliotecaState.conjuntos.find(
      (c) => normalizeBibliotecaId(c.id) === safeBatchId
    );
    if (conjuntoObj) {
      if (!Array.isArray(conjuntoObj.anexos)) conjuntoObj.anexos = [];
      const item = bibliotecaState.anexosGenerating[safeBatchId]?.[safePlanId];
      conjuntoObj.anexos.push({
        id:           res?.anexo_id || `tmp-${safePlanId}`,
        planeacion_id: safePlanId,
        titulo:        item?.titulo  || "Anexo",
        materia:       item?.materia || null,
        nivel:         item?.nivel   || null,
        status:        "generated",
        created_at:    new Date().toISOString()
      });
      conjuntoObj.total_anexos = conjuntoObj.anexos.length;
    }

    if (bibliotecaState.anexosGenerating[safeBatchId]) {
      delete bibliotecaState.anexosGenerating[safeBatchId][safePlanId];
      if (Object.keys(bibliotecaState.anexosGenerating[safeBatchId]).length === 0) {
        delete bibliotecaState.anexosGenerating[safeBatchId];
      }
    }

    renderBibliotecaDetailInPlace();
    await loadAndRenderBiblioteca({ silent: true, targetBatchId: safeBatchId, activeTab: "anexos" });
  } catch (error) {
    console.error("[biblioteca] Error generando anexo:", error);
    if (bibliotecaState.anexosGenerating[safeBatchId]?.[safePlanId]) {
      bibliotecaState.anexosGenerating[safeBatchId][safePlanId].status       = "error";
      bibliotecaState.anexosGenerating[safeBatchId][safePlanId].errorMessage = error.message || "No se pudo generar el anexo.";
    }
    renderBibliotecaDetailInPlace();
  }
}

async function bibRegenerarAnexo(anexoId, conjuntoId, planeacionId) {
  const safeAnexoId  = normalizeBibliotecaId(anexoId);
  const safeBatchId  = normalizeBibliotecaId(conjuntoId);
  const safePlanId   = normalizeBibliotecaId(planeacionId);
  if (!safeAnexoId || !safeBatchId) return;

  if (!bibliotecaState.anexosGenerating[safeBatchId]) {
    bibliotecaState.anexosGenerating[safeBatchId] = {};
  }
  bibliotecaState.anexosGenerating[safeBatchId][safePlanId] = {
    titulo:  "Regenerando...",
    materia: null,
    nivel:   null,
    status:  "generating",
    errorMessage: ""
  };
  setSelectedConjunto(safeBatchId, { tab: "anexos" });
  renderBibliotecaDetailInPlace();

  try {
    const session = await window.requireSession();
    if (!session) return;

    await apiRegenerarAnexo(safeAnexoId, session.access_token);

    if (bibliotecaState.anexosGenerating[safeBatchId]) {
      delete bibliotecaState.anexosGenerating[safeBatchId][safePlanId];
      if (Object.keys(bibliotecaState.anexosGenerating[safeBatchId]).length === 0) {
        delete bibliotecaState.anexosGenerating[safeBatchId];
      }
    }
    await loadAndRenderBiblioteca({ silent: true, targetBatchId: safeBatchId, activeTab: "anexos" });
  } catch (error) {
    console.error("[biblioteca] Error regenerando anexo:", error);
    if (bibliotecaState.anexosGenerating[safeBatchId]?.[safePlanId]) {
      bibliotecaState.anexosGenerating[safeBatchId][safePlanId].status       = "error";
      bibliotecaState.anexosGenerating[safeBatchId][safePlanId].errorMessage = error.message || "No se pudo regenerar el anexo.";
    }
    renderBibliotecaDetailInPlace();
  }
}

// Compatibilidad temporal: conserva la descarga desde cards de Biblioteca.
// Motivo: mantener el handler data-bib-action="descargar-anexo" sin cambiar su contrato.
// Consumidores actuales: onBibliotecaClick y cards activas de Biblioteca.
// Condición para retirarlo: migrar el handler y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
async function bibDescargarAnexo(anexoId) {
  return window.AnexoDownload.downloadBiblioteca(anexoId);
}

// Compatibilidad temporal: conserva la firma local usada por la card y el preview.
// Motivo: mantener el exportador actual mientras los consumidores migran al módulo canónico.
// Consumidores actuales: bibDescargarAnexo y botón del preview de Biblioteca.
// Condición para retirarlo: migrar ambos consumidores y confirmar búsqueda global sin referencias.
// Fase prevista de retiro: Fase 10.
function descargarAnexoWord(anexo, filenameOverride) {
  return window.AnexoDownload.download(anexo, filenameOverride);
}

// ---- ANEXO PREVIEW MODAL ----

// Compatibilidad temporal: conserva la apertura desde cards de Biblioteca.
// Motivo: mantener el handler data-bib-action="ver-anexo" sin cambiar su contrato.
// Consumidores actuales: onBibliotecaClick y cards activas de Biblioteca.
// Condición para retirarlo: migrar el handler y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
async function openBibliotecaAnexoPreview(anexoId) {
  return window.AnexoPreview.open(anexoId);
}

// Compatibilidad temporal: conserva el cierre del modal dinámico existente.
// Motivo: mantener backdrop y botones de cierre sin cambiar su contrato.
// Consumidores actuales: modal dinámico de Biblioteca y render del preview.
// Condición para retirarlo: migrar listeners y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
function closeBibliotecaAnexoModal() {
  return window.AnexoPreview.close();
}

// Compatibilidad temporal: conserva el renderer local usado por la apertura.
// Motivo: mantener la firma durante la extracción literal del preview.
// Consumidores actuales: openBibliotecaAnexoPreview y compatibilidad local.
// Condición para retirarlo: migrar consumidores y confirmar búsqueda global sin referencias.
// Fase prevista de retiro: Fase 10.
function renderBibliotecaAnexoModal(anexo) {
  return window.AnexoPreview.render(anexo);
}

// ---- DOWNLOAD HELPERS ----

// Compatibilidad temporal: conserva la descarga desde cards de Biblioteca.
// Motivo: mantener el handler data-bib-action="descargar-planeacion" sin cambiar su contrato.
// Consumidores actuales: onBibliotecaClick y cards activas de Biblioteca.
// Condición para retirarlo: migrar el handler y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
async function bibDescargarPlaneacion(planeacionId) {
  return window.PlaneacionDownload.downloadFromBiblioteca(planeacionId);
}

// Compatibilidad temporal: conserva la descarga desde cards de Biblioteca.
// Motivo: compatibilidad con el handler actual de Biblioteca.
// Consumidor: data-bib-action="descargar-examen".
// Retiro: Fase 10, después de migrar el handler y confirmar búsqueda global limpia.
async function bibDescargarExamen(examenId) {
  return window.ExamDownload.downloadFromBiblioteca(examenId);
}

// Compatibilidad temporal: conserva la descarga desde cards de Biblioteca.
// Motivo: mantener el handler data-bib-action="descargar-lista" sin cambiar su contrato.
// Consumidores actuales: onBibliotecaClick y cards activas de Biblioteca.
// Condición para retirarlo: migrar el handler y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
async function bibDescargarLista(listaId) {
  return window.ListaCotejoDownload.downloadBiblioteca(listaId);
}

// Compatibilidad temporal: conserva la apertura local de Biblioteca durante la extracción.
// Motivo: mantener el handler data-bib-action="ver-examen" sin cambiar su contrato.
// Consumidores actuales: onBibliotecaClick y cards activas de Biblioteca.
// Condición para retirarlo: migrar el handler y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
async function openBibliotecaExamenPreview(examenId) {
  return window.ExamPreview.openBiblioteca(examenId);
}

// Compatibilidad temporal: conserva la apertura local de Biblioteca durante la extracción.
// Motivo: mantener el handler data-bib-action="ver-lista" sin cambiar su contrato.
// Consumidores actuales: onBibliotecaClick y cards activas de Biblioteca.
// Condición para retirarlo: migrar el handler y confirmar búsqueda global sin consumidores.
// Fase prevista de retiro: Fase 10.
async function openBibliotecaListaPreview(listaId) {
  return window.ListaCotejoPreview.openBiblioteca(listaId);
}

// ---- BIBLIOTECA EXAM GENERATION MODAL ----

function openBibliotecaExamModal(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  bibliotecaState.examModal = {
    open:                  true,
    conjuntoId:            conjunto.id,
    unidadId:              conjunto.unidad_id || null,
    planeaciones,
    selectedPlaneacionIds: [],
    selectedTypes:         [],
    questionCounts:        {},
    submitting:            false,
    error:                 ""
  };
  const modal = document.getElementById("biblioteca-exam-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaExamModal();
}

function closeBibliotecaExamModal() {
  bibliotecaState.examModal.open = false;
  const modal = document.getElementById("biblioteca-exam-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function renderBibliotecaExamModal() {
  const modal = document.getElementById("biblioteca-exam-modal");
  if (!modal) return;

  const state = bibliotecaState.examModal;

  const tiposHtml = BIB_EXAM_TIPOS.map(tipo => {
    const isSelected = state.selectedTypes.includes(tipo.value);
    const count      = state.questionCounts[tipo.value] || tipo.defaultCount;
    return `
      <label class="bib-exam-choice ${isSelected ? "is-selected" : ""}">
        <input type="checkbox" class="bib-exam-checkbox"
          data-bib-exam-type="${escapeHtml(tipo.value)}" ${isSelected ? "checked" : ""} />
        <span>${escapeHtml(tipo.label)}</span>
        ${isSelected ? `
          <input type="number" min="1" max="30" value="${count}"
            data-bib-exam-count="${escapeHtml(tipo.value)}"
            class="bib-exam-count"
            aria-label="Numero de preguntas para ${escapeHtml(tipo.label)}" />
        ` : ""}
      </label>
    `;
  }).join("");

  // Planeaciones with checkboxes
  const planeacionesHtml = state.planeaciones.length
    ? `<div class="bib-exam-topic-list">
        ${state.planeaciones.map(p => {
          const pid      = String(p.id);
          const checked  = state.selectedPlaneacionIds.includes(pid);
          const titulo_p = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          return `
            <label class="bib-exam-topic">
              <input type="checkbox" class="bib-exam-checkbox"
                data-bib-exam-planid="${escapeHtml(pid)}" ${checked ? "checked" : ""} />
              <span>${titulo_p}</span>
            </label>`;
        }).join("")}
      </div>`
    : `<p class="bib-exam-empty">No hay planeaciones en este bloque.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const card = modal.querySelector(".biblioteca-modal-card");
  card.classList.add("biblioteca-exam-create-card");
  card.innerHTML = `
    <div class="bib-exam-head">
      <div class="bib-exam-title-block">
        <h3>Crear examen de unidad</h3>
        <p>Configura los tipos de pregunta y selecciona los temas para generar el examen.</p>
      </div>
      <button type="button" id="bib-exam-close" class="bib-exam-close">X</button>
    </div>

    <div class="bib-exam-content">
      <section class="bib-exam-section">
        <div class="bib-exam-section-head">
          <h4>TIPOS DE PREGUNTA</h4>
          <span>Seleccion multiple</span>
        </div>
        <div class="bib-exam-types">${tiposHtml}</div>
      </section>

      <section class="bib-exam-section">
        <div class="bib-exam-section-head">
          <h4>TEMAS USADOS COMO CONTEXTO</h4>
          <span id="bib-exam-topics-count">${state.selectedPlaneacionIds.length} de ${state.planeaciones.length} tema(s)</span>
        </div>
        ${planeacionesHtml}
      </section>

      ${errorHtml}

      <div class="bib-exam-actions">
        <button type="button" id="bib-exam-cancel" class="bib-exam-cancel">Cancelar</button>
        <button type="button" id="bib-exam-submit" class="bib-exam-submit" ${state.submitting ? "disabled" : ""}>
          ${state.submitting ? "Iniciando..." : "Crear examen de unidad con los temas"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-exam-close")?.addEventListener("click", closeBibliotecaExamModal);
  document.getElementById("bib-exam-cancel")?.addEventListener("click", closeBibliotecaExamModal);
  document.getElementById("bib-exam-submit")?.addEventListener("click", submitBibliotecaExamModal);

  modal.querySelectorAll("[data-bib-exam-type]").forEach(cb => {
    cb.addEventListener("change", e => {
      const tipo = e.target.dataset.bibExamType;
      if (e.target.checked) {
        if (!bibliotecaState.examModal.selectedTypes.includes(tipo)) {
          bibliotecaState.examModal.selectedTypes.push(tipo);
          const found = BIB_EXAM_TIPOS.find(t => t.value === tipo);
          if (!bibliotecaState.examModal.questionCounts[tipo]) {
            bibliotecaState.examModal.questionCounts[tipo] = found?.defaultCount || 5;
          }
        }
      } else {
        bibliotecaState.examModal.selectedTypes =
          bibliotecaState.examModal.selectedTypes.filter(t => t !== tipo);
      }
      renderBibliotecaExamModal();
    });
  });

  modal.querySelectorAll("[data-bib-exam-count]").forEach(input => {
    input.addEventListener("change", e => {
      const tipo = e.target.dataset.bibExamCount;
      const val  = parseInt(e.target.value, 10);
      if (tipo && !isNaN(val) && val > 0) {
        bibliotecaState.examModal.questionCounts[tipo] = val;
      }
    });
  });

  modal.querySelectorAll("[data-bib-exam-planid]").forEach(cb => {
    cb.addEventListener("change", e => {
      const pid = e.target.dataset.bibExamPlanid;
      if (e.target.checked) {
        if (!bibliotecaState.examModal.selectedPlaneacionIds.includes(pid)) {
          bibliotecaState.examModal.selectedPlaneacionIds.push(pid);
        }
      } else {
        bibliotecaState.examModal.selectedPlaneacionIds =
          bibliotecaState.examModal.selectedPlaneacionIds.filter(id => id !== pid);
      }
      const counter = document.getElementById("bib-exam-topics-count");
      if (counter) {
        counter.textContent = `${bibliotecaState.examModal.selectedPlaneacionIds.length} de ${bibliotecaState.examModal.planeaciones.length} tema(s)`;
      }
    });
  });
}

async function submitBibliotecaExamModal() {
  const state = bibliotecaState.examModal;

  if (!state.unidadId) {
    bibliotecaState.examModal.error = "Este bloque no tiene unidad vinculada.";
    renderBibliotecaExamModal();
    return;
  }
  if (!state.selectedTypes.length) {
    bibliotecaState.examModal.error = "Selecciona al menos un tipo de pregunta.";
    renderBibliotecaExamModal();
    return;
  }
  if (!state.selectedPlaneacionIds.length) {
    bibliotecaState.examModal.error = "Selecciona al menos una planeacion.";
    renderBibliotecaExamModal();
    return;
  }

  bibliotecaState.examModal.submitting = true;
  bibliotecaState.examModal.error      = "";
  renderBibliotecaExamModal();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const cantidades = {};
    for (const tipo of state.selectedTypes) {
      cantidades[tipo] = state.questionCounts[tipo] || 5;
    }

    // Se envia planeacion_ids (no tema_ids): la seleccion de la biblioteca es
    // por planeacion. El backend resuelve sus temas y la unidad real, asi el
    // examen siempre usa los temas seleccionados aunque el unidad_id del batch
    // este desactualizado.
    const payload = {
      unidad_id:           state.unidadId,
      batch_id:            state.conjuntoId,
      tipos_pregunta:      state.selectedTypes,
      cantidades_pregunta: cantidades,
      planeacion_ids:      state.selectedPlaneacionIds
    };

    await window.ExamGeneration.generateFromBiblioteca({
      payload,
      accessToken: session.access_token,
      conjuntoId: state.conjuntoId
    });

  } catch (error) {
    console.error("[biblioteca] Error iniciando examen:", error);
    bibliotecaState.examModal.submitting = false;
    bibliotecaState.examModal.error      = error.message || "No se pudo generar el examen.";
    renderBibliotecaExamModal();
  }
}

// ---- BIBLIOTECA LISTA GENERATION MODAL ----

function openBibliotecaListaModal(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  bibliotecaState.listaModal = {
    open:                  true,
    conjuntoId:            conjunto.id,
    planeaciones,
    selectedPlaneacionIds: [],
    submitting:            false,
    error:                 ""
  };
  const modal = document.getElementById("biblioteca-lista-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaListaModal();
}

function closeBibliotecaListaModal() {
  bibliotecaState.listaModal.open = false;
  const modal = document.getElementById("biblioteca-lista-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function renderBibliotecaListaModal() {
  const modal = document.getElementById("biblioteca-lista-modal");
  if (!modal) return;

  const state    = bibliotecaState.listaModal;
  const conjunto = findConjuntoById(state.conjuntoId);
  const listas = Array.isArray(conjunto?.listas_cotejo) ? conjunto.listas_cotejo : [];
  const listaPlaneacionIds = new Set(listas.map((lista) => normalizeBibliotecaId(lista?.planeacion_id)).filter(Boolean));
  const totalPlaneaciones = state.planeaciones.length;
  const disponibles = state.planeaciones.filter((p) => !listaPlaneacionIds.has(normalizeBibliotecaId(p.id)));
  const availableIds = new Set(disponibles.map((p) => normalizeBibliotecaId(p.id)));
  const selectedValidIds = state.selectedPlaneacionIds.filter((id) => availableIds.has(normalizeBibliotecaId(id)));
  if (selectedValidIds.length !== state.selectedPlaneacionIds.length) {
    bibliotecaState.listaModal.selectedPlaneacionIds = selectedValidIds;
  }
  const canSubmit = selectedValidIds.length > 0 && disponibles.length > 0 && !state.submitting;

  const planeacionesHtml = state.planeaciones.length
    ? `<div class="bib-lista-topic-list">
        ${state.planeaciones.map(p => {
          const pid      = String(p.id);
          const safePid  = normalizeBibliotecaId(pid);
          const hasLista = listaPlaneacionIds.has(safePid);
          const checked  = selectedValidIds.includes(pid);
          const titulo_p = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          return `
            <label class="bib-lista-topic ${hasLista ? "is-disabled" : ""}">
              <input type="checkbox" class="bib-lista-checkbox"
                data-bib-lista-planid="${escapeHtml(pid)}" ${checked ? "checked" : ""} ${hasLista ? "disabled" : ""} />
              <span class="bib-lista-topic-title">${titulo_p}</span>
              ${hasLista ? `<span class="bib-lista-generated-badge">Lista ya generada</span>` : ""}
            </label>`;
        }).join("")}
      </div>`
    : `<p class="bib-lista-empty">Este bloque no tiene planeaciones disponibles para generar listas de cotejo.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const allGeneratedMessage = totalPlaneaciones > 0 && disponibles.length === 0
    ? `<p class="bib-lista-note-alert">Todas las planeaciones de este bloque ya tienen lista de cotejo.</p>`
    : "";

  const card = modal.querySelector(".biblioteca-modal-card");
  card.classList.add("biblioteca-lista-create-card");
  card.innerHTML = `
    <div class="bib-lista-head">
      <div class="bib-lista-title-block">
        <p class="bib-lista-eyebrow">EVALUACION POR TEMA</p>
        <h3>Crear listas de cotejo</h3>
        <p>Selecciona las actividades para las que deseas generar lista de cotejo.<br>Las que ya tienen lista generada no se pueden volver a seleccionar.</p>
      </div>
      <button type="button" id="bib-lista-close" class="bib-lista-close">X</button>
    </div>

    <div class="bib-lista-content">
      <section class="bib-lista-section">
        <div class="bib-lista-section-head">
          <h4>TEMAS DEL BLOQUE</h4>
          <span id="bib-lista-available-count">${disponibles.length} disponible(s) de ${totalPlaneaciones}</span>
        </div>
        ${planeacionesHtml}
      </section>

      ${allGeneratedMessage}

      <p class="bib-lista-note">Cada lista se genera a partir de la actividad de cierre de la planeacion. Si una planeacion no tiene actividad de cierre, se omitira.</p>

      ${errorHtml}

      <div class="bib-lista-actions">
        <button type="button" id="bib-lista-cancel" class="bib-lista-cancel">Cancelar</button>
        <button type="button" id="bib-lista-submit" class="bib-lista-submit" ${canSubmit ? "" : "disabled"}>
          ${state.submitting ? "Iniciando..." : "Generar listas seleccionadas"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-lista-close")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-cancel")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-submit")?.addEventListener("click", submitBibliotecaListaModal);

  modal.querySelectorAll("[data-bib-lista-planid]").forEach(cb => {
    cb.addEventListener("change", e => {
      if (e.target.disabled) return;
      const pid = e.target.dataset.bibListaPlanid;
      if (!availableIds.has(normalizeBibliotecaId(pid))) {
        e.target.checked = false;
        return;
      }
      if (e.target.checked) {
        if (!bibliotecaState.listaModal.selectedPlaneacionIds.includes(pid)) {
          bibliotecaState.listaModal.selectedPlaneacionIds.push(pid);
        }
      } else {
        bibliotecaState.listaModal.selectedPlaneacionIds =
          bibliotecaState.listaModal.selectedPlaneacionIds.filter(id => id !== pid);
      }
      renderBibliotecaListaModal();
    });
  });
}

async function submitBibliotecaListaModal() {
  const state = bibliotecaState.listaModal;
  const conjunto = findConjuntoById(state.conjuntoId);
  const listas = Array.isArray(conjunto?.listas_cotejo) ? conjunto.listas_cotejo : [];
  const blockedIds = new Set(listas.map((lista) => normalizeBibliotecaId(lista?.planeacion_id)).filter(Boolean));
  const availableIds = new Set((Array.isArray(state.planeaciones) ? state.planeaciones : [])
    .map((p) => normalizeBibliotecaId(p.id))
    .filter((id) => id && !blockedIds.has(id)));
  const selectedIds = [...new Set(state.selectedPlaneacionIds
    .map((id) => normalizeBibliotecaId(id))
    .filter((id) => availableIds.has(id)))];

  if (!selectedIds.length) {
    bibliotecaState.listaModal.error = "Selecciona al menos una planeacion.";
    renderBibliotecaListaModal();
    return;
  }

  bibliotecaState.listaModal.submitting = true;
  bibliotecaState.listaModal.error      = "";
  renderBibliotecaListaModal();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const conjuntoId = state.conjuntoId;
    window.ListaCotejoGeneration.generateFromBiblioteca({
      conjuntoId,
      selectedIds,
      planeaciones: state.planeaciones,
      accessToken: session.access_token
    });

  } catch (error) {
    console.error("[biblioteca] Error iniciando listas:", error);
    bibliotecaState.listaModal.submitting = false;
    bibliotecaState.listaModal.error      = error.message || "No se pudieron generar las listas.";
    renderBibliotecaListaModal();
  }
}

// ---- AGREGAR TEMAS AL CONJUNTO MODAL ----

function openBibliotecaAgregarModal(conjunto) {
  if (!conjunto.unidad_id) {
    alert("Este bloque no tiene unidad vinculada. Para agregar planeaciones, usa el flujo normal de creacion desde la jerarquia.");
    return;
  }
  bibliotecaState.agregarModal = {
    open:       true,
    conjuntoId: conjunto.id,
    unidadId:   conjunto.unidad_id,
    materia:    conjunto.materia || "",
    nivel:      conjunto.nivel   || "",
    unidad:     conjunto.unidad,
    temas:      [],
    error:      ""
  };
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaAgregarModal();
}

function closeBibliotecaAgregarModal() {
  bibliotecaState.agregarModal.open = false;
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

function renderBibliotecaAgregarModal() {
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (!modal) return;

  const s = bibliotecaState.agregarModal;

  const contextHtml = `
    <div class="rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2.5 text-sm text-slate-700">
      ${s.materia ? `<span class="font-semibold">${escapeBibliotecaDisplayText(s.materia)}</span>` : ""}
      ${s.nivel ? ` &middot; ${escapeBibliotecaDisplayText(s.nivel)}` : ""}
    </div>`;

  // Per-tema rows with their own activity selects
  const temasListHtml = s.temas.length
    ? s.temas.map(t => {
        const actSelects = (typeof MOMENTOS_ACTIVIDADES_DIDACTICAS !== "undefined")
          ? MOMENTOS_ACTIVIDADES_DIDACTICAS.map(m => {
              const curVal = t.actividades_momentos?.[m.key] || "";
              const opts   = typeof buildActividadDidacticaOptions === "function"
                ? buildActividadDidacticaOptions(curVal)
                : "";
              return `
                <label class="actividad-momento-row min-w-0 text-xs font-medium text-slate-600">
                  <span class="actividad-momento-label">${escapeHtml(m.label)}</span>
                  <select
                    data-bib-agr-actividad
                    data-local-id="${escapeHtml(t.localId)}"
                    data-momento="${escapeHtml(m.key)}"
                    class="actividad-cierre-select actividad-didactica-select min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    ${opts}
                  </select>
                </label>`;
            }).join("")
          : "";

        return `
          <div class="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <div class="flex items-center gap-2">
              <span class="flex-1 text-sm font-medium text-slate-800">${escapeHtml(t.titulo)}</span>
              <span class="text-xs text-slate-400 flex-shrink-0">${t.duracion} min</span>
              <button type="button" class="flex-shrink-0 text-slate-400 hover:text-rose-600 ml-1"
                data-bib-agr-remove="${escapeHtml(t.localId)}"
                title="Quitar tema">&#10005;</button>
            </div>
            ${actSelects ? `
              <div class="actividades-momentos mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Actividades didacticas opcionales</p>
                <div class="mt-2 grid gap-2">${actSelects}</div>
              </div>` : ""}
          </div>`;
      }).join("")
    : `<p class="text-xs text-slate-400 py-1">Sin temas. Agrega al menos uno usando el formulario de abajo.</p>`;

  const addFormHtml = `
    <div class="biblioteca-tema-create-box">
      <div class="biblioteca-tema-create-row">
        <div>
          <label for="bib-agr-titulo" class="mb-1 block text-sm font-medium text-slate-700">Tema</label>
          <input type="text" id="bib-agr-titulo" placeholder="Ej. Fracciones equivalentes" />
        </div>
        <div>
          <label for="bib-agr-duracion" class="mb-1 block text-sm font-medium text-slate-700">Duracion</label>
          <input type="number" id="bib-agr-duracion" value="50" min="10" max="300" title="Duracion en minutos" />
        </div>
        <button type="button" id="bib-agr-add" class="biblioteca-tema-add-btn">
          Agregar tema
        </button>
      </div>
    </div>`;

  const errorHtml = s.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(s.error)}</p>`
    : "";

  modal.querySelector(".biblioteca-modal-card").innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-cyan-700">Agregar planeaciones</p>
        <h3 class="mt-1 text-base font-semibold text-slate-900">${escapeBibliotecaDisplayText(findConjuntoById(s.conjuntoId)?.titulo, "Bloque")}</h3>
      </div>
      <button type="button" id="bib-agr-close"
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50">
        &#10005;
      </button>
    </div>

    ${contextHtml}

    <div class="mt-4 space-y-2">
      <p class="text-sm font-semibold text-slate-700">Temas a generar</p>
      <div class="biblioteca-agregar-temas-scroll space-y-2">${temasListHtml}</div>
      ${addFormHtml}
    </div>

    ${errorHtml}

    <div class="mt-4 flex flex-wrap justify-end gap-2">
      <button type="button" id="bib-agr-cancel"
        class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Cancelar
      </button>
      <button type="button" id="bib-agr-submit"
        class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
        ${s.temas.length === 0 ? "disabled" : ""}>
        Generar planeaciones
      </button>
    </div>
  `;
  modal.querySelector(".biblioteca-modal-card")?.classList.add("biblioteca-agregar-card");

  document.getElementById("bib-agr-close")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-cancel")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-add")?.addEventListener("click", addBibliotecaAgregarTema);
  document.getElementById("bib-agr-titulo")?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); addBibliotecaAgregarTema(); }
  });
  document.getElementById("bib-agr-submit")?.addEventListener("click", submitBibliotecaAgregarModal);

  modal.querySelectorAll("[data-bib-agr-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const localId = btn.dataset.bibAgrRemove;
      bibliotecaState.agregarModal.temas =
        bibliotecaState.agregarModal.temas.filter(t => t.localId !== localId);
      renderBibliotecaAgregarModal();
    });
  });

  // Per-tema activity selects — update state without re-rendering
  modal.querySelectorAll("[data-bib-agr-actividad]").forEach(sel => {
    sel.addEventListener("change", e => {
      const localId = e.target.dataset.localId;
      const momento = e.target.dataset.momento;
      const val     = (e.target.value || "").trim();
      const tema    = bibliotecaState.agregarModal.temas.find(t => t.localId === localId);
      if (!tema) return;
      if (!tema.actividades_momentos) tema.actividades_momentos = {};
      if (val && (typeof isActividadDidacticaValida !== "function" || isActividadDidacticaValida(val))) {
        tema.actividades_momentos[momento] = val;
      } else {
        delete tema.actividades_momentos[momento];
      }
      // No re-render needed — state is updated and will persist until next explicit render
    });
  });
}

function addBibliotecaAgregarTema() {
  const tituloInput   = document.getElementById("bib-agr-titulo");
  const duracionInput = document.getElementById("bib-agr-duracion");
  if (!tituloInput || !duracionInput) return;

  const titulo  = tituloInput.value.trim();
  const duracion = parseInt(duracionInput.value, 10);

  if (!titulo) {
    tituloInput.focus();
    return;
  }
  if (!Number.isFinite(duracion) || duracion < 10) {
    bibliotecaState.agregarModal.error = "La duracion minima es 10 minutos.";
    renderBibliotecaAgregarModal();
    return;
  }

  // Before re-rendering, capture current activity selections from existing tema selects
  document.querySelectorAll("[data-bib-agr-actividad]").forEach(sel => {
    const localId = sel.dataset.localId;
    const momento = sel.dataset.momento;
    const val     = (sel.value || "").trim();
    const tema    = bibliotecaState.agregarModal.temas.find(t => t.localId === localId);
    if (!tema) return;
    if (!tema.actividades_momentos) tema.actividades_momentos = {};
    if (val && (typeof isActividadDidacticaValida !== "function" || isActividadDidacticaValida(val))) {
      tema.actividades_momentos[momento] = val;
    } else {
      delete tema.actividades_momentos[momento];
    }
  });

  bibliotecaState.agregarModal.temas.push({
    localId: `agr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    titulo,
    duracion,
    actividades_momentos: {}
  });
  bibliotecaState.agregarModal.error = "";
  renderBibliotecaAgregarModal();
  document.getElementById("bib-agr-titulo")?.focus();
}

async function submitBibliotecaAgregarModal() {
  const s = bibliotecaState.agregarModal;

  if (s.temas.length === 0) {
    bibliotecaState.agregarModal.error = "Agrega al menos un tema.";
    renderBibliotecaAgregarModal();
    return;
  }

  // Capture any unsaved activity selections before closing
  document.querySelectorAll("[data-bib-agr-actividad]").forEach(sel => {
    const localId = sel.dataset.localId;
    const momento = sel.dataset.momento;
    const val     = (sel.value || "").trim();
    const tema    = bibliotecaState.agregarModal.temas.find(t => t.localId === localId);
    if (!tema) return;
    if (!tema.actividades_momentos) tema.actividades_momentos = {};
    if (val && (typeof isActividadDidacticaValida !== "function" || isActividadDidacticaValida(val))) {
      tema.actividades_momentos[momento] = val;
    } else {
      delete tema.actividades_momentos[momento];
    }
  });

  // Snapshot state before closing
  const conjuntoId = s.conjuntoId;
  const unidadId   = s.unidadId;
  const materia    = s.materia;
  const nivel      = s.nivel;
  const temasSnap  = s.temas.map((t, i) => ({
    titulo:   t.titulo,
    duracion: t.duracion,
    actividades_momentos: (typeof normalizeActividadesMomentos === "function")
      ? normalizeActividadesMomentos(t.actividades_momentos || {})
      : (t.actividades_momentos || {}),
    orden: i + 1,
    generar_imagenes_en: []
  }));

  window.PlaneacionGeneration.generateFromBiblioteca({
    conjuntoId,
    unidadId,
    materia,
    nivel,
    temasSnap
  });
}

// ---- DELETE ACTIONS ----

// Motivo: compatibilidad con el handler actual de Biblioteca.
// Consumidor: data-bib-action="eliminar-bloque".
// Retiro: Fase 10, después de migrar el handler y confirmar búsqueda global limpia.
async function bibEliminarBloque(conjuntoId) {
  return window.BibliotecaBlockDelete.deleteFromBiblioteca(conjuntoId);
}

// Compatibilidad temporal: conserva la eliminación desde cards de Biblioteca.
// Motivo: compatibilidad con el handler actual de Biblioteca.
// Consumidor: data-bib-action="eliminar-planeacion".
// Retiro: Fase 10, tras migrar el handler y confirmar búsqueda global limpia.
async function bibEliminarPlaneacion(planeacionId, conjuntoId) {
  return window.PlaneacionDelete.deleteFromBiblioteca(planeacionId, conjuntoId);
}

// Compatibilidad temporal: conserva la eliminación desde cards de Biblioteca.
// Motivo: compatibilidad con el handler actual de Biblioteca.
// Consumidor: data-bib-action="eliminar-examen".
// Retiro: Fase 10, después de migrar el handler y confirmar búsqueda global limpia.
async function bibEliminarExamen(examenId, conjuntoId) {
  return window.ExamDelete.deleteFromBiblioteca(examenId, conjuntoId);
}

// Compatibilidad temporal: conserva la eliminación desde cards de Biblioteca.
// Motivo: compatibilidad con el handler actual de Biblioteca.
// Consumidor: data-bib-action="eliminar-lista".
// Retiro: Fase 10, después de migrar el handler y confirmar búsqueda global limpia.
async function bibEliminarLista(listaId, conjuntoId) {
  return window.ListaCotejoDelete.deleteFromBiblioteca(listaId, conjuntoId);
}

// Compatibilidad temporal: conserva la eliminación desde cards de Biblioteca.
// Motivo: compatibilidad con el handler actual de Biblioteca.
// Consumidor: data-bib-action="eliminar-anexo".
// Retiro: Fase 10, después de migrar el handler y confirmar búsqueda global limpia.
async function bibEliminarAnexo(anexoId, conjuntoId) {
  return window.AnexoDelete.deleteFromBiblioteca(anexoId, conjuntoId);
}

// ---- INJECT MODALS ----

function injectBibliotecaModals() {
  if (!document.getElementById("biblioteca-exam-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-exam-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-exam-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-exam-backdrop")
      ?.addEventListener("click", closeBibliotecaExamModal);
  }

  if (!document.getElementById("biblioteca-lista-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-lista-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-lista-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-lista-backdrop")
      ?.addEventListener("click", closeBibliotecaListaModal);
  }

  if (!document.getElementById("biblioteca-agregar-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-agregar-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-agr-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-agr-backdrop")
      ?.addEventListener("click", closeBibliotecaAgregarModal);
  }

  if (!document.getElementById("biblioteca-anexo-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-anexo-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-anexo-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card" style="max-width:680px; width:100%;"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-anexo-backdrop")
      ?.addEventListener("click", closeBibliotecaAnexoModal);
  }

  if (!document.getElementById("biblioteca-anexo-create-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-anexo-create-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-anexo-create-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-anexo-create-backdrop")
      ?.addEventListener("click", closeBibliotecaAnexoCreateModal);
  }

  if (!document.getElementById("biblioteca-confirm-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-confirm-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-confirm-backdrop"></div>
      <div class="biblioteca-modal-shell" style="align-items:center; padding-top:0;">
        <div class="biblioteca-modal-card bib-confirm-card"></div>
      </div>
    `;
    document.body.appendChild(div);
  }
}

function showBibConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("biblioteca-confirm-modal");
    if (!modal) { resolve(false); return; }

    const card = modal.querySelector(".biblioteca-modal-card");
    card.innerHTML = `
      <div class="bib-confirm-body">
        <div class="bib-confirm-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <h3 class="bib-confirm-title">${escapeHtml(title)}</h3>
        <p class="bib-confirm-msg">${escapeHtml(message)}</p>
        <div class="bib-confirm-actions">
          <button type="button" id="bib-confirm-cancel" class="bib-exam-cancel">Cancelar</button>
          <button type="button" id="bib-confirm-ok" class="bib-confirm-ok">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Eliminar
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    function close(result) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      resolve(result);
    }

    document.getElementById("bib-confirm-cancel")?.addEventListener("click", () => close(false), { once: true });
    document.getElementById("bib-confirm-ok")?.addEventListener("click",     () => close(true),  { once: true });
    document.getElementById("bib-confirm-backdrop")?.addEventListener("click", () => close(false), { once: true });
  });
}

// ---- INIT ----

async function initBiblioteca() {
  injectBibliotecaModals();

  document.addEventListener("click", onBibliotecaClick);

  // Hide path bar / sidebar for biblioteca layout
  const pathBar = document.getElementById("explorer-path-bar");
  const sidebar  = document.getElementById("dashboard-sidebar-slot");
  const grid     = document.getElementById("explorer-workspace-grid");
  if (pathBar) pathBar.style.display = "none";
  if (sidebar)  sidebar.classList.add("hidden");
  if (grid)     grid.style.display = "block";

  await loadAndRenderBiblioteca();
}

window.initBiblioteca = initBiblioteca;
