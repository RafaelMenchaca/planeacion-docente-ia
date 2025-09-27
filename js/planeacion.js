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

  // 🔹 Estructura fija de IA
  const tablaIA = [
    {
      momento: "Inicio",
      actividad: "Actividad(s) de conocimientos previos",
      paec: "Previo",
      tiempo: 10,
      producto: "Lluvia de ideas",
      instrumento: "Lista de cotejo",
      evaluacion_formativa: "Diagnóstica",
      evaluacion_sumativa: "-"
    },
    {
      momento: "Desarrollo",
      actividad: "Actividades de desarrollo",
      paec: "Aplicación",
      tiempo: duracion - 20,
      producto: "Ejercicios",
      instrumento: "Rúbrica",
      evaluacion_formativa: "Formativa",
      evaluacion_sumativa: "-"
    },
    {
      momento: "Cierre",
      actividad: "Actividad de cierre",
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

  tbody.innerHTML = "";

  tablaIA.forEach(row => {
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td class="bg-light fw-bold">${row.momento}</td>
      <td class="bg-light fw-bold">${row.actividad}</td>
      <td class="highlight-green">${row.paec}</td>
      <td class="highlight-green">${row.tiempo}</td>
      <td class="highlight-green">${row.producto}</td>
      <td class="highlight-green">${row.instrumento}</td>
      <td class="highlight-green">${row.evaluacion_formativa}</td>
      <td class="highlight-green">${row.evaluacion_sumativa}</td>
    `;
    tbody.appendChild(tr);
  });

  // 🔹 Quitar highlight verde después de 2s
  setTimeout(() => {
    document.querySelectorAll(".highlight-green").forEach(cell => {
      cell.classList.remove("highlight-green");
    });
  }, 2000);
}




function bloquearFormulario() {
  // 🔹 Inputs y selects
  document.querySelectorAll("#planeacionTable input, #planeacionTable select").forEach(el => {
    el.setAttribute("readonly", true);
    el.setAttribute("disabled", true);
  });

  // 🔹 Botón de generar
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
  // 🔹 Limpiar inputs y habilitarlos
  document.querySelectorAll("#planeacionTable input, #planeacionTable select").forEach(el => {
    el.value = "";
    el.removeAttribute("readonly");
    el.removeAttribute("disabled");
  });

  // 🔹 Restaurar valores por defecto
  document.getElementById("duracion").value = 50;
  document.getElementById("sesiones").value = 1;

  // 🔹 Restaurar tabla IA a placeholders
  const tbody = document.querySelector("#planeacionIA tbody");
  if (tbody) {
    tbody.innerHTML = `
      <tr>
        <td>Inicio</td>
        <td>Actividad(s) de conocimientos previos</td>
        <td colspan="6"><em>Se generará con IA</em></td>
      </tr>
      <tr>
        <td>Desarrollo</td>
        <td>Actividades de desarrollo</td>
        <td colspan="6"><em>Se generará con IA</em></td>
      </tr>
      <tr>
        <td>Cierre</td>
        <td>Actividades de cierre</td>
        <td colspan="6"><em>Se generará con IA</em></td>
      </tr>
    `;
  }

  // 🔹 Reactivar botón
  const btn = document.getElementById("btn-generar");
  if (btn) {
    btn.classList.remove("disabled");
    btn.removeAttribute("disabled");
    btn.innerHTML = '<i class="bi bi-magic"></i> Guardar planeación';
  }

  // 🔹 Limpiar resultado
  const resultado = document.getElementById("resultado");
  if (resultado) resultado.innerHTML = "";
}
