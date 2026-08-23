(function () {
  function generateFromBiblioteca({ conjuntoId, unidadId, materia, nivel, temasSnap }) {
    // Close modal immediately
    closeBibliotecaAgregarModal();

    // Show progress in card
    setSelectedConjunto(conjuntoId, { tab: "planeaciones" });
    BibliotecaPlaneacionesPending.set(conjuntoId, {
      items: temasSnap.map(t => ({ titulo: t.titulo, status: "pending", message: "" })),
      error: ""
    });
    BibliotecaRender.renderContent();

    // Generate in background
    ;(async () => {
      try {
        const body = {
          temas:    temasSnap,
          materia:  materia || undefined,
          nivel:    nivel   || undefined,
          batch_id: conjuntoId
        };

        const result = await generarPlaneacionesUnidadConProgreso({ unidadId, body }, (evt) => {
          const pending = BibliotecaPlaneacionesPending.get(conjuntoId);
          if (!pending) return;
          const idx = (evt.index ?? 1) - 1;
          if (idx >= 0 && pending.items[idx]) {
            if (evt.type === "item_started")    pending.items[idx].status = "generating";
            if (evt.type === "item_completed")  pending.items[idx].status = "ready";
            if (evt.type === "item_error") {
              pending.items[idx].status  = "error";
              pending.items[idx].message = evt.message || "Error";
            }
            if (evt.type === "item_skipped") {
              pending.items[idx].status  = "skipped";
              pending.items[idx].message = evt.message || "Ya existe";
            }
            BibliotecaRender.renderContent();
          }
        });

        const batchId = getGenerationBatchId(result) || conjuntoId;
        window.BibliotecaLoader.applyGenerationResultToPendingItems(batchId, result || {});
        window.BibliotecaLoader.applyOptimisticPlaneacionesToConjunto(
          batchId,
          window.BibliotecaLoader.normalizeGeneratedPlaneaciones(result || {})
        );
        if (Number(result?.error_count || 0) === 0) {
          BibliotecaPlaneacionesPending.delete(conjuntoId);
          if (batchId !== conjuntoId) BibliotecaPlaneacionesPending.delete(batchId);
        }
        setSelectedConjunto(batchId, { tab: "planeaciones" });
        BibliotecaRender.renderContent();

        await window.BibliotecaLoader.load({
          silent: true,
          targetBatchId: batchId,
          activeTab: "planeaciones"
        });
      } catch (error) {
        console.error("[biblioteca] Error generando planeaciones:", error);
        const pending = BibliotecaPlaneacionesPending.get(conjuntoId);
        if (pending) pending.error = error.message || "No se pudieron generar las planeaciones.";
        BibliotecaRender.renderContent();
      }
    })();
  }

  // Temporal desde 2026-08-01: superficie global requerida por scripts clásicos.
  // Motivo: separar el coordinador vigente de Biblioteca sin modificar quick create.
  // Consumidor: submitBibliotecaAgregarModal en biblioteca.page.js.
  // Condición de retiro: migrar la carga en una fase autorizada y confirmar que
  // el consumidor ya no depende de window.
  window.PlaneacionGeneration = {
    generateFromBiblioteca
  };
})();
