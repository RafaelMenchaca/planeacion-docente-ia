function generarSubtemas() {
  const container = document.getElementById("subtemasContainer");
  container.innerHTML = "";
  const subtemasTexto = document.getElementById("subtemas").value;
  const subtemas = subtemasTexto
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);

<<<<<<< HEAD
  subtemas.forEach((subtema, index) => {
    const group = document.createElement("div");
    group.classList.add("subtema-group");
    group.innerHTML = `
      <label><strong>Subtema:</strong> ${subtema}</label><br>
      <label for="sesiones_${index}">¿Cuántas sesiones de planeación requiere este subtema?</label>
      <input type="number" id="sesiones_${index}" name="sesiones_${index}" value="1" min="1" />
    `;
    container.appendChild(group);
  });
=======
    loadComponent('navbar-placeholder', './components/navbar.html');
});

if (typeof module !== 'undefined') {
    module.exports = { validateForm };
}

let currentTab = 0;
const tabs = document.querySelectorAll('.tab');
const steps = document.querySelectorAll('.step');

function showTab(n) {
    tabs.forEach((tab, i) => {
        tab.classList.toggle('active', i === n);
    });
    steps.forEach((step, i) => {
        step.classList.toggle('active', i === n);
    });
    currentTab = n;
    window.scrollTo({ top: 0, behavior: 'smooth' });
>>>>>>> cba72caf3f3d48e198d5a9ed4dd64c8de485a884
}

function generarPlaneacion() {
  const tipo = document.getElementById("tipoPlaneacion").value.trim();
  const tema = document.getElementById("tema").value.trim();
  const subtemasTexto = document.getElementById("subtemas").value;
  const duracion = parseInt(document.getElementById("duracion").value);
  const nivel = document.getElementById("nivel").value.trim();
  const subtemas = subtemasTexto
    .split(",")
    .map(s => s.trim())
    .filter(s => s.length > 0);

<<<<<<< HEAD
  if (!tema || subtemas.length === 0 || isNaN(duracion) || duracion < 10 || !nivel || !tipo) {
    alert("Por favor, completa todos los campos correctamente.");
    return;
  }

  let resultado = `<h2>🎓 Nivel Educativo: ${nivel}</h2>`;
  resultado += `<h2>📘 ${tipo.toUpperCase()} - TEMA: ${tema}</h2>`;
  let contadorSesion = 1;

  subtemas.forEach((subtema, index) => {
    const sesionesInput = document.getElementById(`sesiones_${index}`);
    if (!sesionesInput) return;
    const sesiones = parseInt(sesionesInput.value);

    for (let s = 1; s <= sesiones; s++) {
      const tiempoInicio = 10;
      const tiempoDesarrollo = 25;
      const tiempoCierre = duracion - tiempoInicio - tiempoDesarrollo;

      resultado += `
        <h3>📗 SUBTEMA ${index + 1}.${s}: ${subtema} (Duración: ${duracion} minutos)</h3>
        <table border="1" cellspacing="0" cellpadding="5">
          <thead>
            <tr>
              <th>Sesión</th>
              <th>Tiempo</th>
              <th>Momento</th>
              <th>Actividad</th>
              <th>Producto de Aprendizaje</th>
              <th>Instrumento de Evaluación</th>
              <th>Evaluación</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>${contadorSesion}</td>
              <td><strong>${tiempoInicio} min</strong></td>
              <td><strong>Inicio</strong></td>
              <td><em>Escribe aquí la actividad de inicio.</em></td>
              <td><em>Lluvia de ideas, participación oral, etc.</em></td>
              <td><em>Lista de cotejo, escala, etc.</em></td>
              <td><em>Diagnóstica – Heteroevaluación (%)</em></td>
            </tr>
            <tr>
              <td>${contadorSesion}</td>
              <td><strong>${tiempoDesarrollo} min</strong></td>
              <td><strong>Desarrollo</strong></td>
              <td><em>Describe la actividad principal.</em></td>
              <td><em>Ejercicios, mapa mental, etc.</em></td>
              <td><em>Rúbrica, lista, etc.</em></td>
              <td><em>Formativa – Coevaluación (%)</em></td>
            </tr>
            <tr>
              <td>${contadorSesion}</td>
              <td><strong>${tiempoCierre} min</strong></td>
              <td><strong>Cierre</strong></td>
              <td><em>Reflexión, repaso o actividad de cierre.</em></td>
              <td><em>Conclusión escrita, resumen, etc.</em></td>
              <td><em>Lista de cotejo, rúbrica, etc.</em></td>
              <td><em>Sumativa – Autoevaluación (%)</em></td>
            </tr>
          </tbody>
        </table>
        <br>
      `;
      contadorSesion++;
    }
  });

  document.getElementById("resultado").innerHTML = resultado;
=======
function validateForm(tabIndex) {
    const tab = tabs[tabIndex];
    let valid = true;

    // Validar inputs de texto, selects y textareas
    const inputs = tab.querySelectorAll('input[type=text], select, textarea');
    for (const input of inputs) {
        if (input.hasAttribute('required') && input.value.trim() === '') {
            valid = false;
            alert('Por favor, completa todos los campos obligatorios.');
            break;
        }
    }

    // Validar grupos de radios que sean requeridos
    if (valid) {
        const requiredRadios = tab.querySelectorAll('input[type=radio][required]');
        const radioGroups = new Set(Array.from(requiredRadios).map(r => r.name));

        for (const group of radioGroups) {
            if (!tab.querySelector(`input[name="${group}"]:checked`)) {
                valid = false;
                alert('Por favor, selecciona una opción en los campos obligatorios.');
                break;
            }
        }
    }

    return valid;
>>>>>>> cba72caf3f3d48e198d5a9ed4dd64c8de485a884
}

function limpiarContenido() {
  document.getElementById("formularioPlaneacion").reset();
  document.getElementById("resultado").innerHTML = "";
  document.getElementById("subtemasContainer").innerHTML = "";
}


function descargarPlaneacion() {
  const contenidoHTML = document.getElementById("resultado").innerHTML;
  if (!contenidoHTML) {
    alert("Primero debes generar la planeación.");
    return;
  }

  // Solicita el nombre del archivo al usuario
  let nombreArchivo = prompt("Escribe el nombre de tu planeacion:", "Planeacion");

  // Si el usuario cancela, no se descarga nada
  if (nombreArchivo === null) {
    return;
  }

  // Si el usuario deja en blanco, se usa un nombre por defecto
  if (nombreArchivo.trim() === "") {
    nombreArchivo = "Planeacion";
  }

  const blob = new Blob(['<html><head><meta charset="UTF-8"></head><body>' + contenidoHTML + '</body></html>'], {
    type: "application/msword"
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo.trim() + ".doc";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

