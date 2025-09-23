const SUPABASE_URL = 'https://bfnkaqmhcsyxdxoqnahk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'; // tu clave anon pública

// Cliente global
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// ✅ Verifica si hay sesión activa
async function protegerRuta() {
    const { data, error } = await supabase.auth.getSession();
    if (!data.session) {
        window.location.href = 'login.html';
    }
}

// ✅ Escuchar cambios de sesión
supabase.auth.onAuthStateChange((event, session) => {
    // Solo redirigir si el evento es SIGNED_OUT
    if (event === "SIGNED_OUT") {
        alert("Tu sesión ha finalizado. Serás redirigido al login.");
        window.location.href = "login.html";
    }
});

// Exportar la función globalmente
window.protegerRuta = protegerRuta;
