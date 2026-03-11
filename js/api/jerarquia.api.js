function buildJsonHeaders(accessToken) {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  };
}

async function parseApiJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createApiError(message, status, payload) {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
}

async function requestJson(url, options, fallbackMessage) {
  const response = await fetch(url, options);
  const payload = await parseApiJson(response);

  if (!response.ok) {
    const message = payload?.error || payload?.message || fallbackMessage || `HTTP ${response.status}`;
    throw createApiError(message, response.status, payload);
  }

  return payload;
}

async function apiPlantelesList(accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/planteles`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudieron obtener los planteles"
  );
}

async function apiPlantelesCreate(payload, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/planteles`,
    {
      method: "POST",
      headers: buildJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudo crear el plantel"
  );
}

async function apiPlantelesDelete(id, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/planteles/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar el plantel"
  );
}

async function apiGradosListByPlantel(plantelId, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/planteles/${encodeURIComponent(plantelId)}/grados`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudieron obtener los grados"
  );
}

async function apiGradosCreate(payload, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/grados`,
    {
      method: "POST",
      headers: buildJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudo crear el grado"
  );
}

async function apiGradosDelete(id, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/grados/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar el grado"
  );
}

async function apiMateriasListByGrado(gradoId, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/grados/${encodeURIComponent(gradoId)}/materias`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudieron obtener las materias"
  );
}

async function apiMateriasCreate(payload, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/materias`,
    {
      method: "POST",
      headers: buildJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudo crear la materia"
  );
}

async function apiMateriasDelete(id, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/materias/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar la materia"
  );
}

async function apiUnidadesListByMateria(materiaId, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/materias/${encodeURIComponent(materiaId)}/unidades`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudieron obtener las unidades"
  );
}

async function apiUnidadesCreate(payload, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/unidades`,
    {
      method: "POST",
      headers: buildJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudo crear la unidad"
  );
}

async function apiUnidadesDelete(id, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/unidades/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar la unidad"
  );
}

async function apiTemasListByUnidad(unidadId, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/unidades/${encodeURIComponent(unidadId)}/temas`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudieron obtener los temas"
  );
}

async function apiTemasCreate(payload, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/temas`,
    {
      method: "POST",
      headers: buildJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudieron crear los temas"
  );
}

async function apiTemasDelete(id, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/temas/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar el tema"
  );
}

async function apiUnidadGenerar(unidadId, payload, accessToken) {
  return requestJson(
    `${API_BASE_URL}/api/unidades/${encodeURIComponent(unidadId)}/generar`,
    {
      method: "POST",
      headers: buildJsonHeaders(accessToken),
      body: JSON.stringify(payload)
    },
    "No se pudieron generar las planeaciones"
  );
}

async function apiUnidadGenerarConProgreso(unidadId, payload, accessToken, onEvent) {
  const response = await fetch(`${API_BASE_URL}/api/unidades/${encodeURIComponent(unidadId)}/generar?stream=1`, {
    method: "POST",
    headers: {
      ...buildJsonHeaders(accessToken),
      Accept: "text/event-stream, application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const payloadError = await parseApiJson(response);
    const message = payloadError?.error || payloadError?.message || "No se pudieron generar las planeaciones";
    throw createApiError(message, response.status, payloadError);
  }

  const contentType = (response.headers.get("content-type") || "").toLowerCase();
  if (contentType.includes("application/json")) {
    return parseApiJson(response);
  }

  if (!response.body) {
    return null;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let donePayload = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const chunks = buffer.split("\n");
    buffer = chunks.pop() || "";

    chunks.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("event:")) return;

      const payloadLine = line.startsWith("data:") ? line.slice(5).trim() : line;
      if (!payloadLine || payloadLine === "[DONE]") return;

      try {
        const evt = JSON.parse(payloadLine);
        if (typeof onEvent === "function") {
          onEvent(evt);
        }

        if (evt.type === "done") {
          donePayload = evt.data || evt.payload || null;
        }
      } catch {
        // Ignore malformed event chunks.
      }
    });
  }

  return donePayload;
}

async function apiTemaPlaneacion(temaId, accessToken) {
  const primaryUrl = `${API_BASE_URL}/api/temas/${encodeURIComponent(temaId)}/planeacion`;
  const primaryResponse = await fetch(primaryUrl, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (primaryResponse.ok) {
    return parseApiJson(primaryResponse);
  }

  if (primaryResponse.status !== 404) {
    const payload = await parseApiJson(primaryResponse);
    const message = payload?.error || payload?.message || "No se pudo obtener la planeacion del tema";
    throw createApiError(message, primaryResponse.status, payload);
  }

  const fallbackResponse = await fetch(`${API_BASE_URL}/api/planeaciones?tema_id=${encodeURIComponent(temaId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });

  if (fallbackResponse.status === 404) {
    return null;
  }

  const fallbackPayload = await parseApiJson(fallbackResponse);
  if (!fallbackResponse.ok) {
    const message = fallbackPayload?.error || fallbackPayload?.message || "No se pudo obtener la planeacion del tema";
    throw createApiError(message, fallbackResponse.status, fallbackPayload);
  }

  return fallbackPayload;
}

window.apiPlantelesList = apiPlantelesList;
window.apiPlantelesCreate = apiPlantelesCreate;
window.apiPlantelesDelete = apiPlantelesDelete;
window.apiGradosListByPlantel = apiGradosListByPlantel;
window.apiGradosCreate = apiGradosCreate;
window.apiGradosDelete = apiGradosDelete;
window.apiMateriasListByGrado = apiMateriasListByGrado;
window.apiMateriasCreate = apiMateriasCreate;
window.apiMateriasDelete = apiMateriasDelete;
window.apiUnidadesListByMateria = apiUnidadesListByMateria;
window.apiUnidadesCreate = apiUnidadesCreate;
window.apiUnidadesDelete = apiUnidadesDelete;
window.apiTemasListByUnidad = apiTemasListByUnidad;
window.apiTemasCreate = apiTemasCreate;
window.apiTemasDelete = apiTemasDelete;
window.apiUnidadGenerar = apiUnidadGenerar;
window.apiUnidadGenerarConProgreso = apiUnidadGenerarConProgreso;
window.apiTemaPlaneacion = apiTemaPlaneacion;
