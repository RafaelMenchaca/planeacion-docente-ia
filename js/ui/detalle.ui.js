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

function renderTablaIA(tablaIA) {
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

  tablaIA.forEach((row) => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="col-tiempo">${escapeHtml(row.tiempo_sesion || "")}</td>
      <td>${escapeHtml(row.actividades || "")}</td>
      <td>${escapeHtml(row.tiempo_min || "")}</td>
      <td>${escapeHtml(row.producto || "")}</td>
      <td>${escapeHtml(row.instrumento || "")}</td>
      <td>${escapeHtml(row.formativa || "")}</td>
      <td>${escapeHtml(row.sumativa || "")}</td>
    `;
    tbody.appendChild(tr);
  });

  tabla?.classList.add("tabla-lectura");
  tabla?.classList.remove("tabla-edicion");
}

function setDetalleModoEdicion(modoEdicion) {
  const tabla = document.getElementById("tablaDetalleIA");
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  const celdas = tbody.querySelectorAll("td:not(.col-tiempo)");
  celdas.forEach((cell) => {
    if (modoEdicion) {
      cell.setAttribute("contenteditable", "true");
      cell.classList.add("editable-cell");
    } else {
      cell.removeAttribute("contenteditable");
      cell.classList.remove("editable-cell", "is-dirty");
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
  if (!cell || !cell.classList.contains("editable-cell")) return;
  cell.classList.add("is-dirty");
}

function animarGuardadoCeldas() {
  document.querySelectorAll("#tablaDetalleIA tbody td:not(.col-tiempo)").forEach((cell) => {
    cell.classList.remove("cell-saved-flash");
    void cell.offsetWidth;
    cell.classList.add("cell-saved-flash");
  });
}

function obtenerDatosTablaIA() {
  const filas = document.querySelectorAll("#tablaDetalleIA tbody tr");
  return Array.from(filas).map((fila) => {
    const celdas = fila.querySelectorAll("td");
    return {
      tiempo_sesion: celdas[0]?.innerText.trim() || "",
      actividades: celdas[1]?.innerText.trim() || "",
      tiempo_min: celdas[2]?.innerText.trim() || "",
      producto: celdas[3]?.innerText.trim() || "",
      instrumento: celdas[4]?.innerText.trim() || "",
      formativa: celdas[5]?.innerText.trim() || "",
      sumativa: celdas[6]?.innerText.trim() || ""
    };
  });
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
