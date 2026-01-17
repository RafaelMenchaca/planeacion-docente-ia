document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-generar")?.addEventListener("click", generarPlaneacion);
  document.getElementById("btn-generar-mobile")?.addEventListener("click", generarPlaneacion);
});



async function generarPlaneacion() {
  const {
    materia,
    nivel,
    tema,
    subtema,
    duracion,
    sesiones
  } = obtenerDatosFormulario();

  if (
    !materia ||
    !nivel ||
    !tema ||
    !subtema ||
    isNaN(duracion) ||
    duracion < 10 ||
    isNaN(sesiones) ||
    sesiones < 1
  ) {
    alert("⚠️ Completa todos los campos correctamente.");
    return;
  }

  const loader = document.getElementById("ia-loader");
  loader.style.display = "block";

  try {
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      alert("Sesión no válida. Inicia sesión nuevamente.");
      window.location.href = "login.html";
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/planeaciones/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        materia,
        nivel,
        tema,
        subtema,
        duracion,
        sesiones
      })
    });

    if (!response.ok) throw new Error("No se pudo generar la planeación con IA");

    const data = await response.json();

    rellenarTablaIA(data.tabla_ia);
    bloquearFormulario();
    mostrarResultado(data);

  } catch (error) {
    console.error("❌ Error al generar:", error);
    alert("❌ Error al generar la planeación con IA.");
  } finally {
    loader.style.display = "none";
  }
}




