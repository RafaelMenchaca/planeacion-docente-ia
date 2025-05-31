// Verifica si hay sesión activa; si no, redirige a login
async function protegerRuta() {
    const { data, error } = await supabase.auth.getUser();

    if (!data.user) {
        // No hay usuario logueado
        window.location.href = 'login.html';
    }
}

supabase.auth.onAuthStateChange((event, session) => {
    if (!session) {
        alert("Tu sesión ha finalizado. Serás redirigido al login.");
        window.location.href = "login.html";
    }
});
