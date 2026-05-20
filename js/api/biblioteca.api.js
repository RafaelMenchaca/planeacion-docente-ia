async function apiBibliotecaConjuntos(accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/biblioteca/conjuntos`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiBibliotecaConjuntoById(batchId, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/biblioteca/conjuntos/${encodeURIComponent(batchId)}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
    cache: "no-store"
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiBibliotecaDeleteBloque(batchId, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/biblioteca/bloques/${encodeURIComponent(batchId)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiDeletePlaneacionDirecta(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/planeaciones/${encodeURIComponent(id)}/directo`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiDeleteExamen(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/examenes/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiDeleteListaCotejo(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/listas-cotejo/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

async function apiDeleteAnexo(id, accessToken) {
  const res = await fetch(`${API_BASE_URL}/api/anexos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${accessToken}` }
  });
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    let msg = `HTTP ${res.status}`;
    try { msg = JSON.parse(body)?.error || msg; } catch {}
    throw new Error(msg);
  }
  return res.json();
}

window.apiBibliotecaConjuntos = apiBibliotecaConjuntos;
window.apiBibliotecaConjuntoById = apiBibliotecaConjuntoById;
window.apiBibliotecaDeleteBloque = apiBibliotecaDeleteBloque;
window.apiDeletePlaneacionDirecta = apiDeletePlaneacionDirecta;
window.apiDeleteExamen = apiDeleteExamen;
window.apiDeleteListaCotejo = apiDeleteListaCotejo;
window.apiDeleteAnexo = apiDeleteAnexo;
