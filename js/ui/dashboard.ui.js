function renderBatchesTable(container, batches) {
  const tbody = document.createElement("tbody");

  batches.forEach((b, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${index + 1}</td>
      <td>${escapeHtml(b.materia || "Sin materia")}</td>
      <td>${escapeHtml(b.nivel || "-")}</td>
      <td>${b.unidad ? `Unidad ${b.unidad}` : "-"}</td>
      <td>${b.total || 0}</td>
      <td class="text-muted">${b.fecha ? new Date(b.fecha).toLocaleDateString("es-MX") : "-"}</td>
      <td class="text-end">
        <a href="batch.html?batch_id=${encodeURIComponent(b.batch_id)}" class="btn btn-outline-primary btn-sm">
          <i class="bi bi-eye"></i> <span class="d-none d-sm-inline">Ver</span>
        </a>
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
          <th>Nivel</th>
          <th>Unidad</th>
          <th>Total</th>
          <th>Fecha</th>
          <th class="text-end">Acciones</th>
        </tr>
      </thead>
    </table>
  `;
  container.querySelector("table").appendChild(tbody);
}

function renderBatchesEmpty(container) {
  container.innerHTML = "<p class='text-muted text-center py-3'>No hay planeaciones que coincidan con los filtros.</p>";
}

window.renderBatchesTable = renderBatchesTable;
window.renderBatchesEmpty = renderBatchesEmpty;
