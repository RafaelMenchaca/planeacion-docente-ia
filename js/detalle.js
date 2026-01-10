let PLANEACION_ORIGINAL = null;
let modoEdicion = false;
let cambiosPendientes = false;

document.addEventListener("DOMContentLoaded", async () => {
  // Navbar y footer
  const loadComponent = (id, path) => {
    fetch(path)
      .then(res => res.text())
      .then(html => (document.getElementById(id).innerHTML = html))
      .catch(err => console.error("Error cargando componente:", err));
  };
  loadComponent("navbar-placeholder", "./components/navbar.html");
  loadComponent("footer-placeholder", "./components/footer.html");

  // Obtener ID desde URL
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get("id"), 10);

  if (isNaN(id)) {
    document.getElementById("detalle-info").innerHTML = `<div class="alert alert-danger">❌ ID inválido</div>`;
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`);
    if (!res.ok) throw new Error("Error al obtener la planeación");

    const data = await res.json();
    PLANEACION_ORIGINAL = data;

    // Render
    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);

    // Botones descarga
    document.getElementById("btn-descargar")?.addEventListener("click", () => descargarWord(data));
    document.getElementById("btn-descargar-excel")?.addEventListener("click", () => descargarExcelDetalle(data));

    // Botones edición / guardado
    document.getElementById("btn-editar")?.addEventListener("click", toggleEdicion);
    document.getElementById("btn-guardar-cambios")?.addEventListener("click", guardarCambios);

  } catch (err) {
    console.error("❌ Error al cargar planeación:", err);
    document.getElementById("detalle-info").innerHTML = `<div class="alert alert-danger">❌ Error al cargar la planeación</div>`;
  }
});


// ---------- Render info principal ----------
function renderInfo(data) {
  const fecha = data.fecha_creacion ? new Date(data.fecha_creacion).toLocaleDateString("es-MX") : "No disponible";

  document.getElementById("detalle-info").innerHTML = `
    <p><strong>📚 Asignatura:</strong> ${data.materia || "-"}</p>
    <p><strong>🎓 Nivel/Grado:</strong> ${data.nivel || "-"}</p>
    <p><strong>📌 Tema:</strong> ${data.tema || "-"}</p>
    <p><strong>📌 Subtema:</strong> ${data.subtema || "-"}</p>
    <p><strong>⏱️ Duración:</strong> ${data.duracion || "-"} min</p>
    <p><strong>🧑‍🏫 Sesiones:</strong> ${data.sesiones || "-"}</p>
    <p><strong>📅 Fecha de creación:</strong> ${fecha}</p>
  `;
}


// ---------- Render tabla IA ----------
function renderTablaIA(tablaIA) {
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;
  tbody.innerHTML = "";

  tablaIA.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="fw-bold">${row.tiempo_sesion || ""}</td>
      <td>${row.actividades || ""}</td>
      <td>${row.paec || ""}</td>
      <td>${row.tiempo_min || ""}</td>
      <td>${row.producto || ""}</td>
      <td>${row.instrumento || ""}</td>
      <td>${row.formativa || ""}</td>
      <td>${row.sumativa || ""}</td>
    `;
    tbody.appendChild(tr);
  });
}


// ---------- Modo edición ----------
function toggleEdicion() {
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  modoEdicion = !modoEdicion;
  const celdas = tbody.querySelectorAll("td:not(.fw-bold)");

  celdas.forEach(cell => {
    if (modoEdicion) {
      cell.setAttribute("contenteditable", "true");
      cell.classList.add("editable-cell");
      cell.addEventListener("input", marcarCambios);
    } else {
      cell.removeAttribute("contenteditable");
      cell.classList.remove("editable-cell");
    }
  });

  // Alternar botones
  document.getElementById("btn-editar").classList.toggle("d-none", modoEdicion);
  document.getElementById("btn-guardar-cambios").classList.toggle("d-none", !modoEdicion);

  if (!modoEdicion) cambiosPendientes = false;
  // Cambiar fondo de la tabla según modo
  const tabla = document.getElementById("tablaDetalleIA");
  if (modoEdicion) {
    tabla.classList.remove("tabla-lectura");
    tabla.classList.add("tabla-edicion");
  } else {
    tabla.classList.remove("tabla-edicion");
    tabla.classList.add("tabla-lectura");
  }

}


