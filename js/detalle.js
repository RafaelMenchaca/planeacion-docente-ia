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
    renderInfo(data);
    renderTablaIA(data.tabla_ia || []);

    // Descargar Word
    document.getElementById("btn-descargar").addEventListener("click", () => descargarWord(data));

  } catch (err) {
    console.error(err);
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
  const info = document.getElementById("detalle-info").innerHTML;
  const tabla = document.getElementById("tablaDetalleIA").outerHTML;

  const contenidoHTML = `
    <html><head><meta charset="UTF-8"></head><body>
    <h2>Planeación ${data.id}</h2>
    ${info}
    ${tabla}
    </body></html>
  `;

  const blob = new Blob([contenidoHTML], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `Planeacion_${data.id}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
