const explorerState = {
  planteles: [],
  gradosByPlantel: {},
  materiasByGrado: {},
  unidadesByMateria: {},
  temasByUnidad: {},
  planeacionByTema: {},
  loading: { root: false, grados: {}, materias: {}, unidades: {}, temas: {} },
  errors: { root: "", grados: {}, materias: {}, unidades: {}, temas: {} },
  expandedPlanteles: new Set(),
  expandedGrados: new Set(),
  expandedMaterias: new Set(),
  current: { level: "root", plantelId: null, gradoId: null, materiaId: null, unidadId: null },
  stagingTemas: [],
  progress: { total: 0, completed: 0, items: [], finalMessage: "", finalTone: "info" },
  quickCreate: {
    open: false,
    temas: [],
    lookups: {},
    requestVersion: { grado: 0, materia: 0, unidad: 0 }
  },
  searchQuery: "",
  generating: false,
  modal: { type: null, submitting: false }
};

const heroActionsByLevel = {
  root: { label: "+ Crear plantel", action: "create-plantel" },
  plantel: { label: "+ Nuevo grado", action: "create-grado" },
  grado: { label: "+ Nueva materia", action: "create-materia" },
  materia: { label: "+ Nueva unidad", action: "create-unidad" },
  unidad: { label: "+ Agregar tema", action: "focus-staging" }
};

let isDashboardBound = false;

