function generarSubtemas() {
  const subtemasInput = document.getElementById("subtemas").value;
  const duracion = parseInt(document.getElementById("duracion").value);
  const container = document.getElementById("subtemasContainer");

  container.innerHTML = ""; // Limpiar antes de generar

  // Separar por líneas, eliminando líneas vacías y espacios
  const subtemas = subtemasInput.split("\n").map(s => s.trim()).filter(Boolean);

  subtemas.forEach((subtema, index) => {
    const div = document.createElement("div");
    div.className = "form-group";

    div.innerHTML = `
      <label>${subtema} - Duración: ${duracion} min</label>
      <input type="hidden" name="subtema_${index}" value="${subtema}">
      <label for="sesiones_${index}">Número de sesiones:</label>
      <input type="number" id="sesiones_${index}" name="sesiones_${index}" min="1" max="10" value="1">
    `;

    container.appendChild(div);
  });
}

function generarPlaneacion() {
  const tipo = document.getElementById("tipoPlaneacion").value.trim();
  const tema = document.getElementById("tema").value.trim();
  const subtemasTexto = document.getElementById("subtemas").value;
  const duracion = parseInt(document.getElementById("duracion").value);
  const nivel = document.getElementById("nivel").value.trim();

  const subtemas = subtemasTexto
    .split("\n")
    .map(s => s.trim())
    .filter(s => s.length > 0);

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

  document.getElementById("resultado").innerHTML = resultado;

  // Ocultar el botón "Generar Planeación"
  document.querySelector('button[onclick="generarPlaneacion()"]').style.display = "none";
  // Mostrar el botón "Descargar"
  document.getElementById("btn-descargar").style.display = "inline-block";
}
// Editar el estilo del word descargable
function descargarWord() {
  const contenido = `
    <div class="section">
      <h2>Planeación Didáctica</h2>
      <p><strong>Asignatura:</strong> Informática 3</p>
      <p><strong>Grado:</strong> Tercer año de secundaria</p>
      <p><strong>Docente:</strong> __________________________</p>
      <p><strong>Fecha:</strong> __________________________</p>
    </div>

    <div class="section">
      <table>
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
            <td>1</td>
            <td>50 min</td>
            <td>Apertura</td>
            <td>Dinámica de integración y diagnóstico previo</td>
            <td>Participación oral</td>
            <td>Lista de cotejo</td>
            <td>5 puntos</td>
          </tr>
          <tr>
            <td>1</td>
            <td>50 min</td>
            <td>Desarrollo</td>
            <td>Explicación del tema y actividad práctica en computadora</td>
            <td>Ejercicio digital guardado</td>
            <td>Rúbrica</td>
            <td>10 puntos</td>
          </tr>
          <tr>
            <td>1</td>
            <td>50 min</td>
            <td>Cierre</td>
            <td>Reflexión y actividad de repaso en equipos</td>
            <td>Resumen en cuaderno</td>
            <td>Lista de cotejo</td>
            <td>5 puntos</td>
          </tr>
        </tbody>
      </table>
    </div>
  `;

  const htmlCompleto = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <title>Planeación Didáctica</title>
      <style>
        body {
          font-family: Calibri, sans-serif;
          padding: 40px;
          color: #333;
        }
        h2 {
          color: #1a237e;
          border-bottom: 2px solid #ccc;
          padding-bottom: 4px;
        }
        p {
          font-size: 14px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #999;
          padding: 8px;
          font-size: 13px;
        }
        th {
          background-color: #e3f2fd;
        }
        td {
          background-color: #fafafa;
        }
        .section {
          margin-bottom: 30px;
        }
      </style>
    </head>
    <body>
      ${contenido}
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlCompleto], {
    type: 'application/msword'
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "planeacion.doc";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

function descargarPlaneacion() {
  const contenidoHTML = document.getElementById("resultado").innerHTML;
  if (!contenidoHTML) {
    alert("Primero debes generar la planeación.");
    return;
  }

  let nombreArchivo = prompt("Escribe el nombre de tu planeacion:", "Planeacion");
  if (nombreArchivo === null) return;
  if (nombreArchivo.trim() === "") nombreArchivo = "Planeacion";


  const blob = new Blob(
    [
      '<html><head><meta charset="UTF-8"></head><body>' +
        contenidoHTML +
        "</body></html>",
    ],
    {
      type: "application/msword",
    }
  );

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = nombreArchivo.trim() + ".doc";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Ocultar botón descargar y mostrar botón nueva planeación
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

  // Mostrar el botón "Generar Planeación"
  document.querySelector('button[onclick="generarPlaneacion()"]').style.display = "inline-block";
}

document.addEventListener("DOMContentLoaded", () => {
  const botonDescargar = document.getElementById("btn-descargar");
  if (botonDescargar) {
    botonDescargar.addEventListener("click", descargarPlaneacion);
  }
  const botonNueva = document.getElementById("btn-nueva");
  if (botonNueva) {
    botonNueva.addEventListener("click", nuevaPlaneacion);
  }

  
});

