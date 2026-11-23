function buildEmptyExplorerState() {
  return {
  planteles: [],
  gradosByPlantel: {},
  materiasByGrado: {},
  unidadesByMateria: {},
  temasByUnidad: {},
  examenDetalleById: {},
  loading: { root: false, grados: {}, materias: {}, unidades: {}, temas: {} },
  errors: { root: "", grados: {}, materias: {}, unidades: {}, temas: {} },
  current: { level: "root", plantelId: null, gradoId: null, materiaId: null, unidadId: null },
  stagingTemas: [],
  stagingTituloConjunto: "",
  stagingContext: null,
  progress: { total: 0, completed: 0, items: [], finalMessage: "", finalTone: "info" },
  quickCreate: {
    open: false,
    temas: [],
    requestVersion: { grado: 0, materia: 0, unidad: 0 },
    selectedConjunto: null
  },
  generating: false,
  examPreview: { open: false, examenId: null, loading: false, error: "" },
  listaCotejoPreview: { open: false, listaId: null, listaData: null, loading: false, error: "" }
  };
}

const explorerState = buildEmptyExplorerState();

function resetExplorerSessionState() {
  Object.keys(explorerState).forEach((key) => delete explorerState[key]);
  Object.assign(explorerState, buildEmptyExplorerState());
  window.QuickCreate?.close?.();
  window.ExamPreview?.render?.();
  window.ListaCotejoPreview?.render?.();
}

window.BrowserSessionState?.registerReset(resetExplorerSessionState);

function captureExplorerSessionContext() {
  return window.BrowserSessionState?.getSubjectId?.()
    ? window.BrowserSessionState.captureContext()
    : null;
}

function explorerSessionContextIsCurrent(context) {
  return !context || window.BrowserSessionState.isCurrentContext(context);
}

const QUICK_NIVELES_EDUCATIVOS = [
  { value: "primaria", label: "Primaria" },
  { value: "secundaria", label: "Secundaria" },
  { value: "preparatoria", label: "Preparatoria" },
  { value: "universidad", label: "Universidad" }
];
const MOMENTOS_ACTIVIDADES_DIDACTICAS = [
  { key: "conocimientos_previos", label: "Conocimientos previos" },
  { key: "desarrollo", label: "Desarrollo" },
  { key: "cierre", label: "Cierre" }
];
const ACTIVIDADES_DIDACTICAS_POR_MOMENTO = {
  conocimientos_previos: [
    "Activación y diagnóstico", "Lluvia de ideas", "Preguntas detonadoras", "Cuestionario diagnóstico",
    "Quiz interactivo", "Estudio de caso", "Análisis de imágenes", "Análisis de videos",
    "Análisis de noticias", "Diálogo en parejas", "Cuadro SQA", "Mapa mental", "Red de conceptos",
    "Línea del tiempo", "Exploración de materiales", "Demostración experimental", "Observación del entorno"
  ],
  desarrollo: [
    "Construcción y aplicación del conocimiento", "Mapa conceptual", "Mapa mental", "Cuadro comparativo",
    "Cuadro sinóptico", "Diagrama de flujo", "Infografía", "Esquema explicativo", "Resumen",
    "Resolución de ejercicios", "Resolución de problemas", "Práctica de laboratorio", "Simulación digital",
    "Práctica informática", "Dibujo técnico", "Modelado a escala", "Lectura comentada", "Análisis de textos",
    "Investigación documental", "Matriz de análisis", "Reporte técnico", "Bitácora de trabajo",
    "Trabajo colaborativo", "Elaboración de prototipos", "Elaboración de maquetas", "Redacción de ensayos",
    "Elaboración de propuestas", "Producción audiovisual", "Presentación digital"
  ],
  cierre: [
    "Evaluación y retroalimentación", "Ticket de salida", "Cuestionario final", "Quiz de comprobación",
    "Ejercicio de aplicación", "Preguntas de comprensión", "Coevaluación", "Autoevaluación",
    "Reflexión individual", "Retroalimentación grupal", "Conclusiones grupales", "Exposición breve",
    "Galería de trabajos", "Debate grupal", "Mesa redonda", "Portafolio de evidencias",
    "Mapa de síntesis", "Cuadro de conclusiones"
  ]
};
const ACTIVIDADES_DIDACTICAS = Object.values(ACTIVIDADES_DIDACTICAS_POR_MOMENTO)
  .flat()
  .map((nombre) => ({ nombre, descripcion: "" }));
