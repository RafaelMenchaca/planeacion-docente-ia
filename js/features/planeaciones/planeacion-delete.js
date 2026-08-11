(function () {
  async function deleteFromBiblioteca(planeacionId, conjuntoId) {
    const safePlanId  = normalizeBibliotecaId(planeacionId);
    const safeBatchId = normalizeBibliotecaId(conjuntoId);
    if (!safePlanId || !safeBatchId) return;

    const confirmado = await showBibConfirm(
      "¿Eliminar esta planeación?",
      "Se eliminarán también sus listas de cotejo y anexos asociados. Esta acción no se puede deshacer."
    );
    if (!confirmado) return;

    try {
      const session = await window.requireSession();
      if (!session) return;

      await apiDeletePlaneacionDirecta(safePlanId, session.access_token);
      console.info("[biblioteca] delete:success", { resourceType: "planeacion", planeacionId: safePlanId, batchId: safeBatchId });

      const conjunto = bibliotecaState.conjuntos.find(
        (c) => normalizeBibliotecaId(c.id) === safeBatchId
      );
      if (conjunto) {
        conjunto.planeaciones = (Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [])
          .filter((p) => normalizeBibliotecaId(p.id) !== safePlanId);
        conjunto.total_planeaciones = conjunto.planeaciones.length;
        conjunto.listas_cotejo = (Array.isArray(conjunto.listas_cotejo) ? conjunto.listas_cotejo : [])
          .filter((l) => normalizeBibliotecaId(l.planeacion_id) !== safePlanId);
        conjunto.total_listas_cotejo = conjunto.listas_cotejo.length;
        conjunto.anexos = (Array.isArray(conjunto.anexos) ? conjunto.anexos : [])
          .filter((a) => normalizeBibliotecaId(a.planeacion_id) !== safePlanId);
        conjunto.total_anexos = conjunto.anexos.length;
      }

      setSelectedConjunto(safeBatchId, { tab: "planeaciones" });
      renderBibliotecaDetailInPlace();
      await loadAndRenderBiblioteca({ silent: true, targetBatchId: safeBatchId, activeTab: "planeaciones" });
    } catch (error) {
      console.error("[biblioteca] Error eliminando planeacion:", error);
      alert(error.message || "No se pudo eliminar la planeación. Intenta nuevamente.");
    }
  }

  window.PlaneacionDelete = {
    deleteFromBiblioteca,
  };
})();