async function injectComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) throw new Error(`No se encontro el contenedor ${targetId}`);

  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar componente: ${path}`);

  target.innerHTML = await response.text();
}

function sortEntities(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const orderA = Number.isFinite(Number(a?.orden)) ? Number(a.orden) : 999999;
    const orderB = Number.isFinite(Number(b?.orden)) ? Number(b.orden) : 999999;
    if (orderA !== orderB) return orderA - orderB;

    const nameA = String(a?.nombre || a?.titulo || "").toLowerCase();
    const nameB = String(b?.nombre || b?.titulo || "").toLowerCase();
    return nameA.localeCompare(nameB, "es");
  });
}

function formatFetchError(error, fallbackMessage) {
  if (!error) return fallbackMessage;
  if (typeof error.message === "string" && error.message.trim()) return error.message;
  return fallbackMessage;
}

function getCurrentPlantel() {
  return explorerState.planteles.find((item) => item.id === explorerState.current.plantelId) || null;
}

function getCurrentGrado() {
  const list = explorerState.gradosByPlantel[explorerState.current.plantelId] || [];
  return list.find((item) => item.id === explorerState.current.gradoId) || null;
}

function getCurrentMateria() {
  const list = explorerState.materiasByGrado[explorerState.current.gradoId] || [];
  return list.find((item) => item.id === explorerState.current.materiaId) || null;
}

function getCurrentUnidad() {
  const list = explorerState.unidadesByMateria[explorerState.current.materiaId] || [];
  return list.find((item) => item.id === explorerState.current.unidadId) || null;
}

function setCurrentLevel(level, ids) {
  explorerState.current.level = level;
  explorerState.current.plantelId = ids.plantelId ?? null;
  explorerState.current.gradoId = ids.gradoId ?? null;
  explorerState.current.materiaId = ids.materiaId ?? null;
  explorerState.current.unidadId = ids.unidadId ?? null;

  if (level !== "unidad") {
    explorerState.stagingTemas = [];
  }
}

function updateProgressCounters() {
  explorerState.progress.total = explorerState.progress.items.length;
  explorerState.progress.completed = explorerState.progress.items.filter((item) => item.status === "ready").length;
}

async function loadPlanteles() {
  explorerState.loading.root = true;
  explorerState.errors.root = "";

  try {
    const items = await obtenerPlanteles();
    explorerState.planteles = sortEntities(items || []);
  } catch (error) {
    explorerState.planteles = [];
    explorerState.errors.root = formatFetchError(error, "No se pudieron cargar los planteles.");
  } finally {
    explorerState.loading.root = false;
  }

  const exists = explorerState.planteles.some((item) => item.id === explorerState.current.plantelId);
  if (!exists) {
    setCurrentLevel("root", { plantelId: null, gradoId: null, materiaId: null, unidadId: null });
  }
}

async function ensureGrados(plantelId, { force = false } = {}) {
  if (!plantelId) return;
  if (!force && explorerState.gradosByPlantel[plantelId]) return;

  explorerState.loading.grados[plantelId] = true;
  delete explorerState.errors.grados[plantelId];

  try {
    const items = await obtenerGradosPorPlantel(plantelId);
    explorerState.gradosByPlantel[plantelId] = sortEntities(items || []);
  } catch (error) {
    explorerState.gradosByPlantel[plantelId] = [];
    explorerState.errors.grados[plantelId] = formatFetchError(error, "No se pudieron cargar los grados.");
  } finally {
    explorerState.loading.grados[plantelId] = false;
  }
}

async function ensureMaterias(gradoId, { force = false } = {}) {
  if (!gradoId) return;
  if (!force && explorerState.materiasByGrado[gradoId]) return;

  explorerState.loading.materias[gradoId] = true;
  delete explorerState.errors.materias[gradoId];

  try {
    const items = await obtenerMateriasPorGrado(gradoId);
    explorerState.materiasByGrado[gradoId] = sortEntities(items || []);
  } catch (error) {
    explorerState.materiasByGrado[gradoId] = [];
    explorerState.errors.materias[gradoId] = formatFetchError(error, "No se pudieron cargar las materias.");
  } finally {
    explorerState.loading.materias[gradoId] = false;
  }
}

async function ensureUnidades(materiaId, { force = false } = {}) {
  if (!materiaId) return;
  if (!force && explorerState.unidadesByMateria[materiaId]) return;

  explorerState.loading.unidades[materiaId] = true;
  delete explorerState.errors.unidades[materiaId];

  try {
    const items = await obtenerUnidadesPorMateria(materiaId);
    explorerState.unidadesByMateria[materiaId] = sortEntities(items || []);
  } catch (error) {
    explorerState.unidadesByMateria[materiaId] = [];
    explorerState.errors.unidades[materiaId] = formatFetchError(error, "No se pudieron cargar las unidades.");
  } finally {
    explorerState.loading.unidades[materiaId] = false;
  }
}

async function hydratePlaneacionesForTemas(temas, { force = false } = {}) {
  const pending = (Array.isArray(temas) ? temas : []).filter((tema) => {
    if (!tema?.id) return false;
    if (force) return true;
    return !(tema.id in explorerState.planeacionByTema);
  });

  if (pending.length === 0) return;

  await Promise.all(
    pending.map(async (tema) => {
      try {
        explorerState.planeacionByTema[tema.id] = await obtenerPlaneacionTema(tema.id);
      } catch {
        explorerState.planeacionByTema[tema.id] = null;
      }
    })
  );
}

async function ensureTemas(unidadId, { force = false } = {}) {
  if (!unidadId) return;
  if (!force && explorerState.temasByUnidad[unidadId]) return;

  explorerState.loading.temas[unidadId] = true;
  delete explorerState.errors.temas[unidadId];

  try {
    const items = await obtenerTemasPorUnidad(unidadId);
    const temas = sortEntities(items || []);
    explorerState.temasByUnidad[unidadId] = temas;
    await hydratePlaneacionesForTemas(temas, { force });
  } catch (error) {
    explorerState.temasByUnidad[unidadId] = [];
    explorerState.errors.temas[unidadId] = formatFetchError(error, "No se pudieron cargar los temas.");
  } finally {
    explorerState.loading.temas[unidadId] = false;
  }
}

async function selectRoot() {
  setCurrentLevel("root", { plantelId: null, gradoId: null, materiaId: null, unidadId: null });
  renderAll();
}

async function selectPlantel(plantelId) {
  if (!plantelId) return;
  explorerState.expandedPlanteles.add(plantelId);

  setCurrentLevel("plantel", { plantelId, gradoId: null, materiaId: null, unidadId: null });
  await ensureGrados(plantelId);
  renderAll();
}

async function selectGrado(plantelId, gradoId) {
  if (!plantelId || !gradoId) return;
  explorerState.expandedPlanteles.add(plantelId);
  explorerState.expandedGrados.add(gradoId);

  setCurrentLevel("grado", { plantelId, gradoId, materiaId: null, unidadId: null });
  await Promise.all([ensureGrados(plantelId), ensureMaterias(gradoId)]);
  renderAll();
}

async function selectMateria(plantelId, gradoId, materiaId) {
  if (!plantelId || !gradoId || !materiaId) return;
  explorerState.expandedPlanteles.add(plantelId);
  explorerState.expandedGrados.add(gradoId);
  explorerState.expandedMaterias.add(materiaId);

  setCurrentLevel("materia", { plantelId, gradoId, materiaId, unidadId: null });
  await Promise.all([ensureGrados(plantelId), ensureMaterias(gradoId), ensureUnidades(materiaId)]);
  renderAll();
}

async function selectUnidad(plantelId, gradoId, materiaId, unidadId) {
  if (!plantelId || !gradoId || !materiaId || !unidadId) return;
  explorerState.expandedPlanteles.add(plantelId);
  explorerState.expandedGrados.add(gradoId);
  explorerState.expandedMaterias.add(materiaId);

  setCurrentLevel("unidad", { plantelId, gradoId, materiaId, unidadId });
  await Promise.all([ensureGrados(plantelId), ensureMaterias(gradoId), ensureUnidades(materiaId), ensureTemas(unidadId)]);
  renderAll();
}
function renderWorkspaceVisibility() {
  const onboarding = document.getElementById("explorer-onboarding");
  const onboardingError = document.getElementById("explorer-onboarding-error");
  const onboardingRetry = document.getElementById("btn-onboarding-retry");
  const workspace = document.getElementById("explorer-workspace");

  if (!onboarding || !workspace || !onboardingError || !onboardingRetry) return;

  if (explorerState.planteles.length === 0) {
    onboarding.classList.remove("hidden");
    workspace.classList.add("hidden");

    if (explorerState.errors.root) {
      onboardingError.classList.remove("hidden");
      onboardingRetry.classList.remove("hidden");
      onboardingError.textContent = `Error al cargar: ${explorerState.errors.root}`;
    } else {
      onboardingError.classList.add("hidden");
      onboardingRetry.classList.add("hidden");
      onboardingError.textContent = "";
    }
    return;
  }

  onboarding.classList.add("hidden");
  workspace.classList.remove("hidden");
  onboardingError.classList.add("hidden");
  onboardingRetry.classList.add("hidden");
  onboardingError.textContent = "";
}

function renderHeroAction() {
  const button = document.getElementById("btn-hero-quick-create");
  if (!button) return;

  button.textContent = "+ Crear nueva planeacion";
}

function renderBreadcrumbs() {
  const container = document.getElementById("explorer-breadcrumbs");
  if (!container) return;

  const plantel = getCurrentPlantel();
  const grado = getCurrentGrado();
  const materia = getCurrentMateria();
  const unidad = getCurrentUnidad();

  const crumbs = [
    { level: "root", label: "Planteles", active: explorerState.current.level === "root" },
    { level: "plantel", label: plantel ? plantel.nombre : "Plantel", active: explorerState.current.level === "plantel", disabled: !plantel },
    { level: "grado", label: grado ? grado.nombre : "Grado", active: explorerState.current.level === "grado", disabled: !grado },
    { level: "materia", label: materia ? materia.nombre : "Materia", active: explorerState.current.level === "materia", disabled: !materia },
    { level: "unidad", label: unidad ? unidad.nombre : "Unidad", active: explorerState.current.level === "unidad", disabled: !unidad }
  ];

  container.innerHTML = crumbs
    .map((crumb, index) => {
      const classes = ["explorer-breadcrumb-btn", crumb.active ? "is-active" : ""].filter(Boolean).join(" ");
      const separator = index < crumbs.length - 1 ? '<span class="text-xs text-slate-400">&gt;</span>' : "";
      return `
        <button type="button" class="${classes}" data-breadcrumb-level="${crumb.level}" ${crumb.disabled ? "disabled" : ""}>${escapeHtml(crumb.label)}</button>
        ${separator}
      `;
    })
    .join("");
}

function renderSubtitle() {
  const subtitle = document.getElementById("explorer-subtitle");
  if (!subtitle) return;

  const plantel = getCurrentPlantel();
  const grado = getCurrentGrado();
  const materia = getCurrentMateria();
  const unidad = getCurrentUnidad();

  if (explorerState.current.level === "root") {
    subtitle.textContent = "Selecciona un plantel para navegar su estructura.";
    return;
  }

  if (explorerState.current.level === "plantel") {
    subtitle.textContent = `Plantel seleccionado: ${plantel?.nombre || "-"}`;
    return;
  }

  if (explorerState.current.level === "grado") {
    subtitle.textContent = `Grado seleccionado: ${grado?.nombre || "-"}`;
    return;
  }

  if (explorerState.current.level === "materia") {
    subtitle.textContent = `Materia seleccionada: ${materia?.nombre || "-"}`;
    return;
  }

  subtitle.textContent = `Unidad activa: ${unidad?.nombre || "-"}`;
}

function renderLevelSectionHeader(title, description, level = explorerState.current.level) {
  const config = heroActionsByLevel[level] || heroActionsByLevel.root;

  return `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900">${escapeHtml(title)}</h3>
        <p class="mt-1 text-sm text-slate-600">${escapeHtml(description)}</p>
      </div>
      <button
        type="button"
        class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
        data-content-action="${config.action}"
      >
        ${escapeHtml(config.label)}
      </button>
    </div>
  `;
}

function renderGlobalError() {
  const box = document.getElementById("explorer-global-error");
  if (!box) return;

  if (!explorerState.errors.root || explorerState.planteles.length === 0) {
    box.classList.add("hidden");
    box.textContent = "";
    return;
  }

  box.classList.remove("hidden");
  box.textContent = `Error al cargar planteles: ${explorerState.errors.root}`;
}

function showQuickCreateError(message) {
  const errorBox = document.getElementById("quick-create-error");
  if (!errorBox) return;

  if (!message) {
    errorBox.classList.add("hidden");
    errorBox.textContent = "";
    return;
  }

  errorBox.classList.remove("hidden");
  errorBox.textContent = message;
}

function setQuickPanelVisibility(isOpen) {
  const panel = document.getElementById("quick-create-panel");
  if (!panel) return;
  panel.classList.toggle("hidden", !isOpen);
}

function normalizeQuickLookupKey(value) {
  return String(value || "").trim().toLowerCase();
}

function setQuickInputSuggestions(inputId, datalistId, items) {
  const datalist = document.getElementById(datalistId);
  if (!datalist) return;

  const lookup = {};
  const options = [];

  (items || []).forEach((item) => {
    const name = String(item?.nombre || "").trim();
    if (!name) return;

    options.push(`<option value="${escapeHtml(name)}"></option>`);
    const key = normalizeQuickLookupKey(name);
    if (!lookup[key]) {
      lookup[key] = item.id;
    }
  });

  datalist.innerHTML = options.join("");
  explorerState.quickCreate.lookups[inputId] = lookup;
}

function resolveQuickExistingId(inputId, explicitValue) {
  const input = document.getElementById(inputId);
  const rawValue = explicitValue !== undefined ? explicitValue : input?.value;
  const key = normalizeQuickLookupKey(rawValue);
  if (!key) return null;
  return explorerState.quickCreate.lookups[inputId]?.[key] || null;
}

function resetQuickInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) input.value = "";
}

function quickListHasId(items, id) {
  if (!id || !Array.isArray(items)) return false;
  return items.some((item) => item?.id === id);
}

function renderQuickTemasList() {
  const list = document.getElementById("quick-temas-list");
  if (!list) return;

  if (explorerState.quickCreate.temas.length === 0) {
    list.innerHTML = '<p class="text-sm text-slate-500">No hay temas agregados aun.</p>';
    return;
  }

  list.innerHTML = explorerState.quickCreate.temas
    .map((tema) => `
      <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
        <div>
          <p class="text-sm font-medium text-slate-800">${escapeHtml(tema.titulo)}</p>
          <p class="text-xs text-slate-500">${escapeHtml(String(tema.duracion))} min</p>
        </div>
        <button type="button" class="inline-flex items-center rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50" data-quick-remove-tema="${tema.localId}">
          Quitar
        </button>
      </div>
    `)
    .join("");
}

function clearQuickChildSuggestions(level) {
  if (level === "plantel") {
    setQuickInputSuggestions("quick-grado-input", "quick-grado-list", []);
    setQuickInputSuggestions("quick-materia-input", "quick-materia-list", []);
    setQuickInputSuggestions("quick-unidad-input", "quick-unidad-list", []);
    return;
  }

  if (level === "grado") {
    setQuickInputSuggestions("quick-materia-input", "quick-materia-list", []);
    setQuickInputSuggestions("quick-unidad-input", "quick-unidad-list", []);
    return;
  }

  if (level === "materia") {
    setQuickInputSuggestions("quick-unidad-input", "quick-unidad-list", []);
  }
}

async function fillQuickGradoOptions(plantelId = resolveQuickExistingId("quick-plantel-input")) {
  const requestId = ++explorerState.quickCreate.requestVersion.grado;
  let grados = [];
  if (plantelId) {
    await ensureGrados(plantelId);
    grados = explorerState.gradosByPlantel[plantelId] || [];
  }
  if (requestId !== explorerState.quickCreate.requestVersion.grado) return;
  setQuickInputSuggestions("quick-grado-input", "quick-grado-list", grados);
}

async function fillQuickMateriaOptions(gradoId = resolveQuickExistingId("quick-grado-input")) {
  const requestId = ++explorerState.quickCreate.requestVersion.materia;
  let materias = [];
  if (gradoId) {
    await ensureMaterias(gradoId);
    materias = explorerState.materiasByGrado[gradoId] || [];
  }
  if (requestId !== explorerState.quickCreate.requestVersion.materia) return;
  setQuickInputSuggestions("quick-materia-input", "quick-materia-list", materias);
}

async function fillQuickUnidadOptions(materiaId = resolveQuickExistingId("quick-materia-input")) {
  const requestId = ++explorerState.quickCreate.requestVersion.unidad;
  let unidades = [];
  if (materiaId) {
    await ensureUnidades(materiaId);
    unidades = explorerState.unidadesByMateria[materiaId] || [];
  }
  if (requestId !== explorerState.quickCreate.requestVersion.unidad) return;
  setQuickInputSuggestions("quick-unidad-input", "quick-unidad-list", unidades);
}

async function initQuickCreateForm() {
  explorerState.quickCreate.temas = [];
  explorerState.quickCreate.lookups = {};
  explorerState.quickCreate.requestVersion = { grado: 0, materia: 0, unidad: 0 };
  showQuickCreateError("");
  setQuickInputSuggestions("quick-plantel-input", "quick-plantel-list", explorerState.planteles || []);

  ["quick-plantel-input", "quick-grado-input", "quick-materia-input", "quick-unidad-input", "quick-tema-title"].forEach(resetQuickInput);
  ["quick-grado-order", "quick-unidad-order"].forEach((inputId) => {
    const input = document.getElementById(inputId);
    if (input) input.value = "";
  });

  clearQuickChildSuggestions("plantel");
  renderQuickTemasList();

  const durationInput = document.getElementById("quick-tema-duration");
  if (durationInput) durationInput.value = "50";
}

async function openQuickCreatePanel() {
  explorerState.quickCreate.open = true;
  setQuickPanelVisibility(true);
  await initQuickCreateForm();

  const input = document.getElementById("quick-plantel-input");
  if (input) input.focus();
}

function closeQuickCreatePanel() {
  explorerState.quickCreate.open = false;
  setQuickPanelVisibility(false);
  showQuickCreateError("");
}

function addQuickTemaFromInputs() {
  const titleInput = document.getElementById("quick-tema-title");
  const durationInput = document.getElementById("quick-tema-duration");
  if (!titleInput || !durationInput) return;

  const titulo = titleInput.value.trim();
  const duracion = Number(durationInput.value);

  if (!titulo || !Number.isFinite(duracion) || duracion < 10) {
    showQuickCreateError("Agrega un tema valido y una duracion minima de 10 minutos.");
    return;
  }

  explorerState.quickCreate.temas.push({
    localId: `quick-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    titulo,
    duracion
  });

  titleInput.value = "";
  durationInput.value = "50";
  showQuickCreateError("");
  renderQuickTemasList();
  titleInput.focus();
}

