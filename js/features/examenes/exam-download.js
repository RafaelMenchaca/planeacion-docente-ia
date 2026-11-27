(function () {
  async function ensureExamenDetalle(examenId, { force = false } = {}) {
    const explorerState = window.explorerState;
    if (!examenId) return null;
    if (!force && explorerState.examenDetalleById[examenId]) return explorerState.examenDetalleById[examenId];
    const examen = await window.obtenerExamenDetalle(examenId);
    explorerState.examenDetalleById[examenId] = examen;
    return examen;
  }

  async function download(examenId, filenameOverride) {
    const examen = await ensureExamenDetalle(examenId);
    if (!examen?.examen_ia) throw new Error("No hay contenido disponible para exportar.");
    const fallback = examen.titulo || "Examen_unidad";
    return window.DocxExport.download(window.DocxExport.adapters.exam(examen), filenameOverride, fallback);
  }

  async function downloadFromBiblioteca(examenId) {
    console.debug("[downloads] exam:start", { examenId });
    try {
      const conjunto = bibliotecaState.conjuntos.find((item) => Array.isArray(item.examenes)
        && item.examenes.some((exam) => normalizeBibliotecaId(exam.id) === normalizeBibliotecaId(examenId)));
      const suggested = window.AppUI.buildDownloadSuggestedName("Examen", conjunto?.titulo || "");
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "docx" });
      if (filename === null) return false;
      await download(examenId, filename);
      console.debug("[downloads] exam:success", { examenId });
      return true;
    } catch (error) {
      console.error("[downloads] exam:error", { examenId, message: error?.message });
      return false;
    }
  }

  window.ExamDownload = { download, downloadFromBiblioteca, buildModel: (...args) => window.DocxExport.adapters.exam(...args) };
})();
