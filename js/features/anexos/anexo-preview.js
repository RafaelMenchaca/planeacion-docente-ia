(function () {
  async function openBibliotecaAnexoPreview(anexoId) {
    try {
      const session = await window.requireSession();
      if (!session) return;

      const modal = document.getElementById("biblioteca-anexo-modal");
      if (!modal) return;

      const card = modal.querySelector(".biblioteca-modal-card");
      if (!card) return;

      card.innerHTML = `
      <div class="bib-anexo-head">
        <h3>Cargando anexo...</h3>
        <button type="button" id="bib-anexo-close" class="bib-lista-close">X</button>
      </div>
      <div class="bib-anexo-body" style="padding:1rem;">
        <p class="text-sm text-slate-500">Un momento...</p>
      </div>
    `;
      document.getElementById("bib-anexo-close")?.addEventListener("click", closeBibliotecaAnexoModal);
      modal.classList.remove("hidden");
      document.body.classList.add("overflow-hidden");

      const res   = await apiObtenerAnexoDetalle(anexoId, session.access_token);
      const anexo = res?.anexo;
      if (!anexo) throw new Error("No se pudo cargar el anexo.");

      renderBibliotecaAnexoModal(anexo);
    } catch (error) {
      console.error("[biblioteca] Error cargando anexo:", error);
      const card = document.getElementById("biblioteca-anexo-modal")?.querySelector(".biblioteca-modal-card");
      if (card) {
        card.innerHTML = `
        <div class="bib-anexo-head">
          <h3>Error</h3>
          <button type="button" id="bib-anexo-close" class="bib-lista-close">X</button>
        </div>
        <div class="bib-anexo-body" style="padding:1rem;">
          <p class="text-sm text-rose-600">No se pudo cargar el anexo.</p>
        </div>
      `;
        document.getElementById("bib-anexo-close")?.addEventListener("click", closeBibliotecaAnexoModal);
      }
    }
  }

  function closeBibliotecaAnexoModal() {
    const modal = document.getElementById("biblioteca-anexo-modal");
    if (modal) modal.classList.add("hidden");
    document.body.classList.remove("overflow-hidden");
  }

  function renderBibliotecaAnexoModal(anexo) {
    const modal = document.getElementById("biblioteca-anexo-modal");
    if (!modal) return;

    const card       = modal.querySelector(".biblioteca-modal-card");
    const contenido  = anexo.contenido || {};
    const titulo     = contenido.titulo_general || anexo.titulo || "Anexos";
    const descripcion = contenido.descripcion || "";
    const listaAnexos = Array.isArray(contenido.anexos) ? contenido.anexos : [];

    function renderAnexoBlock(a) {
      let html = `<div style="margin-bottom:1.5rem;">`;
      html += `<p style="font-weight:700; font-size:0.75rem; letter-spacing:0.08em; text-transform:uppercase; color:#64748b; margin-bottom:2px;">ANEXO ${a.numero || ""}</p>`;
      html += `<h4 style="font-size:1rem; font-weight:700; color:#1e293b; margin-bottom:6px;">${escapeHtml(a.titulo || "")}</h4>`;

      if (a.instrucciones) {
        html += `<p style="font-style:italic; color:#475569; margin-bottom:10px; font-size:0.875rem;"><em>Instrucciones:</em> ${escapeHtml(a.instrucciones)}</p>`;
      }

      if (Array.isArray(a.contenido)) {
        for (const bloque of a.contenido) {
          if (bloque.subtitulo) {
            html += `<p style="font-weight:600; color:#334155; margin-top:10px; margin-bottom:4px;">${escapeHtml(bloque.subtitulo)}</p>`;
          }
          if (bloque.texto) {
            html += `<p style="color:#475569; margin-bottom:6px; font-size:0.875rem;">${escapeHtml(bloque.texto)}</p>`;
          }
          if (Array.isArray(bloque.preguntas) && bloque.preguntas.length) {
            html += `<ol style="padding-left:1.25rem; margin-bottom:6px;">`;
            bloque.preguntas.forEach((q, i) => {
              html += `<li style="color:#475569; font-size:0.875rem; margin-bottom:3px;">${escapeHtml(q)}</li>`;
            });
            html += `</ol>`;
          }
        }
      }

      if (a.tabla && Array.isArray(a.tabla.columnas) && Array.isArray(a.tabla.filas)) {
        html += `<div style="overflow-x:auto; margin-top:8px;">`;
        html += `<table style="border-collapse:collapse; width:100%; font-size:0.8125rem;">`;
        html += `<thead><tr>`;
        a.tabla.columnas.forEach((col) => {
          html += `<th style="border:1px solid #cbd5e1; background:#f1f5f9; padding:5px 8px; text-align:left; font-weight:600;">${escapeHtml(col)}</th>`;
        });
        html += `</tr></thead><tbody>`;
        a.tabla.filas.forEach((fila) => {
          html += `<tr>`;
          (Array.isArray(fila) ? fila : []).forEach((celda) => {
            html += `<td style="border:1px solid #cbd5e1; padding:5px 8px;">${escapeHtml(celda || "")}</td>`;
          });
          html += `</tr>`;
        });
        html += `</tbody></table></div>`;
      }

      html += `</div>`;
      return html;
    }

    const cuerpoHtml = listaAnexos.length
      ? listaAnexos.map(renderAnexoBlock).join('<hr style="border:none; border-top:1px solid #e2e8f0; margin:1rem 0;">')
      : `<p style="color:#94a3b8; font-size:0.875rem;">Este anexo no tiene contenido.</p>`;

    card.innerHTML = `
    <div class="bib-anexo-head" style="display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; padding-bottom:0.75rem; border-bottom:1px solid #e2e8f0; margin-bottom:1rem;">
      <div>
        <p style="font-size:0.7rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; color:#0891b2; margin-bottom:2px;">MATERIAL PARA ALUMNOS</p>
        <h3 style="font-size:1.125rem; font-weight:700; color:#1e293b;">${escapeHtml(titulo)}</h3>
        ${descripcion ? `<p style="font-size:0.8125rem; color:#64748b; margin-top:2px;">${escapeHtml(descripcion)}</p>` : ""}
        ${anexo.materia || anexo.nivel ? `<p style="font-size:0.75rem; color:#94a3b8; margin-top:4px;">${[anexo.materia, anexo.nivel, anexo.tema].filter(Boolean).map(escapeHtml).join(" · ")}</p>` : ""}
      </div>
      <button type="button" id="bib-anexo-close" class="bib-lista-close" style="flex-shrink:0;">X</button>
    </div>
    <div class="bib-anexo-body" style="overflow-y:auto; max-height:45vh; padding-right:4px;">
      ${cuerpoHtml}
    </div>
    <div style="display:flex; justify-content:flex-end; padding-top:0.75rem; border-top:1px solid #e2e8f0; margin-top:0.75rem;">
      <button type="button" id="bib-anexo-descargar" class="bib-lista-submit"
        data-anexo-id="${escapeHtml(String(anexo.id))}">
        Descargar Word
      </button>
    </div>
  `;

    document.getElementById("bib-anexo-close")?.addEventListener("click", closeBibliotecaAnexoModal);
    document.getElementById("bib-anexo-descargar")?.addEventListener("click", async () => {
      const suggested = window.AppUI.buildDownloadSuggestedName("Anexo", anexo.tema || anexo.titulo);
      const filename = await window.AppUI.openDownloadNameModal({ suggestedName: suggested, extension: "doc" });
      if (filename === null) return;
      closeBibliotecaAnexoModal();
      window.AnexoDownload.download(anexo, filename);
    });
  }

  window.AnexoPreview = {
    open: openBibliotecaAnexoPreview,
    render: renderBibliotecaAnexoModal,
    close: closeBibliotecaAnexoModal
  };
})();
