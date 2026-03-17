const ARCHIVED_HIERARCHY_REGISTRY_KEY = "educativo.archivedHierarchy.registry";
const ARCHIVED_HIERARCHY_LEVEL_KEYS = {
  plantel: "planteles",
  grado: "grados",
  materia: "materias",
  unidad: "unidades"
};
const ARCHIVED_HIERARCHY_LEVEL_ORDER = ["plantel", "grado", "materia", "unidad"];

function getArchivedHierarchyRegistryStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function buildEmptyArchivedHierarchyRegistry() {
  return {
    hidden: {
      planteles: [],
      grados: [],
      materias: [],
      unidades: []
    },
    scopes: {},
    planeaciones: {},
    batches: {}
  };
}

function normalizeArchivedHierarchyScope(scope) {
  const type = String(scope?.type || "").replace(/^archive-/, "").trim().toLowerCase();
  const id = scope?.id === undefined || scope?.id === null ? "" : String(scope.id).trim();

  if (!ARCHIVED_HIERARCHY_LEVEL_KEYS[type] || !id) {
    return null;
  }

  return { type, id };
}

function buildArchivedHierarchyScopeKey(scope) {
  const normalizedScope = normalizeArchivedHierarchyScope(scope);
  if (!normalizedScope) return "";
  return `${normalizedScope.type}:${normalizedScope.id}`;
}

function normalizeArchivedHierarchyText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeArchivedHierarchyId(value) {
  if (value === undefined || value === null) return "";
  return String(value).trim();
}

function normalizeArchivedHierarchyScopeRecord(scope, metadata = {}) {
  const normalizedScope = normalizeArchivedHierarchyScope(scope);
  if (!normalizedScope) return null;

  const source = metadata && typeof metadata === "object" ? metadata : {};
  const rootNameKey = `${normalizedScope.type}_nombre`;
  const rootLabel =
    normalizeArchivedHierarchyText(source.label) ||
    normalizeArchivedHierarchyText(source[rootNameKey]) ||
    normalizedScope.type;

  const record = {
    type: normalizedScope.type,
    id: normalizedScope.id,
    label: rootLabel,
    archived_at: normalizeArchivedHierarchyText(source.archived_at) || new Date().toISOString()
  };

  ARCHIVED_HIERARCHY_LEVEL_ORDER.forEach((level) => {
    const idKey = `${level}_id`;
    const nameKey = `${level}_nombre`;
    const safeId =
      level === normalizedScope.type
        ? normalizedScope.id
        : normalizeArchivedHierarchyId(source[idKey]);
    const safeName =
      level === normalizedScope.type
        ? rootLabel
        : normalizeArchivedHierarchyText(source[nameKey]);

    if (safeId) {
      record[idKey] = safeId;
    }

    if (safeName) {
      record[nameKey] = safeName;
    }
  });

  const gradoNivelBase = normalizeArchivedHierarchyText(source.grado_nivel_base);
  if (gradoNivelBase) {
    record.grado_nivel_base = gradoNivelBase;
  }

  return record;
}

function isArchivedHierarchyScopeWithinScope(candidateScope, parentScope, candidateRecord = null) {
  const normalizedCandidate = normalizeArchivedHierarchyScope(candidateScope);
  const normalizedParent = normalizeArchivedHierarchyScope(parentScope);

  if (!normalizedCandidate || !normalizedParent) return false;

  const parentIndex = ARCHIVED_HIERARCHY_LEVEL_ORDER.indexOf(normalizedParent.type);
  const candidateIndex = ARCHIVED_HIERARCHY_LEVEL_ORDER.indexOf(normalizedCandidate.type);

  if (parentIndex < 0 || candidateIndex < 0 || candidateIndex < parentIndex) {
    return false;
  }

  if (normalizedCandidate.type === normalizedParent.type) {
    return normalizedCandidate.id === normalizedParent.id;
  }

  const record = candidateRecord && typeof candidateRecord === "object" ? candidateRecord : {};
  return normalizeArchivedHierarchyId(record[`${normalizedParent.type}_id`]) === normalizedParent.id;
}

