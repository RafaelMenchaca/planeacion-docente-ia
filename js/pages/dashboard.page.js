function initDashboardPage() {
  cargarBatches();
}

function buildBatchList(planeaciones) {
  const map = new Map();

  planeaciones.forEach(p => {
    const rawBatchId = p.batch_id ?? p.batchId ?? p.batch;
    const batchId = (rawBatchId !== undefined && rawBatchId !== null && rawBatchId !== "")
      ? String(rawBatchId)
      : `single-${p.id}`;

    if (!map.has(batchId)) {
      map.set(batchId, {
        batch_id: batchId,
        materia: p.materia || "",
        nivel: p.nivel || "",
        unidad: p.unidad || "",
        fecha: p.created_at || p.fecha_creacion || "",
        total: 0
      });
    }

    const batch = map.get(batchId);
    batch.total += 1;

    const candidateFecha = p.created_at || p.fecha_creacion || "";
    if (candidateFecha && (!batch.fecha || new Date(candidateFecha) > new Date(batch.fecha))) {
      batch.fecha = candidateFecha;
    }
  });

  return Array.from(map.values());
}

async function cargarBatches(filtros = {}) {
  const container = document.getElementById('plan-list-placeholder');
  if (!container) return;

  container.classList.remove('d-none');

  try {
    const payload = await obtenerPlaneaciones();
    if (!payload) return;

    const planeaciones = Array.isArray(payload) ? payload : (payload.items || []);
    const batches = buildBatchList(planeaciones);

    const filtradas = batches.filter(b => {
      const porMateria = filtros.materia
        ? (b.materia || '').toLowerCase().includes(filtros.materia.toLowerCase())
        : true;

      const porFecha = filtros.fecha
        ? (b.fecha
            ? new Date(b.fecha).toISOString().startsWith(filtros.fecha)
            : false)
        : true;

      return porMateria && porFecha;
    });

    if (filtradas.length === 0) {
      renderBatchesEmpty(container);
      return;
    }

    // ordenar por fecha desc
    filtradas.sort((a, b) => {
      const fa = a.fecha ? new Date(a.fecha).getTime() : 0;
      const fb = b.fecha ? new Date(b.fecha).getTime() : 0;
      return fb - fa;
    });

    renderBatchesTable(container, filtradas);

  } catch (error) {
    console.error("Error al cargar batches:", error);
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

  cargarBatches(filtros);
}

function resetearFiltros() {
  const materiaInput = document.getElementById('filtro-materia');
  const fechaInput = document.getElementById('filtro-fecha');

  if (materiaInput) materiaInput.value = "";
  if (fechaInput) fechaInput.value = "";

  cargarBatches();
}

function cerrarFiltros() {
  const toggle = document.getElementById('filtrosDropdownBtn');
  if (!toggle || !window.bootstrap) return;
  const dropdown = bootstrap.Dropdown.getOrCreateInstance(toggle);
  dropdown.hide();
}

window.initDashboardPage = initDashboardPage;
window.cargarBatches = cargarBatches;
window.aplicarFiltros = aplicarFiltros;
window.resetearFiltros = resetearFiltros;
window.cerrarFiltros = cerrarFiltros;
