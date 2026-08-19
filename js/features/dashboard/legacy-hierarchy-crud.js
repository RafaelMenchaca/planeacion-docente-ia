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
