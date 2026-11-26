(function () {
  async function downloadFromBiblioteca(planeacionId) {
    console.debug("[downloads] planeacion:start", { planeacionId });
    try {
      const planeacion = await window.obtenerPlaneacionDetalle(planeacionId);
      if (!planeacion) {
        alert("No se pudo obtener la planeacion.");
        return false;
      }
      const suggested = window.AppUI.buildDownloadSuggestedName("Planeacion", planeacion.tema || planeacion.materia);
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "docx" });
      if (filename === null) return false;
      await window.DocxExport.download(window.DocxExport.adapters.planeacion(planeacion), filename, "Planeacion");
      console.debug("[downloads] planeacion:success", { planeacionId });
      return true;
    } catch (error) {
      console.error("[downloads] planeacion:error", { planeacionId, message: error?.message });
      alert("No se pudo descargar la planeacion. Intenta nuevamente.");
      return false;
    }
  }

  window.PlaneacionDownload = { downloadFromBiblioteca };
})();
