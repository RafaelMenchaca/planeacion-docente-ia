function buildExamJsonHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };
}

async function parseExamApiJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createExamApiError(message, status, payload) {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
}

async function requestExamJson(url, options, fallbackMessage) {
  const response = await fetch(url, options || {});
  const payload = await parseExamApiJson(response);

  if (!response.ok) {
    const message = payload?.error || payload?.message || fallbackMessage || `HTTP ${response.status}`;
    throw createExamApiError(message, response.status, payload);
  }

  return payload;
}

async function apiExamenesGenerate(payload, accessToken) {
  return requestExamJson(
    `${API_BASE_URL}/api/examenes/generate`,
    {
      method: "POST",
      headers: buildExamJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudo generar el examen"
  );
}

async function apiExamenesListByUnidad(unidadId, accessToken) {
  return requestExamJson(
    `${API_BASE_URL}/api/examenes/unidad/${encodeURIComponent(unidadId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    },
    "No se pudieron obtener los examenes de la unidad"
  );
}

async function apiExamenGenerationStatus(jobId, accessToken) {
  return requestExamJson(
    `${API_BASE_URL}/api/examenes/generacion/${encodeURIComponent(jobId)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    },
    "No se pudo obtener el progreso del examen"
  );
}

async function apiExamenById(id, accessToken) {
  return requestExamJson(
    `${API_BASE_URL}/api/examenes/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      cache: "no-store"
    },
    "No se pudo obtener el examen"
  );
}

window.apiExamenesGenerate = apiExamenesGenerate;
window.apiExamenGenerationStatus = apiExamenGenerationStatus;
window.apiExamenesListByUnidad = apiExamenesListByUnidad;
window.apiExamenById = apiExamenById;
