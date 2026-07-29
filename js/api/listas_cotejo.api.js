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

const listasCotejoGet = function (path, accessToken, fallbackMessage) {
  return requestListaCoTejoJson(
    `${API_BASE_URL}${path}`,
    {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store"
    },
    fallbackMessage
  );
};

async function apiListasCoTejoByUnidad(unidadId, accessToken) {
  return listasCotejoGet(
    `/api/listas-cotejo/unidad/${encodeURIComponent(unidadId)}`,
    accessToken,
    "No se pudieron obtener las listas de cotejo"
  );
}

async function apiListaCoTejoById(id, accessToken) {
  return listasCotejoGet(
    `/api/listas-cotejo/${encodeURIComponent(id)}`,
    accessToken,
    "No se pudo obtener la lista de cotejo"
  );
}

window.apiListasCoTejoGenerate = apiListasCoTejoGenerate;
window.apiListasCoTejoByUnidad = apiListasCoTejoByUnidad;
window.apiListaCoTejoById = apiListaCoTejoById;
