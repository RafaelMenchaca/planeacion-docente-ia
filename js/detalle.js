document.addEventListener('DOMContentLoaded', () => {
    // Cargar navbar
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
        const data = await res.json();
        const fecha = data.fecha_creacion ? new Date(data.fecha_creacion) : null;
        const detalles = data.detalles_completos || {};

        const { subtemas = [], sesiones_por_subtema = {}, tipoPlaneacion } = detalles;

        // HTML principal
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

        // Detalles pedagógicos
        const hayDetalles = detalles.objetivos || detalles.modalidad || detalles.metodologias;
        if (hayDetalles) {
            html += `
          <section class="space-y-4">
            <h2 class="text-xl font-bold text-indigo-700">🧠 Detalles Pedagógicos</h2>
            ${detalles.objetivos ? `<p><strong>🎯 Objetivos:</strong> ${detalles.objetivos}</p>` : ''}
            ${detalles.modalidad ? `<p><strong>🏫 Modalidad:</strong> ${detalles.modalidad}</p>` : ''}
  
            ${detalles.metodologias?.length ? `
              <div>
                <strong>📚 Metodologías:</strong>
                <ul class="list-disc list-inside ml-4 text-gray-700">
                  ${detalles.metodologias.map(m => `<li>${escapeHtml(m)}</li>`).join('')}
                </ul>
              </div>` : ''}
  
            ${detalles.habilidades?.length ? `
              <div>
                <strong>💡 Habilidades:</strong>
                <ul class="list-disc list-inside ml-4 text-gray-700">
                  ${detalles.habilidades.map(h => `<li>${escapeHtml(h)}</li>`).join('')}
                </ul>
              </div>` : ''}
  
            ${detalles.estilo?.length ? `
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
  
            ${detalles.recursos?.length ? `
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

        // Planeación generada
        if (subtemas.length) {
            html += `
          <section class="space-y-4">
            <h2 class="text-xl font-bold text-indigo-700">📘 Planeación Generada</h2>
            ${tipoPlaneacion ? `<p><strong>Tipo de Planeación:</strong> ${tipoPlaneacion}</p>` : ''}
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

        cont.innerHTML = html;

    } catch (error) {
        console.error(error);
        cont.innerHTML = '❌ Error al cargar los datos.';
    }
});
