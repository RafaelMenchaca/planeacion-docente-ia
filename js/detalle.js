document.addEventListener('DOMContentLoaded', function () {
    // Cargar componentes y mostrar al terminar
    const loadComponent = (id, path) => {
        fetch(path)
            .then(res => res.text())
            .then(html => {
                const el = document.getElementById(id);
                el.innerHTML = html;
                el.classList.remove('hidden'); // Mostrar cuando se cargue
            })
            .catch(error => {
                console.error(`Error cargando ${path}:`, error);
            });
    };

    loadComponent('navbar-placeholder', './components/navbar.html');
});

document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const cont = document.getElementById('detalle-container');

    if (!id) {
        cont.innerHTML = '❌ ID no proporcionado.';
        return;
    }

    try {
        const res = await fetch(`${API_BASE_URL}/api/planeaciones/${id}`);
        const data = await res.json();

        const fecha = data.fecha_creacion ? new Date(data.fecha_creacion) : null;

        // Compatibilidad: puede venir como data.detalles_completos o data.detalles
        const detalles = data.detalles_completos || data.detalles || {};

        cont.innerHTML = `
        <section class="space-y-2 text-sm">
            <p><strong>📚 Materia:</strong> ${data.materia || 'No disponible'}</p>
            <p><strong>🎓 Grado:</strong> ${data.grado || 'No disponible'}</p>
            <p><strong>📌 Tema:</strong> ${data.tema || 'No disponible'}</p>
            <p><strong>⏱️ Duración:</strong> ${data.duracion || 'No disponible'} min</p>
            <p><strong>📅 Fecha de creación:</strong> ${fecha ? fecha.toLocaleDateString('es-MX') : 'No disponible'}</p>
        </section>

        <hr class="my-4 border-t border-gray-300" />

        <section class="space-y-4">
            <h2 class="text-xl font-bold text-indigo-700">🧠 Detalles Pedagógicos</h2>

            <p><strong>🎯 Objetivos:</strong> ${detalles.objetivos || 'No especificado'}</p>
            <p><strong>🏫 Modalidad:</strong> ${detalles.modalidad || 'No especificado'}</p>

            <div>
            <strong>📚 Metodologías:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
                ${(detalles.metodologias || []).map(m => `<li>${m}</li>`).join('') || '<li>Ninguna</li>'}
            </ul>
            </div>

            <div>
            <strong>💡 Habilidades:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
                ${(detalles.habilidades || []).map(h => `<li>${h}</li>`).join('') || '<li>Ninguna</li>'}
            </ul>
            </div>

            <div>
            <strong>🧠 Estilo de Aprendizaje:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
                ${(detalles.estilo || []).map(e => `<li>${e}</li>`).join('') || '<li>Ninguno</li>'}
            </ul>
            </div>

            <p><strong>👥 Tipo de trabajo:</strong> ${detalles.trabajo || 'No especificado'}</p>
            <p><strong>🌎 Contextualizado:</strong> ${detalles.contextualizado ? 'Sí' : 'No'}</p>
            <p><strong>✍️ Actividades prácticas:</strong> ${detalles.actividades_practicas || 'No especificado'}</p>
            <p><strong>🤹 Actividades interactivas:</strong> ${detalles.actividades_interactivas || 'No especificado'}</p>
            <p><strong>📝 Autoevaluación/Coevaluación:</strong> ${detalles.auto_evaluacion || 'No especificado'}</p>

            <div>
            <strong>🧰 Recursos:</strong>
            <ul class="list-disc list-inside ml-4 text-gray-700">
                ${(detalles.recursos || []).map(r => `<li>${r}</li>`).join('') || '<li>Ninguno</li>'}
            </ul>
            </div>

            <p><strong>📏 Evaluación:</strong> ${detalles.evaluacion || 'No especificado'}</p>
            <p><strong>🧮 Generar Problemas:</strong> ${detalles.generarProblemas || 'No'}</p>
            <p><strong>📚 Estructura de clase:</strong> ${detalles.estructura || 'No definida'}</p>
            <p><strong>📅 Número de clases:</strong> ${detalles.num_clases || 'No definido'}</p>
        </section>
        `;

    } catch (error) {
        cont.innerHTML = '❌ Error al cargar los datos.';
        console.error(error);
    }
});
