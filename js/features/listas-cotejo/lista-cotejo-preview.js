(function () {
  function syncListaCotejoPreviewBodyScrollLock() {
    if (!document.body) return;
    const explorerState = window.explorerState;
    const entityModalOpen = !document.getElementById("entity-modal")?.classList.contains("hidden");

    document.body.classList.toggle(
      "overflow-hidden",
      explorerState.quickCreate.open || explorerState.confirmDelete.open || explorerState.examModal.open || explorerState.examPreview.open || explorerState.listaCotejoModal.open || explorerState.listaCotejoPreview.open || entityModalOpen
    );
  }

  function renderListaCotejoPreviewBody(lista) {
    if (!lista) return '<p class="text-sm text-slate-500">No se pudo cargar la lista.</p>';
    const criterios = Array.isArray(lista.criterios) ? lista.criterios : [];
    return `
    <div class="space-y-3">
      <div class="overflow-x-auto rounded-xl border border-slate-200">
        <table class="w-full text-sm">
          <thead class="bg-slate-50">
            <tr>
              <th class="px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">Criterio</th>
              <th class="w-20 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">Si (2 pts)</th>
              <th class="w-20 px-3 py-2.5 text-center text-xs font-semibold uppercase tracking-wide text-slate-600">No (0 pts)</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${criterios.map((c, i) => `
              <tr class="${i % 2 === 0 ? "bg-white" : "bg-slate-50/50"}">
                <td class="px-3 py-2.5 text-slate-700">${escapeHtml(c.criterio || "")}</td>
                <td class="px-3 py-2.5 text-center text-slate-500">${escapeHtml(String(c.si ?? 2))}</td>
                <td class="px-3 py-2.5 text-center text-slate-500">${escapeHtml(String(c.no ?? 0))}</td>
              </tr>
            `).join("")}
          </tbody>
          <tfoot class="bg-slate-50">
            <tr>
              <td class="px-3 py-2.5 text-xs font-semibold text-slate-600">Total</td>
              <td class="px-3 py-2.5 text-center text-xs font-semibold text-slate-700">${escapeHtml(String(lista.total_puntos || 10))} pts</td>
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  `;
  }

  function render() {
    const explorerState = window.explorerState;
    const modal = document.getElementById("lista-cotejo-preview-modal");
    const title = document.getElementById("lista-cotejo-preview-title");
    const meta = document.getElementById("lista-cotejo-preview-meta");
    const body = document.getElementById("lista-cotejo-preview-body");
    const error = document.getElementById("lista-cotejo-preview-error");
    if (!modal || !title || !meta || !body || !error) return;

    const state = explorerState.listaCotejoPreview;
    modal.classList.toggle("hidden", !state.open);
    syncListaCotejoPreviewBodyScrollLock();

    if (!state.open) {
      error.classList.add("hidden");
      error.textContent = "";
      body.innerHTML = "";
      return;
    }

    const lista = state.listaData;
    title.textContent = lista?.titulo || "Lista de cotejo";
    meta.textContent = lista?.tema ? `Tema: ${escapeHtml(lista.tema)}` : "";
    error.classList.add("hidden");
    body.innerHTML = renderListaCotejoPreviewBody(lista);
  }

  function open(listaId) {
    const explorerState = window.explorerState;
    if (!listaId) return;
    const unidadId = explorerState.current.unidadId;
    const listas = explorerState.listasCotejoByUnidad[unidadId] || [];
    const lista = listas.find((l) => l.id === listaId) || null;
    explorerState.listaCotejoPreview = { open: true, listaId, listaData: lista, loading: false, error: "" };
    render();
  }

  async function openBiblioteca(listaId) {
    if (!window.explorerState) return;

    console.debug("[preview] lista:open", { listaId });

    window.explorerState.listaCotejoPreview = { open: true, listaId, listaData: null, loading: true, error: "" };
    render();

    try {
      const lista = await window.obtenerListaCoTejoDetalle(listaId);
      window.explorerState.listaCotejoPreview = { open: true, listaId, listaData: lista, loading: false, error: "" };
      render();
    } catch (error) {
      console.error("[preview] lista:error", { listaId, message: error?.message });
      window.explorerState.listaCotejoPreview = {
        ...window.explorerState.listaCotejoPreview,
        loading: false,
        error: "No se pudo cargar la lista de cotejo."
      };
      render();
    }
  }

  function close() {
    const explorerState = window.explorerState;
    explorerState.listaCotejoPreview = { open: false, listaId: null, listaData: null, loading: false, error: "" };
    render();
  }

  window.ListaCotejoPreview = {
    render,
    open,
    openBiblioteca,
    close
  };
})();
