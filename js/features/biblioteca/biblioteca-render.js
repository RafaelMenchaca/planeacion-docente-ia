// Owner del render no modal vigente de Biblioteca.
// Script clásico: consume estado/superficies definidos por biblioteca.page.js.

// ---- RENDER TABS ----

/**
 * Card estándar de Biblioteca para estados generating/error/skipped/ready.
 * titulo y meta deben ser HTML seguro (ya escapado).
 * opts.errorMessage es texto plano (se escapa aquí).
 */
function renderBibliotecaProgressCard(titulo, meta, status, opts) {
  opts = opts || {};
  const resolvedStatus = (status === "pending" || !status) ? "generating" : status;
  const pill = typeof renderProgressPill === "function"
    ? renderProgressPill(resolvedStatus, resolvedStatus === "generating" ? "Generando" : undefined)
    : `<span>${resolvedStatus}</span>`;
  const rowExtra = resolvedStatus === "generating" ? " bib-item-generating"
    : resolvedStatus === "error"     ? " bib-item-error"
    : "";
  return `
    <div class="biblioteca-item-row${rowExtra}">
      <div class="biblioteca-item-info">
        <span class="biblioteca-item-title">${titulo}</span>
        ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
        ${opts.errorMessage ? `<span class="bib-item-status-msg bib-item-error-msg">${escapeHtml(opts.errorMessage)}</span>` : ""}
      </div>
      <div class="biblioteca-item-actions">${pill}</div>
    </div>`;
}

function renderProgressItemHtml(item) {
  const status   = item.status === "pending" ? "generating" : (item.status || "generating");
  const titulo   = escapeBibliotecaDisplayText(item.titulo);
  const errorMsg = status === "error" ? (item.message || "") : "";
  const meta     = (status !== "error" && item.message) ? escapeHtml(item.message) : "";
  return renderBibliotecaProgressCard(titulo, meta, status, { errorMessage: errorMsg });
}

function renderPendingSpinnerCard(message) {
  return renderBibliotecaProgressCard(escapeHtml(message || "Generando..."), "", "generating");
}

function renderBibliotecaSectionHeader(title, actionHtml = "") {
  return `
    <div class="biblioteca-section-header">
      <h4 class="biblioteca-section-title">${escapeHtml(title)}</h4>
      ${actionHtml ? `<div class="biblioteca-section-actions">${actionHtml}</div>` : ""}
    </div>
  `;
}

function getBibliotecaExamTypeLabel(tipo) {
  const labels = {
    opcion_multiple: "Opcion multiple",
    verdadero_falso: "Verdadero/Falso",
    respuesta_corta: "Respuesta corta / completar",
    completar: "Respuesta corta / completar",
    emparejamiento: "Emparejamiento / relacion de columnas",
    relacion_columnas: "Emparejamiento / relacion de columnas",
    pregunta_abierta: "Pregunta abierta / ensayo",
    ensayo: "Pregunta abierta / ensayo",
    calculo_numerico: "Calculo / Numerica",
    ordenacion_jerarquizacion: "Ordenacion / jerarquizacion",
    ordenacion: "Ordenacion / jerarquizacion"
  };
  return labels[String(tipo || "").trim()] || formatBibliotecaDisplayText(tipo);
}

function getBibliotecaExamTopics(examen) {
  const temas = Array.isArray(examen?.contexto_temas) ? examen.contexto_temas : [];
  return [...new Set(temas.map((tema) => tema?.tema || tema?.titulo).filter(Boolean))];
}

