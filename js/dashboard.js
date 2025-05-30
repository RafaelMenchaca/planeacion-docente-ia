// Mobile menu toggle y carga de componentes
document.addEventListener('DOMContentLoaded', function () {
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');

    if (mobileMenuButton && mobileMenu) {
        mobileMenuButton.addEventListener('click', function () {
            mobileMenu.classList.toggle('hidden');
        });
    }

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
    loadComponent('plan-list-placeholder', './components/plan-list.html');
    loadComponent('footer-placeholder', './components/footer.html');
});

// Código para manejar el formulario de planeación
document.addEventListener('DOMContentLoaded', cargarPlaneaciones);

async function cargarPlaneaciones(filtros = {}) {
    const container = document.getElementById('plan-list-placeholder');
    container.classList.remove('hidden');

    try {
        const res = await fetch('http://localhost:3000/api/planeaciones');
        const planeaciones = await res.json();

        if (!Array.isArray(planeaciones)) {
            container.innerHTML = "<p>Error al cargar planeaciones.</p>";
            return;
        }

        // Aplicar filtros
        let filtradas = planeaciones.filter(p => {
            const porMateria = filtros.materia ? p.materia.toLowerCase().includes(filtros.materia.toLowerCase()) : true;
            const porGrado = filtros.grado ? p.grado.toLowerCase().includes(filtros.grado.toLowerCase()) : true;
            const porFecha = filtros.fecha
                ? new Date(p.fecha_creacion).toISOString().startsWith(filtros.fecha)
                : true;
            return porMateria && porGrado && porFecha;
        });

        const scrollDiv = document.createElement('div');
        scrollDiv.className = 'tabla-scroll';

        const encabezado = document.createElement('div');
        encabezado.className = 'tabla-encabezado';
        encabezado.innerHTML = `
        <div class="col-id">ID</div>
        <div class="col-nombre">Nombre</div>
        <div class="col-fecha">Fecha</div>
        <div class="col-boton">Acciones</div>
      `;

        const lista = document.createElement('ul');

        filtradas.forEach((p, index) => {
            const fila = document.createElement('li');
            fila.className = 'fila-planeacion';
            fila.innerHTML = `
          <div class="col-id">${index + 1}</div>
          <div class="col-nombre">${p.materia || 'Sin materia'}</div>
          <div class="col-fecha">
            ${p.fecha_creacion
                    ? new Date(p.fecha_creacion).toLocaleDateString('es-MX', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                    })
                    : 'Sin fecha'}
          </div>
          <div class="col-boton flex gap-2">
            <a href="detalle.html?id=${p.id}">
                <button class="text-sm bg-indigo-600 text-white px-3 py-1 rounded hover:bg-indigo-700">Ver</button>
            </a>
            <button onclick="eliminarPlaneacion(${p.id})"
                class="text-sm bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600">Eliminar</button>
          </div>

        `;
            lista.appendChild(fila);
        });

        scrollDiv.appendChild(encabezado);
        scrollDiv.appendChild(lista);

        const tabla = document.createElement('div');
        tabla.className = 'tabla-planeaciones';
        tabla.appendChild(scrollDiv);

        container.innerHTML = '';
        container.appendChild(tabla);

    } catch (error) {
        console.error('❌ Error al cargar planeaciones:', error);
        container.innerHTML = "<p>Error al cargar planeaciones.</p>";
    }
}

function aplicarFiltros() {
    const materia = document.getElementById('filtro-materia').value;
    const grado = document.getElementById('filtro-grado').value;
    const fecha = document.getElementById('filtro-fecha').value;

    cargarPlaneaciones({ materia, grado, fecha });
}

function resetearFiltros() {
    document.getElementById('filtro-materia').value = '';
    document.getElementById('filtro-grado').value = '';
    document.getElementById('filtro-fecha').value = '';
    cargarPlaneaciones(); // sin filtros
}


// Función para eliminar una planeación
async function eliminarPlaneacion(id) {

    const confirmar = confirm('¿Estás seguro de que deseas eliminar esta planeación? Esta acción no se puede deshacer.');
    if (!confirmar) return;

    try {
        const res = await fetch(`http://localhost:3000/api/planeaciones/${id}`, {
            method: 'DELETE',
        });

        if (!res.ok) throw new Error('No se pudo eliminar');

        alert('Planeación eliminada exitosamente ✅');
        cargarPlaneaciones();
    } catch (error) {
        console.error('❌ Error al eliminar:', error);
        alert('Ocurrió un error al eliminar la planeación.');
    }
}

