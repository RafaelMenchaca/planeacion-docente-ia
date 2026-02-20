let PLANEACION_ORIGINAL = null;
let modoEdicion = false;
let cambiosPendientes = false;

function mostrarErrorDetalle(mensaje) {
  const info = document.getElementById("detalle-info");
  if (info) {
    info.innerHTML = `
      <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm font-medium text-rose-700">
        ${escapeHtml(mensaje)}
      </div>
    `;
  }

  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (tbody) {
    tbody.innerHTML = '<tr><td colspan="7" class="py-5 text-sm text-slate-500">Sin datos para mostrar.</td></tr>';
  }
}

function initDetallePage() {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  if (Number.isNaN(id)) {
    mostrarErrorDetalle("ID invalido. Regresa al dashboard y abre una planeacion valida.");
    return;
  }

  document.getElementById("btn-descargar-doc")?.addEventListener("click", () => {
    if (!PLANEACION_ORIGINAL) {
      mostrarToast("No hay informacion lista para exportar.", "danger");
      return;
    }

    descargarWord({
      data: PLANEACION_ORIGINAL,
      tableId: "tablaDetalleIA",
    });
  });

  document.getElementById("btn-export-excel")?.addEventListener("click", exportarExcelActual);
  document.getElementById("btn-editar")?.addEventListener("click", toggleEdicion);
  document.getElementById("btn-guardar-cambios")?.addEventListener("click", guardarCambios);

  cargarDetallePlaneacion(id);
}

async function cargarDetallePlaneacion(id) {
  try {
    const data = await obtenerPlaneacionDetalle(id);
    if (!data) {
      mostrarErrorDetalle("No se pudo cargar la planeacion.");
      return;
    }

    PLANEACION_ORIGINAL = data;
    cambiosPendientes = false;
    modoEdicion = false;

    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);
  } catch (err) {
    console.error("Error al cargar planeacion:", err);
    mostrarErrorDetalle("Error al cargar la planeacion.");
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
    cambiosPendientes = false;

    if (modoEdicion) {
      toggleEdicion();
    }

    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);
    mostrarToast("Cambios guardados correctamente.", "success");
  } catch (err) {
    console.error("Error al guardar cambios:", err);
    mostrarToast("Error al guardar cambios.", "danger");
  }
}

async function exportarExcelActual() {
  const id = PLANEACION_ORIGINAL?.id;
  if (!id) {
    mostrarToast("No hay informacion lista para exportar.", "danger");
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