(function () {
  async function downloadFromBiblioteca(planeacionId) {
    console.debug("[downloads] planeacion:start", { planeacionId });
    try {
      const planeacion = await window.obtenerPlaneacionDetalle(planeacionId);
      if (!planeacion) {
        alert("No se pudo obtener la planeacion.");
        return;
      }

      const suggested = window.AppUI.buildDownloadSuggestedName(
        "Planeacion",
        planeacion.tema || planeacion.materia
      );
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;

      const filas = Array.isArray(planeacion.tabla_ia) ? planeacion.tabla_ia : [];
      const filasHtml = filas.map(fila => `
      <tr>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${fila.tiempo_sesion || ""}</td>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${fila.actividades || ""}</td>
        <td style="border:1px solid #000;padding:8px;text-align:center;font-size:10pt;vertical-align:middle;">${fila.tiempo_min || ""}</td>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${fila.producto || ""}</td>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${fila.instrumento || ""}</td>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${fila.formativa || ""}</td>
        <td style="border:1px solid #000;padding:8px;font-size:10pt;vertical-align:middle;">${fila.sumativa || ""}</td>
      </tr>`).join("");

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
            @page Section1 { size: 29.7cm 21cm; margin: 2cm; }
            div.Section1 { page: Section1; }
            body { font-family: Arial, sans-serif; font-size: 11pt; }
            h2 { text-align: center; margin-bottom: 15px; }
            table { border-collapse: collapse; width: 100%; }
            th { background-color: #8ca2d2; color: white; border: 1px solid #000; padding: 8px; font-size: 10pt; text-transform: uppercase; }
            td { border: 1px solid #000; padding: 8px; vertical-align: middle; font-size: 10pt; }
          </style>
        </head>
        <body>
          <div class="Section1">
            <h2>Planeacion didactica</h2>
            <table style="margin-bottom:15px;">
              <tr>
                <td><strong>Asignatura:</strong> ${planeacion.materia || ""}</td>
                <td><strong>Nivel:</strong> ${planeacion.nivel || ""}</td>
              </tr>
              <tr>
                <td><strong>Tema:</strong> ${planeacion.tema || ""}</td>
                <td><strong>Subtema:</strong> ${planeacion.subtema || ""}</td>
              </tr>
              <tr>
                <td><strong>Duracion:</strong> ${planeacion.duracion || ""} min</td>
                <td><strong>Sesiones:</strong> ${planeacion.sesiones || ""}</td>
              </tr>
            </table>
            <table>
              <thead>
                <tr>
                  <th>Momento / Sesion</th>
                  <th>Actividades</th>
                  <th>Tiempo (min)</th>
                  <th>Producto</th>
                  <th>Instrumento</th>
                  <th>Formativa</th>
                  <th>Sumativa</th>
                </tr>
              </thead>
              <tbody>${filasHtml}</tbody>
            </table>
          </div>
        </body>
      </html>`;

      const blob = new Blob([contenidoHTML], { type: "application/msword" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${filename}.doc`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      console.debug("[downloads] planeacion:success", { planeacionId });
    } catch (error) {
      console.error("[downloads] planeacion:error", { planeacionId, message: error?.message });
      alert("No se pudo descargar la planeacion. Intenta nuevamente.");
    }
  }

  window.PlaneacionDownload = {
    downloadFromBiblioteca
  };
})();
