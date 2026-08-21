const explorerState = {
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
    explorerState.current = { level: "root", plantelId: null, gradoId: null, materiaId: null, unidadId: null };
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

async function ensureTemas(unidadId, { force = false } = {}) {
  if (!unidadId) return;
  if (!force && explorerState.temasByUnidad[unidadId]) return;

  explorerState.loading.temas[unidadId] = true;
  delete explorerState.errors.temas[unidadId];

  try {
    const items = await obtenerTemasPorUnidad(unidadId);
    explorerState.temasByUnidad[unidadId] = sortEntities(items || []);
  } catch (error) {
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

function requireNivelBaseValue(selectId, label) {
  const select = document.getElementById(selectId);
  const value = typeof select?.value === "string" ? select.value.trim().toLowerCase() : "";

  if (!GRADO_NIVEL_OPTIONS.has(value)) {
    throw new Error(`Selecciona una opcion para ${label}.`);
  }

  return value;
}

window.explorerState = explorerState;
