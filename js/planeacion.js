document.addEventListener("DOMContentLoaded", () => {
  const btnGenerar = document.getElementById("btn-generar");
  if (btnGenerar) {
    btnGenerar.addEventListener("click", generarPlaneacion);
  }
});

async function generarPlaneacion() {
  const materia = document.getElementById("asignatura").value.trim();
  const nivel = document.getElementById("nivel").value.trim();
  const tema = document.getElementById("tema").value.trim();
  const subtema = document.getElementById("subtema").value.trim();
  const duracion = parseInt(document.getElementById("duracion").value);
  const sesiones = parseInt(document.getElementById("sesiones").value);

  if (!materia || !nivel || !tema || !subtema || isNaN(duracion) || duracion < 10 || isNaN(sesiones) || sesiones < 1) {
    alert("⚠️ Completa todos los campos correctamente.");
    return;
  }

  // 🔹 Estructura de ejemplo IA
  const tablaIA = [
    {
      actividad: "Discusión guiada",
      paec: "Previo",
      tiempo: 10,
      producto: "Mapa mental",
      instrumento: "Lista de cotejo",
      evaluacion_formativa: "Diagnóstica",
      evaluacion_sumativa: "-"
    },
    {
      actividad: "Resolución de problemas en equipo",
      paec: "Aplicación",
      tiempo: duracion - 20,
      producto: "Ejercicios resueltos",
      instrumento: "Rúbrica",
      evaluacion_formativa: "Formativa",
      evaluacion_sumativa: "-"
    },
    {
      actividad: "Reflexión grupal",
      paec: "Reflexión",
      tiempo: 10,
      producto: "Conclusión escrita",
      instrumento: "Lista de cotejo",
      evaluacion_formativa: "-",
      evaluacion_sumativa: "Sumativa"
    }
  ];

  const payload = {
    materia,
    nivel,
    tema,
    subtema,
    duracion,
    sesiones,
    tabla_ia: tablaIA
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/planeaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) throw new Error("No se pudo guardar la planeación");

    const data = await response.json();

    // 🔹 Rellenar tabla IA
    rellenarTablaIA(data.tabla_ia);

    // 🔹 Bloquear inputs + botón
    bloquearFormulario();

    // 🔹 Mostrar confirmación
    mostrarResultado(data);

  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert("❌ Error al guardar la planeación.");
  }
}

function rellenarTablaIA(tablaIA) {
  const tbody = document.querySelector("#planeacionIA tbody");
  if (!tbody) return;

  const rows = tbody.querySelectorAll("tr");

  tablaIA.forEach((row, index) => {
    if (rows[index]) {
      const cells = rows[index].querySelectorAll("td");

      // ❌ Ya no tocamos cells[0] (Tiempo de la sesión)
      // 🔹 La IA solo rellena desde la columna 2 en adelante
      cells[1].textContent = row.actividad;
      cells[2].textContent = row.paec;
      cells[3].textContent = row.tiempo;
      cells[4].textContent = row.producto;
      cells[5].textContent = row.instrumento;
      cells[6].textContent = row.evaluacion_formativa;
      cells[7].textContent = row.evaluacion_sumativa;

      // 🔹 Aplica highlight verde SOLO en columnas de IA (2 a 7)
      for (let i = 1; i < cells.length; i++) {
        cells[i].classList.add("highlight-green");
      }
    }
  });

  // 🔹 Quitar highlight verde después de 2s
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

      <div class="mt-3 d-flex gap-2">
        <a href="detalle.html?id=${data.id}" class="btn btn-outline-primary">
          <i class="bi bi-search"></i> Ver en detalle
        </a>
        <a href="dashboard.html" class="btn btn-outline-secondary">
          <i class="bi bi-house"></i> Volver al Dashboard
        </a>
        <button class="btn btn-success" onclick="resetearFormulario()">
          <i class="bi bi-plus-circle"></i> Nueva planeación
        </button>
      </div>
    </div>
  `;
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
