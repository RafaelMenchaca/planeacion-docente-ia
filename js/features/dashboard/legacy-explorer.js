// =========================================================
// Legacy hierarchical explorer owner
// Fase 8 ? Sesi?n 8.1
// =========================================================

const heroActionsByLevel = {
  root: { label: "+ Crear plantel", action: "create-plantel" },
  plantel: { label: "+ Nuevo grado", action: "create-grado" },
  grado: { label: "+ Nueva materia", action: "create-materia" },
  materia: { label: "+ Nueva unidad", action: "create-unidad" },
  unidad: { label: "+ Agregar temas", action: "focus-staging" }
};

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
    explorerState.examGeneration = { active: false, unidadId: null, jobId: null, status: "idle", message: "", progressCurrent: 0, progressTotal: 0 };
    explorerState.examModal = createExamModalState();
    explorerState.examPreview = { open: false, examenId: null, loading: false, error: "" };
    if (!explorerState.generating) {
      explorerState.progress = { total: 0, completed: 0, items: [], finalMessage: "", finalTone: "info" };
    }
  }

  persistExplorerLocation();
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
  await Promise.all([ensureGrados(plantelId), ensureMaterias(gradoId), ensureUnidades(materiaId), ensureTemas(unidadId), ensureExamenes(unidadId), ensureListasCotejo(unidadId)]);
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
  if (window.BIBLIOTECA_MODE) return;

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
        label: "+ Crear lista de cotejo",
        action: "open-lista-cotejo-modal",
        tone: "neutral"
      },
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

  const savedScroll = tree.scrollTop;
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
  requestAnimationFrame(() => { tree.scrollTop = savedScroll; });
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

function renderNavigableCardTitle(title) {
  return `
    <span class="explorer-list-item-title-row">
      <span class="explorer-list-item-title">${escapeHtml(title || "Sin nombre")}</span>
      <span class="explorer-list-item-cue" aria-hidden="true">&rarr;</span>
    </span>
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
        const planeacionFecha = formatExamDate(planeacion?.fecha_creacion || planeacion?.created_at) || "Sin fecha";

        return `
          <div class="explorer-topic-row">
            <div>
              <p class="text-sm font-semibold text-slate-900">${escapeHtml(tema.titulo || "Tema sin titulo")}</p>
              <p class="mt-1 text-xs text-slate-500">${escapeHtml(planeacionFecha)}</p>
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
          <div class="rounded-lg border border-slate-200 bg-white px-3 py-3">
            <div class="flex items-center gap-4">
              <div class="min-w-0 flex flex-1 items-center gap-4">
                <div class="min-w-0">
                  <p class="truncate text-sm font-medium text-slate-800">${escapeHtml(tema.titulo)}</p>
                  <p class="text-xs text-slate-500">${escapeHtml(String(tema.duracion))} min</p>
                </div>
              </div>
              <button type="button" class="explorer-danger-icon-btn ml-auto shrink-0" data-content-action="remove-staging" data-staging-id="${tema.localId}" title="Quitar tema" aria-label="Quitar tema">
                ${renderTrashIcon()}
              </button>
            </div>
            ${renderActividadesMomentosControl({
              scope: "staging",
              localId: tema.localId,
              actividadesMomentos: tema.actividades_momentos
            })}
            ${"" /* PAUSED: renderImagenesAutomaticasControl({ scope: "staging", localId: tema.localId, generarImagenesEn: tema.generar_imagenes_en }) */}
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
  const listaCotejoHtml = renderListaCotejoSection(unidad.id);

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

            <div id="staging-temas-list" class="mt-4 space-y-2 rounded-xl border border-slate-200 bg-slate-50 p-3">${stagingList}</div>

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

      ${listaCotejoHtml}
      ${examHtml}
      ${progressHtml}
    </div>
  `;
}

function renderExplorerContent() {
  if (window.BIBLIOTECA_MODE && typeof window.renderBibliotecaContent === "function") {
    window.renderBibliotecaContent();
    return;
  }

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
  renderListaCotejoConfirmModal();
  renderListaCotejoPreviewModal();
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

async function handleTreeClick(event) {
  const button = event.target.closest("[data-tree-action]");
  if (!button) return;

  button.blur();
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

  if (action === "preview-lista-cotejo") {
    const listaId = button.getAttribute("data-lista-id");
    if (listaId) openListaCotejoPreview(listaId);
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
  if (action === "open-lista-cotejo-modal") return openListaCotejoModal();

  if (action.startsWith("create-") || action.startsWith("edit-") || action === "focus-staging") {
    return handleCreateAction(action);
  }
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
