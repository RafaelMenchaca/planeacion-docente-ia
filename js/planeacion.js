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


function mostrarResultadoBatch(data) {
  const resultado = document.getElementById("resultado");
  if (!resultado) return;

  // document.querySelector(".card.border-primary")?.classList.add("d-none");

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

