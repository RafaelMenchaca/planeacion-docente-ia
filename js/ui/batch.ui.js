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
      <div class="card-body d-flex justify-content-between align-items-center flex-wrap gap-2">
        <span>${p.tema}</span>
        <div class="d-flex gap-2">
          <a href="detalle.html?id=${p.id}" class="btn btn-sm btn-outline-primary">
            Ver
          </a>
          <button onclick="eliminarPlaneacionBatch(${p.id}, this)" class="btn btn-sm btn-outline-danger">
            Eliminar
          </button>
        </div>
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

window.renderHeader = renderHeader;
window.renderListaPlaneaciones = renderListaPlaneaciones;
window.mostrarError = mostrarError;
