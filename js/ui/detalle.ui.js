function normalizarValor(valor) {
  if (valor === null || valor === undefined) return "";
  return typeof valor === "string" ? valor.trim() : String(valor);
}

function tieneValor(valor) {
  return normalizarValor(valor) !== "";
}

function renderInfo(data) {
  const contenedor = document.getElementById("detalle-info");
  if (!contenedor) return;

  const fechaCreacion = data.fecha_creacion
    ? new Date(data.fecha_creacion).toLocaleDateString("es-MX")
    : "";

  const metaCampos = [
    { label: "Asignatura", value: data.materia },
    { label: "Nivel/Grado", value: data.nivel },
    { label: "Tema", value: data.tema },
    { label: "Subtema", value: data.subtema },
    { label: "Duracion", value: tieneValor(data.duracion) ? `${data.duracion} min` : "" },
    { label: "Sesiones", value: data.sesiones },
    { label: "Fecha", value: fechaCreacion },
  ].filter((item) => tieneValor(item.value));

  const badges = [
    tieneValor(data.id) ? `Planeacion #${escapeHtml(data.id)}` : "",
    tieneValor(data.batch_id) ? `Batch #${escapeHtml(data.batch_id)}` : "",
  ].filter(Boolean);

  const badgesHtml = badges.length
    ? badges
      .map(
        (badge) => `<span class="inline-flex items-center rounded-full border border-cyan-200 bg-cyan-50 px-3 py-1 text-xs font-semibold text-cyan-800">${badge}</span>`
      )
      .join("")
    : '<span class="text-xs text-slate-500">Sin identificadores disponibles</span>';

  const metaHtml = metaCampos.length
    ? metaCampos
      .map(
        (campo) => `
          <article class="detalle-meta-item">
            <span class="detalle-meta-label">${escapeHtml(campo.label)}</span>
            <span class="detalle-meta-value">${escapeHtml(campo.value)}</span>
          </article>
        `
      )
      .join("")
    : '<p class="text-sm text-slate-500">No hay metadatos disponibles para esta planeacion.</p>';

  contenedor.innerHTML = `
    <div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h2 class="text-lg font-semibold text-slate-900">Resumen de la planeacion</h2>
        <p class="mt-1 text-sm text-slate-600">Visualiza, ajusta y exporta la propuesta generada por IA.</p>
      </div>
      <div class="flex flex-wrap items-center gap-2">${badgesHtml}</div>
    </div>
    <div class="detalle-meta-grid">${metaHtml}</div>
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

function toggleEdicion() {
  const tabla = document.getElementById("tablaDetalleIA");
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  modoEdicion = !modoEdicion;
  const celdas = tbody.querySelectorAll("td:not(.col-tiempo)");

  celdas.forEach((cell) => {
    if (modoEdicion) {
      cell.setAttribute("contenteditable", "true");
      cell.classList.add("editable-cell");
      cell.addEventListener("input", () => {
        cambiosPendientes = true;
      });
    } else {
      cell.removeAttribute("contenteditable");
      cell.classList.remove("editable-cell");
    }
  });

  tabla?.classList.toggle("tabla-edicion", modoEdicion);
  tabla?.classList.toggle("tabla-lectura", !modoEdicion);

  document.getElementById("btn-editar")?.classList.toggle("hidden", modoEdicion);
  document.getElementById("btn-guardar-cambios")?.classList.toggle("hidden", !modoEdicion);
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
      sumativa: celdas[6]?.innerText.trim() || "",
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
window.toggleEdicion = toggleEdicion;
window.obtenerDatosTablaIA = obtenerDatosTablaIA;
window.mostrarToast = mostrarToast;