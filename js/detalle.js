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
            <p><strong>Materia:</strong> ${data.materia || 'No disponible'}</p>
            <p><strong>Grado:</strong> ${data.grado || 'No disponible'}</p>
            <p><strong>Tema:</strong> ${data.tema || 'No disponible'}</p>
            <p><strong>Duración:</strong> ${data.duracion || 'No disponible'} min</p>
            <p><strong>Fecha creación:</strong> ${fecha ? fecha.toLocaleDateString('es-MX') : 'No disponible'}</p>
            
            <hr class="my-2" />
            <h2 class="text-xl font-semibold">🧠 Detalles pedagógicos:</h2>
            <p><strong>Objetivos:</strong> ${detalles.objetivos || 'No especificado'}</p>
            <p><strong>Modalidad:</strong> ${detalles.modalidad || 'No especificado'}</p>
            <p><strong>Metodologías:</strong> ${(detalles.metodologias || []).join(', ') || 'Ninguna'}</p>
            <p><strong>Habilidades:</strong> ${(detalles.habilidades || []).join(', ') || 'Ninguna'}</p>
            <p><strong>Estilo de Aprendizaje:</strong> ${(detalles.estilo || []).join(', ') || 'Ninguno'}</p>
            <p><strong>Trabajo:</strong> ${detalles.trabajo || 'No especificado'}</p>
            <p><strong>Contextualizado:</strong> ${detalles.contextualizado ? 'Sí' : 'No'}</p>
            <p><strong>Actividades Prácticas:</strong> ${detalles.actividades_practicas || 'No especificado'}</p>
            <p><strong>Actividades Interactivas:</strong> ${detalles.actividades_interactivas || 'No especificado'}</p>
            <p><strong>Autoevaluación o Coevaluacion:</strong> ${detalles.auto_evaluacion || 'No especificado'}</p>
            <p><strong>Recursos:</strong> ${(detalles.recursos || []).join(', ') || 'Ninguno'}</p>
            <p><strong>Evaluación:</strong> ${detalles.evaluacion || 'No especificado'}</p>
            <p><strong>Generar Problemas:</strong> ${detalles.generarProblemas || 'No'}</p>
            <p><strong>Estructura:</strong> ${detalles.estructura || 'No definida'}</p>
            <p><strong>Número de Clases:</strong> ${detalles.num_clases || 'No definido'}</p>
        `;
    } catch (error) {
        cont.innerHTML = '❌ Error al cargar los datos.';
        console.error(error);
    }
});
