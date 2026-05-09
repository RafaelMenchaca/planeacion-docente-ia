// =========================================================
// Biblioteca de materiales — biblioteca.page.js
// Vista principal: conjuntos de planeaciones (planeacion_batches)
// =========================================================

const bibliotecaState = {
  conjuntos: [],
  loading: false,
  error: "",
  searchQuery: "",
  expandedIds: new Set(),
  activeTab: {},          // { [conjuntoId]: "planeaciones" | "examenes" | "listas" }
  pendingBatchId: null,

  examModal: {
    open: false,
    conjuntoId: null,
    unidadId: null,
    planeaciones: [],
    selectedTypes: [],
    questionCounts: {},
    submitting: false,
    error: ""
  },

  listaModal: {
    open: false,
    conjuntoId: null,
    planeaciones: [],
    submitting: false,
    error: "",
    result: null  // { created, skipped }
  },

  agregarModal: {
    open: false,
    conjuntoId: null,
    unidadId: null,
    materia: "",
    nivel: "",
    unidad: null,
    temas: [],       // [{ localId, titulo, duracion }]
    generating: false,
    progress: [],    // [{ titulo, status, message }]
    done: false,
    error: ""
  }
};

// Superficie pública para comunicación entre scripts
window.biblioteca = {
  get pendingBatchId() { return bibliotecaState.pendingBatchId; },
  set pendingBatchId(v) { bibliotecaState.pendingBatchId = v; },
  refresh: () => loadAndRenderBiblioteca()
};

// Tipos de pregunta para el modal de examen
const BIB_EXAM_TIPOS = [
  { value: "opcion_multiple",         label: "Opcion multiple",        defaultCount: 5 },
  { value: "verdadero_falso",         label: "Verdadero / Falso",      defaultCount: 5 },
  { value: "respuesta_corta",         label: "Respuesta corta",        defaultCount: 3 },
  { value: "pregunta_abierta",        label: "Pregunta abierta",       defaultCount: 1 },
  { value: "emparejamiento",          label: "Emparejamiento",         defaultCount: 1 },
  { value: "calculo_numerico",        label: "Calculo / Numerica",     defaultCount: 3 },
  { value: "ordenacion_jerarquizacion", label: "Ordenacion",           defaultCount: 1 }
];

// ---- HELPERS ----

function bibFormatDate(dateStr) {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toLocaleDateString("es-MX", {
      day: "2-digit", month: "short", year: "numeric"
    });
  } catch {
    return "";
  }
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

function getBibliotecaStats() {
  const cs = bibliotecaState.conjuntos;
  return {
    totalConjuntos:    cs.length,
    totalPlaneaciones: cs.reduce((s, c) => s + (c.total_planeaciones  || 0), 0),
    totalExamenes:     cs.reduce((s, c) => s + (c.total_examenes      || 0), 0),
    totalListas:       cs.reduce((s, c) => s + (c.total_listas_cotejo || 0), 0)
  };
}

function findConjuntoById(id) {
  return bibliotecaState.conjuntos.find(c => c.id === id) || null;
}

// ---- RENDER STATS ----

function renderBibliotecaStats(stats) {
  const items = [
    { label: "Conjuntos",       value: stats.totalConjuntos },
    { label: "Planeaciones",    value: stats.totalPlaneaciones },
    { label: "Examenes",        value: stats.totalExamenes },
    { label: "Listas de cotejo", value: stats.totalListas }
  ];
  return `
    <div class="biblioteca-stats-grid">
      ${items.map(item => `
        <div class="biblioteca-stat-card">
          <div class="biblioteca-stat-body">
            <span class="biblioteca-stat-value">${item.value}</span>
            <span class="biblioteca-stat-label">${escapeHtml(item.label)}</span>
          </div>
        </div>
      `).join("")}
    </div>
  `;
}

// ---- RENDER TABS ----

