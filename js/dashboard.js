document.addEventListener('DOMContentLoaded', function () {
  // Cargar componentes
  const loadComponent = (id, path) => {
    const el = document.getElementById(id);
    if (!el) return;
    fetch(path)
      .then(res => res.text())
      .then(html => {
        el.innerHTML = html;
        el.classList.remove('hidden');
      })
      .catch(err => console.error(`Error cargando ${path}:`, err));
  };

  loadComponent('navbar-placeholder', './components/navbar.html');
  loadComponent('footer-placeholder', './components/footer.html');

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

    if (!Array.isArray(planeaciones)) {
      container.innerHTML = "<p>Error al cargar planeaciones.</p>";
      return;
    }

    // 🔹 Aplicar filtros en cliente
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

    // 🔹 Estado vacío
    if (filtradas.length === 0) {
      container.innerHTML = "<p class='text-muted text-center py-3'>No hay planeaciones que coincidan con los filtros.</p>";
      return;
    }

    // 🔹 Construcción de tabla
    const tbody = document.createElement("tbody");

    filtradas.forEach((p, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${index + 1}</td>
        <td>${escapeHtml(p.materia || "Sin materia")}</td>
        <td class="text-muted">${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString("es-MX") : "-"}</td>
        <td class="text-end">
          <a href="detalle.html?id=${p.id}" class="btn btn-outline-primary btn-sm me-2">
            <i class="bi bi-eye"></i> Ver
          </a>
          <button onclick="eliminarPlaneacion(${p.id}, this)" class="btn btn-outline-danger btn-sm">
            <i class="bi bi-trash"></i> Eliminar
          </button>
        </td>
      `;

      tbody.appendChild(tr);
    });

    // 🔹 Estructura de tabla
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

// 🔹 Funciones de filtros
window.aplicarFiltros = function () {
  const materia = document.getElementById('filtro-materia').value.trim();
  const fecha = document.getElementById('filtro-fecha').value.trim();

  cargarPlaneaciones({ materia, fecha });

  // Mantener abierto el dropdown
  const dropdown = bootstrap.Dropdown.getInstance(document.getElementById("filtrosDropdownBtn"));
  if (dropdown) {
    dropdown.show();
  }
};

window.resetearFiltros = function () {
  document.getElementById('filtro-materia').value = '';
  document.getElementById('filtro-fecha').value = '';
  cargarPlaneaciones();

  // Mantener abierto también al limpiar
  const dropdown = bootstrap.Dropdown.getInstance(document.getElementById("filtrosDropdownBtn"));
  if (dropdown) {
    dropdown.show();
  }
};

// 🔹 Cerrar filtros y limpiar
window.cerrarFiltros = function () {
  resetearFiltros(); // limpia también
  const dropdown = bootstrap.Dropdown.getInstance(document.getElementById("filtrosDropdownBtn"));
  if (dropdown) {
    dropdown.hide();
  }
};

// 🔹 Eliminar planeación
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

    const bodyText = await res.text();

    if (!res.ok) {
      console.error('❌ DELETE fallo:', res.status, bodyText);
      alert(`No se pudo eliminar.\n${bodyText || `HTTP ${res.status}`}`);
      return;
    }

    alert('Planeación eliminada ✅');
    cargarPlaneaciones();

  } catch (err) {
    console.error('❌ Error de red en DELETE:', err);
    alert('No se pudo eliminar la planeación (error de red).');
  } finally {
    if (btnEl) {
      btnEl.disabled = false;
      btnEl.textContent = prevText;
    }
  }
};

// 🔹 Sanitizar texto
function escapeHtml(text) {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
