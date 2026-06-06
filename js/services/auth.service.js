// Verifica si hay sesion activa
async function protegerRuta() {
  const { data } = await supabase.auth.getSession();

  if (!data.session || !data.session.user) {
    window.location.href = "login.html";
    return;
  }

  // opcional: guardar user global
  window.currentUser = data.session.user;
}

async function requireSession() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    window.location.href = "login.html";
    return null;
  }
  return session;
}

// Escuchar cambios de sesion
supabase.auth.onAuthStateChange((event, session) => {
  // Solo redirigir si el evento es SIGNED_OUT
  if (event === "SIGNED_OUT") {
    if (window.AppUI && window.AppUI.showToast) {
      window.AppUI.showToast("Sesión cerrada correctamente. Redirigiendo al login...", "info");
      setTimeout(function () { window.location.href = "login.html"; }, 1500);
    } else {
      window.location.href = "login.html";
    }
  }
});

// Exportar funciones globalmente
window.protegerRuta = protegerRuta;
window.requireSession = requireSession;
