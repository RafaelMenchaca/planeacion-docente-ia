let currentBatchId = null;

function initBatchPage() {
  const params = new URLSearchParams(window.location.search);
  const batchId = params.get("batch_id");

  if (!batchId) {
    mostrarError("No se proporcionó un batch_id válido.");
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

    renderHeader(planeaciones[0]);
    renderListaPlaneaciones(planeaciones);

  } catch (err) {
    console.error(err);
    mostrarError("Ocurrió un error al cargar la información.");
  }
}

window.eliminarPlaneacionBatch = async function (id, btnEl) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta planeación?');
  if (!confirmar) return;

  const prevText = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = 'Eliminando...';

  try {
    const res = await eliminarPlaneacionApi(id);
    if (!res) return;

    if (currentBatchId) {
      cargarPlaneacionesBatch(currentBatchId);
    }

  } catch (err) {
    console.error('Error al eliminar:', err);
    alert('No se pudo eliminar la planeación.');
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = prevText;
  }
};

window.initBatchPage = initBatchPage;
window.cargarPlaneacionesBatch = cargarPlaneacionesBatch;
