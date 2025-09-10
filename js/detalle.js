// Carga navbar
document.addEventListener('DOMContentLoaded', () => {
  const loadComponent = (id, path) => {
    fetch(path)
      .then(res => res.text())
      .then(html => {
        const el = document.getElementById(id);
        el.innerHTML = html;
        el.classList.remove('hidden');
      })
      .catch(error => console.error(`Error cargando ${path}:`, error));
  };

  loadComponent('navbar-placeholder', './components/navbar.html');
});

// Estado en memoria para comparar y enviar PUT limpio
let PLANEACION_ORIGINAL = null;

document.addEventListener('DOMContentLoaded', async () => {
  const params = new URLSearchParams(window.location.search);
  const id = parseInt(params.get('id'), 10);
  const cont = document.getElementById('detalle-container');

  if (isNaN(id)) {
    cont.innerHTML = '❌ ID no proporcionado.';
    return;
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`);
    if (!res.ok) throw new Error('Respuesta no OK');

    const data = await res.json();
    PLANEACION_ORIGINAL = data;

    renderDetalle(data);

  } catch (error) {
    console.error(error);
    cont.innerHTML = '❌ Error al cargar los datos.';
  }
});

function renderDetalle(data) {
  const cont = document.getElementById('detalle-container');
  const fecha = data.fecha_creacion ? new Date(data.fecha_creacion) : null;
  const detalles = data.detalles_completos || {};
  const { subtemas = [], sesiones_por_subtema = {}, tipoPlaneacion } = detalles;

  let html = `
    <section class="space-y-2 text-sm">
      <p><strong>📚 Materia:</strong> ${escapeHtml(data.materia || 'No disponible')}</p>
      <p><strong>🎓 Grado:</strong> ${escapeHtml(data.grado || 'No disponible')}</p>
      <p><strong>📌 Tema:</strong> ${escapeHtml(data.tema || 'No disponible')}</p>
      <p><strong>⏱️ Duración:</strong> ${data.duracion || 'No disponible'} min</p>
      <p><strong>📅 Fecha de creación:</strong> ${fecha ? fecha.toLocaleDateString('es-MX') : 'No disponible'}</p>
    </section>
    <hr class="my-4 border-t border-gray-300" />
  `;

  // Detalles pedagógicos (si existen)
  const hayDetalles = detalles.objetivos || detalles.modalidad || detalles.metodologias ||
                      detalles.habilidades || detalles.estilo || detalles.trabajo ||
                      (typeof detalles.contextualizado !== 'undefined') ||
                      detalles.actividades_practicas || detalles.actividades_interactivas ||
                      detalles.auto_evaluacion || detalles.recursos ||
                      detalles.evaluacion || detalles.generarProblemas ||
                      detalles.estructura || detalles.num_clases;

  if (hayDetalles) {
    html += `
      <section class="space-y-4">
        <h2 class="text-xl font-bold text-indigo-700">🧠 Detalles Pedagógicos</h2>
        ${detalles.objetivos ? `<p><strong>🎯 Objetivos:</strong> ${escapeHtml(detalles.objetivos)}</p>` : ''}
        ${detalles.modalidad ? `<p><strong>🏫 Modalidad:</strong> ${escapeHtml(detalles.modalidad)}</p>` : ''}

        ${Array.isArray(detalles.metodologias) && detalles.metodologias.length ? `
          <div>
            <strong>📚 Metodologías:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
              ${detalles.metodologias.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
            </ul>
          </div>` : ''}

        ${Array.isArray(detalles.habilidades) && detalles.habilidades.length ? `
          <div>
            <strong>💡 Habilidades:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
              ${detalles.habilidades.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
            </ul>
          </div>` : ''}

        ${Array.isArray(detalles.estilo) && detalles.estilo.length ? `
          <div>
            <strong>🧠 Estilo de Aprendizaje:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
              ${detalles.estilo.map(e => `<li>${escapeHtml(e)}</li>`).join('')}
            </ul>
          </div>` : ''}

        ${detalles.trabajo ? `<p><strong>👥 Tipo de trabajo:</strong> ${escapeHtml(detalles.trabajo)}</p>` : ''}
        ${detalles.contextualizado !== undefined ? `<p><strong>🌎 Contextualizado:</strong> ${detalles.contextualizado ? 'Sí' : 'No'}</p>` : ''}
        ${detalles.actividades_practicas ? `<p><strong>✍️ Actividades prácticas:</strong> ${escapeHtml(detalles.actividades_practicas)}</p>` : ''}
        ${detalles.actividades_interactivas ? `<p><strong>🤹 Actividades interactivas:</strong> ${escapeHtml(detalles.actividades_interactivas)}</p>` : ''}
        ${detalles.auto_evaluacion ? `<p><strong>📝 Autoevaluación/Coevaluación:</strong> ${escapeHtml(detalles.auto_evaluacion)}</p>` : ''}

        ${Array.isArray(detalles.recursos) && detalles.recursos.length ? `
          <div>
            <strong>🧰 Recursos:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
              ${detalles.recursos.map(r => `<li>${escapeHtml(r)}</li>`).join('')}
            </ul>
          </div>` : ''}

        ${detalles.evaluacion ? `<p><strong>📏 Evaluación:</strong> ${escapeHtml(detalles.evaluacion)}</p>` : ''}
        ${detalles.generarProblemas ? `<p><strong>🧮 Generar Problemas:</strong> ${escapeHtml(detalles.generarProblemas)}</p>` : ''}
        ${detalles.estructura ? `<p><strong>📚 Estructura de clase:</strong> ${escapeHtml(detalles.estructura)}</p>` : ''}
        ${detalles.num_clases ? `<p><strong>📅 Número de clases:</strong> ${escapeHtml(detalles.num_clases)}</p>` : ''}
      </section>
      <hr class="my-6 border-t border-gray-300" />
    `;
  }

  // Planeación generada (si hay subtemas)
  if (Array.isArray(subtemas) && subtemas.length) {
    html += `
      <section class="space-y-4" id="seccion-planeacion">
        <h2 class="text-xl font-bold text-indigo-700">📘 Planeación Generada</h2>
        ${tipoPlaneacion ? `<p><strong>Tipo de Planeación:</strong> ${escapeHtml(tipoPlaneacion)}</p>` : ''}
    `;

    let contadorSesion = 1;
    subtemas.forEach((subtema, index) => {
      const sesiones = sesiones_por_subtema[subtema] || 1;
      for (let s = 1; s <= sesiones; s++) {
        const duracion = data.duracion || 50;
        const tiempoInicio = 10;
        const tiempoDesarrollo = 25;
        const tiempoCierre = duracion - tiempoInicio - tiempoDesarrollo;

        const safeSub = escapeHtml(subtema);
        html += `
          <h3>📗 SUBTEMA ${index + 1}.${s}: ${safeSub} (Duración: ${duracion} minutos)</h3>
          <table border="1" cellspacing="0" cellpadding="5" style="border-collapse: collapse; width: 100%;">
            <thead style="background-color: #f3f4f6;">
              <tr>
                <th>Sesión</th>
                <th>Tiempo</th>
                <th>Momento</th>
                <th>Actividad</th>
                <th>Producto de Aprendizaje</th>
                <th>Instrumento de Evaluación</th>
                <th>Evaluación</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${contadorSesion}</td>
                <td><strong>${tiempoInicio} min</strong></td>
                <td><strong>Inicio</strong></td>
                <td><em>Escribe aquí la actividad de inicio.</em></td>
                <td><em>Lluvia de ideas, participación oral, etc.</em></td>
                <td><em>Lista de cotejo, escala, etc.</em></td>
                <td><em>Diagnóstica – Heteroevaluación (%)</em></td>
              </tr>
              <tr>
                <td>${contadorSesion}</td>
                <td><strong>${tiempoDesarrollo} min</strong></td>
                <td><strong>Desarrollo</strong></td>
                <td><em>Describe la actividad principal.</em></td>
                <td><em>Ejercicios, mapa mental, etc.</em></td>
                <td><em>Rúbrica, lista, etc.</em></td>
                <td><em>Formativa – Coevaluación (%)</em></td>
              </tr>
              <tr>
                <td>${contadorSesion}</td>
                <td><strong>${tiempoCierre} min</strong></td>
                <td><strong>Cierre</strong></td>
                <td><em>Reflexión, repaso o actividad de cierre.</em></td>
                <td><em>Conclusión escrita, resumen, etc.</em></td>
                <td><em>Lista de cotejo, rúbrica, etc.</em></td>
                <td><em>Sumativa – Autoevaluación (%)</em></td>
              </tr>
            </tbody>
          </table>
          <br>
        `;
        contadorSesion++;
      }
    });

    html += `</section>`;
  }

  // --- Sección de edición (UPDATE) ---
  html += `
    <hr class="my-6 border-t border-gray-300" />
    <section class="space-y-4">
      <h2 class="text-xl font-bold text-indigo-700">✏️ Editar planeación</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label class="block text-sm font-medium">Materia</label>
          <input id="edit-materia" class="w-full border rounded p-2 text-sm" value="${escapeHtml(data.materia || '')}" />
        </div>
        <div>
          <label class="block text-sm font-medium">Grado</label>
          <input id="edit-grado" class="w-full border rounded p-2 text-sm" value="${escapeHtml(data.grado || '')}" />
        </div>
        <div>
          <label class="block text-sm font-medium">Tema</label>
          <input id="edit-tema" class="w-full border rounded p-2 text-sm" value="${escapeHtml(data.tema || '')}" />
        </div>
        <div>
          <label class="block text-sm font-medium">Duración (min)</label>
          <input id="edit-duracion" type="number" min="0" class="w-full border rounded p-2 text-sm" value="${data.duracion ?? ''}" />
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium">Detalles completos (JSON)</label>
        <textarea id="edit-detalles" rows="8" class="w-full border rounded p-2 font-mono text-xs">${escapeHtml(JSON.stringify(detalles, null, 2))}</textarea>
        <p class="text-xs text-gray-500 mt-1">Puedes dejar este JSON tal cual si no deseas cambiarlo.</p>
      </div>

      <div class="flex gap-3">
        <button id="btn-guardar" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">Guardar cambios</button>
        <button id="btn-descargar" class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">📥 Descargar (.doc)</button>
      </div>
    </section>
  `;

  cont.innerHTML = html;

  // Eventos
  document.getElementById('btn-guardar')?.addEventListener('click', guardarCambios);
  document.getElementById('btn-descargar')?.addEventListener('click', descargarWord);
}

// PUT /api/planeaciones/:id
async function guardarCambios() {
  if (!PLANEACION_ORIGINAL?.id) return;

  const id = PLANEACION_ORIGINAL.id;
  const materia = document.getElementById('edit-materia').value.trim();
  const grado = document.getElementById('edit-grado').value.trim();
  const tema = document.getElementById('edit-tema').value.trim();
  const duracionRaw = document.getElementById('edit-duracion').value;
  const detallesTexto = document.getElementById('edit-detalles').value;

  const duracion = parseInt(duracionRaw, 10);
  if (!materia || !grado || !tema || !Number.isFinite(duracion) || duracion < 0 || duracion > 10000) {
    alert('Revisa los campos: materia, grado, tema y duración válida (0-10000).');
    return;
  }

  let detallesParsed = null;
  try {
    detallesParsed = detallesTexto ? JSON.parse(detallesTexto) : null;
  } catch (e) {
    alert('El JSON de "detalles completos" no es válido.');
    return;
  }

  const payload = {
    materia,
    grado,
    tema,
    duracion,
    // Solo enviamos detalles si existe (puede ser null para limpiar)
    ...(detallesParsed !== null ? { detalles_completos: detallesParsed } : {})
  };

  try {
    const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      const txt = await res.text().catch(() => '');
      throw new Error(`PUT no OK: ${txt}`);
    }

    const updated = await res.json();
    PLANEACION_ORIGINAL = updated;
    renderDetalle(updated);
    alert('✅ Cambios guardados');

  } catch (err) {
    console.error('❌ Error al guardar cambios:', err);
    alert('No se pudieron guardar los cambios.');
  }
}

// Descargar el detalle como .doc
function descargarWord() {
  const cont = document.getElementById('detalle-container');
  if (!cont) return alert('No hay contenido para descargar.');

  const contenidoHTML = cont.innerHTML;
  const nombreBase = `Planeacion_${PLANEACION_ORIGINAL?.id ?? ''}`.trim() || 'Planeacion';

  const blob = new Blob(
    ['<html><head><meta charset="UTF-8"></head><body>' + contenidoHTML + '</body></html>'],
    { type: 'application/msword' }
  );

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `${nombreBase}.doc`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
