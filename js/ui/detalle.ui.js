function normalizarValor(valor) {
  if (valor === null || valor === undefined) return "";
  return typeof valor === "string" ? valor.trim() : String(valor);
}

function tieneValor(valor) {
  return normalizarValor(valor) !== "";
}

function primerValorDetalle(...values) {
  return values.find((value) => tieneValor(value)) || "";
}

function capitalizarDetalleTexto(value) {
  return normalizarValor(value).replace(/\p{L}[\p{L}\p{M}]*/gu, (word) =>
    word.charAt(0).toLocaleUpperCase("es-MX") + word.slice(1).toLocaleLowerCase("es-MX")
  );
}

function formatDetalleDateTime(value) {
  if (!tieneValor(value)) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return capitalizarDetalleTexto(value);

  const months = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];
  const day = String(date.getDate()).padStart(2, "0");
  const month = months[date.getMonth()] || "";
  const year = date.getFullYear();
  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const period = hours >= 12 ? "p.m." : "a.m.";
  hours = hours % 12 || 12;

  return `${day} ${capitalizarDetalleTexto(month)} ${year}, ${String(hours).padStart(2, "0")}:${minutes} ${period}`;
}

function formatDetalleDuration(value) {
  if (!tieneValor(value)) return "-";
  const raw = normalizarValor(value);
  return raw.toLowerCase().includes("min") ? raw : `${raw} min`;
}

function renderInfoRows(rows) {
  const visibles = (Array.isArray(rows) ? rows : []).filter((item) => tieneValor(item?.value));

  if (visibles.length === 0) {
    return '<p class="text-sm text-slate-500">Sin informacion disponible.</p>';
  }

  return visibles
    .map((item) => `
      <div class="detalle-info-row">
        <span class="detalle-info-key">${escapeHtml(item.label)}:</span>
        <span class="detalle-info-value">${escapeHtml(item.value)}</span>
      </div>
    `)
    .join("");
}

function renderInfo(data, metadata = {}) {
  const contenedor = document.getElementById("detalle-info");
  if (!contenedor) return;

  const bloque = metadata?.bloque && typeof metadata.bloque === "object" ? metadata.bloque : {};
  const planeacionBloque = metadata?.planeacionBloque && typeof metadata.planeacionBloque === "object"
    ? metadata.planeacionBloque
    : {};

  const tituloBloque = primerValorDetalle(
    bloque.titulo,
    data.custom_title,
    data.materia,
    data.tema,
    "Bloque de planeación"
  );
  const nivel = capitalizarDetalleTexto(primerValorDetalle(bloque.nivel, planeacionBloque.nivel, data.nivel, "Sin nivel"));
  const materia = capitalizarDetalleTexto(primerValorDetalle(bloque.materia, planeacionBloque.materia, data.materia, "Sin materia"));
  const tema = capitalizarDetalleTexto(primerValorDetalle(planeacionBloque.tema, data.tema, data.custom_title, "Sin tema"));
  const duracion = formatDetalleDuration(primerValorDetalle(planeacionBloque.duracion, data.duracion));
  const creado = formatDetalleDateTime(primerValorDetalle(
    bloque.created_at,
    planeacionBloque.fecha_creacion,
    data.fecha_creacion,
    data.created_at,
    "-"
  ));

  const rows = [
    { label: "Nivel", value: nivel },
    { label: "Materia", value: materia },
    { label: "Planeación", value: tema },
    { label: "Duración", value: duracion },
    { label: "Creado", value: creado || "-" }
  ];

  contenedor.innerHTML = `
    <div class="detalle-info-compact">
      <div class="detalle-info-heading">
        <p class="detalle-info-eyebrow">Bloque de planeación</p>
        <h1 class="detalle-info-title">${escapeHtml(capitalizarDetalleTexto(tituloBloque))}</h1>
      </div>
      <div class="detalle-info-rows">${renderInfoRows(rows)}</div>
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
        : `<div class="detalle-actividad-image-thumb detalle-actividad-image-thumb-fallback">Imagen</div>`;
      const removeHtml = modoEdicion
        ? `<button type="button" class="detalle-actividad-image-remove" data-remove-actividad-imagen="${imageId}" data-row-index="${rowIndex}">Quitar</button>`
        : "";

      return `
        <div class="detalle-actividad-image-item">
          <div class="detalle-actividad-image-preview">${previewHtml}</div>
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