function pruneArchivedHierarchyRegistry(registry, scope, items = []) {
  const normalizedScope = normalizeArchivedHierarchyScope(scope);
  if (!normalizedScope) return;

  const startIndex = ARCHIVED_HIERARCHY_LEVEL_ORDER.indexOf(normalizedScope.type);
  const levelsToClear =
    startIndex >= 0
      ? ARCHIVED_HIERARCHY_LEVEL_ORDER.slice(startIndex)
      : ARCHIVED_HIERARCHY_LEVEL_ORDER;
  const idsByLevel = new Map(levelsToClear.map((level) => [level, new Set()]));

  if (idsByLevel.has(normalizedScope.type)) {
    idsByLevel.get(normalizedScope.type).add(normalizedScope.id);
  }

  (Array.isArray(items) ? items : []).forEach((item) => {
    levelsToClear.forEach((level) => {
      const safeId = normalizeArchivedHierarchyId(item?.[`${level}_id`]);
      if (safeId && idsByLevel.has(level)) {
        idsByLevel.get(level).add(safeId);
      }
    });
  });

  idsByLevel.forEach((ids, level) => {
    const hiddenKey = ARCHIVED_HIERARCHY_LEVEL_KEYS[level];
    registry.hidden[hiddenKey] = (registry.hidden[hiddenKey] || []).filter(
      (value) => !ids.has(value)
    );
  });

  const scopeEntries =
    registry.scopes && typeof registry.scopes === "object" ? registry.scopes : {};
  const scopeEntriesSnapshot = { ...scopeEntries };

  Object.entries(scopeEntries).forEach(([key, value]) => {
    if (isArchivedHierarchyScopeWithinScope(value, normalizedScope, value)) {
      delete registry.scopes[key];
    }
  });

  [["planeaciones", registry.planeaciones], ["batches", registry.batches]].forEach(
    ([, collection]) => {
      Object.entries(collection || {}).forEach(([id, value]) => {
        const scopeKey = buildArchivedHierarchyScopeKey(value);
        const scopeRecord = scopeEntriesSnapshot[scopeKey] || value;
        if (isArchivedHierarchyScopeWithinScope(value, normalizedScope, scopeRecord)) {
          delete collection[id];
        }
      });
    }
  );
}

function normalizeArchivedHierarchyRegistry(raw) {
  const base = buildEmptyArchivedHierarchyRegistry();
  const source = raw && typeof raw === "object" ? raw : {};
  const hidden = source.hidden && typeof source.hidden === "object" ? source.hidden : {};

  for (const key of Object.values(ARCHIVED_HIERARCHY_LEVEL_KEYS)) {
    base.hidden[key] = [...new Set((Array.isArray(hidden[key]) ? hidden[key] : [])
      .map((value) => String(value || "").trim())
      .filter(Boolean))];
  }

  for (const [collectionKey, target] of [["planeaciones", base.planeaciones], ["batches", base.batches]]) {
    const sourceCollection = source[collectionKey] && typeof source[collectionKey] === "object"
      ? source[collectionKey]
      : {};

    Object.entries(sourceCollection).forEach(([id, value]) => {
      const normalizedScope = normalizeArchivedHierarchyScope(value);
      if (!normalizedScope || !id) return;
      target[String(id).trim()] = normalizedScope;
    });
  }

  const sourceScopes = source.scopes && typeof source.scopes === "object" ? source.scopes : {};
  Object.values(sourceScopes).forEach((value) => {
    const normalizedRecord = normalizeArchivedHierarchyScopeRecord(value, value);
    const scopeKey = buildArchivedHierarchyScopeKey(normalizedRecord);
    if (normalizedRecord && scopeKey) {
      base.scopes[scopeKey] = normalizedRecord;
    }
  });

  return base;
}

function readArchivedHierarchyRegistry() {
  const storage = getArchivedHierarchyRegistryStorage();
  if (!storage) return buildEmptyArchivedHierarchyRegistry();

  try {
    const raw = storage.getItem(ARCHIVED_HIERARCHY_REGISTRY_KEY);
    return normalizeArchivedHierarchyRegistry(raw ? JSON.parse(raw) : null);
  } catch {
    return buildEmptyArchivedHierarchyRegistry();
  }
}

