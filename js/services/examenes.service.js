function normalizeExamEntityPayload(payload, keys) {
  if (!payload || typeof payload !== "object") return payload;

  for (const key of keys) {
    if (payload[key]) {
      return payload[key];
    }
  }

  return payload;
}

function normalizeExamListPayload(payload, keys) {
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

async function withExamSession(callback) {
  const session = await window.requireSession();
  if (!session) return null;
  return callback(session.access_token);
}

async function generarExamenUnidad(payload) {
  return withExamSession(async (token) => {
    const response = await apiExamenesGenerate(payload, token);
    return normalizeExamEntityPayload(response, ["examen", "item"]);
  });
}

async function obtenerEstadoGeneracionExamen(jobId) {
  return withExamSession(async (token) => {
    return apiExamenGenerationStatus(jobId, token);
  });
}

async function obtenerExamenesPorUnidad(unidadId) {
  return withExamSession(async (token) => {
    const response = await apiExamenesListByUnidad(unidadId, token);
    return normalizeExamListPayload(response, ["examenes"]);
  });
}

async function obtenerExamenDetalle(id) {
  return withExamSession(async (token) => {
    const response = await apiExamenById(id, token);
    return normalizeExamEntityPayload(response, ["examen", "item"]);
  });
}

window.generarExamenUnidad = generarExamenUnidad;
window.obtenerEstadoGeneracionExamen = obtenerEstadoGeneracionExamen;
window.obtenerExamenesPorUnidad = obtenerExamenesPorUnidad;
window.obtenerExamenDetalle = obtenerExamenDetalle;
