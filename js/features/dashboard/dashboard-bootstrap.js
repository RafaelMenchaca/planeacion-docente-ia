// =========================================================
// Dashboard bootstrap and bindings owner
// Fase 7 — Sesión 7.3
// =========================================================

(function initDashboardBootstrap(global) {
let isDashboardBound = false;

async function injectComponent(targetId, path) {
  const target = document.getElementById(targetId);
  if (!target) throw new Error(`No se encontro el contenedor ${targetId}`);

  const response = await fetch(path);
  if (!response.ok) throw new Error(`No se pudo cargar componente: ${path}`);

  target.innerHTML = await response.text();
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
    if (select) {
      updateStagingTemaActividad(
        select.getAttribute("data-staging-actividad-select"),
        select.getAttribute("data-actividad-momento"),
        select.value
      );
      return;
    }

    // PAUSED: auto image generation disabled
    // const imagenCheck = event.target.closest?.("[data-staging-imagen-check]");
    // if (imagenCheck) {
    //   toggleStagingTemaImagenMomento(
    //     imagenCheck.getAttribute("data-staging-imagen-local-id"),
    //     imagenCheck.getAttribute("data-staging-imagen-check"),
    //     Boolean(imagenCheck.checked)
    //   );
    // }
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

  window.QuickCreate.bind();

  document.getElementById("btn-onboarding-create")?.addEventListener("click", () => {
    if (window.BIBLIOTECA_MODE) return;
    openEntityModal("plantel");
  });
  document.getElementById("btn-onboarding-retry")?.addEventListener("click", () => loadPlanteles().then(renderAll).catch((error) => console.error("Error reintentando:", error)));

  document.getElementById("entity-modal")?.addEventListener("click", (event) => {
    if (event.target.matches("[data-modal-close]")) closeEntityModal();
  });

  ["unit-exam-backdrop", "unit-exam-close", "unit-exam-cancel"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeUnitExamModal();
    });
  });

  ["unit-exam-preview-backdrop", "unit-exam-preview-close"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeExamPreviewModal();
    });
  });

  ["lista-cotejo-confirm-backdrop", "lista-cotejo-confirm-cancel", "lista-cotejo-confirm-close"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeListaCotejoModal();
    });
  });

  document.getElementById("lista-cotejo-confirm-submit")?.addEventListener("click", () => {
    submitListaCotejoGenerate().catch((error) => {
      console.error("Error generando listas de cotejo:", error);
      explorerState.listaCotejoModal.submitting = false;
      explorerState.listaCotejoModal.error = "No se pudieron generar las listas de cotejo.";
      renderListaCotejoConfirmModal();
    });
  });

  ["lista-cotejo-preview-backdrop", "lista-cotejo-preview-close"].forEach((id) => {
    document.getElementById(id)?.addEventListener("click", () => {
      closeListaCotejoPreview();
    });
  });

  document.getElementById("lista-cotejo-preview-download")?.addEventListener("click", async () => {
    const lista = explorerState.listaCotejoPreview?.listaData;
    if (!lista) return;
    return window.ListaCotejoDownload.download(lista);
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
      const examen = explorerState.examenDetalleById?.[examenId];
      const suggested = window.AppUI.buildDownloadSuggestedName("Examen", examen?.titulo || "");
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;

      await downloadExamWord(examenId, filename);
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

    if (explorerState.listaCotejoModal.open) {
      closeListaCotejoModal();
      return;
    }

    if (explorerState.listaCotejoPreview.open) {
      closeListaCotejoPreview();
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

async function initDashboardPage() {
  const hasBiblioteca = typeof window.initBiblioteca === "function";
  if (hasBiblioteca) {
    window.BIBLIOTECA_MODE = true;
  }

  try {
    await injectComponent("dashboard-layout-root", "../components/layout.html");
    await Promise.all([
      hasBiblioteca
        ? Promise.resolve()
        : injectComponent("dashboard-sidebar-slot", "../components/sidebar.html"),
      window.initPrivateChrome ? window.initPrivateChrome() : Promise.resolve()
    ]);
  } catch (error) {
    console.error("Error inicializando dashboard:", error);
    const root = document.getElementById("dashboard-layout-root");
    if (root) root.innerHTML = '<div class="p-6 text-sm text-rose-700">No se pudo cargar el dashboard.</div>';
    return;
  }

  bindDashboardEvents();

  if (hasBiblioteca) {
    try {
      await window.initBiblioteca();
    } catch (error) {
      console.error("Error cargando biblioteca:", error);
    }
    return;
  }

  try {
    await hydrateExplorerData();
  } catch (error) {
    console.error("Error cargando datos del dashboard:", error);
    explorerState.errors.root = formatFetchError(error, "No se pudieron cargar los datos del explorador.");
    renderAll();
  }
}

  global.initDashboardPage = initDashboardPage;
})(window);

