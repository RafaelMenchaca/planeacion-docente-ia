function initDashboardPage() {
  cargarPlaneaciones();
}

async function cargarPlaneaciones(filtros = {}) {
  const container = document.getElementById('plan-list-placeholder');
  if (!container) return;

  container.classList.remove('d-none');

  try {
    const payload = await obtenerPlaneaciones();
    if (!payload) return;

    const planeaciones = Array.isArray(payload) ? payload : (payload.items || []);

    const filtradas = planeaciones.filter(p => {
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
      renderPlaneacionesEmpty(container);
      return;
    }

    renderPlaneacionesTable(container, filtradas);

  } catch (error) {
    console.error("? Error al cargar planeaciones:", error);
    container.innerHTML = "<p>Error al cargar planeaciones.</p>";
  }
}

function aplicarFiltros() {
  const materiaInput = document.getElementById('filtro-materia');
  const fechaInput = document.getElementById('filtro-fecha');

  const filtros = {
    materia: materiaInput ? materiaInput.value.trim() : "",
    fecha: fechaInput ? fechaInput.value : ""
  };

  cargarPlaneaciones(filtros);
}

function resetearFiltros() {
  const materiaInput = document.getElementById('filtro-materia');
  const fechaInput = document.getElementById('filtro-fecha');

  if (materiaInput) materiaInput.value = "";
  if (fechaInput) fechaInput.value = "";

  cargarPlaneaciones();
}

function cerrarFiltros() {
  const toggle = document.getElementById('filtrosDropdownBtn');
  if (!toggle || !window.bootstrap) return;
  const dropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
  dropdown.hide();
}

window.eliminarPlaneacion = async function (id, btnEl) {
  const confirmar = confirm('¿Estás seguro de que deseas eliminar esta planeación?');
  if (!confirmar) return;

  const prevText = btnEl.textContent;
  btnEl.disabled = true;
  btnEl.textContent = 'Eliminando...';

  try {
    const res = await eliminarPlaneacionApi(id);
    if (!res) return;

    cargarPlaneaciones();

  } catch (err) {
    console.error('? Error al eliminar:', err);
    alert('No se pudo eliminar la planeación.');
  } finally {
    btnEl.disabled = false;
    btnEl.textContent = prevText;
  }
};

window.initDashboardPage = initDashboardPage;
window.cargarPlaneaciones = cargarPlaneaciones;
window.aplicarFiltros = aplicarFiltros;
window.resetearFiltros = resetearFiltros;
window.cerrarFiltros = cerrarFiltros;
