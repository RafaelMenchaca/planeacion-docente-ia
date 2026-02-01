function renderPlaneacionesTable(container, planeaciones) {
  const tbody = document.createElement("tbody");

  planeaciones.forEach((p, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(p.materia || "Sin materia")}</td>
      <td class="text-muted">${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString("es-MX") : "-"}</td>
      <td>
        <div class="d-flex flex-wrap justify-content-end gap-2">
          <a href="detalle.html?id=${p.id}" class="btn btn-outline-primary btn-sm">
            <i class="bi bi-eye"></i> <span class="d-none d-sm-inline">Ver</span>
          </a>
          <button onclick="eliminarPlaneacion(${p.id}, this)" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-trash"></i> <span class="d-none d-sm-inline">Eliminar</span>
          </button>
        </div>
      </td>
    `;
    tbody.appendChild(tr);
  });

  container.innerHTML = `
    <table class="table table-hover table-sm align-middle mb-0">
      <thead class="table-light sticky-top">
        <tr>
          <th>#</th>
          <th>Asignatura</th>
          <th>Fecha</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
    </table>
  `;
  container.querySelector("table").appendChild(tbody);
}

function renderPlaneacionesEmpty(container) {
  container.innerHTML = "<p class='text-muted text-center py-3'>No hay planeaciones que coincidan con los filtros.</p>";
}

window.renderPlaneacionesTable = renderPlaneacionesTable;
window.renderPlaneacionesEmpty = renderPlaneacionesEmpty;
