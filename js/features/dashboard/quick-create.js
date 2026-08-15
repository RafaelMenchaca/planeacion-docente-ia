(function () {
  // Owner de Quick Create. Conserva explorerState como fuente física única.
  const QUICK_CREATE_NEW_VALUE = "__new__";
  const QUICK_NIVELES_EDUCATIVOS = [
    { value: "primaria", label: "Primaria" },
    { value: "secundaria", label: "Secundaria" },
    { value: "preparatoria", label: "Preparatoria" },
    { value: "universidad", label: "Universidad" }
  ];
  let plantelCombobox = null;
  let tituloConjuntoCombobox = null;
  let gradoCombobox = null;
  let materiaCombobox = null;
  let unidadCombobox = null;

function createQuickCombobox(containerId, opts = {}) {
  const {
    placeholder = "Escribe o selecciona",
    disabledPlaceholder = "Primero completa el campo anterior",
    onChange = null,
    renderItem = null,
    maxResults = null,
    autoSelectExactOnBlur = true,
    getSearchText = null,
    openOnFocus = true,
    openOnClick = true,
    openOnlyWithQuery = false
  } = opts;

  const container = document.getElementById(containerId);
  if (!container) return null;

  let _items = [];
  let _selectedId = null;
  let _isNew = false;
  let _isOpen = false;
  let _disabled = false;

  container.innerHTML = `
    <div class="quick-combobox relative">
      <input
        id="${containerId}-input"
        type="text"
        autocomplete="off"
        class="w-full rounded-lg border border-slate-300 px-3 py-2 pr-8 text-sm focus:border-cyan-600 focus:outline-none disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed"
        placeholder="${escapeHtml(placeholder)}"
      />
      <button
        type="button"
        id="${containerId}-clear"
        class="hidden absolute inset-y-0 right-2 flex items-center justify-center text-slate-400 hover:text-slate-600"
        tabindex="-1"
        aria-label="Limpiar"
      >
        <svg xmlns="http://www.w3.org/2000/svg" class="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/>
        </svg>
      </button>
      <div id="${containerId}-dropdown" class="hidden absolute left-0 w-full top-full z-50 mt-1 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
        <div id="${containerId}-list" class="max-h-52 overflow-y-auto py-1"></div>
      </div>
    </div>
  `;

  const input = container.querySelector("input");
  const clearBtn = container.querySelector(`#${containerId}-clear`);
  const dropdown = container.querySelector(`#${containerId}-dropdown`);
  const list = container.querySelector(`#${containerId}-list`);

  function normalizeName(str) {
    return String(str || "").trim().toLowerCase();
  }

  function emit(val) {
    if (typeof onChange === "function") onChange(val);
  }

  function syncClearBtn() {
    clearBtn.classList.toggle("hidden", !input.value.trim() || _disabled);
  }

  function renderDropdown() {
    const query = input.value;
    const q = normalizeName(query);
    const filteredBase = q
      ? _items.filter((item) => normalizeName(typeof getSearchText === "function" ? getSearchText(item) : item.nombre).includes(q))
      : [..._items];
    const filtered = Number.isFinite(Number(maxResults)) ? filteredBase.slice(0, Number(maxResults)) : filteredBase;
    const trimmedQuery = query.trim();

    const itemRows = filtered.map(
      (item) => renderItem
        ? renderItem(item, { selected: _selectedId === item.id, escapeHtml })
        : `
        <button
          type="button"
          class="combobox-item w-full px-3 py-2 text-left text-sm hover:bg-slate-50 flex items-center gap-2${_selectedId === item.id ? " bg-cyan-50" : ""}"
          data-cb-id="${escapeHtml(String(item.id))}"
          data-cb-nombre="${escapeHtml(String(item.nombre))}"
          data-cb-synthetic="${item.synthetic ? "1" : "0"}"
        >
          <span class="w-3.5 shrink-0 text-cyan-600 text-xs">${_selectedId === item.id ? "✓" : ""}</span>
          <span class="truncate text-slate-800">${escapeHtml(item.nombre)}</span>
        </button>`
    );

    list.innerHTML = itemRows.join("");
    if (!itemRows.length) {
      dropdown.classList.add("hidden");
      _isOpen = false;
    }
  }

  function openDropdown() {
    if (_disabled) return;
    if (openOnlyWithQuery && !input.value.trim()) return;
    renderDropdown();
    if (list.innerHTML) {
      dropdown.classList.remove("hidden");
      _isOpen = true;
    }
  }

  function closeDropdown() {
    dropdown.classList.add("hidden");
    _isOpen = false;
  }

  function commitExisting(id, nombre) {
    _selectedId = id;
    _isNew = false;
    input.value = nombre;
    syncClearBtn();
    closeDropdown();
    emit({ id, nombre, isNew: false });
  }

  function commitNew(nombre) {
    _selectedId = null;
    _isNew = true;
    input.value = nombre;
    syncClearBtn();
    closeDropdown();
    emit({ id: null, nombre, isNew: true });
  }

  function commitEmpty() {
    _selectedId = null;
    _isNew = false;
    input.value = "";
    syncClearBtn();
    closeDropdown();
    emit({ id: null, nombre: "", isNew: false });
  }

  input.addEventListener("focus", () => {
    if (!_disabled && openOnFocus) openDropdown();
  });

  input.addEventListener("click", () => {
    if (!_disabled && openOnClick && !_isOpen) openDropdown();
  });

  input.addEventListener("input", () => {
    const hadSelection = Boolean(_selectedId);
    _selectedId = null;
    _isNew = false;
    syncClearBtn();
    if (!_isOpen) openDropdown();
    else renderDropdown();
    emit({ id: null, nombre: input.value.trim(), isNew: false, typing: true, clearedSelection: hadSelection });
  });

  input.addEventListener("blur", () => {
    setTimeout(() => {
      if (container.contains(document.activeElement)) return;
      closeDropdown();
      const trimmed = input.value.trim();
      if (!trimmed) {
        if (_selectedId !== null || _isNew) commitEmpty();
        return;
      }
      if (!_selectedId && !_isNew) {
        const match = _items.find((item) => normalizeName(item.nombre) === normalizeName(trimmed));
        if (match?.synthetic && autoSelectExactOnBlur) {
          commitNew(match.nombre);
        } else if (match && autoSelectExactOnBlur) {
          commitExisting(match.id, match.nombre);
        } else {
          commitNew(trimmed);
        }
      }
    }, 160);
  });

  list.addEventListener("mousedown", (event) => {
    const itemBtn = event.target.closest("[data-cb-id]");
    if (!itemBtn) return;
    event.preventDefault();
    if (itemBtn.dataset.cbSynthetic === "1") {
      commitNew(itemBtn.dataset.cbNombre);
      return;
    }
    commitExisting(itemBtn.dataset.cbId, itemBtn.dataset.cbNombre);
  });

  clearBtn.addEventListener("mousedown", (event) => {
    event.preventDefault();
    commitEmpty();
    input.focus();
  });

  document.addEventListener("click", (event) => {
    if (!container.contains(event.target)) closeDropdown();
  });

  return {
    getValue() {
      const trimmed = input.value.trim();
      if (_selectedId) return { id: _selectedId, nombre: trimmed, isNew: false };
      if (trimmed) return { id: null, nombre: trimmed, isNew: true };
      return { id: null, nombre: "", isNew: false };
    },
    hasSelection() {
      return Boolean(_selectedId);
    },
    isEmpty() {
      return !input.value.trim();
    },
    setItems(items) {
      _items = Array.isArray(items) ? items : [];
      if (_isOpen) renderDropdown();
    },
    reset() {
      _selectedId = null;
      _isNew = false;
      input.value = "";
      closeDropdown();
      syncClearBtn();
    },
    setValue(value, { id = null, isNew = !id, emitChange = false } = {}) {
      _selectedId = id;
      _isNew = Boolean(isNew);
      input.value = value || "";
      closeDropdown();
      syncClearBtn();
      if (emitChange) emit({ id, nombre: input.value.trim(), isNew: _isNew });
    },
    setDisabled(disabled, customPlaceholder) {
      _disabled = disabled;
      input.disabled = disabled;
      input.placeholder = disabled ? (customPlaceholder || disabledPlaceholder) : placeholder;
      syncClearBtn();
      if (disabled) closeDropdown();
    },
    focus() {
      if (!_disabled) input.focus();
    },
    close() {
      closeDropdown();
    }
  };
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

function toggleQuickGradoNewRow() {
  const val = gradoCombobox?.getValue();
  const show = Boolean(val?.isNew && val?.nombre);
  const row = document.getElementById("quick-grado-new-row");
  if (!row) return;
  row.classList.toggle("hidden", !show);
  if (!show) {
    const baseSelect = document.getElementById("quick-grado-base-select");
    if (baseSelect) {
      baseSelect.value = "";
      syncQuickSelectVisualState("quick-grado-base-select");
    }
  } else {
    syncQuickSelectVisualState("quick-grado-base-select");
  }
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
      <div class="rounded-lg border border-slate-200 bg-white px-3 py-3">
        <div class="flex items-center gap-4">
          <div class="min-w-0 flex flex-1 items-center gap-4">
            <div class="min-w-0">
              <p class="truncate text-sm font-medium text-slate-800">${escapeHtml(tema.titulo)}</p>
              <p class="text-xs text-slate-500">${escapeHtml(String(tema.duracion))} min</p>
            </div>
          </div>
          <button type="button" class="explorer-danger-icon-btn ml-auto shrink-0" data-quick-remove-tema="${tema.localId}" title="Quitar tema" aria-label="Quitar tema">
            ${renderTrashIcon()}
          </button>
        </div>
        ${renderActividadesMomentosControl({
          scope: "quick",
          localId: tema.localId,
          actividadesMomentos: tema.actividades_momentos
        })}
        ${"" /* PAUSED: renderImagenesAutomaticasControl({ scope: "quick", localId: tema.localId, generarImagenesEn: tema.generar_imagenes_en }) */}
      </div>
    `)
    .join("");
}

async function fillQuickGradoOptions(plantelId) {
  const requestId = ++explorerState.quickCreate.requestVersion.grado;
  explorerState.quickCreate.requestVersion.materia += 1;
  explorerState.quickCreate.requestVersion.unidad += 1;
  if (plantelId) await ensureGrados(plantelId);
  if (requestId !== explorerState.quickCreate.requestVersion.grado) return;
  gradoCombobox?.setItems(plantelId ? (explorerState.gradosByPlantel[plantelId] || []) : []);
}

async function fillQuickMateriaOptions(gradoId) {
  const requestId = ++explorerState.quickCreate.requestVersion.materia;
  explorerState.quickCreate.requestVersion.unidad += 1;
  if (gradoId) await ensureMaterias(gradoId);
  if (requestId !== explorerState.quickCreate.requestVersion.materia) return;
  materiaCombobox?.setItems(gradoId ? (explorerState.materiasByGrado[gradoId] || []) : []);
}

async function fillQuickUnidadOptions(materiaId) {
  const requestId = ++explorerState.quickCreate.requestVersion.unidad;
  if (materiaId) await ensureUnidades(materiaId);
  if (requestId !== explorerState.quickCreate.requestVersion.unidad) return;
  unidadCombobox?.setItems(materiaId ? (explorerState.unidadesByMateria[materiaId] || []) : []);
}

function normalizeQuickText(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getQuickBibliotecaConjuntos() {
  if (typeof window.biblioteca?.getConjuntos === "function") {
    return window.biblioteca.getConjuntos().filter((conjunto) => conjunto?.id && !conjunto?.isPending);
  }
  return [];
}

function getQuickTitleItems() {
  return getQuickBibliotecaConjuntos().map((conjunto) => ({
    id: String(conjunto.id),
    nombre: conjunto.titulo || "Sin titulo",
    conjunto,
    nivel: conjunto.nivel || "",
    materia: conjunto.materia || "",
    planeaciones: Number(conjunto.total_planeaciones || 0),
    created_at: conjunto.created_at || ""
  }));
}

function getQuickMateriaItems(extraMateria = "") {
  const byName = new Map();
  const extraNombre = String(extraMateria || "").trim();
  if (extraNombre) {
    const key = normalizeQuickText(extraNombre);
    byName.set(key, { id: `materia-${key}`, nombre: extraNombre, synthetic: true });
  }
  getQuickBibliotecaConjuntos().forEach((conjunto) => {
    const nombre = String(conjunto?.materia || "").trim();
    if (!nombre) return;
    const key = normalizeQuickText(nombre);
    if (!byName.has(key)) byName.set(key, { id: `materia-${key}`, nombre, synthetic: true });
  });
  return Array.from(byName.values()).sort((a, b) => a.nombre.localeCompare(b.nombre, "es"));
}

function renderQuickTitleItem(item, { selected, escapeHtml: esc }) {
  const meta = [
    item.nivel || "",
    item.materia || "",
    `${item.planeaciones} planeacion${item.planeaciones === 1 ? "" : "es"}`
  ].filter(Boolean).join(" · ");
  const date = item.created_at ? new Date(item.created_at).toLocaleDateString("es-MX", { day: "2-digit", month: "short", year: "numeric" }) : "";
  return `
    <button
      type="button"
      class="combobox-item w-full px-3 py-2.5 text-left text-sm hover:bg-slate-50 flex items-start gap-2${selected ? " bg-cyan-50" : ""}"
      data-cb-id="${esc(String(item.id))}"
      data-cb-nombre="${esc(String(item.nombre))}"
    >
      <span class="w-3.5 shrink-0 pt-0.5 text-cyan-600 text-xs">${selected ? "✓" : ""}</span>
      <span class="min-w-0">
        <span class="block truncate font-medium text-slate-900">${esc(item.nombre)}</span>
        <span class="block truncate text-xs text-slate-500">${esc(meta)}${date ? ` · ${esc(date)}` : ""}</span>
      </span>
    </button>`;
}

function syncQuickTitleItems() {
  tituloConjuntoCombobox?.setItems(getQuickTitleItems());
}

function setQuickNivelEducativoValue(nivel) {
  const select = document.getElementById("quick-nivel-educativo-select");
  if (!select) return;
  const normalized = normalizeQuickText(nivel);
  const option = QUICK_NIVELES_EDUCATIVOS.find((item) => item.value === normalized || normalizeQuickText(item.label) === normalized);
  select.value = option?.value || "";
  syncQuickSelectVisualState("quick-nivel-educativo-select");
}

function selectQuickExistingConjunto(conjunto) {
  if (!conjunto?.id) return;
  explorerState.quickCreate.selectedConjunto = conjunto;
  setQuickNivelEducativoValue(conjunto.nivel || "");
  materiaCombobox?.reset();
  materiaCombobox?.setDisabled(false);
  materiaCombobox?.setItems(getQuickMateriaItems(conjunto.materia || ""));
  if (conjunto.materia) {
    materiaCombobox?.setValue(conjunto.materia, { id: null, isNew: true, emitChange: false });
  }
}

function clearQuickExistingConjuntoSelection() {
  explorerState.quickCreate.selectedConjunto = null;
}

function getQuickNivelEducativoSelection() {
  const select = document.getElementById("quick-nivel-educativo-select");
  const value = select?.value || "";
  const option = QUICK_NIVELES_EDUCATIVOS.find((item) => item.value === value);
  if (!option) {
    throw new Error("Selecciona un nivel educativo.");
  }
  return { id: null, nombre: option.label, nivelBase: option.value, isNew: true };
}

function findQuickGradoByNivel(plantelId, nivelBase) {
  const normalizedNivel = String(nivelBase || "").trim().toLowerCase();
  const grados = explorerState.gradosByPlantel[plantelId] || [];
  return grados.find((grado) => String(grado?.nivel_base || "").trim().toLowerCase() === normalizedNivel)
    || grados.find((grado) => String(grado?.nombre || "").trim().toLowerCase() === normalizedNivel)
    || null;
}

async function fillQuickMateriaOptionsForNivel(nivelBase) {
  if (!window.BIBLIOTECA_MODE || !nivelBase) {
    materiaCombobox?.setItems(getQuickMateriaItems());
    return;
  }

  const requestId = ++explorerState.quickCreate.requestVersion.materia;
  explorerState.quickCreate.requestVersion.unidad += 1;
  const plantelId = await ensureDefaultPlantel();
  await ensureGrados(plantelId);
  const grado = findQuickGradoByNivel(plantelId, nivelBase);
  if (!grado?.id) {
    if (requestId === explorerState.quickCreate.requestVersion.materia) {
      materiaCombobox?.setItems(getQuickMateriaItems());
    }
    return;
  }

  await ensureMaterias(grado.id);
  if (requestId !== explorerState.quickCreate.requestVersion.materia) return;
  const byName = new Map();
  [...getQuickMateriaItems(), ...(explorerState.materiasByGrado[grado.id] || [])].forEach((materia) => {
    const nombre = String(materia?.nombre || "").trim();
    if (!nombre) return;
    const key = normalizeQuickText(nombre);
    const current = byName.get(key);
    if (!current || (current.synthetic && !materia.synthetic)) byName.set(key, materia);
  });
  materiaCombobox?.setItems(Array.from(byName.values()));
}

async function initQuickCreateForm() {
  explorerState.quickCreate.temas = [];
  explorerState.quickCreate.requestVersion = { grado: 0, materia: 0, unidad: 0 };
  explorerState.quickCreate.selectedConjunto = null;
  showQuickCreateError("");

  tituloConjuntoCombobox?.reset();
  tituloConjuntoCombobox?.setDisabled(false);
  syncQuickTitleItems();

  plantelCombobox?.reset();
  plantelCombobox?.setItems(explorerState.planteles || []);

  gradoCombobox?.reset();
  if (window.BIBLIOTECA_MODE) {
    gradoCombobox?.setItems(getAllGradosFlat());
    gradoCombobox?.setDisabled(false);
  } else {
    gradoCombobox?.setItems([]);
    gradoCombobox?.setDisabled(true);
  }

  materiaCombobox?.reset();
  materiaCombobox?.setItems(window.BIBLIOTECA_MODE ? getQuickMateriaItems() : []);
  materiaCombobox?.setDisabled(!window.BIBLIOTECA_MODE);

  unidadCombobox?.reset();
  unidadCombobox?.setItems([]);
  unidadCombobox?.setDisabled(true);

  toggleQuickGradoNewRow();
  const nivelEducativoSelect = document.getElementById("quick-nivel-educativo-select");
  if (nivelEducativoSelect) {
    nivelEducativoSelect.value = "";
    nivelEducativoSelect.disabled = false;
    syncQuickSelectVisualState("quick-nivel-educativo-select");
  }

  const titleInput = document.getElementById("quick-tema-title");
  if (titleInput) titleInput.value = "";
  const durationInput = document.getElementById("quick-tema-duration");
  if (durationInput) durationInput.value = "50";
  renderQuickTemasList();
}

function resetQuickCreatePanelSections() {
  const form       = document.getElementById("quick-create-form");
  const generating = document.getElementById("quick-create-generating");
  const result     = document.getElementById("quick-create-result");
  if (form)       form.classList.remove("hidden");
  if (generating) generating.classList.add("hidden");
  if (result)     result.classList.add("hidden");
}

function showQuickCreateGeneratingSection(items) {
  const form       = document.getElementById("quick-create-form");
  const generating = document.getElementById("quick-create-generating");
  if (form)       form.classList.add("hidden");
  if (generating) generating.classList.remove("hidden");

  const itemsEl = document.getElementById("quick-create-generating-items");
  if (itemsEl && Array.isArray(items)) {
    itemsEl.innerHTML = items.map(item => {
      const icon  = item.status === "ready"   ? "&#10003;"
                  : item.status === "error"   ? "&#10005;"
                  : item.status === "skipped" ? "&#8213;"
                  : "&#8230;";
      const color = item.status === "ready"   ? "text-emerald-700"
                  : item.status === "error"   ? "text-rose-600"
                  : item.status === "skipped" ? "text-slate-400"
                  : "text-cyan-700";
      const msg   = item.statusLabel || item.message || "";
      return `<div class="flex items-center gap-2 text-xs ${color}">
        <span class="w-4 flex-shrink-0 text-center">${icon}</span>
        <span>${escapeHtml(item.titulo || "")}${msg ? ` — ${escapeHtml(msg)}` : ""}</span>
      </div>`;
    }).join("");
  }
}

function showQuickCreateResultSection(finalMessage, finalTone) {
  const generating = document.getElementById("quick-create-generating");
  const result     = document.getElementById("quick-create-result");
  if (generating) generating.classList.add("hidden");
  if (result)     result.classList.remove("hidden");

  const msgEl = document.getElementById("quick-create-result-message");
  if (msgEl) {
    const isSuccess = finalTone === "success";
    const isWarning = finalTone === "warning";
    msgEl.className = `rounded-xl border px-4 py-3 text-sm ${
      isSuccess ? "border-emerald-200 bg-emerald-50 text-emerald-800" :
      isWarning ? "border-yellow-200 bg-yellow-50 text-yellow-800" :
                  "border-rose-200 bg-rose-50 text-rose-700"
    }`;
    msgEl.textContent = finalMessage || "Proceso finalizado.";
  }

  const closeBtn = document.getElementById("quick-create-result-close");
  closeBtn?.addEventListener("click", closeQuickCreatePanel, { once: true });
}

async function openQuickCreatePanel() {
  explorerState.quickCreate.open = true;
  setQuickPanelVisibility(true);
  resetQuickCreatePanelSections();

  if (window.BIBLIOTECA_MODE) {
    await loadPlanteles();
    await ensureAllGrados();
  }

  await initQuickCreateForm();

  if (window.BIBLIOTECA_MODE) {
    tituloConjuntoCombobox?.focus();
  } else {
    plantelCombobox?.focus();
  }
}

function closeQuickCreatePanel() {
  explorerState.quickCreate.open = false;
  setQuickPanelVisibility(false);
  showQuickCreateError("");
  resetQuickCreatePanelSections();
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
    actividades_momentos: {},
    actividad_cierre: "",
    generar_imagenes_en: []
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

function updateQuickTemaActividad(localId, momentoKey, actividad) {
  const safeMomento = MOMENTOS_ACTIVIDADES_DIDACTICAS.some((momento) => momento.key === momentoKey)
    ? momentoKey
    : "";
  const actividadNormalizada = normalizeActividadDidactica(actividad);
  explorerState.quickCreate.temas = explorerState.quickCreate.temas.map((tema) => {
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

  showQuickCreateError("");
  renderQuickTemasList();
}

// PAUSED: auto image generation disabled — function preserved for future re-enable
// function toggleQuickTemaImagenMomento(localId, momentoKey, checked) {
//   if (!localId) return;
//   explorerState.quickCreate.temas = explorerState.quickCreate.temas.map((tema) => {
//     if (tema.localId !== localId) return tema;
//     return {
//       ...tema,
//       generar_imagenes_en: toggleMomentoInList(tema.generar_imagenes_en, momentoKey, checked)
//     };
//   });
// }

function requireQuickComboboxValue(combobox, label) {
  const val = combobox?.getValue();
  if (!val?.nombre) {
    throw new Error(`Escribe o selecciona una opcion para ${label}.`);
  }
  return { id: val.id || null, nombre: val.nombre, isNew: !val.id };
}

function requireQuickGradoSelection() {
  if (window.BIBLIOTECA_MODE) {
    try {
      return getQuickNivelEducativoSelection();
    } catch (error) {
      const selected = explorerState.quickCreate.selectedConjunto;
      if (selected?.nivel) {
        const normalized = normalizeQuickText(selected.nivel);
        const option = QUICK_NIVELES_EDUCATIVOS.find((item) => item.value === normalized || normalizeQuickText(item.label) === normalized);
        if (option) return { id: null, nombre: option.label, nivelBase: option.value, isNew: true };
      }
      throw error;
    }
  }

  const selection = requireQuickComboboxValue(gradoCombobox, "Grado");

  if (selection.isNew) {
    selection.nivelBase = requireNivelBaseValue("quick-grado-base-select", "Nivel base del grado");
  }

  return selection;
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
  if (explorerState.stagingContext) {
    return {
      materia: explorerState.stagingContext.materia || undefined,
      nivel: explorerState.stagingContext.nivel || undefined,
      unidad: explorerState.stagingContext.unidad || undefined
    };
  }

  const unidadNombre = getCurrentUnidad()?.nombre || "";
  const unidadNormalizada = unidadNombre
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
  return {
    materia: getCurrentMateria()?.nombre || undefined,
    nivel: getCurrentGrado()?.nivel_base || undefined,
    unidad: unidadNormalizada === "bloque de planeacion" ? undefined : unidadNombre || undefined
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
    temas: explorerState.stagingTemas.map((tema, index) => ({
      titulo: tema.titulo,
      duracion: tema.duracion,
      ...buildTemaActividadesPayload(tema),
      orden: index + 1,
      generar_imagenes_en: Array.isArray(tema.generar_imagenes_en)
        ? tema.generar_imagenes_en.map(normalizeImagenMomentoKey).filter(Boolean)
        : []
    })),
    ...buildLegacyContext(),
    ...(window.biblioteca?.pendingBatchId ? { batch_id: window.biblioteca.pendingBatchId } : {}),
    ...(explorerState.stagingTituloConjunto ? { titulo_conjunto: explorerState.stagingTituloConjunto } : {}),
    ...(window.BIBLIOTECA_MODE && !window.biblioteca?.pendingBatchId
      ? { force_new_batch: true, mode: "create" }
      : {})
  };

  try {
    const result = await generarPlaneacionesUnidadConProgreso({ unidadId, body }, (evt) => {
      updateProgressFromEvent(evt);
      renderExplorerContent();
    });

    applyGenerateResult(result || {});
    explorerState.stagingTemas = [];
    explorerState.stagingTituloConjunto = "";
    explorerState.stagingContext = null;
    await ensureTemas(unidadId, { force: true });

    if (window.BIBLIOTECA_MODE && typeof window.biblioteca?.finishPlaneacionesGeneration === "function") {
      await window.biblioteca.finishPlaneacionesGeneration(result || {});
    } else if (window.BIBLIOTECA_MODE && typeof window.biblioteca?.refresh === "function") {
      window.biblioteca.pendingBatchId = null;
      await window.biblioteca.refresh();
    }

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
    if (window.biblioteca?.pendingBatchId) {
      window.biblioteca.pendingBatchId = null;
    }
    updateProgressCounters();
    renderExplorerContent();
  }
}

async function submitQuickCreateForm(event) {
  event.preventDefault();

  // Validaciones síncronas: si fallan se muestra el error en el panel y no se cierra
  if (explorerState.quickCreate.temas.length === 0) {
    showQuickCreateError("Agrega al menos un tema antes de crear la planeacion.");
    return;
  }
  let plantelSelection = null, gradoSelection, materiaSelection, unidadSelection;
  try {
    if (!window.BIBLIOTECA_MODE) {
      plantelSelection = requireQuickComboboxValue(plantelCombobox, "Plantel");
    }
    gradoSelection = requireQuickGradoSelection();
    materiaSelection = requireQuickComboboxValue(materiaCombobox, "Materia");
    if (!window.BIBLIOTECA_MODE) {
      unidadSelection = requireQuickComboboxValue(unidadCombobox, "Unidad");
    }
  } catch (validationError) {
    showQuickCreateError(formatFetchError(validationError, "Completa todos los campos requeridos."));
    return;
  }

  const selectedConjunto = window.BIBLIOTECA_MODE ? explorerState.quickCreate.selectedConjunto : null;
  const tituloValue = tituloConjuntoCombobox?.getValue();
  explorerState.stagingTituloConjunto = selectedConjunto?.titulo || tituloValue?.nombre?.trim() || "";
  if (window.BIBLIOTECA_MODE && !selectedConjunto && !explorerState.stagingTituloConjunto) {
    explorerState.stagingTituloConjunto = materiaSelection?.nombre?.trim() || "Bloque de planeacion";
  }

  // Validaciones pasaron — cerrar panel siempre
  showQuickCreateError("");
  closeQuickCreatePanel();

  try {
    const normalizeForCompare = (str) => String(str || "").trim().toLowerCase();

    let plantelId;
    if (window.BIBLIOTECA_MODE) {
      plantelId = await ensureDefaultPlantel();
    } else {
      plantelId = plantelSelection.id;
      if (!plantelId) {
        const existingPlantel = explorerState.planteles.find(
          (p) => normalizeForCompare(p.nombre) === normalizeForCompare(plantelSelection.nombre)
        );
        if (existingPlantel) {
          plantelId = existingPlantel.id;
        } else {
          const created = await crearPlantel({ nombre: plantelSelection.nombre.trim() });
          plantelId = created?.id;
          if (!plantelId) throw new Error("No se pudo crear el plantel.");
          await loadPlanteles();
        }
      } else if (!quickListHasId(explorerState.planteles, plantelId)) {
        throw new Error("El plantel seleccionado no es valido.");
      }
    }

    await ensureGrados(plantelId);
    const gradosDisponibles = explorerState.gradosByPlantel[plantelId] || [];

    let gradoId = gradoSelection.id;
    if (!gradoId) {
      const existingGrado = window.BIBLIOTECA_MODE
        ? findQuickGradoByNivel(plantelId, gradoSelection.nivelBase)
        : gradosDisponibles.find(
            (g) => normalizeForCompare(g.nombre) === normalizeForCompare(gradoSelection.nombre)
          );
      if (existingGrado) {
        gradoId = existingGrado.id;
      } else {
        const payload = {
          nombre: gradoSelection.nombre.trim(),
          nivel_base: gradoSelection.nivelBase,
          plantel_id: plantelId,
          orden: getNextOrder(gradosDisponibles)
        };
        const created = await crearGrado(payload);
        gradoId = created?.id;
        if (!gradoId) throw new Error("No se pudo crear el grado.");
        await ensureGrados(plantelId, { force: true });
      }
    } else if (!quickListHasId(gradosDisponibles, gradoId)) {
      throw new Error("El grado seleccionado no pertenece al plantel elegido.");
    }

    await ensureMaterias(gradoId);
    const materiasDisponibles = explorerState.materiasByGrado[gradoId] || [];

    let materiaId = materiaSelection.id;
    if (!materiaId) {
      const existingMateria = materiasDisponibles.find(
        (m) => normalizeForCompare(m.nombre) === normalizeForCompare(materiaSelection.nombre)
      );
      if (existingMateria) {
        materiaId = existingMateria.id;
      } else {
        const created = await crearMateria({ nombre: materiaSelection.nombre.trim(), grado_id: gradoId });
        materiaId = created?.id;
        if (!materiaId) throw new Error("No se pudo crear la materia.");
        await ensureMaterias(gradoId, { force: true });
      }
    } else if (!quickListHasId(materiasDisponibles, materiaId)) {
      throw new Error("La materia seleccionada no pertenece al grado elegido.");
    }

    await ensureUnidades(materiaId);
    const unidadesDisponibles = explorerState.unidadesByMateria[materiaId] || [];

    let unidadId = selectedConjunto?.unidad_id || selectedConjunto?.unidadId || null;
    if (!unidadId) {
      const unidadTecnicaNombre = "Bloque de planeacion";
      if (window.BIBLIOTECA_MODE) {
        const existingUnidad = unidadesDisponibles.find(
          (u) => normalizeForCompare(u.nombre) === normalizeForCompare(unidadTecnicaNombre)
        );
        unidadSelection = existingUnidad
          ? { id: existingUnidad.id, nombre: existingUnidad.nombre, isNew: false }
          : { id: null, nombre: unidadTecnicaNombre, isNew: true };
      }

      unidadId = unidadSelection.id;
      if (!unidadId) {
        const existingUnidad = unidadesDisponibles.find(
          (u) => normalizeForCompare(u.nombre) === normalizeForCompare(unidadSelection.nombre)
        );
        if (existingUnidad) {
          unidadId = existingUnidad.id;
        } else {
          const payload = {
            nombre: unidadSelection.nombre.trim(),
            materia_id: materiaId,
            orden: getNextOrder(unidadesDisponibles)
          };
          const created = await crearUnidad(payload);
          unidadId = created?.id;
          if (!unidadId) throw new Error("No se pudo crear la unidad.");
          await ensureUnidades(materiaId, { force: true });
        }
      } else if (!quickListHasId(unidadesDisponibles, unidadId)) {
        throw new Error("La unidad seleccionada no pertenece a la materia elegida.");
      }
    }

    if (window.BIBLIOTECA_MODE) {
      explorerState.current = { level: "unidad", plantelId, gradoId, materiaId, unidadId };
    } else {
      await selectUnidad(plantelId, gradoId, materiaId, unidadId);
    }

    explorerState.stagingTemas = explorerState.quickCreate.temas.map((tema) => ({
      localId: `tmp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      titulo: tema.titulo,
      duracion: tema.duracion,
      actividades_momentos: buildActividadesMomentosPayload(tema.actividades_momentos),
      actividad_cierre: tema.actividad_cierre,
      generar_imagenes_en: Array.isArray(tema.generar_imagenes_en)
        ? tema.generar_imagenes_en
            .map(normalizeImagenMomentoKey)
            .filter(Boolean)
        : []
    }));

    explorerState.quickCreate.temas = [];
    explorerState.stagingContext = {
      materia: materiaSelection?.nombre || selectedConjunto?.materia || "",
      nivel: gradoSelection?.nivelBase || selectedConjunto?.nivel || "",
      unidad: null
    };

    if (window.BIBLIOTECA_MODE && selectedConjunto?.id) {
      window.biblioteca.pendingBatchId = selectedConjunto.id;
      if (typeof window.biblioteca?.startPlaneacionesGeneration === "function") {
        window.biblioteca.startPlaneacionesGeneration(selectedConjunto.id, explorerState.stagingTemas);
      } else if (typeof window.biblioteca?.selectConjunto === "function") {
        window.biblioteca.selectConjunto(selectedConjunto.id, { tab: "planeaciones" });
      }
    } else if (window.BIBLIOTECA_MODE && typeof window.biblioteca?.setPendingConjunto === "function") {
      window.biblioteca.setPendingConjunto({
        tempId:  `tmp-${Date.now()}`,
        titulo:  explorerState.stagingTituloConjunto || "Bloque de planeacion",
        nivel:   gradoSelection?.nivelBase || "",
        materia: materiaSelection?.nombre  || "",
        unidad:  null
      });
      if (typeof window.renderBibliotecaContent === "function") {
        window.renderBibliotecaContent();
      }
    }

    await generatePlaneacionesFromStaging();
  } catch (error) {
    console.error("Error en creacion rapida:", error);
  }
}

