function renderHeader(planeacion, total) {
  const header = document.getElementById("batch-header");
  if (!header) return;

  const fecha = planeacion.created_at || planeacion.fecha_creacion;
  const fechaTexto = fecha ? new Date(fecha).toLocaleDateString("es-MX") : "Sin fecha";

  header.innerHTML = `
    <div class="batch-card rounded-2xl border border-cyan-100 bg-gradient-to-r from-white via-cyan-50 to-white p-5 shadow-lg">
      <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p class="text-xs font-semibold uppercase tracking-wider text-cyan-800">Lista por batch</p>
          <h2 class="text-lg font-semibold text-slate-900 sm:text-xl">${escapeHtml(planeacion.materia || "Sin materia")} | ${escapeHtml(planeacion.nivel || "-")} | Unidad ${escapeHtml(String(planeacion.unidad || "-"))}</h2>
          <p class="mt-1 text-sm text-slate-600">${fechaTexto}</p>
        </div>
        <span class="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200">${total} planeacion(es)</span>
      </div>
    </div>
  `;
}

function renderListaPlaneaciones(planeaciones) {
  const contenedor = document.getElementById("lista-planeaciones");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="overflow-hidden rounded-xl border border-slate-200">
      <table class="min-w-full text-sm">
        <thead class="bg-slate-50 text-slate-700">
          <tr>
            <th class="px-3 py-2 text-left font-semibold">Tema</th>
            <th class="px-3 py-2 text-left font-semibold">Fecha</th>
            <th class="px-3 py-2 text-right font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 bg-white">
          ${planeaciones
            .map((p) => {
              const fecha = p.created_at || p.fecha_creacion;
              const fechaTexto = fecha ? new Date(fecha).toLocaleDateString("es-MX") : "-";
              return `
                <tr>
                  <td class="px-3 py-3 text-slate-800">${escapeHtml(p.tema || "Sin tema")}</td>
                  <td class="px-3 py-3 text-slate-600">${fechaTexto}</td>
                  <td class="px-3 py-3">
                    <div class="flex flex-wrap items-center justify-end gap-2">
                      <a href="detalle.html?id=${p.id}" class="inline-flex items-center rounded-lg border border-cyan-200 px-3 py-1.5 text-xs font-semibold text-cyan-700 hover:bg-cyan-50">Ver planeacion</a>
                      <button onclick="eliminarPlaneacionBatch(${p.id}, this)" class="inline-flex items-center rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50">Eliminar</button>
                    </div>
                  </td>
                </tr>
              `;
            })
            .join("")}
        </tbody>
      </table>
    </div>
  `;
}

function mostrarError(mensaje) {
  const contenedor = document.getElementById("lista-planeaciones");
  if (!contenedor) return;

  contenedor.innerHTML = `
    <div class="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      ${escapeHtml(mensaje)}
    </div>
  `;
}

window.renderHeader = renderHeader;
window.renderListaPlaneaciones = renderListaPlaneaciones;
window.mostrarError = mostrarError;
