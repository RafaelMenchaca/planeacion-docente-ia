const API_BASE_URL = window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
    ? 'http://localhost:3000' // 🧪 Local backend
    : 'https://educativo-ia-backend.onrender.com'; // 🌐 Backend real

const mostrarEntorno = true; // cámbialo a false si ya no quieres verlo

if (mostrarEntorno) {
    // Espera a que el DOM cargue por completo
    window.addEventListener('DOMContentLoaded', () => {
        // Espera 300ms por si el footer se carga dinámicamente
        setTimeout(() => {
            const entornoEl = document.getElementById('entorno');
            if (entornoEl) {
                entornoEl.textContent =
                    window.location.hostname.includes('localhost') || window.location.hostname.includes('127.0.0.1')
                        ? '🛠 Entorno local'
                        : '🌐 Entorno producción';
            }
        }, 300);
    });
}
