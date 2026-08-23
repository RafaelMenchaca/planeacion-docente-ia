(function () {
  async function deleteFromBiblioteca(anexoId, conjuntoId) {
    const safeAnexoId = normalizeBibliotecaId(anexoId);
    const safeBatchId = normalizeBibliotecaId(conjuntoId);
    if (!safeAnexoId || !safeBatchId) return;

    const confirmado = await showBibConfirm(
      "¿Eliminar este anexo?",
      "Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    try {
      const session = await window.requireSession();
      if (!session) return;

      await apiDeleteAnexo(safeAnexoId, session.access_token);
      console.info("[biblioteca] delete:success", { resourceType: "anexo", anexoId: safeAnexoId, batchId: safeBatchId });

      const conjunto = bibliotecaState.conjuntos.find(
        (c) => normalizeBibliotecaId(c.id) === safeBatchId
      );
      if (conjunto) {
        conjunto.anexos = (Array.isArray(conjunto.anexos) ? conjunto.anexos : [])
          .filter((a) => normalizeBibliotecaId(a.id) !== safeAnexoId);
        conjunto.total_anexos = conjunto.anexos.length;
      }

      setSelectedConjunto(safeBatchId, { tab: "anexos" });
      renderBibliotecaDetailInPlace();
      await window.BibliotecaLoader.load({ silent: true, targetBatchId: safeBatchId, activeTab: "anexos" });
    } catch (error) {
      console.error("[biblioteca] Error eliminando anexo:", error);
      alert(error.message || "No se pudo eliminar el anexo. Intenta nuevamente.");
    }
  }

  window.AnexoDelete = {
    deleteFromBiblioteca
  };
})();