function rellenarTablaIA(tablaIA) {
  const tbody = document.querySelector("#planeacionIA tbody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll("tr");

  tablaIA.forEach((row, index) => {
    if (rows[index]) {
      const cells = rows[index].querySelectorAll("td");

      // No tocamos cells[0] (Tiempo de la sesión ya está fijo en HTML)
      cells[1].textContent = row.actividades || "";
      // cells[2].textContent = row.paec || "";
      cells[2].textContent = row.tiempo_min || "";
      cells[3].textContent = row.producto || "";
      cells[4].textContent = row.instrumento || "";
      cells[5].textContent = row.formativa || "";
      cells[6].textContent = row.sumativa || "";

      // Highlight verde en columnas de IA
      for (let i = 1; i < cells.length; i++) {
        cells[i].classList.add("highlight-green");
      }
    }
  });

  // Quitar highlight verde después de 2s
  setTimeout(() => {
    document.querySelectorAll(".highlight-green").forEach(cell => {
      cell.classList.remove("highlight-green");
    });
  }, 2000);
}




function bloquearFormulario() {
  document.querySelectorAll("#planeacionTable input, #planeacionTable select").forEach(el => {
    el.setAttribute("readonly", true);
    el.setAttribute("disabled", true);
  });

  const btn = document.getElementById("btn-generar");
  if (btn) {
    btn.classList.add("disabled");
    btn.setAttribute("disabled", true);
    btn.innerHTML = '<i class="bi bi-check-circle"></i> Guardado';
  }
}

function mostrarResultado(data) {
  const resultado = document.getElementById("resultado");
  if (!resultado) return;

  resultado.innerHTML = `
    <div class="alert alert-success mt-4">
      <h5 class="mb-3">✅ Planeación guardada correctamente</h5>
      <p><strong>Asignatura:</strong> ${data.materia}</p>
      <p><strong>Nivel:</strong> ${data.nivel}</p>
      <p><strong>Tema:</strong> ${data.tema}</p>
      <p><strong>Subtema:</strong> ${data.subtema}</p>
      <p><strong>Duración:</strong> ${data.duracion} min</p>
      <p><strong>Sesiones:</strong> ${data.sesiones}</p>

      <div class="mt-3 d-flex gap-2 flex-wrap justify-content-center">
        <a href="dashboard.html" class="btn btn-outline-secondary">
          <i class="bi bi-house"></i> Volver al Dashboard
        </a>
        <a href="detalle.html?id=${data.id}" class="btn btn-outline-primary">
          <i class="bi bi-search"></i> Ver en detalle
        </a>
        <button id="btn-word" class="btn btn-outline-primary">
          <i class="bi bi-file-earmark-word"></i> Descargar Word
        </button>
        <button id="btn-excel" data-id="${data.id}" class="btn btn-outline-success">
          <i class="bi bi-file-earmark-excel"></i> Descargar Excel
        </button>
        <button class="btn btn-success" onclick="resetearFormulario()">
          <i class="bi bi-plus-circle"></i> Nueva planeación
        </button>
      </div>
    </div>
  `;

  // Asignar eventos correctamente después de insertar el HTML
  document.getElementById("btn-word").addEventListener("click", () => descargarWord(data));
  document.getElementById("btn-excel").addEventListener("click", async () => {
    console.log("CLICK EXCEL NUEVO");
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        window.location.href = "login.html";
        return;
      }

      console.log("SESSION:", session?.access_token);
      const res = await fetch(
        `${API_BASE_URL}/api/planeaciones/${data.id}/export/excel`,
        {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error("No se pudo generar el Excel");
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Planeacion_${data.id}.xlsx`;
      document.body.appendChild(a);
      a.click();

      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

    } catch (err) {
      console.error("❌ Error al descargar Excel:", err);
      alert("Error al descargar el archivo Excel.");
    }
  });

}


function resetearFormulario() {
  document.querySelectorAll("#planeacionTable input, #planeacionTable select").forEach(el => {
    el.value = "";
    el.removeAttribute("readonly");
    el.removeAttribute("disabled");
  });

  document.getElementById("duracion").value = 50;
  document.getElementById("sesiones").value = 1;

  const tbody = document.querySelector("#planeacionIA tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td class="fw-bold">Actividad(s) de conocimientos previos</td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
      </tr>
      <tr>
        <td class="fw-bold">Actividades de desarrollo</td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
      </tr>
      <tr>
        <td class="fw-bold">Actividades de cierre</td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
        <td class="ia-placeholder"></td>
      </tr>
    `;
  }

  const btn = document.getElementById("btn-generar");
  if (btn) {
    btn.classList.remove("disabled");
    btn.removeAttribute("disabled");
    btn.innerHTML = '<i class="bi bi-magic"></i> Generar Planeación IA';
  }

  const resultado = document.getElementById("resultado");
  if (resultado) resultado.innerHTML = "";
}



// Word
window.descargarWord = function (data) {
  try {
    const tabla = document.getElementById("planeacionIA");
    if (!tabla) {
      alert("⚠️ No se encontró la tabla para exportar.");
      return;
    }

    const info = `
      <p><strong>Asignatura:</strong> ${data.materia}</p>
      <p><strong>Nivel:</strong> ${data.nivel}</p>
      <p><strong>Tema:</strong> ${data.tema}</p>
      <p><strong>Subtema:</strong> ${data.subtema}</p>
      <p><strong>Duración:</strong> ${data.duracion} min</p>
      <p><strong>Sesiones:</strong> ${data.sesiones}</p>
    `;

    const contenidoHTML = `
      <html><head><meta charset="UTF-8">
      <style>
        body { font-family: Arial, sans-serif; }
        table { border-collapse: collapse; width: 100%; margin-top: 20px; }
        th, td { border: 1px solid #000; padding: 8px; text-align: center; }
        th { background-color: #f2f2f2; }
      </style></head><body>
      <h2>Planeación ${data.id}</h2>
      ${info}
      ${tabla.outerHTML}
      </body></html>
    `;

    const blob = new Blob([contenidoHTML], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Planeacion_${data.materia || "SinMateria"}_${data.id}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("❌ Error al exportar Word:", err);
    alert("Error al generar el archivo Word.");
  }
};

function obtenerDatosFormulario() {
  const isMobile = window.innerWidth <= 768;

  return {
    materia: document.getElementById(isMobile ? "asignatura-mobile" : "asignatura").value.trim(),
    nivel: document.getElementById(isMobile ? "nivel-mobile" : "nivel").value.trim(),
    tema: document.getElementById(isMobile ? "tema-mobile" : "tema").value.trim(),
    subtema: document.getElementById(isMobile ? "subtema-mobile" : "subtema").value.trim(),
    duracion: parseInt(document.getElementById(isMobile ? "duracion-mobile" : "duracion").value),
    sesiones: parseInt(document.getElementById(isMobile ? "sesiones-mobile" : "sesiones").value),
  };
}

