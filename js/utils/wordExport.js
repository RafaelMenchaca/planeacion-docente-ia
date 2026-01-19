// utils/wordExport.js

// ===================================================
// ⚠️ ZONA PROTEGIDA — NO MODIFICAR
// Esta parte se encarga de:
// - Tomar los datos
// - Encontrar la tabla correcta
// - Ejecutar la descarga del Word
// Si se modifica, puede romper la descarga.
// ===================================================
window.descargarWord = function ({ data, tableId }) {
  try {
    const tabla = document.getElementById(tableId);
    if (!tabla) {
      alert("⚠️ No se encontró la tabla para exportar.");
      return;
    }

// ===================================================

//rafa gay


// ===================================================
// 🎨 ZONA LIBRE PARA DISEÑO DEL WORD
// Aquí puedes modificar TODO:
// - Textos
// - Títulos
// - Estilos
// - Estructura del documento
// Diseña el Word como lo necesita un maestro.
// ===================================================

    const info = `
      <p><strong>Asignatura:</strong> ${data.materia || ""}</p>
      <p><strong>Nivel:</strong> ${data.nivel || ""}</p>
      <p><strong>Tema:</strong> ${data.tema || ""}</p>
      <p><strong>Subtema:</strong> ${data.subtema || ""}</p>
      <p><strong>Duración:</strong> ${data.duracion || ""} min</p>
      <p><strong>Sesiones:</strong> ${data.sesiones || ""}</p>
    `;

    const contenidoHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: Arial, sans-serif; }
            table { border-collapse: collapse; width: 100%; margin-top: 20px; }
            th, td { border: 1px solid #000; padding: 8px; text-align: center; }
            th { background-color: #f2f2f2; }
          </style>
        </head>
        <body>
          <h2>Planeación didáctica</h2>
          ${info}
          ${tabla.outerHTML}
        </body>
      </html>
    `;




    
// =================================================== HASTA AQUI



// ===================================================
// 🔒 ZONA PROTEGIDA — NO MODIFICAR
// Lógica final de descarga del archivo Word
// ===================================================
    const blob = new Blob([contenidoHTML], {
      type: "application/msword",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `Planeacion_${data.materia || "SinMateria"}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

  } catch (err) {
    console.error("❌ Error al exportar Word:", err);
    alert("Error al generar el archivo Word.");
  }
};
// =================================================== 