function removeQuickTema(localId) {
  explorerState.quickCreate.temas = explorerState.quickCreate.temas.filter((tema) => tema.localId !== localId);
  renderQuickTemasList();
}

function requireQuickText(inputId, label) {
  const input = document.getElementById(inputId);
  const value = input?.value?.trim() || "";
  if (!value) {
    throw new Error(`Completa el campo: ${label}.`);
  }
  return value;
}

function optionalQuickOrder(inputId) {
  const raw = Number(document.getElementById(inputId)?.value);
  return Number.isFinite(raw) && raw > 0 ? raw : undefined;
}

function renderUnidadNodes(plantelId, gradoId, materiaId) {
  const unidades = explorerState.unidadesByMateria[materiaId] || [];
  if (explorerState.loading.unidades[materiaId]) return '<p class="px-2 py-1 text-xs text-slate-500">Cargando unidades...</p>';
  if (explorerState.errors.unidades[materiaId]) return `<p class="px-2 py-1 text-xs text-rose-600">${escapeHtml(explorerState.errors.unidades[materiaId])}</p>`;
  if (unidades.length === 0) return '<p class="px-2 py-1 text-xs text-slate-500">Sin unidades.</p>';

  return unidades
    .map((unidad) => {
      const isActive = explorerState.current.level === "unidad" && explorerState.current.unidadId === unidad.id;
      return `
        <div class="explorer-tree-group">
          <div class="explorer-tree-row">
            <button type="button" class="explorer-tree-leaf-toggle" aria-hidden="true">.</button>
            <button type="button" class="explorer-tree-label ${isActive ? "is-active" : ""}" data-tree-action="select-unidad" data-plantel-id="${plantelId}" data-grado-id="${gradoId}" data-materia-id="${materiaId}" data-unidad-id="${unidad.id}">
              <span class="truncate">${escapeHtml(unidad.nombre || "Sin nombre")}</span>
              <span class="text-xs text-slate-500">Unidad</span>
            </button>
          </div>
        </div>
      `;
    })
    .join("");
}

function renderMateriaNodes(plantelId, gradoId) {
  const materias = explorerState.materiasByGrado[gradoId] || [];
  if (explorerState.loading.materias[gradoId]) return '<p class="px-2 py-1 text-xs text-slate-500">Cargando materias...</p>';
  if (explorerState.errors.materias[gradoId]) return `<p class="px-2 py-1 text-xs text-rose-600">${escapeHtml(explorerState.errors.materias[gradoId])}</p>`;
  if (materias.length === 0) return '<p class="px-2 py-1 text-xs text-slate-500">Sin materias.</p>';

  return materias
    .map((materia) => {
      const expanded = explorerState.expandedMaterias.has(materia.id);
      const isActive = explorerState.current.level === "materia" && explorerState.current.materiaId === materia.id;
      const units = explorerState.unidadesByMateria[materia.id]?.length ?? 0;
      const children = expanded ? `<div class="explorer-tree-children">${renderUnidadNodes(plantelId, gradoId, materia.id)}</div>` : "";

      return `
        <div class="explorer-tree-group">
          <div class="explorer-tree-row">
            <button type="button" class="explorer-tree-toggle" data-tree-action="toggle-materia" data-plantel-id="${plantelId}" data-grado-id="${gradoId}" data-materia-id="${materia.id}">${expanded ? "-" : "+"}</button>
            <button type="button" class="explorer-tree-label ${isActive ? "is-active" : ""}" data-tree-action="select-materia" data-plantel-id="${plantelId}" data-grado-id="${gradoId}" data-materia-id="${materia.id}">
              <span class="truncate">${escapeHtml(materia.nombre || "Sin nombre")}</span>
              <span class="text-xs text-slate-500">${units}</span>
            </button>
          </div>
          ${children}
        </div>
      `;
    })
    .join("");
}

function renderGradoNodes(plantelId) {
  const grados = explorerState.gradosByPlantel[plantelId] || [];
  if (explorerState.loading.grados[plantelId]) return '<p class="px-2 py-1 text-xs text-slate-500">Cargando grados...</p>';
  if (explorerState.errors.grados[plantelId]) return `<p class="px-2 py-1 text-xs text-rose-600">${escapeHtml(explorerState.errors.grados[plantelId])}</p>`;
  if (grados.length === 0) return '<p class="px-2 py-1 text-xs text-slate-500">Sin grados.</p>';

  return grados
    .map((grado) => {
      const expanded = explorerState.expandedGrados.has(grado.id);
      const isActive = explorerState.current.level === "grado" && explorerState.current.gradoId === grado.id;
      const subjects = explorerState.materiasByGrado[grado.id]?.length ?? 0;
      const children = expanded ? `<div class="explorer-tree-children">${renderMateriaNodes(plantelId, grado.id)}</div>` : "";

      return `
        <div class="explorer-tree-group">
          <div class="explorer-tree-row">
            <button type="button" class="explorer-tree-toggle" data-tree-action="toggle-grado" data-plantel-id="${plantelId}" data-grado-id="${grado.id}">${expanded ? "-" : "+"}</button>
            <button type="button" class="explorer-tree-label ${isActive ? "is-active" : ""}" data-tree-action="select-grado" data-plantel-id="${plantelId}" data-grado-id="${grado.id}">
              <span class="truncate">${escapeHtml(grado.nombre || "Sin nombre")}</span>
              <span class="text-xs text-slate-500">${subjects}</span>
            </button>
          </div>
          ${children}
        </div>
      `;
    })
    .join("");
}

