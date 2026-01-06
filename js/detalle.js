let PLANEACION_ORIGINAL = null;

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
    PLANEACION_ORIGINAL = data; // 🔹 Guardamos para botones

    // Renderizamos
    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);

    // Botones
    const btnWord = document.getElementById("btn-descargar");
    const btnExcel = document.getElementById("btn-descargar-excel");

    if (btnWord) btnWord.addEventListener("click", () => descargarWord(data));
    if (btnExcel) btnExcel.addEventListener("click", () => descargarExcelDetalle(data));

  } catch (err) {
    console.error("❌ Error al cargar planeación:", err);
    document.getElementById("detalle-info").innerHTML = `<div class="alert alert-danger">❌ Error al cargar la planeación</div>`;
  }
});

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
  // Activar edición inline una vez renderizada
    activarEdicionInline();

    // Vincular botón de guardado
    document.getElementById("btn-guardar-cambios").addEventListener("click", async () => {
      const nuevosDatos = obtenerDatosTablaIA();

      try {
        const id = PLANEACION_ORIGINAL.id;
        const response = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ tabla_ia: nuevosDatos })
        });

        if (!response.ok) throw new Error("Error al actualizar la planeación");
        const data = await response.json();

        mostrarToast("✅ Cambios guardados correctamente", "success");
        document.getElementById("btn-guardar-cambios").classList.add("d-none");
        cambiosPendientes = false;
        PLANEACION_ORIGINAL = data;

      } catch (err) {
        console.error(err);
        mostrarToast("❌ Error al guardar cambios", "danger");
      }
    });

}

// 🔹 Activar edición inline
function activarEdicionInline() {
  const tbody = document.querySelector("#tablaDetalleIA tbody");
  if (!tbody) return;

  tbody.querySelectorAll("td").forEach(cell => {
    const isEditable = !cell.classList.contains("fw-bold"); // Evita editar la primera columna (Tiempo de la sesión)
    if (isEditable) {
      cell.setAttribute("contenteditable", "true");
      cell.addEventListener("input", marcarCambios);
    }
  });
}

// 🔹 Detectar cambios en la tabla
let cambiosPendientes = false;
function marcarCambios() {
  if (!cambiosPendientes) {
    cambiosPendientes = true;
    document.getElementById("btn-guardar-cambios")?.classList.remove("d-none");
  }
}

// 🔹 Obtener datos actualizados de la tabla
function obtenerDatosTablaIA() {
  const filas = document.querySelectorAll("#tablaDetalleIA tbody tr");
  const datos = [];

  filas.forEach(fila => {
    const celdas = fila.querySelectorAll("td");
    datos.push({
      tiempo_sesion: celdas[0].innerText.trim(),
      actividades: celdas[1].innerText.trim(),
      paec: celdas[2].innerText.trim(),
      tiempo_min: celdas[3].innerText.trim(),
      producto: celdas[4].innerText.trim(),
      instrumento: celdas[5].innerText.trim(),
      formativa: celdas[6].innerText.trim(),
      sumativa: celdas[7].innerText.trim()
    });
  });

  return datos;
}


function descargarWord(data) {
  try {
    const infoEl = document.getElementById("detalle-info");
    const tablaEl = document.getElementById("tablaDetalleIA");

    console.log("🧩 Verificando elementos para Word:", { infoEl, tablaEl, data });

    if (!infoEl) throw new Error("No se encontró el elemento detalle-info.");
    if (!tablaEl) throw new Error("No se encontró la tablaDetalleIA.");

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
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `Planeacion_${data?.materia || "SinMateria"}_${data?.id || ""}.doc`;
    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    }, 1000);

  } catch (err) {
    console.error("❌ Detalle del error en descargarWord:", err);
    alert("❌ Error al generar el archivo Word: " + err.message);
  }
}



// ✅ Excel con formato y datos actuales
function descargarExcelDetalle(data) {
  const tabla = document.getElementById("tablaDetalleIA");
  if (!tabla) {
    alert("⚠️ No se encontró la tabla de planeación para exportar.");
    return;
  }

  const wb = XLSX.utils.table_to_book(tabla, { sheet: "Planeación IA" });
  const ws = wb.Sheets["Planeación IA"];

  // Ajustar ancho de columnas
  ws["!cols"] = [
    { wch: 20 }, // Tiempo de la sesión
    { wch: 45 }, // Actividades
    { wch: 10 }, // PAEC
    { wch: 12 }, // Tiempo (min)
    { wch: 25 }, // Producto
    { wch: 25 }, // Instrumento
    { wch: 20 }, // Formativa
    { wch: 20 }
  ];

  const nombreArchivo = data
    ? `Planeacion_${data.materia || "SinMateria"}_${data.id}.xlsx`
    : `Planeacion_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
}