function getAllGradosFlat() {
  return Object.values(explorerState.gradosByPlantel || {}).flat();
}

async function ensureAllGrados() {
  await Promise.all((explorerState.planteles || []).map((p) => ensureGrados(p.id)));
}

async function ensureDefaultPlantel() {
  if ((explorerState.planteles || []).length > 0) return explorerState.planteles[0].id;
  const created = await crearPlantel({ nombre: "Mi plantel" });
  if (!created?.id) throw new Error("No se pudo crear el plantel por defecto.");
  await loadPlanteles();
  return explorerState.planteles[0]?.id || null;
}

function initQuickComboboxes() {
  tituloConjuntoCombobox = createQuickCombobox("quick-conjunto-titulo-combobox", {
    placeholder: "Ej. Fisica 1 - Vectores",
    disabledPlaceholder: "Ej. Fisica 1 - Vectores",
    maxResults: 8,
    autoSelectExactOnBlur: false,
    openOnFocus: false,
    openOnClick: false,
    openOnlyWithQuery: true,
    getSearchText: (item) => `${item.nombre || ""} ${item.nivel || ""} ${item.materia || ""}`,
    renderItem: renderQuickTitleItem,
    onChange: (val) => {
      if (val?.typing || !val?.id) {
        if (val?.clearedSelection || explorerState.quickCreate.selectedConjunto) {
          clearQuickExistingConjuntoSelection();
          tituloConjuntoCombobox?.setDisabled(false);
        }
        return;
      }
      const conjunto = getQuickBibliotecaConjuntos().find((item) => String(item.id) === String(val.id));
      if (conjunto) selectQuickExistingConjunto(conjunto);
    }
  });
  syncQuickTitleItems();

  plantelCombobox = createQuickCombobox("quick-internal-structure-combobox", {
    placeholder: "Escribe o selecciona una estructura",
    disabledPlaceholder: "Escribe o selecciona una estructura",
    onChange: async (val) => {
      if (val.typing) {
        if (val.nombre) gradoCombobox?.setDisabled(false);
        else { gradoCombobox?.setDisabled(true); materiaCombobox?.setDisabled(true); unidadCombobox?.setDisabled(true); }
        return;
      }

      gradoCombobox?.reset();
      materiaCombobox?.reset();
      unidadCombobox?.reset();
      toggleQuickGradoNewRow();

      if (!val.nombre) {
        gradoCombobox?.setDisabled(true);
        materiaCombobox?.setDisabled(true);
        unidadCombobox?.setDisabled(true);
        return;
      }

      gradoCombobox?.setDisabled(false);
      materiaCombobox?.setDisabled(true);
      unidadCombobox?.setDisabled(true);

      if (val.id) {
        await fillQuickGradoOptions(val.id).catch((error) => console.error("Error cargando grados:", error));
      } else {
        gradoCombobox?.setItems([]);
      }
    }
  });

  gradoCombobox = createQuickCombobox("quick-grado-combobox", {
    placeholder: "Escribe o selecciona un nivel / grado",
    disabledPlaceholder: "Primero selecciona o crea una estructura",
    onChange: async (val) => {
      toggleQuickGradoNewRow();

      if (val.typing) {
        if (val.nombre) materiaCombobox?.setDisabled(false);
        else { materiaCombobox?.setDisabled(true); unidadCombobox?.setDisabled(true); }
        return;
      }

      materiaCombobox?.reset();
      unidadCombobox?.reset();

      if (!val.nombre) {
        materiaCombobox?.setDisabled(true);
        unidadCombobox?.setDisabled(true);
        return;
      }

      materiaCombobox?.setDisabled(false);
      unidadCombobox?.setDisabled(true);

      if (val.id) {
        await fillQuickMateriaOptions(val.id).catch((error) => console.error("Error cargando materias:", error));
      } else {
        materiaCombobox?.setItems([]);
      }
    }
  });
  gradoCombobox.setDisabled(true);

  materiaCombobox = createQuickCombobox("quick-materia-combobox", {
    placeholder: window.BIBLIOTECA_MODE ? "Selecciona o escribe una materia" : "Escribe o selecciona una materia",
    disabledPlaceholder: window.BIBLIOTECA_MODE ? "Selecciona o escribe una materia" : "Primero selecciona o crea un grado",
    onChange: async (val) => {
      if (window.BIBLIOTECA_MODE) {
        return;
      }

      if (val.typing) {
        if (val.nombre) unidadCombobox?.setDisabled(false);
        else unidadCombobox?.setDisabled(true);
        return;
      }

      unidadCombobox?.reset();

      if (!val.nombre) {
        unidadCombobox?.setDisabled(true);
        return;
      }

      unidadCombobox?.setDisabled(false);

      if (val.id) {
        await fillQuickUnidadOptions(val.id).catch((error) => console.error("Error cargando unidades:", error));
      } else {
        unidadCombobox?.setItems([]);
      }
    }
  });
  materiaCombobox.setDisabled(!window.BIBLIOTECA_MODE);

  unidadCombobox = createQuickCombobox("quick-unidad-combobox", {
    placeholder: "Escribe o selecciona una unidad",
    disabledPlaceholder: "Primero selecciona o crea una materia",
    onChange: () => {}
  });
  unidadCombobox.setDisabled(true);
}