function renderSidebarTree() {
  const count = document.getElementById("tree-planteles-count");
  const tree = document.getElementById("explorer-tree");
  if (!count || !tree) return;

  const query = explorerState.searchQuery.trim().toLowerCase();
  const planteles = explorerState.planteles.filter((plantel) => !query || String(plantel.nombre || "").toLowerCase().includes(query));

  count.textContent = String(planteles.length);

  if (explorerState.loading.root) {
    tree.innerHTML = '<p class="px-2 py-2 text-sm text-slate-500">Cargando planteles...</p>';
    return;
  }

  if (planteles.length === 0) {
    tree.innerHTML = '<p class="px-2 py-2 text-sm text-slate-500">No hay resultados.</p>';
    return;
  }

  tree.innerHTML = planteles
    .map((plantel) => {
      const expanded = explorerState.expandedPlanteles.has(plantel.id);
      const isActive = explorerState.current.level === "plantel" && explorerState.current.plantelId === plantel.id;
      const grades = explorerState.gradosByPlantel[plantel.id]?.length ?? 0;
      const children = expanded ? `<div class="explorer-tree-children">${renderGradoNodes(plantel.id)}</div>` : "";

      return `
        <div class="explorer-tree-group">
          <div class="explorer-tree-row">
            <button type="button" class="explorer-tree-toggle" data-tree-action="toggle-plantel" data-plantel-id="${plantel.id}">${expanded ? "-" : "+"}</button>
            <button type="button" class="explorer-tree-label ${isActive ? "is-active" : ""}" data-tree-action="select-plantel" data-plantel-id="${plantel.id}">
              <span class="truncate">${escapeHtml(plantel.nombre || "Sin nombre")}</span>
              <span class="text-xs text-slate-500">${grades}</span>
            </button>
          </div>
          ${children}
        </div>
      `;
    })
    .join("");
}
function renderRootLevel() {
  if (explorerState.loading.root) return '<p class="text-sm text-slate-500">Cargando planteles...</p>';

  if (explorerState.planteles.length === 0) {
    return `
      <div class="explorer-empty">
        <p>Aun no hay planteles registrados.</p>
        <button type="button" class="mt-3 inline-flex items-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800" data-content-action="create-plantel">+ Crear plantel</button>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader("Planteles", "Selecciona un plantel para abrir su estructura academica.", "root")}
      <div class="explorer-list-grid">
        ${explorerState.planteles
          .map((plantel) => {
            const grades = explorerState.gradosByPlantel[plantel.id]?.length;
            const meta = Number.isInteger(grades) ? `${grades} grado(s)` : "Abrir niveles";
            return `
              <button type="button" class="explorer-list-item" data-content-action="open-plantel" data-plantel-id="${plantel.id}">
                <p class="explorer-list-item-title">${escapeHtml(plantel.nombre || "Sin nombre")}</p>
                <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderPlantelLevel() {
  const plantel = getCurrentPlantel();
  if (!plantel) return '<p class="text-sm text-slate-500">Selecciona un plantel valido.</p>';

  const grados = explorerState.gradosByPlantel[plantel.id] || [];
  if (explorerState.loading.grados[plantel.id]) return '<p class="text-sm text-slate-500">Cargando grados...</p>';
  if (explorerState.errors.grados[plantel.id]) return `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.grados[plantel.id])}</div>`;

  if (grados.length === 0) {
    return `
      <div class="explorer-empty">
        <p>No hay grados dentro de este plantel.</p>
        <button type="button" class="mt-3 inline-flex items-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800" data-content-action="create-grado">+ Nuevo grado</button>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Grados en ${plantel.nombre || "plantel"}`, "Entra a un grado para administrar materias.", "plantel")}
      <div class="explorer-list-grid">
        ${grados
          .map((grado) => {
            const subjects = explorerState.materiasByGrado[grado.id]?.length;
            const meta = Number.isInteger(subjects) ? `${subjects} materia(s)` : "Abrir materias";
            return `
              <button type="button" class="explorer-list-item" data-content-action="open-grado" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}">
                <p class="explorer-list-item-title">${escapeHtml(grado.nombre || "Sin nombre")}</p>
                <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderGradoLevel() {
  const plantel = getCurrentPlantel();
  const grado = getCurrentGrado();
  if (!plantel || !grado) return '<p class="text-sm text-slate-500">Selecciona un grado valido.</p>';

  const materias = explorerState.materiasByGrado[grado.id] || [];
  if (explorerState.loading.materias[grado.id]) return '<p class="text-sm text-slate-500">Cargando materias...</p>';
  if (explorerState.errors.materias[grado.id]) return `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.materias[grado.id])}</div>`;

  if (materias.length === 0) {
    return `
      <div class="explorer-empty">
        <p>No hay materias en este grado.</p>
        <button type="button" class="mt-3 inline-flex items-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800" data-content-action="create-materia">+ Nueva materia</button>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Materias en ${grado.nombre || "grado"}`, "Entra a una materia para administrar unidades.", "grado")}
      <div class="explorer-list-grid">
        ${materias
          .map((materia) => {
            const units = explorerState.unidadesByMateria[materia.id]?.length;
            const meta = Number.isInteger(units) ? `${units} unidad(es)` : "Abrir unidades";
            return `
              <button type="button" class="explorer-list-item" data-content-action="open-materia" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}" data-materia-id="${materia.id}">
                <p class="explorer-list-item-title">${escapeHtml(materia.nombre || "Sin nombre")}</p>
                <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function renderMateriaLevel() {
  const plantel = getCurrentPlantel();
  const grado = getCurrentGrado();
  const materia = getCurrentMateria();
  if (!plantel || !grado || !materia) return '<p class="text-sm text-slate-500">Selecciona una materia valida.</p>';

  const unidades = explorerState.unidadesByMateria[materia.id] || [];
  if (explorerState.loading.unidades[materia.id]) return '<p class="text-sm text-slate-500">Cargando unidades...</p>';
  if (explorerState.errors.unidades[materia.id]) return `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.unidades[materia.id])}</div>`;

  if (unidades.length === 0) {
    return `
      <div class="explorer-empty">
        <p>No hay unidades en esta materia.</p>
        <button type="button" class="mt-3 inline-flex items-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800" data-content-action="create-unidad">+ Nueva unidad</button>
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Unidades en ${materia.nombre || "materia"}`, "Selecciona una unidad para ver temas y generar planeaciones.", "materia")}
      <div class="explorer-list-grid">
        ${unidades
          .map((unidad) => {
            const topics = explorerState.temasByUnidad[unidad.id]?.length;
            const meta = Number.isInteger(topics) ? `${topics} tema(s)` : "Abrir temas";
            return `
              <button type="button" class="explorer-list-item" data-content-action="open-unidad" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}" data-materia-id="${materia.id}" data-unidad-id="${unidad.id}">
                <p class="explorer-list-item-title">${escapeHtml(unidad.nombre || "Sin nombre")}</p>
                <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
              </button>
            `;
          })
          .join("")}
      </div>
    </div>
  `;
}

function resolveTemaStatus(temaId) {
  const planeacion = explorerState.planeacionByTema[temaId];
  if (!planeacion) return { tone: "pending", label: "Sin planeacion" };

  const status = String(planeacion.status || "ready").toLowerCase();
  if (status === "ready") return { tone: "ready", label: "Lista" };
  if (status === "generating") return { tone: "generating", label: "Generando" };
  if (status === "error") return { tone: "error", label: "Error" };
  return { tone: "pending", label: "Pendiente" };
}

function renderProgressSection() {
  const progress = explorerState.progress;
  const list = progress.items.length === 0
    ? '<p class="text-sm text-slate-500">Cuando generes planeaciones, veras el estado en tiempo real aqui.</p>'
    : progress.items
        .map((item) => `
          <div class="explorer-progress-item ${item.status}">
            <div class="flex flex-wrap items-center justify-between gap-2">
              <p class="font-semibold">${escapeHtml(item.titulo || "Tema")}</p>
              <span class="explorer-status-pill ${item.status}">${escapeHtml(item.statusLabel || "Pendiente")}</span>
            </div>
            ${item.message ? `<p class="mt-1 text-xs">${escapeHtml(item.message)}</p>` : ""}
          </div>
        `)
        .join("");

  const toneMap = {
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700",
    info: "border-slate-200 bg-white text-slate-700"
  };

  const finalHtml = progress.finalMessage
    ? `<div id="unit-progress-final" class="rounded-xl border px-3 py-3 text-sm ${toneMap[progress.finalTone] || toneMap.info}"><p>${escapeHtml(progress.finalMessage)}</p></div>`
    : '<div id="unit-progress-final"></div>';

  return `
    <section id="unit-progress-anchor" class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between gap-2">
        <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Estado de generacion</h4>
        <span class="text-xs text-slate-500">Tiempo real</span>
      </div>
      <div class="mt-3 space-y-3">
        <div class="flex flex-col gap-2 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900 sm:flex-row sm:items-center sm:justify-between">
          <p><span class="font-semibold">Progreso:</span> ${progress.completed}/${progress.total} completadas</p>
          <p class="text-xs text-cyan-800">${progress.total} tema(s) en proceso</p>
        </div>
        ${list}
        ${finalHtml}
      </div>
    </section>
  `;
}
function renderUnidadLevel() {
  const unidad = getCurrentUnidad();
  if (!unidad) return '<p class="text-sm text-slate-500">Selecciona una unidad valida.</p>';

  const temas = explorerState.temasByUnidad[unidad.id] || [];
  const temasHtml = (() => {
    if (explorerState.loading.temas[unidad.id]) return '<p class="text-sm text-slate-500">Cargando temas...</p>';
    if (explorerState.errors.temas[unidad.id]) return `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.temas[unidad.id])}</div>`;
    if (temas.length === 0) return '<div class="explorer-empty">Todavia no hay temas guardados para esta unidad.</div>';

    return temas
      .map((tema) => {
        const status = resolveTemaStatus(tema.id);
        const planeacion = explorerState.planeacionByTema[tema.id];
        const duracion = Number.isFinite(Number(tema.duracion)) ? `${Number(tema.duracion)} min` : "-";

        return `
          <div class="explorer-topic-row">
            <div>
              <p class="text-sm font-semibold text-slate-900">${escapeHtml(tema.titulo || "Tema sin titulo")}</p>
              <p class="mt-1 text-xs text-slate-500">Tema guardado</p>
            </div>
            <p class="text-sm text-slate-600">${escapeHtml(duracion)}</p>
            <div class="flex flex-wrap items-center justify-end gap-2">
              <span class="explorer-status-pill ${status.tone}">${escapeHtml(status.label)}</span>
              ${planeacion?.id ? `<button type="button" class="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50" data-content-action="open-planeacion" data-planeacion-id="${planeacion.id}">Abrir planeacion</button>` : ""}
            </div>
          </div>
        `;
      })
      .join("");
  })();

  const stagingList = explorerState.stagingTemas.length === 0
    ? '<p class="text-sm text-slate-500">No hay temas pendientes.</p>'
    : explorerState.stagingTemas
        .map((tema) => `
          <div class="flex items-center justify-between gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
            <div>
              <p class="text-sm font-medium text-slate-800">${escapeHtml(tema.titulo)}</p>
              <p class="text-xs text-slate-500">${escapeHtml(String(tema.duracion))} min</p>
            </div>
            <button type="button" class="inline-flex items-center rounded-lg border border-slate-300 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50" data-content-action="remove-staging" data-staging-id="${tema.localId}">Quitar</button>
          </div>
        `)
        .join("");

  const disableGenerate = explorerState.stagingTemas.length === 0 || explorerState.generating;

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Temas en ${unidad.nombre || "unidad"}`, "Agrega temas pendientes y luego genera planeaciones.", "unidad")}
      <div class="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Temas guardados</h4>
            <span class="text-xs text-slate-500">${temas.length} tema(s)</span>
          </div>
          <div class="space-y-2">${temasHtml}</div>
        </section>

        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Agregar temas</h4>
          <p class="mt-1 text-sm text-slate-600">Agrega temas en staging y luego genera N planeaciones (1 tema = 1 planeacion).</p>

          <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1fr)_120px_auto] md:items-end">
            <div>
              <label for="staging-tema-titulo" class="mb-1 block text-sm font-medium text-slate-700">Titulo del tema</label>
              <input id="staging-tema-titulo" type="text" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none" placeholder="Ej. Fracciones equivalentes" />
            </div>
            <div>
              <label for="staging-tema-duracion" class="mb-1 block text-sm font-medium text-slate-700">Duracion</label>
              <input id="staging-tema-duracion" type="number" min="10" value="50" class="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-cyan-600 focus:outline-none" />
            </div>
            <button type="button" class="inline-flex items-center justify-center rounded-lg border border-cyan-300 px-3 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50" data-content-action="add-staging-tema">Agregar tema</button>
          </div>

          <div class="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">${stagingList}</div>

          <button type="button" class="mt-4 inline-flex items-center justify-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800 ${disableGenerate ? "opacity-70" : ""}" data-content-action="generate-planeaciones" ${disableGenerate ? "disabled" : ""}>
            ${explorerState.generating ? "Generando..." : `Generar planeaciones (${explorerState.stagingTemas.length})`}
          </button>
        </section>
      </div>

      ${renderProgressSection()}
    </div>
  `;
}

function renderExplorerContent() {
  const container = document.getElementById("explorer-content");
  if (!container) return;

  if (explorerState.current.level === "root") {
    container.innerHTML = renderRootLevel();
  } else if (explorerState.current.level === "plantel") {
    container.innerHTML = renderPlantelLevel();
  } else if (explorerState.current.level === "grado") {
    container.innerHTML = renderGradoLevel();
  } else if (explorerState.current.level === "materia") {
    container.innerHTML = renderMateriaLevel();
  } else {
    container.innerHTML = renderUnidadLevel();
  }
}

function renderAll() {
  renderWorkspaceVisibility();
  renderHeroAction();
  setQuickPanelVisibility(explorerState.quickCreate.open);
  renderBreadcrumbs();
  renderSubtitle();
  renderGlobalError();
  renderSidebarTree();
  renderExplorerContent();
}

function getNodeIds(element) {
  return {
    plantelId: element.getAttribute("data-plantel-id"),
    gradoId: element.getAttribute("data-grado-id"),
    materiaId: element.getAttribute("data-materia-id"),
    unidadId: element.getAttribute("data-unidad-id")
  };
}

function focusStagingInput() {
  requestAnimationFrame(() => {
    const input = document.getElementById("staging-tema-titulo");
    if (!input) return;
    input.focus();
    input.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function scrollToProgress(block = "start") {
  requestAnimationFrame(() => {
    const target = document.getElementById("unit-progress-anchor");
    if (target) target.scrollIntoView({ behavior: "smooth", block });
  });
}

function scrollToProgressFinal() {
  requestAnimationFrame(() => {
    const target = document.getElementById("unit-progress-final");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  });
}

function addStagingTemaFromInputs() {
  const titleInput = document.getElementById("staging-tema-titulo");
  const durationInput = document.getElementById("staging-tema-duracion");
  if (!titleInput || !durationInput) return;

  const titulo = titleInput.value.trim();
  const duracion = Number(durationInput.value);

  if (!titulo || !Number.isFinite(duracion) || duracion < 10) {
    alert("Ingresa un titulo y una duracion minima de 10 minutos.");
    return;
  }

  explorerState.stagingTemas.push({
    localId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    titulo,
    duracion
  });

  titleInput.value = "";
  durationInput.value = "50";
  renderExplorerContent();
  focusStagingInput();
}

function removeStagingTema(localId) {
  explorerState.stagingTemas = explorerState.stagingTemas.filter((item) => item.localId !== localId);
  renderExplorerContent();
}

function statusLabelFromTone(status) {
  if (status === "ready") return "Completado";
  if (status === "generating") return "Generando";
  if (status === "error") return "Error";
  return "Pendiente";
}

function initProgressFromStaging() {
  explorerState.progress.items = explorerState.stagingTemas.map((tema, index) => ({
    index: index + 1,
    localId: tema.localId,
    temaId: null,
    planeacionId: null,
    titulo: tema.titulo,
    status: "pending",
    statusLabel: "Pendiente",
    message: ""
  }));
  explorerState.progress.finalMessage = "";
  explorerState.progress.finalTone = "info";
  updateProgressCounters();
}

function mapEventToProgress(evt) {
  if (!evt || typeof evt !== "object") return null;
  const payload = evt.data && typeof evt.data === "object" ? evt.data : {};

  const rawIndex = evt.index ?? payload.index ?? evt.item ?? payload.item;
  const index = Number.isFinite(Number(rawIndex)) ? Number(rawIndex) : null;
  const temaId = evt.tema_id || payload.tema_id || evt.temaId || payload.temaId || null;
  const planeacionId = evt.planeacion_id || payload.planeacion_id || evt.planeacionId || payload.planeacionId || null;
  const titulo = evt.titulo || payload.titulo || evt.tema || payload.tema || null;

  let status = evt.status || payload.status || null;
  if (!status) {
    const type = String(evt.type || "").toLowerCase();
    if (type.includes("start") || type.includes("generating")) status = "generating";
    else if (type.includes("complete") || type.includes("ready")) status = "ready";
    else if (type.includes("error")) status = "error";
    else if (type.includes("pending")) status = "pending";
  }

  if (!status && !temaId && !index) return null;

  return {
    index,
    temaId,
    planeacionId,
    titulo,
    status: status || "pending",
    message: evt.message || payload.message || evt.error || payload.error || ""
  };
}
function updateProgressFromEvent(evt) {
  const update = mapEventToProgress(evt);
  if (!update) return;

  let item = null;
  if (update.temaId) {
    item = explorerState.progress.items.find((candidate) => candidate.temaId === update.temaId);
  }
  if (!item && update.index && update.index > 0) {
    item = explorerState.progress.items[update.index - 1] || null;
  }

  if (!item) {
    item = {
      index: explorerState.progress.items.length + 1,
      localId: `evt-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      temaId: null,
      planeacionId: null,
      titulo: update.titulo || `Tema ${explorerState.progress.items.length + 1}`,
      status: "pending",
      statusLabel: "Pendiente",
      message: ""
    };
    explorerState.progress.items.push(item);
  }

  if (update.temaId) item.temaId = update.temaId;
  if (update.planeacionId) item.planeacionId = update.planeacionId;
  if (update.titulo) item.titulo = update.titulo;
  if (update.status) {
    item.status = update.status;
    item.statusLabel = statusLabelFromTone(update.status);
  }
  if (update.message) item.message = update.message;

  updateProgressCounters();
}

