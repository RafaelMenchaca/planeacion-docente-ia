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
  stagingPanelOpen: false,
  progress: { total: 0, completed: 0, items: [], finalMessage: "", finalTone: "info" },
  quickCreate: {
    open: false,
    temas: [],
    requestVersion: { grado: 0, materia: 0, unidad: 0 }
  },
  searchQuery: "",
  generating: false,
  modal: { type: null, submitting: false },
  confirmDelete: {
    open: false,
    type: null,
    id: null,
    parentIds: {},
    title: "",
    message: "",
    warning: "",
    error: "",
    submitLabel: "Si, eliminar",
    busy: false
  }
};

const heroActionsByLevel = {
  root: { label: "+ Crear plantel", action: "create-plantel" },
  plantel: { label: "+ Nuevo grado", action: "create-grado" },
  grado: { label: "+ Nueva materia", action: "create-materia" },
  materia: { label: "+ Nueva unidad", action: "create-unidad" },
  unidad: { label: "+ Agregar temas", action: "focus-staging" }
};

let isDashboardBound = false;
const QUICK_CREATE_NEW_VALUE = "__new__";
const DASHBOARD_LOCATION_STORAGE_KEY = "educativo.dashboard.last-location";

function getExplorerStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function getPersistedExplorerLocation() {
  const storage = getExplorerStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(DASHBOARD_LOCATION_STORAGE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    const current = parsed?.current;
    if (!current || typeof current !== "object") return null;

    const allowedLevels = new Set(["root", "plantel", "grado", "materia", "unidad"]);
    const level = allowedLevels.has(current.level) ? current.level : "root";

    return {
      level,
      plantelId: current.plantelId || null,
      gradoId: current.gradoId || null,
      materiaId: current.materiaId || null,
      unidadId: current.unidadId || null
    };
  } catch {
    return null;
  }
}

function persistExplorerLocation() {
  const storage = getExplorerStorage();
  if (!storage) return;

  try {
    storage.setItem(
      DASHBOARD_LOCATION_STORAGE_KEY,
      JSON.stringify({
        current: {
          level: explorerState.current.level,
          plantelId: explorerState.current.plantelId,
          gradoId: explorerState.current.gradoId,
          materiaId: explorerState.current.materiaId,
          unidadId: explorerState.current.unidadId
        }
      })
    );
  } catch {
    // Ignore storage write failures.
  }
}

function syncBodyScrollLock() {
  if (!document.body) return;

  document.body.classList.toggle(
    "overflow-hidden",
    explorerState.quickCreate.open || explorerState.confirmDelete.open
  );
}

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

