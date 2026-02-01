const estadoPlaneacion = {
  materia: "",
  nivel: "",
  unidad: 1,
  temas: [] // { tema, duracion }
};

function initPlaneacionPage() {
  document.getElementById("btn-generar")?.addEventListener("click", generarPlaneacion);
  document.getElementById("btn-generar-mobile")?.addEventListener("click", generarPlaneacion);

  document.getElementById("btn-agregar-tema")
    ?.addEventListener("click", () => agregarTemaDesdeUI({ esMobile: false }));

  document.getElementById("btn-agregar-tema-mobile")
    ?.addEventListener("click", () => agregarTemaDesdeUI({ esMobile: true }));
}

async function generarPlaneacion() {
  const { materia, nivel, unidad, temas } = estadoPlaneacion;

  if (
    !materia ||
    !nivel ||
    isNaN(unidad) ||
    unidad < 1 ||
    !Array.isArray(temas) ||
    temas.length === 0
  ) {
    alert("Completa todos los campos correctamente.");
    return;
  }

  for (const t of temas) {
    if (!t.tema || isNaN(t.duracion) || t.duracion < 10) {
      alert("Revisa los temas y sus duraciones.");
      return;
    }
  }

  const loader = document.getElementById("ia-loader");
  loader.style.display = "block";

  try {
    const data = await generarPlaneacionApi(estadoPlaneacion);
    if (!data) return;

    // aqui mostraremos el resultado batch para poder ver todas las planeaciones generadas
    mostrarResultadoBatch(data);

  } catch (error) {
    console.error("Error al generar:", error);
    alert("Error al generar la planeaci�n con IA.");
  } finally {
    loader.style.display = "none";
  }
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
    alert("Ingresa un tema v�lido y una duraci�n m�nima de 10 minutos.");
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

  renderTemas(estadoPlaneacion.temas);
}

function resetearFormulario() {
  window.location.reload();
}

function validateForm(tabIndex) {
  const tabs = document.getElementsByClassName("tab");
  const tab = Number.isInteger(tabIndex) ? tabs[tabIndex] : tabs[0];
  if (!tab) return true;

  const inputs = tab.querySelectorAll("input, select, textarea");
  for (const input of inputs) {
    if (input.hasAttribute("required") && !input.value) {
      return false;
    }
  }

  return true;
}

window.planeacionPage = {
  init: initPlaneacionPage,
  generarPlaneacion,
  agregarTemaDesdeUI,
  resetearFormulario
};
