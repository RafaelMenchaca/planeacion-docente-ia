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

//rafa uwu


// ===================================================
// 🎨 ZONA LIBRE PARA DISEÑO DEL WORD
// Aquí puedes modificar TODO:
// - Textos
// - Títulos
// - Estilos
// - Estructura del documento
// Diseña el Word como lo necesita un maestro.
// ===================================================

    // Tabla superior informacion general de la UDI
const info = `
  <table style="width:100%; margin-bottom:15px; border-collapse:collapse;">
    
    <!-- Fila 1: Asignatura y Nivel -->
    <tr>
      <td><strong>Asignatura:</strong> ${data.materia || ""}</td>
      <td><strong>Nivel:</strong> ${data.nivel || ""}</td>
    </tr>

    <!-- Fila 2: Tema y Subtema -->
    <tr>
      <td><strong>Tema:</strong> ${data.tema || ""}</td>
      <td><strong>Subtema:</strong> ${data.subtema || ""}</td>
    </tr>

    <!-- Fila 3: Duración y número de sesiones -->
    <tr>
      <td><strong>Duración:</strong> ${data.duracion || ""} min</td>
      <td><strong>Sesiones:</strong> ${data.sesiones || ""}</td>
    </tr>

  </table>
`;
// Tabla de informacion por sesion de la UDI
const contenidoHTML = `
  <html>
    <head>
      <meta charset="UTF-8">

      <!-- NOTA: BLOQUE ESPECIAL PARA WORD 
           Se coloca DENTRO de <head>.
           Word SÍ interpreta este XML y permite configurar la página -->
      <!--[if gte mso 9]>
      <xml>
        <w:WordDocument>
          <w:View>Print</w:View>
          <w:Zoom>100</w:Zoom>
          <w:DoNotOptimizeForBrowser/>
        </w:WordDocument>
      </xml>
      <![endif]-->

      <!-- ESTILOS GENERALES -->
<style>
  /* NOTA: ESTO SE AGREGA PARA WORD
     Define una sección con tamaño horizontal REAL */
  @page Section1 {
    size: 29.7cm 21cm; /* A4 horizontal */
    margin: 2cm;
  }

  /* NOTA: Clase que activa la sección horizontal */
  div.Section1 {
    page: Section1;
  }

  /* Tipografía base del documento */
  body {
    font-family: Arial, sans-serif;
    font-size: 11pt;
  }

  /* Título principal */
  h2 {
    text-align: center;
    margin-bottom: 15px;
  }

  /* Estilo base para todas las tablas */
  table {
    border-collapse: collapse;
    width: 100%;
  }

  /* Encabezados de la tabla principal */
  th {
    background-color: #8ca2d2;
    color: white;
    border: 1px solid #000;
    padding: 8px;
    font-size: 10pt;
    text-transform: uppercase;
  }

  /* Celdas normales */
  td {
    border: 1px solid #000;
    padding: 8px;
    vertical-align: middle;
    font-size: 10pt;
  }

  /* Columna izquierda (secciones de la UDI) */
  .seccion {
    font-weight: bold;
    text-align: center;
    width: 16%;
  }

  /* Altura mínima de filas (Word-friendly) */
  .fila-alta td {
    height: 60px;
  }

</style>
    </head>

    <body>

      <!-- NOTA: ESTE DIV SE AGREGA PARA ACTIVAR LA SECCIÓN HORIZONTAL -->
      <div class="Section1">

        <h2>Planeación didáctica</h2>
        ${info}
        ${tabla.outerHTML}

      </div>
      <!-- FIN DEL DIV DE SECCIÓN -->

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
