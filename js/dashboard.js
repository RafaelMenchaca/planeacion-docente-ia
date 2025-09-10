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
    // Tu backend regresa { items, page, pageSize, total }
    const res = await fetch(`${API_BASE_URL}/api/planeaciones`);
    if (!res.ok) throw new Error('Respuesta no OK');
    const payload = await res.json();

    // Aceptamos tanto array "legacy" como objeto paginado
    const lista = Array.isArray(payload) ? payload : (payload.items || []);

    let filtradas = lista.filter(p => {
      const porMateria = filtros.materia
        ? (p.materia || '').toLowerCase().includes(filtros.materia.toLowerCase())
        : true;

      const porGrado = filtros.grado
        ? (p.grado || '').toLowerCase().includes(filtros.grado.toLowerCase())
        : true;

      const porFecha = filtros.fecha
        ? (p.fecha_creacion ? new Date(p.fecha_creacion).toISOString().startsWith(filtros.fecha) : false)
        : true;

      return porMateria && porGrado && porFecha;
    });

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

    const listaUL = document.createElement('ul');

    filtradas.forEach((p, index) => {
      const fila = document.createElement('li');
      fila.className = 'fila-planeacion';
      const safeMateria = escapeHtml(p.materia || 'Sin materia');
      const fecha = p.fecha_creacion ? new Date(p.fecha_creacion).toLocaleDateString('es-MX') : '—';

      fila.innerHTML = `
        <div class="col-id">${index + 1}</div>
        <div class="col-nombre">${safeMateria}</div>
        <div class="col-fecha">${fecha}</div>
        <div class="col-boton flex gap-2">
          <a href="detalle.html?id=${p.id}">
            <button class="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Ver</button>
          </a>
          <button onclick="eliminarPlaneacion(${p.id})"
            class="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
        </div>
      `;
      listaUL.appendChild(fila);
    });

    scrollDiv.innerHTML = '';
    scrollDiv.appendChild(encabezadoMovil);
    scrollDiv.appendChild(encabezado);
    scrollDiv.appendChild(listaUL);

    container.innerHTML = '';
    container.appendChild(scrollDiv);

  } catch (error) {
    console.error('❌ Error al cargar planeaciones:', error);
    container.innerHTML = '<p>Error al cargar planeaciones.</p>';
  }
}

function aplicarFiltros() {
  const materia = document.getElementById('filtro-materia').value;
  const grado = document.getElementById('filtro-grado').value;
  const fecha = document.getElementById('filtro-fecha').value;
  cargarPlaneaciones({ materia, grado, fecha });
}

function resetearFiltros() {
  document.getElementById('filtro-materia').value = '';
  document.getElementById('filtro-grado').value = '';
  document.getElementById('filtro-fecha').value = '';
  cargarPlaneaciones();
}

async function eliminarPlaneacion(id) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta planeación?');
  if (!confirmar) return;

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error('No se pudo eliminar');
    alert('Planeación eliminada exitosamente ✅');
    cargarPlaneaciones();
  } catch (error) {
    console.error('❌ Error al eliminar:', error);
    alert('No se pudo eliminar la planeación.');
  }
}

function toggleFiltros() {
  const contenedor = document.getElementById('contenedor-filtros');
  contenedor.classList.toggle('hidden');
}
