(function () {
  async function deleteFromBiblioteca(examenId, conjuntoId) {
    const safeExamenId = normalizeBibliotecaId(examenId);
    const safeBatchId  = normalizeBibliotecaId(conjuntoId);
    if (!safeExamenId || !safeBatchId) return;

    const confirmado = await showBibConfirm(
      "¿Eliminar este examen?",
      "Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    try {
      const session = await window.requireSession();
      if (!session) return;

      await apiDeleteExamen(safeExamenId, session.access_token);
      console.info("[biblioteca] delete:success", { resourceType: "examen", examenId: safeExamenId, batchId: safeBatchId });

      const conjunto = bibliotecaState.conjuntos.find(
        (c) => normalizeBibliotecaId(c.id) === safeBatchId
      );
      if (conjunto) {
        conjunto.examenes = (Array.isArray(conjunto.examenes) ? conjunto.examenes : [])
          .filter((e) => normalizeBibliotecaId(e.id) !== safeExamenId);
        conjunto.total_examenes = conjunto.examenes.length;
      }

      setSelectedConjunto(safeBatchId, { tab: "examenes" });
      renderBibliotecaDetailInPlace();
      await window.BibliotecaLoader.load({ silent: true, targetBatchId: safeBatchId, activeTab: "examenes" });
    } catch (error) {
      console.error("[biblioteca] Error eliminando examen:", error);
      alert(error.message || "No se pudo eliminar el examen. Intenta nuevamente.");
    }
  }

  window.ExamDelete = {
    deleteFromBiblioteca
  };
})();
