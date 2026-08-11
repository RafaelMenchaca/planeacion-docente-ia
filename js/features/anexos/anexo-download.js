(function () {
  async function bibDescargarAnexo(anexoId) {
    console.debug("[downloads] anexo:start", { anexoId });
    try {
      const session = await window.requireSession();
      if (!session) return;
      const res = await apiObtenerAnexoDetalle(anexoId, session.access_token);
      const anexo = res?.anexo;
      if (!anexo) throw new Error("No se pudo obtener el anexo.");

      const suggested = window.AppUI.buildDownloadSuggestedName(
        "Anexo",
        anexo.tema || anexo.titulo
      );
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;

      descargarAnexoWord(anexo, filename);
      console.debug("[downloads] anexo:success", { anexoId });
    } catch (error) {
      console.error("[downloads] anexo:error", { anexoId, message: error?.message });
      alert("No se pudo descargar el anexo. Intenta nuevamente.");
    }
  }

  function descargarAnexoWord(anexo, filenameOverride) {
    const contenido = anexo.contenido || {};
    const tituloGeneral = contenido.titulo_general || anexo.titulo || "Anexos";
    const descripcion   = contenido.descripcion || "";
    const listaAnexos   = Array.isArray(contenido.anexos) ? contenido.anexos : [];
    const materia       = anexo.materia || "";
    const tema          = anexo.tema    || "";

    function renderAnexoHtml(a) {
      let html = `<h2 style="font-size:13pt; margin-top:18pt; margin-bottom:4pt; font-weight:bold;">ANEXO ${a.numero || ""}: ${escapeHtml(a.titulo || "")}</h2>`;

      if (a.instrucciones) {
        html += `<p style="font-style:italic; margin-bottom:8pt;"><strong>Instrucciones:</strong> ${escapeHtml(a.instrucciones)}</p>`;
      }

      if (Array.isArray(a.contenido)) {
        for (const bloque of a.contenido) {
          if (bloque.subtitulo) {
            html += `<p style="font-weight:bold; margin-top:8pt;">${escapeHtml(bloque.subtitulo)}</p>`;
          }
          if (bloque.texto) {
            html += `<p style="margin-bottom:6pt;">${escapeHtml(bloque.texto)}</p>`;
          }
          if (Array.isArray(bloque.preguntas) && bloque.preguntas.length) {
            html += `<ol style="margin-left:20pt;">`;
            bloque.preguntas.forEach((q) => {
              html += `<li style="margin-bottom:4pt;">${escapeHtml(q)}</li>`;
            });
            html += `</ol>`;
          }
        }
      }

      if (a.tabla && Array.isArray(a.tabla.columnas) && Array.isArray(a.tabla.filas)) {
        html += `<table style="border-collapse:collapse; width:100%; margin-top:8pt;">`;
        html += `<tr>`;
        a.tabla.columnas.forEach((col) => {
          html += `<th style="border:1px solid #999; background:#f0f0f0; padding:4pt 6pt; font-weight:bold;">${escapeHtml(col)}</th>`;
        });
        html += `</tr>`;
        a.tabla.filas.forEach((fila) => {
          html += `<tr>`;
          (Array.isArray(fila) ? fila : []).forEach((celda) => {
            html += `<td style="border:1px solid #999; padding:4pt 6pt;">${escapeHtml(celda || "")}</td>`;
          });
          html += `</tr>`;
        });
        html += `</table>`;
      }

      return html;
    }

    const encabezado = `
    <p style="margin-bottom:6pt;">Nombre del alumno: ___________________________&nbsp;&nbsp;&nbsp;&nbsp;Fecha: ____________</p>
    ${materia ? `<p style="margin-bottom:2pt;"><strong>Materia:</strong> ${escapeHtml(materia)}</p>` : ""}
    ${tema    ? `<p style="margin-bottom:10pt;"><strong>Tema:</strong> ${escapeHtml(tema)}</p>`    : ""}
  `;

    const cuerpo = listaAnexos.map(renderAnexoHtml).join("");

    const htmlDoc = `
    <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; font-size: 11pt; }
          h1   { text-align: center; font-size: 14pt; margin-bottom: 6pt; }
          p.descripcion { text-align: center; color: #555; margin-bottom: 16pt; font-size: 10pt; }
        </style>
      </head>
      <body>
        <h1>${escapeHtml(tituloGeneral)}</h1>
        ${descripcion ? `<p class="descripcion">${escapeHtml(descripcion)}</p>` : ""}
        ${encabezado}
        ${cuerpo}
      </body>
    </html>
  `;

    const blob = new Blob([htmlDoc], { type: "application/msword" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    const defaultAnexoName = tituloGeneral.replace(/[^a-zA-Z0-9\s\-_]/g, "").trim() || "Anexos";
    link.download = `${filenameOverride || defaultAnexoName}.doc`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  window.AnexoDownload = {
    download: descargarAnexoWord,
    downloadBiblioteca: bibDescargarAnexo
  };
})();
