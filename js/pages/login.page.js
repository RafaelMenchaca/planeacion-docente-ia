function initLoginPage() {
  const form = document.getElementById("login-form");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    const email = form.usuario.value.trim();
    const password = form.password.value.trim();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      alert("? Error al iniciar sesión: " + error.message);
    } else {
      alert("? Bienvenido");
      window.location.href = "dashboard.html";
    }
  });
}

window.initLoginPage = initLoginPage;
