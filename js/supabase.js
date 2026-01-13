const SUPABASE_URL = 'https://bfnkaqmhcsyxdxoqnahk.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJmbmthcW1oY3N5eGR4b3FuYWhrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzMDI4MTcsImV4cCI6MjA2Mzg3ODgxN30.ADYrubfJuP9Oo60713UldzO0owCIgYfUKJ8WFnuBCpM'; // tu clave anon pública

// Cliente global
window.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// Verifica si hay sesión activa
async function protegerRuta() {
  const { data } = await supabase.auth.getSession();

  if (!data.session || !data.session.user) {
    window.location.href = "login.html";
    return;
  }

  // opcional: guardar user global
  window.currentUser = data.session.user;
}


// Escuchar cambios de sesión
supabase.auth.onAuthStateChange((event, session) => {
    // Solo redirigir si el evento es SIGNED_OUT
    if (event === "SIGNED_OUT") {
        alert("Tu sesión ha finalizado. Serás redirigido al login.");
        window.location.href = "login.html";
    }
});

// Exportar la función globalmente
window.protegerRuta = protegerRuta;
