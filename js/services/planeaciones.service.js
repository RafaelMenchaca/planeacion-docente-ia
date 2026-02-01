async function obtenerPlaneaciones() {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesList(session.access_token);
}

async function eliminarPlaneacionApi(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesDelete(id, session.access_token);
}

async function generarPlaneacionApi(payload) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesGenerate(payload, session.access_token);
}

async function obtenerBatchPlaneaciones(batchId) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesBatch(batchId, session.access_token);
}

async function obtenerPlaneacionDetalle(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesGet(id, session.access_token);
}

async function actualizarPlaneacion(id, payload) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesUpdate(id, payload, session.access_token);
}

async function exportarPlaneacionExcel(id) {
  const session = await window.requireSession();
  if (!session) return null;
  return apiPlaneacionesExportExcel(id, session.access_token);
}

window.obtenerPlaneaciones = obtenerPlaneaciones;
window.eliminarPlaneacionApi = eliminarPlaneacionApi;
window.generarPlaneacionApi = generarPlaneacionApi;
window.obtenerBatchPlaneaciones = obtenerBatchPlaneaciones;
window.obtenerPlaneacionDetalle = obtenerPlaneacionDetalle;
window.actualizarPlaneacion = actualizarPlaneacion;
window.exportarPlaneacionExcel = exportarPlaneacionExcel;