const ACTIVIDADES_DIDACTICAS_SETS = Object.fromEntries(
  Object.entries(ACTIVIDADES_DIDACTICAS_POR_MOMENTO)
    .map(([momento, actividades]) => [momento, new Set(actividades)])
);
const ACTIVIDADES_DIDACTICAS_MAP = new Map(
  ACTIVIDADES_DIDACTICAS.map((actividad) => [actividad.nombre, actividad.descripcion])
);
function normalizeActividadDidactica(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isActividadDidacticaValida(value, momentoKey) {
  const normalized = normalizeActividadDidactica(value);
  return momentoKey
    ? Boolean(ACTIVIDADES_DIDACTICAS_SETS[momentoKey]?.has(normalized))
    : ACTIVIDADES_DIDACTICAS_MAP.has(normalized);
}

function getActividadDidacticaDescripcion(value) {
  return ACTIVIDADES_DIDACTICAS_MAP.get(normalizeActividadDidactica(value)) || "";
}

function normalizeActividadesMomentos(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};

  MOMENTOS_ACTIVIDADES_DIDACTICAS.forEach(({ key }) => {
    const actividad = normalizeActividadDidactica(source[key]);
    if (isActividadDidacticaValida(actividad, key)) {
      normalized[key] = actividad;
    }
  });

  return normalized;
}

function buildActividadesMomentosPayload(actividadesMomentos) {
  return normalizeActividadesMomentos(actividadesMomentos);
}

function buildTemaActividadesPayload(tema) {
  const actividades_momentos = buildActividadesMomentosPayload(tema?.actividades_momentos);
  const actividad_cierre = getActividadCierreLegacy(actividades_momentos);
  return {
    actividades_momentos,
    ...(actividad_cierre ? { actividad_cierre } : {})
  };
}

function getActividadCierreLegacy(actividadesMomentos) {
  return normalizeActividadesMomentos(actividadesMomentos).cierre || "";
}

function buildActividadDidacticaOptions(selectedValue, momentoKey) {
  const normalized = normalizeActividadDidactica(selectedValue);
  const options = ['<option value="">Sin actividad espec&iacute;fica</option>'];

  (ACTIVIDADES_DIDACTICAS_POR_MOMENTO[momentoKey] || []).forEach((nombre) => {
    const isSelected = normalized === nombre ? " selected" : "";

    options.push(`<option value="${escapeHtml(nombre)}"${isSelected}>${escapeHtml(nombre)}</option>`);
  });

  return options.join("");
}

function renderActividadDidacticaSelect({ scope, localId, momentoKey, actividad }) {
  const safeScope = scope === "quick" ? "quick" : "staging";
  const safeLocalId = escapeHtml(String(localId));
  const safeMomentoKey = escapeHtml(String(momentoKey));
  const selectId = `${safeScope}-actividad-${safeMomentoKey}-${safeLocalId}`;
  const dataAttribute = safeScope === "quick"
    ? `data-quick-actividad-select="${safeLocalId}"`
    : `data-staging-actividad-select="${safeLocalId}"`;
  const descripcion = getActividadDidacticaDescripcion(actividad);
  const title = isActividadDidacticaValida(actividad, momentoKey)
    ? `${normalizeActividadDidactica(actividad)}${descripcion ? ` - ${descripcion}` : ""}`
    : "Sin actividad especifica";

  return `
    <select
      id="${selectId}"
      class="actividad-cierre-select actividad-didactica-select min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none ${isActividadDidacticaValida(actividad, momentoKey) ? "is-filled" : ""}"
      title="${escapeHtml(title)}"
      data-actividad-momento="${safeMomentoKey}"
      ${dataAttribute}
    >
      ${buildActividadDidacticaOptions(actividad, momentoKey)}
    </select>
  `;
}

function renderActividadesMomentosControl({ scope, localId, actividadesMomentos }) {
  const normalized = normalizeActividadesMomentos(actividadesMomentos);

  return `
    <div class="actividades-momentos mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Actividades did&aacute;cticas opcionales</p>
      <div class="mt-2 grid gap-2">
        ${MOMENTOS_ACTIVIDADES_DIDACTICAS.map(({ key, label }) => `
          <div class="actividad-momento-row min-w-0 text-xs font-medium text-slate-600">
            <span class="actividad-momento-label">${escapeHtml(label)}</span>
            ${renderActividadDidacticaSelect({
              scope,
              localId,
              momentoKey: key,
              actividad: normalized[key] || ""
            })}
          </div>
        `).join("")}
      </div>
    </div>
  `;
}

function normalizeImagenMomentoKey(value) {
  if (typeof value !== "string") return null;
  if (value === "conocimientos-previos" || value === "desarrollo" || value === "cierre") {
    return value;
  }
  return null;
}

