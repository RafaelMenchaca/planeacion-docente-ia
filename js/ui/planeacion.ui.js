function bloquearFormulario() {
  document.querySelectorAll("#planeacionTable input, #planeacionTable select").forEach((el) => {
    el.setAttribute("readonly", true);
    el.setAttribute("disabled", true);
  });

  const btn = document.getElementById("btn-generar");
  if (btn) {
    btn.classList.add("opacity-70", "cursor-not-allowed");
    btn.setAttribute("disabled", true);
    btn.textContent = "Guardado";
  }
}

const progresoEstado = {
  total: 0,
  completadas: 0
};

function renderItemProgreso(item) {
  const base = "rounded-lg border px-3 py-2 text-sm";
  const variants = {
    pending: "border-slate-200 bg-white text-slate-600",
    generating: "border-cyan-200 bg-cyan-50 text-cyan-800",
    completed: "border-emerald-200 bg-emerald-50 text-emerald-800",
    error: "border-rose-200 bg-rose-50 text-rose-700"
  };

  const statusLabel = {
    pending: "pendiente",
    generating: "generando...",
    completed: "completado",
    error: "error"
  };

  return `
    <div id="progress-item-${item.index}" class="${base} ${variants[item.status] || variants.pending}">
      <span class="font-semibold">Planeacion ${item.index}</span>
      <span class="mx-1 text-slate-500">(${escapeHtml(item.tema || "sin tema")})</span>
      <span class="font-medium">${statusLabel[item.status] || statusLabel.pending}</span>
      ${item.message ? `<span class="ml-2 text-xs">${escapeHtml(item.message)}</span>` : ""}
    </div>
  `;
}

function actualizarResumenProgreso() {
  const counter = document.getElementById("ia-progress-counter");
  if (!counter) return;
  counter.textContent = `${progresoEstado.completadas}/${progresoEstado.total} completadas`;
}

function iniciarProgresoPlaneaciones(temas) {
  const loader = document.getElementById("ia-loader");
  const list = document.getElementById("ia-progress-list");
  const counter = document.getElementById("ia-progress-counter");
  if (!loader || !list || !counter) return;

  const items = temas.map((tema, idx) => ({
    index: idx + 1,
    tema: tema.tema || `Tema ${idx + 1}`,
    status: "pending",
    message: ""
  }));

  progresoEstado.total = items.length;
  progresoEstado.completadas = 0;

  list.innerHTML = items.map(renderItemProgreso).join("");
  actualizarResumenProgreso();
  loader.style.display = "block";
}

function actualizarItemProgreso(index, status, message = "") {
  const row = document.getElementById(`progress-item-${index}`);
  if (!row) return;

  const temaMatch = row.textContent.match(/\((.*?)\)/);
  const tema = temaMatch ? temaMatch[1] : `Tema ${index}`;

  row.outerHTML = renderItemProgreso({
    index,
    tema,
    status,
    message
  });
}

function actualizarProgresoDesdeEvento(evt) {
  if (!evt || !evt.type) return;

  const getIndex = () => {
    if (Number.isInteger(evt.index)) return evt.index;
    if (evt.data && Number.isInteger(evt.data.index)) return evt.data.index;
    return null;
  };

  if (evt.type === "item_started") {
    const index = getIndex();
    if (index) actualizarItemProgreso(index, "generating");
    return;
  }

  if (evt.type === "item_completed") {
    const index = getIndex();
    if (index) {
      actualizarItemProgreso(index, "completed");
      progresoEstado.completadas += 1;
      actualizarResumenProgreso();
    }
    return;
  }

  if (evt.type === "item_error") {
    const index = getIndex();
    if (index) {
      actualizarItemProgreso(index, "error", evt.error || "fallo");
    }
  }
}

function completarProgresoPlaneaciones(data) {
  if (!data || !Array.isArray(data.planeaciones)) return;

  data.planeaciones.forEach((p, i) => {
    const index = i + 1;
    const el = document.getElementById(`progress-item-${index}`);
    if (el && el.textContent.includes("pendiente")) {
      actualizarItemProgreso(index, "completed");
    }
  });

  progresoEstado.completadas = data.planeaciones.length;
  progresoEstado.total = data.planeaciones.length;
  actualizarResumenProgreso();
}

function ocultarProgresoPlaneaciones() {
  const loader = document.getElementById("ia-loader");
  if (loader) loader.style.display = "none";
}

function mostrarResultadoBatch(data) {
  const resultado = document.getElementById("resultado");
  if (!resultado) return;

  const { batch_id, total, planeaciones } = data;

  const materia = planeaciones[0]?.materia || "";
  const nivel = planeaciones[0]?.nivel || "";
  const unidad = planeaciones[0]?.unidad || "";

  const temasHtml = planeaciones
    .map((p) => `<li class="text-sm text-slate-700">${escapeHtml(p.tema || "")}</li>`)
    .join("");

  resultado.innerHTML = `
    <div class="result-card">
      <h5 class="text-base font-semibold text-emerald-800 mb-3">Se generaron ${total} planeaciones correctamente</h5>

      <div class="result-subcard mb-3 text-center">
        <strong class="text-slate-900">${escapeHtml(materia)}</strong> | ${escapeHtml(nivel)} | Unidad ${escapeHtml(String(unidad))}
        <div class="mt-3">
          <a href="batch.html?batch_id=${batch_id}" class="inline-flex items-center rounded-lg border border-emerald-300 px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50">
            Ver lote
          </a>
        </div>
      </div>

      <p class="text-sm font-semibold text-slate-800 mb-1">Temas incluidos:</p>
      <ul class="list-disc pl-5 space-y-1 mb-4">${temasHtml}</ul>

      <div class="result-actions">
        <a href="dashboard.html" class="inline-flex items-center rounded-lg border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
          Volver al Dashboard
        </a>
        <button class="inline-flex items-center rounded-lg bg-cyan-700 px-3 py-2 text-sm font-semibold text-white hover:bg-cyan-800" onclick="resetearFormulario()">
          Nueva planeacion
        </button>
      </div>
    </div>
  `;
}

function renderTemas(temas) {
  const contenedores = [
    document.getElementById("lista-temas-agregados"),
    document.getElementById("lista-temas-agregados-mobile")
  ];

  contenedores.forEach((contenedor) => {
    if (!contenedor) return;

    contenedor.innerHTML = temas
      .map((tema) => `<div class="tema-item">${escapeHtml(tema.tema)} (${tema.duracion} min)</div>`)
      .join("");
  });
}

function bloquearCamposGlobales() {
  document.activeElement?.blur();

  ["asignatura", "nivel", "unidad", "asignatura-mobile", "nivel-mobile", "unidad-mobile"]
    .forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
}

window.bloquearFormulario = bloquearFormulario;
window.iniciarProgresoPlaneaciones = iniciarProgresoPlaneaciones;
window.actualizarProgresoDesdeEvento = actualizarProgresoDesdeEvento;
window.completarProgresoPlaneaciones = completarProgresoPlaneaciones;
window.ocultarProgresoPlaneaciones = ocultarProgresoPlaneaciones;
window.mostrarResultadoBatch = mostrarResultadoBatch;
window.renderTemas = renderTemas;
window.bloquearCamposGlobales = bloquearCamposGlobales;
