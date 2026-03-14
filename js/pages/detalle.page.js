let PLANEACION_ORIGINAL = null;
let modoEdicion = false;
let cambiosPendientes = false;

function mostrarErrorDetalle(mensaje) {
  const info = document.getElementById("detalle-info");
  if (info) {
    info.innerHTML = `
      <div class="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
        ${escapeHtml(mensaje)}
      </div>
    `;
  }

  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="py-5 text-sm text-slate-500">Sin datos para mostrar.</td></tr>';
  }
}

function syncDetalleEdicionUI() {
  setDetalleModoEdicion(modoEdicion);
  actualizarEstadoEdicion(cambiosPendientes);
}

function salirEdicion({ restaurarOriginal = false } = {}) {
  if (restaurarOriginal && PLANEACION_ORIGINAL) {
    renderTablaIA(PLANEACION_ORIGINAL.tabla_ia || []);
  }

  modoEdicion = false;
  cambiosPendientes = false;
  syncDetalleEdicionUI();
}

function entrarEdicion() {
  if (!PLANEACION_ORIGINAL) return;
  modoEdicion = true;
  cambiosPendientes = false;
  syncDetalleEdicionUI();
}

function manejarInputTabla(event) {
  if (!modoEdicion) return;
  const cell = event.target.closest("td.editable-cell");
  if (!cell) return;

  cambiosPendientes = true;
  marcarCeldaComoEditada(cell);
  actualizarEstadoEdicion(cambiosPendientes);
}

async function resolverPlaneacionIdDesdeParams() {
  const params = new URLSearchParams(window.location.search);
  const rawId = params.get("id");
  const temaId = params.get("tema_id");

  if (rawId) {
    const id = parseInt(rawId, 10);
    if (!Number.isNaN(id)) {
      return id;
    }
  }

  if (!temaId) {
    return null;
  }

  const planeacion = await obtenerPlaneacionPorTema(temaId);
  if (!planeacion || Number.isNaN(Number(planeacion.id))) {
    return null;
  }

  return Number(planeacion.id);
}

async function initDetallePage() {
  let id = null;

  try {
    id = await resolverPlaneacionIdDesdeParams();
  } catch (error) {
    console.error("Error resolviendo identificador de planeación:", error);
    mostrarErrorDetalle("No se pudo resolver la planeación seleccionada.");
    return;
  }

  if (id === null) {
    mostrarErrorDetalle("ID inválido. Regresa al dashboard y abre una planeación válida.");
    return;
  }

  document.getElementById("btn-descargar-doc")?.addEventListener("click", () => {
    if (!PLANEACION_ORIGINAL) {
      mostrarToast("No hay información lista para exportar.", "danger");
      return;
    }

    descargarWord({
      data: PLANEACION_ORIGINAL,
      tableId: "tablaDetalleIA"
    });
  });

  document.getElementById("btn-export-excel")?.addEventListener("click", exportarExcelActual);
  document.getElementById("btn-editar")?.addEventListener("click", entrarEdicion);
  document.getElementById("btn-cancelar-edicion")?.addEventListener("click", () => {
    salirEdicion({ restaurarOriginal: true });
    mostrarToast("Edición cancelada.");
  });
  document.getElementById("btn-guardar-cambios")?.addEventListener("click", guardarCambios);
  document.getElementById("tablaDetalleIA")?.addEventListener("input", manejarInputTabla);

  cargarDetallePlaneacion(id);
}

async function cargarDetallePlaneacion(id) {
  try {
    const data = await obtenerPlaneacionDetalle(id);
    if (!data) {
      mostrarErrorDetalle("No se pudo cargar la planeación.");
      return;
    }

    PLANEACION_ORIGINAL = data;
    modoEdicion = false;
    cambiosPendientes = false;

    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);
    syncDetalleEdicionUI();
  } catch (err) {
    console.error("Error al cargar planeación:", err);
    mostrarErrorDetalle("Error al cargar la planeación.");
  }
}

async function guardarCambios() {
  if (!PLANEACION_ORIGINAL) return;

  if (!cambiosPendientes) {
    mostrarToast("No hay cambios para guardar.");
    return;
  }

  const id = PLANEACION_ORIGINAL.id;
  const nuevosDatos = obtenerDatosTablaIA();

  try {
    const data = await actualizarPlaneacion(id, { tabla_ia: nuevosDatos });
    if (!data) return;

    PLANEACION_ORIGINAL = data;
    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);
    animarGuardadoCeldas();
    salirEdicion();
    mostrarToast("Cambios guardados correctamente.", "success");
  } catch (err) {
    console.error("Error al guardar cambios:", err);
    mostrarToast("Error al guardar cambios.", "danger");
  }
}

async function exportarExcelActual() {
  const id = PLANEACION_ORIGINAL?.id;
  if (!id) {
    mostrarToast("No hay información lista para exportar.", "danger");
    return;
  }

  try {
    const blob = await exportarPlaneacionExcel(id);
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);
    const enlace = document.createElement("a");

    enlace.href = url;
    enlace.download = `Planeacion_${id}.xlsx`;
    document.body.appendChild(enlace);
    enlace.click();

    document.body.removeChild(enlace);
    window.URL.revokeObjectURL(url);
    mostrarToast("Excel exportado correctamente.", "success");
  } catch (err) {
    console.error("Error al exportar Excel:", err);
    mostrarToast("Error al exportar Excel.", "danger");
  }
}

window.initDetallePage = initDetallePage;
window.cargarDetallePlaneacion = cargarDetallePlaneacion;
window.guardarCambios = guardarCambios;
