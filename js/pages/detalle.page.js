const DETALLE_STORAGE_BUCKET = "planeacion-actividades";
const DETALLE_SIGNED_URL_TTL_SECONDS = 60 * 60;

let PLANEACION_ORIGINAL = null;
let TABLA_IA_LECTURA = [];
let TABLA_IA_EDICION = [];
let modoEdicion = false;
let cambiosPendientes = false;
let guardandoCambios = false;

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

function normalizarTextoDetalle(valor) {
  return typeof valor === "string" ? valor.trim() : "";
}

function normalizarActividadImagen(item) {
  if (!item || typeof item !== "object") return null;

  const normalized = {
    id: normalizarTextoDetalle(item.id),
    name: normalizarTextoDetalle(item.name),
    path: normalizarTextoDetalle(item.path),
    mime_type: normalizarTextoDetalle(item.mime_type),
    size: Number.isFinite(Number(item.size)) ? Number(item.size) : 0,
    uploaded_at: normalizarTextoDetalle(item.uploaded_at),
    preview_url: normalizarTextoDetalle(item.preview_url),
    is_pending: Boolean(item.is_pending),
    file: item.file || null
  };

  const source = normalizarTextoDetalle(item.source);
  if (source) normalized.source = source;
  const query = normalizarTextoDetalle(item.query);
  if (query) normalized.query = query;

  if (!normalized.id) return null;
  return normalized;
}

function normalizarFilaTablaIa(row) {
  const fila = row && typeof row === "object" ? row : {};
  return {
    tiempo_sesion: fila.tiempo_sesion || "",
    actividades: fila.actividades || "",
    tiempo_min: fila.tiempo_min || "",
    producto: fila.producto || "",
    instrumento: fila.instrumento || "",
    formativa: fila.formativa || "",
    sumativa: fila.sumativa || "",
    actividades_imagenes: (Array.isArray(fila.actividades_imagenes) ? fila.actividades_imagenes : [])
      .map(normalizarActividadImagen)
      .filter(Boolean)
  };
}

function normalizarTablaIa(tablaIa) {
  return (Array.isArray(tablaIa) ? tablaIa : []).map(normalizarFilaTablaIa);
}

function clonarActividadImagen(imagen) {
  return {
    ...imagen,
    file: imagen?.file || null
  };
}

function clonarTablaIa(tablaIa) {
  return normalizarTablaIa(tablaIa).map((row) => ({
    ...row,
    actividades_imagenes: row.actividades_imagenes.map(clonarActividadImagen)
  }));
}

function normalizarPlaneacionDetalle(data) {
  const planeacion = data && typeof data === "object" ? { ...data } : {};
  planeacion.tabla_ia = normalizarTablaIa(planeacion.tabla_ia);
  return planeacion;
}

function syncDetalleEdicionUI() {
  setDetalleModoEdicion(modoEdicion);
  actualizarEstadoEdicion(cambiosPendientes);
}

function marcarCambiosPendientes() {
  cambiosPendientes = true;
  actualizarEstadoEdicion(true);
}

function revokePendingImagePreviews(tablaIa) {
  clonarTablaIa(tablaIa).forEach((row) => {
    row.actividades_imagenes.forEach((imagen) => {
      if (imagen.is_pending && typeof imagen.preview_url === "string" && imagen.preview_url.startsWith("blob:")) {
        URL.revokeObjectURL(imagen.preview_url);
      }
    });
  });
}

function buildActividadImageId(timestamp = Date.now()) {
  const randomPart = typeof crypto?.randomUUID === "function"
    ? crypto.randomUUID().replace(/-/g, "").slice(0, 10)
    : Math.random().toString(36).slice(2, 12);
  return `img_${timestamp}_${randomPart}`;
}

function sanitizeFileName(fileName) {
  const raw = typeof fileName === "string" ? fileName.trim() : "";
  const parts = raw.split(".");
  const extension = parts.length > 1 ? parts.pop() : "";
  const baseName = parts.join(".") || raw || "imagen";
  const safeBase = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase() || "imagen";
  const safeExtension = extension
    ? extension.replace(/[^a-zA-Z0-9]+/g, "").toLowerCase()
    : "";

  return safeExtension ? `${safeBase}.${safeExtension}` : safeBase;
}

