const archivedState = {
  loading: false,
  error: "",
  filter: "all",
  search: "",
  sort: "recent",
  expandedBranches: new Set(),
  data: {
    total: 0,
    total_routes: 0,
    total_planeaciones: 0,
    branches: []
  },
  confirm: {
    open: false,
    action: null,
    id: null,
    title: "",
    message: "",
    warning: "",
    submitLabel: "Confirmar",
    busyLabel: "Procesando...",
    submitTone: "danger",
    busy: false
  }
};

const ARCHIVED_SCOPE_ORDER = ["plantel", "grado", "materia", "unidad"];
const ARCHIVED_HIDDEN_COLLECTIONS = {
  plantel: "planteles",
  grado: "grados",
  materia: "materias",
  unidad: "unidades"
};
const ARCHIVED_LEVEL_LABELS = {
  plantel: "Plantel",
  grado: "Grado",
  materia: "Materia",
  unidad: "Unidad",
  planeacion: "Planeacion"
};
const ARCHIVED_ROOT_BADGES = {
  plantel: "Plantel archivado",
  grado: "Grado archivado",
  materia: "Materia archivada",
  unidad: "Unidad archivada",
  batch: "Ruta archivada",
  planeacion: "Planeacion archivada"
};

let isArchivadosBound = false;

function normalizeArchivedText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function formatArchivedDate(value) {
  if (!value) return "Sin fecha";

  try {
    return new Date(value).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric"
    });
  } catch {
    return "Sin fecha";
  }
}

function buildArchivedTitle(item) {
  return (
    normalizeArchivedText(item?.custom_title) ||
    normalizeArchivedText(item?.tema_nombre) ||
    normalizeArchivedText(item?.tema) ||
    "Planeacion sin titulo"
  );
}

function buildArchivedFullPath(item) {
  return [
    item?.plantel_nombre,
    item?.grado_nombre,
    item?.materia_nombre,
    item?.unidad_nombre
  ]
    .map(normalizeArchivedText)
    .filter(Boolean)
    .join(" > ") || "Ruta no disponible";
}

function compareArchivedByDate(a, b) {
  const valueA = new Date(a?.archived_at || 0).getTime();
  const valueB = new Date(b?.archived_at || 0).getTime();

  if (archivedState.sort === "oldest") {
    return valueA - valueB;
  }

  return valueB - valueA;
}

