document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    const cont = document.getElementById('detalle-container');

    if (!id) {
        cont.innerHTML = '❌ ID no proporcionado.';
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/planeaciones/${id}`);
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
            <p><strong>Actividades:</strong> ${(detalles.tipo_actividad || []).join(', ') || 'Ninguna'}</p>
            <p><strong>Recursos:</strong> ${(detalles.recursos || []).join(', ') || 'Ninguno'}</p>
            <p><strong>Evaluación:</strong> ${detalles.evaluacion || 'No especificado'}</p>
            <p><strong>Generar Problemas:</strong> ${detalles.generarProblemas || 'No'}</p>
            <p><strong>Consideraciones:</strong> ${detalles.consideraciones || 'Ninguna'}</p>
            <p><strong>Estructura:</strong> ${detalles.estructura || 'No definida'}</p>
            <p><strong>Número de Clases:</strong> ${detalles.num_clases || 'No definido'}</p>
        `;
    } catch (error) {
        cont.innerHTML = '❌ Error al cargar los datos.';
        console.error(error);
    }
});
