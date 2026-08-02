(function () {
  async function deleteFromBiblioteca(conjuntoId) {
    const safeBatchId = normalizeBibliotecaId(conjuntoId);
    if (!safeBatchId) return;

    const conjunto = findConjuntoById(safeBatchId);
    const nombre = conjunto?.titulo || "este bloque";

    const confirmado = await showBibConfirm(
      `¿Eliminar "${nombre}"?`,
      `Se eliminará el bloque completo: planeaciones, exámenes, listas de cotejo y anexos. Esta acción no se puede deshacer.`
    );
    if (!confirmado) return;

    try {
      const session = await window.requireSession();
      if (!session) return;

      await apiBibliotecaDeleteBloque(safeBatchId, session.access_token);
      console.info("[biblioteca] delete:success", { resourceType: "bloque", batchId: safeBatchId });

      bibliotecaState.conjuntos = bibliotecaState.conjuntos.filter(
        (c) => normalizeBibliotecaId(c.id) !== safeBatchId
      );
      if (normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === safeBatchId) {
        BibliotecaSelection.setSelectedConjuntoId(bibliotecaState.conjuntos[0]?.id || null);
      }
      delete bibliotecaState.activeTab[safeBatchId];
      delete bibliotecaState.pendingPlaneacionesByBatchId[safeBatchId];
      delete bibliotecaState.pendingExamenByBatchId[safeBatchId];
      delete bibliotecaState.pendingListaByBatchId[safeBatchId];
      delete bibliotecaState.anexosGenerating[safeBatchId];

      renderBibliotecaContent();
      await loadAndRenderBiblioteca({ silent: true });
    } catch (error) {
      console.error("[biblioteca] Error eliminando bloque:", error);
      alert(error.message || "No se pudo eliminar el bloque. Intenta nuevamente.");
    }
  }

  window.BibliotecaBlockDelete = {
    deleteFromBiblioteca,
  };
})();