function applyGenerateResult(result) {
  const records = [];
  if (Array.isArray(result?.resultados)) records.push(...result.resultados);
  if (Array.isArray(result?.items)) records.push(...result.items);
  if (Array.isArray(result?.temas)) records.push(...result.temas);
  if (Array.isArray(result?.planeaciones)) {
    result.planeaciones.forEach((planeacion, index) => {
      records.push({ index: index + 1, tema_id: planeacion.tema_id, planeacion_id: planeacion.id, status: planeacion.status || "ready" });
    });
  }

  records.forEach((record, idx) => {
    updateProgressFromEvent({
      index: record.index || idx + 1,
      tema_id: record.tema_id,
      planeacion_id: record.planeacion_id,
      status: record.status || "ready",
      titulo: record.titulo,
      message: record.message || ""
    });
  });

  explorerState.progress.items.forEach((item) => {
    if (item.status === "pending") {
      item.status = "ready";
      item.statusLabel = statusLabelFromTone("ready");
    }
  });

  updateProgressCounters();

  const readyCount = explorerState.progress.items.filter((item) => item.status === "ready").length;
  const errorCount = explorerState.progress.items.filter((item) => item.status === "error").length;

  if (errorCount > 0) {
    explorerState.progress.finalTone = "danger";
    explorerState.progress.finalMessage = `Proceso finalizado con ${readyCount} completadas y ${errorCount} con error.`;
  } else {
    explorerState.progress.finalTone = "success";
    explorerState.progress.finalMessage = `Proceso finalizado. ${readyCount} planeacion(es) creadas correctamente.`;
  }
}

