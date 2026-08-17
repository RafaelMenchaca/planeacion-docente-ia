const explorerState = {
  planteles: [],
  gradosByPlantel: {},
  materiasByGrado: {},
  unidadesByMateria: {},
  temasByUnidad: {},
  examenesByUnidad: {},
  examenDetalleById: {},
  planeacionByTema: {},
  loading: { root: false, grados: {}, materias: {}, unidades: {}, temas: {}, examenes: {}, listaCotejo: {} },
  errors: { root: "", grados: {}, materias: {}, unidades: {}, temas: {}, examenes: {}, listaCotejo: {} },
  expandedPlanteles: new Set(),
  expandedGrados: new Set(),
  expandedMaterias: new Set(),
  current: { level: "root", plantelId: null, gradoId: null, materiaId: null, unidadId: null },
  stagingTemas: [],
  stagingTituloConjunto: "",
  stagingContext: null,
  stagingPanelOpen: false,
  progress: { total: 0, completed: 0, items: [], finalMessage: "", finalTone: "info" },
  quickCreate: {
    open: false,
    temas: [],
    requestVersion: { grado: 0, materia: 0, unidad: 0 },
    selectedConjunto: null
  },
  searchQuery: "",
  generating: false,
  examGeneration: { active: false, unidadId: null, jobId: null, status: "idle", message: "", progressCurrent: 0, progressTotal: 0 },
  examModal: { open: false, unidadId: null, selectedTypes: [], questionCounts: {}, submitting: false, error: "" },
  examPreview: { open: false, examenId: null, loading: false, error: "" },
  listasCotejoByUnidad: {},
  listaCotejoModal: { open: false, unidadId: null, submitting: false, error: "" },
  listaCotejoGeneration: { active: false, unidadId: null, status: "idle", message: "" },
  listaCotejoPreview: { open: false, listaId: null, listaData: null, loading: false, error: "" },
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

const QUICK_CREATE_NEW_VALUE = "__new__";
let plantelCombobox = null;
let tituloConjuntoCombobox = null;
let gradoCombobox = null;
let materiaCombobox = null;
let unidadCombobox = null;

const GRADO_NIVEL_OPTIONS = new Set(["primaria", "secundaria", "preparatoria", "universidad"]);
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
const ACTIVIDADES_DIDACTICAS = [
  { nombre: "Actividades interdisciplinarias", descripcion: "Integración de materias" },
  { nombre: "Análisis de estudio de caso", descripcion: "Análisis y decisiones" },
  { nombre: "Análisis de videos", descripcion: "Interpretación audiovisual" },
  { nombre: "Aprendizaje basado en problemas (ABPr)", descripcion: "Solución de problemas" },
  { nombre: "Aprendizaje basado en proyectos (ABP)", descripcion: "Problemas reales" },
  { nombre: "Aprendizaje basado en retos", descripcion: "Innovación y desafíos" },
  { nombre: "Aprendizaje cooperativo", descripcion: "Interacción grupal" },
  { nombre: "Aprendizaje servicio", descripcion: "Acciones comunitarias" },
  { nombre: "Círculo de lectura", descripcion: "Discusión de textos" },
  { nombre: "Clase invertida (Flipped Classroom)", descripcion: "Aprendizaje autónomo" },
  { nombre: "Creación de blogs educativos", descripcion: "Escritura digital" },
  { nombre: "Creación de infografías", descripcion: "Recursos visuales" },
  { nombre: "Creación de videos educativos", descripcion: "Creatividad digital" },
  { nombre: "Cuadros comparativos", descripcion: "Diferencias y semejanzas" },
  { nombre: "Debate académico", descripcion: "Pensamiento crítico" },
  { nombre: "Diarios de aprendizaje", descripcion: "Reflexión personal" },
  { nombre: "Dinámicas rompehielo", descripcion: "Integración grupal" },
  { nombre: "Diseño de experimentos", descripcion: "Método científico" },
  { nombre: "Diseño de prototipos", descripcion: "Innovación tecnológica" },
  { nombre: "Elaboración de maquetas", descripcion: "Modelos físicos" },
  { nombre: "Encuestas y entrevistas", descripcion: "Recopilación de datos" },
  { nombre: "Escape room educativo", descripcion: "Trabajo en equipo" },
  { nombre: "Excursiones educativas", descripcion: "Experiencias reales" },
  { nombre: "Exposición oral", descripcion: "Comunicación y dominio" },
  { nombre: "Feria científica o tecnológica", descripcion: "Proyectos al público" },
  { nombre: "Foros de discusión", descripcion: "Intercambio de opiniones" },
  { nombre: "Gamificación", descripcion: "Motivación por el juego" },
  { nombre: "Historietas o cómics educativos", descripcion: "Narrativa visual" },
  { nombre: "Investigación documental", descripcion: "Análisis de fuentes" },
  { nombre: "Juegos de mesa educativos", descripcion: "Lógica y estrategia" },
  { nombre: "Juegos de rol", descripcion: "Perspectivas y contextos" },
  { nombre: "Lectura guiada", descripcion: "Comprensión lectora" },
  { nombre: "Líneas del tiempo", descripcion: "Organización cronológica" },
  { nombre: "Lluvia de ideas", descripcion: "Participación creativa" },
  { nombre: "Mapas mentales", descripcion: "Ideas creativas" },
  { nombre: "Mesa redonda", descripcion: "Análisis colectivo" },
  { nombre: "Organizador Grafico", descripcion: "Información visual" },
  { nombre: "Panel de expertos", descripcion: "Exposición especializada" },
  { nombre: "Podcasts educativos", descripcion: "Comunicación oral" },
  { nombre: "Portafolio de evidencias", descripcion: "Documentación de avances" },
  { nombre: "Prácticas de laboratorio", descripcion: "Aprendizaje experimental" },
  { nombre: "Preguntas de reflexión", descripcion: "Pensamiento profundo" },
  { nombre: "Presentaciones multimedia", descripcion: "Comunicación visual" },
  { nombre: "Proyectos artísticos", descripcion: "Creatividad y expresión" },
  { nombre: "Proyectos de investigación", descripcion: "Fomenta la curiosidad" },
  { nombre: "Resolución de problemas", descripcion: "Razonamiento lógico" },
  { nombre: "Simulación de situaciones reales", descripcion: "Experiencia práctica" },
  { nombre: "Taller de escritura creativa", descripcion: "Expresión escrita" },
  { nombre: "Trabajo colaborativo", descripcion: "Cooperación efectiva" },
  { nombre: "Tutoría entre pares", descripcion: "Aprendizaje colaborativo" }
];
const ACTIVIDADES_DIDACTICAS_MAP = new Map(
  ACTIVIDADES_DIDACTICAS.map((actividad) => [actividad.nombre, actividad.descripcion])
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
    selectedTopicIds: null,
    attempted: false,
    submitting: false,
    error: "",
    ...overrides
  };
}

