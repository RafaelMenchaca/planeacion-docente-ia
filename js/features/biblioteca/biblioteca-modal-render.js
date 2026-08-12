// Owner del DOM y render de overlays vigentes de Biblioteca.
// Script clásico: consume estado, callbacks y helpers definidos antes.

// ---- MODAL CONSTANTS ----

// Tipos de pregunta para el modal de examen
const BIB_EXAM_TIPOS = [
  { value: "opcion_multiple",           label: "Opcion multiple", defaultCount: 5 },
  { value: "verdadero_falso",           label: "Verdadero/Falso", defaultCount: 5 },
  { value: "respuesta_corta",           label: "Respuesta corta / completar", defaultCount: 3 },
  { value: "emparejamiento",            label: "Emparejamiento / relacion de columnas", defaultCount: 1 },
  { value: "pregunta_abierta",          label: "Pregunta abierta / ensayo", defaultCount: 1 },
  { value: "calculo_numerico",          label: "Calculo / numerica", defaultCount: 3 },
  { value: "ordenacion_jerarquizacion", label: "Ordenacion / jerarquizacion", defaultCount: 1 }
];

// ---- ANEXOS CREATE MODAL RENDER ----

function renderBibliotecaAnexoCreateModal() {
  const modal = document.getElementById("biblioteca-anexo-create-modal");
  if (!modal) return;

  const state    = BibliotecaAnexoModalState.getState();
  const conjunto = findConjuntoById(state.conjuntoId);
  const anexosExistentes = Array.isArray(conjunto?.anexos) ? conjunto.anexos : [];
  const generatingMap    = BibliotecaAnexosPending.getBatch(state.conjuntoId) || {};
  const anexosPlaneacionIds = new Set([
    ...anexosExistentes.map((a) => normalizeBibliotecaId(a.planeacion_id)),
    ...Object.keys(generatingMap)
  ].filter(Boolean));

  const totalPlaneaciones = state.planeaciones.length;
  const disponibles = state.planeaciones.filter(
    (p) => !anexosPlaneacionIds.has(normalizeBibliotecaId(p.id))
  );
  const availableIds = new Set(disponibles.map((p) => normalizeBibliotecaId(p.id)));
  const selectedValidIds = state.selectedPlaneacionIds.filter((id) =>
    availableIds.has(normalizeBibliotecaId(id))
  );
  if (selectedValidIds.length !== state.selectedPlaneacionIds.length) {
    BibliotecaAnexoModalState.setSelectedPlaneacionIds(selectedValidIds);
  }
  const canSubmit = selectedValidIds.length > 0 && disponibles.length > 0 && !state.submitting;

  const planeacionesHtml = state.planeaciones.length
    ? `<div class="bib-lista-topic-list">
        ${state.planeaciones.map((p) => {
          const pid          = normalizeBibliotecaId(p.id);
          const tieneAnexo   = anexosExistentes.some((a) => normalizeBibliotecaId(a.planeacion_id) === pid);
          const estaGenerando = !tieneAnexo && !!generatingMap[pid];
          const bloqueada    = tieneAnexo || estaGenerando;
          const checked      = selectedValidIds.includes(pid);
          const titulo_p     = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          const badge        = tieneAnexo
            ? `<span class="bib-lista-generated-badge">Anexo generado</span>`
            : estaGenerando
              ? `<span class="bib-lista-generated-badge" style="opacity:0.65;">Generando...</span>`
              : "";
          return `
            <label class="bib-lista-topic ${bloqueada ? "is-disabled" : ""}">
              <input type="checkbox" class="bib-lista-checkbox"
                data-bib-anexo-planid="${escapeHtml(pid)}"
                ${checked   ? "checked"  : ""}
                ${bloqueada ? "disabled" : ""} />
              <span class="bib-lista-topic-title">${titulo_p}</span>
              ${badge}
            </label>`;
        }).join("")}
      </div>`
    : `<p class="bib-lista-empty">Este bloque no tiene planeaciones disponibles.</p>`;

  const allGeneratedMessage = totalPlaneaciones > 0 && disponibles.length === 0
    ? `<p class="bib-lista-note-alert">Todas las planeaciones de este bloque ya tienen anexo generado.</p>`
    : "";

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const card = modal.querySelector(".biblioteca-modal-card");
  card.classList.add("biblioteca-lista-create-card");
  card.innerHTML = `
    <div class="bib-lista-head">
      <div class="bib-lista-title-block">
        <p class="bib-lista-eyebrow">MATERIAL PARA ESTUDIANTES</p>
        <h3>Crear anexos</h3>
        <p>Selecciona las planeaciones para las que deseas generar anexos.<br>Las que ya tienen anexo generado no se pueden volver a seleccionar.</p>
      </div>
      <button type="button" id="bib-anexo-create-close" class="bib-lista-close">X</button>
    </div>

    <div class="bib-lista-content">
      <section class="bib-lista-section">
        <div class="bib-lista-section-head">
          <h4>PLANEACIONES DEL BLOQUE</h4>
          <span id="bib-anexo-create-count">${disponibles.length} disponible(s) de ${totalPlaneaciones}</span>
        </div>
        ${planeacionesHtml}
      </section>

      ${allGeneratedMessage}

      ${errorHtml}

      <div class="bib-lista-actions">
        <button type="button" id="bib-anexo-create-cancel" class="bib-lista-cancel"
          ${state.submitting ? "disabled" : ""}>Cancelar</button>
        <button type="button" id="bib-anexo-create-submit" class="bib-lista-submit"
          ${canSubmit ? "" : "disabled"}>
          ${state.submitting ? "Generando..." : "Generar anexos seleccionados"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-anexo-create-close")?.addEventListener("click",  closeBibliotecaAnexoCreateModal);
  document.getElementById("bib-anexo-create-cancel")?.addEventListener("click", closeBibliotecaAnexoCreateModal);
  document.getElementById("bib-anexo-create-submit")?.addEventListener("click", submitBibliotecaAnexoCreateModal);

  modal.querySelectorAll("[data-bib-anexo-planid]").forEach((cb) => {
    cb.addEventListener("change", (e) => {
      if (e.target.disabled) return;
      const pid = e.target.dataset.bibAnexoPlanid;
      if (!availableIds.has(normalizeBibliotecaId(pid))) {
        e.target.checked = false;
        return;
      }
      const modalState = BibliotecaAnexoModalState.getState();
      if (e.target.checked) {
        if (!modalState.selectedPlaneacionIds.includes(pid)) {
          BibliotecaAnexoModalState.addSelectedPlaneacionId(pid);
        }
      } else {
        BibliotecaAnexoModalState.setSelectedPlaneacionIds(
          modalState.selectedPlaneacionIds.filter((id) => id !== pid)
        );
      }
      renderBibliotecaAnexoCreateModal();
    });
  });
}

// ---- EXAM GENERATION MODAL RENDER ----

function renderBibliotecaExamModal() {
  const modal = document.getElementById("biblioteca-exam-modal");
  if (!modal) return;

  const state = BibliotecaExamModalState.getState();

  const tiposHtml = BIB_EXAM_TIPOS.map(tipo => {
    const isSelected = state.selectedTypes.includes(tipo.value);
    const count      = state.questionCounts[tipo.value] || tipo.defaultCount;
    return `
      <label class="bib-exam-choice ${isSelected ? "is-selected" : ""}">
        <input type="checkbox" class="bib-exam-checkbox"
          data-bib-exam-type="${escapeHtml(tipo.value)}" ${isSelected ? "checked" : ""} />
        <span>${escapeHtml(tipo.label)}</span>
        ${isSelected ? `
          <input type="number" min="1" max="30" value="${count}"
            data-bib-exam-count="${escapeHtml(tipo.value)}"
            class="bib-exam-count"
            aria-label="Numero de preguntas para ${escapeHtml(tipo.label)}" />
        ` : ""}
      </label>
    `;
  }).join("");

  // Planeaciones with checkboxes
  const planeacionesHtml = state.planeaciones.length
    ? `<div class="bib-exam-topic-list">
        ${state.planeaciones.map(p => {
          const pid      = String(p.id);
          const checked  = state.selectedPlaneacionIds.includes(pid);
          const titulo_p = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          return `
            <label class="bib-exam-topic">
              <input type="checkbox" class="bib-exam-checkbox"
                data-bib-exam-planid="${escapeHtml(pid)}" ${checked ? "checked" : ""} />
              <span>${titulo_p}</span>
            </label>`;
        }).join("")}
      </div>`
    : `<p class="bib-exam-empty">No hay planeaciones en este bloque.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const card = modal.querySelector(".biblioteca-modal-card");
  card.classList.add("biblioteca-exam-create-card");
  card.innerHTML = `
    <div class="bib-exam-head">
      <div class="bib-exam-title-block">
        <h3>Crear examen de unidad</h3>
        <p>Configura los tipos de pregunta y selecciona los temas para generar el examen.</p>
      </div>
      <button type="button" id="bib-exam-close" class="bib-exam-close">X</button>
    </div>

    <div class="bib-exam-content">
      <section class="bib-exam-section">
        <div class="bib-exam-section-head">
          <h4>TIPOS DE PREGUNTA</h4>
          <span>Seleccion multiple</span>
        </div>
        <div class="bib-exam-types">${tiposHtml}</div>
      </section>

      <section class="bib-exam-section">
        <div class="bib-exam-section-head">
          <h4>TEMAS USADOS COMO CONTEXTO</h4>
          <span id="bib-exam-topics-count">${state.selectedPlaneacionIds.length} de ${state.planeaciones.length} tema(s)</span>
        </div>
        ${planeacionesHtml}
      </section>

      ${errorHtml}

      <div class="bib-exam-actions">
        <button type="button" id="bib-exam-cancel" class="bib-exam-cancel">Cancelar</button>
        <button type="button" id="bib-exam-submit" class="bib-exam-submit" ${state.submitting ? "disabled" : ""}>
          ${state.submitting ? "Iniciando..." : "Crear examen de unidad con los temas"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-exam-close")?.addEventListener("click", closeBibliotecaExamModal);
  document.getElementById("bib-exam-cancel")?.addEventListener("click", closeBibliotecaExamModal);
  document.getElementById("bib-exam-submit")?.addEventListener("click", submitBibliotecaExamModal);

  modal.querySelectorAll("[data-bib-exam-type]").forEach(cb => {
    cb.addEventListener("change", e => {
      const tipo = e.target.dataset.bibExamType;
      const modalState = BibliotecaExamModalState.getState();
      if (e.target.checked) {
        if (!modalState.selectedTypes.includes(tipo)) {
          BibliotecaExamModalState.addSelectedType(tipo);
          const found = BIB_EXAM_TIPOS.find(t => t.value === tipo);
          if (!modalState.questionCounts[tipo]) {
            BibliotecaExamModalState.setQuestionCount(tipo, found?.defaultCount || 5);
          }
        }
      } else {
        BibliotecaExamModalState.setSelectedTypes(
          modalState.selectedTypes.filter(t => t !== tipo)
        );
      }
      renderBibliotecaExamModal();
    });
  });

  modal.querySelectorAll("[data-bib-exam-count]").forEach(input => {
    input.addEventListener("change", e => {
      const tipo = e.target.dataset.bibExamCount;
      const val  = parseInt(e.target.value, 10);
      if (tipo && !isNaN(val) && val > 0) {
        BibliotecaExamModalState.setQuestionCount(tipo, val);
      }
    });
  });

  modal.querySelectorAll("[data-bib-exam-planid]").forEach(cb => {
    cb.addEventListener("change", e => {
      const pid = e.target.dataset.bibExamPlanid;
      const modalState = BibliotecaExamModalState.getState();
      if (e.target.checked) {
        if (!modalState.selectedPlaneacionIds.includes(pid)) {
          BibliotecaExamModalState.addSelectedPlaneacionId(pid);
        }
      } else {
        BibliotecaExamModalState.setSelectedPlaneacionIds(
          modalState.selectedPlaneacionIds.filter(id => id !== pid)
        );
      }
      const counter = document.getElementById("bib-exam-topics-count");
      if (counter) {
        counter.textContent = `${modalState.selectedPlaneacionIds.length} de ${modalState.planeaciones.length} tema(s)`;
      }
    });
  });
}

// ---- LISTA GENERATION MODAL RENDER ----

function renderBibliotecaListaModal() {
  const modal = document.getElementById("biblioteca-lista-modal");
  if (!modal) return;

  const state    = BibliotecaListaModalState.getState();
  const conjunto = findConjuntoById(state.conjuntoId);
  const listas = Array.isArray(conjunto?.listas_cotejo) ? conjunto.listas_cotejo : [];
  const listaPlaneacionIds = new Set(listas.map((lista) => normalizeBibliotecaId(lista?.planeacion_id)).filter(Boolean));
  const totalPlaneaciones = state.planeaciones.length;
  const disponibles = state.planeaciones.filter((p) => !listaPlaneacionIds.has(normalizeBibliotecaId(p.id)));
  const availableIds = new Set(disponibles.map((p) => normalizeBibliotecaId(p.id)));
  const selectedValidIds = state.selectedPlaneacionIds.filter((id) => availableIds.has(normalizeBibliotecaId(id)));
  if (selectedValidIds.length !== state.selectedPlaneacionIds.length) {
    BibliotecaListaModalState.setSelectedPlaneacionIds(selectedValidIds);
  }
  const canSubmit = selectedValidIds.length > 0 && disponibles.length > 0 && !state.submitting;

  const planeacionesHtml = state.planeaciones.length
    ? `<div class="bib-lista-topic-list">
        ${state.planeaciones.map(p => {
          const pid      = String(p.id);
          const safePid  = normalizeBibliotecaId(pid);
          const hasLista = listaPlaneacionIds.has(safePid);
          const checked  = selectedValidIds.includes(pid);
          const titulo_p = escapeBibliotecaDisplayText(p.tema || p.custom_title, "Sin titulo");
          return `
            <label class="bib-lista-topic ${hasLista ? "is-disabled" : ""}">
              <input type="checkbox" class="bib-lista-checkbox"
                data-bib-lista-planid="${escapeHtml(pid)}" ${checked ? "checked" : ""} ${hasLista ? "disabled" : ""} />
              <span class="bib-lista-topic-title">${titulo_p}</span>
              ${hasLista ? `<span class="bib-lista-generated-badge">Lista ya generada</span>` : ""}
            </label>`;
        }).join("")}
      </div>`
    : `<p class="bib-lista-empty">Este bloque no tiene planeaciones disponibles para generar listas de cotejo.</p>`;

  const errorHtml = state.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(state.error)}</p>`
    : "";

  const allGeneratedMessage = totalPlaneaciones > 0 && disponibles.length === 0
    ? `<p class="bib-lista-note-alert">Todas las planeaciones de este bloque ya tienen lista de cotejo.</p>`
    : "";

  const card = modal.querySelector(".biblioteca-modal-card");
  card.classList.add("biblioteca-lista-create-card");
  card.innerHTML = `
    <div class="bib-lista-head">
      <div class="bib-lista-title-block">
        <p class="bib-lista-eyebrow">EVALUACION POR TEMA</p>
        <h3>Crear listas de cotejo</h3>
        <p>Selecciona las actividades para las que deseas generar lista de cotejo.<br>Las que ya tienen lista generada no se pueden volver a seleccionar.</p>
      </div>
      <button type="button" id="bib-lista-close" class="bib-lista-close">X</button>
    </div>

    <div class="bib-lista-content">
      <section class="bib-lista-section">
        <div class="bib-lista-section-head">
          <h4>TEMAS DEL BLOQUE</h4>
          <span id="bib-lista-available-count">${disponibles.length} disponible(s) de ${totalPlaneaciones}</span>
        </div>
        ${planeacionesHtml}
      </section>

      ${allGeneratedMessage}

      <p class="bib-lista-note">Cada lista se genera a partir de la actividad de cierre de la planeacion. Si una planeacion no tiene actividad de cierre, se omitira.</p>

      ${errorHtml}

      <div class="bib-lista-actions">
        <button type="button" id="bib-lista-cancel" class="bib-lista-cancel">Cancelar</button>
        <button type="button" id="bib-lista-submit" class="bib-lista-submit" ${canSubmit ? "" : "disabled"}>
          ${state.submitting ? "Iniciando..." : "Generar listas seleccionadas"}
        </button>
      </div>
    </div>
  `;

  document.getElementById("bib-lista-close")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-cancel")?.addEventListener("click", closeBibliotecaListaModal);
  document.getElementById("bib-lista-submit")?.addEventListener("click", submitBibliotecaListaModal);

  modal.querySelectorAll("[data-bib-lista-planid]").forEach(cb => {
    cb.addEventListener("change", e => {
      if (e.target.disabled) return;
      const pid = e.target.dataset.bibListaPlanid;
      if (!availableIds.has(normalizeBibliotecaId(pid))) {
        e.target.checked = false;
        return;
      }
      const modalState = BibliotecaListaModalState.getState();
      if (e.target.checked) {
        if (!modalState.selectedPlaneacionIds.includes(pid)) {
          BibliotecaListaModalState.addSelectedPlaneacionId(pid);
        }
      } else {
        BibliotecaListaModalState.setSelectedPlaneacionIds(
          modalState.selectedPlaneacionIds.filter(id => id !== pid)
        );
      }
      renderBibliotecaListaModal();
    });
  });
}