function buildLegacyContext() {
  return {
    materia: getCurrentMateria()?.nombre || undefined,
    nivel: getCurrentGrado()?.nombre || undefined,
    unidad: getCurrentUnidad()?.nombre || undefined
  };
}

async function generatePlaneacionesFromStaging() {
  const unidadId = explorerState.current.unidadId;
  if (!unidadId) {
    alert("Selecciona una unidad antes de generar.");
    return;
  }

  if (explorerState.stagingTemas.length === 0) {
    alert("Agrega al menos un tema antes de generar.");
    return;
  }

  if (explorerState.generating) return;

  explorerState.generating = true;
  initProgressFromStaging();
  renderExplorerContent();
  scrollToProgress();

  const body = {
    temas: explorerState.stagingTemas.map((tema, index) => ({ titulo: tema.titulo, duracion: tema.duracion, orden: index + 1 })),
    ...buildLegacyContext()
  };

  try {
    const result = await generarPlaneacionesUnidadConProgreso({ unidadId, body }, (evt) => {
      updateProgressFromEvent(evt);
      renderExplorerContent();
    });

    applyGenerateResult(result || {});
    explorerState.stagingTemas = [];
    await ensureTemas(unidadId, { force: true });

    renderExplorerContent();
    scrollToProgressFinal();
  } catch (error) {
    explorerState.progress.finalTone = "danger";
    explorerState.progress.finalMessage = formatFetchError(error, "No se pudieron generar las planeaciones.");
    renderExplorerContent();
    scrollToProgressFinal();
  } finally {
    explorerState.generating = false;
    updateProgressCounters();
    renderExplorerContent();
  }
}

async function submitQuickCreateForm(event) {
  event.preventDefault();

  const submitButton = document.getElementById("quick-create-submit");
  if (submitButton) submitButton.setAttribute("disabled", "true");

  try {
    if (explorerState.quickCreate.temas.length === 0) {
      throw new Error("Agrega al menos un tema antes de crear la planeacion.");
    }

    showQuickCreateError("");

    const plantelNombre = requireQuickText("quick-plantel-input", "Plantel");
    let plantelId = resolveQuickExistingId("quick-plantel-input", plantelNombre);
    if (!plantelId) {
      const created = await crearPlantel({ nombre: plantelNombre });
      plantelId = created?.id;
      if (!plantelId) throw new Error("No se pudo crear el plantel.");
      await loadPlanteles();
      setQuickInputSuggestions("quick-plantel-input", "quick-plantel-list", explorerState.planteles || []);
    }

    await ensureGrados(plantelId);
    const gradosDisponibles = explorerState.gradosByPlantel[plantelId] || [];
    setQuickInputSuggestions("quick-grado-input", "quick-grado-list", gradosDisponibles);

    const gradoNombre = requireQuickText("quick-grado-input", "Grado");
    let gradoId = resolveQuickExistingId("quick-grado-input", gradoNombre);
    if (gradoId && !quickListHasId(gradosDisponibles, gradoId)) {
      gradoId = null;
    }
    if (!gradoId) {
      const payload = { nombre: gradoNombre, plantel_id: plantelId };
      const orden = optionalQuickOrder("quick-grado-order");
      if (orden) payload.orden = orden;

      const created = await crearGrado(payload);
      gradoId = created?.id;
      if (!gradoId) throw new Error("No se pudo crear el grado.");
      await ensureGrados(plantelId, { force: true });
      setQuickInputSuggestions("quick-grado-input", "quick-grado-list", explorerState.gradosByPlantel[plantelId] || []);
    }

    await ensureMaterias(gradoId);
    const materiasDisponibles = explorerState.materiasByGrado[gradoId] || [];
    setQuickInputSuggestions("quick-materia-input", "quick-materia-list", materiasDisponibles);

    const materiaNombre = requireQuickText("quick-materia-input", "Materia");
    let materiaId = resolveQuickExistingId("quick-materia-input", materiaNombre);
    if (materiaId && !quickListHasId(materiasDisponibles, materiaId)) {
      materiaId = null;
    }
    if (!materiaId) {
      const created = await crearMateria({ nombre: materiaNombre, grado_id: gradoId });
      materiaId = created?.id;
      if (!materiaId) throw new Error("No se pudo crear la materia.");
      await ensureMaterias(gradoId, { force: true });
      setQuickInputSuggestions("quick-materia-input", "quick-materia-list", explorerState.materiasByGrado[gradoId] || []);
    }

    await ensureUnidades(materiaId);
    const unidadesDisponibles = explorerState.unidadesByMateria[materiaId] || [];
    setQuickInputSuggestions("quick-unidad-input", "quick-unidad-list", unidadesDisponibles);

    const unidadNombre = requireQuickText("quick-unidad-input", "Unidad");
    let unidadId = resolveQuickExistingId("quick-unidad-input", unidadNombre);
    if (unidadId && !quickListHasId(unidadesDisponibles, unidadId)) {
      unidadId = null;
    }
    if (!unidadId) {
      const payload = { nombre: unidadNombre, materia_id: materiaId };
      const orden = optionalQuickOrder("quick-unidad-order");
      if (orden) payload.orden = orden;

      const created = await crearUnidad(payload);
      unidadId = created?.id;
      if (!unidadId) throw new Error("No se pudo crear la unidad.");
      await ensureUnidades(materiaId, { force: true });
      setQuickInputSuggestions("quick-unidad-input", "quick-unidad-list", explorerState.unidadesByMateria[materiaId] || []);
    }

    await selectUnidad(plantelId, gradoId, materiaId, unidadId);

    explorerState.stagingTemas = explorerState.quickCreate.temas.map((tema) => ({
      localId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      titulo: tema.titulo,
      duracion: tema.duracion
    }));

    explorerState.quickCreate.temas = [];
    closeQuickCreatePanel();
    await generatePlaneacionesFromStaging();
  } catch (error) {
    showQuickCreateError(formatFetchError(error, "No se pudo completar la creacion rapida."));
  } finally {
    if (submitButton) submitButton.removeAttribute("disabled");
  }
}

