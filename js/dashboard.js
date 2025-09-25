document.addEventListener('DOMContentLoaded', function () {
  cargarPlaneaciones();
});

async function cargarPlaneaciones(filtros = {}) {
  const container = document.getElementById('plan-list-placeholder');
  if (!container) return;

  container.classList.remove('d-none');

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const payload = await res.json();
    const planeaciones = Array.isArray(payload) ? payload : (payload.items || []);

    let filtradas = planeaciones.filter(p => {
      const porMateria = filtros.materia
        ? (p.materia || '').toLowerCase().includes(filtros.materia.toLowerCase())
        : true;

      const porFecha = filtros.fecha
        ? (p.fecha_creacion
            ? new Date(p.fecha_creacion).toISOString().startsWith(filtros.fecha)
            : false)
        : true;

      return porMateria && porFecha;
    });

    if (filtradas.length === 0) {
      container.innerHTML = "<p class='text-muted text-center py-3'>No hay planeaciones que coincidan con los filtros.</p>";
      return;
    }

    const tbody = document.createElement("tbody");

    filtradas.forEach((p, index) => {
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
            <th scope="col">#</th>
            <th scope="col">Asignatura</th>
            <th scope="col">Fecha</th>
            <th scope="col" class="text-end">Acciones</th>
          </tr>
        </thead>
      </table>
    `;
    container.querySelector("table").appendChild(tbody);

  } catch (error) {
    console.error("❌ Error al cargar planeaciones:", error);
    container.innerHTML = "<p>Error al cargar planeaciones.</p>";
  }
}

window.aplicarFiltros = function () {
  const materia = document.getElementById('filtro-materia').value.trim();
  const fecha = document.getElementById('filtro-fecha').value.trim();

  cargarPlaneaciones({ materia, fecha });

  const dropdown = bootstrap.Dropdown.getInstance(document.getElementById("filtrosDropdownBtn"));
  if (dropdown) dropdown.show();
};

window.resetearFiltros = function () {
  document.getElementById('filtro-materia').value = '';
  document.getElementById('filtro-fecha').value = '';
  cargarPlaneaciones();

  const dropdown = bootstrap.Dropdown.getInstance(document.getElementById("filtrosDropdownBtn"));
  if (dropdown) dropdown.show();
};

window.cerrarFiltros = function () {
  resetearFiltros();
  const dropdown = bootstrap.Dropdown.getInstance(document.getElementById("filtrosDropdownBtn"));
  if (dropdown) dropdown.hide();
};

window.eliminarPlaneacion = async function (id, btnEl) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta planeación?');
  if (!confirmar) return;

  const prevText = btnEl ? btnEl.textContent : null;
  if (btnEl) {
    btnEl.disabled = true;
    btnEl.textContent = 'Eliminando...';
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
      method: 'DELETE'
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    alert('Planeación eliminada ✅');
    cargarPlaneaciones();

  } catch (err) {
    console.error('❌ Error de red en DELETE:', err);
    alert('No se pudo eliminar la planeación.');
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = prevText;
    }
  }
};