// ---- PLANEACION GENERATION MODAL RENDER ----

function renderBibliotecaAgregarModal() {
  const modal = document.getElementById("biblioteca-agregar-modal");
  if (!modal) return;

  const s = BibliotecaPlaneacionModalState.getState();

  const contextHtml = `
    <div class="rounded-xl border border-cyan-100 bg-cyan-50/60 px-3 py-2.5 text-sm text-slate-700">
      ${s.materia ? `<span class="font-semibold">${escapeBibliotecaDisplayText(s.materia)}</span>` : ""}
      ${s.nivel ? ` &middot; ${escapeBibliotecaDisplayText(s.nivel)}` : ""}
    </div>`;

  // Per-tema rows with their own activity selects
  const temasListHtml = s.temas.length
    ? s.temas.map(t => {
        const actSelects = (typeof MOMENTOS_ACTIVIDADES_DIDACTICAS !== "undefined")
          ? MOMENTOS_ACTIVIDADES_DIDACTICAS.map(m => {
              const curVal = t.actividades_momentos?.[m.key] || "";
              const opts   = typeof buildActividadDidacticaOptions === "function"
                ? buildActividadDidacticaOptions(curVal)
                : "";
              return `
                <label class="actividad-momento-row min-w-0 text-xs font-medium text-slate-600">
                  <span class="actividad-momento-label">${escapeHtml(m.label)}</span>
                  <select
                    data-bib-agr-actividad
                    data-local-id="${escapeHtml(t.localId)}"
                    data-momento="${escapeHtml(m.key)}"
                    class="actividad-cierre-select actividad-didactica-select min-w-0 rounded-lg px-3 py-2 text-sm focus:outline-none">
                    ${opts}
                  </select>
                </label>`;
            }).join("")
          : "";

        return `
          <div class="rounded-lg border border-slate-200 bg-white px-3 py-2.5">
            <div class="flex items-center gap-2">
              <span class="flex-1 text-sm font-medium text-slate-800">${escapeHtml(t.titulo)}</span>
              <span class="text-xs text-slate-400 flex-shrink-0">${t.duracion} min</span>
              <button type="button" class="flex-shrink-0 text-slate-400 hover:text-rose-600 ml-1"
                data-bib-agr-remove="${escapeHtml(t.localId)}"
                title="Quitar tema">&#10005;</button>
            </div>
            ${actSelects ? `
              <div class="actividades-momentos mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-slate-500">Actividades didacticas opcionales</p>
                <div class="mt-2 grid gap-2">${actSelects}</div>
              </div>` : ""}
          </div>`;
      }).join("")
    : `<p class="text-xs text-slate-400 py-1">Sin temas. Agrega al menos uno usando el formulario de abajo.</p>`;

  const addFormHtml = `
    <div class="biblioteca-tema-create-box">
      <div class="biblioteca-tema-create-row">
        <div>
          <label for="bib-agr-titulo" class="mb-1 block text-sm font-medium text-slate-700">Tema</label>
          <input type="text" id="bib-agr-titulo" placeholder="Ej. Fracciones equivalentes" />
        </div>
        <div>
          <label for="bib-agr-duracion" class="mb-1 block text-sm font-medium text-slate-700">Duracion</label>
          <input type="number" id="bib-agr-duracion" value="50" min="10" max="300" title="Duracion en minutos" />
        </div>
        <button type="button" id="bib-agr-add" class="biblioteca-tema-add-btn">
          Agregar tema
        </button>
      </div>
    </div>`;

  const errorHtml = s.error
    ? `<p class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">${escapeHtml(s.error)}</p>`
    : "";

  modal.querySelector(".biblioteca-modal-card").innerHTML = `
    <div class="flex items-start justify-between gap-3 mb-4">
      <div>
        <p class="text-xs font-semibold uppercase tracking-widest text-cyan-700">Agregar planeaciones</p>
        <h3 class="mt-1 text-base font-semibold text-slate-900">${escapeBibliotecaDisplayText(findConjuntoById(s.conjuntoId)?.titulo, "Bloque")}</h3>
      </div>
      <button type="button" id="bib-agr-close"
        class="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg border border-rose-200 text-rose-600 hover:bg-rose-50">
        &#10005;
      </button>
    </div>

    ${contextHtml}

    <div class="mt-4 space-y-2">
      <p class="text-sm font-semibold text-slate-700">Temas a generar</p>
      <div class="biblioteca-agregar-temas-scroll space-y-2">${temasListHtml}</div>
      ${addFormHtml}
    </div>

    ${errorHtml}

    <div class="mt-4 flex flex-wrap justify-end gap-2">
      <button type="button" id="bib-agr-cancel"
        class="inline-flex items-center justify-center rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
        Cancelar
      </button>
      <button type="button" id="bib-agr-submit"
        class="inline-flex items-center justify-center rounded-xl bg-cyan-700 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-800 disabled:opacity-60"
        ${s.temas.length === 0 ? "disabled" : ""}>
        Generar planeaciones
      </button>
    </div>
  `;
  modal.querySelector(".biblioteca-modal-card")?.classList.add("biblioteca-agregar-card");

  document.getElementById("bib-agr-close")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-cancel")?.addEventListener("click", closeBibliotecaAgregarModal);
  document.getElementById("bib-agr-add")?.addEventListener("click", addBibliotecaAgregarTema);
  document.getElementById("bib-agr-titulo")?.addEventListener("keydown", e => {
    if (e.key === "Enter") { e.preventDefault(); addBibliotecaAgregarTema(); }
  });
  document.getElementById("bib-agr-submit")?.addEventListener("click", submitBibliotecaAgregarModal);

  modal.querySelectorAll("[data-bib-agr-remove]").forEach(btn => {
    btn.addEventListener("click", () => {
      const localId = btn.dataset.bibAgrRemove;
      const modalState = BibliotecaPlaneacionModalState.getState();
      BibliotecaPlaneacionModalState.setTemas(
        modalState.temas.filter(t => t.localId !== localId)
      );
      renderBibliotecaAgregarModal();
    });
  });

  // Per-tema activity selects — update state without re-rendering
  modal.querySelectorAll("[data-bib-agr-actividad]").forEach(sel => {
    sel.addEventListener("change", e => {
      const localId = e.target.dataset.localId;
      const momento = e.target.dataset.momento;
      const val     = (e.target.value || "").trim();
      const tema    = BibliotecaPlaneacionModalState.getTemaByLocalId(localId);
      if (!tema) return;
      if (!tema.actividades_momentos) tema.actividades_momentos = {};
      if (val && (typeof isActividadDidacticaValida !== "function" || isActividadDidacticaValida(val))) {
        tema.actividades_momentos[momento] = val;
      } else {
        delete tema.actividades_momentos[momento];
      }
      // No re-render needed — state is updated and will persist until next explicit render
    });
  });
}