function writeArchivedHierarchyRegistry(registry) {
  const storage = getArchivedHierarchyRegistryStorage();
  if (!storage) return;

  try {
    storage.setItem(
      ARCHIVED_HIERARCHY_REGISTRY_KEY,
      JSON.stringify(normalizeArchivedHierarchyRegistry(registry))
    );
  } catch {
    // Ignore storage write failures.
  }
}

function registerArchivedHierarchyScope(scope, references = {}, metadata = {}) {
  const normalizedScope = normalizeArchivedHierarchyScope(scope);
  if (!normalizedScope) return;

  const registry = readArchivedHierarchyRegistry();
  pruneArchivedHierarchyRegistry(registry, normalizedScope);
  const hiddenKey = ARCHIVED_HIERARCHY_LEVEL_KEYS[normalizedScope.type];

  registry.hidden[hiddenKey] = [
    ...new Set([...(registry.hidden[hiddenKey] || []), normalizedScope.id])
  ];

  const scopeRecord = normalizeArchivedHierarchyScopeRecord(normalizedScope, metadata);
  const scopeKey = buildArchivedHierarchyScopeKey(normalizedScope);
  if (scopeRecord && scopeKey) {
    registry.scopes[scopeKey] = scopeRecord;
  }

  (Array.isArray(references?.planeacionIds) ? references.planeacionIds : []).forEach((id) => {
    const safeId = String(id || "").trim();
    if (safeId) {
      registry.planeaciones[safeId] = normalizedScope;
    }
  });

  (Array.isArray(references?.batchIds) ? references.batchIds : []).forEach((id) => {
    const safeId = String(id || "").trim();
    if (safeId) {
      registry.batches[safeId] = normalizedScope;
    }
  });

  writeArchivedHierarchyRegistry(registry);
}

function restoreArchivedHierarchyScope(scope) {
  const normalizedScope = normalizeArchivedHierarchyScope(scope);
  if (!normalizedScope) return;

  const registry = readArchivedHierarchyRegistry();
  pruneArchivedHierarchyRegistry(registry, normalizedScope);
  writeArchivedHierarchyRegistry(registry);
}

function restoreArchivedHierarchyScopeByPlaneacionId(id) {
  const safeId = String(id || "").trim();
  if (!safeId) return;

  const registry = readArchivedHierarchyRegistry();
  const scope = registry.planeaciones[safeId];
  if (!scope) return;

  pruneArchivedHierarchyRegistry(registry, scope);
  writeArchivedHierarchyRegistry(registry);
}

function restoreArchivedHierarchyScopeByBatchId(id) {
  const safeId = String(id || "").trim();
  if (!safeId) return;

  const registry = readArchivedHierarchyRegistry();
  const scope = registry.batches[safeId];
  if (!scope) return;

  pruneArchivedHierarchyRegistry(registry, scope);
  writeArchivedHierarchyRegistry(registry);
}

function isArchivedHierarchyScopeHidden(type, id) {
  const normalizedScope = normalizeArchivedHierarchyScope({ type, id });
  if (!normalizedScope) return false;

  const registry = readArchivedHierarchyRegistry();
  const hiddenKey = ARCHIVED_HIERARCHY_LEVEL_KEYS[normalizedScope.type];
  return (registry.hidden[hiddenKey] || []).includes(normalizedScope.id);
}

function getArchivedHierarchyRegistrySnapshot() {
  return readArchivedHierarchyRegistry();
}

function restoreArchivedHierarchyBranch(scope, items = []) {
  const normalizedScope = normalizeArchivedHierarchyScope(scope);
  if (!normalizedScope) return;

  const registry = readArchivedHierarchyRegistry();
  pruneArchivedHierarchyRegistry(registry, normalizedScope, items);
  writeArchivedHierarchyRegistry(registry);
}

async function obtenerPlaneaciones() {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesList(session.access_token);
}

async function eliminarPlaneacionApi(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesDelete(id, session.access_token);
}

async function archivarPlaneacionApi(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesArchive(id, session.access_token);
}

