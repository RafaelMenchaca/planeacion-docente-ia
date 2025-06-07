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
function crearDocumentoWord(htmlContenido, nombreArchivo = "Planeacion") {
 const plantillaHTML = `
<html xmlns:o='urn:schemas-microsoft-com:office:office'
      xmlns:w='urn:schemas-microsoft-com:office:word'
      xmlns='http://www.w3.org/TR/REC-html40'>
<head>
  <meta charset='utf-8'>
  <title>Planeación Didáctica</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      padding: 30px;
      background-color: #ffffff;
    }

    h1 {
      text-align: center;
      color: #1e3a8a;
      border-bottom: 3px solid #1e3a8a;
      padding-bottom: 10px;
      margin-bottom: 30px;
    }

    h2 {
      color: #1e40af;
      border-left: 5px solid #3b82f6;
      padding-left: 10px;
      margin-top: 30px;
    }

    h3 {
      color: #1e40af;
      margin-top: 20px;
    }

    table {
      border-collapse: collapse;
      width: 100%;
      margin: 20px 0;
      box-shadow: 0 0 5px rgba(0,0,0,0.1);
    }

    th {
      background-color: #e0f2fe;
      color: #0c4a6e;
      font-weight: bold;
      padding: 10px;
      border: 1px solid #93c5fd;
    }

    td {
      border: 1px solid #cbd5e1;
      padding: 10px;
    }

    tr:nth-child(even) {
      background-color: #f8fafc;
    }

    .seccion {
      margin-bottom: 40px;
    }

    .pie {
      margin-top: 50px;
      text-align: center;
      font-size: 0.9em;
      color: #64748b;
    }
  </style>
</head>
<body>
  <h1>Planeación Didáctica</h1>
  ${htmlContenido}
  <div class="pie">
    Documento generado automáticamente · ${new Date().toLocaleDateString()}
  </div>
</body>
</html>
`;


  const blob = new Blob([plantillaHTML], { type: "application/msword" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${nombreArchivo}.doc`;
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

  let nombreArchivo = prompt("Escribe el nombre de tu planeación:", "Planeacion");
  if (nombreArchivo === null) return;
   // Aquí validamos y limpiamos el nombre del archivo para que no tenga caracteres inválidos
  nombreArchivo = nombreArchivo.replace(/[^a-zA-Z0-9-_ ]/g, '').trim();
  // si queda sin espesificar sera llamado "planeacion"
  if (nombreArchivo.trim() === "") nombreArchivo = "Planeacion";

  crearDocumentoWord(contenidoHTML, nombreArchivo.trim());

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

