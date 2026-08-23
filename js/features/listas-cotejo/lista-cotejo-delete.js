(function () {
  async function deleteFromBiblioteca(listaId, conjuntoId) {
    const safeListaId = normalizeBibliotecaId(listaId);
    const safeBatchId = normalizeBibliotecaId(conjuntoId);
    if (!safeListaId || !safeBatchId) return;

    const confirmado = await showBibConfirm(
      "¿Eliminar esta lista de cotejo?",
      "Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    try {
      const session = await window.requireSession();
      if (!session) return;

      await apiDeleteListaCotejo(safeListaId, session.access_token);
      console.info("[biblioteca] delete:success", { resourceType: "lista_cotejo", listaId: safeListaId, batchId: safeBatchId });

      const conjunto = bibliotecaState.conjuntos.find(
        (c) => normalizeBibliotecaId(c.id) === safeBatchId
      );
      if (conjunto) {
        conjunto.listas_cotejo = (Array.isArray(conjunto.listas_cotejo) ? conjunto.listas_cotejo : [])
          .filter((l) => normalizeBibliotecaId(l.id) !== safeListaId);
        conjunto.total_listas_cotejo = conjunto.listas_cotejo.length;
      }

      setSelectedConjunto(safeBatchId, { tab: "listas" });
      renderBibliotecaDetailInPlace();
      await window.BibliotecaLoader.load({ silent: true, targetBatchId: safeBatchId, activeTab: "listas" });
    } catch (error) {
      console.error("[biblioteca] Error eliminando lista de cotejo:", error);
      alert(error.message || "No se pudo eliminar la lista de cotejo. Intenta nuevamente.");
    }
  }

  window.ListaCotejoDelete = {
    deleteFromBiblioteca
  };
})();
