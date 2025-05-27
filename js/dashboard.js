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

async function cargarPlaneaciones() {
    const container = document.getElementById('plan-list-placeholder');
    container.classList.remove('hidden');

    try {
        const res = await fetch('http://localhost:3000/api/planeaciones');
        const planeaciones = await res.json();

        if (!Array.isArray(planeaciones)) {
            container.innerHTML = "<p>Error al cargar planeaciones.</p>";
            return;
        }

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

        planeaciones.forEach((p, index) => {
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
        <div class="col-boton"><button onclick="verPlaneacion(${p.id})">Ver</button></div>
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

// Puedes implementar esta función luego para mostrar detalles
function verPlaneacion(id) {
    alert(`Planeación ID: ${id}`);
}