function normalizeActividadDidactica(value) {
  return typeof value === "string" ? value.trim() : "";
}

function isActividadDidacticaValida(value) {
  return ACTIVIDADES_DIDACTICAS_MAP.has(normalizeActividadDidactica(value));
}

function getActividadDidacticaDescripcion(value) {
  return ACTIVIDADES_DIDACTICAS_MAP.get(normalizeActividadDidactica(value)) || "";
}

function normalizeActividadesMomentos(value) {
  const source = value && typeof value === "object" && !Array.isArray(value) ? value : {};
  const normalized = {};

  MOMENTOS_ACTIVIDADES_DIDACTICAS.forEach(({ key }) => {
    const actividad = normalizeActividadDidactica(source[key]);
    if (isActividadDidacticaValida(actividad)) {
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

function buildActividadDidacticaOptions(selectedValue) {
  const normalized = normalizeActividadDidactica(selectedValue);
  const options = ['<option value="">Sin actividad espec&iacute;fica</option>'];

  ACTIVIDADES_DIDACTICAS.forEach((actividad) => {
    const isSelected = normalized === actividad.nombre ? " selected" : "";
    options.push(`<option value="${escapeHtml(actividad.nombre)}"${isSelected}>${escapeHtml(actividad.nombre)}</option>`);
  });

  return options.join("");
}

function renderActividadCierreStatus(actividadCierre) {
  return "";
}

function getActividadCierreSelectLabel(actividadCierre) {
  return isActividadDidacticaValida(actividadCierre)
    ? normalizeActividadDidactica(actividadCierre)
    : "Sin actividad especifica";
}

function getActividadCierreSelectWidth(actividadCierre) {
  const label = getActividadCierreSelectLabel(actividadCierre);
  const widthCh = Math.min(Math.max(label.length + 3, 11), 28);
  return `${widthCh}ch`;
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
  const title = isActividadDidacticaValida(actividad)
    ? `${normalizeActividadDidactica(actividad)}${descripcion ? ` - ${descripcion}` : ""}`
    : "Sin actividad especifica";

  return `
    <select
      id="${selectId}"
      class="actividad-cierre-select actividad-didactica-select min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none ${isActividadDidacticaValida(actividad) ? "is-filled" : ""}"
      title="${escapeHtml(title)}"
      data-actividad-momento="${safeMomentoKey}"
      ${dataAttribute}
    >
      ${buildActividadDidacticaOptions(actividad)}
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
          <label class="actividad-momento-row min-w-0 text-xs font-medium text-slate-600">
            <span class="actividad-momento-label">${escapeHtml(label)}</span>
            ${renderActividadDidacticaSelect({
              scope,
              localId,
              momentoKey: key,
              actividad: normalized[key] || ""
            })}
          </label>
        `).join("")}
      </div>
    </div>
  `;
}

function renderActividadCierreControl({ scope, localId, actividadCierre }) {
  const safeScope = scope === "quick" ? "quick" : "staging";
  const selectId = `${safeScope}-actividad-cierre-${escapeHtml(String(localId))}`;
  const dataAttribute = safeScope === "quick"
    ? `data-quick-actividad-select="${escapeHtml(String(localId))}"`
    : `data-staging-actividad-select="${escapeHtml(String(localId))}"`;
  const descripcion = getActividadDidacticaDescripcion(actividadCierre);
  const title = isActividadDidacticaValida(actividadCierre)
    ? `${normalizeActividadDidactica(actividadCierre)}${descripcion ? ` - ${descripcion}` : ""}`
    : "Sin actividad especifica";

  return `
    <select
      id="${selectId}"
      class="actividad-cierre-select min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none ${isActividadDidacticaValida(actividadCierre) ? "is-filled" : ""}"
      style="width: ${getActividadCierreSelectWidth(actividadCierre)}; min-width: 118px; max-width: 240px;"
      title="${escapeHtml(title)}"
      ${dataAttribute}
    >
      ${buildActividadDidacticaOptions(actividadCierre)}
    </select>
  `;
}

// PAUSED: auto image generation disabled — const preserved for future re-enable
// const IMAGENES_AUTO_MOMENTOS = [
//   { key: "conocimientos-previos", label: "Conocimientos previos" },
//   { key: "desarrollo", label: "Desarrollo" },
//   { key: "cierre", label: "Cierre" }
// ];

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

// PAUSED: auto image generation disabled — function preserved for future re-enable
// function renderImagenesAutomaticasControl({ scope, localId, generarImagenesEn }) {
//   const safeScope = scope === "quick" ? "quick" : "staging";
//   const dataAttr = safeScope === "quick" ? "data-quick-imagen-check" : "data-staging-imagen-check";
//   const localIdAttr = safeScope === "quick" ? "data-quick-imagen-local-id" : "data-staging-imagen-local-id";
//   const selected = new Set(
//     (Array.isArray(generarImagenesEn) ? generarImagenesEn : [])
//       .map(normalizeImagenMomentoKey)
//       .filter(Boolean)
//   );
//   const safeLocalId = escapeHtml(String(localId));
//
//   const checkboxes = IMAGENES_AUTO_MOMENTOS.map((momento) => {
//     const id = `${safeScope}-imagen-${momento.key}-${safeLocalId}`;
//     const checked = selected.has(momento.key) ? "checked" : "";
//     return `
//       <label for="${id}" class="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 hover:bg-slate-50 cursor-pointer">
//         <input type="checkbox" id="${id}" ${dataAttr}="${momento.key}" ${localIdAttr}="${safeLocalId}" ${checked} class="h-3.5 w-3.5 rounded border-slate-300 text-cyan-700 focus:ring-cyan-600" />
//         <span>${escapeHtml(momento.label)}</span>
//       </label>
//     `;
//   }).join("");
//
//   return `
//     <div class="mt-2 w-full">
//       <p class="text-xs font-medium text-slate-500">Imágenes automáticas</p>
//       <div class="mt-1 flex flex-wrap gap-1.5">
//         ${checkboxes}
//       </div>
//     </div>
//   `;
// }

function syncBodyScrollLock() {
  if (!document.body) return;
  const entityModalOpen = !document.getElementById("entity-modal")?.classList.contains("hidden");

  document.body.classList.toggle(
    "overflow-hidden",
    explorerState.quickCreate.open || explorerState.confirmDelete.open || explorerState.examModal.open || explorerState.examPreview.open || explorerState.listaCotejoModal.open || explorerState.listaCotejoPreview.open || entityModalOpen
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

async function ensureListasCotejo(unidadId, { force = false } = {}) {
  if (!unidadId) return;
  if (!force && explorerState.listasCotejoByUnidad[unidadId]) return;

  explorerState.loading.listaCotejo[unidadId] = true;
  delete explorerState.errors.listaCotejo[unidadId];

  try {
    const items = await obtenerListasCotejoPorUnidad(unidadId);
    explorerState.listasCotejoByUnidad[unidadId] = Array.isArray(items) ? items : [];
  } catch (error) {
    explorerState.listasCotejoByUnidad[unidadId] = [];
    explorerState.errors.listaCotejo[unidadId] = formatFetchError(error, "No se pudieron cargar las listas de cotejo.");
  } finally {
    explorerState.loading.listaCotejo[unidadId] = false;
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

function formatExamTypeSummary(tipos) {
  const labels = [...new Set((Array.isArray(tipos) ? tipos : []).map((tipo) => getExamTypeLabel(tipo)).filter(Boolean))];
  if (labels.length === 0) return "";
  return labels.join(" · ");
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
  const selectedIds = state?.selectedTopicIds instanceof Set ? state.selectedTopicIds : null;
  const isDisabled = Boolean(state?.submitting);

  if (isLoading) {
    return '<p class="text-sm text-slate-500">Cargando temas de la unidad...</p>';
  }

  if (topics.length === 0) {
    return '<p class="text-sm text-slate-500">No hay temas guardados en esta unidad. Primero agrega o genera temas para poder crear el examen.</p>';
  }

  return `
    <div class="space-y-2">
      ${topics.map((tema) => {
        const tid = escapeHtml(String(tema.id));
        const isChecked = selectedIds === null || selectedIds.has(String(tema.id));
        const cbId = `exam-topic-cb-${tid}`;
        const rowClass = isDisabled
          ? "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-not-allowed opacity-60"
          : "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:bg-cyan-50";
        return `
          <label for="${cbId}" class="${rowClass}">
            <input
              type="checkbox"
              id="${cbId}"
              class="h-4 w-4 shrink-0 rounded accent-cyan-700 disabled:cursor-not-allowed"
              data-tema-id="${tid}"
              ${isChecked ? "checked" : ""}
              ${isDisabled ? "disabled" : ""}
            />
            <p class="ml-3 min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">${escapeHtml(tema.titulo || "Tema sin titulo")}</p>
          </label>
        `;
      }).join("")}
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
  const selectedTopicIds = state.selectedTopicIds instanceof Set ? state.selectedTopicIds : null;
  const hasSelectedTopics = selectedTopicIds ? selectedTopicIds.size > 0 : hasTopics;
  const hasSelectedTypes = state.selectedTypes.length > 0;
  const disableSubmit = state.submitting;

  submit.disabled = disableSubmit;
  submit.textContent = state.submitting
    ? "Generando examen..."
    : "Crear examen de unidad con los temas";
  cancel.disabled = state.submitting;
  close.disabled = state.submitting;

  const typesHint = document.getElementById("unit-exam-types-hint");
  const topicsHint = document.getElementById("unit-exam-topics-hint");
  if (typesHint) typesHint.classList.toggle("hidden", !state.attempted || hasSelectedTypes || state.submitting);
  if (topicsHint) topicsHint.classList.toggle("hidden", !state.attempted || hasSelectedTopics || state.submitting);
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

  const selectedTopicIds = state.selectedTopicIds instanceof Set ? state.selectedTopicIds : null;
  const selectedCount = selectedTopicIds ? selectedTopicIds.size : topicItems.length;

  const countText = `${selectedCount} de ${topicItems.length} tema(s)`;

  title.textContent = "Crear examen de unidad";
  description.textContent = selectedCount > 0
    ? `Se generara un examen con ${selectedCount} de ${topicItems.length} tema(s) de ${unitName}.`
    : `Configura los tipos de pregunta y selecciona los temas para generar el examen.`;
  types.innerHTML = renderExamQuestionTypeOptions(state);
  topics.innerHTML = renderExamTopicsList(state);
  topicsCount.textContent = countText;

  topics.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const tid = cb.dataset.temaId;
      if (!tid) return;
      if (!(explorerState.examModal.selectedTopicIds instanceof Set)) {
        explorerState.examModal.selectedTopicIds = new Set();
      }
      if (cb.checked) {
        explorerState.examModal.selectedTopicIds.add(tid);
      } else {
        explorerState.examModal.selectedTopicIds.delete(tid);
      }
      const newCount = explorerState.examModal.selectedTopicIds.size;
      description.textContent = newCount > 0
        ? `Se generara un examen con ${newCount} de ${topicItems.length} tema(s) de ${unitName}.`
        : `Configura los tipos de pregunta y selecciona los temas para generar el examen.`;
      topicsCount.textContent = `${newCount} de ${topicItems.length} tema(s)`;
      syncUnitExamModalActionState();
    });
  });

  syncUnitExamModalErrorState();
  syncUnitExamModalActionState();
}

function getListaCotejoTopicsForUnidad(unidadId) {
  const listas = explorerState.listasCotejoByUnidad[unidadId] || [];
  const listasByPlaneacionId = new Set(listas.map((l) => String(l.planeacion_id)));

  return (explorerState.temasByUnidad[unidadId] || [])
    .filter((tema) => Boolean(explorerState.planeacionByTema[tema.id]?.id))
    .map((tema) => {
      const planeacion = explorerState.planeacionByTema[tema.id];
      return {
        ...tema,
        planeacion_id: planeacion.id,
        has_lista_cotejo: listasByPlaneacionId.has(String(planeacion.id))
      };
    });
}

function renderListaCotejoConfirmTopics(unidadId) {
  const topics = getListaCotejoTopicsForUnidad(unidadId);
  if (topics.length === 0) {
    return '<p class="text-sm text-slate-500">No hay planeaciones generadas en esta unidad.</p>';
  }
  const selectedIds = explorerState.listaCotejoModal.selectedIds || new Set();
  return `
    <div class="space-y-2">
      ${topics.map((tema) => {
        const hasLista = tema.has_lista_cotejo;
        const pid = escapeHtml(String(tema.planeacion_id));
        const isChecked = selectedIds.has(String(tema.planeacion_id));
        const cbId = `lista-cotejo-cb-${pid}`;
        const rowClass = hasLista
          ? "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 cursor-not-allowed opacity-60"
          : "flex items-center gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 cursor-pointer hover:bg-cyan-50";
        return `
          <label for="${cbId}" class="${rowClass}">
            <input
              type="checkbox"
              id="${cbId}"
              class="h-4 w-4 shrink-0 rounded accent-cyan-700 disabled:cursor-not-allowed"
              data-planeacion-id="${pid}"
              ${isChecked ? "checked" : ""}
              ${hasLista ? "disabled" : ""}
            />
            <p class="ml-3 min-w-0 flex-1 truncate text-sm font-semibold text-slate-900">${escapeHtml(tema.titulo || "Tema sin titulo")}</p>
            ${hasLista ? '<span class="ml-auto shrink-0 rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold text-cyan-700">Lista ya generada</span>' : ""}
          </label>
        `;
      }).join("")}
    </div>
  `;
}

function syncListaCotejoConfirmModal() {
  const submit = document.getElementById("lista-cotejo-confirm-submit");
  const cancel = document.getElementById("lista-cotejo-confirm-cancel");
  const close = document.getElementById("lista-cotejo-confirm-close");
  if (!submit || !cancel || !close) return;

  const state = explorerState.listaCotejoModal;
  const selectedIds = state.selectedIds || new Set();

  submit.disabled = state.submitting || selectedIds.size === 0;
  submit.textContent = state.submitting ? "Generando listas..." : "Generar listas seleccionadas";
  cancel.disabled = state.submitting;
  close.disabled = state.submitting;
}

function renderListaCotejoConfirmModal() {
  const modal = document.getElementById("lista-cotejo-confirm-modal");
  const description = document.getElementById("lista-cotejo-confirm-description");
  const topics = document.getElementById("lista-cotejo-confirm-topics");
  const topicsCount = document.getElementById("lista-cotejo-confirm-topics-count");
  const error = document.getElementById("lista-cotejo-confirm-error");
  if (!modal || !description || !topics || !topicsCount || !error) return;

  const state = explorerState.listaCotejoModal;
  modal.classList.toggle("hidden", !state.open);
  syncBodyScrollLock();

  if (!state.open) {
    error.classList.add("hidden");
    error.textContent = "";
    return;
  }

  const topicItems = state.unidadId ? getListaCotejoTopicsForUnidad(state.unidadId) : [];
  const availableCount = topicItems.filter((t) => !t.has_lista_cotejo).length;
  description.textContent = `Selecciona las actividades para las que deseas generar lista de cotejo. Las que ya tienen lista generada no se pueden volver a seleccionar.`;
  topics.innerHTML = renderListaCotejoConfirmTopics(state.unidadId);
  topicsCount.textContent = `${availableCount} disponible(s) de ${topicItems.length}`;

  // Bind checkboxes after rendering
  topics.querySelectorAll('input[type="checkbox"]').forEach((cb) => {
    cb.addEventListener("change", () => {
      const pid = cb.dataset.planeacionId;
      if (!pid) return;
      if (!explorerState.listaCotejoModal.selectedIds) {
        explorerState.listaCotejoModal.selectedIds = new Set();
      }
      if (cb.checked) {
        explorerState.listaCotejoModal.selectedIds.add(pid);
      } else {
        explorerState.listaCotejoModal.selectedIds.delete(pid);
      }
      syncListaCotejoConfirmModal();
    });
  });

  if (state.error) {
    error.classList.remove("hidden");
    error.textContent = state.error;
  } else {
    error.classList.add("hidden");
    error.textContent = "";
  }

  syncListaCotejoConfirmModal();
}

function openListaCotejoModal() {
  if (explorerState.current.level !== "unidad" || !explorerState.current.unidadId) {
    alert("Selecciona una unidad para crear listas de cotejo.");
    return;
  }
  explorerState.listaCotejoModal = {
    open: true,
    unidadId: explorerState.current.unidadId,
    submitting: false,
    error: "",
    selectedIds: new Set()
  };
  renderListaCotejoConfirmModal();
}

function closeListaCotejoModal({ force = false } = {}) {
  if (explorerState.listaCotejoModal.submitting && !force) return;
  explorerState.listaCotejoModal = { open: false, unidadId: null, submitting: false, error: "", selectedIds: new Set() };
  renderListaCotejoConfirmModal();
}

async function submitListaCotejoGenerate() {
  const unidadId = explorerState.listaCotejoModal.unidadId;
  const selectedIds = explorerState.listaCotejoModal.selectedIds || new Set();

  if (!unidadId) {
    explorerState.listaCotejoModal.error = "Selecciona una unidad valida.";
    renderListaCotejoConfirmModal();
    return;
  }

  if (selectedIds.size === 0) {
    explorerState.listaCotejoModal.error = "Selecciona al menos una actividad para generar su lista de cotejo.";
    renderListaCotejoConfirmModal();
    return;
  }

  const planeacionIds = [...selectedIds];

  explorerState.listaCotejoModal.submitting = true;
  explorerState.listaCotejoModal.error = "";
  explorerState.listaCotejoGeneration = {
    active: true,
    unidadId,
    status: "generating",
    message: `Generando listas de cotejo para ${planeacionIds.length} actividad(es)...`
  };
  closeListaCotejoModal({ force: true });
  renderAll();

  try {
    const result = await generarListasCotejoUnidad({ planeacion_ids: planeacionIds, unidad_id: unidadId });

    explorerState.listaCotejoGeneration = { active: false, unidadId, status: "ready", message: "" };

    const created = result?.created ?? result?.created_or_updated ?? 0;
    const skipped = Array.isArray(result?.skipped) ? result.skipped : [];

    await ensureListasCotejo(unidadId, { force: true });
    renderAll();

    let msg = `Se generaron ${created} lista(s) de cotejo.`;
    const alreadyExisted = skipped.filter((s) => s.reason === "already_exists").length;
    const otherSkipped = skipped.filter((s) => s.reason !== "already_exists").length;
    if (alreadyExisted > 0) {
      msg += ` ${alreadyExisted} actividad(es) ya tenian lista de cotejo y fueron omitidas.`;
    }
    if (otherSkipped > 0) {
      msg += ` ${otherSkipped} actividad(es) no pudieron generarse.`;
    }
    notifyDashboard(msg, "success");
  } catch (error) {
    explorerState.listaCotejoGeneration = { active: false, unidadId, status: "error", message: "" };
    explorerState.errors.listaCotejo[unidadId] = formatFetchError(error, "No se pudieron generar las listas de cotejo.");
    renderAll();
  }
}

function renderActividadesEvaluadasHtml(lista) {
  const actividadesEvaluadas = Array.isArray(lista.actividades_evaluadas) ? lista.actividades_evaluadas : [];

  if (actividadesEvaluadas.length > 0) {
    const label = actividadesEvaluadas.length === 1 ? "Actividad evaluada" : "Actividades evaluadas";
    const items = actividadesEvaluadas.map((act) => `
      <div class="mb-2 last:mb-0">
        <p class="text-xs font-semibold text-slate-600">${escapeHtml(act.momento_label || "")} — ${escapeHtml(act.actividad_seleccionada || "")}</p>
        ${act.actividad_texto ? `<p class="mt-0.5 text-sm text-slate-700">${escapeHtml(act.actividad_texto)}</p>` : ""}
      </div>
    `).join("");
    return `
      <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
        <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">${escapeHtml(label)}</p>
        <div class="mt-1 space-y-2">${items}</div>
      </div>
    `;
  }

  return `
    <div class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5">
      <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Actividad evaluada</p>
      <p class="mt-1 text-sm text-slate-700">${escapeHtml(lista.actividad_cierre || "No especificada")}</p>
    </div>
  `;
}

// Compatibilidad temporal: conserva la firma pública y los consumidores del dashboard/Biblioteca.
// Motivo: mantener la API global durante la extracción.
// Consumidores actuales: renderAll(), Biblioteca y el explorador jerárquico.
// Condición para retirarlo: búsqueda global sin consumidores de window.renderListaCotejoPreviewModal.
// Fase prevista de retiro: Fase 10.
function renderListaCotejoPreviewModal() {
  return window.ListaCotejoPreview.render();
}

// Compatibilidad temporal: conserva la apertura usada por el explorador histórico.
// Motivo: mantener la firma local durante la extracción del preview.
// Consumidores actuales: handleContentClick del explorador jerárquico.
// Condición para retirarlo: retiro separado del consumidor legacy confirmado.
// Fase prevista de retiro: Fase 8-9.
function openListaCotejoPreview(listaId) {
  return window.ListaCotejoPreview.open(listaId);
}

// Compatibilidad temporal: conserva la firma pública de cierre del modal.
// Motivo: mantener listeners y Escape sin cambiar el flujo de cierre.
// Consumidores actuales: listeners de Dashboard y compatibilidad global.
// Condición para retirarlo: búsqueda global sin consumidores de window.closeListaCotejoPreview.
// Fase prevista de retiro: Fase 10.
function closeListaCotejoPreview() {
  return window.ListaCotejoPreview.close();
}

function shouldShowListaCotejoSection(unidadId) {
  const listas = explorerState.listasCotejoByUnidad[unidadId] || [];
  return Boolean(
    (explorerState.listaCotejoGeneration.active && explorerState.listaCotejoGeneration.unidadId === unidadId) ||
    explorerState.loading.listaCotejo[unidadId] ||
    explorerState.errors.listaCotejo[unidadId] ||
    listas.length > 0
  );
}

function renderListaCotejoSection(unidadId) {
  if (!shouldShowListaCotejoSection(unidadId)) return "";

  const listas = explorerState.listasCotejoByUnidad[unidadId] || [];
  const isGenerating = explorerState.listaCotejoGeneration.active && explorerState.listaCotejoGeneration.unidadId === unidadId;
  const isLoading = Boolean(explorerState.loading.listaCotejo[unidadId]);
  const error = explorerState.errors.listaCotejo[unidadId] || "";

  const generatingCard = isGenerating
    ? `
      <div class="explorer-progress-item generating">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-semibold">Creando listas de cotejo</p>
          ${renderProgressPill("generating", "Generando")}
        </div>
        <p class="mt-1 text-xs">${escapeHtml(explorerState.listaCotejoGeneration.message || "Generando listas con las actividades seleccionadas de cada planeacion...")}</p>
      </div>
    `
    : "";

  const loadingHtml = !isGenerating && isLoading
    ? '<p class="text-sm text-slate-500">Cargando listas de cotejo...</p>'
    : "";

  const errorHtml = error
    ? `<div class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">${escapeHtml(error)}</div>`
    : "";

  const listasHtml = listas.map((lista, index) => {
    const cardId = index === 0 ? ' id="unit-lista-cotejo-result-card"' : "";
    return `
      <div${cardId} class="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-900">${escapeHtml(lista.tema || lista.titulo || "Lista de cotejo")}</p>
          </div>
          <div class="flex flex-wrap justify-end gap-2">
            <button type="button" class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" data-content-action="preview-lista-cotejo" data-lista-id="${escapeHtml(lista.id)}">
              Ver lista
            </button>
          </div>
        </div>
        <div class="mt-2 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-4 text-slate-400">
          <span>${escapeHtml(formatExamDate(lista.updated_at || lista.created_at) || "Sin fecha")}</span>
          <span aria-hidden="true" class="text-slate-300">•</span>
          <span>${escapeHtml(String(lista.total_puntos || 10))} puntos</span>
        </div>
      </div>
    `;
  }).join("");

  return `
    <section class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between gap-2">
        <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Listas de cotejo</h4>
        <span class="text-xs text-slate-500">${listas.length} lista(s)</span>
      </div>
      <div class="mt-3 space-y-2">
        ${generatingCard}
        ${loadingHtml}
        ${errorHtml}
        ${listasHtml}
      </div>
    </section>
  `;
}

function openUnitExamModal() {
  if (explorerState.current.level !== "unidad" || !explorerState.current.unidadId) {
    alert("Selecciona una unidad para crear el examen.");
    return;
  }

  const unidadId = explorerState.current.unidadId;
  const allTopics = getExamTopicsForUnidad(unidadId);
  const nextState = createExamModalState({
    open: true,
    unidadId,
    selectedTopicIds: new Set()
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

function waitForExamPolling(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function getExamGenerationUserMessage(statusPayload) {
  const rawStep = typeof statusPayload?.current_step === "string" ? statusPayload.current_step.trim() : "";
  if (rawStep) return rawStep;

  const current = Number(statusPayload?.progress_current || 0);
  const total = Number(statusPayload?.progress_total || 0);
  if (total > 0) return `Generando pregunta ${Math.min(current + 1, total)} de ${total}...`;
  return "Generando examen...";
}

async function waitForExamGenerationCompletion(jobId, unidadId) {
  let lastStatus = null;

  while (jobId) {
    await waitForExamPolling(lastStatus ? 4000 : 1500);
    const statusPayload = await obtenerEstadoGeneracionExamen(jobId);
    lastStatus = statusPayload;

    explorerState.examGeneration = {
      active: true,
      unidadId,
      jobId,
      status: statusPayload?.status || "processing",
      message: getExamGenerationUserMessage(statusPayload),
      progressCurrent: Number(statusPayload?.progress_current || 0),
      progressTotal: Number(statusPayload?.progress_total || 0)
    };
    renderAll();
    scrollToExamSection();

    if (statusPayload?.status === "completed") {
      return statusPayload;
    }

    if (statusPayload?.status === "failed" || statusPayload?.status === "partial" || statusPayload?.status === "cancelled") {
      const error = new Error("No se pudo completar la generacion del examen. Intenta nuevamente.");
      error.payload = statusPayload;
      throw error;
    }
  }

  throw new Error("No se pudo obtener el progreso del examen.");
}

async function submitUnitExamModal(event) {
  event?.preventDefault?.();

  explorerState.examModal.attempted = true;
  const unidadId = explorerState.examModal.unidadId;
  const selectedTypes = [...explorerState.examModal.selectedTypes];
  const questionCounts = getExamQuestionCountsPayload(explorerState.examModal);
  const allTopicItems = unidadId ? getExamTopicsForUnidad(unidadId) : [];
  const selectedTopicIds = explorerState.examModal.selectedTopicIds instanceof Set
    ? explorerState.examModal.selectedTopicIds
    : new Set(allTopicItems.map((t) => String(t.id)));
  const selectedTopicCount = selectedTopicIds.size;

  if (!unidadId) {
    explorerState.examModal.error = "Selecciona una unidad valida para crear el examen.";
    renderUnitExamModal();
    return;
  }

  if (allTopicItems.length === 0) {
    explorerState.examModal.error = "No hay temas en la unidad para generar el examen.";
    renderUnitExamModal();
    return;
  }

  if (selectedTopicCount === 0 || selectedTypes.length === 0) {
    renderUnitExamModal();
    return;
  }

  // Defensa: descartar cualquier tema seleccionado que no pertenezca a la unidad
  // actual (evita arrastrar temas de una unidad anterior sin recargar la pagina).
  const validTopicIds = new Set(allTopicItems.map((tema) => String(tema.id)));
  const requestedTopicIds = [...selectedTopicIds].map(String);
  const filteredTopicIds = requestedTopicIds.filter((id) => validTopicIds.has(id));

  if (filteredTopicIds.length !== requestedTopicIds.length) {
    console.warn("[examenes] tema descartado por unidad incorrecta", {
      expectedUnidadId: unidadId,
      requestedTopicIds,
      filteredTopicIds
    });
  }

  if (filteredTopicIds.length === 0) {
    explorerState.examModal.error = "Selecciona al menos un tema de esta unidad para generar el examen.";
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
    jobId: null,
    status: "processing",
    message: `Preparando examen con ${selectedTopicCount} tema(s) y ${totalPreguntas} pregunta(s)...`,
    progressCurrent: 0,
    progressTotal: totalPreguntas
  };
  closeUnitExamModal({ force: true });
  renderAll();
  scrollToExamSection();

  console.info("[examenes] payload generacion (dashboard)", {
    unidadId,
    totalTemas: filteredTopicIds.length,
    temas: filteredTopicIds
  });

  try {
    const generationJob = await generarExamenUnidad({
      unidad_id: unidadId,
      tipos_pregunta: selectedTypes,
      cantidades_pregunta: questionCounts,
      tema_ids: filteredTopicIds
    });
    const jobId = generationJob?.job_id || generationJob?.id;

    if (!jobId) {
      throw new Error("No se pudo iniciar la generacion del examen.");
    }

    explorerState.examGeneration = {
      active: true,
      unidadId,
      jobId,
      status: generationJob?.status || "processing",
      message: "Preparando preguntas...",
      progressCurrent: 0,
      progressTotal: totalPreguntas
    };
    renderAll();

    const completedJob = await waitForExamGenerationCompletion(jobId, unidadId);
    const examenId = completedJob?.examen_id;

    if (!examenId) {
      throw new Error("El examen se genero, pero no se recibio el identificador.");
    }

    const examen = await obtenerExamenDetalle(examenId);

    if (examen?.id) {
      explorerState.examenDetalleById[examen.id] = examen;
    }
    const currentExamenes = explorerState.examenesByUnidad[unidadId] || [];
    explorerState.examenesByUnidad[unidadId] = [examen, ...currentExamenes.filter((item) => item?.id !== examen?.id)];
    explorerState.examGeneration = {
      active: false,
      unidadId,
      status: "ready",
      jobId,
      message: "Examen generado correctamente",
      progressCurrent: totalPreguntas,
      progressTotal: totalPreguntas
    };
    await ensureExamenes(unidadId, { force: true });
    renderAll();
    scrollToExamSection();
  } catch (error) {
    explorerState.examGeneration = {
      active: false,
      unidadId,
      status: "error",
      jobId: null,
      message: "",
      progressCurrent: 0,
      progressTotal: totalPreguntas
    };
    explorerState.errors.examenes[unidadId] = "No se pudo completar la generacion del examen. Intenta nuevamente.";
    renderAll();
    scrollToExamSection();
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

// Wrappers de integración: conservan consumidores Dashboard/Biblioteca mientras
// Quick Create vive en su owner clásico cargado después de este script.
function setQuickPanelVisibility(isOpen) {
  return window.QuickCreate.setPanelVisibility(isOpen);
}

function syncQuickSelectVisualState(selectId) {
  const select = document.getElementById(selectId);
  if (!select) return;

  const hasValue = Boolean(select.value);
  select.classList.toggle("text-slate-400", !hasValue);
  select.classList.toggle("text-slate-900", hasValue);
}

async function openQuickCreatePanel() {
  return window.QuickCreate.open();
}

function closeQuickCreatePanel() {
  return window.QuickCreate.close();
}

function requireNivelBaseValue(selectId, label) {
  const select = document.getElementById(selectId);
  const value = typeof select?.value === "string" ? select.value.trim().toLowerCase() : "";

  if (!GRADO_NIVEL_OPTIONS.has(value)) {
    throw new Error(`Selecciona una opcion para ${label}.`);
  }

  return value;
}

// Implementación canónica movida a js/ui/shared.ui.js (window.AppUI.renderProgressPill).
// Este wrapper mantiene la función accesible en el scope local de dashboard.page.js.
function renderProgressPill(status, label) {
  if (label === undefined) label = statusLabelFromTone(status);
  return window.AppUI.renderProgressPill(status, label);
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

// Compatibilidad temporal: conserva la firma pública y los consumidores del dashboard/Biblioteca.
// Motivo: mantener la API global durante la extracción.
// Consumidores actuales: renderAll(), Biblioteca y el explorador jerárquico.
// Condición para retirarlo: búsqueda global sin consumidores de window.renderExamPreviewModal.
// Fase prevista de retiro: Fase 10.
function renderExamPreviewModal() {
  return window.ExamPreview.render();
}

// Compatibilidad temporal: conserva la firma pública y el comportamiento de descarga.
// Motivo: mantener el contrato global mientras Biblioteca migra al módulo canónico.
// Consumidores actuales: cards de Biblioteca, preview y explorador jerárquico.
// Condición para retirarlo: búsqueda global sin consumidores de window.downloadExamWord.
// Fase prevista de retiro: Fase 10.
async function downloadExamWord(examenId, filenameOverride) {
  return window.ExamDownload.download(examenId, filenameOverride);
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
      <div id="unit-exam-generating-card" class="explorer-progress-item generating">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <p class="font-semibold">Creando examen de unidad</p>
          ${renderProgressPill("generating", "Generando")}
        </div>
        <p class="mt-1 text-xs">${escapeHtml(explorerState.examGeneration.message || "Preparando examen con los temas actuales de la unidad...")}</p>
        ${explorerState.examGeneration.progressTotal ? `
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-cyan-100">
            <div class="h-full rounded-full bg-cyan-500" style="width: ${Math.min(100, Math.round((Number(explorerState.examGeneration.progressCurrent || 0) / Math.max(Number(explorerState.examGeneration.progressTotal || 1), 1)) * 100))}%"></div>
          </div>
          <p class="mt-1 text-[11px] text-slate-500">${escapeHtml(String(explorerState.examGeneration.progressCurrent || 0))} de ${escapeHtml(String(explorerState.examGeneration.progressTotal || 0))} pregunta(s)</p>
        ` : ""}
      </div>
    `
    : "";

  const loadingHtml = !isGenerating && isLoading
    ? '<p class="text-sm text-slate-500">Cargando examenes...</p>'
    : "";

  const errorHtml = error
    ? `<div class="rounded-xl border border-rose-200 bg-rose-50 px-3 py-3 text-sm text-rose-700">${escapeHtml(error)}</div>`
    : "";

  const examenesHtml = examenes.map((examen, index) => {
    const typeSummary = formatExamTypeSummary(examen.tipos_pregunta);
    const cardId = index === 0 ? ' id="unit-exam-result-card"' : "";

    return `
    <div${cardId} class="rounded-xl border border-slate-200 bg-white px-3 py-2.5">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="min-w-0 flex flex-1 flex-wrap items-center gap-2">
          <p class="text-sm font-semibold text-slate-900">${escapeHtml(examen.titulo || "Examen de unidad")}</p>
        </div>
        <div class="flex flex-wrap justify-end gap-2">
          <button type="button" class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50" data-content-action="preview-exam" data-examen-id="${escapeHtml(examen.id)}">
            Vista previa
          </button>
          <button type="button" class="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50" data-content-action="download-exam-word" data-examen-id="${escapeHtml(examen.id)}">
            Descargar Word
          </button>
        </div>
      </div>
      <div class="mt-2 flex flex-wrap gap-x-1.5 gap-y-0.5 text-[10px] leading-4 text-slate-400">
        <span>${escapeHtml(formatExamDate(examen.created_at) || "Sin fecha")}</span>
        <span aria-hidden="true" class="text-slate-300">•</span>
        <span>${escapeHtml(String(examen.total_preguntas || 0))} pregunta(s)</span>
        ${typeSummary ? `<span aria-hidden="true" class="text-slate-300">•</span><span>${escapeHtml(typeSummary)}</span>` : ""}
      </div>
    </div>
  `;
  }).join("");

  return `
    <section id="unit-exam-section-anchor" class="rounded-2xl border border-slate-200 bg-white p-4">
      <div class="flex items-center justify-between gap-2">
        <h4 class="text-sm font-semibold uppercase tracking-wide text-slate-700">Examenes de la unidad</h4>
        <span class="text-xs text-slate-500">${examenes.length} examen(es)</span>
      </div>
      <div class="mt-3 space-y-2">
        ${generatingCard}
        ${loadingHtml}
        ${errorHtml}
        ${examenesHtml}
      </div>
    </section>
  `;
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

function scrollToExamSection(block = "center") {
  requestAnimationFrame(() => {
    const target = document.getElementById("unit-exam-generating-card")
      || document.getElementById("unit-exam-result-card")
      || document.getElementById("unit-exam-section-anchor");

    if (target) target.scrollIntoView({ behavior: "smooth", block });
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
    actividades_momentos: {},
    actividad_cierre: "",
    generar_imagenes_en: []
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

function updateStagingTemaActividad(localId, momentoKey, actividad) {
  const safeMomento = MOMENTOS_ACTIVIDADES_DIDACTICAS.some((momento) => momento.key === momentoKey)
    ? momentoKey
    : "";
  const actividadNormalizada = normalizeActividadDidactica(actividad);
  explorerState.stagingTemas = explorerState.stagingTemas.map((tema) => {
    if (tema.localId !== localId) return tema;
    const actividadesMomentos = normalizeActividadesMomentos(tema.actividades_momentos);
    if (safeMomento && isActividadDidacticaValida(actividadNormalizada)) {
      actividadesMomentos[safeMomento] = actividadNormalizada;
    } else if (safeMomento) {
      delete actividadesMomentos[safeMomento];
    }
    return {
      ...tema,
      actividades_momentos: actividadesMomentos,
      actividad_cierre: getActividadCierreLegacy(actividadesMomentos)
    };
  });

  renderExplorerContent();
}

// PAUSED: auto image generation disabled — function preserved for future re-enable
// function toggleStagingTemaImagenMomento(localId, momentoKey, checked) {
//   if (!localId) return;
//   explorerState.stagingTemas = explorerState.stagingTemas.map((tema) => {
//     if (tema.localId !== localId) return tema;
//     return {
//       ...tema,
//       generar_imagenes_en: toggleMomentoInList(tema.generar_imagenes_en, momentoKey, checked)
//     };
//   });
// }

// Implementación canónica movida a js/ui/shared.ui.js (window.AppUI.statusLabelFromTone).
// Este wrapper mantiene la función accesible en el scope local de dashboard.page.js.
function statusLabelFromTone(status) {
  return window.AppUI.statusLabelFromTone(status);
}

async function generatePlaneacionesFromStaging() {
  return window.QuickCreate.generateFromStaging();
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

  if (action === "open-lista-cotejo-modal") {
    return openListaCotejoModal();
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

function findPlantelIdForGrado(gradoId) {
  for (const [plantelId, grados] of Object.entries(explorerState.gradosByPlantel || {})) {
    if ((grados || []).some((g) => g.id === gradoId)) return plantelId;
  }
  return null;
}

window.explorerState = explorerState;
window.renderExamPreviewModal = renderExamPreviewModal;
window.closeExamPreviewModal = closeExamPreviewModal;
window.renderListaCotejoPreviewModal = renderListaCotejoPreviewModal;
window.closeListaCotejoPreview = closeListaCotejoPreview;
window.downloadExamWord = downloadExamWord;
