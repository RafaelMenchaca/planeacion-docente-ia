function normalizeEntityPayload(payload, keys) {
  if (!payload || typeof payload !== "object") return payload;

  for (const key of keys) {
    if (payload[key]) {
      return payload[key];
    }
  }

  return payload;
}

function normalizeListPayload(payload, keys) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== "object") return [];

  const listKeys = ["items", "data", ...keys];
  for (const key of listKeys) {
    if (Array.isArray(payload[key])) {
      return payload[key];
    }
  }

  return [];
}

async function withSession(callback) {
  const session = await window.requireSession();
  if (!session) return null;
  return callback(session.access_token);
}

async function obtenerPlanteles() {
  return withSession(async (token) => {
    const payload = await apiPlantelesList(token);
    return normalizeListPayload(payload, ["planteles"]);
  });
}

async function crearPlantel(payload) {
  return withSession(async (token) => {
    const response = await apiPlantelesCreate(payload, token);
    return normalizeEntityPayload(response, ["plantel", "item"]);
  });
}

async function obtenerGradosPorPlantel(plantelId) {
  return withSession(async (token) => {
    const payload = await apiGradosListByPlantel(plantelId, token);
    return normalizeListPayload(payload, ["grados"]);
  });
}

async function crearGrado(payload) {
  return withSession(async (token) => {
    const response = await apiGradosCreate(payload, token);
    return normalizeEntityPayload(response, ["grado", "item"]);
  });
}

async function obtenerMateriasPorGrado(gradoId) {
  return withSession(async (token) => {
    const payload = await apiMateriasListByGrado(gradoId, token);
    return normalizeListPayload(payload, ["materias"]);
  });
}

async function crearMateria(payload) {
  return withSession(async (token) => {
    const response = await apiMateriasCreate(payload, token);
    return normalizeEntityPayload(response, ["materia", "item"]);
  });
}

async function obtenerUnidadesPorMateria(materiaId) {
  return withSession(async (token) => {
    const payload = await apiUnidadesListByMateria(materiaId, token);
    return normalizeListPayload(payload, ["unidades"]);
  });
}

async function crearUnidad(payload) {
  return withSession(async (token) => {
    const response = await apiUnidadesCreate(payload, token);
    return normalizeEntityPayload(response, ["unidad", "item"]);
  });
}

async function obtenerTemasPorUnidad(unidadId) {
  return withSession(async (token) => {
    const payload = await apiTemasListByUnidad(unidadId, token);
    return normalizeListPayload(payload, ["temas"]);
  });
}

async function crearTemas(payload) {
  return withSession(async (token) => {
    const response = await apiTemasCreate(payload, token);
    return normalizeListPayload(response, ["temas", "items"]);
  });
}

async function generarPlaneacionesUnidad(payload) {
  const { unidadId, body } = payload;
  return withSession(async (token) => apiUnidadGenerar(unidadId, body, token));
}

async function generarPlaneacionesUnidadConProgreso(payload, onEvent) {
  const { unidadId, body } = payload;

  return withSession(async (token) => {
    try {
      return await apiUnidadGenerarConProgreso(unidadId, body, token, onEvent);
    } catch (error) {
      if (error && Number(error.status) >= 500) {
        return apiUnidadGenerar(unidadId, body, token);
      }
      throw error;
    }
  });
}

async function obtenerPlaneacionTema(temaId) {
  return withSession(async (token) => {
    const payload = await apiTemaPlaneacion(temaId, token);
    if (!payload) return null;

    if (Array.isArray(payload)) {
      return payload[0] || null;
    }

    if (Array.isArray(payload.items)) {
      return payload.items[0] || null;
    }

    return normalizeEntityPayload(payload, ["planeacion", "item"]);
  });
}

window.obtenerPlanteles = obtenerPlanteles;
window.crearPlantel = crearPlantel;
window.obtenerGradosPorPlantel = obtenerGradosPorPlantel;
window.crearGrado = crearGrado;
window.obtenerMateriasPorGrado = obtenerMateriasPorGrado;
window.crearMateria = crearMateria;
window.obtenerUnidadesPorMateria = obtenerUnidadesPorMateria;
window.crearUnidad = crearUnidad;
window.obtenerTemasPorUnidad = obtenerTemasPorUnidad;
window.crearTemas = crearTemas;
window.generarPlaneacionesUnidad = generarPlaneacionesUnidad;
window.generarPlaneacionesUnidadConProgreso = generarPlaneacionesUnidadConProgreso;
window.obtenerPlaneacionTema = obtenerPlaneacionTema;
