(function () {
  function generateFromBiblioteca({ conjuntoId, selectedIds, planeaciones, accessToken }) {
    // Construir mapa con info de cada planeacion seleccionada para las cards temporales
    const planMap = new Map(
      (Array.isArray(planeaciones) ? planeaciones : [])
        .map((p) => [normalizeBibliotecaId(p.id), p])
    );

    // Insertar cards temporales "generating" antes de cerrar el modal
    if (!bibliotecaState.anexosGenerating[conjuntoId]) {
      bibliotecaState.anexosGenerating[conjuntoId] = {};
    }
    for (const pid of selectedIds) {
      const p = planMap.get(pid);
      bibliotecaState.anexosGenerating[conjuntoId][pid] = {
        titulo:  p?.tema || p?.custom_title || "Sin titulo",
        materia: p?.materia || null,
        nivel:   p?.nivel   || null,
        status:  "generating",
        errorMessage: ""
      };
    }

    closeBibliotecaAnexoCreateModal();
    setSelectedConjunto(conjuntoId, { tab: "anexos" });
    renderBibliotecaDetailInPlace();

    ;(async () => {
      let anySuccess = false;
      let successCount = 0;
      console.info("[anexos] generate:start", { batchId: conjuntoId, planeacionesCount: selectedIds.length });

      for (const pid of selectedIds) {
        try {
          const res = await apiGenerarAnexo(pid, accessToken);

          // Update optimista: crear anexo en el estado local para que aparezca inmediatamente
          const conjuntoObj = bibliotecaState.conjuntos.find(
            (c) => normalizeBibliotecaId(c.id) === normalizeBibliotecaId(conjuntoId)
          );
          if (conjuntoObj) {
            if (!Array.isArray(conjuntoObj.anexos)) conjuntoObj.anexos = [];
            const item = bibliotecaState.anexosGenerating[conjuntoId]?.[pid];
            conjuntoObj.anexos.push({
              id:           res.anexo_id || `tmp-${pid}`,
              planeacion_id: pid,
              titulo:        item?.titulo  || "Anexo",
              materia:       item?.materia || null,
              nivel:         item?.nivel   || null,
              status:        "generated",
              created_at:    new Date().toISOString()
            });
            conjuntoObj.total_anexos = conjuntoObj.anexos.length;
          }

          // Quitar card temporal de este pid
          if (bibliotecaState.anexosGenerating[conjuntoId]) {
            delete bibliotecaState.anexosGenerating[conjuntoId][pid];
          }
          anySuccess = true;
          successCount += 1;
        } catch (itemErr) {
          console.error("[biblioteca] Error generando anexo para planeacion", pid, itemErr);
          if (bibliotecaState.anexosGenerating[conjuntoId]?.[pid]) {
            bibliotecaState.anexosGenerating[conjuntoId][pid].status       = "error";
            bibliotecaState.anexosGenerating[conjuntoId][pid].errorMessage = itemErr?.message || "No se pudo generar el anexo.";
          }
        }

        renderBibliotecaDetailInPlace();
      }

      // Limpiar mapa si ya no queda nada generando (solo errores o vacío)
      const remaining = bibliotecaState.anexosGenerating[conjuntoId] || {};
      const allDone   = Object.values(remaining).every((v) => v.status === "error");
      if (allDone && Object.keys(remaining).length === 0) {
        delete bibliotecaState.anexosGenerating[conjuntoId];
      }

      console.info("[anexos] generate:success", {
        batchId: conjuntoId,
        successCount,
        totalSolicitados: selectedIds.length
      });

      // Reload silencioso para confirmar datos reales del servidor
      if (anySuccess) {
        await loadAndRenderBiblioteca({ silent: true, targetBatchId: conjuntoId, activeTab: "anexos" });
        delete bibliotecaState.anexosGenerating[conjuntoId];
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
