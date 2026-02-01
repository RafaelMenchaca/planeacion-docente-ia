function initBatchPage() {
  const params = new URLSearchParams(window.location.search);
  const batchId = params.get("batch_id");

  if (!batchId) {
    mostrarError("No se proporcionó un batch_id válido.");
    return;
  }

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

    renderHeader(planeaciones[0]);
    renderListaPlaneaciones(planeaciones);

  } catch (err) {
    console.error(err);
    mostrarError("Ocurrió un error al cargar la información.");
  }
}

window.initBatchPage = initBatchPage;
window.cargarPlaneacionesBatch = cargarPlaneacionesBatch;
