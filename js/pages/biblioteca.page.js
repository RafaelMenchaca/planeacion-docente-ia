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

// Fase 5 — Sesión 5.4: ownership léxico del estado del modal de listas.
// La única fuente de verdad permanece en bibliotecaState.listaModal.
// Estas operaciones conservan el reemplazo total y las mutaciones parciales
// previas sin normalizar, validar ni limpiar valores adicionales.
const BibliotecaListaModalState = {
  getState() {
    return bibliotecaState.listaModal;
  },
  open(state) {
    bibliotecaState.listaModal = state;
    return state;
  },
  close() {
    bibliotecaState.listaModal.open = false;
  },
  setSelectedPlaneacionIds(ids) {
    bibliotecaState.listaModal.selectedPlaneacionIds = ids;
    return ids;
  },
  addSelectedPlaneacionId(id) {
    bibliotecaState.listaModal.selectedPlaneacionIds.push(id);
    return id;
  },
  setSubmitting(value) {
    bibliotecaState.listaModal.submitting = value;
    return value;
  },
  setError(value) {
    bibliotecaState.listaModal.error = value;
    return value;
  }
};

// Fase 5 — Sesión 5.5: ownership léxico del estado del modal de exámenes.
// La única fuente de verdad permanece en bibliotecaState.examModal.
// Estas operaciones conservan el reemplazo total y las mutaciones parciales
// previas sin normalizar, validar ni limpiar valores adicionales.
const BibliotecaExamModalState = {
  getState() {
    return bibliotecaState.examModal;
  },
  open(state) {
    bibliotecaState.examModal = state;
    return state;
  },
  close() {
    bibliotecaState.examModal.open = false;
  },
  setSelectedTypes(types) {
    bibliotecaState.examModal.selectedTypes = types;
    return types;
  },
  addSelectedType(type) {
    bibliotecaState.examModal.selectedTypes.push(type);
    return type;
  },
  setQuestionCount(type, count) {
    bibliotecaState.examModal.questionCounts[type] = count;
    return count;
  },
  setSelectedPlaneacionIds(ids) {
    bibliotecaState.examModal.selectedPlaneacionIds = ids;
    return ids;
  },
  addSelectedPlaneacionId(id) {
    bibliotecaState.examModal.selectedPlaneacionIds.push(id);
    return id;
  },
  setSubmitting(value) {
    bibliotecaState.examModal.submitting = value;
    return value;
  },
  setError(value) {
    bibliotecaState.examModal.error = value;
    return value;
  }
};

// Fase 5 — Sesión 5.6: ownership léxico del estado del modal de planeaciones.
// La única fuente de verdad permanece en bibliotecaState.agregarModal.
// Estas operaciones conservan el reemplazo total y las mutaciones parciales
// previas sin normalizar, validar ni limpiar valores adicionales.
const BibliotecaPlaneacionModalState = {
  getState() {
    return bibliotecaState.agregarModal;
  },
  open(state) {
    bibliotecaState.agregarModal = state;
    return state;
  },
  close() {
    bibliotecaState.agregarModal.open = false;
  },
  setTemas(temas) {
    bibliotecaState.agregarModal.temas = temas;
    return temas;
  },
  getTemaByLocalId(localId) {
    return bibliotecaState.agregarModal.temas.find(t => t.localId === localId);
  },
  addTema(tema) {
    bibliotecaState.agregarModal.temas.push(tema);
    return tema;
  },
  setError(value) {
    bibliotecaState.agregarModal.error = value;
    return value;
  }
};

// Fase 5 — Sesión 5.7: ownership léxico de los pending de Biblioteca.
// Cada superficie conserva su fuente física y shape propios; no existe un
// pending universal ni normalización adicional de claves o valores.
const BibliotecaPlaneacionesPending = {
  get(batchId) {
    return bibliotecaState.pendingPlaneacionesByBatchId[batchId];
  },
  set(batchId, value) {
    bibliotecaState.pendingPlaneacionesByBatchId[batchId] = value;
    return value;
  },
  delete(batchId) {
    delete bibliotecaState.pendingPlaneacionesByBatchId[batchId];
  }
};