function bindQuickCreate() {
    document.getElementById("btn-hero-quick-create")?.addEventListener("click", () => {
      openQuickCreatePanel().catch((error) => console.error("Error abriendo creacion rapida:", error));
    });

    ["quick-create-close", "quick-create-cancel", "quick-create-backdrop"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => {
        closeQuickCreatePanel();
      });
    });

    initQuickComboboxes();

    document.getElementById("quick-grado-base-select")?.addEventListener("change", () => {
      syncQuickSelectVisualState("quick-grado-base-select");
    });

    document.getElementById("quick-nivel-educativo-select")?.addEventListener("change", (event) => {
      syncQuickSelectVisualState("quick-nivel-educativo-select");
      if (!window.BIBLIOTECA_MODE) return;
      if (explorerState.quickCreate.selectedConjunto) {
        clearQuickExistingConjuntoSelection();
      }
      materiaCombobox?.reset();
      materiaCombobox?.setDisabled(false);
      fillQuickMateriaOptionsForNivel(event.target.value).catch((error) => {
        console.error("Error cargando materias por nivel:", error);
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

    document.getElementById("quick-temas-list")?.addEventListener("change", (event) => {
      const select = event.target.closest?.("[data-quick-actividad-select]");
      if (select) {
        updateQuickTemaActividad(
          select.getAttribute("data-quick-actividad-select"),
          select.getAttribute("data-actividad-momento"),
          select.value
        );
        return;
      }

      // PAUSED: auto image generation disabled
      // const imagenCheck = event.target.closest?.("[data-quick-imagen-check]");
      // if (imagenCheck) {
      //   toggleQuickTemaImagenMomento(
      //     imagenCheck.getAttribute("data-quick-imagen-local-id"),
      //     imagenCheck.getAttribute("data-quick-imagen-check"),
      //     Boolean(imagenCheck.checked)
      //   );
      // }
    });

    document.getElementById("quick-create-form")?.addEventListener("submit", (event) => {
      submitQuickCreateForm(event).catch((error) => {
        console.error("Error en creacion rapida:", error);
        showQuickCreateError("No se pudo completar la creacion rapida.");
      });
    });


}

  window.QuickCreate = Object.freeze({
    open: openQuickCreatePanel,
    close: closeQuickCreatePanel,
    bind: bindQuickCreate,
    setPanelVisibility: setQuickPanelVisibility,
    generateFromStaging: generatePlaneacionesFromStaging
  });
})();
