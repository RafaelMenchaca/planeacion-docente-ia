// Cargar componentes (navbar y footer)
const loadComponent = (id, path) => {
    const el = document.getElementById(id);
    if (!el) return;
    fetch(path)
        .then(res => res.text())
        .then(html => {
            el.innerHTML = html;
            el.classList.remove('hidden');
            if (id.includes("navbar")) mostrarUsuario(); // mostrar usuario después de cargar navbar
        })
        .catch(err => console.error(`Error cargando ${path}:`, err));
};

// Mostrar email de usuario
async function mostrarUsuario() {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
        const email = data.user.email;
        const desktop = document.getElementById('usuario-email');
        const mobile = document.getElementById('usuario-email-movil');

        if (desktop) desktop.textContent = email;
        if (mobile) mobile.textContent = email;
    }
}

// Cerrar sesión
async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

window.cerrarSesion = cerrarSesion;

// 🚀 Auto-carga en todas las páginas internas
document.addEventListener('DOMContentLoaded', () => {
    loadComponent('navbar-placeholder', './components/navbar.html');
    loadComponent('footer-placeholder', './components/footer.html');
});
