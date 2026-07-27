const bibliotecaGet = async function (path, accessToken) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
};

async function apiBibliotecaConjuntos(accessToken) {
  return bibliotecaGet("/api/biblioteca/conjuntos", accessToken);
}

async function apiBibliotecaConjuntoById(batchId, accessToken) {
  return bibliotecaGet(`/api/biblioteca/conjuntos/${encodeURIComponent(batchId)}`, accessToken);
}

const bibliotecaDelete = async function (path, accessToken) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
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
};

async function apiBibliotecaDeleteBloque(batchId, accessToken) {
  return bibliotecaDelete(`/api/biblioteca/bloques/${encodeURIComponent(batchId)}`, accessToken);
}

async function apiDeletePlaneacionDirecta(id, accessToken) {
  return bibliotecaDelete(`/api/planeaciones/${encodeURIComponent(id)}/directo`, accessToken);
}

async function apiDeleteExamen(id, accessToken) {
  return bibliotecaDelete(`/api/examenes/${encodeURIComponent(id)}`, accessToken);
}

async function apiDeleteListaCotejo(id, accessToken) {
  return bibliotecaDelete(`/api/listas-cotejo/${encodeURIComponent(id)}`, accessToken);
}

async function apiDeleteAnexo(id, accessToken) {
  return bibliotecaDelete(`/api/anexos/${encodeURIComponent(id)}`, accessToken);
}

window.apiBibliotecaConjuntos = apiBibliotecaConjuntos;
window.apiBibliotecaConjuntoById = apiBibliotecaConjuntoById;
window.apiBibliotecaDeleteBloque = apiBibliotecaDeleteBloque;
window.apiDeletePlaneacionDirecta = apiDeletePlaneacionDirecta;
window.apiDeleteExamen = apiDeleteExamen;
window.apiDeleteListaCotejo = apiDeleteListaCotejo;
window.apiDeleteAnexo = apiDeleteAnexo;
