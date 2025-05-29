document.addEventListener('DOMContentLoaded', async () => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');

    if (!id) {
        document.getElementById('detalle-container').innerHTML = '❌ ID no proporcionado.';
        return;
    }

    try {
        const res = await fetch(`http://localhost:3000/api/planeaciones/${id}`);
        const data = await res.json();

        const cont = document.getElementById('detalle-container');

        cont.innerHTML = `
        <p><strong>Materia:</strong> ${data.materia}</p>
        <p><strong>Grado:</strong> ${data.grado}</p>
        <p><strong>Tema:</strong> ${data.tema}</p>
        <p><strong>Duración:</strong> ${data.duracion} min</p>
        <p><strong>Fecha creación:</strong> ${new Date(data.fecha_creacion).toLocaleDateString('es-MX')}</p>
        <hr class="my-2" />
        <h2 class="text-xl font-semibold">🧠 Detalles pedagógicos:</h2>
        <pre class="whitespace-pre-wrap bg-gray-100 p-2 rounded mt-2">${JSON.stringify(data.detalles, null, 2)}</pre>
      `;
    } catch (error) {
        document.getElementById('detalle-container').innerHTML = '❌ Error al cargar datos.';
        console.error(error);
    }
});
