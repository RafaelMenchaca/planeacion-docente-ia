(function () {
  function generateFromBiblioteca({ conjuntoId, selections, planeaciones, accessToken }) {
    // Construir mapa con info de cada planeacion seleccionada para las cards temporales
    const planMap = new Map(
      (Array.isArray(planeaciones) ? planeaciones : [])
        .map((p) => [normalizeBibliotecaId(p.id), p])
    );

    // Insertar cards temporales "generating" antes de cerrar el modal
    if (!BibliotecaAnexosPending.getBatch(conjuntoId)) {
      BibliotecaAnexosPending.setBatch(conjuntoId, {});
    }
    for (const selection of selections) {
      const pid = selection.planeacionId;
      const tipo = window.CuadernilloTypes.get(selection.tipoCuadernillo);
      const p = planMap.get(pid);
      BibliotecaAnexosPending.setItem(conjuntoId, pid, {
        titulo:  p?.tema || p?.custom_title || "Sin titulo",
        materia: p?.materia || null,
        nivel:   p?.nivel   || null,
        tipoCuadernillo: tipo?.id || null,
        tipoLabel: tipo?.label || "",
        status:  "generating",
        errorMessage: ""
      });
    }

    closeBibliotecaAnexoCreateModal({ force: true });
    setSelectedConjunto(conjuntoId, { tab: "anexos" });
    renderBibliotecaDetailInPlace();

    ;(async () => {
      let anySuccess = false;
      let successCount = 0;
      console.info("[anexos] generate:start", { batchId: conjuntoId, planeacionesCount: selections.length });

      for (const selection of selections) {
        const pid = selection.planeacionId;
        try {
          const res = await apiGenerarAnexo(pid, selection.tipoCuadernillo, accessToken);

          // Update optimista: crear anexo en el estado local para que aparezca inmediatamente
          const conjuntoObj = bibliotecaState.conjuntos.find(
            (c) => normalizeBibliotecaId(c.id) === normalizeBibliotecaId(conjuntoId)
          );
          if (conjuntoObj) {
            if (!Array.isArray(conjuntoObj.anexos)) conjuntoObj.anexos = [];
            const item = BibliotecaAnexosPending.getItem(conjuntoId, pid);
            conjuntoObj.anexos.push({
              id:           res.anexo_id || `tmp-${pid}`,
              planeacion_id: pid,
              titulo:        item?.titulo  || "Anexo",
              materia:       item?.materia || null,
              nivel:         item?.nivel   || null,
              tipo_cuadernillo: selection.tipoCuadernillo,
              schema_version: 2,
              prompt_version: "v2_cuadernillo_segmentado",
              status:        "generated",
              created_at:    new Date().toISOString()
            });
            conjuntoObj.total_anexos = conjuntoObj.anexos.length;
          }

          // Quitar card temporal de este pid
          if (BibliotecaAnexosPending.getBatch(conjuntoId)) {
            BibliotecaAnexosPending.deleteItem(conjuntoId, pid);
          }
          anySuccess = true;
          successCount += 1;
        } catch (itemErr) {
          console.error("[biblioteca] Error generando anexo para planeacion", pid, itemErr);
          const pendingItem = BibliotecaAnexosPending.getItem(conjuntoId, pid);
          if (pendingItem) {
            pendingItem.status       = "error";
            pendingItem.errorMessage = itemErr?.message || "No se pudo generar el anexo.";
          }
        }

        renderBibliotecaDetailInPlace();
      }

      // Limpiar mapa si ya no queda nada generando (solo errores o vacío)
      const remaining = BibliotecaAnexosPending.getBatch(conjuntoId) || {};
      const allDone   = Object.values(remaining).every((v) => v.status === "error");
      if (allDone && Object.keys(remaining).length === 0) {
        BibliotecaAnexosPending.deleteBatch(conjuntoId);
      }

      const errorCount = selections.length - successCount;
      const finalEvent = successCount === selections.length
        ? "[anexos] generate:success"
        : successCount > 0
          ? "[anexos] generate:partial"
          : "[anexos] generate:error";
      const logFinal = successCount === selections.length
        ? console.info
        : successCount > 0
          ? console.warn
          : console.error;
      logFinal(finalEvent, {
        batchId: conjuntoId,
        successCount,
        errorCount,
        totalSolicitados: selections.length
      });

      // Reload silencioso para confirmar datos reales del servidor
      if (anySuccess) {
        await window.BibliotecaLoader.load({ silent: true, targetBatchId: conjuntoId, activeTab: "anexos" });
        const pendingAfterReload = BibliotecaAnexosPending.getBatch(conjuntoId) || {};
        if (Object.keys(pendingAfterReload).length === 0) {
          BibliotecaAnexosPending.deleteBatch(conjuntoId);
        }
      }
    })();
  }

  // Superficie global requerida por scripts clásicos.
  // Consumidor actual: submitBibliotecaAnexoCreateModal en biblioteca.page.js.
  // Condición de retiro: migrar la carga a módulos en una fase autorizada y
  // confirmar que el consumidor ya no depende de window.
  window.AnexoGeneration = {
    generateFromBiblioteca
  };
})();
