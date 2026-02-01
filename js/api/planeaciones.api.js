async function apiPlaneacionesList(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

async function apiPlaneacionesDelete(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
    method: "DELETE",
    headers: {
      "Authorization": `Bearer ${accessToken}`
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
      "Authorization": `Bearer ${accessToken}`
    },
    body: JSON.stringify(payload)
  });
  if (!res.ok) throw new Error("No se pudo generar la planeación con IA");
  return res.json();
}

async function apiPlaneacionesBatch(batchId, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/batch/${batchId}`, {
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (!res.ok) throw new Error("Error al obtener planeaciones");
  return res.json();
}

async function apiPlaneacionesGet(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
    headers: {
      "Authorization": `Bearer ${accessToken}`
    }
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("STATUS:", res.status);
    console.error("RESPUESTA:", text);
    throw new Error("Error al obtener la planeación");
  }
  return res.json();
}

async function apiPlaneacionesUpdate(id, payload, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
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
window.apiPlaneacionesBatch = apiPlaneacionesBatch;
window.apiPlaneacionesGet = apiPlaneacionesGet;
window.apiPlaneacionesUpdate = apiPlaneacionesUpdate;
window.apiPlaneacionesExportExcel = apiPlaneacionesExportExcel;
