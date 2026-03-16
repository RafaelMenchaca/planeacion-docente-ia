async function parsePlaneacionesJson(response) {
  const text = await response.text();
  if (!text) return null;

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function createPlaneacionesApiError(message, status, payload) {
  const error = new Error(message);
  error.status = status;
  error.payload = payload;
  return error;
}

async function requestPlaneacionesJson(url, options, fallbackMessage) {
  const response = await fetch(url, options);
  const payload = await parsePlaneacionesJson(response);

  if (!response.ok) {
    const message =
      payload?.error || payload?.message || fallbackMessage || `HTTP ${response.status}`;
    throw createPlaneacionesApiError(message, response.status, payload);
  }

  return payload;
}

async function apiPlaneacionesList(accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "Error al obtener planeaciones"
  );
}

async function apiPlaneacionesDelete(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

async function apiPlaneacionesArchive(id, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/${encodeURIComponent(id)}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo archivar la planeacion"
  );
}

async function apiPlaneacionesRestore(id, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/${encodeURIComponent(id)}/restore`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo restaurar la planeacion"
  );
}

async function apiPlaneacionesArchiveBatch(batchId, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/batch/${encodeURIComponent(batchId)}/archive`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo archivar la ruta"
  );
}

async function apiPlaneacionesRestoreBatch(batchId, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/batch/${encodeURIComponent(batchId)}/restore`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo restaurar la ruta"
  );
}

async function apiPlaneacionesArchived(accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/archived`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudieron obtener los archivados"
  );
}

async function apiPlaneacionesPermanentDelete(id, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/${encodeURIComponent(id)}/permanent`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar permanentemente la planeacion"
  );
}

async function apiPlaneacionesPermanentDeleteBatch(batchId, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/batch/${encodeURIComponent(batchId)}/permanent`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    },
    "No se pudo eliminar permanentemente la ruta"
  );
}

async function apiPlaneacionesGenerate(payload, accessToken) {
  console.log("[planeacion-debug] request POST /api/planeaciones/generate", payload);

  const res = await fetch(`${API_BASE_URL}/api/planeaciones/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("No se pudo generar la planeacion con IA");
  const responsePayload = await res.json();
  console.log("[planeacion-debug] response POST /api/planeaciones/generate", responsePayload);
  return responsePayload;
}

async function apiPlaneacionesGenerateWithProgress(payload, accessToken, onEvent) {
  console.log("[planeacion-debug] request POST /api/planeaciones/generate?stream=1", payload);

  const res = await fetch(`${API_BASE_URL}/api/planeaciones/generate?stream=1`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });

  if (!res.ok) {
    throw new Error("No se pudo generar la planeacion con IA");
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();

  if (contentType.includes("application/json")) {
    const responsePayload = await res.json();
    console.log("[planeacion-debug] response POST /api/planeaciones/generate?stream=1", responsePayload);
    return responsePayload;
  }

  if (!res.body) {
    return null;
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let donePayload = null;

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() || "";

    lines.forEach((rawLine) => {
      const line = rawLine.trim();
      if (!line || line.startsWith("event:")) return;

      const payloadLine = line.startsWith("data:") ? line.slice(5).trim() : line;
      if (!payloadLine || payloadLine === "[DONE]") return;

      try {
        const evt = JSON.parse(payloadLine);
        if (typeof onEvent === "function") {
          onEvent(evt);
        }
        if (evt.type === "done" && evt.data) {
          donePayload = evt.data;
        }
      } catch {
        // Ignore malformed event chunks from stream.
      }
    });
  }

  if (donePayload) {
    console.log("[planeacion-debug] response POST /api/planeaciones/generate?stream=1", donePayload);
    return donePayload;
  }
  return null;
}

async function apiPlaneacionesBatch(batchId, accessToken) {
  return requestPlaneacionesJson(
    `${API_BASE_URL}/api/planeaciones/batch/${encodeURIComponent(batchId)}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`
      }
    },
    "Error al obtener planeaciones"
  );
}

async function apiPlaneacionesGet(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("STATUS:", res.status);
    console.error("RESPUESTA:", text);
    throw new Error("Error al obtener la planeacion");
  }
  return res.json();
}

async function apiPlaneacionesByTema(temaId, accessToken) {
  const primary = await fetch(
    `${API_BASE_URL}/api/temas/${encodeURIComponent(temaId)}/planeacion`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    }
  );

  if (primary.status === 404) {
    const fallback = await fetch(
      `${API_BASE_URL}/api/planeaciones?tema_id=${encodeURIComponent(temaId)}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    if (fallback.status === 404) {
      return null;
    }

    if (!fallback.ok) {
      throw new Error("Error al obtener la planeacion por tema");
    }

    return fallback.json();
  }

  if (!primary.ok) {
    throw new Error("Error al obtener la planeacion por tema");
  }

  return primary.json();
}

async function apiPlaneacionesUpdate(id, payload, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("Error al guardar cambios");
  return res.json();
}

async function apiPlaneacionesExportExcel(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}/export/excel`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error("No se pudo generar el Excel");
  return res.blob();
}

window.apiPlaneacionesList = apiPlaneacionesList;
window.apiPlaneacionesDelete = apiPlaneacionesDelete;
window.apiPlaneacionesArchive = apiPlaneacionesArchive;
window.apiPlaneacionesRestore = apiPlaneacionesRestore;
window.apiPlaneacionesArchiveBatch = apiPlaneacionesArchiveBatch;
window.apiPlaneacionesRestoreBatch = apiPlaneacionesRestoreBatch;
window.apiPlaneacionesArchived = apiPlaneacionesArchived;
window.apiPlaneacionesPermanentDelete = apiPlaneacionesPermanentDelete;
window.apiPlaneacionesPermanentDeleteBatch = apiPlaneacionesPermanentDeleteBatch;
window.apiPlaneacionesGenerate = apiPlaneacionesGenerate;
window.apiPlaneacionesGenerateWithProgress = apiPlaneacionesGenerateWithProgress;
window.apiPlaneacionesBatch = apiPlaneacionesBatch;
window.apiPlaneacionesGet = apiPlaneacionesGet;
window.apiPlaneacionesByTema = apiPlaneacionesByTema;
window.apiPlaneacionesUpdate = apiPlaneacionesUpdate;
window.apiPlaneacionesExportExcel = apiPlaneacionesExportExcel;