function renderPlaneacionesTab(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  if (!planeaciones.length) {
    return `<p class="biblioteca-empty-tab">Este conjunto no tiene planeaciones disponibles.</p>`;
  }
  return `
    <div class="biblioteca-items-list">
      ${planeaciones.map(p => {
        const titulo = escapeHtml(p.tema || p.custom_title || "Sin titulo");
        const duracion = p.duracion ? `${p.duracion} min` : "";
        const fecha = bibFormatDate(p.fecha_creacion);
        const meta = [duracion, fecha ? `Creado: ${fecha}` : ""].filter(Boolean).join(" &middot; ");
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <a href="detalle.html?id=${encodeURIComponent(p.id)}" class="biblioteca-btn-link">Abrir</a>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderExamenesTab(conjunto) {
  const examenes = Array.isArray(conjunto.examenes) ? conjunto.examenes : [];
  if (!examenes.length) {
    return `<p class="biblioteca-empty-tab">Aun no hay examenes en este conjunto.</p>`;
  }
  return `
    <div class="biblioteca-items-list">
      ${examenes.map(ex => {
        const titulo = escapeHtml(ex.titulo || "Examen");
        const preguntas = ex.total_preguntas ? `${ex.total_preguntas} preguntas` : "";
        const fecha = bibFormatDate(ex.created_at);
        const meta = [preguntas, fecha ? `Creado: ${fecha}` : ""].filter(Boolean).join(" &middot; ");
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
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderListasCotejoTab(conjunto) {
  const listas = Array.isArray(conjunto.listas_cotejo) ? conjunto.listas_cotejo : [];
  if (!listas.length) {
    return `<p class="biblioteca-empty-tab">Aun no hay listas de cotejo en este conjunto.</p>`;
  }
  return `
    <div class="biblioteca-items-list">
      ${listas.map(lista => {
        const titulo = escapeHtml(lista.titulo || "Lista de cotejo");
        const tema   = lista.tema ? escapeHtml(lista.tema) : "";
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
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ---- RENDER CONJUNTO ----

function renderConjuntoExpanded(conjunto) {
  const activeTab = bibliotecaState.activeTab[conjunto.id] || "planeaciones";
  const id = escapeHtml(String(conjunto.id));
  return `
    <div class="biblioteca-conjunto-body">
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
      <div class="biblioteca-tab-content">
        ${activeTab === "planeaciones" ? renderPlaneacionesTab(conjunto) : ""}
        ${activeTab === "examenes"     ? renderExamenesTab(conjunto)     : ""}
        ${activeTab === "listas"       ? renderListasCotejoTab(conjunto) : ""}
      </div>
    </div>
  `;
}

function renderConjuntoCard(conjunto) {
  const id         = escapeHtml(String(conjunto.id));
  const isExpanded = bibliotecaState.expandedIds.has(conjunto.id);
  const titulo     = escapeHtml(conjunto.titulo || "Sin titulo");
  const metaParts  = [
    conjunto.nivel   ? escapeHtml(conjunto.nivel)             : "Sin nivel",
    conjunto.materia ? escapeHtml(conjunto.materia)           : "Sin materia",
    conjunto.unidad  ? `Unidad ${escapeHtml(String(conjunto.unidad))}` : ""
  ].filter(Boolean);
  const meta = metaParts.join(" &middot; ");
  const fecha = bibFormatDate(conjunto.created_at);

  return `
    <div class="biblioteca-conjunto-card">
      <div class="biblioteca-conjunto-header">
        <div class="biblioteca-conjunto-eyebrow">Conjunto de planeaciones</div>
        <h3 class="biblioteca-conjunto-title">${titulo}</h3>
        <p class="biblioteca-conjunto-meta">${meta}</p>
        ${fecha ? `<p class="biblioteca-conjunto-date">Creado: ${fecha}</p>` : ""}

        <div class="biblioteca-conjunto-counts">
          <span class="biblioteca-count-pill">${conjunto.total_planeaciones || 0} planeaciones</span>
          <span class="biblioteca-count-pill">${conjunto.total_examenes || 0} examenes</span>
          <span class="biblioteca-count-pill">${conjunto.total_listas_cotejo || 0} listas</span>
        </div>

        <div class="biblioteca-conjunto-actions">
          <button type="button" class="biblioteca-btn-primary"
            data-bib-action="toggle-expand" data-conjunto-id="${id}">
            ${isExpanded ? "Ocultar contenido" : "Ver contenido"}
          </button>
          <button type="button" class="biblioteca-btn-secondary"
            data-bib-action="agregar-planeacion" data-conjunto-id="${id}">
            + Agregar planeacion
          </button>
          <button type="button" class="biblioteca-btn-secondary"
            data-bib-action="generar-examen" data-conjunto-id="${id}">
            Generar examen
          </button>
          <button type="button" class="biblioteca-btn-secondary"
            data-bib-action="generar-lista" data-conjunto-id="${id}">
            Generar lista de cotejo
          </button>
        </div>
      </div>
      ${isExpanded ? renderConjuntoExpanded(conjunto) : ""}
    </div>
  `;
}

// ---- MAIN RENDER ----

function renderBibliotecaContent() {
  const container = document.getElementById("explorer-content");
  if (!container) return;

  // Mantener workspace visible aunque explorerState.planteles esté vacío
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

  const stats    = getBibliotecaStats();
  const filtered = getFilteredConjuntos();

  let conjuntosHtml;
  if (!bibliotecaState.conjuntos.length) {
    conjuntosHtml = `
      <div class="biblioteca-empty">
        <h3 class="biblioteca-empty-title">Aun no tienes conjuntos de planeaciones</h3>
        <p class="biblioteca-empty-text">Crea tus primeras planeaciones para comenzar a organizar tus materiales.</p>
        <button type="button" class="biblioteca-btn-primary" style="margin-top:1rem"
          data-bib-action="crear-planeaciones">+ Crear planeaciones</button>
      </div>
    `;
  } else if (!filtered.length) {
    conjuntosHtml = `
      <div class="biblioteca-empty">
        <p class="biblioteca-empty-text">No se encontraron conjuntos con esa busqueda.</p>
      </div>
    `;
  } else {
    conjuntosHtml = `
      <div class="biblioteca-conjuntos-list">
        ${filtered.map(c => renderConjuntoCard(c)).join("")}
      </div>
    `;
  }

  container.innerHTML = `
    <div class="biblioteca-shell">
      ${renderBibliotecaStats(stats)}
      <div class="biblioteca-search-wrap">
        <input
          id="biblioteca-search"
          type="search"
          class="biblioteca-search-input"
          placeholder="Buscar por titulo, materia, nivel o unidad..."
          autocomplete="off"
        />
      </div>
      ${conjuntosHtml}
    </div>
  `;

  // Restaurar valor del buscador y re-ligar evento
  const searchInput = document.getElementById("biblioteca-search");
  if (searchInput) {
    searchInput.value = bibliotecaState.searchQuery;
    searchInput.addEventListener("input", onBibliotecaSearch);
  }
}

// Exportar para que dashboard.page.js pueda delegarle renderExplorerContent
window.renderBibliotecaContent = renderBibliotecaContent;

// ---- DATA LOADING ----

async function loadAndRenderBiblioteca() {
  bibliotecaState.loading = true;
  bibliotecaState.error   = "";
  renderBibliotecaContent();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const data = await apiBibliotecaConjuntos(session.access_token);
    bibliotecaState.conjuntos = Array.isArray(data) ? data : [];
    bibliotecaState.loading   = false;
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
    case "toggle-expand": {
      if (bibliotecaState.expandedIds.has(conjuntoId)) {
        bibliotecaState.expandedIds.delete(conjuntoId);
      } else {
        bibliotecaState.expandedIds.add(conjuntoId);
        if (!bibliotecaState.activeTab[conjuntoId]) {
          bibliotecaState.activeTab[conjuntoId] = "planeaciones";
        }
      }
      renderBibliotecaContent();
      break;
    }

    case "switch-tab": {
      bibliotecaState.activeTab[conjuntoId] = tab;
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
  }
}

// ---- EXAM PREVIEW (reusa modal existente de dashboard.page.js) ----

async function openBibliotecaExamenPreview(examenId) {
  if (!window.explorerState) return;

  explorerState.examPreview = { open: true, examenId, loading: true, error: "" };
  if (typeof renderExamPreviewModal === "function") renderExamPreviewModal();

  try {
    const session = await window.requireSession();
    if (!session) return;
    const examen = await apiExamenById(examenId, session.access_token);
    explorerState.examenDetalleById = explorerState.examenDetalleById || {};
    explorerState.examenDetalleById[examenId] = examen;
    explorerState.examPreview.loading = false;
    if (typeof renderExamPreviewModal === "function") renderExamPreviewModal();
  } catch (error) {
    console.error("[biblioteca] Error cargando examen:", error);
    explorerState.examPreview.loading = false;
    explorerState.examPreview.error   = "No se pudo cargar el examen.";
    if (typeof renderExamPreviewModal === "function") renderExamPreviewModal();
  }
}

// ---- LISTA PREVIEW (reusa modal existente de dashboard.page.js) ----

async function openBibliotecaListaPreview(listaId) {
  if (!window.explorerState) return;

  explorerState.listaCotejoPreview = { open: true, listaId, listaData: null, loading: true, error: "" };
  if (typeof renderListaCotejoPreviewModal === "function") renderListaCotejoPreviewModal();

  try {
    const session = await window.requireSession();
    if (!session) return;
    const lista = await apiListaCoTejoById(listaId, session.access_token);
    explorerState.listaCotejoPreview = { open: true, listaId, listaData: lista, loading: false, error: "" };
    if (typeof renderListaCotejoPreviewModal === "function") renderListaCotejoPreviewModal();
  } catch (error) {
    console.error("[biblioteca] Error cargando lista de cotejo:", error);
    explorerState.listaCotejoPreview = {
      ...explorerState.listaCotejoPreview,
      loading: false,
      error: "No se pudo cargar la lista de cotejo."
    };
    if (typeof renderListaCotejoPreviewModal === "function") renderListaCotejoPreviewModal();
  }
}

// ---- BIBLIOTECA EXAM GENERATION MODAL ----

function openBibliotecaExamModal(conjunto) {
  bibliotecaState.examModal = {
    open:          true,
    conjuntoId:    conjunto.id,
    unidadId:      conjunto.unidad_id || null,
    planeaciones:  Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [],
    selectedTypes: [],
    questionCounts: {},
    submitting:    false,
    error:         ""
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
  const titulo   = conjunto ? escapeHtml(conjunto.titulo || "Conjunto") : "";

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

  const contextHtml = state.planeaciones.length
    ? `<div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 max-h-36 overflow-y-auto space-y-1">
        ${state.planeaciones.map(p => `
          <p class="text-xs text-slate-600">${escapeHtml(p.tema || p.custom_title || "Sin titulo")}</p>
        `).join("")}
      </div>`
    : `<p class="text-xs text-slate-500">No hay planeaciones en este conjunto.</p>`;

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
          Planeaciones del conjunto (${state.planeaciones.length})
        </p>
        ${contextHtml}
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
          ${state.submitting ? "Generando..." : "Generar examen"}
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
}

async function submitBibliotecaExamModal() {
  const state = bibliotecaState.examModal;

  if (!state.unidadId) {
    bibliotecaState.examModal.error = "Este conjunto no tiene unidad vinculada. Genera planeaciones nuevas desde el flujo normal para poder generar examen.";
    renderBibliotecaExamModal();
    return;
  }

  if (!state.selectedTypes.length) {
    bibliotecaState.examModal.error = "Selecciona al menos un tipo de pregunta.";
    renderBibliotecaExamModal();
    return;
  }

  if (!state.planeaciones.length) {
    bibliotecaState.examModal.error = "El conjunto no tiene planeaciones para generar el examen.";
    renderBibliotecaExamModal();
    return;
  }

  const cantidades = {};
  for (const tipo of state.selectedTypes) {
    cantidades[tipo] = state.questionCounts[tipo] || 5;
  }

  bibliotecaState.examModal.submitting = true;
  bibliotecaState.examModal.error      = "";
  renderBibliotecaExamModal();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const payload = {
      unidad_id:           state.unidadId,
      batch_id:            state.conjuntoId,
      tipos_pregunta:      state.selectedTypes,
      cantidades_pregunta: cantidades
    };

    await apiExamenesGenerate(payload, session.access_token);
    closeBibliotecaExamModal();
    await loadAndRenderBiblioteca();
    // Expand the conjunto so the user sees the new exam
    bibliotecaState.expandedIds.add(state.conjuntoId);
    bibliotecaState.activeTab[state.conjuntoId] = "examenes";
    renderBibliotecaContent();
  } catch (error) {
    console.error("[biblioteca] Error generando examen:", error);
    bibliotecaState.examModal.submitting = false;
    bibliotecaState.examModal.error      = error.message || "No se pudo generar el examen.";
    renderBibliotecaExamModal();
  }
}

// ---- BIBLIOTECA LISTA GENERATION MODAL ----

function openBibliotecaListaModal(conjunto) {
  bibliotecaState.listaModal = {
    open:         true,
    conjuntoId:   conjunto.id,
    planeaciones: Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [],
    submitting:   false,
    error:        ""
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
  const titulo   = conjunto ? escapeHtml(conjunto.titulo || "Conjunto") : "";

  const planeacionesHtml = state.planeaciones.length
    ? state.planeaciones.map(p => `
        <div class="flex items-start gap-2 py-0.5">
          <span class="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-slate-400"></span>
          <span class="text-sm text-slate-700">${escapeHtml(p.tema || p.custom_title || "Sin titulo")}</span>
        </div>
      `).join("")
    : `<p class="text-sm text-slate-500">No hay planeaciones en este conjunto.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const resultHtml = state.result
    ? `<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
        ${state.result.created > 0
          ? `<strong>${state.result.created}</strong> lista(s) generada(s).`
          : ""}
        ${state.result.skipped > 0
          ? ` <span class="text-emerald-700">${state.result.skipped} ya existian y se omitieron.</span>`
          : ""}
        ${state.result.created === 0 && state.result.skipped === 0 ? "No habia planeaciones con actividades para generar." : ""}
      </div>`
    : "";

  modal.querySelector(".biblioteca-modal-card").innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-5">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-cyan-700">Generar listas de cotejo</p>
        <h3 class="mt-1 text-base font-semibold text-slate-900">${titulo}</h3>
        <p class="mt-1 text-sm text-slate-600">Se generara una lista de cotejo por cada planeacion del conjunto.</p>
      </div>
      <button type="button" id="bib-lista-close"
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
        &#10005;
      </button>
    </div>

    <div class="space-y-4">
      <div>
        <p class="mb-2 text-sm font-semibold text-slate-700">
          Planeaciones del conjunto (${state.planeaciones.length})
        </p>
        <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 max-h-44 overflow-y-auto space-y-0.5">
          ${planeacionesHtml}
        </div>
      </div>

      ${errorHtml}
      ${resultHtml}

      <div class="flex flex-wrap justify-end gap-2 pt-1">
        <button type="button" id="bib-lista-cancel"
          class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          ${state.result ? "Cerrar" : "Cancelar"}
        </button>
        ${!state.result ? `
        <button type="button" id="bib-lista-submit"
          class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
          ${state.submitting ? "disabled" : ""}>
          ${state.submitting ? "Generando..." : "Generar listas de cotejo"}
        </button>` : ""}
      </div>
    </div>
  `;

  document.getElementById("bib-lista-close")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-cancel")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-submit")?.addEventListener("click", submitBibliotecaListaModal);
}

async function submitBibliotecaListaModal() {
  const state = bibliotecaState.listaModal;

  if (!state.planeaciones.length) {
    bibliotecaState.listaModal.error = "El conjunto no tiene planeaciones.";
    renderBibliotecaListaModal();
    return;
  }

  bibliotecaState.listaModal.submitting = true;
  bibliotecaState.listaModal.error      = "";
  bibliotecaState.listaModal.result     = null;
  renderBibliotecaListaModal();

  try {
    const session = await window.requireSession();
    if (!session) return;

    const payload = {
      planeacion_ids: state.planeaciones.map(p => p.id)
    };

    const res = await apiListasCoTejoGenerate(payload, session.access_token);
    const created = res?.created ?? 0;
    const skipped = Array.isArray(res?.skipped) ? res.skipped.length : 0;
    bibliotecaState.listaModal.submitting = false;
    bibliotecaState.listaModal.result     = { created, skipped };
    renderBibliotecaListaModal();

    await loadAndRenderBiblioteca();
    bibliotecaState.expandedIds.add(state.conjuntoId);
    bibliotecaState.activeTab[state.conjuntoId] = "listas";
    renderBibliotecaContent();

    setTimeout(() => {
      closeBibliotecaListaModal();
    }, 2200);
  } catch (error) {
    console.error("[biblioteca] Error generando listas de cotejo:", error);
    bibliotecaState.listaModal.submitting = false;
    bibliotecaState.listaModal.error      = error.message || "No se pudieron generar las listas de cotejo.";
    renderBibliotecaListaModal();
  }
}

// ---- AGREGAR TEMAS AL CONJUNTO MODAL ----

function openBibliotecaAgregarModal(conjunto) {
  if (!conjunto.unidad_id) {
    alert("Este conjunto no tiene unidad vinculada. Para agregar planeaciones, usa el flujo normal de creacion desde la jerarquia.");
    return;
  }
  bibliotecaState.agregarModal = {
    open:        true,
    conjuntoId:  conjunto.id,
    unidadId:    conjunto.unidad_id,
    materia:     conjunto.materia || "",
    nivel:       conjunto.nivel || "",
    unidad:      conjunto.unidad,
    temas:       [],
    generating:  false,
    progress:    [],
    done:        false,
    error:       ""
  };
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (modal) modal.classList.remove("hidden");
  document.body.classList.add("overflow-hidden");
  renderBibliotecaAgregarModal();
}

function closeBibliotecaAgregarModal() {
  if (bibliotecaState.agregarModal.generating) return;
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
      ${s.materia ? `<span class="font-semibold">${escapeHtml(s.materia)}</span>` : ""}
      ${s.nivel ? ` &middot; ${escapeHtml(s.nivel)}` : ""}
      ${s.unidad != null ? ` &middot; Unidad ${escapeHtml(String(s.unidad))}` : ""}
    </div>`;

  const temasListHtml = s.temas.length
    ? s.temas.map(t => `
        <div class="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
          <span class="flex-1 text-sm text-slate-800">${escapeHtml(t.titulo)}</span>
          <span class="text-xs text-slate-400">${t.duracion} min</span>
          ${!s.generating ? `
            <button type="button" class="text-slate-400 hover:text-rose-600"
              data-bib-agr-remove="${escapeHtml(t.localId)}">&#10005;</button>
          ` : ""}
        </div>`).join("")
    : `<p class="text-xs text-slate-400">Sin temas. Agrega al menos uno.</p>`;

  const progressHtml = s.progress.length
    ? `<div class="mt-3 space-y-1">
        ${s.progress.map(p => {
          const icon = p.status === "ready"   ? "&#10003;"
                     : p.status === "error"   ? "&#10005;"
                     : p.status === "skipped" ? "&#8213;"
                     : "&#8230;";
          const color = p.status === "ready"   ? "text-emerald-700"
                      : p.status === "error"   ? "text-rose-600"
                      : p.status === "skipped" ? "text-slate-400"
                      : "text-cyan-700";
          return `<div class="flex items-center gap-2 text-xs ${color}">
            <span class="w-4 flex-shrink-0 text-center">${icon}</span>
            <span>${escapeHtml(p.titulo)}${p.message ? ` — ${escapeHtml(p.message)}` : ""}</span>
          </div>`;
        }).join("")}
      </div>`
    : "";

  const errorHtml = s.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(s.error)}</p>`
    : "";

  const addFormHtml = !s.generating && !s.done
    ? `<div class="flex gap-2 mt-2">
        <input type="text" id="bib-agr-titulo" placeholder="Titulo del tema"
          class="flex-1 rounded-xl border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none" />
        <input type="number" id="bib-agr-duracion" value="50" min="10" max="300"
          class="w-20 rounded-xl border border-slate-300 px-2 py-2 text-sm text-center focus:border-cyan-600 focus:outline-none" />
        <button type="button" id="bib-agr-add"
          class="inline-flex items-center justify-center rounded-xl bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-200">
          + Agregar
        </button>
      </div>`
    : "";

  modal.querySelector(".biblioteca-modal-card").innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-cyan-700">Agregar planeaciones</p>
        <h3 class="mt-1 text-base font-semibold text-slate-900">${escapeHtml(findConjuntoById(s.conjuntoId)?.titulo || "Conjunto")}</h3>
      </div>
      <button type="button" id="bib-agr-close"
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-slate-300 text-slate-500 hover:bg-slate-50">
        &#10005;
      </button>
    </div>

    ${contextHtml}

    <div class="mt-4 space-y-2">
      <p class="text-sm font-semibold text-slate-700">Temas a generar</p>
      <div class="space-y-1.5 max-h-44 overflow-y-auto">${temasListHtml}</div>
      ${addFormHtml}
    </div>

    ${progressHtml}
    ${errorHtml}

    <div class="mt-4 flex flex-wrap justify-end gap-2">
      ${s.done
        ? `<button type="button" id="bib-agr-close-done"
            class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white">
            Listo
          </button>`
        : `<button type="button" id="bib-agr-cancel"
            class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            ${s.generating ? "disabled" : ""}>
            Cancelar
          </button>
          <button type="button" id="bib-agr-submit"
            class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
            ${s.generating || s.temas.length === 0 ? "disabled" : ""}>
            ${s.generating ? "Generando..." : "Generar planeaciones"}
          </button>`}
    </div>
  `;

  document.getElementById("bib-agr-close")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-cancel")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-close-done")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-add")?.addEventListener("click", addBibliotecaAgregarTema);
  document.getElementById("bib-agr-titulo")?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); addBibliotecaAgregarTema(); }
  });
  document.getElementById("bib-agr-submit")?.addEventListener("click", submitBibliotecaAgregarModal);

  modal.querySelectorAll("[data-bib-agr-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const localId = btn.dataset.bibAgrRemove;
      bibliotecaState.agregarModal.temas = bibliotecaState.agregarModal.temas.filter(t => t.localId !== localId);
      renderBibliotecaAgregarModal();
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

  bibliotecaState.agregarModal.temas.push({
    localId: `agr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    titulo,
    duracion
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

  bibliotecaState.agregarModal.generating = true;
  bibliotecaState.agregarModal.error      = "";
  bibliotecaState.agregarModal.progress   = s.temas.map(t => ({ titulo: t.titulo, status: "pending" }));
  renderBibliotecaAgregarModal();

  try {
    const body = {
      temas: s.temas.map((t, i) => ({
        titulo:   t.titulo,
        duracion: t.duracion,
        actividades_momentos: {},
        orden: i + 1,
        generar_imagenes_en: []
      })),
      materia: s.materia || undefined,
      nivel:   s.nivel   || undefined,
      batch_id: s.conjuntoId
    };

    await generarPlaneacionesUnidadConProgreso({ unidadId: s.unidadId, body }, (evt) => {
      const idx = (evt.index ?? 1) - 1;
      if (idx >= 0 && bibliotecaState.agregarModal.progress[idx]) {
        if (evt.type === "item_started") {
          bibliotecaState.agregarModal.progress[idx].status = "generating";
        } else if (evt.type === "item_completed") {
          bibliotecaState.agregarModal.progress[idx].status = "ready";
        } else if (evt.type === "item_error") {
          bibliotecaState.agregarModal.progress[idx].status  = "error";
          bibliotecaState.agregarModal.progress[idx].message = evt.message || "Error";
        } else if (evt.type === "item_skipped") {
          bibliotecaState.agregarModal.progress[idx].status  = "skipped";
          bibliotecaState.agregarModal.progress[idx].message = evt.message || "Ya existe";
        }
        renderBibliotecaAgregarModal();
      }
    });

    bibliotecaState.agregarModal.generating = false;
    bibliotecaState.agregarModal.done       = true;
    renderBibliotecaAgregarModal();

    await loadAndRenderBiblioteca();
    bibliotecaState.expandedIds.add(s.conjuntoId);
    bibliotecaState.activeTab[s.conjuntoId] = "planeaciones";
    renderBibliotecaContent();
  } catch (error) {
    console.error("[biblioteca] Error generando planeaciones:", error);
    bibliotecaState.agregarModal.generating = false;
    bibliotecaState.agregarModal.error      = error.message || "No se pudieron generar las planeaciones.";
    renderBibliotecaAgregarModal();
  }
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

  // Hide path bar (now has reliable id)
  const pathBar = document.getElementById("explorer-path-bar");
  if (pathBar) pathBar.style.display = "none";

  // Hide sidebar
  const sidebar = document.getElementById("dashboard-sidebar-slot");
  if (sidebar) sidebar.style.display = "none";

  // Make grid a block so content section fills full width regardless of Tailwind col classes
  const grid = document.getElementById("explorer-workspace-grid");
  if (grid) grid.style.display = "block";

  await loadAndRenderBiblioteca();
}

window.initBiblioteca = initBiblioteca;