function openModalError(message) {
  const errorEl = document.getElementById("entity-modal-error");
  if (!errorEl) return;
  if (!message) {
    errorEl.classList.add("hidden");
    errorEl.textContent = "";
    return;
  }
  errorEl.classList.remove("hidden");
  errorEl.textContent = message;
}

function closeEntityModal() {
  document.getElementById("entity-modal")?.classList.add("hidden");
  explorerState.modal.type = null;
  explorerState.modal.submitting = false;
  openModalError("");
}

function openEntityModal(type) {
  const modal = document.getElementById("entity-modal");
  const title = document.getElementById("entity-modal-title");
  const nameInput = document.getElementById("entity-name-input");
  const orderRow = document.getElementById("entity-order-row");
  const orderInput = document.getElementById("entity-order-input");
  const submit = document.getElementById("entity-modal-submit");
  if (!modal || !title || !nameInput || !orderRow || !orderInput || !submit) return;

  explorerState.modal.type = type;
  explorerState.modal.submitting = false;

  const map = {
    plantel: { title: "Nuevo plantel", submit: "Crear plantel", showOrder: false, placeholder: "Nombre del plantel" },
    grado: { title: "Nuevo grado", submit: "Crear grado", showOrder: true, placeholder: "Nombre del grado" },
    materia: { title: "Nueva materia", submit: "Crear materia", showOrder: false, placeholder: "Nombre de la materia" },
    unidad: { title: "Nueva unidad", submit: "Crear unidad", showOrder: true, placeholder: "Nombre de la unidad" }
  };

  const config = map[type] || map.plantel;

  title.textContent = config.title;
  submit.textContent = config.submit;
  nameInput.value = "";
  nameInput.placeholder = config.placeholder;
  orderInput.value = "";

  orderRow.classList.toggle("hidden", !config.showOrder);
  openModalError("");
  modal.classList.remove("hidden");
  requestAnimationFrame(() => nameInput.focus());
}

async function submitEntityModal(event) {
  event.preventDefault();
  if (explorerState.modal.submitting || !explorerState.modal.type) return;

  const nameInput = document.getElementById("entity-name-input");
  const orderInput = document.getElementById("entity-order-input");
  const submit = document.getElementById("entity-modal-submit");
  if (!nameInput || !submit) return;

  const nombre = nameInput.value.trim();
  const ordenRaw = Number(orderInput?.value);

  if (!nombre) {
    openModalError("Ingresa un nombre valido.");
    return;
  }

  explorerState.modal.submitting = true;
  submit.setAttribute("disabled", "true");

  try {
    if (explorerState.modal.type === "plantel") {
      const created = await crearPlantel({ nombre });
      await loadPlanteles();
      if (created?.id) await selectPlantel(created.id); else renderAll();
      closeEntityModal();
      return;
    }

    if (explorerState.modal.type === "grado") {
      const plantelId = explorerState.current.plantelId;
      if (!plantelId) throw new Error("Selecciona un plantel antes de crear un grado.");

      const payload = { nombre, plantel_id: plantelId };
      if (Number.isFinite(ordenRaw) && ordenRaw > 0) payload.orden = ordenRaw;

      const created = await crearGrado(payload);
      await ensureGrados(plantelId, { force: true });
      if (created?.id) await selectGrado(plantelId, created.id); else await selectPlantel(plantelId);
      closeEntityModal();
      return;
    }

    if (explorerState.modal.type === "materia") {
      const plantelId = explorerState.current.plantelId;
      const gradoId = explorerState.current.gradoId;
      if (!plantelId || !gradoId) throw new Error("Selecciona un grado antes de crear una materia.");

      const created = await crearMateria({ nombre, grado_id: gradoId });
      await ensureMaterias(gradoId, { force: true });
      if (created?.id) await selectMateria(plantelId, gradoId, created.id); else await selectGrado(plantelId, gradoId);
      closeEntityModal();
      return;
    }

    const plantelId = explorerState.current.plantelId;
    const gradoId = explorerState.current.gradoId;
    const materiaId = explorerState.current.materiaId;
    if (!plantelId || !gradoId || !materiaId) throw new Error("Selecciona una materia antes de crear una unidad.");

    const payload = { nombre, materia_id: materiaId };
    if (Number.isFinite(ordenRaw) && ordenRaw > 0) payload.orden = ordenRaw;

    const created = await crearUnidad(payload);
    await ensureUnidades(materiaId, { force: true });
    if (created?.id) await selectUnidad(plantelId, gradoId, materiaId, created.id); else await selectMateria(plantelId, gradoId, materiaId);
    closeEntityModal();
  } catch (error) {
    openModalError(formatFetchError(error, "No se pudo guardar el elemento."));
  } finally {
    explorerState.modal.submitting = false;
    submit.removeAttribute("disabled");
  }
}

async function handleCreateAction(action) {
  if (action === "create-plantel") return openEntityModal("plantel");
  if (action === "create-grado") {
    if (!explorerState.current.plantelId) return alert("Selecciona un plantel primero.");
    return openEntityModal("grado");
  }
  if (action === "create-materia") {
    if (!explorerState.current.gradoId) return alert("Selecciona un grado primero.");
    return openEntityModal("materia");
  }
  if (action === "create-unidad") {
    if (!explorerState.current.materiaId) return alert("Selecciona una materia primero.");
    return openEntityModal("unidad");
  }

  if (action === "focus-staging") {
    if (explorerState.current.level !== "unidad") return alert("Selecciona una unidad para agregar temas.");
    focusStagingInput();
  }
}
async function handleTreeClick(event) {
  const button = event.target.closest("[data-tree-action]");
  if (!button) return;

  const action = button.getAttribute("data-tree-action");
  const ids = getNodeIds(button);

  if (action === "toggle-plantel") {
    if (explorerState.expandedPlanteles.has(ids.plantelId)) explorerState.expandedPlanteles.delete(ids.plantelId);
    else {
      explorerState.expandedPlanteles.add(ids.plantelId);
      await ensureGrados(ids.plantelId);
    }
    renderAll();
    return;
  }

  if (action === "select-plantel") return selectPlantel(ids.plantelId);

  if (action === "toggle-grado") {
    if (explorerState.expandedGrados.has(ids.gradoId)) explorerState.expandedGrados.delete(ids.gradoId);
    else {
      explorerState.expandedGrados.add(ids.gradoId);
      await ensureMaterias(ids.gradoId);
    }
    renderAll();
    return;
  }

  if (action === "select-grado") return selectGrado(ids.plantelId, ids.gradoId);

  if (action === "toggle-materia") {
    if (explorerState.expandedMaterias.has(ids.materiaId)) explorerState.expandedMaterias.delete(ids.materiaId);
    else {
      explorerState.expandedMaterias.add(ids.materiaId);
      await ensureUnidades(ids.materiaId);
    }
    renderAll();
    return;
  }

  if (action === "select-materia") return selectMateria(ids.plantelId, ids.gradoId, ids.materiaId);
  if (action === "select-unidad") return selectUnidad(ids.plantelId, ids.gradoId, ids.materiaId, ids.unidadId);
}

