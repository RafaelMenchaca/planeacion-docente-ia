document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("btn-generar")?.addEventListener("click", generarPlaneacion);
  document.getElementById("btn-generar-mobile")?.addEventListener("click", generarPlaneacion);

  document.getElementById("btn-agregar-tema")
    ?.addEventListener("click", () => agregarTemaDesdeUI({ esMobile: false }));

  document.getElementById("btn-agregar-tema-mobile")
    ?.addEventListener("click", () => agregarTemaDesdeUI({ esMobile: true }));
});



const estadoPlaneacion = {
  materia: "",
  nivel: "",
  unidad: 1,
  temas: [] // { tema, duracion }
};



async function generarPlaneacion() {
  const {
    materia,
    nivel,
    unidad,
    temas
  } = estadoPlaneacion;


  if (
  !materia ||
  !nivel ||
  isNaN(unidad) ||
  unidad < 1 ||
  !Array.isArray(temas) ||
  temas.length === 0
  ) {
    alert("⚠️ Completa todos los campos correctamente.");
    return;
  }

  for (const t of temas) {
  if (!t.tema || isNaN(t.duracion) || t.duracion < 10) {
    alert("⚠️ Revisa los temas y sus duraciones.");
    return;
    }
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

    // test de payload
    console.log("Payload a enviar:", estadoPlaneacion);

    const response = await fetch(`${API_BASE_URL}/api/planeaciones/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${session.access_token}`
      },
      body: JSON.stringify(estadoPlaneacion)
    });

    if (!response.ok) throw new Error("No se pudo generar la planeación con IA");

    const data = await response.json();

    // aqui mostraremos el resultado batch para poder ver todas las planeaciones generadas
    mostrarResultadoBatch(data);



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
      <p><strong>Unidad:</strong> ${data.unidad}</p>
      <p><strong>Tema:</strong> ${data.tema}</p>
      <p><strong>Duración:</strong> ${data.duracion} min</p>


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
  document.getElementById("btn-word")
  .addEventListener("click", () => {
    descargarWord({
      data,
      tableId: "planeacionIA",
    });
  });

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

  document.querySelectorAll(".duracion-input").forEach(input => {
    input.value = 50;
  });


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


function mostrarResultadoBatch(data) {
  const resultado = document.getElementById("resultado");
  if (!resultado) return;

  document.querySelector(".card.border-primary")?.classList.add("d-none");

  const { batch_id, total, planeaciones } = data;

  const materia = planeaciones[0]?.materia || "";
  const nivel = planeaciones[0]?.nivel || "";
  const unidad = planeaciones[0]?.unidad || "";

  const temasHtml = planeaciones
    .map(p => `<li>${p.tema}</li>`)
    .join("");

  resultado.innerHTML = `
    <div class="alert alert-success mt-4">
      <h5 class="mb-3">✅ Se generaron ${total} planeaciones correctamente</h5>

      <div class="card border-success mb-3">
        <div class="card-body text-center">
          <strong>${materia}</strong> | ${nivel} | Unidad ${unidad}
          <br>
          <a href="batch.html?batch_id=${batch_id}" class="btn btn-outline-success mt-2">
            <i class="bi bi-eye"></i> Ver
          </a>
        </div>
      </div>

      <p class="fw-semibold mb-1">Temas incluidos:</p>
      <ul>${temasHtml}</ul>

      <div class="text-center mt-3">
        <a href="dashboard.html" class="btn btn-outline-secondary me-2">
          <i class="bi bi-house"></i> Volver al Dashboard
        </a>
        <button class="btn btn-success" onclick="resetearFormulario()">
          <i class="bi bi-plus-circle"></i> Nueva planeación
        </button>
      </div>
    </div>
  `;
}


function inicializarCamposGlobales() {
  estadoPlaneacion.materia =
    document.getElementById("asignatura")?.value.trim() ||
    document.getElementById("asignatura-mobile")?.value.trim();

  estadoPlaneacion.nivel =
    document.getElementById("nivel")?.value ||
    document.getElementById("nivel-mobile")?.value;

  const unidadRaw =
    document.getElementById("unidad")?.value ||
    document.getElementById("unidad-mobile")?.value;

  estadoPlaneacion.unidad = parseInt(unidadRaw, 10);
}


function agregarTemaDesdeUI({ esMobile }) {
  const container = document.getElementById(
    esMobile ? "temas-container-mobile" : "temas-container"
  );

  const ultimaFila = container.querySelector(".tema-row:last-child");
  const temaInput = ultimaFila.querySelector(".tema-input");
  const duracionInput = ultimaFila.querySelector(".duracion-input");

  const tema = temaInput.value.trim();
  const duracion = parseInt(duracionInput.value, 10);

  if (!tema || !Number.isInteger(duracion) || duracion < 10) {
    alert("Ingresa un tema válido y una duración mínima de 10 minutos.");
    return;
  }

  if (estadoPlaneacion.temas.length === 0) {
    inicializarCamposGlobales();
    bloquearCamposGlobales();
  }

  estadoPlaneacion.temas.push({ tema, duracion });

  temaInput.value = "";
  duracionInput.value = 50;
  temaInput.focus();

  renderTemas();
}



function renderTemas() {
  const contenedores = [
    document.getElementById("lista-temas-agregados"),
    document.getElementById("lista-temas-agregados-mobile")
  ];

  contenedores.forEach(c => {
    if (!c) return;

    c.innerHTML = estadoPlaneacion.temas
      .map(
        t => `<div class="alert alert-secondary py-1 px-2 mb-1">
                • ${t.tema} (${t.duracion} min)
              </div>`
      )
      .join("");
  });
}


function bloquearCamposGlobales() {
  document.activeElement?.blur();

  ["asignatura", "nivel", "unidad", "asignatura-mobile", "nivel-mobile", "unidad-mobile"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
}