// ---------- Detectar cambios ----------
function marcarCambios() {
  cambiosPendientes = true;
}


// ---------- Obtener datos actualizados ----------
function obtenerDatosTablaIA() {
  const filas = document.querySelectorAll("#tablaDetalleIA tbody tr");
  return Array.from(filas).map(fila => {
    const celdas = fila.querySelectorAll("td");
    return {
      tiempo_sesion: celdas[0].innerText.trim(),
      actividades: celdas[1].innerText.trim(),
      paec: celdas[2].innerText.trim(),
      tiempo_min: celdas[3].innerText.trim(),
      producto: celdas[4].innerText.trim(),
      instrumento: celdas[5].innerText.trim(),
      formativa: celdas[6].innerText.trim(),
      sumativa: celdas[7].innerText.trim(),
    };
  });
}


// ---------- Guardar cambios ----------
async function guardarCambios() {
  if (!cambiosPendientes) return alert("No hay cambios para guardar.");

  const nuevosDatos = obtenerDatosTablaIA();
  const id = PLANEACION_ORIGINAL.id;

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tabla_ia: nuevosDatos }),
    });

    if (!res.ok) throw new Error("Error al guardar cambios");
    const data = await res.json();

    mostrarToast("✅ Cambios guardados correctamente", "success");
    PLANEACION_ORIGINAL = data;
    toggleEdicion(); // Vuelve al modo lectura

  } catch (err) {
    console.error(err);
    mostrarToast("❌ Error al guardar cambios", "danger");
  }
}


// ---------- Descargar Word ----------
function descargarWord(data) {
  try {
    const infoEl = document.getElementById("detalle-info");
    const tablaEl = document.getElementById("tablaDetalleIA");

    if (!infoEl || !tablaEl) throw new Error("Elementos no encontrados.");

    const contenidoHTML = `
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; }
          h2 { margin-bottom: 10px; }
          table { border-collapse: collapse; width: 100%; margin-top: 15px; }
          th, td { border: 1px solid #000; padding: 6px; text-align: center; }
          th { background-color: #f2f2f2; }
        </style>
      </head>
      <body>
        <h2>Planeación ${data?.id ?? ""}</h2>
        ${infoEl.outerHTML}
        ${tablaEl.outerHTML}
      </body>
      </html>
    `;

    const blob = new Blob([contenidoHTML], { type: "application/msword;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Planeacion_${data?.materia || "SinMateria"}_${data?.id || ""}.doc`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 1000);

  } catch (err) {
    console.error("❌ Error en descargarWord:", err);
    alert("❌ Error al generar el archivo Word: " + err.message);
  }
}


// Botón Exportar Excel (backend)
document.getElementById("btn-export-excel")?.addEventListener("click", () => {
  const id = PLANEACION_ORIGINAL?.id;
  if (!id) {
    alert("❌ No se pudo obtener el ID de la planeación");
    return;
  }

  window.location.href = `${API_BASE_URL}/api/planeaciones/${id}/export/excel`;
});



// ---------- Toast visual (Bootstrap 5) ----------
function mostrarToast(mensaje, tipo = "info") {
  const cont = document.createElement("div");
  cont.className = `toast align-items-center text-bg-${tipo} border-0 show position-fixed top-0 end-0 m-3`;
  cont.role = "alert";
  cont.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${mensaje}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast"></button>
    </div>
  `;
  document.body.appendChild(cont);
  setTimeout(() => cont.remove(), 3500);
}