async function restaurarPlaneacionApi(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesRestore(id, session.access_token);
}

async function archivarRutaBatchApi(batchId) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesArchiveBatch(batchId, session.access_token);
}

async function restaurarRutaBatchApi(batchId) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesRestoreBatch(batchId, session.access_token);
}

async function obtenerArchivadosPlaneaciones() {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesArchived(session.access_token);
}

async function eliminarPlaneacionPermanentementeApi(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesPermanentDelete(id, session.access_token);
}

async function eliminarRutaBatchPermanentementeApi(batchId) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesPermanentDeleteBatch(batchId, session.access_token);
}

async function generarPlaneacionApi(payload) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesGenerate(payload, session.access_token);
}

async function generarPlaneacionApiConProgreso(payload, onEvent) {
  const session = await window.requireSession();
  if (!session) return null;

  try {
    return await apiPlaneacionesGenerateWithProgress(payload, session.access_token, onEvent);
  } catch (error) {
    // Fallback to existing endpoint if stream endpoint is not enabled yet.
    if (
      error &&
      typeof error.message === "string" &&
      error.message.toLowerCase().includes("no se pudo generar")
    ) {
      return apiPlaneacionesGenerate(payload, session.access_token);
    }
    throw error;
  }
}

async function obtenerBatchPlaneaciones(batchId) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesBatch(batchId, session.access_token);
}

async function obtenerPlaneacionDetalle(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesGet(id, session.access_token);
}

function normalizarPlaneacionTemaPayload(payload) {
  if (!payload) return null;
  if (Array.isArray(payload)) return payload[0] || null;
  if (Array.isArray(payload.items)) return payload.items[0] || null;
  if (payload.planeacion) return payload.planeacion;
  return payload;
}

async function obtenerPlaneacionPorTema(temaId) {
  const session = await window.requireSession();
  if (!session) return null;

  const payload = await apiPlaneacionesByTema(temaId, session.access_token);
  return normalizarPlaneacionTemaPayload(payload);
}

async function actualizarPlaneacion(id, payload) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesUpdate(id, payload, session.access_token);
}

async function exportarPlaneacionExcel(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesExportExcel(id, session.access_token);
}

window.obtenerPlaneaciones = obtenerPlaneaciones;
window.registerArchivedHierarchyScope = registerArchivedHierarchyScope;
window.restoreArchivedHierarchyScope = restoreArchivedHierarchyScope;
window.restoreArchivedHierarchyScopeByPlaneacionId = restoreArchivedHierarchyScopeByPlaneacionId;
window.restoreArchivedHierarchyScopeByBatchId = restoreArchivedHierarchyScopeByBatchId;
window.isArchivedHierarchyScopeHidden = isArchivedHierarchyScopeHidden;
window.getArchivedHierarchyRegistrySnapshot = getArchivedHierarchyRegistrySnapshot;
window.restoreArchivedHierarchyBranch = restoreArchivedHierarchyBranch;
window.eliminarPlaneacionApi = eliminarPlaneacionApi;
window.archivarPlaneacionApi = archivarPlaneacionApi;
window.restaurarPlaneacionApi = restaurarPlaneacionApi;
window.archivarRutaBatchApi = archivarRutaBatchApi;
window.restaurarRutaBatchApi = restaurarRutaBatchApi;
window.obtenerArchivadosPlaneaciones = obtenerArchivadosPlaneaciones;
window.eliminarPlaneacionPermanentementeApi = eliminarPlaneacionPermanentementeApi;
window.eliminarRutaBatchPermanentementeApi = eliminarRutaBatchPermanentementeApi;
window.generarPlaneacionApi = generarPlaneacionApi;
window.generarPlaneacionApiConProgreso = generarPlaneacionApiConProgreso;
window.obtenerBatchPlaneaciones = obtenerBatchPlaneaciones;
window.obtenerPlaneacionDetalle = obtenerPlaneacionDetalle;
window.obtenerPlaneacionPorTema = obtenerPlaneacionPorTema;
window.actualizarPlaneacion = actualizarPlaneacion;
window.exportarPlaneacionExcel = exportarPlaneacionExcel;
