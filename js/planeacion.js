function generarSubtemas() {
  const subtemasInput = document.getElementById("subtemas").value;
  const duracion = parseInt(document.getElementById("duracion").value);
  const container = document.getElementById("subtemasContainer");

  container.innerHTML = "";
  const subtemas = subtemasInput.split("\n").map(s => s.trim()).filter(Boolean);

  subtemas.forEach((subtema, index) => {
    const div = document.createElement("div");
    div.className = "form-group";

    const safeSubtema = escapeHtml(subtema);
    div.innerHTML = `
      <label>${safeSubtema} - Duración: ${duracion} min</label>
      <input type="hidden" name="subtema_${index}" value="${subtema}">
      <label for="sesiones_${index}">Número de sesiones:</label>
      <input type="number" id="sesiones_${index}" name="sesiones_${index}" min="1" max="10" value="1">
    `;

    container.appendChild(div);
  });
}

async function generarPlaneacion() {
  const tipo = document.getElementById("tipoPlaneacion").value.trim();
  const tema = document.getElementById("tema").value.trim();
  const subtemasTexto = document.getElementById("subtemas").value;
  const duracion = parseInt(document.getElementById("duracion").value);
  const nivel = document.getElementById("nivel").value.trim();
  const materia = document.getElementById("asignatura").value.trim();

  const subtemas = subtemasTexto
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (!tema || subtemas.length === 0 || isNaN(duracion) || duracion < 10 || !nivel || !tipo || !materia) {
    alert("Por favor, completa todos los campos correctamente.");
    return;
  }

  let resultado = `<h2>🎓 Nivel Educativo: ${escapeHtml(nivel)}</h2>`;
  resultado += `<h2>📘 ${escapeHtml(tipo).toUpperCase()} - TEMA: ${escapeHtml(tema)}</h2>`;
  let contadorSesion = 1;

  const sesionesPorSubtema = {};

  subtemas.forEach((subtema, index) => {
    const sesionesInput = document.getElementById(`sesiones_${index}`);
    if (!sesionesInput) return;
    const sesiones = parseInt(sesionesInput.value);
    sesionesPorSubtema[subtema] = sesiones;

    for (let s = 1; s <= sesiones; s++) {
      const tiempoInicio = 10;
      const tiempoDesarrollo = 25;
      const tiempoCierre = duracion - tiempoInicio - tiempoDesarrollo;

      const safeSub = escapeHtml(subtema);
      resultado += `
        <h3>📗 SUBTEMA ${index + 1}.${s}: ${safeSub} (Duración: ${duracion} minutos)</h3>
        <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
          <thead style="background-color: #f3f4f6;">
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

  // document.getElementById("resultado").innerHTML = resultado;

  // // Ocultar botón generar, mostrar descargar
  // document.querySelector('button[onclick="generarPlaneacion()"]').style.display = "none";
  // document.getElementById("btn-descargar").style.display = "inline-block";

  // ✅ Nuevo: guardar en Supabase
  const payload = {
    materia,
    grado: nivel,
    tema,
    duracion,
    detalles_completos: {
      subtemas,
      tipoPlaneacion: tipo,
      sesiones_por_subtema: sesionesPorSubtema
    }
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/planeaciones`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
  
    if (!response.ok) throw new Error("No se pudo guardar la planeación");
  
    const data = await response.json();
  
    // ✅ Redirige directamente al detalle con el ID
    window.location.href = `detalle.html?id=${data.id}`;
  
  } catch (error) {
    console.error("❌ Error al guardar:", error);
    alert("❌ Error al guardar la planeación.");
  }
  
}


function descargarPlaneacion() {
  const contenidoHTML = document.getElementById("resultado").innerHTML;
  if (!contenidoHTML) {
    alert("Primero debes generar la planeación.");
    return;
  }

  let nombreArchivo = prompt("Escribe el nombre de tu planeación:", "Planeacion");
  if (nombreArchivo === null) return;
  if (nombreArchivo.trim() === "") nombreArchivo = "Planeacion";

  const blob = new Blob(
    ['<html><head><meta charset="UTF-8"></head><body>' + contenidoHTML + "</body></html>"],
    { type: "application/msword" }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo.trim() + ".doc";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  document.getElementById("btn-descargar").style.display = "none";
  const botonNueva = document.getElementById("btn-nueva");
  if (botonNueva) botonNueva.style.display = "inline-block";
}

function nuevaPlaneacion() {
  document.getElementById("resultado").innerHTML = "";
  const subtemasContenedor = document.getElementById("subtemasContainer");
  if (subtemasContenedor) subtemasContenedor.innerHTML = "";
  document.getElementById("formularioPlaneacion").reset();
  document.getElementById("btn-descargar").style.display = "none";
  document.getElementById("btn-nueva").style.display = "none";

  document.querySelector('button[onclick="generarPlaneacion()"]').style.display = "inline-block";
}

document.addEventListener("DOMContentLoaded", () => {
  const botonDescargar = document.getElementById("btn-descargar");
  const botonNueva = document.getElementById("btn-nueva");

  if (botonDescargar) botonDescargar.addEventListener("click", descargarPlaneacion);
  if (botonNueva) botonNueva.addEventListener("click", nuevaPlaneacion);
});