// ---- INJECT MODALS ----

function injectBibliotecaModals() {
  if (!document.getElementById("biblioteca-exam-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-exam-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-exam-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-exam-backdrop")
      ?.addEventListener("click", closeBibliotecaExamModal);
  }

  if (!document.getElementById("biblioteca-lista-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-lista-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-lista-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-lista-backdrop")
      ?.addEventListener("click", closeBibliotecaListaModal);
  }

  if (!document.getElementById("biblioteca-agregar-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-agregar-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-agr-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-agr-backdrop")
      ?.addEventListener("click", closeBibliotecaAgregarModal);
  }

  if (!document.getElementById("biblioteca-anexo-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-anexo-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-anexo-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card" style="max-width:680px; width:100%;"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-anexo-backdrop")
      ?.addEventListener("click", closeBibliotecaAnexoModal);
  }

  if (!document.getElementById("biblioteca-anexo-create-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-anexo-create-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-anexo-create-backdrop"></div>
      <div class="biblioteca-modal-shell">
        <div class="biblioteca-modal-card"></div>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById("bib-anexo-create-backdrop")
      ?.addEventListener("click", closeBibliotecaAnexoCreateModal);
  }

  if (!document.getElementById("biblioteca-confirm-modal")) {
    const div = document.createElement("div");
    div.id = "biblioteca-confirm-modal";
    div.className = "hidden";
    div.innerHTML = `
      <div class="biblioteca-modal-backdrop" id="bib-confirm-backdrop"></div>
      <div class="biblioteca-modal-shell" style="align-items:center; padding-top:0;">
        <div class="biblioteca-modal-card bib-confirm-card"></div>
      </div>
    `;
    document.body.appendChild(div);
  }
}

function showBibConfirm(title, message) {
  return new Promise((resolve) => {
    const modal = document.getElementById("biblioteca-confirm-modal");
    if (!modal) { resolve(false); return; }

    const card = modal.querySelector(".biblioteca-modal-card");
    card.innerHTML = `
      <div class="bib-confirm-body">
        <div class="bib-confirm-icon" aria-hidden="true">
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
        </div>
        <h3 class="bib-confirm-title">${escapeHtml(title)}</h3>
        <p class="bib-confirm-msg">${escapeHtml(message)}</p>
        <div class="bib-confirm-actions">
          <button type="button" id="bib-confirm-cancel" class="bib-exam-cancel">Cancelar</button>
          <button type="button" id="bib-confirm-ok" class="bib-confirm-ok">
            <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>
            Eliminar
          </button>
        </div>
      </div>
    `;

    modal.classList.remove("hidden");
    document.body.classList.add("overflow-hidden");

    function close(result) {
      modal.classList.add("hidden");
      document.body.classList.remove("overflow-hidden");
      resolve(result);
    }

    document.getElementById("bib-confirm-cancel")?.addEventListener("click", () => close(false), { once: true });
    document.getElementById("bib-confirm-ok")?.addEventListener("click",     () => close(true),  { once: true });
    document.getElementById("bib-confirm-backdrop")?.addEventListener("click", () => close(false), { once: true });
  });
}

// Superficie léxica de ownership; los nombres globales existentes permanecen compatibles.
const BibliotecaModalRender = Object.freeze({
  renderPlaneaciones: renderBibliotecaAgregarModal,
  renderAnexos: renderBibliotecaAnexoCreateModal,
  renderListas: renderBibliotecaListaModal,
  renderExamenes: renderBibliotecaExamModal,
  showConfirm: showBibConfirm,
  inject: injectBibliotecaModals
});

