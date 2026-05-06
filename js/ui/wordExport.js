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

window.descargarListaCotejoWord = function (lista) {
  try {
    const criterios = (() => {
      const raw = lista?.criterios;
      if (Array.isArray(raw)) return raw;
      if (typeof raw === "string") {
        try { return JSON.parse(raw); } catch { return []; }
      }
      return [];
    })();

    if (!criterios.length) {
      alert("No hay criterios para exportar.");
      return;
    }

    const tema = lista?.tema || "Sin tema";
    const materia = lista?.materia || "";
    const nivel = lista?.nivel || "";
    const totalPuntos = lista?.total_puntos || 10;

    const filas = criterios.map((c) => `
      <tr>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${c.criterio || ""}</td>
        <td style="border:1px solid #000;padding:8px;text-align:center;font-size:10pt;vertical-align:middle;">${c.si ?? 2}</td>
        <td style="border:1px solid #000;padding:8px;text-align:center;font-size:10pt;vertical-align:middle;">${c.no ?? 0}</td>
      </tr>
    `).join("");

    const metaExtra = [
      materia ? `<strong>Materia:</strong> ${materia}` : "",
      nivel ? `<strong>Nivel:</strong> ${nivel}` : ""
    ].filter(Boolean).join(" &nbsp;&nbsp; ");

    const contenidoHTML = `
      <html>
        <head>
          <meta charset="UTF-8">
          <!--[if gte mso 9]>
          <xml>
            <w:WordDocument>
              <w:View>Print</w:View>
              <w:Zoom>100</w:Zoom>
              <w:DoNotOptimizeForBrowser/>
            </w:WordDocument>
          </xml>
          <![endif]-->
          <style>
            @page Section1 { size: 21cm 29.7cm; margin: 2cm; }
            div.Section1 { page: Section1; }
            body { font-family: Arial, sans-serif; font-size: 11pt; }
            h2 { margin-bottom: 6px; font-size: 13pt; }
            .meta { margin-bottom: 14px; font-size: 10pt; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #8ca2d2; color: white; border: 1px solid #000; padding: 8px; font-size: 10pt; font-weight: bold; }
            th.center { text-align: center; }
            .total-row { margin-top: 10px; font-weight: bold; font-size: 10pt; }
          </style>
        </head>
        <body>
          <div class="Section1">
            <h2>Lista de cotejo</h2>
            <p class="meta"><strong>Tema:</strong> ${tema}${metaExtra ? " &nbsp;&nbsp; " + metaExtra : ""}</p>
            <table>
              <thead>
                <tr>
                  <th style="width:70%;text-align:left;">Criterio</th>
                  <th class="center" style="width:15%;">S&iacute; (2 pts)</th>
                  <th class="center" style="width:15%;">No (0 pts)</th>
                </tr>
              </thead>
              <tbody>
                ${filas}
              </tbody>
            </table>
            <p class="total-row">Total: ${totalPuntos} puntos</p>
          </div>
        </body>
      </html>
    `;

    const nombreSeguro = tema
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "")
      .slice(0, 60) || "lista";

    const blob = new Blob([contenidoHTML], { type: "application/msword" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `lista-cotejo-${nombreSeguro}.doc`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Error al exportar lista de cotejo Word:", err);
    alert("Error al generar el archivo Word.");
  }
};