function renderPlaneacionesTab(conjunto) {
  const planeaciones = Array.isArray(conjunto.planeaciones) ? conjunto.planeaciones : [];
  const id = escapeHtml(String(conjunto.id));
  const addButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="agregar-planeacion" data-conjunto-id="${id}">
      + Agregar Tema
    </button>`;

  let pendingHtml = "";
  if (conjunto.isPending) {
    const items = (window.explorerState?.progress?.items) || [];
    if (items.length) {
      pendingHtml = items.map(renderProgressItemHtml).join("");
    } else {
      pendingHtml = renderBibliotecaProgressCard(
        escapeHtml("Preparando generacion..."), "", "generating"
      );
    }
  } else {
    const pending = BibliotecaPlaneacionesPending.get(conjunto.id);
    if (pending) {
      const errorHtml = pending.error
        ? `<div class="mt-1 text-xs text-rose-600">${escapeHtml(pending.error)}</div>`
        : "";
      pendingHtml = pending.items.map(renderProgressItemHtml).join("") + errorHtml;
    }
  }

  if (!planeaciones.length && !pendingHtml) {
    return `
      ${renderBibliotecaSectionHeader("Planeaciones", addButton)}
      <p class="biblioteca-empty-tab">Este bloque no tiene planeaciones.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Planeaciones", addButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${planeaciones.map(p => {
        const titulo   = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
        const duracion = p.duracion ? `${p.duracion} min` : "";
        const fecha    = bibFormatShortDateTime(p.fecha_creacion);
        const meta     = [duracion, fecha].filter(Boolean).join(" &middot; ");
        const pid      = escapeHtml(String(p.id));
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <a href="detalle.html?id=${encodeURIComponent(p.id)}" class="biblioteca-btn-link">Ver</a>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-planeacion"
                data-planeacion-id="${pid}">Descargar</button>
              <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
                data-bib-action="eliminar-planeacion"
                data-planeacion-id="${pid}"
                data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderExamenesTab(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const actionButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="generar-examen" data-conjunto-id="${id}">
      + Generar examen
    </button>`;

  if (conjunto.isPending) {
    return `
      ${renderBibliotecaSectionHeader("Examenes")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear examenes cuando el bloque este listo.</p>
    `;
  }

  const examenes = Array.isArray(conjunto.examenes) ? conjunto.examenes : [];
  const pending  = BibliotecaExamPending.get(conjunto.id);

  let pendingHtml = "";
  if (pending) {
    const examTitulo = `Examen de ${escapeBibliotecaDisplayText(conjunto.titulo, "Bloque de planeacion")}`;
    const examStatus = pending.error ? "error" : "generating";
    pendingHtml = renderBibliotecaProgressCard(
      examTitulo,
      pending.message ? escapeHtml(pending.message) : "",
      examStatus,
      { errorMessage: pending.error || "" }
    );
  }

  if (!examenes.length && !pending) {
    return `
      ${renderBibliotecaSectionHeader("Examenes", actionButton)}
      <p class="biblioteca-empty-tab">Aun no hay examenes en este bloque.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Examenes", actionButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${examenes.map(ex => {
        const titulo    = `Examen de ${escapeBibliotecaDisplayText(conjunto.titulo, "Bloque de planeacion")}`;
        const preguntas = ex.total_preguntas ? `${ex.total_preguntas} pregunta(s)` : "";
        const fecha     = bibFormatShortDateTime(ex.created_at);
        const tipos     = [...new Set((Array.isArray(ex.tipos_pregunta) ? ex.tipos_pregunta : []).map(getBibliotecaExamTypeLabel).filter(Boolean))].map(escapeHtml).join(" · ");
        const temas     = getBibliotecaExamTopics(ex).map((tema) => escapeBibliotecaDisplayText(tema)).join(" · ");
        const meta      = [fecha, preguntas, tipos, temas ? `Temas: ${temas}` : ""].filter(Boolean).join(" &bull; ");
        const exId      = escapeHtml(String(ex.id));
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="ver-examen"
                data-examen-id="${exId}">Ver</button>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-examen"
                data-examen-id="${exId}">Descargar</button>
              <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
                data-bib-action="eliminar-examen"
                data-examen-id="${exId}"
                data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

function renderAnexosTab(conjunto) {
  const id = escapeHtml(String(conjunto.id));

  const actionButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="abrir-modal-anexos" data-conjunto-id="${id}">
      + Generar anexos
    </button>`;

  if (conjunto.isPending) {
    return `
      ${renderBibliotecaSectionHeader("Anexos")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear anexos cuando el bloque este listo.</p>
    `;
  }

  const anexos         = Array.isArray(conjunto.anexos) ? conjunto.anexos : [];
  const generatingMap  = BibliotecaAnexosPending.getBatch(conjunto.id) || {};

  const anexosByPlanId = new Map(
    anexos.map((a) => [normalizeBibliotecaId(a.planeacion_id), a])
  );

  // Cards de anexos ya generados
  const realRowsHtml = anexos.map((anexo) => {
    const pid     = normalizeBibliotecaId(anexo.planeacion_id);
    const tema    = escapeBibliotecaDisplayText(anexo.tema, "Sin titulo");
    const titulo  = tema;
    const fecha   = bibFormatShortDateTime(anexo.created_at);
    const meta    = fecha || "";
    const anexoId = escapeHtml(String(anexo.id));
    return `
      <div class="biblioteca-item-row">
        <div class="biblioteca-item-info">
          <span class="biblioteca-item-title">${titulo}</span>
          ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
        </div>
        <div class="biblioteca-item-actions">
          <button type="button" class="biblioteca-btn-link"
            data-bib-action="ver-anexo"
            data-anexo-id="${anexoId}">Ver</button>
          <button type="button" class="biblioteca-btn-link"
            data-bib-action="descargar-anexo"
            data-anexo-id="${anexoId}">Descargar</button>
          <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
            data-bib-action="eliminar-anexo"
            data-anexo-id="${anexoId}"
            data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
        </div>
      </div>`;
  }).join("");

  // Cards temporales para los que están en proceso (excluir los que ya tienen anexo real)
  const tempRowsHtml = Object.entries(generatingMap)
    .filter(([pid]) => !anexosByPlanId.has(pid))
    .map(([pid, item]) => {
      const titulo = escapeBibliotecaDisplayText(item.titulo, "Sin titulo");
      const meta   = [
        escapeBibliotecaDisplayText(item.materia),
        escapeBibliotecaDisplayText(item.nivel)
      ].filter(Boolean).join(" &middot; ");

      if (item.status === "error") {
        return renderBibliotecaProgressCard(titulo, meta, "error", {
          errorMessage: item.errorMessage || "No se pudo generar el anexo."
        });
      }

      return renderBibliotecaProgressCard(titulo, meta, "generating");
    }).join("");

  const hasContent = realRowsHtml || tempRowsHtml;

  if (!hasContent) {
    return `
      ${renderBibliotecaSectionHeader("Anexos", actionButton)}
      <p class="biblioteca-empty-tab">Este bloque todavia no tiene anexos generados.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Anexos", actionButton)}
    <div class="biblioteca-items-list">
      ${realRowsHtml}
      ${tempRowsHtml}
    </div>
  `;
}

function renderListasCotejoTab(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const actionButton = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-secondary"
      data-bib-action="generar-lista" data-conjunto-id="${id}">
      + Generar lista de cotejo
    </button>`;

  if (conjunto.isPending) {
    return `
      ${renderBibliotecaSectionHeader("Listas de cotejo")}
      <p class="biblioteca-empty-tab">Las planeaciones aun se estan generando. Podras crear listas de cotejo cuando el bloque este listo.</p>
    `;
  }

  const listas  = Array.isArray(conjunto.listas_cotejo) ? conjunto.listas_cotejo : [];
  const pending = BibliotecaListaPending.get(conjunto.id);

  let pendingHtml = "";
  if (pending) {
    const itemStatus = pending.error ? "error" : "generating";
    const errMsg = pending.error || "";
    if (pending.items && pending.items.length) {
      pendingHtml = pending.items.map(item =>
        renderBibliotecaProgressCard(
          escapeBibliotecaDisplayText(item.titulo, "Lista de cotejo"),
          "",
          itemStatus,
          { errorMessage: errMsg }
        )
      ).join("");
    } else {
      // Fallback si no hay items (compatibilidad con estados guardados sin items)
      pendingHtml = renderBibliotecaProgressCard(
        escapeHtml("Lista de cotejo"),
        "",
        itemStatus,
        { errorMessage: errMsg }
      );
    }
  }

  if (!listas.length && !pending) {
    return `
      ${renderBibliotecaSectionHeader("Listas de cotejo", actionButton)}
      <p class="biblioteca-empty-tab">Aun no hay listas de cotejo en este bloque.</p>
    `;
  }

  return `
    ${renderBibliotecaSectionHeader("Listas de cotejo", actionButton)}
    <div class="biblioteca-items-list">
      ${pendingHtml}
      ${listas.map(lista => {
        const titulo  = escapeBibliotecaDisplayText(lista.tema || lista.titulo, "Lista de cotejo");
        const puntos  = lista.total_puntos ? `${lista.total_puntos} puntos` : "";
        const fecha   = bibFormatShortDateTime(lista.created_at);
        const meta    = [puntos, fecha].filter(Boolean).join(" &middot; ");
        const listaId = escapeHtml(String(lista.id));
        return `
          <div class="biblioteca-item-row">
            <div class="biblioteca-item-info">
              <span class="biblioteca-item-title">${titulo}</span>
              ${meta ? `<span class="biblioteca-item-meta">${meta}</span>` : ""}
            </div>
            <div class="biblioteca-item-actions">
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="ver-lista"
                data-lista-id="${listaId}">Ver</button>
              <button type="button" class="biblioteca-btn-link"
                data-bib-action="descargar-lista"
                data-lista-id="${listaId}">Descargar</button>
              <button type="button" class="biblioteca-btn-link biblioteca-btn-danger-link"
                data-bib-action="eliminar-lista"
                data-lista-id="${listaId}"
                data-conjunto-id="${id}"
                aria-label="Eliminar"
                title="Eliminar"><svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg></button>
            </div>
          </div>
        `;
      }).join("")}
    </div>
  `;
}

// ---- RENDER CONJUNTO ----

function renderBibliotecaTabs(conjunto) {
  const activeTab = BibliotecaTabs.getActiveTab(conjunto.id) || "planeaciones";
  const id = escapeHtml(String(conjunto.id));
  return `
    <div class="biblioteca-tabs" role="tablist">
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "planeaciones" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="planeaciones">
        Planeaciones <span class="biblioteca-tab-count">${conjunto.total_planeaciones || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "anexos" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="anexos">
        Anexos <span class="biblioteca-tab-count">${conjunto.total_anexos || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "listas" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="listas">
        Listas de cotejo <span class="biblioteca-tab-count">${conjunto.total_listas_cotejo || 0}</span>
      </button>
      <button type="button" role="tab"
        class="biblioteca-tab-btn ${activeTab === "examenes" ? "is-active" : ""}"
        data-bib-action="switch-tab" data-conjunto-id="${id}" data-tab="examenes">
        Examenes <span class="biblioteca-tab-count">${conjunto.total_examenes || 0}</span>
      </button>
    </div>
  `;
}

function renderBibliotecaTabContent(conjunto) {
  const activeTab = BibliotecaTabs.getActiveTab(conjunto.id) || "planeaciones";
  return `
    <div class="biblioteca-tab-content">
      ${activeTab === "planeaciones" ? renderPlaneacionesTab(conjunto) : ""}
      ${activeTab === "examenes"     ? renderExamenesTab(conjunto)     : ""}
      ${activeTab === "listas"       ? renderListasCotejoTab(conjunto) : ""}
      ${activeTab === "anexos"       ? renderAnexosTab(conjunto)       : ""}
    </div>
  `;
}

function renderConjuntoSidebarItem(conjunto) {
  const id = escapeHtml(String(conjunto.id));
  const isSelected = normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId()) === normalizeBibliotecaId(conjunto.id);
  const isPending = !!conjunto.isPending;
  const titulo = escapeBibliotecaDisplayText(conjunto.titulo, "Sin titulo");
  const meta = [
    conjunto.nivel ? escapeBibliotecaDisplayText(conjunto.nivel) : "Sin nivel",
    conjunto.materia ? escapeBibliotecaDisplayText(conjunto.materia) : "Sin materia"
  ].filter(Boolean).join(" | ");
  const fecha = bibFormatDateTime(conjunto.created_at);
  const planeaciones = Number(conjunto.total_planeaciones || 0);
  const examenes = Number(conjunto.total_examenes || 0);
  const listas = Number(conjunto.total_listas_cotejo || 0);
  const anexos = Number(conjunto.total_anexos || 0);

  return `
    <button type="button"
      class="biblioteca-sidebar-item ${isSelected ? "is-active" : ""} ${isPending ? "is-generating" : ""}"
      data-bib-action="select-conjunto"
      data-conjunto-id="${id}">
      <span class="biblioteca-sidebar-item-main">
        <span class="biblioteca-sidebar-title">${titulo}</span>
        <span class="biblioteca-sidebar-meta">${meta || "Sin datos"}</span>
        <span class="biblioteca-sidebar-date">${fecha || (isPending ? "Generando" : "")}</span>
        <span class="biblioteca-sidebar-counts">
          ${planeaciones} planeaciones · ${examenes} examenes · ${listas} listas · ${anexos} anexos
        </span>
      </span>
    </button>
  `;
}

function renderBibliotecaSidebar(conjuntos) {
  const total = getAllConjuntosForSidebar().length;
  const emptyMessage = bibliotecaState.searchQuery.trim()
    ? "No se encontraron bloques con esa busqueda."
    : "Aun no tienes bloques de planeación.";

  return `
    <aside class="biblioteca-sidebar" aria-label="Bloques de planeación">
      <div class="biblioteca-sidebar-head">
        <h3>Bloques de planeación</h3>
        <span class="biblioteca-sidebar-badge">${total}</span>
      </div>
      <div class="biblioteca-search-wrap">
        <input
          id="biblioteca-search"
          type="search"
          class="biblioteca-search-input"
          placeholder="Buscar bloque..."
          autocomplete="off"
        />
      </div>
      <div class="biblioteca-sidebar-list">
        ${conjuntos.length
          ? conjuntos.map(renderConjuntoSidebarItem).join("")
          : `<p class="biblioteca-sidebar-empty">${escapeHtml(emptyMessage)}</p>`}
      </div>
    </aside>
  `;
}

function renderBibliotecaDetailEmpty() {
  return `
    <section id="biblioteca-detail-panel" class="biblioteca-detail">
      <div class="biblioteca-detail-empty">
        <h3>Selecciona un bloque</h3>
        <p>Elige un bloque de la izquierda para ver sus planeaciones, examenes y listas.</p>
        <button type="button" class="biblioteca-btn-primary" data-bib-action="crear-planeaciones">
          + Crear bloque de planeación
        </button>
      </div>
    </section>
  `;
}

function renderBibliotecaDetail(conjunto) {
  if (!conjunto) return renderBibliotecaDetailEmpty();

  const titulo = escapeBibliotecaDisplayText(conjunto.titulo, "Sin titulo");
  const id = escapeHtml(String(conjunto.id));
  const metaItems = [
    { label: "Nivel", value: conjunto.nivel ? escapeBibliotecaDisplayText(conjunto.nivel) : "Sin nivel" },
    { label: "Materia", value: conjunto.materia ? escapeBibliotecaDisplayText(conjunto.materia) : "Sin materia" }
  ];
  metaItems.push({ label: "Creado", value: bibFormatDateTime(conjunto.created_at) || (conjunto.isPending ? "Generando" : "Sin fecha") });

  const deleteBtn = conjunto.isPending ? "" : `
    <button type="button" class="biblioteca-btn-danger"
      data-bib-action="eliminar-bloque"
      data-conjunto-id="${id}"
      aria-label="Eliminar bloque"
      title="Eliminar bloque">
      <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
    </button>`;

  return `
    <section id="biblioteca-detail-panel" class="biblioteca-detail">
      <div class="biblioteca-detail-head">
        <div class="biblioteca-detail-summary">
          <p class="biblioteca-detail-eyebrow">BLOQUE SELECCIONADO</p>
          <h3 class="biblioteca-detail-title">${titulo}</h3>
          <div class="biblioteca-detail-meta-row">
            ${metaItems.map((item, i) => `<span class="biblioteca-detail-meta-chip"><span class="biblioteca-detail-meta-chip-label">${escapeHtml(item.label)}:</span>&nbsp;${item.value}</span>${i < metaItems.length - 1 ? '<span class="biblioteca-detail-meta-sep" aria-hidden="true">·</span>' : ""}`).join("")}
          </div>
        </div>
        ${deleteBtn ? `<div class="biblioteca-detail-actions">${deleteBtn}</div>` : ""}
      </div>
      ${renderBibliotecaTabs(conjunto)}
      ${renderBibliotecaTabContent(conjunto)}
    </section>
  `;
}

// ---- PARTIAL RENDERS (preserve sidebar scroll) ----

// Actualiza solo las clases is-active en el sidebar sin re-renderizar la lista.
function updateBibliotecaSidebarActive() {
  const list = document.querySelector(".biblioteca-sidebar-list");
  if (!list) return;
  const currentId = normalizeBibliotecaId(BibliotecaSelection.getSelectedConjuntoId());
  list.querySelectorAll("[data-bib-action='select-conjunto']").forEach((btn) => {
    const btnId = normalizeBibliotecaId(btn.dataset.conjuntoId);
    btn.classList.toggle("is-active", btnId === currentId);
  });
}

// Reemplaza solo el panel derecho (#biblioteca-detail-panel) sin tocar el sidebar.
// Si el panel aún no existe en el DOM, cae a un render completo.
function renderBibliotecaDetailInPlace() {
  const panel = document.getElementById("biblioteca-detail-panel");
  if (!panel) { renderBibliotecaContent(); return; }
  const selected = getSelectedConjunto();
  panel.outerHTML = renderBibliotecaDetail(selected);
}

// Actualiza solo la lista de items del sidebar sin tocar el input del buscador.
// Esto preserva el focus y el valor escrito mientras el usuario busca.
function renderBibliotecaSidebarListInPlace() {
  const list = document.querySelector(".biblioteca-sidebar-list");
  if (!list) { renderBibliotecaContent(); return; }
  const filtered = getFilteredConjuntosForSidebar();
  const emptyMessage = bibliotecaState.searchQuery.trim()
    ? "No se encontraron bloques con esa busqueda."
    : "Aun no tienes bloques de planeación.";
  list.innerHTML = filtered.length
    ? filtered.map(renderConjuntoSidebarItem).join("")
    : `<p class="biblioteca-sidebar-empty">${escapeHtml(emptyMessage)}</p>`;
  const badge = document.querySelector(".biblioteca-sidebar-badge");
  if (badge) badge.textContent = String(getAllConjuntosForSidebar().length);
}

// ---- MAIN RENDER ----

function renderBibliotecaContent() {
  const container = document.getElementById("explorer-content");
  if (!container) return;

  const workspace  = document.getElementById("explorer-workspace");
  const onboarding = document.getElementById("explorer-onboarding");
  if (workspace)  workspace.classList.remove("hidden");
  if (onboarding) onboarding.classList.add("hidden");

  if (bibliotecaState.loading) {
    container.innerHTML = `<div class="biblioteca-loading"><p>Cargando biblioteca...</p></div>`;
    return;
  }

  if (bibliotecaState.error) {
    container.innerHTML = `
      <div class="biblioteca-error">
        <p>No pudimos cargar tu biblioteca. Intenta nuevamente.</p>
        <button type="button" class="biblioteca-btn-primary" style="margin-top:0.75rem"
          data-bib-action="retry">Reintentar</button>
      </div>
    `;
    return;
  }

  const filtered = getFilteredConjuntosForSidebar();
  const selected = getSelectedConjunto();

  const prevSidebarScroll = document.querySelector(".biblioteca-sidebar-list")?.scrollTop ?? 0;

  container.innerHTML = `
    <div class="biblioteca-shell">
      <div class="biblioteca-layout">
        ${renderBibliotecaSidebar(filtered)}
        ${renderBibliotecaDetail(selected)}
      </div>
    </div>
  `;

  const searchInput = document.getElementById("biblioteca-search");
  if (searchInput) {
    searchInput.value = bibliotecaState.searchQuery;
    BibliotecaEvents.bindSearch(searchInput);
  }

  if (prevSidebarScroll > 0) {
    requestAnimationFrame(() => {
      const list = document.querySelector(".biblioteca-sidebar-list");
      if (list) list.scrollTop = prevSidebarScroll;
    });
  }
}

window.renderBibliotecaContent = renderBibliotecaContent;

// Superficie léxica de ownership; los nombres globales existentes permanecen compatibles.
const BibliotecaRender = Object.freeze({
  renderContent: renderBibliotecaContent,
  renderDetailInPlace: renderBibliotecaDetailInPlace,
  renderSidebarListInPlace: renderBibliotecaSidebarListInPlace,
  updateSidebarActive: updateBibliotecaSidebarActive
});