function normalizarTiempoSesionStorage(valor) {
  const tiempo = normalizarTextoDetalle(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (tiempo === "conocimientos previos") return "conocimientos-previos";
  if (tiempo === "desarrollo") return "desarrollo";
  if (tiempo === "cierre") return "cierre";
  return "actividades";
}

function crearImagenPendiente(file) {
  const timestamp = Date.now();
  return {
    id: buildActividadImageId(timestamp),
    name: file.name || "imagen",
    path: "",
    mime_type: file.type || "",
    size: Number(file.size) || 0,
    uploaded_at: new Date(timestamp).toISOString(),
    preview_url: URL.createObjectURL(file),
    is_pending: true,
    file
  };
}

async function crearSignedUrlActividad(path) {
  if (!path || !window.supabase?.storage) return "";

  const { data, error } = await window.supabase
    .storage
    .from(DETALLE_STORAGE_BUCKET)
    .createSignedUrl(path, DETALLE_SIGNED_URL_TTL_SECONDS);

  if (error) {
    console.warn("No se pudo firmar URL de imagen de actividad:", error);
    return "";
  }

  return data?.signedUrl || "";
}

async function hidratarTablaIaConImagenes(tablaIa) {
  const rows = clonarTablaIa(tablaIa);

  await Promise.all(
    rows.map(async (row) => {
      row.actividades_imagenes = await Promise.all(
        row.actividades_imagenes.map(async (imagen) => {
          if (imagen.is_pending || imagen.preview_url || !imagen.path) {
            return imagen;
          }

          return {
            ...imagen,
            preview_url: await crearSignedUrlActividad(imagen.path)
          };
        })
      );
    })
  );

  return rows;
}

async function aplicarPlaneacionCargada(data) {
  PLANEACION_ORIGINAL = normalizarPlaneacionDetalle(data);
  TABLA_IA_LECTURA = await hidratarTablaIaConImagenes(PLANEACION_ORIGINAL.tabla_ia || []);
  TABLA_IA_EDICION = [];
  modoEdicion = false;
  cambiosPendientes = false;

  renderInfo(PLANEACION_ORIGINAL);
  renderTablaIA(TABLA_IA_LECTURA, { modoEdicion: false });
  syncDetalleEdicionUI();
}

function syncTablaEdicionDesdeDom() {
  if (!modoEdicion || !TABLA_IA_EDICION.length) return;

  const tablaDesdeDom = obtenerDatosTablaIA();
  if (!Array.isArray(tablaDesdeDom) || !tablaDesdeDom.length) return;

  TABLA_IA_EDICION = TABLA_IA_EDICION.map((row, index) => ({
    ...row,
    ...(tablaDesdeDom[index] || {})
  }));
}

function salirEdicion({ restaurarOriginal = false } = {}) {
  if (restaurarOriginal) {
    revokePendingImagePreviews(TABLA_IA_EDICION);
    TABLA_IA_EDICION = [];
    renderTablaIA(TABLA_IA_LECTURA, { modoEdicion: false });
  }

  modoEdicion = false;
  cambiosPendientes = false;
  syncDetalleEdicionUI();
}

function entrarEdicion() {
  if (!PLANEACION_ORIGINAL || modoEdicion) return;

  TABLA_IA_EDICION = clonarTablaIa(TABLA_IA_LECTURA);
  modoEdicion = true;
  cambiosPendientes = false;
  renderTablaIA(TABLA_IA_EDICION, { modoEdicion: true });
  syncDetalleEdicionUI();
}

function manejarInputTabla(event) {
  if (!modoEdicion) return;

  const cell = event.target.closest(".editable-cell");
  if (!cell) return;

  marcarCeldaComoEditada(cell);
  marcarCambiosPendientes();
}

async function obtenerUsuarioAutenticado() {
  const { data, error } = await window.supabase.auth.getUser();
  if (error || !data?.user?.id) {
    throw new Error("No se pudo identificar al usuario autenticado.");
  }

  return data.user;
}

async function subirImagenActividad({ image, planeacionId, userId, tiempoSesion }) {
  const file = image?.file;
  if (!file) {
    throw new Error("La imagen seleccionada ya no esta disponible para subir.");
  }

  const timestamp = Date.now();
  const safeFileName = sanitizeFileName(file.name || image.name || "imagen");
  const path = `${userId}/${planeacionId}/${normalizarTiempoSesionStorage(tiempoSesion)}/${timestamp}-${safeFileName}`;

  const { data, error } = await window.supabase
    .storage
    .from(DETALLE_STORAGE_BUCKET)
    .upload(path, file, {
      contentType: file.type || undefined,
      upsert: false
    });

  if (error) {
    throw new Error(`No se pudo subir la imagen "${file.name}".`);
  }

  return {
    id: buildActividadImageId(timestamp),
    name: file.name || image.name || safeFileName,
    path: data?.path || path,
    mime_type: file.type || image.mime_type || "",
    size: Number(file.size) || Number(image.size) || 0,
    uploaded_at: new Date(timestamp).toISOString()
  };
}

function serializeActividadImagen(imagen) {
  const out = {
    id: imagen.id,
    name: imagen.name,
    path: imagen.path,
    mime_type: imagen.mime_type || "",
    size: Number(imagen.size) || 0,
    uploaded_at: imagen.uploaded_at
  };
  if (imagen.source) out.source = imagen.source;
  if (imagen.query) out.query = imagen.query;
  return out;
}

function collectActividadImagePaths(tablaIa) {
  return normalizarTablaIa(tablaIa)
    .flatMap((row) => row.actividades_imagenes)
    .map((imagen) => normalizarTextoDetalle(imagen.path))
    .filter(Boolean);
}

function computeRemovedActividadImagePaths(originalRows, nextRows) {
  const nextPathSet = new Set(collectActividadImagePaths(nextRows));
  return collectActividadImagePaths(originalRows).filter((path) => !nextPathSet.has(path));
}

async function eliminarImagenesStorage(paths) {
  const uniquePaths = [...new Set((Array.isArray(paths) ? paths : []).filter(Boolean))];
  if (!uniquePaths.length) return;

  const { error } = await window.supabase
    .storage
    .from(DETALLE_STORAGE_BUCKET)
    .remove(uniquePaths);

  if (error) {
    throw new Error("No se pudieron eliminar algunas imagenes del storage.");
  }
}

async function construirTablaIaParaGuardar() {
  syncTablaEdicionDesdeDom();

  const baseRows = obtenerDatosTablaIA();
  const user = await obtenerUsuarioAutenticado();
  const planeacionId = PLANEACION_ORIGINAL?.id;
  const uploadedPaths = [];

  const tablaIa = [];

  for (let index = 0; index < baseRows.length; index += 1) {
    const rowFromDom = baseRows[index] || {};
    const rowState = TABLA_IA_EDICION[index] || {};
    const imagenesActuales = Array.isArray(rowState.actividades_imagenes) ? rowState.actividades_imagenes : [];
    const imagenesSerializadas = [];

    for (const imagen of imagenesActuales) {
      if (imagen.is_pending) {
        const uploaded = await subirImagenActividad({
          image: imagen,
          planeacionId,
          userId: user.id,
          tiempoSesion: rowFromDom.tiempo_sesion || rowState.tiempo_sesion
        });
        uploadedPaths.push(uploaded.path);
        imagenesSerializadas.push(uploaded);
        continue;
      }

      imagenesSerializadas.push(serializeActividadImagen(imagen));
    }

    tablaIa.push({
      ...rowFromDom,
      actividades_imagenes: imagenesSerializadas
    });
  }

  return {
    tablaIa,
    uploadedPaths
  };
}

function setGuardarEstado(loading) {
  guardandoCambios = loading;

  const button = document.getElementById("btn-guardar-cambios");
  if (!button) return;

  button.disabled = loading;
  button.classList.toggle("opacity-70", loading);
  button.classList.toggle("cursor-not-allowed", loading);
  button.textContent = loading ? "Guardando cambios..." : "Guardar cambios";
}

async function manejarSeleccionImagenes(event) {
  const input = event.target.closest("[data-actividad-imagen-input]");
  if (!modoEdicion || !input) return;

  const rowIndex = Number.parseInt(input.getAttribute("data-row-index"), 10);
  if (!Number.isInteger(rowIndex) || !TABLA_IA_EDICION[rowIndex]) return;

  const files = Array.from(input.files || []);
  input.value = "";

  if (!files.length) return;

  const invalidFiles = files.filter((file) => !String(file.type || "").startsWith("image/"));
  if (invalidFiles.length) {
    mostrarToast("Solo se permiten archivos de imagen.", "danger");
    return;
  }

  syncTablaEdicionDesdeDom();

  const nuevasImagenes = files.map(crearImagenPendiente);
  TABLA_IA_EDICION[rowIndex].actividades_imagenes = [
    ...(TABLA_IA_EDICION[rowIndex].actividades_imagenes || []),
    ...nuevasImagenes
  ];

  renderTablaIA(TABLA_IA_EDICION, { modoEdicion: true });
  marcarCambiosPendientes();
  syncDetalleEdicionUI();
}

function quitarImagenActividad(event) {
  const button = event.target.closest("[data-remove-actividad-imagen]");
  if (!modoEdicion || !button) return false;

  const rowIndex = Number.parseInt(button.getAttribute("data-row-index"), 10);
  const imageId = button.getAttribute("data-remove-actividad-imagen");

  if (!Number.isInteger(rowIndex) || !imageId || !TABLA_IA_EDICION[rowIndex]) {
    return true;
  }

  syncTablaEdicionDesdeDom();

  const row = TABLA_IA_EDICION[rowIndex];
  const imageToRemove = (row.actividades_imagenes || []).find((imagen) => imagen.id === imageId);
  if (!imageToRemove) return true;

  if (imageToRemove.is_pending && imageToRemove.preview_url?.startsWith("blob:")) {
    URL.revokeObjectURL(imageToRemove.preview_url);
  }

  row.actividades_imagenes = (row.actividades_imagenes || []).filter((imagen) => imagen.id !== imageId);
  renderTablaIA(TABLA_IA_EDICION, { modoEdicion: true });
  marcarCambiosPendientes();
  syncDetalleEdicionUI();
  return true;
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
    console.error("Error resolviendo identificador de planeacion:", error);
    mostrarErrorDetalle("No se pudo resolver la planeacion seleccionada.");
    return;
  }

  if (id === null) {
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
      tableId: "tablaDetalleIA"
    });
  });

  document.getElementById("btn-export-excel")?.addEventListener("click", exportarExcelActual);
  document.getElementById("btn-editar")?.addEventListener("click", () => {
    entrarEdicion();
  });
  document.getElementById("btn-cancelar-edicion")?.addEventListener("click", () => {
    salirEdicion({ restaurarOriginal: true });
    mostrarToast("Edicion cancelada.");
  });
  document.getElementById("btn-guardar-cambios")?.addEventListener("click", () => {
    guardarCambios().catch((error) => {
      console.error("Error al guardar cambios:", error);
      mostrarToast(error?.message || "Error al guardar cambios.", "danger");
    });
  });

  document.getElementById("tablaDetalleIA")?.addEventListener("input", manejarInputTabla);
  document.getElementById("tablaDetalleIA")?.addEventListener("change", (event) => {
    manejarSeleccionImagenes(event).catch((error) => {
      console.error("Error agregando imagenes de actividades:", error);
      mostrarToast(error?.message || "No se pudieron agregar las imagenes.", "danger");
    });
  });
  document.getElementById("tablaDetalleIA")?.addEventListener("click", (event) => {
    if (quitarImagenActividad(event)) {
      event.preventDefault();
    }
  });

  await cargarDetallePlaneacion(id);
}

