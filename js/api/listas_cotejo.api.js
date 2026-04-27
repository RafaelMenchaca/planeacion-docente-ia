function buildListaCoTejoHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };
}

async function parseListaCoTejoApiJson(response) {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createListaCoTejoApiError(message, status, payload) {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
}

async function requestListaCoTejoJson(url, options, fallbackMessage) {
  const response = await fetch(url, options || {});
  const payload = await parseListaCoTejoApiJson(response);

  if (!response.ok) {
    const message = payload?.error || payload?.message || fallbackMessage || `HTTP ${response.status}`;
    throw createListaCoTejoApiError(message, response.status, payload);
  }

  return payload;
}

async function apiListasCoTejoGenerate(payload, accessToken) {
  return requestListaCoTejoJson(
    `${API_BASE_URL}/api/listas-cotejo/generate`,
    {
      method: "POST",
      headers: buildListaCoTejoHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudieron generar las listas de cotejo"
  );
}

async function apiListasCoTejoByUnidad(unidadId, accessToken) {
  return requestListaCoTejoJson(
    `${API_BASE_URL}/api/listas-cotejo/unidad/${encodeURIComponent(unidadId)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    },
    "No se pudieron obtener las listas de cotejo"
  );
}

async function apiListaCoTejoById(id, accessToken) {
  return requestListaCoTejoJson(
    `${API_BASE_URL}/api/listas-cotejo/${encodeURIComponent(id)}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    },
    "No se pudo obtener la lista de cotejo"
  );
}

window.apiListasCoTejoGenerate = apiListasCoTejoGenerate;
window.apiListasCoTejoByUnidad = apiListasCoTejoByUnidad;
window.apiListaCoTejoById = apiListaCoTejoById;
