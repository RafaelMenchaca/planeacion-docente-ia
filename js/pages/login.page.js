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
      window.AppUI.showToast("No se pudo iniciar sesión. Revisa tus datos.", "error");
    } else {
      window.AppUI.showToast("Sesión iniciada correctamente.", "success");
      setTimeout(function () { window.location.href = "dashboard.html"; }, 1000);
    }
  });
}

window.initLoginPage = initLoginPage;
