document.addEventListener("DOMContentLoaded", () => {
  const params = new URLSearchParams(window.location.search);
  const batchId = params.get("batch_id");

  if (!batchId) {
    mostrarError("No se proporcionó un batch_id válido.");
    return;
  }

  cargarPlaneacionesBatch(batchId);
});

async function cargarPlaneacionesBatch(batchId) {
  try {
    //  OBTENER SESIÓN
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "login.html";
      return;
    }

    //  FETCH CON TOKEN (CLAVE)
    const res = await fetch(
      `${API_BASE_URL}/api/planeaciones/batch/${batchId}`,
      {
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        }
      }
    );

    if (!res.ok) {
      throw new Error("Error al obtener planeaciones");
    }

    const data = await res.json();
    const planeaciones = data.planeaciones;

    if (!Array.isArray(planeaciones) || planeaciones.length === 0) {
      mostrarError("No se encontraron planeaciones para este batch.");
      return;
    }

    renderHeader(planeaciones[0]);
    renderListaPlaneaciones(planeaciones);

  } catch (err) {
    console.error(err);
    mostrarError("Ocurrió un error al cargar la información.");
  }
}

function renderHeader(p) {
  const header = document.getElementById("batch-header");

  header.innerHTML = `
    <h4 class="mb-1">
      ${p.materia} | ${p.nivel} | Unidad ${p.unidad}
    </h4>
    <p class="text-muted">
      ${p.created_at ? new Date(p.created_at).toLocaleDateString() : ""}
    </p>
  `;
}

function renderListaPlaneaciones(planeaciones) {
  const contenedor = document.getElementById("lista-planeaciones");

  const items = planeaciones.map(p => `
    <div class="card mb-2">
      <div class="card-body d-flex justify-content-between align-items-center">
        <span>${p.tema}</span>
        <a href="detalle.html?id=${p.id}" class="btn btn-sm btn-outline-primary">
          Ver
        </a>
      </div>
    </div>
  `).join("");

  contenedor.innerHTML = items;
}

function mostrarError(mensaje) {
  document.getElementById("lista-planeaciones").innerHTML = `
    <div class="alert alert-danger">
      ${mensaje}
    </div>
  `;
}
