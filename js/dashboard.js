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

  container.classList.remove('hidden');

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    // 👇 Tu backend devuelve { items, page, pageSize, total }
    const payload = await res.json();
    const planeaciones = Array.isArray(payload) ? payload : (payload.items || []);

    if (!Array.isArray(planeaciones)) {
      container.innerHTML = "<p>Error al cargar planeaciones.</p>";
      return;
    }

    // Filtros en cliente
    let filtradas = planeaciones.filter(p => {
      const porMateria = filtros.materia ? (p.materia || '').toLowerCase().includes(filtros.materia.toLowerCase()) : true;
      const porGrado = filtros.grado ? (p.grado || '').toLowerCase().includes(filtros.grado.toLowerCase()) : true;
      const porFecha = filtros.fecha
        ? (p.fecha_creacion ? new Date(p.fecha_creacion).toISOString().startsWith(filtros.fecha) : false)
        : true;
      return porMateria && porGrado && porFecha;
    });

    // Estado vacío
    if (filtradas.length === 0) {
      container.innerHTML = "<p class='text-sm text-gray-600'>No hay planeaciones para mostrar.</p>";
      return;
    }

    // Construcción del listado
    const scrollDiv = document.createElement('div');
    scrollDiv.className = 'tabla-scroll';

    const encabezado = document.createElement('div');
    encabezado.className = 'tabla-encabezado';
    encabezado.innerHTML = `
      <div class="col-id">ID</div>
      <div class="col-nombre">Nombre</div>
      <div class="col-fecha">Fecha</div>
      <div class="col-boton">Acciones</div>
    `;

    const encabezadoMovil = document.createElement('div');
    encabezadoMovil.className = 'tabla-encabezado-movil sm:hidden flex text-xs font-semibold text-gray-600 px-3 pt-1 gap-2 justify-between';
    encabezadoMovil.innerHTML = `
      <span class="w-2/5">Nombre</span>
      <span class="w-1/4 text-left">Fecha</span>
      <span class="w-1/4 text-right">Acciones</span>
    `;

    const lista = document.createElement('ul');

    filtradas.forEach((p, index) => {
      const fila = document.createElement('li');
      fila.className = 'fila-planeacion';
      const safeMateria = escapeHtml(p.materia || 'Sin materia');
      fila.innerHTML = `
        <div class="col-id">${index + 1}</div>
        <div class="col-nombre">${safeMateria}</div>
        <div class="col-fecha">${p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString('es-MX') : '-'}</div>
        <div class="col-boton flex gap-2">
          <a href="detalle.html?id=${p.id}">
            <button class="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Ver</button>
          </a>
            <button onclick="eliminarPlaneacion(${p.id}, this)"
              class="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">
              Eliminar
            </button>
        </div>
      `;
      lista.appendChild(fila);
    });

    scrollDiv.appendChild(encabezadoMovil);
    scrollDiv.appendChild(encabezado);
    scrollDiv.appendChild(lista);

    container.innerHTML = '';
    container.appendChild(scrollDiv);

  } catch (error) {
    console.error("❌ Error al cargar planeaciones:", error);
    container.innerHTML = "<p>Error al cargar planeaciones.</p>";
  }
}

// 👇 Pega esto al final de dashboard.js
window.eliminarPlaneacion = async function (id, btnEl) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta planeación?');
  if (!confirmar) return;

  // UX: deshabilitar botón mientras borra
  const prevText = btnEl ? btnEl.textContent : null;
  if (btnEl) { btnEl.disabled = true; btnEl.textContent = 'Eliminando...'; }

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
      method: 'DELETE'
    });

    // lee el cuerpo como texto para mostrar cualquier mensaje del backend
    const bodyText = await res.text();

    if (!res.ok) {
      console.error('❌ DELETE fallo:', res.status, bodyText);
      const msg = bodyText || `HTTP ${res.status}`;
      if (res.status === 404) {
        alert(`No se pudo eliminar: no encontrado (ID ${id}).`);
      } else {
        alert(`No se pudo eliminar.\n${msg}`);
      }
      return;
    }

    // opcional: intentar parsear JSON si el backend lo envía
    try {
      const json = JSON.parse(bodyText);
      if (json?.message) console.log(json.message);
    } catch { /* ignore parse error */ }

    alert('Planeación eliminada ✅');
    // recargar la lista
    cargarPlaneaciones();

  } catch (err) {
    console.error('❌ Error de red en DELETE:', err);
    alert('No se pudo eliminar la planeación (error de red).');
  } finally {
    if (btnEl) { btnEl.disabled = false; btnEl.textContent = prevText; }
  }
};
