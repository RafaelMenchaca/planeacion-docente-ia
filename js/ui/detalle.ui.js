function renderInfo(data) {
  const fecha = data.fecha_creacion
    ? new Date(data.fecha_creacion).toLocaleDateString("es-MX")
    : "No disponible";

  document.getElementById("detalle-info").innerHTML = `
    <p><strong>?? Asignatura:</strong> ${data.materia || "-"}</p>
    <p><strong>?? Nivel/Grado:</strong> ${data.nivel || "-"}</p>
    <p><strong>?? Tema:</strong> ${data.tema || "-"}</p>
    <p><strong>?? Subtema:</strong> ${data.subtema || "-"}</p>
    <p><strong>?? Duración:</strong> ${data.duracion || "-"} min</p>
    <p><strong>????? Sesiones:</strong> ${data.sesiones || "-"}</p>
    <p><strong>?? Fecha de creación:</strong> ${fecha}</p>
  `;
}

function renderTablaIA(tablaIA) {
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  tablaIA.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="fw-bold">${row.tiempo_sesion || ""}</td>
      <td>${row.actividades || ""}</td>
      
      <td>${row.tiempo_min || ""}</td>
      <td>${row.producto || ""}</td>
      <td>${row.instrumento || ""}</td>
      <td>${row.formativa || ""}</td>
      <td>${row.sumativa || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}

function toggleEdicion() {
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  modoEdicion = !modoEdicion;
  const celdas = tbody.querySelectorAll("td:not(.fw-bold)");

  celdas.forEach(cell => {
    if (modoEdicion) {
      cell.setAttribute("contenteditable", "true");
      cell.classList.add("editable-cell");
      cell.addEventListener("input", () => cambiosPendientes = true);
    } else {
      cell.removeAttribute("contenteditable");
      cell.classList.remove("editable-cell");
    }
  });

  document.getElementById("btn-editar").classList.toggle("d-none", modoEdicion);
  document.getElementById("btn-guardar-cambios").classList.toggle("d-none", !modoEdicion);
}

function obtenerDatosTablaIA() {
  const filas = document.querySelectorAll("#tablaDetalleIA tbody tr");
  return Array.from(filas).map(fila => {
    const c = fila.querySelectorAll("td");
    return {
      tiempo_sesion: c[0].innerText.trim(),
      actividades: c[1].innerText.trim(),
      
      tiempo_min: c[2].innerText.trim(),
      producto: c[3].innerText.trim(),
      instrumento: c[4].innerText.trim(),
      formativa: c[5].innerText.trim(),
      sumativa: c[6].innerText.trim(),
    };
  });
}

function mostrarToast(mensaje, tipo = "info") {
  const cont = document.createElement("div");
  cont.className = `toast align-items-center text-bg-${tipo} border-0 show position-fixed top-0 end-0 m-3`;
  cont.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto"></button>
    </div>
  `;
  document.body.appendChild(cont);
  setTimeout(() => cont.remove(), 3500);
}

window.renderInfo = renderInfo;
window.renderTablaIA = renderTablaIA;
window.toggleEdicion = toggleEdicion;
window.obtenerDatosTablaIA = obtenerDatosTablaIA;
window.mostrarToast = mostrarToast;
