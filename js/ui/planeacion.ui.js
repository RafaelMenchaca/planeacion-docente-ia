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
window.mostrarResultadoBatch = mostrarResultadoBatch;
window.renderTemas = renderTemas;
window.bloquearCamposGlobales = bloquearCamposGlobales;
