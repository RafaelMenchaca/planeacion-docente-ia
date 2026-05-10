// =========================================================
// Biblioteca de materiales — biblioteca.page.js
// Vista principal: conjuntos de planeaciones (planeacion_batches)
// =========================================================

const bibliotecaState = {
  conjuntos: [],
  loading: false,
  error: "",
  searchQuery: "",
  selectedConjuntoId: null,
  expandedIds: new Set(),
  activeTab: {},          // { [conjuntoId]: "planeaciones" | "examenes" | "listas" }
  pendingBatchId: null,

  // Progress shown inline in cards (not inside modals)
  pendingConjunto: null,               // { tempId, titulo } — temp card during quick-create
  pendingPlaneacionesByBatchId: {},    // { [batchId]: { items:[{titulo,status,message}], error } }
  pendingExamenByBatchId: {},          // { [batchId]: { message, error } }
  pendingListaByBatchId: {},           // { [batchId]: { message, result, error } }

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

// Superficie pública para comunicación entre scripts
window.biblioteca = {
  get pendingBatchId() { return bibliotecaState.pendingBatchId; },
  set pendingBatchId(v) { bibliotecaState.pendingBatchId = v; },
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
    bibliotecaState.selectedConjuntoId = tempId;
    bibliotecaState.activeTab[tempId] = "planeaciones";
  },
  refresh: (options = {}) => loadAndRenderBiblioteca(options),
  finishPlaneacionesGeneration: (result) => finishBibliotecaPlaneacionesGeneration(result)
};

// Tipos de pregunta para el modal de examen
const BIB_EXAM_TIPOS = [
  { value: "opcion_multiple",           label: "Opcion multiple",    defaultCount: 5 },
  { value: "verdadero_falso",           label: "Verdadero / Falso",  defaultCount: 5 },
  { value: "respuesta_corta",           label: "Respuesta corta",    defaultCount: 3 },
  { value: "pregunta_abierta",          label: "Pregunta abierta",   defaultCount: 1 },
  { value: "emparejamiento",            label: "Emparejamiento",     defaultCount: 1 },
  { value: "calculo_numerico",          label: "Calculo / Numerica", defaultCount: 3 },
  { value: "ordenacion_jerarquizacion", label: "Ordenacion",         defaultCount: 1 }
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

function formatBibliotecaDisplayText(value) {
  const text = String(value ?? "").trim();
  if (!text) return "";
  return text.charAt(0).toLocaleUpperCase("es-MX") + text.slice(1);
}

function escapeBibliotecaDisplayText(value, fallback = "") {
  return escapeHtml(formatBibliotecaDisplayText(value) || fallback);
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
  bibliotecaState.selectedConjuntoId = safeId;
  if (tab) {
    bibliotecaState.activeTab[safeId] = tab;
  } else if (!bibliotecaState.activeTab[safeId]) {
    bibliotecaState.activeTab[safeId] = "planeaciones";
  }
}

function getSelectedConjunto() {
  return findConjuntoById(bibliotecaState.selectedConjuntoId);
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
    delete bibliotecaState.activeTab[pending.tempId];
    if (normalizeBibliotecaId(bibliotecaState.selectedConjuntoId) === normalizeBibliotecaId(pending.tempId)) {
      bibliotecaState.selectedConjuntoId = safeBatchId;
    }
    bibliotecaState.pendingConjunto = null;
  }

  if (!conjunto) return;

  conjunto.isPending = false;
  conjunto.status_ui = "ready";
  conjunto.planeaciones = mergePlaneaciones(conjunto.planeaciones, planeaciones || []);
  conjunto.total_planeaciones = conjunto.planeaciones.length;
  bibliotecaState.selectedConjuntoId = safeBatchId;
  bibliotecaState.activeTab[safeBatchId] = "planeaciones";
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
    bibliotecaState.selectedConjuntoId = batchId;
    bibliotecaState.activeTab[batchId] = "planeaciones";
  }

  renderBibliotecaContent();

  await loadAndRenderBiblioteca({
    silent: true,
    targetBatchId: batchId,
    activeTab: "planeaciones"
  });
}

// ---- RENDER TABS ----

function renderProgressItemHtml(item) {
  const status = item.status || "pending";
  const pill   = typeof renderProgressPill === "function"
    ? (item.statusLabel
        ? renderProgressPill(status, item.statusLabel)
        : renderProgressPill(status))
    : "";
  return `
    <div class="explorer-progress-item ${escapeHtml(status)}">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-semibold">${escapeBibliotecaDisplayText(item.titulo)}</p>
        ${pill}
      </div>
      ${item.message ? `<p class="mt-1 text-xs">${escapeHtml(item.message)}</p>` : ""}
    </div>`;
}