function getNextOrder(items) {
  const list = Array.isArray(items) ? items : [];
  const explicitOrders = list
    .map((item) => Number(item?.orden))
    .filter((order) => Number.isFinite(order) && order > 0);

  if (explicitOrders.length > 0) {
    return Math.max(...explicitOrders) + 1;
  }

  return list.length + 1;
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

function findGradoById(plantelId, gradoId) {
  const list = explorerState.gradosByPlantel[plantelId] || [];
  return list.find((item) => item.id === gradoId) || null;
}

function findMateriaById(gradoId, materiaId) {
  const list = explorerState.materiasByGrado[gradoId] || [];
  return list.find((item) => item.id === materiaId) || null;
}

function findUnidadById(materiaId, unidadId) {
  const list = explorerState.unidadesByMateria[materiaId] || [];
  return list.find((item) => item.id === unidadId) || null;
}

function findTemaById(unidadId, temaId) {
  const list = explorerState.temasByUnidad[unidadId] || [];
  return list.find((item) => item.id === temaId) || null;
}

function setCurrentLevel(level, ids) {
  const previousUnitId = explorerState.current.unidadId;
  explorerState.current.level = level;
  explorerState.current.plantelId = ids.plantelId ?? null;
  explorerState.current.gradoId = ids.gradoId ?? null;
  explorerState.current.materiaId = ids.materiaId ?? null;
  explorerState.current.unidadId = ids.unidadId ?? null;

  const unitChanged = level === "unidad" && previousUnitId && previousUnitId !== explorerState.current.unidadId;

  if (level !== "unidad" || unitChanged) {
    explorerState.stagingTemas = [];
    explorerState.stagingPanelOpen = false;
    if (!explorerState.generating) {
      explorerState.progress = { total: 0, completed: 0, items: [], finalMessage: "", finalTone: "info" };
    }
  }

  persistExplorerLocation();
}

function updateProgressCounters() {
  explorerState.progress.total = explorerState.progress.items.length;
  explorerState.progress.completed = explorerState.progress.items.filter((item) => item.status === "ready").length;
}

function shouldShowUnitProgress() {
  return explorerState.generating || explorerState.progress.items.length > 0 || Boolean(explorerState.progress.finalMessage);
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

  const hasCurrentPlantel = Boolean(explorerState.current.plantelId);
  const exists = explorerState.planteles.some((item) => item.id === explorerState.current.plantelId);
  if (hasCurrentPlantel && !exists) {
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

async function restorePersistedExplorerLocation() {
  const persisted = getPersistedExplorerLocation();
  if (!persisted) return false;

  if (persisted.level === "root") {
    await selectRoot();
    return true;
  }

  const plantelId = persisted.plantelId;
  if (!plantelId || !explorerState.planteles.some((item) => item.id === plantelId)) {
    return false;
  }

  await ensureGrados(plantelId);

  if (persisted.level === "plantel" || !persisted.gradoId) {
    await selectPlantel(plantelId);
    return true;
  }

  const gradoId = persisted.gradoId;
  const grados = explorerState.gradosByPlantel[plantelId] || [];
  if (!grados.some((item) => item.id === gradoId)) {
    await selectPlantel(plantelId);
    return true;
  }

  await ensureMaterias(gradoId);

  if (persisted.level === "grado" || !persisted.materiaId) {
    await selectGrado(plantelId, gradoId);
    return true;
  }

  const materiaId = persisted.materiaId;
  const materias = explorerState.materiasByGrado[gradoId] || [];
  if (!materias.some((item) => item.id === materiaId)) {
    await selectGrado(plantelId, gradoId);
    return true;
  }

  await ensureUnidades(materiaId);

  if (persisted.level === "materia" || !persisted.unidadId) {
    await selectMateria(plantelId, gradoId, materiaId);
    return true;
  }

  const unidadId = persisted.unidadId;
  const unidades = explorerState.unidadesByMateria[materiaId] || [];
  if (!unidades.some((item) => item.id === unidadId)) {
    await selectMateria(plantelId, gradoId, materiaId);
    return true;
  }

  await selectUnidad(plantelId, gradoId, materiaId, unidadId);
  return true;
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

function buildDataAttributes(attributes = {}) {
  return Object.entries(attributes)
    .filter(([, value]) => value !== undefined && value !== null && value !== "")
    .map(([key, value]) => ` data-${key}="${escapeHtml(String(value))}"`)
    .join("");
}

function renderTrashIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M3 6h18"></path>
      <path d="M8 6V4.75A1.75 1.75 0 0 1 9.75 3h4.5A1.75 1.75 0 0 1 16 4.75V6"></path>
      <path d="M6.5 6l.8 12.2A2 2 0 0 0 9.29 20h5.42a2 2 0 0 0 1.99-1.8L17.5 6"></path>
      <path d="M10 10.25v5.5"></path>
      <path d="M14 10.25v5.5"></path>
    </svg>
  `;
}

function renderActionButton(config) {
  if (!config?.action) return "";

  const classes = [
    config.iconOnly
      ? (config.tone === "danger" ? "explorer-danger-icon-btn" : "explorer-icon-btn")
      : (config.tone === "danger" ? "explorer-danger-btn" : "explorer-action-btn"),
    config.className || ""
  ]
    .filter(Boolean)
    .join(" ");

  const label = config.label || "";
  const title = config.title || label;
  const titleAttrs = title ? ` title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}"` : "";

  return `
    <button
      type="button"
      class="${classes}"
      data-content-action="${escapeHtml(config.action)}"${buildDataAttributes(config.attrs)}${titleAttrs}
    >
      ${config.iconOnly ? renderTrashIcon() : escapeHtml(label)}
    </button>
  `;
}

function getLevelHeaderActions(level = explorerState.current.level) {
  const createAction = heroActionsByLevel[level] || heroActionsByLevel.root;
  const actions = [];

  if (createAction?.action) {
    actions.push({
      label: createAction.label,
      action: createAction.action,
      tone: "neutral"
    });
  }

  return actions;
}

function renderLevelSectionHeader(title, description, level = explorerState.current.level) {
  const actions = getLevelHeaderActions(level);

  return `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h3 class="text-base font-semibold text-slate-900">${escapeHtml(title)}</h3>
        <p class="mt-1 text-sm text-slate-600">${escapeHtml(description)}</p>
      </div>
      <div class="explorer-section-actions">
        ${actions.map((action) => renderActionButton(action)).join("")}
      </div>
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

function renderDeleteConfirmModal() {
  const modal = document.getElementById("delete-confirm-modal");
  const title = document.getElementById("delete-confirm-title");
  const message = document.getElementById("delete-confirm-message");
  const warning = document.getElementById("delete-confirm-warning");
  const error = document.getElementById("delete-confirm-error");
  const submit = document.getElementById("delete-confirm-submit");
  const cancel = document.getElementById("delete-confirm-cancel");
  const close = document.getElementById("delete-confirm-close");

  if (!modal || !title || !message || !warning || !error || !submit || !cancel || !close) return;

  const state = explorerState.confirmDelete;
  modal.classList.toggle("hidden", !state.open);
  syncBodyScrollLock();

  if (!state.open) {
    error.classList.add("hidden");
    warning.classList.add("hidden");
    error.textContent = "";
    warning.textContent = "";
    return;
  }

  title.textContent = state.title || "Confirmar eliminacion";
  message.textContent = state.message || "";

  if (state.warning) {
    warning.classList.remove("hidden");
    warning.textContent = state.warning;
  } else {
    warning.classList.add("hidden");
    warning.textContent = "";
  }

  if (state.error) {
    error.classList.remove("hidden");
    error.textContent = state.error;
  } else {
    error.classList.add("hidden");
    error.textContent = "";
  }

  submit.textContent = state.busy ? "Eliminando..." : (state.submitLabel || "Si, eliminar");
  submit.disabled = state.busy;
  cancel.disabled = state.busy;
  close.disabled = state.busy;
}

function openDeleteConfirm(config) {
  Object.assign(explorerState.confirmDelete, {
    open: true,
    type: config?.type || null,
    id: config?.id || null,
    parentIds: { ...(config?.parentIds || {}) },
    title: config?.title || "Confirmar eliminacion",
    message: config?.message || "",
    warning: config?.warning || "",
    error: "",
    submitLabel: config?.submitLabel || "Si, eliminar",
    busy: false
  });

  renderDeleteConfirmModal();
}

function closeDeleteConfirm({ force = false } = {}) {
  if (explorerState.confirmDelete.busy && !force) return;

  Object.assign(explorerState.confirmDelete, {
    open: false,
    type: null,
    id: null,
    parentIds: {},
    title: "",
    message: "",
    warning: "",
    error: "",
    submitLabel: "Si, eliminar",
    busy: false
  });

  renderDeleteConfirmModal();
}

function pruneTemaRecord(unidadId, temaId) {
  if (!unidadId || !temaId) return;

  if (Array.isArray(explorerState.temasByUnidad[unidadId])) {
    explorerState.temasByUnidad[unidadId] = explorerState.temasByUnidad[unidadId].filter((tema) => tema.id !== temaId);
  }

  explorerState.progress.items = explorerState.progress.items.filter((item) => item.temaId !== temaId);
  delete explorerState.planeacionByTema[temaId];
  updateProgressCounters();
}

function pruneUnidadBranch(unidadId) {
  if (!unidadId) return;

  const temas = explorerState.temasByUnidad[unidadId] || [];
  temas.forEach((tema) => {
    if (tema?.id) delete explorerState.planeacionByTema[tema.id];
  });

  delete explorerState.temasByUnidad[unidadId];
  delete explorerState.loading.temas[unidadId];
  delete explorerState.errors.temas[unidadId];
}

function pruneMateriaBranch(materiaId) {
  if (!materiaId) return;

  const unidades = explorerState.unidadesByMateria[materiaId] || [];
  unidades.forEach((unidad) => pruneUnidadBranch(unidad.id));

  explorerState.expandedMaterias.delete(materiaId);
  delete explorerState.unidadesByMateria[materiaId];
  delete explorerState.loading.unidades[materiaId];
  delete explorerState.errors.unidades[materiaId];
}

function pruneGradoBranch(gradoId) {
  if (!gradoId) return;

  const materias = explorerState.materiasByGrado[gradoId] || [];
  materias.forEach((materia) => pruneMateriaBranch(materia.id));

  explorerState.expandedGrados.delete(gradoId);
  delete explorerState.materiasByGrado[gradoId];
  delete explorerState.loading.materias[gradoId];
  delete explorerState.errors.materias[gradoId];
}

function prunePlantelBranch(plantelId) {
  if (!plantelId) return;

  const grados = explorerState.gradosByPlantel[plantelId] || [];
  grados.forEach((grado) => pruneGradoBranch(grado.id));

  explorerState.expandedPlanteles.delete(plantelId);
  explorerState.planteles = explorerState.planteles.filter((plantel) => plantel.id !== plantelId);
  delete explorerState.gradosByPlantel[plantelId];
  delete explorerState.loading.grados[plantelId];
  delete explorerState.errors.grados[plantelId];
}

function getDeleteDialogConfig(action, ids) {
  if (action === "delete-plantel") {
    const plantel = explorerState.planteles.find((item) => item.id === ids.plantelId) || getCurrentPlantel();
    const nombre = plantel?.nombre || "este plantel";
    return {
      type: "plantel",
      id: ids.plantelId,
      parentIds: {},
      title: "Eliminar plantel",
      message: `Se eliminara ${nombre}.`,
      warning: "Se eliminara este plantel y todo su contenido: grados, materias, unidades, temas y planeaciones."
    };
  }

  if (action === "delete-grado") {
    const grado = findGradoById(ids.plantelId, ids.gradoId) || getCurrentGrado();
    const nombre = grado?.nombre || "este grado";
    return {
      type: "grado",
      id: ids.gradoId,
      parentIds: { plantelId: ids.plantelId },
      title: "Eliminar grado",
      message: `Se eliminara ${nombre}.`,
      warning: "Se eliminara este grado y todas sus materias, unidades, temas y planeaciones."
    };
  }

  if (action === "delete-materia") {
    const materia = findMateriaById(ids.gradoId, ids.materiaId) || getCurrentMateria();
    const nombre = materia?.nombre || "esta materia";
    return {
      type: "materia",
      id: ids.materiaId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId
      },
      title: "Eliminar materia",
      message: `Se eliminara ${nombre}.`,
      warning: "Se eliminara esta materia y todas sus unidades, temas y planeaciones."
    };
  }

  if (action === "delete-unidad") {
    const unidad = findUnidadById(ids.materiaId, ids.unidadId) || getCurrentUnidad();
    const nombre = unidad?.nombre || "esta unidad";
    return {
      type: "unidad",
      id: ids.unidadId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId
      },
      title: "Eliminar unidad",
      message: `Se eliminara ${nombre}.`,
      warning: "Se eliminara esta unidad y todos sus temas y planeaciones."
    };
  }

  if (action === "delete-tema") {
    const tema = findTemaById(ids.unidadId, ids.temaId);
    const nombre = tema?.titulo || "este tema";
    return {
      type: "tema",
      id: ids.temaId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId,
        unidadId: ids.unidadId
      },
      title: "Eliminar tema",
      message: `Se eliminara ${nombre}.`,
      warning: "Se eliminara este tema y su planeacion asociada, si existe."
    };
  }

  if (action === "delete-planeacion") {
    const tema = findTemaById(ids.unidadId, ids.temaId);
    const nombre = tema?.titulo || "este tema";
    return {
      type: "planeacion",
      id: ids.planeacionId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId,
        unidadId: ids.unidadId,
        temaId: ids.temaId
      },
      title: "Eliminar planeacion",
      message: `Se eliminara la planeacion asociada a ${nombre}.`,
      warning: "El tema se conservara."
    };
  }

  return null;
}

function requestDeleteAction(action, ids) {
  const config = getDeleteDialogConfig(action, ids);
  if (!config?.id) return;
  openDeleteConfirm(config);
}

async function refreshAfterHierarchyDelete(type, context = {}) {
  if (type === "plantel") {
    prunePlantelBranch(context.id);
    await loadPlanteles();
    await selectRoot();
    return;
  }

  if (type === "grado") {
    pruneGradoBranch(context.id);
    delete explorerState.gradosByPlantel[context.plantelId];
    delete explorerState.loading.grados[context.plantelId];
    delete explorerState.errors.grados[context.plantelId];
    await selectPlantel(context.plantelId);
    return;
  }

  if (type === "materia") {
    pruneMateriaBranch(context.id);
    delete explorerState.materiasByGrado[context.gradoId];
    delete explorerState.loading.materias[context.gradoId];
    delete explorerState.errors.materias[context.gradoId];
    await selectGrado(context.plantelId, context.gradoId);
    return;
  }

  if (type === "unidad") {
    pruneUnidadBranch(context.id);
    delete explorerState.unidadesByMateria[context.materiaId];
    delete explorerState.loading.unidades[context.materiaId];
    delete explorerState.errors.unidades[context.materiaId];
    await selectMateria(context.plantelId, context.gradoId, context.materiaId);
    return;
  }

  if (type === "tema") {
    pruneTemaRecord(context.unidadId, context.id);
    delete explorerState.temasByUnidad[context.unidadId];
    delete explorerState.loading.temas[context.unidadId];
    delete explorerState.errors.temas[context.unidadId];
    await selectUnidad(context.plantelId, context.gradoId, context.materiaId, context.unidadId);
    return;
  }

  if (type === "planeacion") {
    explorerState.planeacionByTema[context.temaId] = null;
    delete explorerState.temasByUnidad[context.unidadId];
    delete explorerState.loading.temas[context.unidadId];
    delete explorerState.errors.temas[context.unidadId];
    await selectUnidad(context.plantelId, context.gradoId, context.materiaId, context.unidadId);
  }
}

async function submitDeleteConfirm() {
  if (!explorerState.confirmDelete.open || explorerState.confirmDelete.busy || !explorerState.confirmDelete.type || !explorerState.confirmDelete.id) {
    return;
  }

  explorerState.confirmDelete.busy = true;
  explorerState.confirmDelete.error = "";
  renderDeleteConfirmModal();

  const { type, id, parentIds } = explorerState.confirmDelete;

  try {
    if (type === "plantel") await eliminarPlantel(id);
    else if (type === "grado") await eliminarGrado(id);
    else if (type === "materia") await eliminarMateria(id);
    else if (type === "unidad") await eliminarUnidad(id);
    else if (type === "tema") await eliminarTema(id);
    else if (type === "planeacion") await eliminarPlaneacionApi(id);

    closeDeleteConfirm({ force: true });
    try {
      await refreshAfterHierarchyDelete(type, { id, ...parentIds });
    } catch (refreshError) {
      explorerState.errors.root = formatFetchError(refreshError, "La eliminacion se completo, pero no se pudo refrescar el explorador.");
      renderAll();
    }
  } catch (error) {
    explorerState.confirmDelete.busy = false;
    explorerState.confirmDelete.error = formatFetchError(error, "No se pudo completar la eliminacion.");
    renderDeleteConfirmModal();
  }
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
  syncBodyScrollLock();
}

function syncQuickSelectVisualState(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const hasValue = Boolean(select.value);
  select.classList.toggle("text-slate-400", !hasValue);
  select.classList.toggle("text-slate-900", hasValue);
}

function setQuickSelectOptions(selectId, items, config = {}) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const {
    placeholder = "Selecciona una opcion",
    createLabel = "Crear nuevo",
    selectedValue = select.value || ""
  } = config;

  const baseOptions = [];
  if (placeholder) {
    baseOptions.push(`<option value="" disabled hidden>${escapeHtml(placeholder)}</option>`);
  }

  const entityOptions = (items || [])
    .filter((item) => item?.id)
    .map((item) => `<option value="${escapeHtml(String(item.id))}">${escapeHtml(item.nombre || "Sin nombre")}</option>`);

  baseOptions.push(...entityOptions);
  baseOptions.push(`<option value="${QUICK_CREATE_NEW_VALUE}">${escapeHtml(createLabel)}</option>`);

  select.innerHTML = baseOptions.join("");

  const validValues = new Set(Array.from(select.options).map((option) => option.value));
  select.value = validValues.has(selectedValue) ? selectedValue : (validValues.has("") ? "" : QUICK_CREATE_NEW_VALUE);

  Array.from(select.options).forEach((option) => {
    const isPlaceholder = option.value === "";
    option.style.color = isPlaceholder ? "rgb(148 163 184)" : "rgb(15 23 42)";
    option.style.backgroundColor = "rgb(255 255 255)";
  });

  syncQuickSelectVisualState(selectId);
}

function getQuickSelectValue(selectId) {
  const select = document.getElementById(selectId);
  return select?.value || "";
}

function getQuickExistingId(selectId) {
  const value = getQuickSelectValue(selectId);
  if (!value || value === QUICK_CREATE_NEW_VALUE) return null;
  return value;
}

function resetQuickInput(inputId) {
  const input = document.getElementById(inputId);
  if (input) input.value = "";
}

function resetQuickSelect(selectId) {
  const select = document.getElementById(selectId);
  if (select) {
    select.value = "";
    syncQuickSelectVisualState(selectId);
  }
}

function toggleQuickRowVisibility(rowId, visible) {
  const row = document.getElementById(rowId);
  if (!row) return;
  row.classList.toggle("hidden", !visible);
}

function toggleQuickInputRows() {
  const showPlantelNew = getQuickSelectValue("quick-plantel-select") === QUICK_CREATE_NEW_VALUE;
  toggleQuickRowVisibility("quick-plantel-new", showPlantelNew);
  if (!showPlantelNew) resetQuickInput("quick-plantel-new");

  const showGradoNew = getQuickSelectValue("quick-grado-select") === QUICK_CREATE_NEW_VALUE;
  toggleQuickRowVisibility("quick-grado-new-row", showGradoNew);
  if (!showGradoNew) resetQuickInput("quick-grado-new");

  const showMateriaNew = getQuickSelectValue("quick-materia-select") === QUICK_CREATE_NEW_VALUE;
  toggleQuickRowVisibility("quick-materia-new", showMateriaNew);
  if (!showMateriaNew) resetQuickInput("quick-materia-new");

  const showUnidadNew = getQuickSelectValue("quick-unidad-select") === QUICK_CREATE_NEW_VALUE;
  toggleQuickRowVisibility("quick-unidad-new-row", showUnidadNew);
  if (!showUnidadNew) resetQuickInput("quick-unidad-new");
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
    explorerState.quickCreate.requestVersion.grado += 1;
    explorerState.quickCreate.requestVersion.materia += 1;
    explorerState.quickCreate.requestVersion.unidad += 1;

    setQuickSelectOptions("quick-grado-select", [], {
      placeholder: "Selecciona primero un plantel",
      createLabel: "Crear nuevo grado",
      selectedValue: ""
    });
    setQuickSelectOptions("quick-materia-select", [], {
      placeholder: "Selecciona primero un grado",
      createLabel: "Crear nueva materia",
      selectedValue: ""
    });
    setQuickSelectOptions("quick-unidad-select", [], {
      placeholder: "Selecciona primero una materia",
      createLabel: "Crear nueva unidad",
      selectedValue: ""
    });

    resetQuickInput("quick-grado-new");
    resetQuickInput("quick-materia-new");
    resetQuickInput("quick-unidad-new");
    toggleQuickInputRows();
    return;
  }

  if (level === "grado") {
    explorerState.quickCreate.requestVersion.materia += 1;
    explorerState.quickCreate.requestVersion.unidad += 1;

    setQuickSelectOptions("quick-materia-select", [], {
      placeholder: "Selecciona primero un grado",
      createLabel: "Crear nueva materia",
      selectedValue: ""
    });
    setQuickSelectOptions("quick-unidad-select", [], {
      placeholder: "Selecciona primero una materia",
      createLabel: "Crear nueva unidad",
      selectedValue: ""
    });

    resetQuickInput("quick-materia-new");
    resetQuickInput("quick-unidad-new");
    toggleQuickInputRows();
    return;
  }

  if (level === "materia") {
    explorerState.quickCreate.requestVersion.unidad += 1;

    setQuickSelectOptions("quick-unidad-select", [], {
      placeholder: "Selecciona primero una materia",
      createLabel: "Crear nueva unidad",
      selectedValue: ""
    });
    resetQuickInput("quick-unidad-new");
    toggleQuickInputRows();
  }
}

async function fillQuickGradoOptions(plantelId = getQuickExistingId("quick-plantel-select")) {
  const requestId = ++explorerState.quickCreate.requestVersion.grado;
  let grados = [];
  if (plantelId) {
    await ensureGrados(plantelId);
    grados = explorerState.gradosByPlantel[plantelId] || [];
  }
  if (requestId !== explorerState.quickCreate.requestVersion.grado) return;
  setQuickSelectOptions("quick-grado-select", grados, {
    placeholder: plantelId ? "Selecciona un grado" : "Selecciona primero un plantel",
    createLabel: "Crear nuevo grado"
  });
  toggleQuickInputRows();
}

async function fillQuickMateriaOptions(gradoId = getQuickExistingId("quick-grado-select")) {
  const requestId = ++explorerState.quickCreate.requestVersion.materia;
  let materias = [];
  if (gradoId) {
    await ensureMaterias(gradoId);
    materias = explorerState.materiasByGrado[gradoId] || [];
  }
  if (requestId !== explorerState.quickCreate.requestVersion.materia) return;
  setQuickSelectOptions("quick-materia-select", materias, {
    placeholder: gradoId ? "Selecciona una materia" : "Selecciona primero un grado",
    createLabel: "Crear nueva materia"
  });
  toggleQuickInputRows();
}

async function fillQuickUnidadOptions(materiaId = getQuickExistingId("quick-materia-select")) {
  const requestId = ++explorerState.quickCreate.requestVersion.unidad;
  let unidades = [];
  if (materiaId) {
    await ensureUnidades(materiaId);
    unidades = explorerState.unidadesByMateria[materiaId] || [];
  }
  if (requestId !== explorerState.quickCreate.requestVersion.unidad) return;
  setQuickSelectOptions("quick-unidad-select", unidades, {
    placeholder: materiaId ? "Selecciona una unidad" : "Selecciona primero una materia",
    createLabel: "Crear nueva unidad"
  });
  toggleQuickInputRows();
}

async function initQuickCreateForm() {
  explorerState.quickCreate.temas = [];
  explorerState.quickCreate.requestVersion = { grado: 0, materia: 0, unidad: 0 };
  showQuickCreateError("");
  setQuickSelectOptions("quick-plantel-select", explorerState.planteles || [], {
    placeholder: "Selecciona un plantel",
    createLabel: "Crear nuevo plantel",
    selectedValue: ""
  });

  resetQuickSelect("quick-grado-select");
  resetQuickSelect("quick-materia-select");
  resetQuickSelect("quick-unidad-select");

  [
    "quick-plantel-new",
    "quick-grado-new",
    "quick-materia-new",
    "quick-unidad-new",
    "quick-tema-title"
  ].forEach(resetQuickInput);

  clearQuickChildSuggestions("plantel");
  renderQuickTemasList();
  toggleQuickInputRows();

  const durationInput = document.getElementById("quick-tema-duration");
  if (durationInput) durationInput.value = "50";
}

async function openQuickCreatePanel() {
  explorerState.quickCreate.open = true;
  setQuickPanelVisibility(true);
  await initQuickCreateForm();

  const input = document.getElementById("quick-plantel-select");
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

function requireQuickSelectOrNew(selectId, newInputId, label) {
  const selected = getQuickSelectValue(selectId);
  if (!selected) {
    throw new Error(`Selecciona una opcion para ${label}.`);
  }

  if (selected === QUICK_CREATE_NEW_VALUE) {
    return { id: null, nombre: requireQuickText(newInputId, label), isNew: true };
  }

  return { id: selected, nombre: "", isNew: false };
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
              <div class="explorer-list-item explorer-list-item-shell">
                <button type="button" class="explorer-list-item-open" data-content-action="open-plantel" data-plantel-id="${plantel.id}">
                  <p class="explorer-list-item-title">${escapeHtml(plantel.nombre || "Sin nombre")}</p>
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Plantel</span>
                  ${renderActionButton({
                    action: "delete-plantel",
                    tone: "danger",
                    iconOnly: true,
                    title: `Eliminar plantel ${plantel.nombre || ""}`.trim(),
                    attrs: { "plantel-id": plantel.id }
                  })}
                </div>
              </div>
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
  let content = "";

  if (explorerState.loading.grados[plantel.id]) {
    content = '<p class="text-sm text-slate-500">Cargando grados...</p>';
  } else if (explorerState.errors.grados[plantel.id]) {
    content = `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.grados[plantel.id])}</div>`;
  } else if (grados.length === 0) {
    content = `
      <div class="explorer-empty">
        <p>No hay grados dentro de este plantel.</p>
      </div>
    `;
  } else {
    content = `
      <div class="explorer-list-grid">
        ${grados
          .map((grado) => {
            const subjects = explorerState.materiasByGrado[grado.id]?.length;
            const meta = Number.isInteger(subjects) ? `${subjects} materia(s)` : "Abrir materias";
            return `
              <div class="explorer-list-item explorer-list-item-shell">
                <button type="button" class="explorer-list-item-open" data-content-action="open-grado" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}">
                  <p class="explorer-list-item-title">${escapeHtml(grado.nombre || "Sin nombre")}</p>
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Grado</span>
                  ${renderActionButton({
                    action: "delete-grado",
                    tone: "danger",
                    iconOnly: true,
                    title: `Eliminar grado ${grado.nombre || ""}`.trim(),
                    attrs: {
                      "plantel-id": plantel.id,
                      "grado-id": grado.id
                    }
                  })}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Grados en ${plantel.nombre || "plantel"}`, "Entra a un grado para administrar materias.", "plantel")}
      ${content}
    </div>
  `;
}

function renderGradoLevel() {
  const plantel = getCurrentPlantel();
  const grado = getCurrentGrado();
  if (!plantel || !grado) return '<p class="text-sm text-slate-500">Selecciona un grado valido.</p>';

  const materias = explorerState.materiasByGrado[grado.id] || [];
  let content = "";

  if (explorerState.loading.materias[grado.id]) {
    content = '<p class="text-sm text-slate-500">Cargando materias...</p>';
  } else if (explorerState.errors.materias[grado.id]) {
    content = `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.materias[grado.id])}</div>`;
  } else if (materias.length === 0) {
    content = `
      <div class="explorer-empty">
        <p>No hay materias en este grado.</p>
      </div>
    `;
  } else {
    content = `
      <div class="explorer-list-grid">
        ${materias
          .map((materia) => {
            const units = explorerState.unidadesByMateria[materia.id]?.length;
            const meta = Number.isInteger(units) ? `${units} unidad(es)` : "Abrir unidades";
            return `
              <div class="explorer-list-item explorer-list-item-shell">
                <button type="button" class="explorer-list-item-open" data-content-action="open-materia" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}" data-materia-id="${materia.id}">
                  <p class="explorer-list-item-title">${escapeHtml(materia.nombre || "Sin nombre")}</p>
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Materia</span>
                  ${renderActionButton({
                    action: "delete-materia",
                    tone: "danger",
                    iconOnly: true,
                    title: `Eliminar materia ${materia.nombre || ""}`.trim(),
                    attrs: {
                      "plantel-id": plantel.id,
                      "grado-id": grado.id,
                      "materia-id": materia.id
                    }
                  })}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Materias en ${grado.nombre || "grado"}`, "Entra a una materia para administrar unidades.", "grado")}
      ${content}
    </div>
  `;
}

function renderMateriaLevel() {
  const plantel = getCurrentPlantel();
  const grado = getCurrentGrado();
  const materia = getCurrentMateria();
  if (!plantel || !grado || !materia) return '<p class="text-sm text-slate-500">Selecciona una materia valida.</p>';

  const unidades = explorerState.unidadesByMateria[materia.id] || [];
  let content = "";

  if (explorerState.loading.unidades[materia.id]) {
    content = '<p class="text-sm text-slate-500">Cargando unidades...</p>';
  } else if (explorerState.errors.unidades[materia.id]) {
    content = `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.unidades[materia.id])}</div>`;
  } else if (unidades.length === 0) {
    content = `
      <div class="explorer-empty">
        <p>No hay unidades en esta materia.</p>
      </div>
    `;
  } else {
    content = `
      <div class="explorer-list-grid">
        ${unidades
          .map((unidad) => {
            const topics = explorerState.temasByUnidad[unidad.id]?.length;
            const meta = Number.isInteger(topics) ? `${topics} tema(s)` : "Abrir temas";
            return `
              <div class="explorer-list-item explorer-list-item-shell">
                <button type="button" class="explorer-list-item-open" data-content-action="open-unidad" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}" data-materia-id="${materia.id}" data-unidad-id="${unidad.id}">
                  <p class="explorer-list-item-title">${escapeHtml(unidad.nombre || "Sin nombre")}</p>
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Unidad</span>
                  ${renderActionButton({
                    action: "delete-unidad",
                    tone: "danger",
                    iconOnly: true,
                    title: `Eliminar unidad ${unidad.nombre || ""}`.trim(),
                    attrs: {
                      "plantel-id": plantel.id,
                      "grado-id": grado.id,
                      "materia-id": materia.id,
                      "unidad-id": unidad.id
                    }
                  })}
                </div>
              </div>
            `;
          })
          .join("")}
      </div>
    `;
  }

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Unidades en ${materia.nombre || "materia"}`, "Selecciona una unidad para ver temas y generar planeaciones.", "materia")}
      ${content}
    </div>
  `;
}

function renderProgressPill(status, label = statusLabelFromTone(status)) {
  const safeLabel = escapeHtml(label || statusLabelFromTone(status));

  return `
    <span class="explorer-status-pill ${status}">
      <span class="explorer-status-indicator ${status}" aria-hidden="true"></span>
      <span>${safeLabel}</span>
      ${status === "generating" ? '<span class="explorer-ellipsis" aria-hidden="true">...</span>' : ""}
    </span>
  `;
}

function renderProgressSection() {
  const progress = explorerState.progress;
  const list = progress.items
    .map((item) => `
      <div class="explorer-progress-item ${item.status}">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-semibold">${escapeHtml(item.titulo || "Tema")}</p>
          ${renderProgressPill(item.status, item.statusLabel)}
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
        <span class="text-xs text-slate-500">${explorerState.generating ? "Tiempo real" : "Ultima ejecucion"}</span>
      </div>
      <div class="mt-3 space-y-3">
        <div class="flex flex-col gap-2 rounded-xl border border-cyan-200 bg-cyan-50 p-3 text-sm text-cyan-900 sm:flex-row sm:items-center sm:justify-between">
          <p><span class="font-semibold">Progreso:</span> ${progress.completed}/${progress.total} completadas</p>
          <p class="text-xs text-cyan-800">${explorerState.generating ? "Procesando temas..." : `${progress.total} tema(s) procesados`}</p>
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
              ${planeacion?.id ? `
                <button type="button" class="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50" data-content-action="open-planeacion" data-planeacion-id="${planeacion.id}">
                  Abrir planeacion
                </button>
              ` : ""}
              ${renderActionButton({
                action: "delete-tema",
                tone: "danger",
                iconOnly: true,
                title: "Eliminar tema y su planeacion",
                attrs: {
                  "tema-id": tema.id,
                  "plantel-id": explorerState.current.plantelId,
                  "grado-id": explorerState.current.gradoId,
                  "materia-id": explorerState.current.materiaId,
                  "unidad-id": explorerState.current.unidadId
                }
              })}
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
  const showStagingPanel = explorerState.stagingPanelOpen || explorerState.stagingTemas.length > 0 || explorerState.generating;
  const layoutClasses = showStagingPanel
    ? "grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]"
    : "grid grid-cols-1 gap-4";
  const progressHtml = shouldShowUnitProgress() ? renderProgressSection() : "";

  return `
    <div class="space-y-4">
      ${renderLevelSectionHeader(`Temas en ${unidad.nombre || "unidad"}`, "Agrega temas pendientes y luego genera planeaciones.", "unidad")}
      <div class="${layoutClasses}">
        <section class="rounded-2xl border border-slate-200 bg-white p-4">
          <div class="mb-3 flex items-center justify-between gap-2">
            <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Temas guardados</h4>
            <span class="text-xs text-slate-500">${temas.length} tema(s)</span>
          </div>
          <div class="space-y-2">${temasHtml}</div>
        </section>

        ${showStagingPanel ? `
          <section class="explorer-staging-panel rounded-2xl border border-slate-200 bg-white p-4">
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

            <div class="mt-4 flex flex-col gap-3 sm:flex-row">
              <button type="button" class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 ${explorerState.generating ? "opacity-70" : ""}" data-content-action="cancel-staging" ${explorerState.generating ? "disabled" : ""}>
                Cancelar
              </button>
              <button type="button" class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-5 py-3 text-sm font-semibold text-white hover:bg-cyan-800 ${disableGenerate ? "opacity-70" : ""}" data-content-action="generate-planeaciones" ${disableGenerate ? "disabled" : ""}>
                ${explorerState.generating ? "Generando..." : `Generar planeaciones (${explorerState.stagingTemas.length})`}
              </button>
            </div>
          </section>
        ` : ""}
      </div>

      ${progressHtml}
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
  renderDeleteConfirmModal();
}

function getNodeIds(element) {
  return {
    plantelId: element.getAttribute("data-plantel-id"),
    gradoId: element.getAttribute("data-grado-id"),
    materiaId: element.getAttribute("data-materia-id"),
    unidadId: element.getAttribute("data-unidad-id"),
    temaId: element.getAttribute("data-tema-id"),
    planeacionId: element.getAttribute("data-planeacion-id")
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

function cancelStagingPanel() {
  if (explorerState.generating) return;

  explorerState.stagingTemas = [];
  explorerState.stagingPanelOpen = false;
  renderExplorerContent();
}

function removeStagingTema(localId) {
  explorerState.stagingTemas = explorerState.stagingTemas.filter((item) => item.localId !== localId);
  renderExplorerContent();
}

function statusLabelFromTone(status) {
  if (status === "ready") return "Listo";
  if (status === "generating") return "Generando";
  if (status === "error") return "Error";
  return "En espera";
}

function initProgressFromStaging() {
  explorerState.stagingPanelOpen = true;
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

    const plantelSelection = requireQuickSelectOrNew("quick-plantel-select", "quick-plantel-new", "Plantel");
    let plantelId = plantelSelection.id;
    if (plantelId && !quickListHasId(explorerState.planteles, plantelId)) {
      throw new Error("El plantel seleccionado no es valido.");
    }
    if (!plantelId) {
      const created = await crearPlantel({ nombre: plantelSelection.nombre });
      plantelId = created?.id;
      if (!plantelId) throw new Error("No se pudo crear el plantel.");
      await loadPlanteles();
    }

    await ensureGrados(plantelId);
    const gradosDisponibles = explorerState.gradosByPlantel[plantelId] || [];
    const gradoSelection = requireQuickSelectOrNew("quick-grado-select", "quick-grado-new", "Grado");

    let gradoId = gradoSelection.id;
    if (gradoId && !quickListHasId(gradosDisponibles, gradoId)) {
      throw new Error("El grado seleccionado no pertenece al plantel elegido.");
    }
    if (!gradoId) {
      const payload = {
        nombre: gradoSelection.nombre,
        plantel_id: plantelId,
        orden: getNextOrder(gradosDisponibles)
      };

      const created = await crearGrado(payload);
      gradoId = created?.id;
      if (!gradoId) throw new Error("No se pudo crear el grado.");
      await ensureGrados(plantelId, { force: true });
    }

    await ensureMaterias(gradoId);
    const materiasDisponibles = explorerState.materiasByGrado[gradoId] || [];
    const materiaSelection = requireQuickSelectOrNew("quick-materia-select", "quick-materia-new", "Materia");

    let materiaId = materiaSelection.id;
    if (materiaId && !quickListHasId(materiasDisponibles, materiaId)) {
      throw new Error("La materia seleccionada no pertenece al grado elegido.");
    }
    if (!materiaId) {
      const created = await crearMateria({ nombre: materiaSelection.nombre, grado_id: gradoId });
      materiaId = created?.id;
      if (!materiaId) throw new Error("No se pudo crear la materia.");
      await ensureMaterias(gradoId, { force: true });
    }

    await ensureUnidades(materiaId);
    const unidadesDisponibles = explorerState.unidadesByMateria[materiaId] || [];
    const unidadSelection = requireQuickSelectOrNew("quick-unidad-select", "quick-unidad-new", "Unidad");

    let unidadId = unidadSelection.id;
    if (unidadId && !quickListHasId(unidadesDisponibles, unidadId)) {
      throw new Error("La unidad seleccionada no pertenece a la materia elegida.");
    }
    if (!unidadId) {
      const payload = {
        nombre: unidadSelection.nombre,
        materia_id: materiaId,
        orden: getNextOrder(unidadesDisponibles)
      };

      const created = await crearUnidad(payload);
      unidadId = created?.id;
      if (!unidadId) throw new Error("No se pudo crear la unidad.");
      await ensureUnidades(materiaId, { force: true });
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
  const submit = document.getElementById("entity-modal-submit");
  if (!modal || !title || !nameInput || !submit) return;

  explorerState.modal.type = type;
  explorerState.modal.submitting = false;

  const map = {
    plantel: { title: "Nuevo plantel", submit: "Crear plantel", placeholder: "Nombre del plantel" },
    grado: { title: "Nuevo grado", submit: "Crear grado", placeholder: "Nombre del grado" },
    materia: { title: "Nueva materia", submit: "Crear materia", placeholder: "Nombre de la materia" },
    unidad: { title: "Nueva unidad", submit: "Crear unidad", placeholder: "Nombre de la unidad" }
  };

  const config = map[type] || map.plantel;

  title.textContent = config.title;
  submit.textContent = config.submit;
  nameInput.value = "";
  nameInput.placeholder = config.placeholder;
  openModalError("");
  modal.classList.remove("hidden");
  requestAnimationFrame(() => nameInput.focus());
}

async function submitEntityModal(event) {
  event.preventDefault();
  if (explorerState.modal.submitting || !explorerState.modal.type) return;

  const nameInput = document.getElementById("entity-name-input");
  const submit = document.getElementById("entity-modal-submit");
  if (!nameInput || !submit) return;

  const nombre = nameInput.value.trim();

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

      await ensureGrados(plantelId);
      const payload = {
        nombre,
        plantel_id: plantelId,
        orden: getNextOrder(explorerState.gradosByPlantel[plantelId] || [])
      };

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

    await ensureUnidades(materiaId);
    const payload = {
      nombre,
      materia_id: materiaId,
      orden: getNextOrder(explorerState.unidadesByMateria[materiaId] || [])
    };

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
    explorerState.stagingPanelOpen = true;
    renderExplorerContent();
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

  if (["delete-plantel", "delete-grado", "delete-materia", "delete-unidad", "delete-tema", "delete-planeacion"].includes(action)) {
    requestDeleteAction(action, ids);
    return;
  }

  if (action === "add-staging-tema") return addStagingTemaFromInputs();
  if (action === "cancel-staging") return cancelStagingPanel();
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

  document.getElementById("quick-create-backdrop")?.addEventListener("click", () => {
    closeQuickCreatePanel();
  });

  const onQuickPlantelChange = async () => {
    clearQuickChildSuggestions("plantel");
    toggleQuickInputRows();

    const plantelId = getQuickExistingId("quick-plantel-select");
    if (!plantelId) return;
    await fillQuickGradoOptions(plantelId);
  };

  const onQuickGradoChange = async () => {
    clearQuickChildSuggestions("grado");
    toggleQuickInputRows();

    const gradoId = getQuickExistingId("quick-grado-select");
    if (!gradoId) return;
    await fillQuickMateriaOptions(gradoId);
  };

  const onQuickMateriaChange = async () => {
    clearQuickChildSuggestions("materia");
    toggleQuickInputRows();

    const materiaId = getQuickExistingId("quick-materia-select");
    if (!materiaId) return;
    await fillQuickUnidadOptions(materiaId);
  };

  document.getElementById("quick-plantel-select")?.addEventListener("change", () => {
    syncQuickSelectVisualState("quick-plantel-select");
    onQuickPlantelChange().catch((error) => console.error("Error actualizando grados en creacion rapida:", error));
  });

  document.getElementById("quick-grado-select")?.addEventListener("change", () => {
    syncQuickSelectVisualState("quick-grado-select");
    onQuickGradoChange().catch((error) => console.error("Error actualizando materias en creacion rapida:", error));
  });

  document.getElementById("quick-materia-select")?.addEventListener("change", () => {
    syncQuickSelectVisualState("quick-materia-select");
    onQuickMateriaChange().catch((error) => console.error("Error actualizando unidades en creacion rapida:", error));
  });

  document.getElementById("quick-unidad-select")?.addEventListener("change", () => {
    syncQuickSelectVisualState("quick-unidad-select");
    toggleQuickInputRows();
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

  ["delete-confirm-backdrop", "delete-confirm-close", "delete-confirm-cancel"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeDeleteConfirm();
    });
  });

  document.getElementById("delete-confirm-submit")?.addEventListener("click", () => {
    submitDeleteConfirm().catch((error) => {
      console.error("Error eliminando recurso:", error);
      explorerState.confirmDelete.busy = false;
      explorerState.confirmDelete.error = "No se pudo completar la eliminacion.";
      renderDeleteConfirmModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    if (explorerState.confirmDelete.open) {
      closeDeleteConfirm();
      return;
    }

    if (explorerState.quickCreate.open) {
      closeQuickCreatePanel();
      return;
    }

    if (explorerState.modal.type) {
      closeEntityModal();
    }
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

  if (await restorePersistedExplorerLocation()) {
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
