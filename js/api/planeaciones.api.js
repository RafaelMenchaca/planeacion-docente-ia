async function apiPlaneacionesList(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones`, {
    headers: {
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
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

async function apiPlaneacionesGenerate(payload, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/generate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("No se pudo generar la planeacion con IA");
  return res.json();
}

async function apiPlaneacionesGenerateWithProgress(payload, accessToken, onEvent) {
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
    return res.json();
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

  if (donePayload) return donePayload;
  return null;
}

async function apiPlaneacionesBatch(batchId, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/batch/${batchId}`, {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error("Error al obtener planeaciones");
  return res.json();
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
window.apiPlaneacionesGenerate = apiPlaneacionesGenerate;
window.apiPlaneacionesGenerateWithProgress = apiPlaneacionesGenerateWithProgress;
window.apiPlaneacionesBatch = apiPlaneacionesBatch;
window.apiPlaneacionesGet = apiPlaneacionesGet;
window.apiPlaneacionesUpdate = apiPlaneacionesUpdate;
window.apiPlaneacionesExportExcel = apiPlaneacionesExportExcel;