async function handleBreadcrumbClick(event) {
  const button = event.target.closest("[data-breadcrumb-level]");
  if (!button) return;

  const level = button.getAttribute("data-breadcrumb-level");
  if (level === "root") return selectRoot();
  if (level === "plantel" && explorerState.current.plantelId) return selectPlantel(explorerState.current.plantelId);
  if (level === "grado" && explorerState.current.plantelId && explorerState.current.gradoId) return selectGrado(explorerState.current.plantelId, explorerState.current.gradoId);
  if (level === "materia" && explorerState.current.plantelId && explorerState.current.gradoId && explorerState.current.materiaId) {
    return selectMateria(explorerState.current.plantelId, explorerState.current.gradoId, explorerState.current.materiaId);
  }
  if (level === "unidad" && explorerState.current.plantelId && explorerState.current.gradoId && explorerState.current.materiaId && explorerState.current.unidadId) {
    return selectUnidad(explorerState.current.plantelId, explorerState.current.gradoId, explorerState.current.materiaId, explorerState.current.unidadId);
  }
}

async function handleContentClick(event) {
  const button = event.target.closest("[data-content-action]");
  if (!button) return;

  const action = button.getAttribute("data-content-action");
  const ids = getNodeIds(button);

  if (action === "open-plantel") return selectPlantel(ids.plantelId);
  if (action === "open-grado") return selectGrado(ids.plantelId, ids.gradoId);
  if (action === "open-materia") return selectMateria(ids.plantelId, ids.gradoId, ids.materiaId);
  if (action === "open-unidad") return selectUnidad(ids.plantelId, ids.gradoId, ids.materiaId, ids.unidadId);

  if (action === "open-planeacion") {
    const planeacionId = button.getAttribute("data-planeacion-id");
    if (planeacionId) window.location.href = `detalle.html?id=${encodeURIComponent(planeacionId)}`;
    return;
  }

  if (action === "add-staging-tema") return addStagingTemaFromInputs();
  if (action === "remove-staging") return removeStagingTema(button.getAttribute("data-staging-id"));
  if (action === "generate-planeaciones") return generatePlaneacionesFromStaging();

  if (action.startsWith("create-") || action === "focus-staging") {
    return handleCreateAction(action);
  }
}

function bindDashboardEvents() {
  if (isDashboardBound) return;

  document.getElementById("tree-search")?.addEventListener("input", (event) => {
    explorerState.searchQuery = event.target.value || "";
    renderSidebarTree();
  });

  document.getElementById("explorer-tree")?.addEventListener("click", (event) => {
    handleTreeClick(event).catch((error) => console.error("Error en arbol:", error));
  });

  document.getElementById("explorer-content")?.addEventListener("click", (event) => {
    handleContentClick(event).catch((error) => console.error("Error en contenido:", error));
  });

  document.getElementById("explorer-breadcrumbs")?.addEventListener("click", (event) => {
    handleBreadcrumbClick(event).catch((error) => console.error("Error en breadcrumbs:", error));
  });

  document.getElementById("btn-hero-quick-create")?.addEventListener("click", () => {
    openQuickCreatePanel().catch((error) => console.error("Error abriendo creacion rapida:", error));
  });

  document.getElementById("quick-create-close")?.addEventListener("click", () => {
    closeQuickCreatePanel();
  });

  const onQuickPlantelChange = async () => {
    resetQuickInput("quick-grado-input");
    resetQuickInput("quick-materia-input");
    resetQuickInput("quick-unidad-input");
    clearQuickChildSuggestions("plantel");

    const plantelId = resolveQuickExistingId("quick-plantel-input");
    if (!plantelId) return;
    await fillQuickGradoOptions(plantelId);
  };

  const onQuickGradoChange = async () => {
    resetQuickInput("quick-materia-input");
    resetQuickInput("quick-unidad-input");
    clearQuickChildSuggestions("grado");

    const gradoId = resolveQuickExistingId("quick-grado-input");
    if (!gradoId) return;
    await fillQuickMateriaOptions(gradoId);
  };

  const onQuickMateriaChange = async () => {
    resetQuickInput("quick-unidad-input");
    clearQuickChildSuggestions("materia");

    const materiaId = resolveQuickExistingId("quick-materia-input");
    if (!materiaId) return;
    await fillQuickUnidadOptions(materiaId);
  };

  ["input", "change"].forEach((eventName) => {
    document.getElementById("quick-plantel-input")?.addEventListener(eventName, () => {
      onQuickPlantelChange().catch((error) => console.error("Error actualizando grados en creacion rapida:", error));
    });

    document.getElementById("quick-grado-input")?.addEventListener(eventName, () => {
      onQuickGradoChange().catch((error) => console.error("Error actualizando materias en creacion rapida:", error));
    });

    document.getElementById("quick-materia-input")?.addEventListener(eventName, () => {
      onQuickMateriaChange().catch((error) => console.error("Error actualizando unidades en creacion rapida:", error));
    });
  });

  document.getElementById("quick-add-tema")?.addEventListener("click", () => {
    addQuickTemaFromInputs();
  });

  ["quick-tema-title", "quick-tema-duration"].forEach((fieldId) => {
    document.getElementById(fieldId)?.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      addQuickTemaFromInputs();
    });
  });

  document.getElementById("quick-temas-list")?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-quick-remove-tema]");
    if (!button) return;
    removeQuickTema(button.getAttribute("data-quick-remove-tema"));
  });

  document.getElementById("quick-create-form")?.addEventListener("submit", (event) => {
    submitQuickCreateForm(event).catch((error) => {
      console.error("Error en creacion rapida:", error);
      showQuickCreateError("No se pudo completar la creacion rapida.");
    });
  });

  document.getElementById("btn-onboarding-create")?.addEventListener("click", () => openEntityModal("plantel"));
  document.getElementById("btn-onboarding-retry")?.addEventListener("click", () => loadPlanteles().then(renderAll).catch((error) => console.error("Error reintentando:", error)));

  document.getElementById("entity-modal")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-close]")) closeEntityModal();
  });

  document.getElementById("entity-modal-form")?.addEventListener("submit", (event) => {
    submitEntityModal(event).catch((error) => {
      console.error("Error guardando modal:", error);
      openModalError("No se pudo guardar el elemento.");
    });
  });

  document.getElementById("explorer-content")?.addEventListener("keydown", (event) => {
    if (event.key !== "Enter") return;
    if (event.target?.id === "staging-tema-titulo" || event.target?.id === "staging-tema-duracion") {
      event.preventDefault();
      addStagingTemaFromInputs();
    }
  });

  isDashboardBound = true;
}

async function hydrateExplorerData() {
  await loadPlanteles();

  if (explorerState.planteles.length === 0) {
    renderAll();
    return;
  }

  if (!explorerState.current.plantelId) {
    const firstPlantel = explorerState.planteles[0];
    if (firstPlantel) {
      explorerState.expandedPlanteles.add(firstPlantel.id);
      await selectPlantel(firstPlantel.id);
      return;
    }
  }

  renderAll();
}

async function initDashboardPage() {
  try {
    await injectComponent("dashboard-layout-root", "../components/layout.html");
    await Promise.all([
      injectComponent("dashboard-sidebar-slot", "../components/sidebar.html"),
      window.initPrivateChrome ? window.initPrivateChrome() : Promise.resolve()
    ]);
  } catch (error) {
    console.error("Error inicializando dashboard:", error);
    const root = document.getElementById("dashboard-layout-root");
    if (root) root.innerHTML = '<div class="p-6 text-sm text-rose-700">No se pudo cargar el dashboard.</div>';
    return;
  }

  bindDashboardEvents();

  try {
    await hydrateExplorerData();
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
    explorerState.errors.root = formatFetchError(error, "No se pudieron cargar los datos del explorador.");
    renderAll();
  }
}

window.initDashboardPage = initDashboardPage;