function toggleMomentoInList(currentList, momentoKey, checked) {
  const key = normalizeImagenMomentoKey(momentoKey);
  const list = Array.isArray(currentList)
    ? currentList.filter((item) => normalizeImagenMomentoKey(item))
    : [];

  if (!key) return list;

  const idx = list.indexOf(key);
  if (checked) {
    if (idx === -1) list.push(key);
  } else if (idx !== -1) {
    list.splice(idx, 1);
  }
  return list;
}

function syncBodyScrollLock() {
  if (!document.body) return;
  document.body.classList.toggle(
    "overflow-hidden",
    explorerState.quickCreate.open || explorerState.examPreview.open || explorerState.listaCotejoPreview.open
  );
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

async function loadPlanteles() {
  const context = captureExplorerSessionContext();
  explorerState.loading.root = true;
  explorerState.errors.root = "";


  try {
    const items = await obtenerPlanteles();
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.planteles = filterArchivedHierarchyItems(
      "plantel",
      sortEntities(items || [])
    );
  } catch (error) {
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.planteles = [];
    explorerState.errors.root = formatFetchError(error, "No se pudieron cargar los planteles.");
  } finally {
    explorerState.loading.root = false;
  }

  const hasCurrentPlantel = Boolean(explorerState.current.plantelId);
  const exists = explorerState.planteles.some((item) => item.id === explorerState.current.plantelId);
  if (hasCurrentPlantel && !exists) {
    explorerState.current = { level: "root", plantelId: null, gradoId: null, materiaId: null, unidadId: null };
  }
}

async function ensureGrados(plantelId, { force = false } = {}) {
  if (!plantelId) return;
  if (!force && explorerState.gradosByPlantel[plantelId]) return;

  const context = captureExplorerSessionContext();
  explorerState.loading.grados[plantelId] = true;
  delete explorerState.errors.grados[plantelId];

  try {
    const items = await obtenerGradosPorPlantel(plantelId);
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.gradosByPlantel[plantelId] = filterArchivedHierarchyItems(
      "grado",
      sortEntities(items || [])
    );
  } catch (error) {
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.gradosByPlantel[plantelId] = [];
    explorerState.errors.grados[plantelId] = formatFetchError(error, "No se pudieron cargar los grados.");
  } finally {
    explorerState.loading.grados[plantelId] = false;
  }
}

async function ensureMaterias(gradoId, { force = false } = {}) {
  if (!gradoId) return;
  if (!force && explorerState.materiasByGrado[gradoId]) return;

  const context = captureExplorerSessionContext();
  explorerState.loading.materias[gradoId] = true;
  delete explorerState.errors.materias[gradoId];

  try {
    const items = await obtenerMateriasPorGrado(gradoId);
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.materiasByGrado[gradoId] = filterArchivedHierarchyItems(
      "materia",
      sortEntities(items || [])
    );
  } catch (error) {
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.materiasByGrado[gradoId] = [];
    explorerState.errors.materias[gradoId] = formatFetchError(error, "No se pudieron cargar las materias.");
  } finally {
    explorerState.loading.materias[gradoId] = false;
  }
}

async function ensureUnidades(materiaId, { force = false } = {}) {
  if (!materiaId) return;
  if (!force && explorerState.unidadesByMateria[materiaId]) return;

  const context = captureExplorerSessionContext();
  explorerState.loading.unidades[materiaId] = true;
  delete explorerState.errors.unidades[materiaId];

  try {
    const items = await obtenerUnidadesPorMateria(materiaId);
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.unidadesByMateria[materiaId] = filterArchivedHierarchyItems(
      "unidad",
      sortEntities(items || [])
    );
  } catch (error) {
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.unidadesByMateria[materiaId] = [];
    explorerState.errors.unidades[materiaId] = formatFetchError(error, "No se pudieron cargar las unidades.");
  } finally {
    explorerState.loading.unidades[materiaId] = false;
  }
}

async function ensureTemas(unidadId, { force = false } = {}) {
  if (!unidadId) return;
  if (!force && explorerState.temasByUnidad[unidadId]) return;

  const context = captureExplorerSessionContext();
  explorerState.loading.temas[unidadId] = true;
  delete explorerState.errors.temas[unidadId];

  try {
    const items = await obtenerTemasPorUnidad(unidadId);
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.temasByUnidad[unidadId] = sortEntities(items || []);
  } catch (error) {
    if (!explorerSessionContextIsCurrent(context)) return;
    explorerState.temasByUnidad[unidadId] = [];
    explorerState.errors.temas[unidadId] = formatFetchError(error, "No se pudieron cargar los temas.");
  } finally {
    explorerState.loading.temas[unidadId] = false;
  }
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

function syncQuickSelectVisualState(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const hasValue = Boolean(select.value);
  select.classList.toggle("text-slate-400", !hasValue);
  select.classList.toggle("text-slate-900", hasValue);
}

window.explorerState = explorerState;
