(function () {
  async function download(lista) {
    const suggested = window.AppUI.buildDownloadSuggestedName("Lista_cotejo", lista.tema || lista.titulo);
    const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
    if (filename === null) return;
    if (typeof window.descargarListaCotejoWord === "function") {
      window.descargarListaCotejoWord(lista, filename);
    }
  }

  async function downloadBiblioteca(listaId) {
    console.debug("[downloads] lista:start", { listaId });
    try {
      const lista = await window.obtenerListaCoTejoDetalle(listaId);

      const suggested = window.AppUI.buildDownloadSuggestedName(
        "Lista_cotejo",
        lista?.tema || lista?.titulo
      );
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;

      if (typeof window.descargarListaCotejoWord === "function") {
        window.descargarListaCotejoWord(lista, filename);
      }
      console.debug("[downloads] lista:success", { listaId });
    } catch (error) {
      console.error("[downloads] lista:error", { listaId, message: error?.message });
    }
  }

  window.ListaCotejoDownload = {
    download,
    downloadBiblioteca
  };
})();
