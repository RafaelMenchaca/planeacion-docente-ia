const explorerState = {
  planteles: [],
  gradosByPlantel: {},
  materiasByGrado: {},
  unidadesByMateria: {},
  temasByUnidad: {},
  examenesByUnidad: {},
  examenDetalleById: {},
  planeacionByTema: {},
  loading: { root: false, grados: {}, materias: {}, unidades: {}, temas: {}, examenes: {} },
  errors: { root: "", grados: {}, materias: {}, unidades: {}, temas: {}, examenes: {} },
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
  examGeneration: { active: false, unidadId: null, status: "idle", message: "" },
  examModal: { open: false, unidadId: null, selectedTypes: [], questionCounts: {}, submitting: false, error: "" },
  examPreview: { open: false, examenId: null, loading: false, error: "" },
  modal: { type: null, mode: "create", entityId: null, submitting: false },
  confirmDelete: {
    open: false,
    type: null,
    id: null,
    parentIds: {},
    eyebrow: "Accion permanente",
    title: "",
    message: "",
    warning: "",
    error: "",
    submitLabel: "Si, eliminar",
    busyLabel: "Eliminando...",
    submitTone: "danger",
    warningTone: "danger",
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
const GRADO_NIVEL_OPTIONS = new Set(["primaria", "secundaria", "preparatoria", "universidad"]);
const ACTIVIDAD_CIERRE_REQUERIDA_MESSAGE = "Cada tema debe tener una actividad de cierre seleccionada antes de generar la planeación.";
const ACTIVIDADES_CIERRE = [
  { nombre: "Juegos de mesa educativos", descripcion: "Fomenta la lógica" },
  { nombre: "Debate en clase", descripcion: "Pensamiento crítico" },
  { nombre: "Proyectos de investigación", descripcion: "Fomenta la curiosidad" },
  { nombre: "Aprendizaje basado en proyectos", descripcion: "Problemas reales" },
  { nombre: "Simulación", descripcion: "Experiencia práctica" },
  { nombre: "Trabajo en equipo", descripcion: "Colaboración efectiva" },
  { nombre: "Taller de escritura creativa", descripcion: "Estimula la creatividad" },
  { nombre: "Laboratorios científicos", descripcion: "Experimentos prácticos" },
  { nombre: "Estudio de caso", descripcion: "Análisis realista" },
  { nombre: "Augmented learning", descripcion: "Revisión en casa" },
  { nombre: "Excursiones educativas", descripcion: "Exploración curricular" },
  { nombre: "Presentaciones multimedia", descripcion: "Comunicación visual" },
  { nombre: "Aprendizaje cooperativo", descripcion: "Trabajo en grupos" },
  { nombre: "Encuestas y entrevistas", descripcion: "Recopilación de datos" },
  { nombre: "Juegos de rol", descripcion: "Perspectivas diferentes" },
  { nombre: "Preguntas de reflexión", descripcion: "Estimula el pensamiento" },
  { nombre: "Proyectos de arte", descripcion: "Expresión artística" },
  { nombre: "Mapas conceptuales", descripcion: "Organización visual" },
  { nombre: "Podcasts educativos", descripcion: "Comunicación oral" },
  { nombre: "Tareas interdisciplinarias", descripcion: "Conexión de materias" }
];
const ACTIVIDADES_CIERRE_MAP = new Map(
  ACTIVIDADES_CIERRE.map((actividad) => [actividad.nombre, actividad.descripcion])
);
const EXAM_TIPOS_PREGUNTA = [
  { value: "opcion_multiple", label: "Opcion multiple", range: "10 a 15 preguntas", time: "1 min/item", weight: 64 },
  { value: "verdadero_falso", label: "Verdadero/Falso", range: "5 a 8 preguntas", time: "1 min/item", weight: 24 },
  { value: "respuesta_corta", label: "Respuesta corta / completar", range: "3 a 5 preguntas", time: "2 a 3 min/item", weight: 16 },
  { value: "emparejamiento", label: "Emparejamiento / relacion de columnas", range: "1 a 2 bloques", time: "5 min/bloque", weight: 8 },
  { value: "pregunta_abierta", label: "Pregunta abierta / ensayo", range: "1 a 2 preguntas", time: "10 a 15 min/item", weight: 12 },
  { value: "calculo_numerico", label: "Calculo / numerica", range: "2 a 4 problemas", time: "5 a 10 min/item", weight: 16 },
  { value: "ordenacion_jerarquizacion", label: "Ordenacion / jerarquizacion", range: "1 a 2 ejercicios", time: "2 a 3 min/item", weight: 8 }
];
function createExamModalState(overrides = {}) {
  return {
    open: false,
    unidadId: null,
    selectedTypes: [],
    questionCounts: {},
    submitting: false,
    error: "",
    ...overrides
  };
}

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

function normalizeActividadCierre(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isActividadCierreValida(value) {
  return ACTIVIDADES_CIERRE_MAP.has(normalizeActividadCierre(value));
}

function getActividadCierreDescripcion(value) {
  return ACTIVIDADES_CIERRE_MAP.get(normalizeActividadCierre(value)) || "";
}

function hasTemasSinActividadCierre(temas = []) {
  return (temas || []).some((tema) => !isActividadCierreValida(tema?.actividad_cierre));
}

function buildActividadCierreOptions(selectedValue) {
  const normalized = normalizeActividadCierre(selectedValue);
  const options = ['<option value="">Actividad</option>'];

  ACTIVIDADES_CIERRE.forEach((actividad) => {
    const isSelected = normalized === actividad.nombre ? " selected" : "";
    options.push(`<option value="${escapeHtml(actividad.nombre)}"${isSelected}>${escapeHtml(actividad.nombre)}</option>`);
  });

  return options.join("");
}

function renderActividadCierreStatus(actividadCierre) {
  return "";
}

function getActividadCierreSelectLabel(actividadCierre) {
  return isActividadCierreValida(actividadCierre)
    ? normalizeActividadCierre(actividadCierre)
    : "Actividad";
}

function getActividadCierreSelectWidth(actividadCierre) {
  const label = getActividadCierreSelectLabel(actividadCierre);
  const widthCh = Math.min(Math.max(label.length + 3, 11), 28);
  return `${widthCh}ch`;
}

function renderActividadCierreControl({ scope, localId, actividadCierre }) {
  const safeScope = scope === "quick" ? "quick" : "staging";
  const selectId = `${safeScope}-actividad-cierre-${escapeHtml(String(localId))}`;
  const dataAttribute = safeScope === "quick"
    ? `data-quick-actividad-select="${escapeHtml(String(localId))}"`
    : `data-staging-actividad-select="${escapeHtml(String(localId))}"`;
  const descripcion = getActividadCierreDescripcion(actividadCierre);
  const title = isActividadCierreValida(actividadCierre)
    ? `${normalizeActividadCierre(actividadCierre)}${descripcion ? ` - ${descripcion}` : ""}`
    : "Actividad";

  return `
    <select
      id="${selectId}"
      class="actividad-cierre-select min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none ${isActividadCierreValida(actividadCierre) ? "is-filled" : ""}"
      style="width: ${getActividadCierreSelectWidth(actividadCierre)}; min-width: 118px; max-width: 240px;"
      title="${escapeHtml(title)}"
      ${dataAttribute}
    >
      ${buildActividadCierreOptions(actividadCierre)}
    </select>
  `;
}

function syncBodyScrollLock() {
  if (!document.body) return;
  const entityModalOpen = !document.getElementById("entity-modal")?.classList.contains("hidden");

  document.body.classList.toggle(
    "overflow-hidden",
    explorerState.quickCreate.open || explorerState.confirmDelete.open || explorerState.examModal.open || explorerState.examPreview.open || entityModalOpen
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

function filterArchivedHierarchyItems(level, items) {
  const list = Array.isArray(items) ? items : [];
  if (typeof window.isArchivedHierarchyScopeHidden !== "function") {
    return list;
  }

  return list.filter((item) => !window.isArchivedHierarchyScopeHidden(level, item?.id));
}

function getCurrentPlantel() {
  return explorerState.planteles.find((item) => item.id === explorerState.current.plantelId) || null;
}

function findPlantelById(plantelId) {
  return explorerState.planteles.find((item) => item.id === plantelId) || null;
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

function buildArchivedHierarchyScopeMetadata(type, id, parentIds = {}) {
  const scopeType = String(type || "").replace(/^archive-/, "").trim().toLowerCase();
  if (!id || !["plantel", "grado", "materia", "unidad"].includes(scopeType)) {
    return {};
  }

  const resolvedIds = {
    plantelId:
      scopeType === "plantel"
        ? id
        : parentIds.plantelId || explorerState.current.plantelId || null,
    gradoId:
      scopeType === "grado"
        ? id
        : parentIds.gradoId || explorerState.current.gradoId || null,
    materiaId:
      scopeType === "materia"
        ? id
        : parentIds.materiaId || explorerState.current.materiaId || null,
    unidadId:
      scopeType === "unidad"
        ? id
        : parentIds.unidadId || explorerState.current.unidadId || null
  };

  const plantel = resolvedIds.plantelId ? findPlantelById(resolvedIds.plantelId) : null;
  const grado =
    resolvedIds.plantelId && resolvedIds.gradoId
      ? findGradoById(resolvedIds.plantelId, resolvedIds.gradoId)
      : null;
  const materia =
    resolvedIds.gradoId && resolvedIds.materiaId
      ? findMateriaById(resolvedIds.gradoId, resolvedIds.materiaId)
      : null;
  const unidad =
    resolvedIds.materiaId && resolvedIds.unidadId
      ? findUnidadById(resolvedIds.materiaId, resolvedIds.unidadId)
      : null;

  const rootLabelByType = {
    plantel: plantel?.nombre,
    grado: grado?.grado_nombre || grado?.nombre,
    materia: materia?.nombre,
    unidad: unidad?.nombre
  };

  return {
    archived_at: new Date().toISOString(),
    label: rootLabelByType[scopeType] || scopeType,
    plantel_id: plantel?.id || null,
    plantel_nombre: plantel?.nombre || "",
    grado_id: grado?.id || null,
    grado_nombre: grado?.grado_nombre || grado?.nombre || "",
    grado_nivel_base: grado?.nivel_base || "",
    materia_id: materia?.id || null,
    materia_nombre: materia?.nombre || "",
    unidad_id: unidad?.id || null,
    unidad_nombre: unidad?.nombre || ""
  };
}

function getVisibleTemasByUnidad(unidadId) {
  const temas = explorerState.temasByUnidad[unidadId] || [];
  return temas.filter((tema) => Boolean(explorerState.planeacionByTema[tema.id]?.id));
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
    explorerState.examGeneration = { active: false, unidadId: null, status: "idle", message: "" };
    explorerState.examModal = createExamModalState();
    explorerState.examPreview = { open: false, examenId: null, loading: false, error: "" };
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

function isDuplicateTemaMessage(message) {
  const normalized = String(message || "").trim().toLowerCase();
  if (!normalized) return false;

  return (
    normalized.includes("temas_unidad_id_titulo_key") ||
    normalized.includes("duplicate key value") ||
    normalized.includes("ya existe en la unidad")
  );
}

function friendlyProgressMessage(message) {
  const raw = typeof message === "string" ? message.trim() : "";
  if (!raw) return "";
  if (isDuplicateTemaMessage(raw)) return "Este tema ya existe en la unidad. Intenta con otro tema.";
  return raw;
}

function shouldShowUnitProgress() {
  return explorerState.generating || explorerState.progress.items.length > 0 || Boolean(explorerState.progress.finalMessage);
}

async function loadPlanteles() {
  explorerState.loading.root = true;
  explorerState.errors.root = "";

  try {
    const items = await obtenerPlanteles();
    explorerState.planteles = filterArchivedHierarchyItems(
      "plantel",
      sortEntities(items || [])
    );
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
    explorerState.gradosByPlantel[plantelId] = filterArchivedHierarchyItems(
      "grado",
      sortEntities(items || [])
    );
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
    explorerState.materiasByGrado[gradoId] = filterArchivedHierarchyItems(
      "materia",
      sortEntities(items || [])
    );
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
    explorerState.unidadesByMateria[materiaId] = filterArchivedHierarchyItems(
      "unidad",
      sortEntities(items || [])
    );
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
  if (!force && explorerState.temasByUnidad[unidadId]) {
    await hydratePlaneacionesForTemas(explorerState.temasByUnidad[unidadId], {
      force: false
    });
    return;
  }

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

async function ensureExamenes(unidadId, { force = false } = {}) {
  if (!unidadId) return;
  if (!force && explorerState.examenesByUnidad[unidadId]) return;

  explorerState.loading.examenes[unidadId] = true;
  delete explorerState.errors.examenes[unidadId];

  try {
    const items = await obtenerExamenesPorUnidad(unidadId);
    explorerState.examenesByUnidad[unidadId] = Array.isArray(items) ? items : [];
  } catch (error) {
    explorerState.examenesByUnidad[unidadId] = [];
    explorerState.errors.examenes[unidadId] = formatFetchError(error, "No se pudieron cargar los examenes.");
  } finally {
    explorerState.loading.examenes[unidadId] = false;
  }
}

function formatExamDate(value) {
  const parsed = value ? new Date(value) : null;
  if (!parsed || Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleString("es-MX", {
    dateStyle: "short",
    timeStyle: "short"
  });
}

function notifyDashboard(message, tone = "info") {
  const toneMap = {
    info: "border-slate-200 bg-white text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700"
  };

  const toast = document.createElement("div");
  toast.className = `fixed right-4 top-4 z-[80] rounded-lg border px-3 py-2 text-sm shadow-lg ${toneMap[tone] || toneMap.info}`;
  toast.textContent = message;

  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2600);
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
  await Promise.all([ensureGrados(plantelId), ensureMaterias(gradoId), ensureUnidades(materiaId), ensureTemas(unidadId), ensureExamenes(unidadId)]);
  renderAll();
}

async function restorePersistedExplorerLocation({ force = false } = {}) {
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

  await ensureGrados(plantelId, { force });

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

  await ensureMaterias(gradoId, { force });

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

  await ensureUnidades(materiaId, { force });

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

  if (force) {
    await ensureTemas(unidadId, { force: true });
  }

  await selectUnidad(plantelId, gradoId, materiaId, unidadId);
  return true;
}

async function refreshExplorerAfterReturn() {
  await loadPlanteles();

  if (explorerState.planteles.length === 0) {
    renderAll();
    return;
  }

  if (await restorePersistedExplorerLocation({ force: true })) {
    return;
  }

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

function renderArchiveIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M4 7.5h16"></path>
      <path d="M5.5 7.5h13l-1 10.5A2 2 0 0 1 15.51 20h-7.02a2 2 0 0 1-1.99-1.8L5.5 7.5Z"></path>
      <path d="M9 11.5h6"></path>
      <path d="M12 10v5"></path>
      <path d="M6 4h12l1.5 3.5h-15Z"></path>
    </svg>
  `;
}

function renderPencilIcon() {
  return `
    <svg viewBox="0 0 24 24" aria-hidden="true" class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="m4 20 4.2-1 9.7-9.7a2 2 0 0 0 0-2.8l-.4-.4a2 2 0 0 0-2.8 0L5 15.8 4 20Z"></path>
      <path d="m13.5 7.5 3 3"></path>
    </svg>
  `;
}

function renderActionIcon(iconName) {
  if (iconName === "trash") return renderTrashIcon();
  if (iconName === "pencil") return renderPencilIcon();
  return renderArchiveIcon();
}

function renderActionButton(config) {
  if (!config?.action) return "";

  const tone = config.tone || "neutral";
  const iconClassMap = {
    danger: "explorer-danger-icon-btn",
    archive: "explorer-archive-icon-btn",
    neutral: "explorer-icon-btn"
  };
  const buttonClassMap = {
    danger: "explorer-danger-btn",
    archive: "explorer-archive-btn",
    neutral: "explorer-action-btn"
  };

  const classes = [
    config.iconOnly
      ? (iconClassMap[tone] || iconClassMap.neutral)
      : (buttonClassMap[tone] || buttonClassMap.neutral),
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
      ${config.iconOnly ? renderActionIcon(config.icon || (tone === "danger" ? "trash" : "archive")) : escapeHtml(label)}
    </button>
  `;
}

function getEditActionForLevel(level = explorerState.current.level) {
  if (level === "plantel" && getCurrentPlantel()?.id) {
    return { action: "edit-plantel", tone: "neutral", iconOnly: true, icon: "pencil", title: "Editar nombre del plantel" };
  }

  if (level === "grado" && getCurrentGrado()?.id) {
    return { action: "edit-grado", tone: "neutral", iconOnly: true, icon: "pencil", title: "Editar nombre del grado" };
  }

  if (level === "unidad" && getCurrentUnidad()?.id) {
    return { action: "edit-unidad", tone: "neutral", iconOnly: true, icon: "pencil", title: "Editar nombre de la unidad" };
  }

  return null;
}

function getLevelHeaderActions(level = explorerState.current.level) {
  const createAction = heroActionsByLevel[level] || heroActionsByLevel.root;
  if (!createAction?.action) return [];

  if (level === "unidad") {
    return [
      {
        label: "+ Crear examen",
        action: "open-unit-exam-modal",
        tone: "neutral"
      },
      {
        label: createAction.label,
        action: createAction.action,
        tone: "neutral"
      }
    ];
  }

  return [
    {
      label: createAction.label,
      action: createAction.action,
      tone: "neutral"
    }
  ];
}

function renderLevelSectionHeader(title, description, level = explorerState.current.level) {
  const actions = getLevelHeaderActions(level);
  const editAction = getEditActionForLevel(level);

  return `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div class="explorer-section-title-row">
          <h3 class="text-base font-semibold text-slate-900">${escapeHtml(title)}</h3>
          ${editAction ? renderActionButton(editAction) : ""}
        </div>
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
  const eyebrow = document.getElementById("delete-confirm-eyebrow");
  const title = document.getElementById("delete-confirm-title");
  const message = document.getElementById("delete-confirm-message");
  const warning = document.getElementById("delete-confirm-warning");
  const error = document.getElementById("delete-confirm-error");
  const submit = document.getElementById("delete-confirm-submit");
  const cancel = document.getElementById("delete-confirm-cancel");
  const close = document.getElementById("delete-confirm-close");

  if (!modal || !eyebrow || !title || !message || !warning || !error || !submit || !cancel || !close) return;

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
  eyebrow.textContent = state.eyebrow || "Accion permanente";
  eyebrow.dataset.tone = state.submitTone || "danger";

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

  warning.dataset.tone = state.warningTone || state.submitTone || "danger";
  submit.dataset.tone = state.submitTone || "danger";
  submit.textContent = state.busy
    ? (state.busyLabel || "Procesando...")
    : (state.submitLabel || "Si, eliminar");
  submit.disabled = state.busy;
  cancel.disabled = state.busy;
  close.disabled = state.busy;
}

function getExamTopicsForUnidad(unidadId) {
  return sortEntities(explorerState.temasByUnidad[unidadId] || []);
}

function normalizeExamQuestionCountInput(value) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(Math.max(0, Math.trunc(value)));
  }

  if (typeof value !== "string") return "";
  return value.replace(/[^\d]/g, "");
}

function parseExamQuestionCount(value) {
  const normalized = normalizeExamQuestionCountInput(value);
  if (!normalized) return null;

  const parsed = Number.parseInt(normalized, 10);
  return Number.isInteger(parsed) ? parsed : null;
}

function getExamQuestionCountValue(state, tipo) {
  return normalizeExamQuestionCountInput(state?.questionCounts?.[tipo] ?? "");
}

function hasInvalidExamQuestionCounts(state) {
  return (state?.selectedTypes || []).some((tipo) => {
    const count = parseExamQuestionCount(state?.questionCounts?.[tipo]);
    return !Number.isInteger(count) || count < 1;
  });
}

function getExamQuestionCountsPayload(state) {
  const payload = {};

  for (const tipo of state?.selectedTypes || []) {
    const count = parseExamQuestionCount(state?.questionCounts?.[tipo]);
    if (!Number.isInteger(count) || count < 1) {
      return null;
    }
    payload[tipo] = count;
  }

  return payload;
}

function renderExamQuestionTypeOptions(state) {
  return EXAM_TIPOS_PREGUNTA.map((tipo) => {
    const isSelected = state.selectedTypes.includes(tipo.value);
    const checked = isSelected ? "checked" : "";
    const disabled = state.submitting ? "disabled" : "";
    const rawCount = getExamQuestionCountValue(state, tipo.value);
    const parsedCount = parseExamQuestionCount(rawCount);
    const inputTone = isSelected && (!Number.isInteger(parsedCount) || parsedCount < 1)
      ? "border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-500 focus:ring-rose-500"
      : "border-slate-300 bg-white text-slate-700 focus:border-cyan-600 focus:ring-cyan-600";
    const cardTone = isSelected
      ? "border-cyan-200 bg-cyan-50/70"
      : "border-slate-200 bg-slate-50";

    return `
      <label class="flex items-center justify-between gap-3 rounded-xl border px-2.5 py-2 text-xs text-slate-700 ${cardTone}">
        <span class="flex min-w-0 items-center gap-2">
          <input
            type="checkbox"
            class="h-3.5 w-3.5 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600"
            data-exam-question-type="${escapeHtml(tipo.value)}"
            ${checked}
            ${disabled}
          />
          <span class="min-w-0 truncate text-[13px] font-semibold leading-4 text-slate-900">${escapeHtml(tipo.label)}</span>
        </span>
        ${isSelected ? `
          <input
            type="text"
            inputmode="numeric"
            pattern="[0-9]*"
            class="w-16 rounded-lg border px-2 py-1 text-right text-xs font-semibold shadow-sm focus:outline-none focus:ring-1 ${inputTone}"
            data-exam-question-count="${escapeHtml(tipo.value)}"
            value="${escapeHtml(rawCount)}"
            placeholder="1"
            ${disabled}
          />
        ` : ""}
      </label>
    `;
  }).join("");
}

function renderExamTopicsList(state) {
  const unidadId = state?.unidadId;
  const topics = getExamTopicsForUnidad(unidadId);
  const isLoading = Boolean(explorerState.loading.temas[unidadId]);

  if (isLoading) {
    return '<p class="text-sm text-slate-500">Cargando temas de la unidad...</p>';
  }

  if (topics.length === 0) {
    return '<p class="text-sm text-slate-500">No hay temas guardados en esta unidad. Primero agrega o genera temas para poder crear el examen.</p>';
  }

  return `
    <div class="space-y-2">
      ${topics.map((tema) => `
        <div class="rounded-xl border border-slate-200 bg-white px-3 py-2">
          <p class="truncate text-sm font-semibold text-slate-900">${escapeHtml(tema.titulo || "Tema sin titulo")}</p>
        </div>
      `).join("")}
    </div>
  `;
}

function syncUnitExamModalErrorState() {
  const error = document.getElementById("unit-exam-error");
  if (!error) return;

  if (explorerState.examModal.error) {
    error.classList.remove("hidden");
    error.textContent = explorerState.examModal.error;
  } else {
    error.classList.add("hidden");
    error.textContent = "";
  }
}

function syncUnitExamModalActionState() {
  const submit = document.getElementById("unit-exam-submit");
  const cancel = document.getElementById("unit-exam-cancel");
  const close = document.getElementById("unit-exam-close");
  if (!submit || !cancel || !close) return;

  const state = explorerState.examModal;
  const topicItems = state.unidadId ? getExamTopicsForUnidad(state.unidadId) : [];
  const hasTopics = topicItems.length > 0;
  const disableSubmit = state.submitting
    || !hasTopics
    || state.selectedTypes.length === 0
    || hasInvalidExamQuestionCounts(state);

  submit.disabled = disableSubmit;
  submit.textContent = state.submitting
    ? "Generando examen..."
    : "Crear examen de unidad con los temas";
  cancel.disabled = state.submitting;
  close.disabled = state.submitting;
}

function syncExamQuestionCountInputTone(inputElement, value) {
  if (!inputElement) return;

  const parsed = parseExamQuestionCount(value);
  const isInvalid = !Number.isInteger(parsed) || parsed < 1;

  inputElement.classList.toggle("border-rose-300", isInvalid);
  inputElement.classList.toggle("bg-rose-50", isInvalid);
  inputElement.classList.toggle("text-rose-700", isInvalid);
  inputElement.classList.toggle("focus:border-rose-500", isInvalid);
  inputElement.classList.toggle("focus:ring-rose-500", isInvalid);
  inputElement.classList.toggle("border-slate-300", !isInvalid);
  inputElement.classList.toggle("bg-white", !isInvalid);
  inputElement.classList.toggle("text-slate-700", !isInvalid);
  inputElement.classList.toggle("focus:border-cyan-600", !isInvalid);
  inputElement.classList.toggle("focus:ring-cyan-600", !isInvalid);
}

function renderUnitExamModal() {
  const modal = document.getElementById("unit-exam-modal");
  const title = document.getElementById("unit-exam-title");
  const description = document.getElementById("unit-exam-description");
  const types = document.getElementById("unit-exam-types");
  const topics = document.getElementById("unit-exam-topics");
  const topicsCount = document.getElementById("unit-exam-topics-count");
  const error = document.getElementById("unit-exam-error");
  const submit = document.getElementById("unit-exam-submit");
  const cancel = document.getElementById("unit-exam-cancel");
  const close = document.getElementById("unit-exam-close");

  if (!modal || !title || !description || !types || !topics || !topicsCount || !error || !submit || !cancel || !close) {
    return;
  }

  const state = explorerState.examModal;
  const unidad = explorerState.current.unidadId === state.unidadId ? getCurrentUnidad() : null;
  const unitName = unidad?.nombre || "unidad";
  const topicItems = state.unidadId ? getExamTopicsForUnidad(state.unidadId) : [];
  const hasTopics = topicItems.length > 0;

  modal.classList.toggle("hidden", !state.open);
  syncBodyScrollLock();

  if (!state.open) {
    error.classList.add("hidden");
    error.textContent = "";
    return;
  }

  title.textContent = "Crear examen de unidad";
  description.textContent = `Se generara un examen nuevo usando todos los temas actuales de ${unitName}.`;
  types.innerHTML = renderExamQuestionTypeOptions(state);
  topics.innerHTML = renderExamTopicsList(state);
  topicsCount.textContent = `${topicItems.length} tema(s)`;

  syncUnitExamModalErrorState();
  syncUnitExamModalActionState();
}

function openUnitExamModal() {
  if (explorerState.current.level !== "unidad" || !explorerState.current.unidadId) {
    alert("Selecciona una unidad para crear el examen.");
    return;
  }

  const nextState = createExamModalState({
    open: true,
    unidadId: explorerState.current.unidadId
  });
  explorerState.examModal = nextState;

  renderUnitExamModal();
}

function closeUnitExamModal({ force = false } = {}) {
  if (explorerState.examModal.submitting && !force) return;
  explorerState.examModal = createExamModalState();
  renderUnitExamModal();
}

function toggleExamQuestionType(tipo, checked) {
  if (!tipo) return;

  const selected = new Set(explorerState.examModal.selectedTypes);
  if (checked) selected.add(tipo);
  else selected.delete(tipo);

  if (checked) {
    const currentValue = getExamQuestionCountValue(explorerState.examModal, tipo);
    if (!currentValue || (parseExamQuestionCount(currentValue) || 0) < 1) {
      explorerState.examModal.questionCounts[tipo] = "1";
    }
  }

  explorerState.examModal.selectedTypes = EXAM_TIPOS_PREGUNTA
    .map((item) => item.value)
    .filter((value) => selected.has(value));
  explorerState.examModal.error = "";
  renderUnitExamModal();
}

function updateExamQuestionCount(tipo, value, inputElement = null) {
  if (!tipo) return;

  const normalizedValue = normalizeExamQuestionCountInput(value);
  explorerState.examModal.questionCounts = {
    ...explorerState.examModal.questionCounts,
    [tipo]: normalizedValue
  };
  explorerState.examModal.error = "";

  if (inputElement && inputElement.value !== normalizedValue) {
    inputElement.value = normalizedValue;
  }

  syncExamQuestionCountInputTone(inputElement, normalizedValue);
  syncUnitExamModalErrorState();
  syncUnitExamModalActionState();
}

async function submitUnitExamModal(event) {
  event?.preventDefault?.();

  const unidadId = explorerState.examModal.unidadId;
  const selectedTypes = [...explorerState.examModal.selectedTypes];
  const questionCounts = getExamQuestionCountsPayload(explorerState.examModal);
  const topicItems = unidadId ? getExamTopicsForUnidad(unidadId) : [];

  if (!unidadId) {
    explorerState.examModal.error = "Selecciona una unidad valida para crear el examen.";
    renderUnitExamModal();
    return;
  }

  if (topicItems.length === 0) {
    explorerState.examModal.error = "No hay temas en la unidad para generar el examen.";
    renderUnitExamModal();
    return;
  }

  if (selectedTypes.length === 0) {
    explorerState.examModal.error = "Selecciona al menos un tipo de pregunta.";
    renderUnitExamModal();
    return;
  }

  if (!questionCounts || Object.keys(questionCounts).length !== selectedTypes.length) {
    explorerState.examModal.error = "Define una cantidad mayor a 0 para cada tipo de pregunta seleccionado.";
    renderUnitExamModal();
    return;
  }

  explorerState.examModal.submitting = true;
  explorerState.examModal.error = "";
  const totalPreguntas = Object.values(questionCounts).reduce((sum, count) => sum + count, 0);
  explorerState.examGeneration = {
    active: true,
    unidadId,
    status: "generating",
    message: `Preparando examen con ${topicItems.length} tema(s) y ${totalPreguntas} pregunta(s)...`
  };
  closeUnitExamModal({ force: true });
  renderAll();

  try {
    const examen = await generarExamenUnidad({
      unidad_id: unidadId,
      tipos_pregunta: selectedTypes,
      cantidades_pregunta: questionCounts
    });

    if (examen?.id) {
      explorerState.examenDetalleById[examen.id] = examen;
    }
    const currentExamenes = explorerState.examenesByUnidad[unidadId] || [];
    explorerState.examenesByUnidad[unidadId] = [examen, ...currentExamenes.filter((item) => item?.id !== examen?.id)];
    explorerState.examGeneration = {
      active: false,
      unidadId,
      status: "ready",
      message: ""
    };
    await ensureExamenes(unidadId, { force: true });
    renderAll();
  } catch (error) {
    explorerState.examGeneration = {
      active: false,
      unidadId,
      status: "error",
      message: ""
    };
    explorerState.errors.examenes[unidadId] = formatFetchError(error, "No se pudo generar el examen.");
    renderAll();
  }
}

function openDeleteConfirm(config) {
  Object.assign(explorerState.confirmDelete, {
    open: true,
    type: config?.type || null,
    id: config?.id || null,
    parentIds: { ...(config?.parentIds || {}) },
    eyebrow: config?.eyebrow || "Accion permanente",
    title: config?.title || "Confirmar eliminacion",
    message: config?.message || "",
    warning: config?.warning || "",
    error: "",
    submitLabel: config?.submitLabel || "Si, eliminar",
    busyLabel: config?.busyLabel || "Eliminando...",
    submitTone: config?.submitTone || "danger",
    warningTone: config?.warningTone || config?.submitTone || "danger",
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
    eyebrow: "Accion permanente",
    title: "",
    message: "",
    warning: "",
    error: "",
    submitLabel: "Si, eliminar",
    busyLabel: "Eliminando...",
    submitTone: "danger",
    warningTone: "danger",
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

function removeGradoRecord(plantelId, gradoId) {
  if (!plantelId || !gradoId) return;

  pruneGradoBranch(gradoId);

  if (Array.isArray(explorerState.gradosByPlantel[plantelId])) {
    explorerState.gradosByPlantel[plantelId] = explorerState.gradosByPlantel[plantelId].filter(
      (grado) => grado.id !== gradoId
    );
  }
}

function removeMateriaRecord(gradoId, materiaId) {
  if (!gradoId || !materiaId) return;

  pruneMateriaBranch(materiaId);

  if (Array.isArray(explorerState.materiasByGrado[gradoId])) {
    explorerState.materiasByGrado[gradoId] = explorerState.materiasByGrado[gradoId].filter(
      (materia) => materia.id !== materiaId
    );
  }
}

function removeUnidadRecord(materiaId, unidadId) {
  if (!materiaId || !unidadId) return;

  pruneUnidadBranch(unidadId);

  if (Array.isArray(explorerState.unidadesByMateria[materiaId])) {
    explorerState.unidadesByMateria[materiaId] = explorerState.unidadesByMateria[materiaId].filter(
      (unidad) => unidad.id !== unidadId
    );
  }
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

function getArchiveDialogConfig(action, ids) {
  if (action === "archive-plantel") {
    const plantel = explorerState.planteles.find((item) => item.id === ids.plantelId) || getCurrentPlantel();
    const nombre = plantel?.nombre || "este plantel";
    return {
      type: "archive-plantel",
      id: ids.plantelId,
      parentIds: { plantelId: ids.plantelId },
      eyebrow: "Mover a Archivados",
      title: "¿Archivar elemento?",
      message: `Las planeaciones activas de ${nombre} se moveran a Archivados y podras restaurarlas despues.`,
      warning: "La estructura del plantel se conservara. Solo se archivaran las planeaciones activas dentro de esta rama.",
      submitLabel: "Si, archivar",
      busyLabel: "Archivando...",
      submitTone: "archive",
      warningTone: "archive"
    };
  }

  if (action === "archive-grado") {
    const grado = findGradoById(ids.plantelId, ids.gradoId) || getCurrentGrado();
    const nombre = grado?.nombre || "este grado";
    return {
      type: "archive-grado",
      id: ids.gradoId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId
      },
      eyebrow: "Mover a Archivados",
      title: "¿Archivar elemento?",
      message: `Las planeaciones activas de ${nombre} se moveran a Archivados y podras restaurarlas despues.`,
      warning: "La estructura del grado se conservara. Solo se archivaran las planeaciones activas dentro de esta rama.",
      submitLabel: "Si, archivar",
      busyLabel: "Archivando...",
      submitTone: "archive",
      warningTone: "archive"
    };
  }

  if (action === "archive-materia") {
    const materia = findMateriaById(ids.gradoId, ids.materiaId) || getCurrentMateria();
    const nombre = materia?.nombre || "esta materia";
    return {
      type: "archive-materia",
      id: ids.materiaId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId
      },
      eyebrow: "Mover a Archivados",
      title: "¿Archivar elemento?",
      message: `Las planeaciones activas de ${nombre} se moveran a Archivados y podras restaurarlas despues.`,
      warning: "La estructura de la materia se conservara. Solo se archivaran las planeaciones activas dentro de esta rama.",
      submitLabel: "Si, archivar",
      busyLabel: "Archivando...",
      submitTone: "archive",
      warningTone: "archive"
    };
  }

  if (action === "archive-unidad") {
    const unidad = findUnidadById(ids.materiaId, ids.unidadId) || getCurrentUnidad();
    const nombre = unidad?.nombre || "esta unidad";
    return {
      type: "archive-unidad",
      id: ids.unidadId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId,
        unidadId: ids.unidadId
      },
      eyebrow: "Mover a Archivados",
      title: "¿Archivar elemento?",
      message: `Las planeaciones activas de ${nombre} se moveran a Archivados y podras restaurarlas despues.`,
      warning: "La estructura de la unidad se conservara. Solo se archivaran las planeaciones activas dentro de esta rama.",
      submitLabel: "Si, archivar",
      busyLabel: "Archivando...",
      submitTone: "archive",
      warningTone: "archive"
    };
  }

  if (action === "archive-planeacion") {
    return {
      type: "archive-planeacion",
      id: ids.planeacionId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId,
        unidadId: ids.unidadId,
        temaId: ids.temaId,
        batchId: ids.batchId
      },
      eyebrow: "Mover a Archivados",
      title: "¿Archivar elemento?",
      message: "Este elemento se movera a Archivados y podras restaurarlo despues.",
      warning: "La planeacion dejara de aparecer en tus vistas activas.",
      submitLabel: "Si, archivar",
      busyLabel: "Archivando...",
      submitTone: "archive",
      warningTone: "archive"
    };
  }

  if (action === "archive-batch") {
    return {
      type: "archive-batch",
      id: ids.batchId,
      parentIds: {
        plantelId: ids.plantelId,
        gradoId: ids.gradoId,
        materiaId: ids.materiaId,
        unidadId: ids.unidadId,
        temaId: ids.temaId,
        batchId: ids.batchId
      },
      eyebrow: "Mover a Archivados",
      title: "¿Archivar elemento?",
      message: "Este elemento se movera a Archivados y podras restaurarlo despues.",
      warning: "Se archivaran todas las planeaciones que compartan esta ruta por batch_id.",
      submitLabel: "Si, archivar",
      busyLabel: "Archivando...",
      submitTone: "archive",
      warningTone: "archive"
    };
  }

  return null;
}

function requestArchiveAction(action, ids) {
  const config = getArchiveDialogConfig(action, ids);
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

async function refreshAfterPlaneacionArchive(context = {}) {
  if (context.temaId) {
    pruneTemaRecord(context.unidadId, context.temaId);
    delete explorerState.planeacionByTema[context.temaId];
  }

  renderAll();

  if (
    context.unidadId &&
    explorerState.current.level === "unidad" &&
    explorerState.current.unidadId === context.unidadId
  ) {
    await ensureTemas(context.unidadId, { force: true });
    renderAll();
    return;
  }
}

async function refreshAfterHierarchyArchive(type, context = {}) {
  if (type === "archive-plantel") {
    prunePlantelBranch(context.plantelId || context.id);
    renderAll();
    return;
  }

  if (type === "archive-grado") {
    removeGradoRecord(context.plantelId, context.gradoId || context.id);
    if (explorerState.current.level === "grado" && explorerState.current.gradoId === (context.gradoId || context.id)) {
      await selectPlantel(context.plantelId);
      return;
    }
    renderAll();
    return;
  }

  if (type === "archive-materia") {
    removeMateriaRecord(context.gradoId, context.materiaId || context.id);
    if (explorerState.current.level === "materia" && explorerState.current.materiaId === (context.materiaId || context.id)) {
      await selectGrado(context.plantelId, context.gradoId);
      return;
    }
    renderAll();
    return;
  }

  if (type === "archive-unidad") {
    removeUnidadRecord(context.materiaId, context.unidadId || context.id);
    if (explorerState.current.level === "unidad" && explorerState.current.unidadId === (context.unidadId || context.id)) {
      await selectMateria(context.plantelId, context.gradoId, context.materiaId);
      return;
    }
    renderAll();
    return;
  }

  renderAll();
}

async function submitDeleteConfirm() {
  if (!explorerState.confirmDelete.open || explorerState.confirmDelete.busy || !explorerState.confirmDelete.type || !explorerState.confirmDelete.id) {
    return;
  }

  explorerState.confirmDelete.busy = true;
  explorerState.confirmDelete.error = "";
  renderDeleteConfirmModal();

  const { type, id, parentIds } = explorerState.confirmDelete;
  const archiveTypes = new Set([
    "archive-plantel",
    "archive-grado",
    "archive-materia",
    "archive-unidad",
    "archive-planeacion",
    "archive-batch"
  ]);
  let responsePayload = null;

  try {
    if (type === "plantel") await eliminarPlantel(id);
    else if (type === "grado") await eliminarGrado(id);
    else if (type === "materia") await eliminarMateria(id);
    else if (type === "unidad") await eliminarUnidad(id);
    else if (type === "tema") await eliminarTema(id);
    else if (type === "planeacion") await eliminarPlaneacionApi(id);
    else if (type === "archive-plantel") responsePayload = await archivarPlantel(id);
    else if (type === "archive-grado") responsePayload = await archivarGrado(id);
    else if (type === "archive-materia") responsePayload = await archivarMateria(id);
    else if (type === "archive-unidad") responsePayload = await archivarUnidad(id);
    else if (type === "archive-planeacion") responsePayload = await archivarPlaneacionApi(id);
    else if (type === "archive-batch") responsePayload = await archivarRutaBatchApi(id);

    if (
      ["archive-plantel", "archive-grado", "archive-materia", "archive-unidad"].includes(type) &&
      typeof window.registerArchivedHierarchyScope === "function"
    ) {
      const archivedPayload = responsePayload?.archived || {};
      const archiveMetadata = buildArchivedHierarchyScopeMetadata(type, archivedPayload.id || id, parentIds);
      window.registerArchivedHierarchyScope(
        {
          type: archivedPayload.type || type,
          id: archivedPayload.id || id
        },
        {
          planeacionIds: archivedPayload.planeacion_ids || [],
          batchIds: archivedPayload.batch_ids || []
        },
        archiveMetadata
      );
    }

    closeDeleteConfirm({ force: true });
    try {
      if (type === "archive-planeacion" || type === "archive-batch") {
        await refreshAfterPlaneacionArchive({ id, ...parentIds });
      } else if (archiveTypes.has(type)) {
        await refreshAfterHierarchyArchive(type, { id, ...parentIds });
      } else {
        await refreshAfterHierarchyDelete(type, { id, ...parentIds });
      }
    } catch (refreshError) {
      const fallbackMessage = archiveTypes.has(type)
        ? "El archivado se completo, pero no se pudo refrescar el explorador."
        : "La eliminacion se completo, pero no se pudo refrescar el explorador.";
      explorerState.errors.root = formatFetchError(refreshError, fallbackMessage);
      renderAll();
    }
  } catch (error) {
    explorerState.confirmDelete.busy = false;
    const fallbackMessage = archiveTypes.has(type)
      ? "No se pudo completar el archivado."
      : "No se pudo completar la eliminacion.";
    explorerState.confirmDelete.error = formatFetchError(error, fallbackMessage);
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
  if (!showGradoNew) {
    resetQuickInput("quick-grado-new");
    resetQuickSelect("quick-grado-base-select");
  } else {
    syncQuickSelectVisualState("quick-grado-base-select");
  }

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
      <div class="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-3 py-3">
        <div class="min-w-0 flex flex-1 items-center gap-4">
          <div class="min-w-0">
            <p class="truncate text-sm font-medium text-slate-800">${escapeHtml(tema.titulo)}</p>
            <p class="text-xs text-slate-500">${escapeHtml(String(tema.duracion))} min</p>
          </div>
          ${renderActividadCierreControl({
            scope: "quick",
            localId: tema.localId,
            actividadCierre: tema.actividad_cierre
          })}
        </div>
        <button type="button" class="explorer-danger-icon-btn ml-auto shrink-0" data-quick-remove-tema="${tema.localId}" title="Quitar tema" aria-label="Quitar tema">
          ${renderTrashIcon()}
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
    resetQuickSelect("quick-grado-base-select");
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
  resetQuickSelect("quick-grado-base-select");

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
    duracion,
    actividad_cierre: ""
  });

  titleInput.value = "";
  durationInput.value = "50";
  showQuickCreateError("");
  renderQuickTemasList();
  titleInput.focus();
}

function removeQuickTema(localId) {
  explorerState.quickCreate.temas = explorerState.quickCreate.temas.filter((tema) => tema.localId !== localId);
  if (!hasTemasSinActividadCierre(explorerState.quickCreate.temas)) {
    showQuickCreateError("");
  }
  renderQuickTemasList();
}

function updateQuickTemaActividad(localId, actividadCierre) {
  const actividadNormalizada = normalizeActividadCierre(actividadCierre);
  explorerState.quickCreate.temas = explorerState.quickCreate.temas.map((tema) => {
    if (tema.localId !== localId) return tema;
    return {
      ...tema,
      actividad_cierre: actividadNormalizada
    };
  });

  if (!hasTemasSinActividadCierre(explorerState.quickCreate.temas)) {
    showQuickCreateError("");
  }

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

function requireNivelBaseValue(selectId, label) {
  const select = document.getElementById(selectId);
  const value = typeof select?.value === "string" ? select.value.trim().toLowerCase() : "";

  if (!GRADO_NIVEL_OPTIONS.has(value)) {
    throw new Error(`Selecciona una opcion para ${label}.`);
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

function requireQuickGradoSelection() {
  const selection = requireQuickSelectOrNew("quick-grado-select", "quick-grado-new", "Grado");

  if (selection.isNew) {
    selection.nivelBase = requireNivelBaseValue("quick-grado-base-select", "Nivel base del grado");
  }

  return selection;
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
                  ${renderNavigableCardTitle(plantel.nombre)}
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Plantel</span>
                  ${renderActionButton({
                    action: "archive-plantel",
                    tone: "archive",
                    iconOnly: true,
                    title: `Archivar planeaciones de ${plantel.nombre || ""}`.trim(),
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
                  ${renderNavigableCardTitle(grado.nombre)}
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Grado</span>
                  ${renderActionButton({
                    action: "archive-grado",
                    tone: "archive",
                    iconOnly: true,
                    title: `Archivar planeaciones de ${grado.nombre || ""}`.trim(),
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
                  ${renderNavigableCardTitle(materia.nombre)}
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Materia</span>
                  ${renderActionButton({
                    action: "archive-materia",
                    tone: "archive",
                    iconOnly: true,
                    title: `Archivar planeaciones de ${materia.nombre || ""}`.trim(),
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
            const topics = explorerState.temasByUnidad[unidad.id]
              ? getVisibleTemasByUnidad(unidad.id).length
              : null;
            const meta = Number.isInteger(topics) ? `${topics} tema(s)` : "Abrir temas";
            return `
              <div class="explorer-list-item explorer-list-item-shell">
                <button type="button" class="explorer-list-item-open" data-content-action="open-unidad" data-plantel-id="${plantel.id}" data-grado-id="${grado.id}" data-materia-id="${materia.id}" data-unidad-id="${unidad.id}">
                  ${renderNavigableCardTitle(unidad.nombre)}
                  <p class="explorer-list-item-meta">${escapeHtml(meta)}</p>
                </button>
                <div class="explorer-list-item-footer">
                  <span class="text-xs font-medium uppercase tracking-wide text-slate-400">Unidad</span>
                  ${renderActionButton({
                    action: "archive-unidad",
                    tone: "archive",
                    iconOnly: true,
                    title: `Archivar planeaciones de ${unidad.nombre || ""}`.trim(),
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

function renderNavigableCardTitle(title) {
  return `
    <span class="explorer-list-item-title-row">
      <span class="explorer-list-item-title">${escapeHtml(title || "Sin nombre")}</span>
      <span class="explorer-list-item-cue" aria-hidden="true">&rarr;</span>
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
    warning: "border-amber-200 bg-amber-50 text-amber-800",
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
          <p><span class="font-semibold">Progreso:</span> ${progress.completed}/${progress.total} creadas</p>
          <p class="text-xs text-cyan-800">${explorerState.generating ? "Procesando temas..." : `${progress.total} tema(s) procesados`}</p>
        </div>
        ${list}
        ${finalHtml}
      </div>
    </section>
  `;
}

function getExamTypeLabel(tipo) {
  return EXAM_TIPOS_PREGUNTA.find((item) => item.value === tipo)?.label || tipo || "Tipo";
}

function getExamOptionLabel(index) {
  let currentIndex = Number.isInteger(index) ? index : 0;
  let label = "";

  do {
    label = String.fromCharCode(97 + (currentIndex % 26)) + label;
    currentIndex = Math.floor(currentIndex / 26) - 1;
  } while (currentIndex >= 0);

  return `${label})`;
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

  if (optionIndex === -1) return answerText;
  return `${getExamOptionLabel(optionIndex)} ${answerText}`;
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

async function ensureExamenDetalle(examenId, { force = false } = {}) {
  if (!examenId) return null;
  if (!force && explorerState.examenDetalleById[examenId]) {
    return explorerState.examenDetalleById[examenId];
  }

  const examen = await obtenerExamenDetalle(examenId);
  explorerState.examenDetalleById[examenId] = examen;
  return examen;
}

function renderExamQuestionPreview(question, index) {
  const opciones = Array.isArray(question?.opciones) ? question.opciones : [];
  const pares = Array.isArray(question?.pares) ? question.pares : [];
  const elementos = Array.isArray(question?.elementos) ? question.elementos : [];

  const opcionesHtml = opciones.length > 0
    ? `<ul class="mt-2 list-none space-y-1 pl-0 text-sm text-slate-600">${opciones.map((item, optionIndex) => `<li class="flex items-start gap-2"><span class="font-semibold text-slate-700">${escapeHtml(getExamOptionLabel(optionIndex))}</span><span>${escapeHtml(item)}</span></li>`).join("")}</ul>`
    : "";
  const paresHtml = pares.length > 0
    ? `<div class="mt-2 space-y-1 text-sm text-slate-600">${pares.map((pair) => `<p>${escapeHtml(pair.lado_a || "")} - ${escapeHtml(pair.lado_b || "")}</p>`).join("")}</div>`
    : "";
  const elementosHtml = elementos.length > 0
    ? `<ul class="mt-2 list-decimal space-y-1 pl-5 text-sm text-slate-600">${elementos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ul>`
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

function renderExamPreviewModal() {
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
  syncBodyScrollLock();

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

function buildExamWordHtml(examen) {
  const examenIa = examen?.examen_ia || {};
  const preguntas = Array.isArray(examenIa.preguntas) ? examenIa.preguntas : [];

  const preguntasHtml = preguntas.map((question, index) => {
    const opciones = Array.isArray(question?.opciones) ? question.opciones : [];
    const pares = Array.isArray(question?.pares) ? question.pares : [];
    const elementos = Array.isArray(question?.elementos) ? question.elementos : [];

    const opcionesHtml = opciones.length > 0
      ? `<div style="margin:8px 0 0 0; padding-left:18px;">${opciones.map((item, optionIndex) => `<p style="margin:4px 0;"><strong>${escapeHtml(getExamOptionLabel(optionIndex))}</strong> ${escapeHtml(item)}</p>`).join("")}</div>`
      : "";
    const paresHtml = pares.length > 0
      ? `<ul>${pares.map((pair) => `<li>${escapeHtml(pair.lado_a || "")} - ${escapeHtml(pair.lado_b || "")}</li>`).join("")}</ul>`
      : "";
    const elementosHtml = elementos.length > 0
      ? `<ol>${elementos.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}</ol>`
      : "";

    return `
      <div style="margin-bottom:16px;">
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
          h1 { text-align: center; margin-bottom: 12px; }
          h2 { margin: 0 0 12px; font-size: 15pt; }
          .meta { margin-bottom: 14px; }
          .box { border: 1px solid #cbd5e1; padding: 10px 12px; border-radius: 8px; margin-bottom: 16px; background: #f8fafc; }
          .answer-sheet { page-break-before: always; margin-top: 28px; padding-top: 18px; border-top: 2px solid #cbd5e1; }
          .answer-sheet-copy { margin-bottom: 14px; color: #475569; }
          .answer-item { margin-bottom: 16px; }
          .answer-label { margin: 8px 0 4px; }
          .answer-values { margin-left: 18px; }
          .answer-values p { margin: 4px 0; }
          p { margin: 6px 0; }
          ul, ol { margin: 8px 0 0 22px; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(examenIa.titulo || examen?.titulo || "Examen de unidad")}</h1>
        <div class="meta">
          <p><strong>Unidad:</strong> ${escapeHtml(examen?.unidad_id || "")}</p>
          <p><strong>Fecha:</strong> ${escapeHtml(formatExamDate(examen?.created_at) || "")}</p>
          <p><strong>Total de preguntas:</strong> ${escapeHtml(String(preguntas.length || examen?.total_preguntas || 0))}</p>
        </div>
        ${examenIa.instrucciones_generales ? `<div class="box"><strong>Instrucciones:</strong><br>${escapeHtml(examenIa.instrucciones_generales)}</div>` : ""}
        ${preguntasHtml}
        ${answerSheetHtml}
      </body>
    </html>
  `;
}

async function downloadExamWord(examenId) {
  const examen = await ensureExamenDetalle(examenId);
  if (!examen?.examen_ia) {
    throw new Error("No hay contenido disponible para exportar.");
  }

  const html = buildExamWordHtml(examen);
  const blob = new Blob([html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const enlace = document.createElement("a");
  enlace.href = url;
  enlace.download = `${(examen.titulo || "Examen_unidad").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "_") || "Examen_unidad"}.doc`;
  document.body.appendChild(enlace);
  enlace.click();
  document.body.removeChild(enlace);
  URL.revokeObjectURL(url);
}

async function openExamPreview(examenId) {
  explorerState.examPreview = {
    open: true,
    examenId,
    loading: true,
    error: ""
  };
  renderExamPreviewModal();

  try {
    await ensureExamenDetalle(examenId);
    explorerState.examPreview.loading = false;
    renderExamPreviewModal();
  } catch (error) {
    explorerState.examPreview.loading = false;
    explorerState.examPreview.error = formatFetchError(error, "No se pudo cargar el examen.");
    renderExamPreviewModal();
  }
}

function closeExamPreviewModal() {
  if (explorerState.examPreview.loading) return;
  explorerState.examPreview = { open: false, examenId: null, loading: false, error: "" };
  renderExamPreviewModal();
}

function shouldShowExamSection(unidadId) {
  const examenes = explorerState.examenesByUnidad[unidadId] || [];
  return Boolean(
    explorerState.examGeneration.active && explorerState.examGeneration.unidadId === unidadId ||
    explorerState.loading.examenes[unidadId] ||
    explorerState.errors.examenes[unidadId] ||
    examenes.length > 0
  );
}

function renderExamSection(unidadId) {
  const examenes = explorerState.examenesByUnidad[unidadId] || [];
  const isGenerating = explorerState.examGeneration.active && explorerState.examGeneration.unidadId === unidadId;
  const isLoading = Boolean(explorerState.loading.examenes[unidadId]);
  const error = explorerState.errors.examenes[unidadId] || "";

  if (!shouldShowExamSection(unidadId)) {
    return "";
  }

  const generatingCard = isGenerating
    ? `
      <div class="explorer-progress-item generating">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-semibold">Creando examen de unidad</p>
          ${renderProgressPill("generating", "Generando")}
        </div>
        <p class="mt-1 text-xs">${escapeHtml(explorerState.examGeneration.message || "Preparando examen con los temas actuales de la unidad...")}</p>
      </div>
    `
    : "";

  const loadingHtml = !isGenerating && isLoading
    ? '<p class="text-sm text-slate-500">Cargando examenes...</p>'
    : "";

  const errorHtml = error
    ? `<div class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">${escapeHtml(error)}</div>`
    : "";

  const examenesHtml = examenes.map((examen) => `
    <div class="rounded-xl border border-slate-200 bg-white p-3">
      <div class="flex flex-wrap items-start justify-between gap-2">
        <div class="min-w-0">
          <p class="text-sm font-semibold text-slate-900">${escapeHtml(examen.titulo || "Examen de unidad")}</p>
          <p class="mt-1 text-xs text-slate-500">${escapeHtml(formatExamDate(examen.created_at) || "Sin fecha")}</p>
        </div>
        ${renderProgressPill("ready", "Generado")}
      </div>
      <div class="mt-3 flex flex-wrap gap-2">
        ${(Array.isArray(examen.tipos_pregunta) ? examen.tipos_pregunta : []).map((tipo) => `
          <span class="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] font-semibold text-slate-700">${escapeHtml(getExamTypeLabel(tipo))}</span>
        `).join("")}
      </div>
      <p class="mt-3 text-xs text-slate-600">${escapeHtml(String(examen.total_preguntas || 0))} pregunta(s)</p>
      <div class="mt-3 flex flex-wrap gap-2">
        <button type="button" class="inline-flex items-center justify-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" data-content-action="preview-exam" data-examen-id="${escapeHtml(examen.id)}">
          Vista previa
        </button>
        <button type="button" class="inline-flex items-center justify-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50" data-content-action="download-exam-word" data-examen-id="${escapeHtml(examen.id)}">
          Descargar Word
        </button>
      </div>
    </div>
  `).join("");

  return `
    <section class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between gap-2">
        <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Examenes de la unidad</h4>
        <span class="text-xs text-slate-500">${examenes.length} examen(es)</span>
      </div>
      <div class="mt-3 space-y-3">
        ${generatingCard}
        ${loadingHtml}
        ${errorHtml}
        ${examenesHtml}
      </div>
    </section>
  `;
}

function renderUnidadLevel() {
  const unidad = getCurrentUnidad();
  if (!unidad) return '<p class="text-sm text-slate-500">Selecciona una unidad valida.</p>';

  const temas = getVisibleTemasByUnidad(unidad.id);
  const temasHtml = (() => {
    if (explorerState.loading.temas[unidad.id]) return '<p class="text-sm text-slate-500">Cargando temas...</p>';
    if (explorerState.errors.temas[unidad.id]) return `<div class="explorer-empty text-rose-700">${escapeHtml(explorerState.errors.temas[unidad.id])}</div>`;
    if (temas.length === 0) return '<div class="explorer-empty">No hay planeaciones activas guardadas para esta unidad.</div>';

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
                ${renderActionButton({
                  action: "archive-planeacion",
                  tone: "archive",
                  iconOnly: true,
                  title: `Archivar planeacion de ${tema.titulo || "tema"}`.trim(),
                  attrs: {
                    "planeacion-id": planeacion.id,
                    "batch-id": String(planeacion.batch_id || ""),
                    "tema-id": tema.id,
                    "plantel-id": explorerState.current.plantelId,
                    "grado-id": explorerState.current.gradoId,
                    "materia-id": explorerState.current.materiaId,
                    "unidad-id": explorerState.current.unidadId
                  }
                })}
              ` : ""}
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
          <div class="flex items-center gap-4 rounded-lg border border-slate-200 bg-white px-3 py-3">
            <div class="min-w-0 flex flex-1 items-center gap-4">
              <div class="min-w-0">
                <p class="truncate text-sm font-medium text-slate-800">${escapeHtml(tema.titulo)}</p>
                <p class="text-xs text-slate-500">${escapeHtml(String(tema.duracion))} min</p>
              </div>
              ${renderActividadCierreControl({
                scope: "staging",
                localId: tema.localId,
                actividadCierre: tema.actividad_cierre
              })}
            </div>
            <button type="button" class="explorer-danger-icon-btn ml-auto shrink-0" data-content-action="remove-staging" data-staging-id="${tema.localId}" title="Quitar tema" aria-label="Quitar tema">
              ${renderTrashIcon()}
            </button>
          </div>
        `)
        .join("");

  const disableGenerate = explorerState.stagingTemas.length === 0 || explorerState.generating;
  const showStagingPanel = explorerState.stagingPanelOpen || explorerState.stagingTemas.length > 0 || explorerState.generating;
  const layoutClasses = showStagingPanel
    ? "grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.12fr)_minmax(340px,0.88fr)]"
    : "grid grid-cols-1 gap-4";
  const progressHtml = shouldShowUnitProgress() ? renderProgressSection() : "";
  const examHtml = renderExamSection(unidad.id);

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

            <div class="mt-3 grid grid-cols-1 gap-2 md:grid-cols-[minmax(0,1.35fr)_96px_auto] md:items-end">
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

      ${examHtml}
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
  renderUnitExamModal();
  renderExamPreviewModal();
  renderDeleteConfirmModal();
}

function getNodeIds(element) {
  return {
    plantelId: element.getAttribute("data-plantel-id"),
    gradoId: element.getAttribute("data-grado-id"),
    materiaId: element.getAttribute("data-materia-id"),
    unidadId: element.getAttribute("data-unidad-id"),
    temaId: element.getAttribute("data-tema-id"),
    planeacionId: element.getAttribute("data-planeacion-id"),
    batchId: element.getAttribute("data-batch-id")
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
    duracion,
    actividad_cierre: ""
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

function updateStagingTemaActividad(localId, actividadCierre) {
  const actividadNormalizada = normalizeActividadCierre(actividadCierre);
  explorerState.stagingTemas = explorerState.stagingTemas.map((tema) => {
    if (tema.localId !== localId) return tema;
    return {
      ...tema,
      actividad_cierre: actividadNormalizada
    };
  });

  renderExplorerContent();
}

function statusLabelFromTone(status) {
  if (status === "ready") return "Listo";
  if (status === "generating") return "Generando";
  if (status === "skipped") return "No realizado";
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
  if (typeof update.message === "string") {
    item.message = friendlyProgressMessage(update.message);
  }

  updateProgressCounters();
}

function applyGenerateResult(result) {
  const records = [];
  if (Array.isArray(result?.resultados)) records.push(...result.resultados);
  else if (Array.isArray(result?.results)) records.push(...result.results);
  if (Array.isArray(result?.items)) records.push(...result.items);
  if (Array.isArray(result?.temas)) records.push(...result.temas);
  if (records.length === 0 && Array.isArray(result?.planeaciones)) {
    result.planeaciones.forEach((planeacion, index) => {
      records.push({
        index: index + 1,
        tema_id: planeacion.tema_id,
        planeacion_id: planeacion.id,
        status: planeacion.status || "ready",
        titulo: planeacion.tema
      });
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

  updateProgressCounters();

  const readyCount = explorerState.progress.items.filter((item) => item.status === "ready").length;
  const skippedCount = explorerState.progress.items.filter((item) => item.status === "skipped").length;
  const errorCount = explorerState.progress.items.filter((item) => item.status === "error").length;

  if (errorCount > 0) {
    explorerState.progress.finalTone = "danger";
    explorerState.progress.finalMessage = skippedCount > 0
      ? `Proceso finalizado con ${readyCount} creadas, ${skippedCount} no realizadas y ${errorCount} con error.`
      : `Proceso finalizado con ${readyCount} creadas y ${errorCount} con error.`;
  } else if (skippedCount > 0) {
    explorerState.progress.finalTone = "warning";
    explorerState.progress.finalMessage = `Proceso finalizado con ${readyCount} creadas y ${skippedCount} no realizadas.`;
  } else {
    explorerState.progress.finalTone = "success";
    explorerState.progress.finalMessage = `Proceso finalizado. ${readyCount} planeacion(es) creadas correctamente.`;
  }
}

function buildLegacyContext() {
  return {
    materia: getCurrentMateria()?.nombre || undefined,
    nivel: getCurrentGrado()?.nivel_base || undefined,
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

  if (hasTemasSinActividadCierre(explorerState.stagingTemas)) {
    alert(ACTIVIDAD_CIERRE_REQUERIDA_MESSAGE);
    return;
  }

  if (explorerState.generating) return;

  explorerState.generating = true;
  initProgressFromStaging();
  renderExplorerContent();
  scrollToProgress();

  const body = {
    temas: explorerState.stagingTemas.map((tema, index) => ({
      titulo: tema.titulo,
      duracion: tema.duracion,
      actividad_cierre: tema.actividad_cierre,
      orden: index + 1
    })),
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
    const message = friendlyProgressMessage(formatFetchError(error, "No se pudieron generar las planeaciones."));
    const fallbackStatus = isDuplicateTemaMessage(message) ? "skipped" : "error";

    explorerState.progress.items.forEach((item) => {
      if (item.status === "pending" || item.status === "generating") {
        item.status = fallbackStatus;
        item.statusLabel = statusLabelFromTone(fallbackStatus);
        item.message = message;
      }
    });

    explorerState.progress.finalTone = fallbackStatus === "skipped" ? "warning" : "danger";
    explorerState.progress.finalMessage = message;
    updateProgressCounters();
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

    if (hasTemasSinActividadCierre(explorerState.quickCreate.temas)) {
      throw new Error(ACTIVIDAD_CIERRE_REQUERIDA_MESSAGE);
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
    const gradoSelection = requireQuickGradoSelection();

    let gradoId = gradoSelection.id;
    if (gradoId && !quickListHasId(gradosDisponibles, gradoId)) {
      throw new Error("El grado seleccionado no pertenece al plantel elegido.");
    }
    if (!gradoId) {
      const payload = {
        nombre: gradoSelection.nombre,
        nivel_base: gradoSelection.nivelBase,
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
      duracion: tema.duracion,
      actividad_cierre: tema.actividad_cierre
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
  explorerState.modal.mode = "create";
  explorerState.modal.entityId = null;
  explorerState.modal.submitting = false;
  openModalError("");
  syncBodyScrollLock();
}

function configureEntityModalFields(type, mode = "create") {
  const levelRow = document.getElementById("entity-level-row");
  const levelSelect = document.getElementById("entity-level-select");
  const nameLabel = document.getElementById("entity-name-label");
  const requiresLevelSelection = type === "grado" && mode === "create";

  if (levelRow) {
    levelRow.classList.toggle("hidden", !requiresLevelSelection);
  }

  if (levelSelect) {
    if (mode === "create") {
      levelSelect.value = "";
    }
    levelSelect.required = requiresLevelSelection;
    syncQuickSelectVisualState("entity-level-select");
  }

  if (nameLabel) {
    nameLabel.textContent = type === "grado" ? "Nombre visible del grado" : "Nombre";
  }
}

function openEntityModal(type, { mode = "create" } = {}) {
  const modal = document.getElementById("entity-modal");
  const title = document.getElementById("entity-modal-title");
  const nameInput = document.getElementById("entity-name-input");
  const levelSelect = document.getElementById("entity-level-select");
  const submit = document.getElementById("entity-modal-submit");
  if (!modal || !title || !nameInput || !submit) return;

  const currentEntity = {
    plantel: getCurrentPlantel(),
    grado: getCurrentGrado(),
    unidad: getCurrentUnidad()
  }[type] || null;

  if (mode === "edit" && !currentEntity?.id) {
    alert("No hay un elemento seleccionado para editar.");
    return;
  }

  explorerState.modal.type = type;
  explorerState.modal.mode = mode;
  explorerState.modal.submitting = false;
  explorerState.modal.entityId = null;

  const map = {
    plantel: {
      create: { title: "Nuevo plantel", submit: "Crear plantel", placeholder: "Nombre del plantel" },
      edit: { title: "Editar plantel", submit: "Guardar cambios", placeholder: "Nombre del plantel" }
    },
    grado: {
      create: { title: "Nuevo grado", submit: "Crear grado", placeholder: "Ej. 5B" },
      edit: { title: "Editar grado", submit: "Guardar cambios", placeholder: "Ej. 5B" }
    },
    materia: {
      create: { title: "Nueva materia", submit: "Crear materia", placeholder: "Nombre de la materia" }
    },
    unidad: {
      create: { title: "Nueva unidad", submit: "Crear unidad", placeholder: "Nombre de la unidad" },
      edit: { title: "Editar unidad", submit: "Guardar cambios", placeholder: "Nombre de la unidad" }
    }
  };

  const config = map[type]?.[mode] || map.plantel.create;

  title.textContent = config.title;
  submit.textContent = config.submit;
  nameInput.value = mode === "edit"
    ? String(currentEntity?.grado_nombre || currentEntity?.nombre || "").trim()
    : "";
  nameInput.placeholder = config.placeholder;
  configureEntityModalFields(type, mode);
  explorerState.modal.entityId = currentEntity?.id || null;

  if (levelSelect && type === "grado" && currentEntity?.nivel_base) {
    levelSelect.value = currentEntity.nivel_base;
    syncQuickSelectVisualState("entity-level-select");
  }
  openModalError("");
  modal.classList.remove("hidden");
  syncBodyScrollLock();
  requestAnimationFrame(() => {
    if (type === "grado" && mode === "create" && levelSelect) {
      levelSelect.focus();
      return;
    }
    nameInput.focus();
  });
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
    if (explorerState.modal.mode === "edit") {
      if (explorerState.modal.type === "plantel") {
        const plantelId = explorerState.modal.entityId || explorerState.current.plantelId;
        if (!plantelId) throw new Error("Selecciona un plantel antes de editar.");
        await actualizarPlantel({ id: plantelId, nombre });
        await loadPlanteles();
        await selectPlantel(plantelId);
        closeEntityModal();
        return;
      }

      if (explorerState.modal.type === "grado") {
        const plantelId = explorerState.current.plantelId;
        const gradoId = explorerState.modal.entityId || explorerState.current.gradoId;
        if (!plantelId || !gradoId) throw new Error("Selecciona un grado antes de editar.");
        await actualizarGrado({ id: gradoId, nombre });
        await ensureGrados(plantelId, { force: true });
        await selectGrado(plantelId, gradoId);
        closeEntityModal();
        return;
      }

      if (explorerState.modal.type === "unidad") {
        const plantelId = explorerState.current.plantelId;
        const gradoId = explorerState.current.gradoId;
        const materiaId = explorerState.current.materiaId;
        const unidadId = explorerState.modal.entityId || explorerState.current.unidadId;
        if (!plantelId || !gradoId || !materiaId || !unidadId) {
          throw new Error("Selecciona una unidad antes de editar.");
        }
        await actualizarUnidad({ id: unidadId, nombre });
        await ensureUnidades(materiaId, { force: true });
        await selectUnidad(plantelId, gradoId, materiaId, unidadId);
        closeEntityModal();
        return;
      }
    }

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
      const nivelBase = requireNivelBaseValue("entity-level-select", "Nivel base del grado");

      await ensureGrados(plantelId);
      const payload = {
        nombre,
        nivel_base: nivelBase,
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
  if (action === "open-unit-exam-modal") {
    return openUnitExamModal();
  }

  if (action === "create-plantel") return openEntityModal("plantel");
  if (action === "edit-plantel") {
    if (!explorerState.current.plantelId) return alert("Selecciona un plantel primero.");
    return openEntityModal("plantel", { mode: "edit" });
  }
  if (action === "create-grado") {
    if (!explorerState.current.plantelId) return alert("Selecciona un plantel primero.");
    return openEntityModal("grado");
  }
  if (action === "edit-grado") {
    if (!explorerState.current.gradoId) return alert("Selecciona un grado primero.");
    return openEntityModal("grado", { mode: "edit" });
  }
  if (action === "create-materia") {
    if (!explorerState.current.gradoId) return alert("Selecciona un grado primero.");
    return openEntityModal("materia");
  }
  if (action === "create-unidad") {
    if (!explorerState.current.materiaId) return alert("Selecciona una materia primero.");
    return openEntityModal("unidad");
  }
  if (action === "edit-unidad") {
    if (!explorerState.current.unidadId) return alert("Selecciona una unidad primero.");
    return openEntityModal("unidad", { mode: "edit" });
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

  if (action === "preview-exam") {
    const examenId = button.getAttribute("data-examen-id");
    if (examenId) {
      await openExamPreview(examenId);
    }
    return;
  }

  if (action === "download-exam-word") {
    const examenId = button.getAttribute("data-examen-id");
    if (!examenId) return;

    try {
      await downloadExamWord(examenId);
      notifyDashboard("Examen exportado a Word.", "success");
    } catch (error) {
      console.error("Error exportando examen:", error);
      notifyDashboard(formatFetchError(error, "No se pudo exportar el examen."), "danger");
    }
    return;
  }

  if (["archive-plantel", "archive-grado", "archive-materia", "archive-unidad", "archive-planeacion", "archive-batch"].includes(action)) {
    requestArchiveAction(action, ids);
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
  if (action === "open-unit-exam-modal") return openUnitExamModal();

  if (action.startsWith("create-") || action.startsWith("edit-") || action === "focus-staging") {
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

  document.getElementById("explorer-content")?.addEventListener("change", (event) => {
    const select = event.target.closest?.("[data-staging-actividad-select]");
    if (!select) return;
    updateStagingTemaActividad(select.getAttribute("data-staging-actividad-select"), select.value);
  });

  document.getElementById("unit-exam-types")?.addEventListener("change", (event) => {
    const checkbox = event.target.closest?.("[data-exam-question-type]");
    if (checkbox) {
      toggleExamQuestionType(checkbox.getAttribute("data-exam-question-type"), Boolean(checkbox.checked));
      return;
    }

    const countInput = event.target.closest?.("[data-exam-question-count]");
    if (countInput) {
      updateExamQuestionCount(countInput.getAttribute("data-exam-question-count"), countInput.value, countInput);
    }
  });

  document.getElementById("unit-exam-types")?.addEventListener("input", (event) => {
    const countInput = event.target.closest?.("[data-exam-question-count]");
    if (!countInput) return;
    updateExamQuestionCount(countInput.getAttribute("data-exam-question-count"), countInput.value, countInput);
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

  document.getElementById("quick-grado-base-select")?.addEventListener("change", () => {
    syncQuickSelectVisualState("quick-grado-base-select");
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

  document.getElementById("quick-temas-list")?.addEventListener("change", (event) => {
    const select = event.target.closest?.("[data-quick-actividad-select]");
    if (!select) return;
    updateQuickTemaActividad(select.getAttribute("data-quick-actividad-select"), select.value);
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

  ["unit-exam-backdrop", "unit-exam-close", "unit-exam-cancel"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeUnitExamModal();
    });
  });

  ["unit-exam-preview-backdrop", "unit-exam-preview-close", "unit-exam-preview-cancel"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeExamPreviewModal();
    });
  });

  document.getElementById("unit-exam-form")?.addEventListener("submit", (event) => {
    submitUnitExamModal(event).catch((error) => {
      console.error("Error generando examen:", error);
      explorerState.examModal.submitting = false;
      explorerState.examModal.error = "No se pudo generar el examen.";
      renderUnitExamModal();
    });
  });

  document.getElementById("unit-exam-preview-download")?.addEventListener("click", async () => {
    const examenId = explorerState.examPreview.examenId;
    if (!examenId) return;

    try {
      await downloadExamWord(examenId);
      notifyDashboard("Examen exportado a Word.", "success");
    } catch (error) {
      console.error("Error exportando examen:", error);
      notifyDashboard(formatFetchError(error, "No se pudo exportar el examen."), "danger");
    }
  });

  document.getElementById("entity-modal-form")?.addEventListener("submit", (event) => {
    submitEntityModal(event).catch((error) => {
      console.error("Error guardando modal:", error);
      openModalError("No se pudo guardar el elemento.");
    });
  });

  document.getElementById("entity-level-select")?.addEventListener("change", () => {
    syncQuickSelectVisualState("entity-level-select");
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

    if (explorerState.examModal.open) {
      closeUnitExamModal();
      return;
    }

    if (explorerState.examPreview.open) {
      closeExamPreviewModal();
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

  window.addEventListener("pageshow", (event) => {
    const navigationEntry = window.performance?.getEntriesByType?.("navigation")?.[0];
    const isBackForward = Boolean(event.persisted) || navigationEntry?.type === "back_forward";
    if (!isBackForward) return;

    refreshExplorerAfterReturn().catch((error) => {
      console.error("Error rehidratando explorador al volver:", error);
    });
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
