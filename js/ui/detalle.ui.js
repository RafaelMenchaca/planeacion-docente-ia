function normalizarValor(valor) {
  if (valor === null || valor === undefined) return "";
  return typeof valor === "string" ? valor.trim() : String(valor);
}

function tieneValor(valor) {
  return normalizarValor(valor) !== "";
}

function normalizarEstadoPlaneacion(status) {
  const raw = normalizarValor(status).toLowerCase();
  if (raw === "ready") return "Lista";
  if (raw === "generating") return "Generandose";
  if (raw === "pending") return "En espera";
  if (raw === "error") return "Con error";
  return raw ? raw.charAt(0).toUpperCase() + raw.slice(1) : "";
}

function construirRutaJerarquia(data) {
  const ruta = Array.isArray(data?.jerarquia?.ruta) ? data.jerarquia.ruta : [];
  if (ruta.length > 0) {
    return ruta.map((item) => item.nombre).filter(Boolean).join(" / ");
  }

  return [
    data?.jerarquia?.plantel?.nombre,
    data?.jerarquia?.grado?.nombre || data?.nivel,
    data?.jerarquia?.materia?.nombre || data?.materia,
    data?.jerarquia?.unidad?.nombre || (tieneValor(data?.unidad) ? `Unidad ${data.unidad}` : ""),
    data?.jerarquia?.tema?.titulo || data?.tema
  ]
    .filter(Boolean)
    .join(" / ");
}

function renderInfoRows(rows, { emphasizeLast = false } = {}) {
  const visibles = (Array.isArray(rows) ? rows : []).filter((item) => tieneValor(item?.value));

  if (visibles.length === 0) {
    return '<p class="text-sm text-slate-500">Sin informacion disponible.</p>';
  }

  return visibles
    .map((item, index) => {
      const valueClass = emphasizeLast && index === visibles.length - 1
        ? "detalle-info-value detalle-info-value-strong"
        : "detalle-info-value";

      return `
        <div class="detalle-info-row">
          <span class="detalle-info-key">${escapeHtml(item.label)}</span>
          <span class="${valueClass}">${item.html || escapeHtml(item.value)}</span>
        </div>
      `;
    })
    .join("");
}

function renderInfo(data) {
  const contenedor = document.getElementById("detalle-info");
  if (!contenedor) return;

  const fechaCreacion = data.fecha_creacion
    ? new Date(data.fecha_creacion).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "long",
        day: "numeric"
      })
    : "";

  const rutaJerarquia = construirRutaJerarquia(data);
  const estado = normalizarEstadoPlaneacion(data.status);

  const contextoRows = [
    { label: "Plantel", value: data?.jerarquia?.plantel?.nombre },
    { label: "Grado", value: data?.jerarquia?.grado?.nombre || data.nivel },
    { label: "Materia", value: data?.jerarquia?.materia?.nombre || data.materia },
    { label: "Unidad", value: data?.jerarquia?.unidad?.nombre || (tieneValor(data.unidad) ? `Unidad ${data.unidad}` : "") },
    { label: "Tema", value: data?.jerarquia?.tema?.titulo || data.tema }
  ];

  const planeacionRows = [
    { label: "Duracion", value: tieneValor(data.duracion) ? `${data.duracion} min` : "" },
    {
      label: "Estado",
      value: estado,
      html: tieneValor(estado) ? `<span class="detalle-status-chip">${escapeHtml(estado)}</span>` : ""
    },
    { label: "Creada", value: fechaCreacion }
  ];

  contenedor.innerHTML = `
    <div class="detalle-info-layout">
      <div class="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-[0.18em] text-cyan-800">Origen actual</p>
          <h1 class="mt-2 text-xl font-semibold text-slate-900 sm:text-2xl">Detalle de la planeacion</h1>
          <p class="mt-2 text-sm text-slate-600">Consulta el contexto jerarquico, ajusta el contenido y exporta la version final.</p>
        </div>
      </div>

      <div class="detalle-info-panels">
        <section class="detalle-info-panel">
          <div class="detalle-info-panel-header">
            <div>
              <p class="detalle-info-panel-title">Ruta de origen</p>
              <p class="detalle-info-panel-copy">La planeacion mantiene visible la ruta completa de la jerarquia donde fue creada.</p>
            </div>
            ${tieneValor(rutaJerarquia) ? `<div class="detalle-route-pill">${escapeHtml(rutaJerarquia)}</div>` : ""}
          </div>
          <div class="detalle-info-rows">${renderInfoRows(contextoRows, { emphasizeLast: true })}</div>
        </section>

        <section class="detalle-info-panel">
          <div class="detalle-info-panel-header">
            <div>
              <p class="detalle-info-panel-title">Datos de la planeacion</p>
              <p class="detalle-info-panel-copy">Resumen rapido para revisar vigencia y estado sin llenar el encabezado de cards.</p>
            </div>
          </div>
          <div class="detalle-info-rows">${renderInfoRows(planeacionRows)}</div>
        </section>
      </div>
    </div>
  `;
}