function renderPendingSpinnerCard(message) {
  const pill = typeof renderProgressPill === "function"
    ? renderProgressPill("generating", "Generando")
    : "";
  return `
    <div class="explorer-progress-item generating">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <p class="font-semibold">${escapeHtml(message || "Generando...")}</p>
        ${pill}
      </div>
    </div>`;
}

function renderBibliotecaSectionHeader(title, actionHtml = "") {
  return `
    <div class="biblioteca-section-header">
      <h4 class="biblioteca-section-title">${escapeHtml(title)}</h4>
      ${actionHtml ? `<div class="biblioteca-section-actions">${actionHtml}</div>` : ""}
    </div>
  `;
}

function renderPlaneacionesTab(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  const id = escapeHtml(String(conjunto.id));
  const addButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="agregar-planeacion" data-conjunto-id="${id}">
      + Agregar planeacion
    </button>`;

  let pendingHtml = "";
  if (conjunto.isPending) {
    const items = (window.explorerState?.progress?.items) || [];
    if (items.length) {
      pendingHtml = `<div class="space-y-1.5">${items.map(renderProgressItemHtml).join("")}</div>`;
    } else {
      const pill = typeof renderProgressPill === "function"
        ? renderProgressPill("generating", "Generando")
        : "";
      pendingHtml = `
        <div class="explorer-progress-item generating">
          <div class="flex flex-wrap items-center justify-between gap-2">
            <p class="font-semibold">Preparando generacion...</p>
            ${pill}
          </div>
        </div>`;
    }
  } else {
    const pending = bibliotecaState.pendingPlaneacionesByBatchId[conjunto.id];
    if (pending) {
      const errorHtml = pending.error
        ? `<div class="mt-2 text-xs text-rose-600">${escapeHtml(pending.error)}</div>`
        : "";
      pendingHtml = `
        <div class="space-y-1.5">
          ${pending.items.map(renderProgressItemHtml).join("")}
          ${errorHtml}
        </div>`;
    }
  }

  if (!planeaciones.length && !pendingHtml) {
    return `
      ${renderBibliotecaSectionHeader("Planeaciones del bloque", addButton)}
      <p class="biblioteca-empty-tab">Este bloque no tiene planeaciones.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Planeaciones del bloque", addButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml ? `<div class="mb-3">${pendingHtml}</div>` : ""}
      ${planeaciones.map(p => {
        const titulo   = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
        const duracion = p.duracion ? `${p.duracion} min` : "";
        const fecha    = bibFormatDate(p.fecha_creacion);
        const meta     = [duracion, fecha ? `Creado: ${fecha}` : ""].filter(Boolean).join(" &middot; ");
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <a href="detalle.html?id=${encodeURIComponent(p.id)}" class="biblioteca-btn-link">Ver planeacion</a>
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
      ${renderBibliotecaSectionHeader("Examenes del bloque")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear examenes cuando el bloque este listo.</p>
    `;
  }

  const examenes = Array.isArray(conjunto.examenes) ? conjunto.examenes : [];
  const pending  = bibliotecaState.pendingExamenByBatchId[conjunto.id];

  let pendingHtml = "";
  if (pending) {
    pendingHtml = renderPendingSpinnerCard(pending.message || "Generando examen...");
    if (pending.error) {
      pendingHtml += `<div class="text-xs text-rose-600 px-3 pb-2">${escapeHtml(pending.error)}</div>`;
    }
  }

  if (!examenes.length && !pending) {
    return `
      ${renderBibliotecaSectionHeader("Examenes del bloque", actionButton)}
      <p class="biblioteca-empty-tab">Aun no hay examenes en este bloque.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Examenes del bloque", actionButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${examenes.map(ex => {
        const titulo    = escapeBibliotecaDisplayText(ex.titulo, "Examen");
        const preguntas = ex.total_preguntas ? `${ex.total_preguntas} preguntas` : "";
        const fecha     = bibFormatDate(ex.created_at);
        const status    = ex.status ? `Estado: ${escapeHtml(String(ex.status))}` : "";
        const meta      = [preguntas, status, fecha ? `Creado: ${fecha}` : ""].filter(Boolean).join(" &middot; ");
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="ver-examen"
                data-examen-id="${escapeHtml(String(ex.id))}">Ver</button>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-examen"
                data-examen-id="${escapeHtml(String(ex.id))}">Descargar</button>
            </div>
          </div>
        `;
      }).join("")}
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
    pendingHtml = renderPendingSpinnerCard(pending.message || "Generando listas de cotejo...");
    if (pending.error) {
      pendingHtml += `<div class="text-xs text-rose-600 px-3 pb-2">${escapeHtml(pending.error)}</div>`;
    }
    if (pending.result) {
      const r = pending.result;
      pendingHtml += `<div class="text-xs text-emerald-700 px-3 pb-2">
        ${r.created > 0 ? `${r.created} lista(s) creada(s).` : ""}
        ${r.skipped > 0 ? ` ${r.skipped} ya existia(n).` : ""}
      </div>`;
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
        const titulo = escapeBibliotecaDisplayText(lista.titulo, "Lista de cotejo");
        const tema   = lista.tema ? escapeBibliotecaDisplayText(lista.tema) : "";
        const puntos = lista.total_puntos ? `${lista.total_puntos} puntos` : "";
        const fecha  = bibFormatDate(lista.created_at);
        const meta   = [tema, puntos, fecha ? `Creado: ${fecha}` : ""].filter(Boolean).join(" &middot; ");
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="ver-lista"
                data-lista-id="${escapeHtml(String(lista.id))}">Ver</button>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-lista"
                data-lista-id="${escapeHtml(String(lista.id))}">Descargar</button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ---- RENDER CONJUNTO ----

function renderBibliotecaTabs(conjunto) {
  const activeTab = bibliotecaState.activeTab[conjunto.id] || "planeaciones";
  const id = escapeHtml(String(conjunto.id));
  return `
    <div class="biblioteca-tabs" role="tablist">
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "planeaciones" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="planeaciones">
        Planeaciones <span class="biblioteca-tab-count">${conjunto.total_planeaciones || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "examenes" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="examenes">
        Examenes <span class="biblioteca-tab-count">${conjunto.total_examenes || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "listas" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="listas">
        Listas de cotejo <span class="biblioteca-tab-count">${conjunto.total_listas_cotejo || 0}</span>
      </button>
    </div>
  `;
}

function renderBibliotecaTabContent(conjunto) {
  const activeTab = bibliotecaState.activeTab[conjunto.id] || "planeaciones";
  return `
    <div class="biblioteca-tab-content">
      ${activeTab === "planeaciones" ? renderPlaneacionesTab(conjunto) : ""}
      ${activeTab === "examenes"     ? renderExamenesTab(conjunto)     : ""}
      ${activeTab === "listas"       ? renderListasCotejoTab(conjunto) : ""}
    </div>
  `;
}

function renderConjuntoSidebarItem(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const isSelected = normalizeBibliotecaId(bibliotecaState.selectedConjuntoId) === normalizeBibliotecaId(conjunto.id);
  const isPending = !!conjunto.isPending;
  const titulo = escapeBibliotecaDisplayText(conjunto.titulo, "Sin titulo");
  const meta = [
    conjunto.nivel ? escapeBibliotecaDisplayText(conjunto.nivel) : "Sin nivel",
    conjunto.materia ? escapeBibliotecaDisplayText(conjunto.materia) : "Sin materia",
    conjunto.unidad ? `Unidad ${escapeBibliotecaDisplayText(conjunto.unidad)}` : ""
  ].filter(Boolean).join(" | ");
  const fecha = bibFormatDateTime(conjunto.created_at);
  const planeaciones = Number(conjunto.total_planeaciones || 0);
  const examenes = Number(conjunto.total_examenes || 0);
  const listas = Number(conjunto.total_listas_cotejo || 0);

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
          ${planeaciones} planeaciones · ${examenes} examenes · ${listas} listas de cotejo
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
    <section class="biblioteca-detail">
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
  const metaItems = [
    { label: "Nivel", value: conjunto.nivel ? escapeBibliotecaDisplayText(conjunto.nivel) : "Sin nivel" },
    { label: "Materia", value: conjunto.materia ? escapeBibliotecaDisplayText(conjunto.materia) : "Sin materia" },
    { label: "Unidad", value: conjunto.unidad ? `Unidad ${escapeBibliotecaDisplayText(conjunto.unidad)}` : "Sin unidad" },
    { label: "Creado", value: bibFormatDateTime(conjunto.created_at) || (conjunto.isPending ? "Generando" : "Sin fecha") }
  ];

  return `
    <section class="biblioteca-detail">
      <div class="biblioteca-detail-head">
        <div class="biblioteca-detail-summary">
          <p class="biblioteca-detail-eyebrow">BLOQUE SELECCIONADO</p>
          <h3 class="biblioteca-detail-title">${titulo}</h3>
          <div class="biblioteca-detail-meta-grid">
            ${metaItems.map(item => `
              <div class="biblioteca-detail-meta-item">
                <span class="biblioteca-detail-meta-label">${escapeHtml(item.label)}</span>
                <span class="biblioteca-detail-meta-value">${item.value}</span>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
      ${renderBibliotecaTabs(conjunto)}
      ${renderBibliotecaTabContent(conjunto)}
    </section>
  `;
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
    searchInput.addEventListener("input", onBibliotecaSearch);
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
  const wasSelected   = prevTempId ? normalizeBibliotecaId(bibliotecaState.selectedConjuntoId) === normalizeBibliotecaId(prevTempId) : false;
  const prevActiveTab = prevTempId ? (bibliotecaState.activeTab[prevTempId] || "planeaciones") : null;
  const prevSelectedId = normalizeBibliotecaId(bibliotecaState.selectedConjuntoId);
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
      delete bibliotecaState.activeTab[prevTempId];
      if (wasSelected) {
        const prevIds     = new Set(prevConjuntos.map(c => normalizeBibliotecaId(c.id)));
        const newConjunto = targetBatchId
          ? newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId)
          : newList.find(c => !prevIds.has(normalizeBibliotecaId(c.id)));
        if (newConjunto) {
          bibliotecaState.selectedConjuntoId = normalizeBibliotecaId(newConjunto.id);
          bibliotecaState.activeTab[newConjunto.id] = prevActiveTab;
        }
      }
    }

    if (targetBatchId) {
      const target = newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId);
      if (target) {
        bibliotecaState.selectedConjuntoId = normalizeBibliotecaId(target.id);
        bibliotecaState.activeTab[target.id] = targetActiveTab;
      }
    }

    bibliotecaState.conjuntos = newList;
    bibliotecaState.loading   = false;
    bibliotecaState.pendingConjunto = null;

    const selectedStillExists = findConjuntoById(bibliotecaState.selectedConjuntoId);
    if (!selectedStillExists) {
      const fallback = targetBatchId
        ? newList.find(c => normalizeBibliotecaId(c.id) === targetBatchId)
        : newList.find(c => normalizeBibliotecaId(c.id) === prevSelectedId) || newList[0] || null;
      bibliotecaState.selectedConjuntoId = fallback ? normalizeBibliotecaId(fallback.id) : null;
      if (fallback && !bibliotecaState.activeTab[fallback.id]) {
        bibliotecaState.activeTab[fallback.id] = "planeaciones";
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
  renderBibliotecaContent();
}

function onBibliotecaClick(event) {
  const btn = event.target.closest("[data-bib-action]");
  if (!btn) return;

  const action     = btn.dataset.bibAction;
  const conjuntoId = btn.dataset.conjuntoId;
  const tab        = btn.dataset.tab;
  const examenId   = btn.dataset.examenId;
  const listaId    = btn.dataset.listaId;

  switch (action) {
    case "select-conjunto": {
      setSelectedConjunto(conjuntoId);
      renderBibliotecaContent();
      break;
    }

    case "toggle-expand": {
      setSelectedConjunto(conjuntoId);
      renderBibliotecaContent();
      break;
    }

    case "switch-tab": {
      setSelectedConjunto(conjuntoId, { tab });
      renderBibliotecaContent();
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

    case "descargar-examen": {
      if (examenId) bibDescargarExamen(examenId);
      break;
    }

    case "descargar-lista": {
      if (listaId) bibDescargarLista(listaId);
      break;
    }
  }
}

// ---- DOWNLOAD HELPERS ----

async function bibDescargarExamen(examenId) {
  try {
    if (typeof window.downloadExamWord === "function") {
      await window.downloadExamWord(examenId);
    }
  } catch (error) {
    console.error("[biblioteca] Error descargando examen:", error);
  }
}

async function bibDescargarLista(listaId) {
  try {
    const lista = await window.obtenerListaCoTejoDetalle(listaId);
    if (typeof window.descargarListaCotejoWord === "function") {
      window.descargarListaCotejoWord(lista);
    }
  } catch (error) {
    console.error("[biblioteca] Error descargando lista:", error);
  }
}

// ---- EXAM PREVIEW (reusa modal existente de dashboard.page.js) ----

async function openBibliotecaExamenPreview(examenId) {
  if (!window.explorerState) return;

  window.explorerState.examPreview = { open: true, examenId, loading: true, error: "" };
  if (typeof window.renderExamPreviewModal === "function") window.renderExamPreviewModal();

  try {
    const examen = await window.obtenerExamenDetalle(examenId);
    window.explorerState.examenDetalleById = window.explorerState.examenDetalleById || {};
    window.explorerState.examenDetalleById[examenId] = examen;
    window.explorerState.examPreview.loading = false;
    if (typeof window.renderExamPreviewModal === "function") window.renderExamPreviewModal();
  } catch (error) {
    console.error("[biblioteca] Error cargando examen:", error);
    window.explorerState.examPreview.loading = false;
    window.explorerState.examPreview.error   = "No se pudo cargar el examen.";
    if (typeof window.renderExamPreviewModal === "function") window.renderExamPreviewModal();
  }
}

// ---- LISTA PREVIEW (reusa modal existente de dashboard.page.js) ----

async function openBibliotecaListaPreview(listaId) {
  if (!window.explorerState) return;

  window.explorerState.listaCotejoPreview = { open: true, listaId, listaData: null, loading: true, error: "" };
  if (typeof window.renderListaCotejoPreviewModal === "function") window.renderListaCotejoPreviewModal();

  try {
    const lista = await window.obtenerListaCoTejoDetalle(listaId);
    window.explorerState.listaCotejoPreview = { open: true, listaId, listaData: lista, loading: false, error: "" };
    if (typeof window.renderListaCotejoPreviewModal === "function") window.renderListaCotejoPreviewModal();
  } catch (error) {
    console.error("[biblioteca] Error cargando lista de cotejo:", error);
    window.explorerState.listaCotejoPreview = {
      ...window.explorerState.listaCotejoPreview,
      loading: false,
      error: "No se pudo cargar la lista de cotejo."
    };
    if (typeof window.renderListaCotejoPreviewModal === "function") window.renderListaCotejoPreviewModal();
  }
}

// ---- BIBLIOTECA EXAM GENERATION MODAL ----

function openBibliotecaExamModal(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  bibliotecaState.examModal = {
    open:                  true,
    conjuntoId:            conjunto.id,
    unidadId:              conjunto.unidad_id || null,
    planeaciones,
    selectedPlaneacionIds: planeaciones.map(p => String(p.id)),  // all selected by default
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

  const state    = bibliotecaState.examModal;
  const conjunto = findConjuntoById(state.conjuntoId);
  const titulo   = conjunto ? escapeBibliotecaDisplayText(conjunto.titulo, "Bloque") : "";

  const tiposHtml = BIB_EXAM_TIPOS.map(tipo => {
    const isSelected = state.selectedTypes.includes(tipo.value);
    const count      = state.questionCounts[tipo.value] || tipo.defaultCount;
    return `
      <label class="flex items-start gap-3 rounded-xl border ${isSelected ? "border-cyan-200 bg-cyan-50" : "border-slate-200 bg-white"} p-3 cursor-pointer select-none">
        <input type="checkbox" class="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300"
          data-bib-exam-type="${escapeHtml(tipo.value)}" ${isSelected ? "checked" : ""} />
        <div class="flex-1 min-w-0">
          <span class="block text-sm font-semibold text-slate-800">${escapeHtml(tipo.label)}</span>
          ${isSelected ? `
            <div class="mt-1.5 flex items-center gap-2">
              <span class="text-xs text-slate-500">Preguntas:</span>
              <input type="number" min="1" max="30" value="${count}"
                data-bib-exam-count="${escapeHtml(tipo.value)}"
                class="w-16 rounded-lg border border-slate-300 px-2 py-1 text-xs focus:border-cyan-600 focus:outline-none" />
            </div>
          ` : ""}
        </div>
      </label>
    `;
  }).join("");

  // Planeaciones with checkboxes
  const planeacionesHtml = state.planeaciones.length
    ? `<div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 max-h-44 overflow-y-auto space-y-1">
        ${state.planeaciones.map(p => {
          const pid      = String(p.id);
          const checked  = state.selectedPlaneacionIds.includes(pid);
          const titulo_p = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          const dur      = p.duracion ? ` · ${p.duracion} min` : "";
          return `
            <label class="flex items-start gap-2 py-0.5 cursor-pointer select-none">
              <input type="checkbox" class="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300"
                data-bib-exam-planid="${escapeHtml(pid)}" ${checked ? "checked" : ""} />
              <span class="text-sm text-slate-700">${titulo_p}<span class="text-xs text-slate-400">${dur}</span></span>
            </label>`;
        }).join("")}
      </div>`
    : `<p class="text-xs text-slate-500">No hay planeaciones en este bloque.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  modal.querySelector(".biblioteca-modal-card").innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-cyan-700">Generar examen</p>
        <h3 class="mt-1 text-base font-semibold text-slate-900">${titulo}</h3>
      </div>
      <button type="button" id="bib-exam-close"
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
        &#10005;
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <p class="mb-2 text-sm font-semibold text-slate-700">Tipos de pregunta</p>
        <div class="grid grid-cols-1 gap-2 sm:grid-cols-2">${tiposHtml}</div>
      </div>

      <div>
        <p class="mb-1 text-sm font-semibold text-slate-700">
          Planeaciones a incluir
          <span class="ml-1 text-xs font-normal text-slate-400">(${state.selectedPlaneacionIds.length} seleccionadas)</span>
        </p>
        ${planeacionesHtml}
      </div>

      ${errorHtml}

      <div class="flex flex-wrap justify-end gap-2 pt-1">
        <button type="button" id="bib-exam-cancel"
          class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
        <button type="button" id="bib-exam-submit"
          class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
          ${state.submitting ? "disabled" : ""}>
          ${state.submitting ? "Iniciando..." : "Generar examen"}
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
      // Update the counter without full re-render
      const counter = modal.querySelector("[data-bib-exam-planid]")
        ?.closest(".space-y-4")
        ?.querySelector(".text-xs.font-normal.text-slate-400");
      if (counter) {
        counter.textContent = `(${bibliotecaState.examModal.selectedPlaneacionIds.length} seleccionadas)`;
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

    const payload = {
      unidad_id:           state.unidadId,
      batch_id:            state.conjuntoId,
      tipos_pregunta:      state.selectedTypes,
      cantidades_pregunta: cantidades,
      tema_ids:            state.selectedPlaneacionIds
    };

    const genResponse = await apiExamenesGenerate(payload, session.access_token);
    const jobId = genResponse?.job_id;
    if (!jobId) throw new Error("No se recibio job_id del servidor.");

    // Close modal immediately — progress will show in the card
    const conjuntoId = state.conjuntoId;
    closeBibliotecaExamModal();
    setSelectedConjunto(conjuntoId, { tab: "examenes" });
    bibliotecaState.pendingExamenByBatchId[conjuntoId] = { message: "Iniciando generacion de examen...", error: "" };
    renderBibliotecaContent();

    // Poll in background
    ;(async () => {
      try {
        const POLL_MS  = 3000;
        const MAX_POLLS = 60;
        let polls = 0;
        while (polls < MAX_POLLS) {
          await new Promise(r => setTimeout(r, POLL_MS));
          polls++;
          const statusRes = await apiExamenGenerationStatus(jobId, session.access_token);
          if (statusRes?.current_step) {
            bibliotecaState.pendingExamenByBatchId[conjuntoId] = {
              message: statusRes.current_step,
              error: ""
            };
            renderBibliotecaContent();
          }
          if (statusRes?.status === "completed") break;
          if (statusRes?.status === "failed") {
            throw new Error(statusRes.error_message || "La generacion del examen fallo.");
          }
        }
        if (polls >= MAX_POLLS) throw new Error("La generacion tardo demasiado. Intenta de nuevo.");

        delete bibliotecaState.pendingExamenByBatchId[conjuntoId];
        await loadAndRenderBiblioteca({
          silent: true,
          targetBatchId: conjuntoId,
          activeTab: "examenes"
        });
      } catch (pollError) {
        console.error("[biblioteca] Error en polling de examen:", pollError);
        bibliotecaState.pendingExamenByBatchId[conjuntoId] = {
          message: "",
          error: pollError.message || "No se pudo completar la generacion del examen."
        };
        renderBibliotecaContent();
      }
    })();

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
    selectedPlaneacionIds: planeaciones.map(p => String(p.id)),  // all selected by default
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
  const titulo   = conjunto ? escapeBibliotecaDisplayText(conjunto.titulo, "Bloque") : "";

  const planeacionesHtml = state.planeaciones.length
    ? `<div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 max-h-44 overflow-y-auto space-y-1">
        ${state.planeaciones.map(p => {
          const pid      = String(p.id);
          const checked  = state.selectedPlaneacionIds.includes(pid);
          const titulo_p = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          const dur      = p.duracion ? ` · ${p.duracion} min` : "";
          return `
            <label class="flex items-start gap-2 py-0.5 cursor-pointer select-none">
              <input type="checkbox" class="mt-0.5 h-4 w-4 flex-shrink-0 rounded border-slate-300"
                data-bib-lista-planid="${escapeHtml(pid)}" ${checked ? "checked" : ""} />
              <span class="text-sm text-slate-700">${titulo_p}<span class="text-xs text-slate-400">${dur}</span></span>
            </label>`;
        }).join("")}
      </div>`
    : `<p class="text-sm text-slate-500">No hay planeaciones en este bloque.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  modal.querySelector(".biblioteca-modal-card").innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-cyan-700">Generar listas de cotejo</p>
        <h3 class="mt-1 text-base font-semibold text-slate-900">${titulo}</h3>
        <p class="mt-1 text-sm text-slate-500">Selecciona las planeaciones para las que deseas generar lista de cotejo.</p>
      </div>
      <button type="button" id="bib-lista-close"
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
        &#10005;
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <p class="mb-1 text-sm font-semibold text-slate-700">
          Planeaciones
          <span class="ml-1 text-xs font-normal text-slate-400">(${state.selectedPlaneacionIds.length} seleccionadas)</span>
        </p>
        ${planeacionesHtml}
      </div>

      ${errorHtml}

      <div class="flex flex-wrap justify-end gap-2 pt-1">
        <button type="button" id="bib-lista-cancel"
          class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Cancelar
        </button>
        <button type="button" id="bib-lista-submit"
          class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
          ${state.submitting ? "disabled" : ""}>
          ${state.submitting ? "Iniciando..." : "Generar listas de cotejo"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-lista-close")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-cancel")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-submit")?.addEventListener("click", submitBibliotecaListaModal);

  modal.querySelectorAll("[data-bib-lista-planid]").forEach(cb => {
    cb.addEventListener("change", e => {
      const pid = e.target.dataset.bibListaPlanid;
      if (e.target.checked) {
        if (!bibliotecaState.listaModal.selectedPlaneacionIds.includes(pid)) {
          bibliotecaState.listaModal.selectedPlaneacionIds.push(pid);
        }
      } else {
        bibliotecaState.listaModal.selectedPlaneacionIds =
          bibliotecaState.listaModal.selectedPlaneacionIds.filter(id => id !== pid);
      }
      const counter = modal.querySelector(".text-xs.font-normal.text-slate-400");
      if (counter) {
        counter.textContent = `(${bibliotecaState.listaModal.selectedPlaneacionIds.length} seleccionadas)`;
      }
    });
  });
}

async function submitBibliotecaListaModal() {
  const state = bibliotecaState.listaModal;

  if (!state.selectedPlaneacionIds.length) {
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
    const selectedIds = [...state.selectedPlaneacionIds];

    // Close modal immediately — progress shows in card
    closeBibliotecaListaModal();
    setSelectedConjunto(conjuntoId, { tab: "listas" });
    bibliotecaState.pendingListaByBatchId[conjuntoId] = {
      message: `Generando ${selectedIds.length} lista(s) de cotejo...`,
      result:  null,
      error:   ""
    };
    renderBibliotecaContent();

    // Generate in background
    ;(async () => {
      try {
        const payload = { planeacion_ids: selectedIds };
        const res = await apiListasCoTejoGenerate(payload, session.access_token);
        const created = res?.created ?? 0;
        const skipped = Array.isArray(res?.skipped) ? res.skipped.length : (res?.skipped ?? 0);

        bibliotecaState.pendingListaByBatchId[conjuntoId] = {
          message: "Listo",
          result:  { created, skipped },
          error:   ""
        };
        renderBibliotecaContent();

        await new Promise(r => setTimeout(r, 1500));
        delete bibliotecaState.pendingListaByBatchId[conjuntoId];
        await loadAndRenderBiblioteca({
          silent: true,
          targetBatchId: conjuntoId,
          activeTab: "listas"
        });
      } catch (genError) {
        console.error("[biblioteca] Error generando listas:", genError);
        bibliotecaState.pendingListaByBatchId[conjuntoId] = {
          message: "",
          result:  null,
          error:   genError.message || "No se pudieron generar las listas de cotejo."
        };
        renderBibliotecaContent();
      }
    })();

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
      ${s.unidad != null ? ` &middot; Unidad ${escapeHtml(String(s.unidad))}` : ""}
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
                <div class="flex items-center gap-2 mt-1.5">
                  <label class="w-28 flex-shrink-0 text-xs text-slate-500">${escapeHtml(m.label)}</label>
                  <select
                    data-bib-agr-actividad
                    data-local-id="${escapeHtml(t.localId)}"
                    data-momento="${escapeHtml(m.key)}"
                    class="flex-1 rounded-lg border border-slate-200 px-2 py-1 text-xs focus:border-cyan-600 focus:outline-none">
                    <option value="">— sin actividad —</option>
                    ${opts}
                  </select>
                </div>`;
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
            ${actSelects ? `<div class="mt-1">${actSelects}</div>` : ""}
          </div>`;
      }).join("")
    : `<p class="text-xs text-slate-400 py-1">Sin temas. Agrega al menos uno usando el formulario de abajo.</p>`;

  const addFormHtml = `
    <div class="mt-3 rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-2">
      <p class="text-xs font-semibold text-slate-500 uppercase tracking-wide">Agregar tema</p>
      <div class="flex gap-2">
        <input type="text" id="bib-agr-titulo" placeholder="Titulo del tema"
          class="flex-1 rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none" />
        <input type="number" id="bib-agr-duracion" value="50" min="10" max="300"
          class="w-20 rounded-xl border border-slate-300 bg-white px-2 py-2 text-sm text-center focus:border-cyan-600 focus:outline-none"
          title="Duracion en minutos" />
      </div>
      <div class="flex justify-end">
        <button type="button" id="bib-agr-add"
          class="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          + Agregar tema
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
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
        &#10005;
      </button>
    </div>

    ${contextHtml}

    <div class="mt-4 space-y-2">
      <p class="text-sm font-semibold text-slate-700">Temas a generar</p>
      <div class="space-y-2 max-h-64 overflow-y-auto">${temasListHtml}</div>
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

  // Close modal immediately
  closeBibliotecaAgregarModal();

  // Show progress in card
  setSelectedConjunto(conjuntoId, { tab: "planeaciones" });
  bibliotecaState.pendingPlaneacionesByBatchId[conjuntoId] = {
    items: temasSnap.map(t => ({ titulo: t.titulo, status: "pending", message: "" })),
    error: ""
  };
  renderBibliotecaContent();

  // Generate in background
  ;(async () => {
    try {
      const body = {
        temas:    temasSnap,
        materia:  materia || undefined,
        nivel:    nivel   || undefined,
        batch_id: conjuntoId
      };

      const result = await generarPlaneacionesUnidadConProgreso({ unidadId, body }, (evt) => {
        const pending = bibliotecaState.pendingPlaneacionesByBatchId[conjuntoId];
        if (!pending) return;
        const idx = (evt.index ?? 1) - 1;
        if (idx >= 0 && pending.items[idx]) {
          if (evt.type === "item_started")    pending.items[idx].status = "generating";
          if (evt.type === "item_completed")  pending.items[idx].status = "ready";
          if (evt.type === "item_error") {
            pending.items[idx].status  = "error";
            pending.items[idx].message = evt.message || "Error";
          }
          if (evt.type === "item_skipped") {
            pending.items[idx].status  = "skipped";
            pending.items[idx].message = evt.message || "Ya existe";
          }
          renderBibliotecaContent();
        }
      });

      const batchId = getGenerationBatchId(result) || conjuntoId;
      applyGenerationResultToPendingItems(batchId, result || {});
      applyOptimisticPlaneacionesToConjunto(batchId, normalizeGeneratedPlaneaciones(result || {}));
      if (Number(result?.error_count || 0) === 0) {
        delete bibliotecaState.pendingPlaneacionesByBatchId[conjuntoId];
        if (batchId !== conjuntoId) delete bibliotecaState.pendingPlaneacionesByBatchId[batchId];
      }
      setSelectedConjunto(batchId, { tab: "planeaciones" });
      renderBibliotecaContent();

      await loadAndRenderBiblioteca({
        silent: true,
        targetBatchId: batchId,
        activeTab: "planeaciones"
      });
    } catch (error) {
      console.error("[biblioteca] Error generando planeaciones:", error);
      const pending = bibliotecaState.pendingPlaneacionesByBatchId[conjuntoId];
      if (pending) pending.error = error.message || "No se pudieron generar las planeaciones.";
      renderBibliotecaContent();
    }
  })();
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