async function cargarDetallePlaneacion(id) {
  try {
    const data = await obtenerPlaneacionDetalle(id);
    if (!data) {
      mostrarErrorDetalle("No se pudo cargar la planeacion.");
      return;
    }

    await aplicarPlaneacionCargada(data);
  } catch (err) {
    console.error("Error al cargar planeacion:", err);
    mostrarErrorDetalle("Error al cargar la planeacion.");
  }
}

async function guardarCambios() {
  if (!PLANEACION_ORIGINAL || guardandoCambios) return;

  if (!cambiosPendientes) {
    mostrarToast("No hay cambios para guardar.");
    return;
  }

  const id = PLANEACION_ORIGINAL.id;
  const originalRows = clonarTablaIa(PLANEACION_ORIGINAL.tabla_ia || []);
  let uploadedPaths = [];

  setGuardarEstado(true);

  try {
    const { tablaIa, uploadedPaths: nuevosUploads } = await construirTablaIaParaGuardar();
    uploadedPaths = nuevosUploads;

    const removedPaths = computeRemovedActividadImagePaths(originalRows, tablaIa);
    const data = await actualizarPlaneacion(id, { tabla_ia: tablaIa });
    if (!data) {
      throw new Error("No se pudo actualizar la planeacion.");
    }

    try {
      await eliminarImagenesStorage(removedPaths);
    } catch (storageDeleteError) {
      console.warn("No se pudieron eliminar algunas imagenes removidas:", storageDeleteError);
      mostrarToast("Cambios guardados. Algunas imagenes no se pudieron borrar del storage.", "info");
    }

    revokePendingImagePreviews(TABLA_IA_EDICION);
    await aplicarPlaneacionCargada(data);
    animarGuardadoCeldas();
    mostrarToast("Cambios guardados correctamente.", "success");
  } catch (err) {
    if (uploadedPaths.length) {
      try {
        await eliminarImagenesStorage(uploadedPaths);
      } catch (cleanupError) {
        console.warn("No se pudieron limpiar imagenes subidas tras un error:", cleanupError);
      }
    }

    console.error("Error al guardar cambios:", err);
    throw err;
  } finally {
    setGuardarEstado(false);
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
