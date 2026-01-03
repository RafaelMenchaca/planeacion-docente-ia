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
    { wch: 22 },
    { wch: 45 },
    { wch: 10 },
    { wch: 12 },
    { wch: 28 },
    { wch: 28 },
    { wch: 20 },
    { wch: 20 }
  ];

  const nombreArchivo = data
    ? `Planeacion_${data.materia || "SinMateria"}_${data.id}.xlsx`
    : `Planeacion_${Date.now()}.xlsx`;

  XLSX.writeFile(wb, nombreArchivo);
}