const BibliotecaAnexosPending = {
  getBatch(batchId) {
    return bibliotecaState.anexosGenerating[batchId];
  },
  setBatch(batchId, value) {
    bibliotecaState.anexosGenerating[batchId] = value;
    return value;
  },
  deleteBatch(batchId) {
    delete bibliotecaState.anexosGenerating[batchId];
  },
  getItem(batchId, planeacionId) {
    return bibliotecaState.anexosGenerating[batchId]?.[planeacionId];
  },
  setItem(batchId, planeacionId, value) {
    bibliotecaState.anexosGenerating[batchId][planeacionId] = value;
    return value;
  },
  deleteItem(batchId, planeacionId) {
    delete bibliotecaState.anexosGenerating[batchId][planeacionId];
  }
};

const BibliotecaListaPending = {
  get(batchId) {
    return bibliotecaState.pendingListaByBatchId[batchId];
  },
  set(batchId, value) {
    bibliotecaState.pendingListaByBatchId[batchId] = value;
    return value;
  },
  delete(batchId) {
    delete bibliotecaState.pendingListaByBatchId[batchId];
  }
};

const BibliotecaExamPending = {
  get(batchId) {
    return bibliotecaState.pendingExamenByBatchId[batchId];
  },
  set(batchId, value) {
    bibliotecaState.pendingExamenByBatchId[batchId] = value;
    return value;
  },
  delete(batchId) {
    delete bibliotecaState.pendingExamenByBatchId[batchId];
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
    BibliotecaPlaneacionesPending.set(safeId, {
      items: (Array.isArray(temas) ? temas : []).map((tema) => ({
        titulo: tema?.titulo || "",
        status: "pending",
        message: ""
      })),
      error: ""
    });
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

// Wrappers de compatibilidad para generadores, deletes, eventos e init que se
// cargan como scripts clásicos. La implementación canónica vive en el owner de
// loader/reconcile y estas firmas se conservan hasta migrar sus consumidores.
function normalizeGeneratedPlaneaciones(result) {
  return window.BibliotecaLoader.normalizeGeneratedPlaneaciones(result);
}

function applyOptimisticPlaneacionesToConjunto(batchId, planeaciones) {
  return window.BibliotecaLoader.applyOptimisticPlaneacionesToConjunto(batchId, planeaciones);
}

function applyGenerationResultToPendingItems(batchId, result) {
  return window.BibliotecaLoader.applyGenerationResultToPendingItems(batchId, result);
}

function finishBibliotecaPlaneacionesGeneration(result) {
  return window.BibliotecaLoader.finishPlaneacionesGeneration(result);
}

function loadAndRenderBiblioteca(options = {}) {
  return window.BibliotecaLoader.load(options);
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

async function submitBibliotecaAnexoCreateModal() {
  const state    = BibliotecaAnexoModalState.getState();
  const conjunto = findConjuntoById(state.conjuntoId);
  const anexosExistentes  = Array.isArray(conjunto?.anexos) ? conjunto.anexos : [];
  const currentGenerating = BibliotecaAnexosPending.getBatch(state.conjuntoId) || {};
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

  if (!BibliotecaAnexosPending.getBatch(safeBatchId)) {
    BibliotecaAnexosPending.setBatch(safeBatchId, {});
  }
  BibliotecaAnexosPending.setItem(safeBatchId, safePlanId, {
    titulo:  plan?.tema || plan?.custom_title || "Sin titulo",
    materia: plan?.materia || null,
    nivel:   plan?.nivel   || null,
    status:  "generating",
    errorMessage: ""
  });
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
      const item = BibliotecaAnexosPending.getItem(safeBatchId, safePlanId);
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

    if (BibliotecaAnexosPending.getBatch(safeBatchId)) {
      BibliotecaAnexosPending.deleteItem(safeBatchId, safePlanId);
      if (Object.keys(BibliotecaAnexosPending.getBatch(safeBatchId)).length === 0) {
        BibliotecaAnexosPending.deleteBatch(safeBatchId);
      }
    }

    renderBibliotecaDetailInPlace();
    await loadAndRenderBiblioteca({ silent: true, targetBatchId: safeBatchId, activeTab: "anexos" });
  } catch (error) {
    console.error("[biblioteca] Error generando anexo:", error);
    const pendingItem = BibliotecaAnexosPending.getItem(safeBatchId, safePlanId);
    if (pendingItem) {
      pendingItem.status       = "error";
      pendingItem.errorMessage = error.message || "No se pudo generar el anexo.";
    }
    renderBibliotecaDetailInPlace();
  }
}

async function bibRegenerarAnexo(anexoId, conjuntoId, planeacionId) {
  const safeAnexoId  = normalizeBibliotecaId(anexoId);
  const safeBatchId  = normalizeBibliotecaId(conjuntoId);
  const safePlanId   = normalizeBibliotecaId(planeacionId);
  if (!safeAnexoId || !safeBatchId) return;

  if (!BibliotecaAnexosPending.getBatch(safeBatchId)) {
    BibliotecaAnexosPending.setBatch(safeBatchId, {});
  }
  BibliotecaAnexosPending.setItem(safeBatchId, safePlanId, {
    titulo:  "Regenerando...",
    materia: null,
    nivel:   null,
    status:  "generating",
    errorMessage: ""
  });
  setSelectedConjunto(safeBatchId, { tab: "anexos" });
  renderBibliotecaDetailInPlace();

  try {
    const session = await window.requireSession();
    if (!session) return;

    await apiRegenerarAnexo(safeAnexoId, session.access_token);

    if (BibliotecaAnexosPending.getBatch(safeBatchId)) {
      BibliotecaAnexosPending.deleteItem(safeBatchId, safePlanId);
      if (Object.keys(BibliotecaAnexosPending.getBatch(safeBatchId)).length === 0) {
        BibliotecaAnexosPending.deleteBatch(safeBatchId);
      }
    }
    await loadAndRenderBiblioteca({ silent: true, targetBatchId: safeBatchId, activeTab: "anexos" });
  } catch (error) {
    console.error("[biblioteca] Error regenerando anexo:", error);
    const pendingItem = BibliotecaAnexosPending.getItem(safeBatchId, safePlanId);
    if (pendingItem) {
      pendingItem.status       = "error";
      pendingItem.errorMessage = error.message || "No se pudo regenerar el anexo.";
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
  BibliotecaExamModalState.open({
    open:                  true,
    conjuntoId:            conjunto.id,
    unidadId:              conjunto.unidad_id || null,
    planeaciones,
    selectedPlaneacionIds: [],
    selectedTypes:         [],
    questionCounts:        {},
    submitting:            false,
    error:                 ""
  });
  const modal = document.getElementById("biblioteca-exam-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaExamModal();
}

function closeBibliotecaExamModal() {
  BibliotecaExamModalState.close();
  const modal = document.getElementById("biblioteca-exam-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

async function submitBibliotecaExamModal() {
  const state = BibliotecaExamModalState.getState();

  if (!state.unidadId) {
    BibliotecaExamModalState.setError("Este bloque no tiene unidad vinculada.");
    renderBibliotecaExamModal();
    return;
  }
  if (!state.selectedTypes.length) {
    BibliotecaExamModalState.setError("Selecciona al menos un tipo de pregunta.");
    renderBibliotecaExamModal();
    return;
  }
  if (!state.selectedPlaneacionIds.length) {
    BibliotecaExamModalState.setError("Selecciona al menos una planeacion.");
    renderBibliotecaExamModal();
    return;
  }

  BibliotecaExamModalState.setSubmitting(true);
  BibliotecaExamModalState.setError("");
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
    BibliotecaExamModalState.setSubmitting(false);
    BibliotecaExamModalState.setError(error.message || "No se pudo generar el examen.");
    renderBibliotecaExamModal();
  }
}

// ---- BIBLIOTECA LISTA GENERATION MODAL ----

function openBibliotecaListaModal(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  BibliotecaListaModalState.open({
    open:                  true,
    conjuntoId:            conjunto.id,
    planeaciones,
    selectedPlaneacionIds: [],
    submitting:            false,
    error:                 ""
  });
  const modal = document.getElementById("biblioteca-lista-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaListaModal();
}

function closeBibliotecaListaModal() {
  BibliotecaListaModalState.close();
  const modal = document.getElementById("biblioteca-lista-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
}

async function submitBibliotecaListaModal() {
  const state = BibliotecaListaModalState.getState();
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
    BibliotecaListaModalState.setError("Selecciona al menos una planeacion.");
    renderBibliotecaListaModal();
    return;
  }

  BibliotecaListaModalState.setSubmitting(true);
  BibliotecaListaModalState.setError("");
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
    BibliotecaListaModalState.setSubmitting(false);
    BibliotecaListaModalState.setError(error.message || "No se pudieron generar las listas.");
    renderBibliotecaListaModal();
  }
}

// ---- AGREGAR TEMAS AL CONJUNTO MODAL ----

function openBibliotecaAgregarModal(conjunto) {
  if (!conjunto.unidad_id) {
    alert("Este bloque no tiene unidad vinculada. Para agregar planeaciones, usa el flujo normal de creacion desde la jerarquia.");
    return;
  }
  BibliotecaPlaneacionModalState.open({
    open:       true,
    conjuntoId: conjunto.id,
    unidadId:   conjunto.unidad_id,
    materia:    conjunto.materia || "",
    nivel:      conjunto.nivel   || "",
    unidad:     conjunto.unidad,
    temas:      [],
    error:      ""
  });
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaAgregarModal();
}

function closeBibliotecaAgregarModal() {
  BibliotecaPlaneacionModalState.close();
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (modal) modal.classList.add("hidden");
  document.body.classList.remove("overflow-hidden");
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
    BibliotecaPlaneacionModalState.setError("La duracion minima es 10 minutos.");
    renderBibliotecaAgregarModal();
    return;
  }

  // Before re-rendering, capture current activity selections from existing tema selects
  document.querySelectorAll("[data-bib-agr-actividad]").forEach(sel => {
    const localId = sel.dataset.localId;
    const momento = sel.dataset.momento;
    const val     = (sel.value || "").trim();
    const tema    = BibliotecaPlaneacionModalState.getTemaByLocalId(localId);
    if (!tema) return;
    if (!tema.actividades_momentos) tema.actividades_momentos = {};
    if (val && (typeof isActividadDidacticaValida !== "function" || isActividadDidacticaValida(val))) {
      tema.actividades_momentos[momento] = val;
    } else {
      delete tema.actividades_momentos[momento];
    }
  });

  BibliotecaPlaneacionModalState.addTema({
    localId: `agr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    titulo,
    duracion,
    actividades_momentos: {}
  });
  BibliotecaPlaneacionModalState.setError("");
  renderBibliotecaAgregarModal();
  document.getElementById("bib-agr-titulo")?.focus();
}

async function submitBibliotecaAgregarModal() {
  const s = BibliotecaPlaneacionModalState.getState();

  if (s.temas.length === 0) {
    BibliotecaPlaneacionModalState.setError("Agrega al menos un tema.");
    renderBibliotecaAgregarModal();
    return;
  }

  // Capture any unsaved activity selections before closing
  document.querySelectorAll("[data-bib-agr-actividad]").forEach(sel => {
    const localId = sel.dataset.localId;
    const momento = sel.dataset.momento;
    const val     = (sel.value || "").trim();
    const tema    = BibliotecaPlaneacionModalState.getTemaByLocalId(localId);
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

// ---- INIT ----

async function initBiblioteca() {
  injectBibliotecaModals();

  BibliotecaEvents.bind();

  await loadAndRenderBiblioteca();
}

window.initBiblioteca = initBiblioteca;
