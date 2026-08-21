// Dashboard bootstrap and bindings owner.
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

    window.QuickCreate.bind();

    ["unit-exam-preview-backdrop", "unit-exam-preview-close"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => window.ExamPreview.close());
    });

    ["lista-cotejo-preview-backdrop", "lista-cotejo-preview-close"].forEach((id) => {
      document.getElementById(id)?.addEventListener("click", () => window.ListaCotejoPreview.close());
    });

    document.getElementById("lista-cotejo-preview-download")?.addEventListener("click", async () => {
      const lista = explorerState.listaCotejoPreview?.listaData;
      if (!lista) return;
      return window.ListaCotejoDownload.download(lista);
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

    document.addEventListener("keydown", (event) => {
      if (event.key !== "Escape") return;

      if (explorerState.examPreview.open) {
        window.ExamPreview.close();
        return;
      }

      if (explorerState.listaCotejoPreview.open) {
        window.ListaCotejoPreview.close();
        return;
      }

      if (explorerState.quickCreate.open) window.QuickCreate.close();
    });

    isDashboardBound = true;
  }

  async function initDashboardPage() {
    window.BIBLIOTECA_MODE = true;

    try {
      await injectComponent("dashboard-layout-root", "../components/layout.html");
      await (window.initPrivateChrome ? window.initPrivateChrome() : Promise.resolve());
    } catch (error) {
      console.error("Error inicializando dashboard:", error);
      const root = document.getElementById("dashboard-layout-root");
      if (root) root.innerHTML = '<div class="p-6 text-sm text-rose-700">No se pudo cargar el dashboard.</div>';
      return;
    }

    bindDashboardEvents();

    if (typeof window.initBiblioteca !== "function") {
      console.error("Error cargando biblioteca: initBiblioteca no esta disponible.");
      return;
    }

    try {
      await window.initBiblioteca();
    } catch (error) {
      console.error("Error cargando biblioteca:", error);
    }
  }

  global.initDashboardPage = initDashboardPage;
})(window);
