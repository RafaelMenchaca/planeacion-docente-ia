(function () {
  function generateFromBiblioteca({ conjuntoId, selectedIds, planeaciones, accessToken }) {
    // Close modal immediately — progress shows in card
    closeBibliotecaListaModal();
    setSelectedConjunto(conjuntoId, { tab: "listas" });

    // Build per-item data for per-card display
    const selectedIdSet = new Set(selectedIds);
    const pendingItems = (Array.isArray(planeaciones) ? planeaciones : [])
      .filter(p => selectedIdSet.has(normalizeBibliotecaId(p.id)))
      .map(p => ({ titulo: p.tema || p.custom_title || "Lista de cotejo", planeacionId: p.id }));

    bibliotecaState.pendingListaByBatchId[conjuntoId] = {
      items:  pendingItems,
      result: null,
      error:  ""
    };
    renderBibliotecaContent();

    // Generate in background
    ;(async () => {
      try {
        const payload = { planeacion_ids: selectedIds };
        const res = await apiListasCoTejoGenerate(payload, accessToken);
        const created = res?.created ?? 0;
        const skipped = Array.isArray(res?.skipped) ? res.skipped.length : (res?.skipped ?? 0);

        console.info("[listas-cotejo] generate:success", { batchId: conjuntoId, created, skipped });

        // Keep cards visible until real data loads (1.5s grace)
        await new Promise(r => setTimeout(r, 1500));
        delete bibliotecaState.pendingListaByBatchId[conjuntoId];
        await loadAndRenderBiblioteca({
          silent: true,
          targetBatchId: conjuntoId,
          activeTab: "listas"
        });
      } catch (genError) {
        console.error("[biblioteca] Error generando listas:", genError);
        const currentPending = bibliotecaState.pendingListaByBatchId[conjuntoId];
        bibliotecaState.pendingListaByBatchId[conjuntoId] = {
          items:   currentPending?.items || [],
          result:  null,
          error:   genError.message || "No se pudieron generar las listas de cotejo."
        };
        renderBibliotecaContent();
      }
    })();
  }

  // Temporal desde 2026-08-01: superficie global requerida por scripts clásicos.
  // Motivo: separar la generación vigente de listas sin introducir módulos.
  // Consumidor: submitBibliotecaListaModal en biblioteca.page.js.
  // Condición de retiro: migrar la carga en una fase autorizada y confirmar que
  // el consumidor ya no depende de window.
  window.ListaCotejoGeneration = {
    generateFromBiblioteca
  };
})();
