(function () {
  "use strict";

  function tableRowsFromDom(tableElement) {
    if (!tableElement) return [];
    return Array.from(tableElement.querySelectorAll("tbody tr")).map((row) =>
      Array.from(row.querySelectorAll("th,td")).map((cell) => cell.textContent || ""));
  }

  window.descargarWord = async function ({ data, tableId, filenameOverride }) {
    try {
      const tableElement = document.getElementById(tableId);
      if (!tableElement) {
        alert("No se encontró la tabla para exportar.");
        return false;
      }
      const model = window.DocxExport.adapters.planeacion(data, tableRowsFromDom(tableElement));
      return await window.DocxExport.download(model, filenameOverride, `Planeacion_${data?.materia || "SinMateria"}`);
    } catch (error) {
      console.error("Error al exportar Word:", error);
      alert("Error al generar el archivo Word.");
      return false;
    }
  };

  window.descargarListaCotejoWord = async function (lista, filenameOverride) {
    try {
      const model = window.DocxExport.adapters.listaCotejo(lista);
      return await window.DocxExport.download(model, filenameOverride, "Lista_cotejo");
    } catch (error) {
      console.error("Error al exportar lista de cotejo Word:", error);
      alert(error?.message === "lista_sin_criterios" ? "No hay criterios para exportar." : "Error al generar el archivo Word.");
      return false;
    }
  };
})();
