async function mostrarUsuario() {
    const { data, error } = await supabase.auth.getUser();
    if (data.user) {
        const email = data.user.email;
        const desktop = document.getElementById('usuario-email');
        const mobile = document.getElementById('usuario-email-movil');

        if (desktop) desktop.textContent = email;
        if (mobile) mobile.textContent = email;
    }
}

async function cerrarSesion() {
    await supabase.auth.signOut();
    window.location.href = "login.html";
}

document.addEventListener('DOMContentLoaded', mostrarUsuario);
