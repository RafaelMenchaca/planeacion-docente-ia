function bloquearFormulario() {
  document.querySelectorAll("#planeacionTable input, #planeacionTable select").forEach(el => {
    el.setAttribute("readonly", true);
    el.setAttribute("disabled", true);
  });

  const btn = document.getElementById("btn-generar");
  if (btn) {
    btn.classList.add("disabled");
    btn.setAttribute("disabled", true);
    btn.innerHTML = '<i class="bi bi-check-circle"></i> Guardado';
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
    .map(p => `<li>${p.tema}</li>`)
    .join("");

  resultado.innerHTML = `
    <div class="alert alert-success mt-4">
      <h5 class="mb-3">? Se generaron ${total} planeaciones correctamente</h5>

      <div class="card border-success mb-3">
        <div class="card-body text-center">
          <strong>${materia}</strong> | ${nivel} | Unidad ${unidad}
          <br>
          <a href="batch.html?batch_id=${batch_id}" class="btn btn-outline-success mt-2">
            <i class="bi bi-eye"></i> Ver
          </a>
        </div>
      </div>

      <p class="fw-semibold mb-1">Temas incluidos:</p>
      <ul>${temasHtml}</ul>

      <div class="text-center mt-3">
        <a href="dashboard.html" class="btn btn-outline-secondary me-2">
          <i class="bi bi-house"></i> Volver al Dashboard
        </a>
        <button class="btn btn-success" onclick="resetearFormulario()">
          <i class="bi bi-plus-circle"></i> Nueva planeación
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

  contenedores.forEach(c => {
    if (!c) return;

    c.innerHTML = temas
      .map(
        t => `<div class="alert alert-secondary py-1 px-2 mb-1">
                • ${t.tema} (${t.duracion} min)
              </div>`
      )
      .join("");
  });
}

function bloquearCamposGlobales() {
  document.activeElement?.blur();

  ["asignatura", "nivel", "unidad", "asignatura-mobile", "nivel-mobile", "unidad-mobile"]
    .forEach(id => {
      const el = document.getElementById(id);
      if (el) el.disabled = true;
    });
}

window.bloquearFormulario = bloquearFormulario;
window.mostrarResultadoBatch = mostrarResultadoBatch;
window.renderTemas = renderTemas;
window.bloquearCamposGlobales = bloquearCamposGlobales;
