function buildAnexosHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };
}

async function parseAnexosApiJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createAnexosApiError(message, status, payload) {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
}

async function requestAnexosJson(url, options, fallbackMessage) {
  const response = await fetch(url, options || {});
  const payload = await parseAnexosApiJson(response);

  if (!response.ok) {
    const message = payload?.error || payload?.message || fallbackMessage || `HTTP ${response.status}`;
    throw createAnexosApiError(message, response.status, payload);
  }

  return payload;
}

const anexosGet = function (path, accessToken, fallbackMessage) {
  return requestAnexosJson(
    `${API_BASE_URL}${path}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    },
    fallbackMessage
  );
};

async function apiGenerarAnexo(planeacionId, accessToken) {
  return requestAnexosJson(
    `${API_BASE_URL}/api/anexos/generate`,
    {
      method: "POST",
      headers: buildAnexosHeaders(accessToken),
      body: JSON.stringify({ planeacion_id: planeacionId })
    },
    "No se pudo generar el anexo"
  );
}

async function apiObtenerAnexosPorBatch(batchId, accessToken) {
  return anexosGet(
    `/api/anexos/batch/${encodeURIComponent(batchId)}`,
    accessToken,
    "No se pudieron obtener los anexos del bloque"
  );
}

async function apiObtenerAnexoPorPlaneacion(planeacionId, accessToken) {
  return anexosGet(
    `/api/anexos/planeacion/${encodeURIComponent(planeacionId)}`,
    accessToken,
    "No se pudo obtener el anexo de la planeacion"
  );
}

async function apiObtenerAnexoDetalle(anexoId, accessToken) {
  return anexosGet(
    `/api/anexos/${encodeURIComponent(anexoId)}`,
    accessToken,
    "No se pudo obtener el anexo"
  );
}

async function apiRegenerarAnexo(anexoId, accessToken) {
  return requestAnexosJson(
    `${API_BASE_URL}/api/anexos/${encodeURIComponent(anexoId)}/regenerate`,
    {
      method: "POST",
      headers: buildAnexosHeaders(accessToken)
    },
    "No se pudo regenerar el anexo"
  );
}

window.apiGenerarAnexo = apiGenerarAnexo;
window.apiObtenerAnexosPorBatch = apiObtenerAnexosPorBatch;
window.apiObtenerAnexoPorPlaneacion = apiObtenerAnexoPorPlaneacion;
window.apiObtenerAnexoDetalle = apiObtenerAnexoDetalle;
window.apiRegenerarAnexo = apiRegenerarAnexo;