function normalizarTiempoSesionTabla(valor) {
  return normalizarValor(valor)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function puedeEditarImagenesActividad(row) {
  const tiempo = normalizarTiempoSesionTabla(row?.tiempo_sesion);
  return tiempo === "conocimientos previos" || tiempo === "desarrollo" || tiempo === "cierre";
}

function obtenerActividadImagenes(row) {
  return Array.isArray(row?.actividades_imagenes) ? row.actividades_imagenes : [];
}

function renderActividadImagenes(actividadesImagenes, { modoEdicion = false, rowIndex = -1 } = {}) {
  const imagenes = Array.isArray(actividadesImagenes) ? actividadesImagenes : [];
  if (!imagenes.length) {
    return "";
  }

  const items = imagenes
    .map((imagen) => {
      const imageName = escapeHtml(imagen?.name || "Imagen");
      const imageId = escapeHtml(imagen?.id || "");
      const previewUrl = typeof imagen?.preview_url === "string" ? imagen.preview_url : "";
      const previewHtml = previewUrl
        ? `<img src="${escapeHtml(previewUrl)}" alt="${imageName}" class="detalle-actividad-image-thumb" />`
        : `<div class="detalle-actividad-image-thumb detalle-actividad-image-thumb-fallback">${imageName}</div>`;
      const removeHtml = modoEdicion
        ? `<button type="button" class="detalle-actividad-image-remove" data-remove-actividad-imagen="${imageId}" data-row-index="${rowIndex}">Quitar</button>`
        : "";

      return `
        <div class="detalle-actividad-image-item">
          <div class="detalle-actividad-image-preview">${previewHtml}</div>
          <div class="detalle-actividad-image-name" title="${imageName}">${imageName}</div>
          ${removeHtml}
        </div>
      `;
    })
    .join("");

  return `<div class="detalle-actividad-images">${items}</div>`;
}

function renderActividadesCell(row, { modoEdicion = false, rowIndex = -1 } = {}) {
  const actividades = escapeHtml(row?.actividades || "");
  const imagenesHtml = renderActividadImagenes(obtenerActividadImagenes(row), { modoEdicion, rowIndex });
  const mostrarUpload = modoEdicion && puedeEditarImagenesActividad(row);
  const uploadHtml = mostrarUpload
    ? `
      <div class="detalle-actividad-upload-row">
        <label class="detalle-actividad-upload-trigger">
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            data-actividad-imagen-input="${rowIndex}"
            data-row-index="${rowIndex}"
          />
          Agregar imagenes
        </label>
      </div>
    `
    : "";

  return `
    <div class="detalle-actividad-cell">
      <div class="detalle-actividad-text" data-actividad-text>${actividades}</div>
      ${imagenesHtml}
      ${uploadHtml}
    </div>
  `;
}

function renderTablaIA(tablaIA, { modoEdicion = false } = {}) {
  const tabla = document.getElementById("tablaDetalleIA");
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  if (!Array.isArray(tablaIA) || tablaIA.length === 0) {
    const tr = document.createElement("tr");
    tr.innerHTML = '<td colspan="7" class="py-5 text-sm text-slate-500">No hay contenido en la tabla IA para esta planeacion.</td>';
    tbody.appendChild(tr);
    tabla?.classList.add("tabla-lectura");
    tabla?.classList.remove("tabla-edicion");
    return;
  }

  tablaIA.forEach((row, rowIndex) => {
    const tr = document.createElement("tr");
    tr.setAttribute("data-row-index", String(rowIndex));
    tr.innerHTML = `
      <td class="col-tiempo" data-field="tiempo_sesion">${escapeHtml(row.tiempo_sesion || "")}</td>
      <td class="col-actividades" data-field="actividades">${renderActividadesCell(row, { modoEdicion, rowIndex })}</td>
      <td data-field="tiempo_min" data-editable-field="tiempo_min">${escapeHtml(row.tiempo_min || "")}</td>
      <td data-field="producto" data-editable-field="producto">${escapeHtml(row.producto || "")}</td>
      <td data-field="instrumento" data-editable-field="instrumento">${escapeHtml(row.instrumento || "")}</td>
      <td data-field="formativa" data-editable-field="formativa">${escapeHtml(row.formativa || "")}</td>
      <td data-field="sumativa" data-editable-field="sumativa">${escapeHtml(row.sumativa || "")}</td>
    `;
    tbody.appendChild(tr);
  });

  tabla?.classList.toggle("tabla-lectura", !modoEdicion);
  tabla?.classList.toggle("tabla-edicion", modoEdicion);
}

function setDetalleModoEdicion(modoEdicion) {
  const tabla = document.getElementById("tablaDetalleIA");
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  const celdasNormales = tbody.querySelectorAll("td[data-editable-field]");
  celdasNormales.forEach((cell) => {
    if (modoEdicion) {
      cell.setAttribute("contenteditable", "true");
      cell.classList.add("editable-cell");
    } else {
      cell.removeAttribute("contenteditable");
      cell.classList.remove("editable-cell", "is-dirty");
    }
  });

  const bloquesActividades = tbody.querySelectorAll("[data-actividad-text]");
  bloquesActividades.forEach((block) => {
    if (modoEdicion) {
      block.setAttribute("contenteditable", "true");
      block.classList.add("editable-cell");
    } else {
      block.removeAttribute("contenteditable");
      block.classList.remove("editable-cell", "is-dirty");
    }
  });

  tabla?.classList.toggle("tabla-edicion", modoEdicion);
  tabla?.classList.toggle("tabla-lectura", !modoEdicion);

  document.getElementById("btn-editar")?.classList.toggle("hidden", modoEdicion);
  document.getElementById("btn-guardar-cambios")?.classList.toggle("hidden", !modoEdicion);
  document.getElementById("btn-cancelar-edicion")?.classList.toggle("hidden", !modoEdicion);
  document.getElementById("detalle-edit-banner")?.classList.toggle("hidden", !modoEdicion);

  const subtitle = document.getElementById("detalle-edit-subtitle");
  if (subtitle) {
    subtitle.textContent = modoEdicion
      ? "Modo edicion activo. Las celdas de contenido ya se pueden modificar."
      : "Modo lectura activo. Revisa el contenido antes de editar.";
  }
}

function actualizarEstadoEdicion(cambiosPendientes) {
  const status = document.getElementById("detalle-edit-status");
  if (!status) return;

  status.textContent = cambiosPendientes ? "Cambios pendientes" : "Sin cambios aun";
  status.classList.toggle("is-pending", cambiosPendientes);
}

function marcarCeldaComoEditada(cell) {
  const target = cell?.classList?.contains("editable-cell")
    ? cell
    : cell?.closest?.(".editable-cell");

  if (!target) return;
  target.classList.add("is-dirty");
}

function animarGuardadoCeldas() {
  document
    .querySelectorAll("#tablaDetalleIA tbody td[data-editable-field], #tablaDetalleIA tbody [data-actividad-text]")
    .forEach((cell) => {
      cell.classList.remove("cell-saved-flash");
      void cell.offsetWidth;
      cell.classList.add("cell-saved-flash");
    });
}

function obtenerTextoCelda(fila, fieldName) {
  return fila.querySelector(`td[data-field="${fieldName}"]`)?.innerText.trim() || "";
}

function obtenerDatosTablaIA() {
  const filas = document.querySelectorAll("#tablaDetalleIA tbody tr");
  return Array.from(filas).map((fila) => ({
    tiempo_sesion: obtenerTextoCelda(fila, "tiempo_sesion"),
    actividades: fila.querySelector("[data-actividad-text]")?.innerText.trim() || "",
    tiempo_min: obtenerTextoCelda(fila, "tiempo_min"),
    producto: obtenerTextoCelda(fila, "producto"),
    instrumento: obtenerTextoCelda(fila, "instrumento"),
    formativa: obtenerTextoCelda(fila, "formativa"),
    sumativa: obtenerTextoCelda(fila, "sumativa")
  }));
}

function mostrarToast(mensaje, tipo = "info") {
  let contenedor = document.getElementById("detalle-toast-wrap");
  if (!contenedor) {
    contenedor = document.createElement("div");
    contenedor.id = "detalle-toast-wrap";
    contenedor.className = "detalle-toast-wrap";
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement("div");
  toast.className = `detalle-toast ${tipo}`;
  toast.textContent = mensaje;

  contenedor.appendChild(toast);
  setTimeout(() => {
    toast.remove();
    if (!contenedor.childElementCount) {
      contenedor.remove();
    }
  }, 3200);
}

window.renderInfo = renderInfo;
window.renderTablaIA = renderTablaIA;
window.setDetalleModoEdicion = setDetalleModoEdicion;
window.actualizarEstadoEdicion = actualizarEstadoEdicion;
window.marcarCeldaComoEditada = marcarCeldaComoEditada;
window.animarGuardadoCeldas = animarGuardadoCeldas;
window.obtenerDatosTablaIA = obtenerDatosTablaIA;
window.mostrarToast = mostrarToast;
