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
    document.getElementById("detalle-info").innerHTML =
      `<div class="alert alert-danger">❌ ID inválido</div>`;
    return;
  }

  try {
    //  OBTENER SESIÓN
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      window.location.href = "login.html";
      return;
    }

    // FETCH CON TOKEN
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
      headers: {
        "Authorization": `Bearer ${session.access_token}`
      }
    });

    if (!res.ok) throw new Error("Error al obtener la planeación");

    const data = await res.json();
    PLANEACION_ORIGINAL = data;

    // Render
    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);

    // Botones descarga
    document.getElementById("btn-descargar")
      ?.addEventListener("click", () => descargarWord(data));

    document.getElementById("btn-descargar-excel")
      ?.addEventListener("click", () => descargarExcelDetalle(data));

    // Botones edición / guardado
    document.getElementById("btn-editar")
      ?.addEventListener("click", toggleEdicion);

    document.getElementById("btn-guardar-cambios")
      ?.addEventListener("click", guardarCambios);

  } catch (err) {
    console.error("❌ Error al cargar planeación:", err);
    document.getElementById("detalle-info").innerHTML =
      `<div class="alert alert-danger">❌ Error al cargar la planeación</div>`;
  }
});


// ---------- Render info principal ----------
function renderInfo(data) {
  const fecha = data.fecha_creacion
    ? new Date(data.fecha_creacion).toLocaleDateString("es-MX")
    : "No disponible";

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
      cell.addEventListener("input", () => cambiosPendientes = true);
    } else {
      cell.removeAttribute("contenteditable");
      cell.classList.remove("editable-cell");
    }
  });

  document.getElementById("btn-editar").classList.toggle("d-none", modoEdicion);
  document.getElementById("btn-guardar-cambios").classList.toggle("d-none", !modoEdicion);
}


// ---------- Guardar cambios ----------
async function guardarCambios() {
  if (!cambiosPendientes) {
    alert("No hay cambios para guardar.");
    return;
  }

  const id = PLANEACION_ORIGINAL.id;
  const nuevosDatos = obtenerDatosTablaIA();

  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      window.location.href = "login.html";
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ tabla_ia: nuevosDatos })
    });

    if (!res.ok) throw new Error("Error al guardar cambios");

    const data = await res.json();
    PLANEACION_ORIGINAL = data;
    cambiosPendientes = false;
    toggleEdicion();

    mostrarToast("✅ Cambios guardados correctamente", "success");

  } catch (err) {
    console.error(err);
    mostrarToast("❌ Error al guardar cambios", "danger");
  }
}


// ---------- Obtener datos actualizados ----------
function obtenerDatosTablaIA() {
  const filas = document.querySelectorAll("#tablaDetalleIA tbody tr");
  return Array.from(filas).map(fila => {
    const c = fila.querySelectorAll("td");
    return {
      tiempo_sesion: c[0].innerText.trim(),
      actividades: c[1].innerText.trim(),
      paec: c[2].innerText.trim(),
      tiempo_min: c[3].innerText.trim(),
      producto: c[4].innerText.trim(),
      instrumento: c[5].innerText.trim(),
      formativa: c[6].innerText.trim(),
      sumativa: c[7].innerText.trim(),
    };
  });
}


// ---------- Exportar Excel ----------
document.getElementById("btn-export-excel")?.addEventListener("click", async () => {
  const id = PLANEACION_ORIGINAL?.id;
  if (!id) return;

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return;
  }

  window.location.href =
    `${API_BASE_URL}/api/planeaciones/${id}/export/excel?token=${session.access_token}`;
});


// ---------- Toast ----------
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
