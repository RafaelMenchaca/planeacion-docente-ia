let currentBatchId = null;

function initBatchPage() {
  const params = new URLSearchParams(window.location.search);
  const batchId = params.get("batch_id");

  if (!batchId) {
    mostrarError("No se proporciono un batch_id valido.");
    return;
  }

  currentBatchId = batchId;
  cargarPlaneacionesBatch(batchId);
}

async function cargarPlaneacionesBatch(batchId) {
  try {
    const data = await obtenerBatchPlaneaciones(batchId);
    if (!data) return;

    const planeaciones = data.planeaciones;

    if (!Array.isArray(planeaciones) || planeaciones.length === 0) {
      mostrarError("No se encontraron planeaciones para este batch.");
      return;
    }

    renderHeader(planeaciones[0], planeaciones.length);
    renderListaPlaneaciones(planeaciones);
  } catch (err) {
    console.error(err);
    mostrarError("Ocurrio un error al cargar la informacion.");
  }
}

window.archivarPlaneacionBatch = async function archivarPlaneacionBatch(id, btnEl) {
  const confirmar = confirm("Este elemento se movera a Archivados y podras restaurarlo despues. ¿Deseas continuar?");
  if (!confirmar) return;

  const prevText = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = "Archivando...";

  try {
    const res = await archivarPlaneacionApi(id);
    if (!res) return;

    if (currentBatchId) {
      await cargarPlaneacionesBatch(currentBatchId);
    }
  } catch (err) {
    console.error("Error al archivar:", err);
    alert("No se pudo archivar la planeacion.");
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = prevText;
  }
};

window.initBatchPage = initBatchPage;
window.cargarPlaneacionesBatch = cargarPlaneacionesBatch;
