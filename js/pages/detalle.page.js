let PLANEACION_ORIGINAL = null;
let modoEdicion = false;
let cambiosPendientes = false;

function initDetallePage() {
  // Navbar y footer
  const loadComponent = (id, path) => {
    fetch(path)
      .then(res => res.text())
      .then(html => (document.getElementById(id).innerHTML = html))
      .catch(err => console.error("Error cargando componente:", err));
  };
  loadComponent("navbar-placeholder", "../components/navbar.html");
  loadComponent("footer-placeholder", "../components/footer.html");

  // Obtener ID desde URL
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  if (isNaN(id)) {
    document.getElementById("detalle-info").innerHTML =
      `<div class="alert alert-danger">? ID inválido</div>`;
    return;
  }

  cargarDetallePlaneacion(id);
}

async function cargarDetallePlaneacion(id) {
  try {
    const data = await obtenerPlaneacionDetalle(id);
    if (!data) return;

    PLANEACION_ORIGINAL = data;

    // Render
    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);

    console.log("WORD DATA:", PLANEACION_ORIGINAL);

    // Botones descarga
    document.getElementById("btn-descargar-doc")
      .addEventListener("click", () => {
        descargarWord({
          data: PLANEACION_ORIGINAL,
          tableId: "tablaDetalleIA",
        });
      });

    document.getElementById("btn-descargar-excel")
      ?.addEventListener("click", () => descargarExcelDetalle(data));

    // Botones edición / guardado
    document.getElementById("btn-editar")
      ?.addEventListener("click", toggleEdicion);

    document.getElementById("btn-guardar-cambios")
      ?.addEventListener("click", guardarCambios);

  } catch (err) {
    console.error("? Error al cargar planeación:", err);
    document.getElementById("detalle-info").innerHTML =
      `<div class="alert alert-danger">? Error al cargar la planeación</div>`;
  }
}

async function guardarCambios() {
  if (!cambiosPendientes) {
    alert("No hay cambios para guardar.");
    return;
  }

  const id = PLANEACION_ORIGINAL.id;
  const nuevosDatos = obtenerDatosTablaIA();

  try {
    const data = await actualizarPlaneacion(id, { tabla_ia: nuevosDatos });
    if (!data) return;

    PLANEACION_ORIGINAL = data;
    cambiosPendientes = false;
    toggleEdicion();

    mostrarToast("? Cambios guardados correctamente", "success");

  } catch (err) {
    console.error(err);
    mostrarToast("? Error al guardar cambios", "danger");
  }
}

// ---------- Exportar Excel ----------
document.getElementById("btn-export-excel")?.addEventListener("click", async () => {
  const id = PLANEACION_ORIGINAL?.id;
  if (!id) return;

  try {
    const blob = await exportarPlaneacionExcel(id);
    if (!blob) return;

    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `Planeacion_${id}.xlsx`;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);

  } catch (err) {
    console.error("? Error al exportar Excel:", err);
    alert("Error al descargar el archivo Excel.");
  }
});

window.initDetallePage = initDetallePage;
window.cargarDetallePlaneacion = cargarDetallePlaneacion;
window.guardarCambios = guardarCambios;

