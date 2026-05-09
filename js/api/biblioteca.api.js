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

window.apiBibliotecaConjuntos = apiBibliotecaConjuntos;
window.apiBibliotecaConjuntoById = apiBibliotecaConjuntoById;
