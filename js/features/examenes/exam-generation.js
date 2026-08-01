(function () {
  async function generateFromBiblioteca({ payload, accessToken, conjuntoId }) {
    console.info("[examenes] payload generacion (biblioteca)", {
      unidadId: payload.unidad_id,
      batchId: payload.batch_id,
      totalPlaneaciones: payload.planeacion_ids?.length,
      planeacionIds: payload.planeacion_ids
    });

    const genResponse = await apiExamenesGenerate(payload, accessToken);
    const jobId = genResponse?.job_id;
    if (!jobId) throw new Error("No se recibio job_id del servidor.");

    console.info("[examenes] job:created", { jobId, batchId: payload.batch_id });

    // Close modal immediately — progress will show in the card
    closeBibliotecaExamModal();
    setSelectedConjunto(conjuntoId, { tab: "examenes" });
    bibliotecaState.pendingExamenByBatchId[conjuntoId] = { message: "Iniciando generacion de examen...", error: "" };
    renderBibliotecaContent();

    // Poll in background
    ;(async () => {
      console.debug("[polling] examen:start", { jobId, batchId: conjuntoId });
      try {
        const POLL_MS  = 3000;
        const MAX_POLLS = 60;
        let polls = 0;
        while (polls < MAX_POLLS) {
          await new Promise(r => setTimeout(r, POLL_MS));
          polls++;
          const statusRes = await apiExamenGenerationStatus(jobId, accessToken);
          if (statusRes?.current_step) {
            bibliotecaState.pendingExamenByBatchId[conjuntoId] = {
              message: statusRes.current_step,
              error: ""
            };
            renderBibliotecaContent();
          }
          if (statusRes?.status === "completed") break;
          if (statusRes?.status === "failed") {
            console.error("[biblioteca] Generacion de examen fallida:", statusRes);
            throw new Error(BIB_EXAM_GENERIC_FAILURE_MESSAGE);
          }
        }
        if (polls >= MAX_POLLS) throw new Error("La generacion tardo demasiado. Intenta de nuevo.");

        console.debug("[polling] examen:finished", { jobId, batchId: conjuntoId, polls });

        delete bibliotecaState.pendingExamenByBatchId[conjuntoId];
        await loadAndRenderBiblioteca({
          silent: true,
          targetBatchId: conjuntoId,
          activeTab: "examenes"
        });
      } catch (pollError) {
        console.error("[biblioteca] Error en polling de examen:", pollError);
        bibliotecaState.pendingExamenByBatchId[conjuntoId] = {
          message: "",
          error: BIB_EXAM_GENERIC_FAILURE_MESSAGE
        };
        renderBibliotecaContent();
      }
    })();
  }

  // Temporal desde 2026-08-01: superficie global requerida por scripts clásicos.
  // Motivo: separar la generación y polling vigentes de Biblioteca sin mezclar legacy.
  // Consumidor: submitBibliotecaExamModal en biblioteca.page.js.
  // Condición de retiro: migrar la carga en una fase autorizada y confirmar que
  // el consumidor ya no depende de window.
  window.ExamGeneration = {
    generateFromBiblioteca
  };
})();
