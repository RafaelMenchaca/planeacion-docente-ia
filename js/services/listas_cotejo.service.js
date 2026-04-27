async function withListaCoTejoSession(callback) {
  const session = await window.requireSession();
  if (!session) return null;
  return callback(session.access_token);
}

async function generarListasCotejoUnidad(payload) {
  return withListaCoTejoSession(async (token) => {
    const response = await apiListasCoTejoGenerate(payload, token);
    return response;
  });
}

async function obtenerListasCotejoPorUnidad(unidadId) {
  return withListaCoTejoSession(async (token) => {
    const response = await apiListasCoTejoByUnidad(unidadId, token);
    if (Array.isArray(response)) return response;
    if (Array.isArray(response?.listas)) return response.listas;
    return [];
  });
}

async function obtenerListaCoTejoDetalle(id) {
  return withListaCoTejoSession(async (token) => {
    const response = await apiListaCoTejoById(id, token);
    return response?.lista || response;
  });
}

window.generarListasCotejoUnidad = generarListasCotejoUnidad;
window.obtenerListasCotejoPorUnidad = obtenerListasCotejoPorUnidad;
window.obtenerListaCoTejoDetalle = obtenerListaCoTejoDetalle;