function getArchivedRegistrySnapshot() {
  if (typeof window.getArchivedHierarchyRegistrySnapshot === "function") {
    return window.getArchivedHierarchyRegistrySnapshot();
  }

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

function buildArchivedScopeKey(scope) {
  const type = normalizeArchivedText(scope?.type).toLowerCase();
  const id = normalizeArchivedText(scope?.id);
  if (!type || !id) return "";
  return `${type}:${id}`;
}

function getArchivedScopeRecord(scope, registry) {
  const scopeKey = buildArchivedScopeKey(scope);
  if (!scopeKey) return null;

  const scopes = registry?.scopes && typeof registry.scopes === "object"
    ? registry.scopes
    : {};

  return scopes[scopeKey] || null;
}

function buildScopeDescriptorFromRecord(record) {
  const type = normalizeArchivedText(record?.type).toLowerCase();
  const id = normalizeArchivedText(record?.id);

  if (!ARCHIVED_LEVEL_LABELS[type] || !id || type === "planeacion") {
    return null;
  }

  const label =
    normalizeArchivedText(record?.label) ||
    normalizeArchivedText(record?.[`${type}_nombre`]) ||
    ARCHIVED_LEVEL_LABELS[type];

  return {
    key: `scope:${type}:${id}`,
    kind: "scope",
    root: {
      type,
      id,
      label
    },
    title: label,
    meta: record
  };
}

function flattenArchivedPayload(payload) {
  const routeItems = Array.isArray(payload?.routes)
    ? payload.routes.flatMap((route) => (Array.isArray(route?.planeaciones) ? route.planeaciones : []))
    : [];
  const looseItems = Array.isArray(payload?.planeaciones) ? payload.planeaciones : [];
  const seen = new Set();

  return [...routeItems, ...looseItems].filter((item) => {
    const id = String(item?.id || "").trim();
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

function buildBatchCounts(items) {
  const counts = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const batchId = normalizeArchivedText(item?.batch_id);
    if (!batchId) return;
    counts.set(batchId, (counts.get(batchId) || 0) + 1);
  });

  return counts;
}

function getHighestHiddenScope(item, registry) {
  const hidden = registry?.hidden || {};

  for (const level of ARCHIVED_SCOPE_ORDER) {
    const id = normalizeArchivedText(item?.[`${level}_id`]);
    const collectionKey = ARCHIVED_HIDDEN_COLLECTIONS[level];
    const hiddenIds = Array.isArray(hidden?.[collectionKey]) ? hidden[collectionKey] : [];

    if (id && hiddenIds.includes(id)) {
      const scopeRecord = getArchivedScopeRecord({ type: level, id }, registry);
      return {
        type: level,
        id,
        label:
          normalizeArchivedText(scopeRecord?.label) ||
          normalizeArchivedText(item?.[`${level}_nombre`]) ||
          ARCHIVED_LEVEL_LABELS[level],
        meta: scopeRecord || null
      };
    }
  }

  return null;
}

function buildBranchDescriptor(item, registry, batchCounts) {
  const hiddenScope = getHighestHiddenScope(item, registry);

  if (hiddenScope) {
    return {
      key: `scope:${hiddenScope.type}:${hiddenScope.id}`,
      kind: "scope",
      root: hiddenScope,
      title: hiddenScope.label || ARCHIVED_LEVEL_LABELS[hiddenScope.type],
      meta: hiddenScope.meta || null
    };
  }

  const batchId = normalizeArchivedText(item?.batch_id);
  if (batchId && (batchCounts.get(batchId) || 0) > 1) {
    return {
      key: `batch:${batchId}`,
      kind: "batch",
      root: {
        type: "batch",
        id: batchId,
        label: buildArchivedFullPath(item)
      },
      title: buildArchivedFullPath(item),
      batchId
    };
  }

  return {
    key: `planeacion:${item.id}`,
    kind: "planeacion",
    root: {
      type: "planeacion",
      id: String(item.id),
      label: buildArchivedTitle(item)
    },
    title: buildArchivedTitle(item)
  };
}

function createTreeContainer() {
  return {
    children: [],
    childMap: new Map()
  };
}

function createBranchState(descriptor) {
  return {
    key: descriptor.key,
    kind: descriptor.kind,
    root: descriptor.root,
    title: descriptor.title,
    batch_id: descriptor.batchId || null,
    meta: descriptor.meta || null,
    archived_at: null,
    items: [],
    planeacionIds: [],
    treeRoot: createTreeContainer(),
    searchText: "",
    structureLoaded: descriptor.kind !== "scope",
    structureLoading: false,
    structureError: ""
  };
}

function createTreeNode(entry) {
  return {
    key: `${entry.type}:${entry.id || entry.label}`,
    type: entry.type,
    id: entry.id || null,
    label: entry.label || ARCHIVED_LEVEL_LABELS[entry.type] || "Elemento",
    item: entry.item || null,
    children: [],
    childMap: new Map()
  };
}

function ensureTreeChild(parent, entry) {
  const key = `${entry.type}:${entry.id || entry.label}`;

  if (!parent.childMap.has(key)) {
    const node = createTreeNode(entry);
    parent.childMap.set(key, node);
    parent.children.push(node);
  }

  return parent.childMap.get(key);
}

function createTreeContainerFromNodes(nodes = []) {
  const container = createTreeContainer();

  (Array.isArray(nodes) ? nodes : []).forEach((node) => {
    if (!node?.key) return;

    if (!(node.childMap instanceof Map)) {
      node.childMap = new Map(
        (Array.isArray(node.children) ? node.children : []).map((child) => [child.key, child])
      );
    }

    container.childMap.set(node.key, node);
    container.children.push(node);
  });

  return container;
}

function mergeStructureNodesIntoParent(parent, nodes = []) {
  (Array.isArray(nodes) ? nodes : []).forEach((node) => {
    const merged = ensureTreeChild(parent, {
      type: node.type,
      id: node.id,
      label: node.label
    });

    mergeStructureNodesIntoParent(merged, node.children || []);
  });
}

function sortArchivedHierarchyNodes(items) {
  return [...(Array.isArray(items) ? items : [])].sort((a, b) => {
    const orderA = Number.isFinite(Number(a?.orden)) ? Number(a.orden) : 999999;
    const orderB = Number.isFinite(Number(b?.orden)) ? Number(b.orden) : 999999;
    if (orderA !== orderB) return orderA - orderB;

    const nameA = normalizeArchivedText(a?.grado_nombre || a?.nombre || a?.titulo).toLowerCase();
    const nameB = normalizeArchivedText(b?.grado_nombre || b?.nombre || b?.titulo).toLowerCase();
    return nameA.localeCompare(nameB, "es");
  });
}

async function loadArchivedMateriaStructure(materiaId) {
  const unidades = sortArchivedHierarchyNodes(await obtenerUnidadesPorMateria(materiaId));

  return unidades.map((unidad) => ({
    type: "unidad",
    id: unidad.id,
    label: normalizeArchivedText(unidad?.nombre) || "Unidad",
    children: []
  }));
}

async function loadArchivedGradoStructure(gradoId) {
  const materias = sortArchivedHierarchyNodes(await obtenerMateriasPorGrado(gradoId));
  const nodes = [];

  for (const materia of materias) {
    nodes.push({
      type: "materia",
      id: materia.id,
      label: normalizeArchivedText(materia?.nombre) || "Materia",
      children: await loadArchivedMateriaStructure(materia.id)
    });
  }

  return nodes;
}

async function loadArchivedPlantelStructure(plantelId) {
  const grados = sortArchivedHierarchyNodes(await obtenerGradosPorPlantel(plantelId));
  const nodes = [];

  for (const grado of grados) {
    nodes.push({
      type: "grado",
      id: grado.id,
      label: normalizeArchivedText(grado?.grado_nombre || grado?.nombre) || "Grado",
      children: await loadArchivedGradoStructure(grado.id)
    });
  }

  return nodes;
}

async function loadScopeStructureNodes(branch) {
  const scopeType = normalizeArchivedText(branch?.root?.type).toLowerCase();
  const scopeId = normalizeArchivedText(branch?.root?.id);

  if (!scopeType || !scopeId) {
    return [];
  }

  if (scopeType === "plantel") {
    return loadArchivedPlantelStructure(scopeId);
  }

  if (scopeType === "grado") {
    return loadArchivedGradoStructure(scopeId);
  }

  if (scopeType === "materia") {
    return loadArchivedMateriaStructure(scopeId);
  }

  return [];
}

async function ensureBranchStructure(branch) {
  if (!branch || branch.kind !== "scope" || branch.structureLoaded || branch.structureLoading) {
    return;
  }

  branch.structureLoading = true;
  branch.structureError = "";
  renderArchivadosContent();

  try {
    const nodes = await loadScopeStructureNodes(branch);
    const root = createTreeContainerFromNodes(branch.tree || []);
    mergeStructureNodesIntoParent(root, nodes);
    branch.tree = root.children;
    branch.structureLoaded = true;
  } catch (error) {
    branch.structureError = error?.message || "No se pudo cargar el contenido de la rama.";
  } finally {
    branch.structureLoading = false;
    renderArchivadosContent();
  }
}

function buildTreeEntriesForBranch(branch, item) {
  const leafEntry = {
    type: "planeacion",
    id: String(item.id),
    label: buildArchivedTitle(item),
    item
  };

  const gradoEntry = normalizeArchivedText(item?.grado_id) && normalizeArchivedText(item?.grado_nombre)
    ? { type: "grado", id: item.grado_id, label: item.grado_nombre }
    : null;
  const materiaEntry = normalizeArchivedText(item?.materia_id) && normalizeArchivedText(item?.materia_nombre)
    ? { type: "materia", id: item.materia_id, label: item.materia_nombre }
    : null;
  const unidadEntry = normalizeArchivedText(item?.unidad_id) && normalizeArchivedText(item?.unidad_nombre)
    ? { type: "unidad", id: item.unidad_id, label: item.unidad_nombre }
    : null;

  if (branch.root.type === "plantel") {
    return [gradoEntry, materiaEntry, unidadEntry, leafEntry].filter(Boolean);
  }

  if (branch.root.type === "grado") {
    return [materiaEntry, unidadEntry, leafEntry].filter(Boolean);
  }

  if (branch.root.type === "materia") {
    return [unidadEntry, leafEntry].filter(Boolean);
  }

  if (branch.root.type === "unidad") {
    return [leafEntry];
  }

  if (branch.root.type === "batch") {
    return [gradoEntry, materiaEntry, unidadEntry, leafEntry].filter(Boolean);
  }

  return [leafEntry];
}

function addItemToBranchTree(branch, item) {
  let current = branch.treeRoot;

  buildTreeEntriesForBranch(branch, item).forEach((entry) => {
    current = ensureTreeChild(current, entry);
  });
}

function countDistinctItems(items, key) {
  return new Set(
    (Array.isArray(items) ? items : [])
      .map((item) => normalizeArchivedText(item?.[key]))
      .filter(Boolean)
  ).size;
}

function buildBranchCopy(branch) {
  if (branch.kind === "planeacion") {
    const item = branch.items[0] || null;
    return item ? buildArchivedFullPath(item) : "Planeacion archivada individual.";
  }

  if (branch.kind === "batch") {
    return `Batch ${branch.batch_id || "-"} con ${branch.items.length} planeacion(es) archivadas.`;
  }

  if (branch.kind === "scope" && branch.items.length === 0) {
    return "Rama archivada sin planeaciones hijas registradas.";
  }

  if (branch.root.type === "plantel") {
    return `${countDistinctItems(branch.items, "grado_id")} grado(s) y ${branch.items.length} planeacion(es) archivadas en este plantel.`;
  }

  if (branch.root.type === "grado") {
    return `${countDistinctItems(branch.items, "materia_id")} materia(s) y ${branch.items.length} planeacion(es) archivadas en este grado.`;
  }

  if (branch.root.type === "materia") {
    return `${countDistinctItems(branch.items, "unidad_id")} unidad(es) y ${branch.items.length} planeacion(es) archivadas en esta materia.`;
  }

  if (branch.root.type === "unidad") {
    return `${branch.items.length} planeacion(es) archivadas en esta unidad.`;
  }

  return `${branch.items.length} elemento(s) archivados.`;
}

function buildBranchSearchText(branch) {
  const parts = [
    branch.title,
    ARCHIVED_ROOT_BADGES[branch.root.type] || "",
    buildBranchCopy(branch)
  ];

  if (branch.meta) {
    parts.push(
      branch.meta.plantel_nombre,
      branch.meta.grado_nombre,
      branch.meta.materia_nombre,
      branch.meta.unidad_nombre,
      branch.meta.label
    );
  }

  branch.items.forEach((item) => {
    parts.push(
      buildArchivedTitle(item),
      buildArchivedFullPath(item),
      item?.tema_nombre,
      item?.tema,
      item?.batch_id
    );
  });

  return parts
    .map((value) => normalizeArchivedText(value).toLowerCase())
    .filter(Boolean)
    .join(" ");
}

function finalizeBranch(branch) {
  branch.archived_at = [...branch.items]
    .map((item) => item?.archived_at)
    .filter(Boolean)
    .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0] ||
    branch.meta?.archived_at ||
    null;
  branch.planeacionIds = [...new Set(branch.items.map((item) => String(item.id)).filter(Boolean))];
  branch.copy = buildBranchCopy(branch);
  branch.searchText = buildBranchSearchText(branch);
  branch.tree = branch.treeRoot.children;
  delete branch.treeRoot;
}

function buildArchivedBranches(items) {
  const registry = getArchivedRegistrySnapshot();
  const batchCounts = buildBatchCounts(items);
  const branchMap = new Map();

  (Array.isArray(items) ? items : []).forEach((item) => {
    const descriptor = buildBranchDescriptor(item, registry, batchCounts);

    if (!branchMap.has(descriptor.key)) {
      branchMap.set(descriptor.key, createBranchState(descriptor));
    }

    const branch = branchMap.get(descriptor.key);
    branch.items.push(item);

    if (branch.kind !== "planeacion") {
      addItemToBranchTree(branch, item);
    }
  });

  Object.values(registry?.scopes || {}).forEach((scopeRecord) => {
    const descriptor = buildScopeDescriptorFromRecord(scopeRecord);
    if (!descriptor) return;

    if (!branchMap.has(descriptor.key)) {
      branchMap.set(descriptor.key, createBranchState(descriptor));
      return;
    }

    const branch = branchMap.get(descriptor.key);
    branch.meta = descriptor.meta || branch.meta;
    branch.root = descriptor.root || branch.root;
    branch.title = descriptor.title || branch.title;
  });

  return [...branchMap.values()]
    .map((branch) => {
      finalizeBranch(branch);
      return branch;
    })
    .sort(compareArchivedByDate);
}

function matchesArchivedSearch(branch) {
  const query = normalizeArchivedText(archivedState.search).toLowerCase();
  if (!query) return true;
  return normalizeArchivedText(branch?.searchText).includes(query);
}

function getVisibleRouteBranches() {
  return archivedState.data.branches
    .filter((branch) => branch.kind !== "planeacion")
    .filter(matchesArchivedSearch)
    .sort(compareArchivedByDate);
}

function getVisiblePlaneacionBranches() {
  return archivedState.data.branches
    .filter((branch) => branch.kind === "planeacion")
    .filter(matchesArchivedSearch)
    .sort(compareArchivedByDate);
}

function setArchivadosFeedback(message, tone = "info") {
  const box = document.getElementById("archivados-feedback");
  if (!box) return;

  if (!message) {
    box.className = "hidden border-b px-4 py-3 text-sm sm:px-5";
    box.textContent = "";
    return;
  }

  const toneMap = {
    info: "border-slate-200 bg-white text-slate-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    danger: "border-rose-200 bg-rose-50 text-rose-700"
  };

  box.className = `border-b px-4 py-3 text-sm sm:px-5 ${toneMap[tone] || toneMap.info}`;
  box.textContent = message;
}

function renderArchivadosSidebar() {
  const sidebar = document.getElementById("archivados-sidebar");
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="space-y-4">
      <section class="archivados-sidebar-card">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Filtros</p>
        <div class="mt-4 archivados-tabs">
          <button type="button" class="archivados-tab ${archivedState.filter === "all" ? "is-active" : ""}" data-archived-filter="all">Todo</button>
          <button type="button" class="archivados-tab ${archivedState.filter === "routes" ? "is-active" : ""}" data-archived-filter="routes">Rutas</button>
          <button type="button" class="archivados-tab ${archivedState.filter === "planeaciones" ? "is-active" : ""}" data-archived-filter="planeaciones">Planeaciones</button>
        </div>

        <div class="mt-4 space-y-3">
          <div>
            <label class="archivados-filter-label" for="archivados-search">Buscar</label>
            <input id="archivados-search" class="archivados-input" type="search" placeholder="Tema, ruta o nivel" value="${escapeHtml(archivedState.search)}" />
          </div>
          <div>
            <label class="archivados-filter-label" for="archivados-sort">Orden</label>
            <select id="archivados-sort" class="archivados-select">
              <option value="recent" ${archivedState.sort === "recent" ? "selected" : ""}>Mas recientes</option>
              <option value="oldest" ${archivedState.sort === "oldest" ? "selected" : ""}>Mas antiguos</option>
            </select>
          </div>
        </div>
      </section>

      <section class="archivados-sidebar-card">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Resumen</p>
        <div class="mt-4 archivados-summary-grid">
          <div class="archivados-summary-item">
            <span class="archivados-summary-label">Archivados totales</span>
            <span class="archivados-summary-value">${escapeHtml(String(archivedState.data.total || 0))}</span>
          </div>
          <div class="archivados-summary-item">
            <span class="archivados-summary-label">Ramas archivadas</span>
            <span class="archivados-summary-value">${escapeHtml(String(archivedState.data.total_routes || 0))}</span>
          </div>
          <div class="archivados-summary-item">
            <span class="archivados-summary-label">Planeaciones sueltas</span>
            <span class="archivados-summary-value">${escapeHtml(String(archivedState.data.total_planeaciones || 0))}</span>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderTreeLeaf(item) {
  const title = buildArchivedTitle(item);
  const tema = normalizeArchivedText(item?.tema_nombre) || normalizeArchivedText(item?.tema);
  const subtitle = tema && tema !== title ? tema : buildArchivedFullPath(item);

  return `
    <div class="archivados-leaf">
      <div>
        <span class="archivados-tree-badge">Planeacion</span>
        <p class="archivados-leaf-title">${escapeHtml(title)}</p>
        <p class="archivados-leaf-copy">${escapeHtml(subtitle || "Sin detalle adicional")}</p>
      </div>
      <div class="text-right">
        <p class="text-xs uppercase tracking-wide text-slate-400">Archivada</p>
        <p class="mt-1 text-sm font-semibold text-slate-700">${escapeHtml(formatArchivedDate(item?.archived_at))}</p>
      </div>
    </div>
  `;
}

function renderTreeNode(node) {
  if (node.type === "planeacion") {
    return renderTreeLeaf(node.item);
  }

  return `
    <div class="archivados-tree-node">
      <div class="archivados-tree-header">
        <span class="archivados-tree-badge">${escapeHtml(ARCHIVED_LEVEL_LABELS[node.type] || "Nivel")}</span>
        <p class="archivados-tree-title">${escapeHtml(node.label || "Sin nombre")}</p>
      </div>
      <div class="archivados-tree-children">
        ${node.children.map(renderTreeNode).join("")}
      </div>
    </div>
  `;
}

function renderBranchTree(branch) {
  if (branch.kind === "planeacion") {
    const item = branch.items[0] || null;
    return item ? renderTreeLeaf(item) : "";
  }

  if (branch.structureLoading && (!Array.isArray(branch.tree) || branch.tree.length === 0)) {
    return `
      <div class="archivados-tree-shell">
        <div class="archivados-tree-empty">
          Cargando contenido de la rama...
        </div>
      </div>
    `;
  }

  if (branch.structureError && (!Array.isArray(branch.tree) || branch.tree.length === 0)) {
    return `
      <div class="archivados-tree-shell">
        <div class="archivados-tree-empty">
          ${escapeHtml(branch.structureError)}
        </div>
      </div>
    `;
  }

  if (!Array.isArray(branch.tree) || branch.tree.length === 0) {
    return `
      <div class="archivados-tree-shell">
        <div class="archivados-tree-empty">
          Esta rama no tiene planeaciones archivadas dentro.
        </div>
      </div>
    `;
  }

  return `
    <div class="archivados-tree-shell">
      ${branch.tree.map(renderTreeNode).join("")}
    </div>
  `;
}

function renderBranchActions(branch) {
  if (branch.kind === "planeacion") {
    const item = branch.items[0] || null;
    if (!item) return "";

    return `
      <div class="archivados-actions">
        <button type="button" class="archivados-btn restore" data-action="restore-planeacion" data-planeacion-id="${escapeHtml(String(item.id))}">
          Restaurar
        </button>
        <button type="button" class="archivados-btn permanent" data-action="permanent-planeacion" data-planeacion-id="${escapeHtml(String(item.id))}">
          Eliminar definitivamente
        </button>
      </div>
    `;
  }

  const expanded = archivedState.expandedBranches.has(branch.key);

  return `
    <div class="archivados-actions">
      <button type="button" class="archivados-btn" data-action="toggle-branch" data-branch-key="${escapeHtml(branch.key)}">
        ${branch.structureLoading ? "Cargando..." : expanded ? "Ocultar contenido" : "Ver contenido"}
      </button>
      <button type="button" class="archivados-btn restore" data-action="restore-branch" data-branch-key="${escapeHtml(branch.key)}">
        Restaurar rama
      </button>
      <button type="button" class="archivados-btn permanent" data-action="permanent-branch" data-branch-key="${escapeHtml(branch.key)}">
        Eliminar definitivamente
      </button>
    </div>
  `;
}

function renderBranchCard(branch) {
  const expanded = archivedState.expandedBranches.has(branch.key);

  return `
    <article class="archivados-card">
      <div class="archivados-card-header">
        <div>
          <span class="archivados-badge">${escapeHtml(ARCHIVED_ROOT_BADGES[branch.root.type] || "Archivado")}</span>
          <h2 class="archivados-card-title">${escapeHtml(branch.title || "Sin titulo")}</h2>
          <p class="archivados-card-copy">${escapeHtml(branch.copy || "")}</p>
        </div>
        <div class="text-right">
          <p class="text-xs uppercase tracking-wide text-slate-400">Archivada</p>
          <p class="mt-1 text-sm font-semibold text-slate-700">${escapeHtml(formatArchivedDate(branch.archived_at))}</p>
        </div>
      </div>

      <div class="archivados-meta-grid">
        <div class="archivados-meta-item">
          <span class="archivados-meta-label">Nivel raiz</span>
          <span class="archivados-meta-value">${escapeHtml(ARCHIVED_LEVEL_LABELS[branch.root.type] || "Ruta")}</span>
        </div>
        <div class="archivados-meta-item">
          <span class="archivados-meta-label">Planeaciones</span>
          <span class="archivados-meta-value">${escapeHtml(String(branch.items.length))}</span>
        </div>
        <div class="archivados-meta-item">
          <span class="archivados-meta-label">Actualizacion</span>
          <span class="archivados-meta-value">${escapeHtml(formatArchivedDate(branch.archived_at))}</span>
        </div>
      </div>

      ${renderBranchActions(branch)}

      ${expanded ? renderBranchTree(branch) : ""}
    </article>
  `;
}

function renderArchivadosContent() {
  const content = document.getElementById("archivados-content");
  if (!content) return;

  if (archivedState.loading) {
    content.innerHTML = '<p class="text-sm text-slate-500">Cargando archivados...</p>';
    return;
  }

  if (archivedState.error) {
    content.innerHTML = `
      <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
        ${escapeHtml(archivedState.error)}
      </div>
    `;
    return;
  }

  const routeBranches = archivedState.filter === "planeaciones" ? [] : getVisibleRouteBranches();
  const planeacionBranches = archivedState.filter === "routes" ? [] : getVisiblePlaneacionBranches();

  if (routeBranches.length === 0 && planeacionBranches.length === 0) {
    content.innerHTML = `
      <div class="archivados-empty">
        <p class="text-base font-semibold text-slate-900">No hay elementos archivados para mostrar.</p>
        <p class="mt-2 text-sm text-slate-600">Cuando archives una planeacion o una rama jerarquica, aparecera aqui para restaurarse o eliminarse definitivamente.</p>
      </div>
    `;
    return;
  }

  const sections = [];

  if (routeBranches.length > 0) {
    sections.push(`
      <section class="archivados-section">
        <h2 class="archivados-section-title">Ramas archivadas</h2>
        <div class="archivados-list">
          ${routeBranches.map(renderBranchCard).join("")}
        </div>
      </section>
    `);
  }

  if (planeacionBranches.length > 0) {
    sections.push(`
      <section class="archivados-section">
        <h2 class="archivados-section-title">Planeaciones archivadas</h2>
        <div class="archivados-list">
          ${planeacionBranches.map(renderBranchCard).join("")}
        </div>
      </section>
    `);
  }

  content.innerHTML = sections.join("");
}

function renderConfirmModal() {
  const modal = document.getElementById("delete-confirm-modal");
  const eyebrow = document.getElementById("delete-confirm-eyebrow");
  const title = document.getElementById("delete-confirm-title");
  const message = document.getElementById("delete-confirm-message");
  const warning = document.getElementById("delete-confirm-warning");
  const error = document.getElementById("delete-confirm-error");
  const submit = document.getElementById("delete-confirm-submit");
  const cancel = document.getElementById("delete-confirm-cancel");
  const close = document.getElementById("delete-confirm-close");

  if (!modal || !eyebrow || !title || !message || !warning || !error || !submit || !cancel || !close) {
    return;
  }

  modal.classList.toggle("hidden", !archivedState.confirm.open);

  if (!archivedState.confirm.open) {
    error.classList.add("hidden");
    warning.classList.add("hidden");
    error.textContent = "";
    warning.textContent = "";
    return;
  }

  eyebrow.textContent = archivedState.confirm.submitTone === "restore"
    ? "Recuperar elemento"
    : "Accion permanente";
  eyebrow.dataset.tone = archivedState.confirm.submitTone;
  title.textContent = archivedState.confirm.title;
  message.textContent = archivedState.confirm.message;

  if (archivedState.confirm.warning) {
    warning.classList.remove("hidden");
    warning.dataset.tone = archivedState.confirm.submitTone;
    warning.textContent = archivedState.confirm.warning;
  } else {
    warning.classList.add("hidden");
    warning.textContent = "";
  }

  if (archivedState.confirm.error) {
    error.classList.remove("hidden");
    error.textContent = archivedState.confirm.error;
  } else {
    error.classList.add("hidden");
    error.textContent = "";
  }

  submit.dataset.tone = archivedState.confirm.submitTone;
  submit.textContent = archivedState.confirm.busy
    ? archivedState.confirm.busyLabel
    : archivedState.confirm.submitLabel;
  submit.disabled = archivedState.confirm.busy;
  cancel.disabled = archivedState.confirm.busy;
  close.disabled = archivedState.confirm.busy;
}

function openConfirm(config) {
  archivedState.confirm = {
    open: true,
    action: config.action,
    id: config.id,
    title: config.title,
    message: config.message,
    warning: config.warning || "",
    submitLabel: config.submitLabel,
    busyLabel: config.busyLabel,
    submitTone: config.submitTone,
    busy: false,
    error: ""
  };

  renderConfirmModal();
}

function closeConfirm({ force = false } = {}) {
  if (archivedState.confirm.busy && !force) return;

  archivedState.confirm = {
    open: false,
    action: null,
    id: null,
    title: "",
    message: "",
    warning: "",
    submitLabel: "Confirmar",
    busyLabel: "Procesando...",
    submitTone: "danger",
    busy: false,
    error: ""
  };

  renderConfirmModal();
}

function findBranchByKey(key) {
  return archivedState.data.branches.find((branch) => branch.key === key) || null;
}

function getConfirmConfig(action, element) {
  const planeacionId = element.getAttribute("data-planeacion-id");
  const branchKey = element.getAttribute("data-branch-key");
  const branch = branchKey ? findBranchByKey(branchKey) : null;

  if (action === "restore-planeacion") {
    return {
      action,
      id: planeacionId,
      title: "Restaurar elemento?",
      message: "El elemento volvera a aparecer en tus vistas activas.",
      submitLabel: "Si, restaurar",
      busyLabel: "Restaurando...",
      submitTone: "restore"
    };
  }

  if (action === "restore-branch" && branch) {
    const warning =
      branch.items.length > 0
        ? `Se restauraran ${branch.items.length} planeacion(es) archivadas dentro de esta rama.`
        : "La rama archivada volvera a mostrarse en tus vistas activas.";

    return {
      action,
      id: branch.key,
      title: "Restaurar elemento?",
      message: "La rama volvera a aparecer en tus vistas activas.",
      warning,
      submitLabel: "Si, restaurar",
      busyLabel: "Restaurando...",
      submitTone: "restore"
    };
  }

  if (action === "permanent-planeacion") {
    return {
      action,
      id: planeacionId,
      title: "Eliminar permanentemente?",
      message: "Esta accion no se puede deshacer.",
      submitLabel: "Si, eliminar",
      busyLabel: "Eliminando...",
      submitTone: "danger"
    };
  }

  if (action === "permanent-branch" && branch) {
    const warning =
      branch.kind === "scope"
        ? branch.items.length > 0
          ? `Se eliminara definitivamente esta rama y ${branch.items.length} planeacion(es) hijas en la base de datos.`
          : "Se eliminara definitivamente esta rama de la base de datos."
        : `Se eliminaran definitivamente ${branch.items.length} planeacion(es) de esta rama.`;

    return {
      action,
      id: branch.key,
      title: "Eliminar permanentemente?",
      message: "Esta accion no se puede deshacer.",
      warning,
      submitLabel: "Si, eliminar",
      busyLabel: "Eliminando...",
      submitTone: "danger"
    };
  }

  return null;
}

async function loadArchivedData() {
  archivedState.loading = true;
  archivedState.error = "";
  renderArchivadosSidebar();
  renderArchivadosContent();

  try {
    const payload = await obtenerArchivadosPlaneaciones();
    const items = flattenArchivedPayload(payload);
    const branches = buildArchivedBranches(items);
    const scopeOnlyCount = branches.filter(
      (branch) => branch.kind === "scope" && branch.items.length === 0
    ).length;

    archivedState.data = {
      total: items.length + scopeOnlyCount,
      total_routes: branches.filter((branch) => branch.kind !== "planeacion").length,
      total_planeaciones: branches.filter((branch) => branch.kind === "planeacion").length,
      branches
    };
  } catch (error) {
    archivedState.error = error?.message || "No se pudieron cargar los archivados.";
  } finally {
    archivedState.loading = false;
    renderArchivadosSidebar();
    renderArchivadosContent();
  }
}

async function runPlaneacionAction(items, actionFn) {
  const seen = new Set();

  for (const item of Array.isArray(items) ? items : []) {
    const id = String(item?.id || "").trim();
    if (!id || seen.has(id)) continue;
    seen.add(id);
    await actionFn(id);
  }
}

async function permanentDeleteHierarchyBranch(branch) {
  const scopeType = normalizeArchivedText(branch?.root?.type).toLowerCase();
  const scopeId = normalizeArchivedText(branch?.root?.id);

  if (!scopeType || !scopeId) {
    throw new Error("No se pudo identificar la rama a eliminar.");
  }

  if (scopeType === "plantel" && typeof eliminarPlantel === "function") {
    await eliminarPlantel(scopeId);
  } else if (scopeType === "grado" && typeof eliminarGrado === "function") {
    await eliminarGrado(scopeId);
  } else if (scopeType === "materia" && typeof eliminarMateria === "function") {
    await eliminarMateria(scopeId);
  } else if (scopeType === "unidad" && typeof eliminarUnidad === "function") {
    await eliminarUnidad(scopeId);
  } else {
    throw new Error("No se pudo eliminar la rama jerarquica seleccionada.");
  }

  if (typeof window.restoreArchivedHierarchyBranch === "function") {
    window.restoreArchivedHierarchyBranch(
      {
        type: scopeType,
        id: scopeId
      },
      branch.items
    );
  }
}

async function restoreBranch(branch) {
  if (!branch) return;

  if (branch.kind === "batch" && branch.batch_id) {
    await restaurarRutaBatchApi(branch.batch_id);
    if (typeof window.restoreArchivedHierarchyScopeByBatchId === "function") {
      window.restoreArchivedHierarchyScopeByBatchId(branch.batch_id);
    }
    return;
  }

  await runPlaneacionAction(branch.items, (id) => restaurarPlaneacionApi(id));

  if (branch.kind === "scope" && typeof window.restoreArchivedHierarchyBranch === "function") {
    window.restoreArchivedHierarchyBranch(
      {
        type: branch.root.type,
        id: branch.root.id
      },
      branch.items
    );
  }
}

async function permanentDeleteBranch(branch) {
  if (!branch) return;

  if (branch.kind === "batch" && branch.batch_id) {
    await eliminarRutaBatchPermanentementeApi(branch.batch_id);
    if (typeof window.restoreArchivedHierarchyScopeByBatchId === "function") {
      window.restoreArchivedHierarchyScopeByBatchId(branch.batch_id);
    }
    return;
  }

  if (branch.kind === "scope") {
    await permanentDeleteHierarchyBranch(branch);
    return;
  }

  await runPlaneacionAction(branch.items, (id) => eliminarPlaneacionPermanentementeApi(id));
}

async function submitConfirm() {
  if (!archivedState.confirm.open || archivedState.confirm.busy || !archivedState.confirm.action || !archivedState.confirm.id) {
    return;
  }

  archivedState.confirm.busy = true;
  archivedState.confirm.error = "";
  renderConfirmModal();

  try {
    if (archivedState.confirm.action === "restore-planeacion") {
      await restaurarPlaneacionApi(archivedState.confirm.id);
      if (typeof window.restoreArchivedHierarchyScopeByPlaneacionId === "function") {
        window.restoreArchivedHierarchyScopeByPlaneacionId(archivedState.confirm.id);
      }
      setArchivadosFeedback("La planeacion fue restaurada correctamente.", "success");
    } else if (archivedState.confirm.action === "restore-branch") {
      const branch = findBranchByKey(archivedState.confirm.id);
      await restoreBranch(branch);
      setArchivadosFeedback("La rama fue restaurada correctamente.", "success");
    } else if (archivedState.confirm.action === "permanent-planeacion") {
      await eliminarPlaneacionPermanentementeApi(archivedState.confirm.id);
      if (typeof window.restoreArchivedHierarchyScopeByPlaneacionId === "function") {
        window.restoreArchivedHierarchyScopeByPlaneacionId(archivedState.confirm.id);
      }
      setArchivadosFeedback("La planeacion fue eliminada definitivamente.", "success");
    } else if (archivedState.confirm.action === "permanent-branch") {
      const branch = findBranchByKey(archivedState.confirm.id);
      await permanentDeleteBranch(branch);
      setArchivadosFeedback("La rama archivada fue eliminada definitivamente.", "success");
    }

    closeConfirm({ force: true });
    await loadArchivedData();
  } catch (error) {
    archivedState.confirm.busy = false;
    archivedState.confirm.error = error?.message || "No se pudo completar la accion.";
    renderConfirmModal();
  }
}

function handleArchivadosSidebarInput(event) {
  const target = event.target;
  if (!target) return;

  if (target.id === "archivados-search") {
    archivedState.search = target.value || "";
    renderArchivadosContent();
    return;
  }

  if (target.id === "archivados-sort") {
    archivedState.sort = target.value || "recent";
    renderArchivadosContent();
  }
}

async function handleArchivadosClick(event) {
  const button = event.target.closest("[data-archived-filter], [data-action]");
  if (!button) return;

  const filter = button.getAttribute("data-archived-filter");
  if (filter) {
    archivedState.filter = filter;
    renderArchivadosSidebar();
    renderArchivadosContent();
    return;
  }

  const action = button.getAttribute("data-action");
  if (!action) return;

  if (action === "toggle-branch") {
    const branchKey = button.getAttribute("data-branch-key");
    if (!branchKey) return;
    const branch = findBranchByKey(branchKey);

    if (archivedState.expandedBranches.has(branchKey)) {
      archivedState.expandedBranches.delete(branchKey);
    } else {
      if (branch?.kind === "scope") {
        await ensureBranchStructure(branch);
      }
      archivedState.expandedBranches.add(branchKey);
    }

    renderArchivadosContent();
    return;
  }

  const config = getConfirmConfig(action, button);
  if (!config?.id) return;
  openConfirm(config);
}

function bindArchivadosEvents() {
  if (isArchivadosBound) return;

  document.getElementById("archivados-sidebar")?.addEventListener("click", (event) => {
    handleArchivadosClick(event).catch((error) => {
      console.error("Error en Archivados:", error);
      setArchivadosFeedback("No se pudo completar la accion.", "danger");
    });
  });
  document.getElementById("archivados-sidebar")?.addEventListener("input", handleArchivadosSidebarInput);
  document.getElementById("archivados-sidebar")?.addEventListener("change", handleArchivadosSidebarInput);
  document.getElementById("archivados-content")?.addEventListener("click", (event) => {
    handleArchivadosClick(event).catch((error) => {
      console.error("Error en Archivados:", error);
      setArchivadosFeedback("No se pudo completar la accion.", "danger");
    });
  });

  ["delete-confirm-backdrop", "delete-confirm-close", "delete-confirm-cancel"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeConfirm();
    });
  });

  document.getElementById("delete-confirm-submit")?.addEventListener("click", () => {
    submitConfirm().catch((error) => {
      archivedState.confirm.busy = false;
      archivedState.confirm.error = error?.message || "No se pudo completar la accion.";
      renderConfirmModal();
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && archivedState.confirm.open) {
      closeConfirm();
    }
  });

  isArchivadosBound = true;
}

async function initArchivadosPage() {
  try {
    await (window.initPrivateChrome ? window.initPrivateChrome() : Promise.resolve());
  } catch (error) {
    console.error("Error cargando chrome privado:", error);
  }

  bindArchivadosEvents();
  renderConfirmModal();
  await loadArchivedData();
}

window.initArchivadosPage = initArchivadosPage;
